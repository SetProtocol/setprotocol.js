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

import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import * as Web3 from 'web3';

import { Core } from 'set-protocol-contracts';
import { Address } from 'set-protocol-utils';

import { ACCOUNTS } from '../accounts';
import { testSets, TestSet } from '../testSets';
import { CoreAPI, VaultAPI } from '../../src/api';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT } from '../../src/constants';
import { BigNumber, Web3Utils } from '../../src/util';
import { deployTokensForSetWithApproval, initializeCoreAPI, initializeVaultAPI } from '../helpers';

const { expect } = chai;

const contract = require('truffle-contract');

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

describe('Vault API', () => {
  let coreAPI: CoreAPI;
  let vaultAPI: VaultAPI;

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

  test('VaultAPI can be instantiated', async () => {
    coreAPI = await initializeCoreAPI(provider);
    vaultAPI = await initializeVaultAPI(provider, coreAPI.vaultAddress);
    expect(vaultAPI.getOwnerBalance);
  });

  describe('getOwnerBalance', async () => {
    let coreAPI: CoreAPI;
    let vaultAPI: VaultAPI;
    let setToCreate: TestSet;
    let tokenAddresses: Address[];

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      vaultAPI = await initializeVaultAPI(provider, coreAPI.vaultAddress);

      setToCreate = testSets[0];
      tokenAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );
    });

    test('gets owner balance', async () => {
      let balance: BigNumber;
      const account = ACCOUNTS[0].address;
      const token = tokenAddresses[0];
      balance = await vaultAPI.getOwnerBalance(account, token);
      expect(balance.toNumber()).to.equal(0);
      await coreAPI.deposit(token, new BigNumber(100), { from: account });
      balance = await vaultAPI.getOwnerBalance(account, token);
      expect(balance.toNumber()).to.equal(100);
    });
  });
});
