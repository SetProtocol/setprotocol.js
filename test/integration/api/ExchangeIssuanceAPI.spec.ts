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
  deployBaseContracts,
  deployExchangeIssuanceModuleAsync,
  deployKyberNetworkWrapperContract,
  deployRebalancingSetExchangeIssuanceModuleAsync,
  deploySetTokenAsync,
  deployTokensSpecifyingDecimals,
  deployWethMockAsync,
  deployZeroExExchangeWrapperContract,
} from '@test/helpers';
import { BigNumber } from '@src/util';
import { Address, KyberTrade, SetProtocolConfig, ZeroExSignedFillOrder } from '@src/types/common';

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
    await addModuleAsync(core, rebalancingSetExchangeIssuanceModule.address);

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
    exchangeIssuanceAPI = new ExchangeIssuanceAPI(web3, assertions, config);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('exchangeIssuance', async () => {
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrders: (KyberTrade | ZeroExSignedFillOrder)[];
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
        NULL_ADDRESS,                                        // senderAddress
        zeroExOrderMaker,                                    // makerAddress
        NULL_ADDRESS,                                        // takerAddress
        ZERO,                                                // makerFee
        ZERO,                                                // takerFee
        subjectExchangeIssuanceData.receiveTokenAmounts[0],  // makerAssetAmount
        exchangeIssuancePaymentTokenAmount,                  // takerAssetAmount
        exchangeIssuanceRequiredComponents[0],               // makerAssetAddress
        exchangeIssuancePaymentToken,                        // takerAssetAddress
        SetUtils.generateSalt(),                             // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,               // exchangeAddress
        NULL_ADDRESS,                                        // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),               // expirationTimeSeconds
        exchangeIssuancePaymentTokenAmount,                  // amount of zeroExOrder to fill
      );

      subjectExchangeOrders = [zeroExOrder];

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
        subjectExchangeOrders,
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

    describe('when the receive tokens are not included in the set\'s components', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceData.receiveTokens[0] = 'NotAComponentAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Component at NotAComponentAddress is not part of the collateralizing set at ${baseSetToken.address}`
        );
      });
    });

    describe('when the orders array is empty', async () => {
      beforeEach(async () => {
        subjectExchangeOrders = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
           `The array orders cannot be empty.`
        );
      });
    });

    describe('when the quantity of set to acquire is zero', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceData.quantity = new BigNumber(0);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity 0 inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the base set is invalid because it is disabled', async () => {
      beforeEach(async () => {
        await core.disableSet.sendTransactionAsync(baseSetToken.address);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Contract at ${baseSetToken.address} is not a valid Set token address.`
        );
      });
    });

    describe('when the receive token and receive token array lengths are different', async () => {
      const arbitraryTokenUnits = new BigNumber(10 ** 10);

      beforeEach(async () => {
        subjectExchangeIssuanceData.receiveTokenAmounts.push(arbitraryTokenUnits);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The receiveTokens and receiveTokenAmounts arrays need to be equal lengths.`
        );
      });
    });

    describe('when the quantity to issue is not a multiple of the sets natural unit', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceData.quantity = baseSetNaturalUnit.add(1);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Quantity of Exchange issue Params needs to be multiple of natural unit.`
        );
      });
    });

    describe('when the send token amounts array is longer than the send tokens list', async () => {
      const arbitraryTokenUnits = new BigNumber(10 ** 10);

      beforeEach(async () => {
        subjectExchangeIssuanceData.sendTokenAmounts.push(arbitraryTokenUnits);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The sendTokens and sendTokenAmounts arrays need to be equal lengths.`
        );
      });
    });

    describe('when the send token exchange ids array is longer than the send tokens list', async () => {
      const arbitraryTokenUnits = new BigNumber(10 ** 10);

      beforeEach(async () => {
        subjectExchangeIssuanceData.sendTokenAmounts.push(arbitraryTokenUnits);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The sendTokens and sendTokenAmounts arrays need to be equal lengths.`
        );
      });
    });

    describe('when a send token amount is 0', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceData.sendTokenAmounts[0] = new BigNumber(0);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity 0 inputted needs to be greater than zero.`
        );
      });
    });

    describe('when a send token exchange id does not map to a known exchange enum', async () => {
      const invalidExchangeIdEnum = new BigNumber(3);

      beforeEach(async () => {
        subjectExchangeIssuanceData.sendTokenExchangeIds[0] = invalidExchangeIdEnum;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `ExchangeId 3 is invalid.`
        );
      });
    });

    describe('when the receive tokens array is empty', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceData.receiveTokens = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The receiveTokens and receiveTokenAmounts arrays need to be equal lengths.`
        );
      });
    });

    describe('when a receive token amount is 0', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceData.receiveTokenAmounts[0] = new BigNumber(0);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity 0 inputted needs to be greater than zero.`
        );
      });
    });
  });

  describe('issueRebalancingSetWithEther', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrders: (KyberTrade | ZeroExSignedFillOrder)[];
    let subjectCaller: Address;
    let subjectTransactionEtherValue: string;

    let etherValue: BigNumber;

    let customSalt: BigNumber;
    let customExpirationTimeSeconds: BigNumber;
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
        NULL_ADDRESS,                                                         // senderAddress
        zeroExOrderMaker,                                                     // makerAddress
        NULL_ADDRESS,                                                         // takerAddress
        ZERO,                                                                 // makerFee
        ZERO,                                                                 // takerFee
        exchangeIssuanceReceiveTokenAmounts[0],                               // makerAssetAmount
        exchangeIssuanceSendTokenAmounts[0],                                  // takerAssetAmount
        exchangeIssuanceReceiveTokens[0],                                     // makerAssetAddress
        exchangeIssuanceSendTokens[0],                                        // takerAssetAddress
        customSalt || SetUtils.generateSalt(),                                // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,                                // exchangeAddress
        NULL_ADDRESS,                                                         // feeRecipientAddress
        customExpirationTimeSeconds || SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
        exchangeIssuanceSendTokenAmounts[0],                                  // amount of zeroExOrder to fill
      );

      subjectRebalancingSetQuantity = exchangeIssuanceQuantity.mul(DEFAULT_REBALANCING_NATURAL_UNIT)
                                                              .div(rebalancingUnitShares);

      subjectExchangeOrders = [zeroExOrder];
      subjectRebalancingSetAddress = rebalancingSetToken.address;
      subjectCaller = ACCOUNTS[1].address;
      subjectTransactionEtherValue = etherValue.toString();
    });

    async function subject(): Promise<string> {
      return await exchangeIssuanceAPI.issueRebalancingSetWithEtherAsync(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectExchangeIssuanceData,
        subjectExchangeOrders,
        { from: subjectCaller, value: subjectTransactionEtherValue }
      );
    }

    test('issues the rebalancing Set to the caller', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.add(subjectRebalancingSetQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });

    describe('when the send tokens has more than one address', async () => {
      const notWrappedEther = ACCOUNTS[3].address;

      beforeEach(async () => {
        subjectExchangeIssuanceData.sendTokens = [wrappedEtherMock.address, notWrappedEther];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Only one send token is allowed in Payable Exchange Issuance`
        );
      });
    });

    describe('when a from transaction parameter is not passed in', async () => {
      beforeEach(async () => {
        subjectCaller = undefined;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
           `No "from" address specified in neither the given options, nor the default options.`
        );
      });
    });

    describe('when an empty Ether transaction value is passed in', async () => {
      beforeEach(async () => {
        subjectTransactionEtherValue = undefined;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
           `Ether value should not be undefined`
        );
      });
    });

    describe('when the rebalancing set address is invalid', async () => {
      beforeEach(async () => {
        subjectRebalancingSetAddress = 'InvalidTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected rebalancingSetAddress to conform to schema /Address.

        Encountered: "InvalidTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when no orders are passed in', async () => {
      beforeEach(async () => {
        subjectExchangeOrders = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The array orders cannot be empty.`
        );
      });
    });

    describe('when the set to exchange issue for is not the rebalancing set\'s base set', async () => {
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

    describe('when the receive tokens are not included in the rebalancing set\'s base set\'s components', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceData.receiveTokens[0] = 'NotAComponentAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Component at NotAComponentAddress is not part of the collateralizing set at ${baseSetToken.address}`
        );
      });
    });

    describe('when the send token does not contain Wrapper Ether', async () => {
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

    describe('#issueRebalancingSetWithEtherTransactionData', async () => {
      beforeAll(async () => {
        customSalt = new BigNumber(1000);
        customExpirationTimeSeconds = new BigNumber(1902951096);
      });

      afterAll(async () => {
        customSalt = undefined;
        customExpirationTimeSeconds = undefined;
      });

      async function subject(): Promise<string> {
        return await exchangeIssuanceAPI.fetchIssueRebalancingSetWithEtherTransactionDataAsync(
          subjectRebalancingSetAddress,
          subjectRebalancingSetQuantity,
          subjectExchangeIssuanceData,
          subjectExchangeOrders,
          { from: subjectCaller, value: subjectTransactionEtherValue }
        );
      }

      test('issues the rebalancing Set to the caller', async () => {
        const data = await subject();

        expect(data).to.equal('0xb7fd4d0700000000000000000000000020a052db6ea52533804b768d7b43fe732a83e67d000000000' +
                              '00000000000000000000000000000000000000000000002540be4000000000000000000000000000000' +
                              '00000000000000000000000000000000008000000000000000000000000000000000000000000000000' +
                              '000000000000002a0000000000000000000000000746d084aed3a220a120162008ed3912c29dbef7100' +
                              '000000000000000000000000000000000000000000000000000002540be400000000000000000000000' +
                              '00000000000000000000000000000000000000000e00000000000000000000000000000000000000000' +
                              '00000000000000000000012000000000000000000000000000000000000000000000000000000000000' +
                              '0016000000000000000000000000000000000000000000000000000000000000001a000000000000000' +
                              '000000000000000000000000000000000000000000000001e0000000000000000000000000000000000' +
                              '00000000000000000000000000000010000000000000000000000000000000000000000000000000000' +
                              '00000000000100000000000000000000000000000000000000000000000000000000000000010000000' +
                              '000000000000000001590311c922a283024f0363777478c6b8c3d8c6c00000000000000000000000000' +
                              '00000000000000000000000000000000000001000000000000000000000000000000000000000000000' +
                              '00000000002540be4000000000000000000000000000000000000000000000000000000000000000001' +
                              '000000000000000000000000841789fe96a433b49450e37e8cb513117712f63f0000000000000000000' +
                              '00000000000000000000000000000000000000000000100000000000000000000000000000000000000' +
                              '0000000000000000174876e800000000000000000000000000000000000000000000000000000000000' +
                              '00002620000000000000000000000000000000000000000000000000000000000000001000000000000' +
                              '00000000000000000000000000000000000000000000000000010000000000000000000000000000000' +
                              '00000000000000000000000000000020200000000000000000000000000000000000000000000000000' +
                              '0000000000004200000000000000000000000000000000000000000000000000000002540be4001c686' +
                              'd2f5daabb0ddc9934e9169e6d41ce00e8ffdcb9d18d1786268088b60b9b9a15947de19446a602b50f99' +
                              '7cb3a005bb56bcd15bae4d69d43058ad04b35eb70203000000000000000000000000e36ea790bc9d7ab' +
                              '70c55260c66d52b1eca985f840000000000000000000000000000000000000000000000000000000000' +
                              '00000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '00000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '0000000000000000000000174876e800000000000000000000000000000000000000000000000000000' +
                              '00002540be4000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '00000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '0000000000000000000000000000000716cbab800000000000000000000000000000000000000000000' +
                              '000000000000000003e8000000000000000000000000841789fe96a433b49450e37e8cb513117712f63' +
                              'f0000000000000000000000001590311c922a283024f0363777478c6b8c3d8c6c000000000000000000' +
                              '000000000000000000000000000000000000000000');
      });
    });

    describe('#issueRebalancingSetWithEtherGasEstimate', async () => {
      beforeAll(async () => {
        customSalt = new BigNumber(1000);
        customExpirationTimeSeconds = new BigNumber(1902951096);
      });

      afterAll(async () => {
        customSalt = undefined;
        customExpirationTimeSeconds = undefined;
      });

      async function subject(): Promise<number> {
        return await exchangeIssuanceAPI.fetchIssueRebalancingSetWithEtherGasCostAsync(
          subjectRebalancingSetAddress,
          subjectRebalancingSetQuantity,
          subjectExchangeIssuanceData,
          subjectExchangeOrders,
          { from: subjectCaller, value: subjectTransactionEtherValue }
        );
      }

      test('issues the rebalancing Set to the caller', async () => {
        const data = await subject();

        expect(data).to.equal(829714);
      });
    });
  });

  describe('redeemRebalancingSetIntoEther', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrders: (KyberTrade | ZeroExSignedFillOrder)[];
    let subjectCaller: Address;
    let subjectTransactionEtherValue: BigNumber;

    let customSalt: BigNumber;
    let customExpirationTimeSeconds: BigNumber;
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

      subjectTransactionEtherValue = new BigNumber(10 ** 10);

      // Generate exchange issue data
      exchangeIssuanceSetAddress = baseSetToken.address;
      exchangeIssuanceQuantity = new BigNumber(10 ** 10);
      exchangeIssuanceSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX];
      exchangeIssuanceSendTokens = componentAddresses;
      exchangeIssuanceSendTokenAmounts = componentUnits.map(
        unit => unit.mul(exchangeIssuanceQuantity).div(baseSetNaturalUnit)
      );
      exchangeIssuanceReceiveTokens = [wrappedEtherMock.address];
      exchangeIssuanceReceiveTokenAmounts = [subjectTransactionEtherValue];

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
        NULL_ADDRESS,                                                         // senderAddress
        zeroExOrderMaker,                                                     // makerAddress
        NULL_ADDRESS,                                                         // takerAddress
        ZERO,                                                                 // makerFee
        ZERO,                                                                 // takerFee
        exchangeIssuanceReceiveTokenAmounts[0],                               // makerAssetAmount
        exchangeIssuanceSendTokenAmounts[0],                                  // takerAssetAmount
        exchangeIssuanceReceiveTokens[0],                                     // makerAssetAddress
        exchangeIssuanceSendTokens[0],                                        // takerAssetAddress
        customSalt || SetUtils.generateSalt(),                                // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,                                // exchangeAddress
        NULL_ADDRESS,                                                         // feeRecipientAddress
        customExpirationTimeSeconds || SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
        exchangeIssuanceSendTokenAmounts[0],                                  // amount of zeroExOrder to fill
      );

      subjectExchangeOrders = [zeroExOrder];
      subjectRebalancingSetAddress = rebalancingSetToken.address;
      subjectRebalancingSetQuantity = exchangeIssuanceQuantity.mul(DEFAULT_REBALANCING_NATURAL_UNIT)
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

    describe('when the receive tokens has more than one address', async () => {
      const notWrappedEther = ACCOUNTS[3].address;

      beforeEach(async () => {
        subjectExchangeIssuanceData.receiveTokens = [wrappedEtherMock.address, notWrappedEther];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Only one receive token is allowed in Payable Exchange Redemption`
        );
      });
    });

    describe('when a from transaction parameter is not passed in', async () => {
      beforeEach(async () => {
        subjectCaller = undefined;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
           `No "from" address specified in neither the given options, nor the default options.`
        );
      });
    });

    describe('when the rebalancing set address is invalid', async () => {
      beforeEach(async () => {
        subjectRebalancingSetAddress = 'InvalidTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected rebalancingSetAddress to conform to schema /Address.

        Encountered: "InvalidTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when no orders are passed in', async () => {
      beforeEach(async () => {
        subjectExchangeOrders = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The array orders cannot be empty.`
        );
      });
    });

    describe('when the set to exchange redeem for is not the rebalancing set\'s base set', async () => {
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

    describe('when the send tokens are not included in the rebalancing set\'s base set\'s components', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceData.sendTokens[0] = 'NotAComponentAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Component at NotAComponentAddress is not part of the collateralizing set at ${baseSetToken.address}`
        );
      });
    });

    describe('when the amount of base set from the rebalancing set quantity is not enough to trade', async () => {
      beforeEach(async () => {
        subjectRebalancingSetQuantity = exchangeIssuanceQuantity.mul(DEFAULT_REBALANCING_NATURAL_UNIT)
                                                                .div(rebalancingUnitShares)
                                                                .sub(1);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity of base set redeemable from the quantity of the rebalancing set: 9999999999 must be ` +
          `greater or equal to the amount required for the redemption trades: 10000000000`
        );
      });
    });

    describe('when the receive tokens does not contain Wrapper Ether', async () => {
      const notWrappedEther = ACCOUNTS[3].address;

      beforeEach(async () => {
        subjectExchangeIssuanceData.receiveTokens[0] = notWrappedEther;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Payment token at ${notWrappedEther} is not the expected wrapped ether token at ${wrappedEtherMock.address}`
        );
      });
    });

    describe('#issueRebalancingSetWithEtherTransactionData', async () => {
      beforeAll(async () => {
        customSalt = new BigNumber(1000);
        customExpirationTimeSeconds = new BigNumber(1902951096);
      });

      afterAll(async () => {
        customSalt = undefined;
        customExpirationTimeSeconds = undefined;
      });

      async function subject(): Promise<string> {
        return await exchangeIssuanceAPI.fetchRedeemRebalancingSetIntoEtherTransactionDataAsyncAsync(
          subjectRebalancingSetAddress,
          subjectRebalancingSetQuantity,
          subjectExchangeIssuanceData,
          subjectExchangeOrders,
          { from: subjectCaller }
        );
      }

      test('issues the rebalancing Set to the caller', async () => {
        const data = await subject();

        expect(data).to.equal('0xe8bf981d00000000000000000000000020a052db6ea52533804b768d7b43fe732a83e67d0000000000' +
                              '0000000000000000000000000000000000000000000002540be400000000000000000000000000000000' +
                              '000000000000000000000000000000008000000000000000000000000000000000000000000000000000' +
                              '000000000002a0000000000000000000000000746d084aed3a220a120162008ed3912c29dbef71000000' +
                              '00000000000000000000000000000000000000000000000002540be40000000000000000000000000000' +
                              '000000000000000000000000000000000000e00000000000000000000000000000000000000000000000' +
                              '000000000000000120000000000000000000000000000000000000000000000000000000000000016000' +
                              '000000000000000000000000000000000000000000000000000000000001a00000000000000000000000' +
                              '0000000000000000000000000000000000000001e0000000000000000000000000000000000000000000' +
                              '000000000000000000000100000000000000000000000000000000000000000000000000000000000000' +
                              '010000000000000000000000000000000000000000000000000000000000000001000000000000000000' +
                              '000000841789fe96a433b49450e37e8cb513117712f63f00000000000000000000000000000000000000' +
                              '000000000000000000000000010000000000000000000000000000000000000000000000000000001748' +
                              '76e800000000000000000000000000000000000000000000000000000000000000000100000000000000' +
                              '00000000001590311c922a283024f0363777478c6b8c3d8c6c0000000000000000000000000000000000' +
                              '000000000000000000000000000001000000000000000000000000000000000000000000000000000000' +
                              '02540be40000000000000000000000000000000000000000000000000000000000000002620000000000' +
                              '000000000000000000000000000000000000000000000000000001000000000000000000000000000000' +
                              '000000000000000000000000000000000100000000000000000000000000000000000000000000000000' +
                              '000000000002020000000000000000000000000000000000000000000000000000000000000042000000' +
                              '000000000000000000000000000000000000000000000000174876e8001be1783670033e6da58b5fe0a1' +
                              '2f9c6548b5b57838f44b648b5cd9210ee74376fe58cbadb6bf85fbdffa2beebe03f6e048a1bd2dff92b1' +
                              'aefcee768593a94808e603000000000000000000000000e36ea790bc9d7ab70c55260c66d52b1eca985f' +
                              '840000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '000000000000000000000000000000000000000000000000000000000000000000000000000000000254' +
                              '0be400000000000000000000000000000000000000000000000000000000174876e80000000000000000' +
                              '000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '00716cbab800000000000000000000000000000000000000000000000000000000000003e80000000000' +
                              '000000000000001590311c922a283024f0363777478c6b8c3d8c6c000000000000000000000000841789' +
                              'fe96a433b49450e37e8cb513117712f63f00000000000000000000000000000000000000000000000000' +
                              '0000000000');
      });
    });

    describe('#issueRebalancingSetWithEtherGasEstimate', async () => {
      beforeAll(async () => {
        customSalt = new BigNumber(1000);
        customExpirationTimeSeconds = new BigNumber(1902951096);
      });

      afterAll(async () => {
        customSalt = undefined;
        customExpirationTimeSeconds = undefined;
      });

      async function subject(): Promise<number> {
        return await exchangeIssuanceAPI.fetchRedeemRebalancingSetIntoEtherGasCostAsync(
          subjectRebalancingSetAddress,
          subjectRebalancingSetQuantity,
          subjectExchangeIssuanceData,
          subjectExchangeOrders,
          { from: subjectCaller }
        );
      }

      test('issues the rebalancing Set to the caller', async () => {
        const data = await subject();

        expect(data).to.equal(835180);
      });
    });
  });

  describe('getKyberConversionRate', async () => {
    let subjectSourceTokenAddresses: Address[];
    let subjectDestinationTokenAddresses: Address[];
    let subjectQuantities: BigNumber[];

    beforeEach(async () => {
      const makerTokenAddress = SetTestUtils.KYBER_RESERVE_SOURCE_TOKEN_ADDRESS;
      const componentTokenAddress = SetTestUtils.KYBER_RESERVE_DESTINATION_TOKEN_ADDRESS;

      subjectSourceTokenAddresses = [makerTokenAddress, makerTokenAddress];
      subjectDestinationTokenAddresses = [componentTokenAddress, componentTokenAddress];
      subjectQuantities = [new BigNumber(10 ** 10), new BigNumber(10 ** 10)];
    });

    async function subject(): Promise<[BigNumber[], BigNumber[]]> {
      return await exchangeIssuanceAPI.getKyberConversionRates(
        subjectSourceTokenAddresses,
        subjectDestinationTokenAddresses,
        subjectQuantities
      );
    }

    it('returns a conversion rate and slip rate', async () => {
      let firstRate: BigNumber;
      let secondRate: BigNumber;
      let firstSlippage: BigNumber;
      let secondSlippage: BigNumber;

      const conversionRates = await subject();
      [[firstRate, secondRate], [firstSlippage, secondSlippage]] = conversionRates;

      const expectedRate = new BigNumber('321556325900000000');
      expect(firstRate).to.be.bignumber.equal(expectedRate);

      const expectedSecondRate = new BigNumber('321556325900000000');
      expect(secondRate).to.be.bignumber.equal(expectedSecondRate);

      const expectedSlippage = new BigNumber('319948544270500000');
      expect(firstSlippage).to.be.bignumber.equal(expectedSlippage);

      const expectedSecondSlippage = new BigNumber ('319948544270500000');
      expect(secondSlippage).to.be.bignumber.equal(expectedSecondSlippage);
    });
  });
});
