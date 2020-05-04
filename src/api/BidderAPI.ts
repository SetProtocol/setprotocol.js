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
import { Bytes } from 'set-protocol-utils';

import { BidderWrapper } from '../wrappers';
import {
  BigNumber,
  generateTxOpts,
} from '../util';
import { Address, BidderConfig, TokenFlows, Tx } from '../types/common';

/**
 * @title BidderAPI
 * @author Set Protocol
 *
 * A library for deploying new Set contracts
 */
export class BidderAPI {
  private web3: Web3;
  private bidder: BidderWrapper;

  /**
   * Instantiates a new BidderAPI instance that contains methods for interacting with the bidder contracts
   *
   * @param web3                      Web3.js Provider instance you would like the library to use
   *                                  for interacting with the Ethereum network
   * @param bidder                    An instance of BidderWrapper to interact with the deployed Bidder contract
   * @param config                    Object conforming to BidderConfig interface with contract addresses
   */
  constructor(web3: Web3, config: BidderConfig) {
    this.web3 = web3;
    this.bidder = new BidderWrapper(this.web3, config.bidderAddress);
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

    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await this.bidder.bidAndExchangeWithWallet(
      rebalancingSetTokenAddress,
      bidQuantity,
      benchmarkToken,
      exchangeWrapperAddress,
      orderData,
      txOptions
    );
  }
}
