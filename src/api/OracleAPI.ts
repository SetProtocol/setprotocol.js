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
  MedianizerWrapper,
  ProtocolViewerWrapper,
} from '../wrappers';
import { BigNumber } from '../util';
import {
  Address,
  SetProtocolConfig
} from '../types/common';

/**
 * @title OracleAPI
 * @author Set Protocol
 *
 * A library for reading oracles
 */
export class OracleAPI {
  private movingAverageOracleWrapper: MovingAverageOracleWrapper;
  private medianizer: MedianizerWrapper;
  private protocolViewer: ProtocolViewerWrapper;

  /**
   * Instantiates a new OracleAPI instance that contains methods for interacting with and updating price oracles
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   */
  constructor(web3: Web3, config: SetProtocolConfig) {
    this.movingAverageOracleWrapper = new MovingAverageOracleWrapper(web3);
    this.medianizer = new MedianizerWrapper(web3);
    this.protocolViewer = new ProtocolViewerWrapper(web3, config.protocolViewerAddress);
  }

  /**
   * Returns the current price feed price
   *
   * @param medianizerAddress    Address of the medianizer to ping
   * @return                     Price in base decimal of the asset represented by the medianizer
   */
  public async getFeedPriceAsync(medianizerAddress: Address): Promise<BigNumber> {
    const medianizerUpdateHex = await this.medianizer.read(medianizerAddress);

    return new BigNumber(medianizerUpdateHex);
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

  /**
   * Returns the current price feed price
   *
   * @param oracleAddresses      Addresseses of oracles to read
   * @return                     Price in 18 decimal of the asset
   */
  public async getOraclePricesAsync(oracleAddresses: Address[]): Promise<BigNumber[]> {
    return await this.protocolViewer.batchFetchOraclePrices(oracleAddresses);
  }
}

