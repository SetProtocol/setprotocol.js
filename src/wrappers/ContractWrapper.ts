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
  CoreContract,
  ERC20DetailedContract,
  IssuanceOrderModuleContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenContract,
  SetTokenContract,
  VaultContract,
} from 'set-protocol-contracts';

import { CoreWrapper } from './CoreWrapper';
import { Address } from '../types/common';

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
    const cacheKey = this.getCoreCacheKey(coreAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as CoreContract;
    } else {
      const coreContract = await CoreContract.at(
        coreAddress,
        this.web3,
        transactionOptions,
      );
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
    const cacheKey = this.getSetTokenCacheKey(setTokenAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as SetTokenContract;
    } else {
      const setTokenContract = await SetTokenContract.at(
        setTokenAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = setTokenContract;
      return setTokenContract;
    }
  }

  /**
   * Load Rebalancing Set Token contract
   *
   * @param  rebalancingSetTokenAddress    Address of the Set Token contract
   * @param  transactionOptions            Options sent into the contract deployed method
   * @return                               The Set Token Contract
   */
  public async loadRebalancingSetTokenAsync(
    rebalancingSetTokenAddress: Address,
    transactionOptions: object = {},
  ): Promise<RebalancingSetTokenContract> {
    const cacheKey = this.getRebalancingSetTokenCacheKey(rebalancingSetTokenAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as RebalancingSetTokenContract;
    } else {
      const rebalancingSetTokenContract = await RebalancingSetTokenContract.at(
        rebalancingSetTokenAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = rebalancingSetTokenContract;
      return rebalancingSetTokenContract;
    }
  }

  /**
   * Load ERC20 Token contract
   *
   * @param  tokenAddress    Address of the ERC20 Token contract
   * @param  transactionOptions Options sent into the contract deployed method
   * @return                    The ERC20 Token Contract
   */
  public async loadERC20TokenAsync(
    tokenAddress: Address,
    transactionOptions: object = {},
  ): Promise<ERC20DetailedContract> {
    const cacheKey = this.getERC20TokenCacheKey(tokenAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as ERC20DetailedContract;
    } else {
      const erc20TokenContract = await ERC20DetailedContract.at(
        tokenAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = erc20TokenContract;
      return erc20TokenContract;
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
   * Load Rebalance Auction Module contract
   *
   * @param  rebalanceAuctionModuleAddress       Address of the Rebalance Auction Module contract
   * @param  transactionOptions                  Options sent into the contract deployed method
   * @return                                     The Rebalance Auction Module Contract
   */
  public async loadRebalanceAuctionModuleAsync(
    rebalanceAuctionModuleAddress: Address,
    transactionOptions: object = {},
  ): Promise<RebalanceAuctionModuleContract> {
    const cacheKey = this.getRebalanceAuctionModuleCacheKey(rebalanceAuctionModuleAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as RebalanceAuctionModuleContract;
    } else {
      const rebalanceAuctionModuleContract = await RebalanceAuctionModuleContract.at(
        rebalanceAuctionModuleAddress,
        this.web3,
        transactionOptions
      );
      this.cache[cacheKey] = rebalanceAuctionModuleContract;
      return rebalanceAuctionModuleContract;
    }
  }

  /**
   * Load Issuance Order Module contract
   *
   * @param  issuanceOrderModuleAddress          Address of the Issuance Order Module contract
   * @param  transactionOptions                  Options sent into the contract deployed method
   * @return                                     The Issuance Order Module Contract
   */
  public async loadIssuanceOrderModuleAsync(
    issuanceOrderModuleAddress: Address,
    transactionOptions: object = {},
  ): Promise<IssuanceOrderModuleContract> {
    const cacheKey = this.getIssuanceOrderModuleCacheKey(issuanceOrderModuleAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as IssuanceOrderModuleContract;
    } else {
      const issuanceOrderModuleContract = await IssuanceOrderModuleContract.at(
        issuanceOrderModuleAddress,
        this.web3,
        transactionOptions
      );
      this.cache[cacheKey] = issuanceOrderModuleContract;
      return issuanceOrderModuleContract;
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
   * Creates a string used for accessing values in the rebalancing set token cache
   *
   * @param  rebalancingSetTokenAddress Address of the Set Token contract to use
   * @return                            The cache key
   */
  private getRebalancingSetTokenCacheKey(rebalancingSetTokenAddress: Address): string {
    return `RebalancingSetToken_${rebalancingSetTokenAddress}`;
  }

  /**
   * Creates a string used for accessing values in the ERC20 token cache
   *
   * @param  tokenAddress Address of the ERC20 Token contract to use
   * @return                 The cache key
   */
  private getERC20TokenCacheKey(tokenAddress: Address): string {
    return `ERC20Token_${tokenAddress}`;
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

  /**
   * Creates a string used for accessing values in the issuance order module cache
   *
   * @param  issuanceOrderModuleAddress Address of the Vault contract to use
   * @return                            The cache key
   */
  private getIssuanceOrderModuleCacheKey(issuanceOrderModuleAddress: Address): string {
    return `IssuanceOrderModule_${issuanceOrderModuleAddress}`;
  }

  /**
   * Creates a string used for accessing values in the rebalance auction module cache
   *
   * @param  rebalanceAuctionModuleAddress Address of the Vault contract to use
   * @return                               The cache key
   */
  private getRebalanceAuctionModuleCacheKey(rebalanceAuctionModuleAddress: Address): string {
    return `RebalanceAuctionModule_${rebalanceAuctionModuleAddress}`;
  }
}
