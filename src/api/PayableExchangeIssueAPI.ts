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
import { Bytes, ExchangeIssueParams, SetProtocolUtils } from 'set-protocol-utils';

import { ZERO } from '../constants';
import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { CoreWrapper, PayableExchangeIssueWrapper } from '../wrappers';
import { BigNumber } from '../util';
import {
  Address,
  KyberTrade,
  Tx,
  ZeroExSignedFillOrder,
} from '../types/common';

/**
 * @title PayableExchangeIssueAPI
 * @author Set Protocol
 *
 * A library for issuing RebalancingSets using Ether.
 */
export class PayableExchangeIssueAPI {
  private web3: Web3;
  private assert: Assertions;
  private core: CoreWrapper;
  private payableExchangeIssue: PayableExchangeIssueWrapper;
  private setProtocolUtils: SetProtocolUtils;
  private wrappedEther: Address;

  /**
   * Instantiates a new PayableExchangeIssueAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3                  The Web3.js Provider instance you would like the SetProtocol.js library
   *                                to use for interacting with the Ethereum network
   * @param core                  An instance of CoreWrapper to interact with the deployed Core contract
   * @param assertions            An instance of the Assertion library
   * @param payableExchangeIssue  An unstance if the PayableExchangeIssueWrapper Library
   * @param wrappedEtherAddress   Address of the deployed canonical wrapped ether contract
   */
  constructor(
    web3: Web3,
    core: CoreWrapper,
    assertions: Assertions,
    payableExchangeIssue: PayableExchangeIssueWrapper,
    wrappedEtherAddress: Address,
  ) {
    this.web3 = web3;
    this.setProtocolUtils = new SetProtocolUtils(this.web3);
    this.core = core;
    this.assert = assertions;
    this.payableExchangeIssue = payableExchangeIssue;
    this.wrappedEther = wrappedEtherAddress;
  }

  /**
   * Issues a Set to the transaction signer. Must have component tokens in the correct quantites in either
   * the vault or in the signer's wallet. Component tokens must be approved to the Transfer
   * Proxy contract via setTransferProxyAllowanceAsync
   *
   * @param  rebalancingSetAddress    Address of the Rebalancing Set to issue
   * @param  exchangeIssueParams      Parameters required to facilitate an exchange issue
   * @param  orders                   A list of signed 0x orders or kyber trades
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async issueRebalancingSetWithEtherAsync(
    rebalancingSetAddress: Address,
    exchangeIssueParams: ExchangeIssueParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx
  ): Promise<string> {

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);

    return this.payableExchangeIssue.issueRebalancingSetWithEther(
      rebalancingSetAddress,
      exchangeIssueParams,
      orderData,
      txOpts,
    );
  }
}
