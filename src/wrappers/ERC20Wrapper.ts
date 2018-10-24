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

import Web3 from 'web3';

import { ContractWrapper } from '.';
import { Address, Tx } from '../types/common';
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
  private contracts: ContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Gets balance of the ERC20 token
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @param  userAddress   Address of the user
   * @return               The balance of the ERC20 token
   */
  public async balanceOf(tokenAddress: Address, userAddress: Address): Promise<BigNumber> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    return await tokenInstance.balanceOf.callAsync(userAddress);
  }

  /**
   * Gets name of the ERC20 token
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @return               The name of the ERC20 token
   */
  public async name(tokenAddress: Address): Promise<string> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    return await tokenInstance.name.callAsync(tokenAddress);
  }

  /**
   * Gets balance of the ERC20 token
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @return               The symbol of the ERC20 token
   */
  public async symbol(tokenAddress: Address): Promise<string> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    return await tokenInstance.symbol.callAsync(tokenAddress);
  }

  /**
   * Gets the total supply of the ERC20 token
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @return               The symbol of the ERC20 token
   */
  public async totalSupply(tokenAddress: Address): Promise<BigNumber> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    return await tokenInstance.totalSupply.callAsync(tokenAddress);
  }

  /**
   * Gets decimals of the ERC20 token
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @param  userAddress   Address of the user
   * @return               The decimals of the ERC20 token
   */
  public async decimals(tokenAddress: Address): Promise<BigNumber> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    return await tokenInstance.decimals.callAsync(tokenAddress);
  }

  /**
   * Gets the allowance of the spender by the owner account
   *
   * @param  tokenAddress      Address of the token
   * @param  ownerAddress      Address of the owner
   * @param  spenderAddress    Address of the spender
   * @return                   The allowance of the spender
   */
  public async allowance(tokenAddress: Address, ownerAddress: Address, spenderAddress: Address): Promise<BigNumber> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    return await tokenInstance.allowance.callAsync(ownerAddress, spenderAddress);
  }

  /**
   * Asynchronously transfer value denominated in the specified ERC20 token to
   * the address specified.
   *
   * @param  tokenAddress   The address of the token being used.
   * @param  to             To whom the transfer is being made.
   * @param  value          The amount being transferred.
   * @param  txOpts         Any parameters necessary to modify the transaction.
   * @return                The hash of the resulting transaction.
   */
  public async transfer(tokenAddress: Address, to: Address, value: BigNumber, txOpts?: Tx): Promise<string> {
    const txOptions = await generateTxOpts(this.web3, txOpts);
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    return await tokenInstance.transfer.sendTransactionAsync(to, value, txOptions);
  }

  /**
   * Asynchronously transfer the value amount in the token specified so long
   * as the sender of the message has received sufficient allowance on behalf
   * of `from` to do so.
   *
   * @param  tokenAddress   The address of the token being used.
   * @param  from           From whom are the funds being transferred.
   * @param  to             To whom are the funds being transferred.
   * @param  value          The amount to be transferred.
   * @param  txOpts         Any parameters necessary to modify the transaction.
   * @return                The hash of the resulting transaction.
   */
  public async transferFrom(
    tokenAddress: Address,
    from: Address,
    to: Address,
    value: BigNumber,
    txOpts?: Tx,
  ): Promise<string> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await tokenInstance.transferFrom.sendTransactionAsync(from, to, value, txOptions);
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
  public async approve(
    tokenAddress: Address,
    spenderAddress: Address,
    value: BigNumber,
    txOpts?: Tx,
  ): Promise<string> {
    const txOptions = await generateTxOpts(this.web3, txOpts);
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    return await tokenInstance.approve.sendTransactionAsync(spenderAddress, value, txOptions);
  }
}
