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

import * as _ from 'lodash';
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import * as ethUtil from 'ethereumjs-util';
import * as Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import { Core } from 'set-protocol-contracts';
import {
  CoreContract,
  NoDecimalTokenMockContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';

import ChaiSetup from '@test/helpers/chaiSetup';
import { FactoryAPI } from '@src/api';
import { BigNumber } from '@src/util';
import { Assertions } from '@src/assertions';
import { CoreWrapper } from '@src/wrappers';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { TX_DEFAULTS, ZERO, ONE, TWO, TEN } from '@src/constants';
import {
  addAuthorizationAsync,
  deployCoreContract,
  deployNoDecimalTokenAsync,
  deployTokensAsync,
  deployTokensSpecifyingDecimals,
  deploySetTokenFactoryContract,
  deployTransferProxyContract,
  deployVaultContract,
} from '@test/helpers/coreHelpers';
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '@src/util/logs';
import { ether } from '@src/util/units';
import { Web3Utils } from '@src/util/Web3Utils';
import { NewSetParameters } from '@src/types/common';

ChaiSetup.configure();
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const { expect } = chai;

const coreContract = contract(Core);
coreContract.setProvider(provider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('FactoryAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let coreWrapper: CoreWrapper;
  let factoryAPI: FactoryAPI;
  let assertions: Assertions;

  let componentTokens: StandardTokenMockContract[];

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

    assertions = new Assertions(web3, coreWrapper);

    coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);
    factoryAPI = new FactoryAPI(web3, coreWrapper, assertions, setTokenFactory.address);

    componentTokens = await deployTokensAsync(3, provider);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('createSetAsync', async () => {
    let subjectComponents: Address[];
    let subjectUnits: BigNumber[];
    let subjectNaturalUnit: BigNumber;
    let subjectName: string;
    let subjectSymbol: string;
    let subjectCaller: Address;

    beforeEach(async () => {
      subjectComponents = componentTokens.map(component => component.address);
      subjectUnits = subjectComponents.map(component => ether(4));
      subjectNaturalUnit = ether(2);
      subjectName = 'My Set';
      subjectSymbol = 'SET';
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await factoryAPI.createSetAsync(
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

    describe('when the transaction caller address is invalid', async () => {
      beforeEach(async () => {
        subjectCaller = 'invalidCallerAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected txOpts.from to conform to schema /Address.

        Encountered: "invalidCallerAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the set factory address is invalid', async () => {
      let invalidSetFactoryAddress: Address;

      beforeEach(async () => {
        invalidSetFactoryAddress = 'invalidSetFactoryAddress';

        factoryAPI = new FactoryAPI(web3, coreWrapper, assertions, invalidSetFactoryAddress);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected factoryAddress to conform to schema /Address.

        Encountered: "invalidSetFactoryAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the component addresses and units are not the same length', async () => {
      beforeEach(async () => {
        subjectComponents = [subjectComponents[0]];
        subjectUnits = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('The components and units arrays need to be equal lengths.');
      });
    });

    describe('when the natural unit is a negative number', async () => {
      let invalidNaturalUnit: BigNumber;

      beforeEach(async () => {
        invalidNaturalUnit = new BigNumber(-1);

        subjectNaturalUnit = invalidNaturalUnit;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidNaturalUnit} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the name is empty', async () => {
      beforeEach(async () => {
        subjectName = '';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('The string name cannot be empty.');
      });
    });

    describe('when the symbol is empty', async () => {
      beforeEach(async () => {
        subjectSymbol = '';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('The string symbol cannot be empty.');
      });
    });

    describe('when the component units contains a negative number', async () => {
      let invalidComponentUnit: BigNumber;

      beforeEach(async () => {
        invalidComponentUnit = new BigNumber(-1);

        subjectComponents = [componentTokens[0].address];
        subjectUnits = [invalidComponentUnit];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidComponentUnit} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the component addresses contains an empty element', async () => {
      beforeEach(async () => {
        const placeholderUnitForArrayLength = ether(1);
        const emptyComponentAddress = '';

        subjectComponents = [emptyComponentAddress];
        subjectUnits = [placeholderUnitForArrayLength];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('The string component cannot be empty.');
      });
    });

    describe('when the component addresses contains an invalid address', async () => {
      let invalidComponentAddress: Address;

      beforeEach(async () => {
        const placeholderUnitForArrayLength = ether(1);
        invalidComponentAddress = 'someNonAddressString';

        subjectComponents = [invalidComponentAddress];
        subjectUnits = [placeholderUnitForArrayLength];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected componentAddress to conform to schema /Address.

        Encountered: "someNonAddressString"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the component addresses contains an address for a non ERC20 contract', async () => {
      let nonERC20ContractAddress: Address;

      beforeEach(async () => {
        const placeholderUnitForArrayLength = ether(1);
        nonERC20ContractAddress = vault.address;

        subjectComponents = [nonERC20ContractAddress];
        subjectUnits = [placeholderUnitForArrayLength];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Contract at ${nonERC20ContractAddress} does not implement ERC20 interface.`
        );
      });
    });

    describe('when the natural unit is not valid for the units', async () => {
      beforeEach(async () => {
        subjectNaturalUnit = new BigNumber(1);
      });

      test('throws', async () => {
        const minNaturalUnit = await factoryAPI.calculateMinimumNaturalUnit(subjectComponents);
        return expect(subject()).to.be.rejectedWith(
          `Natural unit must be larger than minimum unit, ${minNaturalUnit.toString()}, allowed by components.`
        );
      });
    });
  });

  describe('getSetAddressFromCreateTxHash', async () => {
    let subjectTxHash: string;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, provider);
      const setComponentUnit = ether(4);
      const naturalUnit = ether(2);

      subjectTxHash = await core.create.sendTransactionAsync(
        setTokenFactory.address,
        componentTokens.map(token => token.address),
        componentTokens.map(token => setComponentUnit),
        naturalUnit,
        'Set',
        'SET',
        '',
        TX_DEFAULTS
      );
    });

    async function subject(): Promise<string> {
      return await factoryAPI.getSetAddressFromCreateTxHash(subjectTxHash);
    }

    test('retrieves the correct set address', async () => {
      const setAddress = await subject();

      const formattedLogs = await getFormattedLogsFromTxHash(web3, subjectTxHash);
      const expectedSetAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
      expect(setAddress).to.equal(expectedSetAddress);
    });

    describe('when the transaction hash is invalid', async () => {
      beforeEach(async () => {
        subjectTxHash = 'invalidTransactionHash';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected txHash to conform to schema /Bytes32.

        Encountered: "invalidTransactionHash"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{64}$"
      `
        );
      });
    });
  });

  describe('calculateMinimumNaturalUnit', async () => {
    let componentInstances: (StandardTokenMockContract | NoDecimalTokenMockContract)[];
    let subjectComponents: Address[];

    beforeEach(async () => {
      subjectComponents = componentInstances.map(component => component.address);
    });

    async function subject(): Promise<BigNumber> {
      return await factoryAPI.calculateMinimumNaturalUnit(subjectComponents);
    }

    describe('when the decimals and token count are standard', async () => {
      beforeAll(async () => {
        const tokenCount = 2;
        const decimalsList = [18, 18];
        componentInstances = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, provider);
      });

      afterAll(async () => {
        componentInstances = [];
      });

      test('it calculates the minimum natural unit correctly', async () => {
        const expectedResult = new BigNumber(1);

        const result = await subject();

        expect(result).to.bignumber.equal(expectedResult);
      });
    });

    describe('when a component does not implement decimals', async () => {
      beforeAll(async () => {
        const [standardToken] = await deployTokensSpecifyingDecimals(1, [18], provider);
        const nonDecimalComponent = await deployNoDecimalTokenAsync(provider);

        componentInstances = [standardToken, nonDecimalComponent];
      });

      afterAll(async () => {
        componentInstances = [];
      });

      it('it calculates the minimum natural unit correctly', async () => {
        const expectedResult = new BigNumber(10).pow(18);

        const result = await subject();

        expect(result).to.bignumber.equal(expectedResult);
      });
    });

    describe('when the decimals of the components are all different', async () => {
      const smallerDecimal = 8;
      const largerDecimal = 10;
      let decimalsList: number[];

      beforeAll(async () => {
        const tokenCount = 2;
        decimalsList = [largerDecimal, smallerDecimal];
        componentInstances = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, provider);
      });

      afterAll(async () => {
        componentInstances = [];
      });

      test('it calculates the min minimum natural unit correctly', async () => {
        const expectedResult = new BigNumber(10).pow(largerDecimal);

        const result = await subject();

        expect(result).to.bignumber.equal(expectedResult);
      });
    });
  });

  describe('calculateSetParametersAsync', async () => {
    let subjectComponentPrices: BigNumber[];
    let subjectComponents: StandardTokenMockContract[];
    let subjectComponentAllocations: BigNumber[];
    let subjectTargetSetPrice: BigNumber;
    let subjectMaxPercentError: BigNumber;

    beforeEach(async () => {
      const tokenCount = 2;
      const decimalsList = [18, 18];
      subjectComponents = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, provider);
      subjectComponentPrices = [TWO, TWO];
      subjectComponentAllocations = [new BigNumber(0.5), new BigNumber(0.5)];
      subjectTargetSetPrice = TEN;
      subjectMaxPercentError = ONE;
    });

    async function subject(): Promise<NewSetParameters> {
      const subjectComponentAddresses = _.map(subjectComponents, components => components.address);

      return await factoryAPI.calculateSetParametersAsync(
        subjectComponentAddresses,
        subjectComponentPrices,
        subjectComponentAllocations,
        subjectTargetSetPrice,
        subjectMaxPercentError,
      );
    }

    test('should calculate the correct required component units', async () => {
      const { units } = await subject();

      const expectedResult = [new BigNumber(3), new BigNumber(3)];
      expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedResult));
    });

    test('should calculate the correct natural units', async () => {
      const { naturalUnit } = await subject();

      const expectedResult = new BigNumber(1);
      expect(naturalUnit).to.bignumber.equal(expectedResult);
    });

    describe('when the max percent error is set to 10%', async () => {
      beforeEach(async () => {
        subjectMaxPercentError = new BigNumber(0.1);
      });

      test('should calculate the correct required component units', async () => {
        const { units } = await subject();

        const expectedResult = [new BigNumber(25), new BigNumber(25)];
        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedResult));
      });

      test('should calculate the correct natural units', async () => {
        const { naturalUnit } = await subject();

        const expectedResult = new BigNumber(10);
        expect(naturalUnit).to.bignumber.equal(expectedResult);
      });
    });

    describe('when the allocation inputs do not sum up to 1', async () => {
      beforeEach(async () => {
        subjectComponentAllocations = [new BigNumber(0.5), new BigNumber(0.49)];
      });

      test('it should throw', async () => {
        return expect(subject()).to.be.rejectedWith(`The component percentages inputted do not add up to 1`);
      });
    });

    describe(
      'when the set is $100 with 10 components of varying prices and decimals weighted by market-cap',
    async () => {
      beforeEach(async () => {
        const tokenCount = 10;
        const decimalsList = [18, 18, 18, 18, 12, 18, 18, 8, 18, 18];
        subjectComponents = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, provider);
        subjectComponentPrices = [
          new BigNumber(3.53),
          new BigNumber(2.66),
          new BigNumber(0.0939),
          new BigNumber(10.72),
          new BigNumber(0.1205),
          new BigNumber(3.16),
          new BigNumber(1.3),
          new BigNumber(13.48),
          new BigNumber(39.82),
          new BigNumber(0.2905),
        ];
        subjectComponentAllocations = [
          new BigNumber(0.2369245),
          new BigNumber(0.1314204),
          new BigNumber(0.0415588),
          new BigNumber(0.1395683),
          new BigNumber(0.1120511),
          new BigNumber(0.0939489),
          new BigNumber(0.0879298),
          new BigNumber(0.0636428),
          new BigNumber(0.0558862),
          new BigNumber(0.0370692),
        ];

        subjectTargetSetPrice = new BigNumber(100);
      });

      test('should calculate the correct required component units', async () => {
        const expectedResult = [
          new BigNumber('671174220964'),
          new BigNumber('494061654136'),
          new BigNumber('4425857294995'),
          new BigNumber('130194309702'),
          new BigNumber('9298847'),
          new BigNumber('297306645570'),
          new BigNumber('676383076924'),
          new BigNumber('5'),
          new BigNumber('14034706178'),
          new BigNumber('1276048192772'),
        ];

        const { units } = await subject();

        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedResult));
      });

      test('should calculate the correct natural units', async () => {
        const { naturalUnit } = await subject();

        const expectedResult = new BigNumber(100000000000);
        expect(naturalUnit).to.bignumber.equal(expectedResult);
      });

      describe('when the maximum percent error is artificially low', async () => {
        beforeEach(async () => {
          subjectMaxPercentError = new BigNumber(0.0001);
        });

        test('should calculate the correct required component units', async () => {
        const expectedResult = [
          new BigNumber('6711742209632'),
          new BigNumber('4940616541354'),
          new BigNumber('44258572949947'),
          new BigNumber('1301943097015'),
          new BigNumber('92988465'),
          new BigNumber('2973066455697'),
          new BigNumber('6763830769231'),
          new BigNumber('48'),
          new BigNumber('140347061779'),
          new BigNumber('12760481927711'),
        ];

        const { units } = await subject();

        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedResult));
      });

        test('should calculate the correct natural units', async () => {
          const { naturalUnit } = await subject();

          const expectedResult = new BigNumber(1000000000000);
          expect(naturalUnit).to.bignumber.equal(expectedResult);
        });
      });
    });

    describe('when $100 Set is composed of ZRX and ZIL with 50/50 split', async () => {
      beforeEach(async () => {
        const tokenCount = 2;
        const decimalsList = [18, 12];
        subjectComponents = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, provider);
        subjectComponentPrices = [
          new BigNumber(0.627),
          new BigNumber(0.0342),
        ];
        subjectComponentAllocations = [
          new BigNumber(0.5),
          new BigNumber(0.5),
        ];

        subjectTargetSetPrice = new BigNumber(100);
      });

      test('should calculate the correct required component units', async () => {
        const { units } = await subject();

        const expectedResult = [new BigNumber('79744817'), new BigNumber('1462')];
        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedResult));
      });

      test('should calculate the correct natural units', async () => {
        const { naturalUnit } = await subject();

        const expectedResult = new BigNumber(1000000);
        expect(naturalUnit).to.bignumber.equal(expectedResult);
      });
    });
  });
});
