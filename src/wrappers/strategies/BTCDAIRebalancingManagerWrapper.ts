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
 * @title  BTCDAIRebalancingManagerWrapper
 * @author Set Protocol
 *
 * The BTCDAIRebalancingManagerWrapper API handles all functions on the BTCDAIRebalancingManager smart contract.
 *
 */
export class BTCDAIRebalancingManagerWrapper {
  private web3: Web3;
  private contracts: StrategyContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new StrategyContractWrapper(this.web3);
  }

  /**
   * Calls a rebalancing BTCDAI rebalancing manager's propose function. This function deploys a new Set token
   * and calls the underling rebalancing set token's propose function with fixed parameters and the new deployed Set.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @param  rebalancingSetTokenAddress   Address of the set to be rebalanced (must be managed by the manager address)
   * @return                              The hash of the resulting transaction.
   */
  public async propose(
    managerAddress: Address,
    rebalancingSetTokenAddress: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await btcDaiManagerInstance.propose.sendTransactionAsync(rebalancingSetTokenAddress, txOptions);
  }

  public async core(managerAddress: Address): Promise<Address> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.coreAddress.callAsync();
  }

  public async btcPriceFeed(managerAddress: Address): Promise<Address> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.btcPriceFeed.callAsync();
  }

  public async btcAddress(managerAddress: Address): Promise<Address> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.btcAddress.callAsync();
  }

  public async daiAddress(managerAddress: Address): Promise<Address> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.daiAddress.callAsync();
  }

  public async setTokenFactory(managerAddress: Address): Promise<Address> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.setTokenFactory.callAsync();
  }

  public async btcMultiplier(managerAddress: Address): Promise<BigNumber> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.btcMultiplier.callAsync();
  }

  public async daiMultiplier(managerAddress: Address): Promise<BigNumber> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.daiMultiplier.callAsync();
  }

  public async maximumLowerThreshold(managerAddress: Address): Promise<BigNumber> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.maximumLowerThreshold.callAsync();
  }

  public async minimumUpperThreshold(managerAddress: Address): Promise<BigNumber> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.minimumUpperThreshold.callAsync();
  }

  public async auctionLibrary(managerAddress: Address): Promise<Address> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.auctionLibrary.callAsync();
  }

  public async auctionTimeToPivot(managerAddress: Address): Promise<BigNumber> {
    const btcDaiManagerInstance = await this.contracts.loadBtcDaiManagerContractAsync(managerAddress);

    return await btcDaiManagerInstance.auctionTimeToPivot.callAsync();
  }
}
