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
import { CoreWrapper, ERC20Wrapper, SetTokenWrapper, VaultWrapper } from './wrappers';
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
  private core: CoreWrapper;
  private vault: VaultWrapper;

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
   * An instance of the ERC20Wrapper class containing methods for interacting with ERC20 compliant contracts
   */
  public erc20: ERC20Wrapper;

  /**
   * An instance of the OrderAPI class containing methods for relaying IssuanceOrders
   */
  public setToken: SetTokenWrapper;

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
    this.erc20 = new ERC20Wrapper(this.web3);
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
    return await this.core.createSet(factoryAddress, components, units, naturalUnit, name, symbol, txOpts);
  }

  /**
   * Asynchronously issues a particular quantity of tokens from a particular Sets
   *
   * @param  setAddress     Set token address of Set being issued
   * @param  quantity       Number of Sets a user wants to issue in Wei
   * @param  txOpts         The options for executing the transaction
   * @return                Transaction hash
   */
  public async issueAsync(setAddress: Address, quantity: BigNumber, txOpts?: TxData): Promise<string> {
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
   * @return                   Transaction hash
   */
  public async redeemAsync(
    setAddress: Address,
    quantity: BigNumber,
    withdraw: boolean,
    tokensToExclude: Address[],
    txOpts?: TxData,
  ): Promise<string> {
    return await this.core.redeem(setAddress, quantity, withdraw, tokensToExclude, txOpts);
  }

  /**
   * Deposits token either using single token type deposit or batch deposit
   *
   * @param  tokenAddresses[]  Addresses of ERC20 tokens user wants to deposit into the vault
   * @param  quantities[]      Numbers of tokens a user wants to deposit into the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   Transaction hash
   */
  public async depositAsync(tokenAddresses: Address[], quantities: BigNumber[], txOpts?: TxData): Promise<string> {
    return await this.core.deposit(tokenAddresses, quantities, txOpts);
  }

  /**
   * Withdraws tokens either using single token type withdraw or batch withdraw
   *
   * @param  tokenAddresses[]  Addresses of ERC20 tokens user wants to withdraw from the vault
   * @param  quantities[]      Numbers of tokens a user wants to withdraw from the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   Transaction hash
   */
  public async withdrawAsync(tokenAddresses: Address[], quantities: BigNumber[], txOpts?: TxData): Promise<string> {
    return await this.core.withdraw(tokenAddresses, quantities, txOpts);
  }

  /**
   * Sets the Set TransferProxy contract's allowance to a specified quantity on behalf of the user. Allowance is
   * required for issuing, redeeming, and filling issuance orders
   *
   * @param   tokenAddress        Address of contract to approve (typically SetToken or ERC20)
   * @param   quantity            The allowance quantity
   * @param   txOpts              The options for executing the transaction
   * @return                      Transaction hash
   */
  public async setTransferProxyAllowanceAsync(
      tokenAddress: string,
      quantity: BigNumber,
      txOpts?: TxData,
  ): Promise<string> {
      return await this.erc20.approveAsync(
          tokenAddress,
          this.core.transferProxyAddress,
          quantity,
          txOpts,
      );
  }

  /**
   * Sets the Set TransferProxy contract's allowance to a unlimited number on behalf of the user. Allowance is
   * required for issuing, redeeming, and filling issuance orders
   *
   * @param  tokenAddress    Address of contract to approve (typically SetToken or ERC20)
   * @param  txOpts          The options for executing the transaction
   * @return                 Transaction hash
   */
  public async setUnlimitedTransferProxyAllowanceAsync(tokenAddress: string, txOpts?: TxData): Promise<string> {
      return await this.setTransferProxyAllowanceAsync(
          tokenAddress,
          SetProtocolUtils.CONSTANTS.UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
          txOpts,
      );
  }

  /**
   * Fetch the balance of the provided contract address inside the vault specified
   * in SetProtocolConfig
   *
   * @param  tokenAddress    Address of the contract (typically SetToken or ERC20)
   * @param  ownerAddress    Address of the user
   * @return                 The balance of the contract in the vault
   */
  public async getBalanceInVaultAsync(tokenAddress: Address, ownerAddress: Address): Promise<BigNumber> {
    return await this.vault.getBalanceInVault(tokenAddress, ownerAddress);
  }

  /**
   * Fetch the addresses of SetTokens and RebalancingSetTokens created by the system
   * of contracts specified in SetProtcolConfig
   *
   * @return Array of SetToken and RebalancingSetToken addresses
   */
  public async getSetAddressesAsync(): Promise<Address[]> {
    return await this.core.getSetAddresses();
  }

  /**
   * Verifies that the provided SetToken factory is enabled for creating a new SetToken
   *
   * @param  factoryAddress    Address of the factory contract
   * @return                   Whether the factory contract is enabled
   */
  public async isValidFactoryAsync(factoryAddress: Address): Promise<boolean> {
    return await this.core.isValidFactoryAsync(factoryAddress);
  }

  /**
   * Verifies that the provided SetToken or RebalancingSetToken address is enabled
   * for issuance and redemption
   *
   * @param  setAddress    Address of the SetToken or RebalancingSetToken contract
   * @return               Whether the set contract is enabled
   */
  public async isValidSetAsync(setAddress: Address): Promise<boolean> {
    return await this.core.isValidSetAsync(setAddress);
  }
}

export default SetProtocol;
