/*
  Copyright 2019 Set Labs Inc.

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

import { Address } from '../../types/common';
import { BigNumber } from '../../util';
import { ProtocolContractWrapper } from './ProtocolContractWrapper';

/**
 * @title  ProtocolViewerWrapper
 * @author Set Protocol
 *
 * The ProtocolViewerWrapper handles all functions on the Protocol Viewer smart contract.
 *
 */
export class ProtocolViewerWrapper {
  private web3: Web3;
  private contracts: ProtocolContractWrapper;
  private protocolViewerAddress: Address;

  public constructor(web3: Web3, protocolViewerAddress: Address) {
    this.web3 = web3;
    this.protocolViewerAddress = protocolViewerAddress;
    this.contracts = new ProtocolContractWrapper(this.web3);
  }

  /**
   * Fetches multiple balances for passed in array of ERC20 contract addresses for an owner
   *
   * @param  tokenAddresses    Addresses of ERC20 contracts to check balance for
   * @param  owner             Address to check balance of tokenAddress for
   */
  public async batchFetchBalancesOf(
    tokenAddresses: Address[],
    owner: Address,
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchBalancesOf.callAsync(tokenAddresses, owner);
  }

  /**
   * Fetches token balances for each tokenAddress, tokenOwner pair
   *
   * @param  tokenAddresses    Addresses of ERC20 contracts to check balance for
   * @param  tokenOwners       Addresses of users sequential to tokenAddress to fetch balance for
   */
  public async batchFetchUsersBalances(
    tokenAddresses: Address[],
    tokenOwners: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchUsersBalances.callAsync(tokenAddresses, tokenOwners);
  }

  /**
   * Fetches multiple supplies for passed in array of ERC20 contract addresses
   *
   * @param  tokenAddresses    Addresses of ERC20 contracts to check supply for
   */
  public async batchFetchSupplies(
    tokenAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchSupplies.callAsync(tokenAddresses);
  }

  /**
   * Fetches all RebalancingSetToken state associated with a rebalance proposal
   *
   * @param  rebalancingSetTokenAddress    RebalancingSetToken contract instance address
   */
  public async fetchRebalanceProposalStateAsync(
    rebalancingSetTokenAddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchRebalanceProposalStateAsync.callAsync(rebalancingSetTokenAddress);
  }

  /**
   * Fetches all RebalancingSetToken state associated with a new rebalance auction
   *
   * @param  rebalancingSetTokenAddress    RebalancingSetToken contract instance address
   */
  public async fetchRebalanceAuctionStateAsync(
    rebalancingSetTokenAddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchRebalanceAuctionStateAsync.callAsync(rebalancingSetTokenAddress);
  }

  /**
   * Fetches all rebalance states for an array of RebalancingSetToken contracts
   *
   * @param  rebalancingSetTokenAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchRebalanceStateAsync(
    rebalancingSetTokenAddresses: Address[],
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchRebalanceStateAsync.callAsync(rebalancingSetTokenAddresses);
  }

  /**
   * Fetches state of trading pool info, underlying RebalancingSetTokenV2, and current collateralSet.
   *
   * @param  tradingPoolAddress      RebalancingSetTokenV2 contract address of tradingPool
   */
  public async fetchNewTradingPoolDetails(
    tradingPoolAdddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchNewTradingPoolDetails.callAsync(tradingPoolAdddress);
  }

  /**
   * Fetches rebalance state of trading pool info, underlying RebalancingSetTokenV2, and current
   * collateralSet.
   *
   * @param  tradingPoolAddress      RebalancingSetTokenV2 contract address of tradingPool
   */
  public async fetchTradingPoolRebalanceDetails(
    tradingPoolAdddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchTradingPoolRebalanceDetails.callAsync(tradingPoolAdddress);
  }

  /**
   * Fetches all entry fees for an array of trading pools
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolEntryFees(
    tradingPoolAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchTradingPoolEntryFees.callAsync(tradingPoolAddresses);
  }

  /**
   * Fetches all rebalance fees for an array of trading pools
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolRebalanceFees(
    tradingPoolAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchTradingPoolRebalanceFees.callAsync(tradingPoolAddresses);
  }

  /**
   * Fetches cToken exchange rate stored for an array of cToken addresses
   *
   * @param  cTokenAddresses[]    CToken contract instance addresses
   */
  public async batchFetchExchangeRateStored(
    cTokenAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchExchangeRateStored.callAsync(cTokenAddresses);
  }
}
