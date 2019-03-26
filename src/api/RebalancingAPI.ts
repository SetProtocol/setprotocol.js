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

import { coreAPIErrors } from '../errors';
import { Assertions } from '../assertions';
import {
  ERC20Wrapper,
  SetTokenWrapper,
  RebalancingAuctionModuleWrapper,
  RebalancingSetTokenWrapper,
  CoreWrapper,
} from '../wrappers';
import { BigNumber } from '../util';
import {
  Address,
  RebalancingProgressDetails,
  RebalancingProposalDetails,
  RebalancingSetDetails,
  SetProtocolConfig,
  Tx,
  TokenFlowsDetails,
} from '../types/common';

/**
 * @title RebalancingAPI
 * @author Set Protocol
 *
 * A library for interacting with RebalancingSetToken contracts
 */

export class RebalancingAPI {
  private web3: Web3;
  private assert: Assertions;
  private core: CoreWrapper;
  private erc20: ERC20Wrapper;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private rebalancingAuctionModule: RebalancingAuctionModuleWrapper;
  private setToken: SetTokenWrapper;

  /**
   * Instantiates a new RebalancingAPI instance that contains methods
   * for interacting with RebalancingSetToken contracts
   *
   * @param web3        Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
   *                      the Ethereum network
   * @param assertions  An instance of the Assertion library
   */
  constructor(
    web3: Web3,
    assertions: Assertions,
    core: CoreWrapper,
    config: SetProtocolConfig,
  ) {
    this.web3 = web3;
    this.assert = assertions;
    this.core = core;
    this.rebalancingAuctionModule = new RebalancingAuctionModuleWrapper(
      this.web3,
      config.rebalanceAuctionModuleAddress,
    );

    this.erc20 = new ERC20Wrapper(this.web3);
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(this.web3);
    this.setToken = new SetTokenWrapper(this.web3);
  }

  /**
   * Proposes rebalance a new Set to rebalance to. Can only be called by the manager. Users will have the
   * RebalancingSetToken's designated proposal period to withdraw their Sets if they want to
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  nextSetAddress                 Address of new Set to rebalance into after proposal period
   * @param  auctionLibrary                 Address of auction price curve to use. See deployed contracts for addresses
   *                                          of existing libraries
   * @param  auctionTimeToPivot             Amount of time until curve pivots and protocol takes over price curve
   * @param  auctionStartPrice              Starting price of the rebalancing auction, depending on library may not be
   *                                          used
   * @param  auctionPivotPrice              Price to pivot from user-defined to protocol-defined curve
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                Transaction hash
   */
  public async proposeAsync(
    rebalancingSetTokenAddress: Address,
    nextSetAddress: Address,
    auctionLibrary: Address,
    auctionTimeToPivot: BigNumber,
    auctionStartPrice: BigNumber,
    auctionPivotPrice: BigNumber,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertPropose(
      rebalancingSetTokenAddress,
      nextSetAddress,
      auctionLibrary,
      auctionTimeToPivot,
      auctionStartPrice,
      auctionPivotPrice,
      txOpts
    );

    return await this.rebalancingSetToken.propose(
      rebalancingSetTokenAddress,
      nextSetAddress,
      auctionLibrary,
      auctionTimeToPivot,
      auctionStartPrice,
      auctionPivotPrice,
      txOpts
    );
  }

  /**
   * Initiates rebalance after proposal period has passed
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                Transaction hash
   */
  public async startRebalanceAsync(rebalancingSetTokenAddress: Address, txOpts: Tx): Promise<string> {
    await this.assertStartRebalance(rebalancingSetTokenAddress);

    return await this.rebalancingSetToken.startRebalance(rebalancingSetTokenAddress, txOpts);
  }

  /**
   * Settles rebalance after auction has been completed
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                Transaction hash
   */
  public async settleRebalanceAsync(rebalancingSetTokenAddress: Address, txOpts: Tx): Promise<string> {
    await this.assertSettleRebalance(rebalancingSetTokenAddress);

    return await this.rebalancingSetToken.settleRebalance(rebalancingSetTokenAddress, txOpts);
  }

  /**
   * Ends failed auction and either returns to Default if no bids or sets to Drawdown if there are bids
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                Transaction hash
   */
  public async endFailedAuctionAsync(rebalancingSetTokenAddress: Address, txOpts: Tx): Promise<string> {
    await this.assertEndFailedAuction(rebalancingSetTokenAddress);

    return await this.rebalancingSetToken.endFailedAuction(rebalancingSetTokenAddress, txOpts);
  }

  /**
   * Allows user to bid on a rebalance auction occuring on a Rebalancing Set Token
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
   * @param  shouldWithdraw                 Boolean to withdraw back to signer's wallet or leave in vault.
   *                                        Defaults to true
   * @param  allowPartialFill               Boolean to complete fill if quantity is less than available
   *                                        Defaults to true
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                Transaction hash
   */
  public async bidAsync(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    shouldWithdraw: boolean = true,
    allowPartialFill: boolean = true,
    txOpts: Tx
  ): Promise<string> {
    await this.assertBid(rebalancingSetTokenAddress, bidQuantity, txOpts);
    if (shouldWithdraw) {
      return await this.rebalancingAuctionModule.bidAndWithdraw(
        rebalancingSetTokenAddress,
        bidQuantity,
        allowPartialFill,
        txOpts,
      );
    } else {
      return await this.rebalancingAuctionModule.bid(
        rebalancingSetTokenAddress,
        bidQuantity,
        allowPartialFill,
        txOpts,
      );
    }
  }

  /**
   * Allows current manager to change manager address to a new address
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  newManager                     Address of the new manager
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                Transaction hash
   */
  public async updateManagerAsync(
    rebalancingSetTokenAddress: Address,
    newManager: Address,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertUpdateManager(rebalancingSetTokenAddress, newManager, txOpts);

    return await this.rebalancingSetToken.setManager(rebalancingSetTokenAddress, newManager, txOpts);
  }

  /**
   * Burn rebalancing Set token and transfer ownership of collateral in Vault to owner in Drawdown state
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                Transaction hash
   */
  public async withdrawFromFailedRebalanceAsync(rebalancingSetTokenAddress: Address, txOpts: Tx): Promise<string> {
    await this.assertWithdrawFromFailedRebalance(rebalancingSetTokenAddress, txOpts);

    return await this.rebalancingAuctionModule.withdrawFromFailedRebalance(rebalancingSetTokenAddress, txOpts);
  }

  /**
   * Fetches the current token inflows and outflows for a given bid quantity, returns `Component`
   * objects reflecting token inflows and outflows. Tokens flows of 0 are omitted
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
   * @return                                Object conforming to `TokenFlowsDetails` interface
   */
  public async getBidPriceAsync(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
  ): Promise<TokenFlowsDetails> {
    await this.assertGetBidPrice(rebalancingSetTokenAddress, bidQuantity);

    const tokenFlowComponents = await this.rebalancingSetToken.getBidPrice(rebalancingSetTokenAddress, bidQuantity);
    const tokenAddresses = await this.rebalancingSetToken.getCombinedTokenArray(rebalancingSetTokenAddress);

    const inflow = tokenFlowComponents.inflow.reduce((accumulator, unit, index) => {
      const bigNumberUnit = new BigNumber(unit);
      if (bigNumberUnit.gt(0)) {
        accumulator.push({
          address: tokenAddresses[index],
          unit,
        });
      }
      return accumulator;
    }, []);

    const outflow = tokenFlowComponents.outflow.reduce((accumulator, unit, index) => {
      const bigNumberUnit = new BigNumber(unit);
      if (bigNumberUnit.gt(0)) {
        accumulator.push({
          address: tokenAddresses[index],
          unit,
        });
      }
      return accumulator;
    }, []);

    return {
      inflow,
      outflow,
    } as TokenFlowsDetails;
  }

  /**
   * Fetches details of a RebalancingSetToken comprised of factory address, manager, current set, unit shares,
   * natural unit, state, date the last rebalance ended, supply, name, and symbol
   *
   * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
   * @return                               Object conforming to `RebalancingSetDetails` interface
   */
  public async getDetailsAsync(rebalancingSetTokenAddress: Address): Promise<RebalancingSetDetails> {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);

    const [
      factoryAddress,
      managerAddress,
      currentSetAddress,
      unitShares,
      naturalUnit,
      state,
      lastRebalancedAt,
      supply,
      name,
      symbol,
    ] = await Promise.all([
      this.setToken.factory(rebalancingSetTokenAddress),
      this.rebalancingSetToken.manager(rebalancingSetTokenAddress),
      this.rebalancingSetToken.currentSet(rebalancingSetTokenAddress),
      this.rebalancingSetToken.unitShares(rebalancingSetTokenAddress),
      this.setToken.naturalUnit(rebalancingSetTokenAddress),
      this.rebalancingSetToken.rebalanceState(rebalancingSetTokenAddress),
      this.rebalancingSetToken.lastRebalanceTimestamp(rebalancingSetTokenAddress),
      this.erc20.totalSupply(rebalancingSetTokenAddress),
      this.erc20.name(rebalancingSetTokenAddress),
      this.erc20.symbol(rebalancingSetTokenAddress),
    ]);

    // Unclear why Promise.all can accept more than 10 elements
    const [
      proposalPeriod,
      rebalanceInterval,
    ] = await Promise.all([
      this.rebalancingSetToken.proposalPeriod(rebalancingSetTokenAddress),
      this.rebalancingSetToken.rebalanceInterval(rebalancingSetTokenAddress),
    ]);

    return {
      address: rebalancingSetTokenAddress,
      factoryAddress,
      managerAddress,
      currentSetAddress,
      unitShares,
      naturalUnit,
      state,
      lastRebalancedAt,
      supply,
      name,
      symbol,
      proposalPeriod,
      rebalanceInterval,
    } as RebalancingSetDetails;
  }

  /**
   * Fetches details of the proposal. This includes the proposal time, next set, starting rebalance price, the pricing
   * library being used, the curve coefficient of the price, and the price divisor
   *
   * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
   * @return                               Object conforming to `RebalancingProposalDetails` interface
   */
  public async getProposalDetailsAsync(rebalancingSetTokenAddress: Address): Promise<RebalancingProposalDetails> {
    await this.assertGetProposalDetails(rebalancingSetTokenAddress);

    const [
      proposedAt,
      nextSetAddress,
      pricingLibraryAddress,
      auctionParameters,
    ] = await Promise.all([
      this.rebalancingSetToken.proposalStartTime(rebalancingSetTokenAddress),
      this.rebalancingSetToken.nextSet(rebalancingSetTokenAddress),
      this.rebalancingSetToken.auctionLibrary(rebalancingSetTokenAddress),
      this.rebalancingSetToken.auctionParameters(rebalancingSetTokenAddress),
    ]);

    return {
      proposedAt,
      nextSetAddress,
      pricingLibraryAddress,
      timeToPivot: auctionParameters[1],
      startingPrice: auctionParameters[2],
      auctionPivotPrice: auctionParameters[3],
    } as RebalancingProposalDetails;
  }

  /**
   * Fetches details of the current rebalancing event. This information can be used to confirm the elapsed time
   * of the rebalance, the next set, and the remaining quantity of the old set to rebalance
   *
   * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
   * @return                               Object conforming to `RebalancingProgressDetails` interface
   */
  public async getRebalanceDetailsAsync(rebalancingSetTokenAddress: Address): Promise<RebalancingProgressDetails> {
    await this.assertGetRebalanceDetails(rebalancingSetTokenAddress);

    const [
      nextSetAddress,
      pricingLibraryAddress,
      auctionParameters,
      remainingCurrentSet,
      minimumBid,
      startingCurrentSetAmount,
    ] = await Promise.all([
      this.rebalancingSetToken.nextSet(rebalancingSetTokenAddress),
      this.rebalancingSetToken.auctionLibrary(rebalancingSetTokenAddress),
      this.rebalancingSetToken.auctionParameters(rebalancingSetTokenAddress),
      this.rebalancingSetToken.remainingCurrentSets(rebalancingSetTokenAddress),
      this.rebalancingSetToken.minimumBid(rebalancingSetTokenAddress),
      this.rebalancingSetToken.startingCurrentSetAmount(rebalancingSetTokenAddress),
    ]);

    return {
      rebalancingStartedAt: auctionParameters[0],
      nextSetAddress,
      pricingLibraryAddress,
      timeToPivot: auctionParameters[1],
      startingPrice: auctionParameters[2],
      auctionPivotPrice: auctionParameters[3],
      startingCurrentSetAmount,
      remainingCurrentSet,
      minimumBid,
    } as RebalancingProgressDetails;
  }

  /* ============ Private Assertions ============ */

  private async assertPropose(
    rebalancingSetTokenAddress: Address,
    nextSetAddress: Address,
    auctionLibrary: Address,
    auctionTimeToPivot: BigNumber,
    auctionStartPrice: BigNumber,
    auctionPivotPrice: BigNumber,
    txOpts: Tx,
  ) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
    this.assert.schema.isValidAddress('nextSetAddress', nextSetAddress);
    this.assert.schema.isValidAddress('auctionLibrary', auctionLibrary);

    this.assert.common.greaterThanZero(
      auctionTimeToPivot,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(auctionTimeToPivot)
    );
    this.assert.common.greaterThanZero(auctionPivotPrice,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(auctionPivotPrice)
    );
    this.assert.common.greaterThanZero(
      auctionStartPrice,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(auctionStartPrice)
    );

    await this.assert.rebalancing.isNotInRebalanceState(rebalancingSetTokenAddress);
    await this.assert.rebalancing.isManager(rebalancingSetTokenAddress, txOpts.from);
    await this.assert.setToken.isValidSetToken(this.core.coreAddress, nextSetAddress);
    await this.assert.rebalancing.nextSetIsMultiple(rebalancingSetTokenAddress, nextSetAddress);
    await this.assert.rebalancing.isValidPriceCurve(auctionLibrary, this.core.coreAddress);
    await this.assert.rebalancing.sufficientTimeBetweenRebalance(rebalancingSetTokenAddress);
  }

  private async assertStartRebalance(rebalancingSetTokenAddress: Address) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);

    await this.assert.rebalancing.isInProposalState(rebalancingSetTokenAddress);
    await this.assert.rebalancing.sufficientTimeInProposalState(rebalancingSetTokenAddress);
  }

  private async assertSettleRebalance(rebalancingSetTokenAddress: Address) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);

    await this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress);
    await this.assert.rebalancing.enoughSetsRebalanced(rebalancingSetTokenAddress);
  }

  private async assertEndFailedAuction(rebalancingSetTokenAddress: Address) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);

    await this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress);
    await this.assert.rebalancing.passedPivotTime(rebalancingSetTokenAddress);
    await this.assert.rebalancing.enoughRemainingBids(rebalancingSetTokenAddress);
  }

  private async assertWithdrawFromFailedRebalance(rebalancingSetTokenAddress: Address, txOpts: Tx) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);

    await this.assert.setToken.hasSufficientBalances(rebalancingSetTokenAddress, txOpts.from, new BigNumber(0));
    await this.assert.rebalancing.isInDrawdownState(rebalancingSetTokenAddress);
  }

  private async assertBid(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber, txOpts: Tx) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
    this.assert.common.greaterThanZero(
      bidQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(bidQuantity)
    );

    await this.assert.setToken.isValidSetToken(this.core.coreAddress, rebalancingSetTokenAddress);
    await this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress);
    await this.assert.rebalancing.bidAmountLessThanRemainingSets(rebalancingSetTokenAddress, bidQuantity);
    await this.assert.rebalancing.bidIsMultipleOfMinimumBid(rebalancingSetTokenAddress, bidQuantity);
    await this.assert.rebalancing.hasSufficientAllowances(
      rebalancingSetTokenAddress,
      txOpts.from,
      this.core.transferProxyAddress,
      bidQuantity
    );
    await this.assert.rebalancing.hasSufficientBalances(
      rebalancingSetTokenAddress,
      txOpts.from,
      bidQuantity
    );
  }

  private async assertUpdateManager(rebalancingSetTokenAddress: Address, newManager: Address, txOpts: Tx) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
    this.assert.schema.isValidAddress('newManager', newManager);

    await this.assert.rebalancing.isManager(rebalancingSetTokenAddress, txOpts.from);
  }

  private async assertGetBidPrice(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
    this.assert.common.greaterThanZero(
      bidQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(bidQuantity)
    );

    await this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress);
    await this.assert.rebalancing.bidAmountLessThanRemainingSets(rebalancingSetTokenAddress, bidQuantity);
    await this.assert.rebalancing.bidIsMultipleOfMinimumBid(rebalancingSetTokenAddress, bidQuantity);
  }

  private async assertGetRebalanceDetails(rebalancingSetTokenAddress: Address) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
    await this.assert.rebalancing.canFetchRebalanceState(rebalancingSetTokenAddress);
  }

  private async assertGetProposalDetails(rebalancingSetTokenAddress: Address) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
    await this.assert.rebalancing.canFetchProposalDetails(rebalancingSetTokenAddress);
  }
}
