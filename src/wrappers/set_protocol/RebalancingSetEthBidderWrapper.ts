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

import { RebalancingSetEthBidder } from 'set-protocol-contracts';

import { ProtocolContractWrapper } from './ProtocolContractWrapper';
import { Address, Tx } from '../../types/common';
import { BigNumber, generateTxOpts } from '../../util';

/**
 * @title  RebalancingSetEthBidderWrapper
 * @author Set Protocol
 *
 * The RebalancingSetEthBidderWrapper handles all functions on the RebalancingSetEthBidder smart contract.
 *
 */
export class RebalancingSetEthBidderWrapper {
  private web3: Web3;
  private contracts: ProtocolContractWrapper;
  private rebalancingSetEthBidderAddress: Address;

  public constructor(web3: Web3, rebalancingSetEthBidderAddress: Address) {
    this.web3 = web3;
    this.rebalancingSetEthBidderAddress = rebalancingSetEthBidderAddress;
    this.contracts = new ProtocolContractWrapper(this.web3);
  }

  /**
   * Asynchronously retrieve BidPlacedWithEthWithEth events from the RebalancingSetEthBidder contract
   * Optionally, you can filter by a specific rebalancing SetToken
   *
   * @param  fromBlock                     The beginning block to retrieve events from
   * @param  toBlock                       The ending block to retrieve events (default is latest)
   * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
   * @return                               An array of raw events
   */
  public async bidPlacedWithEthEvent(
    fromBlock: number,
    toBlock: any = 'latest',
    rebalancingSetToken?: Address,
  ): Promise<any> {
    const rebalancingSetEthBidderInstance = new this.web3.eth.Contract(
      RebalancingSetEthBidder.abi,
      this.rebalancingSetEthBidderAddress
    );

    const filter: any = {};

    if (rebalancingSetToken) {
      filter['rebalancingSetToken'] = rebalancingSetToken;
    }

    const events = await rebalancingSetEthBidderInstance.getPastEvents('BidPlacedWithEth', {
      'fromBlock': fromBlock,
      'toBlock': toBlock,
      'filter': filter,
    });

    return events;
  }

  /**
   * Asynchronously submit a bid and withdraw bids transaction in Eth
   * for a rebalancing auction on a rebalancingSetToken
   *
   * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
   * @param  quantity                      Amount of currentSetToken the bidder wants to rebalance
   * @param  allowPartialFill              Boolean that signifies whether to bid if full amount is not possible
   * @param  txOpts                        The options for executing the transaction
   * @return                               A transaction hash
   */
  public async bidAndWithdrawWithEther(
    rebalancingSetTokenAddress: Address,
    quantity: BigNumber,
    allowPartialFill: boolean,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetEthBidderInstance = await this.contracts.loadRebalancingSetEthBidderContract(
      this.rebalancingSetEthBidderAddress
    );

    return await rebalancingSetEthBidderInstance.bidAndWithdrawWithEther.sendTransactionAsync(
      rebalancingSetTokenAddress,
      quantity,
      allowPartialFill,
      txSettings,
    );
  }
}
