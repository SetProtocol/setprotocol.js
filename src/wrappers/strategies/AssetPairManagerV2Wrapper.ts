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
 * @title  AssetPairManagerV2Wrapper
 * @author Set Protocol
 *
 * The AssetPairManagerV2Wrapper handles all functions on the AssetPairManagerV2 contract
 *
 */
export class AssetPairManagerV2Wrapper {
  protected web3: Web3;
  protected contracts: StrategyContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new StrategyContractWrapper(this.web3);
  }

  /**
   * Calls an AssetPairManagerV2's intialPropose function. This function kicks off a propose cycle on the
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
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await assetPairManagerInstance.initialPropose.sendTransactionAsync(txOptions);
  }

  /**
   * Calls an AssetPairManagerV2's confirmPropose function. This function again checks to make sure that
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
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await assetPairManagerInstance.confirmPropose.sendTransactionAsync(txOptions);
  }

  /**
   * Update liquidator used by Rebalancing Set.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @param  newLiquidatorAddress         Address of new Liquidator
   * @return                              The hash of the resulting transaction.
   */
  public async setLiquidator(
    managerAddress: Address,
    newLiquidatorAddress: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await assetPairManagerInstance.setLiquidator.sendTransactionAsync(newLiquidatorAddress, txOptions);
  }

  /**
   * Update liquidatorData used by Rebalancing Set.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @param  newLiquidatorData            New liquidator data in bytes
   * @return                              The hash of the resulting transaction.
   */
  public async setLiquidatorData(
    managerAddress: Address,
    newLiquidatorData: string,
    txOpts?: Tx,
  ): Promise<string> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await assetPairManagerInstance.setLiquidatorData.sendTransactionAsync(newLiquidatorData, txOptions);
  }

  /**
   * Update fee recipient on the Set.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @param  newFeeRecipient              Address of new fee recipient
   * @return                              The hash of the resulting transaction.
   */
  public async setFeeRecipient(
    managerAddress: Address,
    newFeeRecipient: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await assetPairManagerInstance.setFeeRecipient.sendTransactionAsync(newFeeRecipient, txOptions);
  }

  /**
   * Calls AssetPairManagerV2's adjustFee function. Allows manager to change performance fees.
   *
   * @param  managerAddress                 Address of the rebalancing manager contract
   * @param  newFeeCallData                 New fee call data
   * @return                                The hash of the resulting transaction.
   */
  public async adjustFee(
    managerAddress: Address,
    newFeeCallData: string,
    txOpts?: Tx,
  ): Promise<string> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await assetPairManagerInstance.adjustFee.sendTransactionAsync(
      newFeeCallData,
      txOptions
    );
  }

  /**
   * Calls AssetPairManagerV2's adjustFee function. Allows trader to change performance fees.
   *
   * @param  managerAddress                 Address of the rebalancing manager contract
   * @param  upgradeHash                    Hash of upgrade to be removed
   * @return                                The hash of the resulting transaction.
   */
  public async removeRegisteredUpgrade(
    managerAddress: Address,
    upgradeHash: string,
    txOpts?: Tx,
  ): Promise<string> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await assetPairManagerInstance.removeRegisteredUpgrade.sendTransactionAsync(
      upgradeHash,
      txOptions
    );
  }

  /**
   * Calls an AssetPairManagerV2's canInitialPropose function. Returns whether initialPropose can be called
   * without reverting.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @return                              Boolean indicating whether initialPropose can be successfully called
   */
  public async canInitialPropose(managerAddress: Address): Promise<boolean> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.canInitialPropose.callAsync();
  }

  /**
   * Calls an AssetPairManagerV2's canConfirmPropose function. Returns whether confirmPropose can be called
   * without reverting.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @return                              Boolean indicating whether confirmPropose can be successfully called
   */
  public async canConfirmPropose(managerAddress: Address): Promise<boolean> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.canConfirmPropose.callAsync();
  }

  public async core(managerAddress: Address): Promise<Address> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.core.callAsync();
  }

  public async allocator(managerAddress: Address): Promise<Address> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.allocator.callAsync();
  }

  public async trigger(managerAddress: Address): Promise<Address> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.trigger.callAsync();
  }

  public async rebalancingSetToken(managerAddress: Address): Promise<Address> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.rebalancingSetToken.callAsync();
  }

  public async baseAssetAllocation(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.baseAssetAllocation.callAsync();
  }

  public async allocationDenominator(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.allocationDenominator.callAsync();
  }

  public async bullishBaseAssetAllocation(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.bullishBaseAssetAllocation.callAsync();
  }

  public async bearishBaseAssetAllocation(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.bearishBaseAssetAllocation.callAsync();
  }

  public async signalConfirmationMinTime(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.signalConfirmationMinTime.callAsync();
  }

  public async signalConfirmationMaxTime(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.signalConfirmationMaxTime.callAsync();
  }

  public async recentInitialProposeTimestamp(managerAddress: Address): Promise<BigNumber> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.recentInitialProposeTimestamp.callAsync();
  }

  public async liquidatorData(managerAddress: Address): Promise<string> {
    const assetPairManagerInstance = await this.contracts.loadAssetPairManagerV2ContractAsync(managerAddress);

    return await assetPairManagerInstance.liquidatorData.callAsync();
  }
}
