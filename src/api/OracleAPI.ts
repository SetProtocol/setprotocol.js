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

import { HistoricalPriceFeedWrapper, MovingAverageOracleWrapper } from '../wrappers';
import { BigNumber } from '../util';
import {
  Address,
  Tx
} from '../types/common';

/**
 * @title OracleAPI
 * @author Set Protocol
 *
 * A library for reading and updating price oracles
 */
export class OracleAPI {
  private historicalPriceFeedWrapper: HistoricalPriceFeedWrapper;
  private movingAverageOracleWrapper: MovingAverageOracleWrapper;

  /**
   * Instantiates a new OracleAPI instance that contains methods for interacting with and updating price oracles
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   */
  constructor(web3: Web3) {
    this.historicalPriceFeedWrapper = new HistoricalPriceFeedWrapper(web3);
    this.movingAverageOracleWrapper = new MovingAverageOracleWrapper(web3);
  }

  /**
   * Returns the Unix timestamp of when the price feed was last updated
   *
   * @param  historicalPriceFeed    Address of the HistoricalPriceFeed contract to poll
   * @return                        Timestamp of when the price feed was last updated
   */
  public async getRollingHistoricalFeedLastUpdatedAsync(historicalPriceFeed: Address): Promise<BigNumber> {
    return await this.historicalPriceFeedWrapper.lastUpdatedAt(historicalPriceFeed);
  }

  /**
   * Returns the current price feed prices for dayCount number of days
   *
   * @param  historicalPriceFeed    Address of the HistoricalPriceFeed contract to update
   * @param  dayCount               Number of days to fetch price data for
   * @return                        List of prices recorded on the feed
   */
  public async getRollingHistoricalFeedPricesAsync(
    historicalPriceFeed: Address,
    dayCount: BigNumber
  ): Promise<BigNumber[]> {
    return await this.historicalPriceFeedWrapper.read(historicalPriceFeed, dayCount);
  }

  /**
   * Updates the price feed to record the current price from another Medianizer oracle
   *
   * @param  historicalPriceFeed    Address of the historicalPriceFeed contract to update
   * @param  txOpts                 The options for executing the transaction
   * @return                        Transaction hash
   */
  public async updateRollingHistoricalFeedPriceAsync(historicalPriceFeedAddress: Address, txOpts: Tx): Promise<string> {
    return await this.historicalPriceFeedWrapper.poke(historicalPriceFeedAddress, txOpts);
  }

  /**
   * Get the average price of a sequential list of asset prices stored on the MovingAverageOracle's connected
   * HistoricalPriceFeed contract
   *
   * @param  movingAverageOracle    Address of the MovingAverageOracle contract
   * @param  txOpts                 The options for executing the transaction
   * @return                        Price representing the average between the most recent dataPoints count
   */
  public async getMovingAverageOraclePrice(movingAverageOracle: Address, dataPoints: BigNumber): Promise<BigNumber> {
    const priceHex = await this.movingAverageOracleWrapper.read(movingAverageOracle, dataPoints);

    return new BigNumber(priceHex);
  }
}

