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
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import * as setProtocolUtils from 'set-protocol-utils';
import { Bytes, ExchangeIssuanceParams } from 'set-protocol-utils';
import Web3 from 'web3';
import { Core } from 'set-protocol-contracts';
import {
  CoreContract,
  ExchangeIssuanceModuleContract,
  RebalancingSetExchangeIssuanceModuleContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { RebalancingSetExchangeIssuanceModuleWrapper } from '@src/wrappers';
import {
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
  ONE_DAY_IN_SECONDS,
  DEFAULT_UNIT_SHARES,
  DEFAULT_REBALANCING_NATURAL_UNIT,
} from '@src/constants';
import {
  addAuthorizationAsync,
  addModuleAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployExchangeIssuanceModuleAsync,
  deployRebalancingSetExchangeIssuanceModuleAsync,
  deploySetTokenAsync,
  deployTokensSpecifyingDecimals,
  deployWethMockAsync,
  deployZeroExExchangeWrapperContract,
} from '@test/helpers';
import { BigNumber } from '@src/util';
import { Address, ZeroExSignedFillOrder } from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);
const setUtils = new SetUtils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('RebalancingSetExchangeIssuanceModuleWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let rebalancingSetExchangeIssuanceModule: RebalancingSetExchangeIssuanceModuleContract;
  let wrappedEtherMock: WethMockContract;
  let exchangeIssuanceModule: ExchangeIssuanceModuleContract;

  let rebalancingSetExchangeIssuanceModuleWrapper: RebalancingSetExchangeIssuanceModuleWrapper;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

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
    await addAuthorizationAsync(transferProxy, exchangeIssuanceModule.address);
    await addAuthorizationAsync(vault, exchangeIssuanceModule.address);

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

    rebalancingSetExchangeIssuanceModuleWrapper = new RebalancingSetExchangeIssuanceModuleWrapper(
      web3,
      rebalancingSetExchangeIssuanceModule.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('#issueRebalancingSetWithEther', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrdersData: Bytes;
    let subjectCaller: Address;
    let subjectEther: BigNumber;

    let customSalt: BigNumber;
    let customExpirationTimeSeconds: BigNumber;
    let zeroExOrderMaker: Address;

    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let rebalancingUnitShares: BigNumber;

    let exchangeIssuanceSetAddress: Address;
    let exchangeIssuanceQuantity: BigNumber;
    let exchangeIssuancePaymentToken: Address;
    let exchangeIssuancePaymentTokenAmount: BigNumber;
    let exchangeIssuanceRequiredComponents: Address[];
    let exchangeIssuanceRequiredComponentAmounts: BigNumber[];

    let zeroExOrder: ZeroExSignedFillOrder;

    beforeEach(async () => {
      // Create component token (owned by 0x order maker)
      zeroExOrderMaker = ACCOUNTS[2].address;
      const [baseSetComponent] = await deployTokensSpecifyingDecimals(1, [18], web3, zeroExOrderMaker);

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
      exchangeIssuancePaymentToken = wrappedEtherMock.address;
      exchangeIssuancePaymentTokenAmount = subjectEther;
      exchangeIssuanceRequiredComponents = componentAddresses;
      exchangeIssuanceRequiredComponentAmounts = componentUnits.map(
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

      // Create 0x order for the component, using weth(4) paymentToken as default
      zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                                         // senderAddress
        zeroExOrderMaker,                                                     // makerAddress
        NULL_ADDRESS,                                                         // takerAddress
        ZERO,                                                                 // makerFee
        ZERO,                                                                 // takerFee
        subjectExchangeIssuanceData.receiveTokenAmounts[0],                   // makerAssetAmount
        exchangeIssuancePaymentTokenAmount,                                   // takerAssetAmount
        exchangeIssuanceRequiredComponents[0],                                // makerAssetAddress
        exchangeIssuancePaymentToken,                                         // takerAssetAddress
        customSalt || SetUtils.generateSalt(),                                // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,                                // exchangeAddress
        NULL_ADDRESS,                                                         // feeRecipientAddress
        customExpirationTimeSeconds || SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
        exchangeIssuancePaymentTokenAmount,                                   // amount of zeroExOrder to fill
      );

      subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder]);
      subjectRebalancingSetAddress = rebalancingSetToken.address;
      subjectRebalancingSetQuantity = exchangeIssuanceQuantity.mul(DEFAULT_REBALANCING_NATURAL_UNIT)
                                                              .div(rebalancingUnitShares);

      subjectCaller = ACCOUNTS[1].address;
    });

    async function subject(): Promise<string> {
      return await rebalancingSetExchangeIssuanceModuleWrapper.issueRebalancingSetWithEther(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectExchangeIssuanceData,
        subjectExchangeOrdersData,
        { from: subjectCaller, value: subjectEther.toString() }
      );
    }

    test('issues the rebalancing Set to the caller', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.add(subjectRebalancingSetQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
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
        return await rebalancingSetExchangeIssuanceModuleWrapper.issueRebalancingSetWithEtherTransactionData(
          subjectRebalancingSetAddress,
          subjectRebalancingSetQuantity,
          subjectExchangeIssuanceData,
          subjectExchangeOrdersData,
          { from: subjectCaller, value: subjectEther.toString() }
        );
      }

      test('issues the rebalancing Set to the caller', async () => {
        const data = await subject();

        expect(data).to.equal('0xb7fd4d0700000000000000000000000020a052db6ea52533804b768d7b43fe732a83e67d0000000000' +
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
                              '000000a9a65d631f8c8577f543b64b35909030c84676a200000000000000000000000000000000000000' +
                              '000000000000000000000000010000000000000000000000000000000000000000000000000000000254' +
                              '0be400000000000000000000000000000000000000000000000000000000000000000100000000000000' +
                              '000000000058787e5441be9548440086495ea8583394e3427f0000000000000000000000000000000000' +
                              '000000000000000000000000000001000000000000000000000000000000000000000000000000000000' +
                              '174876e80000000000000000000000000000000000000000000000000000000000000002620000000000' +
                              '000000000000000000000000000000000000000000000000000001000000000000000000000000000000' +
                              '000000000000000000000000000000000100000000000000000000000000000000000000000000000000' +
                              '000000000002020000000000000000000000000000000000000000000000000000000000000042000000' +
                              '00000000000000000000000000000000000000000000000002540be4001cdaf75a34923557b37b4b29fb' +
                              'a81f372d7b3f56137fe8edc039222ef48f94ab803e22dd1350f5645a4dc819bb65710f04eb6f264ad032' +
                              '1b724e95f5e920142d5803000000000000000000000000e36ea790bc9d7ab70c55260c66d52b1eca985f' +
                              '840000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '000000000000000000000000000000000000000000000000000000000000000000000000000000001748' +
                              '76e80000000000000000000000000000000000000000000000000000000002540be40000000000000000' +
                              '000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '00716cbab800000000000000000000000000000000000000000000000000000000000003e80000000000' +
                              '0000000000000058787e5441be9548440086495ea8583394e3427f000000000000000000000000a9a65d' +
                              '631f8c8577f543b64b35909030c84676a200000000000000000000000000000000000000000000000000' +
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
        return await rebalancingSetExchangeIssuanceModuleWrapper.issueRebalancingSetWithEtherGasEstimate(
          subjectRebalancingSetAddress,
          subjectRebalancingSetQuantity,
          subjectExchangeIssuanceData,
          subjectExchangeOrdersData,
          { from: subjectCaller, value: subjectEther.toString() }
        );
      }

      test('issues the rebalancing Set to the caller', async () => {
        const data = await subject();

        expect(data).to.equal(829650);
      });
    });
  });

  describe('#redeemRebalancingSetIntoEther', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrdersData: Bytes;
    let subjectCaller: Address;
    let subjectEther: BigNumber;

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

      subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder]);
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
      return await rebalancingSetExchangeIssuanceModuleWrapper.redeemRebalancingSetIntoEther(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectExchangeIssuanceData,
        subjectExchangeOrdersData,
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

    test('increments the callers ether balance appropriately', async () => {
      const previousEthBalance = new BigNumber(await web3.eth.getBalance(subjectCaller));

      const txHash = await subject();
      const txReceipt = await web3.eth.getTransactionReceipt(txHash);
      const txn = await web3.eth.getTransaction(txHash);
      const { gasPrice } = txn;
      const { gasUsed } = txReceipt;

      const totalGasInEth = new BigNumber(gasPrice).mul(gasUsed);

      const expectedEthBalance = previousEthBalance.add(subjectEther).sub(totalGasInEth);
      const currentEthBalance =  await web3.eth.getBalance(subjectCaller);

      expect(currentEthBalance).to.bignumber.equal(expectedEthBalance);
    });

    describe('#redeemRebalancingSetIntoEtherTransactionData', async () => {
      beforeAll(async () => {
        customSalt = new BigNumber(1000);
        customExpirationTimeSeconds = new BigNumber(1902951096);
      });

      afterAll(async () => {
        customSalt = undefined;
        customExpirationTimeSeconds = undefined;
      });

      async function subject(): Promise<string> {
        return await rebalancingSetExchangeIssuanceModuleWrapper.redeemRebalancingSetIntoEtherTransactionData(
          subjectRebalancingSetAddress,
          subjectRebalancingSetQuantity,
          subjectExchangeIssuanceData,
          subjectExchangeOrdersData,
          { from: subjectCaller }
        );
      }

      test('issues the rebalancing Set to the caller', async () => {
        const data = await subject();

        expect(data).to.equal('0xe8bf981d00000000000000000000000020a052db6ea52533804b768d7b43fe732a83e67d00000000000' +
                              '000000000000000000000000000000000000000000002540be40000000000000000000000000000000000' +
                              '0000000000000000000000000000008000000000000000000000000000000000000000000000000000000' +
                              '000000002a0000000000000000000000000746d084aed3a220a120162008ed3912c29dbef710000000000' +
                              '0000000000000000000000000000000000000000000002540be4000000000000000000000000000000000' +
                              '0000000000000000000000000000000e00000000000000000000000000000000000000000000000000000' +
                              '0000000001200000000000000000000000000000000000000000000000000000000000000160000000000' +
                              '00000000000000000000000000000000000000000000000000001a0000000000000000000000000000000' +
                              '00000000000000000000000000000001e0000000000000000000000000000000000000000000000000000' +
                              '0000000000001000000000000000000000000000000000000000000000000000000000000000100000000' +
                              '0000000000000000000000000000000000000000000000000000000100000000000000000000000058787' +
                              'e5441be9548440086495ea8583394e3427f00000000000000000000000000000000000000000000000000' +
                              '00000000000001000000000000000000000000000000000000000000000000000000174876e8000000000' +
                              '000000000000000000000000000000000000000000000000000000001000000000000000000000000a9a6' +
                              '5d631f8c8577f543b64b35909030c84676a20000000000000000000000000000000000000000000000000' +
                              '00000000000000100000000000000000000000000000000000000000000000000000002540be400000000' +
                              '0000000000000000000000000000000000000000000000000000000262000000000000000000000000000' +
                              '0000000000000000000000000000000000001000000000000000000000000000000000000000000000000' +
                              '0000000000000001000000000000000000000000000000000000000000000000000000000000020200000' +
                              '0000000000000000000000000000000000000000000000000000000004200000000000000000000000000' +
                              '0000000000000000000000000000174876e8001cd300a45883c8e13b91fbab35c07fff0cbe0e3ba57559f' +
                              '9b114c4e6f44f2dad253e51efcdac6e82bbf4b3b130b9b1b4e759301a1b0019f97d90a2da016f03118e03' +
                              '000000000000000000000000e36ea790bc9d7ab70c55260c66d52b1eca985f84000000000000000000000' +
                              '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '000000000000000000000000000000000000000000000000000000002540be40000000000000000000000' +
                              '0000000000000000000000000000000000174876e80000000000000000000000000000000000000000000' +
                              '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                              '0000000000000000000000000000000000000000000000000000000000716cbab80000000000000000000' +
                              '0000000000000000000000000000000000000000003e8000000000000000000000000a9a65d631f8c8577' +
                              'f543b64b35909030c84676a200000000000000000000000058787e5441be9548440086495ea8583394e34' +
                              '27f000000000000000000000000000000000000000000000000000000000000');
      });

      describe('#redeemRebalancingSetIntoEtherGasEstimate', async () => {
        beforeAll(async () => {
          customSalt = new BigNumber(1000);
          customExpirationTimeSeconds = new BigNumber(1902951096);
        });

        afterAll(async () => {
          customSalt = undefined;
          customExpirationTimeSeconds = undefined;
        });

        async function subject(): Promise<number> {
          return await rebalancingSetExchangeIssuanceModuleWrapper.redeemRebalancingSetIntoEtherGasEstimate(
            subjectRebalancingSetAddress,
            subjectRebalancingSetQuantity,
            subjectExchangeIssuanceData,
            subjectExchangeOrdersData,
            { from: subjectCaller }
          );
        }

        test('issues the rebalancing Set to the caller', async () => {
          const data = await subject();

          expect(data).to.equal(834924);
        });
      });
    });
  });
});
