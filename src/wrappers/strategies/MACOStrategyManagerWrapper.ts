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

import { ContractWrapper } from '.';
import { BigNumber, generateTxOpts } from '../../util';
import { Address, Tx } from '../../types/common';

/**
 * @title  MACOStrategyManagerWrapper
 * @author Set Protocol
 *
 * The MACOStrategyManager API handles all functions on the MACOStrategyManager smart contract.
 *
 */
export class MACOStrategyManagerWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Calls a rebalancing MACO Strategy manager's intialPropose function. This function kicks off a propose cycle on the
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
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await macoStrategyManagerInstance.initialPropose.sendTransactionAsync(txOptions);
  }

  /**
   * Calls a rebalancing MACO Strategy manager's confirmPropose function. This function again checks to make sure that
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
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await macoStrategyManagerInstance.confirmPropose.sendTransactionAsync(txOptions);
  }

  public async coreAddress(managerAddress: Address): Promise<Address> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.coreAddress.callAsync();
  }

  public async rebalancingSetTokenAddress(managerAddress: Address): Promise<Address> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.rebalancingSetTokenAddress.callAsync();
  }

  public async movingAveragePriceFeed(managerAddress: Address): Promise<Address> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.movingAveragePriceFeed.callAsync();
  }

  public async stableAssetAddress(managerAddress: Address): Promise<Address> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.stableAssetAddress.callAsync();
  }

  public async riskAssetAddress(managerAddress: Address): Promise<Address> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.riskAssetAddress.callAsync();
  }

  public async stableCollateralAddress(managerAddress: Address): Promise<Address> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.stableCollateralAddress.callAsync();
  }

  public async riskCollateralAddress(managerAddress: Address): Promise<Address> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.riskCollateralAddress.callAsync();
  }

  public async setTokenFactory(managerAddress: Address): Promise<Address> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.setTokenFactory.callAsync();
  }

  public async auctionLibrary(managerAddress: Address): Promise<Address> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.auctionLibrary.callAsync();
  }

  public async movingAverageDays(managerAddress: Address): Promise<BigNumber> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.movingAverageDays.callAsync();
  }

  public async lastCrossoverConfirmationTimestamp(managerAddress: Address): Promise<BigNumber> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.lastCrossoverConfirmationTimestamp.callAsync();
  }

  public async crossoverConfirmationMinTime(managerAddress: Address): Promise<BigNumber> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.crossoverConfirmationMinTime.callAsync();
  }

  public async crossoverConfirmationMaxTime(managerAddress: Address): Promise<BigNumber> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.crossoverConfirmationMaxTime.callAsync();
  }

  public async auctionTimeToPivot(managerAddress: Address): Promise<BigNumber> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.auctionTimeToPivot.callAsync();
  }
}