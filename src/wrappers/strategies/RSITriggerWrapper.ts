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
 * @title  RSITriggerWrapper
 * @author Set Protocol
 *
 * The RSITriggerWrapper handles all functions on the RSITrigger smart contract.
 *
 */
export class RSITriggerWrapper {
  private web3: Web3;
  private contracts: StrategyContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new StrategyContractWrapper(this.web3);
  }

  /**
   * Get the oracle the RSITrigger is currently receiving RSI values from
   *
   * @param  rsiTrigger           Address of the RSITrigger
   * @return                      Address supplying RSI values to RSITrigger
   */
  public async rsiOracle(
    rsiTrigger: Address
  ): Promise<Address> {
    const rsiTriggerInstance = await this.contracts.loadRSITriggerContractAsync(rsiTrigger);

    return await rsiTriggerInstance.rsiOracle.callAsync();
  }

  /**
   * Get the lowerBound being used to determine bullish/bearish state for RSI
   *
   * @param  rsiTrigger           Address of the RSITrigger
   * @return                      Lower bound
   */
  public async lowerBound(
    rsiTrigger: Address
  ): Promise<BigNumber> {
    const rsiTriggerInstance = await this.contracts.loadRSITriggerContractAsync(rsiTrigger);

    const bounds = await rsiTriggerInstance.bounds.callAsync();

    return bounds[0];
  }

  /**
   * Get the upperBound being used to determine bullish/bearish state for RSI
   *
   * @param  rsiTrigger           Address of the RSITrigger
   * @return                      Lower bound
   */
  public async upperBound(
    rsiTrigger: Address
  ): Promise<BigNumber> {
    const rsiTriggerInstance = await this.contracts.loadRSITriggerContractAsync(rsiTrigger);

    const bounds = await rsiTriggerInstance.bounds.callAsync();

    return bounds[1];
  }

  /**
   * Get the time period the RSI is being calculated over
   *
   * @param  rsiTrigger           Address of the RSITrigger
   * @return                      Time period RSI is being calculated over
   */
  public async rsiTimePeriod(
    rsiTrigger: Address
  ): Promise<BigNumber> {
    const rsiTriggerInstance = await this.contracts.loadRSITriggerContractAsync(rsiTrigger);

    return await rsiTriggerInstance.rsiTimePeriod.callAsync();
  }
}