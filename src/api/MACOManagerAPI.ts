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

import * as _ from 'lodash';
import Web3 from 'web3';

import { BigNumber } from '../util';
import {
  MACOStrategyManagerWrapper,
  MovingAverageOracleWrapper,
  PriceFeedWrapper,
  SetTokenWrapper,
  RebalancingSetTokenWrapper,
} from '../wrappers';
import { Assertions } from '../assertions';
import { ONE_HOUR_IN_SECONDS } from '../constants';
import { Address, Tx } from '../types/common';
import { MovingAverageManagerDetails } from '../types/strategies';

const TWELVE_HOURS = ONE_HOUR_IN_SECONDS.mul(12);
const SIX_HOURS = ONE_HOUR_IN_SECONDS.mul(6);

/**
 * @title MACOManagerAPI
 * @author Set Protocol
 *
 * A library for interacting with MovingAverageManager Manager
 */
export class MACOManagerAPI {
  private assert: Assertions;
  private setToken: SetTokenWrapper;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private macoStrategyManager: MACOStrategyManagerWrapper;
  private priceFeed: PriceFeedWrapper;
  private movingAverageOracleWrapper: MovingAverageOracleWrapper;

  /**
   * Instantiates a new MACOManagerAPI instance that contains methods for interacting with
   * the Moving Average Crossover Manager.
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   * @param core        An instance of CoreWrapper to interact with the deployed Core contract
   */
  constructor(web3: Web3, assertions: Assertions) {
    this.macoStrategyManager = new MACOStrategyManagerWrapper(web3);
    this.assert = assertions;
    this.setToken = new SetTokenWrapper(web3);
    this.priceFeed = new PriceFeedWrapper(web3);
    this.movingAverageOracleWrapper = new MovingAverageOracleWrapper(web3);
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(web3);
  }

  /**
   * This function is callable by anyone to advance the state of the Moving Average Crossover (MACO) manager.
   * To successfully call propose, the rebalancing Set must be in a rebalancable state and there must
   * be a crossover between the current price and the moving average oracle.
   * To successfully generate a proposal, this function needs to be called twice. The initial call is to
   * note that a crossover has occurred. The second call is to confirm the signal (must be called 6-12 hours)
   * after the initial call. When the confirmPropose is called, this function will generate
   * a proposal on the rebalancing set token.
   *
   * @param  macoManager   Address of the Moving Average Crossover Manager contract
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async initiateCrossoverProposeAsync(macoManager: Address, txOpts: Tx): Promise<string> {
    // Check that the price has indeed experienced a crossover
    await this.assertPropose(macoManager);

    await this.assertInitialPropose(macoManager);

    // If current timestamp > 12 hours since the last, call initialPropose
    return await this.macoStrategyManager.initialPropose(macoManager, txOpts);
  }

  public async confirmCrossoverProposeAsync(macoManager: Address, txOpts: Tx): Promise<string> {
    // Check that the price has indeed experienced a crossover
    await this.assertPropose(macoManager);

    await this.assertConfirmPropose(macoManager);

    return await this.macoStrategyManager.confirmPropose(macoManager, txOpts);
  }

  /**
   * Fetches the lastCrossoverConfirmationTimestamp of the Moving Average Crossover Manager contract.
   *
   * @param  macoManager         Address of the Moving Average Crossover Manager contract
   * @return                     BigNumber containing the lastCrossoverConfirmationTimestamp
   */
  public async getLastCrossoverConfirmationTimestampAsync(macoManager: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress('macoManager', macoManager);

    return await this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManager);
  }

  /**
   * Fetches the state variables of the Moving Average Crossover Manager contract.
   *
   * @param  macoManager         Address of the Moving Average Crossover Manager contract
   * @return                     Object containing the state information related to the manager
   */
  public async getMovingAverageManagerDetailsAsync(macoManager: Address): Promise<MovingAverageManagerDetails> {
    const [
      auctionLibrary,
      auctionTimeToPivot,
      core,
      lastCrossoverConfirmationTimestamp,
      movingAverageDays,
      movingAveragePriceFeed,
      rebalancingSetToken,
    ] = await Promise.all([
      this.macoStrategyManager.auctionLibrary(macoManager),
      this.macoStrategyManager.auctionTimeToPivot(macoManager),
      this.macoStrategyManager.coreAddress(macoManager),
      this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManager),
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
      crossoverConfirmationMinTime,
      crossoverConfirmationMaxTime,
    ] = await Promise.all([
      this.macoStrategyManager.riskAssetAddress(macoManager),
      this.macoStrategyManager.riskCollateralAddress(macoManager),
      this.macoStrategyManager.setTokenFactory(macoManager),
      this.macoStrategyManager.stableAssetAddress(macoManager),
      this.macoStrategyManager.stableCollateralAddress(macoManager),
      this.macoStrategyManager.crossoverConfirmationMinTime(macoManager),
      this.macoStrategyManager.crossoverConfirmationMaxTime(macoManager),
    ]);

    return {
      auctionLibrary,
      auctionTimeToPivot,
      core,
      lastCrossoverConfirmationTimestamp,
      movingAverageDays,
      movingAveragePriceFeed,
      rebalancingSetToken,
      riskAsset,
      riskCollateral,
      setTokenFactory,
      stableAsset,
      stableCollateral,
      crossoverConfirmationMinTime,
      crossoverConfirmationMaxTime,
    } as MovingAverageManagerDetails;
  }

  /* ============ Private Functions ============ */

  private async assertPropose(macoManagerAddress: Address) {
    this.assert.schema.isValidAddress('macoManagerAddress', macoManagerAddress);

    const [
      rebalancingSetAddress,
      movingAverageDays,
      movingAveragePriceFeed,
      isUsingRiskCollateral,
    ] = await Promise.all([
      this.macoStrategyManager.rebalancingSetTokenAddress(macoManagerAddress),
      this.macoStrategyManager.movingAverageDays(macoManagerAddress),
      this.macoStrategyManager.movingAveragePriceFeed(macoManagerAddress),
      this.isUsingRiskComponent(macoManagerAddress),
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

    const currentPriceBN = new BigNumber(currentPrice);
    const movingAverageBN = new BigNumber(movingAverage);

    if (isUsingRiskCollateral) {
      // Assert currentPrice < moving average
      this.assert.common.isGreaterThan(
        movingAverageBN,
        currentPriceBN,
        `Current Price ${currentPriceBN.toString()} must be less than Moving Average ${movingAverageBN.toString()}`
      );
    } else {
      // Assert currentPrice > moving average
      this.assert.common.isGreaterThan(
        currentPriceBN,
        movingAverageBN,
        `Current Price ${currentPriceBN.toString()} must be greater than Moving Average ${movingAverageBN.toString()}`
      );
    }
  }

  private async assertInitialPropose(macoManagerAddress: Address) {
    const currentTimeStampInSeconds = new BigNumber(Date.now()).div(1000);
    const lastCrossoverConfirmationTimestamp = (
      await this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManagerAddress)
    );
    const lessThanTwelveHoursElapsed = currentTimeStampInSeconds.minus(
      lastCrossoverConfirmationTimestamp).lt(TWELVE_HOURS);
    if (lessThanTwelveHoursElapsed) {
      throw new Error('Less than 12 hours has elapsed since the last proposal timestamp');
    }
  }

  private async assertConfirmPropose(macoManagerAddress: Address) {
    // Check the current block.timestamp
    const currentTimeStampInSeconds = new BigNumber(Date.now()).div(1000);
    const lastCrossoverConfirmationTimestamp = (
      await this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManagerAddress)
    );
    const moreThanTwelveHoursElapsed = currentTimeStampInSeconds.minus(
      lastCrossoverConfirmationTimestamp).gt(TWELVE_HOURS);
    const lessThanSixHoursElapsed = currentTimeStampInSeconds.minus(lastCrossoverConfirmationTimestamp).lt(SIX_HOURS);

    if (moreThanTwelveHoursElapsed || lessThanSixHoursElapsed) {
      // If the current timestamp >6 and <12 hours since last call, call confirmPropose
      throw new Error('Confirm Crossover Propose is not called 6-12 hours since last proposal timestamp');
    }
  }

  private async isUsingRiskComponent(macoManagerAddress: Address): Promise<boolean> {
    const [
      rebalancingSetToken,
      riskComponent,
    ] = await Promise.all([
      this.macoStrategyManager.rebalancingSetTokenAddress(macoManagerAddress),
      this.macoStrategyManager.riskAssetAddress(macoManagerAddress),
    ]);

    const rebalancingSetCurrentCollateral = await this.rebalancingSetToken.currentSet(rebalancingSetToken);
    const [collateralComponent] = await this.setToken.getComponents(rebalancingSetCurrentCollateral);

    return riskComponent.toLowerCase() === collateralComponent.toLowerCase();
  }
}
