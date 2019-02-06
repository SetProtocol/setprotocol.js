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
import { Bytes, ExchangeIssueParams } from 'set-protocol-utils';

/**
 * @title  ExchangeIssueModuleWrapper
 * @author Set Protocol
 *
 * The ExchangeIssueModuleWrapper handles all functions on the Exchange Issue Module smart contract.
 *
 */
export class ExchangeIssueModuleWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;
  private exchangeIssueModule: Address;

  public constructor(web3: Web3, exchangeIssueModuleAddress: Address) {
    this.web3 = web3;
    this.exchangeIssueModule = exchangeIssueModuleAddress;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Issue a Set by acquiring the base components of the Set.
   *
   * @param  exchangeIssueData        Struct containing data around the base Set issuance
   * @param  orderData                Bytecode formatted data with exchange data for acquiring base set components
   * @param  txOpts                    The options for executing the transaction
   */
  public async exchangeIssue(
    exchangeIssueParams: ExchangeIssueParams,
    orderData: Bytes,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const exchangeIssueModuleInstance = await this.contracts.loadExchangeIssueModuleAsync(
      this.exchangeIssueModule
    );

    return await exchangeIssueModuleInstance.exchangeIssue.sendTransactionAsync(
      exchangeIssueParams,
      orderData,
      txSettings,
    );
  }
}
