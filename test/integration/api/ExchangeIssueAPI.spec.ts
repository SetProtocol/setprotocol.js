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
  SetTokenContract,
  SetTokenFactoryContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
} from 'set-protocol-contracts';

import ChaiSetup from '@test/helpers/chaiSetup';
import { ACCOUNTS } from '@src/constants/accounts';
import { ExchangeIssuanceAPI } from '@src/api';
import {
  NULL_ADDRESS,
  ZERO,
} from '@src/constants';
import { Assertions } from '@src/assertions';
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
  KyberTrade,
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
  let exchangeIssuanceModule: ExchangeIssuanceModuleContract;

  let exchangeIssuanceAPI: ExchangeIssuanceAPI;

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

    const assertions = new Assertions(web3);
    exchangeIssuanceAPI = new ExchangeIssuanceAPI(
      web3,
      assertions,
      exchangeIssuanceModule.address,
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

    // describe('when a required component is not represented in the orders', async () => {
    //   let underRepresentedComponent: Address;

    //   beforeEach(async () => {
    //      underRepresentedComponent = componentAddresses[1].toLowerCase();

    //      subjectExchangeIssuanceData.receiveTokens.push(underRepresentedComponent);
    //      subjectExchangeIssuanceData.receiveTokenAmounts.push(new BigNumber(1));
    //   });

    //   test('throws', async () => {
    //     return expect(subject()).to.be.rejectedWith(
    //       `Token ${underRepresentedComponent} is unrepresented in the liquidity orders.`
    //     );
    //   });
    // });
  });
});
