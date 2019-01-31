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
import { SetTokenContract, VaultContract } from 'set-protocol-contracts';

import { ZERO } from '../constants';
import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { CoreWrapper, BTCETHRebalancingManagerWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { Address, RebalancingManagerDetails, Tx } from '../types/common';

/**
 * @title RebalancingManagerAPI
 * @author Set Protocol
 *
 * A library for interacting with Rebalancing Manager
 */
export class RebalancingManagerAPI {
  private web3: Web3;
  private assert: Assertions;
  private btcEthRebalancingManager: BTCETHRebalancingManagerWrapper;

  /**
   * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   * @param core        An instance of CoreWrapper to interact with the deployed Core contract
   * @param assertions  An instance of the Assertion library
   */
  constructor(web3: Web3, assertions: Assertions) {
    this.web3 = web3;
    this.assert = assertions;
    this.btcEthRebalancingManager = new BTCETHRebalancingManagerWrapper(web3);
  }

  /**
   * Calls the propose function on a specified rebalancing manager and rebalancing set token.
   * This function will generate a new set token using data from the btc and eth price feeds and ultimately generate
   * a proposal on the rebalancing set token.
   *
   * @param  rebalancingManager    Address of the BTCETH Rebalancing Manager contract
   * @param  rebalancingSet        Rebalancing Set to call propose on
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async proposeAsync(rebalancingManager: Address, rebalancingSet: Address, txOpts: Tx): Promise<string> {
    return await this.btcEthRebalancingManager.propose(rebalancingManager, rebalancingSet, txOpts);
  }

  /**
   * Fetches the state variables of the Rebalancing Manager contract.
   *
   * @param  rebalancingManager    Address of the BTCETH Rebalancing Manager contract
   * @return               Object containing the state information related to the rebalancing manager
   */
  public async getRebalancingManagerDetailsAsync(rebalancingManager: Address): Promise<RebalancingManagerDetails> {
    const [
      core,
      btcPriceFeed,
      ethPriceFeed,
      btcAddress,
      ethAddress,
      setTokenFactory,
      btcMultiplier,
      ethMultiplier,
      auctionLibrary,
      auctionTimeToPivot,
    ] = await Promise.all([
      this.btcEthRebalancingManager.core(rebalancingManager),
      this.btcEthRebalancingManager.btcPriceFeed(rebalancingManager),
      this.btcEthRebalancingManager.ethPriceFeed(rebalancingManager),
      this.btcEthRebalancingManager.btcAddress(rebalancingManager),
      this.btcEthRebalancingManager.ethAddress(rebalancingManager),
      this.btcEthRebalancingManager.setTokenFactory(rebalancingManager),
      this.btcEthRebalancingManager.btcMultiplier(rebalancingManager),
      this.btcEthRebalancingManager.ethMultiplier(rebalancingManager),
      this.btcEthRebalancingManager.auctionLibrary(rebalancingManager),
      this.btcEthRebalancingManager.auctionTimeToPivot(rebalancingManager),
    ]);

    return {
      core,
      btcPriceFeed,
      ethPriceFeed,
      btcAddress,
      ethAddress,
      setTokenFactory,
      btcMultiplier,
      ethMultiplier,
      auctionLibrary,
      auctionTimeToPivot,
    } as RebalancingManagerDetails;
  }
}
