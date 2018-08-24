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
import {
  Address,
  SignedIssuanceOrder,
  IssuanceOrder,
  TakerWalletOrder,
  SetProtocolUtils,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';

import { CoreAPI, SetTokenAPI, VaultAPI } from './api';
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
  public core: CoreAPI;
  public setToken: SetTokenAPI;
  public vault: VaultAPI;
  public setProtocolUtils: SetProtocolUtils;

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

    this.core = new CoreAPI(this.web3, coreAddress, transferProxyAddress, vaultAddress);
    this.setToken = new SetTokenAPI(this.web3);
    this.vault = new VaultAPI(this.web3, vaultAddress);

    this.setProtocolUtils = new SetProtocolUtils(this.web3);
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
  public async createSet(
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
  public async issue(
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
  public async redeem(
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
  public async deposit(
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
  public async withdraw(
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TxData,
  ): Promise<string> {
    return await this.core.withdraw(tokenAddresses, quantitiesInWei, txOpts);
  }

  /**
   * Creates a new Issuance Order including the signature
   *
   * @param  setAddress                Address of the Set token for issuance order
   * @param  quantity                  Number of Set tokens to create as part of issuance order
   * @param  requiredComponents        Addresses of required component tokens of Set
   * @param  requiredComponentAmounts  Amounts of each required component needed
   * @param  makerAddress              Address of person making the order
   * @param  makerToken                Address of token the issuer is paying in
   * @param  makerTokenAmount          Number of tokens being exchanged for aggregate order size
   * @param  expiration                Unix timestamp of expiration (in seconds)
   * @param  relayerAddress            Address of relayer of order
   * @param  relayerToken              Address of token paid to relayer
   * @param  makerRelayerFee           Number of token paid to relayer by maker
   * @param  takerRelayerFee           Number of token paid tp relayer by taker
   * @return                           A transaction hash
   */
  public async createOrder(
    setAddress: Address,
    quantity: BigNumber,
    requiredComponents: Address[],
    requiredComponentAmounts: BigNumber[],
    makerAddress: Address,
    makerToken: Address,
    makerTokenAmount: BigNumber,
    expiration: BigNumber,
    relayerAddress: Address,
    relayerToken: Address,
    makerRelayerFee: BigNumber,
    takerRelayerFee: BigNumber,
  ): Promise<SignedIssuanceOrder> {
    return await this.core.createOrder(
      setAddress,
      quantity,
      requiredComponents,
      requiredComponentAmounts,
      makerAddress,
      makerToken,
      makerTokenAmount,
      expiration,
      relayerAddress,
      relayerToken,
      makerRelayerFee,
      takerRelayerFee
    );
  }

  /**
   * Fills an Issuance Order
   *
   * @param  signedIssuanceOrder       Signed issuance order to fill
   * @param  signature                 Signature of the order
   * @param  quantityToFill            Number of Set to fill in this call
   * @param  orderData                 Bytes representation of orders used to fill issuance order
   * @param  txOpts                    The options for executing the transaction
   * @return                           A transaction hash
   */
  public async fillOrder(
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (ZeroExSignedFillOrder | TakerWalletOrder)[],
    txOpts?: TxData,
  ): Promise<string> {
    return await this.core.fillOrder(signedIssuanceOrder, quantityToFill, orders, txOpts);
  }

  /**
   * Cancels an Issuance Order
   *
   * @param  issuanceOrder             Issuance order to cancel
   * @param  quantityToCancel          Number of Set to cancel in this call
   * @param  txOpts                    The options for executing the transaction
   * @return                           A transaction hash
   */
  public async cancelOrder(
    issuanceOrder: IssuanceOrder,
    quantityToCancel: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    return await this.core.cancelOrder(issuanceOrder, quantityToCancel, txOpts);
  }

  /**
   * Gets balance of user's tokens in the vault
   *
   * @param  tokenAddress Address of the Set
   * @param  ownerAddress Address of the user
   * @return              The balance of the user's Set
   */
  public async getBalanceInVault(
    tokenAddress: Address,
    ownerAddress: Address,
  ): Promise<BigNumber> {
    return await this.vault.getBalanceInVault(tokenAddress, ownerAddress);
  }

  /**
   * Asynchronously gets the exchange address for a given exhange id
   *
   * @param  exchangeId Enum id of the exchange
   * @return            An exchange address
   */
  public async getExchangeAddress(exchangeId: number): Promise<Address> {
    return await this.core.getExchangeAddress(exchangeId);
  }

  /**
   * Asynchronously gets the transfer proxy address
   *
   * @return Transfer proxy address
   */
  public async getTransferProxyAddress(): Promise<Address> {
    return await this.core.getTransferProxyAddress();
  }

  /**
   * Asynchronously gets the vault address
   *
   * @return Vault address
   */
  public async getVaultAddress(): Promise<Address> {
    return await this.core.getVaultAddress();
  }

  /**
   * Asynchronously gets factory addresses
   *
   * @return Array of factory addresses
   */
  public async getFactories(): Promise<Address[]> {
    return await this.core.getFactories();
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
  public async getIsValidSet(setAddress: Address): Promise<boolean> {
    return await this.core.getIsValidSet(setAddress);
  }
}

export default SetProtocol;
