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

"use strict";

import * as _ from "lodash";
import * as Web3 from "web3";

import { Assertions } from "../assertions";
import { BigNumber } from "../util";
import { BaseContract, ContractWrapper, CoreContract, SetTokenContract } from "../contracts";

/**
 * @title ContractsAPI
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
export class ContractsAPI {
  private provider: Web3;
  private assert: Assertions;
  private cache: { [contractName: string]: ContractWrapper };

  public constructor(provider: Web3) {
    this.provider = provider;
    this.cache = {};
    this.assert = new Assertions();
  }

  /**
   * Load Core contract
   *
   * @param  coreAddress        Address of the Core contract
   * @param  transactionOptions Options sent into the contract deployed method
   * @return                    The Core Contract
   */
  public async loadCoreAsync(
    coreAddress: string,
    transactionOptions: object = {},
  ): Promise<CoreContract> {
    this.assert.schema.isValidAddress("coreAddress", coreAddress);
    const cacheKey = this.getCoreCacheKey(coreAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as CoreContract;
    } else {
      const coreContract = await CoreContract.at(coreAddress, this.provider, transactionOptions);
      await this.assert.core.implementsCore(coreContract);
      this.cache[cacheKey] = coreContract;
      return coreContract;
    }
  }

  /**
   * Load Set Token contract
   *
   * @param  setTokenAddress    Address of the Set Token contract
   * @param  transactionOptions Options sent into the contract deployed method
   * @return                    The Set Token Contract
   */
  public async loadSetTokenAsync(
    setTokenAddress: string,
    transactionOptions: object = {},
  ): Promise<SetTokenContract> {
    this.assert.schema.isValidAddress("setTokenAddress", setTokenAddress);
    const cacheKey = this.getSetTokenCacheKey(setTokenAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as SetTokenContract;
    } else {
      const setTokenContract = await SetTokenContract.deployed(this.provider, transactionOptions);
      await this.assert.setToken.implementsSetToken(setTokenContract);
      this.cache[cacheKey] = setTokenContract;
      return setTokenContract;
    }
  }

  /**
   * Creates a string used for accessing values in the core cache
   *
   * @param  coreAddress        Address of the Core contract to use
   * @return                    The cache key
   */
  private getCoreCacheKey(coreAddress: string): string {
    return `Core_${coreAddress}`;
  }

  /**
   * Creates a string used for accessing values in the set token cache
   *
   * @param  setTokenAddress        Address of the Core contract to use
   * @return                    The cache key
   */
  private getSetTokenCacheKey(setTokenAddress: string): string {
    return `SetToken_${setTokenAddress}`;
  }
}
