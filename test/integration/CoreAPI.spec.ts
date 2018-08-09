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
import { SetProtocolUtils, Address } from 'set-protocol-utils';

import { ACCOUNTS } from '../accounts';
import { testSets, TestSet } from '../testSets';
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '../logs';
import { CoreAPI } from '../../src/api';
import {
  DetailedERC20Contract,
  VaultContract,
  CoreContract,
} from '../../src/contracts';
import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  NULL_ADDRESS,
  ZERO,
} from '../../src/constants';
import { Web3Utils } from '../../src/util/Web3Utils';
import { BigNumber } from '../../src/util';
import {
  initializeCoreAPI,
  deploySetTokenFactory,
  deployTokensForSetWithApproval,
  approveForFill,
  registerExchange,
} from '../helpers/coreHelpers';
import {
  deployTakerWalletExchangeWrapper,
} from '../helpers/exchangeHelpers';

const contract = require('truffle-contract');

const { expect } = chai;

const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const setProtocolUtils = new SetProtocolUtils(web3);

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
    const coreAPI = await initializeCoreAPI(provider);
    expect(coreAPI.coreAddress);
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
      await coreAPI.redeem(ACCOUNTS[0].address, setTokenAddress, new BigNumber(100));
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
      const txHash = await coreAPI.deposit(
        ACCOUNTS[0].address,
        tokenAddress,
        new BigNumber(100),
        txDefaults,
      );
      await web3Utils.getTransactionReceiptAsync(txHash);

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
      const txHash = await coreAPI.batchDeposit(
        ACCOUNTS[0].address,
        tokenAddresses,
        quantities,
        txDefaults,
      );
      await web3Utils.getTransactionReceiptAsync(txHash);

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
      const oldTokenBalances: BigNumber[] = tokenAddresses.map(() => ZERO);
      await Promise.all(
        tokenAddresses.map(async (tokenAddress, index) => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            ACCOUNTS[0].address,
            tokenAddress,
          );

          const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);
          const balance = await tokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address);

          oldTokenBalances[index] = balance;
          expect(Number(userBalance)).to.equal(100);
        }),
      );
      const txHash = await coreAPI.batchWithdraw(
        ACCOUNTS[0].address,
        tokenAddresses,
        quantities,
        txDefaults,
      );
      const receipt = await web3Utils.getTransactionReceiptAsync(txHash);

      await Promise.all(
        tokenAddresses.map(async (tokenAddress, index) => {
          const userBalance: BigNumber = await vaultWrapper.getOwnerBalance.callAsync(
            ACCOUNTS[0].address,
            tokenAddress,
          );
          const tokenWrapper = await DetailedERC20Contract.at(tokenAddress, web3, txDefaults);

          const balance = await tokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address);

          expect(Number(balance)).to.equal(
            Number(oldTokenBalances[index].plus(100)),
          );
          expect(Number(userBalance)).to.equal(0);
        }),
      );
    });
  });

  /* ============ Create Issuance Order ============ */

  describe('createSignedIssuanceOrder', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setTokenAddress: Address;
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

    test('creates a new issuance order with valid parameters', async () => {
      const order = {
        setAddress: setTokenAddress,
        quantity: new BigNumber(123),
        requiredComponents: componentAddresses,
        requiredComponentAmounts: componentAddresses.map(() => new BigNumber(1)),
        makerAddress: ACCOUNTS[0].address,
        makerToken: componentAddresses[0],
        makerTokenAmount: new BigNumber(4),
        expiration: SetProtocolUtils.generateTimestamp(60),
        relayerAddress: ACCOUNTS[1].address,
        relayerToken: componentAddresses[0],
        makerRelayerFee: new BigNumber(1),
        takerRelayerFee: new BigNumber(1),
      };

      const signedIssuanceOrder = await coreAPI.createSignedIssuanceOrder(
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

  describe('fillIssuanceOrder', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setTokenAddress: Address;
    let takerWalletWrapperAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);
      takerWalletWrapperAddress = await deployTakerWalletExchangeWrapper(
        coreAPI.transferProxyAddress,
        coreAPI.coreAddress,
        provider,
      );

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

    test('fills an issuance order with valid parameters', async () => {
      const order = {
        setAddress: setTokenAddress,
        quantity: new BigNumber(80),
        requiredComponents: componentAddresses,
        requiredComponentAmounts: componentAddresses.map(() => new BigNumber(20)),
        makerAddress: ACCOUNTS[0].address,
        makerToken: componentAddresses[0],
        makerTokenAmount: new BigNumber(6),
        expiration: SetProtocolUtils.generateTimestamp(60),
        relayerAddress: ACCOUNTS[1].address,
        relayerToken: componentAddresses[0],
        makerRelayerFee: new BigNumber(6),
        takerRelayerFee: new BigNumber(6),
      };
      const takerAddress = ACCOUNTS[2].address;

      const signedIssuanceOrder = await coreAPI.createSignedIssuanceOrder(
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
        coreAPI.transferProxyAddress,
      );

      await registerExchange(
        web3,
        coreAPI.coreAddress,
        SetProtocolUtils.EXCHANGES.TAKER_WALLET,
        takerWalletWrapperAddress
      );

      const takerWalletOrders = _.map(componentAddresses, componentAddress => (
        {
          takerTokenAddress: componentAddress,
          takerTokenAmount: new BigNumber(20),
        }
      ));
      const orderData = ethUtil.bufferToHex(
        setProtocolUtils.generateTakerWalletOrdersBuffer(
          makerToken,
          takerWalletOrders,
        )
      );
      const quantityToFill = new BigNumber(40);
      const txHash = await coreAPI.fillIssuanceOrder(
        takerAddress,
        signedIssuanceOrder,
        quantityToFill,
        orderData,
      );

      const coreInstance = await CoreContract.at(coreAPI.coreAddress, web3, txDefaults);

      const orderWithSalt = Object.assign({}, order, { salt: signedIssuanceOrder.salt });
      const orderFillsAmount =
        await coreInstance.orderFills.callAsync(SetProtocolUtils.hashOrderHex(orderWithSalt));

      expect(quantityToFill.toNumber()).to.equal(orderFillsAmount.toNumber());

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal('LogFill');
    });
  });

  /* ============ Cancel Issuance Order ============ */

  describe('cancelIssuanceOrder', async () => {
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

    test('cancels an issuance order with valid parameters', async () => {
      const order = {
        setAddress: setTokenAddress,
        quantity: new BigNumber(100),
        requiredComponents: componentAddresses,
        requiredComponentAmounts: componentAddresses.map(() => new BigNumber(1)),
        makerAddress: ACCOUNTS[0].address,
        makerToken: componentAddresses[0],
        makerTokenAmount: new BigNumber(4),
        expiration: SetProtocolUtils.generateTimestamp(60),
        relayerAddress: ACCOUNTS[1].address,
        relayerToken: componentAddresses[0],
        makerRelayerFee: new BigNumber(1),
        takerRelayerFee: new BigNumber(1),
      };

      const signedIssuanceOrder = await coreAPI.createSignedIssuanceOrder(
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

      const txHash = await coreAPI.cancelIssuanceOrder(
        orderWithSalt,
        quantityToCancel,
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);

      const coreInstance = await CoreContract.at(coreAPI.coreAddress, web3, txDefaults);

      const orderCancelsAmount =
        await coreInstance.orderCancels.callAsync(SetProtocolUtils.hashOrderHex(orderWithSalt));

      expect(quantityToCancel.toNumber()).to.equal(orderCancelsAmount.toNumber());
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal('LogCancel');
    });
  });

  /* ============ Core State Getters ============ */
  describe('Core State Getters', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setTokenAddress: Address;
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
