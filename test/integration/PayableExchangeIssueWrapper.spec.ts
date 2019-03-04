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
  PayableExchangeIssuanceContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { PayableExchangeIssuanceWrapper } from '@src/wrappers';
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
  deployPayableExchangeIssuanceAsync,
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


describe('PayableExchangeIssuanceWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let payableExchangeIssuance: PayableExchangeIssuanceContract;
  let wrappedEtherMock: WethMockContract;
  let exchangeIssuanceModule: ExchangeIssuanceModuleContract;

  let payableExchangeIssuanceWrapper: PayableExchangeIssuanceWrapper;

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
    payableExchangeIssuance = await deployPayableExchangeIssuanceAsync(
      web3,
      core,
      transferProxy,
      exchangeIssuanceModule,
      wrappedEtherMock,
    );

    payableExchangeIssuanceWrapper = new PayableExchangeIssuanceWrapper(
      web3,
      payableExchangeIssuance.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('issueRebalancingSetWithEther', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrdersData: Bytes;
    let subjectCaller: Address;
    let subjectEther: BigNumber;

    let zeroExOrderMaker: Address;

    let rebalancingSetQuantity: BigNumber;

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
      subjectRebalancingSetAddress = rebalancingSetToken.address;
      rebalancingSetQuantity = exchangeIssuanceQuantity
        .mul(DEFAULT_REBALANCING_NATURAL_UNIT)
        .div(rebalancingUnitShares);

      subjectCaller = ACCOUNTS[1].address;
    });

    async function subject(): Promise<string> {
      return await payableExchangeIssuanceWrapper.issueRebalancingSetWithEther(
        subjectRebalancingSetAddress,
        subjectExchangeIssuanceData,
        subjectExchangeOrdersData,
        { from: subjectCaller, value: subjectEther.toString() }
      );
    }

    test('issues the rebalancing Set to the caller', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.add(rebalancingSetQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });
  });
});
