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

import * as _ from 'lodash';
import Web3 from 'web3';

import { BigNumber } from '@src/util';
import {
  MACOStrategyManagerWrapper,
  MovingAverageOracleWrapper,
  PriceFeedWrapper,
  SetTokenWrapper,
} from '../wrappers';
import { Assertions } from '../assertions';
import { Address, Tx } from '../types/common';
import { MovingAverageManagerDetails } from '../types/strategies';

/**
 * @title MACOManagerAPI
 * @author Set Protocol
 *
 * A library for interacting with MovingAverageManager Manager
 */
export class MACOManagerAPI {
  private assert: Assertions;
  private setToken: SetTokenWrapper;
  private macoStrategyManager: MACOStrategyManagerWrapper;
  private priceFeed: PriceFeedWrapper;
  private movingAverageOracleWrapper: MovingAverageOracleWrapper;

  /**
   * Instantiates a new MACOManagerAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   * @param core        An instance of CoreWrapper to interact with the deployed Core contract
   */
  constructor(web3: Web3, assertions: Assertions, ) {
    this.macoStrategyManager = new MACOStrategyManagerWrapper(web3);
    this.assert = assertions;
    this.setToken = new SetTokenWrapper(web3);
    this.priceFeed = new PriceFeedWrapper(web3);
    this.movingAverageOracleWrapper = new MovingAverageOracleWrapper(web3);
  }

  /**
   * Depending on the current state of the collateral Set, calls the initialPropose or confirmPropose
   * function on a specified moving
   * average crossover manager.
   * TODO: document that there is an initialPropose state where a timestamp is stored. And
   * This function will generate a new set token using data from the btc and eth price feeds and ultimately generate
   * a proposal on the rebalancing set token.
   *
   * @param  macoManager    Address of the BTCETH Rebalancing Manager contract
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async proposeAsync(macoManager: Address, txOpts: Tx): Promise<string> {
    // Check that the price has indeed experienced a crossover
    await this.assertPropose(macoManager);

    // Check the current block.timestamp
      // If current timestamp > 12 hours since the last, call initialPropose
      // If the current timestamp >6 and <12 hours since last call, call confirmPropose
      // Else throw error

    return await this.macoStrategyManager.initialPropose(rebalancingManager, txOpts);

    return await this.macoStrategyManager.confirmPropose(rebalancingManager, txOpts);
  }

  /**
   * Fetches the state variables of the Moving Average Crossover Manager contract.
   *
   * @param  rebalancingManager    Address of the Moving Average Crossover Manager contract
   * @return               Object containing the state information related to the manager
   */
  public async getMovingAverageManagerDetailsAsync(macoManager: Address): Promise<MovingAverageManagerDetails> {
    const [
      auctionLibrary,
      auctionTimeToPivot,
      core,
      lastProposalTimestamp,
      movingAverageDays,
      movingAveragePriceFeed,
      rebalancingSetToken,
    ] = await Promise.all([
      this.macoStrategyManager.auctionLibrary(macoManager),
      this.macoStrategyManager.auctionTimeToPivot(macoManager),
      this.macoStrategyManager.coreAddress(macoManager),
      this.macoStrategyManager.lastProposalTimestamp(macoManager),
      this.macoStrategyManager.movingAverageDays(macoManager),
      this.macoStrategyManager.movingAveragePriceFeed(macoManager),
      this.macoStrategyManager.rebalancingSetTokenAddress(macoManager),
    ]);

    const [
      riskAsset,
      riskCollateral,
      setTokenFactory,
      stableAsset,
      stableCollateral,
    ] = await Promise.all([
      this.macoStrategyManager.riskAssetAddress(macoManager),
      this.macoStrategyManager.riskCollateralAddress(macoManager),
      this.macoStrategyManager.setTokenFactory(macoManager),
      this.macoStrategyManager.stableAssetAddress(macoManager),
      this.macoStrategyManager.stableCollateralAddress(macoManager),
    ]);

    return {
      auctionLibrary,
      auctionTimeToPivot,
      core,
      lastProposalTimestamp,
      movingAverageDays,
      movingAveragePriceFeed,
      rebalancingSetToken,
      riskAsset,
      riskCollateral,
      setTokenFactory,
      stableAsset,
      stableCollateral,
    } as MovingAverageManagerDetails;
  }

  /* ============ Private Functions ============ */

  private async isUsingRiskCollateral(macoManagerAddress: Address): Promise<boolean> {
    const [
      rebalancingSetAddress,
      riskComponent,
    ] = await Promise.all([
      this.macoStrategyManager.rebalancingSetTokenAddress(macoManagerAddress),
      this.macoStrategyManager.riskAssetAddress(macoManagerAddress),
    ]);

    const [collateralComponent] = await this.setToken.getComponents(rebalancingSetAddress);
    return riskComponent.toLowerCase() === collateralComponent.toLowerCase();
  }

  private async assertPropose(
    macoManagerAddress: Address,
    txOpts: Tx,
  ) {
    this.assert.schema.isValidAddress('macoManagerAddress', macoManagerAddress);

    const [
      rebalancingSetAddress,
      riskComponent,
      movingAverageDays,
      movingAveragePriceFeed,
      isUsingRiskCollateral,
    ] = await Promise.all([
      this.macoStrategyManager.rebalancingSetTokenAddress(macoManagerAddress),
      this.macoStrategyManager.riskAssetAddress(macoManagerAddress),
      this.macoStrategyManager.movingAverageDays(macoManagerAddress),
      this.macoStrategyManager.movingAveragePriceFeed(macoManagerAddress),
      this.isUsingRiskCollateral(macoManagerAddress),
    ]);

    // Assert the rebalancing Set is ready to be proposed
    await this.assert.rebalancing.isNotInDefaultState(rebalancingSetAddress);
    await this.assert.rebalancing.sufficientTimeBetweenRebalance(rebalancingSetAddress);

    // Get the current price
    const riskCollateralPriceFeed = await this.movingAverageOracleWrapper.getSourceMedianizer(movingAveragePriceFeed);

    const [
      currentPrice,
      movingAverage,
    ] = await Promise.all([
      this.priceFeed.read(riskCollateralPriceFeed),
      this.movingAverageOracleWrapper.read(movingAveragePriceFeed, movingAverageDays),
    ]);

    if (isUsingRiskCollateral) {
      // Assert currentPrice < moving average
      this.assert.common.isGreaterThan(
        new BigNumber(movingAverage),
        new BigNumber(currentPrice),
        `Current Price ${currentPrice.toString()} must be less than Moving Average ${movingAverage.toString()}`
      );
    } else {
      // Assert currentPrice > moving average
      this.assert.common.isGreaterThan(
        new BigNumber(currentPrice),
        new BigNumber(movingAverage),
        `Current Price ${currentPrice.toString()} must be greater than Moving Average ${movingAverage.toString()}`
      );
    }
  }
}
