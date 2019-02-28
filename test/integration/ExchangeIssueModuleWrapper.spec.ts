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
import { Bytes, ExchangeIssueParams } from 'set-protocol-utils';
import Web3 from 'web3';
import { Core } from 'set-protocol-contracts';
import {
  CoreContract,
  ExchangeIssueModuleContract,
  SetTokenContract,
  SetTokenFactoryContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
} from 'set-protocol-contracts';

import { ACCOUNTS } from '@src/constants/accounts';
import { ExchangeIssueModuleWrapper } from '@src/wrappers';
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
  deployExchangeIssueModuleAsync,
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


describe('ExchangeIssueModuleWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let wrappedEtherMock: WethMockContract;
  let exchangeIssueModule: ExchangeIssueModuleContract;

  let exchangeIssueWrapper: ExchangeIssueModuleWrapper;

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

    exchangeIssueModule = await deployExchangeIssueModuleAsync(web3, core, vault);
    await addModuleAsync(core, exchangeIssueModule.address);
    await addAuthorizationAsync(transferProxy, exchangeIssueModule.address);
    await addAuthorizationAsync(vault, exchangeIssueModule.address);

    await deployZeroExExchangeWrapperContract(
      web3,
      SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
      SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
      SetTestUtils.ZERO_EX_TOKEN_ADDRESS,
      transferProxy,
      core,
    );

    wrappedEtherMock = await deployWethMockAsync(web3, NULL_ADDRESS, ZERO);

    exchangeIssueWrapper = new ExchangeIssueModuleWrapper(
      web3,
      exchangeIssueModule.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('exchangeIssue', async () => {
    let subjectExchangeIssueData: ExchangeIssueParams;
    let subjectExchangeOrdersData: Bytes;
    let subjectCaller: Address;

    let zeroExOrderMaker: Address;

    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;

    let exchangeIssueSetAddress: Address;
    let exchangeIssueQuantity: BigNumber;
    let exchangeIssuePaymentToken: Address;
    let exchangeIssuePaymentTokenAmount: BigNumber;
    let exchangeIssueRequiredComponents: Address[];
    let exchangeIssueRequiredComponentAmounts: BigNumber[];

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
      exchangeIssueSetAddress = baseSetToken.address;
      exchangeIssueQuantity = new BigNumber(10 ** 10);
      exchangeIssuePaymentToken = wrappedEtherMock.address;
      exchangeIssuePaymentTokenAmount = new BigNumber(10 ** 10);
      exchangeIssueRequiredComponents = componentAddresses;
      exchangeIssueRequiredComponentAmounts = componentUnits.map(
        unit => unit.mul(exchangeIssueQuantity).div(baseSetNaturalUnit)
      );

      subjectExchangeIssueData = {
        setAddress: exchangeIssueSetAddress,
        sentTokenExchanges: [SetUtils.EXCHANGES.ZERO_EX],
        sentTokens: [exchangeIssuePaymentToken],
        sentTokenAmounts: [exchangeIssuePaymentTokenAmount],
        quantity: exchangeIssueQuantity,
        receiveTokens: exchangeIssueRequiredComponents,
        receiveTokenAmounts: exchangeIssueRequiredComponentAmounts,
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
        subjectExchangeIssueData.receiveTokenAmounts[0], // makerAssetAmount
        exchangeIssuePaymentTokenAmount,                 // takerAssetAmount
        exchangeIssueRequiredComponents[0],              // makerAssetAddress
        exchangeIssuePaymentToken,                       // takerAssetAddress
        SetUtils.generateSalt(),                         // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,           // exchangeAddress
        NULL_ADDRESS,                                    // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),           // expirationTimeSeconds
        exchangeIssuePaymentTokenAmount,                 // amount of zeroExOrder to fill
      );

      subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder]);

      // Subject caller needs to wrap ether
      await wrappedEtherMock.deposit.sendTransactionAsync(
        { from: subjectCaller, value: exchangeIssuePaymentTokenAmount.toString() }
      );

      await wrappedEtherMock.approve.sendTransactionAsync(
        transferProxy.address,
        exchangeIssuePaymentTokenAmount,
        { from: subjectCaller }
      );
    });

    async function subject(): Promise<string> {
      return await exchangeIssueWrapper.exchangeIssue(
        subjectExchangeIssueData,
        subjectExchangeOrdersData,
        { from: subjectCaller }
      );
    }

    test('issues the Set to the caller', async () => {
      const previousSetTokenBalance = await baseSetToken.balanceOf.callAsync(subjectCaller);
      const expectedSetTokenBalance = previousSetTokenBalance.add(exchangeIssueQuantity);

      await subject();

      const currentRBSetTokenBalance = await baseSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });
  });
});
