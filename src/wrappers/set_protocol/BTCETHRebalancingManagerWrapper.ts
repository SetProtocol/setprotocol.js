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
 * @title  BTCETHRebalancingManagerWrapper
 * @author Set Protocol
 *
 * The Vault API handles all functions on the Vault smart contract.
 *
 */
export class BTCETHRebalancingManagerWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Calls a rebalancing Btc Eth rebalancing manager's propose function. This function deploys a new Set token
   * and calls the underling rebalancing set token's propose function with fixed parameters and the new deployed Set.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @param  rebalancingSetTokenAddress   Address of the set to be rebalanced (must be managed by the manager address)
   * @return              The hash of the resulting transaction.
   */
  public async propose(
    managerAddress: Address,
    rebalancingSetTokenAddress: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await btcEthManagerInstance.propose.sendTransactionAsync(rebalancingSetTokenAddress, txOptions);
  }

  public async core(managerAddress: Address): Promise<Address> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);

    return await btcEthManagerInstance.coreAddress.callAsync();
  }

  public async btcPriceFeed(managerAddress: Address): Promise<Address> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);

    return await btcEthManagerInstance.btcPriceFeed.callAsync();
  }

  public async ethPriceFeed(managerAddress: Address): Promise<Address> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);

    return await btcEthManagerInstance.ethPriceFeed.callAsync();
  }

  public async btcAddress(managerAddress: Address): Promise<Address> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);

    return await btcEthManagerInstance.btcAddress.callAsync();
  }

  public async ethAddress(managerAddress: Address): Promise<Address> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);

    return await btcEthManagerInstance.ethAddress.callAsync();
  }

  public async setTokenFactory(managerAddress: Address): Promise<Address> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);

    return await btcEthManagerInstance.setTokenFactory.callAsync();
  }

  public async btcMultiplier(managerAddress: Address): Promise<BigNumber> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);

    return await btcEthManagerInstance.btcMultiplier.callAsync();
  }

  public async ethMultiplier(managerAddress: Address): Promise<BigNumber> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);

    return await btcEthManagerInstance.ethMultiplier.callAsync();
  }

  public async auctionLibrary(managerAddress: Address): Promise<Address> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);

    return await btcEthManagerInstance.auctionLibrary.callAsync();
  }

  public async auctionTimeToPivot(managerAddress: Address): Promise<BigNumber> {
    const btcEthManagerInstance = await this.contracts.loadBtcEthManagerAsync(managerAddress);

    return await btcEthManagerInstance.auctionTimeToPivot.callAsync();
  }
}
