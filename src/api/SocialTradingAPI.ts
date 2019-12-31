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
import { ProtocolViewerWrapper, SocialTradingManagerWrapper } from '../wrappers';
import { Assertions } from '../assertions';
import { coreAPIErrors } from '../errors';
import { Address, Bytes, SetProtocolConfig, Tx } from '../types/common';
import { NewTradingPoolInfo, TradingPoolRebalanceInfo } from '../types/strategies';

const { SetProtocolUtils: SetUtils } = setProtocolUtils;

/**
 * @title SocialTradingAPI
 * @author Set Protocol
 *
 * A library for interacting with Social Trading contracts
 */
export class SocialTradingAPI {
  private assert: Assertions;
  private protocolViewer: ProtocolViewerWrapper;
  private socialTradingManager: SocialTradingManagerWrapper;

  /**
   * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3          The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   * @param assertions    An instance of the Assertion library
   * @param config        Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
   */
  constructor(web3: Web3, assertions: Assertions, config: SetProtocolConfig) {
    this.protocolViewer = new ProtocolViewerWrapper(web3, config.protocolViewerAddress);
    this.socialTradingManager = new SocialTradingManagerWrapper(web3);

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
      entryFee,
      rebalanceFee,
      tradingPoolName,
      tradingPoolSymbol,
      manager,
      allocatorAddress,
      liquidator,
      feeRecipient,
      feeCalculator
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
   * Calls SocialTradingManager's setTrader function. Passes pool premissions to new address.
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

  /* ============ Private Assertions ============ */
  private async assertCreateTradingPool(
    allocation: BigNumber,
    entryFee: BigNumber,
    rebalanceFee: BigNumber,
    tradingPoolName: string,
    tradingPoolSymbol: string,
    manager: Address,
    allocatorAddress: Address,
    liquidator: Address,
    feeRecipient: Address,
    feeCalculator: Address,
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

  private async assertAddressSetters(
    manager: Address,
    tradingPool: Address,
    newAddress: Address,
    trader: Address,
  ): Promise<void> {
    this.assert.schema.isValidAddress('manager', manager);
    this.assert.schema.isValidAddress('tradingPool', tradingPool);
    this.assert.schema.isValidAddress('newAddress', newAddress);

    await this.assert.socialTrading.isTrader(manager, tradingPool, trader);
  }

  private async assertUpdateAllocation(
    manager: Address,
    tradingPool: Address,
    newAllocation: BigNumber,
    txOpts: Tx,
  ): Promise<void> {
    this.assert.schema.isValidAddress('manager', manager);
    this.assert.schema.isValidAddress('tradingPool', tradingPool);

    await this.assert.rebalancing.isNotInRebalanceState(tradingPool);
    await this.assert.rebalancing.sufficientTimeBetweenRebalance(tradingPool);
    await this.assert.socialTrading.isTrader(manager, tradingPool, txOpts.from);

    this.assertValidAllocation(newAllocation);
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
}