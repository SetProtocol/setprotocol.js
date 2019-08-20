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
  StandardTokenMockContract,
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
  DEFAULT_GAS_LIMIT,
  DEFAULT_REBALANCING_NATURAL_UNIT,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
} from '@src/constants';
import {
  addAuthorizationAsync,
  addModuleAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployExchangeIssuanceModuleAsync,
  deployKyberNetworkWrapperContract,
  deployRebalancingSetExchangeIssuanceModuleAsync,
  deploySetTokenAsync,
  deployTokenSpecifyingDecimalAsync,
  deployWethMockAsync,
  deployZeroExExchangeWrapperContract,
  getGasUsageInEth,
  transferTokenAsync,
} from '@test/helpers';
import { BigNumber, ether } from '@src/util';
import { Address, ZeroExSignedFillOrder, KyberTrade } from '@src/types/common';

import { KyberNetworkHelper } from '@test/helpers/kyberNetworkHelper';

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

const kyberNetworkHelper = new KyberNetworkHelper();

const ownerAccount = DEFAULT_ACCOUNT;
const kyberReserveOperator = ACCOUNTS[1].address;
const functionCaller = ACCOUNTS[2].address;
const zeroExOrderMaker = ACCOUNTS[3].address;

describe('RebalancingSetExchangeIssuanceModuleWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let rebalancingSetExchangeIssuanceModule: RebalancingSetExchangeIssuanceModuleContract;
  let weth: WethMockContract;
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

    await deployKyberNetworkWrapperContract(
      web3,
      kyberNetworkHelper.kyberNetworkProxy,
      transferProxy,
      core,
    );

    await kyberNetworkHelper.setup();
    await kyberNetworkHelper.fundReserveWithEth(
      kyberReserveOperator,
      ether(90),
    );

    weth = await deployWethMockAsync(web3, NULL_ADDRESS, ZERO);
    rebalancingSetExchangeIssuanceModule = await deployRebalancingSetExchangeIssuanceModuleAsync(
      web3,
      core,
      transferProxy,
      exchangeIssuanceModule,
      weth,
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
    let subjectExchangeIssuanceParams: ExchangeIssuanceParams;
    let subjectExchangeOrdersData: Bytes;
    let subjectKeepChangeInVault: boolean;
    let subjectEtherValue: string;
    let subjectCaller: Address;

    // ----------------------------------------------------------------------
    // Component and Rebalancing Set
    // ----------------------------------------------------------------------
    let baseSetComponent: StandardTokenMockContract;
    let baseSetComponent2: StandardTokenMockContract;
    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let rebalancingUnitShares: BigNumber;


    // ----------------------------------------------------------------------
    // Issuance Details
    // ----------------------------------------------------------------------
    let rebalancingSetIssueQuantity: BigNumber;
    let baseSetIssueQuantity: BigNumber;

    let wethRequiredToIssueBaseSet: BigNumber;

    // ----------------------------------------------------------------------
    // Payment / Send Token Details
    // ----------------------------------------------------------------------
    let totalEther: BigNumber;

    let zeroExSendTokenQuantity: BigNumber;
    let kyberSendTokenQuantity: BigNumber;
    let exchangeIssuanceSendTokenQuantity: BigNumber;

    // ----------------------------------------------------------------------
    // Exchange Issuance Variables
    // ----------------------------------------------------------------------
    let exchangeIssueSetAddress: Address;
    let exchangeIssueQuantity: BigNumber;
    let exchangeIssueSendTokenExchangeIds: BigNumber[];
    let exchangeIssueSendTokens: Address[];
    let exchangeIssueSendTokenAmounts: BigNumber[];
    let exchangeIssueReceiveTokens: Address[];
    let exchangeIssueReceiveTokenAmounts: BigNumber[];

    // ----------------------------------------------------------------------
    // 0x Order Variables
    // ----------------------------------------------------------------------
    let zeroExOrder: ZeroExSignedFillOrder;
    let zeroExMakerAssetAmount: BigNumber;
    let zeroExTakerAssetAmount: BigNumber;

    // ----------------------------------------------------------------------
    // Kyber Trade Variables
    // ----------------------------------------------------------------------
    let kyberTrade: KyberTrade;
    let kyberConversionRatePower: BigNumber;

    beforeEach(async () => {

      // ----------------------------------------------------------------------
      // Component and Rebalancing Set Deployment
      // ----------------------------------------------------------------------

      // Create non-wrapped Ether component tokens
      baseSetComponent = await deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount);
      baseSetComponent2 = await deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount);

      // Create the Set (default is 3 components)
      const componentAddresses = [
        baseSetComponent.address, baseSetComponent2.address, weth.address,
      ];
      const componentUnits = [
        new BigNumber(10 ** 18), new BigNumber(10 ** 18), new BigNumber(10 ** 18),
      ];
      baseSetNaturalUnit = new BigNumber(10 ** 17);
      baseSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        baseSetNaturalUnit,
      );

      // Create the Rebalancing Set
      rebalancingUnitShares = new BigNumber(10 ** 18);
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        ownerAccount,
        baseSetToken.address,
        ONE_DAY_IN_SECONDS,
        rebalancingUnitShares,
      );

      // ----------------------------------------------------------------------
      // Issuance Details
      // ----------------------------------------------------------------------

      baseSetIssueQuantity = new BigNumber(10 ** 18);

      const impliedRebalancingSetQuantityFromBaseSet = baseSetIssueQuantity
        .mul(DEFAULT_REBALANCING_NATURAL_UNIT)
        .div(rebalancingUnitShares);

      rebalancingSetIssueQuantity = impliedRebalancingSetQuantityFromBaseSet;

      wethRequiredToIssueBaseSet =
        baseSetIssueQuantity.mul(componentUnits[2]).div(baseSetNaturalUnit);

      // ----------------------------------------------------------------------
      // Payment / Send Token Details
      // ----------------------------------------------------------------------

      kyberSendTokenQuantity = new BigNumber(10 ** 18);
      zeroExSendTokenQuantity = new BigNumber(10 ** 18);

      exchangeIssuanceSendTokenQuantity =
        kyberSendTokenQuantity.plus(zeroExSendTokenQuantity);

      totalEther = exchangeIssuanceSendTokenQuantity.plus(wethRequiredToIssueBaseSet);

      // ----------------------------------------------------------------------
      // Exchange Issuance Set up
      // ----------------------------------------------------------------------

      // Generate exchange issue data
      exchangeIssueSetAddress = baseSetToken.address;
      exchangeIssueQuantity = baseSetIssueQuantity;
      exchangeIssueSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX, SetUtils.EXCHANGES.KYBER];
      exchangeIssueSendTokens = [weth.address, weth.address];
      exchangeIssueSendTokenAmounts = [zeroExSendTokenQuantity, kyberSendTokenQuantity];

      const zeroExReceiveTokenAmount = componentUnits[0].mul(exchangeIssueQuantity).div(baseSetNaturalUnit);
      const kyberReceiveTokenAmount = componentUnits[1].mul(exchangeIssueQuantity).div(baseSetNaturalUnit);

      exchangeIssueReceiveTokens = [componentAddresses[0], componentAddresses[1]];
      exchangeIssueReceiveTokenAmounts = [
        zeroExReceiveTokenAmount,
        kyberReceiveTokenAmount,
      ];

      const exchangeIssuanceParams = {
        setAddress:             exchangeIssueSetAddress,
        sendTokenExchangeIds:   exchangeIssueSendTokenExchangeIds,
        sendTokens:             exchangeIssueSendTokens,
        sendTokenAmounts:       exchangeIssueSendTokenAmounts,
        quantity:               exchangeIssueQuantity,
        receiveTokens:           exchangeIssueReceiveTokens,
        receiveTokenAmounts:     exchangeIssueReceiveTokenAmounts,
      };

      // ----------------------------------------------------------------------
      // 0x Order Set up
      // ----------------------------------------------------------------------

      const makerAsset = exchangeIssueReceiveTokens[0];
      const takerAsset = exchangeIssueSendTokens[0];

      zeroExMakerAssetAmount = exchangeIssueReceiveTokenAmounts[0];
      zeroExTakerAssetAmount = exchangeIssueSendTokenAmounts[0];

      zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                                         // senderAddress
        zeroExOrderMaker,                                                     // makerAddress
        NULL_ADDRESS,                                                         // takerAddress
        ZERO,                                                                 // makerFee
        ZERO,                                                                 // takerFee
        zeroExMakerAssetAmount,                                               // makerAssetAmount
        zeroExTakerAssetAmount,                                               // takerAssetAmount
        makerAsset,                                                           // makerAssetAddress
        takerAsset,                                                           // takerAssetAddress
        SetUtils.generateSalt(),                                              // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,                                // exchangeAddress
        NULL_ADDRESS,                                                         // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),                                // expirationTimeSeconds
        zeroExTakerAssetAmount,                                               // amount of zeroExOrder to fill
      );

      await approveForTransferAsync(
        [baseSetComponent],
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExOrderMaker
      );

      // Fund zero Ex Order Maker
      await transferTokenAsync(
        baseSetComponent,
        zeroExOrderMaker,
        zeroExMakerAssetAmount,
        ownerAccount,
      );

      // ----------------------------------------------------------------------
      // Kyber Trade Set up
      // ----------------------------------------------------------------------
      const maxDestinationQuantity = exchangeIssueReceiveTokenAmounts[1];
      const componentTokenDecimals = (await baseSetComponent2.decimals.callAsync()).toNumber();
      const sourceTokenDecimals = (await weth.decimals.callAsync()).toNumber();
      kyberConversionRatePower = new BigNumber(10).pow(18 + sourceTokenDecimals - componentTokenDecimals);
      const minimumConversionRate = maxDestinationQuantity.div(kyberSendTokenQuantity)
                                                          .mul(kyberConversionRatePower)
                                                          .round();

      kyberTrade = {
        sourceToken: weth.address,
        destinationToken: baseSetComponent2.address,
        sourceTokenQuantity: kyberSendTokenQuantity,
        minimumConversionRate: minimumConversionRate,
        maxDestinationQuantity: maxDestinationQuantity,
      } as KyberTrade;

      await kyberNetworkHelper.approveToReserve(
        baseSetComponent2,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        kyberReserveOperator,
      );

      await kyberNetworkHelper.setConversionRates(
        weth.address,
        baseSetComponent2.address,
        kyberSendTokenQuantity,
        maxDestinationQuantity,
      );

      // Fund Kyber Reserve Operator
      await transferTokenAsync(
        baseSetComponent2,
        kyberReserveOperator,
        kyberTrade.maxDestinationQuantity,
        ownerAccount,
      );

      // ----------------------------------------------------------------------
      // Subject Parameter Definitions
      // ----------------------------------------------------------------------

      subjectRebalancingSetAddress = rebalancingSetToken.address;
      subjectRebalancingSetQuantity = rebalancingSetIssueQuantity;
      subjectExchangeIssuanceParams = exchangeIssuanceParams;
      subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder, kyberTrade]);
      subjectKeepChangeInVault = false;
      subjectCaller = functionCaller;
      subjectEtherValue = totalEther.toString();
    });

    async function subject(): Promise<string> {
      return rebalancingSetExchangeIssuanceModuleWrapper.issueRebalancingSetWithEther(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectExchangeIssuanceParams,
        subjectExchangeOrdersData,
        subjectKeepChangeInVault,
        { from: subjectCaller, gas: DEFAULT_GAS_LIMIT, value: subjectEtherValue },
      );
    }

    it('issues the rebalancing Set to the caller', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.add(rebalancingSetIssueQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });

    it('reduces the callers Ether balance by the expected amount', async () => {
      const previousEthBalance: BigNumber = new BigNumber(await web3.eth.getBalance(subjectCaller));

      const txHash = await subject();
      const totalGasInEth = await getGasUsageInEth(web3, txHash);
      const expectedEthBalance = previousEthBalance
                                  .sub(exchangeIssuanceSendTokenQuantity)
                                  .sub(wethRequiredToIssueBaseSet)
                                  .sub(totalGasInEth);

      const currentEthBalance = await web3.eth.getBalance(subjectCaller);
      expect(expectedEthBalance).to.bignumber.equal(currentEthBalance);
    });
  });

  describe('#issueRebalancingSetWithERC20', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectPaymentTokenAddress: Address;
    let subjectPaymentTokenQuantity: BigNumber;
    let subjectExchangeIssuanceParams: ExchangeIssuanceParams;
    let subjectExchangeOrdersData: Bytes;
    let subjectKeepChangeInVault: boolean;
    let subjectCaller: Address;

    // ----------------------------------------------------------------------
    // Component and Rebalancing Set
    // ----------------------------------------------------------------------
    let baseSetComponent: StandardTokenMockContract;
    let baseSetComponent2: StandardTokenMockContract;
    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let rebalancingUnitShares: BigNumber;


    // ----------------------------------------------------------------------
    // Issuance Details
    // ----------------------------------------------------------------------
    let rebalancingSetIssueQuantity: BigNumber;
    let baseSetIssueQuantity: BigNumber;

    let wethRequiredToIssueBaseSet: BigNumber;

    // ----------------------------------------------------------------------
    // Payment / Send Token Details
    // ----------------------------------------------------------------------
    let totalWrappedEther: BigNumber;

    let zeroExSendTokenQuantity: BigNumber;
    let kyberSendTokenQuantity: BigNumber;
    let exchangeIssuanceSendTokenQuantity: BigNumber;

    // ----------------------------------------------------------------------
    // Exchange Issuance Variables
    // ----------------------------------------------------------------------
    let exchangeIssueSetAddress: Address;
    let exchangeIssueQuantity: BigNumber;
    let exchangeIssueSendTokenExchangeIds: BigNumber[];
    let exchangeIssueSendTokens: Address[];
    let exchangeIssueSendTokenAmounts: BigNumber[];
    let exchangeIssueReceiveTokens: Address[];
    let exchangeIssueReceiveTokenAmounts: BigNumber[];

    // ----------------------------------------------------------------------
    // 0x Order Variables
    // ----------------------------------------------------------------------
    let zeroExOrder: ZeroExSignedFillOrder;
    let zeroExMakerAssetAmount: BigNumber;
    let zeroExTakerAssetAmount: BigNumber;

    // ----------------------------------------------------------------------
    // Kyber Trade Variables
    // ----------------------------------------------------------------------
    let kyberTrade: KyberTrade;
    let kyberConversionRatePower: BigNumber;

    beforeEach(async () => {

      // ----------------------------------------------------------------------
      // Component and Rebalancing Set Deployment
      // ----------------------------------------------------------------------

      // Create non-wrapped Ether component tokens
      baseSetComponent = await deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount);
      baseSetComponent2 = await deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount);

      // Create the Set (default is 3 components)
      const componentAddresses = [
        baseSetComponent.address, baseSetComponent2.address, weth.address,
      ];
      const componentUnits = [
        new BigNumber(10 ** 18), new BigNumber(10 ** 18), new BigNumber(10 ** 18),
      ];
      baseSetNaturalUnit = new BigNumber(10 ** 17);
      baseSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        baseSetNaturalUnit,
      );

      // Create the Rebalancing Set
      rebalancingUnitShares = new BigNumber(10 ** 18);
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        ownerAccount,
        baseSetToken.address,
        ONE_DAY_IN_SECONDS,
        rebalancingUnitShares,
      );

      // ----------------------------------------------------------------------
      // Issuance Details
      // ----------------------------------------------------------------------

      baseSetIssueQuantity = new BigNumber(10 ** 18);

      const impliedRebalancingSetQuantityFromBaseSet = baseSetIssueQuantity
        .mul(DEFAULT_REBALANCING_NATURAL_UNIT)
        .div(rebalancingUnitShares);

      rebalancingSetIssueQuantity = impliedRebalancingSetQuantityFromBaseSet;

      wethRequiredToIssueBaseSet =
        baseSetIssueQuantity.mul(componentUnits[2]).div(baseSetNaturalUnit);

      // ----------------------------------------------------------------------
      // Payment / Send Token Details
      // ----------------------------------------------------------------------

      kyberSendTokenQuantity = new BigNumber(10 ** 18);
      zeroExSendTokenQuantity = new BigNumber(10 ** 18);

      exchangeIssuanceSendTokenQuantity =
        kyberSendTokenQuantity.plus(zeroExSendTokenQuantity);

      totalWrappedEther = exchangeIssuanceSendTokenQuantity.plus(wethRequiredToIssueBaseSet);

      // ----------------------------------------------------------------------
      // Exchange Issuance Set up
      // ----------------------------------------------------------------------

      // Generate exchange issue data
      exchangeIssueSetAddress = baseSetToken.address;
      exchangeIssueQuantity = baseSetIssueQuantity;
      exchangeIssueSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX, SetUtils.EXCHANGES.KYBER];
      exchangeIssueSendTokens = [weth.address, weth.address];
      exchangeIssueSendTokenAmounts = [zeroExSendTokenQuantity, kyberSendTokenQuantity];

      const zeroExReceiveTokenAmount = componentUnits[0].mul(exchangeIssueQuantity).div(baseSetNaturalUnit);
      const kyberReceiveTokenAmount = componentUnits[1].mul(exchangeIssueQuantity).div(baseSetNaturalUnit);

      exchangeIssueReceiveTokens = [componentAddresses[0], componentAddresses[1]];
      exchangeIssueReceiveTokenAmounts = [
        zeroExReceiveTokenAmount,
        kyberReceiveTokenAmount,
      ];

      const exchangeIssuanceParams = {
        setAddress:             exchangeIssueSetAddress,
        sendTokenExchangeIds:   exchangeIssueSendTokenExchangeIds,
        sendTokens:             exchangeIssueSendTokens,
        sendTokenAmounts:       exchangeIssueSendTokenAmounts,
        quantity:               exchangeIssueQuantity,
        receiveTokens:           exchangeIssueReceiveTokens,
        receiveTokenAmounts:     exchangeIssueReceiveTokenAmounts,
      };

      // ----------------------------------------------------------------------
      // 0x Order Set up
      // ----------------------------------------------------------------------

      const makerAsset = exchangeIssueReceiveTokens[0];
      const takerAsset = exchangeIssueSendTokens[0];

      zeroExMakerAssetAmount = exchangeIssueReceiveTokenAmounts[0];
      zeroExTakerAssetAmount = exchangeIssueSendTokenAmounts[0];

      zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                                         // senderAddress
        zeroExOrderMaker,                                                     // makerAddress
        NULL_ADDRESS,                                                         // takerAddress
        ZERO,                                                                 // makerFee
        ZERO,                                                                 // takerFee
        zeroExMakerAssetAmount,                                               // makerAssetAmount
        zeroExTakerAssetAmount,                                               // takerAssetAmount
        makerAsset,                                                           // makerAssetAddress
        takerAsset,                                                           // takerAssetAddress
        SetUtils.generateSalt(),                                              // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,                                // exchangeAddress
        NULL_ADDRESS,                                                         // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),                                // expirationTimeSeconds
        zeroExTakerAssetAmount,                                               // amount of zeroExOrder to fill
      );

      await approveForTransferAsync(
        [baseSetComponent],
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExOrderMaker
      );

      // Fund zero Ex Order Maker
      await transferTokenAsync(
        baseSetComponent,
        zeroExOrderMaker,
        zeroExMakerAssetAmount,
        ownerAccount,
      );

      // ----------------------------------------------------------------------
      // Kyber Trade Set up
      // ----------------------------------------------------------------------
      const maxDestinationQuantity = exchangeIssueReceiveTokenAmounts[1];
      const componentTokenDecimals = (await baseSetComponent2.decimals.callAsync()).toNumber();
      const sourceTokenDecimals = (await weth.decimals.callAsync()).toNumber();
      kyberConversionRatePower = new BigNumber(10).pow(18 + sourceTokenDecimals - componentTokenDecimals);
      const minimumConversionRate = maxDestinationQuantity.div(kyberSendTokenQuantity)
                                                          .mul(kyberConversionRatePower)
                                                          .round();

      kyberTrade = {
        sourceToken: weth.address,
        destinationToken: baseSetComponent2.address,
        sourceTokenQuantity: kyberSendTokenQuantity,
        minimumConversionRate: minimumConversionRate,
        maxDestinationQuantity: maxDestinationQuantity,
      } as KyberTrade;

      await kyberNetworkHelper.approveToReserve(
        baseSetComponent2,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        kyberReserveOperator,
      );

      await kyberNetworkHelper.setConversionRates(
        weth.address,
        baseSetComponent2.address,
        kyberSendTokenQuantity,
        maxDestinationQuantity,
      );

      // Fund Kyber Reserve Operator
      await transferTokenAsync(
        baseSetComponent2,
        kyberReserveOperator,
        kyberTrade.maxDestinationQuantity,
        ownerAccount,
      );

      // ----------------------------------------------------------------------
      // Subject Parameter Definitions
      // ----------------------------------------------------------------------

      subjectRebalancingSetAddress = rebalancingSetToken.address;
      subjectRebalancingSetQuantity = rebalancingSetIssueQuantity;
      subjectPaymentTokenAddress = weth.address;
      subjectPaymentTokenQuantity = totalWrappedEther;
      subjectExchangeIssuanceParams = exchangeIssuanceParams;
      subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder, kyberTrade]);
      subjectKeepChangeInVault = false;
      subjectCaller = functionCaller;

      // ----------------------------------------------------------------------
      // Wrap eth and deposit
      // ----------------------------------------------------------------------
      await weth.deposit.sendTransactionAsync({
        from: functionCaller,
        gas: DEFAULT_GAS_LIMIT,
        value: subjectPaymentTokenQuantity.toString(),
      });

      await approveForTransferAsync(
        [weth],
        transferProxy.address,
        functionCaller,
      );
    });

    async function subject(): Promise<string> {
      return rebalancingSetExchangeIssuanceModuleWrapper.issueRebalancingSetWithERC20(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectPaymentTokenAddress,
        subjectPaymentTokenQuantity,
        subjectExchangeIssuanceParams,
        subjectExchangeOrdersData,
        subjectKeepChangeInVault,
        { from: subjectCaller, gas: DEFAULT_GAS_LIMIT, value: subjectEtherValue },
      );
    }

    it('issues the rebalancing Set to the caller', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.add(rebalancingSetIssueQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });

    it('uses an expected amount of wrapped Eth', async () => {
      const previousWethBalance: BigNumber = await weth.balanceOf.callAsync(subjectCaller);

      await subject();
      const expectedWethBalance = previousWethBalance.sub(subjectPaymentTokenQuantity);

      const currentWethBalance = await weth.balanceOf.callAsync(subjectCaller);
      expect(expectedWethBalance).to.bignumber.equal(currentWethBalance);
    });
  });

  describe('#redeemRebalancingSetIntoEther', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectExchangeIssuanceParams: ExchangeIssuanceParams;
    let subjectExchangeOrdersData: Bytes;
    let subjectKeepChangeInVault: boolean;
    let subjectCaller: Address;



    // ----------------------------------------------------------------------
    // Component and Rebalancing Set
    // ----------------------------------------------------------------------
    let baseSetComponent: StandardTokenMockContract;
    let baseSetComponent2: StandardTokenMockContract;
    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let rebalancingUnitShares: BigNumber;

    // ----------------------------------------------------------------------
    // Issuance Details
    // ----------------------------------------------------------------------
    let rebalancingSetRedeemQuantity: BigNumber;
    let baseSetRedeemQuantity: BigNumber;

    // ----------------------------------------------------------------------
    // Payment / Send Token Details
    // ----------------------------------------------------------------------
    let wethRequiredToIssueBaseSet: BigNumber;

    let zeroExReceiveTokenQuantity: BigNumber;
    let kyberReceiveTokenQuantity: BigNumber;
    let exchangeIssuanceReceiveTokenQuantity: BigNumber;

    let zeroExSendTokenQuantity: BigNumber;
    let kyberSendTokenQuantity: BigNumber;

    let totalEtherToReceive: BigNumber;


    // ----------------------------------------------------------------------
    // Exchange Issuance Variables
    // ----------------------------------------------------------------------
    let exchangeRedeemSetAddress: Address;
    let exchangeRedeemQuantity: BigNumber;
    let exchangeRedeemSendTokenExchangeIds: BigNumber[];
    let exchangeRedeemSendTokens: Address[];
    let exchangeRedeemSendTokenAmounts: BigNumber[];
    let exchangeRedeemReceiveTokens: Address[];
    let exchangeRedeemReceiveTokenAmounts: BigNumber[];

    // ----------------------------------------------------------------------
    // 0x Order Variables
    // ----------------------------------------------------------------------
    let zeroExOrder: ZeroExSignedFillOrder;
    let zeroExMakerAssetAmount: BigNumber;
    let zeroExTakerAssetAmount: BigNumber;

    // ----------------------------------------------------------------------
    // Kyber Trade Variables
    // ----------------------------------------------------------------------
    let kyberTrade: KyberTrade;
    let kyberConversionRatePower: BigNumber;

    beforeEach(async () => {
      // ----------------------------------------------------------------------
      // Component and Rebalancing Set Deployment
      // ----------------------------------------------------------------------

      // Create component token
      baseSetComponent = await deployTokenSpecifyingDecimalAsync(18, web3, functionCaller);
      baseSetComponent2 = await deployTokenSpecifyingDecimalAsync(18, web3, functionCaller);

      // Create the Set (2 component where one is WETH)
      const componentAddresses = [baseSetComponent.address, baseSetComponent2.address, weth.address];
      const componentUnits =
        [new BigNumber(10 ** 18), new BigNumber(10 ** 18), new BigNumber(10 ** 18)];
      baseSetNaturalUnit = new BigNumber(10 ** 17);
      baseSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        baseSetNaturalUnit,
      );

      // Create the Rebalancing Set
      rebalancingUnitShares = new BigNumber(10 ** 18);
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        ownerAccount,
        baseSetToken.address,
        ONE_DAY_IN_SECONDS,
        rebalancingUnitShares,
      );

      // ----------------------------------------------------------------------
      // Issuance Details
      // ----------------------------------------------------------------------
      baseSetRedeemQuantity = new BigNumber(10 ** 18);

      rebalancingSetRedeemQuantity = baseSetRedeemQuantity
                                       .mul(DEFAULT_REBALANCING_NATURAL_UNIT)
                                       .div(rebalancingUnitShares);

      wethRequiredToIssueBaseSet =
        componentUnits[2].mul(baseSetRedeemQuantity).div(baseSetNaturalUnit);

      // ----------------------------------------------------------------------
      // Payment / Send and Receive Token Details
      // ----------------------------------------------------------------------

      kyberReceiveTokenQuantity = ether(1);
      zeroExReceiveTokenQuantity = ether(1);

      exchangeIssuanceReceiveTokenQuantity = zeroExReceiveTokenQuantity.plus(kyberReceiveTokenQuantity);

      totalEtherToReceive = exchangeIssuanceReceiveTokenQuantity.plus(wethRequiredToIssueBaseSet);

      // ----------------------------------------------------------------------
      // Exchange Issuance Set up
      // ----------------------------------------------------------------------

      // Generate exchangeRedeem data
      exchangeRedeemSetAddress = baseSetToken.address;
      exchangeRedeemQuantity = baseSetRedeemQuantity;
      exchangeRedeemSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX, SetUtils.EXCHANGES.KYBER];
      exchangeRedeemSendTokens = [componentAddresses[0], componentAddresses[1]];

      zeroExSendTokenQuantity =
        componentUnits[0].mul(exchangeRedeemQuantity).div(baseSetNaturalUnit);
      kyberSendTokenQuantity = componentUnits[1].mul(exchangeRedeemQuantity).div(baseSetNaturalUnit);

      exchangeRedeemSendTokenAmounts = [zeroExSendTokenQuantity, kyberSendTokenQuantity];
      exchangeRedeemReceiveTokens = [weth.address];
      exchangeRedeemReceiveTokenAmounts = [exchangeIssuanceReceiveTokenQuantity];

      const exchangeIssuanceParams = {
        setAddress:             exchangeRedeemSetAddress,
        sendTokenExchangeIds:   exchangeRedeemSendTokenExchangeIds,
        sendTokens:             exchangeRedeemSendTokens,
        sendTokenAmounts:       exchangeRedeemSendTokenAmounts,
        quantity:               exchangeRedeemQuantity,
        receiveTokens:          exchangeRedeemReceiveTokens,
        receiveTokenAmounts:    exchangeRedeemReceiveTokenAmounts,
      };

      // ----------------------------------------------------------------------
      // 0x Order Set up
      // ----------------------------------------------------------------------

      const makerAsset = exchangeRedeemReceiveTokens[0];
      const takerAsset = exchangeRedeemSendTokens[0];

      zeroExMakerAssetAmount = zeroExReceiveTokenQuantity;
      zeroExTakerAssetAmount = exchangeRedeemSendTokenAmounts[0];

      zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                                         // senderAddress
        zeroExOrderMaker,                                                     // makerAddress
        NULL_ADDRESS,                                                         // takerAddress
        ZERO,                                                                 // makerFee
        ZERO,                                                                 // takerFee
        zeroExMakerAssetAmount,                                               // makerAssetAmount
        zeroExTakerAssetAmount,                                               // takerAssetAmount
        makerAsset,                                                           // makerAssetAddress
        takerAsset,                                                           // takerAssetAddress
        SetUtils.generateSalt(),                                              // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,                                // exchangeAddress
        NULL_ADDRESS,                                                         // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),                                // expirationTimeSeconds
        zeroExTakerAssetAmount,                                               // amount of zeroExOrder to fill
      );

      // Approve weth to the transfer proxy
      await weth.approve.sendTransactionAsync(
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExMakerAssetAmount,
        { from: zeroExOrderMaker, gas: DEFAULT_GAS_LIMIT }
      );

      // Deposit weth
      await weth.deposit.sendTransactionAsync(
        { from: zeroExOrderMaker, value: zeroExMakerAssetAmount.toString(), gas: DEFAULT_GAS_LIMIT }
      );

      // ----------------------------------------------------------------------
      // Kyber Trade Set up
      // ----------------------------------------------------------------------
      const maxDestinationQuantity = kyberReceiveTokenQuantity;

      const destinationTokenDecimals = (await weth.decimals.callAsync()).toNumber();
      const sourceTokenDecimals = (await baseSetComponent2.decimals.callAsync()).toNumber();
      kyberConversionRatePower = new BigNumber(10).pow(18 + sourceTokenDecimals - destinationTokenDecimals);
      const minimumConversionRate = maxDestinationQuantity.div(kyberSendTokenQuantity)
                                                          .mul(kyberConversionRatePower)
                                                          .round();

      kyberTrade = {
        sourceToken: baseSetComponent2.address,
        destinationToken: weth.address,
        sourceTokenQuantity: kyberSendTokenQuantity,
        minimumConversionRate: minimumConversionRate,
        maxDestinationQuantity: maxDestinationQuantity,
      } as KyberTrade;

      await weth.approve.sendTransactionAsync(
        kyberNetworkHelper.kyberReserve,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        { from: kyberReserveOperator, gas: DEFAULT_GAS_LIMIT }
      );

      // Deposit weth
      await weth.deposit.sendTransactionAsync(
        { from: kyberReserveOperator, value: maxDestinationQuantity.toString(), gas: DEFAULT_GAS_LIMIT }
      );

      await kyberNetworkHelper.setConversionRates(
        baseSetComponent2.address,
        weth.address,
        kyberSendTokenQuantity,
        maxDestinationQuantity,
      );

      // ----------------------------------------------------------------------
      // Rebalancing Set Issuance
      // ----------------------------------------------------------------------

      // Approve base component to transfer proxy
      await approveForTransferAsync(
        [baseSetComponent, baseSetComponent2],
        transferProxy.address,
        functionCaller
      );

      if (wethRequiredToIssueBaseSet.gt(0)) {
        // Approve Weth to the transferProxy
        await weth.approve.sendTransactionAsync(
          transferProxy.address,
          wethRequiredToIssueBaseSet,
          { from: functionCaller, gas: DEFAULT_GAS_LIMIT }
        );

        // Generate wrapped Ether for the caller
        await weth.deposit.sendTransactionAsync(
          { from: functionCaller, value: wethRequiredToIssueBaseSet.toString(), gas: DEFAULT_GAS_LIMIT }
        );
      }

      // Issue the Base Set to the vault
      await core.issueInVault.sendTransactionAsync(
        baseSetToken.address,
        baseSetRedeemQuantity,
        { from: functionCaller, gas: DEFAULT_GAS_LIMIT }
      );

      await core.issue.sendTransactionAsync(
        rebalancingSetToken.address,
        rebalancingSetRedeemQuantity,
        { from: functionCaller, gas: DEFAULT_GAS_LIMIT }
      );

      // ----------------------------------------------------------------------
      // Subject Parameter Definitions
      // ----------------------------------------------------------------------

      subjectRebalancingSetAddress = rebalancingSetToken.address;
      subjectRebalancingSetQuantity = rebalancingSetRedeemQuantity;
      subjectExchangeIssuanceParams = exchangeIssuanceParams;
      subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder, kyberTrade]);
      subjectKeepChangeInVault = false;
      subjectCaller = functionCaller;
    });

    async function subject(): Promise<string> {
      return rebalancingSetExchangeIssuanceModuleWrapper.redeemRebalancingSetIntoEther(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectExchangeIssuanceParams,
        subjectExchangeOrdersData,
        subjectKeepChangeInVault,
        { from: subjectCaller, gas: DEFAULT_GAS_LIMIT },
      );
    }

    it('redeems the rebalancing Set', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.sub(subjectRebalancingSetQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });

    it('should increment the users eth balance by the correct quantity', async () => {
      const previousEthBalance = new BigNumber(await web3.eth.getBalance(subjectCaller));

      const txHash = await subject();
      const totalGasInEth = await getGasUsageInEth(web3, txHash);

      const expectedEthBalance = previousEthBalance
                                   .add(totalEtherToReceive)
                                   .sub(totalGasInEth);
      const currentEthBalance =  await web3.eth.getBalance(subjectCaller);

      expect(currentEthBalance).to.bignumber.equal(expectedEthBalance);
    });

    it('increases the 0x makers send token quantity properly', async () => {
      const previousTakerTokenBalance = await baseSetComponent.balanceOf.callAsync(zeroExOrderMaker);
      const expectedTakerTokenBalance = previousTakerTokenBalance.add(exchangeRedeemSendTokenAmounts[0]);

      await subject();

      const currentTakerTokenBalance = await baseSetComponent.balanceOf.callAsync(zeroExOrderMaker);
      expect(expectedTakerTokenBalance).to.bignumber.equal(currentTakerTokenBalance);
    });
  });

  describe('#redeemRebalancingSetIntoERC20', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectReceiveTokenAddress: Address;
    let subjectExchangeIssuanceParams: ExchangeIssuanceParams;
    let subjectExchangeOrdersData: Bytes;
    let subjectKeepChangeInVault: boolean;
    let subjectCaller: Address;



    // ----------------------------------------------------------------------
    // Component and Rebalancing Set
    // ----------------------------------------------------------------------
    let baseSetComponent: StandardTokenMockContract;
    let baseSetComponent2: StandardTokenMockContract;
    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let rebalancingUnitShares: BigNumber;

    // ----------------------------------------------------------------------
    // Issuance Details
    // ----------------------------------------------------------------------
    let rebalancingSetRedeemQuantity: BigNumber;
    let baseSetRedeemQuantity: BigNumber;

    // ----------------------------------------------------------------------
    // Payment / Send Token Details
    // ----------------------------------------------------------------------
    let wethRequiredToIssueBaseSet: BigNumber;

    let zeroExReceiveTokenQuantity: BigNumber;
    let kyberReceiveTokenQuantity: BigNumber;
    let exchangeIssuanceReceiveTokenQuantity: BigNumber;

    let zeroExSendTokenQuantity: BigNumber;
    let kyberSendTokenQuantity: BigNumber;

    let totalWrappedEtherToReceive: BigNumber;


    // ----------------------------------------------------------------------
    // Exchange Issuance Variables
    // ----------------------------------------------------------------------
    let exchangeRedeemSetAddress: Address;
    let exchangeRedeemQuantity: BigNumber;
    let exchangeRedeemSendTokenExchangeIds: BigNumber[];
    let exchangeRedeemSendTokens: Address[];
    let exchangeRedeemSendTokenAmounts: BigNumber[];
    let exchangeRedeemReceiveTokens: Address[];
    let exchangeRedeemReceiveTokenAmounts: BigNumber[];

    // ----------------------------------------------------------------------
    // 0x Order Variables
    // ----------------------------------------------------------------------
    let zeroExOrder: ZeroExSignedFillOrder;
    let zeroExMakerAssetAmount: BigNumber;
    let zeroExTakerAssetAmount: BigNumber;

    // ----------------------------------------------------------------------
    // Kyber Trade Variables
    // ----------------------------------------------------------------------
    let kyberTrade: KyberTrade;
    let kyberConversionRatePower: BigNumber;

    beforeEach(async () => {
      // ----------------------------------------------------------------------
      // Component and Rebalancing Set Deployment
      // ----------------------------------------------------------------------

      // Create component token
      baseSetComponent = await deployTokenSpecifyingDecimalAsync(18, web3, functionCaller);
      baseSetComponent2 = await deployTokenSpecifyingDecimalAsync(18, web3, functionCaller);

      // Create the Set (2 component where one is WETH)
      const componentAddresses = [baseSetComponent.address, baseSetComponent2.address, weth.address];
      const componentUnits =
        [new BigNumber(10 ** 18), new BigNumber(10 ** 18), new BigNumber(10 ** 18)];
      baseSetNaturalUnit = new BigNumber(10 ** 17);
      baseSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        baseSetNaturalUnit,
      );

      // Create the Rebalancing Set
      rebalancingUnitShares = new BigNumber(10 ** 18);
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        ownerAccount,
        baseSetToken.address,
        ONE_DAY_IN_SECONDS,
        rebalancingUnitShares,
      );

      // ----------------------------------------------------------------------
      // Issuance Details
      // ----------------------------------------------------------------------
      baseSetRedeemQuantity = new BigNumber(10 ** 18);

      rebalancingSetRedeemQuantity = baseSetRedeemQuantity
                                       .mul(DEFAULT_REBALANCING_NATURAL_UNIT)
                                       .div(rebalancingUnitShares);

      wethRequiredToIssueBaseSet =
        componentUnits[2].mul(baseSetRedeemQuantity).div(baseSetNaturalUnit);

      // ----------------------------------------------------------------------
      // Payment / Send and Receive Token Details
      // ----------------------------------------------------------------------

      kyberReceiveTokenQuantity = ether(1);
      zeroExReceiveTokenQuantity = ether(1);

      exchangeIssuanceReceiveTokenQuantity = zeroExReceiveTokenQuantity.plus(kyberReceiveTokenQuantity);

      totalWrappedEtherToReceive = exchangeIssuanceReceiveTokenQuantity.plus(wethRequiredToIssueBaseSet);

      // ----------------------------------------------------------------------
      // Exchange Issuance Set up
      // ----------------------------------------------------------------------

      // Generate exchangeRedeem data
      exchangeRedeemSetAddress = baseSetToken.address;
      exchangeRedeemQuantity = baseSetRedeemQuantity;
      exchangeRedeemSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX, SetUtils.EXCHANGES.KYBER];
      exchangeRedeemSendTokens = [componentAddresses[0], componentAddresses[1]];

      zeroExSendTokenQuantity =
        componentUnits[0].mul(exchangeRedeemQuantity).div(baseSetNaturalUnit);
      kyberSendTokenQuantity = componentUnits[1].mul(exchangeRedeemQuantity).div(baseSetNaturalUnit);

      exchangeRedeemSendTokenAmounts = [zeroExSendTokenQuantity, kyberSendTokenQuantity];
      exchangeRedeemReceiveTokens = [weth.address];
      exchangeRedeemReceiveTokenAmounts = [exchangeIssuanceReceiveTokenQuantity];

      const exchangeIssuanceParams = {
        setAddress:             exchangeRedeemSetAddress,
        sendTokenExchangeIds:   exchangeRedeemSendTokenExchangeIds,
        sendTokens:             exchangeRedeemSendTokens,
        sendTokenAmounts:       exchangeRedeemSendTokenAmounts,
        quantity:               exchangeRedeemQuantity,
        receiveTokens:          exchangeRedeemReceiveTokens,
        receiveTokenAmounts:    exchangeRedeemReceiveTokenAmounts,
      };

      // ----------------------------------------------------------------------
      // 0x Order Set up
      // ----------------------------------------------------------------------

      const makerAsset = exchangeRedeemReceiveTokens[0];
      const takerAsset = exchangeRedeemSendTokens[0];

      zeroExMakerAssetAmount = zeroExReceiveTokenQuantity;
      zeroExTakerAssetAmount = exchangeRedeemSendTokenAmounts[0];

      zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                                         // senderAddress
        zeroExOrderMaker,                                                     // makerAddress
        NULL_ADDRESS,                                                         // takerAddress
        ZERO,                                                                 // makerFee
        ZERO,                                                                 // takerFee
        zeroExMakerAssetAmount,                                               // makerAssetAmount
        zeroExTakerAssetAmount,                                               // takerAssetAmount
        makerAsset,                                                           // makerAssetAddress
        takerAsset,                                                           // takerAssetAddress
        SetUtils.generateSalt(),                                              // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,                                // exchangeAddress
        NULL_ADDRESS,                                                         // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),                                // expirationTimeSeconds
        zeroExTakerAssetAmount,                                               // amount of zeroExOrder to fill
      );

      // Approve weth to the transfer proxy
      await weth.approve.sendTransactionAsync(
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExMakerAssetAmount,
        { from: zeroExOrderMaker, gas: DEFAULT_GAS_LIMIT }
      );

      // Deposit weth
      await weth.deposit.sendTransactionAsync(
        { from: zeroExOrderMaker, value: zeroExMakerAssetAmount.toString(), gas: DEFAULT_GAS_LIMIT }
      );

      // ----------------------------------------------------------------------
      // Kyber Trade Set up
      // ----------------------------------------------------------------------
      const maxDestinationQuantity = kyberReceiveTokenQuantity;

      const destinationTokenDecimals = (await weth.decimals.callAsync()).toNumber();
      const sourceTokenDecimals = (await baseSetComponent2.decimals.callAsync()).toNumber();
      kyberConversionRatePower = new BigNumber(10).pow(18 + sourceTokenDecimals - destinationTokenDecimals);
      const minimumConversionRate = maxDestinationQuantity.div(kyberSendTokenQuantity)
                                                          .mul(kyberConversionRatePower)
                                                          .round();

      kyberTrade = {
        sourceToken: baseSetComponent2.address,
        destinationToken: weth.address,
        sourceTokenQuantity: kyberSendTokenQuantity,
        minimumConversionRate: minimumConversionRate,
        maxDestinationQuantity: maxDestinationQuantity,
      } as KyberTrade;

      await weth.approve.sendTransactionAsync(
        kyberNetworkHelper.kyberReserve,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        { from: kyberReserveOperator, gas: DEFAULT_GAS_LIMIT }
      );

      // Deposit weth
      await weth.deposit.sendTransactionAsync(
        { from: kyberReserveOperator, value: maxDestinationQuantity.toString(), gas: DEFAULT_GAS_LIMIT }
      );

      await kyberNetworkHelper.setConversionRates(
        baseSetComponent2.address,
        weth.address,
        kyberSendTokenQuantity,
        maxDestinationQuantity,
      );

      // ----------------------------------------------------------------------
      // Rebalancing Set Issuance
      // ----------------------------------------------------------------------

      // Approve base component to transfer proxy
      await approveForTransferAsync(
        [baseSetComponent, baseSetComponent2],
        transferProxy.address,
        functionCaller
      );

      if (wethRequiredToIssueBaseSet.gt(0)) {
        // Approve Weth to the transferProxy
        await weth.approve.sendTransactionAsync(
          transferProxy.address,
          wethRequiredToIssueBaseSet,
          { from: functionCaller, gas: DEFAULT_GAS_LIMIT }
        );

        // Generate wrapped Ether for the caller
        await weth.deposit.sendTransactionAsync(
          { from: functionCaller, value: wethRequiredToIssueBaseSet.toString(), gas: DEFAULT_GAS_LIMIT }
        );
      }

      // Issue the Base Set to the vault
      await core.issueInVault.sendTransactionAsync(
        baseSetToken.address,
        baseSetRedeemQuantity,
        { from: functionCaller, gas: DEFAULT_GAS_LIMIT }
      );

      await core.issue.sendTransactionAsync(
        rebalancingSetToken.address,
        rebalancingSetRedeemQuantity,
        { from: functionCaller, gas: DEFAULT_GAS_LIMIT }
      );

      // ----------------------------------------------------------------------
      // Subject Parameter Definitions
      // ----------------------------------------------------------------------

      subjectRebalancingSetAddress = rebalancingSetToken.address;
      subjectRebalancingSetQuantity = rebalancingSetRedeemQuantity;
      subjectReceiveTokenAddress = weth.address;
      subjectExchangeIssuanceParams = exchangeIssuanceParams;
      subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder, kyberTrade]);
      subjectKeepChangeInVault = false;
      subjectCaller = functionCaller;
    });

    async function subject(): Promise<string> {
      return rebalancingSetExchangeIssuanceModuleWrapper.redeemRebalancingSetIntoERC20(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectReceiveTokenAddress,
        subjectExchangeIssuanceParams,
        subjectExchangeOrdersData,
        subjectKeepChangeInVault,
        { from: subjectCaller, gas: DEFAULT_GAS_LIMIT },
      );
    }

    it('redeems the rebalancing Set', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.sub(subjectRebalancingSetQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });

    it('should increment the users weth balance by the correct quantity', async () => {
      const previousWethBalance = await weth.balanceOf.callAsync(subjectCaller);

      await subject();

      const expectedWethBalance = previousWethBalance.add(totalWrappedEtherToReceive);
      const currentWethBalance = await weth.balanceOf.callAsync(subjectCaller);

      expect(currentWethBalance).to.bignumber.equal(expectedWethBalance);
    });

    it('increases the 0x makers send token quantity properly', async () => {
      const previousTakerTokenBalance = await baseSetComponent.balanceOf.callAsync(zeroExOrderMaker);
      const expectedTakerTokenBalance = previousTakerTokenBalance.add(exchangeRedeemSendTokenAmounts[0]);

      await subject();

      const currentTakerTokenBalance = await baseSetComponent.balanceOf.callAsync(zeroExOrderMaker);
      expect(expectedTakerTokenBalance).to.bignumber.equal(currentTakerTokenBalance);
    });
  });

});
