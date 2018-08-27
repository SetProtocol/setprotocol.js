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
const setProtocolTestUTils = new SetProtocolTestUtils(web3);

const txDefaults = {
  from: DEFAULT_ACCOUNT,
  gasPrice: DEFAULT_GAS_PRICE,
  gas: DEFAULT_GAS_LIMIT,
};

const coreContract = contract(Core);
coreContract.setProvider(provider);
coreContract.defaults(txDefaults);

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
      const tokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, txDefaults);
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
      const setTokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, txDefaults);
      const componentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[1],
        web3,
        txDefaults,
      );
      const excludedComponentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[0],
        web3,
        txDefaults,
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
      const setTokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, txDefaults);
      const componentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[1],
        web3,
        txDefaults,
      );
      const excludedComponentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[0],
        web3,
        txDefaults,
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
      const setTokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, txDefaults);
      const componentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[1],
        web3,
        txDefaults,
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
    let tokenAddresses: Address[];
    let vaultWrapper: VaultContract;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);

      const setToCreate = testSets[0];
      tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      const vaultContract = contract(Vault);
      vaultContract.setProvider(provider);
      vaultContract.defaults(txDefaults);

      vaultWrapper = await VaultContract.at(coreWrapper.vaultAddress, web3, txDefaults);
    });

    test('deposits a token into the vault with valid parameters', async () => {
      const tokenAddress = tokenAddresses[0];
      let userBalance = await vaultWrapper.getOwnerBalance.callAsync(
        tokenAddress,
        DEFAULT_ACCOUNT,
      );
      expect(Number(userBalance)).to.equal(0);
      const txHash = await coreWrapper.singleDeposit(
        tokenAddress,
        new BigNumber(100),
        { from: DEFAULT_ACCOUNT },
      );
      await web3Utils.getTransactionReceiptAsync(txHash);

      userBalance = await vaultWrapper.getOwnerBalance.callAsync(tokenAddress, DEFAULT_ACCOUNT);
      expect(Number(userBalance)).to.equal(100);
    });

    test('batch deposits tokens into the vault with valid parameters', async () => {
      const quantities = tokenAddresses.map(() => new BigNumber(100));
      await Promise.all(
        tokenAddresses.map(async tokenAddress => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            tokenAddress,
            DEFAULT_ACCOUNT,
          );
          expect(Number(userBalance)).to.equal(0);
        }),
      );
      const txHash = await coreWrapper.batchDeposit(
        tokenAddresses,
        quantities,
        { from: DEFAULT_ACCOUNT },
      );
      await web3Utils.getTransactionReceiptAsync(txHash);

      await Promise.all(
        tokenAddresses.map(async tokenAddress => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            tokenAddress,
            DEFAULT_ACCOUNT,
          );
          expect(Number(userBalance)).to.equal(100);
        }),
      );
    });
  });

  /* ============ Full Deposit functioanlity ============ */

  describe('deposit', async () => {
    let coreWrapper: CoreWrapper;
    let tokenAddresses: Address[];
    let vaultWrapper: VaultContract;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);

      const setToCreate = testSets[0];
      tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      const vaultContract = contract(Vault);
      vaultContract.setProvider(provider);
      vaultContract.defaults(txDefaults);

      vaultWrapper = await VaultContract.at(coreWrapper.vaultAddress, web3, txDefaults);
    });

    test('deposits a token into the vault with valid parameters', async () => {
      const tokenAddress = tokenAddresses[0];
      let userBalance = await vaultWrapper.getOwnerBalance.callAsync(
        tokenAddress,
        DEFAULT_ACCOUNT,
      );
      expect(Number(userBalance)).to.equal(0);
      const txHash = await coreWrapper.deposit(
        [tokenAddress],
        [new BigNumber(100)],
        { from: DEFAULT_ACCOUNT },
      );
      await web3Utils.getTransactionReceiptAsync(txHash);

      userBalance = await vaultWrapper.getOwnerBalance.callAsync(tokenAddress, DEFAULT_ACCOUNT);
      expect(Number(userBalance)).to.equal(100);
    });

    test('batch deposits tokens into the vault with valid parameters', async () => {
      const quantities = tokenAddresses.map(() => new BigNumber(100));
      await Promise.all(
        tokenAddresses.map(async tokenAddress => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            tokenAddress,
            DEFAULT_ACCOUNT,
          );
          expect(Number(userBalance)).to.equal(0);
        }),
      );
      const txHash = await coreWrapper.deposit(
        tokenAddresses,
        quantities,
        { from: DEFAULT_ACCOUNT },
      );
      await web3Utils.getTransactionReceiptAsync(txHash);

      await Promise.all(
        tokenAddresses.map(async tokenAddress => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            tokenAddress,
            DEFAULT_ACCOUNT,
          );
          expect(Number(userBalance)).to.equal(100);
        }),
      );
    });
  });

  /* ============ Withdraw ============ */

  describe('singleWithdraw', async () => {
    let coreWrapper: CoreWrapper;
    let setToCreate: TestSet;
    let tokenAddresses: Address[];
    let vaultWrapper: VaultContract;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);

      setToCreate = testSets[0];
      tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      const vaultContract = contract(Vault);
      vaultContract.setProvider(provider);
      vaultContract.defaults(txDefaults);

      vaultWrapper = await VaultContract.at(coreWrapper.vaultAddress, web3, txDefaults);

      // Batch deposits all the tokens
      const quantities = tokenAddresses.map(() => new BigNumber(100));
      await coreWrapper.batchDeposit(
        tokenAddresses,
        quantities,
        { from: DEFAULT_ACCOUNT },
      );
    });

    test('withdraws a token from the vault with valid parameters', async () => {
      const tokenAddress = tokenAddresses[0];
      let userVaultBalance = await vaultWrapper.getOwnerBalance.callAsync(
        tokenAddress,
        DEFAULT_ACCOUNT,
      );
      expect(Number(userVaultBalance)).to.equal(100);

      const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);
      const oldUserTokenBalance = await tokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT);

      await coreWrapper.singleWithdraw(
        tokenAddress,
        new BigNumber(100),
        { from: DEFAULT_ACCOUNT },
      );

      const newUserTokenBalance = await tokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT);
      expect(Number(oldUserTokenBalance)).to.equal(Number(newUserTokenBalance.plus(100)));

      userVaultBalance = await vaultWrapper.getOwnerBalance.callAsync(
        tokenAddress,
        DEFAULT_ACCOUNT,
      );
      expect(Number(userVaultBalance)).to.equal(0);
    });

    test('batch withdraws tokens from the vault with valid parameters', async () => {
      const quantities = tokenAddresses.map(() => new BigNumber(100));
      const oldTokenBalances: BigNumber[] = tokenAddresses.map(() => ZERO);
      await Promise.all(
        tokenAddresses.map(async (tokenAddress, index) => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            tokenAddress,
            DEFAULT_ACCOUNT,
          );

          const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);
          const balance = await tokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT);

          oldTokenBalances[index] = balance;
          expect(Number(userBalance)).to.equal(100);
        }),
      );
      const txHash = await coreWrapper.batchWithdraw(
        tokenAddresses,
        quantities,
        { from: DEFAULT_ACCOUNT },
      );
      const receipt = await web3Utils.getTransactionReceiptAsync(txHash);

      await Promise.all(
        tokenAddresses.map(async (tokenAddress, index) => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            tokenAddress,
            DEFAULT_ACCOUNT,
          );
          const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);

          const balance = await tokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT);

          expect(Number(balance)).to.equal(
            Number(oldTokenBalances[index].plus(100)),
          );
          expect(Number(userBalance)).to.equal(0);
        }),
      );
    });
  });

  /* ============ Full Withdraw functionality ============ */

  describe('withdraw', async () => {
    let coreWrapper: CoreWrapper;
    let setToCreate: TestSet;
    let tokenAddresses: Address[];
    let vaultWrapper: VaultContract;

    beforeEach(async () => {
      coreWrapper = await initializeCoreWrapper(provider);

      setToCreate = testSets[0];
      tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );

      const vaultContract = contract(Vault);
      vaultContract.setProvider(provider);
      vaultContract.defaults(txDefaults);

      vaultWrapper = await VaultContract.at(coreWrapper.vaultAddress, web3, txDefaults);

      // Batch deposits all the tokens
      const quantities = tokenAddresses.map(() => new BigNumber(100));
      await coreWrapper.batchDeposit(
        tokenAddresses,
        quantities,
        { from: DEFAULT_ACCOUNT },
      );
    });

    test('withdraws a token from the vault with valid parameters', async () => {
      const tokenAddress = tokenAddresses[0];
      let userVaultBalance = await vaultWrapper.getOwnerBalance.callAsync(
        tokenAddress,
        DEFAULT_ACCOUNT,
      );
      expect(Number(userVaultBalance)).to.equal(100);

      const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);
      const oldUserTokenBalance = await tokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT);

      await coreWrapper.withdraw(
        [tokenAddress],
        [new BigNumber(100)],
        { from: DEFAULT_ACCOUNT },
      );

      const newUserTokenBalance = await tokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT);
      expect(Number(oldUserTokenBalance)).to.equal(Number(newUserTokenBalance.plus(100)));

      userVaultBalance = await vaultWrapper.getOwnerBalance.callAsync(
        tokenAddress,
        DEFAULT_ACCOUNT,
      );
      expect(Number(userVaultBalance)).to.equal(0);
    });

    test('batch withdraws tokens from the vault with valid parameters', async () => {
      const quantities = tokenAddresses.map(() => new BigNumber(100));
      const oldTokenBalances: BigNumber[] = tokenAddresses.map(() => ZERO);
      await Promise.all(
        tokenAddresses.map(async (tokenAddress, index) => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            tokenAddress,
            DEFAULT_ACCOUNT,
          );

          const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);
          const balance = await tokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT);

          oldTokenBalances[index] = balance;
          expect(Number(userBalance)).to.equal(100);
        }),
      );
      const txHash = await coreWrapper.withdraw(
        tokenAddresses,
        quantities,
        { from: DEFAULT_ACCOUNT },
      );
      const receipt = await web3Utils.getTransactionReceiptAsync(txHash);

      await Promise.all(
        tokenAddresses.map(async (tokenAddress, index) => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            tokenAddress,
            DEFAULT_ACCOUNT,
          );
          const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);

          const balance = await tokenWrapper.balanceOf.callAsync(DEFAULT_ACCOUNT);

          expect(Number(balance)).to.equal(
            Number(oldTokenBalances[index].plus(100)),
          );
          expect(Number(userBalance)).to.equal(0);
        }),
      );
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

      const coreInstance = await CoreContract.at(coreWrapper.coreAddress, web3, txDefaults);
      const zeroExExchangeWrapperInstance = await ZeroExExchangeWrapperContract.at(
        zeroExExchangeWrapperAddress,
        web3,
        txDefaults,
      );

      await zeroExExchangeWrapperInstance.addAuthorizedAddress.sendTransactionAsync(
        coreWrapper.coreAddress,
        txDefaults,
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

      const coreInstance = await CoreContract.at(coreWrapper.coreAddress, web3, txDefaults);

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

      const coreInstance = await CoreContract.at(coreWrapper.coreAddress, web3, txDefaults);

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
      let isValidVaultAddress = await coreWrapper.getIsValidFactory(setTokenFactoryAddress);
      expect(isValidVaultAddress).to.equal(true);
      isValidVaultAddress = await coreWrapper.getIsValidFactory(NULL_ADDRESS);
      expect(isValidVaultAddress).to.equal(false);
    });

    test('gets is valid Set address', async () => {
      let isValidSetAddress = await coreWrapper.getIsValidSet(setTokenAddress);
      expect(isValidSetAddress).to.equal(true);
      isValidSetAddress = await coreWrapper.getIsValidSet(NULL_ADDRESS);
      expect(isValidSetAddress).to.equal(false);
    });
  });
});
