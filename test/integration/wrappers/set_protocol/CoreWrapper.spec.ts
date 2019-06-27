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
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import { Core } from 'set-protocol-contracts';
import {
  CoreContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { CoreWrapper } from '@src/wrappers';
import {
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
} from '@src/constants';
import {
  addModuleAsync,
  addPriceLibraryAsync,
  approveForTransferAsync,
  deployBaseContracts,
  deployKyberNetworkWrapperContract,
  deploySetTokenAsync,
  deployTokenAsync,
  deployTokensAsync,
  getVaultBalances,
  registerExchange,
} from '@test/helpers';
import {
  BigNumber,
  ether,
  extractNewSetTokenAddressFromLogs,
  getFormattedLogsFromTxHash,
} from '@src/util';
import { Address } from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const { SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('CoreWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;

  let coreWrapper: CoreWrapper;

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
    ] = await deployBaseContracts(web3);

    coreWrapper = new CoreWrapper(
      web3,
      core.address,
      transferProxy.address,
      vault.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('create', async () => {
    let componentTokens: StandardTokenMockContract[];

    let subjectFactoryAddress: Address;
    let subjectComponents: Address[];
    let subjectUnits: BigNumber[];
    let subjectNaturalUnit: BigNumber;
    let subjectName: string;
    let subjectSymbol: string;
    let subjectCallData: string;
    let subjectCaller: Address;

    beforeEach(async () => {
      componentTokens = await deployTokensAsync(3, web3);

      subjectComponents = componentTokens.map(component => component.address);
      subjectUnits = subjectComponents.map(component => ether(4));
      subjectNaturalUnit = ether(2);
      subjectName = 'My Set';
      subjectSymbol = 'SET';
      subjectCallData = '0x0';
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.create(
        subjectFactoryAddress,
        subjectComponents,
        subjectUnits,
        subjectNaturalUnit,
        subjectName,
        subjectSymbol,
        subjectCallData,
        { from: subjectCaller }
      );
    }

    describe('when the factory address is for vanilla SetToken', async () => {
      beforeEach(async () => {
        subjectFactoryAddress = setTokenFactory.address;
      });

      test('creates a new SetToken contract', async () => {
        const createSetTransactionHash = await subject();

        const formattedLogs = await getFormattedLogsFromTxHash(web3, createSetTransactionHash);
        const deployedSetTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
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
  });

  describe('issue', async () => {
    let setToken: SetTokenContract;

    let subjectSetToIssue: Address;
    let subjectQuantitytoIssue: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, web3);
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

      subjectSetToIssue = setToken.address;
      subjectQuantitytoIssue = ether(2);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.issue(
        subjectSetToIssue,
        subjectQuantitytoIssue,
        { from: subjectCaller }
      );
    }

    test('updates the set balance of the user by the issue quantity', async () => {
      const existingSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

      await subject();

      const expectedSetUserBalance = existingSetUserBalance.add(subjectQuantitytoIssue);
      const newSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
      expect(newSetUserBalance).to.eql(expectedSetUserBalance);
    });
  });

  describe('redeem', async () => {
    let setToken: SetTokenContract;

    let subjectSetToRedeem: Address;
    let subjectQuantityToRedeem: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, web3);
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

      await core.issue.sendTransactionAsync(
        setToken.address,
        ether(2),
        TX_DEFAULTS
      );

      subjectSetToRedeem = setToken.address;
      subjectQuantityToRedeem = ether(2);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.redeem(
        subjectSetToRedeem,
        subjectQuantityToRedeem,
        { from: subjectCaller }
      );
    }

    test('updates the set balance of the user by the redeem quantity', async () => {
      const existingSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

      await subject();

      const expectedSetUserBalance = existingSetUserBalance.sub(subjectQuantityToRedeem);
      const newSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
      expect(newSetUserBalance).to.eql(expectedSetUserBalance);
    });
  });

  describe('redeemAndWithdraw', async () => {
    let setToken: SetTokenContract;

    let subjectSetToRedeem: Address;
    let subjectQuantityToRedeem: BigNumber;
    let subjectTokensToExcludeBitmask: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, web3);
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

      await core.issue.sendTransactionAsync(
        setToken.address,
        ether(2),
        TX_DEFAULTS
      );

      subjectSetToRedeem = setToken.address;
      subjectQuantityToRedeem = ether(2);
      subjectTokensToExcludeBitmask = ZERO;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.redeemAndWithdrawTo(
        subjectSetToRedeem,
        subjectQuantityToRedeem,
        subjectTokensToExcludeBitmask,
        { from: subjectCaller }
      );
    }

    test('updates the set balance of the user by the redeem quantity', async () => {
      const existingSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

      await subject();

      const expectedSetUserBalance = existingSetUserBalance.sub(subjectQuantityToRedeem);
      const newSetUserBalance = await setToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
      expect(newSetUserBalance).to.eql(expectedSetUserBalance);
    });
  });

  describe('deposit', async () => {
    let token: StandardTokenMockContract;
    let depositQuantity: BigNumber;

    let subjectTokenAddressToDeposit: Address;
    let subjectQuantityToDeposit: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      token = await deployTokenAsync(web3);
      await approveForTransferAsync([token], transferProxy.address);
      subjectTokenAddressToDeposit = token.address;

      depositQuantity = new BigNumber(100);
      subjectQuantityToDeposit = depositQuantity;

      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.deposit(
        subjectTokenAddressToDeposit,
        subjectQuantityToDeposit,
        { from: subjectCaller },
      );
    }

    test('correctly updates the vault balance', async () => {
        const existingOwnerVaultBalance = await vault.getOwnerBalance.callAsync(
          subjectTokenAddressToDeposit,
          DEFAULT_ACCOUNT
        );

        await subject();

        const expectedVaultOwnerBalance = existingOwnerVaultBalance.add(depositQuantity);
        const newVaultOwnerBalance = await vault.getOwnerBalance.callAsync(
          subjectTokenAddressToDeposit,
          DEFAULT_ACCOUNT
        );
        expect(newVaultOwnerBalance).to.eql(expectedVaultOwnerBalance);
      });
  });

  describe('batchDeposit', async () => {
    let tokens: StandardTokenMockContract[];
    let depositQuantity: BigNumber;

    let subjectTokenAddressesToDeposit: Address[];
    let subjectQuantitesToWithdraw: BigNumber[];
    let subjectCaller: Address;

    beforeEach(async () => {
      tokens = await deployTokensAsync(3, web3);
      await approveForTransferAsync(tokens, transferProxy.address);
      subjectTokenAddressesToDeposit = tokens.map(token => token.address);

      depositQuantity = new BigNumber(100);
      subjectQuantitesToWithdraw = tokens.map(() => depositQuantity);

      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.batchDeposit(
        subjectTokenAddressesToDeposit,
        subjectQuantitesToWithdraw,
        { from: subjectCaller },
      );
    }

    test('correctly updates the vault balances', async () => {
      const existingVaultOwnerBalances = await getVaultBalances(vault, subjectTokenAddressesToDeposit, subjectCaller);

      await subject();

      const expectedVaultOwnerBalances = _.map(existingVaultOwnerBalances, balance => balance.add(depositQuantity));
      const newOwnerVaultBalances = await getVaultBalances(vault, subjectTokenAddressesToDeposit, subjectCaller);
      expect(newOwnerVaultBalances).to.eql(expectedVaultOwnerBalances);
    });
  });

  describe('withdraw', async () => {
    let token: StandardTokenMockContract;
    let withdrawQuantity: BigNumber;

    let subjectTokenAddressToWithdraw: Address;
    let subjectQuantityToWithdraw: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      token = await deployTokenAsync(web3);
      await approveForTransferAsync([token], transferProxy.address);
      subjectTokenAddressToWithdraw = token.address;

      withdrawQuantity = new BigNumber(100);
      await coreWrapper.deposit(
        token.address,
        withdrawQuantity,
        { from: DEFAULT_ACCOUNT },
      );

      subjectQuantityToWithdraw = withdrawQuantity;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.withdraw(
        subjectTokenAddressToWithdraw,
        subjectQuantityToWithdraw,
        { from: subjectCaller },
      );
    }

    test('correctly updates the vault balance', async () => {
        const existingOwnerVaultBalance = await vault.getOwnerBalance.callAsync(
          subjectTokenAddressToWithdraw,
          DEFAULT_ACCOUNT
        );

        await subject();

        const expectedVaultOwnerBalance = existingOwnerVaultBalance.sub(withdrawQuantity);
        const newVaultOwnerBalance = await vault.getOwnerBalance.callAsync(
          subjectTokenAddressToWithdraw,
          DEFAULT_ACCOUNT
        );
        expect(newVaultOwnerBalance).to.eql(expectedVaultOwnerBalance);
      });
  });

  describe('batchWithdraw', async () => {
    let tokens: StandardTokenMockContract[];
    let withdrawQuantity: BigNumber;

    let subjectTokenAddressesToWithdraw: Address[];
    let subjectQuantitesToWithdraw: BigNumber[];
    let subjectCaller: Address;

    beforeEach(async () => {
      tokens = await deployTokensAsync(3, web3);
      await approveForTransferAsync(tokens, transferProxy.address);
      const tokenAddresses = tokens.map(token => token.address);

      withdrawQuantity = new BigNumber(100);
      const quantitesToDeposit = tokenAddresses.map(() => withdrawQuantity);
      await coreWrapper.batchDeposit(
        tokenAddresses,
        quantitesToDeposit,
        { from: DEFAULT_ACCOUNT },
      );

      subjectTokenAddressesToWithdraw = tokenAddresses;
      subjectQuantitesToWithdraw = quantitesToDeposit;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await coreWrapper.batchWithdraw(
        subjectTokenAddressesToWithdraw,
        subjectQuantitesToWithdraw,
        { from: subjectCaller },
      );
    }

    test('correctly updates the vault balances', async () => {
      const existingVaultOwnerBalances = await getVaultBalances(vault, subjectTokenAddressesToWithdraw, subjectCaller);

      await subject();

      const expectedVaultOwnerBalances = _.map(existingVaultOwnerBalances, balance => balance.sub(withdrawQuantity));
      const newOwnerVaultBalances = await getVaultBalances(vault, subjectTokenAddressesToWithdraw, subjectCaller);
      expect(newOwnerVaultBalances).to.eql(expectedVaultOwnerBalances);
    });
  });

  describe('Core State Getters', async () => {
    let setComponentUnit: BigNumber;
    let moduleAddress: Address;
    let priceLibraryAddress: Address;
    let setToken: SetTokenContract;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, web3);
      setComponentUnit = ether(4);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokens.map(token => token.address),
        componentTokens.map(token => setComponentUnit),
        naturalUnit,
      );

      moduleAddress = ACCOUNTS[2].address;
      priceLibraryAddress = ACCOUNTS[3].address;

      await addModuleAsync(core, moduleAddress);
      await addPriceLibraryAsync(core, priceLibraryAddress);
    });

    test('gets exchange address', async () => {
      const kyberWrapper = await deployKyberNetworkWrapperContract(web3, NULL_ADDRESS, transferProxy, core);
      const exchangeAddress = await coreWrapper.exchangeIds(SetUtils.EXCHANGES.KYBER);

      expect(exchangeAddress).to.equal(kyberWrapper.address);
    });

    test('gets transfer proxy address', async () => {
      const transferProxyAddress = await coreWrapper.transferProxy();

      expect(coreWrapper.transferProxyAddress).to.equal(transferProxyAddress);
    });

    test('gets vault address', async () => {
      const vaultAddress = await coreWrapper.vault();

      expect(coreWrapper.vaultAddress).to.equal(vaultAddress);
    });

    test('gets Set addresses', async () => {
      const setAddresses = await coreWrapper.setTokens();

      expect(setAddresses.length).to.equal(1);
      expect(setAddresses[0]).to.equal(setToken.address);
    });

    test('gets is valid factory address', async () => {
      let isValidVaultAddress = await coreWrapper.validFactories(setTokenFactory.address);
      expect(isValidVaultAddress).to.equal(true);

      isValidVaultAddress = await coreWrapper.validFactories(NULL_ADDRESS);
      expect(isValidVaultAddress).to.equal(false);
    });

    test('gets is valid Set address', async () => {
      let isValidSetAddress = await coreWrapper.validSets(setToken.address);
      expect(isValidSetAddress).to.equal(true);

      isValidSetAddress = await coreWrapper.validSets(NULL_ADDRESS);
      expect(isValidSetAddress).to.equal(false);
    });

    test('gets is valid module', async () => {
      let isValidModule = await coreWrapper.validModules(moduleAddress);
      expect(isValidModule).to.equal(true);

      isValidModule = await coreWrapper.validModules(NULL_ADDRESS);
      expect(isValidModule).to.equal(false);
    });

    test('gets is valid price library', async () => {
      let isValidPriceLibrary = await coreWrapper.validPriceLibrary(priceLibraryAddress);
      expect(isValidPriceLibrary).to.equal(true);

      isValidPriceLibrary = await coreWrapper.validPriceLibrary(NULL_ADDRESS);
      expect(isValidPriceLibrary).to.equal(false);
    });

    test('gets operation state', async () => {
      const operationalState = new BigNumber(0);

      const operationState = await coreWrapper.operationState();
      expect(operationState).to.bignumber.equal(operationalState);
    });

    test('gets modules', async () => {
      const modules = await coreWrapper.modules();

      const expectedModules = [
        rebalanceAuctionModule.address,
        moduleAddress,
      ];
      expect(JSON.stringify(modules)).to.equal(JSON.stringify(expectedModules));
    });

    test('gets factories', async () => {
      const factories = await coreWrapper.factories();

      const expectedFactories = [
        setTokenFactory.address,
        rebalancingSetTokenFactory.address,
      ];
      expect(JSON.stringify(factories)).to.equal(JSON.stringify(expectedFactories));
    });

    test('gets exchanges', async () => {
      await registerExchange(web3, core.address, 1, DEFAULT_ACCOUNT);

      const exchanges = await coreWrapper.exchanges();

      const expectedExchanges = [
        DEFAULT_ACCOUNT,
      ];
      expect(JSON.stringify(exchanges)).to.equal(JSON.stringify(expectedExchanges));
    });

    test('gets price libraries', async () => {
      await addPriceLibraryAsync(core, DEFAULT_ACCOUNT);

      const priceLibraries = await coreWrapper.priceLibraries();

      const expectedPriceLibraries = [
        priceLibraryAddress,
        DEFAULT_ACCOUNT,
      ];
      expect(JSON.stringify(priceLibraries)).to.equal(JSON.stringify(expectedPriceLibraries));
    });
  });
});
