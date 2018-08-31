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
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';

import ChaiSetup from '../../helpers/chaiSetup';
import { IssuanceAPI } from '../../../src/api';
import { BigNumber } from '../../../src/util';
import { CoreWrapper } from '../../../src/wrappers';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '../../../src/constants/accounts';
import {
  DEPLOYED_TOKEN_QUANTITY,
  TX_DEFAULTS,
  ZERO
} from '../../../src/constants';
import {
  addAuthorizationAsync,
  approveForTransferAsync,
  deployCoreContract,
  deploySetTokenAsync,
  deployTokensAsync,
  deploySetTokenFactoryContract,
  deployTokensForSetWithApproval,
  deployTransferProxyContract,
  deployVaultContract,
  getTokenBalances,
} from '../../helpers/coreHelpers';
import { ether } from '../../../src/util/units';
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


describe('IssuanceAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let coreWrapper: CoreWrapper;
  let issuanceAPI: IssuanceAPI;

  let componentTokens: StandardTokenMockContract[];
  let setComponentUnit: BigNumber;
  let setToken: SetTokenContract;
  let naturalUnit: BigNumber;

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

    coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);
    issuanceAPI = new IssuanceAPI(web3, coreWrapper);

    componentTokens = await deployTokensAsync(3, provider);
    setComponentUnit = ether(4);
    naturalUnit = ether(2);
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

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('issueAsync', async () => {
    let subjectSetToIssue: Address;
    let subjectQuantitytoIssue: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      subjectSetToIssue = setToken.address;
      subjectQuantitytoIssue = ether(2);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await issuanceAPI.issueAsync(
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

    describe('when the transaction caller address is invalid', async () => {
      beforeEach(async () => {
        subjectCaller = 'invalidCallerAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected userAddress to conform to schema /Address.

        Encountered: "invalidCallerAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the set address is invalid', async () => {
      beforeEach(async () => {
        subjectSetToIssue = 'invalidSetAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected setAddress to conform to schema /Address.

        Encountered: "invalidSetAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the quantities containes a negative number', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = new BigNumber(-1);

        subjectQuantitytoIssue = invalidQuantity;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidQuantity} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the quantity is not a multiple of the natural unit', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = ether(3);

        subjectQuantitytoIssue = invalidQuantity;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('Quantity needs to be multiple of natural unit.');
      });
    });

    describe('when the caller does not have enough of a component', async () => {
      let componentWithInsufficientBalance: StandardTokenMockContract;

      beforeEach(async () => {
        componentWithInsufficientBalance = _.first(componentTokens);
        const naturalUnit = ether(2);
        const componentUnit = ether(4);

        subjectQuantitytoIssue = DEPLOYED_TOKEN_QUANTITY.div(naturalUnit).mul(componentUnit).add(naturalUnit);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `User does not have enough balance of token at address ${componentWithInsufficientBalance.address}`
        );
      });
    });

    describe('when the caller does not have the right amount of allowance to the transfer proxy', async () => {
      let componentWithInsufficientAllowance: StandardTokenMockContract;

      beforeEach(async () => {
        componentWithInsufficientAllowance = _.first(componentTokens);

        await componentWithInsufficientAllowance.approve.sendTransactionAsync(
          transferProxy.address,
          ZERO,
          TX_DEFAULTS,
        );
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `User does not have enough allowance of token at address ${componentWithInsufficientAllowance.address}`
        );
      });
    });
  });

  describe('redeemAsync', async () => {
    let subjectSetToRedeem: Address;
    let subjectQuantityToRedeem: BigNumber;
    let subjectShouldWithdraw: boolean;
    let subjectTokensToExclude: Address[];
    let subjectCaller: Address;

    beforeEach(async () => {
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
      return await issuanceAPI.redeemAsync(
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

    describe('when withdrawing after redeeming', async () => {
      let componentToExclude: StandardTokenMockContract;
      let componentToWithdraw: StandardTokenMockContract;

      beforeEach(async () => {
        componentToExclude = _.first(componentTokens);
        componentToWithdraw = componentTokens[1];

        subjectShouldWithdraw = true;
        subjectTokensToExclude = [componentToExclude.address];
      });

      test('incrementes the vault balance of the excluded token ', async () => {
        const existingVaultBalance = await vault.getOwnerBalance.callAsync(componentToExclude.address, subjectCaller);

        await subject();

        const requiredQuantityToRedeem = subjectQuantityToRedeem.div(naturalUnit).mul(setComponentUnit);
        const expectedVaultBalance = existingVaultBalance.add(requiredQuantityToRedeem);
        const newVaultBalances = await vault.getOwnerBalance.callAsync(componentToExclude.address, subjectCaller);
        expect(newVaultBalances).to.eql(expectedVaultBalance);
      });

      test('withdraws the remaining components ', async () => {
        const remainingComponentAddresses = _.tail(componentTokens);
        const existingBalances = await getTokenBalances(remainingComponentAddresses, subjectCaller);

        await subject();

        const expectedVaultBalances = _.map(remainingComponentAddresses, (component, idx) => {
          const requiredQuantityToRedeem = subjectQuantityToRedeem.div(naturalUnit).mul(setComponentUnit);
          return existingBalances[idx].add(requiredQuantityToRedeem);
        });
        const newVaultBalances = await getTokenBalances(remainingComponentAddresses, subjectCaller);
        expect(newVaultBalances).to.eql(expectedVaultBalances);
      });
    });

    describe('when the transaction caller address is invalid', async () => {
      beforeEach(async () => {
        subjectCaller = 'invalidCallerAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected userAddress to conform to schema /Address.

        Encountered: "invalidCallerAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the set address is invalid', async () => {
      beforeEach(async () => {
        subjectSetToRedeem = 'invalidSetAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected setAddress to conform to schema /Address.

        Encountered: "invalidSetAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the quantities containes a negative number', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = new BigNumber(-1);

        subjectQuantityToRedeem = invalidQuantity;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidQuantity} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when a token address in toExclude is invalid', async () => {
      beforeEach(async () => {
        subjectTokensToExclude = ['invalidAddress'];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected tokenAddress to conform to schema /Address.

        Encountered: "invalidAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the quantity is not a multiple of the natural unit', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = ether(3);

        subjectQuantityToRedeem = invalidQuantity;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('Quantity needs to be multiple of natural unit.');
      });
    });

    describe('when the quantity to redeem is larger than the user balance', async () => {
      beforeEach(async () => {
        subjectQuantityToRedeem = ether(4);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('User does not have enough balance.');
      });
    });
  });
});
