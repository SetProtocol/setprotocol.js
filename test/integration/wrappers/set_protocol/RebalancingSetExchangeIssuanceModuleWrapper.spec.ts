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
  DEFAULT_UNIT_SHARES,
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
  deployTokensSpecifyingDecimals,
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

    let customComponents: Address[];
    let customComponentUnits: BigNumber[];
    let customBaseSetComponent: StandardTokenMockContract;
    let customBaseSetComponent2: StandardTokenMockContract;

    // ----------------------------------------------------------------------
    // Issuance Details
    // ----------------------------------------------------------------------
    let rebalancingSetIssueQuantity: BigNumber;
    let baseSetIssueQuantity: BigNumber;

    let wethRequiredToIssueBaseSet: BigNumber;

    let customWethRequiredToIssueBaseSet: BigNumber;
    let customRebalancingSetIssueQuantity: BigNumber;

    // ----------------------------------------------------------------------
    // Payment / Send Token Details
    // ----------------------------------------------------------------------
    let totalEther: BigNumber;

    let zeroExSendTokenQuantity: BigNumber;
    let kyberSendTokenQuantity: BigNumber;
    let exchangeIssuanceSendTokenQuantity: BigNumber;

    let customExchangeIssuanceSendTokenQuantity: BigNumber;
    let customWethUsedInZeroExTrade: BigNumber;
    let customZeroExSendTokenQuantity: BigNumber;

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

    let customExchangeIssuanceBaseSetIssueQuantity: BigNumber;

    // ----------------------------------------------------------------------
    // 0x Order Variables
    // ----------------------------------------------------------------------
    let zeroExOrder: ZeroExSignedFillOrder;
    let zeroExMakerAssetAmount: BigNumber;
    let zeroExTakerAssetAmount: BigNumber;

    let customZeroExReceiveTokenAmount: BigNumber;

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
      baseSetComponent = customBaseSetComponent || await deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount);
      baseSetComponent2 = customBaseSetComponent2 || await deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount);

      // Create the Set (default is 3 components)
      const componentAddresses = customComponents || [
        baseSetComponent.address, baseSetComponent2.address, weth.address,
      ];
      const componentUnits = customComponentUnits || [
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

      rebalancingSetIssueQuantity = customRebalancingSetIssueQuantity || impliedRebalancingSetQuantityFromBaseSet;

      wethRequiredToIssueBaseSet = customWethRequiredToIssueBaseSet ||
        baseSetIssueQuantity.mul(componentUnits[2]).div(baseSetNaturalUnit);

      // ----------------------------------------------------------------------
      // Payment / Send Token Details
      // ----------------------------------------------------------------------

      kyberSendTokenQuantity = new BigNumber(10 ** 18);
      zeroExSendTokenQuantity = customZeroExSendTokenQuantity || new BigNumber(10 ** 18);

      exchangeIssuanceSendTokenQuantity = customExchangeIssuanceSendTokenQuantity ||
        kyberSendTokenQuantity.plus(zeroExSendTokenQuantity);

      totalEther = exchangeIssuanceSendTokenQuantity.plus(wethRequiredToIssueBaseSet);

      // ----------------------------------------------------------------------
      // Exchange Issuance Set up
      // ----------------------------------------------------------------------

      // Generate exchange issue data
      exchangeIssueSetAddress = baseSetToken.address;
      exchangeIssueQuantity = customExchangeIssuanceBaseSetIssueQuantity || baseSetIssueQuantity;
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

      zeroExMakerAssetAmount = customZeroExReceiveTokenAmount || exchangeIssueReceiveTokenAmounts[0];
      zeroExTakerAssetAmount = customWethUsedInZeroExTrade || exchangeIssueSendTokenAmounts[0];

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

    afterEach(async () => {
      customExchangeIssuanceSendTokenQuantity = undefined;
      customExchangeIssuanceBaseSetIssueQuantity = undefined;
      customComponents = undefined;
      customComponentUnits = undefined;
      customWethRequiredToIssueBaseSet = undefined;
    });

    async function subject(): Promise<string> {
      return rebalancingSetExchangeIssuanceModule.issueRebalancingSetWithEther.sendTransactionAsync(
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

    let customComponents: Address[];
    let customComponentUnits: BigNumber[];
    let customBaseSetComponent: StandardTokenMockContract;
    let customBaseSetComponent2: StandardTokenMockContract;

    // ----------------------------------------------------------------------
    // Issuance Details
    // ----------------------------------------------------------------------
    let rebalancingSetIssueQuantity: BigNumber;
    let baseSetIssueQuantity: BigNumber;

    let wethRequiredToIssueBaseSet: BigNumber;

    let customWethRequiredToIssueBaseSet: BigNumber;
    let customRebalancingSetIssueQuantity: BigNumber;

    // ----------------------------------------------------------------------
    // Payment / Send Token Details
    // ----------------------------------------------------------------------
    let totalWrappedEther: BigNumber;

    let zeroExSendTokenQuantity: BigNumber;
    let kyberSendTokenQuantity: BigNumber;
    let exchangeIssuanceSendTokenQuantity: BigNumber;

    let customExchangeIssuanceSendTokenQuantity: BigNumber;
    let customWethUsedInZeroExTrade: BigNumber;
    let customZeroExSendTokenQuantity: BigNumber;

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

    let customExchangeIssuanceBaseSetIssueQuantity: BigNumber;

    // ----------------------------------------------------------------------
    // 0x Order Variables
    // ----------------------------------------------------------------------
    let zeroExOrder: ZeroExSignedFillOrder;
    let zeroExMakerAssetAmount: BigNumber;
    let zeroExTakerAssetAmount: BigNumber;

    let customZeroExReceiveTokenAmount: BigNumber;

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
      baseSetComponent = customBaseSetComponent || await deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount);
      baseSetComponent2 = customBaseSetComponent2 || await deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount);

      // Create the Set (default is 3 components)
      const componentAddresses = customComponents || [
        baseSetComponent.address, baseSetComponent2.address, weth.address,
      ];
      const componentUnits = customComponentUnits || [
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

      rebalancingSetIssueQuantity = customRebalancingSetIssueQuantity || impliedRebalancingSetQuantityFromBaseSet;

      wethRequiredToIssueBaseSet = customWethRequiredToIssueBaseSet ||
        baseSetIssueQuantity.mul(componentUnits[2]).div(baseSetNaturalUnit);

      // ----------------------------------------------------------------------
      // Payment / Send Token Details
      // ----------------------------------------------------------------------

      kyberSendTokenQuantity = new BigNumber(10 ** 18);
      zeroExSendTokenQuantity = customZeroExSendTokenQuantity || new BigNumber(10 ** 18);

      exchangeIssuanceSendTokenQuantity = customExchangeIssuanceSendTokenQuantity ||
        kyberSendTokenQuantity.plus(zeroExSendTokenQuantity);

      totalWrappedEther = exchangeIssuanceSendTokenQuantity.plus(wethRequiredToIssueBaseSet);

      // ----------------------------------------------------------------------
      // Exchange Issuance Set up
      // ----------------------------------------------------------------------

      // Generate exchange issue data
      exchangeIssueSetAddress = baseSetToken.address;
      exchangeIssueQuantity = customExchangeIssuanceBaseSetIssueQuantity || baseSetIssueQuantity;
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

      zeroExMakerAssetAmount = customZeroExReceiveTokenAmount || exchangeIssueReceiveTokenAmounts[0];
      zeroExTakerAssetAmount = customWethUsedInZeroExTrade || exchangeIssueSendTokenAmounts[0];

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

    afterEach(async () => {
      customExchangeIssuanceSendTokenQuantity = undefined;
      customExchangeIssuanceBaseSetIssueQuantity = undefined;
      customComponents = undefined;
      customComponentUnits = undefined;
      customWethRequiredToIssueBaseSet = undefined;
    });

    async function subject(): Promise<string> {
      return rebalancingSetExchangeIssuanceModule.issueRebalancingSetWithERC20.sendTransactionAsync(
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


});
