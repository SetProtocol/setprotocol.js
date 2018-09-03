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
import { Assertions } from '../assertions';
import { ERC20Wrapper } from '../wrappers';
import { BigNumber } from '../util';
import { TxData, TxDataWithFrom } from '../types/common';

/**
 * @title SetTokenAPI
 * @author Set Protocol
 *
 * A library for interacting with set tokens
 */
export class ERC20API {
  private web3: Web3;
  private assert: Assertions;
  private erc20Wrapper: ERC20Wrapper;

  /**
   * Instantiates a new IssuanceAPI instance that contains methods for transferring balances in the vault.
   *
   * @param web3                  The Web3.js Provider instance you would like the SetProtocol.js library
   *                              to use for interacting with the Ethereum network.
   * @param core                  The address of the Set Core contract
   */
  constructor(web3: Web3 = undefined) {
    this.web3 = web3;
    this.assert = new Assertions(this.web3);

    this.erc20Wrapper = new ERC20Wrapper(web3);
  }

  /**
   * Gets balance of the ERC20 token
   *
   * @param  tokenAddress   Address of the ERC20 token
   * @param  userAddress    Address of the user
   * @return                The balance of the ERC20 token
   */
  public async getBalanceOfAsync(tokenAddress: Address, userAddress: Address): Promise<BigNumber> {
    this.assertGetBalanceOf(tokenAddress, userAddress);

    return await this.erc20Wrapper.balanceOf(tokenAddress, userAddress);
  }

  /**
   * Gets name of the ERC20 token
   *
   * @param  tokenAddress   Address of the ERC20 token
   * @return                The name of the ERC20 token
   */
  public async getNameAsync(tokenAddress: Address): Promise<string> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

    return await this.erc20Wrapper.name(tokenAddress);
  }

  /**
   * Gets balance of the ERC20 token
   *
   * @param  tokenAddress   Address of the ERC20 token
   * @return                The symbol of the ERC20 token
   */
  public async getSymbolAsync(tokenAddress: Address): Promise<string> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

    return await this.erc20Wrapper.symbol(tokenAddress);
  }

  /**
   * Gets the total supply of the ERC20 token
   *
   * @param  tokenAddress   Address of the ERC20 token
   * @return                The symbol of the ERC20 token
   */
  public async getTotalSupplyAsync(tokenAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

    return await this.erc20Wrapper.totalSupply(tokenAddress);
  }

  /**
   * Gets decimals of the ERC20 token
   *
   * @param  tokenAddress   Address of the ERC20 token
   * @param  userAddress    Address of the user
   * @return                The decimals of the ERC20 token
   */
  public async getDecimalsAsync(tokenAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

    return await this.erc20Wrapper.decimals(tokenAddress);
  }

  /**
   * Gets the allowance of the spender by the owner account
   *
   * @param  tokenAddress      Address of the token
   * @param  ownerAddress      Address of the owner
   * @param  spenderAddress    Address of the spender
   * @return                   The allowance of the spender
   */
  public async getAllowanceAsync(
    tokenAddress: Address,
    ownerAddress: Address,
    spenderAddress: Address
  ): Promise<BigNumber> {
    this.assertGetAllowance(tokenAddress, ownerAddress, spenderAddress);

    return await this.erc20Wrapper.allowance(tokenAddress, ownerAddress, spenderAddress);
  }

  /**
   * Asynchronously transfer value denominated in the specified ERC20 token to
   * the address specified.
   *
   * @param  tokenAddress   The address of the token being used
   * @param  to             To whom the transfer is being made
   * @param  value          The amount being transferred
   * @param  txOpts         Any parameters necessary to modify the transaction
   * @return                The hash of the resulting transaction
   */
  public async transferAsync(
    tokenAddress: Address,
    to: Address,
    value: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    this.assertTransfer(tokenAddress, to);

    return await this.erc20Wrapper.transfer(tokenAddress, to, value, txOpts);
  }

  /**
   * Asynchronously transfer the value amount in the token specified so long
   * as the sender of the message has received sufficient allowance on behalf
   * of `from` to do so.
   *
   * @param  tokenAddress   The address of the token being used
   * @param  from           From whom are the funds being transferred
   * @param  to             To whom are the funds being transferred
   * @param  value          The amount to be transferred
   * @param  txOpts         Any parameters necessary to modify the transaction
   * @return                The hash of the resulting transaction
   */
  public async transferFromAsync(
    tokenAddress: Address,
    from: Address,
    to: Address,
    value: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    this.assertTransferFrom(tokenAddress, from, to);

    return await this.erc20Wrapper.transferFrom(tokenAddress, from, to, value, txOpts);
  }

  /**
   * Asynchronously approves the value amount of the spender from the owner
   *
   * @param  tokenAddress      The address of the token being used
   * @param  spenderAddress    The spender
   * @param  value             The amount to be approved
   * @param  txOpts            Any parameters necessary to modify the transaction
   * @return                   The hash of the resulting transaction
   */
  public async approveAsync(
    tokenAddress: Address,
    spenderAddress: Address,
    value: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    this.assertApprove(tokenAddress, spenderAddress);

    return await this.erc20Wrapper.approve(tokenAddress, spenderAddress, value, txOpts);
  }

  /* ============ Private Assertions ============ */

  private assertGetBalanceOf(tokenAddress: Address, userAddress: Address) {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('userAddress', userAddress);
  }

  private assertGetAllowance(tokenAddress: Address, ownerAddress: Address, spenderAddress: Address) {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('ownerAddress', ownerAddress);
    this.assert.schema.isValidAddress('spenderAddress', spenderAddress);
  }

  private assertTransfer(tokenAddress: Address, to: Address) {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('to', to);
  }

  private assertTransferFrom(tokenAddress: Address, from: Address, to: Address) {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('from', from);
    this.assert.schema.isValidAddress('to', to);
  }

  private assertApprove(tokenAddress: Address, spenderAddress: Address) {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('spenderAddress', spenderAddress);
  }
}
