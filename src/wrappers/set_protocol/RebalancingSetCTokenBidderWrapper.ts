/*
  Copyright 2019 Set Labs Inc.

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

import { ProtocolContractWrapper } from './ProtocolContractWrapper';
import { Address, TokenFlows, Tx } from '../../types/common';
import { BigNumber, generateTxOpts } from '../../util';

const RebalancingSetCTokenBidder =
  require(
    'set-protocol-contracts/dist/artifacts/ts/RebalancingSetCTokenBidder'
  ).RebalancingSetCTokenBidder;

/**
 * @title  RebalancingSetCTokenBidderWrapper
 * @author Set Protocol
 *
 * The RebalancingSetCTokenBidderWrapper handles all functions on the RebalancingSetCTokenBidder smart contract.
 *
 */
export class RebalancingSetCTokenBidderWrapper {
  private web3: Web3;
  private contracts: ProtocolContractWrapper;
  private rebalancingSetCTokenBidderAddress: Address;

  public constructor(web3: Web3, rebalancingSetCTokenBidderAddress: Address) {
    this.web3 = web3;
    this.rebalancingSetCTokenBidderAddress = rebalancingSetCTokenBidderAddress;
    this.contracts = new ProtocolContractWrapper(this.web3);
  }

  /**
   * Asynchronously retrieve BidPlacedCToken events from the RebalancingSetCTokenBidder contract
   * Optionally, you can filter by a specific rebalancing SetToken
   *
   * @param  fromBlock                     The beginning block to retrieve events from
   * @param  toBlock                       The ending block to retrieve events (default is latest)
   * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
   * @return                               An array of raw events
   */
  public async bidPlacedCTokenEvent(
    fromBlock: number,
    toBlock: any = 'latest',
    rebalancingSetToken?: Address,
  ): Promise<any> {
    const rebalancingSetCTokenBidderInstance = new this.web3.eth.Contract(
      RebalancingSetCTokenBidder.abi,
      this.rebalancingSetCTokenBidderAddress
    );

    const filter: any = {};

    if (rebalancingSetToken) {
      filter['rebalancingSetToken'] = rebalancingSetToken;
    }

    const events = await rebalancingSetCTokenBidderInstance.getPastEvents('BidPlacedCToken', {
      'fromBlock': fromBlock,
      'toBlock': toBlock,
      'filter': filter,
    });

    return events;
  }

  /**
   * Asynchronously submit a bid and withdraw bids while transacting in underlying of cTokens
   * for a rebalancing auction on a rebalancingSetToken
   *
   * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
   * @param  quantity                      Amount of currentSetToken the bidder wants to rebalance
   * @param  allowPartialFill              Boolean that signifies whether to bid if full amount is not possible
   * @param  txOpts                        The options for executing the transaction
   * @return                               A transaction hash
   */
  public async bidAndWithdraw(
    rebalancingSetTokenAddress: Address,
    quantity: BigNumber,
    allowPartialFill: boolean,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetCTokenBidderInstance = await this.contracts.loadRebalancingSetCTokenBidderContract(
      this.rebalancingSetCTokenBidderAddress
    );

    return await rebalancingSetCTokenBidderInstance.bidAndWithdraw.sendTransactionAsync(
      rebalancingSetTokenAddress,
      quantity,
      allowPartialFill,
      txSettings,
    );
  }

  /**
   * Asynchronously submit a bid and withdraw bids while transacting in underlying of cTokens
   * for a rebalancing auction on a rebalancingSetToken
   *
   * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
   * @param  quantity                      Amount of currentSetToken the bidder wants to rebalance
   * @param  lastChunkTimestamp            Timestamp identifying which chunk is being bid on
   * @param  allowPartialFill              Boolean that signifies whether to bid if full amount is not possible
   * @param  txOpts                        The options for executing the transaction
   * @return                               A transaction hash
   */
  public async bidAndWithdrawTWAP(
    rebalancingSetTokenAddress: Address,
    quantity: BigNumber,
    lastChunkTimestamp: BigNumber,
    allowPartialFill: boolean,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetCTokenBidderInstance = await this.contracts.loadRebalancingSetCTokenBidderContract(
      this.rebalancingSetCTokenBidderAddress
    );

    return await rebalancingSetCTokenBidderInstance.bidAndWithdrawTWAP.sendTransactionAsync(
      rebalancingSetTokenAddress,
      quantity,
      lastChunkTimestamp,
      allowPartialFill,
      txSettings,
    );
  }

  /**
   * Fetches the current cToken underlying component addresses, token inflows and outflows for a given bid quantity
   *
   * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
   * @param  bidQuantity                   Amount of currentSetToken the bidder wants to rebalance
   * @return                               Object conforming to `TokenFlows` interface
   */
  public async getAddressAndBidPriceArray(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
  ): Promise<TokenFlows> {
    const rebalancingSetCTokenBidderInstance = await this.contracts.loadRebalancingSetCTokenBidderContract(
      this.rebalancingSetCTokenBidderAddress
    );

    const tokenFlows = await rebalancingSetCTokenBidderInstance.getAddressAndBidPriceArray.callAsync(
      rebalancingSetTokenAddress,
      bidQuantity,
    );
    return {
      tokens: tokenFlows[0],
      inflow: tokenFlows[1],
      outflow: tokenFlows[2],
    } as TokenFlows;
  }
}
