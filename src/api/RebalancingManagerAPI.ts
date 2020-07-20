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
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';

import { BigNumber } from '../util';
import {
  AssetPairManagerWrapper,
  AssetPairManagerV2Wrapper,
  BTCDAIRebalancingManagerWrapper,
  BTCETHRebalancingManagerWrapper,
  ETHDAIRebalancingManagerWrapper,
  MACOStrategyManagerWrapper,
  MACOStrategyManagerV2Wrapper,
  MedianizerWrapper,
  PerformanceFeeCalculatorWrapper,
  ProtocolViewerWrapper,
  RebalancingSetTokenV3Wrapper,
  SetTokenWrapper,
  RebalancingSetTokenWrapper,
} from '../wrappers';
import { Assertions } from '../assertions';
import {
  Address,
  Bytes,
  FeeType,
  ManagerType,
  SetProtocolConfig,
  Tx
} from '../types/common';
import {
  DAI_FULL_TOKEN_UNITS,
  DAI_PRICE,
  SET_FULL_TOKEN_UNITS,
  VALUE_TO_CENTS_CONVERSION,
  WBTC_FULL_TOKEN_UNITS,
  WETH_FULL_TOKEN_UNITS,
} from '../constants';
import {
  AssetPairManagerDetails,
  AssetPairManagerV2Details,
  BTCDAIRebalancingManagerDetails,
  BTCETHRebalancingManagerDetails,
  ETHDAIRebalancingManagerDetails,
  MovingAverageManagerDetails,
} from '../types/strategies';

const { SetProtocolUtils: SetUtils } = setProtocolUtils;

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
  private medianizer: MedianizerWrapper;
  private protocolViewer: ProtocolViewerWrapper;

  private btcEthRebalancingManager: BTCETHRebalancingManagerWrapper;
  private btcDaiRebalancingManager: BTCDAIRebalancingManagerWrapper;
  private ethDaiRebalancingManager: ETHDAIRebalancingManagerWrapper;
  private macoStrategyManager: MACOStrategyManagerWrapper;
  private macoStrategyManagerV2: MACOStrategyManagerV2Wrapper;
  private assetPairManager: AssetPairManagerWrapper;
  private assetPairManagerV2: AssetPairManagerV2Wrapper;
  private performanceFeeCalculator: PerformanceFeeCalculatorWrapper;
  private rebalancingSetV3: RebalancingSetTokenV3Wrapper;

  /**
   * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3          The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   * @param assertions    An instance of the Assertion library
   */
  constructor(web3: Web3, assertions: Assertions, config: SetProtocolConfig, ) {
    this.btcEthRebalancingManager = new BTCETHRebalancingManagerWrapper(web3);
    this.btcDaiRebalancingManager = new BTCDAIRebalancingManagerWrapper(web3);
    this.ethDaiRebalancingManager = new ETHDAIRebalancingManagerWrapper(web3);
    this.macoStrategyManager = new MACOStrategyManagerWrapper(web3);
    this.macoStrategyManagerV2 = new MACOStrategyManagerV2Wrapper(web3);
    this.assetPairManager = new AssetPairManagerWrapper(web3);
    this.assetPairManagerV2 = new AssetPairManagerV2Wrapper(web3);
    this.performanceFeeCalculator = new PerformanceFeeCalculatorWrapper(web3);
    this.rebalancingSetV3 = new RebalancingSetTokenV3Wrapper(web3);

    this.assert = assertions;
    this.setToken = new SetTokenWrapper(web3);
    this.medianizer = new MedianizerWrapper(web3);
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(web3);
    this.protocolViewer = new ProtocolViewerWrapper(web3, config.protocolViewerAddress);
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
  public async initiateCrossoverProposeAsync(
    managerType: BigNumber,
    macoManager: Address,
    txOpts: Tx
  ): Promise<string> {
    if (managerType == ManagerType.PAIR || managerType == ManagerType.PAIRV2) {
      await this.assertAssetPairInitialPropose(macoManager);
    } else {
      await this.assertInitialPropose(managerType, macoManager);
    }

    // If current timestamp > 12 hours since the last, call initialPropose
    return await this.macoStrategyManager.initialPropose(macoManager, txOpts);
  }

  public async confirmCrossoverProposeAsync(
    managerType: BigNumber,
    macoManager: Address,
    txOpts: Tx
  ): Promise<string> {
    if (managerType == ManagerType.PAIR || managerType == ManagerType.PAIRV2) {
      await this.assertAssetPairConfirmPropose(macoManager);
    } else {
      await this.assertConfirmPropose(managerType, macoManager);
    }

    return await this.macoStrategyManager.confirmPropose(macoManager, txOpts);
  }

  /**
   * Calls manager to adjustFees. Only for asset pair manager v2
   *
   * @param  manager                  Address of manager
   * @param  newFeeType               Type of fee being changed
   * @param  newFeePercentage         New fee percentage
   * @return                          The hash of the resulting transaction.
   */
  public async adjustPerformanceFeesAsync(
    manager: Address,
    newFeeType: FeeType,
    newFeePercentage: BigNumber,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertAdjustFees(
      manager,
      newFeeType,
      newFeePercentage,
      txOpts
    );

    const newFeeCallData = SetUtils.generateAdjustFeeCallData(
      new BigNumber(newFeeType),
      newFeePercentage
    );

    return this.assetPairManagerV2.adjustFee(
      manager,
      newFeeCallData,
      txOpts
    );
  }

  /**
   * Cancels previous fee adjustment (before enacted)
   *
   * @param  manager                  Address of manager
   * @param  upgradeHash              Hash of the inital fee adjustment call data
   * @return                          The hash of the resulting transaction.
   */
  public async removeFeeUpdateAsync(
    manager: Address,
    upgradeHash: string,
    txOpts: Tx,
  ): Promise<string> {
    return this.assetPairManagerV2.removeRegisteredUpgrade(manager, upgradeHash);
  }

  /**
   * Calls AssetPairManagerV2's setLiquidator function. Changes liquidator used in rebalances.
   *
   * @param  manager                Address of the asset pair manager contract
   * @param  newLiquidator          New liquidator address
   * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
   *                                gasPrice data
   * @return                        The hash of the resulting transaction.
   */
  public async setLiquidatorAsync(
    manager: Address,
    newLiquidator: Address,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertAddressSetters(manager, newLiquidator);

    return this.assetPairManagerV2.setLiquidator(
      manager,
      newLiquidator,
      txOpts
    );
  }

  /**
   * Calls AssetPairManagerV2's setLiquidatorData function. Changes liquidatorData used in rebalances.
   *
   * @param  manager                Address of the asset pair manager contract
   * @param  newLiquidatorData      New liquidator data
   * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
   *                                gasPrice data
   * @return                        The hash of the resulting transaction.
   */
  public async setLiquidatorDataAsync(
    manager: Address,
    newLiquidatorData: Bytes,
    txOpts: Tx,
  ): Promise<string> {
    return this.assetPairManagerV2.setLiquidatorData(
      manager,
      newLiquidatorData,
      txOpts
    );
  }

  /**
   * Calls AssetPairManagerV2's setFeeRecipient function. Changes feeRecipient address.
   *
   * @param  manager                Address of the asset pair manager contract
   * @param  newFeeRecipient        New feeRecipient address
   * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
   *                                gasPrice data
   * @return                        The hash of the resulting transaction.
   */
  public async setFeeRecipientAsync(
    manager: Address,
    newFeeRecipient: Address,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertAddressSetters(manager, newFeeRecipient);

    return this.assetPairManagerV2.setFeeRecipient(
      manager,
      newFeeRecipient,
      txOpts
    );
  }

  /**
   * Fetches if initialPropose can be called without revert on AssetPairManager
   *
   * @param  manager         Address of AssetPairManager contract
   * @return                 Boolean if initialPropose can be called without revert
   */
  public async canInitialProposeAsync(
    manager: Address
  ): Promise<boolean> {
    return await this.assetPairManager.canInitialPropose(manager)
      .then(value => { return value; })
      .catch(error => { return false; });
  }

  /**
   * Fetches if confirmPropose can be called without revert on AssetPairManager
   *
   * @param  manager         Address of AssetPairManager contract
   * @return                 Boolean if confirmPropose can be called without revert
   */
  public async canConfirmProposeAsync(
    manager: Address
  ): Promise<boolean> {
    return await this.assetPairManager.canConfirmPropose(manager)
      .then(value => { return value; })
      .catch(error => { return false; });
  }

  /**
   * Fetches the lastCrossoverConfirmationTimestamp of the Moving Average Crossover Manager contract.
   *
   * @param  macoManager         Address of the Moving Average Crossover Manager contract
   * @return                     BigNumber containing the lastCrossoverConfirmationTimestamp
   */
  public async getLastCrossoverConfirmationTimestampAsync(
    managerType: BigNumber,
    manager: Address
  ): Promise<BigNumber> {
    this.assert.schema.isValidAddress('manager', manager);

    if (managerType == ManagerType.PAIR || managerType == ManagerType.PAIRV2) {
      return await this.assetPairManager.recentInitialProposeTimestamp(manager);
    }

    return await this.macoStrategyManager.lastCrossoverConfirmationTimestamp(manager);
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
  public async getMovingAverageManagerDetailsAsync(
    managerType: BigNumber,
    macoManager: Address
  ): Promise<MovingAverageManagerDetails> {
    let movingAveragePriceFeed;
    if (managerType == ManagerType.MACO) {
      movingAveragePriceFeed = await this.macoStrategyManager.movingAveragePriceFeed(macoManager);
    } else {
      movingAveragePriceFeed = await this.macoStrategyManagerV2.movingAveragePriceFeed(macoManager);
    }

    const [
      auctionLibrary,
      auctionTimeToPivot,
      core,
      lastCrossoverConfirmationTimestamp,
      movingAverageDays,
      rebalancingSetToken,
    ] = await Promise.all([
      this.macoStrategyManager.auctionLibrary(macoManager),
      this.macoStrategyManager.auctionTimeToPivot(macoManager),
      this.macoStrategyManager.coreAddress(macoManager),
      this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManager),
      this.macoStrategyManager.movingAverageDays(macoManager),
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

  /**
   * Fetches the state variables of the Asset Pair Manager contract.
   *
   * @param  manager         Address of the AssetPairManager contract
   * @return                 Object containing the state information related to the manager
   */
  public async getAssetPairManagerDetailsAsync(
    manager: Address
  ): Promise<AssetPairManagerDetails> {
    const [
      allocationDenominator,
      allocator,
      auctionPivotPercentage,
      auctionLibrary,
      auctionStartPercentage,
      auctionTimeToPivot,
      baseAssetAllocation,
    ] = await Promise.all([
      this.assetPairManager.allocationDenominator(manager),
      this.assetPairManager.allocator(manager),
      this.assetPairManager.auctionPivotPercentage(manager),
      this.assetPairManager.auctionLibrary(manager),
      this.assetPairManager.auctionStartPercentage(manager),
      this.assetPairManager.auctionTimeToPivot(manager),
      this.assetPairManager.baseAssetAllocation(manager),
    ]);

    const [
      bullishBaseAssetAllocation,
      bearishBaseAssetAllocation,
      core,
      recentInitialProposeTimestamp,
      rebalancingSetToken,
      signalConfirmationMinTime,
      signalConfirmationMaxTime,
      trigger,
    ] = await Promise.all([
      this.assetPairManager.bullishBaseAssetAllocation(manager),
      this.assetPairManager.bearishBaseAssetAllocation(manager),
      this.assetPairManager.core(manager),
      this.assetPairManager.recentInitialProposeTimestamp(manager),
      this.assetPairManager.rebalancingSetToken(manager),
      this.assetPairManager.signalConfirmationMinTime(manager),
      this.assetPairManager.signalConfirmationMaxTime(manager),
      this.assetPairManager.trigger(manager),
    ]);

    return {
      allocationDenominator,
      allocator,
      auctionPivotPercentage,
      auctionLibrary,
      auctionStartPercentage,
      auctionTimeToPivot,
      baseAssetAllocation,
      bullishBaseAssetAllocation,
      bearishBaseAssetAllocation,
      core,
      recentInitialProposeTimestamp,
      rebalancingSetToken,
      signalConfirmationMinTime,
      signalConfirmationMaxTime,
      trigger,
    } as AssetPairManagerDetails;
  }

  /**
   * Fetches the state variables of the Asset Pair Manager V2 contract.
   *
   * @param  manager         Address of the AssetPairManagerV2 contract
   * @return                 Object containing the state information related to the manager
   */
  public async getAssetPairManagerV2DetailsAsync(
    manager: Address
  ): Promise<AssetPairManagerV2Details> {
    const [
      allocationDenominator,
      allocator,
      baseAssetAllocation,
      bullishBaseAssetAllocation,
      bearishBaseAssetAllocation,
      core,
      recentInitialProposeTimestamp,
      rebalancingSetToken,
    ] = await Promise.all([
      this.assetPairManagerV2.allocationDenominator(manager),
      this.assetPairManagerV2.allocator(manager),
      this.assetPairManagerV2.baseAssetAllocation(manager),
      this.assetPairManagerV2.bullishBaseAssetAllocation(manager),
      this.assetPairManagerV2.bearishBaseAssetAllocation(manager),
      this.assetPairManagerV2.core(manager),
      this.assetPairManagerV2.recentInitialProposeTimestamp(manager),
      this.assetPairManagerV2.rebalancingSetToken(manager),
    ]);

    const [
      signalConfirmationMinTime,
      signalConfirmationMaxTime,
      trigger,
      liquidatorData,
      rebalanceFeeCalculator,
    ] = await Promise.all([
      this.assetPairManagerV2.signalConfirmationMinTime(manager),
      this.assetPairManagerV2.signalConfirmationMaxTime(manager),
      this.assetPairManagerV2.trigger(manager),
      this.assetPairManagerV2.liquidatorData(manager),
      this.rebalancingSetV3.rebalanceFeeCalculator(rebalancingSetToken),
    ]);

    return {
      allocationDenominator,
      allocator,
      baseAssetAllocation,
      bullishBaseAssetAllocation,
      bearishBaseAssetAllocation,
      core,
      recentInitialProposeTimestamp,
      rebalancingSetToken,
      signalConfirmationMinTime,
      signalConfirmationMaxTime,
      trigger,
      liquidatorData,
      rebalanceFeeCalculator,
    } as AssetPairManagerV2Details;
  }

  /**
   * Fetches the crossover confirmation time of AssetPairManager contracts.
   *
   * @param  managers        Array of addresses of the manager contract
   * @return                 Object containing the crossover timestamps
   */
  public async batchFetchAssetPairCrossoverTimestampAsync(
    managers: Address[],
  ): Promise<BigNumber[]> {
    return await this.protocolViewer.batchFetchAssetPairCrossoverTimestamp(managers);
  }

  /**
   * Fetches the crossover confirmation time of AssetPairManager contracts.
   *
   * @param  managers        Array of addresses of the manager contract
   * @return                 Object containing the crossover timestamps
   */
  public async batchFetchMACOCrossoverTimestampAsync(
    managers: Address[],
  ): Promise<BigNumber[]> {
    return await this.protocolViewer.batchFetchMACOV2CrossoverTimestamp(managers);
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
      this.medianizer.read(btcPriceFeed),
      this.medianizer.read(ethPriceFeed),
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

    const btcPrice = await this.medianizer.read(btcPriceFeed);

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

    const ethPrice = await this.medianizer.read(ethPriceFeed);

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

  private async assertInitialPropose(managerType: BigNumber, macoManagerAddress: Address) {
    const rebalancingSetAddress = await this.macoStrategyManagerV2.rebalancingSetTokenAddress(macoManagerAddress);
    await this.assertGeneralPropose(macoManagerAddress, rebalancingSetAddress);

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

  private async assertConfirmPropose(managerType: BigNumber, macoManagerAddress: Address) {
    const rebalancingSetAddress = await this.macoStrategyManagerV2.rebalancingSetTokenAddress(macoManagerAddress);
    await this.assertGeneralPropose(macoManagerAddress, rebalancingSetAddress);

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

  private async assertAssetPairInitialPropose(managerAddress: Address) {
    const canPropose = await this.canInitialProposeAsync(managerAddress);

    if (!canPropose) {
      throw new Error(
        'initialPropose cannot be called because necessary conditions are not met.'
      );
    }
  }

  private async assertAssetPairConfirmPropose(managerAddress: Address) {
    const canPropose = await this.canConfirmProposeAsync(managerAddress);

    if (!canPropose) {
      throw new Error(
        'confirmPropose cannot be called because necessary conditions are not met.'
      );
    }
  }

  private async assertAdjustFees(
    manager: Address,
    newFeeType: FeeType,
    newFeePercentage: BigNumber,
    txOpts: Tx
  ): Promise<void> {
    const managerDetails = await this.getAssetPairManagerV2DetailsAsync(manager);
    const feeCalculatorAddress = managerDetails.rebalanceFeeCalculator;

    let maxFee: BigNumber;
    if (newFeeType == FeeType.StreamingFee) {
      maxFee = await this.performanceFeeCalculator.maximumStreamingFeePercentage(
        feeCalculatorAddress
      );
    } else {
      maxFee = await this.performanceFeeCalculator.maximumProfitFeePercentage(
        feeCalculatorAddress
      );
    }

    this.assert.common.isGreaterOrEqualThan(
      maxFee,
      newFeePercentage,
      'Passed fee exceeds allowed maximum.'
    );
  }

  private async assertAddressSetters(
    manager: Address,
    newAddress: Address,
  ): Promise<void> {
    this.assert.schema.isValidAddress('manager', manager);
    this.assert.schema.isValidAddress('newAddress', newAddress);
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
}
