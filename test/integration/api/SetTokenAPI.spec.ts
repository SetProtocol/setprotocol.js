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
import {
  CoreContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';
import { Address } from 'set-protocol-utils';

import { SetTokenAPI } from '@src/api';
import { DEFAULT_ACCOUNT, TX_DEFAULTS } from '@src/constants';
import { BigNumber, ether, Web3Utils } from '@src/util';
import { Assertions } from '@src/assertions';
import { CoreWrapper } from '@src/wrappers';
import ChaiSetup from '@test/helpers/chaiSetup';
import {
  addAuthorizationAsync,
  approveForTransferAsync,
  deployCoreContract,
  deploySetTokenAsync,
  deploySetTokenFactoryContract,
  deployVaultContract,
  deployTokensAsync,
  deployTokensSpecifyingDecimals,
  deployTransferProxyContract
} from '@test/helpers';
import { Component, SetDetails } from '@src/types/common';

ChaiSetup.configure();
const { expect } = chai;
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('SetTokenAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;

  let setTokenAPI: SetTokenAPI;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    transferProxy = await deployTransferProxyContract(provider);
    vault = await deployVaultContract(provider);
    core = await deployCoreContract(provider, transferProxy.address, vault.address);
    setTokenFactory = await deploySetTokenFactoryContract(provider, core);

    await addAuthorizationAsync(vault, core.address);
    await addAuthorizationAsync(transferProxy, core.address);

    const coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);
    const assertions = new Assertions(web3, coreWrapper);

    setTokenAPI = new SetTokenAPI(web3, assertions);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('getFactoryAsync, getComponentsAsync, getNaturalUnitAsync, getUnitsAsync', async () => {
    let componentTokens: StandardTokenMockContract[];
    let componentTokenAddresses: Address[];
    let componentTokenUnits: BigNumber[];
    let setToken: SetTokenContract;
    let naturalUnit: BigNumber;

    let subjectSetTokenAddress: Address;

    beforeEach(async () => {
      componentTokens = await deployTokensAsync(3, provider);
      componentTokenAddresses = componentTokens.map(token => token.address);
      componentTokenUnits = componentTokens.map(token => ether(4));
      naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokenAddresses,
        componentTokenUnits,
        naturalUnit,
      );

      subjectSetTokenAddress = setToken.address;
    });

    async function subject(): Promise<any> {
      const factoryAddress = await setTokenAPI.getFactoryAsync(subjectSetTokenAddress);
      const components = await setTokenAPI.getComponentsAsync(subjectSetTokenAddress);
      const naturalUnit = await setTokenAPI.getNaturalUnitAsync(subjectSetTokenAddress);
      const units = await setTokenAPI.getUnitsAsync(subjectSetTokenAddress);

      return { factoryAddress, components, naturalUnit, units };
    }

    test('it fetchs the set token properties correctly', async () => {
      const { factoryAddress, components, naturalUnit, units } = await subject();

      expect(factoryAddress).to.eql(setTokenFactory.address);
      expect(components).to.eql(componentTokenAddresses);
      expect(naturalUnit).to.bignumber.equal(naturalUnit);
      expect(JSON.stringify(units)).to.eql(JSON.stringify(componentTokenUnits));
    });
  });

  describe('getDetails', async () => {
    let componentTokens: StandardTokenMockContract[];
    let componentTokenAddresses: Address[];
    let componentTokenUnits: BigNumber[];
    let setToken: SetTokenContract;
    let naturalUnit: BigNumber;
    let name: string;
    let symbol: string;

    let subjectSetTokenAddress: Address;

    beforeEach(async () => {
      componentTokens = await deployTokensAsync(3, provider);
      componentTokenAddresses = componentTokens.map(token => token.address);
      componentTokenUnits = componentTokens.map(token => ether(4));
      naturalUnit = ether(2);
      name = 'Default Set';
      symbol = 'SET';
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokenAddresses,
        componentTokenUnits,
        naturalUnit,
      );

      subjectSetTokenAddress = setToken.address;
    });

    async function subject(): Promise<SetDetails> {
      return await setTokenAPI.getDetails(subjectSetTokenAddress);
    }

    test('it fetchs the set token properties correctly', async () => {
      const details = await subject();

      expect(details.address).to.eql(setToken.address);
      expect(details.factoryAddress).to.eql(setTokenFactory.address);
      expect(details.name).to.eql(name);
      expect(details.symbol).to.eql(symbol);
      expect(details.naturalUnit).to.bignumber.equal(naturalUnit);

      const detailComponentAddresses = details.components.map(component => component.address);
      expect(JSON.stringify(detailComponentAddresses)).to.eql(JSON.stringify(componentTokenAddresses));

      const detailComponentUnits = details.components.map(component => component.unit);
      expect(JSON.stringify(detailComponentUnits)).to.eql(JSON.stringify(componentTokenUnits));
    });
  });

  describe('isMultipleOfNaturalUnitAsync', async () => {
    let subjectSetTokenAddress: Address;
    let subjectQuantity: BigNumber;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, provider);
      const componentTokenAddresses = componentTokens.map(token => token.address);
      const componentTokenUnits = componentTokens.map(token => ether(4));
      const naturalUnit = ether(2);
      const setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokenAddresses,
        componentTokenUnits,
        naturalUnit,
      );

      subjectSetTokenAddress = setToken.address;
      subjectQuantity = ether(4);
    });

    async function subject(): Promise<boolean> {
      return await setTokenAPI.isMultipleOfNaturalUnitAsync(subjectSetTokenAddress, subjectQuantity);
    }

    test('correctly assesses the validity of the quantity against the set token', async () => {
      const isQuantityMultiple = await subject();

      expect(isQuantityMultiple).to.be.true;
    });

    describe('when the quantity is not a multiple of the natural unit', async () => {
      beforeEach(async () => {
        subjectQuantity = ether(3);
      });

      test('correctly assesses the validity of the quantity against the set token', async () => {
        const isQuantityMultiple = await subject();

        expect(isQuantityMultiple).to.be.false;
      });
    });
  });

  describe('calculateComponentAmountForIssuanceAsync', async () => {
    let componentTokens: StandardTokenMockContract[];
    let componentTokenAddresses: Address[];
    let componentTokenUnits: BigNumber[];
    let naturalUnit: BigNumber;
    let setToken: SetTokenContract;

    let subjectSetTokenAddress: Address;
    let subjectComponentAddress: Address;
    let subjectQuantity: BigNumber;

    beforeEach(async () => {
      const tokenCount = 2;
      const decimalsList = [18, 8];
      const tokenUnits = [ether(2), ether(4)];
      componentTokens = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, provider);

      componentTokenAddresses = componentTokens.map(token => token.address);
      componentTokenUnits = tokenUnits;
      naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokenAddresses,
        componentTokenUnits,
        naturalUnit,
      );

      subjectSetTokenAddress = setToken.address;
      subjectComponentAddress = componentTokenAddresses[0];
      subjectQuantity = ether(4);
    });

    async function subject(): Promise<BigNumber> {
      return await setTokenAPI.calculateComponentAmountForIssuanceAsync(
        subjectSetTokenAddress,
        subjectComponentAddress,
        subjectQuantity
      );
    }

    test('correctly calculates the first component unit transferred', async () => {
      const result = await subject();

      const expectedResult = componentTokenUnits[0].mul(subjectQuantity).div(naturalUnit);
      expect(result).to.bignumber.equal(expectedResult);
    });

    describe('when the subjectComponentAddress is the second component', async () => {
      beforeEach(async () => {
        subjectComponentAddress = componentTokenAddresses[1];
      });

      test('correctly calculates the second component unit transferred', async () => {
        const result = await subject();

        const expectedResult = componentTokenUnits[1].mul(subjectQuantity).div(naturalUnit);
        expect(result).to.bignumber.equal(expectedResult);
      });
    });

    describe('when the component is not part of the Set', async () => {
      beforeEach(async () => {
        subjectComponentAddress = DEFAULT_ACCOUNT;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Token address at ${subjectComponentAddress} is not a ` +
          `component of the Set Token at ${subjectSetTokenAddress}.`
        );
      });
    });
  });

  describe('calculateComponentAmountsForIssuanceAsync', async () => {
    let componentTokens: StandardTokenMockContract[];
    let componentTokenAddresses: Address[];
    let componentTokenUnits: BigNumber[];
    let naturalUnit: BigNumber;
    let setToken: SetTokenContract;

    let subjectSetTokenAddress: Address;
    let subjectQuantity: BigNumber;

    beforeEach(async () => {
      const tokenCount = 2;
      const decimalsList = [18, 8];
      const tokenUnits = [ether(2), ether(4)];
      componentTokens = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, provider);

      componentTokenAddresses = componentTokens.map(token => token.address);
      componentTokenUnits = tokenUnits;
      naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokenAddresses,
        componentTokenUnits,
        naturalUnit,
      );

      subjectSetTokenAddress = setToken.address;
      subjectQuantity = ether(4);
    });

    async function subject(): Promise<Component[]> {
      return await setTokenAPI.calculateComponentAmountsForIssuanceAsync(
        subjectSetTokenAddress,
        subjectQuantity
      );
    }

    test('correctly calculates the component units transferred', async () => {
      const expectedResult: Component[] = componentTokenUnits.map((componentTokenUnit, index) => {
        return {
          address: componentTokenAddresses[index],
          unit: componentTokenUnit.mul(subjectQuantity).div(naturalUnit),
        };
      });

      const result = await subject();

      expect(JSON.stringify(result)).to.equal(JSON.stringify(expectedResult));
    });
  });
});
