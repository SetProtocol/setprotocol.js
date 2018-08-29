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

import {
  Core,
  SetToken,
  SetTokenFactory,
  StandardTokenMock,
  CoreContract,
  SetTokenFactoryContract,
  SetTokenContract,
} from 'set-protocol-contracts';

import { BigNumber } from '../../src/util';
import ChaiSetup from '../helpers/chaiSetup';
import { DEFAULT_ACCOUNT } from '../accounts';
import { testSets, TestSet } from '../testSets';
import { CoreWrapper, SetTokenWrapper } from '../../src/wrappers';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT } from '../../src/constants';
import { Web3Utils } from '../../src/util';
import {
  initializeCoreWrapper,
  deployTokensForSetWithApproval,
  deploySetTokenFactory,
} from '../helpers/coreHelpers';

ChaiSetup.configure();
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

  test('SetTokenWrapper can be instantiated', async () => {
    const setTokenWrapper = new SetTokenWrapper(web3);
    expect(setTokenWrapper);
    expect(setTokenWrapper.getComponentsAsync);
    expect(setTokenWrapper.getUnitsAsync);
    expect(setTokenWrapper.getNaturalUnitAsync);
  });

  describe('getters', async () => {
    let componentAddresses: string[];
    let setToCreate: TestSet;
    let setTokenWrapper: SetTokenWrapper;
    let setTokenFactoryInstance: SetTokenFactoryContract;
    let setTokenInstance: SetTokenContract;

    beforeEach(async () => {
      // Deploy Core
      const coreAPI = await initializeCoreWrapper(provider);
      const coreWrapper = await CoreContract.at(coreAPI.coreAddress, web3, txDefaults);

      setTokenWrapper = new SetTokenWrapper(web3);
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

      // Deploy Set Token
      setTokenInstance = await setTokenContract.new(
        setTokenFactoryInstance.address,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
    });

    test('get Set token factory', async () => {
      const factoryAddress = await setTokenWrapper.getFactoryAsync(setTokenInstance.address);
      expect(factoryAddress).to.equal(setTokenFactoryInstance.address);
    });

    test('get Set token components', async () => {
      const components = await setTokenWrapper.getComponentsAsync(setTokenInstance.address);
      expect(JSON.stringify(components)).to.equal(JSON.stringify(componentAddresses));
    });

    test('get Set token natural units', async () => {
      const naturalUnit = await setTokenWrapper.getNaturalUnitAsync(setTokenInstance.address);
      expect(naturalUnit).to.bignumber.equal(setToCreate.naturalUnit);
    });

    test('get Set token units', async () => {
      const units = await setTokenWrapper.getUnitsAsync(setTokenInstance.address);
      _.forEach(units, (unit, i) => unit.toNumber() === setToCreate.units[i].toNumber());
    });
  });

  describe('#isMultipleOfNaturalUnitAsync', async () => {
    const setToCreate: TestSet = testSets[0];

    let quantity: BigNumber;
    const naturalUnit: BigNumber = setToCreate.naturalUnit;


    let coreWrapper: CoreWrapper;
    let setTokenWrapper: SetTokenWrapper;
    let setTokenInstance: SetTokenContract;

    beforeEach(async () => {
      setTokenWrapper = new SetTokenWrapper(web3);
      coreWrapper = await initializeCoreWrapper(provider);

      const components = await deployTokensForSetWithApproval(
        setToCreate,
        coreWrapper.transferProxyAddress,
        provider
      );
      const factory = await deploySetTokenFactory(coreWrapper.coreAddress, provider);

      setTokenInstance = await setTokenContract.new(
        factory,
        components,
        setToCreate.units,
        naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
    });

    async function subject(): Promise<boolean> {
      return await setTokenWrapper.isMultipleOfNaturalUnitAsync(
        setTokenInstance.address,
        quantity,
      );
    }

    describe('when the quantity is a multiple of the natural unit', async () => {
      beforeAll(async () => {
        quantity = naturalUnit.times(2);
      });

      it('should return true', async () => {
        const isMultiple = await subject();
        expect(isMultiple).to.equal(true);
      });
    });

    describe('when the quantity is not a multiple of the natural unit', async () => {
      beforeAll(async () => {
        quantity = naturalUnit.div(2);
      });

      it('should return false', async () => {
        const isMultiple = await subject();
        expect(isMultiple).to.equal(false);
      });
    });

  });

});
