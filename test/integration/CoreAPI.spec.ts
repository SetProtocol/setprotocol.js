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
import * as ABIDecoder from 'abi-decoder';

import { Core, Vault } from 'set-protocol-contracts';

import {
  generateTimeStamp,
  hashOrderHex,
  signMessage,
} from 'set-protocol-utils';

import { ACCOUNTS } from '../accounts';
import { testSets, TestSet } from '../testSets';
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '../logs';
import { CoreAPI } from '../../src/api';
import {
  DetailedERC20Contract,
  VaultContract,
} from '../../src/contracts';
import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  NULL_ADDRESS,
} from '../../src/constants';
import { Web3Utils } from '../../src/util/Web3Utils';
import { BigNumber } from '../../src/util';
import {
  initializeCoreAPI,
  deploySetTokenFactory,
  deployTokensForSetWithApproval,
} from '../helpers/coreHelpers';

const contract = require('truffle-contract');

const { expect } = chai;

const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

const txDefaults = {
  from: ACCOUNTS[0].address,
  gasPrice: DEFAULT_GAS_PRICE,
  gas: DEFAULT_GAS_LIMIT,
};

const coreContract = contract(Core);
coreContract.setProvider(provider);
coreContract.defaults(txDefaults);

let currentSnapshotId: number;

describe('Core API', () => {
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

  test('CoreAPI can be instantiated', async () => {
    // deploy Core
    const coreInstance = await coreContract.new();
    expect(new CoreAPI(web3, coreInstance.address));
  });

  /* ============ Create ============ */

  describe('create', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );
    });

    test('creates a new set with valid parameters', async () => {
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
      await web3Utils.getTransactionReceiptAsync(txHash);

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal('SetTokenCreated');
    });
  });

  /* ============ Issue ============ */

  describe('issue', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
    });

    test('issues a new set with valid parameters', async () => {
      const txHash = await coreAPI.issue(ACCOUNTS[0].address, setTokenAddress, new BigNumber(100));
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal('IssuanceComponentDeposited');
    });
  });

  /* ============ Redeem ============ */

  describe('redeem', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      // Issue a Set to user
      await coreAPI.issue(ACCOUNTS[0].address, setTokenAddress, new BigNumber(100));
    });

    test('redeems a set with valid parameters', async () => {
      const tokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, txDefaults);
      expect(Number(await tokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address))).to.equal(100);
      txHash = await coreAPI.redeem(ACCOUNTS[0].address, setTokenAddress, new BigNumber(100));
      expect(Number(await tokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address))).to.equal(0);
    });
  });

  /* ============ Redeem and Withdraw ============ */

  describe('redeemAndWithdraw', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      // Issue a Set to user
      await coreAPI.issue(ACCOUNTS[0].address, setTokenAddress, new BigNumber(100));
    });

    test('redeems a set with valid parameters', async () => {
      const setTokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, txDefaults);
      const componentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[0],
        web3,
        txDefaults,
      );

      const oldComponentBalance = await componentTokenWrapper.balanceOf.callAsync(
        ACCOUNTS[0].address,
      );
      const quantity = new BigNumber(100);

      expect(Number(await setTokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address))).to.equal(100);
      await coreAPI.redeemAndWithdraw(
        ACCOUNTS[0].address,
        setTokenAddress,
        quantity,
        [componentAddresses[0]],
      );
      const componentTransferValue = quantity
        .div(setToCreate.naturalUnit)
        .mul(setToCreate.units[0]);
      const newComponentBalance = await componentTokenWrapper.balanceOf.callAsync(
        ACCOUNTS[0].address,
      );

      expect(Number(newComponentBalance)).to.equal(
        Number(oldComponentBalance.plus(componentTransferValue)),
      );
      expect(Number(await setTokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address))).to.equal(0);
    });
  });

  /* ============ Deposit ============ */

  describe('deposit', async () => {
    let coreAPI: CoreAPI;
    let tokenAddresses: Address[];
    let vaultWrapper: VaultContract;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);

      const setToCreate = testSets[0];
      tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      const vaultContract = contract(Vault);
      vaultContract.setProvider(provider);
      vaultContract.defaults(txDefaults);

      vaultWrapper = await VaultContract.at(coreAPI.vaultAddress, web3, txDefaults);
    });

    test('deposits a token into the vault with valid parameters', async () => {
      const tokenAddress = tokenAddresses[0];
      let userBalance = await vaultWrapper.getOwnerBalance.callAsync(
        ACCOUNTS[0].address,
        tokenAddress,
      );
      expect(Number(userBalance)).to.equal(0);
      await coreAPI.deposit(
        ACCOUNTS[0].address,
        tokenAddress,
        new BigNumber(100),
        txDefaults,
      );
      userBalance = await vaultWrapper.getOwnerBalance.callAsync(ACCOUNTS[0].address, tokenAddress);
      expect(Number(userBalance)).to.equal(100);
    });

    test('batch deposits tokens into the vault with valid parameters', async () => {
      const quantities = tokenAddresses.map(() => new BigNumber(100));
      await Promise.all(
        tokenAddresses.map(async tokenAddress => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            ACCOUNTS[0].address,
            tokenAddress,
          );
          expect(Number(userBalance)).to.equal(0);
        }),
      );
      await coreAPI.batchDeposit(
        ACCOUNTS[0].address,
        tokenAddresses,
        quantities,
        txDefaults,
      );
      await Promise.all(
        tokenAddresses.map(async tokenAddress => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            ACCOUNTS[0].address,
            tokenAddress,
          );
          expect(Number(userBalance)).to.equal(100);
        }),
      );
    });
  });

  describe('withdraw', async () => {
    let coreAPI: CoreAPI;
    let setToCreate: TestSet;
    let tokenAddresses: Address[];
    let vaultWrapper: VaultContract;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);

      setToCreate = testSets[0];
      tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      const vaultContract = contract(Vault);
      vaultContract.setProvider(provider);
      vaultContract.defaults(txDefaults);

      vaultWrapper = await VaultContract.at(coreAPI.vaultAddress, web3, txDefaults);

      // Batch deposits all the tokens
      const quantities = tokenAddresses.map(() => new BigNumber(100));
      await coreAPI.batchDeposit(
        ACCOUNTS[0].address,
        tokenAddresses,
        quantities,
        txDefaults,
      );
    });

    test('withdraws a token from the vault with valid parameters', async () => {
      const tokenAddress = tokenAddresses[0];
      let userVaultBalance = await vaultWrapper.getOwnerBalance.callAsync(
        ACCOUNTS[0].address,
        tokenAddress,
      );
      expect(Number(userVaultBalance)).to.equal(100);

      const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);
      const oldUserTokenBalance = await tokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address);

      await coreAPI.withdraw(
        ACCOUNTS[0].address,
        tokenAddress,
        new BigNumber(100),
        txDefaults,
      );

      const newUserTokenBalance = await tokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address);
      expect(Number(oldUserTokenBalance)).to.equal(Number(newUserTokenBalance.plus(100)));

      userVaultBalance = await vaultWrapper.getOwnerBalance.callAsync(
        ACCOUNTS[0].address,
        tokenAddress,
      );
      expect(Number(userVaultBalance)).to.equal(0);
    });

    test('batch withdraws tokens from the vault with valid parameters', async () => {
      const quantities = tokenAddresses.map(() => new BigNumber(100));
      const oldTokenBalances = [];
      await Promise.all(
        tokenAddresses.map(async tokenAddress => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            ACCOUNTS[0].address,
            tokenAddress,
          );

          const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);
          oldTokenBalances.push(await tokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address));
          expect(Number(userBalance)).to.equal(100);
        }),
      );
      await coreAPI.batchWithdraw(
        ACCOUNTS[0].address,
        tokenAddresses,
        quantities,
        txDefaults,
      );
      await Promise.all(
        tokenAddresses.map(async (tokenAddress, index) => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            ACCOUNTS[0].address,
            tokenAddress,
          );
          const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);
          expect(Number(await tokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address))).to.equal(
            Number(oldTokenBalances[index].plus(100)),
          );
          expect(Number(userBalance)).to.equal(0);
        }),
      );
    });
  });

  /* ============ Create Issuance Order ============ */

  describe('createIssuanceOrder', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
    });

    test('creates a new set with valid parameters', async () => {
      const order = {
        setAddress: setTokenAddress,
        quantity: new BigNumber(123),
        requiredComponents: componentAddresses,
        requiredComponentAmounts: componentAddresses.map(component => 1),
        makerAddress: ACCOUNTS[0].address,
        makerToken: componentAddresses[0],
        makerTokenAmount: new BigNumber(4),
        expiration: generateTimeStamp(60),
        relayerAddress: ACCOUNTS[1].address,
        relayerFeeBaseToken: componentAddresses[0],
        relayerFeeAmount: new BigNumber(1),
      };

      const signedIssuanceOrder = await coreAPI.createIssuanceOrder(
        setAddress: order.setAddress,
        quantity: order.quantity,
        requiredComponents: order.requiredComponents,
        requiredComponentAmounts: order.requiredComponentAmounts,
        makerAddress: order.makerAddress,
        makerToken: order.makerToken,
        makerTokenAmount: order.makerTokenAmount,
        expiration: order.expiration,
        relayerAddress: order.relayerAddress,
        relayerFeeBaseToken: order.relayerFeeBaseToken,
        relayerFeeAmount: order.relayerFeeAmount,
      );

      const orderWithSalt = Object.assign({}, order, { salt: signedIssuanceOrder.salt });

      const signature = await signMessage(hashOrderHex(orderWithSalt, order.makerAddress));

      expect(signature).to.equal(signedIssuanceOrder.signature);
    });
  });

  /* ============ Core State Getters ============ */
  describe('Core State Getters', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
    });

    /* Enable this when we add exchange functionality
     *
    test("gets exchange address", async () => {
      const exchangeId = 0;
      const exchangeAddress = await coreAPI.getExchangeAddress(exchangeId);
      // TODO: Fill the `equal` with an exchange address when we get exchange functionality working
      expect(exchangeAddress).to.equal();
    };
    */

    test('gets transfer proxy address', async () => {
      const transferProxyAddress = await coreAPI.getTransferProxyAddress();
      expect(coreAPI.transferProxyAddress).to.equal(transferProxyAddress);
    });

    test('gets vault address', async () => {
      const vaultAddress = await coreAPI.getVaultAddress();
      expect(coreAPI.vaultAddress).to.equal(vaultAddress);
    });

    test('gets factory addresses', async () => {
      const factoryAddresses = await coreAPI.getFactories();
      expect(factoryAddresses.length).to.equal(1);
      expect(factoryAddresses[0]).to.equal(setTokenFactoryAddress);
    });

    test('gets Set addresses', async () => {
      const setAddresses = await coreAPI.getSetAddresses();
      expect(setAddresses.length).to.equal(1);
      expect(setAddresses[0]).to.equal(setTokenAddress);
    });

    test('gets is valid factory address', async () => {
      let isValidVaultAddress = await coreAPI.getIsValidFactory(setTokenFactoryAddress);
      expect(isValidVaultAddress).to.equal(true);
      isValidVaultAddress = await coreAPI.getIsValidFactory(NULL_ADDRESS);
      expect(isValidVaultAddress).to.equal(false);
    });

    test('gets is valid Set address', async () => {
      let isValidSetAddress = await coreAPI.getIsValidSet(setTokenAddress);
      expect(isValidSetAddress).to.equal(true);
      isValidSetAddress = await coreAPI.getIsValidSet(NULL_ADDRESS);
      expect(isValidSetAddress).to.equal(false);
    });
  });
});
