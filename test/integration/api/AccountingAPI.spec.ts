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
import { CoreContract, StandardTokenMockContract, VaultContract } from 'set-protocol-contracts';

import ChaiSetup from '../../helpers/chaiSetup';
import { AccountingAPI } from '../../../src/api';
import { BigNumber } from '../../../src/util';
import { CoreWrapper } from '../../../src/wrappers';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '../../../src/constants/accounts';
import { TX_DEFAULTS, ZERO } from '../../../src/constants';
import { deployTokensForSetWithApproval, initializeCoreWrapper } from '../../helpers/coreHelpers';
import { deployVaultContract, getVaultBalances } from '../../helpers/vaultHelpers';
import { testSets, TestSet } from '../../testSets';
import { Web3Utils } from '../../../src/util/Web3Utils';

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


describe('CoreWrapper', () => {
  let coreWrapper: CoreWrapper;
  let setToCreate: TestSet;
  let tokenAddresses: Address[];
  let vault: VaultContract;
  let accountingAPI: AccountingAPI;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    coreWrapper = await initializeCoreWrapper(provider);
    setToCreate = testSets[0];
    tokenAddresses = await deployTokensForSetWithApproval(
      setToCreate,
      coreWrapper.transferProxyAddress,
      provider,
    );

    vault = await deployVaultContract(provider, coreWrapper.vaultAddress);
    accountingAPI = new AccountingAPI(web3, coreWrapper);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('depositAsync', async () => {
    let subjectTokenAddressesToDeposit: Address[];
    let subjectQuantitiesToDeposit: BigNumber[];
    let subjectCaller: Address;
    let depositQuantity: BigNumber;

    beforeEach(async () => {
      depositQuantity = new BigNumber(100);

      subjectTokenAddressesToDeposit = tokenAddresses;
      subjectQuantitiesToDeposit = tokenAddresses.map(() => depositQuantity);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await accountingAPI.depositAsync(
        subjectTokenAddressesToDeposit,
        subjectQuantitiesToDeposit,
        { from: subjectCaller },
      );
    }

    test('correctly updates the vault balances', async () => {
      const existingVaultOwnerBalances = await getVaultBalances(vault, tokenAddresses, subjectCaller);

      await subject();

      const expectedVaultOwnerBalances = _.map(existingVaultOwnerBalances, balance => balance.add(depositQuantity));
      const newOwnerVaultBalances = await getVaultBalances(vault, tokenAddresses, subjectCaller);
      expect(newOwnerVaultBalances).to.eql(expectedVaultOwnerBalances);
    });

    describe('when a single address and quantity is passed in', async () => {
      let tokenAddress: Address;

      beforeEach(async () => {
        tokenAddress = tokenAddresses[0];

        subjectTokenAddressesToDeposit = [tokenAddress];
        subjectQuantitiesToDeposit = subjectTokenAddressesToDeposit.map(() => depositQuantity);
      });

      test('correctly updates the vault balance', async () => {
        const existingOwnerVaultBalance = await vault.getOwnerBalance.callAsync(tokenAddress, DEFAULT_ACCOUNT);

        await subject();

        const expectedVaultOwnerBalance = existingOwnerVaultBalance.add(depositQuantity);
        const newVaultOwnerBalance = await vault.getOwnerBalance.callAsync(tokenAddress, DEFAULT_ACCOUNT);
        expect(newVaultOwnerBalance).to.eql(expectedVaultOwnerBalance);
      });
    });

    describe('when the transaction caller address is invalid', async () => {
      beforeEach(async () => {
        subjectCaller = 'invalidAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected txOpts.from to conform to schema /Address.

        Encountered: "invalidAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the token addresses and quantities are not the same length', async () => {
      beforeEach(async () => {
        subjectTokenAddressesToDeposit = [_.first(tokenAddresses)];
        subjectQuantitiesToDeposit = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          'The tokenAddresses and quantities arrays need to be equal lengths.'
        );
      });
    });

    describe('when the quantities containes a negative number', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = new BigNumber(-1);

        subjectTokenAddressesToDeposit = [_.first(tokenAddresses)];
        subjectQuantitiesToDeposit = [invalidQuantity];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidQuantity} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the token addresses contains an empty address', async () => {
      beforeEach(async () => {
        subjectTokenAddressesToDeposit = [undefined];
        subjectQuantitiesToDeposit = [depositQuantity];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('The string tokenAddress cannot be empty.');
      });
    });

    describe('when the token addresses contains an address for a contract that is not ERC20', async () => {
      let nonERC20ContractAddress: Address;

      beforeEach(async () => {
        nonERC20ContractAddress = coreWrapper.vaultAddress;

        subjectTokenAddressesToDeposit = [nonERC20ContractAddress];
        subjectQuantitiesToDeposit = [depositQuantity];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Contract at ${nonERC20ContractAddress} does not implement ERC20 interface.`
        );
      });
    });

    describe('when the caller does not have enough balance of token', async () => {
      beforeEach(async () => {
        subjectCaller = ACCOUNTS[1].address;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('User does not have enough balance.');
      });
    });

    describe('when the caller has not granted enough allowance to the transfer proxy', async () => {
      beforeEach(async () => {
        const tokenAddress = tokenAddresses[0];
        const tokenWrapper = await StandardTokenMockContract.at(tokenAddress, web3, TX_DEFAULTS);
        await tokenWrapper.approve.sendTransactionAsync(
          coreWrapper.transferProxyAddress,
          depositQuantity.sub(1),
          TX_DEFAULTS,
        );
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('User not approved for enough allowance.');
      });
    });
  });

  describe('withdrawAsync', async () => {
    let subjectTokenAddressesToWithdraw: Address[];
    let subjectQuantitiesToWithdraw: BigNumber[];
    let subjectCaller: Address;
    let withdrawQuantity: BigNumber;

    beforeEach(async () => {
      withdrawQuantity = new BigNumber(100);

      const quantitiesToDeposit = tokenAddresses.map(() => withdrawQuantity);
      await accountingAPI.depositAsync(
        tokenAddresses,
        quantitiesToDeposit,
        { from: DEFAULT_ACCOUNT },
      );

      subjectTokenAddressesToWithdraw = tokenAddresses;
      subjectQuantitiesToWithdraw = quantitiesToDeposit;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await accountingAPI.withdrawAsync(
        subjectTokenAddressesToWithdraw,
        subjectQuantitiesToWithdraw,
        { from: subjectCaller },
      );
    }

    test('correctly updates the vault balances', async () => {
      const existingVaultOwnerBalances = await getVaultBalances(vault, tokenAddresses, subjectCaller);

      await subject();

      const expectedVaultOwnerBalances = _.map(existingVaultOwnerBalances, balance => balance.sub(withdrawQuantity));
      const newOwnerVaultBalances = await getVaultBalances(vault, tokenAddresses, subjectCaller);
      expect(newOwnerVaultBalances).to.eql(expectedVaultOwnerBalances);
    });

    describe('when a single address and quantity is passed in', async () => {
      let tokenAddress: Address;

      beforeEach(async () => {
        tokenAddress = tokenAddresses[0];

        subjectTokenAddressesToWithdraw = [tokenAddress];
        subjectQuantitiesToWithdraw = subjectTokenAddressesToWithdraw.map(() => withdrawQuantity);
      });

      test('correctly updates the vault balance', async () => {
        const existingOwnerVaultBalance = await vault.getOwnerBalance.callAsync(tokenAddress, DEFAULT_ACCOUNT);

        await subject();

        const expectedVaultOwnerBalance = existingOwnerVaultBalance.sub(withdrawQuantity);
        const newVaultOwnerBalance = await vault.getOwnerBalance.callAsync(tokenAddress, DEFAULT_ACCOUNT);
        expect(newVaultOwnerBalance).to.eql(expectedVaultOwnerBalance);
      });
    });

    describe('when the transaction caller address is invalid', async () => {
      beforeEach(async () => {
        subjectCaller = 'invalidAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected txOpts.from to conform to schema /Address.

        Encountered: "invalidAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the token addresses and quantities are not the same length', async () => {
      beforeEach(async () => {
        subjectTokenAddressesToWithdraw = [_.first(tokenAddresses)];
        subjectQuantitiesToWithdraw = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          'The tokenAddresses and quantities arrays need to be equal lengths.'
        );
      });
    });

    describe('when the quantities containes a negative number', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = new BigNumber(-1);

        subjectTokenAddressesToWithdraw = [_.first(tokenAddresses)];
        subjectQuantitiesToWithdraw = [invalidQuantity];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidQuantity} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the token addresses contains an empty address', async () => {
      beforeEach(async () => {
        subjectTokenAddressesToWithdraw = [undefined];
        subjectQuantitiesToWithdraw = [withdrawQuantity];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('The string tokenAddress cannot be empty.');
      });
    });

    describe('when the token addresses contains an address for a contract that is not ERC20', async () => {
      let nonERC20ContractAddress: Address;

      beforeEach(async () => {
        nonERC20ContractAddress = coreWrapper.vaultAddress;

        subjectTokenAddressesToWithdraw = [nonERC20ContractAddress];
        subjectQuantitiesToWithdraw = [withdrawQuantity];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Contract at ${nonERC20ContractAddress} does not implement ERC20 interface.`
        );
      });
    });

    describe('when the caller does not have enough balance to withdraw', async () => {
      beforeEach(async () => {
        const tokenToWithdrawFromOriginallyDepositedAmount = tokenAddresses[0];
        const quantityToWithdrawFromOringallyDepositedAmount = new BigNumber(1);

        await accountingAPI.withdrawAsync(
          [tokenToWithdrawFromOriginallyDepositedAmount],
          [quantityToWithdrawFromOringallyDepositedAmount],
          { from: subjectCaller },
        );
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('User does not have enough balance of the token in vault.');
      });
    });
  });
});
