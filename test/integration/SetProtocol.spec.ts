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

import { Core, TransferProxy, Vault } from 'set-protocol-contracts';
import { Address, SetProtocolUtils } from 'set-protocol-utils';

import { DEFAULT_ACCOUNT } from '../accounts';
import SetProtocol from '../../src';
import { testSets, TestSet } from '../testSets';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT, NULL_ADDRESS } from '../../src/constants';
import { Web3Utils } from '../../src/util/Web3Utils';
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '../logs';
import { CoreAPI } from '../../src/api';
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

const { expect } = chai;

const contract = require('truffle-contract');

const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

const txDefaults = {
  from: DEFAULT_ACCOUNT,
  gasPrice: DEFAULT_GAS_PRICE,
  gas: DEFAULT_GAS_LIMIT,
};

const coreContract = contract(Core);
coreContract.setProvider(provider);
coreContract.defaults(txDefaults);

const transferProxyContract = contract(TransferProxy);
transferProxyContract.setProvider(provider);
transferProxyContract.defaults(txDefaults);

const vaultContract = contract(Vault);
vaultContract.setProvider(provider);
vaultContract.defaults(txDefaults);

let currentSnapshotId: number;

describe('SetProtocol', async () => {
  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
    ABIDecoder.addABI(transferProxyContract.abi);
    ABIDecoder.addABI(vaultContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
    ABIDecoder.removeABI(transferProxyContract.abi);
    ABIDecoder.removeABI(vaultContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();
  });

  afterEach(() => {
    web3Utils.revertToSnapshot(currentSnapshotId);
  });

  test('should instantiate a new setProtocolInstance', async () => {
    // Deploy Core
    const coreAPI = await initializeCoreAPI(provider);

    const setProtocolInstance = new SetProtocol(
      web3,
      coreAPI.coreAddress,
      coreAPI.transferProxyAddress,
      coreAPI.vaultAddress,
    );
    expect(setProtocolInstance instanceof SetProtocol);
  });

  describe('createSet', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setProtocolInstance: SetProtocol;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      setProtocolInstance = new SetProtocol(
        web3,
        coreAPI.coreAddress,
        coreAPI.transferProxyAddress,
        coreAPI.vaultAddress,
      );
    });

    test('creates a new set with valid parameters', async () => {
      const txHash = await setProtocolInstance.createSet(
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

  /* ============ Core State Getters ============ */
  describe('Core State Getters', async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setTokenAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setProtocolInstance: SetProtocol;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      setProtocolInstance = new SetProtocol(
        web3,
        coreAPI.coreAddress,
        coreAPI.transferProxyAddress,
        coreAPI.vaultAddress,
      );

      // Create a Set
      const txHash = await coreAPI.createSet(
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
        coreAPI.transferProxyAddress,
        coreAPI.coreAddress,
        provider,
      );

      await registerExchange(
        web3,
        coreAPI.coreAddress,
        SetProtocolUtils.EXCHANGES.TAKER_WALLET,
        takerWalletWrapperAddress
      );

      const exchangeAddress = await setProtocolInstance.getExchangeAddress(
        SetProtocolUtils.EXCHANGES.TAKER_WALLET,
      );
      expect(exchangeAddress).to.equal(takerWalletWrapperAddress);
    });

    test('gets transfer proxy address', async () => {
      const transferProxyAddress = await setProtocolInstance.getTransferProxyAddress();
      expect(coreAPI.transferProxyAddress).to.equal(transferProxyAddress);
    });

    test('gets vault address', async () => {
      const vaultAddress = await setProtocolInstance.getVaultAddress();
      expect(coreAPI.vaultAddress).to.equal(vaultAddress);
    });

    test('gets factory addresses', async () => {
      const factoryAddresses = await setProtocolInstance.getFactories();
      expect(factoryAddresses.length).to.equal(1);
      expect(factoryAddresses[0]).to.equal(setTokenFactoryAddress);
    });

    test('gets Set addresses', async () => {
      const setAddresses = await setProtocolInstance.getSetAddresses();
      expect(setAddresses.length).to.equal(1);
      expect(setAddresses[0]).to.equal(setTokenAddress);
    });

    test('gets is valid factory address', async () => {
      let isValidVaultAddress = await setProtocolInstance.getIsValidFactory(setTokenFactoryAddress);
      expect(isValidVaultAddress).to.equal(true);
      isValidVaultAddress = await setProtocolInstance.getIsValidFactory(NULL_ADDRESS);
      expect(isValidVaultAddress).to.equal(false);
    });

    test('gets is valid Set address', async () => {
      let isValidSetAddress = await setProtocolInstance.getIsValidSet(setTokenAddress);
      expect(isValidSetAddress).to.equal(true);
      isValidSetAddress = await setProtocolInstance.getIsValidSet(NULL_ADDRESS);
      expect(isValidSetAddress).to.equal(false);
    });
  });
});
