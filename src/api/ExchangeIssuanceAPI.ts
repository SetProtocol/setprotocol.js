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
  RebalancingSetExchangeIssuanceModuleWrapper,
  RebalancingSetTokenWrapper,
  SetTokenWrapper,
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
  private rebalancingSetExchangeIssuanceModule: RebalancingSetExchangeIssuanceModuleWrapper;
  private setToken: SetTokenWrapper;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private wrappedEther: Address;

  private core: CoreWrapper;
  private kyberNetworkWrapper: KyberNetworkWrapper;

  /**
   * Instantiates a new ExchangeIssuanceAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3            The Web3.js Provider instance you would like the SetProtocol.js library
   *                        to use for interacting with the Ethereum network
   * @param assertions      An instance of the Assertion library
   * @param config          Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
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
    this.rebalancingSetExchangeIssuanceModule = new RebalancingSetExchangeIssuanceModuleWrapper(
      web3,
      config.rebalancingSetExchangeIssuanceModule,
    );
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(this.web3);
    this.setToken = new SetTokenWrapper(this.web3);
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
    await this.assertExchangeIssue(exchangeIssuanceParams, orders);

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
   * @param  rebalancingSetAddress    Address of the Rebalancing Set to issue
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
   * @param  exchangeIssuanceParams   Parameters required to facilitate an exchange issuance
   * @param  orders                   A list of signed 0x orders or kyber trades
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transferred to the user
   *                                     or left in the vault
   * @param  txOpts                   Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return                          Transaction hash
   */
  public async issueRebalancingSetWithEtherAsync(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    keepChangeInVault: boolean,
    txOpts: Tx
  ): Promise<string> {
    await this.assertIssueRebalancingSetWithEther(
      rebalancingSetAddress,
      exchangeIssuanceParams,
      orders,
      txOpts,
    );

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.rebalancingSetExchangeIssuanceModule.issueRebalancingSetWithEther(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      exchangeIssuanceParams,
      orderData,
      keepChangeInVault,
      txOpts,
    );
  }

  /**
   * Issue a Rebalancing Set using a specified ERC20 payment token. The payment token is used in ExchangeIssue
   * to acquire the base SetToken components and issue the base SetToken. The base SetToken is then used to
   * issue the Rebalancing SetToken. The payment token can be utilized as a component of the base SetToken.
   * All remaining tokens / change are flushed and returned to the user.
   * Ahead of calling this function, the user must approve their paymentToken to the transferProxy.
   *
   * @param  rebalancingSetAddress     Address of the rebalancing Set to issue
   * @param  rebalancingSetQuantity    Quantity of the rebalancing Set
   * @param  paymentTokenAddress       Address of the ERC20 token to pay with
   * @param  paymentTokenQuantity      Quantity of the payment token
   * @param  exchangeIssuanceParams    Struct containing data around the base Set issuance
   * @param  orderData                 Bytecode formatted data with exchange data for acquiring base set components
   * @param  keepChangeInVault         Boolean signifying whether excess base SetToken is transfered to the user
   *                                     or left in the vault
   * @param  txOpts                    The options for executing the transaction
   */
  public async issueRebalancingSetWithERC20Async(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    paymentTokenAddress: Address,
    paymentTokenQuantity: BigNumber,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    keepChangeInVault: boolean,
    txOpts: Tx
  ): Promise<string> {
    await this.assertIssueRebalancingSetWithERC20(
      rebalancingSetAddress,
      paymentTokenAddress,
      paymentTokenQuantity,
      exchangeIssuanceParams,
      orders,
      txOpts,
    );

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.rebalancingSetExchangeIssuanceModule.issueRebalancingSetWithERC20(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      paymentTokenAddress,
      paymentTokenQuantity,
      exchangeIssuanceParams,
      orderData,
      keepChangeInVault,
      txOpts,
    );
  }

  /**
   * Redeems a Rebalancing Set into the base Set. Then the base Set is redeemed, and its components
   * are exchanged for Wrapped Ether. The wrapped Ether is then unwrapped and attributed to the caller.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
   * @param  exchangeIssuanceParams   Parameters required to facilitate an exchange issuance
   * @param  orders                   A list of signed 0x orders or kyber trades
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transferred to the user
   *                                     or left in the vault
   * @param  txOpts                   Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return                          Transaction hash
   */
  public async redeemRebalancingSetIntoEtherAsync(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    keepChangeInVault: boolean,
    txOpts: Tx
  ): Promise<string> {
    await this.assertRedeemRebalancingSetIntoERC20(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      this.wrappedEther,
      exchangeIssuanceParams,
      orders,
      txOpts,
    );

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.rebalancingSetExchangeIssuanceModule.redeemRebalancingSetIntoEther(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      exchangeIssuanceParams,
      orderData,
      keepChangeInVault,
      txOpts,
    );
  }

  /**
   * Redeems a Rebalancing Set into a specified ERC20 token. The Rebalancing Set is redeemed into the Base Set, and
   * Base Set components are traded for the ERC20 and sent to the caller.
   *
   * @param  rebalancingSetAddress     Address of the rebalancing Set
   * @param  rebalancingSetQuantity    Quantity of rebalancing Set to redeem
   * @param  outputTokenAddress        Address of the resulting ERC20 token sent to the user
   * @param  exchangeIssuanceParams    Struct containing data around the base Set issuance
   * @param  orderData                 Bytecode formatted data with exchange data for disposing base set components
   * @param  keepChangeInVault         Boolean signifying whether excess base SetToken is transfered to the user
   *                                     or left in the vault
   * @param  txOpts                    The options for executing the transaction
   */
  public async redeemRebalancingSetIntoERC20Async(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    outputTokenAddress: Address,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    keepChangeInVault: boolean,
    txOpts: Tx
  ): Promise<string> {
    await this.assertRedeemRebalancingSetIntoERC20(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      outputTokenAddress,
      exchangeIssuanceParams,
      orders,
      txOpts,
    );

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.rebalancingSetExchangeIssuanceModule.redeemRebalancingSetIntoERC20(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      outputTokenAddress,
      exchangeIssuanceParams,
      orderData,
      keepChangeInVault,
      txOpts,
    );
  }

  /**
   * Fetch the conversion rate for a Kyber trading pair
   *
   * @param  sourceTokens        Addresses of the tokens to trade
   * @param  destinationTokens   Addresses of the set components to trade for
   * @param  quantities          Quantities of maker tokens to trade for component tokens
   * @return                     Conversion and slippage rates for the source and destination token pairs
   */
  public async getKyberConversionRates(
    sourceTokens: Address[],
    destinationTokens: Address[],
    quantities: BigNumber[]
  ): Promise<[BigNumber[], BigNumber[]]> {
    return await this.kyberNetworkWrapper.conversionRates(sourceTokens, destinationTokens, quantities);
  }

  /* ============ Private Assertions ============ */

  private async assertExchangeIssue(
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
  ) {
    const {
      setAddress,
      receiveTokens,
    } = exchangeIssuanceParams;

    // Assert orders are passed in
    this.assert.common.isNotEmptyArray(orders, coreAPIErrors.EMPTY_ARRAY('orders'));

    // Assert each component to trade for is a component of the collateralizing set
    const components = await this.setToken.getComponents(setAddress);
    receiveTokens.forEach(receiveToken => {
      this.assert.common.includes(
        components,
        receiveToken,
        exchangeIssuanceErrors.TRADE_TOKENS_NOT_COMPONENT(setAddress, receiveToken)
      );
    });

    await this.assert.exchange.assertExchangeIssuanceParams(exchangeIssuanceParams, orders, this.core.coreAddress);
  }

  private async assertIssueRebalancingSetWithEther(
    rebalancingSetAddress: Address,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx,
  ) {
    this.assert.common.isNotUndefined(txOpts.value, exchangeIssuanceErrors.PAYMENT_TOKEN_QUANTITY_NOT_UNDEFINED());

    await this.assertIssueRebalancingSetWithERC20(
      rebalancingSetAddress,
      this.wrappedEther,
      new BigNumber(txOpts.value),
      exchangeIssuanceParams,
      orders,
      txOpts,
    );
  }

  private async assertIssueRebalancingSetWithERC20(
    rebalancingSetAddress: Address,
    paymentTokenAddress: Address,
    paymentTokenQuantity: BigNumber,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx,
  ) {
    const {
      setAddress,
      sendTokens,
      receiveTokens,
    } = exchangeIssuanceParams;

    // Assert valid parameters were passed into issueRebalancingSetWithEther
    this.assert.common.isNotUndefined(paymentTokenQuantity, exchangeIssuanceErrors.PAYMENT_TOKEN_QUANTITY_NOT_UNDEFINED());
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

    // Assert each component to trade for is a component of the collateralizing set
    const components = await this.setToken.getComponents(setAddress);
    receiveTokens.forEach(receiveToken => {
      this.assert.common.includes(
        components,
        receiveToken,
        exchangeIssuanceErrors.TRADE_TOKENS_NOT_COMPONENT(setAddress, receiveToken)
      );
    });

    // Assert that all payment tokens are wrapped Ether
    sendTokens.forEach(currentSendToken => {
      // Assert payment token is wrapped ether
      this.assert.common.isEqualAddress(
        currentSendToken,
        paymentTokenAddress,
        exchangeIssuanceErrors.INVALID_SEND_TOKEN(currentSendToken, paymentTokenAddress)
      );
    });

    // Assert valid exchange trade and order parameters
    await this.assert.exchange.assertExchangeIssuanceParams(exchangeIssuanceParams, orders, this.core.coreAddress);
  }

  private async assertRedeemRebalancingSetIntoERC20(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    outputTokenAddress: Address,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx,
  ) {
    const {
      setAddress,
      quantity,
      sendTokens,
      receiveTokens,
    } = exchangeIssuanceParams;

    // Assert valid parameters were passed into redeemRebalancingSetIntoEther
    this.assert.common.isValidLength(receiveTokens, 1, exchangeIssuanceErrors.ONLY_ONE_RECEIVE_TOKEN());
    this.assert.schema.isValidAddress('txOpts.from', txOpts.from);
    this.assert.schema.isValidAddress('rebalancingSetAddress', rebalancingSetAddress);
    this.assert.common.isNotEmptyArray(orders, coreAPIErrors.EMPTY_ARRAY('orders'));

    const baseSetAddress = await this.rebalancingSetToken.currentSet(rebalancingSetAddress);

    // Assert the set address is the rebalancing set address's current set
    this.assert.common.isEqualAddress(
      setAddress,
      baseSetAddress,
      exchangeIssuanceErrors.REDEEMING_SET_NOT_BASE_SET(setAddress, baseSetAddress)
    );

    // Assert each component to trade for is a component of the collateralizing set
    const components = await this.setToken.getComponents(setAddress);
    sendTokens.forEach(sendToken => {
      this.assert.common.includes(
        components,
        sendToken,
        exchangeIssuanceErrors.TRADE_TOKENS_NOT_COMPONENT(setAddress, sendToken)
      );
    });

    // Amount of base set components to trade after redeeming must be enough to collateralize the quantity
    const rebalancingSetNaturalUnit = await this.setToken.naturalUnit(rebalancingSetAddress);
    const rebalancingSetUnitShares = (await this.setToken.getUnits(rebalancingSetAddress))[0];
    const impliedBaseSetQuantity = rebalancingSetQuantity.mul(rebalancingSetUnitShares).div(rebalancingSetNaturalUnit);
    this.assert.common.isGreaterOrEqualThan(
      impliedBaseSetQuantity,
      quantity, // Base set quantity to redeem
      exchangeIssuanceErrors.REDEEM_AND_TRADE_QUANTITIES_MISMATCH(
        impliedBaseSetQuantity.valueOf(),
        quantity.valueOf()
      )
    );

    // Assert receive token is wrapped ether
    const receiveToken = receiveTokens[0];
    this.assert.common.isEqualAddress(
      receiveToken,
      outputTokenAddress,
      exchangeIssuanceErrors.INVALID_RECEIVE_TOKEN(receiveToken, outputTokenAddress)
    );

    // Assert valid exchange trade and order parameters
    await this.assert.exchange.assertExchangeIssuanceParams(exchangeIssuanceParams, orders, this.core.coreAddress);
  }
}
