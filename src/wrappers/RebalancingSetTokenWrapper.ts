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
import { Address, TokenFlows, Tx } from '../types/common';

import { ContractWrapper } from '.';
import { BigNumber } from '../util';
import { ZERO } from '../constants';
import { coreAPIErrors } from '../errors';

/**
 * @title  RebalancingSetTokenWrapper
 * @author Set Protocol
 *
 * The Rebalancing Set Token API handles all functions on the Rebalancing Set Token smart contract.
 *
 */
export class RebalancingSetTokenWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Proposes rebalance, can only be called by manager
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  nextSetAddress                 Set to rebalance into
   * @param  auctionLibrary                 Address of auction price curve to use
   * @param  auctionTimeToPivot             Amount of time until curve hits pivot
   * @param  auctionStartPrice              Used with priceNumerator, define auction start price
   * @param  auctionPivotPrice              Used with priceNumerator, price curve pivots at
   * @param  txOpts                         Transaction options
   * @return                                Transaction hash
   */
  public async propose(
    rebalancingSetAddress: Address,
    nextSet: Address,
    auctionLibrary: Address,
    auctionTimeToPivot: BigNumber,
    auctionStartPrice: BigNumber,
    auctionPivotPrice: BigNumber,
    txOpts: Tx
  ): Promise<string> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.propose.sendTransactionAsync(
      nextSet,
      auctionLibrary,
      auctionTimeToPivot,
      auctionStartPrice,
      auctionPivotPrice,
      txOpts
    );
  }

  /**
   * Starts rebalance after proposal period has elapsed
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @param  txOpts                  Transaction options
   * @return                         Transaction hash
   */
  public async startRebalance(
    rebalancingSetAddress: Address,
    txOpts: Tx
  ): Promise<string> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.startRebalance.sendTransactionAsync(
      txOpts
    );
  }

  /**
   * Settles rebalance after currentSets been rebalanced
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @param  txOpts                  Transaction options
   * @return                         Transaction hash
   */
  public async settleRebalance(
    rebalancingSetAddress: Address,
    txOpts: Tx
  ): Promise<string> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.settleRebalance.sendTransactionAsync(
      txOpts
    );
  }

  /**
   * Change token manager address
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @param  newManager              Address of new manager
   * @param  txOpts                  Transaction options
   * @return                         Transaction hash
   */
  public async setManager(
    rebalancingSetAddress: Address,
    newManager: Address,
    txOpts: Tx
  ): Promise<string> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.setManager.sendTransactionAsync(
      newManager,
      txOpts
    );
  }

  /**
   * Gets token inflow and outflows for current rebalance price
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @param  quantity                Amount of currentSet to rebalance
   * @return                         Array of token inflows
   * @return                         Array of token outflows
   */
  public async getBidPrice(
    rebalancingSetAddress: Address,
    quantity: BigNumber,
  ): Promise<TokenFlows> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    const tokenFlows = await rebalancingSetTokenInstance.getBidPrice.callAsync(quantity);
    return { inflow: tokenFlows[0], outflow: tokenFlows[1] } as TokenFlows;
  }

  /**
   * Returns if passed Set is collateralizing the Rebalancing Set
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @param  component               Address of collateral component
   * @return                         Boolean if component collateralizing Rebalancing Set
   */
  public async tokenIsComponent(
    rebalancingSetAddress: Address,
    component: Address,
  ): Promise<boolean> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.tokenIsComponent.callAsync(component);
  }

  /**
   * Gets manager of the Rebalancing Set
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The manager's address
   */
  public async manager(rebalancingSetAddress: Address): Promise<Address> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.manager.callAsync();
  }

  /**
   * Gets state of the Rebalancing Set
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The state of the RebalancingSetToken
   */
  public async rebalanceState(rebalancingSetAddress: Address): Promise<string> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    const stateNumber = await rebalancingSetTokenInstance.rebalanceState.callAsync();
    return this.parseState(stateNumber);
  }

  /**
   * Gets address of the currentSet for the Rebalancing Set
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The currentSet of the RebalancingSetToken
   */
  public async currentSet(rebalancingSetAddress: Address): Promise<Address> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.currentSet.callAsync();
  }

  /**
   * Gets unitShares of the Rebalancing Set
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The unitShares of the RebalancingSetToken
   */
  public async unitShares(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.unitShares.callAsync();
  }

  /**
   * Gets Unix timestamp of last rebalance for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The lastRebalanceTimestamp of the RebalancingSetToken
   */
  public async lastRebalanceTimestamp(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.lastRebalanceTimestamp.callAsync();
  }

  /**
   * Gets length of the proposal period for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The proposalPeriod of the RebalancingSetToken
   */
  public async proposalPeriod(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.proposalPeriod.callAsync();
  }

  /**
   * Gets time between rebalances for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The rebalanceInterval of the RebalancingSetToken
   */
  public async rebalanceInterval(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.rebalanceInterval.callAsync();
  }

  /**
   * Gets start time of proposal period for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The proposalStartTime of the RebalancingSetToken
   */
  public async proposalStartTime(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.proposalStartTime.callAsync();
  }

  /**
   * Gets nextSet for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The nextSet of the RebalancingSetToken
   */
  public async nextSet(rebalancingSetAddress: Address): Promise<Address> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.nextSet.callAsync();
  }

  /**
   * Gets address of auctionLibrary for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The auctionLibrary address of the RebalancingSetToken
   */
  public async auctionLibrary(rebalancingSetAddress: Address): Promise<Address> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.auctionLibrary.callAsync();
  }

  /**
   * Gets auctionParameters struct for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The auctionLibrary address of the RebalancingSetToken
   */
  public async auctionParameters(rebalancingSetAddress: Address): Promise<BigNumber[]> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.auctionParameters.callAsync();
  }

  /**
   * Gets minimumBid for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The minimumBid of the RebalancingSetToken
   */
  public async minimumBid(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.minimumBid.callAsync();
  }

  /**
   * Gets combinedTokenArray for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The combinedTokenArray of the RebalancingSetToken
   */
  public async getCombinedTokenArray(rebalancingSetAddress: Address): Promise<Address[]> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.getCombinedTokenArray.callAsync();
  }

  /**
   * Gets combinedCurrentUnits for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The combinedCurrentUnits of the RebalancingSetToken
   */
  public async getCombinedCurrentUnits(rebalancingSetAddress: Address): Promise<BigNumber[]> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.getCombinedCurrentUnits.callAsync();
  }

  /**
   * Gets combinedNextSetUnits for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The combinedNextSetUnits of the RebalancingSetToken
   */
  public async getCombinedNextSetUnits(rebalancingSetAddress: Address): Promise<BigNumber[]> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.getCombinedNextSetUnits.callAsync();
  }

  /**
   * Gets remainingCurrentSets for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The remainingCurrentSets of the RebalancingSetToken
   */
  public async remainingCurrentSets(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.remainingCurrentSets.callAsync();
  }

  private parseState(stateNumber: BigNumber): string {
    if (stateNumber.eq(new BigNumber(0))) {
      return 'Default';
    } else if (stateNumber.eq(new BigNumber(1))) {
      return 'Proposal';
    } else {
      return 'Rebalance';
    }
  }
}
