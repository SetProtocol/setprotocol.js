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
import { generateTxOpts } from '../util';
import { Address, Tx } from '../types/common';
import { Bytes, ExchangeIssuanceParams } from 'set-protocol-utils';

/**
 * @title  PayableExchangeIssuanceWrapper
 * @author Set Protocol
 *
 * The PayableExchangeIssuanceWrapper handles all functions on the Payable Exchange Issue smart contract.
 *
 */
export class PayableExchangeIssuanceWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;
  private payableExchangeIssuance: Address;

  public constructor(web3: Web3, payableExchangeIssuanceAddress: Address) {
    this.web3 = web3;
    this.payableExchangeIssuance = payableExchangeIssuanceAddress;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Issue a Rebalancing Set using Wrapped Ether to acquire the base components of the Base Set.
   * The Base Set is then issued using Exchange Issue and reissued into the Rebalancing Set.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
   * @param  exchangeIssuanceData        Struct containing data around the base Set issuance
   * @param  orderData                Bytecode formatted data with exchange data for acquiring base set components
   * @param  txOpts                    The options for executing the transaction
   */
  public async issueRebalancingSetWithEther(
    rebalancingSetAddress: Address,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orderData: Bytes,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const payableExchangeIssuanceInstance = await this.contracts.loadPayableExchangeIssuanceAsync(
      this.payableExchangeIssuance
    );

    return await payableExchangeIssuanceInstance.issueRebalancingSetWithEther.sendTransactionAsync(
      rebalancingSetAddress,
      exchangeIssuanceParams,
      orderData,
      txSettings,
    );
  }
}
