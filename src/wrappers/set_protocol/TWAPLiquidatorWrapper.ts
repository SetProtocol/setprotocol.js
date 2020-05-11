/*
  Copyright 2020 Set Labs Inc.

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
 * @title  TWAPLiquidatorWrapper
 * @author Set Protocol
 *
 * The TWAPLiquidatorWrapper handles all functions on the TWAPLiquidator smart contract.
 *
 */
export class TWAPLiquidatorWrapper {
  private web3: Web3;
  private contracts: ProtocolContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ProtocolContractWrapper(this.web3);
  }

  /**
   * Iterates a TWAP auction to its next chunk
   *
   * @param  liquidatorAddress              Address of TWAPLiquidator contract
   * @param  rebalancingSetTokenAddress     Address of RebalancingSetToken being rebalanced
   * @param  txOpts                         Any parameters necessary to modify the transaction.
   */
  public async iterateChunkAuction(
    liquidatorAddress: Address,
    rebalancingSetTokenAddress: Address,
    txOpts: Tx,
  ): Promise<string> {
    const liquidatorInstance = await this.contracts.loadTWAPLiquidatorContract(
      liquidatorAddress
    );

    return await liquidatorInstance.iterateChunkAuction.sendTransactionAsync(
      rebalancingSetTokenAddress,
      txOpts
    );
  }
}