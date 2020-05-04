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

import { BidderContractWrapper } from './BidderContractWrapper';
import { Address, TokenFlows, Tx } from '../../types/common';
import { BigNumber, generateTxOpts } from '../../util';

/**
 * @title BidderWrapper
 * @author Set Protocol
 *
 * The Bidder API handles all functions on the Bidder bot smart contract.
 *
 */
export class BidderWrapper {
  private web3: Web3;
  private contracts: BidderContractWrapper;

  public bidderAddress: Address;

  public constructor(
    web3: Web3,
    bidderAddress: Address,
  ) {
    this.web3 = web3;
    this.contracts = new BidderContractWrapper(this.web3);

    this.bidderAddress = bidderAddress;
  }

  /**
   * Fetches the current cToken underlying component addresses, token inflows and outflows for a given bid quantity
   *
   * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
   * @param  bidQuantity                   Amount of currentSetToken the bidder wants to rebalance
   * @return                               Object conforming to `TokenFlows` interface
   */
  public async getTokenFlows(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
  ): Promise<TokenFlows> {
    const bidderInstance = await this.contracts.loadBidderContract(
      this.bidderAddress
    );

    const tokenFlows = await bidderInstance.getTokenFlows.callAsync(
      rebalancingSetTokenAddress,
      bidQuantity,
    );
    return {
      tokens: tokenFlows[0],
      inflow: tokenFlows[1],
      outflow: tokenFlows[2],
    } as TokenFlows;
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
  public async getSpread(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    benchmarkToken: Address,
    estimatedReceiveTokenAmount: BigNumber,
  ): Promise<BigNumber> {
    const bidderInstance = await this.contracts.loadBidderContract(
      this.bidderAddress
    );

    return await bidderInstance.getSpread.callAsync(
      rebalancingSetTokenAddress,
      bidQuantity,
      benchmarkToken,
      estimatedReceiveTokenAmount
    );
  }

  /**
   * Bid in the auction and exchange using a DEX using tokens from wallet. If benchmarkToken is inflow in the auction,
   * function will bid first and then arb with a DEX (passed in via exchangeWrapperAddress). If a benchmarkToken
   * is outflow in the auction, function will exchange first and bid in the auction. Use of the delegatecall
   * pattern allows tokens to remain in this contract. Require that bid is profitable at the end of transaction.
   * Only authorized addresses can call this function. Only works for 1 DEX order at a time, and
   * 1 component auctions.
   *
   * @param  rebalancingSetTokenAddress              The rebalancing Set Token instance
   * @param  bidQuantity                             The amount of currentSet to be rebalanced
   * @param  benchmarkToken                          Address of the token the spread is measured against
   * @param  exchangeWrapperAddress                  Address of the DEX to arb the rebalance
   * @param  orderData                               Arbitrary bytes containing order data
   * @return                                         Tx hash
   */
  public async bidAndExchangeWithWallet(
      rebalancingSetTokenAddress: Address,
      bidQuantity: BigNumber,
      benchmarkToken: Address,
      exchangeWrapperAddress: Address,
      orderData: Bytes,
      txOpts?: Tx,
  ): Promise<string> {
    const bidderInstance = await this.contracts.loadBidderContract(
      this.bidderAddress
    );

    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await bidderInstance.bidAndExchangeWithWallet.sendTransactionAsync(
      rebalancingSetTokenAddress,
      bidQuantity,
      benchmarkToken,
      exchangeWrapperAddress,
      orderData,
      txOptions
    );
  }
}
