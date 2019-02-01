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


import { ContractWrapper } from '.';
import { BigNumber, generateTxOpts } from '../util';
import { Address, Tx } from '../types/common';

/**
 * @title  RebalancingTokenIssuanceModuleWrapper
 * @author Set Protocol
 *
 * The RebalancingTokenIssuanceModuleWrapper handles functions for redeeming and issuing rebalancing sets
 * to and from base components efficiently.
 *
 */
export class RebalancingTokenIssuanceModuleWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;
  private rebalancingTokenIssuanceModule: Address;

  public constructor(web3: Web3, rebalancingTokenIssuanceModule: Address) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
    this.rebalancingTokenIssuanceModule = rebalancingTokenIssuanceModule;
  }

  /**
   * Redeems a Rebalancing Set into the base components of the base Set.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
   * @param  redeemQuantity           The Quantity of the rebalancing Set to redeem
   * @param  toExclude                Mask of indexes of tokens to exclude from withdrawing
   * @param  txOpts                   The options for executing the transaction
   * @return                      A transaction hash
   */
  public async redeemRebalancingSetIntoBaseComponents(
    rebalancingSetAddress: Address,
    redeemQuantity: BigNumber,
    toExclude: BigNumber,
    txOpts?: Tx,

  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rbTokenIssuanceModuleInstance = await this.contracts.loadRebalancingTokenIssuanceModuleAsync(
      this.rebalancingTokenIssuanceModule
    );

    return await rbTokenIssuanceModuleInstance.redeemRebalancingSetIntoBaseComponents.sendTransactionAsync(
      rebalancingSetAddress,
      redeemQuantity,
      toExclude,
      txSettings
    );
  }
}
