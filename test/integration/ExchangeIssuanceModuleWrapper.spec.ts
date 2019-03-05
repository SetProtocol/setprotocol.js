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
  SetTokenContract,
  SetTokenFactoryContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
} from 'set-protocol-contracts';

import { ACCOUNTS } from '@src/constants/accounts';
import { ExchangeIssuanceModuleWrapper } from '@src/wrappers';
import {
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
} from '@src/constants';
import {
  addAuthorizationAsync,
  addModuleAsync,
  approveForTransferAsync,
  deployBaseContracts,
  deployExchangeIssuanceModuleAsync,
  deploySetTokenAsync,
  deployTokensSpecifyingDecimals,
  deployWethMockAsync,
  deployZeroExExchangeWrapperContract,
} from '@test/helpers';
import {
  BigNumber,
} from '@src/util';
import {
  Address,
  ZeroExSignedFillOrder,
} from '@src/types/common';

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


describe('ExchangeIssuanceModuleWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let wrappedEtherMock: WethMockContract;
  let exchangeIssuanceModule: ExchangeIssuanceModuleContract;

  let exchangeIssuanceWrapper: ExchangeIssuanceModuleWrapper;

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

    exchangeIssuanceWrapper = new ExchangeIssuanceModuleWrapper(
      web3,
      exchangeIssuanceModule.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('exchangeIssue', async () => {
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrdersData: Bytes;
    let subjectCaller: Address;

    let zeroExOrderMaker: Address;

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

      // Generate exchange issue data
      exchangeIssuanceSetAddress = baseSetToken.address;
      exchangeIssuanceQuantity = new BigNumber(10 ** 10);
      exchangeIssuancePaymentToken = wrappedEtherMock.address;
      exchangeIssuancePaymentTokenAmount = new BigNumber(10 ** 10);
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
        NULL_ADDRESS,                                    // senderAddress
        zeroExOrderMaker,                                // makerAddress
        NULL_ADDRESS,                                    // takerAddress
        ZERO,                                            // makerFee
        ZERO,                                            // takerFee
        subjectExchangeIssuanceData.receiveTokenAmounts[0], // makerAssetAmount
        exchangeIssuancePaymentTokenAmount,                 // takerAssetAmount
        exchangeIssuanceRequiredComponents[0],              // makerAssetAddress
        exchangeIssuancePaymentToken,                       // takerAssetAddress
        SetUtils.generateSalt(),                         // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,           // exchangeAddress
        NULL_ADDRESS,                                    // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),           // expirationTimeSeconds
        exchangeIssuancePaymentTokenAmount,                 // amount of zeroExOrder to fill
      );

      subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder]);

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
      return await exchangeIssuanceWrapper.exchangeIssue(
        subjectExchangeIssuanceData,
        subjectExchangeOrdersData,
        { from: subjectCaller }
      );
    }

    test('issues the Set to the caller', async () => {
      const previousSetTokenBalance = await baseSetToken.balanceOf.callAsync(subjectCaller);
      const expectedSetTokenBalance = previousSetTokenBalance.add(exchangeIssuanceQuantity);

      await subject();

      const currentRBSetTokenBalance = await baseSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });
  });

  describe('exchangeRedeem', async () => {
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrdersData: Bytes;
    let subjectCaller: Address;

    let zeroExOrderMaker: Address;

    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;

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

      // Create component token (owned by caller)
      const [baseSetComponent] = await deployTokensSpecifyingDecimals(1, [18], web3, subjectCaller);

      zeroExOrderMaker = ACCOUNTS[2].address;

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

      // Generate exchange issuance data
      exchangeIssuanceSetAddress = baseSetToken.address;
      exchangeIssuanceQuantity = new BigNumber(10 ** 10);
      exchangeIssuanceSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX];
      exchangeIssuanceSendTokens = [baseSetComponent.address];
      exchangeIssuanceSendTokenAmounts = componentUnits.map(
        unit => unit.mul(exchangeIssuanceQuantity).div(baseSetNaturalUnit)
      );
      exchangeIssuanceReceiveTokens = [wrappedEtherMock.address];
      exchangeIssuanceReceiveTokenAmounts = [new BigNumber(10 ** 10)];

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
        subjectExchangeIssuanceData.receiveTokenAmounts[0], // makerAssetAmount
        exchangeIssuanceSendTokenAmounts[0],                 // takerAssetAmount
        exchangeIssuanceReceiveTokens[0],              // makerAssetAddress
        exchangeIssuanceSendTokens[0],                       // takerAssetAddress
        SetUtils.generateSalt(),                         // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,           // exchangeAddress
        NULL_ADDRESS,                                    // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),           // expirationTimeSeconds
        exchangeIssuanceSendTokenAmounts[0],                 // amount of zeroExOrder to fill
      );

      subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder]);

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
        [baseSetComponent],
        transferProxy.address,
        subjectCaller
      );

      await core.issue.sendTransactionAsync(
        baseSetToken.address,
        exchangeIssuanceQuantity,
        { from: subjectCaller }
      );
    });

    async function subject(): Promise<string> {
      return await exchangeIssuanceWrapper.exchangeRedeem(
        subjectExchangeIssuanceData,
        subjectExchangeOrdersData,
        { from: subjectCaller }
      );
    }

    test('redeems the Set', async () => {
      const previousSetTokenBalance = await baseSetToken.balanceOf.callAsync(subjectCaller);
      const expectedSetTokenBalance = previousSetTokenBalance.sub(exchangeIssuanceQuantity);

      await subject();

      const currentRBSetTokenBalance = await baseSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });

    test('increments the correct amount of Sent token', async () => {
      const existingBalance = await wrappedEtherMock.balanceOf.callAsync(subjectCaller);

      await subject();

      const expectedNewBalance = existingBalance.add(exchangeIssuanceReceiveTokenAmounts[0]);
      const newBalance = await wrappedEtherMock.balanceOf.callAsync(subjectCaller);

      await expect(newBalance).to.be.bignumber.equal(expectedNewBalance);
    });
  });
});
