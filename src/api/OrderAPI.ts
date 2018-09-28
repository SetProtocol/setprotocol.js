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
import { Assertions } from '../assertions';
import { coreAPIErrors } from '../errors';
import { CoreWrapper, ERC20Wrapper, SetTokenWrapper, VaultWrapper } from '../wrappers';
import { NULL_ADDRESS, ZERO } from '../constants';
import { BigNumber, generateFutureTimestamp,  } from '../util';
import { TxData, RequiredComponents } from '../types/common';


/**
 * @title OrderAPI
 * @author Set Protocol
 *
 * A library for handling issuance orders for Sets
 */
export class OrderAPI {
  private web3: Web3;
  private assert: Assertions;
  public core: CoreWrapper;
  public setToken: SetTokenWrapper;
  public erc20: ERC20Wrapper;
  public vault: VaultWrapper;
  public setProtocolUtils: SetProtocolUtils;

  /**
   * Instantiates a new OrderAPI instance that contains methods for creating, filling, and cancelling issuance orders
   *
   * @param web3        Web3.js Provider instance you would like the SetProtocol.js library
   *                    to use for interacting with the Ethereum network
   * @param core        An instance of CoreWrapper to interact with the deployed Core contract
   * @param assertions  An instance of the Assertion library
   */
  constructor(web3: Web3, core: CoreWrapper, assertions: Assertions) {
    this.web3 = web3;
    this.core = core;
    this.setProtocolUtils = new SetProtocolUtils(this.web3);
    this.erc20 = new ERC20Wrapper(this.web3);
    this.setToken = new SetTokenWrapper(this.web3);
    this.vault = new VaultWrapper(this.web3, this.core.vaultAddress);
    this.assert = assertions;
  }

  /**
   * Generates a 256-bit salt that can be included in an order, to ensure that the order generates
   * a unique orderHash and will not collide with other outstanding orders that are identical
   *
   * @return    256-bit number that can be used as a salt
   */
  public generateSalt(): BigNumber {
    return SetProtocolUtils.generateSalt();
  }

  /**
   * Generates a timestamp represented as seconds since unix epoch. The timestamp is intended to be
   * used to generate the expiration of an issuance order
   *
   * @param  seconds    Seconds from the present time
   * @return            Unix timestamp (in seconds since unix epoch)
   */
  public generateExpirationTimestamp(seconds: number): BigNumber {
    return generateFutureTimestamp(seconds);
  }

  /**
   * Checks whether a signature produced for an issuance order is valid. A signature is valid only
   * if the issuance order is signed by the maker. The function throws upon receiving an invalid signature
   *
   * @param  issuanceOrder         Object conforming to the IssuanceOrder interface
   * @param  signature             Object conforming to ECSignature containing elliptic curve signature components
   * @return                       Whether the recovered signature matches the data hash
   */
  public async isValidSignatureOrThrowAsync(
    issuanceOrder: IssuanceOrder,
    signature: ECSig,
  ): Promise<boolean> {
    const orderData = SetProtocolUtils.hashOrderHex(issuanceOrder);

    return await this.assert.core.isValidSignature(
      orderData,
      issuanceOrder.makerAddress,
      signature,
      true,
    );
  }

  /**
   * Generates a ECSig from an IssuanceOrder objects. It signs the user using the signer in the transaction options.
   * If none is provided, it will use the first account from the provider
   *
   * @param  issuanceOrder         Issuance Order
   * @param  txOpts                Transaction options object conforming to TxData with signer, gas, and gasPrice data
   * @return                       Object conforming to ECSignature containing elliptic curve signature components
   */
  public async signOrderAsync(
    issuanceOrder: IssuanceOrder,
    txOpts: TxData
  ): Promise<ECSig> {
    this.assert.schema.isValidAddress('txOpts.from', txOpts.from);
    const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);

    return await this.setProtocolUtils.signMessage(orderHash, txOpts.from, this.requiresSignaturePrefix());
  }

  /**
   * Validates an IssuanceOrder object's signature, expiration, and fill amount. Developers should call this method
   * frequently to prune order books and ensure the order has not already been filled or cancelled
   *
   * @param  signedIssuanceOrder    Object conforming to SignedIssuanceOrder interface to be validated
   * @param  fillQuantity           Fill quantity to check if fillable
   */
  public async validateOrderFillableOrThrowAsync(signedIssuanceOrder: SignedIssuanceOrder, fillQuantity: BigNumber) {
    await this.assert.order.isIssuanceOrderFillable(signedIssuanceOrder, fillQuantity);
  }

  /**
   * Calculates the requiredComponents and requiredComponentAmounts that a maker requires as input
   * into an issuance order. Developers can treat this as a convenience function.
   *
   * @param  setAddress                  Address of the Set token for issuance order
   * @param  makerAddress                Address of user making the issuance order
   * @param  quantity                    Amount of the Set token to create as part of issuance order
   * @return                             Object confirming to the RequiredComponents interface
   */
  public async calculateRequiredComponentsAndUnitsAsync(
    setAddress: Address,
    makerAddress: Address,
    quantity: BigNumber
  ): Promise<RequiredComponents> {
    const components = await this.setToken.getComponents(setAddress);
    const componentUnits = await this.setToken.getUnits(setAddress);
    const naturalUnit = await this.setToken.naturalUnit(setAddress);
    const totalUnitsNeeded = _.map(componentUnits, componentUnit => componentUnit.mul(quantity).div(naturalUnit));

    const requiredComponents: Address[] = [];
    const requiredUnits: BigNumber[] = [];

    // Gather how many components are owned by the user in balance/vault
    await Promise.all(
      components.map(async (componentAddress, index) => {
        const walletBalance = await this.erc20.balanceOf(componentAddress, makerAddress);
        const vaultBalance = await this.vault.getBalanceInVault(componentAddress, makerAddress);
        const userTokenbalance = walletBalance.add(vaultBalance);

        const currentUnitsNeeded = totalUnitsNeeded[index];
        const missingUnits = currentUnitsNeeded.minus(userTokenbalance);

        if (missingUnits.gt(ZERO)) {
          requiredComponents.push(componentAddress);
          requiredUnits.push(missingUnits);
        }
      }),
    );

    return {
      components: requiredComponents,
      units: requiredUnits,
    };
  }

  /**
   * Creates a new issuance order with a valid signature denoting the user's intent to exchange some maker token for
   * a Set token. Suggest using a popular trading pair as the maker token such as WETH or Dai in order to take
   * advantage of external liquidity sources
   *
   * @param  setAddress                  Address of the Set token for issuance order
   * @param  quantity                    Amount of the Set token to create as part of issuance order
   * @param  requiredComponents          Addresses of required component tokens of the Set
   * @param  requiredComponentAmounts    Amounts of each required component needed
   * @param  makerAddress                Address of user making the issuance order
   * @param  makerToken                  Address of token the issuance order maker is offering for the transaction
   * @param  makerTokenAmount            Amount of tokens maker offers for aggergate order size
   * @param  expiration                  Unix timestamp of expiration in seconds
   * @param  relayerAddress              Address of relayer of order
   * @param  relayerToken                Address of token paid to relayer as a fee
   * @param  makerRelayerFee             Amount of relayer token paid to relayer by maker
   * @param  takerRelayerFee             Amount of relayer token paid to relayer by taker
   * @param  salt                        Optional salt to include in signing
   * @return                             Object conforming to SignedIssuanceOrder with valid signature
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

    await this.assert.order.isValidIssuanceOrder(order);
    const orderHash = SetProtocolUtils.hashOrderHex(order);

    const signature = await this.setProtocolUtils.signMessage(orderHash, makerAddress, this.requiresSignaturePrefix());
    return { ...order, signature } as SignedIssuanceOrder;
  }

  /**
   * Fills an issuance order on behalf of the taker. The taker should specifiy the fill amount and the liquidity
   * sources, either other exchange orders that can be exchanged using the specified maker token in the issuance order,
   * or from the taker's own wallet
   *
   * @param  signedIssuanceOrder    Object confomring to SignedIssuanceOrder to fill
   * @param  quantity               Amount of Set to fill in this call
   * @param  orders                 Array of order objects conforming to (TakerWalletOrder | ZeroExSignedFillOrder) type
   * @param  txOpts                 Transaction options object conforming to TxData with signer, gas, and gasPrice data
   * @return                        Transaction hash
   */
  public async fillOrderAsync(
    signedIssuanceOrder: SignedIssuanceOrder,
    quantity: BigNumber,
    orders: (TakerWalletOrder | ZeroExSignedFillOrder)[],
    txOpts: TxData,
  ): Promise<string> {
    await this.assertFillOrder(txOpts.from, signedIssuanceOrder, quantity, orders);

    const orderData = await this.setProtocolUtils.generateSerializedOrders(
      signedIssuanceOrder.makerToken,
      signedIssuanceOrder.makerTokenAmount,
      orders
    );

    return await this.core.fillOrder(signedIssuanceOrder, quantity, orderData, txOpts);
  }

  /**
   * Cancels an issuance order on behalf of the maker. After successfully mining this transaction, a taker can only
   * fill up to an issuance order's quantity minus the quantity
   *
   * @param  issuanceOrder    Object conforming to IssuanceOrder to cancel
   * @param  quantity         Amount of the issuance order's quantity to cancel
   * @param  txOpts           Transaction options object conforming to TxData with signer, gas, and gasPrice data
   * @return                  Transaction hash
   */
  public async cancelOrderAsync(
    issuanceOrder: IssuanceOrder,
    quantity: BigNumber,
    txOpts: TxData,
  ): Promise<string> {
    await this.assertCancelOrder(txOpts.from, issuanceOrder, quantity);

    return await this.core.cancelOrder(issuanceOrder, quantity, txOpts);
  }

  /**
   * Fetches the quantity of the issuance order that has already been filled
   *
   * @param  issuanceOrder    Object conforming to the IssuanceOrder interface
   * @return                  Filled amount of issuance order
   */
  public async getOrderFillsAsync(issuanceOrder: IssuanceOrder): Promise<BigNumber> {
    const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);

    return await this.core.orderFills(orderHash);
  }

  /**
   * Fetches the quantity of the issuance order that has been cancelled
   *
   * @param  issuanceOrder    Object conforming to the IssuanceOrder interface
   * @return                  Cancelled amount of the issuance order
   */
  public async getOrderCancelledAsync(issuanceOrder: IssuanceOrder): Promise<BigNumber> {
    const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);

    return await this.core.orderCancels(orderHash);
  }

  /* ============ Private Helpers =============== */

  private requiresSignaturePrefix(): boolean {
    return this.web3.currentProvider.constructor.name === 'MetamaskInpageProvider';
  }

  /* ============ Private Assertions ============ */

  private async assertFillOrder(
    transactionCaller: Address,
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (TakerWalletOrder | ZeroExSignedFillOrder)[],
  ) {
    const { signature, ...issuanceOrder } = signedIssuanceOrder;
    await this.assert.order.isValidIssuanceOrder(issuanceOrder);

    this.assert.schema.isValidAddress('txOpts.from', transactionCaller);
    this.assert.common.greaterThanZero(quantityToFill, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityToFill));
    this.assert.common.isNotEmptyArray(orders, coreAPIErrors.EMPTY_ARRAY('orders'));

    await this.assert.order.isIssuanceOrderFillable(
      signedIssuanceOrder,
      quantityToFill,
    );

    await this.assert.order.assertLiquidityValidity(
      transactionCaller,
      signedIssuanceOrder,
      quantityToFill,
      orders,
    );
  }

  private async assertCancelOrder(
    transactionCaller: Address,
    issuanceOrder: IssuanceOrder,
    quantityToCancel: BigNumber
  ) {
    await this.assert.order.isValidIssuanceOrder(issuanceOrder);

    this.assert.schema.isValidAddress('txOpts.from', transactionCaller);
    this.assert.common.greaterThanZero(quantityToCancel, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityToCancel));
  }
}
