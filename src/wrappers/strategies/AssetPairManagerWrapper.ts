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
import { Address, Tx } from '../../types/common';

/**
 * @title  AssetPairManagerWrapper
 * @author Set Protocol
 *
 * The AssetPairManagerWrapper handles all functions on the AssetPairManager contract
 *
 */
export class AssetPairManagerWrapper {
  protected web3: Web3;
  protected contracts: StrategyContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new StrategyContractWrapper(this.web3);
  }

  /**
   * Calls an AssetPairManager's intialPropose function. This function kicks off a propose cycle on the
   * manager by checking that the time and price constraints have been met then logging a timestamp used later in the
   * process to confirm the signal.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @return                              The hash of the resulting transaction.
   */
  public async initialPropose(
    managerAddress: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await assetPairManagerInstance.initialPropose.sendTransactionAsync(txOptions);
  }

  /**
   * Calls an AssetPairManager's confirmPropose function. This function again checks to make sure that
   * price and time constraints have been satisfied. After that it generates the new allocation proposal and sends the
   * results to the Rebalancing Set Token to kick off the official rebalance.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @return                              The hash of the resulting transaction.
   */
  public async confirmPropose(
    managerAddress: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await assetPairManagerInstance.confirmPropose.sendTransactionAsync(txOptions);
  }

  /**
   * Calls an AssetPairManager's canInitialPropose function. Returns whether initialPropose can be called
   * without reverting.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @return                              Boolean indicating whether initialPropose can be successfully called
   */
  public async canInitialPropose(managerAddress: Address): Promise<boolean> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.canInitialPropose.callAsync();
  }

  /**
   * Calls an AssetPairManager's canConfirmPropose function. Returns whether confirmPropose can be called
   * without reverting.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @return                              Boolean indicating whether confirmPropose can be successfully called
   */
  public async canConfirmPropose(managerAddress: Address): Promise<boolean> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.canConfirmPropose.callAsync();
  }

  public async core(managerAddress: Address): Promise<Address> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.core.callAsync();
  }

  public async allocator(managerAddress: Address): Promise<Address> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.allocator.callAsync();
  }

  public async trigger(managerAddress: Address): Promise<Address> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.trigger.callAsync();
  }

  public async auctionLibrary(managerAddress: Address): Promise<Address> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.auctionLibrary.callAsync();
  }

  public async rebalancingSetToken(managerAddress: Address): Promise<Address> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.rebalancingSetToken.callAsync();
  }

  public async baseAssetAllocation(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.baseAssetAllocation.callAsync();
  }

  public async allocationDenominator(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.allocationDenominator.callAsync();
  }

  public async bullishBaseAssetAllocation(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.bullishBaseAssetAllocation.callAsync();
  }

  public async bearishBaseAssetAllocation(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.bearishBaseAssetAllocation.callAsync();
  }

  public async auctionStartPercentage(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.auctionStartPercentage.callAsync();
  }

  public async auctionPivotPercentage(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.auctionPivotPercentage.callAsync();
  }

  public async auctionTimeToPivot(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.auctionTimeToPivot.callAsync();
  }

  public async signalConfirmationMinTime(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.signalConfirmationMinTime.callAsync();
  }

  public async signalConfirmationMaxTime(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.signalConfirmationMaxTime.callAsync();
  }

  public async recentInitialProposeTimestamp(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerContractAsync(managerAddress);

    return await assetPairManagerInstance.recentInitialProposeTimestamp.callAsync();
  }
}
