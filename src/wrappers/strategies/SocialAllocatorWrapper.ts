/*
  Copyright 2020 Set Labs Inc.

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
import { Address } from '../../types/common';

/**
 * @title  SocialAllocatorWrapper
 * @author Set Protocol
 *
 * The SocialAllocatorWrapper handles all functions on the SocialAllocator contract
 *
 */
export class SocialAllocatorWrapper {
  public web3: Web3;
  public contracts: StrategyContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new StrategyContractWrapper(this.web3);
  }

  /**
   * Get base asset of a social allocator
   *
   * @param  socialAllocator              Address of the SocialAllocator contract
   * @return                              Base asset addresss
   */
  public async baseAsset(
    allocatorAddress: Address,
  ): Promise<Address> {
    const allocatorInstance = await this.contracts.loadSocialAllocatorContractAsync(
      allocatorAddress
    );

    return allocatorInstance.baseAsset.callAsync();
  }

  /**
   * Get quote asset of a social allocator
   *
   * @param  socialAllocator              Address of the SocialAllocator contract
   * @return                              Quote asset addresss
   */
  public async quoteAsset(
    allocatorAddress: Address,
  ): Promise<Address> {
    const allocatorInstance = await this.contracts.loadSocialAllocatorContractAsync(
      allocatorAddress
    );

    return allocatorInstance.quoteAsset.callAsync();
  }
}