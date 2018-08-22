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
import * as _ from 'lodash';
import * as Web3 from 'web3';
import compact = require('lodash.compact');

import { Core, SetToken, SetTokenFactory, StandardTokenMock } from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT } from '../accounts';
import { testSets, TestSet } from '../testSets';
import { CoreAPI, SetTokenAPI } from '../../src/api';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT } from '../../src/constants';
import { CoreContract, SetTokenFactoryContract, SetTokenContract } from '../../src/contracts';
import { Web3Utils } from '../../src/util';
import {
  initializeCoreAPI,
} from '../helpers/coreHelpers';

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

const setTokenFactoryContract = contract(SetTokenFactory);
setTokenFactoryContract.setProvider(provider);
setTokenFactoryContract.defaults(txDefaults);

const setTokenContract = contract(SetToken);
setTokenContract.setProvider(provider);
setTokenContract.defaults(txDefaults);

const standardTokenMockContract = contract(StandardTokenMock);
standardTokenMockContract.setProvider(provider);
standardTokenMockContract.defaults(txDefaults);

let currentSnapshotId: number;

describe('Set Token API', () => {
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

  test('SetTokenAPI can be instantiated', async () => {
    const setTokenAPI = new SetTokenAPI(web3);
    expect(setTokenAPI);
    expect(setTokenAPI.getSymbol);
    expect(setTokenAPI.getName);
    expect(setTokenAPI.getComponents);
    expect(setTokenAPI.getUnits);
    expect(setTokenAPI.getTotalSupply);
    expect(setTokenAPI.getBalanceOf);
  });

  describe('getters', async () => {
    let componentAddresses: string[];
    let setToCreate: TestSet;
    let setTokenAPI: SetTokenAPI;
    let setTokenFactoryInstance: SetTokenFactoryContract;
    let setTokenInstance: SetTokenContract;

    beforeEach(async () => {
      // Deploy Core
      const coreAPI = await initializeCoreAPI(provider);
      const coreWrapper = await CoreContract.at(coreAPI.coreAddress, web3, txDefaults);

      setTokenAPI = new SetTokenAPI(web3);
      // Deploy SetTokenFactory
      setTokenFactoryInstance = await setTokenFactoryContract.new(coreAPI.coreAddress);

      // Enable Factory
      await coreWrapper.enableFactory.sendTransactionAsync(
        setTokenFactoryInstance.address,
        txDefaults,
      );

      setToCreate = testSets[0];
      // Deploy DummyTokens to add to Set
      componentAddresses = [];
      await Promise.all(
        setToCreate.components.map(async component => {
          const standardTokenMockInstance = await standardTokenMockContract.new(
            DEFAULT_ACCOUNT,
            component.supply,
            component.name,
            component.symbol,
            component.decimals,
          );
          componentAddresses.push(standardTokenMockInstance.address);
        }),
      );

      // Create Set Token
      const txHash = await coreAPI.createSet(
        setTokenFactoryInstance.address,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
        { from: DEFAULT_ACCOUNT },
      );
      const receipt = await web3Utils.getTransactionReceiptAsync(txHash);
      const logs: ABIDecoder.DecodedLog[] = compact(ABIDecoder.decodeLogs(receipt.logs));
      const setTokenContractAddress = logs[logs.length - 1].address;
      // Deploy Set Token
      setTokenInstance = await setTokenContract.new(
        setTokenContractAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
    });

    test('gets Set token symbol', async () => {
      const symbol = await setTokenAPI.getSymbol(setTokenInstance.address);
      expect(symbol).to.equal(setToCreate.setSymbol);
    });

    test('gets Set token name', async () => {
      const name = await setTokenAPI.getName(setTokenInstance.address);
      expect(name).to.equal(setToCreate.setName);
    });

    test('get Set token natural units', async () => {
      const naturalUnit = await setTokenAPI.getNaturalUnit(setTokenInstance.address);
      expect(naturalUnit.toNumber()).to.equal(setToCreate.naturalUnit.toNumber());
    });

    test('get Set token units', async () => {
      const units = await setTokenAPI.getUnits(setTokenInstance.address);
      _.forEach(units, (unit, i) => unit.toNumber() === setToCreate.units[i].toNumber());
    });

    test('get total supply of Set tokens', async () => {
      const totalSupply = await setTokenAPI.getTotalSupply(setTokenInstance.address);
      expect(totalSupply.toNumber()).to.equal(0);
    });

    test("get balance of user's Set tokens", async () => {
      const balance = await setTokenAPI.getBalanceOf(setTokenInstance.address, DEFAULT_ACCOUNT);
      expect(balance.toNumber()).to.equal(0);
    });
  });
});
