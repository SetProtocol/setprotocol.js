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

import * as Web3 from 'web3';

import { Assertions } from '../assertions';
import {
  ContractWrapper,
  CoreContract,
  SetTokenContract,
  VaultContract,
} from '../contracts';
import { Address } from 'set-protocol-utils';

/**
 * @title ContractsAPI
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
export class ContractsAPI {
  private web3: Web3;
  private assert: Assertions;
  private cache: { [contractName: string]: ContractWrapper };

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.cache = {};
    this.assert = new Assertions(this.web3);
  }

  /**
   * Load Core contract
   *
   * @param  coreAddress        Address of the Core contract
   * @param  transactionOptions Options sent into the contract deployed method
   * @return                    The Core Contract
   */
  public async loadCoreAsync(
    coreAddress: Address,
    transactionOptions: object = {},
  ): Promise<CoreContract> {
    this.assert.schema.isValidAddress('coreAddress', coreAddress);
    const cacheKey = this.getCoreCacheKey(coreAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as CoreContract;
    } else {
      const coreContract = await CoreContract.at(coreAddress, this.web3, transactionOptions);
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
    setTokenAddress: Address,
    transactionOptions: object = {},
  ): Promise<SetTokenContract> {
    this.assert.schema.isValidAddress('setTokenAddress', setTokenAddress);
    const cacheKey = this.getSetTokenCacheKey(setTokenAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as SetTokenContract;
    } else {
      const setTokenContract = await SetTokenContract.at(
        setTokenAddress,
        this.web3,
        transactionOptions,
      );
      await this.assert.setToken.implementsSetToken(setTokenContract);
      this.cache[cacheKey] = setTokenContract;
      return setTokenContract;
    }
  }

  /**
   * Load Vault contract
   *
   * @param  vaultAddress       Address of the Vault contract
   * @param  transactionOptions Options sent into the contract deployed method
   * @return                    The Vault Contract
   */
  public async loadVaultAsync(
    vaultAddress: Address,
    transactionOptions: object = {},
  ): Promise<VaultContract> {
    this.assert.schema.isValidAddress('vaultAddress', vaultAddress);
    const cacheKey = this.getVaultCacheKey(vaultAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as VaultContract;
    } else {
      const vaultContract = await VaultContract.at(vaultAddress, this.web3, transactionOptions);
      this.cache[cacheKey] = vaultContract;
      return vaultContract;
    }
  }

  /**
   * Creates a string used for accessing values in the core cache
   *
   * @param  coreAddress Address of the Core contract to use
   * @return             The cache key
   */
  private getCoreCacheKey(coreAddress: Address): string {
    return `Core_${coreAddress}`;
  }

  /**
   * Creates a string used for accessing values in the set token cache
   *
   * @param  setTokenAddress Address of the Set Token contract to use
   * @return                 The cache key
   */
  private getSetTokenCacheKey(setTokenAddress: Address): string {
    return `SetToken_${setTokenAddress}`;
  }

  /**
   * Creates a string used for accessing values in the vault cache
   *
   * @param  vaultAddress Address of the Vault contract to use
   * @return              The cache key
   */
  private getVaultCacheKey(vaultAddress: Address): string {
    return `Vault_${vaultAddress}`;
  }
}
