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

import { StrategyContractWrapper } from './StrategyContractWrapper';
import { BigNumber } from '../../util';
import { Address } from '../../types/common';

/**
 * @title  HistoricalPriceFeedV2Wrapper
 * @author Set Protocol
 *
 * The HistoricalPriceFeedV2Wrapper handles interactions with Set's price feed for moving averages
 *
 */
export class TimeSeriesFeedWrapper {
  private web3: Web3;
  private contracts: StrategyContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new StrategyContractWrapper(this.web3);
  }

  /**
   * Fetch the Unix timestamp of the next earliest update
   *
   * @param  timeSeriesFeedAddress         Address of the TimeSeriesFeed contract to fetch date from
   * @return                               Unix time
   */
  public async nextEarliestUpdate(timeSeriesFeedAddress: Address): Promise<BigNumber> {
    const timeSeriesFeed = await this.contracts.loadTimeSeriesFeedContract(timeSeriesFeedAddress);

    return await timeSeriesFeed.nextEarliestUpdate.callAsync();
  }
}
