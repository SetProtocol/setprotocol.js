/*
  Copyright 2018 Set Labs Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock('set-protocol-contracts');
jest.setTimeout(30000);

import * as _ from 'lodash';
import * as chai from 'chai';
import * as setProtocolUtils from 'set-protocol-utils';
import { ExchangeIssuanceParams } from 'set-protocol-utils';
import Web3 from 'web3';
import {
  CoreContract,
  ExchangeIssuanceModuleContract,
  KyberNetworkWrapperContract,
  RebalancingSetExchangeIssuanceModuleContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
} from 'set-protocol-contracts';

import ChaiSetup from '@test/helpers/chaiSetup';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { ExchangeIssuanceAPI } from '@src/api';
import {
  NULL_ADDRESS,
  ZERO,
  ONE_DAY_IN_SECONDS,
  DEFAULT_UNIT_SHARES,
  DEFAULT_REBALANCING_NATURAL_UNIT,
} from '@src/constants';
import { Assertions } from '@src/assertions';
import {
  addModuleAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenAsync,
  deployExchangeIssuanceModuleAsync,
  deployTokensSpecifyingDecimals,
  deployRebalancingSetExchangeIssuanceModuleAsync,
  deployWethMockAsync,
  deployZeroExExchangeWrapperContract,
  deployBaseContracts,
  deployKyberNetworkWrapperContract,
  deploySetTokenAsync,
} from '@test/helpers';
import {
  BigNumber,
} from '@src/util';
import {
  Address,
  KyberTrade,
  SetProtocolConfig,
  ZeroExSignedFillOrder,
} from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
ChaiSetup.configure();
const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const setUtils = new SetUtils(web3);
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('ExchangeIssuanceAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let wrappedEtherMock: WethMockContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let exchangeIssuanceModule: ExchangeIssuanceModuleContract;
  let kyberNetworkWrapper: KyberNetworkWrapperContract;
  let rebalancingSetExchangeIssuanceModule: RebalancingSetExchangeIssuanceModuleContract;

  let config: SetProtocolConfig;
  let exchangeIssuanceAPI: ExchangeIssuanceAPI;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy,
      vault,
      setTokenFactory,
      rebalancingSetTokenFactory,
    ] = await deployBaseContracts(web3);

    exchangeIssuanceModule = await deployExchangeIssuanceModuleAsync(web3, core, vault);
    await addModuleAsync(core, exchangeIssuanceModule.address);

    await deployZeroExExchangeWrapperContract(
      web3,
      SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
      SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
      SetTestUtils.ZERO_EX_TOKEN_ADDRESS,
      transferProxy,
      core,
    );

    wrappedEtherMock = await deployWethMockAsync(web3, NULL_ADDRESS, ZERO);

    rebalancingSetExchangeIssuanceModule = await deployRebalancingSetExchangeIssuanceModuleAsync(
      web3,
      core,
      transferProxy,
      exchangeIssuanceModule,
      wrappedEtherMock,
      vault,
    );

    kyberNetworkWrapper = await deployKyberNetworkWrapperContract(
      web3,
      SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
      transferProxy,
      core,
    );

    config = {
      coreAddress: core.address,
      transferProxyAddress: transferProxy.address,
      vaultAddress: vault.address,
      setTokenFactoryAddress: setTokenFactory.address,
      exchangeIssuanceModuleAddress: exchangeIssuanceModule.address,
      kyberNetworkWrapperAddress: kyberNetworkWrapper.address,
      rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
      rebalanceAuctionModuleAddress: NULL_ADDRESS,
      rebalancingTokenIssuanceModule: NULL_ADDRESS,
      rebalancingSetExchangeIssuanceModule: rebalancingSetExchangeIssuanceModule.address,
      wrappedEtherAddress: wrappedEtherMock.address,
    } as SetProtocolConfig;

    const assertions = new Assertions(web3);
    exchangeIssuanceAPI = new ExchangeIssuanceAPI(
      web3,
      assertions,
      config,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('exchangeIssuance', async () => {
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrder: (KyberTrade | ZeroExSignedFillOrder)[];
    let subjectCaller: Address;

    let zeroExOrderMaker: Address;

    let componentAddresses: Address[];
    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;

    let exchangeIssuanceSetAddress: Address;
    let exchangeIssuanceQuantity: BigNumber;
    let exchangeIssuancePaymentToken: Address;
    let exchangeIssuancePaymentTokenAmount: BigNumber;
    let exchangeIssuanceRequiredComponents: Address[];
    let exchangeIssuanceRequiredComponentAmounts: BigNumber[];

    let zeroExOrder: ZeroExSignedFillOrder;

    beforeEach(async () => {
      subjectCaller = ACCOUNTS[1].address;

      // Create component token (owned by 0x order maker)
      zeroExOrderMaker = ACCOUNTS[2].address;
      const [baseSetComponent] = await deployTokensSpecifyingDecimals(1, [18], web3, zeroExOrderMaker);
      const [alreadyOwnedComponent] = await deployTokensSpecifyingDecimals(1, [18], web3, subjectCaller);

      // Create the Set (1 component)
      componentAddresses = [baseSetComponent.address, alreadyOwnedComponent.address];
      const componentUnits = [new BigNumber(10 ** 10), new BigNumber(1)];
      baseSetNaturalUnit = new BigNumber(10 ** 9);
      baseSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        baseSetNaturalUnit,
      );

      // Generate exchange issue data
      exchangeIssuanceSetAddress = baseSetToken.address;
      exchangeIssuanceQuantity = new BigNumber(10 ** 10);
      exchangeIssuancePaymentToken = wrappedEtherMock.address;
      exchangeIssuancePaymentTokenAmount = new BigNumber(10 ** 10);
      exchangeIssuanceRequiredComponents = [componentAddresses[0]];
      exchangeIssuanceRequiredComponentAmounts = [componentUnits[0]].map(
        unit => unit.mul(exchangeIssuanceQuantity).div(baseSetNaturalUnit)
      );

      subjectExchangeIssuanceData = {
        setAddress: exchangeIssuanceSetAddress,
        sendTokenExchangeIds: [SetUtils.EXCHANGES.ZERO_EX],
        sendTokens: [exchangeIssuancePaymentToken],
        sendTokenAmounts: [exchangeIssuancePaymentTokenAmount],
        quantity: exchangeIssuanceQuantity,
        receiveTokens: exchangeIssuanceRequiredComponents,
        receiveTokenAmounts: exchangeIssuanceRequiredComponentAmounts,
      };

      await approveForTransferAsync(
        [baseSetComponent],
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExOrderMaker
      );

      await approveForTransferAsync(
        [alreadyOwnedComponent],
        transferProxy.address,
        subjectCaller,
      );

      // Create 0x order for the component, using weth(4) paymentToken as default
      zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                     // senderAddress
        zeroExOrderMaker,                                 // makerAddress
        NULL_ADDRESS,                                     // takerAddress
        ZERO,                                             // makerFee
        ZERO,                                             // takerFee
        subjectExchangeIssuanceData.receiveTokenAmounts[0],  // makerAssetAmount
        exchangeIssuancePaymentTokenAmount,                  // takerAssetAmount
        exchangeIssuanceRequiredComponents[0],               // makerAssetAddress
        exchangeIssuancePaymentToken,                        // takerAssetAddress
        SetUtils.generateSalt(),                          // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,            // exchangeAddress
        NULL_ADDRESS,                                     // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),            // expirationTimeSeconds
        exchangeIssuancePaymentTokenAmount,                  // amount of zeroExOrder to fill
      );

      subjectExchangeOrder = [zeroExOrder];

       // Subject caller needs to wrap ether
      await wrappedEtherMock.deposit.sendTransactionAsync(
        { from: subjectCaller, value: exchangeIssuancePaymentTokenAmount.toString() }
      );

      await wrappedEtherMock.approve.sendTransactionAsync(
        transferProxy.address,
        exchangeIssuancePaymentTokenAmount,
        { from: subjectCaller }
      );
    });

    async function subject(): Promise<string> {
      return await exchangeIssuanceAPI.exchangeIssueAsync(
        subjectExchangeIssuanceData,
        subjectExchangeOrder,
        { from: subjectCaller }
      );
    }

    test('issues the Set to the caller', async () => {
      const previousSetTokenBalance = await baseSetToken.balanceOf.callAsync(subjectCaller);
      const expectedSetTokenBalance = previousSetTokenBalance.add(exchangeIssuanceQuantity);

      await subject();

      const currentSetTokenBalance = await baseSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedSetTokenBalance).to.bignumber.equal(currentSetTokenBalance);
    });
  });

  describe('issueRebalancingSetWithEther', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrder: (KyberTrade | ZeroExSignedFillOrder)[];
    let subjectCaller: Address;
    let etherValue: BigNumber;

    let subjectEther: string;

    let zeroExOrderMaker: Address;

    let rebalancingSetQuantity: BigNumber;

    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let rebalancingUnitShares: BigNumber;

    let exchangeIssuanceSetAddress: Address;
    let exchangeIssuanceQuantity: BigNumber;
    let exchangeIssuanceSendTokenExchangeIds: BigNumber[];
    let exchangeIssuanceSendTokens: Address[];
    let exchangeIssuanceSendTokenAmounts: BigNumber[];
    let exchangeIssuanceReceiveTokens: Address[];
    let exchangeIssuanceReceiveTokenAmounts: BigNumber[];

    let zeroExOrder: ZeroExSignedFillOrder;

    beforeEach(async () => {
      // Create component token (owned by 0x order maker)
      zeroExOrderMaker = ACCOUNTS[2].address;
      const [firstComponent] = await deployTokensSpecifyingDecimals(1, [18], web3, zeroExOrderMaker);

      // Create the Set (1 component)
      const componentAddresses = [firstComponent.address];
      const componentUnits = [new BigNumber(10 ** 10)];
      baseSetNaturalUnit = new BigNumber(10 ** 9);
      baseSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        baseSetNaturalUnit,
      );

      // Create the Rebalancing Set
      rebalancingUnitShares = DEFAULT_UNIT_SHARES;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        DEFAULT_ACCOUNT,
        baseSetToken.address,
        ONE_DAY_IN_SECONDS,
      );

      etherValue = new BigNumber(10 ** 10);

      // Generate exchange issue data
      exchangeIssuanceSetAddress = baseSetToken.address;
      exchangeIssuanceQuantity = new BigNumber(10 ** 10);
      exchangeIssuanceSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX];
      exchangeIssuanceSendTokens = [wrappedEtherMock.address];
      exchangeIssuanceSendTokenAmounts = [etherValue];
      exchangeIssuanceReceiveTokens = componentAddresses;
      exchangeIssuanceReceiveTokenAmounts = componentUnits.map(
        unit => unit.mul(exchangeIssuanceQuantity).div(baseSetNaturalUnit)
      );

      subjectExchangeIssuanceData = {
        setAddress: exchangeIssuanceSetAddress,
        sendTokenExchangeIds: exchangeIssuanceSendTokenExchangeIds,
        sendTokens: exchangeIssuanceSendTokens,
        sendTokenAmounts: exchangeIssuanceSendTokenAmounts,
        quantity: exchangeIssuanceQuantity,
        receiveTokens: exchangeIssuanceReceiveTokens,
        receiveTokenAmounts: exchangeIssuanceReceiveTokenAmounts,
      };

      await approveForTransferAsync(
        [firstComponent],
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExOrderMaker
      );

      // Create 0x order for the first component
      zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                    // senderAddress
        zeroExOrderMaker,                                // makerAddress
        NULL_ADDRESS,                                    // takerAddress
        ZERO,                                            // makerFee
        ZERO,                                            // takerFee
        exchangeIssuanceReceiveTokenAmounts[0],          // makerAssetAmount
        exchangeIssuanceSendTokenAmounts[0],             // takerAssetAmount
        exchangeIssuanceReceiveTokens[0],                // makerAssetAddress
        exchangeIssuanceSendTokens[0],                   // takerAssetAddress
        SetUtils.generateSalt(),                         // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,           // exchangeAddress
        NULL_ADDRESS,                                    // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),           // expirationTimeSeconds
        exchangeIssuanceSendTokenAmounts[0],             // amount of zeroExOrder to fill
      );

      subjectExchangeOrder = [zeroExOrder];
      subjectRebalancingSetAddress = rebalancingSetToken.address;
      rebalancingSetQuantity = exchangeIssuanceQuantity
        .mul(DEFAULT_REBALANCING_NATURAL_UNIT)
        .div(rebalancingUnitShares);

      subjectCaller = ACCOUNTS[1].address;

      subjectEther = etherValue.toString();
    });

    async function subject(): Promise<string> {
      return await exchangeIssuanceAPI.issueRebalancingSetWithEtherAsync(
        subjectRebalancingSetAddress,
        subjectExchangeIssuanceData,
        subjectExchangeOrder,
        { from: subjectCaller, value: subjectEther }
      );
    }

    test('issues the rebalancing Set to the caller', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.add(rebalancingSetQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });

    describe('when the payment token is not wrapped ether', async () => {
      const notWrappedEther = ACCOUNTS[3].address;

      beforeEach(async () => {
        subjectExchangeIssuanceData.sendTokens[0] = notWrappedEther;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Payment token at ${notWrappedEther} is not the expected wrapped ether token at ${wrappedEtherMock.address}`
        );
      });
    });

    describe('when a set address is not rebalancing Sets current set address', async () => {
      const notBaseSet = ACCOUNTS[3].address;

      beforeEach(async () => {
        subjectExchangeIssuanceData.setAddress = notBaseSet;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Set token at ${notBaseSet} is not the expected rebalancing set token current Set at ${baseSetToken.address}`
        );
      });
    });

    describe('when an empty value is passed in', async () => {
      beforeEach(async () => {
        subjectEther = undefined;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
           `Ether value should not be undefined`
        );
      });
    });
  });

  describe('redeemRebalancingSetIntoEther', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrders: (KyberTrade | ZeroExSignedFillOrder)[];
    let subjectCaller: Address;
    let subjectEther: BigNumber;

    let zeroExOrderMaker: Address;

    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let rebalancingUnitShares: BigNumber;

    let exchangeIssuanceSetAddress: Address;
    let exchangeIssuanceQuantity: BigNumber;
    let exchangeIssuanceSendTokenExchangeIds: BigNumber[];
    let exchangeIssuanceSendTokens: Address[];
    let exchangeIssuanceSendTokenAmounts: BigNumber[];
    let exchangeIssuanceReceiveTokens: Address[];
    let exchangeIssuanceReceiveTokenAmounts: BigNumber[];

    let zeroExOrder: ZeroExSignedFillOrder;

    beforeEach(async () => {
      subjectCaller = ACCOUNTS[1].address;
      zeroExOrderMaker = ACCOUNTS[2].address;

      const [baseSetComponent] = await deployTokensSpecifyingDecimals(1, [18], web3, subjectCaller);

      // Create the Set (1 component)
      const componentAddresses = [baseSetComponent.address];
      const componentUnits = [new BigNumber(10 ** 10)];
      baseSetNaturalUnit = new BigNumber(10 ** 9);
      baseSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        baseSetNaturalUnit,
      );

      // Create the Rebalancing Set
      rebalancingUnitShares = DEFAULT_UNIT_SHARES;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        DEFAULT_ACCOUNT,
        baseSetToken.address,
        ONE_DAY_IN_SECONDS,
      );

      subjectEther = new BigNumber(10 ** 10);

      // Generate exchange issue data
      exchangeIssuanceSetAddress = baseSetToken.address;
      exchangeIssuanceQuantity = new BigNumber(10 ** 10);
      exchangeIssuanceSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX];
      exchangeIssuanceSendTokens = componentAddresses;
      exchangeIssuanceSendTokenAmounts = componentUnits.map(
        unit => unit.mul(exchangeIssuanceQuantity).div(baseSetNaturalUnit)
      );
      exchangeIssuanceReceiveTokens = [wrappedEtherMock.address];
      exchangeIssuanceReceiveTokenAmounts = [subjectEther];

      subjectExchangeIssuanceData = {
        setAddress: exchangeIssuanceSetAddress,
        sendTokenExchangeIds: exchangeIssuanceSendTokenExchangeIds,
        sendTokens: exchangeIssuanceSendTokens,
        sendTokenAmounts: exchangeIssuanceSendTokenAmounts,
        quantity: exchangeIssuanceQuantity,
        receiveTokens: exchangeIssuanceReceiveTokens,
        receiveTokenAmounts: exchangeIssuanceReceiveTokenAmounts,
      };

      // Create 0x order for the component, using weth(4) paymentToken as default
      zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                    // senderAddress
        zeroExOrderMaker,                                // makerAddress
        NULL_ADDRESS,                                    // takerAddress
        ZERO,                                            // makerFee
        ZERO,                                            // takerFee
        exchangeIssuanceReceiveTokenAmounts[0],          // makerAssetAmount
        exchangeIssuanceSendTokenAmounts[0],             // takerAssetAmount
        exchangeIssuanceReceiveTokens[0],                // makerAssetAddress
        exchangeIssuanceSendTokens[0],                   // takerAssetAddress
        SetUtils.generateSalt(),                         // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,           // exchangeAddress
        NULL_ADDRESS,                                    // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),           // expirationTimeSeconds
        exchangeIssuanceSendTokenAmounts[0],             // amount of zeroExOrder to fill
      );

      subjectExchangeOrders = [zeroExOrder];
      subjectRebalancingSetAddress = rebalancingSetToken.address;
      subjectRebalancingSetQuantity = exchangeIssuanceQuantity
        .mul(DEFAULT_REBALANCING_NATURAL_UNIT)
        .div(rebalancingUnitShares);

      // 0x maker needs to wrap ether
      await wrappedEtherMock.deposit.sendTransactionAsync(
        { from: zeroExOrderMaker, value: exchangeIssuanceReceiveTokenAmounts[0].toString() }
      );

      // 0x maker needs to approve to the 0x proxy
      await wrappedEtherMock.approve.sendTransactionAsync(
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        exchangeIssuanceReceiveTokenAmounts[0],
        { from: zeroExOrderMaker }
      );

      // Caller approves set to the transfer proxy
      await approveForTransferAsync(
        [baseSetComponent, baseSetToken],
        transferProxy.address,
        subjectCaller
      );

      await core.issue.sendTransactionAsync(
        baseSetToken.address,
        exchangeIssuanceQuantity,
        { from: subjectCaller }
      );

      await core.issue.sendTransactionAsync(
        rebalancingSetToken.address,
        subjectRebalancingSetQuantity,
        { from: subjectCaller }
      );

      await approveForTransferAsync(
        [rebalancingSetToken],
        rebalancingSetExchangeIssuanceModule.address,
        subjectCaller
      );
    });

    async function subject(): Promise<string> {
      return await exchangeIssuanceAPI.redeemRebalancingSetIntoEtherAsync(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectExchangeIssuanceData,
        subjectExchangeOrders,
        { from: subjectCaller }
      );
    }

    test('redeems the rebalancing Set to the caller', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.sub(subjectRebalancingSetQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });
  });

  describe('getKyberConversionRate', async () => {
    let subjectMakerTokenAddress: Address;
    let subjectComponentTokenAddress: Address;
    let subjectQuantity: BigNumber;

    async function subject(): Promise<[BigNumber, BigNumber]> {
      return exchangeIssuanceAPI.getKyberConversionRate(
        subjectMakerTokenAddress,
        subjectComponentTokenAddress,
        subjectQuantity
      );
    }

    beforeEach(async () => {
      subjectMakerTokenAddress = SetTestUtils.KYBER_RESERVE_SOURCE_TOKEN_ADDRESS;
      subjectComponentTokenAddress = SetTestUtils.KYBER_RESERVE_DESTINATION_TOKEN_ADDRESS;
      subjectQuantity = new BigNumber(100000);
    });

    it('returns a conversion rate and slip rate', async () => {
      const [conversionRate, slipRate] = await subject();

      expect(conversionRate).to.bignumber.equal(321550000000000000);
      expect(slipRate).to.bignumber.equal(319942250000000000);
    });
  });
});
