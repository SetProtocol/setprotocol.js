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
import * as setProtocolUtils from 'set-protocol-utils';

import { BigNumber } from '@src/util';
import {
  SocialTradingManagerWrapper
} from '@src/wrappers';
import { Assertions } from '@src/assertions';
import { coreAPIErrors } from '@src/errors';
import { Address, Bytes, Tx } from '@src/types/common';
import {
  SetProtocolConfig
} from '../types/common';

const { SetProtocolUtils: SetUtils } = setProtocolUtils;

/**
 * @title SocialTradingAPI
 * @author Set Protocol
 *
 * A library for interacting with Social Trading contracts
 */
export class SocialTradingAPI {
  private assert: Assertions;
  // private protocolViewer: ProtocolViewerWrapper;
  private socialTradingManager: SocialTradingManagerWrapper;

  /**
   * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3          The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   * @param assertions    An instance of the Assertion library
   * @param config        Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
   */
  constructor(web3: Web3, assertions: Assertions, config: SetProtocolConfig) {
    // this.protocolViewer = new ProtocolViewerWrapper(web3, config.protocolViewerAddress);
    this.socialTradingManager = new SocialTradingManagerWrapper(web3);

    this.assert = assertions;
  }

  /**
   * Calls SocialTradingManager's createTradingPool function. This function creates a new tradingPool for
   * the sender. Creates collateral Set and RebalancingSetTokenV2 then stores data relevant for updating
   * allocations in mapping indexed by created RebalancingSetTokenV2 address.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  allocatorAddress               Address of allocator to be used for pool, proxy for trading pair
   * @param  startingBaseAssetAllocation    Starting base asset allocation of tradingPool
   * @param  startingUSDValue               Starting USD value of one share of tradingPool
   * @param  tradingPoolName                Name of tradingPool as appears on RebalancingSetTokenV2
   * @param  tradingPoolSymbol              Symbol of tradingPool as appears on RebalancingSetTokenV2
   * @param  liquidator                     Address of liquidator contract
   * @param  feeRecipient                   Address receiving fees from contract
   * @param  feeCalculator                  Rebalance fee calculator being used
   * @param  rebalanceInterval              Time required between rebalances
   * @param  failAuctionPeriod              Time before auction can be failed
   * @param  lastRebalanceTimestamp         Passed time of last rebalance
   * @param  entryFee                       Trading Pool entrance fee
   * @param  rebalanceFee                   Trading Pool rebalance fee
   * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
   *                                          gasPrice data
   * @return                                The hash of the resulting transaction.
   */
  public async createTradingPoolAsync(
    manager: Address,
    allocatorAddress: Address,
    startingBaseAssetAllocation: BigNumber,
    startingUSDValue: BigNumber,
    tradingPoolName: string,
    tradingPoolSymbol: string,
    liquidator: Address,
    feeRecipient: Address,
    feeCalculator: Address,
    rebalanceInterval: BigNumber,
    failAuctionPeriod: BigNumber,
    lastRebalanceTimestamp: BigNumber,
    entryFee: BigNumber,
    rebalanceFee: BigNumber,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertCreateTradingPool(
      startingBaseAssetAllocation,
      entryFee,
      rebalanceFee,
      tradingPoolName,
      tradingPoolSymbol,
    );

    const rebalanceFeeBytes = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);

    const rebalancingSetV2CallData = SetUtils.generateRebalancingSetTokenV2CallData(
      manager,
      liquidator,
      feeRecipient,
      feeCalculator,
      rebalanceInterval,
      failAuctionPeriod,
      lastRebalanceTimestamp,
      entryFee,
      rebalanceFeeBytes
    );

    return this.socialTradingManager.createTradingPool(
      manager,
      allocatorAddress,
      startingBaseAssetAllocation,
      startingUSDValue,
      SetUtils.stringToBytes(tradingPoolName),
      SetUtils.stringToBytes(tradingPoolSymbol),
      rebalancingSetV2CallData,
      txOpts
    );
  }

  /**
   * Calls SocialTradingManager's createTradingPool function. This function creates a new tradingPool for
   * the sender. Creates collateral Set and RebalancingSetTokenV2 then stores data relevant for updating
   * allocations in mapping indexed by created RebalancingSetTokenV2 address.
   *
   * @param  manager                Address of the social trading manager contract
   * @param  tradingPool            Address of tradingPool being updated
   * @param  newAllocation          New allocation amount in base asset percentage
   * @param  liquidatorData         Arbitrary bytes data passed to liquidator
   * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
   *                                  gasPrice data
   * @return                        The hash of the resulting transaction.
   */
  public async updateAllocationAsync(
    manager: Address,
    tradingPool: Address,
    newAllocation: BigNumber,
    liquidatorData: Bytes,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertUpdateAllocation(manager, tradingPool, newAllocation, txOpts);

    return this.socialTradingManager.updateAllocation(
      manager,
      tradingPool,
      newAllocation,
      liquidatorData,
      txOpts
    );
  }

  /* ============ Private Assertions ============ */
  private async assertCreateTradingPool(
    allocation: BigNumber,
    entryFee: BigNumber,
    rebalanceFee: BigNumber,
    tradingPoolName: string,
    tradingPoolSymbol: string,
  ): Promise<void> {
    this.assertValidAllocation(allocation);
    this.assertValidFees(entryFee, rebalanceFee);

    this.assert.common.isValidString(tradingPoolName, coreAPIErrors.STRING_CANNOT_BE_EMPTY('name'));
    this.assert.common.isValidString(tradingPoolSymbol, coreAPIErrors.STRING_CANNOT_BE_EMPTY('symbol'));
  }

  private async assertUpdateAllocation(
    manager: Address,
    tradingPool: Address,
    newAllocation: BigNumber,
    txOpts: Tx,
  ): Promise<void> {
    await this.assert.rebalancing.isNotInRebalanceState(tradingPool);
    await this.assert.rebalancing.sufficientTimeBetweenRebalance(tradingPool);
    await this.assert.socialTrading.isTrader(manager, tradingPool, txOpts.from);

    this.assertValidAllocation(newAllocation);
  }

  private assertValidAllocation(
    newAllocation: BigNumber
  ): void {
    this.assert.socialTrading.allocationGreaterThanZero(newAllocation);
    this.assert.socialTrading.allocationLessThanOneHundred(newAllocation);
    this.assert.socialTrading.allocationMultipleOfOnePercent(newAllocation);
  }

  private assertValidFees(
    entryFee: BigNumber,
    rebalanceFee: BigNumber
  ): void {
    this.assert.socialTrading.feeMultipleOfOneBasisPoint(entryFee);
    this.assert.socialTrading.feeMultipleOfOneBasisPoint(rebalanceFee);
  }
}