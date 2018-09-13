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
import { TransactionReceipt } from 'ethereum-types';
import { Address, Bytes, SetProtocolUtils } from 'set-protocol-utils';
import { DetailedERC20Contract } from 'set-protocol-contracts';
import { AccountingAPI, BlockchainAPI, ERC20API, FactoryAPI, IssuanceAPI, OrderAPI, SetTokenAPI } from './api';
import { CoreWrapper, VaultWrapper } from './wrappers';
import { BigNumber, IntervalManager, instantiateWeb3 } from './util';
import { TxData, Provider } from './types/common';

export interface SetProtocolConfig {
  coreAddress: Address;
  transferProxyAddress: Address;
  vaultAddress: Address;
  setTokenFactoryAddress: Address;
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
  public static NULL_ADDRESS = SetProtocolUtils.CONSTANTS.NULL_ADDRESS;

  /**
   * An instance of the OrderAPI class containing methods for relaying issuance orders
   */
  public orders: OrderAPI;

  /**
   * An instance of the ERC20API class containing methods for interacting with ERC20 compliant token contracts
   */
  public erc20: ERC20API;

  /**
   * An instance of the SetTokenAPI class containing methods for interacting with SetToken contracts
   */
  public setToken: SetTokenAPI;

  /**
   * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library
   *
   * @param provider    Provider instance you would like the SetProtocol.js library
   *                      to use for interacting with the Ethereum network.
   * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
   */
  constructor(provider: Provider = undefined, config: SetProtocolConfig) {
    this.web3 = instantiateWeb3(provider);

    this.core = new CoreWrapper(this.web3, config.coreAddress, config.transferProxyAddress, config.vaultAddress);
    this.vault = new VaultWrapper(this.web3, config.vaultAddress);

    this.accounting = new AccountingAPI(this.web3, this.core);
    this.erc20 = new ERC20API(this.web3);
    this.factory = new FactoryAPI(this.web3, this.core, config.setTokenFactoryAddress);
    this.issuance = new IssuanceAPI(this.web3, this.core);
    this.orders = new OrderAPI(this.web3, this.core);
    this.setToken = new SetTokenAPI(this.web3);
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
   * @param  txOpts         Transaction options object conforming to TxData with signer, gas, and gasPrice data
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
   * @param  txOpts             Transaction options object conforming to TxData with signer, gas, and gasPrice data
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
   * @param  txOpts            Transaction options object conforming to TxData with signer, gas, and gasPrice data
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
   * @param  txOpts            Transaction options object conforming to TxData with signer, gas, and gasPrice data
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
   * @param   txOpts          Transaction options object conforming to TxData with signer, gas, and gasPrice data
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
   * @param  txOpts          Transaction options object conforming to TxData with signer, gas, and gasPrice data
   * @return                 Transaction hash
   */
  public async setUnlimitedTransferProxyAllowanceAsync(tokenAddress: string, txOpts: TxData): Promise<string> {
      return await this.setTransferProxyAllowanceAsync(
          tokenAddress,
          SetProtocolUtils.CONSTANTS.UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
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
   * @param  txHash    Transaction hash of the createSetAsync transaction
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
   * @param  timeoutMs            Number of milliseconds until this process times out. If
   *                                no value is provided, a default value is used
   * @return                      Transaction receipt resulting from the mining process
   */
  public async awaitTransactionMinedAsync(
    txHash: string,
    pollingIntervalMs ?: number,
    timeoutMs?: number,
  ): Promise<TransactionReceipt> {
    return await this.blockchain.awaitTransactionMinedAsync(txHash, pollingIntervalMs, timeoutMs);
  }

  /**
   * Calculates the minimum allowable natural unit for a list of ERC20 component addresses
   * where the minimum natural unit allowed equal 10^(18-minDecimal)
   *
   * @param componentAddresses    Component ERC20 addresses
   *
   * @return                      The minimum value of the natural unit allowed by component decimals
   */
  public async calculateMinimumNaturalUnit(
    components: Address[],
  ): Promise<BigNumber> {
    const componentInstancePromises = _.map(components, component => {
      return DetailedERC20Contract.at(component, this.web3, {});
    });

    const componentInstances = await Promise.all(componentInstancePromises);

    let minDecimal;
    try {
      const decimalPromises = _.map(componentInstances, componentInstance => {
        return componentInstance.decimals.callAsync();
      });

      const decimals = await Promise.all(decimalPromises);
      minDecimal = BigNumber.min(decimals);
    } catch (error) {
      // If any of the conponent addresses does not implement decimals(),
      // we assume the worst and set minDecimal to 0 so that minimum natural unit
      // will be 10^18.
      minDecimal = SetProtocolUtils.CONSTANTS.ZERO;
    }

    const baseNumber = new BigNumber(10);

    return baseNumber.pow(minDecimal.negated().plus(18).toNumber());
  }
}

export default SetProtocol;
