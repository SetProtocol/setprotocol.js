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
import { SetTokenContract, VaultContract } from 'set-protocol-contracts';

import { ZERO } from '../constants';
import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { CoreWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { TxData, TxDataWithFrom } from '../types/common';

/**
 * @title IssuanceAPI
 * @author Set Protocol
 *
 * A library for issuing and redeeming Sets
 */
export class IssuanceAPI {
  private web3: Web3;
  private assert: Assertions;
  private core: CoreWrapper;

  /**
   * Instantiates a new IssuanceAPI instance that contains methods for transferring balances in the vault.
   *
   * @param web3                  The Web3.js Provider instance you would like the SetProtocol.js library
   *                              to use for interacting with the Ethereum network.
   * @param core                  The address of the Set Core contract
   */
  constructor(web3: Web3 = undefined, core: CoreWrapper = undefined) {
    this.web3 = web3;
    this.core = core;
    this.assert = new Assertions(this.web3);
  }

  /**
   * Asynchronously issues a particular quantity of tokens from a particular Sets
   *
   * @param  setAddress     Set token address of Set being issued
   * @param  quantity       Number of Sets a user wants to issue in Wei
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up
   */
  public async issueAsync(setAddress: Address, quantity: BigNumber, txOpts: TxDataWithFrom): Promise<string> {
    await this.assertIssue(txOpts.from, setAddress, quantity);

    return await this.core.issue(setAddress, quantity, txOpts);
  }

  /**
   * Composite method to redeem and optionally withdraw tokens
   *
   * @param  setAddress        The address of the Set token
   * @param  quantity          The number of tokens to redeem
   * @param  withdraw          Boolean determining whether or not to withdraw
   * @param  tokensToExclude   Array of token addresses to exclude from withdrawal
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash to then later look up
   */
  public async redeemAsync(
    setAddress: Address,
    quantity: BigNumber,
    withdraw: boolean,
    tokensToExclude: Address[],
    txOpts: TxDataWithFrom
  ) {
    await this.assertRedeem(txOpts.from, setAddress, quantity, withdraw, tokensToExclude);

   if (withdraw) {
      const setTokenContract = await SetTokenContract.at(setAddress, this.web3, {});
      const componentAddresses = await setTokenContract.getComponents.callAsync();

      let toExclude: BigNumber = ZERO;
      _.each(componentAddresses, (component, idx) => {
        if (_.includes(tokensToExclude, component)) {
          toExclude = toExclude.plus(new BigNumber(2).pow(idx));
        }
      });

      return await this.core.redeemAndWithdraw(setAddress, quantity, toExclude, txOpts);
    } else {
      return await this.core.redeem(setAddress, quantity, txOpts);
    }
  }

  /* ============ Private Assertions ============ */

  private async assertIssue(transactionCaller: Address, setAddress: Address, quantity: BigNumber) {
    this.assert.schema.isValidAddress('txOpts.from', transactionCaller);
    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.common.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));

    const setTokenContract = await SetTokenContract.at(setAddress, this.web3, {});
    await this.assert.setToken.isMultipleOfNaturalUnit(
      setTokenContract,
      quantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_MULTIPLE_OF_NATURAL_UNIT(),
    );

    await this.assert.setToken.hasSufficientBalances(setTokenContract, transactionCaller, quantity);
    await this.assert.setToken.hasSufficientAllowances(
      setTokenContract,
      transactionCaller,
      this.core.transferProxyAddress,
      quantity,
    );
  }

  private async assertRedeem(
    transactionCaller: Address,
    setAddress: Address,
    quantity: BigNumber,
    withdraw: boolean,
    tokensToExclude: Address[],
  ) {
    this.assert.schema.isValidAddress('txOpts.from', transactionCaller);
    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.common.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));

    _.each(tokensToExclude, tokenAddress => {
      this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    });

    const setTokenContract = await SetTokenContract.at(setAddress, this.web3, {});
    await this.assert.setToken.isMultipleOfNaturalUnit(
      setTokenContract,
      quantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_MULTIPLE_OF_NATURAL_UNIT(),
    );
    await this.assert.erc20.hasSufficientBalance(
      setTokenContract,
      transactionCaller,
      quantity,
      erc20AssertionErrors.INSUFFICIENT_BALANCE(),
    );

    const vaultContract = await VaultContract.at(this.core.vaultAddress, this.web3, {});
    await this.assert.vault.hasSufficientSetTokensBalances(
      vaultContract,
      setTokenContract,
      quantity,
      vaultAssertionErrors.INSUFFICIENT_SET_TOKENS_BALANCE(),
    );
  }
}
