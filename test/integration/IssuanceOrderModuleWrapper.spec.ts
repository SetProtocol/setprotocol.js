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
import Web3 from 'web3';
import { Core } from 'set-protocol-contracts';
import {
  CoreContract,
  IssuanceOrderModuleContract,
  RebalanceAuctionModuleContract,
  SetTokenContract,
  SetTokenFactoryContract,
  TransferProxyContract,
  VaultContract,
} from 'set-protocol-contracts';

import { ACCOUNTS } from '@src/constants/accounts';
import { CoreWrapper, IssuanceOrderModuleWrapper } from '@src/wrappers';
import { OrderAPI } from '@src/api';
import {
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
} from '@src/constants';
import { Assertions } from '@src/assertions';
import {
  approveForTransferAsync,
  deployBaseContracts,
  deployKyberNetworkWrapperContract,
  deploySetTokenAsync,
  deployTakerWalletWrapperContract,
  deployTokenAsync,
  deployZeroExExchangeWrapperContract,
  tokenDeployedOnSnapshot,
} from '@test/helpers';
import {
  BigNumber,
  ether,
  generateFutureTimestamp,
} from '@src/util';
import { Address, SignedIssuanceOrder, KyberTrade, TakerWalletOrder, ZeroExSignedFillOrder } from '@src/types/common';

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


describe('IssuanceOrderModuleWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let issuanceOrderModule: IssuanceOrderModuleContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;

  let coreWrapper: CoreWrapper;
  let issuanceOrderModuleWrapper: IssuanceOrderModuleWrapper;

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
      setTokenFactory, ,
      rebalanceAuctionModule,
      issuanceOrderModule,
    ] = await deployBaseContracts(web3);

    coreWrapper = new CoreWrapper(
      web3,
      core.address,
      transferProxy.address,
      vault.address,
      rebalanceAuctionModule.address,
    );

    issuanceOrderModuleWrapper = new IssuanceOrderModuleWrapper(
      web3,
      issuanceOrderModule.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('fillOrder', async () => {
    let issuanceOrderMaker: Address;
    let issuanceOrderQuantity: BigNumber;
    let setToken: SetTokenContract;

    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectQuantityToFill: BigNumber;
    let subjectOrdersData: string;
    let subjectCaller: Address;

    beforeEach(async () => {
      const kyberNetworkWrapper = await deployKyberNetworkWrapperContract(
        web3,
        SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
        transferProxy,
        core,
      );



      const assertions = new Assertions(web3);
      assertions.setOrderAssertions(web3, coreWrapper, issuanceOrderModuleWrapper);
      const ordersAPI = new OrderAPI(
        web3,
        assertions,
        issuanceOrderModule.address,
        kyberNetworkWrapper.address,
        vault.address,
      );

      await deployTakerWalletWrapperContract(web3, transferProxy, core);
      await deployZeroExExchangeWrapperContract(
        web3,
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        SetTestUtils.ZERO_EX_TOKEN_ADDRESS,
        transferProxy,
        core,
      );

      const relayerAddress = ACCOUNTS[0].address;
      const zeroExOrderMaker = ACCOUNTS[1].address;
      const issuanceOrderTaker = ACCOUNTS[2].address;
      issuanceOrderMaker = ACCOUNTS[3].address;

      const firstComponent = await deployTokenAsync(web3, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(web3, zeroExOrderMaker);
      const thirdComponent = await tokenDeployedOnSnapshot(web3, SetTestUtils.KYBER_RESERVE_DESTINATION_TOKEN_ADDRESS);
      const makerToken = await tokenDeployedOnSnapshot(web3, SetTestUtils.KYBER_RESERVE_SOURCE_TOKEN_ADDRESS);
      const relayerToken = await deployTokenAsync(web3, issuanceOrderMaker);

      const componentTokens = [firstComponent, secondComponent, thirdComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      await approveForTransferAsync([makerToken, relayerToken], transferProxy.address, issuanceOrderMaker);
      await approveForTransferAsync([firstComponent, relayerToken], transferProxy.address, issuanceOrderTaker);
      await approveForTransferAsync(
        [secondComponent],
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExOrderMaker
      );

      // Create issuance order, submitting ether(30) makerToken for ether(4) of the Set with 3 components
      issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(30);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address, secondComponent.address, thirdComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );

      // Create Taker Wallet transfer for the first component
      const takerWalletOrder = {
        takerTokenAddress: firstComponent.address,
        takerTokenAmount: requredComponentAmounts[0],
      } as TakerWalletOrder;

      // Create 0x order for the second component, using ether(4) makerToken
      const zeroExOrderTakerAssetAmount = ether(4);
      const zeroExOrder: ZeroExSignedFillOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                  // senderAddress
        zeroExOrderMaker,                              // makerAddress
        NULL_ADDRESS,                                  // takerAddress
        ZERO,                                          // makerFee
        ZERO,                                          // takerFee
        requredComponentAmounts[1],                    // makerAssetAmount
        zeroExOrderTakerAssetAmount,                   // takerAssetAmount
        secondComponent.address,                       // makerAssetAddress
        makerToken.address,                            // takerAssetAddress
        SetUtils.generateSalt(),                       // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,         // exchangeAddress
        NULL_ADDRESS,                                  // feeRecipientAddress
        generateFutureTimestamp(10000),                // expirationTimeSeconds
        zeroExOrderTakerAssetAmount,                   // amount of zeroExOrder to fill
      );

      // Create Kyber trade for the third component, using ether(25) makerToken. Conversion rate pre set on snapshot
      const sourceTokenQuantity = ether(25);
      const maxDestinationQuantity = requredComponentAmounts[2];
      const componentTokenDecimals = (await thirdComponent.decimals.callAsync()).toNumber();
      const sourceTokenDecimals = (await makerToken.decimals.callAsync()).toNumber();
      const kyberConversionRatePower = new BigNumber(10).pow(18 + sourceTokenDecimals - componentTokenDecimals);
      const minimumConversionRate = maxDestinationQuantity.div(sourceTokenQuantity)
                                                          .mul(kyberConversionRatePower)
                                                          .round();
      const kyberTrade = {
        destinationToken: thirdComponent.address,
        sourceTokenQuantity: sourceTokenQuantity,
        minimumConversionRate: minimumConversionRate,
        maxDestinationQuantity: maxDestinationQuantity,
      } as KyberTrade;

      subjectOrdersData = await setUtils.generateSerializedOrders([takerWalletOrder, zeroExOrder, kyberTrade]);
      subjectQuantityToFill = issuanceOrderQuantity;
      subjectCaller = issuanceOrderTaker;
    });

    async function subject(): Promise<string> {
      return await issuanceOrderModuleWrapper.fillOrder(
        subjectSignedIssuanceOrder,
        subjectQuantityToFill,
        subjectOrdersData,
        { from: subjectCaller }
      );
    }

    test('issues the set to the order maker', async () => {
      const existingUserSetTokenBalance = await setToken.balanceOf.callAsync(issuanceOrderMaker);

      await subject();

      const expectedUserSetTokenBalance = existingUserSetTokenBalance.add(issuanceOrderQuantity);
      const newUserSetTokenBalance = await setToken.balanceOf.callAsync(issuanceOrderMaker);
      expect(newUserSetTokenBalance).to.eql(expectedUserSetTokenBalance);
    });
  });

  describe('cancelOrder', async () => {
    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectCancelQuantity: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const kyberNetworkWrapper = await deployKyberNetworkWrapperContract(
        web3,
        SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
        transferProxy,
        core,
      );

      const issuanceOrderModuleWrapper = new IssuanceOrderModuleWrapper(
        web3,
        issuanceOrderModule.address,
      );

      const assertions = new Assertions(web3);
      assertions.setOrderAssertions(web3, coreWrapper, issuanceOrderModuleWrapper);
      const ordersAPI = new OrderAPI(
        web3,
        assertions,
        issuanceOrderModule.address,
        kyberNetworkWrapper.address,
        vault.address,
      );

      const issuanceOrderTaker = ACCOUNTS[0].address;
      const issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;
      const zeroExOrderMaker = ACCOUNTS[3].address;

      const firstComponent = await deployTokenAsync(web3, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(web3, zeroExOrderMaker);
      const makerToken = await deployTokenAsync(web3, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(web3, issuanceOrderMaker);

      const componentTokens = [firstComponent, secondComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      const setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      const issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address, secondComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );
      subjectCancelQuantity = issuanceOrderQuantity;
      subjectCaller = issuanceOrderMaker;
    });

    async function subject(): Promise<string> {
      return await issuanceOrderModuleWrapper.cancelOrder(
        subjectSignedIssuanceOrder,
        subjectCancelQuantity,
        { from: subjectCaller }
      );
    }

    test('updates the cancel amount for the order', async () => {
      const { signature, ...issuanceOrder } = subjectSignedIssuanceOrder;
      const orderHash = SetUtils.hashOrderHex(issuanceOrder);
      const existingCancelAmount = await issuanceOrderModule.orderCancels.callAsync(orderHash);

      await subject();

      const expectedCancelAmounts = existingCancelAmount.add(subjectCancelQuantity);
      const newCancelAmount = await issuanceOrderModule.orderCancels.callAsync(orderHash);
      expect(newCancelAmount).to.bignumber.equal(expectedCancelAmounts);
    });
  });
});
