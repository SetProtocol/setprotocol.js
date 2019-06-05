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
import { Address } from '../../types/common';

/**
 * @title  MovingAverageOracle
 * @author Set Protocol
 *
 * The MovingAverageOracle handles interactions with Set's moving averages oracle
 *
 */
export class MovingAverageOracleWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Fetch the last dataPoints worth of price data from the MovingAverageOracle
   *
   * @param  movingAverageOracleAddress    Address of the moving average oracle to fetch data from
   * @param  dataPoints                    Number of days to fetch price data for
   * @return                               Moving average for passed number of dataPoints returned in bytes
   */
  public async read(movingAverageOracleAddress: Address, dataPoints: BigNumber): Promise<string> {
    const movingAverageOracle = await this.contracts.loadMovingAverageOracleContract(movingAverageOracleAddress);

    return await movingAverageOracle.read.callAsync(dataPoints);
  }
}
