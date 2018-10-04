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
}