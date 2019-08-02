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

import {
  MovingAverageOracleWrapper,
  PriceFeedWrapper,
} from '../wrappers';
import { BigNumber } from '../util';
import {
  Address
} from '../types/common';

/**
 * @title OracleAPI
 * @author Set Protocol
 *
 * A library for reading oracles
 */
export class OracleAPI {
  private movingAverageOracleWrapper: MovingAverageOracleWrapper;
  private priceFeed: PriceFeedWrapper;

  /**
   * Instantiates a new OracleAPI instance that contains methods for interacting with and updating price oracles
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   */
  constructor(web3: Web3) {
    this.movingAverageOracleWrapper = new MovingAverageOracleWrapper(web3);
    this.priceFeed = new PriceFeedWrapper(web3);
  }

  /**
   * Returns the current price feed price
   *
   * @param medianizerAddress    Address of the medianizer to ping
   * @return                     Price in base decimal of the asset represented by the medianizer
   */
  public async getFeedPriceAsync(medianizerAddress: Address): Promise<BigNumber> {
    const priceFeedUpdateHex = await this.priceFeed.read(medianizerAddress);

    return new BigNumber(priceFeedUpdateHex);
  }

  /**
   * Get the average price of a sequential list of asset prices stored on the MovingAverageOracle's connected
   * HistoricalPriceFeed or TimesSeriesFeed contract
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

