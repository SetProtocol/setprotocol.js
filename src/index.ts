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
import { Address, Bytes, SetProtocolUtils } from 'set-protocol-utils';
import { Provider } from '@0xproject/types';

import { AccountingAPI, IssuanceAPI, OrderAPI } from './api';
import { CoreWrapper, ERC20Wrapper, SetTokenWrapper, VaultWrapper } from './wrappers';
import { BigNumber, instantiateWeb3 } from './util';
import { TxData } from './types/common';

export interface SetProtocolConfig {
  coreAddress: Address;
  transferProxyAddress: Address;
  vaultAddress: Address;
}

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
  private accounting: AccountingAPI;
  private issuance: IssuanceAPI;

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
   * @param provider              The provider instance you would like the SetProtocol.js library
   *                              to use for interacting with the Ethereum network.
   * @param config                A configuration object with Set Protocol's contract addresses
   */
  constructor(provider: Provider = undefined, config: SetProtocolConfig) {
    this.web3 = instantiateWeb3(provider);

    this.core = new CoreWrapper(this.web3, config.coreAddress, config.transferProxyAddress, config.vaultAddress);
    this.erc20 = new ERC20Wrapper(this.web3);
    this.setToken = new SetTokenWrapper(this.web3);
    this.vault = new VaultWrapper(this.web3, config.vaultAddress);

    this.accounting = new AccountingAPI(this.web3, this.core);
    this.issuance = new IssuanceAPI(this.web3, this.core);
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
    return await this.core.createSet(factoryAddress, components, units, naturalUnit, name, symbol, txOpts);
  }

  /**
   * Issues a Set to the transaction signer. Must have component tokens in the correct quantites in either
   * the vault or in the signer's wallet. Component tokens must be approved to the Transfer
   * Proxy contract via setTransferProxyAllowanceAsync
   *
   * @param  setAddress    Address of Set to issue
   * @param  quantity      Amount of Set to issue in Wei. Must be multiple of the natural unit of the Set
   * @param  txOpts        The options for executing the transaction
   * @return               Transaction hash
   */
  public async issueAsync(setAddress: Address, quantity: BigNumber, txOpts?: TxData): Promise<string> {
    return await this.issuance.issueAsync(setAddress, quantity, txOpts);
  }

  /**
   * Redeems a Set to the transaction signer, returning the component tokens to the signer's wallet. Set withdraw
   * to false to leave redeemed components in vault under the user's address to save gas if rebundling into another
   * Set with similar components
   *
   * @param  setAddress         Address of Set to issue
   * @param  quantity           Amount of Set to redeem. Must be multiple of the natural unit of the Set
   * @param  withdraw           Boolean to withdraw back to signer's wallet or leave in vault. Defaults to true
   * @param  tokensToExclude    Token addresses to exclude from withdrawal
   * @param  txOpts             The options for executing the transaction
   * @return                    Transaction hash
   */
  public async redeemAsync(
    setAddress: Address,
    quantity: BigNumber,
    withdraw: boolean = true,
    tokensToExclude: Address[],
    txOpts?: TxData,
  ): Promise<string> {
    return await this.issuance.redeemAsync(setAddress, quantity, withdraw, tokensToExclude, txOpts);
  }

  /**
   * Deposits token either using single token type deposit or batch deposit
   *
   * @param  tokenAddresses[]    Addresses of ERC20 tokens user wants to deposit into the vault
   * @param  quantities[]        Numbers of tokens a user wants to deposit into the vault
   * @param  txOpts              The options for executing the transaction
   * @return                     Transaction hash
   */
  public async depositAsync(tokenAddresses: Address[], quantities: BigNumber[], txOpts?: TxData): Promise<string> {
    return await this.accounting.depositAsync(tokenAddresses, quantities, txOpts);
  }

  /**
   * Withdraws tokens either using single token type withdraw or batch withdraw
   *
   * @param  tokenAddresses[]    Addresses of ERC20 tokens user wants to withdraw from the vault
   * @param  quantities[]        Numbers of tokens a user wants to withdraw from the vault
   * @param  txOpts              The options for executing the transaction
   * @return                     Transaction hash
   */
  public async withdrawAsync(tokenAddresses: Address[], quantities: BigNumber[], txOpts?: TxData): Promise<string> {
    return await this.accounting.withdrawAsync(tokenAddresses, quantities, txOpts);
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
   * Asynchronously retrieves a Set Token address from a createSet txHash
   *
   * @param  txHash     The transaction has to retrieve the set address from
   * @return            The address of the newly created Set
   */
  public async getSetAddressFromCreateTxHashAsync(txHash: string): Promise<Address> {
    return await this.core.getSetAddressFromCreateTxHash(txHash);
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
