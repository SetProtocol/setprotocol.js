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
import Web3 from 'web3';
import { Address } from 'set-protocol-utils';

import { CommonAssertions } from './CommonAssertions';
import { ERC20Assertions } from './ERC20Assertions';
import {
  CoreContract,
  ERC20DetailedContract,
  RebalancingSetTokenContract,
  SetTokenContract,
} from 'set-protocol-contracts';
import { rebalancingErrors } from '../errors';
import { BigNumber } from '../util';
import { RebalancingState } from '../types/common';

const moment = require('moment');

export class RebalancingAssertions {
  private web3: Web3;
  private erc20Assertions: ERC20Assertions;
  private commonAssertions: CommonAssertions;

  constructor(web3: Web3) {
    this.web3 = web3;
    this.commonAssertions = new CommonAssertions();
    this.erc20Assertions = new ERC20Assertions(this.web3);
  }

  /**
   * Throws if the proposal details cannot be fetched
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async canFetchProposalDetails(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const currentState = await rebalancingSetTokenInstance.rebalanceState.callAsync();
    if (currentState.lt(RebalancingState.PROPOSAL)) {
      throw new Error(rebalancingErrors.INCORRECT_STATE(rebalancingSetTokenAddress, 'Proposal'));
    }
  }

  /**
   * Throws if the retails details cannot be fetched
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async canFetchRebalanceState(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const currentState = await rebalancingSetTokenInstance.rebalanceState.callAsync();
    if (currentState.lt(RebalancingState.REBALANCE)) {
      throw new Error(rebalancingErrors.INCORRECT_STATE(rebalancingSetTokenAddress, 'Rebalance'));
    }
  }

  /**
   * Throws if given rebalancingSetToken in Rebalance state
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async isNotInRebalanceState(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const currentState = await rebalancingSetTokenInstance.rebalanceState.callAsync();
    if (currentState.eq(RebalancingState.REBALANCE)) {
      throw new Error(rebalancingErrors.REBALANCE_IN_PROGRESS(rebalancingSetTokenAddress));
    }
  }

  /**
   * Throws if given rebalancingSetToken is not in Proposal state
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async isInProposalState(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const currentState = await rebalancingSetTokenInstance.rebalanceState.callAsync();
    if (!currentState.eq(RebalancingState.PROPOSAL)) {
      throw new Error(rebalancingErrors.INCORRECT_STATE(rebalancingSetTokenAddress, 'Proposal'));
    }
  }

  /**
   * Throws if given rebalancingSetToken is not in Rebalance state
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async isInRebalanceState(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const currentState = await rebalancingSetTokenInstance.rebalanceState.callAsync();
    if (!currentState.eq(RebalancingState.REBALANCE)) {
      throw new Error(rebalancingErrors.INCORRECT_STATE(rebalancingSetTokenAddress, 'Rebalance'));
    }
  }

  /**
   * Throws if caller of rebalancingSetToken is not manager
   *
   * @param  caller   The address of the rebalancing set token
   */
  public async isManager(rebalancingSetTokenAddress: Address, caller: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const manager = await rebalancingSetTokenInstance.manager.callAsync();
    this.commonAssertions.isEqualAddress(
      manager,
      caller,
      rebalancingErrors.NOT_REBALANCING_MANAGER(caller)
    );
  }

  /**
   * Throws if not enough time passed between last rebalance on rebalancing set token
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async sufficientTimeBetweenRebalance(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const lastRebalanceTime = await rebalancingSetTokenInstance.lastRebalanceTimestamp.callAsync();
    const rebalanceInterval = await rebalancingSetTokenInstance.rebalanceInterval.callAsync();
    const nextAvailableRebalance = lastRebalanceTime.add(rebalanceInterval).mul(1000);
    const currentTimeStamp = new BigNumber(Date.now());

    if (nextAvailableRebalance.greaterThan(currentTimeStamp)) {
      const nextRebalanceFormattedDate = moment(nextAvailableRebalance.toNumber())
        .format('dddd, MMMM Do YYYY, h:mm:ss a');
      throw new Error(rebalancingErrors.INSUFFICIENT_TIME_PASSED(nextRebalanceFormattedDate));
    }
  }

  /**
   * Throws if not enough time passed between last rebalance on rebalancing set token
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   * @param  nextSetAddress               The address of the nextSet being proposed
   */
  public async nextSetIsMultiple(rebalancingSetTokenAddress: Address, nextSetAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const currentSetAddress = await rebalancingSetTokenInstance.currentSet.callAsync();
    const currentSetInstance = await SetTokenContract.at(currentSetAddress, this.web3, {});
    const nextSetInstance = await SetTokenContract.at(nextSetAddress, this.web3, {});

    const currentSetNaturalUnit  = await currentSetInstance.naturalUnit.callAsync();
    const nextSetNaturalUnit  = await nextSetInstance.naturalUnit.callAsync();

    const maxNaturalUnit = BigNumber.max(currentSetNaturalUnit, nextSetNaturalUnit);
    const minNaturalUnit = BigNumber.min(currentSetNaturalUnit, nextSetNaturalUnit);

    if (!maxNaturalUnit.mod(minNaturalUnit).isZero()) {
      throw new Error(rebalancingErrors.PROPOSED_SET_NATURAL_UNIT_IS_NOT_MULTIPLE_OF_CURRENT_SET(
        currentSetAddress,
        nextSetAddress
      ));
    }
  }

  /**
   * Throws if given price curve is not approved in Core
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async isValidPriceCurve(priceCurve: Address, coreAddress: Address): Promise<void> {
    const coreInstance = await CoreContract.at(coreAddress, this.web3, {});

    const isValidCurve = await coreInstance.validPriceLibraries.callAsync(priceCurve);
    if (!isValidCurve) {
      throw new Error(rebalancingErrors.NOT_VALID_PRICE_CURVE(priceCurve));
    }
  }

  /**
   * Throws if not enough time passed in proposal state
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async sufficientTimeInProposalState(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const proposalStartTime = await rebalancingSetTokenInstance.proposalStartTime.callAsync();
    const proposalPeriod = await rebalancingSetTokenInstance.proposalPeriod.callAsync();
    const nextAvailableRebalance = proposalStartTime.add(proposalPeriod).mul(1000);
    const currentTimeStamp = new BigNumber(Date.now());

    if (nextAvailableRebalance.greaterThan(currentTimeStamp)) {
      const nextRebalanceFormattedDate = moment(
        nextAvailableRebalance.toNumber()).format('dddd, MMMM Do YYYY, h:mm:ss a'
      );
      throw new Error(rebalancingErrors.INSUFFICIENT_TIME_PASSED(nextRebalanceFormattedDate));
    }
  }

  /**
   * Throws if not enough current sets rebalanced in auction
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async enoughSetsRebalanced(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});
    const [minimumBid, remainingCurrentSets] = await rebalancingSetTokenInstance.getBiddingParameters.callAsync();

    if (remainingCurrentSets.greaterThanOrEqualTo(minimumBid)) {
      throw new Error(rebalancingErrors.NOT_ENOUGH_SETS_REBALANCED(
        rebalancingSetTokenAddress,
        minimumBid.toString(),
        remainingCurrentSets.toString()
      ));
    }
  }

  /**
   * Throws if not past pivot time
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async passedPivotTime(rebalancingSetTokenAddress: Address): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});
    const [
      auctionStartTime,
      auctionTimeToPivot,
    ] = await rebalancingSetTokenInstance.getAuctionParameters.callAsync();

    const pivotTimeStart = auctionStartTime.add(auctionTimeToPivot).mul(1000);

    const currentTimeStamp = new BigNumber(Date.now());
    if (pivotTimeStart.greaterThanOrEqualTo(currentTimeStamp)) {
      const pivotTimeStartFormattedDate = moment(
        pivotTimeStart.toNumber()).format('dddd, MMMM Do YYYY, h:mm:ss a'
      );
      throw new Error(rebalancingErrors.PIVOT_TIME_NOT_PASSED(pivotTimeStartFormattedDate));
    }
  }

  /**
   * Throws if auction has no remaining bids
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   */
  public async enoughRemainingBids(
    rebalancingSetTokenAddress: Address,
  ): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});
    const [minimumBid, remainingCurrentSets] = await rebalancingSetTokenInstance.getBiddingParameters.callAsync();
    if (remainingCurrentSets.lessThan(minimumBid)) {
      throw new Error(rebalancingErrors.NOT_VALID_DRAWDOWN(
        rebalancingSetTokenAddress
      ));
    }
  }

  /**
   * Throws if user bids to rebalance an amount of current set token that is greater than amount of current set
   * token remaining.
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   * @param  bidQuantity                  The amount of current set the user is seeking to rebalance
   */
  public async bidAmountLessThanRemainingSets(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber
  ): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});
    const [, remainingCurrentSets] = await rebalancingSetTokenInstance.getBiddingParameters.callAsync();

    if (bidQuantity.greaterThan(remainingCurrentSets)) {
      throw new Error(rebalancingErrors.BID_AMOUNT_EXCEEDS_REMAINING_CURRENT_SETS(
        remainingCurrentSets.toString(),
        bidQuantity.toString()
      ));
    }
  }

  /**
   * Throws if user bids to rebalance an amount of current set token that is not a multiple of the minimumBid.
   *
   * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
   * @param  bidQuantity                  The amount of current set the user is seeking to rebalance
   */
  public async bidIsMultipleOfMinimumBid(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});
    const [ minimumBid ] = await rebalancingSetTokenInstance.getBiddingParameters.callAsync();

    if (!bidQuantity.modulo(minimumBid).isZero()) {
      throw new Error(rebalancingErrors.BID_AMOUNT_NOT_MULTIPLE_OF_MINIMUM_BID(
        bidQuantity.toString(),
        minimumBid.toString()
      ));
    }
  }

  /**
   * Throws if the given user doesn't have a sufficient balance for a component token needed to be
   * injected for a bid. Since the price can only get better for a bidder the inflow amounts queried
   * when this function is called suffices.
   *
   * @param  rebalancingSetTokenAddress  The address of the Rebalancing Set Token contract
   * @param  ownerAddress                The address of the owner
   * @param  quantity                    Amount of a Set in base units
   */
  public async hasSufficientBalances(
    rebalancingSetTokenAddress: Address,
    ownerAddress: Address,
    quantity: BigNumber,
  ): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const [inflowArray] = await rebalancingSetTokenInstance.getBidPrice.callAsync(quantity);
    const components = await rebalancingSetTokenInstance.getCombinedTokenArray.callAsync();

    // Create component ERC20 token instances
    const componentInstancePromises = _.map(
      components,
      async component =>
        await ERC20DetailedContract.at(component, this.web3, { from: ownerAddress }),
    );
    const componentInstances = await Promise.all(componentInstancePromises);

    // Assert that user has sufficient balance for each component token
    const userHasSufficientBalancePromises = _.map(
      componentInstances,
      async (componentInstance, index) => {
        const requiredBalance = inflowArray[index];
        await this.erc20Assertions.hasSufficientBalanceAsync(
          componentInstance.address,
          ownerAddress,
          requiredBalance,
        );
      },
    );
    await Promise.all(userHasSufficientBalancePromises);
  }

  /**
   * Throws if the given user doesn't have a sufficient allowance for a component token needed to be
   * injected for a bid. Since the price can only get better for a bidder the inflow amounts queried
   * when this function is called suffices.
   *
   * @param  rebalancingSetTokenAddress  The address of the Rebalancing Set Token contract
   * @param  ownerAddress                The address of the owner
   * @param  quantity                    Amount of a Set in base units
   */
  public async hasSufficientAllowances(
    rebalancingSetTokenAddress: Address,
    ownerAddress: Address,
    spenderAddress: Address,
    quantity: BigNumber,
  ): Promise<void> {
    const rebalancingSetTokenInstance = await RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {});

    const [inflowArray] = await rebalancingSetTokenInstance.getBidPrice.callAsync(quantity);
    const components = await rebalancingSetTokenInstance.getCombinedTokenArray.callAsync();

    // Create component ERC20 token instances
    const componentInstancePromises = _.map(
      components,
      async component =>
        await ERC20DetailedContract.at(component, this.web3, { from: ownerAddress }),
    );
    const componentInstances = await Promise.all(componentInstancePromises);

    // Assert that user has sufficient allowances for each component token
    const userHasSufficientAllowancePromises = _.map(
      componentInstances,
      async (componentInstance, index) => {
        const requiredBalance = inflowArray[index];
        return await this.erc20Assertions.hasSufficientAllowanceAsync(
          componentInstance.address,
          ownerAddress,
          spenderAddress,
          requiredBalance,
        );
      },
    );
    await Promise.all(userHasSufficientAllowancePromises);
  }
}