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

import { BigNumber } from '../util';
import {
  BTCETHRebalancingManagerWrapper,
  MACOStrategyManagerWrapper,
  MovingAverageOracleWrapper,
  PriceFeedWrapper,
  SetTokenWrapper,
  RebalancingSetTokenWrapper,
} from '../wrappers';
import { Assertions } from '../assertions';
import { Address, Tx } from '../types/common';
import {
  MovingAverageManagerDetails,
  RebalancingManagerDetails
} from '../types/strategies';

/**
 * @title RebalancingManagerAPI
 * @author Set Protocol
 *
 * A library for interacting with Rebalancing Manager
 */
export class RebalancingManagerAPI {
  private assert: Assertions;
  private setToken: SetTokenWrapper;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private priceFeed: PriceFeedWrapper;
  private movingAverageOracleWrapper: MovingAverageOracleWrapper;

  private btcEthRebalancingManager: BTCETHRebalancingManagerWrapper;
  private macoStrategyManager: MACOStrategyManagerWrapper;

  /**
   * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   */
  constructor(web3: Web3, assertions: Assertions) {
    this.btcEthRebalancingManager = new BTCETHRebalancingManagerWrapper(web3);
    this.macoStrategyManager = new MACOStrategyManagerWrapper(web3);

    this.assert = assertions;
    this.setToken = new SetTokenWrapper(web3);
    this.priceFeed = new PriceFeedWrapper(web3);
    this.movingAverageOracleWrapper = new MovingAverageOracleWrapper(web3);
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(web3);
  }

  /**
   * Calls the propose function on a specified rebalancing manager and rebalancing set token.
   * This function will generate a new set token using data from the btc and eth price feeds and ultimately generate
   * a proposal on the rebalancing set token.
   *
   * @param  rebalancingManager    Address of the BTCETH Rebalancing Manager contract
   * @param  rebalancingSet        Rebalancing Set to call propose on
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async proposeAsync(rebalancingManager: Address, rebalancingSet: Address, txOpts: Tx): Promise<string> {
    return await this.btcEthRebalancingManager.propose(rebalancingManager, rebalancingSet, txOpts);
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
    await this.assertInitialPropose(macoManager);

    // If current timestamp > 12 hours since the last, call initialPropose
    return await this.macoStrategyManager.initialPropose(macoManager, txOpts);
  }

  public async confirmCrossoverProposeAsync(macoManager: Address, txOpts: Tx): Promise<string> {
    await this.assertConfirmPropose(macoManager);

    return await this.macoStrategyManager.confirmPropose(macoManager, txOpts);
  }

  /**
   * Fetches the state variables of the Rebalancing Manager contract.
   *
   * @param  rebalancingManager    Address of the BTCETH Rebalancing Manager contract
   * @return               Object containing the state information related to the rebalancing manager
   */
  public async getRebalancingManagerDetailsAsync(rebalancingManager: Address): Promise<RebalancingManagerDetails> {
    const [
      core,
      btcPriceFeed,
      ethPriceFeed,
      btcAddress,
      ethAddress,
      setTokenFactory,
      btcMultiplier,
      ethMultiplier,
      auctionLibrary,
      auctionTimeToPivot,
    ] = await Promise.all([
      this.btcEthRebalancingManager.core(rebalancingManager),
      this.btcEthRebalancingManager.btcPriceFeed(rebalancingManager),
      this.btcEthRebalancingManager.ethPriceFeed(rebalancingManager),
      this.btcEthRebalancingManager.btcAddress(rebalancingManager),
      this.btcEthRebalancingManager.ethAddress(rebalancingManager),
      this.btcEthRebalancingManager.setTokenFactory(rebalancingManager),
      this.btcEthRebalancingManager.btcMultiplier(rebalancingManager),
      this.btcEthRebalancingManager.ethMultiplier(rebalancingManager),
      this.btcEthRebalancingManager.auctionLibrary(rebalancingManager),
      this.btcEthRebalancingManager.auctionTimeToPivot(rebalancingManager),
    ]);

    return {
      core,
      btcPriceFeed,
      ethPriceFeed,
      btcAddress,
      ethAddress,
      setTokenFactory,
      btcMultiplier,
      ethMultiplier,
      auctionLibrary,
      auctionTimeToPivot,
    } as RebalancingManagerDetails;
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

  private async assertInitialPropose(macoManagerAddress: Address) {
    await this.assertPropose(macoManagerAddress);


    const currentTimeStampInSeconds = new BigNumber(Date.now()).div(1000);
    const lastCrossoverConfirmationTimestamp =
      await this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManagerAddress);
    const crossoverConfirmationMaxTime =
      await this.macoStrategyManager.crossoverConfirmationMaxTime(macoManagerAddress);

    const lessThanTwelveHoursElapsed = currentTimeStampInSeconds.minus(
      lastCrossoverConfirmationTimestamp).lt(crossoverConfirmationMaxTime);
    if (lessThanTwelveHoursElapsed) {
      throw new Error('Less than max confirm time has elapsed since the last proposal timestamp');
    }
  }

  private async assertConfirmPropose(macoManagerAddress: Address) {
    await this.assertPropose(macoManagerAddress);

    // Check the current block.timestamp
    const currentTimeStampInSeconds = new BigNumber(Date.now()).div(1000);
    const [
      lastCrossoverConfirmationTimestamp,
      crossoverConfirmationMaxTime,
      crossoverConfirmationMinTime,
    ] = await Promise.all([
      this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManagerAddress),
      this.macoStrategyManager.crossoverConfirmationMaxTime(macoManagerAddress),
      this.macoStrategyManager.crossoverConfirmationMinTime(macoManagerAddress),
    ]);

    const moreThanTwelveHoursElapsed = currentTimeStampInSeconds.minus(
      lastCrossoverConfirmationTimestamp).gt(crossoverConfirmationMaxTime);
    const lessThanSixHoursElapsed = currentTimeStampInSeconds
                                      .minus(lastCrossoverConfirmationTimestamp)
                                      .lt(crossoverConfirmationMinTime);

    if (moreThanTwelveHoursElapsed || lessThanSixHoursElapsed) {
      // If the current timestamp min confirm and max confirm time since last call, call confirmPropose
      throw new Error(
        'Confirm Crossover Propose is not called in the confirmation period since last proposal timestamp'
      );
    }
  }

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
