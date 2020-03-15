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

import Web3 from 'web3';

import { Address } from '../../types/common';
import { BigNumber } from '../../util';
import { ProtocolContractWrapper } from './ProtocolContractWrapper';

/**
 * @title  PerformanceFeeCalculatorWrapper
 * @author Set Protocol
 *
 * The PerformanceFeeCalculatorWrapper handles all functions on the Protocol Viewer smart contract.
 *
 */
export class PerformanceFeeCalculatorWrapper {
  private web3: Web3;
  private contracts: ProtocolContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ProtocolContractWrapper(this.web3);
  }

  /**
   * Fetches maximumProfitFeePercentage of PerformanceFeeCalculator.
   *
   * @param  performanceFeeCalculatorAddress     Address of the PerformanceFeeCalculator contract
   */
  public async maximumProfitFeePercentage(
    performanceFeeCalculatorAddress: Address
  ): Promise<BigNumber> {
    const performanceFeeCalculatorInstance = await this.contracts.loadPerformanceFeeCalculatorContract(
      performanceFeeCalculatorAddress
    );

    return await performanceFeeCalculatorInstance.maximumProfitFeePercentage.callAsync();
  }

  /**
   * Fetches maximumProfitFeePercentage of PerformanceFeeCalculator.
   *
   * @param  performanceFeeCalculatorAddress     Address of the PerformanceFeeCalculator contract
   */
  public async maximumStreamingFeePercentage(
    performanceFeeCalculatorAddress: Address
  ): Promise<BigNumber> {
    const performanceFeeCalculatorInstance = await this.contracts.loadPerformanceFeeCalculatorContract(
      performanceFeeCalculatorAddress
    );

    return await performanceFeeCalculatorInstance.maximumStreamingFeePercentage.callAsync();
  }
}