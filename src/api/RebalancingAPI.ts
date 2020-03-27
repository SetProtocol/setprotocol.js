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
  CoreWrapper,
  ERC20Wrapper,
  ProtocolViewerWrapper,
  SetTokenWrapper,
  RebalancingAuctionModuleWrapper,
  RebalancingSetCTokenBidderWrapper,
  RebalancingSetEthBidderWrapper,
  RebalancingSetTokenWrapper,
} from '../wrappers';
import { BigNumber, parseRebalanceState } from '../util';
import {
  Address,
  BidderHelperType,
  BidPlacedEvent,
  BidPlacedHelperEvent,
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
  private protocolViewer: ProtocolViewerWrapper;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private rebalancingAuctionModule: RebalancingAuctionModuleWrapper;
  private rebalancingSetEthBidder: RebalancingSetEthBidderWrapper;
  private rebalancingSetCTokenBidder: RebalancingSetCTokenBidderWrapper;
  private setToken: SetTokenWrapper;
  private config: SetProtocolConfig;

  /**
   * Instantiates a new RebalancingAPI instance that contains methods
   * for interacting with RebalancingSetToken contracts
   *
   * @param web3        Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
   *                      the Ethereum network
   * @param assertions  An instance of the Assertion library
   * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
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
    this.rebalancingSetCTokenBidder =
      new RebalancingSetCTokenBidderWrapper(this.web3, config.rebalancingSetCTokenBidderAddress);
    this.rebalancingSetEthBidder = new RebalancingSetEthBidderWrapper(this.web3, config.rebalancingSetEthBidderAddress);
    this.protocolViewer = new ProtocolViewerWrapper(this.web3, config.protocolViewerAddress);

    this.config = config;
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
   *                                        gasPrice data
   * @return                                Transaction hash
   */
  public async bidAsync(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    shouldWithdraw: boolean = true,
    allowPartialFill: boolean = true,
    txOpts: Tx
  ): Promise<string> {
    await this.assertBid(rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts);
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
   * Allows user to bid on a rebalance auction while sending and receiving Ether instead of Wrapped Ether. This
   * encompasses all functionality in bidAsync.
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
   * @param  allowPartialFill               Boolean to complete fill if quantity is less than available
   *                                        Defaults to true
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                        gasPrice data
   * @return                                Transaction hash
   */
  public async bidWithEtherAsync(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    allowPartialFill: boolean = true,
    txOpts: Tx
  ): Promise<string> {
    await this.assertBidWithEther(rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts);

    return await this.rebalancingSetEthBidder.bidAndWithdrawWithEther(
      rebalancingSetTokenAddress,
      bidQuantity,
      allowPartialFill,
      txOpts,
    );
  }

  /**
   * Allows user to bid on a rebalance auction containing Compound cTokens while sending and
   * receiving the underlying. This encompasses all functionality in bidAsync.
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
   * @param  allowPartialFill               Boolean to complete fill if quantity is less than available
   *                                        Defaults to true
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                        gasPrice data
   * @return                                Transaction hash
   */
  public async bidWithCTokenUnderlyingAsync(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    allowPartialFill: boolean = true,
    txOpts: Tx
  ): Promise<string> {
    await this.assertBidCToken(rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts);

    return await this.rebalancingSetCTokenBidder.bidAndWithdraw(
      rebalancingSetTokenAddress,
      bidQuantity,
      allowPartialFill,
      txOpts,
    );
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
  public async redeemFromFailedRebalanceAsync(rebalancingSetTokenAddress: Address, txOpts: Tx): Promise<string> {
    await this.assertRedeemFromFailedRebalance(rebalancingSetTokenAddress, txOpts);

    return await this.rebalancingAuctionModule.redeemFromFailedRebalance(rebalancingSetTokenAddress, txOpts);
  }

  /**
   * Fetches the current cToken underlying component addresses, token inflows and outflows for a given bid quantity,
   * returns `Component` objects reflecting token inflows and outflows. Tokens flows of 0 are omitted
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
   * @return                                Object conforming to `TokenFlowsDetails` interface
   */
  public async getBidPriceCTokenUnderlyingAsync(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
  ): Promise<TokenFlowsDetails> {
    await this.assertGetBidPrice(rebalancingSetTokenAddress, bidQuantity);

    const tokenFlows = await this.rebalancingSetCTokenBidder.getAddressAndBidPriceArray(
      rebalancingSetTokenAddress,
      bidQuantity
    );

    const inflow = tokenFlows.inflow.reduce((accumulator, unit, index) => {
      const bigNumberUnit = new BigNumber(unit);
      if (bigNumberUnit.gt(0)) {
        accumulator.push({
          address: tokenFlows.tokens[index],
          unit,
        });
      }
      return accumulator;
    }, []);

    const outflow = tokenFlows.outflow.reduce((accumulator, unit, index) => {
      const bigNumberUnit = new BigNumber(unit);
      if (bigNumberUnit.gt(0)) {
        accumulator.push({
          address: tokenFlows.tokens[index],
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
   * Fetches BidPlaced event logs including information about the transactionHash, rebalancingSetToken,
   * bidder, executionQuantity, combinedTokenAddresses, etc.
   *
   * This fetch can be filtered by block and by rebalancingSetToken.
   *
   * @param  fromBlock                     The beginning block to retrieve events from
   * @param  toBlock                       The ending block to retrieve events (default is latest)
   * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
   * @return                               An array of objects conforming to the BidPlacedEvent interface
   */
  public async getBidPlacedEventsAsync(
    fromBlock: number,
    toBlock?: any,
    rebalancingSetToken?: Address,
    getTimestamp?: boolean,
  ): Promise<BidPlacedEvent[]> {
    const events: any[] = await this.rebalancingAuctionModule.bidPlacedEvent(
      fromBlock,
      toBlock,
      rebalancingSetToken,
    );

    const formattedEventPromises: Promise<BidPlacedEvent>[] = events.map(async event => {
      const returnValues = event.returnValues;
      const rebalancingSetToken = returnValues['rebalancingSetToken'];
      const bidder = returnValues['bidder'];
      const executionQuantity = returnValues['executionQuantity'];
      const combinedTokenAddresses = returnValues['combinedTokenAddresses'];
      const inflowTokenUnits = returnValues['inflowTokenUnits'];
      const outflowTokenUnits = returnValues['outflowTokenUnits'];

      let timestamp = undefined;
      if (getTimestamp) {
        const block = await this.web3.eth.getBlock(event.blockNumber);
        timestamp = block.timestamp;
      }

      return {
        transactionHash: event.transactionHash,
        rebalancingSetToken,
        bidder,
        executionQuantity: new BigNumber(executionQuantity),
        combinedTokenAddresses,
        inflowTokenUnits: inflowTokenUnits.map((unit: string) => new BigNumber(unit)),
        outflowTokenUnits: outflowTokenUnits.map((unit: string) => new BigNumber(unit)),
        blockNumber: event.blockNumber,
        timestamp,
      };
    });

    return Promise.all(formattedEventPromises);
  }

  /**
   * Fetches bid event logs from ETH bidder or cToken bidder contracts including information about the
   * transactionHash, rebalancingSetToken, bidder and etc.
   *
   * This fetch can be filtered by block and by rebalancingSetToken.
   *
   * @param  bidderHelperType              BigNumber indicating which kind of bidder helper contract to call
   * @param  fromBlock                     The beginning block to retrieve events from
   * @param  toBlock                       The ending block to retrieve events (default is latest)
   * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
   * @param  getTimestamp                  Boolean for returning the timestamp of the event
   * @return                               An array of objects conforming to the BidPlacedHelperEvent interface
   */
  public async getBidPlacedHelperEventsAsync(
    bidderHelperType: BigNumber,
    fromBlock: number,
    toBlock?: any,
    rebalancingSetToken?: Address,
    getTimestamp?: boolean,
  ): Promise<BidPlacedHelperEvent[]> {
    let events: any[];
    if (bidderHelperType.eq(BidderHelperType.ETH)) {
      events = await this.rebalancingSetEthBidder.bidPlacedWithEthEvent(
        fromBlock,
        toBlock,
        rebalancingSetToken,
      );
    } else if (bidderHelperType.eq(BidderHelperType.CTOKEN)) {
      events = await this.rebalancingSetCTokenBidder.bidPlacedCTokenEvent(
        fromBlock,
        toBlock,
        rebalancingSetToken,
      );
    }

    const formattedEventPromises: Promise<BidPlacedHelperEvent>[] = events.map(async event => {
      const returnValues = event.returnValues;
      const rebalancingSetToken = returnValues['rebalancingSetToken'];
      const bidder = returnValues['bidder'];
      const quantity = returnValues['quantity'];

      let timestamp = undefined;
      if (getTimestamp) {
        const block = await this.web3.eth.getBlock(event.blockNumber);
        timestamp = block.timestamp;
      }

      return {
        transactionHash: event.transactionHash,
        rebalancingSetToken,
        bidder,
        quantity,
        timestamp,
      };
    });

    return Promise.all(formattedEventPromises);
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
      rebalanceState,
      [nextSetAddress, pricingLibraryAddress],
      [proposalStartTime, timeToPivot, startingPrice, auctionPivotPrice],
    ] = await this.protocolViewer.fetchRebalanceProposalStateAsync(rebalancingSetTokenAddress);

    return {
      state: parseRebalanceState(rebalanceState),
      nextSetAddress,
      pricingLibraryAddress,
      proposalStartTime,
      timeToPivot,
      startingPrice,
      auctionPivotPrice,
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
      rebalanceState,
      [startingCurrentSetAmount, rebalancingStartedAt, minimumBid, remainingCurrentSet],
    ] =  await this.protocolViewer.fetchRebalanceAuctionStateAsync(rebalancingSetTokenAddress);

    return {
      state: parseRebalanceState(rebalanceState),
      startingCurrentSetAmount,
      rebalancingStartedAt,
      minimumBid,
      remainingCurrentSet,
    } as RebalancingProgressDetails;
  }

  /**
   * Fetches the current state of the RebalancingSetToken
   *
   * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
   * @return                               Current state belonging to {'Default', 'Propose', 'Rebalance', 'Drawdown'}
   */
  public async getRebalanceStateAsync(rebalancingSetTokenAddress: Address): Promise<string> {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);

    return await this.rebalancingSetToken.rebalanceState(rebalancingSetTokenAddress);
  }

  /**
   * Fetches the current states for multiple RebalancingSetToken contracts
   *
   * @param  rebalancingSetTokenAddresses    Addressses of the RebalancingSetToken contracts
   * @return                                 Current state belonging to {'Default', 'Propose', 'Rebalance', 'Drawdown'}
   */
  public async getRebalanceStatesAsync(rebalancingSetTokenAddresses: Address[]): Promise<string[]> {
    this.assertGetRebalanceStatesAsync(rebalancingSetTokenAddresses);

    const statusEnums: BigNumber[] =
      await this.protocolViewer.batchFetchRebalanceStateAsync(rebalancingSetTokenAddresses);
    return statusEnums.map(statusEnum => parseRebalanceState(statusEnum));
  }

  /**
   * Fetches the current unitShares for multiple RebalancingSetToken contracts
   *
   * @param  rebalancingSetTokenAddresses    Addressses of the RebalancingSetToken contracts
   * @return                                 Array of current unitShares
   */
  public async getUnitSharesAsync(rebalancingSetTokenAddresses: Address[]): Promise<BigNumber[]> {
    this.assertGetUnitSharesAsync(rebalancingSetTokenAddresses);

    return await this.protocolViewer.batchFetchUnitSharesAsync(rebalancingSetTokenAddresses);
  }

  /**
   * Fetches the current collateral set token address of a rebalancing set
   *
   * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
   * @return                               Address of the rebalancing set's current Set Token
   */
  public async getRebalancingSetCurrentSetAsync(rebalancingSetTokenAddress: Address): Promise<Address> {
    return await this.rebalancingSetToken.currentSet(rebalancingSetTokenAddress);
  }

  /**
   * Fetches the remaining current sets of a rebalancing set that is currently undergoing a rebalance
   *
   * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
   * @return                               Number of remaining shares available
   */
  public async getRebalancingSetAuctionRemainingCurrentSets(rebalancingSetTokenAddress: Address): Promise<BigNumber> {
    await this.assertGetRebalanceDetails(rebalancingSetTokenAddress);

    return await this.rebalancingSetToken.remainingCurrentSets(rebalancingSetTokenAddress);
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

  private async assertRedeemFromFailedRebalance(rebalancingSetTokenAddress: Address, txOpts: Tx) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);

    await this.assert.setToken.hasSufficientBalances(rebalancingSetTokenAddress, txOpts.from, new BigNumber(0));
    await this.assert.rebalancing.isInDrawdownState(rebalancingSetTokenAddress);
  }

  private async assertBid(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    allowPartialFill: boolean,
    txOpts: Tx
  ) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
    this.assert.common.greaterThanZero(
      bidQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(bidQuantity)
    );

    await this.assert.setToken.isValidSetToken(this.core.coreAddress, rebalancingSetTokenAddress);
    await this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress);
    if (!allowPartialFill) {
      await this.assert.rebalancing.bidAmountLessThanRemainingSets(rebalancingSetTokenAddress, bidQuantity);
    }
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

  private async assertBidWithEther(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    allowPartialFill: boolean,
    txOpts: Tx
  ) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
    this.assert.common.greaterThanZero(
      bidQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(bidQuantity)
    );

    await this.assert.setToken.isValidSetToken(this.core.coreAddress, rebalancingSetTokenAddress);
    await this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress);
    if (!allowPartialFill) {
      await this.assert.rebalancing.bidAmountLessThanRemainingSets(rebalancingSetTokenAddress, bidQuantity);
    }
    await this.assert.rebalancing.bidIsMultipleOfMinimumBid(rebalancingSetTokenAddress, bidQuantity);

    // Assert non-WETH components have sufficient allowances
    await this.assert.rebalancing.hasSufficientAllowances(
      rebalancingSetTokenAddress,
      txOpts.from,
      this.config.rebalancingSetEthBidderAddress,
      bidQuantity,
      [this.config.wrappedEtherAddress],
    );

    // Assert non-WETH components have sufficient balances
    await this.assert.rebalancing.hasSufficientBalances(
      rebalancingSetTokenAddress,
      txOpts.from,
      bidQuantity,
      [this.config.wrappedEtherAddress],
    );

    // Assert Ether value sent is greater than WETH component units
    await this.assert.rebalancing.hasRequiredEtherValue(
      rebalancingSetTokenAddress,
      bidQuantity,
      this.config.wrappedEtherAddress,
      new BigNumber(txOpts.value),
    );
  }

  private async assertBidCToken(
    rebalancingSetTokenAddress: Address,
    bidQuantity: BigNumber,
    allowPartialFill: boolean,
    txOpts: Tx
  ) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
    this.assert.common.greaterThanZero(
      bidQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(bidQuantity)
    );

    await this.assert.setToken.isValidSetToken(this.core.coreAddress, rebalancingSetTokenAddress);
    await this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress);
    if (!allowPartialFill) {
      await this.assert.rebalancing.bidAmountLessThanRemainingSets(rebalancingSetTokenAddress, bidQuantity);
    }
    await this.assert.rebalancing.bidIsMultipleOfMinimumBid(rebalancingSetTokenAddress, bidQuantity);

    const tokenFlows = await this.rebalancingSetCTokenBidder.getAddressAndBidPriceArray(
      rebalancingSetTokenAddress,
      bidQuantity
    );

    await Promise.all(tokenFlows.tokens.map((tokenAddress: Address, index: number) =>
      this.assert.erc20.hasSufficientAllowanceAsync(
        tokenAddress,
        txOpts.from,
        this.config.rebalancingSetCTokenBidderAddress,
        tokenFlows.inflow[index]
      )
    ));

    await Promise.all(tokenFlows.tokens.map((tokenAddress: Address, index: number) =>
      this.assert.erc20.hasSufficientBalanceAsync(
        tokenAddress,
        txOpts.from,
        tokenFlows.inflow[index]
      )
    ));
  }

  private assertGetRebalanceStatesAsync(tokenAddresses: Address[]) {
    tokenAddresses.forEach(tokenAddress => {
      this.assert.schema.isValidAddress('rebalancingSetTokenAddress', tokenAddress);
    });
  }

  private assertGetUnitSharesAsync(tokenAddresses: Address[]) {
    tokenAddresses.forEach(tokenAddress => {
      this.assert.schema.isValidAddress('rebalancingSetTokenAddress', tokenAddress);
    });
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
