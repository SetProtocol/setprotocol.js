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

import { Assertions } from '../assertions';
import { BidderWrapper } from '../wrappers';
import {
  BigNumber,
} from '../util';

import {
  Address,
  BidderConfig,
  Bytes,
  KyberTrade,
  TokenFlows,
  Tx,
  ZeroExSignedFillOrder
} from '../types/common';
import { coreAPIErrors } from '../errors';

/**
 * @title BidderAPI
 * @author Set Protocol
 *
 * A library for deploying new Set contracts
 */
export class BidderAPI {
  private web3: Web3;
  private assert: Assertions;
  private bidder: BidderWrapper;
  private setProtocolTestUtils: typeof SetProtocolTestUtils;
  private config: BidderConfig;

  /**
   * Instantiates a new BidderAPI instance that contains methods for interacting with the bidder contracts
   *
   * @param web3                      Web3.js Provider instance you would like the library to use
   *                                  for interacting with the Ethereum network
   * @param bidder                    An instance of BidderWrapper to interact with the deployed Bidder contract
   * @param config                    Object conforming to BidderConfig interface with contract addresses
   */
  constructor(
    web3: Web3,
    assertions: Assertions,
    config: BidderConfig
  ) {
    this.web3 = web3;
    this.assert = assertions;
    this.bidder = new BidderWrapper(this.web3, config.bidderAddress);
    this.setProtocolTestUtils = SetProtocolTestUtils;
    this.config = config;
  }

  /**
   * Fetches the current cToken underlying component addresses, token inflows and outflows for a given bid quantity
   *
   * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
   * @param  bidQuantity                   Amount of currentSetToken the bidder wants to rebalance
   * @return                               Object conforming to `TokenFlows` interface
   */
  public async getTokenFlowsAsync(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
  ): Promise<TokenFlows> {
    return await this.bidder.getTokenFlows(
      rebalancingSetTokenAddress,
      bidQuantity,
    );
  }

  /**
   * Calculate the spread for a given rebalancing Set token bid quantity and receiveToken from order data.
   * Returns 0 if not profitable to arb.
   *
   * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
   * @param  bidQuantity                   Amount of currentSetToken the bidder wants to rebalance
   * @param  benchmarkToken                Address of token to measure spread against
   * @param  estimatedReceiveTokenAmount   Estimated amount of tokens to receive from DEX order
   * @return                               Spread in units of benchmark token
   */
  public async getSpreadAsync(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    benchmarkToken: Address,
    estimatedReceiveTokenAmount: BigNumber,
  ): Promise<BigNumber> {
    return await this.bidder.getSpread(
      rebalancingSetTokenAddress,
      bidQuantity,
      benchmarkToken,
      estimatedReceiveTokenAmount,
    );
  }

  /**
   * Bid in the auction and exchange using a DEX using tokens from wallet. If benchmarkToken
   * is inflow in the auction, function will bid first and then arb with a DEX (passed in via
   * exchangeWrapperAddress). If a benchmarkToken is outflow in the auction, function will
   * exchange first and bid in the auction. Use of the delegatecall pattern allows tokens to
   * remain in this contract. Require that bid is profitable at the end of transaction.
   *
   * Only authorized addresses can call this function.
   *
   * Only works for 1 DEX order at a time, and 1 component auctions.
   *
   * @param  rebalancingSetTokenAddress              The rebalancing Set Token instance
   * @param  bidQuantity                             The amount of currentSet to be rebalanced
   * @param  benchmarkToken                          Address of the token the spread is measured against
   * @param  exchangeWrapperAddress                  Address of the exchange wrapper to arb the rebalance
   * @param  order                                   A signed 0x order or Kyber trade
   * @return                                         Tx hash
   */
  public async bidAndExchangeWithWalletAsync(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    benchmarkToken: Address,
    exchangeWrapperAddress: Address,
    order: any,
    txOpts: Tx,
  ): Promise<string> {

    await this.assertBidAndExchangeWithWalletAsync(
      rebalancingSetTokenAddress,
      bidQuantity,
      benchmarkToken,
      order,
      txOpts,
    );

    let orderData: Bytes;
    if (exchangeWrapperAddress === this.config.kyberBidExchangeWrapperAddress) {
      orderData = await this.setProtocolTestUtils.kyberTradeToBytes(order);
    } else if (exchangeWrapperAddress === this.config.zeroExBidExchangeWrapperAddress) {
      orderData = await this.setProtocolTestUtils.generateZeroExExchangeWrapperOrder(
        order,
        order.signature,
        order.fillAmount,
      );
    }

    return await this.bidder.bidAndExchangeWithWallet(
      rebalancingSetTokenAddress,
      bidQuantity,
      benchmarkToken,
      exchangeWrapperAddress,
      orderData,
      txOpts,
    );
  }

  /* ============ Private Assertions ============ */

  private async assertBidAndExchangeWithWalletAsync(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    benchmarkToken: Address,
    order: any,
    txOpts: Tx,
  ) {
    // Assert orders are valid
    if (SetProtocolUtils.isZeroExOrder(order)) {
      await this.isValidZeroExOrderFill(
        rebalancingSetTokenAddress,
        bidQuantity,
        benchmarkToken,
        order
      );
    } else if (SetProtocolUtils.isKyberTrade(order)) {
      await this.isValidKyberTradeFill(order);
    }

    // Check allowances / balances
    await this.hasSufficientAllowancesAndBalances(
      rebalancingSetTokenAddress,
      bidQuantity,
      benchmarkToken,
      txOpts
    );
  }

  private async isValidKyberTradeFill(
    trade: KyberTrade,
  ) {
    this.assert.common.greaterThanZero(
      trade.sourceTokenQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(trade.sourceTokenQuantity),
    );
  }

  private async isValidZeroExOrderFill(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    benchmarkToken: Address,
    zeroExOrder: ZeroExSignedFillOrder,
  ) {
    this.assert.common.greaterThanZero(
      zeroExOrder.fillAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(zeroExOrder.fillAmount),
    );

    // 0x order maker has sufficient balance of the maker token
    await this.assert.erc20.hasSufficientBalanceAsync(
      SetProtocolUtils.extractAddressFromAssetData(zeroExOrder.makerAssetData),
      zeroExOrder.makerAddress,
      zeroExOrder.makerAssetAmount,
    );

    const spread = await this.bidder.getSpread(
      rebalancingSetTokenAddress,
      bidQuantity,
      benchmarkToken,
      zeroExOrder.fillAmount,
    );

    // Spread must be positive
    this.assert.common.greaterThanZero(
      spread,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(spread),
    );
  }

  private async hasSufficientAllowancesAndBalances(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    benchmarkToken: Address,
    txOpts: Tx,
  ) {
    // Get token flow arrays
    const tokenFlows = await this.bidder.getTokenFlows(
      rebalancingSetTokenAddress,
      bidQuantity,
    );

    let requiredQuantity: BigNumber;
    const benchmarkTokenIndex = tokenFlows.tokens.indexOf(benchmarkToken);
    if (new BigNumber(tokenFlows.inflow[benchmarkTokenIndex]).gt(0)) {
      requiredQuantity = new BigNumber(tokenFlows.inflow[benchmarkTokenIndex]);
    } else {
      requiredQuantity = new BigNumber(tokenFlows.outflow[benchmarkTokenIndex]);
    }

    // Check allowances when benchmarkToken is inflow in the auction
    await this.assert.erc20.hasSufficientAllowanceAsync(
      benchmarkToken,
      txOpts.from,
      this.config.bidderAddress,
      requiredQuantity,
    );
    // Check balance when benchmarkToken is inflow in the auction
    await this.assert.erc20.hasSufficientBalanceAsync(
      benchmarkToken,
      txOpts.from,
      requiredQuantity,
    );
  }
}
