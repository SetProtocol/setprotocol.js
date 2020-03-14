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
import { Address, Tx } from '../../types/common';

import { ProtocolContractWrapper } from './ProtocolContractWrapper';

/**
 * @title  RebalancingSetTokenV3Wrapper
 * @author Set Protocol
 *
 * The Rebalancing Set Token V3 API contains interfaces for interacting with fee accrual functions.
 */
export class RebalancingSetTokenV3Wrapper {
    private web3: Web3;
    private contracts: ProtocolContractWrapper;

    public constructor(web3: Web3) {
      this.web3 = web3;
      this.contracts = new ProtocolContractWrapper(this.web3);
    }

  /**
   * Starts rebalance after proposal period has elapsed
   *
   * @param  rebalancingSetAddress   Address of the Set
   * @param  txOpts                  Transaction options
   * @return                         Transaction hash
   */
  public async actualizeFee(
    rebalancingSetAddress: Address,
    txOpts: Tx
  ): Promise<string> {
    const rebalancingSetTokenInstance = await this.contracts.loadRebalancingSetTokenV3Async(rebalancingSetAddress);

    return await rebalancingSetTokenInstance.actualizeFee.sendTransactionAsync(
      txOpts
    );
  }
}