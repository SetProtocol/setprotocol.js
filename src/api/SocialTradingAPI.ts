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
  PerformanceFeeCalculatorWrapper,
  ProtocolViewerWrapper,
  RebalancingSetTokenV2Wrapper,
  RebalancingSetTokenV3Wrapper,
  SocialTradingManagerWrapper,
  SocialTradingManagerV2Wrapper
} from '../wrappers';
import { Assertions } from '../assertions';
import { coreAPIErrors } from '../errors';
import {
  Address,
  Bytes,
  FeeType,
  SetProtocolConfig,
  Tx,
  EntryFeePaid,
  RebalanceFeePaid
} from '../types/common';

import {
  NewTradingPoolInfo,
  NewTradingPoolV2Info,
  PerformanceFeeInfo,
  TradingPoolAccumulationInfo,
  TradingPoolRebalanceInfo
} from '../types/strategies';

const { SetProtocolUtils: SetUtils } = setProtocolUtils;

/**
 * @title SocialTradingAPI
 * @author Set Protocol
 *
 * A library for interacting with Social Trading contracts
 */
export class SocialTradingAPI {
  private web3: Web3;
  private assert: Assertions;
  private protocolViewer: ProtocolViewerWrapper;
  private socialTradingManager: SocialTradingManagerWrapper;
  private socialTradingManagerV2: SocialTradingManagerV2Wrapper;
  private rebalancingSetV2: RebalancingSetTokenV2Wrapper;
  private rebalancingSetV3: RebalancingSetTokenV3Wrapper;
  private performanceFeeCalculator: PerformanceFeeCalculatorWrapper;

  /**
   * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3          The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   * @param assertions    An instance of the Assertion library
   * @param config        Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
   */
  constructor(web3: Web3, assertions: Assertions, config: SetProtocolConfig) {
    this.web3 = web3;
    this.protocolViewer = new ProtocolViewerWrapper(web3, config.protocolViewerAddress);
    this.socialTradingManager = new SocialTradingManagerWrapper(web3);
    this.socialTradingManagerV2 = new SocialTradingManagerV2Wrapper(web3);
    this.rebalancingSetV2 = new RebalancingSetTokenV2Wrapper(web3);
    this.rebalancingSetV3 = new RebalancingSetTokenV3Wrapper(web3);
    this.performanceFeeCalculator = new PerformanceFeeCalculatorWrapper(web3);

    this.assert = assertions;
  }

  /**
   * Calls SocialTradingManager's createTradingPool function. This function creates a new tradingPool for
   * the sender. Creates collateral Set and RebalancingSetTokenV2 then stores data relevant for updating
   * allocations in mapping indexed by created RebalancingSetTokenV2 address.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  allocatorAddress               Address of allocator to be used for pool, proxy for trading pair
   * @param  startingBaseAssetAllocation    Starting base asset allocation of tradingPool
   * @param  startingUSDValue               Starting USD value of one share of tradingPool
   * @param  tradingPoolName                Name of tradingPool as appears on RebalancingSetTokenV2
   * @param  tradingPoolSymbol              Symbol of tradingPool as appears on RebalancingSetTokenV2
   * @param  liquidator                     Address of liquidator contract
   * @param  feeRecipient                   Address receiving fees from contract
   * @param  feeCalculator                  Rebalance fee calculator being used
   * @param  rebalanceInterval              Time required between rebalances
   * @param  failAuctionPeriod              Time before auction can be failed
   * @param  lastRebalanceTimestamp         Passed time of last rebalance
   * @param  entryFee                       Trading Pool entrance fee
   * @param  rebalanceFee                   Trading Pool rebalance fee
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                The hash of the resulting transaction.
   */
  public async createTradingPoolAsync(
    manager: Address,
    allocatorAddress: Address,
    startingBaseAssetAllocation: BigNumber,
    startingUSDValue: BigNumber,
    tradingPoolName: string,
    tradingPoolSymbol: string,
    liquidator: Address,
    feeRecipient: Address,
    feeCalculator: Address,
    rebalanceInterval: BigNumber,
    failAuctionPeriod: BigNumber,
    lastRebalanceTimestamp: BigNumber,
    entryFee: BigNumber,
    rebalanceFee: BigNumber,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertCreateTradingPool(
      startingBaseAssetAllocation,
      tradingPoolName,
      tradingPoolSymbol,
      manager,
      allocatorAddress,
      liquidator,
      feeRecipient,
      feeCalculator,
      entryFee,
      rebalanceFee,
    );

    const rebalanceFeeBytes = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);

    const rebalancingSetV2CallData = SetUtils.generateRebalancingSetTokenV2CallData(
      manager,
      liquidator,
      feeRecipient,
      feeCalculator,
      rebalanceInterval,
      failAuctionPeriod,
      lastRebalanceTimestamp,
      entryFee,
      rebalanceFeeBytes
    );

    return this.socialTradingManager.createTradingPool(
      manager,
      allocatorAddress,
      startingBaseAssetAllocation,
      startingUSDValue,
      SetUtils.stringToBytes(tradingPoolName),
      SetUtils.stringToBytes(tradingPoolSymbol),
      rebalancingSetV2CallData,
      txOpts
    );
  }

  /**
   * Calls SocialTradingManager's createTradingPool function. This function creates a new tradingPool for
   * the sender. Creates collateral Set and RebalancingSetTokenV2 then stores data relevant for updating
   * allocations in mapping indexed by created RebalancingSetTokenV2 address.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  allocatorAddress               Address of allocator to be used for pool, proxy for trading pair
   * @param  startingBaseAssetAllocation    Starting base asset allocation of tradingPool
   * @param  startingUSDValue               Starting USD value of one share of tradingPool
   * @param  tradingPoolName                Name of tradingPool as appears on RebalancingSetTokenV2
   * @param  tradingPoolSymbol              Symbol of tradingPool as appears on RebalancingSetTokenV2
   * @param  liquidator                     Address of liquidator contract
   * @param  feeRecipient                   Address receiving fees from contract
   * @param  feeCalculator                  Rebalance fee calculator being used
   * @param  rebalanceInterval              Time required between rebalances
   * @param  failAuctionPeriod              Time before auction can be failed
   * @param  lastRebalanceTimestamp         Passed time of last rebalance
   * @param  entryFee                       Trading Pool entrance fee
   * @param  streamingFee                   Trading Pool streaming fee
   * @param  profitFee                      Trading Pool profit fee
   * @param  profitFeePeriod                Period between actualizing profit fees
   * @param  highWatermarkResetPeriod       Time between last profit fee actualization before high watermark
   *                                        can be reset
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                The hash of the resulting transaction.
   */
  public async createTradingPoolV2Async(
    manager: Address,
    allocatorAddress: Address,
    startingBaseAssetAllocation: BigNumber,
    startingUSDValue: BigNumber,
    tradingPoolName: string,
    tradingPoolSymbol: string,
    liquidator: Address,
    feeRecipient: Address,
    feeCalculator: Address,
    rebalanceInterval: BigNumber,
    failAuctionPeriod: BigNumber,
    lastRebalanceTimestamp: BigNumber,
    entryFee: BigNumber,
    profitFeePeriod: BigNumber,
    highWatermarkResetPeriod: BigNumber,
    profitFee: BigNumber,
    streamingFee: BigNumber,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertCreateTradingPoolV2(
      startingBaseAssetAllocation,
      tradingPoolName,
      tradingPoolSymbol,
      manager,
      allocatorAddress,
      liquidator,
      feeRecipient,
      feeCalculator,
      entryFee,
      profitFeePeriod,
      highWatermarkResetPeriod,
      profitFee,
      streamingFee,
    );

    const feeCalculatorBytes = SetUtils.generatePerformanceFeeCallDataBuffer(
      profitFeePeriod,
      highWatermarkResetPeriod,
      profitFee,
      streamingFee
    );

    const rebalancingSetV2CallData = SetUtils.generateRebalancingSetTokenV3CallData(
      manager,
      liquidator,
      feeRecipient,
      feeCalculator,
      rebalanceInterval,
      failAuctionPeriod,
      lastRebalanceTimestamp,
      entryFee,
      feeCalculatorBytes
    );

    return this.socialTradingManager.createTradingPool(
      manager,
      allocatorAddress,
      startingBaseAssetAllocation,
      startingUSDValue,
      SetUtils.stringToBytes(tradingPoolName),
      SetUtils.stringToBytes(tradingPoolSymbol),
      rebalancingSetV2CallData,
      txOpts
    );
  }

  /**
   * Calls SocialTradingManager's updateAllocation function. This function creates a new collateral Set and
   * calls startRebalance on RebalancingSetTokenV2. Updates allocation state on Manager contract.
   *
   * @param  manager                Address of the social trading manager contract
   * @param  tradingPool            Address of tradingPool being updated
   * @param  newAllocation          New allocation amount in base asset percentage
   * @param  liquidatorData         Arbitrary bytes data passed to liquidator
   * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
   *                                  gasPrice data
   * @return                        The hash of the resulting transaction.
   */
  public async updateAllocationAsync(
    manager: Address,
    tradingPool: Address,
    newAllocation: BigNumber,
    liquidatorData: Bytes,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertUpdateAllocation(manager, tradingPool, newAllocation, txOpts);

    return this.socialTradingManager.updateAllocation(
      manager,
      tradingPool,
      newAllocation,
      liquidatorData,
      txOpts
    );
  }

  /**
   * Calls tradingPool to accrue fees to manager.
   *
   * @param  tradingPool        Address of tradingPool
   * @return                    The hash of the resulting transaction.
   */
  public async actualizeFeesAsync(
    tradingPool: Address,
    txOpts: Tx,
  ): Promise<string> {
    return this.rebalancingSetV3.actualizeFee(tradingPool, txOpts);
  }

  /**
   * Calls manager to adjustFees for tradingPool
   *
   * @param  manager                  Address of manager
   * @param  tradingPool              Address of tradingPool
   * @param  newFeeType               Type of fee being changed
   * @param  newFeePercentage         New fee percentage
   * @return                          The hash of the resulting transaction.
   */
  public async adjustPerformanceFeesAsync(
    manager: Address,
    tradingPool: Address,
    newFeeType: FeeType,
    newFeePercentage: BigNumber,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertAdjustFees(
      manager,
      tradingPool,
      newFeeType,
      newFeePercentage,
      txOpts
    );

    const newFeeCallData = SetUtils.generateAdjustFeeCallData(
      new BigNumber(newFeeType),
      newFeePercentage
    );

    return this.socialTradingManagerV2.adjustFee(
      manager,
      tradingPool,
      newFeeCallData,
      txOpts
    );
  }

  /**
   * Cancels previous fee adjustment (before enacted)
   *
   * @param  manager                  Address of manager
   * @param  tradingPool              Address of tradingPool
   * @param  upgradeHash              Hash of the inital fee adjustment call data
   * @return                          The hash of the resulting transaction.
   */
  public async removeFeeUpdateAsync(
    manager: Address,
    tradingPool: Address,
    upgradeHash: string,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertRemoveFeeUpdate(manager, tradingPool, txOpts);

    return this.socialTradingManagerV2.removeRegisteredUpgrade(manager, tradingPool, upgradeHash);
  }

  /**
   * Calls SocialTradingManager's initiateEntryFeeChange function. Starts entry fee update process.
   *
   * @param  manager                Address of the social trading manager contract
   * @param  tradingPool            Address of tradingPool being updated
   * @param  newEntryFee            New entry fee
   * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
   *                                  gasPrice data
   * @return                        The hash of the resulting transaction.
   */
  public async initiateEntryFeeChangeAsync(
    manager: Address,
    tradingPool: Address,
    newEntryFee: BigNumber,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertInitiateEntryFeeChange(manager, tradingPool, newEntryFee, txOpts);

    return this.socialTradingManager.initiateEntryFeeChange(
      manager,
      tradingPool,
      newEntryFee,
      txOpts
    );
  }

  /**
   * Calls SocialTradingManager's finalizeEntryFeeChangeAsync function. Finalizes entry fee update process if timelock
   * period passes.
   *
   * @param  manager                Address of the social trading manager contract
   * @param  tradingPool            Address of tradingPool being updated
   * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
   *                                  gasPrice data
   * @return                        The hash of the resulting transaction.
   */
  public async finalizeEntryFeeChangeAsync(
    manager: Address,
    tradingPool: Address,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertFinalizeEntryFeeChange(manager, tradingPool, txOpts);

    return this.socialTradingManager.finalizeEntryFeeChange(
      manager,
      tradingPool,
      txOpts
    );
  }

  /**
   * Calls SocialTradingManager's setTrader function. Passes pool permissions to new address.
   *
   * @param  manager                Address of the social trading manager contract
   * @param  tradingPool            Address of tradingPool being updated
   * @param  newTrader              New trading pool trader address
   * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
   *                                  gasPrice data
   * @return                        The hash of the resulting transaction.
   */
  public async setTraderAsync(
    manager: Address,
    tradingPool: Address,
    newTrader: Address,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertAddressSetters(manager, tradingPool, newTrader, txOpts.from);

    return this.socialTradingManager.setTrader(
      manager,
      tradingPool,
      newTrader,
      txOpts
    );
  }

  /**
   * Calls SocialTradingManager's setLiquidator function. Changes liquidator used in rebalances.
   *
   * @param  manager                Address of the social trading manager contract
   * @param  tradingPool            Address of tradingPool being updated
   * @param  newLiquidator          New liquidator address
   * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
   *                                  gasPrice data
   * @return                        The hash of the resulting transaction.
   */
  public async setLiquidatorAsync(
    manager: Address,
    tradingPool: Address,
    newLiquidator: Address,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertAddressSetters(manager, tradingPool, newLiquidator, txOpts.from);

    return this.socialTradingManager.setLiquidator(
      manager,
      tradingPool,
      newLiquidator,
      txOpts
    );
  }

  /**
   * Calls SocialTradingManager's setFeeRecipient function. Changes feeRecipient address.
   *
   * @param  manager                Address of the social trading manager contract
   * @param  tradingPool            Address of tradingPool being updated
   * @param  newFeeRecipient        New feeRecipient address
   * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
   *                                  gasPrice data
   * @return                        The hash of the resulting transaction.
   */
  public async setFeeRecipientAsync(
    manager: Address,
    tradingPool: Address,
    newFeeRecipient: Address,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertAddressSetters(manager, tradingPool, newFeeRecipient, txOpts.from);

    return this.socialTradingManager.setFeeRecipient(
      manager,
      tradingPool,
      newFeeRecipient,
      txOpts
    );
  }

  /**
   * Returns relevant details of newly created Trading Pools. Return object adheres to the
   * NewTradingPoolInfo interface.
   *
   * @param  tradingPool            Address of tradingPool being updated
   * @return                        NewTradingPoolInfo
   */
  public async fetchNewTradingPoolDetailsAsync(
    tradingPool: Address
  ): Promise<NewTradingPoolInfo> {
    const newPoolInfo = await this.protocolViewer.fetchNewTradingPoolDetails(
      tradingPool
    );

    return this.createNewTradingPoolObject(newPoolInfo);
  }

  /**
   * Returns relevant details of newly created Trading Pools V2 with performance fees. Return object adheres to the
   * NewTradingPoolV2Info interface.
   *
   * @param  tradingPool            Address of tradingPool being updated
   * @return                        NewTradingPoolInfo
   */
  public async fetchNewTradingPoolV2DetailsAsync(
    tradingPool: Address
  ): Promise<NewTradingPoolV2Info> {
    const newPoolInfo = await this.protocolViewer.fetchNewTradingPoolV2Details(
      tradingPool
    );

    return this.createNewTradingPoolV2Object(newPoolInfo);
  }

  /**
   * Returns relevant details of Trading Pools being rebalance. Return object adheres to the
   * TradingPoolRebalanceInfo interface.
   *
   * @param  tradingPool            Address of tradingPool being updated
   * @return                        NewTradingPoolInfo
   */
  public async fetchTradingPoolRebalanceDetailsAsync(
    tradingPool: Address
  ): Promise<TradingPoolRebalanceInfo> {
    const newPoolInfo = await this.protocolViewer.fetchTradingPoolRebalanceDetails(
      tradingPool
    );

    return this.createTradingPoolRebalanceObject(newPoolInfo);
  }

  /**
   * Fetches all trading pool operators for an array of trading pools
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolOperatorAsync(
    tradingPoolAddresses: Address[],
  ): Promise<string[]> {
    return this.protocolViewer.batchFetchTradingPoolOperator(tradingPoolAddresses);
  }

  /**
   * Fetches all entry fees for an array of trading pools
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolEntryFeesAsync(
    tradingPoolAddresses: Address[],
  ): Promise<BigNumber[]> {
    return this.protocolViewer.batchFetchTradingPoolEntryFees(tradingPoolAddresses);
  }

  /**
   * Fetches all rebalance fees for an array of trading pools
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolRebalanceFeesAsync(
    tradingPoolAddresses: Address[],
  ): Promise<BigNumber[]> {
    return this.protocolViewer.batchFetchTradingPoolRebalanceFees(tradingPoolAddresses);
  }

  /**
   * Fetches all profit and streaming fees for an array of trading pools. Return objects adhere to
   * TradingPoolAccumulationInfo interface
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolAccumulationAsync(
    tradingPoolAddresses: Address[],
  ): Promise<TradingPoolAccumulationInfo[]> {
    const tradingPoolFees = await this.protocolViewer.batchFetchTradingPoolAccumulation(
      tradingPoolAddresses
    );

    return this.createTradingPoolAccumulationObject(tradingPoolFees);
  }

  /**
   * Fetches all fee states for an array of trading pools. Return objects adhere to
   * PerformanceFeeInfo interface
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolFeeStateAsync(
    tradingPoolAddresses: Address[],
  ): Promise<PerformanceFeeInfo[]> {
    return this.protocolViewer.batchFetchTradingPoolFeeState(tradingPoolAddresses);
  }

  /**
   * Fetches EntryFeePaid event logs including information about the transactionHash, rebalancingSetToken,
   * feeRecipient, and feeQuantity.
   *
   * This fetch can be filtered by block.
   *
   * @param  tradingPoolAddress            Address of trading pool to pull events for
   * @param  fromBlock                     The beginning block to retrieve events from
   * @param  toBlock                       The ending block to retrieve events (default is latest)
   * @return                               An array of objects conforming to the EntryFeePaid interface
   */
  public async fetchEntryFeeEventsAsync(
    tradingPoolAddress: Address,
    fromBlock: number,
    toBlock?: any,
    getTimestamp?: boolean,
  ): Promise<EntryFeePaid[]> {
    const events: any[] = await this.rebalancingSetV2.entryFeePaidEvent(
      tradingPoolAddress,
      fromBlock,
      toBlock,
    );

    const formattedEventPromises: Promise<EntryFeePaid>[] = events.map(async event => {
      const returnValues = event.returnValues;
      const feeRecipient = returnValues['feeRecipient'];
      const feeQuantity = returnValues['feeQuantity'];

      let timestamp = undefined;
      if (getTimestamp) {
        const block = await this.web3.eth.getBlock(event.blockNumber);
        timestamp = block.timestamp;
      }

      return {
        transactionHash: event.transactionHash,
        feeRecipient,
        feeQuantity: new BigNumber(feeQuantity),
        timestamp,
      };
    });

    return Promise.all(formattedEventPromises);
  }

  /**
   * Fetches RebalanceFeePaid event logs including information about the transactionHash, rebalancingSetToken,
   * rebalanceIndex, feeRecipient, feeQuantity
   *
   * This fetch can be filtered by block.
   *
   * @param  tradingPoolAddress            Address of trading pool to pull events for
   * @param  fromBlock                     The beginning block to retrieve events from
   * @param  toBlock                       The ending block to retrieve events (default is latest)
   * @return                               An array of objects conforming to the RebalanceFeePaid interface
   */
  public async fetchRebalanceFeePaidEventsAsync(
    tradingPoolAddress: Address,
    fromBlock: number,
    toBlock?: any,
    getTimestamp?: boolean,
  ): Promise<RebalanceFeePaid[]> {
    const events: any[] = await this.rebalancingSetV2.rebalanceSettledEvent(
      tradingPoolAddress,
      fromBlock,
      toBlock,
    );

    const formattedEventPromises: Promise<RebalanceFeePaid>[] = events.map(async event => {
      const returnValues = event.returnValues;
      const rebalanceIndex = returnValues['rebalanceIndex'];
      const feeRecipient = returnValues['feeRecipient'];
      const feeQuantity = returnValues['feeQuantity'];

      let timestamp = undefined;
      if (getTimestamp) {
        const block = await this.web3.eth.getBlock(event.blockNumber);
        timestamp = block.timestamp;
      }

      return {
        transactionHash: event.transactionHash,
        rebalanceIndex,
        feeRecipient,
        feeQuantity: new BigNumber(feeQuantity),
        timestamp,
      };
    });

    return Promise.all(formattedEventPromises);
  }

  /* ============ Private Functions ============ */

  private createNewTradingPoolObject(
    newPoolInfo: any,
  ): NewTradingPoolInfo {
    const [poolInfo, rbSetInfo, collateralInfo] = newPoolInfo;

    return {
      trader: poolInfo.trader,
      allocator: poolInfo.allocator,
      currentAllocation: poolInfo.currentAllocation,
      manager: rbSetInfo.manager,
      feeRecipient: rbSetInfo.feeRecipient,
      currentSet: rbSetInfo.currentSet,
      poolName: rbSetInfo.name,
      poolSymbol: rbSetInfo.symbol,
      unitShares: rbSetInfo.unitShares,
      naturalUnit: rbSetInfo.naturalUnit,
      rebalanceInterval: rbSetInfo.rebalanceInterval,
      entryFee: rbSetInfo.entryFee,
      rebalanceFee: rbSetInfo.rebalanceFee,
      lastRebalanceTimestamp: rbSetInfo.lastRebalanceTimestamp,
      rebalanceState: rbSetInfo.rebalanceState,
      currentSetInfo: collateralInfo,
    } as NewTradingPoolInfo;
  }

  private createNewTradingPoolV2Object(
    newPoolV2Info: any,
  ): NewTradingPoolV2Info {
    const [
      poolInfo,
      rbSetInfo,
      perfFeeInfo,
      collateralInfo,
      perfFeeCalculator,
    ] = newPoolV2Info;

    return {
      trader: poolInfo.trader,
      allocator: poolInfo.allocator,
      currentAllocation: poolInfo.currentAllocation,
      manager: rbSetInfo.manager,
      feeRecipient: rbSetInfo.feeRecipient,
      currentSet: rbSetInfo.currentSet,
      poolName: rbSetInfo.name,
      poolSymbol: rbSetInfo.symbol,
      unitShares: rbSetInfo.unitShares,
      naturalUnit: rbSetInfo.naturalUnit,
      rebalanceInterval: rbSetInfo.rebalanceInterval,
      entryFee: rbSetInfo.entryFee,
      rebalanceFee: rbSetInfo.rebalanceFee,
      lastRebalanceTimestamp: rbSetInfo.lastRebalanceTimestamp,
      rebalanceState: rbSetInfo.rebalanceState,
      currentSetInfo: collateralInfo,
      performanceFeeInfo: perfFeeInfo,
      performanceFeeCalculatorAddress: perfFeeCalculator,
    } as NewTradingPoolV2Info;
  }

  private createTradingPoolRebalanceObject(
    newPoolInfo: any,
  ): TradingPoolRebalanceInfo {
    const [poolInfo, rbSetInfo, collateralInfo] = newPoolInfo;

    return {
      trader: poolInfo.trader,
      allocator: poolInfo.allocator,
      currentAllocation: poolInfo.currentAllocation,
      liquidator: rbSetInfo.liquidator,
      nextSet: rbSetInfo.nextSet,
      rebalanceStartTime: rbSetInfo.rebalanceStartTime,
      timeToPivot: rbSetInfo.timeToPivot,
      startPrice: rbSetInfo.startPrice,
      endPrice: rbSetInfo.endPrice,
      startingCurrentSets: rbSetInfo.startingCurrentSets,
      remainingCurrentSets: rbSetInfo.remainingCurrentSets,
      minimumBid: rbSetInfo.minimumBid,
      rebalanceState: rbSetInfo.rebalanceState,
      nextSetInfo: collateralInfo,
    } as TradingPoolRebalanceInfo;
  }

  private createTradingPoolAccumulationObject(
    tradingPoolFees: any,
  ): TradingPoolAccumulationInfo[] {
    const streamingFees = tradingPoolFees[0];
    const profitFees = tradingPoolFees[1];

    const accumulationInfo: TradingPoolAccumulationInfo[] = [];
    _.forEach(streamingFees, (streamingFee, index) => {
      accumulationInfo.push({
        streamingFee,
        profitFee: profitFees[index],
      } as TradingPoolAccumulationInfo);
    });

    return accumulationInfo;
  }

  /* ============ Private Assertions ============ */
  private async assertCreateTradingPool(
    allocation: BigNumber,
    tradingPoolName: string,
    tradingPoolSymbol: string,
    manager: Address,
    allocatorAddress: Address,
    liquidator: Address,
    feeRecipient: Address,
    feeCalculator: Address,
    entryFee: BigNumber,
    rebalanceFee: BigNumber,
  ): Promise<void> {
    this.assert.schema.isValidAddress('manager', manager);
    this.assert.schema.isValidAddress('allocatorAddress', allocatorAddress);
    this.assert.schema.isValidAddress('liquidator', liquidator);
    this.assert.schema.isValidAddress('feeRecipient', feeRecipient);
    this.assert.schema.isValidAddress('feeCalculator', feeCalculator);

    this.assertValidAllocation(allocation);
    this.assertValidFees(entryFee, rebalanceFee);

    this.assert.common.isValidString(tradingPoolName, coreAPIErrors.STRING_CANNOT_BE_EMPTY('name'));
    this.assert.common.isValidString(tradingPoolSymbol, coreAPIErrors.STRING_CANNOT_BE_EMPTY('symbol'));
  }

  private async assertCreateTradingPoolV2(
    allocation: BigNumber,
    tradingPoolName: string,
    tradingPoolSymbol: string,
    manager: Address,
    allocatorAddress: Address,
    liquidator: Address,
    feeRecipient: Address,
    feeCalculator: Address,
    entryFee: BigNumber,
    profitFeePeriod: BigNumber,
    highWatermarkResetPeriod: BigNumber,
    profitFee: BigNumber,
    streamingFee: BigNumber,
  ): Promise<void> {
    this.assert.schema.isValidAddress('manager', manager);
    this.assert.schema.isValidAddress('allocatorAddress', allocatorAddress);
    this.assert.schema.isValidAddress('liquidator', liquidator);
    this.assert.schema.isValidAddress('feeRecipient', feeRecipient);
    this.assert.schema.isValidAddress('feeCalculator', feeCalculator);

    this.assertValidAllocation(allocation);

    await this.assertValidPerformanceFees(
      feeCalculator,
      profitFeePeriod,
      highWatermarkResetPeriod,
      entryFee,
      profitFee,
      streamingFee
    );

    this.assert.common.isValidString(tradingPoolName, coreAPIErrors.STRING_CANNOT_BE_EMPTY('name'));
    this.assert.common.isValidString(tradingPoolSymbol, coreAPIErrors.STRING_CANNOT_BE_EMPTY('symbol'));
  }

  private async assertAddressSetters(
    manager: Address,
    tradingPool: Address,
    newAddress: Address,
    trader: Address,
  ): Promise<void> {
    this.assert.schema.isValidAddress('manager', manager);
    this.assert.schema.isValidAddress('tradingPool', tradingPool);
    this.assert.schema.isValidAddress('newAddress', newAddress);

    const poolInfo = await this.socialTradingManager.pools(manager, tradingPool);

    this.assert.socialTrading.isTrader(poolInfo.trader, trader);
  }

  private async assertUpdateAllocation(
    manager: Address,
    tradingPool: Address,
    newAllocation: BigNumber,
    txOpts: Tx,
  ): Promise<void> {
    this.assert.schema.isValidAddress('manager', manager);
    this.assert.schema.isValidAddress('tradingPool', tradingPool);

    const poolInfo = await this.socialTradingManager.pools(manager, tradingPool);

    await this.assert.rebalancing.isNotInRebalanceState(tradingPool);
    await this.assert.rebalancing.sufficientTimeBetweenRebalance(tradingPool);
    this.assert.socialTrading.isTrader(poolInfo.trader, txOpts.from);

    this.assertValidAllocation(newAllocation);
  }

  private async assertInitiateEntryFeeChange(
    manager: Address,
    tradingPool: Address,
    entryFee: BigNumber,
    txOpts: Tx
  ): Promise<void> {
    this.assert.schema.isValidAddress('manager', manager);
    this.assert.schema.isValidAddress('tradingPool', tradingPool);

    const poolInfo = await this.socialTradingManager.pools(manager, tradingPool);

    this.assert.socialTrading.isTrader(poolInfo.trader, txOpts.from);
    this.assert.socialTrading.feeMultipleOfOneBasisPoint(entryFee);
    await this.assert.socialTrading.feeDoesNotExceedMax(manager, entryFee);
  }

  private async assertFinalizeEntryFeeChange(
    manager: Address,
    tradingPool: Address,
    txOpts: Tx
  ): Promise<void> {
    this.assert.schema.isValidAddress('manager', manager);
    this.assert.schema.isValidAddress('tradingPool', tradingPool);

    const poolInfo: any = await this.socialTradingManager.pools(manager, tradingPool);

    this.assert.socialTrading.isTrader(poolInfo.trader, txOpts.from);
    this.assert.socialTrading.feeChangeInitiated(new BigNumber(poolInfo.feeUpdateTimestamp));
    this.assert.socialTrading.feeChangeTimelockElapsed(new BigNumber(poolInfo.feeUpdateTimestamp));
  }

  private async assertAdjustFees(
    manager: Address,
    tradingPool: Address,
    newFeeType: FeeType,
    newFeePercentage: BigNumber,
    txOpts: Tx
  ): Promise<void> {
    const poolInfo: any = await this.socialTradingManager.pools(manager, tradingPool);
    this.assert.socialTrading.isTrader(poolInfo.trader, txOpts.from);
    this.assert.socialTrading.feeMultipleOfOneBasisPoint(newFeePercentage);

    const tradingPoolData = await this.fetchNewTradingPoolV2DetailsAsync(tradingPool);
    let maxFee: BigNumber;
    if (newFeeType == FeeType.StreamingFee) {
      maxFee = await this.performanceFeeCalculator.maximumStreamingFeePercentage(
        tradingPoolData.performanceFeeCalculatorAddress
      );
    } else {
      maxFee = await this.performanceFeeCalculator.maximumProfitFeePercentage(
        tradingPoolData.performanceFeeCalculatorAddress
      );
    }

    this.assert.common.isGreaterOrEqualThan(
      maxFee,
      newFeePercentage,
      'Passed fee exceeds allowed maximum.'
    );
  }

  private async assertRemoveFeeUpdate(
    manager: Address,
    tradingPool: Address,
    txOpts: Tx
  ): Promise<void> {
    const poolInfo: any = await this.socialTradingManager.pools(manager, tradingPool);

    this.assert.socialTrading.isTrader(poolInfo.trader, txOpts.from);
  }

  private assertValidAllocation(
    newAllocation: BigNumber
  ): void {
    this.assert.socialTrading.allocationGreaterOrEqualToZero(newAllocation);
    this.assert.socialTrading.allocationLessThanOneHundred(newAllocation);
    this.assert.socialTrading.allocationMultipleOfOnePercent(newAllocation);
  }

  private assertValidFees(
    entryFee: BigNumber,
    rebalanceFee: BigNumber
  ): void {
    this.assert.socialTrading.feeMultipleOfOneBasisPoint(entryFee);
    this.assert.socialTrading.feeMultipleOfOneBasisPoint(rebalanceFee);
  }

  private async assertValidPerformanceFees(
    feeCalculator: Address,
    profitFeePeriod: BigNumber,
    highWatermarkResetPeriod: BigNumber,
    entryFee: BigNumber,
    profitFee: BigNumber,
    streamingFee: BigNumber,
  ): Promise<void> {
    this.assert.socialTrading.feeMultipleOfOneBasisPoint(entryFee);
    this.assert.socialTrading.feeMultipleOfOneBasisPoint(profitFee);
    this.assert.socialTrading.feeMultipleOfOneBasisPoint(streamingFee);

    this.assert.common.isGreaterOrEqualThan(
      highWatermarkResetPeriod,
      profitFeePeriod,
      'High watermark reset must be greater than profit fee period.'
    );

    const maxProfitFeePercentage = await this.performanceFeeCalculator.maximumProfitFeePercentage(feeCalculator);
    const maxStreamingFeePercentage = await this.performanceFeeCalculator.maximumStreamingFeePercentage(feeCalculator);

    this.assert.common.isGreaterOrEqualThan(
      maxProfitFeePercentage,
      profitFee,
      'Passed fee exceeds allowed maximum.'
    );
    this.assert.common.isGreaterOrEqualThan(
      maxStreamingFeePercentage,
      streamingFee,
      'Passed fee exceeds allowed maximum.'
    );
  }
}