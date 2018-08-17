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

SetProtocol.prototype.createSet = this.core.create;

SetProtocol.prototype.issueSet = this.core.issue;

SetProtocol.prototype.redeemSet = async function(
  setAddress: Address,
  quantityInWei: BigNumber,
  withdraw: boolean,
  tokensToExclude?: Address[],
  txOpts?: TxData
) {
 if (withdraw && tokensToExclude) {
   return await this.core.redeemAndWithdraw(
     setAddress,
     quantityInWei,
     tokensToExclude,
     txOpts,
   );
 } else {
   return await this.core.redeem(
     setAddress,
     quantityInWei,
     txOpts,
   );
 }
};

SetProtocol.prototype.withdraw = async function(
  tokenAddresses: Address[],
  quantitiesInWei: BigNumber[],
  txOpts?: TxData,
) {
  if (tokenAddresses.length === 1) {
    return await this.core.withdraw(
      tokenAddresses[0],
      quantitiesInWei[0],
      txOpts,
    );
  } else {
    return await this.core.batchWithdraw(
      tokenAddresses,
      quantitiesInWei,
      txOpts,
    );
  }
};

SetProtocol.prototype.deposit = async function(
  tokenAddresses: Address[],
  quantitiesInWei: BigNumber[],
  txOpts?: TxData,
) {
  if (tokenAddresses.length === 1) {
    return await this.core.deposit(
      tokenAddresses[0],
      quantitiesInWei[0],
      txOpts,
    );
  } else {
    return await this.core.batchDeposit(
      tokenAddresses,
      quantitiesInWei,
      txOpts,
    );
  }
};

SetProtocol.prototype.createOrder = this.core.createOrder;

SetProtocol.prototype.fillOrder = async function(
  signedIssuanceOrder: SignedIssuanceOrder,
  quantityToFill: BigNumber,
  orders: (ZeroExOrder | TakerWalletOrder)[],
  makerTokenAddress: Address,
  makerTokenAmount: BigNumber,
  txOpts?: TxData,
) {
  const orderData = await this.setProtocolUtils.generateSerializedOrders(
    makerTokenAddress,
    makerTokenAmount,
    orders,
  );

  return await this.core.fillOrder(
    signedIssuanceOrder,
    quantityToFill,
    orderData,
    txOpts,
  );
};

SetProtocol.prototype.cancelOrder = this.core.cancelOrder;

export default SetProtocol;
