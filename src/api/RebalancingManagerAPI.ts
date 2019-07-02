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
  BTCDAIRebalancingManagerWrapper,
  BTCETHRebalancingManagerWrapper,
  ETHDAIRebalancingManagerWrapper,
  MACOStrategyManagerWrapper,
  MovingAverageOracleWrapper,
  PriceFeedWrapper,
  SetTokenWrapper,
  RebalancingSetTokenWrapper,
} from '../wrappers';
import { Assertions } from '../assertions';
import { Address, ManagerType, Tx } from '../types/common';
import {
  DAI_FULL_TOKEN_UNITS,
  DAI_PRICE,
  SET_FULL_TOKEN_UNITS,
  VALUE_TO_CENTS_CONVERSION,
  WBTC_FULL_TOKEN_UNITS,
  WETH_FULL_TOKEN_UNITS,
} from '../constants';
import {
  BTCDAIRebalancingManagerDetails,
  BTCETHRebalancingManagerDetails,
  ETHDAIRebalancingManagerDetails,
  MovingAverageManagerDetails,
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
  private btcDaiRebalancingManager: BTCDAIRebalancingManagerWrapper;
  private ethDaiRebalancingManager: ETHDAIRebalancingManagerWrapper;
  private macoStrategyManager: MACOStrategyManagerWrapper;

  /**
   * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   */
  constructor(web3: Web3, assertions: Assertions) {
    this.btcEthRebalancingManager = new BTCETHRebalancingManagerWrapper(web3);
    this.btcDaiRebalancingManager = new BTCDAIRebalancingManagerWrapper(web3);
    this.ethDaiRebalancingManager = new ETHDAIRebalancingManagerWrapper(web3);
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
   * @param  managerType           BigNumber indicating which kind of manager is being called
   * @param  rebalancingManager    Address of the BTCETH Rebalancing Manager contract
   * @param  rebalancingSet        Rebalancing Set to call propose on
   * @param  txOpts                Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return                       Transaction hash
   */
  public async proposeAsync(
    managerType: BigNumber,
    rebalancingManager: Address,
    rebalancingSet: Address,
    txOpts: Tx
  ): Promise<string> {
    await this.assertPropose(rebalancingManager, rebalancingSet);

    if (managerType == ManagerType.BTCETH) {
      await this.assertBTCETHPriceTrigger(rebalancingManager, rebalancingSet);
      return await this.btcEthRebalancingManager.propose(rebalancingManager, rebalancingSet, txOpts);
    } else if (managerType == ManagerType.BTCDAI) {
      await this.assertBTCDAIPriceTrigger(rebalancingManager, rebalancingSet);
      return await this.btcDaiRebalancingManager.propose(rebalancingManager, rebalancingSet, txOpts);
    } else if (managerType == ManagerType.ETHDAI) {
      await this.assertETHDAIPriceTrigger(rebalancingManager, rebalancingSet);
      return await this.ethDaiRebalancingManager.propose(rebalancingManager, rebalancingSet, txOpts);
    } else {
      throw new Error('Passed manager type is not recognized.');
    }
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
   * Fetches the state variables of the BTCETH Rebalancing Manager contract.
   *
   * @param  rebalancingManager    Address of the BTCETH Rebalancing Manager contract
   * @return                       Object containing the state information related to the rebalancing manager
   */
  public async getBTCETHRebalancingManagerDetailsAsync(
    rebalancingManager: Address
  ): Promise<BTCETHRebalancingManagerDetails> {
    const [
      core,
      btcPriceFeed,
      ethPriceFeed,
      btcAddress,
      ethAddress,
      setTokenFactory,
      btcMultiplier,
      ethMultiplier,
    ] = await Promise.all([
      this.btcEthRebalancingManager.core(rebalancingManager),
      this.btcEthRebalancingManager.btcPriceFeed(rebalancingManager),
      this.btcEthRebalancingManager.ethPriceFeed(rebalancingManager),
      this.btcEthRebalancingManager.btcAddress(rebalancingManager),
      this.btcEthRebalancingManager.ethAddress(rebalancingManager),
      this.btcEthRebalancingManager.setTokenFactory(rebalancingManager),
      this.btcEthRebalancingManager.btcMultiplier(rebalancingManager),
      this.btcEthRebalancingManager.ethMultiplier(rebalancingManager),
    ]);

    const [
      auctionLibrary,
      auctionTimeToPivot,
      maximumLowerThreshold,
      minimumUpperThreshold,
    ] = await Promise.all([
      this.btcEthRebalancingManager.auctionLibrary(rebalancingManager),
      this.btcEthRebalancingManager.auctionTimeToPivot(rebalancingManager),
      this.btcEthRebalancingManager.maximumLowerThreshold(rebalancingManager),
      this.btcEthRebalancingManager.minimumUpperThreshold(rebalancingManager),
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
      maximumLowerThreshold,
      minimumUpperThreshold,
    } as BTCETHRebalancingManagerDetails;
  }

  /**
   * Fetches the state variables of the BTCDAI Rebalancing Manager contract.
   *
   * @param  rebalancingManager    Address of the BTCDAI Rebalancing Manager contract
   * @return                       Object containing the state information related to the rebalancing manager
   */
  public async getBTCDAIRebalancingManagerDetailsAsync(
    rebalancingManager: Address
  ): Promise<BTCDAIRebalancingManagerDetails> {
    const [
      core,
      btcPriceFeed,
      btcAddress,
      daiAddress,
      setTokenFactory,
      btcMultiplier,
      daiMultiplier,
    ] = await Promise.all([
      this.btcDaiRebalancingManager.core(rebalancingManager),
      this.btcDaiRebalancingManager.btcPriceFeed(rebalancingManager),
      this.btcDaiRebalancingManager.btcAddress(rebalancingManager),
      this.btcDaiRebalancingManager.daiAddress(rebalancingManager),
      this.btcDaiRebalancingManager.setTokenFactory(rebalancingManager),
      this.btcDaiRebalancingManager.btcMultiplier(rebalancingManager),
      this.btcDaiRebalancingManager.daiMultiplier(rebalancingManager),
    ]);

    const [
      auctionLibrary,
      auctionTimeToPivot,
      maximumLowerThreshold,
      minimumUpperThreshold,
    ] = await Promise.all([
      this.btcDaiRebalancingManager.auctionLibrary(rebalancingManager),
      this.btcDaiRebalancingManager.auctionTimeToPivot(rebalancingManager),
      this.btcDaiRebalancingManager.maximumLowerThreshold(rebalancingManager),
      this.btcDaiRebalancingManager.minimumUpperThreshold(rebalancingManager),
    ]);

    return {
      core,
      btcPriceFeed,
      btcAddress,
      daiAddress,
      setTokenFactory,
      btcMultiplier,
      daiMultiplier,
      auctionLibrary,
      auctionTimeToPivot,
      maximumLowerThreshold,
      minimumUpperThreshold,
    } as BTCDAIRebalancingManagerDetails;
  }

  /**
   * Fetches the state variables of the ETHDAI Rebalancing Manager contract.
   *
   * @param  rebalancingManager    Address of the ETHDAI Rebalancing Manager contract
   * @return                       Object containing the state information related to the rebalancing manager
   */
  public async getETHDAIRebalancingManagerDetailsAsync(
    rebalancingManager: Address
  ): Promise<ETHDAIRebalancingManagerDetails> {
    const [
      core,
      ethPriceFeed,
      ethAddress,
      daiAddress,
      setTokenFactory,
      ethMultiplier,
      daiMultiplier,
    ] = await Promise.all([
      this.ethDaiRebalancingManager.core(rebalancingManager),
      this.ethDaiRebalancingManager.ethPriceFeed(rebalancingManager),
      this.ethDaiRebalancingManager.ethAddress(rebalancingManager),
      this.ethDaiRebalancingManager.daiAddress(rebalancingManager),
      this.ethDaiRebalancingManager.setTokenFactory(rebalancingManager),
      this.ethDaiRebalancingManager.ethMultiplier(rebalancingManager),
      this.ethDaiRebalancingManager.daiMultiplier(rebalancingManager),
    ]);

    const [
      auctionLibrary,
      auctionTimeToPivot,
      maximumLowerThreshold,
      minimumUpperThreshold,
    ] = await Promise.all([
      this.ethDaiRebalancingManager.auctionLibrary(rebalancingManager),
      this.ethDaiRebalancingManager.auctionTimeToPivot(rebalancingManager),
      this.ethDaiRebalancingManager.maximumLowerThreshold(rebalancingManager),
      this.ethDaiRebalancingManager.minimumUpperThreshold(rebalancingManager),
    ]);

    return {
      core,
      ethPriceFeed,
      ethAddress,
      daiAddress,
      setTokenFactory,
      ethMultiplier,
      daiMultiplier,
      auctionLibrary,
      auctionTimeToPivot,
      maximumLowerThreshold,
      minimumUpperThreshold,
    } as ETHDAIRebalancingManagerDetails;
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

  private async assertPropose(managerAddress: Address, rebalancingSetAddress: Address) {
    // Assert a valid RebalancingSetToken is being passed in
    const coreAddress = await this.btcEthRebalancingManager.core(managerAddress);
    await this.assert.setToken.isValidSetToken(coreAddress, rebalancingSetAddress);

    await this.assertGeneralPropose(managerAddress, rebalancingSetAddress);
  }

  private async assertGeneralPropose(managerAddress: Address, rebalancingSetAddress: Address) {
    this.assert.schema.isValidAddress('managerAddress', managerAddress);
    this.assert.schema.isValidAddress('rebalancingSetAddress', rebalancingSetAddress);

    // Assert the rebalancing Set is ready to be proposed
    await this.assert.rebalancing.isNotInDefaultState(rebalancingSetAddress);
    await this.assert.rebalancing.sufficientTimeBetweenRebalance(rebalancingSetAddress);
  }

  private async assertBTCETHPriceTrigger(rebalancingManager: Address, rebalancingSet: Address) {
    const collateralSet = await this.rebalancingSetToken.currentSet(rebalancingSet);

    const [
      btcPriceFeed,
      ethPriceFeed,
      maximumLowerThreshold,
      minimumUpperThreshold,
    ] = await Promise.all([
      this.btcEthRebalancingManager.btcPriceFeed(rebalancingManager),
      this.btcEthRebalancingManager.ethPriceFeed(rebalancingManager),
      this.btcEthRebalancingManager.maximumLowerThreshold(rebalancingManager),
      this.btcEthRebalancingManager.minimumUpperThreshold(rebalancingManager),
    ]);

    const [collateralNaturalUnit, collateralUnits] = await Promise.all([
      this.setToken.naturalUnit(collateralSet),
      this.setToken.getUnits(collateralSet),
    ]);

    const [btcPrice, ethPrice] = await Promise.all([
      this.priceFeed.read(btcPriceFeed),
      this.priceFeed.read(ethPriceFeed),
    ]);

    const btcAllocationAmount = this.computeSetTokenAllocation(
      collateralUnits,
      collateralNaturalUnit,
      new BigNumber(btcPrice),
      new BigNumber(ethPrice),
      WBTC_FULL_TOKEN_UNITS,
      WETH_FULL_TOKEN_UNITS,
    );

    this.assert.rebalancing.isOutsideAllocationBounds(
      btcAllocationAmount,
      maximumLowerThreshold,
      minimumUpperThreshold,
      `Current BTC allocation ${btcAllocationAmount.toString()}% must be outside allocation bounds ` +
      `${maximumLowerThreshold.toString()} and ${minimumUpperThreshold.toString()}.`
    );
  }

  private async assertBTCDAIPriceTrigger(rebalancingManager: Address, rebalancingSet: Address) {
    const collateralSet = await this.rebalancingSetToken.currentSet(rebalancingSet);

    const [
      btcPriceFeed,
      maximumLowerThreshold,
      minimumUpperThreshold,
    ] = await Promise.all([
      this.btcDaiRebalancingManager.btcPriceFeed(rebalancingManager),
      this.btcDaiRebalancingManager.maximumLowerThreshold(rebalancingManager),
      this.btcDaiRebalancingManager.minimumUpperThreshold(rebalancingManager),
    ]);

    const [collateralNaturalUnit, collateralUnits] = await Promise.all([
      this.setToken.naturalUnit(collateralSet),
      this.setToken.getUnits(collateralSet),
    ]);

    const btcPrice = await this.priceFeed.read(btcPriceFeed);

    const daiAllocationAmount = this.computeSetTokenAllocation(
      collateralUnits,
      collateralNaturalUnit,
      DAI_PRICE,
      new BigNumber(btcPrice),
      DAI_FULL_TOKEN_UNITS,
      WBTC_FULL_TOKEN_UNITS,
    );

    this.assert.rebalancing.isOutsideAllocationBounds(
      daiAllocationAmount,
      maximumLowerThreshold,
      minimumUpperThreshold,
      `Current DAI allocation ${daiAllocationAmount.toString()}% must be outside allocation bounds ` +
      `${maximumLowerThreshold.toString()} and ${minimumUpperThreshold.toString()}.`
    );
  }

  private async assertETHDAIPriceTrigger(rebalancingManager: Address, rebalancingSet: Address) {
    const collateralSet = await this.rebalancingSetToken.currentSet(rebalancingSet);

    const [
      ethPriceFeed,
      maximumLowerThreshold,
      minimumUpperThreshold,
    ] = await Promise.all([
      this.ethDaiRebalancingManager.ethPriceFeed(rebalancingManager),
      this.ethDaiRebalancingManager.maximumLowerThreshold(rebalancingManager),
      this.ethDaiRebalancingManager.minimumUpperThreshold(rebalancingManager),
    ]);

    const [collateralNaturalUnit, collateralUnits] = await Promise.all([
      this.setToken.naturalUnit(collateralSet),
      this.setToken.getUnits(collateralSet),
    ]);

    const ethPrice = await this.priceFeed.read(ethPriceFeed);

    const daiAllocationAmount = this.computeSetTokenAllocation(
      collateralUnits,
      collateralNaturalUnit,
      DAI_PRICE,
      new BigNumber(ethPrice),
      DAI_FULL_TOKEN_UNITS,
      WETH_FULL_TOKEN_UNITS,
    );

    this.assert.rebalancing.isOutsideAllocationBounds(
      daiAllocationAmount,
      maximumLowerThreshold,
      minimumUpperThreshold,
      `Current DAI allocation ${daiAllocationAmount.toString()}% must be outside allocation bounds ` +
      `${maximumLowerThreshold.toString()} and ${minimumUpperThreshold.toString()}.`
    );
  }

  // MACO Assertions

  private async assertInitialPropose(macoManagerAddress: Address) {
    await this.assertMACOPropose(macoManagerAddress);


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
    await this.assertMACOPropose(macoManagerAddress);

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

  private async assertMACOPropose(macoManagerAddress: Address) {
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

    await this.assertGeneralPropose(macoManagerAddress, rebalancingSetAddress);

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

  // Helper functions

  private computeSetTokenAllocation(
    units: BigNumber[],
    naturalUnit: BigNumber,
    tokenOnePrice: BigNumber,
    tokenTwoPrice: BigNumber,
    tokenOneDecimals: BigNumber,
    tokenTwoDecimals: BigNumber,
  ): BigNumber {
    const tokenOneUnitsInFullToken = SET_FULL_TOKEN_UNITS.mul(units[0]).div(naturalUnit).round(0, 3);
    const tokenTwoUnitsInFullToken = SET_FULL_TOKEN_UNITS.mul(units[1]).div(naturalUnit).round(0, 3);

    const tokenOneDollarAmount = this.computeTokenDollarAmount(
      tokenOnePrice,
      tokenOneUnitsInFullToken,
      tokenOneDecimals
    );
    const tokenTwoDollarAmount = this.computeTokenDollarAmount(
      tokenTwoPrice,
      tokenTwoUnitsInFullToken,
      tokenTwoDecimals
    );

    return tokenOneDollarAmount.mul(100).div(tokenOneDollarAmount.add(tokenTwoDollarAmount)).round(0, 3);
  }

  private computeTokenDollarAmount(
    tokenPrice: BigNumber,
    unitsInFullSet: BigNumber,
    tokenDecimals: BigNumber,
  ): BigNumber {
    return tokenPrice
             .mul(unitsInFullSet)
             .div(tokenDecimals)
             .div(VALUE_TO_CENTS_CONVERSION)
             .round(0, 3);
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
