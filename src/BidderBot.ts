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

import Web3 from 'web3';
import { Provider } from 'web3/providers';
import { Bytes } from 'set-protocol-utils';

import { BidderAPI } from './api';
import {
  instantiateWeb3,
  BigNumber,
} from './util';
import { Address, BidderConfig, TokenFlows, Tx } from './types/common';
/**
 * @title BidderBot
 * @author Set Protocol
 *
 * The BidderBot class that exposes all functionality for interacting with the BidderBot smart contracts.
 * Methods that require interaction with the Ethereum blockchain are exposed after instantiating a new instance
 * of BidderBot with the web3 provider argument
 */
class BidderBot {
  private web3: Web3;
  private bidder: BidderAPI;

  /**
   * Instantiates a new BidderBot instance that provides the public interface to the BidderBot.js library
   *
   * @param provider    Provider instance you would like the BidderBot.js library to use for interacting with the
   *                      Ethereum network
   * @param config      Configuration object conforming to BidderConfig with Set Protocol's contract addresses
   */
  constructor(provider: Provider, config: BidderConfig) {
    this.web3 = instantiateWeb3(provider);

    this.bidder = new BidderAPI(
      this.web3,
      config
    );
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
    return await this.bidder.getTokenFlowsAsync(
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
    return await this.bidder.getSpreadAsync(
      rebalancingSetTokenAddress,
      bidQuantity,
      benchmarkToken,
      estimatedReceiveTokenAmount
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
   * @param  exchangeWrapperAddress                  Address of the DEX to arb the rebalance
   * @param  orderData                               Arbitrary bytes containing order data
   * @return                                         Tx hash
   */
  public async bidAndExchangeWithWalletAsync(
      rebalancingSetTokenAddress: Address,
      bidQuantity: BigNumber,
      benchmarkToken: Address,
      exchangeWrapperAddress: Address,
      orderData: Bytes,
      txOpts?: Tx,
  ): Promise<string> {

    return await this.bidder.bidAndExchangeWithWalletAsync(
      rebalancingSetTokenAddress,
      bidQuantity,
      benchmarkToken,
      exchangeWrapperAddress,
      orderData,
      txOpts
    );
  }
}

export default BidderBot;
