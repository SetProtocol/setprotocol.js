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
import Web3 from 'web3';
import { SetTokenContract } from 'set-protocol-contracts';

import { ZERO } from '../constants';
import { coreAPIErrors } from '../errors';
import { Assertions } from '../assertions';
import { CoreWrapper, ERC20Wrapper, SetTokenWrapper, VaultWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { Address, Component, Tx } from '../types/common';

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
  private setToken: SetTokenWrapper;
  private erc20: ERC20Wrapper;
  private vault: VaultWrapper;

  /**
   * Instantiates a new IssuanceAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   * @param core        An instance of CoreWrapper to interact with the deployed Core contract
   * @param assertions  An instance of the Assertion library
   */
  constructor(web3: Web3, core: CoreWrapper, assertions: Assertions) {
    this.web3 = web3;
    this.core = core;
    this.assert = assertions;
    this.setToken = new SetTokenWrapper(this.web3);
    this.erc20 = new ERC20Wrapper(this.web3);
    this.vault = new VaultWrapper(this.web3, core.vaultAddress);
  }

  /**
   * Issues a Set to the transaction signer. Must have component tokens in the correct quantites in either
   * the vault or in the signer's wallet. Component tokens must be approved to the Transfer
   * Proxy contract via setTransferProxyAllowanceAsync
   *
   * @param  setAddress    Address Set to issue
   * @param  quantity      Amount of Set to issue. Must be multiple of the natural unit of the Set
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async issueAsync(setAddress: Address, quantity: BigNumber, txOpts: Tx): Promise<string> {
    await this.assertIssue(txOpts.from, setAddress, quantity);

    return await this.core.issue(setAddress, quantity, txOpts);
  }

  /**
   * Redeems a Set to the transaction signer, returning the component tokens to the signer's wallet. Use `false` for
   * to `withdraw` to leave redeemed components in vault under the user's address to save gas if rebundling into
   * another Set with similar components
   *
   * @param  setAddress         Address of Set to issue
   * @param  quantity           Amount of Set to redeem. Must be multiple of the natural unit of the Set
   * @param  withdraw           Boolean to withdraw back to signer's wallet or leave in vault. Defaults to true
   * @param  tokensToExclude    Token addresses to exclude from withdrawal
   * @param  txOpts             Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return                    Transaction hash
   */
  public async redeemAsync(
    setAddress: Address,
    quantity: BigNumber,
    withdraw: boolean,
    tokensToExclude: Address[],
    txOpts: Tx
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

      return await this.core.redeemAndWithdrawTo(setAddress, quantity, toExclude, txOpts);
    } else {
      return await this.core.redeem(setAddress, quantity, txOpts);
    }
  }

  /**
   * Calculates additional amounts of each component token in a Set needed in order to issue a specific quantity of
   * the Set. This includes token balances a user may have in both the account wallet and the Vault contract. Can be
   * used as `requiredComponents` and `requiredComponentAmounts` inputs for an issuance order
   *
   * @param  setAddress       Address of the Set token for issuance order
   * @param  userAddress     Address of user making the issuance
   * @param  quantity         Amount of the Set token to create as part of issuance order
   * @return                  List of objects conforming to the `Component` interface with address and units of each
   *                            component required for issuance
   */
  public async calculateRequiredComponentsAndUnitsAsync(
    setAddress: Address,
    userAddress: Address,
    quantity: BigNumber,
  ): Promise<Component[]> {
    const components = await this.setToken.getComponents(setAddress);
    const componentUnits = await this.setToken.getUnits(setAddress);
    const naturalUnit = await this.setToken.naturalUnit(setAddress);
    const totalUnitsNeeded = _.map(componentUnits, componentUnit => componentUnit.mul(quantity).div(naturalUnit));

    const requiredComponents: Component[] = [];

    // Gather how many components are owned by the user in balance/vault
    await Promise.all(
      components.map(async (componentAddress, index) => {
        const walletBalance = await this.erc20.balanceOf(componentAddress, userAddress);
        const vaultBalance = await this.vault.getBalanceInVault(componentAddress, userAddress);
        const userTokenbalance = walletBalance.add(vaultBalance);

        const missingUnits = totalUnitsNeeded[index].sub(userTokenbalance);
        if (missingUnits.gt(ZERO)) {
          const requiredComponent: Component = {
            address: componentAddress,
            unit: missingUnits,
          };

          requiredComponents.push(requiredComponent);
        }
      }),
    );

    return requiredComponents;
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
