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

import {
  Core,
  StandardTokenMockContract,
  TransferProxy,
  Vault
} from 'set-protocol-contracts';
import { Address, SetProtocolUtils } from 'set-protocol-utils';
import ChaiSetup from '../helpers/chaiSetup';
import { DEFAULT_ACCOUNT } from '../accounts';
import SetProtocol from '../../src';
import { testSets, TestSet } from '../testSets';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT, NULL_ADDRESS } from '../../src/constants';
import { Web3Utils } from '../../src/util/Web3Utils';
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '../logs';
import { CoreWrapper } from '../../src/wrappers';
import { BigNumber } from '../../src/util';
import {
  approveForFill,
  deploySetTokenFactory,
  deployTokensForSetWithApproval,
  deployTokensAsync,
  initializeCoreWrapper,
  registerExchange,
} from '../helpers/coreHelpers';
import { deployTakerWalletExchangeWrapper } from '../helpers/exchangeHelpers';

ChaiSetup.configure();
const { expect } = chai;
const { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } = SetProtocolUtils.CONSTANTS;

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
  let coreWrapper: CoreWrapper;
  let setProtocolInstance: SetProtocol;

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

    coreWrapper = await initializeCoreWrapper(provider);
    setProtocolInstance = new SetProtocol(
      web3,
      coreWrapper.coreAddress,
      coreWrapper.transferProxyAddress,
      coreWrapper.vaultAddress,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  test('should instantiate a new setProtocolInstance', async () => {
    expect(setProtocolInstance instanceof SetProtocol);
  });

  describe('createSet', async () => {
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    beforeEach(async () => {
      setTokenFactoryAddress = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider,
      );
    });

    test('creates a new set with valid parameters', async () => {
      const txHash = await setProtocolInstance.createSetAsync(
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

  describe('setTransferProxyAllowanceAsync', async () => {
    let token: StandardTokenMockContract;
    let subjectCaller: Address;
    let subjectQuantity: BigNumber;

    beforeEach(async () => {
      const tokenContracts = await deployTokensAsync(1, provider);
      token = tokenContracts[0];

      subjectCaller = DEFAULT_ACCOUNT;
      subjectQuantity = new BigNumber(1000);
    });

    async function subject(): Promise<string> {
      return await setProtocolInstance.setTransferProxyAllowanceAsync(
        token.address,
        subjectQuantity,
        { from: subjectCaller },
      );
    }

    test('sets the allowance properly', async () => {
      const existingAllowance = await token.allowance.callAsync(subjectCaller, coreWrapper.transferProxyAddress);

      await subject();

      const expectedNewAllowance = existingAllowance.add(subjectQuantity);
      const newAllowance = await token.allowance.callAsync(subjectCaller, coreWrapper.transferProxyAddress);
      expect(newAllowance).to.bignumber.equal(expectedNewAllowance);
    });
  });

  describe('setUnlimitedTransferProxyAllowanceAsync', async () => {
    let token: StandardTokenMockContract;
    let subjectCaller: Address;

    beforeEach(async () => {
      const tokenContracts = await deployTokensAsync(1, provider);
      token = tokenContracts[0];

      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await setProtocolInstance.setUnlimitedTransferProxyAllowanceAsync(
        token.address,
        { from: subjectCaller },
      );
    }

    test('sets the allowance properly', async () => {
      await subject();

      const newAllowance = await token.allowance.callAsync(subjectCaller, coreWrapper.transferProxyAddress);
      expect(newAllowance).to.bignumber.equal(UNLIMITED_ALLOWANCE_IN_BASE_UNITS);
    });
  });

  /* ============ Core State Getters ============ */

  describe('Core State Getters', async () => {
    let setTokenFactoryAddress: Address;
    let setTokenAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    beforeEach(async () => {
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

    test('gets Set addresses', async () => {
      const setAddresses = await setProtocolInstance.getSetAddressesAsync();
      expect(setAddresses.length).to.equal(1);
      expect(setAddresses[0]).to.equal(setTokenAddress);
    });

    test('gets is valid factory address', async () => {
      let isValidVaultAddress = await setProtocolInstance.isValidFactoryAsync(setTokenFactoryAddress);
      expect(isValidVaultAddress).to.equal(true);
      isValidVaultAddress = await setProtocolInstance.isValidSetAsync(NULL_ADDRESS);
      expect(isValidVaultAddress).to.equal(false);
    });
  });
});
