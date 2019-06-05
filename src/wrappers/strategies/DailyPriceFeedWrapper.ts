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

import { ContractWrapper } from '.';
import { BigNumber } from '../../util';
import { Address, Tx } from '../../types/common';

/**
 * @title  DailyPriceFeedWrapper
 * @author Set Protocol
 *
 * The DailyPriceFeedWrapper handles interactions with Set's daily price feed for moving averages
 *
 */
export class DailyPriceFeedWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Fetch the last dataDays worth of price data from the MovingAverageOracle
   *
   * @param  dailyPriceFeedAddress    Address of the DailyPriceFeed contract to update
   * @param  dataDays                 Number of days to fetch price data for
   * @return                          Price data for dataDays count days
   */
  public async read(dailyPriceFeedAddress: Address, dataDays: BigNumber): Promise<BigNumber[]> {
    const dailyPriceFeed = await this.contracts.loadDailyPriceFeedContract(dailyPriceFeedAddress);

    return await dailyPriceFeed.read.callAsync(dataDays);
  }

  /**
   * Fetch the Unix timestamp of the last price feed update
   *
   * @param  dailyPriceFeedAddress    Address of the DailyPriceFeed contract to fetch date from
   * @return                          Unix time te
   */
  public async lastUpdatedAt(dailyPriceFeedAddress: Address): Promise<BigNumber> {
    const dailyPriceFeed = await this.contracts.loadDailyPriceFeedContract(dailyPriceFeedAddress);

    return await dailyPriceFeed.lastUpdatedAt.callAsync();
  }

  /**
   * Updates the price feed to record the current price from another Medianizer oracle
   *
   * @param  dailyPriceFeedAddress    Address of the DailyPriceFeed contract to update
   * @param  txOpts                   The options for executing the transaction
   * @return                          Transaction hash
   */
  public async poke(dailyPriceFeedAddress: Address, txOpts?: Tx): Promise<string> {
    const dailyPriceFeed = await this.contracts.loadDailyPriceFeedContract(dailyPriceFeedAddress);

    return await dailyPriceFeed.poke.sendTransactionAsync(txOpts);
  }
}
