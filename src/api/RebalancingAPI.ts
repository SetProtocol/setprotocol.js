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
import * as Web3 from 'web3';
import { RebalancingSetTokenContract, SetTokenContract, VaultContract } from 'set-protocol-contracts';

import { ZERO } from '../constants';
import { coreAPIErrors, setTokenAssertionsErrors } from '../errors';
import { Assertions } from '../assertions';
import { ERC20Wrapper, SetTokenWrapper, RebalancingSetTokenWrapper } from '../wrappers';
import { BigNumber, calculatePartialAmount } from '../util';
import { Address, Component, SetDetails, TxData, } from '../types/common';

/**
 * @title RebalancingAPI
 * @author Set Protocol
 *
 * A library for interacting with RebalancingSetToken contracts
 */

export class RebalancingAPI {
  private web3: Web3;
  private assert: Assertions;
  private coreAddress: Address;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private setToken: SetTokenWrapper;

  /**
   * Instantiates a new RebalancingAPI instance that contains methods
   * for interacting with RebalancingSetToken contracts
   *
   * @param web3        Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
   *                      the Ethereum network
   * @param assertions  An instance of the Assertion library
   */
  constructor(web3: Web3, assertions: Assertions, coreAddress: Address) {
    this.web3 = web3;
    this.assert = assertions;
    this.coreAddress = coreAddress;

    this.rebalancingSetToken = new RebalancingSetTokenWrapper(this.web3);
    this.setToken = new SetTokenWrapper(this.web3);
  }


  /**
   * Proposes rebalance, can only be called by manager
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  nextSetAddress                 Set to rebalance into
   * @param  auctionLibrary                 Address of auction price curve to use
   * @param  curveCoefficient               Set auction price curve coefficient
   * @param  auctionStartPrice              Used with auctionPriceDivisor, define auction start price
   * @param  auctionPriceDivisor            Parameter to control how fast price moves
   * @param  txOpts                         Transaction options
   * @return                                Transaction hash
   */
  public async proposeAsync(
    rebalancingSetTokenAddress: Address,
    nextSetAddress: Address,
    auctionLibrary: Address,
    curveCoefficient: BigNumber,
    auctionStartPrice: BigNumber,
    auctionPriceDivisor: BigNumber,
    txOpts: TxData
  ): Promise<string> {
    await this.assertPropose(
      rebalancingSetTokenAddress,
      nextSetAddress,
      auctionLibrary,
      curveCoefficient,
      auctionStartPrice,
      auctionPriceDivisor,
      txOpts
    );

    return await this.rebalancingSetToken.propose(
      rebalancingSetTokenAddress,
      nextSetAddress,
      auctionLibrary,
      curveCoefficient,
      auctionStartPrice,
      auctionPriceDivisor,
      txOpts
    );
  }

  /**
   * Initiates rebalance after proposal period has passed
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  txOpts                         Transaction options
   * @return                                Transaction hash
   */
  public async rebalanceAsync(
    rebalancingSetTokenAddress: Address,
    txOpts: TxData
  ): Promise<string> {
    await this.assertRebalance(
      rebalancingSetTokenAddress,
    );

    return await this.rebalancingSetToken.rebalance(
      rebalancingSetTokenAddress,
      txOpts
    );
  }

  /**
   * Settles rebalance after auction has been completed
   *
   * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
   * @param  txOpts                         Transaction options
   * @return                                Transaction hash
   */
  public async settleRebalanceAsync(
    rebalancingSetTokenAddress: Address,
    txOpts: TxData
  ): Promise<string> {
    await this.assertSettleRebalance(
      rebalancingSetTokenAddress,
    );

    return await this.rebalancingSetToken.settleRebalance(
      rebalancingSetTokenAddress,
      txOpts
    );
  }

  /* ============ Private Assertions ============ */

  private async assertPropose(
    rebalancingSetTokenAddress: Address,
    nextSetAddress: Address,
    auctionLibrary: Address,
    curveCoefficient: BigNumber,
    auctionStartPrice: BigNumber,
    auctionPriceDivisor: BigNumber,
    txOpts: TxData,
  ) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
    this.assert.schema.isValidAddress('nextSetAddress', nextSetAddress);
    this.assert.schema.isValidAddress('auctionLibrary', auctionLibrary);

    this.assert.common.greaterThanZero(
      curveCoefficient,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(curveCoefficient)
    );
    this.assert.common.greaterThanZero(auctionPriceDivisor,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(auctionPriceDivisor)
    );
    this.assert.common.greaterThanZero(
      auctionStartPrice,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(auctionStartPrice)
    );

    await this.assert.rebalancing.isNotInRebalanceState(rebalancingSetTokenAddress);
    await this.assert.rebalancing.isManager(rebalancingSetTokenAddress, txOpts.from);
    await this.assert.rebalancing.sufficientTimeBetweenRebalance(rebalancingSetTokenAddress);
    await this.assert.setToken.isValidSetToken(this.coreAddress, nextSetAddress);
  }

  private async assertRebalance(
    rebalancingSetTokenAddress: Address,
  ) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);

    await this.assert.rebalancing.isInProposalState(rebalancingSetTokenAddress);
    await this.assert.rebalancing.sufficientTimeInProposalState(rebalancingSetTokenAddress);
  }

  private async assertSettleRebalance(
    rebalancingSetTokenAddress: Address,
  ) {
    this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);

    await this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress);
    await this.assert.rebalancing.enoughSetsRebalanced(rebalancingSetTokenAddress);
  }
}