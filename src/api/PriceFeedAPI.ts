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

import * as _ from 'lodash';
import Web3 from 'web3';

import {
  HistoricalPriceFeedWrapper,
  TimeSeriesFeedWrapper,
} from '../wrappers';
import { BigNumber } from '../util';
import {
  Address,
  Tx
} from '../types/common';

/**
 * @title PriceFeedAPI
 * @author Set Protocol
 *
 * A library for reading and updating price feeds
 */
export class PriceFeedAPI {
  private historicalPriceFeedWrapper: HistoricalPriceFeedWrapper;
  private timeSeriesFeedWrapper: TimeSeriesFeedWrapper;

  /**
   * Instantiates a new PriceFeedAPI instance that contains methods for interacting with and updating price oracles
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   */
  constructor(web3: Web3) {
    this.historicalPriceFeedWrapper = new HistoricalPriceFeedWrapper(web3);
    this.timeSeriesFeedWrapper = new TimeSeriesFeedWrapper(web3);
  }

  /**
   * Returns the Unix timestamp of when the price feed was last updated. Only applies to HistoricalPriceFeed contracts.
   *
   * @param  historicalPriceFeed    Address of the HistoricalPriceFeed contract to poll
   * @return                        Timestamp of when the price feed was last updated
   */
  public async getHistoricalPriceFeedLastUpdatedAsync(historicalPriceFeed: Address): Promise<BigNumber> {
    return await this.historicalPriceFeedWrapper.lastUpdatedAt(historicalPriceFeed);
  }

  /**
   * Returns the Unix timestamp of earliest time the TimeSeriesFeed can be updated. Only applies to
   * TimeSeriesFeed contracts.
   *
   * @param  timeSeriesFeed         Address of the TimeSeriesFeed contract to poll
   * @return                        Timestamp of when the price feed can be updated next
   */
  public async geTimeSeriesFeedNextEarliestUpdateAsync(timeSeriesFeed: Address): Promise<BigNumber> {
    return await this.timeSeriesFeedWrapper.nextEarliestUpdate(timeSeriesFeed);
  }

  /**
   * Returns the current price feed prices for dayCount number of days. Can be used by either HistoricalPriceFeed or
   * TimeSeriesFeed contracts.
   *
   * @param  historicalPriceFeed    Address of the HistoricalPriceFeed/TimeSeriesFeed contract to update
   * @param  dayCount               Number of days to fetch price data for
   * @return                        List of prices recorded on the feed
   */
  public async getLatestPriceFeedDataAsync(
    historicalPriceFeed: Address,
    dayCount: BigNumber
  ): Promise<BigNumber[]> {
    return await this.historicalPriceFeedWrapper.read(historicalPriceFeed, dayCount);
  }

  /**
   * Updates the price feed to record the current price from another Medianizer oracle. Can be used by either
   * HistoricalPriceFeed or TimeSeriesFeed contracts.
   *
   * @param  historicalPriceFeed    Address of the HistoricalPriceFeed/TimeSeriesFeed contract to update
   * @param  txOpts                 The options for executing the transaction
   * @return                        Transaction hash
   */
  public async updatePriceFeedDataAsync(historicalPriceFeedAddress: Address, txOpts: Tx): Promise<string> {
    return await this.historicalPriceFeedWrapper.poke(historicalPriceFeedAddress, txOpts);
  }
}

