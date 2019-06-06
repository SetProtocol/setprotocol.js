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
import Web3 from 'web3';
import { Core, StandardTokenMock } from 'set-protocol-contracts';
import { TransactionReceipt } from 'ethereum-types';
import {
  CoreContract,
  NoDecimalTokenMockContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
} from 'set-protocol-contracts';
import { SetProtocolUtils, Web3Utils } from 'set-protocol-utils';

import ChaiSetup from '../helpers/chaiSetup';
import { ACCOUNTS, DEFAULT_ACCOUNT } from '@src/constants/accounts';
import SetProtocol from '@src/SetProtocol';
import {
  DEFAULT_UNIT_SHARES,
  NULL_ADDRESS,
  ONE_DAY_IN_SECONDS,
  TX_DEFAULTS,
} from '@src/constants';
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '@src/util/logs';
import { BigNumber } from '@src/util';
import { ERC20Wrapper } from '@src/wrappers';
import { Address, Log, SetProtocolConfig, SetUnits } from '@src/types/common';
import {
  approveForTransferAsync,
  deployBaseContracts,
  deployNoDecimalTokenAsync,
  deploySetTokenAsync,
  deploySetTokensAsync,
  deployTokenAsync,
  deployTokensAsync,
  deployTokensSpecifyingDecimals,
  getVaultBalances,
} from '@test/helpers';
import { ether, getFormattedLogsFromReceipt } from '@src/util';

ChaiSetup.configure();
const { expect } = chai;
const { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } = SetProtocolUtils.CONSTANTS;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);
const erc20Wrapper = new ERC20Wrapper(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('SetProtocol', async () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;

  let setProtocol: SetProtocol;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [core, transferProxy, vault, setTokenFactory, rebalancingSetTokenFactory] = await deployBaseContracts(web3);

    setProtocol = new SetProtocol(
      web3.currentProvider,
      {
        coreAddress: core.address,
        transferProxyAddress: transferProxy.address,
        vaultAddress: vault.address,
        setTokenFactoryAddress: setTokenFactory.address,
        rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
      } as SetProtocolConfig,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('calculateMinimumNaturalUnitAsync', async () => {
    let mockNoDecimalToken: NoDecimalTokenMockContract;
    let mockTokens: StandardTokenMockContract[];
    let subjectComponents: Address[];

    beforeEach(async () => {
      mockNoDecimalToken = await deployNoDecimalTokenAsync(web3);
      mockTokens = await deployTokensAsync(3, web3);
    });

    async function subject(): Promise<BigNumber> {
      return await setProtocol.calculateMinimumNaturalUnitAsync(
        subjectComponents,
      );
    }

    test('returns the correct minimum natural unit', async () => {
      const decimalPromises = _.map(mockTokens, mockToken => {
        return erc20Wrapper.decimals(mockToken.address);
      });
      const decimals = await Promise.all(decimalPromises);
      const minDecimal = BigNumber.min(decimals);

      subjectComponents = _.map(mockTokens, mockToken => mockToken.address);

      const minimumNaturalUnit = await subject();

      expect(minimumNaturalUnit).to.bignumber.equal(new BigNumber(10).pow(18 - minDecimal.toNumber()));
    });

    test('returns max natural unit if one token does not have decimals', async () => {
      subjectComponents = _.map(mockTokens, mockToken => mockToken.address);
      subjectComponents.push(mockNoDecimalToken.address);

      const minimumNaturalUnit = await subject();

      expect(minimumNaturalUnit).to.bignumber.equal(new BigNumber(10).pow(18));
    });
  });

  describe('calculateSetUnitsAsync', async () => {
    let subjectComponentAddresses: Address[];
    let subjectComponentPrices: BigNumber[];
    let subjectComponentAllocations: BigNumber[];
    let subjectTargetSetPrice: BigNumber;
    let subjectPercentError: number;

    beforeEach(async () => {
      const tokenCount = 2;
      const decimalsList = [18, 18];
      const components = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3);

      subjectComponentAddresses = _.map(components, component => component.address);
      subjectComponentPrices = [new BigNumber(2), new BigNumber(2)];
      subjectComponentAllocations = [new BigNumber(0.5), new BigNumber(0.5)];
      subjectTargetSetPrice = new BigNumber(10);
      subjectPercentError = 10;
    });

    async function subject(): Promise<SetUnits> {
      return await setProtocol.calculateSetUnitsAsync(
        subjectComponentAddresses,
        subjectComponentPrices,
        subjectComponentAllocations,
        subjectTargetSetPrice,
        subjectPercentError,
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

    describe('when the percent error is not pass in', async () => {
      async function subject(): Promise<SetUnits> {
        return await setProtocol.calculateSetUnitsAsync(
          subjectComponentAddresses,
          subjectComponentPrices,
          subjectComponentAllocations,
          subjectTargetSetPrice
        );
      }

      test('it defaults to 10%', async () => {
        const { units, naturalUnit } = await subject();

        const expectedComponentUnit = [new BigNumber(25), new BigNumber(25)];
        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedComponentUnit));

        const expectedNaturalUnit = new BigNumber(10);
        expect(naturalUnit).to.bignumber.equal(expectedNaturalUnit);
      });
    });
  });

    describe('calculateSetUnits', async () => {
    let subjectComponentAddresses: Address[];
    let subjectDecimals: number[];
    let subjectComponentPrices: BigNumber[];
    let subjectComponentAllocations: BigNumber[];
    let subjectTargetSetPrice: BigNumber;
    let subjectPercentError: number;

    beforeEach(async () => {
      const tokenCount = 2;
      const decimalsList = [18, 18];
      const components = await deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3);

      subjectComponentAddresses = _.map(components, component => component.address);
      subjectDecimals = decimalsList;
      subjectComponentPrices = [new BigNumber(2), new BigNumber(2)];
      subjectComponentAllocations = [new BigNumber(0.5), new BigNumber(0.5)];
      subjectTargetSetPrice = new BigNumber(10);
      subjectPercentError = 10;
    });

    function subject(): SetUnits {
      return setProtocol.calculateSetUnits(
        subjectComponentAddresses,
        subjectDecimals,
        subjectComponentPrices,
        subjectComponentAllocations,
        subjectTargetSetPrice,
        subjectPercentError,
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

    describe('when the percent error is not pass in', async () => {
      async function subject(): Promise<SetUnits> {
        return await setProtocol.calculateSetUnitsAsync(
          subjectComponentAddresses,
          subjectComponentPrices,
          subjectComponentAllocations,
          subjectTargetSetPrice
        );
      }

      test('it defaults to 10%', async () => {
        const { units, naturalUnit } = await subject();

        const expectedComponentUnit = [new BigNumber(25), new BigNumber(25)];
        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedComponentUnit));

        const expectedNaturalUnit = new BigNumber(10);
        expect(naturalUnit).to.bignumber.equal(expectedNaturalUnit);
      });
    });
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
      componentTokens = await deployTokensAsync(3, web3);

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

  describe('createRebalancingSetTokenAsync', async () => {
    let subjectManager: Address;
    let subjectInitialSet: Address;
    let subjectInitialUnitShares: BigNumber;
    let subjectProposalPeriod: BigNumber;
    let subjectRebalanceInterval: BigNumber;
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
      subjectName = 'My Set';
      subjectSymbol = 'SET';
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await setProtocol.createRebalancingSetTokenAsync(
        subjectManager,
        subjectInitialSet,
        subjectInitialUnitShares,
        subjectProposalPeriod,
        subjectRebalanceInterval,
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
  });

  describe('issueAsync', () => {
    let subjectSetToIssue: Address;
    let subjectQuantitytoIssue: BigNumber;
    let subjectCaller: Address;

    let setToken: SetTokenContract;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, web3);
      const setComponentUnit = ether(4);
      const componentUnits = componentTokens.map(() => setComponentUnit);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokens.map(token => token.address),
        componentUnits,
        naturalUnit,
      );

      await approveForTransferAsync(componentTokens, transferProxy.address);

      subjectSetToIssue = setToken.address;
      subjectQuantitytoIssue = ether(2);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await setProtocol.issueAsync(
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

  describe('redeemAsync', () => {
    let subjectSetToRedeem: Address;
    let subjectQuantityToRedeem: BigNumber;
    let subjectShouldWithdraw: boolean;
    let subjectTokensToExclude: Address[];
    let subjectCaller: Address;

    let setToken: SetTokenContract;

    beforeEach(async () => {
      const componentTokens = await deployTokensAsync(3, web3);
      const setComponentUnit = ether(4);
      const componentUnits = componentTokens.map(() => setComponentUnit);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentTokens.map(token => token.address),
        componentUnits,
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
      subjectShouldWithdraw = false;
      subjectTokensToExclude = [];
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await setProtocol.redeemAsync(
        subjectSetToRedeem,
        subjectQuantityToRedeem,
        subjectShouldWithdraw,
        subjectTokensToExclude,
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

  describe('depositAsync', () => {
    let subjectTokenAddressesToDeposit: Address[];
    let subjectQuantitiesToDeposit: BigNumber[];
    let subjectCaller: Address;

    let tokens: StandardTokenMockContract[];
    let depositQuantity: BigNumber;

    beforeEach(async () => {
      tokens = await deployTokensAsync(3, web3);
      await approveForTransferAsync(tokens, transferProxy.address);

      depositQuantity = new BigNumber(100);

      subjectTokenAddressesToDeposit = tokens.map(token => token.address);
      subjectQuantitiesToDeposit = tokens.map(() => depositQuantity);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await setProtocol.depositAsync(
        subjectTokenAddressesToDeposit,
        subjectQuantitiesToDeposit,
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

  describe('withdrawAsync', () => {
    let subjectTokenAddressesToWithdraw: Address[];
    let subjectQuantitiesToWithdraw: BigNumber[];
    let subjectCaller: Address;

    let tokens: StandardTokenMockContract[];
    let withdrawQuantity: BigNumber;

    beforeEach(async () => {
      tokens = await deployTokensAsync(3, web3);
      await approveForTransferAsync(tokens, transferProxy.address);

      withdrawQuantity = new BigNumber(100);
      subjectTokenAddressesToWithdraw = tokens.map(token => token.address);

      const quantitiesToDeposit = subjectTokenAddressesToWithdraw.map(() => withdrawQuantity);
      await setProtocol.depositAsync(
        subjectTokenAddressesToWithdraw,
        quantitiesToDeposit,
        { from: DEFAULT_ACCOUNT },
      );

      subjectQuantitiesToWithdraw = quantitiesToDeposit;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await setProtocol.withdrawAsync(
        subjectTokenAddressesToWithdraw,
        subjectQuantitiesToWithdraw,
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

  describe('setTransferProxyAllowanceAsync', async () => {
    let token: StandardTokenMockContract;
    let subjectCaller: Address;
    let subjectQuantity: BigNumber;

    beforeEach(async () => {
      const tokenContracts = await deployTokensAsync(1, web3);
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
      const tokenContracts = await deployTokensAsync(1, web3);
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

  describe('awaitTransactionMinedAsync', async () => {
    let subjectTxHash: string;

    const standardTokenContract = contract(StandardTokenMock);
    let transactionToken: StandardTokenMockContract;
    let transactionCaller: Address;
    let transactionSpender: Address;
    let transactionQuantity: BigNumber;

    beforeAll(() => {
      ABIDecoder.addABI(standardTokenContract.abi);
    });

    beforeEach(async () => {
      transactionToken = await deployTokenAsync(web3);

      transactionCaller = DEFAULT_ACCOUNT;
      transactionSpender = ACCOUNTS[0].address;
      transactionQuantity = new BigNumber(1);

      subjectTxHash = await transactionToken.approve.sendTransactionAsync(
        transactionSpender,
        transactionQuantity,
        { from: transactionCaller},
      );
    });

    afterAll(() => {
      ABIDecoder.removeABI(standardTokenContract.abi);
    });

    async function subject(): Promise<TransactionReceipt> {
      return await setProtocol.awaitTransactionMinedAsync(
        subjectTxHash,
      );
    }

    test('returns transaction receipt with the correct logs', async () => {
      const receipt = await subject();

      const formattedLogs: Log[] = getFormattedLogsFromReceipt(receipt);
      const [approvalLog] = formattedLogs;
      const { owner, spender, value } = approvalLog.args;

      expect(approvalLog.address).to.equal(transactionToken.address);
      expect(owner).to.equal(transactionCaller.toLowerCase());
      expect(spender).to.equal(transactionSpender.toLowerCase());
      expect(value).to.bignumber.equal(transactionQuantity);
    });
  });

  /* ============ Core State Getters ============ */

  describe('Core State Getters', async () => {
    let setToken: SetTokenContract;

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
