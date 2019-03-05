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
import { Bytes, ExchangeIssuanceParams, SetProtocolUtils } from 'set-protocol-utils';

import { Assertions } from '../assertions';
import { PayableExchangeIssuanceWrapper, RebalancingSetTokenWrapper } from '../wrappers';
import { Address, KyberTrade, Tx, ZeroExSignedFillOrder } from '../types/common';
import { coreAPIErrors, exchangeIssuanceErrors } from '../errors';

/**
 * @title PayableExchangeIssuanceAPI
 * @author Set Protocol
 *
 * A library for issuing RebalancingSets using Ether.
 */
export class PayableExchangeIssuanceAPI {
  private web3: Web3;
  private assert: Assertions;
  private payableExchangeIssuance: PayableExchangeIssuanceWrapper;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private setProtocolUtils: SetProtocolUtils;
  private wrappedEther: Address;

  /**
   * Instantiates a new PayableExchangeIssuanceAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3                         The Web3.js Provider instance you would like the SetProtocol.js library
   *                                      to use for interacting with the Ethereum network
   * @param assertions                   An instance of the Assertion library
   * @param payableExchangeIssuanceAddress  The address of the PayableExchangeIssuanceWrapper Library
   * @param wrappedEtherAddress          Address of the deployed canonical wrapped ether contract
   */
  constructor(
    web3: Web3,
    assertions: Assertions,
    payableExchangeIssuanceAddress: Address,
    wrappedEtherAddress: Address,
  ) {
    this.web3 = web3;
    this.setProtocolUtils = new SetProtocolUtils(this.web3);
    this.assert = assertions;
    this.payableExchangeIssuance = new PayableExchangeIssuanceWrapper(web3, payableExchangeIssuanceAddress);
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(this.web3);
    this.wrappedEther = wrappedEtherAddress;
  }

  /**
   * Issues a Set to the transaction signer using Ether as payment.
   *
   * @param  rebalancingSetAddress    Address of the Rebalancing Set to issue
   * @param  exchangeIssuanceParams      Parameters required to facilitate an exchange issuance
   * @param  orders                   A list of signed 0x orders or kyber trades
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async issueRebalancingSetWithEtherAsync(
    rebalancingSetAddress: Address,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx
  ): Promise<string> {
    await this.assertIssueRebalancingSetWithEtherAsync(
      rebalancingSetAddress,
      exchangeIssuanceParams,
      orders,
      txOpts,
    );
    await this.assertExchangeIssuanceParams(rebalancingSetAddress, exchangeIssuanceParams);

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.payableExchangeIssuance.issueRebalancingSetWithEther(
      rebalancingSetAddress,
      exchangeIssuanceParams,
      orderData,
      txOpts,
    );
  }

  /* ============ Private Assertions ============ */

  private async assertIssueRebalancingSetWithEtherAsync(
    rebalancingSetAddress: Address,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx,
  ) {
    const {
      setAddress,
      sendTokens,
    } = exchangeIssuanceParams;

    // TODO: Update this assertion to properly validate all sent tokens
    const paymentToken = sendTokens[0];

    this.assert.common.isNotUndefined(txOpts.value, exchangeIssuanceErrors.ETHER_VALUE_NOT_UNDEFINED());
    this.assert.schema.isValidAddress('txOpts.from', txOpts.from);
    this.assert.schema.isValidAddress('rebalancingSetAddress', rebalancingSetAddress);
    this.assert.common.isNotEmptyArray(orders, coreAPIErrors.EMPTY_ARRAY('orders'));

    const baseSetAddress = await this.rebalancingSetToken.currentSet(rebalancingSetAddress);

    // Assert the set address is the rebalancing set address's current set
    this.assert.common.isEqualAddress(
      setAddress,
      baseSetAddress,
      exchangeIssuanceErrors.ISSUING_SET_NOT_BASE_SET(setAddress, baseSetAddress)
    );

    // Assert payment token is wrapped ether
    this.assert.common.isEqualAddress(
      paymentToken,
      this.wrappedEther,
      exchangeIssuanceErrors.PAYMENT_TOKEN_NOT_WETH(paymentToken, this.wrappedEther)
    );

    await this.assert.exchange.assertExchangeIssuanceOrdersValidity(
      exchangeIssuanceParams,
      orders,
    );
  }

  private async assertExchangeIssuanceParams(
    rebalancingSetAddress: Address,
    exchangeIssuanceParams: ExchangeIssuanceParams,
  ) {
    const {
      setAddress,
      sendTokens,
      sendTokenAmounts,
      quantity,
      receiveTokens,
      receiveTokenAmounts,
    } = exchangeIssuanceParams;

    // TODO: Update this assertion to properly validate all sent tokens
    const paymentToken = sendTokens[0];
    const paymentTokenAmount = sendTokenAmounts[0];

    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.schema.isValidAddress('paymentToken', paymentToken);
    this.assert.common.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
    this.assert.common.greaterThanZero(
      paymentTokenAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(paymentTokenAmount)
    );
    this.assert.common.isEqualLength(
      receiveTokens,
      receiveTokenAmounts,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('receiveTokens', 'receiveTokenAmounts'),
    );
    await this.assert.exchange.assertRequiredComponentsAndAmounts(
      receiveTokens,
      receiveTokenAmounts,
      setAddress,
    );

    await this.assert.setToken.isMultipleOfNaturalUnit(
      setAddress,
      quantity,
      `Quantity of Exchange issue Params`,
    );
  }
}
