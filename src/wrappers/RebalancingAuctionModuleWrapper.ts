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

import { ContractWrapper } from '.';
import { ZERO } from '../constants';
import { Address, Bytes, Tx } from '../types/common';
import { BigNumber, generateTxOpts } from '../util';

/**
 * @title RebalancingAuctionModuleWrapper
 * @author Set Protocol
 *
 * The Core API handles all functions on the Core SetProtocol smart contract.
 *
 */
export class RebalancingAuctionModuleWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;
  private setProtocolUtils: SetProtocolUtils;

  public rebalanceAuctionModuleAddress: Address;

  public constructor(
    web3: Web3,
    rebalanceAuctionModule: Address,
  ) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
    this.setProtocolUtils = new SetProtocolUtils(this.web3);

    this.rebalanceAuctionModuleAddress = rebalanceAuctionModule;
  }

  /**
   * Asynchronously submit a bid for a rebalancing auction on a rebalancingSetToken
   *
   * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
   * @param  quantity                      Amount of currentSetToken the bidder wants to rebalance
   * @param  txOpts                        The options for executing the transaction
   * @return                               A transaction hash
   */
  public async bid(rebalancingSetTokenAddress: Address, quantity: BigNumber, txOpts?: Tx): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalanceAuctionModuleInstance = await this.contracts.loadRebalanceAuctionModuleAsync(
      this.rebalanceAuctionModuleAddress
    );

    return await rebalanceAuctionModuleInstance.bid.sendTransactionAsync(
      rebalancingSetTokenAddress,
      quantity,
      txSettings,
    );
  }
}
