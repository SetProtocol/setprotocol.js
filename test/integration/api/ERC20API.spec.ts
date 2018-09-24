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
import { StandardTokenMock } from 'set-protocol-contracts';
import { StandardTokenMockContract } from 'set-protocol-contracts';
import { Address } from 'set-protocol-utils';

import ChaiSetup from '@test/helpers/chaiSetup';
import { CoreWrapper } from '@src/wrappers';
import { Assertions } from '@src/assertions';
import { ERC20API } from '@src/api';
import { DEFAULT_ACCOUNT, DEPLOYED_TOKEN_QUANTITY, TX_DEFAULTS } from '@src/constants';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber, ether, Web3Utils } from '@src/util';
import {
  addAuthorizationAsync,
  deployTokenAsync,
  deployVaultContract,
  deployTransferProxyContract,
  deployCoreContract
} from '@test/helpers';

ChaiSetup.configure();
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const { expect } = chai;

let currentSnapshotId: number;


describe('ERC20API', () => {
  let erc20API: ERC20API;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    const transferProxy = await deployTransferProxyContract(provider);
    const vault = await deployVaultContract(provider);
    const core = await deployCoreContract(provider, transferProxy.address, vault.address);
    const coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);
    const assertions = new Assertions(web3, coreWrapper);

    erc20API = new ERC20API(web3, assertions);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('getNameAsync, getSymbolAsync, getTotalSupplyAsync, getDecimalsAsync', async () => {
    let tokenSupply: BigNumber;
    let tokenName: string;
    let tokenSymbol: string;
    let tokenDecimals: BigNumber;

    let subjectTokenAddress: Address;

    beforeEach(async () => {
      const truffleStandardTokenMockContract = contract(StandardTokenMock);
      truffleStandardTokenMockContract.setProvider(provider);
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
      const name = await erc20API.getNameAsync(subjectTokenAddress);
      const symbol = await erc20API.getSymbolAsync(subjectTokenAddress);
      const supply = await erc20API.getTotalSupplyAsync(subjectTokenAddress);
      const decimals = await erc20API.getDecimalsAsync(subjectTokenAddress);

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

  describe('getBalanceOfAsync', async () => {
    let token: StandardTokenMockContract;

    let subjectTokenAddress: Address;
    let subjectTokenOwner: Address;

    beforeEach(async () => {
      token = await deployTokenAsync(provider);

      subjectTokenAddress = token.address;
      subjectTokenOwner = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<BigNumber> {
      return await erc20API.getBalanceOfAsync(
        subjectTokenAddress,
        subjectTokenOwner,
      );
    }

    test('fetches the balance correctly', async () => {
      const userTokenBalance = await subject();

      expect(userTokenBalance).to.bignumber.equal(DEPLOYED_TOKEN_QUANTITY);
    });

    describe('when the token address is invalid', async () => {
      beforeEach(async () => {
        subjectTokenAddress = 'InvalidTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected tokenAddress to conform to schema /Address.

        Encountered: "InvalidTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the transaction caller address is invalid', async () => {
      beforeEach(async () => {
        subjectTokenOwner = 'InvalidTokenOwnerAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected userAddress to conform to schema /Address.

        Encountered: "InvalidTokenOwnerAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });
  });

  describe('getAllowanceAsync', async () => {
    let token: StandardTokenMockContract;
    let approveAllowance: BigNumber;

    let subjectTokenOwner: Address;
    let subjectTokenAddress: Address;
    let subjectSpenderAddress: Address;

    beforeEach(async () => {
      approveAllowance = new BigNumber(1000);
      token = await deployTokenAsync(provider);

      subjectTokenOwner = DEFAULT_ACCOUNT;
      subjectTokenAddress = token.address;
      subjectSpenderAddress = ACCOUNTS[1].address;

      await erc20API.approveAsync(
        subjectTokenAddress,
        subjectSpenderAddress,
        approveAllowance,
        { from: DEFAULT_ACCOUNT }
      );
    });

    async function subject(): Promise<BigNumber> {
      return await erc20API.getAllowanceAsync(
        subjectTokenAddress,
        subjectTokenOwner,
        subjectSpenderAddress,
      );
    }

    test('fetches the spender balance correctly', async () => {
      const spenderAllowance = await subject();

      expect(spenderAllowance).to.bignumber.equal(approveAllowance);
    });

    describe('when the token address is invalid', async () => {
      beforeEach(async () => {
        subjectTokenAddress = 'InvalidTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected tokenAddress to conform to schema /Address.

        Encountered: "InvalidTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the token owner address is invalid', async () => {
      beforeEach(async () => {
        subjectTokenOwner = 'InvalidTokenOwnerAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected ownerAddress to conform to schema /Address.

        Encountered: "InvalidTokenOwnerAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the spender address is invalid', async () => {
      beforeEach(async () => {
        subjectSpenderAddress = 'InvalidSpenderAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected spenderAddress to conform to schema /Address.

        Encountered: "InvalidSpenderAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });
  });

  describe('transferAsync', async () => {
    let token: StandardTokenMockContract;

    let subjectTokenOwner: Address;
    let subjectTokenReceiver: Address;
    let subjectTokenAddress: Address;
    let subjectTransferAmount: BigNumber;

    beforeEach(async () => {
      token = await deployTokenAsync(provider);

      subjectTokenOwner = DEFAULT_ACCOUNT;
      subjectTokenReceiver = ACCOUNTS[1].address;
      subjectTokenAddress = token.address;
      subjectTransferAmount = new BigNumber(1000);
    });

    async function subject(): Promise<string> {
      return await erc20API.transferAsync(
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

    describe('when the token address is invalid', async () => {
      beforeEach(async () => {
        subjectTokenAddress = 'InvalidTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected tokenAddress to conform to schema /Address.

        Encountered: "InvalidTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the to address is invalid', async () => {
      beforeEach(async () => {
        subjectTokenReceiver = 'InvalidToAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected to to conform to schema /Address.

        Encountered: "InvalidToAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });
  });

  describe('transferFromAsync', async () => {
    let token: StandardTokenMockContract;
    let approveAllowance: BigNumber;

    let subjectTokenOwner: Address;
    let subjectTokenAddress: Address;
    let subjectReceiverAddress: Address;
    let subjectSpenderAddress: Address;
    let subjectTransferAmount: BigNumber;

    beforeEach(async () => {
      approveAllowance = new BigNumber(1000);
      token = await deployTokenAsync(provider);

      subjectTokenOwner = DEFAULT_ACCOUNT;
      subjectTokenAddress = token.address;
      subjectSpenderAddress = ACCOUNTS[1].address;
      subjectReceiverAddress = ACCOUNTS[2].address;
      subjectTransferAmount = approveAllowance;

      await erc20API.approveAsync(
        subjectTokenAddress,
        subjectSpenderAddress,
        approveAllowance,
        { from: DEFAULT_ACCOUNT }
      );
    });

    async function subject(): Promise<string> {
      return await erc20API.transferFromAsync(
        subjectTokenAddress,
        subjectTokenOwner,
        subjectReceiverAddress,
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

    describe('when the token address is invalid', async () => {
      beforeEach(async () => {
        subjectTokenAddress = 'InvalidTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected tokenAddress to conform to schema /Address.

        Encountered: "InvalidTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the from address is invalid', async () => {
      beforeEach(async () => {
        subjectTokenOwner = 'InvalidFromAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected from to conform to schema /Address.

        Encountered: "InvalidFromAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the to address is invalid', async () => {
      beforeEach(async () => {
        subjectReceiverAddress = 'InvalidToAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected to to conform to schema /Address.

        Encountered: "InvalidToAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });
  });

  describe('approveAsync', async () => {
    let token: StandardTokenMockContract;

    let subjectTokenAddress: Address;
    let subjectSpenderAddress: Address;
    let subjectApproveAllowance: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      token = await deployTokenAsync(provider);

      subjectTokenAddress = token.address;
      subjectSpenderAddress = ACCOUNTS[1].address;
      subjectApproveAllowance = new BigNumber(100);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await erc20API.approveAsync(
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

    describe('when the token address is invalid', async () => {
      beforeEach(async () => {
        subjectTokenAddress = 'InvalidTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected tokenAddress to conform to schema /Address.

        Encountered: "InvalidTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the spender address is invalid', async () => {
      beforeEach(async () => {
        subjectSpenderAddress = 'InvalidSpenderAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected spenderAddress to conform to schema /Address.

        Encountered: "InvalidSpenderAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });
  });
});
