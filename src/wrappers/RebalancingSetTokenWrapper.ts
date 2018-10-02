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

import * as Web3 from 'web3';
import { Address } from 'set-protocol-utils';

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
   * Gets start time of rebalance period for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The auctionStartTime of the RebalancingSetToken
   */
  public async auctionStartTime(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.auctionStartTime.callAsync();
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
   * Gets auctionPriceDivisor for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The auctionPriceDivisor of the RebalancingSetToken
   */
  public async auctionPriceDivisor(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.auctionPriceDivisor.callAsync();
  }

  /**
   * Gets auctionStartPrice for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The auctionStartPrice of the RebalancingSetToken
   */
  public async auctionStartPrice(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.auctionStartPrice.callAsync();
  }

  /**
   * Gets curveCoefficient for the Rebalancing Set Token
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @return                         The curveCoefficient of the RebalancingSetToken
   */
  public async curveCoefficient(rebalancingSetAddress: Address): Promise<BigNumber> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.curveCoefficient.callAsync();
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
    } else if (stateNumber.eq(new BigNumber(2))) {
      return 'Rebalance';
    }
  }
}
