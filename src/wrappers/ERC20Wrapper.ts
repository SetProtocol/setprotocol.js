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

import * as Web3 from 'web3';
import { Address } from 'set-protocol-utils';

import { ContractWrapper } from '.';
import { erc20AssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { TxData } from '../types/common';
import { BigNumber, generateTxOpts } from '../util';

/**
 * @title  VaultAPI
 * @author Set Protocol
 *
 * The Vault API handles all functions on the Vault smart contract.
 *
 */
export class ERC20Wrapper {
  private web3: Web3;
  private assert: Assertions;
  private contracts: ContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.assert = new Assertions(this.web3);
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Gets balance of the ERC20 token
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @param  userAddress Address of the user
   * @return             The balance of the ERC20 token
   */
  public async getBalanceOfAsync(tokenAddress: Address, userAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('userAddress', userAddress);
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    return await tokenInstance.balanceOf.callAsync(userAddress);
  }

  /**
   * Gets name of the ERC20 token
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @return             The name of the ERC20 token
   */
  public async getNameAsync(tokenAddress: Address): Promise<string> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    return await tokenInstance.name.callAsync(tokenAddress);
  }

  /**
   * Gets balance of the ERC20 token
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @return             The symbol of the ERC20 token
   */
  public async getSymbolAsync(tokenAddress: Address): Promise<string> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    return await tokenInstance.symbol.callAsync(tokenAddress);
  }

  /**
   * Gets the total supply of the ERC20 token
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @return             The symbol of the ERC20 token
   */
  public async getTotalSupplyAsync(tokenAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    return await tokenInstance.totalSupply.callAsync(tokenAddress);
  }

  /**
   * Gets decimals of the ERC20 token
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @param  userAddress Address of the user
   * @return             The decimals of the ERC20 token
   */
  public async getDecimalsAsync(tokenAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    return await tokenInstance.decimals.callAsync(tokenAddress);
  }

  /**
   * Gets the allowance of the spender by the owner account
   *
   * @param  tokenAddress      Address of the token
   * @param  ownerAddress      Address of the owner
   * @param  spenderAddress    Address of the spender
   * @return             The allowance of the spender
   */
  public async getAllowanceAsync(
    tokenAddress: Address,
    ownerAddress: Address,
    spenderAddress: Address
  ): Promise<BigNumber> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('ownerAddress', ownerAddress);
    this.assert.schema.isValidAddress('spenderAddress', spenderAddress);

    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    return await tokenInstance.allowance.callAsync(ownerAddress, spenderAddress);
  }

  /**
   * Asynchronously transfer value denominated in the specified ERC20 token to
   * the address specified.
   *
   * @param  tokenAddress the address of the token being used.
   * @param  to           to whom the transfer is being made.
   * @param  value        the amount being transferred.
   * @param  txOpts      any parameters necessary to modify the transaction.
   * @return              the hash of the resulting transaction.
   */
  public async transferAsync(
    tokenAddress: Address,
    to: Address,
    value: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('to', to);

    const txOptions = await generateTxOpts(this.web3, txOpts);

    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    await this.assert.erc20.hasSufficientBalance(
        tokenInstance,
        txOpts.from,
        value,
        erc20AssertionErrors.INSUFFICIENT_BALANCE(),
    );

    const txHash = await tokenInstance.transfer.sendTransactionAsync(to, value, txOptions);

    return txHash;
  }

  /**
   * Asynchronously transfer the value amount in the token specified so long
   * as the sender of the message has received sufficient allowance on behalf
   * of `from` to do so.
   *
   * @param  tokenAddress the address of the token being used.
   * @param  from         from whom are the funds being transferred.
   * @param  to           to whom are the funds being transferred.
   * @param  value        the amount to be transferred.
   * @param  txOpts      any parameters necessary to modify the transaction.
   * @return              the hash of the resulting transaction.
   */
  public async transferFromAsync(
    tokenAddress: Address,
    from: Address,
    to: Address,
    value: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('from', from);
    this.assert.schema.isValidAddress('to', to);

    const txOptions = await generateTxOpts(this.web3, txOpts);

    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    await this.assert.erc20.hasSufficientBalance(
        tokenInstance,
        from,
        value,
        erc20AssertionErrors.INSUFFICIENT_BALANCE(),
    );

    await this.assert.erc20.hasSufficientAllowance(
        tokenInstance,
        from,
        txOpts.from,
        value,
        erc20AssertionErrors.INSUFFICIENT_ALLOWANCE(),
    );

    const txHash = await tokenInstance.transferFrom.sendTransactionAsync(from, to, value, txOptions);

    return txHash;
  }

  /**
   * Asynchronously approves the value amount of the spender from the owner
   *
   * @param  tokenAddress         the address of the token being used.
   * @param  spenderAddress       the spender.
   * @param  value                the amount to be approved.
   * @param  txOpts               any parameters necessary to modify the transaction.
   * @return                      the hash of the resulting transaction.
   */
  public async approveAsync(
    tokenAddress: Address,
    spenderAddress: Address,
    value: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('spenderAddress', spenderAddress);

    const txOptions = await generateTxOpts(this.web3, txOpts);

    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const txHash = await tokenInstance.approve.sendTransactionAsync(spenderAddress, value, txOptions);

    return txHash;
  }
}
