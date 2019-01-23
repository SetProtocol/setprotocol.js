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
import { SetProtocolUtils, SetProtocolTestUtils } from 'set-protocol-utils';

import { ContractWrapper } from '.';
import { ZERO } from '../constants';
import { Address, Bytes, IssuanceOrder, SignedIssuanceOrder, Tx } from '../types/common';
import { ERC20DetailedContract, SetTokenContract } from 'set-protocol-contracts';
import { BigNumber, generateTxOpts } from '../util';

/**
 * @title IssuanceOrderModuleWrapper
 * @author Set Protocol
 *
 * The Core API handles all functions on the Core SetProtocol smart contract.
 *
 */
export class IssuanceOrderModuleWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;
  private setProtocolUtils: SetProtocolUtils;

  public issuanceOrderModuleAddress: Address;

  public constructor(
    web3: Web3,
    issuanceOrderModule: Address,
  ) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
    this.setProtocolUtils = new SetProtocolUtils(this.web3);

    this.issuanceOrderModuleAddress = issuanceOrderModule;
  }

  /**
   * Fills an Issuance Order
   *
   * @param  signedIssuanceOrder       Signed issuance order to fill
   * @param  signature                 Signature of the order
   * @param  fillAmount                Number of Sets to fill in this call in base units
   * @param  orderData                 Bytes representation of orders used to fill issuance order
   * @param  txOpts                    The options for executing the transaction
   * @return                           A transaction hash
   */
  public async fillOrder(
    signedIssuanceOrder: SignedIssuanceOrder,
    fillAmount: BigNumber,
    orderData: string,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const issuanceOrderModuleInstance = await this.contracts.loadIssuanceOrderModuleAsync(
      this.issuanceOrderModuleAddress
    );

    const {signature, ...issuanceOrder} = signedIssuanceOrder;
    const bytesSignature = this.setProtocolUtils.convertSigToHex(signature);

    return await issuanceOrderModuleInstance.fillOrder.sendTransactionAsync(
      issuanceOrder,
      fillAmount,
      bytesSignature,
      orderData,
      txSettings,
    );
  }

  /**
   * Cancels an Issuance Order
   *
   * @param  issuanceOrder             Issuance order to cancel
   * @param  cancelAmount              Number of Sets to cancel in this call in base units
   * @param  txOpts                    The options for executing the transaction
   * @return                           A transaction hash
   */
  public async cancelOrder(issuanceOrder: IssuanceOrder, cancelAmount: BigNumber, txOpts?: Tx): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const issuanceOrderModuleInstance = await this.contracts.loadIssuanceOrderModuleAsync(
      this.issuanceOrderModuleAddress
    );

    return await issuanceOrderModuleInstance.cancelOrder.sendTransactionAsync(
      issuanceOrder,
      cancelAmount,
      txSettings,
    );
  }

  /**
   * Asynchronously gets the quantity of the Issuance Order filled
   *
   * @param  orderHash  Bytes32 hash of the issuance order
   * @return            Quantity of Issuance Order filled
   */
  public async orderFills(orderHash: Bytes): Promise<BigNumber> {
    const issuanceOrderModuleInstance = await this.contracts.loadIssuanceOrderModuleAsync(
      this.issuanceOrderModuleAddress
    );
    const orderFills = await issuanceOrderModuleInstance.orderFills.callAsync(orderHash);

    return orderFills;
  }

  /**
   * Asynchronously gets the quantity of the Issuance Order cancelled
   *
   * @param  orderHash  Bytes32 hash of the Issuance Order
   * @return            Quantity of Issuance Order cancelled
   */
  public async orderCancels(orderHash: Bytes): Promise<BigNumber> {
    const issuanceOrderModuleInstance = await this.contracts.loadIssuanceOrderModuleAsync(
      this.issuanceOrderModuleAddress
    );
    const orderCancels = await issuanceOrderModuleInstance.orderCancels.callAsync(orderHash);

    return orderCancels;
  }
}
