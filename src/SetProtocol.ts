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
import { TransactionReceipt } from 'ethereum-types';

import {
  AccountingAPI,
  BlockchainAPI,
  ERC20API,
  FactoryAPI,
  IssuanceAPI,
  OrderAPI,
  RebalancingAPI,
  SetTokenAPI
} from './api';
import { CoreWrapper, VaultWrapper } from './wrappers';
import { Assertions } from './assertions';
import { BigNumber, IntervalManager, instantiateWeb3 } from './util';
import { Address, Bytes, SetUnits, Provider, TxData } from './types/common';
import { NULL_ADDRESS, UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from './constants';

export interface SetProtocolConfig {
  coreAddress: Address;
  transferProxyAddress: Address;
  vaultAddress: Address;
  setTokenFactoryAddress: Address;
  rebalancingSetTokenFactoryAddress: Address;
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
  private factory: FactoryAPI;
  private issuance: IssuanceAPI;
  private blockchain: BlockchainAPI;

  /**
   * When creating an issuance order without a relayer token for a fee, you must use Solidity
   * address null type (as opposed to Javascript's `null`, `undefined` or empty string).
   */
  public static NULL_ADDRESS = NULL_ADDRESS;

  /**
   * An instance of the ERC20API class containing methods for interacting with ERC20 compliant token contracts
   */
  public erc20: ERC20API;

  /**
   * An instance of the OrderAPI class containing methods for relaying issuance orders
   */
  public orders: OrderAPI;

  /**
   * An instance of the RebalancingAPI class containing methods for rebalancing Sets
   */
  public rebalancing: RebalancingAPI;

  /**
   * An instance of the SetTokenAPI class containing methods for interacting with SetToken contracts
   */
  public setToken: SetTokenAPI;

  /**
   * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library
   *
   * @param provider    Provider instance you would like the SetProtocol.js library to use for interacting with the
   *                      Ethereum network
   * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
   */
  constructor(provider: Provider, config: SetProtocolConfig) {
    this.web3 = instantiateWeb3(provider);

    this.core = new CoreWrapper(this.web3, config.coreAddress, config.transferProxyAddress, config.vaultAddress);
    this.vault = new VaultWrapper(this.web3, config.vaultAddress);

    const assertions = new Assertions(this.web3, this.core);

    this.accounting = new AccountingAPI(this.web3, this.core, assertions);
    this.erc20 = new ERC20API(this.web3, assertions);
    this.factory = new FactoryAPI(this.web3, this.core, assertions, config);
    this.issuance = new IssuanceAPI(this.web3, this.core, assertions);
    this.orders = new OrderAPI(this.web3, this.core, assertions);
    this.rebalancing = new RebalancingAPI(this.web3, assertions, this.core);
    this.setToken = new SetTokenAPI(this.web3, assertions);
  }

  /**
   * Calculates the minimum allowable natural unit for a list of ERC20 token addresses
   * where the minimum natural unit allowed is equal to `10 ** (18 - minimumDecimal)`. `minimumDecimal`
   * is the smallest decimal amongst the tokens passed in
   *
   * @param components            List of ERC20 token addresses to use for Set creation
   * @return                      Minimum natural unit allowed for the component tokens
   */
  public async calculateMinimumNaturalUnitAsync(components: Address[]): Promise<BigNumber> {
    return await this.factory.calculateMinimumNaturalUnitAsync(components);
  }

  /**
   * Calculates unit and naturalUnit inputs for `createSetAsync` for a given list of ERC20 token addreses, proportions
   * of each, current token prices, and target Set price
   *
   * Note: the target price may not be achievable with the lowest viable natural unit. Precision is achieved by
   * increasing the magnitude of natural unit up to `10 ** 18` and recalculating the component units. Defaults to
   * 10 percent
   *
   * @param components      List of ERC20 token addresses to use for Set creation
   * @param prices          List of current prices for the components in index order
   * @param proportions     Decimal-formatted allocations in index order. Must add up to 1
   * @param targetPrice     Target fiat-denominated price of a single natural unit of the Set
   * @param percentError    Allowable price error percentage of resulting Set price from the target price input
   * @return                Object conforming to `SetUnits` containing a list of component units in index order and a
   *                          valid natural unit. These properties can be passed directly into `createSetAsync`
   */
  public async calculateSetUnitsAsync(
    components: Address[],
    prices: BigNumber[],
    proportions: BigNumber[],
    targetPrice: BigNumber,
    percentError?: number,
  ): Promise<SetUnits> {
    return await this.factory.calculateSetUnitsAsync(
      components,
      prices,
      proportions,
      targetPrice,
      percentError,
    );
  }

  /**
   * Create a new Set by passing in parameters denoting component token addresses, quantities, natural
   * unit, and ERC20 properties
   *
   * Note: the return value is the transaction hash of the `createSetAsync` call, not the deployed SetToken
   * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the SetToken address
   *
   * @param  components     Component ERC20 token addresses
   * @param  units          Units of each component in Set paired in index order
   * @param  naturalUnit    Lowest common denominator for the Set
   * @param  name           Name for Set, i.e. "DEX Set"
   * @param  symbol         Symbol for Set, i.e. "DEX"
   * @param  txOpts         Transaction options object conforming to `TxData` with signer, gas, and gasPrice data
   * @return                Transaction hash
   */
  public async createSetAsync(
    components: Address[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
    txOpts: TxData,
  ): Promise<string> {
    return await this.factory.createSetAsync(components, units, naturalUnit, name, symbol, txOpts);
  }

  /**
   * Create a new Rebalancing token by passing in parameters denoting a Set to track, the manager, and various
   * rebalancing properties to facilitate rebalancing events
   *
   * Note: the return value is the transaction hash of the createSetAsync call, not the deployed SetToken
   * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the SetToken address
   *
   * @param  manager              Address of account to propose, rebalance, and settle the Rebalancing token
   * @param  initialSet           Address of the Set the Rebalancing token is initially tracking
   * @param  initialUnitShares    Ratio between balance of this Rebalancing token and the currently tracked Set
   * @param  proposalPeriod       Duration after a manager proposes a new Set to rebalance into when users who wish to
   *                                pull out may redeem their balance of the RebalancingSetToken for balance of the Set
   *                                denominated in seconds
   * @param  rebalanceInterval    Duration after a rebalance is completed when the manager cannot initiate a new
   *                                Rebalance event
   * @param  name                 Name for RebalancingSet, i.e. "Top 10"
   * @param  symbol               Symbol for Set, i.e. "TOP10"
   * @param  txOpts               Transaction options object conforming to `TxData` with signer, gas, and gasPrice data
   * @return                      Transaction hash
   */
  public async createRebalancingSetTokenAsync(
    manager: Address,
    initialSet: Address,
    initialUnitShares: BigNumber,
    proposalPeriod: BigNumber,
    rebalanceInterval: BigNumber,
    name: string,
    symbol: string,
    txOpts: TxData,
  ): Promise<string> {
    return await this.factory.createRebalancingSetTokenAsync(
      manager,
      initialSet,
      initialUnitShares,
      proposalPeriod,
      rebalanceInterval,
      name,
      symbol,
      txOpts,
    );
  }

  /**
   * Issues a Set to the transaction signer. Must have component tokens in the correct quantites in either
   * the vault or in the signer's wallet. Component tokens must be approved to the Transfer
   * Proxy contract via setTransferProxyAllowanceAsync
   *
   * @param  setAddress    Address Set to issue
   * @param  quantity      Amount of Set to issue. Must be multiple of the natural unit of the Set
   * @param  txOpts        Transaction options object conforming to `TxData` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async issueAsync(setAddress: Address, quantity: BigNumber, txOpts: TxData): Promise<string> {
    return await this.issuance.issueAsync(setAddress, quantity, txOpts);
  }

  /**
   * Redeems a Set to the transaction signer, returning the component tokens to the signer's wallet. Use `false` for
   * `withdraw` to leave redeemed components in vault under the user's address to save gas if rebundling into another
   * Set with similar components
   *
   * @param  setAddress         Address of Set to issue
   * @param  quantity           Amount of Set to redeem. Must be multiple of the natural unit of the Set
   * @param  withdraw           Boolean to withdraw back to signer's wallet or leave in vault. Defaults to true
   * @param  tokensToExclude    Token addresses to exclude from withdrawal
   * @param  txOpts             Transaction options object conforming to `TxData` with signer, gas, and gasPrice data
   * @return                    Transaction hash
   */
  public async redeemAsync(
    setAddress: Address,
    quantity: BigNumber,
    withdraw: boolean = true,
    tokensToExclude: Address[],
    txOpts: TxData,
  ): Promise<string> {
    return await this.issuance.redeemAsync(setAddress, quantity, withdraw, tokensToExclude, txOpts);
  }

  /**
   * Deposits tokens into the vault under the signer's address that can be used to issue a Set
   *
   * @param  tokenAddresses    Addresses of ERC20 tokens to deposit into the vault
   * @param  quantities        Amount of each token to deposit into the vault in index order with `tokenAddresses`
   * @param  txOpts            Transaction options object conforming to `TxData` with signer, gas, and gasPrice data
   * @return                   Transaction hash
   */
  public async depositAsync(
    tokenAddresses: Address[],
    quantities: BigNumber[],
    txOpts: TxData
  ): Promise<string> {
    return await this.accounting.depositAsync(tokenAddresses, quantities, txOpts);
  }

  /**
   * Withdraws tokens from the vault belonging to the signer
   *
   * @param  tokenAddresses    Addresses of ERC20 tokens to withdraw from the vault
   * @param  quantities        Amount of each token token to withdraw from vault in index order with `tokenAddresses`
   * @param  txOpts            Transaction options object conforming to `TxData` with signer, gas, and gasPrice data
   * @return                   Transaction hash
   */
  public async withdrawAsync(
    tokenAddresses: Address[],
    quantities: BigNumber[],
    txOpts: TxData
  ): Promise<string> {
    return await this.accounting.withdrawAsync(tokenAddresses, quantities, txOpts);
  }

  /**
   * Sets the TransferProxy contract's allowance to a specified quantity on behalf of the signer. Allowance is
   * required for issuing, redeeming, and filling issuance orders
   *
   * @param   tokenAddress    Address of token contract to approve (typically SetToken or ERC20)
   * @param   quantity        Allowance quantity
   * @param   txOpts          Transaction options object conforming to `TxData` with signer, gas, and gasPrice data
   * @return                  Transaction hash
   */
  public async setTransferProxyAllowanceAsync(
      tokenAddress: string,
      quantity: BigNumber,
      txOpts: TxData,
  ): Promise<string> {
    return await this.erc20.approveAsync(
      tokenAddress,
      this.core.transferProxyAddress,
      quantity,
      txOpts,
    );
  }

  /**
   * Sets the TransferProxy contract's allowance to the maximum amount on behalf of the signer. Allowance is
   * required for issuing, redeeming, and filling issuance orders
   *
   * @param  tokenAddress    Address of contract to approve (typically SetToken or ERC20)
   * @param  txOpts          Transaction options object conforming to `TxData` with signer, gas, and gasPrice data
   * @return                 Transaction hash
   */
  public async setUnlimitedTransferProxyAllowanceAsync(tokenAddress: string, txOpts: TxData): Promise<string> {
    return await this.setTransferProxyAllowanceAsync(
      tokenAddress,
      UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
      txOpts,
    );
  }

  /**
   * Fetch the balance of the provided token contract address inside the Vault
   *
   * @param  tokenAddress    Address of the token contract (typically SetToken or ERC20)
   * @param  ownerAddress    Address of the token owner
   * @return                 Balance of the contract in the vault
   */
  public async getBalanceInVaultAsync(tokenAddress: Address, ownerAddress: Address): Promise<BigNumber> {
    return await this.vault.getBalanceInVault(tokenAddress, ownerAddress);
  }

  /**
   * Fetch a Set Token address from a createSetAsync transaction hash
   *
   * @param  txHash    Transaction hash of the `createSetAsync` transaction
   * @return           Address of the newly created Set
   */
  public async getSetAddressFromCreateTxHashAsync(txHash: string): Promise<Address> {
    return await this.factory.getSetAddressFromCreateTxHash(txHash);
  }

  /**
   * Fetch the addresses of all SetTokens and RebalancingSetTokens
   *
   * @return    Array of SetToken and RebalancingSetToken addresses
   */
  public async getSetAddressesAsync(): Promise<Address[]> {
    return await this.core.getSetAddresses();
  }

  /**
   * Verifies that the provided factory address is enabled for creating new Sets
   *
   * @param  factoryAddress    Address of the factory contract
   * @return                   Whether the factory contract is enabled
   */
  public async isValidFactoryAsync(factoryAddress: Address): Promise<boolean> {
    return await this.core.validFactories(factoryAddress);
  }

  /**
   * Verifies that the provided SetToken or RebalancingSetToken address is enabled
   * for issuance and redemption
   *
   * @param  setAddress    Address of the SetToken or RebalancingSetToken contract
   * @return               Whether the contract is enabled for transacting
   */
  public async isValidSetAsync(setAddress: Address): Promise<boolean> {
    return await this.core.validSets(setAddress);
  }

  /**
   * Polls the Ethereum blockchain until the specified transaction has been mined or
   * the timeout limit is reached, whichever occurs first
   *
   * @param  txHash               Transaction hash to poll
   * @param  pollingIntervalMs    Interval at which the blockchain should be polled
   * @param  timeoutMs            Number of milliseconds until this process times out. If no value is provided, a
   *                                default value is used
   * @return                      Transaction receipt resulting from the mining process
   */
  public async awaitTransactionMinedAsync(
    txHash: string,
    pollingIntervalMs?: number,
    timeoutMs?: number,
  ): Promise<TransactionReceipt> {
    return await this.blockchain.awaitTransactionMinedAsync(txHash, pollingIntervalMs, timeoutMs);
  }
}

export default SetProtocol;
