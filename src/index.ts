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
import { Address, SetProtocolUtils } from 'set-protocol-utils';
import { OrderAPI } from './api';
import { CoreWrapper, SetTokenWrapper, VaultWrapper } from './wrappers';
import { BigNumber } from './util';
import { TxData } from './types/common';

/**
 * @title SetProtocol
 * @author Set Protocol
 *
 * The SetProtocol class that exposes all functionality for interacting with the SetProtocol smart contracts.
 * Methods that require interaction with the Ethereum blockchain are exposed after instantiating a new instance
 * of SetProtocol with the web3 provider argument
 */
class SetProtocol {
  private web3: Web3;
  public core: CoreWrapper;
  public setToken: SetTokenWrapper;
  public vault: VaultWrapper;

  /**
   * When creating an issuance order without a relayer token for a fee, you must use Solidity
   * address null type (as opposed to Javascripts `null`, `undefined` or empty string).
   */
  public static NULL_ADDRESS = SetProtocolUtils.CONSTANTS.NULL_ADDRESS;

  /**
   * An instance of the OrderAPI class containing methods for relaying IssuanceOrders
   */
  public orders: OrderAPI;

  /**
   * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library.
   * @param web3                  The Web3.js Provider instance you would like the SetProtocol.js library
   *                              to use for interacting with the Ethereum network.
   * @param coreAddress           The address of the Set Core contract
   * @param transferProxyAddress  The address of the Set TransferProxy contract
   * @param vaultAddress          The address of the Set Vault contract
   */
  constructor(
    web3: Web3 = undefined,
    coreAddress: Address = undefined,
    transferProxyAddress: Address = undefined,
    vaultAddress: Address = undefined,
  ) {
    this.web3 = web3;

    this.core = new CoreWrapper(this.web3, coreAddress, transferProxyAddress, vaultAddress);
    this.setToken = new SetTokenWrapper(this.web3);
    this.vault = new VaultWrapper(this.web3, vaultAddress);

    this.orders = new OrderAPI(this.web3, this.core);
  }

  /**
   * Create a new Set, specifying the components, units, name, symbol to use.
   *
   * @param  factoryAddress Set Token factory address of the token being created
   * @param  components     Component token addresses
   * @param  units          Units of corresponding token components
   * @param  naturalUnit    Supplied as the lowest common denominator for the Set
   * @param  name           User-supplied name for Set (i.e. "DEX Set")
   * @param  symbol         User-supplied symbol for Set (i.e. "DEX")
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up for the Set address
   */
  public async createSetAsync(
    factoryAddress: Address,
    components: Address[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
    txOpts?: TxData,
  ): Promise<string> {
    return this.core.createSet(factoryAddress, components, units, naturalUnit, name, symbol, txOpts);
  }

  /**
   * Asynchronously issues a particular quantity of tokens from a particular Sets
   *
   * @param  setAddress     Set token address of Set being issued
   * @param  quantityInWei  Number of Sets a user wants to issue in Wei
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up
   */
  public async issueAsync(
    setAddress: Address,
    quantityInWei: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    return this.core.issue(setAddress, quantityInWei, txOpts);
  }

  /**
   * Composite method to redeem and optionally withdraw tokens
   *
   * @param  setAddress        The address of the Set token
   * @param  quantityInWei     The number of tokens to redeem
   * @param  withdraw          Boolean determining whether or not to withdraw
   * @param  tokensToExclude   Array of token addresses to exclude from withdrawal
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash to then later look up
   */
  public async redeemAsync(
    setAddress: Address,
    quantityInWei: BigNumber,
    withdraw: boolean,
    tokensToExclude: Address[],
    txOpts?: TxData,
  ): Promise<string> {
    return await this.core.redeem(setAddress, quantityInWei, withdraw, tokensToExclude, txOpts);
  }

  /**
   * Deposits token either using single token type deposit or batch deposit
   *
   * @param  tokenAddresses[]  Addresses of ERC20 tokens user wants to deposit into the vault
   * @param  quantitiesInWei[] Numbers of tokens a user wants to deposit into the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash
   */
  public async depositAsync(
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TxData,
  ): Promise<string> {
    return await this.core.deposit(tokenAddresses, quantitiesInWei, txOpts);
  }

  /**
   * Withdraws tokens either using single token type withdraw or batch withdraw
   *
   * @param  tokenAddresses[]  Addresses of ERC20 tokens user wants to withdraw from the vault
   * @param  quantitiesInWei[] Numbers of tokens a user wants to withdraw from the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash
   */
  public async withdrawAsync(
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TxData,
  ): Promise<string> {
    return await this.core.withdraw(tokenAddresses, quantitiesInWei, txOpts);
  }

  /**
   * Gets balance of user's tokens in the vault
   *
   * @param  tokenAddress Address of the Set
   * @param  ownerAddress Address of the user
   * @return              The balance of the user's Set
   */
  public async getBalanceInVaultAsync(
    tokenAddress: Address,
    ownerAddress: Address,
  ): Promise<BigNumber> {
    return await this.vault.getBalanceInVault(tokenAddress, ownerAddress);
  }

  /**
   * Asynchronously gets Set addresses
   *
   * @return Array of Set addresses
   */
  public async getSetAddresses(): Promise<Address[]> {
    return await this.core.getSetAddresses();
  }

  /**
   * Asynchronously validates if an address is a valid factory address
   *
   * @param  factoryAddress Address of the factory contract
   * @return                Boolean equalling if factory address is valid
   */
  public async getIsValidFactory(factoryAddress: Address): Promise<boolean> {
    return await this.core.getIsValidFactory(factoryAddress);
  }

  /**
   * Asynchronously validates if an address is a valid Set address
   *
   * @param  setAddress Address of the Set contract
   * @return            Boolean equalling if Set address is valid
   */
  public async validateSet(setAddress: Address): Promise<boolean> {
    return await this.core.getIsValidSet(setAddress);
  }
}

export default SetProtocol;
