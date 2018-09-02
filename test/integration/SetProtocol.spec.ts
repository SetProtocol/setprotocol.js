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
import { Core } from 'set-protocol-contracts';
import {
  CoreContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';
import { Address, SetProtocolUtils } from 'set-protocol-utils';

import ChaiSetup from '../helpers/chaiSetup';
import { DEFAULT_ACCOUNT } from '../../src/constants/accounts';
import SetProtocol from '../../src/SetProtocol';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT, NULL_ADDRESS, TX_DEFAULTS } from '../../src/constants';
import { Web3Utils } from '../../src/util/Web3Utils';
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '../../src/util/logs';
import { BigNumber } from '../../src/util';
import { SetProtocolConfig } from '../../src/SetProtocol';
import {
  addAuthorizationAsync,
  approveForTransferAsync,
  deployCoreContract,
  deploySetTokenAsync,
  deploySetTokenFactoryContract,
  deployTokensAsync,
  deployTransferProxyContract,
  deployVaultContract,
} from '../helpers';
import { ether } from '../../src/util/units';

ChaiSetup.configure();
const { expect } = chai;
const { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } = SetProtocolUtils.CONSTANTS;
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

const coreContract = contract(Core);
coreContract.setProvider(provider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('SetProtocol', async () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let setProtocol: SetProtocol;

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

    await addAuthorizationAsync(vault, core.address);
    await addAuthorizationAsync(transferProxy, core.address);

    setProtocol = new SetProtocol(
      provider,
      {
        coreAddress: core.address,
        transferProxyAddress: transferProxy.address,
        vaultAddress: vault.address,
        setTokenFactoryAddress: setTokenFactory.address,
      } as SetProtocolConfig,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('createSetAsync', async () => {
    let componentTokens: StandardTokenMockContract[];

    let subjectComponents: Address[];
    let subjectUnits: BigNumber[];
    let subjectNaturalUnit: BigNumber;
    let subjectName: string;
    let subjectSymbol: string;
    let subjectCaller: Address;

    beforeEach(async () => {
      componentTokens = await deployTokensAsync(3, provider);

      subjectComponents = componentTokens.map(component => component.address);
      subjectUnits = subjectComponents.map(component => ether(4));
      subjectNaturalUnit = ether(2);
      subjectName = 'My Set';
      subjectSymbol = 'SET';
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await setProtocol.createSetAsync(
        subjectComponents,
        subjectUnits,
        subjectNaturalUnit,
        subjectName,
        subjectSymbol,
        { from: subjectCaller }
      );
    }

    test('deploys a new SetToken contract', async () => {
      const createSetTransactionHash = await subject();

      const logs = await getFormattedLogsFromTxHash(web3, createSetTransactionHash);
      const deployedSetTokenAddress = extractNewSetTokenAddressFromLogs(logs);
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
      return await setProtocol.setTransferProxyAllowanceAsync(
        token.address,
        subjectQuantity,
        { from: subjectCaller },
      );
    }

    test('sets the allowance properly', async () => {
      const existingAllowance = await token.allowance.callAsync(subjectCaller, transferProxy.address);

      await subject();

      const expectedNewAllowance = existingAllowance.add(subjectQuantity);
      const newAllowance = await token.allowance.callAsync(subjectCaller, transferProxy.address);
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
      return await setProtocol.setUnlimitedTransferProxyAllowanceAsync(
        token.address,
        { from: subjectCaller },
      );
    }

    test('sets the allowance properly', async () => {
      await subject();

      const newAllowance = await token.allowance.callAsync(subjectCaller, transferProxy.address);
      expect(newAllowance).to.bignumber.equal(UNLIMITED_ALLOWANCE_IN_BASE_UNITS);
    });
  });

  /* ============ Core State Getters ============ */

  describe('Core State Getters', async () => {
    let setToken: SetTokenContract;

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
    });

    test('gets Set addresses', async () => {
      const setAddresses = await setProtocol.getSetAddressesAsync();
      expect(setAddresses.length).to.equal(1);
      expect(setAddresses[0]).to.equal(setToken.address);
    });

    test('gets is valid factory address', async () => {
      let isValidVaultAddress = await setProtocol.isValidFactoryAsync(setTokenFactory.address);
      expect(isValidVaultAddress).to.equal(true);
      isValidVaultAddress = await setProtocol.isValidSetAsync(NULL_ADDRESS);
      expect(isValidVaultAddress).to.equal(false);
    });
  });
});
