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
import * as Web3 from 'web3';
import { Address } from 'set-protocol-utils';

import { ERC20Assertions } from './ERC20Assertions';
import { RebalancingSetTokenContract } from 'set-protocol-contracts';
import { coreAPIErrors, rebalancingErrors } from '../errors';
import { BigNumber } from '../util';
import { RebalancingState } from '../types/common';
import { ZERO } from '../constants';

const moment = require('moment');

export class RebalancingAssertions {
  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  /**
   * Throws if given rebalancingSetToken in Rebalance state
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async isNotInRebalanceState(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const currentState = await rebalancingSetTokenInstance.rebalanceState.callAsync();
    if (currentState.eq(RebalancingState.REBALANCE)) {
      throw new Error(rebalancingErrors.REBALANCE_IN_PROGRESS(rebalancingSetTokenAddress));
    }
  }

  /**
   * Throws if caller of rebalancingSetToken is not manager
   *
   * @param  caller   The address of the rebalancing set token
   */
  public async isManager(rebalancingSetTokenAddress: Address, caller: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const manager = await rebalancingSetTokenInstance.manager.callAsync();

    if (manager != caller) {
      throw new Error(rebalancingErrors.NOT_REBALANCING_MANAGER(caller));
    }
  }

  /**
   * Throws if not enough time passed between last rebalance on rebalancing set token
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async sufficientTimeBetweenRebalance(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const lastRebalanceTime = await rebalancingSetTokenInstance.lastRebalanceTimestamp.callAsync();
    const rebalanceInterval = await rebalancingSetTokenInstance.rebalanceInterval.callAsync();
    const nextAvailableRebalance = lastRebalanceTime.add(rebalanceInterval);
    const currentTimeStamp = new BigNumber(Date.now() / 1000);

    if (nextAvailableRebalance.greaterThan(currentTimeStamp)) {
      const nextRebalanceFormattedDate = moment(nextAvailableRebalance).format('dddd, MMMM Do YYYY, h:mm:ss a');
      throw new Error(rebalancingErrors.INSUFFICIENT_TIME_PASSED(nextRebalanceFormattedDate));
    }
  }
}