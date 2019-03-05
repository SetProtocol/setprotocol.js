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
import { BigNumber,  } from '../util';
import {
  CoreWrapper,
  ExchangeIssuanceModuleWrapper,
  KyberNetworkWrapper,
  PayableExchangeIssuanceWrapper,
  RebalancingSetTokenWrapper,
 } from '../wrappers';
import { Address, KyberTrade, SetProtocolConfig, Tx, ZeroExSignedFillOrder } from '../types/common';
import { coreAPIErrors, exchangeIssuanceErrors } from '../errors';

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
  private payableExchangeIssuance: PayableExchangeIssuanceWrapper;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private wrappedEther: Address;

  private core: CoreWrapper;
  private kyberNetworkWrapper: KyberNetworkWrapper;

  /**
   * Instantiates a new ExchangeIssuanceAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3                         The Web3.js Provider instance you would like the SetProtocol.js library
   *                                      to use for interacting with the Ethereum network
   * @param assertions                   An instance of the Assertion library
   * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
   */
  constructor(
    web3: Web3,
    assertions: Assertions,
    config: SetProtocolConfig,
  ) {
    this.web3 = web3;
    this.setProtocolUtils = new SetProtocolUtils(this.web3);
    this.assert = assertions;
    this.core = new CoreWrapper(this.web3, config.coreAddress, config.transferProxyAddress, config.vaultAddress);
    this.exchangeIssuance = new ExchangeIssuanceModuleWrapper(web3, config.exchangeIssuanceModuleAddress);
    this.kyberNetworkWrapper = new KyberNetworkWrapper(this.web3, config.kyberNetworkWrapperAddress);
    this.payableExchangeIssuance = new PayableExchangeIssuanceWrapper(web3, config.payableExchangeIssuance);
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(this.web3);
    this.wrappedEther = config.wrappedEtherAddress;
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
    await this.assert.exchange.assertExchangeIssuanceParams(
      exchangeIssuanceParams,
      orders,
      this.core.coreAddress,
    );

    // Assert receive tokens are components of the Set
    await this.assert.exchange.assertExchangeIssueReceiveInputs(exchangeIssuanceParams);

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.exchangeIssuance.exchangeIssue(
      exchangeIssuanceParams,
      orderData,
      txOpts,
    );
  }

  /**
   * Issues a Rebalancing Set to the transaction signer using Ether as payment.
   *
   * @param  rebalancingSetAddress       Address of the Rebalancing Set to issue
   * @param  exchangeIssuanceParams      Parameters required to facilitate an exchange issuance
   * @param  orders                      A list of signed 0x orders or kyber trades
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
    await this.assert.exchange.assertExchangeIssuanceParams(
      exchangeIssuanceParams,
      orders,
      this.core.coreAddress
    );

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.payableExchangeIssuance.issueRebalancingSetWithEther(
      rebalancingSetAddress,
      exchangeIssuanceParams,
      orderData,
      txOpts,
    );
  }

  /**
   * Fetch the conversion rate for a Kyber trading pair
   *
   * @param  makerTokenAddress       Address of the token to trade
   * @param  componentTokenAddress   Address of the set component to trade for
   * @param  quantity                Quantity of maker token to trade for component token
   * @return                         The conversion rate and slip rate for the trade
   */
  public async getKyberConversionRate(
    makerTokenAddress: Address,
    componentTokenAddress: Address,
    quantity: BigNumber
  ): Promise<[BigNumber, BigNumber]> {
    return await this.kyberNetworkWrapper.conversionRate(makerTokenAddress, componentTokenAddress, quantity);
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

    this.assert.common.isValidLength(sendTokens, 1, exchangeIssuanceErrors.ONLY_ONE_SEND_TOKEN());
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
    const paymentToken = sendTokens[0];
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
}
