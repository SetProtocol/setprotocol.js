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
import { Address } from '../../types/common';

import { RebalancingSetTokenV2 } from 'set-protocol-contracts';

import { ProtocolContractWrapper } from './ProtocolContractWrapper';

/**
 * @title  RebalancingSetTokenV2Wrapper
 * @author Set Protocol
 *
 * The Rebalancing Set Token V2 API handles all functions on the Rebalancing Set Token V2 smart contract.
 *
 */
export class RebalancingSetTokenV2Wrapper {
  private web3: Web3;
  private contracts: ProtocolContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ProtocolContractWrapper(this.web3);
  }

  /**
   * Asynchronously retrieve EntryFeePaid events from the specified Rebalancing Set Token V2
   *
   * @param  rebalancingSetToken           Address of rebalancing set token to retrieve events from
   * @param  fromBlock                     The beginning block to retrieve events from
   * @param  toBlock                       The ending block to retrieve events (default is latest)
   * @return                               An array of raw events
   */
  public async entryFeePaidEvent(
    rebalancingSetToken: Address,
    fromBlock: number,
    toBlock: any = 'latest',
  ): Promise<any> {
    const rebalancingSetV2Instance = new this.web3.eth.Contract(
      RebalancingSetTokenV2.abi,
      rebalancingSetToken
    );

    const filter: any = {};
    const events = await rebalancingSetV2Instance.getPastEvents('EntryFeePaid', {
      'fromBlock': fromBlock,
      'toBlock': toBlock,
      'filter': filter,
    });

    return events;
  }

  /**
   * Asynchronously retrieve RebalanceStarted events from the specified Rebalancing Set Token V2
   *
   * @param  rebalancingSetToken           Address of rebalancing set token to retrieve events from
   * @param  fromBlock                     The beginning block to retrieve events from
   * @param  toBlock                       The ending block to retrieve events (default is latest)
   * @return                               An array of raw events
   */
  public async rebalanceStartedEvent(
    rebalancingSetToken: Address,
    fromBlock: number,
    toBlock: any = 'latest',
  ): Promise<any> {
    const rebalancingSetV2Instance = new this.web3.eth.Contract(
      RebalancingSetTokenV2.abi,
      rebalancingSetToken
    );

    const filter: any = {};
    const events = await rebalancingSetV2Instance.getPastEvents('RebalanceStarted', {
      'fromBlock': fromBlock,
      'toBlock': toBlock,
      'filter': filter,
    });

    return events;
  }

  /**
   * Asynchronously retrieve RebalanceSettled events from the specified Rebalancing Set Token V2
   *
   * @param  rebalancingSetToken           Address of rebalancing set token to retrieve events from
   * @param  fromBlock                     The beginning block to retrieve events from
   * @param  toBlock                       The ending block to retrieve events (default is latest)
   * @return                               An array of raw events
   */
  public async rebalanceSettledEvent(
    rebalancingSetToken: Address,
    fromBlock: number,
    toBlock: any = 'latest',
  ): Promise<any> {
    const rebalancingSetV2Instance = new this.web3.eth.Contract(
      RebalancingSetTokenV2.abi,
      rebalancingSetToken
    );

    const filter: any = {};
    const events = await rebalancingSetV2Instance.getPastEvents('RebalanceSettled', {
      'fromBlock': fromBlock,
      'toBlock': toBlock,
      'filter': filter,
    });

    return events;
  }
}
