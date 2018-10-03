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
import * as ethUtil from 'ethereumjs-util';
import * as Web3 from 'web3';
import { Core, Vault } from 'set-protocol-contracts';
import * as setProtocolUtils from 'set-protocol-utils';
import {
  CoreContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
  ZeroExExchangeWrapperContract,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { CoreWrapper } from '@src/wrappers';
import { OrderAPI } from '@src/api';
import {
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
  ONE_DAY_IN_SECONDS,
  DEFAULT_CONSTANT_AUCTION_PRICE,
} from '@src/constants';
import { Assertions } from '@src/assertions';
import {
  addAuthorizationAsync,
  approveForTransferAsync,
  constructInflowOutflowArraysAsync,
  createDefaultRebalancingSetTokenAsync,
  deployConstantAuctionPriceCurveAsync,
  deployCoreContract,
  deployKyberNetworkWrapperContract,
  deployRebalancingSetTokenFactoryContract,
  deploySetTokenAsync,
  deploySetTokensAsync,
  deploySetTokenFactoryContract,
  deployTakerWalletWrapperContract,
  deployTokenAsync,
  deployTokensAsync,
  deployTransferProxyContract,
  deployVaultContract,
  deployZeroExExchangeWrapperContract,
  getVaultBalances,
  tokenDeployedOnSnapshot,
  transitionToRebalanceAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether,
  extractNewSetTokenAddressFromLogs,
  generateFutureTimestamp,
  getFormattedLogsFromTxHash,
  Web3Utils
} from '@src/util';
import {
  Address,
  SignedIssuanceOrder,
  KyberTrade,
  TakerWalletOrder,
  ZeroExSignedFillOrder,
} from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils } = setProtocolUtils;
const setUtils = new SetUtils(web3);
const setTestUtils = new SetTestUtils(web3);

const coreContract = contract(Core);
coreContract.setProvider(provider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('CoreWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;

  let coreWrapper: CoreWrapper;
  let assertions: Assertions;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    transferProxy = await deployTransferProxyContract(provider);
    vault = await deployVaultContract(provider);
    core = await deployCoreContract(provider, transferProxy.address, vault.address);
    setTokenFactory = await deploySetTokenFactoryContract(provider, core);
    rebalancingSetTokenFactory = await deployRebalancingSetTokenFactoryContract(provider, core);

    await addAuthorizationAsync(vault, core.address);
    await addAuthorizationAsync(transferProxy, core.address);

    coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);

    assertions = new Assertions(web3, coreWrapper);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('create', async () => {
    let componentTokens: StandardTokenMockContract[];

    let subjectFactoryAddress: Address;
    let subjectComponents: Address[];
    let subjectUnits: BigNumber[];
    let subjectNaturalUnit: BigNumber;
    let subjectName: string;
    let subjectSymbol: string;
    let subjectCallData: string;
    let subjectCaller: Address;

    beforeEach(async () => {
      componentTokens = await deployTokensAsync(3, provider);

      subjectComponents = componentTokens.map(component => component.address);
      subjectUnits = subjectComponents.map(component => ether(4));
      subjectNaturalUnit = ether(2);
      subjectName = 'My Set';
      subjectSymbol = 'SET';
      subjectCallData = '';
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.create(
        subjectFactoryAddress,
        subjectComponents,
        subjectUnits,
        subjectNaturalUnit,
        subjectName,
        subjectSymbol,
        subjectCallData,
        { from: subjectCaller }
      );
    }

    describe('when the factory address is for vanilla SetToken', async () => {
      beforeEach(async () => {
        subjectFactoryAddress = setTokenFactory.address;
      });

      test('creates a new SetToken contract', async () => {
        const createSetTransactionHash = await subject();

        const formattedLogs = await getFormattedLogsFromTxHash(web3, createSetTransactionHash);
        const deployedSetTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
        const setTokenContract = await SetTokenContract.at(deployedSetTokenAddress, web3, TX_DEFAULTS);

        const componentAddresses = await setTokenContract.getComponents.callAsync();
        expect(componentAddresses).to.eql(subjectComponents);

        const componentUnits = await setTokenContract.getUnits.callAsync();
        expect(JSON.stringify(componentUnits)).to.eql(JSON.stringify(subjectUnits));

        const naturalUnit = await setTokenContract.naturalUnit.callAsync();
        expect(naturalUnit).to.bignumber.equal(subjectNaturalUnit);

        const name = await setTokenContract.name.callAsync();
        expect(name).to.eql(subjectName);

        const symbol = await setTokenContract.symbol.callAsync();
        expect(symbol).to.eql(subjectSymbol);
      });
    });
  });

  describe('issue', async () => {
    let setToken: SetTokenContract;

    let subjectSetToIssue: Address;
    let subjectQuantitytoIssue: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, provider);
      const setComponentUnit = ether(4);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokens.map(token => token.address),
        componentTokens.map(token => setComponentUnit),
        naturalUnit,
      );

      await approveForTransferAsync(componentTokens, transferProxy.address);

      subjectSetToIssue = setToken.address;
      subjectQuantitytoIssue = ether(2);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.issue(
        subjectSetToIssue,
        subjectQuantitytoIssue,
        { from: subjectCaller }
      );
    }

    test('updates the set balance of the user by the issue quantity', async () => {
      const existingSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

      await subject();

      const expectedSetUserBalance = existingSetUserBalance.add(subjectQuantitytoIssue);
      const newSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
      expect(newSetUserBalance).to.eql(expectedSetUserBalance);
    });
  });

  describe('redeem', async () => {
    let setToken: SetTokenContract;

    let subjectSetToRedeem: Address;
    let subjectQuantityToRedeem: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, provider);
      const setComponentUnit = ether(4);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokens.map(token => token.address),
        componentTokens.map(token => setComponentUnit),
        naturalUnit,
      );

      await approveForTransferAsync(componentTokens, transferProxy.address);

      await core.issue.sendTransactionAsync(
        setToken.address,
        ether(2),
        TX_DEFAULTS
      );

      subjectSetToRedeem = setToken.address;
      subjectQuantityToRedeem = ether(2);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.redeem(
        subjectSetToRedeem,
        subjectQuantityToRedeem,
        { from: subjectCaller }
      );
    }

    test('updates the set balance of the user by the redeem quantity', async () => {
      const existingSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

      await subject();

      const expectedSetUserBalance = existingSetUserBalance.sub(subjectQuantityToRedeem);
      const newSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
      expect(newSetUserBalance).to.eql(expectedSetUserBalance);
    });
  });

  describe('redeemAndWithdraw', async () => {
    let setToken: SetTokenContract;

    let subjectSetToRedeem: Address;
    let subjectQuantityToRedeem: BigNumber;
    let subjectTokensToExcludeBitmask: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, provider);
      const setComponentUnit = ether(4);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokens.map(token => token.address),
        componentTokens.map(token => setComponentUnit),
        naturalUnit,
      );

      await approveForTransferAsync(componentTokens, transferProxy.address);

      await core.issue.sendTransactionAsync(
        setToken.address,
        ether(2),
        TX_DEFAULTS
      );

      subjectSetToRedeem = setToken.address;
      subjectQuantityToRedeem = ether(2);
      subjectTokensToExcludeBitmask = ZERO;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.redeemAndWithdraw(
        subjectSetToRedeem,
        subjectQuantityToRedeem,
        subjectTokensToExcludeBitmask,
        { from: subjectCaller }
      );
    }

    test('updates the set balance of the user by the redeem quantity', async () => {
      const existingSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

      await subject();

      const expectedSetUserBalance = existingSetUserBalance.sub(subjectQuantityToRedeem);
      const newSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
      expect(newSetUserBalance).to.eql(expectedSetUserBalance);
    });
  });

  describe('deposit', async () => {
    let token: StandardTokenMockContract;
    let depositQuantity: BigNumber;

    let subjectTokenAddressToDeposit: Address;
    let subjectQuantityToDeposit: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      token = await deployTokenAsync(provider);
      await approveForTransferAsync([token], transferProxy.address);
      subjectTokenAddressToDeposit = token.address;

      depositQuantity = new BigNumber(100);
      subjectQuantityToDeposit = depositQuantity;

      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.deposit(
        subjectTokenAddressToDeposit,
        subjectQuantityToDeposit,
        { from: subjectCaller },
      );
    }

    test('correctly updates the vault balance', async () => {
        const existingOwnerVaultBalance = await vault.getOwnerBalance.callAsync(
          subjectTokenAddressToDeposit,
          DEFAULT_ACCOUNT
        );

        await subject();

        const expectedVaultOwnerBalance = existingOwnerVaultBalance.add(depositQuantity);
        const newVaultOwnerBalance = await vault.getOwnerBalance.callAsync(
          subjectTokenAddressToDeposit,
          DEFAULT_ACCOUNT
        );
        expect(newVaultOwnerBalance).to.eql(expectedVaultOwnerBalance);
      });
  });

  describe('batchDeposit', async () => {
    let tokens: StandardTokenMockContract[];
    let depositQuantity: BigNumber;

    let subjectTokenAddressesToDeposit: Address[];
    let subjectQuantitesToWithdraw: BigNumber[];
    let subjectCaller: Address;

    beforeEach(async () => {
      tokens = await deployTokensAsync(3, provider);
      await approveForTransferAsync(tokens, transferProxy.address);
      subjectTokenAddressesToDeposit = tokens.map(token => token.address);

      depositQuantity = new BigNumber(100);
      subjectQuantitesToWithdraw = tokens.map(() => depositQuantity);

      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.batchDeposit(
        subjectTokenAddressesToDeposit,
        subjectQuantitesToWithdraw,
        { from: subjectCaller },
      );
    }

    test('correctly updates the vault balances', async () => {
      const existingVaultOwnerBalances = await getVaultBalances(vault, subjectTokenAddressesToDeposit, subjectCaller);

      await subject();

      const expectedVaultOwnerBalances = _.map(existingVaultOwnerBalances, balance => balance.add(depositQuantity));
      const newOwnerVaultBalances = await getVaultBalances(vault, subjectTokenAddressesToDeposit, subjectCaller);
      expect(newOwnerVaultBalances).to.eql(expectedVaultOwnerBalances);
    });
  });

  describe('withdraw', async () => {
    let token: StandardTokenMockContract;
    let withdrawQuantity: BigNumber;

    let subjectTokenAddressToWithdraw: Address;
    let subjectQuantityToWithdraw: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      token = await deployTokenAsync(provider);
      await approveForTransferAsync([token], transferProxy.address);
      subjectTokenAddressToWithdraw = token.address;

      withdrawQuantity = new BigNumber(100);
      await coreWrapper.deposit(
        token.address,
        withdrawQuantity,
        { from: DEFAULT_ACCOUNT },
      );

      subjectQuantityToWithdraw = withdrawQuantity;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.withdraw(
        subjectTokenAddressToWithdraw,
        subjectQuantityToWithdraw,
        { from: subjectCaller },
      );
    }

    test('correctly updates the vault balance', async () => {
        const existingOwnerVaultBalance = await vault.getOwnerBalance.callAsync(
          subjectTokenAddressToWithdraw,
          DEFAULT_ACCOUNT
        );

        await subject();

        const expectedVaultOwnerBalance = existingOwnerVaultBalance.sub(withdrawQuantity);
        const newVaultOwnerBalance = await vault.getOwnerBalance.callAsync(
          subjectTokenAddressToWithdraw,
          DEFAULT_ACCOUNT
        );
        expect(newVaultOwnerBalance).to.eql(expectedVaultOwnerBalance);
      });
  });

  describe('batchWithdraw', async () => {
    let tokens: StandardTokenMockContract[];
    let withdrawQuantity: BigNumber;

    let subjectTokenAddressesToWithdraw: Address[];
    let subjectQuantitesToWithdraw: BigNumber[];
    let subjectCaller: Address;

    beforeEach(async () => {
      tokens = await deployTokensAsync(3, provider);
      await approveForTransferAsync(tokens, transferProxy.address);
      const tokenAddresses = tokens.map(token => token.address);

      withdrawQuantity = new BigNumber(100);
      const quantitesToDeposit = tokenAddresses.map(() => withdrawQuantity);
      await coreWrapper.batchDeposit(
        tokenAddresses,
        quantitesToDeposit,
        { from: DEFAULT_ACCOUNT },
      );

      subjectTokenAddressesToWithdraw = tokenAddresses;
      subjectQuantitesToWithdraw = quantitesToDeposit;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.batchWithdraw(
        subjectTokenAddressesToWithdraw,
        subjectQuantitesToWithdraw,
        { from: subjectCaller },
      );
    }

    test('correctly updates the vault balances', async () => {
      const existingVaultOwnerBalances = await getVaultBalances(vault, subjectTokenAddressesToWithdraw, subjectCaller);

      await subject();

      const expectedVaultOwnerBalances = _.map(existingVaultOwnerBalances, balance => balance.sub(withdrawQuantity));
      const newOwnerVaultBalances = await getVaultBalances(vault, subjectTokenAddressesToWithdraw, subjectCaller);
      expect(newOwnerVaultBalances).to.eql(expectedVaultOwnerBalances);
    });
  });

  describe('fillOrder', async () => {
    let ordersAPI: OrderAPI;
    let issuanceOrderMaker: Address;
    let issuanceOrderQuantity: BigNumber;
    let setToken: SetTokenContract;

    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectQuantityToFill: BigNumber;
    let subjectOrdersData: string;
    let subjectCaller: Address;

    beforeEach(async () => {
      ordersAPI = new OrderAPI(web3, coreWrapper, assertions);

      await deployTakerWalletWrapperContract(transferProxy, core, provider);
      await deployZeroExExchangeWrapperContract(
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        transferProxy,
        core,
        provider,
      );
      await deployKyberNetworkWrapperContract(
        SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
        transferProxy,
        core,
        provider,
      );

      const relayerAddress = ACCOUNTS[0].address;
      const zeroExOrderMaker = ACCOUNTS[1].address;
      const issuanceOrderTaker = ACCOUNTS[2].address;
      issuanceOrderMaker = ACCOUNTS[3].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(provider, zeroExOrderMaker);
      const thirdComponent = await tokenDeployedOnSnapshot(web3, SetTestUtils.KYBER_RESERVE_DESTINATION_TOKEN_ADDRESS);
      const makerToken = await tokenDeployedOnSnapshot(web3, SetTestUtils.KYBER_RESERVE_SOURCE_TOKEN_ADDRESS);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

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
        sourceToken: makerToken.address,
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
      return await coreWrapper.fillOrder(
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
    let ordersAPI: OrderAPI;

    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectCancelQuantity: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      ordersAPI = new OrderAPI(web3, coreWrapper, assertions);

      const issuanceOrderTaker = ACCOUNTS[0].address;
      const issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;
      const zeroExOrderMaker = ACCOUNTS[3].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(provider, zeroExOrderMaker);
      const makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

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
      return await coreWrapper.cancelOrder(
        subjectSignedIssuanceOrder,
        subjectCancelQuantity,
        { from: subjectCaller }
      );
    }

    test('updates the cancel amount for the order', async () => {
      const { signature, ...issuanceOrder } = subjectSignedIssuanceOrder;
      const orderHash = SetUtils.hashOrderHex(issuanceOrder);
      const existingCancelAmount = await core.orderCancels.callAsync(orderHash);

      await subject();

      const expectedCancelAmounts = existingCancelAmount.add(subjectCancelQuantity);
      const newCancelAmount = await core.orderCancels.callAsync(orderHash);
      expect(newCancelAmount).to.bignumber.equal(expectedCancelAmounts);
    });
  });

  describe('bid', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;

    let subjectRebalancingSetToken: Address;
    let subjectBidQuantity: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokens = await deploySetTokensAsync(
        core,
        setTokenFactory.address,
        transferProxy.address,
        2,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      const proposalPeriod = ONE_DAY_IN_SECONDS;
      const managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(provider, DEFAULT_CONSTANT_AUCTION_PRICE);

      // Transition to proposal state
      const auctionPriceCurveAddress = priceCurve.address;
      const setCurveCoefficient = new BigNumber(1);
      const setAuctionStartPrice = new BigNumber(500);
      const setAuctionPriceDivisor = new BigNumber(1000);
      await transitionToRebalanceAsync(
        rebalancingSetToken,
        managerAddress,
        nextSetToken.address,
        auctionPriceCurveAddress,
        setCurveCoefficient,
        setAuctionStartPrice,
        setAuctionPriceDivisor
      );

      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectBidQuantity = ether(2);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.bid(
        subjectRebalancingSetToken,
        subjectBidQuantity,
        { from: subjectCaller },
      );
    }

    test('subtract correct amount from remainingCurrentSets', async () => {
      const existingRemainingCurrentSets = await rebalancingSetToken.remainingCurrentSets.callAsync();

      await subject();

      const expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
      const newRemainingCurrentSets = await rebalancingSetToken.remainingCurrentSets.callAsync();
      expect(newRemainingCurrentSets).to.eql(expectedRemainingCurrentSets);
    });

    test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', async () => {
      const expectedTokenFlows = await constructInflowOutflowArraysAsync(
        rebalancingSetToken,
        subjectBidQuantity,
        DEFAULT_CONSTANT_AUCTION_PRICE
      );
      const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

      const oldSenderBalances = await getVaultBalances(
        vault,
        combinedTokenArray,
        rebalancingSetToken.address
      );

      await subject();

      const newSenderBalances = await getVaultBalances(
        vault,
        combinedTokenArray,
        rebalancingSetToken.address
      );
      const expectedSenderBalances = _.map(oldSenderBalances, (balance, index) =>
        balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index])
      );
      expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
    });

    it('transfers the correct amount of tokens to the bidder in the Vault', async () => {
      const expectedTokenFlows = await constructInflowOutflowArraysAsync(
        rebalancingSetToken,
        subjectBidQuantity,
        DEFAULT_CONSTANT_AUCTION_PRICE
      );
      const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

      const oldReceiverBalances = await getVaultBalances(
        vault,
        combinedTokenArray,
        DEFAULT_ACCOUNT
      );

      await subject();

      const newReceiverBalances = await getVaultBalances(
        vault,
        combinedTokenArray,
        DEFAULT_ACCOUNT
      );
      const expectedReceiverBalances = _.map(oldReceiverBalances, (balance, index) =>
        balance.add(expectedTokenFlows['outflow'][index])
      );

      expect(JSON.stringify(newReceiverBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
    });
  });

  describe('Core State Getters', async () => {
    let setComponentUnit: BigNumber;
    let setToken: SetTokenContract;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, provider);
      setComponentUnit = ether(4);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokens.map(token => token.address),
        componentTokens.map(token => setComponentUnit),
        naturalUnit,
      );
    });

    test('gets exchange address', async () => {
      const takerWalletWrapper = await deployTakerWalletWrapperContract(transferProxy, core, provider);
      const exchangeAddress = await coreWrapper.getExchangeAddress(SetUtils.EXCHANGES.TAKER_WALLET);

      expect(exchangeAddress).to.equal(takerWalletWrapper.address);
    });

    test('gets transfer proxy address', async () => {
      const transferProxyAddress = await coreWrapper.getTransferProxyAddress();

      expect(coreWrapper.transferProxyAddress).to.equal(transferProxyAddress);
    });

    test('gets vault address', async () => {
      const vaultAddress = await coreWrapper.getVaultAddress();

      expect(coreWrapper.vaultAddress).to.equal(vaultAddress);
    });

    test('gets factory addresses', async () => {
      const factoryAddresses = await coreWrapper.getFactories();

      expect(factoryAddresses.length).to.equal(2);
      expect(factoryAddresses[0]).to.equal(setTokenFactory.address);
    });

    test('gets Set addresses', async () => {
      const setAddresses = await coreWrapper.getSetAddresses();

      expect(setAddresses.length).to.equal(1);
      expect(setAddresses[0]).to.equal(setToken.address);
    });

    test('gets is valid factory address', async () => {
      let isValidVaultAddress = await coreWrapper.validFactories(setTokenFactory.address);
      expect(isValidVaultAddress).to.equal(true);

      isValidVaultAddress = await coreWrapper.validFactories(NULL_ADDRESS);
      expect(isValidVaultAddress).to.equal(false);
    });

    test('gets is valid Set address', async () => {
      let isValidSetAddress = await coreWrapper.validSets(setToken.address);
      expect(isValidSetAddress).to.equal(true);

      isValidSetAddress = await coreWrapper.validSets(NULL_ADDRESS);
      expect(isValidSetAddress).to.equal(false);
    });
  });
});
