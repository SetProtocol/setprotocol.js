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
  StandardTokenMockContract,
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
  DEFAULT_REBALANCING_NATURAL_UNIT,
  DEFAULT_GAS_LIMIT,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
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
  deployTokenSpecifyingDecimalAsync,
  deployWethMockAsync,
  deployZeroExExchangeWrapperContract,
  transferTokenAsync,
} from '@test/helpers';
import { BigNumber, ether } from '@src/util';
import { Address, KyberTrade, SetProtocolConfig, ZeroExSignedFillOrder } from '@src/types/common';
import { KyberNetworkHelper } from '@test/helpers/kyberNetworkHelper';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
ChaiSetup.configure();
const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const setUtils = new SetUtils(web3);
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;

const ownerAccount = DEFAULT_ACCOUNT;
const kyberReserveOperator = ACCOUNTS[1].address;
const functionCaller = ACCOUNTS[2].address;
const zeroExOrderMaker = ACCOUNTS[3].address;

const kyberNetworkHelper = new KyberNetworkHelper();

describe('ExchangeIssuanceAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let weth: WethMockContract;
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

    await kyberNetworkHelper.setup();
    await kyberNetworkHelper.fundReserveWithEth(
      kyberReserveOperator,
      ether(90),
    );

    kyberNetworkWrapper = await deployKyberNetworkWrapperContract(
      web3,
      kyberNetworkHelper.kyberNetworkProxy,
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
      rebalancingSetIssuanceModule: NULL_ADDRESS,
      rebalancingSetExchangeIssuanceModule: rebalancingSetExchangeIssuanceModule.address,
      wrappedEtherAddress: weth.address,
      protocolViewerAddress: NULL_ADDRESS,
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
      exchangeIssuancePaymentToken = weth.address;
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
      await weth.deposit.sendTransactionAsync(
        { from: subjectCaller, value: exchangeIssuancePaymentTokenAmount.toString() }
      );

      await weth.approve.sendTransactionAsync(
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
    let subjectExchangeIssuanceParams: ExchangeIssuanceParams;
    let subjectExchangeOrders: (KyberTrade | ZeroExSignedFillOrder)[];
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
      subjectExchangeOrders = [zeroExOrder, kyberTrade];
      subjectKeepChangeInVault = false;
      subjectCaller = functionCaller;
      subjectEtherValue = totalEther.toString();
    });

    async function subject(): Promise<string> {
      return exchangeIssuanceAPI.issueRebalancingSetWithEtherAsync(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectExchangeIssuanceParams,
        subjectExchangeOrders,
        subjectKeepChangeInVault,
        { from: subjectCaller, gas: DEFAULT_GAS_LIMIT, value: subjectEtherValue },
      );
    }

    test('issues the rebalancing Set to the caller', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.add(subjectRebalancingSetQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
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
        subjectEtherValue = undefined;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
           `Payment Token quantity value should not be undefined (txOpts.value if Wrapped Ether)`
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
        subjectExchangeIssuanceParams.setAddress = notBaseSet;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Set token at ${notBaseSet} is not the expected rebalancing set token current Set at ${baseSetToken.address}`
        );
      });
    });

    describe('when the receive tokens are not included in the rebalancing set\'s base set\'s components', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceParams.receiveTokens[0] = 'NotAComponentAddress';
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
        subjectExchangeIssuanceParams.sendTokens[0] = notWrappedEther;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Send token at ${notWrappedEther} is not the payment token at ${weth.address}`
        );
      });
    });
  });

  describe('issueRebalancingSetWithERC20Async', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectPaymentTokenAddress: Address;
    let subjectPaymentTokenQuantity: BigNumber;
    let subjectExchangeIssuanceParams: ExchangeIssuanceParams;
    let subjectExchangeOrders: (KyberTrade | ZeroExSignedFillOrder)[];
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
      subjectExchangeOrders = [zeroExOrder, kyberTrade];
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
      return exchangeIssuanceAPI.issueRebalancingSetWithERC20Async(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectPaymentTokenAddress,
        subjectPaymentTokenQuantity,
        subjectExchangeIssuanceParams,
        subjectExchangeOrders,
        subjectKeepChangeInVault,
        { from: subjectCaller, gas: DEFAULT_GAS_LIMIT },
      );
    }

    test('issues the rebalancing Set to the caller', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.add(subjectRebalancingSetQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
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

    describe('when an empty paymentTokenQuantity is passed in', async () => {
      beforeEach(async () => {
        subjectPaymentTokenQuantity = undefined;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
           `Payment Token quantity value should not be undefined (txOpts.value if Wrapped Ether)`
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
        subjectExchangeIssuanceParams.setAddress = notBaseSet;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Set token at ${notBaseSet} is not the expected rebalancing set token current Set at ${baseSetToken.address}`
        );
      });
    });

    describe('when the receive tokens are not included in the rebalancing set\'s base set\'s components', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceParams.receiveTokens[0] = 'NotAComponentAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Component at NotAComponentAddress is not part of the collateralizing set at ${baseSetToken.address}`
        );
      });
    });

    describe('when the send token does not contain the paymentToken', async () => {
      const notPaymentToken = ACCOUNTS[3].address;

      beforeEach(async () => {
        subjectExchangeIssuanceParams.sendTokens[0] = notPaymentToken;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Send token at ${notPaymentToken} is not the payment ` +
          `token at ${subjectPaymentTokenAddress}`
        );
      });
    });
  });

  describe('redeemRebalancingSetIntoEtherAsync', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectExchangeIssuanceParams: ExchangeIssuanceParams;
    let subjectExchangeOrders: (KyberTrade | ZeroExSignedFillOrder)[];
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
      subjectExchangeOrders = [zeroExOrder, kyberTrade];
      subjectKeepChangeInVault = false;
      subjectCaller = functionCaller;
    });

    async function subject(): Promise<string> {
      return await exchangeIssuanceAPI.redeemRebalancingSetIntoEtherAsync(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectExchangeIssuanceParams,
        subjectExchangeOrders,
        subjectKeepChangeInVault,
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
        subjectExchangeIssuanceParams.receiveTokens = [weth.address, notWrappedEther];
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
        subjectExchangeIssuanceParams.setAddress = notBaseSet;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Set token at ${notBaseSet} is not the expected rebalancing set token current Set at ${baseSetToken.address}`
        );
      });
    });

    describe('when the send tokens are not included in the rebalancing set\'s base set\'s components', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceParams.sendTokens[0] = 'NotAComponentAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Component at NotAComponentAddress is not part of the collateralizing set at ${baseSetToken.address}`
        );
      });
    });

    describe('when the amount of base set from the rebalancing set quantity is not enough to trade', async () => {
      beforeEach(async () => {
        subjectRebalancingSetQuantity = baseSetRedeemQuantity.mul(DEFAULT_REBALANCING_NATURAL_UNIT)
                                                                .div(rebalancingUnitShares)
                                                                .sub(1);
      });

      test('throws', async () => {
        const impliedBaseSetQuantity = subjectRebalancingSetQuantity
                                        .mul(rebalancingUnitShares)
                                        .div(DEFAULT_REBALANCING_NATURAL_UNIT);

        return expect(subject()).to.be.rejectedWith(
          `The quantity of base set redeemable from the quantity of the rebalancing set: ` +
          `${impliedBaseSetQuantity.toString()} must be ` +
          `greater or equal to the amount required for the redemption trades: ${baseSetRedeemQuantity.toString()}`
        );
      });
    });

    describe('when the receive tokens does not contain Wrapper Ether', async () => {
      const notWrappedEther = ACCOUNTS[3].address;

      beforeEach(async () => {
        subjectExchangeIssuanceParams.receiveTokens[0] = notWrappedEther;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Receive token at ${notWrappedEther} is not the output token at ${weth.address}`
        );
      });
    });
  });

  describe('redeemRebalancingSetIntoERC20Async', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectRebalancingSetQuantity: BigNumber;
    let subjectReceiveTokenAddress: Address;
    let subjectExchangeIssuanceParams: ExchangeIssuanceParams;
    let subjectExchangeOrders: (KyberTrade | ZeroExSignedFillOrder)[];
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
      subjectExchangeOrders = [zeroExOrder, kyberTrade];
      subjectKeepChangeInVault = false;
      subjectCaller = functionCaller;
    });

    async function subject(): Promise<string> {
      return await exchangeIssuanceAPI.redeemRebalancingSetIntoERC20Async(
        subjectRebalancingSetAddress,
        subjectRebalancingSetQuantity,
        subjectReceiveTokenAddress,
        subjectExchangeIssuanceParams,
        subjectExchangeOrders,
        subjectKeepChangeInVault,
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
        subjectExchangeIssuanceParams.receiveTokens = [weth.address, notWrappedEther];
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
        subjectExchangeIssuanceParams.setAddress = notBaseSet;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Set token at ${notBaseSet} is not the expected rebalancing set token current Set at ${baseSetToken.address}`
        );
      });
    });

    describe('when the send tokens are not included in the rebalancing set\'s base set\'s components', async () => {
      beforeEach(async () => {
        subjectExchangeIssuanceParams.sendTokens[0] = 'NotAComponentAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Component at NotAComponentAddress is not part of the collateralizing set at ${baseSetToken.address}`
        );
      });
    });

    describe('when the amount of base set from the rebalancing set quantity is not enough to trade', async () => {
      beforeEach(async () => {
        subjectRebalancingSetQuantity = baseSetRedeemQuantity.mul(DEFAULT_REBALANCING_NATURAL_UNIT)
                                                                .div(rebalancingUnitShares)
                                                                .sub(1);
      });

      test('throws', async () => {
        const impliedBaseSetQuantity = subjectRebalancingSetQuantity
                                        .mul(rebalancingUnitShares)
                                        .div(DEFAULT_REBALANCING_NATURAL_UNIT);

        return expect(subject()).to.be.rejectedWith(
          `The quantity of base set redeemable from the quantity of the rebalancing set: ` +
          `${impliedBaseSetQuantity.toString()} must be ` +
          `greater or equal to the amount required for the redemption trades: ${baseSetRedeemQuantity.toString()}`
        );
      });
    });

    describe('when the receive tokens does not contain Wrapper Ether', async () => {
      const notWrappedEther = ACCOUNTS[3].address;

      beforeEach(async () => {
        subjectExchangeIssuanceParams.receiveTokens[0] = notWrappedEther;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Receive token at ${notWrappedEther} is not the output token at ${weth.address}`
        );
      });
    });
  });

  describe('getKyberConversionRate', async () => {
    let subjectSourceTokenAddresses: Address[];
    let subjectDestinationTokenAddresses: Address[];
    let subjectQuantities: BigNumber[];

    const token1BuyRate = ether(2);
    const token2BuyRate = ether(6);
    const token1SellRate = ether(1);
    const token2SellRate = ether(2);

    beforeEach(async () => {
      const [token1, token2] = await deployTokensSpecifyingDecimals(
        2,
        [18, 18],
        web3,
        kyberReserveOperator,
      );

      await kyberNetworkHelper.enableTokensForReserve(token1.address);
      await kyberNetworkHelper.enableTokensForReserve(token2.address);

      await kyberNetworkHelper.setUpConversionRatesRaw(
        [token1.address, token2.address],
        [token1BuyRate, token2BuyRate],
        [token1SellRate, token2SellRate],
      );

      await kyberNetworkHelper.approveToReserve(
        token1,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        kyberReserveOperator,
      );

      await kyberNetworkHelper.approveToReserve(
        token2,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        kyberReserveOperator,
      );

      subjectSourceTokenAddresses = [token1.address, token1.address];
      subjectDestinationTokenAddresses = [token2.address, token2.address];
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
      const results = await subject();
      [[firstRate, secondRate], [firstSlippage, secondSlippage]] = results;

      const expectedRate = token2BuyRate;
      expect(firstRate).to.be.bignumber.equal(expectedRate);

      const expectedSecondRate = token2BuyRate;
      expect(secondRate).to.be.bignumber.equal(expectedSecondRate);

      const slippagePercentage = new BigNumber(100).sub(kyberNetworkHelper.defaultSlippagePercentage);
      const expectedSlippage = expectedRate.mul(slippagePercentage).div(100);
      expect(firstSlippage).to.be.bignumber.equal(expectedSlippage);

      const expectedSecondSlippage = expectedSecondRate.mul(slippagePercentage).div(100);
      expect(secondSlippage).to.be.bignumber.equal(expectedSecondSlippage);
    });
  });
});
