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
import { Bytes, ExchangeIssueParams } from 'set-protocol-utils';

/**
 * @title  PayableExchangeIssueWrapper
 * @author Set Protocol
 *
 * The PayableExchangeIssueWrapper handles all functions on the Payable Exchange Issue smart contract.
 *
 */
export class PayableExchangeIssueWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;
  private payableExchangeIssue: Address;

  public constructor(web3: Web3, payableExchangeIssueAddress: Address) {
    this.web3 = web3;
    this.payableExchangeIssue = payableExchangeIssueAddress;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Issue a Rebalancing Set using Wrapped Ether to acquire the base components of the Base Set.
   * The Base Set is then issued using Exchange Issue and reissued into the Rebalancing Set.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
   * @param  exchangeIssueData        Struct containing data around the base Set issuance
   * @param  orderData                Bytecode formatted data with exchange data for acquiring base set components
   * @param  txOpts                    The options for executing the transaction
   */
  public async issueRebalancingSetWithEther(
    rebalancingSetAddress: Address,
    exchangeIssueParams: ExchangeIssueParams,
    orderData: Bytes,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const payableExchangeIssueInstance = await this.contracts.loadPayableExchangeIssueAsync(
      this.payableExchangeIssue
    );

    return await payableExchangeIssueInstance.issueRebalancingSetWithEther.sendTransactionAsync(
      rebalancingSetAddress,
      exchangeIssueParams,
      orderData,
      txSettings,
    );
  }
}
