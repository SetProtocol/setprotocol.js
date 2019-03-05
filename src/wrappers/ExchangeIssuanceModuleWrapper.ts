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
 * @title  ExchangeIssuanceModuleWrapper
 * @author Set Protocol
 *
 * The ExchangeIssuanceModuleWrapper handles all functions on the Exchange Issue Module smart contract.
 *
 */
export class ExchangeIssuanceModuleWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;
  private exchangeIssuanceModule: Address;

  public constructor(web3: Web3, exchangeIssuanceModuleAddress: Address) {
    this.web3 = web3;
    this.exchangeIssuanceModule = exchangeIssuanceModuleAddress;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Issue a Set by acquiring the base components of the Set.
   *
   * @param  exchangeIssuanceData        Struct containing data around the base Set issuance
   * @param  orderData                Bytecode formatted data with exchange data for acquiring base set components
   * @param  txOpts                    The options for executing the transaction
   */
  public async exchangeIssue(
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orderData: Bytes,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const exchangeIssuanceModuleInstance = await this.contracts.loadExchangeIssuanceModuleAsync(
      this.exchangeIssuanceModule
    );

    return await exchangeIssuanceModuleInstance.exchangeIssue.sendTransactionAsync(
      exchangeIssuanceParams,
      orderData,
      txSettings,
    );
  }

  /**
   * Redeems a Set and exchanges the components for a specific ERC20 token.
   *
   * @param  exchangeIssuanceData      Struct containing data around the base Set issuance
   * @param  orderData                Bytecode formatted data with exchange data for disposing of base set components
   * @param  txOpts                    The options for executing the transaction
   */
  public async exchangeRedeem(
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orderData: Bytes,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const exchangeIssuanceModuleInstance = await this.contracts.loadExchangeIssuanceModuleAsync(
      this.exchangeIssuanceModule
    );

    return await exchangeIssuanceModuleInstance.exchangeRedeem.sendTransactionAsync(
      exchangeIssuanceParams,
      orderData,
      txSettings,
    );
  }
}
