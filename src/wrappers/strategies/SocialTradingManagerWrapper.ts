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

import { StrategyContractWrapper } from './StrategyContractWrapper';
import { BigNumber, generateTxOpts } from '../../util';
import { Address, Bytes, Tx } from '../../types/common';

/**
 * @title  SocialTradingManagerWrapper
 * @author Set Protocol
 *
 * The SocialTradingManagerWrapper handles all functions on the SocialTradingManager contract
 *
 */
export class SocialTradingManagerWrapper {
  protected web3: Web3;
  protected contracts: StrategyContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new StrategyContractWrapper(this.web3);
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
   * @param  rebalancingSetCallData         Call data passed to RebalancingSetTokenV2 factory to create tradingPool
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                The hash of the resulting transaction.
   */
  public async createTradingPool(
    manager: Address,
    allocatorAddress: Address,
    startingBaseAssetAllocation: BigNumber,
    startingUSDValue: BigNumber,
    tradingPoolName: Bytes,
    tradingPoolSymbol: Bytes,
    rebalancingSetCallData: Bytes,
    txOpts?: Tx,
  ): Promise<string> {
    const socialTradingManagerInstance = await this.contracts.loadSocialTradingManagerContractAsync(manager);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await socialTradingManagerInstance.createTradingPool.sendTransactionAsync(
      allocatorAddress,
      startingBaseAssetAllocation,
      startingUSDValue,
      tradingPoolName,
      tradingPoolSymbol,
      rebalancingSetCallData,
      txOptions
    );
  }

  /**
   * Calls SocialTradingManager's updateAllocation function. This function creates a new collateral Set and
   * calls startRebalance on RebalancingSetTokenV2. Updates allocation state on Manager contract.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  tradingPool                    Address of tradingPool being updated
   * @param  newAllocation                  New base asset allocation of tradingPool
   * @param  liquidatorData                 Call data passed to RebalancingSetTokenV2 to set params on liquidator
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                The hash of the resulting transaction.
   */
  public async updateAllocation(
    manager: Address,
    tradingPool: Address,
    newAllocation: BigNumber,
    liquidatorData: Bytes,
    txOpts?: Tx,
  ): Promise<string> {
    const socialTradingManagerInstance = await this.contracts.loadSocialTradingManagerContractAsync(manager);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await socialTradingManagerInstance.updateAllocation.sendTransactionAsync(
      tradingPool,
      newAllocation,
      liquidatorData,
      txOptions
    );
  }

  /**
   * Calls SocialTradingManager's initiateEntryFeeChange function. Allows trader to change entryFee.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  tradingPool                    Address of tradingPool being updated
   * @param  newEntryFee                    New entry fee
   * @return                                The hash of the resulting transaction.
   */
  public async initiateEntryFeeChange(
    manager: Address,
    tradingPool: Address,
    newEntryFee: BigNumber,
    txOpts?: Tx,
  ): Promise<string> {
    const socialTradingManagerInstance = await this.contracts.loadSocialTradingManagerContractAsync(manager);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await socialTradingManagerInstance.initiateEntryFeeChange.sendTransactionAsync(
      tradingPool,
      newEntryFee,
      txOptions
    );
  }

  /**
   * Calls SocialTradingManager's finalizeEntryFeeChange function. Allows trader to finalize entryFee, once timelock
   * expires.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  tradingPool                    Address of tradingPool being updated
   * @return                                The hash of the resulting transaction.
   */
  public async finalizeEntryFeeChange(
    manager: Address,
    tradingPool: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const socialTradingManagerInstance = await this.contracts.loadSocialTradingManagerContractAsync(manager);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await socialTradingManagerInstance.finalizeEntryFeeChange.sendTransactionAsync(
      tradingPool,
      txOptions
    );
  }

  /**
   * Calls SocialTradingManager's setTrader function. Allows trader to change address that controls tradingPool. Can
   * only be called by current trader of the tradingPool.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  tradingPool                    Address of tradingPool being updated
   * @param  newTrader                      New trader address for tradingPool
   * @return                                The hash of the resulting transaction.
   */
  public async setTrader(
    manager: Address,
    tradingPool: Address,
    newTrader: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const socialTradingManagerInstance = await this.contracts.loadSocialTradingManagerContractAsync(manager);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await socialTradingManagerInstance.setTrader.sendTransactionAsync(
      tradingPool,
      newTrader,
      txOptions
    );
  }

  /**
   * Calls SocialTradingManager's setLiquidator function. Allows trader to change liquidator address used to execute.
   * rebalances. Can only be called by current trader of the tradingPool.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  tradingPool                    Address of tradingPool being updated
   * @param  newLiquidator                  New liquidator address for tradingPool
   * @return                                The hash of the resulting transaction.
   */
  public async setLiquidator(
    manager: Address,
    tradingPool: Address,
    newLiquidator: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const socialTradingManagerInstance = await this.contracts.loadSocialTradingManagerContractAsync(manager);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await socialTradingManagerInstance.setLiquidator.sendTransactionAsync(
      tradingPool,
      newLiquidator,
      txOptions
    );
  }

  /**
   * Calls SocialTradingManager's setFeeRecipient function. Allows trader to change address that accrues fees.
   * Can only be called by current trader of the tradingPool.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  tradingPool                    Address of tradingPool being updated
   * @param  newFeeRecipient                New feeRecipient address for tradingPool
   * @return                                The hash of the resulting transaction.
   */
  public async setFeeRecipient(
    manager: Address,
    tradingPool: Address,
    newFeeRecipient: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const socialTradingManagerInstance = await this.contracts.loadSocialTradingManagerContractAsync(manager);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await socialTradingManagerInstance.setFeeRecipient.sendTransactionAsync(
      tradingPool,
      newFeeRecipient,
      txOptions
    );
  }

  /**
   * Calls SocialTradingManager's pools function. Gets info related to passed tradingPool.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  tradingPool                    Address of tradingPool being updated
   * @return                                The hash of the resulting transaction.
   */
  public async pools(
    manager: Address,
    tradingPool: Address,
  ): Promise<any> {
    const socialTradingManagerInstance = await this.contracts.loadSocialTradingManagerContractAsync(manager);

    return await socialTradingManagerInstance.pools.callAsync(tradingPool);
  }
}
