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
import Web3 from 'web3';
import {
  CoreContract,
  RebalancingSetIssuanceModuleContract,
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
import { RebalancingSetIssuanceAPI } from '@src/api';
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
  deployRebalancingSetIssuanceModuleAsync,
  deploySetTokenAsync,
  deployTokensSpecifyingDecimals,
  deployWethMockAsync,
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


describe('RebalancingSetIssuanceAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let wrappedEtherMock: WethMockContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let rebalancingSetIssuanceModule: RebalancingSetIssuanceModuleContract;

  let config: SetProtocolConfig;
  let rebalancingSetIssuanceAPI: RebalancingSetIssuanceAPI;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy,
      vault,
      setTokenFactory,
      rebalancingSetTokenFactory,
    ] = await deployBaseContracts(web3);

    wrappedEtherMock = await deployWethMockAsync(web3, NULL_ADDRESS, ZERO);

    rebalancingSetIssuanceModule = await deployRebalancingSetIssuanceModuleAsync(
      web3,
      core,
      vault,
      transferProxy,
      wrappedEtherMock,      
    );
    await addModuleAsync(core, rebalancingSetIssuanceModule.address);

    config = {
      coreAddress: core.address,
      transferProxyAddress: transferProxy.address,
      vaultAddress: vault.address,
      setTokenFactoryAddress: setTokenFactory.address,
      exchangeIssuanceModuleAddress: NULL_ADDRESS,
      kyberNetworkWrapperAddress: NULL_ADDRESS,
      rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
      rebalanceAuctionModuleAddress: NULL_ADDRESS,
      rebalancingTokenIssuanceModule: NULL_ADDRESS,
      rebalancingSetExchangeIssuanceModule: NULL_ADDRESS,
      rebalancingSetIssuanceModule: rebalancingSetIssuanceModule.address,
      wrappedEtherAddress: wrappedEtherMock.address,
    } as SetProtocolConfig;

    const assertions = new Assertions(web3);
    rebalancingSetIssuanceAPI = new RebalancingSetIssuanceAPI(web3, assertions, config);
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
      return await rebalancingSetIssuanceAPI.issueRebalancingSet(
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
});
