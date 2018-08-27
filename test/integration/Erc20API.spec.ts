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

import { Address } from 'set-protocol-utils';
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import * as _ from 'lodash';
import * as Web3 from 'web3';
import compact = require('lodash.compact');

import { BigNumber } from '../../src/util';
import ChaiSetup from '../helpers/chaiSetup';
import {
  StandardTokenMock,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '../accounts';
import { Erc20API } from '../../src/api';
import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  STANDARD_DECIMALS,
  STANDARD_SUPPLY,
  STANDARD_TRANSFER_VALUE,
  ZERO,
} from '../../src/constants';
import { Web3Utils } from '../../src/util';
import {
  initializeCoreAPI,
} from '../helpers/coreHelpers';

const OTHER_ACCOUNT = ACCOUNTS[1].address;

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

const standardTokenMockContract = contract(StandardTokenMock);
standardTokenMockContract.setProvider(provider);
standardTokenMockContract.defaults(txDefaults);

let currentSnapshotId: number;

describe('ERC20 API', () => {
  let erc20API: Erc20API;
  let standardTokenMock: StandardTokenMock;
  const subjectSupply: BigNumber = STANDARD_SUPPLY;
  const subjectName: string = 'ERC20 Token';
  const subjectSymbol: string = 'ERC';
  const subjectDecimals: BigNumber = STANDARD_DECIMALS;
  let subjectSpender: Address;
  let subjectAllowance: BigNumber;


  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  test('Erc20API can be instantiated', async () => {
    erc20API = new Erc20API(web3);
    expect(erc20API);

    expect(erc20API.getBalanceOfAsync);
    expect(erc20API.getNameAsync);
    expect(erc20API.getSymbolAsync);
    expect(erc20API.getAllowanceAsync);
    expect(erc20API.transferAsync);
    expect(erc20API.transferFromAsync);
    expect(erc20API.approveAsync);
  });

  describe('getters', async () => {
    beforeEach(async () => {
      erc20API = new Erc20API(web3);

      subjectSpender = OTHER_ACCOUNT;
      subjectAllowance = ZERO;

      standardTokenMock = await standardTokenMockContract.new(
        DEFAULT_ACCOUNT,
        subjectSupply,
        subjectName,
        subjectSymbol,
        subjectDecimals,
      );
    });

    test('gets ERC20 token symbol', async () => {
      const symbol = await erc20API.getSymbolAsync(standardTokenMock.address);
      expect(symbol).to.equal(subjectSymbol);
    });

    test('gets ERC20 token name', async () => {
      const name = await erc20API.getNameAsync(standardTokenMock.address);
      expect(name).to.equal(subjectName);
    });

    test('gets ERC20 decimals', async () => {
      const decimals = await erc20API.getDecimalsAsync(standardTokenMock.address);
      expect(decimals).to.bignumber.equal(subjectDecimals);
    });

    test('get total supply of ERC20 tokens', async () => {
      const totalSupply = await erc20API.getTotalSupplyAsync(standardTokenMock.address);
      expect(totalSupply).to.bignumber.equal(subjectSupply);
    });

    test("get balance of user's ERC20 tokens", async () => {
      const balance = await erc20API.getBalanceOfAsync(standardTokenMock.address, DEFAULT_ACCOUNT);
      expect(balance).to.bignumber.equal(subjectSupply);
    });

    test('get allowance of the spender by the default account', async () => {
      const allowance = await erc20API.getAllowanceAsync(
        standardTokenMock.address,
        DEFAULT_ACCOUNT,
        subjectSpender,
      );
      expect(allowance).to.bignumber.equal(subjectAllowance);
    });
  });

  describe('#transferAsync', async () => {
    let subjectTo: Address;
    let subjectValue: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      erc20API = new Erc20API(web3);

      standardTokenMock = await standardTokenMockContract.new(
        DEFAULT_ACCOUNT,
        subjectSupply,
        subjectName,
        subjectSymbol,
        subjectDecimals,
      );

      subjectCaller = DEFAULT_ACCOUNT;
      subjectValue = STANDARD_TRANSFER_VALUE;
      subjectTo = OTHER_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await erc20API.transferAsync(
        standardTokenMock.address,
        subjectTo,
        subjectValue,
        { from: subjectCaller },
      );
    }

    test('should decrement the users balance', async () => {
      const preUserBalance = await standardTokenMock.balanceOf(subjectCaller);

      await subject();

      const expectedBalance = preUserBalance.minus(subjectValue);

      const postUserBalance = await standardTokenMock.balanceOf(subjectCaller);
      expect(postUserBalance).to.bignumber.equal(expectedBalance);

    });

    test("should increment the recipient's balance", async () => {
      const preRecipientBalance = await standardTokenMock.balanceOf(subjectTo);

      await subject();

      const expectedBalance = preRecipientBalance.plus(subjectValue);

      const postRecipientBalance = await standardTokenMock.balanceOf(subjectTo);
      expect(postRecipientBalance).to.bignumber.equal(expectedBalance);
    });
  });

  describe('#transferFromAsync', async () => {

  });

  describe('#approveAsync', async () => {

  });

});
