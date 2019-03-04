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
import { ExchangeIssuanceModuleWrapper } from '../wrappers';
import { Address, KyberTrade, Tx, ZeroExSignedFillOrder } from '../types/common';
import { coreAPIErrors } from '../errors';

/**
 * @title ExchangeIssuanceAPI
 * @author Set Protocol
 *
 * A library for issuing RebalancingSets using Ether.
 */
export class ExchangeIssuanceAPI {
  private web3: Web3;
  private assert: Assertions;
  private exchangeIssuance: ExchangeIssuanceModuleWrapper;
  private setProtocolUtils: SetProtocolUtils;

  /**
   * Instantiates a new ExchangeIssuanceAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3                         The Web3.js Provider instance you would like the SetProtocol.js library
   *                                      to use for interacting with the Ethereum network
   * @param assertions                   An instance of the Assertion library
   * @param exchangeIssuanceAddress  The address of the ExchangeIssuanceModuleWrapper Library
   */
  constructor(
    web3: Web3,
    assertions: Assertions,
    exchangeIssuanceAddress: Address,
  ) {
    this.web3 = web3;
    this.setProtocolUtils = new SetProtocolUtils(this.web3);
    this.assert = assertions;
    this.exchangeIssuance = new ExchangeIssuanceModuleWrapper(web3, exchangeIssuanceAddress);
  }

  /**
   * Issues a Set to the transaction signer. Must have payment tokens in the correct quantites
   * Payment tokens must be approved to the TransferProxy contract via setTransferProxyAllowanceAsync
   *
   * @param  exchangeIssuanceParams      Parameters required to facilitate an exchange issue
   * @param  orders                   A list of signed 0x orders or kyber trades
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async exchangeIssueAsync(
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx
  ): Promise<string> {
    await this.assertExchangeIssuanceParams(exchangeIssuanceParams, orders);

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.exchangeIssuance.exchangeIssue(
      exchangeIssuanceParams,
      orderData,
      txOpts,
    );
  }


  /* ============ Private Assertions ============ */

  private async assertExchangeIssuanceParams(
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
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
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('requiredComponents', 'requiredComponentAmounts'),
    );
    this.assert.common.isNotEmptyArray(orders, coreAPIErrors.EMPTY_ARRAY('orders'));

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

     await this.assert.exchange.assertExchangeIssuanceOrdersValidity(
      exchangeIssuanceParams,
      orders,
    );
  }
}
