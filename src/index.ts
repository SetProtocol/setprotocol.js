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
} from 'set-protocol-utils';
import { Order as ZeroExOrder } from '@0xproject/types';

import { CoreAPI, SetTokenAPI, VaultAPI } from './api';
import { BigNumber } from './util';
import { TxData } from './types/common';

interface SetProtocol {
  createSet(
    factoryAddress: Address,
    components: Address[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
    txOpts?: TxData,
  ): Promise<string>;
  issueSet(
    setAddress: Address,
    quantityInWei: BigNumber,
    txOpts?: TxData,
  ): Promise<string>;
  redeemSet(
    setAddress: Address,
    quantityInWei: BigNumber,
    withdraw: boolean,
    tokensToExclude: Address[],
    txOpts?: TxData,
  ): Promise<string>;
  deposit(
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TxData,
  ): Promise<string>;
  withdraw(
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TxData,
  ): Promise<string>;
  createOrder(
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
  ): Promise<SignedIssuanceOrder>;
  fillOrder(
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (ZeroExOrder | TakerWalletOrder)[],
    makerTokenAddress: Address,
    makerTokenAmount: BigNumber,
    txOpts?: TxData,
  ): Promise<string>;
  cancelOrder(
    issuanceOrder: IssuanceOrder,
    quantityToCancel: BigNumber,
    txOpts?: TxData,
  ): Promise<string>;
  getVaultBalance(
    tokenAddress: Address,
    ownerAddress: Address,
  ): Promise<BigNumber>;
  getExchangeAddress(exchangeId: number): Promise<Address>;
  getTransferProxyAddress(): Promise<Address>;
  getVaultAddress(): Promise<Address>;
  getFactories(): Promise<Address[]>;
  getSetAddresses(): Promise<Address[]>;
  getIsValidFactory(factoryAddress: Address): Promise<boolean>;
  getIsValidSet(setAddress: Address): Promise<boolean>;
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
}

SetProtocol.prototype.createSet = async function(...args: any[]) {
  return await this.core.createSet(...args);
};
SetProtocol.prototype.issueSet = async function(...args: any[]) {
  return await this.core.issueSet(...args);
};
SetProtocol.prototype.redeemSet = async function(...args: any[]) {
  return await this.core.redeemSet(...args);
};
SetProtocol.prototype.withdraw = async function(...args: any[]) {
  return await this.core.withdraw(...args);
};
SetProtocol.prototype.deposit = async function(...args: any[]) {
  return await this.core.deposit(...args);
};
SetProtocol.prototype.createOrder = async function(...args: any[]) {
  return await this.core.createOrder(...args);
};
SetProtocol.prototype.fillOrder = async function(...args: any[]) {
  return await this.core.fillOrder(...args);
};
SetProtocol.prototype.cancelOrder = async function(...args: any[]) {
  return await this.core.cancelOrder(...args);
};
SetProtocol.prototype.getExchangeAddress = async function(...args: any[]) {
  return await this.core.getExchangeAddress(...args);
};
SetProtocol.prototype.getTransferProxyAddress = async function() {
  return await this.core.getTransferProxyAddress();
};
SetProtocol.prototype.getVaultAddress = async function() {
  return await this.core.getVaultAddress();
};
SetProtocol.prototype.getFactories = async function() {
  return await this.core.getFactories();
};
SetProtocol.prototype.getSetAddresses = async function() {
  return await this.core.getSetAddresses();
};
SetProtocol.prototype.getIsValidFactory = async function(...args: any[]) {
  return await this.core.getIsValidFactory(...args);
};
SetProtocol.prototype.getIsValidSet = async function(...args: any[]) {
  return await this.core.getIsValidSet(...args);
};
SetProtocol.prototype.getBalanceInVault = async function(...args: any[]) {
  return await this.vault.getBalanceInVault(...args);
};

export default SetProtocol;
