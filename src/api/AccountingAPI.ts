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

import * as _ from 'lodash';
import * as Web3 from 'web3';
import { Address } from 'set-protocol-utils';

import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { CoreWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { TxData } from '../types/common';

/**
 * @title AccountingAPI
 * @author Set Protocol
 *
 * A library for managing ERC20 token and Set balances for users throughout the SetProtocol system
 */
export class AccountingAPI {
  private web3: Web3;
  private assert: Assertions;
  private core: CoreWrapper;

  /**
   * Instantiates a new AccountingAPI instance that contains methods for transferring balances in the vault
   *
   * @param web3    Web3.js Provider instance you would like the SetProtocol.js library
   *                  to use for interacting with the Ethereum network
   * @param core    Address of the Set Core contract
   */
  constructor(web3: Web3 = undefined, core: CoreWrapper = undefined) {
    this.web3 = web3;
    this.core = core;
    this.assert = new Assertions(this.web3);
  }

  /**
   * Deposits tokens into the vault under the signer's address that can be used to issue a Set. Uses a different
   * transaction method depending on number of tokens to deposit in order to save gas
   *
   * @param  tokenAddresses    Addresses of ERC20 tokens to deposit into the vault
   * @param  quantities        Amount of each token to deposit into the vault in index order with `tokenAddresses`
   * @param  txOpts            Transaction options object conforming to TxDataFrom with signer, gas, and gasPrice data
   * @return                   Transaction hash
   */
  public async depositAsync(
    tokenAddresses: Address[],
    quantities: BigNumber[],
    txOpts: TxData
  ): Promise<string> {
    await this.assertDeposit(txOpts.from, tokenAddresses, quantities);

    if (tokenAddresses.length === 1) {
      return await this.core.deposit(tokenAddresses[0], quantities[0], txOpts);
    } else {
      return await this.core.batchDeposit(tokenAddresses, quantities, txOpts);
    }
  }

  /**
   * Withdraws tokens from the vault belonging to the signer. Uses a different transaction method depending on
   * number of tokens to withdraw in order to save gas
   *
   * @param  tokenAddresses    Addresses of ERC20 tokens to withdraw from the vault
   * @param  quantities        Amount of each token token to withdraw from vault in index order with `tokenAddresses`
   * @param  txOpts            Transaction options object conforming to TxData with signer, gas, and gasPrice data
   * @return                   Transaction hash
   */
  public async withdrawAsync(
    tokenAddresses: Address[],
    quantities: BigNumber[],
    txOpts: TxData
  ): Promise<string> {
    await this.assertWithdraw(txOpts.from, tokenAddresses, quantities);

    if (tokenAddresses.length === 1) {
      return await this.core.withdraw(tokenAddresses[0], quantities[0], txOpts);
    } else {
      return await this.core.batchWithdraw(tokenAddresses, quantities, txOpts);
    }
  }

  /* ============ Private Assertions ============ */

  private async assertDeposit(transactionCaller: Address, tokenAddresses: Address[], quantities: BigNumber[]) {
    // Schema validations
    this.assert.schema.isValidAddress('txOpts.from', transactionCaller);
    this.assert.common.isEqualLength(
      tokenAddresses,
      quantities,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('tokenAddresses', 'quantities'),
    );

    // Quantity assertions
    quantities.map(quantity => {
      this.assert.common.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
    });

    // Token assertions
    await Promise.all(
      tokenAddresses.map(async (tokenAddress, i) => {
        this.assert.common.isValidString(tokenAddress, coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'));
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

        await this.assert.erc20.implementsERC20(tokenAddress);

        // Check balance
        await this.assert.erc20.hasSufficientBalance(
          tokenAddress,
          transactionCaller,
          quantities[i],
          erc20AssertionErrors.INSUFFICIENT_BALANCE(),
        );

        // Check allowance
        await this.assert.erc20.hasSufficientAllowance(
          tokenAddress,
          transactionCaller,
          this.core.transferProxyAddress,
          quantities[i],
          erc20AssertionErrors.INSUFFICIENT_ALLOWANCE(),
        );
      }),
    );
  }

  private async assertWithdraw(transactionCaller: Address, tokenAddresses: Address[], quantities: BigNumber[]) {
    this.assert.schema.isValidAddress('txOpts.from', transactionCaller);
    this.assert.common.isEqualLength(
      tokenAddresses,
      quantities,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('tokenAddresses', 'quantities'),
    );

    // Quantity assertions
    _.each(quantities, quantity => {
      this.assert.common.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
    });

    // Token assertions
    await Promise.all(
      tokenAddresses.map(async (tokenAddress, i) => {
        this.assert.common.isValidString(tokenAddress, coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'));
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

        await this.assert.erc20.implementsERC20(tokenAddress);

        // Check balance
        await this.assert.vault.hasSufficientTokenBalance(
          this.core.vaultAddress,
          tokenAddress,
          transactionCaller,
          quantities[i],
          vaultAssertionErrors.INSUFFICIENT_TOKEN_BALANCE(),
        );
      }),
    );
  }
}
