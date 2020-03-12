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
  BaseContract as OracleBaseContract,
  HistoricalPriceFeedContract,
  MovingAverageOracleContract,
  OracleProxyContract,
  TimeSeriesFeedContract,
} from 'set-protocol-oracles';

import {
  AssetPairManagerContract,
  BaseContract as StrategyBaseContract,
  BTCDaiRebalancingManagerContract,
  BTCETHRebalancingManagerContract,
  ETHDaiRebalancingManagerContract,
  MACOStrategyManagerContract,
  MACOStrategyManagerV2Contract,
  SocialTradingManagerContract,
} from 'set-protocol-strategies';

import { Address } from '../../types/common';

/**
 * @title ContractWrapper
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
export class StrategyContractWrapper {
  private web3: Web3;
  private cache: { [contractName: string]: StrategyBaseContract | OracleBaseContract };

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.cache = {};
  }

  /**
   * Load a HistoricalPriceFeed contract
   *
   * @param  historicalPriceFeed          Address of the HistoricalPriceFeed contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The HistoricalPriceFeed Contract
   */
  public async loadHistoricalPriceFeedContract(
    historicalPriceFeed: Address,
    transactionOptions: object = {},
  ): Promise<HistoricalPriceFeedContract> {
    const cacheKey = `HistoricalPriceFeed_${historicalPriceFeed}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as HistoricalPriceFeedContract;
    } else {
      const historicalPriceFeedContract = await HistoricalPriceFeedContract.at(
        historicalPriceFeed,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = historicalPriceFeedContract;
      return historicalPriceFeedContract;
    }
  }

  /**
   * Load a TimeSeriesFeed contract
   *
   * @param  timeSeriesFeed               Address of the TimeSeriesFeed contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The TimeSeriesFeed Contract
   */
  public async loadTimeSeriesFeedContract(
    timeSeriesFeed: Address,
    transactionOptions: object = {},
  ): Promise<TimeSeriesFeedContract> {
    const cacheKey = `TimeSeriesFeed_${timeSeriesFeed}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as TimeSeriesFeedContract;
    } else {
      const timeSeriesFeedContract = await TimeSeriesFeedContract.at(
        timeSeriesFeed,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = timeSeriesFeedContract;
      return timeSeriesFeedContract;
    }
  }

  /**
   * Load a MovingAverageOracle contract
   *
   * @param  oracleProxy         Address of the MovingAveragesOracle contract
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

  /**
   * Load an OracleProxy contract
   *
   * @param  OracleProxy contract         Address of the OracleProxy contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The OracleProxy Contract
   */
  public async loadOracleProxyContract(
    oracleProxy: Address,
    transactionOptions: object = {},
  ): Promise<OracleProxyContract> {
    const cacheKey = `OracleProxy_${oracleProxy}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as OracleProxyContract;
    } else {
      const oracleProxyContract = await OracleProxyContract.at(
        oracleProxy,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = oracleProxyContract;
      return oracleProxyContract;
    }
  }

  /**
   * Load BTCETHManagerContract contract
   *
   * @param  btcEthManagerAddress           Address of the BTCETHRebalancingManagerContract contract
   * @param  transactionOptions             Options sent into the contract deployed method
   * @return                                The BtcEthManagerContract Contract
   */
  public async loadBtcEthManagerContractAsync(
    btcEthManagerAddress: Address,
    transactionOptions: object = {},
  ): Promise<BTCETHRebalancingManagerContract> {
    const cacheKey = `BtcEthManager_${btcEthManagerAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as BTCETHRebalancingManagerContract;
    } else {
      const btcEthRebalancingManagerContract = await BTCETHRebalancingManagerContract.at(
        btcEthManagerAddress,
        this.web3,
        transactionOptions
      );
      this.cache[cacheKey] = btcEthRebalancingManagerContract;
      return btcEthRebalancingManagerContract;
    }
  }

  /**
   * Load a BTCDAIRebalancingManager contract
   *
   * @param  btcDaiManager                Address of the BTCDAIRebalancingManager contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The BTCDAIRebalancingManager Contract
   */
  public async loadBtcDaiManagerContractAsync(
    btcDaiManager: Address,
    transactionOptions: object = {},
  ): Promise<BTCDaiRebalancingManagerContract> {
    const cacheKey = `btcDaiManager_${btcDaiManager}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as BTCDaiRebalancingManagerContract;
    } else {
      const btcDaiRebalancingManagerContract = await BTCDaiRebalancingManagerContract.at(
        btcDaiManager,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = btcDaiRebalancingManagerContract;
      return btcDaiRebalancingManagerContract;
    }
  }

  /**
   * Load a ETHDAIRebalancingManager contract
   *
   * @param  ethDaiManager                Address of the ETHDAIRebalancingManager contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The ETHDAIRebalancingManager Contract
   */
  public async loadEthDaiManagerContractAsync(
    ethDaiManager: Address,
    transactionOptions: object = {},
  ): Promise<ETHDaiRebalancingManagerContract> {
    const cacheKey = `ethDaiManager_${ethDaiManager}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as ETHDaiRebalancingManagerContract;
    } else {
      const ethDaiRebalancingManagerContract = await ETHDaiRebalancingManagerContract.at(
        ethDaiManager,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = ethDaiRebalancingManagerContract;
      return ethDaiRebalancingManagerContract;
    }
  }

  /**
   * Load a MACOStrategyManager contract
   *
   * @param  macoStrategyManager          Address of the MACOStrategyManager contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The MACOStrategyManager Contract
   */
  public async loadMACOStrategyManagerContractAsync(
    macoStrategyManager: Address,
    transactionOptions: object = {},
  ): Promise<MACOStrategyManagerContract> {
    const cacheKey = `macoStrategyManager_${macoStrategyManager}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as MACOStrategyManagerContract;
    } else {
      const macoStrategyManagerContract = await MACOStrategyManagerContract.at(
        macoStrategyManager,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = macoStrategyManagerContract;
      return macoStrategyManagerContract;
    }
  }

  /**
   * Load a MACOStrategyManagerV2 contract
   *
   * @param  macoStrategyManager          Address of the MACOStrategyManager contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The MACOStrategyManager Contract
   */
  public async loadMACOStrategyManagerV2ContractAsync(
    macoStrategyManager: Address,
    transactionOptions: object = {},
  ): Promise<MACOStrategyManagerV2Contract> {
    const cacheKey = `macoStrategyManager_${macoStrategyManager}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as MACOStrategyManagerV2Contract;
    } else {
      const macoStrategyManagerContract = await MACOStrategyManagerV2Contract.at(
        macoStrategyManager,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = macoStrategyManagerContract;
      return macoStrategyManagerContract;
    }
  }

  /**
   * Load a AssetPairManager contract
   *
   * @param  assetPairManager             Address of the AssetPairManager contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The AssetPairManager Contract
   */
  public async loadAssetPairManagerContractAsync(
    assetPairManager: Address,
    transactionOptions: object = {},
  ): Promise<AssetPairManagerContract> {
    const cacheKey = `assetPairManager_${assetPairManager}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as AssetPairManagerContract;
    } else {
      const assetPairManagerContract = await AssetPairManagerContract.at(
        assetPairManager,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = assetPairManagerContract;
      return assetPairManagerContract;
    }
  }

  /**
   * Load a SocialTradingManager contract
   *
   * @param  socialTradingManager         Address of the SocialTradingManager contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The SocialTradingManager Contract
   */
  public async loadSocialTradingManagerContractAsync(
    socialTradingManager: Address,
    transactionOptions: object = {},
  ): Promise<SocialTradingManagerContract> {
    const cacheKey = `socialTradingManager_${socialTradingManager}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as SocialTradingManagerContract;
    } else {
      const socialTradingManagerContract = await SocialTradingManagerContract.at(
        socialTradingManager,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = socialTradingManagerContract;
      return socialTradingManagerContract;
    }
  }
}
