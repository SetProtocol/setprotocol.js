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
import { Bytes, ExchangeIssueParams, SetProtocolUtils } from 'set-protocol-utils';

import { Assertions } from '../assertions';
import { PayableExchangeIssueWrapper, RebalancingSetTokenWrapper } from '../wrappers';
import { Address, KyberTrade, Tx, ZeroExSignedFillOrder } from '../types/common';
import { coreAPIErrors, exchangeIssueErrors } from '../errors';

/**
 * @title PayableExchangeIssueAPI
 * @author Set Protocol
 *
 * A library for issuing RebalancingSets using Ether.
 */
export class PayableExchangeIssueAPI {
  private web3: Web3;
  private assert: Assertions;
  private payableExchangeIssue: PayableExchangeIssueWrapper;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private setProtocolUtils: SetProtocolUtils;
  private wrappedEther: Address;

  /**
   * Instantiates a new PayableExchangeIssueAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3                         The Web3.js Provider instance you would like the SetProtocol.js library
   *                                      to use for interacting with the Ethereum network
   * @param assertions                   An instance of the Assertion library
   * @param payableExchangeIssueAddress  The address of the PayableExchangeIssueWrapper Library
   * @param wrappedEtherAddress          Address of the deployed canonical wrapped ether contract
   */
  constructor(
    web3: Web3,
    assertions: Assertions,
    payableExchangeIssueAddress: Address,
    wrappedEtherAddress: Address,
  ) {
    this.web3 = web3;
    this.setProtocolUtils = new SetProtocolUtils(this.web3);
    this.assert = assertions;
    this.payableExchangeIssue = new PayableExchangeIssueWrapper(web3, payableExchangeIssueAddress);
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(this.web3);
    this.wrappedEther = wrappedEtherAddress;
  }

  /**
   * Issues a Set to the transaction signer using Ether as payment.
   *
   * @param  rebalancingSetAddress    Address of the Rebalancing Set to issue
   * @param  exchangeIssueParams      Parameters required to facilitate an exchange issue
   * @param  orders                   A list of signed 0x orders or kyber trades
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async issueRebalancingSetWithEtherAsync(
    rebalancingSetAddress: Address,
    exchangeIssueParams: ExchangeIssueParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx
  ): Promise<string> {
    await this.assertIssueRebalancingSetWithEtherAsync(
      rebalancingSetAddress,
      exchangeIssueParams,
      orders,
      txOpts,
    );
    await this.assertExchangeIssueParams(rebalancingSetAddress, exchangeIssueParams);

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.payableExchangeIssue.issueRebalancingSetWithEther(
      rebalancingSetAddress,
      exchangeIssueParams,
      orderData,
      txOpts,
    );
  }

  /* ============ Private Assertions ============ */

  private async assertIssueRebalancingSetWithEtherAsync(
    rebalancingSetAddress: Address,
    exchangeIssueParams: ExchangeIssueParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx,
  ) {
    const {
      setAddress,
      sentTokens,
    } = exchangeIssueParams;

    // TODO: Update this assertion to properly validate all sent tokens
    const paymentToken = sentTokens[0];

    this.assert.common.isNotUndefined(txOpts.value, exchangeIssueErrors.ETHER_VALUE_NOT_UNDEFINED());
    this.assert.schema.isValidAddress('txOpts.from', txOpts.from);
    this.assert.schema.isValidAddress('rebalancingSetAddress', rebalancingSetAddress);
    this.assert.common.isNotEmptyArray(orders, coreAPIErrors.EMPTY_ARRAY('orders'));

    const baseSetAddress = await this.rebalancingSetToken.currentSet(rebalancingSetAddress);

    // Assert the set address is the rebalancing set address's current set
    this.assert.common.isEqualAddress(
      setAddress,
      baseSetAddress,
      exchangeIssueErrors.ISSUING_SET_NOT_BASE_SET(setAddress, baseSetAddress)
    );

    // Assert payment token is wrapped ether
    this.assert.common.isEqualAddress(
      paymentToken,
      this.wrappedEther,
      exchangeIssueErrors.PAYMENT_TOKEN_NOT_WETH(paymentToken, this.wrappedEther)
    );

    await this.assert.order.assertExchangeIssueOrdersValidity(
      exchangeIssueParams,
      orders,
    );
  }

  private async assertExchangeIssueParams(
    rebalancingSetAddress: Address,
    exchangeIssueParams: ExchangeIssueParams,
  ) {
    const {
      setAddress,
      sentTokens,
      sentTokenAmounts,
      quantity,
      receiveTokens,
      receiveTokenAmounts,
    } = exchangeIssueParams;

    // TODO: Update this assertion to properly validate all sent tokens
    const paymentToken = sentTokens[0];
    const paymentTokenAmount = sentTokenAmounts[0];

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
    await this.assert.order.assertRequiredComponentsAndAmounts(
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
