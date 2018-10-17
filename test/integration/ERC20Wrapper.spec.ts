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
import Web3 from 'web3';
import { StandardTokenMock } from 'set-protocol-contracts';
import { StandardTokenMockContract } from 'set-protocol-contracts';
import { Address, Web3Utils } from 'set-protocol-utils';

import { ERC20Wrapper } from '@src/wrappers';
import { DEFAULT_ACCOUNT, DEPLOYED_TOKEN_QUANTITY, TX_DEFAULTS } from '@src/constants';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber } from '@src/util';
import { ether } from '@src/util/units';
import { addAuthorizationAsync, deployTokenAsync } from '@test/helpers';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('ERC20Wrapper', () => {
  let erc20Wrapper: ERC20Wrapper;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    erc20Wrapper = new ERC20Wrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('name, symbol, totalSupply, decimals', async () => {
    let tokenSupply: BigNumber;
    let tokenName: string;
    let tokenSymbol: string;
    let tokenDecimals: BigNumber;

    let subjectTokenAddress: Address;

    beforeEach(async () => {
      const truffleStandardTokenMockContract = contract(StandardTokenMock);
      truffleStandardTokenMockContract.setProvider(web3.currentProvider);
      truffleStandardTokenMockContract.defaults(TX_DEFAULTS);

      tokenSupply = new BigNumber(100);
      tokenName = 'My Token';
      tokenSymbol = 'MYTOKEN';
      tokenDecimals = new BigNumber(18);
      const deployedToken = await truffleStandardTokenMockContract.new(
        DEFAULT_ACCOUNT,
        tokenSupply,
        tokenName,
        tokenSymbol,
        tokenDecimals,
      );

      subjectTokenAddress = deployedToken.address;
    });

    async function subject(): Promise<any> {
      const name = await erc20Wrapper.name(subjectTokenAddress);
      const symbol = await erc20Wrapper.symbol(subjectTokenAddress);
      const supply = await erc20Wrapper.totalSupply(subjectTokenAddress);
      const decimals = await erc20Wrapper.decimals(subjectTokenAddress);

      return { name, symbol, supply, decimals };
    }

    test('fetches the erc20 token properties correctly', async () => {
      const { name, symbol, supply, decimals } = await subject();

      expect(name).to.eql(tokenName);
      expect(symbol).to.eql(tokenSymbol);
      expect(supply).to.bignumber.equal(tokenSupply);
      expect(decimals).to.bignumber.equal(tokenDecimals);
    });
  });

  describe('balanceOf', async () => {
    let token: StandardTokenMockContract;

    let subjectTokenAddress: Address;
    let subjectTokenOwner: Address;

    beforeEach(async () => {
      token = await deployTokenAsync(web3);

      subjectTokenAddress = token.address;
      subjectTokenOwner = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<BigNumber> {
      return await erc20Wrapper.balanceOf(
        subjectTokenAddress,
        subjectTokenOwner,
      );
    }

    test('fetches the balance correctly', async () => {
      const userTokenBalance = await subject();

      expect(userTokenBalance).to.bignumber.equal(DEPLOYED_TOKEN_QUANTITY);
    });
  });

  describe('allowance', async () => {
    let token: StandardTokenMockContract;
    let approveAllowance: BigNumber;

    let subjectTokenOwner: Address;
    let subjectTokenAddress: Address;
    let subjectSpenderAddress: Address;

    beforeEach(async () => {
      approveAllowance = new BigNumber(1000);
      token = await deployTokenAsync(web3);

      subjectTokenOwner = DEFAULT_ACCOUNT;
      subjectTokenAddress = token.address;
      subjectSpenderAddress = ACCOUNTS[1].address;

      await erc20Wrapper.approve(
        subjectTokenAddress,
        subjectSpenderAddress,
        approveAllowance,
        { from: DEFAULT_ACCOUNT }
      );
    });

    async function subject(): Promise<BigNumber> {
      return await erc20Wrapper.allowance(
        subjectTokenAddress,
        subjectTokenOwner,
        subjectSpenderAddress,
      );
    }

    test('fetches the spender balance correctly', async () => {
      const spenderAllowance = await subject();

      expect(spenderAllowance).to.bignumber.equal(approveAllowance);
    });
  });

  describe('approve', async () => {
    let token: StandardTokenMockContract;

    let subjectTokenAddress: Address;
    let subjectSpenderAddress: Address;
    let subjectApproveAllowance: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      token = await deployTokenAsync(web3);

      subjectTokenAddress = token.address;
      subjectSpenderAddress = ACCOUNTS[1].address;
      subjectApproveAllowance = new BigNumber(100);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await erc20Wrapper.approve(
        subjectTokenAddress,
        subjectSpenderAddress,
        subjectApproveAllowance,
        { from: subjectCaller }
      );
    }

    test('updates the allowance correctly for the spender', async () => {
      await subject();

      const newSpenderAllowance = await token.allowance.callAsync(subjectCaller, subjectSpenderAddress);
      expect(newSpenderAllowance).to.bignumber.equal(subjectApproveAllowance);
    });
  });

  describe('transferFrom', async () => {
    let token: StandardTokenMockContract;
    let approveAllowance: BigNumber;

    let subjectTokenOwner: Address;
    let subjectTokenAddress: Address;
    let subjectSpenderAddress: Address;
    let subjectTransferAmount: BigNumber;

    beforeEach(async () => {
      approveAllowance = new BigNumber(1000);
      token = await deployTokenAsync(web3);

      subjectTokenOwner = DEFAULT_ACCOUNT;
      subjectTokenAddress = token.address;
      subjectSpenderAddress = ACCOUNTS[1].address;
      subjectTransferAmount = approveAllowance;

      await erc20Wrapper.approve(
        subjectTokenAddress,
        subjectSpenderAddress,
        approveAllowance,
        { from: DEFAULT_ACCOUNT }
      );
    });

    async function subject(): Promise<string> {
      return await erc20Wrapper.transferFrom(
        subjectTokenAddress,
        subjectTokenOwner,
        subjectSpenderAddress,
        subjectTransferAmount,
        { from: subjectSpenderAddress }
      );
    }

    test('transfers the token from the owner', async () => {
      const existingTokenBalance = await token.balanceOf.callAsync(subjectTokenOwner);

      await subject();

      const expectedTokenBalance = existingTokenBalance.sub(subjectTransferAmount);
      const newTokenBalance = await token.balanceOf.callAsync(subjectTokenOwner);
      expect(newTokenBalance).to.bignumber.equal(expectedTokenBalance);
    });
  });

  describe('transfer', async () => {
    let token: StandardTokenMockContract;

    let subjectTokenOwner: Address;
    let subjectTokenReceiver: Address;
    let subjectTokenAddress: Address;
    let subjectTransferAmount: BigNumber;

    beforeEach(async () => {
      token = await deployTokenAsync(web3);

      subjectTokenOwner = DEFAULT_ACCOUNT;
      subjectTokenReceiver = ACCOUNTS[1].address;
      subjectTokenAddress = token.address;
      subjectTransferAmount = new BigNumber(1000);
    });

    async function subject(): Promise<string> {
      return await erc20Wrapper.transfer(
        subjectTokenAddress,
        subjectTokenReceiver,
        subjectTransferAmount,
        { from: subjectTokenOwner }
      );
    }

    test('transfers the token to the receiver', async () => {
      const existingTokenBalance = await token.balanceOf.callAsync(subjectTokenReceiver);

      await subject();

      const expectedTokenBalance = existingTokenBalance.add(subjectTransferAmount);
      const newTokenBalance = await token.balanceOf.callAsync(subjectTokenReceiver);
      expect(newTokenBalance).to.bignumber.equal(expectedTokenBalance);
    });
  });
});
