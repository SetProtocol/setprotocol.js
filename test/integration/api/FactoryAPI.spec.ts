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
import Web3 from 'web3';
import { Core } from 'set-protocol-contracts';
import {
  CoreContract,
  IssuanceOrderModuleContract,
  NoDecimalTokenMockContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';
import { SetProtocolUtils, Web3Utils } from 'set-protocol-utils';

import ChaiSetup from '@test/helpers/chaiSetup';
import { FactoryAPI } from '@src/api';
import { BigNumber } from '@src/util';
import { Assertions } from '@src/assertions';
import { CoreWrapper } from '@src/wrappers';
import { ACCOUNTS } from '@src/constants/accounts';
import { Address } from '@src/types/common';
import { DEFAULT_ACCOUNT, DEFAULT_UNIT_SHARES, ONE_DAY_IN_SECONDS, TX_DEFAULTS, ZERO } from '@src/constants';
import {
  deployBaseContracts,
  deployNoDecimalTokenAsync,
  deploySetTokensAsync,
  deployTokenAsync,
  deployTokensAsync,
  deployTokensSpecifyingDecimals,
} from '@test/helpers';
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '@src/util/logs';
import { ether } from '@src/util/units';
import { SetUnits } from '@src/types/common';
import { SetProtocolConfig } from '../../../src/SetProtocol';

ChaiSetup.configure();
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);
const { expect } = chai;

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('FactoryAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let issuanceOrderModule: IssuanceOrderModuleContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;

  let config: SetProtocolConfig;
  let coreWrapper: CoreWrapper;
  let factoryAPI: FactoryAPI;
  let assertions: Assertions;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy,
      vault,
      setTokenFactory,
      rebalancingSetTokenFactory,
      rebalanceAuctionModule,
      issuanceOrderModule,
    ] = await deployBaseContracts(web3);

    config = {
      coreAddress: core.address,
      transferProxyAddress: transferProxy.address,
      vaultAddress: vault.address,
      setTokenFactoryAddress: setTokenFactory.address,
      rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
      rebalanceAuctionModuleAddress: rebalanceAuctionModule.address,
      issuanceOrderModuleAddress: issuanceOrderModule.address,
    };
    coreWrapper = new CoreWrapper(
      web3,
      config.coreAddress,
      config.transferProxyAddress,
      config.vaultAddress,
      config.rebalanceAuctionModuleAddress,
      config.issuanceOrderModuleAddress,
    );
    assertions = new Assertions(web3, coreWrapper);
    factoryAPI = new FactoryAPI(web3, coreWrapper, assertions, config);
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

    let componentTokens: StandardTokenMockContract[];

    beforeEach(async () => {
      componentTokens = await deployTokensAsync(3, web3);

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
        config.setTokenFactoryAddress = 'invalidSetFactoryAddress';

        factoryAPI = new FactoryAPI(web3, coreWrapper, assertions, config);
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
        const minNaturalUnit = await factoryAPI.calculateMinimumNaturalUnitAsync(subjectComponents);
        return expect(subject()).to.be.rejectedWith(
          `Natural unit must be larger than minimum unit, ${minNaturalUnit.toString()}, allowed by components.`
        );
      });
    });
  });

  describe('createRebalancingSetTokenAsync', async () => {
    let subjectManager: Address;
    let subjectInitialSet: Address;
    let subjectInitialUnitShares: BigNumber;
    let subjectProposalPeriod: BigNumber;
    let subjectRebalanceInterval: BigNumber;
    let subjectEntranceFee: BigNumber;
    let subjectRebalanceFee: BigNumber;
    let subjectName: string;
    let subjectSymbol: string;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 1;
      const [setToken] = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      subjectManager = ACCOUNTS[1].address;
      subjectInitialSet = setToken.address;
      subjectInitialUnitShares = DEFAULT_UNIT_SHARES;
      subjectProposalPeriod = ONE_DAY_IN_SECONDS;
      subjectRebalanceInterval = ONE_DAY_IN_SECONDS;
      subjectEntranceFee = ZERO;
      subjectRebalanceFee = ZERO;
      subjectName = 'My Set';
      subjectSymbol = 'SET';
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await factoryAPI.createRebalancingSetTokenAsync(
        subjectManager,
        subjectInitialSet,
        subjectInitialUnitShares,
        subjectProposalPeriod,
        subjectRebalanceInterval,
        subjectEntranceFee,
        subjectRebalanceFee,
        subjectName,
        subjectSymbol,
        { from: subjectCaller }
      );
    }

    test('deploys a new SetToken contract', async () => {
      const createRebalancingSetTransactionHash = await subject();

      const logs = await getFormattedLogsFromTxHash(web3, createRebalancingSetTransactionHash);
      const deployedRebalancingSetTokenAddress = extractNewSetTokenAddressFromLogs(logs);
      const rebalancingSetTokenContract = await RebalancingSetTokenContract.at(
        deployedRebalancingSetTokenAddress,
        web3,
        TX_DEFAULTS
      );

      const currentSetAddress = await rebalancingSetTokenContract.currentSet.callAsync();
      expect(currentSetAddress).to.eql(subjectInitialSet);

      const manager = await rebalancingSetTokenContract.manager.callAsync();
      expect(manager).to.eql(subjectManager);

      const proposalPeriod = await rebalancingSetTokenContract.proposalPeriod.callAsync();
      expect(proposalPeriod).to.bignumber.equal(subjectProposalPeriod);

      const rebalanceInterval = await rebalancingSetTokenContract.rebalanceInterval.callAsync();
      expect(rebalanceInterval).to.bignumber.equal(subjectRebalanceInterval);

      const name = await rebalancingSetTokenContract.name.callAsync();
      expect(name).to.eql(subjectName);

      const symbol = await rebalancingSetTokenContract.symbol.callAsync();
      expect(symbol).to.eql(subjectSymbol);
    });

    describe('when the initialSet is not an address of a Set', async () => {
      beforeEach(async () => {
        const token = await deployTokenAsync(web3);
        subjectInitialSet = token.address;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Contract at ${subjectInitialSet} is not a valid Set token address.`
        );
      });
    });

    describe('when the init shares ratio is zero', async () => {
      beforeEach(async () => {
        subjectInitialUnitShares = ZERO;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Parameter initialUnitShares: ${subjectInitialUnitShares} must be greater than 0.`
        );
      });
    });
  });

  describe('getSetAddressFromCreateTxHash', async () => {
    let subjectTxHash: string;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, web3);
      const setComponentUnit = ether(4);
      const naturalUnit = ether(2);

      subjectTxHash = await core.create.sendTransactionAsync(
        setTokenFactory.address,
        componentTokens.map(token => token.address),
        componentTokens.map(token => setComponentUnit),
        naturalUnit,
        SetProtocolUtils.stringToBytes('set'),
        SetProtocolUtils.stringToBytes('SET'),
        '0x0',
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

  describe('calculateMinimumNaturalUnitAsync', async () => {
    let componentInstances: (StandardTokenMockContract | NoDecimalTokenMockContract)[];
    let subjectComponents: Address[];

    beforeEach(async () => {
      subjectComponents = componentInstances.map(component => component.address);
    });

    async function subject(): Promise<BigNumber> {
      return await factoryAPI.calculateMinimumNaturalUnitAsync(subjectComponents);
    }

    describe('when the decimals and token count are standard', async () => {
      beforeAll(async () => {
        const tokenCount = 2;
        const decimalsList = [18, 18];
        componentInstances = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3);
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
        const [standardToken] = await deployTokensSpecifyingDecimals(1, [18], web3);
        const nonDecimalComponent = await deployNoDecimalTokenAsync(web3);

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
        componentInstances = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3);
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

  describe('calculateSetUnitsAsync', async () => {
    let subjectComponentAddresses: Address[];
    let subjectComponentPrices: BigNumber[];
    let subjectComponentAllocations: BigNumber[];
    let subjectTargetSetPrice: BigNumber;
    let percentError: number;

    beforeEach(async () => {
      const tokenCount = 2;
      const decimalsList = [18, 18];
      const components = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3);

      subjectComponentAddresses = _.map(components, component => component.address);
      subjectComponentPrices = [new BigNumber(2), new BigNumber(2)];
      subjectComponentAllocations = [new BigNumber(0.5), new BigNumber(0.5)];
      subjectTargetSetPrice = new BigNumber(10);
      percentError = 10;
    });

    async function subject(): Promise<SetUnits> {
      return await factoryAPI.calculateSetUnitsAsync(
        subjectComponentAddresses,
        subjectComponentPrices,
        subjectComponentAllocations,
        subjectTargetSetPrice,
        percentError,
      );
    }

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

    describe('when the max percent error is set to 1%', async () => {
      beforeEach(async () => {
        percentError = 1;
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
  });

  describe('calculateSetUnits', async () => {
    let subjectComponentAddresses: Address[];
    let subjectDecimals: number[];
    let subjectComponentPrices: BigNumber[];
    let subjectComponentAllocations: BigNumber[];
    let subjectTargetSetPrice: BigNumber;
    let percentError: number;

    beforeEach(async () => {
      const tokenCount = 2;
      const decimalsList = [18, 18];
      const components = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3);

      subjectComponentAddresses = _.map(components, component => component.address);
      subjectDecimals = decimalsList;
      subjectComponentPrices = [new BigNumber(2), new BigNumber(2)];
      subjectComponentAllocations = [new BigNumber(0.5), new BigNumber(0.5)];
      subjectTargetSetPrice = new BigNumber(10);
      percentError = 10;
    });

    function subject(): SetUnits {
      return factoryAPI.calculateSetUnits(
        subjectComponentAddresses,
        subjectDecimals,
        subjectComponentPrices,
        subjectComponentAllocations,
        subjectTargetSetPrice,
        percentError,
      );
    }

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

    describe('when the max percent error is set to 1%', async () => {
      beforeEach(async () => {
        percentError = 1;
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

    describe('when the allocation inputs do not sum up to 1', () => {
      beforeEach(async () => {
        subjectComponentAllocations = [new BigNumber(0.5), new BigNumber(0.49)];
      });

      test('it should throw', async () => {
        expect(() => subject()).to.throw(`The component percentages inputted do not add up to 1`);
      });
    });

    describe(
      'when the set is $100 with 10 components of varying prices and decimals weighted by market-cap',
    async () => {
      beforeEach(async () => {
        const tokenCount = 10;
        const decimalsList = [18, 18, 18, 18, 12, 18, 18, 8, 18, 18];
        const decimalSpecificComponents = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3);

        subjectComponentAddresses = _.map(decimalSpecificComponents, component => component.address);
        subjectDecimals = decimalsList;
        subjectComponentPrices = [
          new BigNumber(3.5300),
          new BigNumber(2.6600),
          new BigNumber(0.0939),
          new BigNumber(0.4000),
          new BigNumber(0.1205),
          new BigNumber(3.1600),
          new BigNumber(1.3000),
          new BigNumber(13.4800),
          new BigNumber(39.8200),
          new BigNumber(0.2905),
        ];
        subjectComponentAllocations = [
          new BigNumber(0.2658791),
          new BigNumber(0.1474813),
          new BigNumber(0.0466377),
          new BigNumber(0.0344147),
          new BigNumber(0.1257449),
          new BigNumber(0.1054304),
          new BigNumber(0.0986757),
          new BigNumber(0.0714206),
          new BigNumber(0.0627161),
          new BigNumber(0.0415995),
        ];
        subjectTargetSetPrice = new BigNumber(100);
      });

      test('should calculate the correct required component units', async () => {
        const expectedResult = [
          new BigNumber('753198583570'),
          new BigNumber('554440977444'),
          new BigNumber('4966741214058'),
          new BigNumber('860367500000'),
          new BigNumber('10435262'),
          new BigNumber('333640506330'),
          new BigNumber('759043846154'),
          new BigNumber('6'),
          new BigNumber('15749899548'),
          new BigNumber('1431996557660'),
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
          percentError = 0.0001;
        });

        test('should calculate the correct required component units', async () => {
          const expectedResult = [
            new BigNumber('7531985835694051'),
            new BigNumber('5544409774436091'),
            new BigNumber('49667412140575080'),
            new BigNumber('8603675000000000'),
            new BigNumber('104352614108'),
            new BigNumber('3336405063291140'),
            new BigNumber('7590438461538462'),
            new BigNumber('52983'),
            new BigNumber('157498995479659'),
            new BigNumber('14319965576592083'),
          ];

          const { units } = await subject();
          expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedResult));
        });

        test('should calculate the correct natural units', async () => {
          const { naturalUnit } = await subject();

          const expectedResult = new BigNumber(1000000000000000);
          expect(naturalUnit).to.bignumber.equal(expectedResult);
        });
      });
    });

    describe('when $100 Set is composed of ZRX and ZIL with 50/50 split', async () => {
      beforeEach(async () => {
        const tokenCount = 2;
        const decimalsList = [18, 12];
        const decimalSpecificComponents = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3);

        subjectComponentAddresses = _.map(decimalSpecificComponents, component => component.address);
        subjectDecimals = decimalsList;
        subjectComponentPrices = [new BigNumber(0.627), new BigNumber(0.0342)];
        subjectComponentAllocations = [new BigNumber(0.5), new BigNumber(0.5)];
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

    describe('when $1 StableSet composed of Stably, TUSD, DAI with 40/30/30 split', async() => {
      beforeEach(async () => {
        const tokenCount = 3;
        const decimalsList = [6, 18, 18];
        const decimalSpecificComponents = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3);

        subjectComponentAddresses = _.map(decimalSpecificComponents, component => component.address);
        subjectDecimals = decimalsList;
        subjectComponentPrices = [new BigNumber(1), new BigNumber(1), new BigNumber(1)];
        subjectComponentAllocations = [new BigNumber(0.4), new BigNumber(0.3), new BigNumber(0.3)];
        subjectTargetSetPrice = new BigNumber(1);
      });

      test('should calculate the correct required component units', async () => {
        const { units } = await subject();

        const expectedResult = [new BigNumber('4'), new BigNumber('3000000000000'), new BigNumber('3000000000000')];
        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedResult));
      });

      test('should calculate the correct natural units', async () => {
        const { naturalUnit } = await subject();

        const expectedResult = new BigNumber(10 ** 13);
        expect(naturalUnit).to.bignumber.equal(expectedResult);
      });
    });
  });
});
