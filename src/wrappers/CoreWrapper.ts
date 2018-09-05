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
import * as _ from 'lodash';
import {
  SetProtocolUtils,
  SetProtocolTestUtils,
  Address,
  Bytes,
  IssuanceOrder,
  SignedIssuanceOrder,
  TakerWalletOrder,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';

import { ContractWrapper } from '.';
import { ZERO } from '../constants';
import { TxData } from '../types/common';
import { DetailedERC20Contract, SetTokenContract, VaultContract } from 'set-protocol-contracts';
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
  private setProtocolUtils: SetProtocolUtils;

  public coreAddress: Address;
  public transferProxyAddress: Address;
  public vaultAddress: Address;

  public constructor(
    web3: Web3,
    coreAddress: Address,
    transferProxyAddress: Address = undefined,
    vaultAddress: Address = undefined,
  ) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
    this.setProtocolUtils = new SetProtocolUtils(this.web3);

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
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.create.sendTransactionAsync(
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
   * @param  quantity       Number of Sets a user wants to issue in Wei
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up
   */
  public async issue(setAddress: Address, quantity: BigNumber, txOpts?: TxData): Promise<string> {
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
   * @param  quantity       Number of Sets a user wants to redeem in Wei
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up
   */
  public async redeem(setAddress: Address, quantity: BigNumber, txOpts?: TxData): Promise<string> {
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
   * @param  quantity          The number of tokens to redeem
   * @param  toExclude         Bitmask of component indexes to exclude from withdrawal
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash to then later look up
   */
  public async redeemAndWithdraw(
    setAddress: Address,
    quantity: BigNumber,
    toExclude: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.redeemAndWithdraw.sendTransactionAsync(
      setAddress,
      quantity,
      toExclude,
      txSettings,
    );
  }

  /**
   * Asynchronously deposits tokens to the vault
   *
   * @param  tokenAddress  Address of the ERC20 token
   * @param  quantity      Number of tokens a user wants to deposit into the vault
   * @param  txOpts        The options for executing the transaction
   * @return               A transaction hash
   */
  public async deposit(tokenAddress: Address, quantity: BigNumber, txOpts?: TxData): Promise<string> {
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
   * @param  quantity      Number of tokens a user wants to withdraw from the vault
   * @param  txOpts        The options for executing the transaction
   * @return               A transaction hash
   */
  public async withdraw(tokenAddress: Address, quantity: BigNumber, txOpts?: TxData): Promise<string> {
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
   * @param  quantitiesInWei   Numbers of tokens a user wants to deposit into the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash
   */
  public async batchDeposit(tokenAddresses: Address[], quantities: BigNumber[], txOpts?: TxData): Promise<string> {
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
   * @param  quantitiesInWei   Numbers of tokens a user wants to withdraw from the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash
   */
  public async batchWithdraw(tokenAddresses: Address[], quantities: BigNumber[], txOpts?: TxData): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    return await coreInstance.batchWithdraw.sendTransactionAsync(
      tokenAddresses,
      quantities,
      txSettings,
    );
  }

  /**
   * Fills an Issuance Order
   *
   * @param  signedIssuanceOrder       Signed issuance order to fill
   * @param  signature                 Signature of the order
   * @param  fillAmount                Number of Set to fill in this call
   * @param  orderData                 Bytes representation of orders used to fill issuance order
   * @param  txOpts                    The options for executing the transaction
   * @return                           A transaction hash
   */
  public async fillOrder(
    signedIssuanceOrder: SignedIssuanceOrder,
    fillAmount: BigNumber,
    orderData: string,
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const {
      setAddress,
      makerAddress,
      makerToken,
      relayerAddress,
      relayerToken,
      quantity,
      makerTokenAmount,
      expiration,
      makerRelayerFee,
      takerRelayerFee,
      requiredComponents,
      requiredComponentAmounts,
      salt,
      signature,
    } = signedIssuanceOrder;

    return await coreInstance.fillOrder.sendTransactionAsync(
      [setAddress, makerAddress, makerToken, relayerAddress, relayerToken],
      [quantity, makerTokenAmount, expiration, makerRelayerFee, takerRelayerFee, salt],
      requiredComponents,
      requiredComponentAmounts,
      fillAmount,
      signature.v,
      [signature.r, signature.s],
      orderData,
      txSettings,
    );
  }

  /**
   * Cancels an Issuance Order
   *
   * @param  issuanceOrder             Issuance order to cancel
   * @param  cancelAmount              Number of Set to cancel in this call
   * @param  txOpts                    The options for executing the transaction
   * @return                           A transaction hash
   */
  public async cancelOrder(issuanceOrder: IssuanceOrder, cancelAmount: BigNumber, txOpts?: TxData): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const {
      setAddress,
      makerAddress,
      makerToken,
      relayerAddress,
      relayerToken,
      quantity,
      makerTokenAmount,
      expiration,
      makerRelayerFee,
      takerRelayerFee,
      requiredComponents,
      requiredComponentAmounts,
      salt,
    } = issuanceOrder;

    return await coreInstance.cancelOrder.sendTransactionAsync(
      [setAddress, makerAddress, makerToken, relayerAddress, relayerToken],
      [quantity, makerTokenAmount, expiration, makerRelayerFee, takerRelayerFee, salt],
      requiredComponents,
      requiredComponentAmounts,
      cancelAmount,
      txSettings,
    );
  }

  /**
   * Asynchronously gets the exchange address for a given exhange id
   *
   * @param  exchangeId Enum id of the exchange
   * @return            An exchange address
   */
  public async getExchangeAddress(exchangeId: number): Promise<Address> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const exchangeAddress = await coreInstance.exchanges.callAsync(exchangeId);

    return exchangeAddress;
  }

  /**
   * Asynchronously gets the transfer proxy address
   *
   * @return Transfer proxy address
   */
  public async getTransferProxyAddress(): Promise<Address> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const transferProxyAddress = await coreInstance.transferProxy.callAsync();

    return transferProxyAddress;
  }

  /**
   * Asynchronously gets the vault address
   *
   * @return Vault address
   */
  public async getVaultAddress(): Promise<Address> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const vaultAddress = await coreInstance.vault.callAsync();

    return vaultAddress;
  }

  /**
   * Asynchronously gets factory addresses
   *
   * @return Array of factory addresses
   */
  public async getFactories(): Promise<Address[]> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const factoryAddresses = await coreInstance.factories.callAsync();

    return factoryAddresses;
  }

  /**
   * Fetch the addresses of SetTokens and RebalancingSetTokens created by the system
   * of contracts specified in SetProtcolConfig
   *
   * @return Array of SetToken and RebalancingSetToken addresses
   */
  public async getSetAddresses(): Promise<Address[]> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const setAddresses = await coreInstance.setTokens.callAsync();

    return setAddresses;
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
   * Asynchronously gets the quantity of the Issuance Order filled
   *
   * @param  orderHash  Bytes32 hash of the issuance order
   * @return            Quantity of Issuance Order filled
   */
  public async orderFills(orderHash: Bytes): Promise<BigNumber> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const orderFills = await coreInstance.orderFills.callAsync(orderHash);

    return orderFills;
  }

  /**
   * Asynchronously gets the quantity of the Issuance Order cancelled
   *
   * @param  orderHash  Bytes32 hash of the Issuance Order
   * @return            Quantity of Issuance Order cancelled
   */
  public async orderCancels(orderHash: Bytes): Promise<BigNumber> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const orderCancels = await coreInstance.orderCancels.callAsync(orderHash);

    return orderCancels;
  }
}
