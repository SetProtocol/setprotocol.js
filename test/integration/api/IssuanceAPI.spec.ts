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
import { Address, Web3Utils } from 'set-protocol-utils';
import {
  CoreContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';

import ChaiSetup from '@test/helpers/chaiSetup';
import { IssuanceAPI } from '@src/api';
import { BigNumber } from '@src/util';
import { CoreWrapper } from '@src/wrappers';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { DEPLOYED_TOKEN_QUANTITY, TX_DEFAULTS, ZERO } from '@src/constants';
import {
  approveForTransferAsync,
  deployBaseContracts,
  deploySetTokenAsync,
  deployTokensAsync,
  getTokenBalances,
} from '@test/helpers/coreHelpers';
import { Assertions } from '@src/assertions';
import { ether } from '@src/util/units';
import { Component } from '@src/types/common';

const Core = require('set-protocol-contracts/dist/artifacts/ts/Core').Core;

ChaiSetup.configure();
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);
const { expect } = chai;

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('IssuanceAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;

  let issuanceAPI: IssuanceAPI;

  let componentTokens: StandardTokenMockContract[];
  let setComponentUnit: BigNumber;
  let componentUnits: BigNumber[];
  let setToken: SetTokenContract;
  let naturalUnit: BigNumber;

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
      ,
      ,
      ,
    ] = await deployBaseContracts(web3);

    coreWrapper = new CoreWrapper(
      web3,
      core.address,
      transferProxy.address,
      vault.address,
    );
    const assertions = new Assertions(web3);
    issuanceAPI = new IssuanceAPI(web3, coreWrapper, assertions);

    componentTokens = await deployTokensAsync(3, web3);
    setComponentUnit = ether(4);
    componentUnits = componentTokens.map(() => setComponentUnit);
    naturalUnit = ether(2);
    setToken = await deploySetTokenAsync(
      web3,
      core,
      setTokenFactory.address,
      componentTokens.map(token => token.address),
      componentUnits,
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
        Expected transactionCaller to conform to schema /Address.

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
        return expect(subject()).to.be.rejectedWith('Issuance quantity needs to be multiple of natural unit.');
      });
    });

    describe('when the caller does not have enough of a component', async () => {
      beforeEach(async () => {
        // Only the first component will have an insufficient balance
        componentUnits = _.map(componentTokens, (token, index) =>
          index === 0 ? new BigNumber(1) : setComponentUnit);
        const naturalUnit = ether(2);
        const componentUnit = ether(4);
        subjectQuantitytoIssue = DEPLOYED_TOKEN_QUANTITY.div(naturalUnit).mul(componentUnit).add(naturalUnit);
      });

      test('throws', async () => {
        // TODO - Can add rejection message after promise race conditions are fixed
        return expect(subject()).to.be.rejected;
      });
    });

    describe('when the caller does not have the right amount of allowance to the transfer proxy', async () => {
      let componentWithInsufficientAllowance: StandardTokenMockContract;
      let requiredAllowance: BigNumber;

      beforeEach(async () => {
        componentWithInsufficientAllowance = componentTokens[0];
        requiredAllowance = componentUnits[0];

        await componentWithInsufficientAllowance.approve.sendTransactionAsync(
          transferProxy.address,
          ZERO,
          TX_DEFAULTS,
        );
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        User: ${TX_DEFAULTS.from} has allowance of ${ZERO}

        when required allowance is ${requiredAllowance} at token

        address: ${componentWithInsufficientAllowance.address} for spender: ${transferProxy.address}.
      `
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

      beforeEach(async () => {
        componentToExclude = componentTokens[0];

        subjectShouldWithdraw = true;
        subjectTokensToExclude = [componentToExclude.address];
      });

      test('increments the vault balance of the excluded token ', async () => {
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
        Expected transactionCaller to conform to schema /Address.

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
        return expect(subject()).to.be.rejectedWith('Issuance quantity needs to be multiple of natural unit.');
      });
    });

    describe('when the quantity to redeem is larger than the user\'s Set Token balance', async () => {
      beforeEach(async () => {
        subjectQuantityToRedeem = ether(4);
      });

      test('throws', async () => {
        const currentBalance = await setToken.balanceOf.callAsync(subjectCaller);

        return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has balance of ${currentBalance}

        when required balance is ${subjectQuantityToRedeem} at token address ${subjectSetToRedeem}.
      `
        );
      });
    });
  });

describe('calculateRequiredComponentsAndUnitsAsync', async () => {
    let setComponents: StandardTokenMockContract[];
    let componentUnits: BigNumber[];
    let setToken: SetTokenContract;
    let naturalUnit: BigNumber;

    let subjectSetAddress: Address;
    let subjectMakerAddress: Address;
    let subjectQuantity: BigNumber;

    const makerAccount = ACCOUNTS[3].address;
    let componentRecipient = makerAccount;

    beforeEach(async () => {
      setComponents = await deployTokensAsync(2, web3, componentRecipient);

      // Deploy Set with those tokens
      const setComponentUnit = ether(4);
      const componentAddresses = setComponents.map(token => token.address);
      componentUnits = setComponents.map(token => setComponentUnit);
      naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      subjectSetAddress = setToken.address;
      subjectMakerAddress = makerAccount;
      subjectQuantity = naturalUnit;
    });

    async function subject(): Promise<Component[]> {
      return issuanceAPI.calculateRequiredComponentsAndUnitsAsync(
        subjectSetAddress,
        subjectMakerAddress,
        subjectQuantity,
      );
    }

    describe('when the maker has no token balances', async () => {
      beforeAll(async () => {
        componentRecipient = DEFAULT_ACCOUNT;
      });

      afterAll(async () => {
        componentRecipient = makerAccount;
      });

      test('should return the correct required components', async () => {
        const expectedComponents = setComponents.map(setComponent => setComponent.address);

        const requiredComponents = await subject();
        const componentAddresses = requiredComponents.map(requiredComponent => requiredComponent.address);

        expectedComponents.sort();
        componentAddresses.sort();

        expect(JSON.stringify(expectedComponents)).to.equal(JSON.stringify(componentAddresses));
      });

      test('should return the correct required units', async () => {
        const expectedUnits = componentUnits.map(componentUnit => componentUnit.mul(subjectQuantity).div(naturalUnit));

        const requiredComponents = await subject();
        const units = requiredComponents.map(requiredComponent => requiredComponent.unit);

        expectedUnits.sort();
        units.sort();
        expect(JSON.stringify(expectedUnits)).to.equal(JSON.stringify(units));
      });
    });

    describe('when a user has sufficient balance in the wallet', async () => {
      test('should return an empty array of required components', async () => {
        const expectedComponents: Address[] = [];

        const requiredComponents = await subject();
        const components = requiredComponents.map(requiredComponent => requiredComponent.address);

        expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
      });

      test('should return an empty array of required units', async () => {
        const expectedUnits: BigNumber[] = [];

        const requiredComponents = await subject();
        const units = requiredComponents.map(requiredComponent => requiredComponent.unit);

        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedUnits));
      });
    });

    describe('when a user has sufficient balance in the vault', async () => {
      beforeEach(async () => {
        // Approve and deposit tokens to the vault
        for (let i = 0; i < setComponents.length; i++) {
          const currentComponent = setComponents[i];
          const makerComponentBalance = await currentComponent.balanceOf.callAsync(makerAccount);
          await currentComponent.approve.sendTransactionAsync(
            transferProxy.address,
            makerComponentBalance,
            { from: makerAccount }
          );

          await coreWrapper.deposit(currentComponent.address, makerComponentBalance, { from: makerAccount });
        }
      });

      test('should return an empty array of required components', async () => {
        const expectedComponents: Address[] = [];

        const requiredComponents = await subject();
        const components = requiredComponents.map(requiredComponent => requiredComponent.address);

        expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
      });

      test('should return an empty array of required units', async () => {
        const expectedUnits: BigNumber[] = [];

        const requiredComponents = await subject();

        const units = requiredComponents.map(requiredComponent => requiredComponent.unit);
        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedUnits));
      });
    });

    describe('when a user has half of the required balance', async () => {
      let requiredBalances: BigNumber[];

      beforeEach(async () => {
        subjectMakerAddress = DEFAULT_ACCOUNT;

        requiredBalances = [];
        // Transfer half of each required amount to the maker
        for (let i = 0; i < setComponents.length; i++) {
          const currentComponent = setComponents[i];
          const currentUnit = componentUnits[i];
          const halfRequiredAmount = subjectQuantity.mul(currentUnit).div(naturalUnit).div(2);
          await currentComponent.transfer.sendTransactionAsync(
            subjectMakerAddress,
            halfRequiredAmount,
            { from: componentRecipient }
          );

          requiredBalances.push(halfRequiredAmount);
        }
      });

      test('should return the correct array of required components', async () => {
        const expectedComponents: Address[] = setComponents.map(setComponent => setComponent.address);

        const requiredComponents = await subject();
        const components = requiredComponents.map(requiredComponent => requiredComponent.address);

        expectedComponents.sort();
        components.sort();

        expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
      });

      test('should return the correct array of required units', async () => {
        const expectedUnits: BigNumber[] = requiredBalances;

        const requiredComponents = await subject();
        const units = requiredComponents.map(requiredComponent => requiredComponent.unit);

        expectedUnits.sort();
        units.sort();

        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedUnits));
      });
    });
  });
});
