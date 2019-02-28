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
import { SetProtocolUtils } from 'set-protocol-utils';

import { ContractWrapper } from '.';
import { Address, Tx } from '../types/common';
import { BigNumber, generateTxOpts } from '../util';

/**
 * @title CoreWrapper
 * @author Set Protocol
 *
 * The Core API handles all functions on the Core SetProtocol smart contract.
 *
 */
export class CoreWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;

  public coreAddress: Address;
  public transferProxyAddress: Address;
  public vaultAddress: Address;

  public constructor(
    web3: Web3,
    coreAddress: Address,
    transferProxyAddress: Address,
    vaultAddress: Address,
  ) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);

    this.coreAddress = coreAddress;
    this.transferProxyAddress = transferProxyAddress;
    this.vaultAddress = vaultAddress;
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
   * @param  callData       Additional call data used to create different Sets
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up for the Set address
   */
  public async create(
    factoryAddress: Address,
    components: Address[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
    callData: string,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.createSet.sendTransactionAsync(
      factoryAddress,
      components,
      units,
      naturalUnit,
      SetProtocolUtils.stringToBytes(name),
      SetProtocolUtils.stringToBytes(symbol),
      callData,
      txSettings,
    );
  }

  /**
   * Asynchronously issues a particular quantity of tokens from a particular Sets
   *
   * @param  setAddress     Set token address of Set being issued
   * @param  quantity       Number of Sets a user wants to issue in base units
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up
   */
  public async issue(setAddress: Address, quantity: BigNumber, txOpts?: Tx): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.issue.sendTransactionAsync(
      setAddress,
      quantity,
      txSettings,
    );
  }

  /**
   * Asynchronously redeems a particular quantity of tokens from a particular Sets
   *
   * @param  setAddress     Set token address of Set being issued
   * @param  quantity       Number of Sets a user wants to redeem in base units
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up
   */
  public async redeem(setAddress: Address, quantity: BigNumber, txOpts?: Tx): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.redeem.sendTransactionAsync(
      setAddress,
      quantity,
      txSettings,
    );
  }

  /**
   * Redeem and withdraw with a single transaction
   *
   * Normally, you should expect to be able to withdraw all of the tokens.
   * However, some have central abilities to freeze transfers (e.g. EOS). The parameter toExclude
   * allows you to optionally specify which component tokens to remain under the user's
   * address in the vault. The rest will be transferred to the user.
   *
   * @param  setAddress        The address of the Set token
   * @param  quantity          Number of Sets a user wants to redeem in base units
   * @param  toExclude         Bitmask of component indexes to exclude from withdrawal
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash to then later look up
   */
  public async redeemAndWithdrawTo(
    setAddress: Address,
    quantity: BigNumber,
    toExclude: BigNumber,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.redeemAndWithdrawTo.sendTransactionAsync(
      setAddress,
      txSettings.from,
      quantity,
      toExclude,
      txSettings,
    );
  }

  /**
   * Asynchronously deposits tokens to the vault
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @param  quantity      Number of tokens a user wants to deposit into the vault in base units
   * @param  txOpts        The options for executing the transaction
   * @return               A transaction hash
   */
  public async deposit(tokenAddress: Address, quantity: BigNumber, txOpts?: Tx): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.deposit.sendTransactionAsync(
      tokenAddress,
      quantity,
      txSettings,
    );
  }

  /**
   * Asynchronously withdraw tokens from the vault
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @param  quantity      Number of tokens a user wants to withdraw from the vault in base units
   * @param  txOpts        The options for executing the transaction
   * @return               A transaction hash
   */
  public async withdraw(tokenAddress: Address, quantity: BigNumber, txOpts?: Tx): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.withdraw.sendTransactionAsync(
      tokenAddress,
      quantity,
      txSettings,
    );
  }

  /**
   * Asynchronously batch deposits tokens to the vault
   *
   * @param  tokenAddresses    Addresses of ERC20 tokens user wants to deposit into the vault
   * @param  quantities        Numbers of tokens a user wants to deposit into the vault in base units
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash
   */
  public async batchDeposit(tokenAddresses: Address[], quantities: BigNumber[], txOpts?: Tx): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.batchDeposit.sendTransactionAsync(
      tokenAddresses,
      quantities,
      txSettings,
    );
  }

  /**
   * Asynchronously batch withdraws tokens from the vault
   *
   * @param  tokenAddresses    Addresses of ERC20 tokens user wants to withdraw from the vault
   * @param  quantities        Numbers of tokens a user wants to withdraw from the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash
   */
  public async batchWithdraw(tokenAddresses: Address[], quantities: BigNumber[], txOpts?: Tx): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.batchWithdraw.sendTransactionAsync(
      tokenAddresses,
      quantities,
      txSettings,
    );
  }

  /**
   * Asynchronously gets the exchange address for a given exhange id
   *
   * @param  exchangeId Enum id of the exchange
   * @return            An exchange address
   */
  public async exchangeIds(exchangeId: number): Promise<Address> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const exchangeAddress = await coreInstance.exchangeIds.callAsync(exchangeId);

    return exchangeAddress;
  }

  /**
   * Asynchronously gets the transfer proxy address
   *
   * @return Transfer proxy address
   */
  public async transferProxy(): Promise<Address> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const transferProxyAddress = await coreInstance.transferProxy.callAsync();

    return transferProxyAddress;
  }

  /**
   * Asynchronously gets the vault address
   *
   * @return Vault address
   */
  public async vault(): Promise<Address> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const vaultAddress = await coreInstance.vault.callAsync();

    return vaultAddress;
  }

  /**
   * Fetch the addresses of SetTokens and RebalancingSetTokens created by the system
   * of contracts specified in SetProtcolConfig
   *
   * @return Array of SetToken and RebalancingSetToken addresses
   */
  public async setTokens(): Promise<Address[]> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const setAddresses = await coreInstance.setTokens.callAsync();

    return setAddresses;
  }

  /**
   * Fetch the current Operation State of the protocol
   *
   * @return Operation state of the protocol
   */
  public async operationState(): Promise<BigNumber> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const operationState = await coreInstance.operationState.callAsync();

    return operationState;
  }

  /**
   * Verifies that the provided Module is enabled
   *
   * @param  moduleAddress  Address of the module contract
   * @return                Whether the module contract is enabled
   */
  public async validModules(moduleAddress: Address): Promise<boolean> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const isValidModule = await coreInstance.validModules.callAsync(moduleAddress);

    return isValidModule;
  }

  /**
   * Verifies that the provided price library is enabled
   *
   * @param  priceLibraryAddress  Address of the price library contract
   * @return                Whether the price library contract is enabled
   */
  public async validPriceLibrary(priceLibraryAddress: Address): Promise<boolean> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const isValidPriceLibrary = await coreInstance.validPriceLibraries.callAsync(priceLibraryAddress);

    return isValidPriceLibrary;
  }

  /**
   * Verifies that the provided SetToken factory is enabled for creating a new SetToken
   *
   * @param  factoryAddress Address of the factory contract
   * @return                Whether the factory contract is enabled
   */
  public async validFactories(factoryAddress: Address): Promise<boolean> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const isValidFactoryAddress = await coreInstance.validFactories.callAsync(factoryAddress);

    return isValidFactoryAddress;
  }

  /**
   * Verifies that the provided SetToken or RebalancingSetToken address is enabled
   * for issuance and redemption
   *
   * @param  setAddress Address of the SetToken or RebalancingSetToken contract
   * @return            Whether the contract is enabled
   */
  public async validSets(setAddress: Address): Promise<boolean> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const isValidSetAddress = await coreInstance.validSets.callAsync(setAddress);

    return isValidSetAddress;
  }

  /**
   * Fetch the addresses of Modules enabled in the system.
   *
   * @return            A list of the enabled modules
   */
  public async modules(): Promise<Address[]> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const modules = await coreInstance.modules.callAsync();

    return modules;
  }

  /**
   * Fetch the addresses of Factories enabled in the system.
   *
   * @return            A list of the enabled Factories
   */
  public async factories(): Promise<Address[]> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const factories = await coreInstance.factories.callAsync();

    return factories;
  }

  /**
   * Fetch the addresses of Exchanges enabled in the system.
   *
   * @return            A list of the enabled Exchanges
   */
  public async exchanges(): Promise<Address[]> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const exchanges = await coreInstance.exchanges.callAsync();

    return exchanges;
  }

  /**
   * Fetch the addresses of PriceLibraries enabled in the system.
   *
   * @return            A list of the enabled PriceLibraries
   */
  public async priceLibraries(): Promise<Address[]> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const priceLibraries = await coreInstance.priceLibraries.callAsync();

    return priceLibraries;
  }
}
