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
  Address,
  Bytes,
  ECSig,
  IssuanceOrder,
  SetProtocolUtils,
  SignedIssuanceOrder,
  TakerWalletOrder,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';
import { SetTokenContract, StandardTokenMockContract } from 'set-protocol-contracts';

import { Assertions } from '../assertions';
import { coreAPIErrors } from '../errors';
import { CoreWrapper } from '../wrappers';
import { BigNumber, generateFutureTimestamp } from '../util';
import { TxData } from '../types/common';

export {
  IssuanceOrder,
  SignedIssuanceOrder,
  TakerWalletOrder,
  ZeroExSignedFillOrder
};

/**
 * @title OrderAPI
 * @author Set Protocol
 *
 * A library for handling IssuanceOrders for Sets
 */
export class OrderAPI {
  private web3: Web3;
  private assert: Assertions;
  public core: CoreWrapper;
  public setProtocolUtils: SetProtocolUtils;

  /**
   * Instantiates a new OrderAPI instance that contains methods for creating, filling, and cancelling issuance orders.
   *
   * @param web3    The Web3.js Provider instance you would like the SetProtocol.js library
   *                to use for interacting with the Ethereum network.
   * @param core    The address of the Set Core contract
   */
  constructor(web3: Web3 = undefined, core: CoreWrapper = undefined) {
    this.web3 = web3;
    this.core = core;
    this.setProtocolUtils = new SetProtocolUtils(this.web3);
    this.assert = new Assertions(this.web3);
  }

  /**
   * Generates a pseudo-random 256-bit salt.
   * The salt can be included in an order, ensuring that the order generates a unique orderHash
   * and will not collide with other outstanding orders that are identical in all other parameters.
   *
   * @return  A pseudo-random 256-bit number that can be used as a salt.
   */
  public generateSalt(): BigNumber {
    return SetProtocolUtils.generateSalt();
  }

  /**
   * Generates a timestamp represented as seconds since unix epoch.
   * The timestamp is intended to be used to generate the expiration of an issuance order
   *
   * @param seconds   Seconds from the present time
   * @return          Unix timestamp (in seconds since unix epoch)
   */
  public generateExpirationTimestamp(seconds: number): BigNumber {
    return generateFutureTimestamp(seconds);
  }

  /**
   * Checks whether a signature produced for an issuance order is valid. The signer
   * A signature is valid only if the issuance order is signed by the maker
   * The function throws upon receiving an invalid signature.
   *
   * @param  issuanceOrder    An object conforming to the IssuanceOrder interface
   * @param  signature        The EC Signature to check
   * @return                  Whether the recovered signature matches the data hash
   */
  public async isValidSignatureOrThrowAsync(issuanceOrder: IssuanceOrder, signature: ECSig): Promise<boolean> {
    const orderData = SetProtocolUtils.hashOrderHex(issuanceOrder);

    return await this.assert.core.isValidSignature(
      orderData,
      issuanceOrder.makerAddress,
      signature,
      coreAPIErrors.SIGNATURE_MISMATCH()
    );
  }

  /**
   * Generates a ECSig from an issuance order. The function first generates an order hash.
   * Then it signs it using the passed in transaction options. If none, it will assume
   * the signer is the first account
   *
   * @param issuanceOrder    Issuance Order
   * @return                 EC Signature
   */
  public async signOrderAsync(issuanceOrder: IssuanceOrder, txOpts?: TxData): Promise<ECSig> {
    const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);

    return await this.setProtocolUtils.signMessage(orderHash, txOpts.from);
  }

  /**
   * Given an issuance order, check that the signature is valid, order has not expired,
   * and
   *
   * @param issuanceOrder    Signed Issuance Order to be validated
   * @param fillQuantity     Fill quantity to check if fillable
   */
  public async validateOrderFillableOrThrowAsync(signedIssuanceOrder: SignedIssuanceOrder, fillQuantity: BigNumber) {
    await this.assert.order.isIssuanceOrderFillable(this.core, signedIssuanceOrder, fillQuantity);
  }

  /**
   * Creates a new signed Issuance Order including the signature
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
   * @param  salt                      Salt
   * @return                           A transaction hash
   */
  public async createSignedOrderAsync(
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
    salt: BigNumber = SetProtocolUtils.generateSalt(),
  ): Promise<SignedIssuanceOrder> {
    await this.assertCreateOrder(
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
      takerRelayerFee,
    );

    const order: IssuanceOrder = {
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
    };
    const orderHash = SetProtocolUtils.hashOrderHex(order);

    const signature = await this.setProtocolUtils.signMessage(orderHash, makerAddress);
    return { ...order, signature } as SignedIssuanceOrder;
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
  public async fillOrderAsync(
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (ZeroExSignedFillOrder | TakerWalletOrder)[],
    txOpts?: TxData,
  ): Promise<string> {
    await this.assertFillOrder(txOpts.from, signedIssuanceOrder, quantityToFill, orders);

    const orderData = await this.setProtocolUtils.generateSerializedOrders(
      signedIssuanceOrder.makerToken,
      signedIssuanceOrder.makerTokenAmount,
      orders
    );

    return await this.core.fillOrder(signedIssuanceOrder, quantityToFill, orderData, txOpts);
  }

  /**
   * Cancels an Issuance Order
   *
   * @param  issuanceOrder             Issuance order to cancel
   * @param  quantityToCancel          Number of Set to cancel in this call
   * @param  txOpts                    The options for executing the transaction
   * @return                           A transaction hash
   */
  public async cancelOrderAsync(
    issuanceOrder: IssuanceOrder,
    quantityToCancel: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    await this.assertCancelOrder(issuanceOrder, quantityToCancel);

    return await this.core.cancelOrder(issuanceOrder, quantityToCancel, txOpts);
  }

  /* ============ Private Assertions ============ */

  private async assertCreateOrder(
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
  ) {
    const issuanceOrder = {
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
    } as IssuanceOrder;
    await this.commonIssuanceOrderAssertions(issuanceOrder);
  }

  private async assertFillOrder(
    userAddress: Address,
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (ZeroExSignedFillOrder | TakerWalletOrder)[],
  ) {
    const { signature, ...issuanceOrder } = signedIssuanceOrder;
    await this.commonIssuanceOrderAssertions(issuanceOrder);

    this.assert.common.greaterThanZero(quantityToFill, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityToFill));
    this.assert.common.isNotEmptyArray(orders, coreAPIErrors.EMPTY_ARRAY('orders'));

    await this.assert.core.isValidSignature(
      SetProtocolUtils.hashOrderHex(issuanceOrder),
      issuanceOrder.makerAddress,
      signature,
      coreAPIErrors.SIGNATURE_MISMATCH()
    );
  }

  private async assertCancelOrder(issuanceOrder: IssuanceOrder, quantityToCancel: BigNumber) {
    await this.commonIssuanceOrderAssertions(issuanceOrder);

    this.assert.common.greaterThanZero(quantityToCancel, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityToCancel));
  }

  private async commonIssuanceOrderAssertions(issuanceOrder: IssuanceOrder) {
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

    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.schema.isValidAddress('makerAddress', makerAddress);
    this.assert.schema.isValidAddress('relayerAddress', relayerAddress);
    this.assert.schema.isValidAddress('relayerToken', relayerToken);
    this.assert.common.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
    this.assert.common.isEqualLength(
      requiredComponents,
      requiredComponentAmounts,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('requiredComponents', 'requiredComponentAmounts'),
    );

    await Promise.all(
      requiredComponents.map(async (tokenAddress, i) => {
        this.assert.common.isValidString(tokenAddress, coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'));
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

        const token = await StandardTokenMockContract.at(tokenAddress, this.web3, {});
        await this.assert.erc20.implementsERC20(token);

        this.assert.common.greaterThanZero(
          requiredComponentAmounts[i],
          coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(requiredComponentAmounts[i]),
        );
      }),
    );

    const makerTokenContract = await StandardTokenMockContract.at(makerToken, this.web3, {});
    await this.assert.erc20.implementsERC20(makerTokenContract);
    this.assert.common.greaterThanZero(makerTokenAmount, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(makerTokenAmount));

    const relayerTokenContract = await StandardTokenMockContract.at(relayerToken, this.web3, {});
    await this.assert.erc20.implementsERC20(relayerTokenContract);

    this.assert.common.isValidExpiration(expiration, coreAPIErrors.EXPIRATION_PASSED());
  }
}
