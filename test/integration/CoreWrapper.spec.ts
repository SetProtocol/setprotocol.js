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

import * as chai from 'chai';
import * as Web3 from 'web3';
import * as _ from 'lodash';
import * as ABIDecoder from 'abi-decoder';
import * as ethUtil from 'ethereumjs-util';

import { Core, Vault } from 'set-protocol-contracts';
import {
  Address,
  Bytes,
  SetProtocolTestUtils,
  SetProtocolUtils,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '../accounts';
import { testSets, TestSet } from '../testSets';
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '../logs';
import { CoreWrapper } from '../../src/wrappers';
import {
  DetailedERC20Contract,
  VaultContract,
  CoreContract,
  ZeroExExchangeWrapperContract,
} from 'set-protocol-contracts';
import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
} from '../../src/constants';
import { Web3Utils } from '../../src/util/Web3Utils';
import { BigNumber } from '../../src/util';
import {
  approveForFill,
  approveForZeroEx,
  deploySetTokenFactory,
  deployTokensForSetWithApproval,
  initializeCoreWrapper,
  registerExchange,
} from '../helpers/coreHelpers';
import { deployVaultContract, getVaultBalances } from '../helpers/vaultHelpers';
import {
  deployTakerWalletExchangeWrapper,
  deployZeroExExchangeWrapper,
} from '../helpers/exchangeHelpers';

const contract = require('truffle-contract');

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));

const { expect } = chai;

const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const setProtocolUtils = new SetProtocolUtils(web3);
const setProtocolTestUtils = new SetProtocolTestUtils(web3);

const coreContract = contract(Core);
coreContract.setProvider(provider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('CoreWrapper', () => {
  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  test('CoreWrapper can be instantiated', async () => {
    const coreWrapper = await initializeCoreWrapper(provider);
    expect(coreWrapper.coreAddress);
  });

  /* ============ Create ============ */

  describe('createSet', async () => {
    let coreWrapper: CoreWrapper;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );
    });

    test('creates a new set with valid parameters', async () => {
      const txHash = await coreWrapper.createSet(
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal('SetTokenCreated');
    });
  });

  /* ============ getSetAddressFromCreateTxHashAsync ============ */

  describe('getSetAddressFromCreateTxHashAsync', async () => {
    let coreWrapper: CoreWrapper;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let subjectTxHash: Bytes;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      subjectTxHash = await coreWrapper.createSet(
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );
    });

    test('retrieves the correct set address', async () => {
      const resultAddress = await coreWrapper.getSetAddressFromCreateTxHashAsync(subjectTxHash);

      const formattedLogs = await getFormattedLogsFromTxHash(web3, subjectTxHash);
      const expectedAddress = formattedLogs[0].args._setTokenAddress;
      expect(resultAddress).to.equal(expectedAddress);
    });
  });

  /* ============ Issue ============ */

  describe('issue', async () => {
    let coreWrapper: CoreWrapper;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreWrapper.createSet(
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
    });

    test('issues a new set with valid parameters', async () => {
      const txHash = await coreWrapper.issue(setTokenAddress, new BigNumber(100), { from: DEFAULT_ACCOUNT });
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal('IssuanceComponentDeposited');
    });
  });

  /* ============ Redeem ============ */

  describe('redeem', async () => {
    let coreWrapper: CoreWrapper;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreWrapper.createSet(
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      // Issue a Set to user
      await coreWrapper.issue(setTokenAddress, new BigNumber(100), { from: DEFAULT_ACCOUNT });
    });

    test('redeems a set with valid parameters', async () => {
      const tokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, TX_DEFAULTS);
      expect(Number(await tokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT))).to.equal(100);
      await coreWrapper.redeemToVault(setTokenAddress, new BigNumber(100), { from: DEFAULT_ACCOUNT });
      expect(Number(await tokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT))).to.equal(0);
    });
  });

  /* ============ Redeem and Withdraw ============ */

  describe('redeemAndWithdraw', async () => {
    let coreWrapper: CoreWrapper;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreWrapper.createSet(
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      // Issue a Set to user
      await coreWrapper.issue(setTokenAddress, new BigNumber(100), { from: DEFAULT_ACCOUNT });
    });

    test('redeems a set with valid parameters', async () => {
      const setTokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, TX_DEFAULTS);
      const componentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[1],
        web3,
        TX_DEFAULTS,
      );
      const excludedComponentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[0],
        web3,
        TX_DEFAULTS,
      );

      const oldComponentBalance = await componentTokenWrapper.balanceOf.callAsync(
        DEFAULT_ACCOUNT,
      );
      const excludedOldComponentBalance = await excludedComponentTokenWrapper.balanceOf.callAsync(
        DEFAULT_ACCOUNT,
      );
      const quantity = new BigNumber(100);

      expect(Number(await setTokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT))).to.equal(100);
      await coreWrapper.redeemAndWithdraw(
        setTokenAddress,
        quantity,
        [excludedComponentTokenWrapper.address],
        { from: DEFAULT_ACCOUNT },
      );
      const componentTransferValue = quantity
        .div(setToCreate.naturalUnit)
        .mul(setToCreate.units[0]);

      const newComponentBalance = await componentTokenWrapper.balanceOf.callAsync(
        DEFAULT_ACCOUNT,
      );
      const excludedNewComponentBalance = await excludedComponentTokenWrapper.balanceOf.callAsync(
        DEFAULT_ACCOUNT,
      );

      expect(newComponentBalance).to.bignumber.equal(
        oldComponentBalance.plus(componentTransferValue),
      );
      expect(excludedNewComponentBalance).to.bignumber.equal(
        excludedOldComponentBalance
      );
      expect(Number(await setTokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT))).to.equal(0);
    });
  });

  /* ============ Full Redeem functionality ============ */

  describe('redeem', async () => {
    let coreWrapper: CoreWrapper;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreWrapper.createSet(
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      // Issue a Set to user
      await coreWrapper.issue(setTokenAddress, new BigNumber(100), { from: DEFAULT_ACCOUNT });
    });

    test('redeems a set with valid parameters and withdraws when withdraw is true', async () => {
      const setTokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, TX_DEFAULTS);
      const componentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[1],
        web3,
        TX_DEFAULTS,
      );
      const excludedComponentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[0],
        web3,
        TX_DEFAULTS,
      );

      const oldComponentBalance = await componentTokenWrapper.balanceOf.callAsync(
        DEFAULT_ACCOUNT,
      );
      const excludedOldComponentBalance = await excludedComponentTokenWrapper.balanceOf.callAsync(
        DEFAULT_ACCOUNT,
      );
      const quantity = new BigNumber(100);

      expect(Number(await setTokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT))).to.equal(100);
      await coreWrapper.redeem(
        setTokenAddress,
        quantity,
        true,
        [excludedComponentTokenWrapper.address],
        { from: DEFAULT_ACCOUNT },
      );
      const componentTransferValue = quantity
        .div(setToCreate.naturalUnit)
        .mul(setToCreate.units[0]);

      const newComponentBalance = await componentTokenWrapper.balanceOf.callAsync(
        DEFAULT_ACCOUNT,
      );
      const excludedNewComponentBalance = await excludedComponentTokenWrapper.balanceOf.callAsync(
        DEFAULT_ACCOUNT,
      );

      expect(newComponentBalance).to.bignumber.equal(
        oldComponentBalance.plus(componentTransferValue),
      );
      expect(excludedNewComponentBalance).to.bignumber.equal(
        excludedOldComponentBalance
      );
      expect(Number(await setTokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT))).to.equal(0);
    });

    test('redeems a set and does not withdraw when withdraw is false', async () => {
      const setTokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, TX_DEFAULTS);
      const componentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[1],
        web3,
        TX_DEFAULTS,
      );
      const oldComponentBalance = await componentTokenWrapper.balanceOf.callAsync(
        DEFAULT_ACCOUNT,
      );
      const quantity = new BigNumber(100);

      expect(Number(await setTokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT))).to.equal(100);
      await coreWrapper.redeem(
        setTokenAddress,
        quantity,
        false,
        [],
        { from: DEFAULT_ACCOUNT },
      );
      const componentTransferValue = quantity
        .div(setToCreate.naturalUnit)
        .mul(setToCreate.units[0]);

      const newComponentBalance = await componentTokenWrapper.balanceOf.callAsync(
        DEFAULT_ACCOUNT,
      );
      expect(newComponentBalance).to.bignumber.equal(oldComponentBalance);
      expect(Number(await setTokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT))).to.equal(0);
    });
  });

  /* ============ Deposit ============ */

  describe('deposit', async () => {
    let coreWrapper: CoreWrapper;
    let vault: VaultContract;
    let depositQuantity: BigNumber;

    let subjectTokenAddressToDeposit: Address;
    let subjectQuantityToDeposit: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      vault = await deployVaultContract(provider, coreWrapper.vaultAddress);

      const setToCreate = testSets[0];
      const tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      depositQuantity = new BigNumber(100);

      subjectTokenAddressToDeposit = _.first(tokenAddresses);
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
    let coreWrapper: CoreWrapper;
    let vault: VaultContract;
    let depositQuantity: BigNumber;

    let subjectTokenAddressesToDeposit: Address[];
    let subjectQuantitesToWithdraw: BigNumber[];
    let subjectCaller: Address;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      vault = await deployVaultContract(provider, coreWrapper.vaultAddress);

      const setToCreate = testSets[0];
      const tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      depositQuantity = new BigNumber(100);

      subjectTokenAddressesToDeposit = tokenAddresses;
      subjectQuantitesToWithdraw = tokenAddresses.map(() => depositQuantity);
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

  /* ============ Withdraw ============ */

  describe('withdraw', async () => {
    let coreWrapper: CoreWrapper;
    let vault: VaultContract;
    let withdrawQuantity: BigNumber;

    let subjectTokenAddressToWithdraw: Address;
    let subjectQuantityToWithdraw: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      vault = await deployVaultContract(provider, coreWrapper.vaultAddress);

      const setToCreate = testSets[0];
      const tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      withdrawQuantity = new BigNumber(100);
      const quantitesToDeposit = tokenAddresses.map(() => withdrawQuantity);
      await coreWrapper.batchDeposit(
        tokenAddresses,
        quantitesToDeposit,
        { from: DEFAULT_ACCOUNT },
      );

      subjectTokenAddressToWithdraw = _.first(tokenAddresses);
      subjectQuantityToWithdraw = _.first(quantitesToDeposit);
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
    let coreWrapper: CoreWrapper;
    let vault: VaultContract;
    let withdrawQuantity: BigNumber;

    let subjectTokenAddressesToWithdraw: Address[];
    let subjectQuantitesToWithdraw: BigNumber[];
    let subjectCaller: Address;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      vault = await deployVaultContract(provider, coreWrapper.vaultAddress);

      const setToCreate = testSets[0];
      const tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

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

  /* ============ Create Issuance Order ============ */

  describe('createOrder', async () => {
    let coreWrapper: CoreWrapper;
    let setTokenFactoryAddress: Address;
    let setTokenAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreWrapper.createSet(
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
    });

    test('creates a new issuance order with valid parameters', async () => {
      const order = {
        setAddress: setTokenAddress,
        quantity: new BigNumber(123),
        requiredComponents: componentAddresses,
        requiredComponentAmounts: componentAddresses.map(() => new BigNumber(1)),
        makerAddress: DEFAULT_ACCOUNT,
        makerToken: componentAddresses[0],
        makerTokenAmount: new BigNumber(4),
        expiration: SetProtocolUtils.generateTimestamp(60),
        relayerAddress: ACCOUNTS[1].address,
        relayerToken: componentAddresses[0],
        makerRelayerFee: new BigNumber(1),
        takerRelayerFee: new BigNumber(1),
      };

      const signedIssuanceOrder = await coreWrapper.createOrder(
        order.setAddress,
        order.quantity,
        order.requiredComponents,
        order.requiredComponentAmounts,
        order.makerAddress,
        order.makerToken,
        order.makerTokenAmount,
        order.expiration,
        order.relayerAddress,
        order.relayerToken,
        order.makerRelayerFee,
        order.takerRelayerFee,
      );

      const orderWithSalt = Object.assign({}, order, { salt: signedIssuanceOrder.salt });

      const signature = await setProtocolUtils.signMessage(
        SetProtocolUtils.hashOrderHex(orderWithSalt),
        order.makerAddress,
      );

      expect(signature).to.deep.equal(signedIssuanceOrder.signature);
    });
  });

  /* ============ Fill Issuance Order ============ */

  describe('fillOrder', async () => {
    let coreWrapper: CoreWrapper;
    let setTokenFactoryAddress: Address;
    let setTokenAddress: Address;
    let takerWalletWrapperAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);
      takerWalletWrapperAddress = await deployTakerWalletExchangeWrapper(
        coreWrapper.transferProxyAddress,
        coreWrapper.coreAddress,
        provider,
      );

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreWrapper.createSet(
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
    });

    test('fills an issuance order with valid parameters with 0x orders', async () => {
      const order = {
        setAddress: setTokenAddress,
        quantity: new BigNumber(20),
        requiredComponents: componentAddresses,
        requiredComponentAmounts: componentAddresses.map(() => new BigNumber(20)),
        makerAddress: DEFAULT_ACCOUNT,
        makerToken: componentAddresses[0],
        makerTokenAmount: new BigNumber(20),
        expiration: SetProtocolUtils.generateTimestamp(60),
        relayerAddress: ACCOUNTS[1].address,
        relayerToken: componentAddresses[0],
        makerRelayerFee: new BigNumber(6),
        takerRelayerFee: new BigNumber(6),
      };
      const takerAddress = ACCOUNTS[2].address;
      const zeroExMakerAddress = ACCOUNTS[3].address;

      const signedIssuanceOrder = await coreWrapper.createOrder(
        order.setAddress,
        order.quantity,
        order.requiredComponents,
        order.requiredComponentAmounts,
        order.makerAddress,
        order.makerToken,
        order.makerTokenAmount,
        order.expiration,
        order.relayerAddress,
        order.relayerToken,
        order.makerRelayerFee,
        order.takerRelayerFee,
      );

      // Deploy and register 0x wrapper
      const zeroExExchangeWrapperAddress = await deployZeroExExchangeWrapper(
        SetProtocolTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
        SetProtocolTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        coreWrapper.transferProxyAddress,
        provider,
      );

      await registerExchange(
        web3,
        coreWrapper.coreAddress,
        SetProtocolUtils.EXCHANGES.ZERO_EX,
        zeroExExchangeWrapperAddress,
      );

      const coreInstance = await CoreContract.at(coreWrapper.coreAddress, web3, TX_DEFAULTS);
      const zeroExExchangeWrapperInstance = await ZeroExExchangeWrapperContract.at(
        zeroExExchangeWrapperAddress,
        web3,
        TX_DEFAULTS,
      );

      await zeroExExchangeWrapperInstance.addAuthorizedAddress.sendTransactionAsync(
        coreWrapper.coreAddress,
        TX_DEFAULTS,
      );

      const {
        makerAddress,
        makerToken,
        makerTokenAmount,
        relayerAddress,
        relayerToken,
      } = signedIssuanceOrder;

      await approveForFill(
        web3,
        componentAddresses,
        makerAddress,
        relayerAddress,
        takerAddress,
        coreWrapper.transferProxyAddress,
      );

      await approveForZeroEx(
        web3,
        componentAddresses,
        zeroExMakerAddress,
        takerAddress,
      );

      const defaultZeroExOrderTakerTokenAmount = new BigNumber(10);
      const zeroExOrder: ZeroExSignedFillOrder = await setProtocolUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                       // senderAddress
        zeroExMakerAddress,                 // makerAddress
        NULL_ADDRESS,                       // takerAddress
        ZERO,                               // makerFee
        ZERO,                               // takerFee
        order.requiredComponentAmounts[0],  // makerAssetAmount, full amount of first component needed for issuance
        defaultZeroExOrderTakerTokenAmount, // takerAssetAmount
        componentAddresses[0],              // makerAssetAddress
        makerToken,                         // takerAssetAddress
        SetProtocolUtils.generateSalt(),               // salt
        SetProtocolTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
        NULL_ADDRESS,                       // feeRecipientAddress
        SetProtocolUtils.generateTimestamp(10),         // expirationTimeSeconds
        defaultZeroExOrderTakerTokenAmount,  // fillAmount
      );

      // Second 0x order
      const secondZeroExOrderTakerTokenAmount = new BigNumber(10);
      const secondZeroExOrder: ZeroExSignedFillOrder = await setProtocolUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                       // senderAddress
        zeroExMakerAddress,                 // makerAddress
        NULL_ADDRESS,                       // takerAddress
        ZERO,                               // makerFee
        ZERO,                               // takerFee
        order.requiredComponentAmounts[1],  // makerAssetAmount, full amount of second component needed for issuance
        secondZeroExOrderTakerTokenAmount,  // takerAssetAmount
        componentAddresses[1],              // makerAssetAddress
        makerToken,                         // takerAssetAddress
        SetProtocolUtils.generateSalt(),               // salt
        SetProtocolTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
        NULL_ADDRESS,                       // feeRecipientAddress
        SetProtocolUtils.generateTimestamp(10),         // expirationTimeSeconds
        secondZeroExOrderTakerTokenAmount,  // fillAmount
      );
      const zeroExExchangeOrders = [
        zeroExOrder,
        secondZeroExOrder,
      ];

      const quantityToFill = new BigNumber(20);
      const txHash = await coreWrapper.fillOrder(
        signedIssuanceOrder,
        quantityToFill,
        zeroExExchangeOrders,
        { from: takerAddress },
      );

      const orderWithSalt = Object.assign({}, order, { salt: signedIssuanceOrder.salt });
      const orderFillsAmount =
        await coreInstance.orderFills.callAsync(SetProtocolUtils.hashOrderHex(orderWithSalt));

      expect(quantityToFill.toNumber()).to.equal(orderFillsAmount.toNumber());

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal('LogFill');
    });

    test('fills an issuance order with valid parameters with taker wallet orders', async () => {
      const order = {
        setAddress: setTokenAddress,
        quantity: new BigNumber(80),
        requiredComponents: componentAddresses,
        requiredComponentAmounts: componentAddresses.map(() => new BigNumber(20)),
        makerAddress: DEFAULT_ACCOUNT,
        makerToken: componentAddresses[0],
        makerTokenAmount: new BigNumber(6),
        expiration: SetProtocolUtils.generateTimestamp(60),
        relayerAddress: ACCOUNTS[1].address,
        relayerToken: componentAddresses[0],
        makerRelayerFee: new BigNumber(6),
        takerRelayerFee: new BigNumber(6),
      };
      const takerAddress = ACCOUNTS[2].address;

      const signedIssuanceOrder = await coreWrapper.createOrder(
        order.setAddress,
        order.quantity,
        order.requiredComponents,
        order.requiredComponentAmounts,
        order.makerAddress,
        order.makerToken,
        order.makerTokenAmount,
        order.expiration,
        order.relayerAddress,
        order.relayerToken,
        order.makerRelayerFee,
        order.takerRelayerFee,
      );

      const {
        makerAddress,
        makerToken,
        makerTokenAmount,
        relayerAddress,
        relayerToken,
      } = signedIssuanceOrder;

      await approveForFill(
        web3,
        componentAddresses,
        makerAddress,
        relayerAddress,
        takerAddress,
        coreWrapper.transferProxyAddress,
      );

      await registerExchange(
        web3,
        coreWrapper.coreAddress,
        SetProtocolUtils.EXCHANGES.TAKER_WALLET,
        takerWalletWrapperAddress
      );

      const takerWalletOrders = _.map(componentAddresses, componentAddress => (
        {
          takerTokenAddress: componentAddress,
          takerTokenAmount: new BigNumber(20),
        }
      ));
      const quantityToFill = new BigNumber(40);
      const txHash = await coreWrapper.fillOrder(
        signedIssuanceOrder,
        quantityToFill,
        takerWalletOrders,
        { from: takerAddress },
      );

      const coreInstance = await CoreContract.at(coreWrapper.coreAddress, web3, TX_DEFAULTS);

      const orderWithSalt = Object.assign({}, order, { salt: signedIssuanceOrder.salt });
      const orderFillsAmount =
        await coreInstance.orderFills.callAsync(SetProtocolUtils.hashOrderHex(orderWithSalt));

      expect(quantityToFill.toNumber()).to.equal(orderFillsAmount.toNumber());

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal('LogFill');
    });
  });

  /* ============ Cancel Issuance Order ============ */

  describe('cancelOrder', async () => {
    let coreWrapper: CoreWrapper;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreWrapper.createSet(
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
    });

    test('cancels an issuance order with valid parameters', async () => {
      const order = {
        setAddress: setTokenAddress,
        quantity: new BigNumber(100),
        requiredComponents: componentAddresses,
        requiredComponentAmounts: componentAddresses.map(() => new BigNumber(1)),
        makerAddress: DEFAULT_ACCOUNT,
        makerToken: componentAddresses[0],
        makerTokenAmount: new BigNumber(4),
        expiration: SetProtocolUtils.generateTimestamp(60),
        relayerAddress: ACCOUNTS[1].address,
        relayerToken: componentAddresses[0],
        makerRelayerFee: new BigNumber(1),
        takerRelayerFee: new BigNumber(1),
      };

      const signedIssuanceOrder = await coreWrapper.createOrder(
        order.setAddress,
        order.quantity,
        order.requiredComponents,
        order.requiredComponentAmounts,
        order.makerAddress,
        order.makerToken,
        order.makerTokenAmount,
        order.expiration,
        order.relayerAddress,
        order.relayerToken,
        order.makerRelayerFee,
        order.takerRelayerFee,
      );

      const orderWithSalt = Object.assign({}, order, { salt: signedIssuanceOrder.salt });

      const quantityToCancel = new BigNumber(10);

      const txHash = await coreWrapper.cancelOrder(
        orderWithSalt,
        quantityToCancel,
        { from: DEFAULT_ACCOUNT },
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);

      const coreInstance = await CoreContract.at(coreWrapper.coreAddress, web3, TX_DEFAULTS);

      const orderCancelsAmount =
        await coreInstance.orderCancels.callAsync(SetProtocolUtils.hashOrderHex(orderWithSalt));

      expect(quantityToCancel.toNumber()).to.equal(orderCancelsAmount.toNumber());
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal('LogCancel');
    });
  });

  /* ============ Core State Getters ============ */
  describe('Core State Getters', async () => {
    let coreWrapper: CoreWrapper;
    let setTokenFactoryAddress: Address;
    let setTokenAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreWrapper.createSet(
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
    });

    test('gets exchange address', async () => {
      const takerWalletWrapperAddress = await deployTakerWalletExchangeWrapper(
        coreWrapper.transferProxyAddress,
        coreWrapper.coreAddress,
        provider,
      );

      await registerExchange(
        web3,
        coreWrapper.coreAddress,
        SetProtocolUtils.EXCHANGES.TAKER_WALLET,
        takerWalletWrapperAddress
      );

      const exchangeAddress = await coreWrapper.getExchangeAddress(
        SetProtocolUtils.EXCHANGES.TAKER_WALLET,
      );
      expect(exchangeAddress).to.equal(takerWalletWrapperAddress);
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
      expect(factoryAddresses.length).to.equal(1);
      expect(factoryAddresses[0]).to.equal(setTokenFactoryAddress);
    });

    test('gets Set addresses', async () => {
      const setAddresses = await coreWrapper.getSetAddresses();
      expect(setAddresses.length).to.equal(1);
      expect(setAddresses[0]).to.equal(setTokenAddress);
    });

    test('gets is valid factory address', async () => {
      let isValidVaultAddress = await coreWrapper.isValidFactoryAsync(setTokenFactoryAddress);
      expect(isValidVaultAddress).to.equal(true);
      isValidVaultAddress = await coreWrapper.isValidFactoryAsync(NULL_ADDRESS);
      expect(isValidVaultAddress).to.equal(false);
    });

    test('gets is valid Set address', async () => {
      let isValidSetAddress = await coreWrapper.isValidSetAsync(setTokenAddress);
      expect(isValidSetAddress).to.equal(true);
      isValidSetAddress = await coreWrapper.isValidSetAsync(NULL_ADDRESS);
      expect(isValidSetAddress).to.equal(false);
    });
  });
});
