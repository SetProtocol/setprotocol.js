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
import { TxData } from '../types/common';

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
   * Instantiates a new IssuanceAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3    The Web3.js Provider instance you would like the SetProtocol.js library
   *                  to use for interacting with the Ethereum network.
   * @param core    An instance of CoreWrapper to interact with the deployed Core contract
   * @param assertions  An instance of the Assertion library
   */
  constructor(web3: Web3, core: CoreWrapper, assertions: Assertions) {
    this.web3 = web3;
    this.core = core;
    this.assert = assertions;
  }

  /**
   * Issues a Set to the transaction signer. Must have component tokens in the correct quantites in either
   * the vault or in the signer's wallet. Component tokens must be approved to the Transfer
   * Proxy contract via setTransferProxyAllowanceAsync
   *
   * @param  setAddress    Address Set to issue
   * @param  quantity      Amount of Set to issue. Must be multiple of the natural unit of the Set
   * @param  txOpts        Transaction options object conforming to TxData with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async issueAsync(setAddress: Address, quantity: BigNumber, txOpts: TxData): Promise<string> {
    await this.assertIssue(txOpts.from, setAddress, quantity);

    return await this.core.issue(setAddress, quantity, txOpts);
  }

  /**
   * Redeems a Set to the transaction signer, returning the component tokens to the signer's wallet. Use `false` for
   * to `withdraw` to leave redeemed components in vault under the user's address to save gas if rebundling into another
   * Set with similar components
   *
   * @param  setAddress         Address of Set to issue
   * @param  quantity           Amount of Set to redeem. Must be multiple of the natural unit of the Set
   * @param  withdraw           Boolean to withdraw back to signer's wallet or leave in vault. Defaults to true
   * @param  tokensToExclude    Token addresses to exclude from withdrawal
   * @param  txOpts             Transaction options object conforming to TxData with signer, gas, and gasPrice data
   * @return                    Transaction hash
   */
  public async redeemAsync(
    setAddress: Address,
    quantity: BigNumber,
    withdraw: boolean,
    tokensToExclude: Address[],
    txOpts: TxData
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

    await this.assert.setToken.isMultipleOfNaturalUnit(
      setAddress,
      quantity,
      'Issue quantity',
    );

    await this.assert.setToken.hasSufficientBalances(setAddress, transactionCaller, quantity);
    await this.assert.setToken.hasSufficientAllowances(
      setAddress,
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

    await this.assert.setToken.isMultipleOfNaturalUnit(
      setAddress,
      quantity,
      'Redeem quantity',
    );
    await this.assert.erc20.hasSufficientBalanceAsync(
      setAddress,
      transactionCaller,
      quantity,
    );

    await this.assert.vault.hasSufficientSetTokensBalances(
      this.core.vaultAddress,
      setAddress,
      quantity,
    );
  }
}
