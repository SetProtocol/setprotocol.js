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

import {
  BaseContract,
  DailyPriceFeedContract,
  MovingAverageOracleContract
} from 'set-protocol-strategies';

import { Address } from '../../types/common';

/**
 * @title ContractWrapper
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
export class ContractWrapper {
  private web3: Web3;
  private cache: { [contractName: string]: BaseContract };

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.cache = {};
  }

  /**
   * Load a DailyPriceFeed contract
   *
   * @param  dailyPriceFeed               Address of the DailyPriceFeed contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The DailyPriceFeed Contract
   */
  public async loadDailyPriceFeedContract(
    dailyPriceFeed: Address,
    transactionOptions: object = {},
  ): Promise<DailyPriceFeedContract> {
    const cacheKey = `DailyPriceFeed_${dailyPriceFeed}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as DailyPriceFeedContract;
    } else {
      const dailyPriceFeedContract = await DailyPriceFeedContract.at(
        dailyPriceFeed,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = dailyPriceFeedContract;
      return dailyPriceFeedContract;
    }
  }

  /**
   * Load a MovingAverageOracle contract
   *
   * @param  movingAveragesOracle         Address of the MovingAveragesOracle contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The MovingAveragesOracle Contract
   */
  public async loadMovingAverageOracleContract(
    movingAveragesOracle: Address,
    transactionOptions: object = {},
  ): Promise<MovingAverageOracleContract> {
    const cacheKey = `MovingAverageOracle_${movingAveragesOracle}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as MovingAverageOracleContract;
    } else {
      const movingAverageOracleContract = await MovingAverageOracleContract.at(
        movingAveragesOracle,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = movingAverageOracleContract;
      return movingAverageOracleContract;
    }
  }
}
