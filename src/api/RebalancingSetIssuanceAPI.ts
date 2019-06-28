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

import * as _ from 'lodash';
import Web3 from 'web3';

import { Assertions } from '../assertions';
import { BigNumber,  } from '../util';
import {
  RebalancingSetIssuanceModuleWrapper,
  RebalancingSetTokenWrapper,
 } from '../wrappers';
import { Address, SetProtocolConfig, Tx } from '../types/common';
import { exchangeIssuanceErrors } from '../errors';

/**
 * @title RebalancingSetIssuanceAPI
 * @author Set Protocol
 *
 * A library for issuance and redemption of RebalancingSets.
 */
export class RebalancingSetIssuanceAPI {
  private web3: Web3;
  private assert: Assertions;
  private rebalancingSetIssuanceModule: RebalancingSetIssuanceModuleWrapper;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private wrappedEther: Address;
  private transferProxy: Address;

  /**
   * Instantiates a new RebalancingSetIssuanceAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3                         The Web3.js Provider instance you would like the SetProtocol.js library
   *                                      to use for interacting with the Ethereum network
   * @param assertions                   An instance of the Assertion library
   * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
   */
  constructor(
    web3: Web3,
    assertions: Assertions,
    config: SetProtocolConfig,
  ) {
    this.web3 = web3;
    this.assert = assertions;
    this.transferProxy = config.transferProxyAddress;
    this.rebalancingSetIssuanceModule = new RebalancingSetIssuanceModuleWrapper(
      web3,
      config.rebalancingSetIssuanceModule,
    );
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(this.web3);
    this.wrappedEther = config.wrappedEtherAddress;
  }


  /**
   * Issue a rebalancing SetToken using the base components of the base SetToken.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
   *                                    or is left in the vault
   * @param  txOpts                    The options for executing the transaction.
   */
  public async issueRebalancingSet(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    keepChangeInVault: boolean,
    txOpts: Tx
  ): Promise<string> {
    await this.assert.issuance.assertRebalancingSetTokenIssue(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      txOpts.from,
      this.transferProxy,
    );

    return this.rebalancingSetIssuanceModule.issueRebalancingSet(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      keepChangeInVault,
      txOpts,
    );
  }

  /**
   * Issue a rebalancing SetToken using the base components of the base SetToken.
   * Wrapped Ether must be a component of the base SetToken - which is wrapped using the
   * ether sent along with the transaction. Excess ether is returned to the user.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
   *                                    or is left in the vault
   * @param  txOpts                   The options for executing the transaction. Value must be filled in.
   */
  public async issueRebalancingSetWrappingEther(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    keepChangeInVault: boolean,
    txOpts: Tx
  ): Promise<string> {
    await this.assertIssueRebalancingSetWrappingEther(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      txOpts,
    );

    return this.rebalancingSetIssuanceModule.issueRebalancingSetWrappingEther(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      keepChangeInVault,
      txOpts,
    );
  }

  /**
   * Redeems a Rebalancing Set into the base SetToken. Then the base SetToken is redeemed, and its components
   * are sent to the caller or transferred to the caller in the Vault depending on the keepChangeInVault argument.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
   *                                    or is left in the vault
   * @param  txOpts                   The options for executing the transaction
   */
  public async redeemRebalancingSet(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    keepChangeInVault: boolean,
    txOpts: Tx
  ): Promise<string> {
    await this.assert.issuance.assertRedeem(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      txOpts.from,
    );

    return this.rebalancingSetIssuanceModule.redeemRebalancingSet(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      keepChangeInVault,
      txOpts,
    );
  }

  /**
   * Redeems a Rebalancing Set into the base SetToken. Then the base Set is redeemed, and its components
   * are sent to the caller. Any wrapped Ether is unwrapped and transferred to the caller.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
   *                                    or is left in the vault
   * @param  txOpts                    The options for executing the transaction
   */
  public async redeemRebalancingSetUnwrappingEther(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    keepChangeInVault: boolean,
    txOpts: Tx
  ): Promise<string> {
    await this.assertRedeemRebalancingSetUnwrappingEther(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      txOpts,
    );

    return this.rebalancingSetIssuanceModule.redeemRebalancingSetUnwrappingEther(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      keepChangeInVault,
      txOpts,
    );
  }

  /* ============ Private Assertions ============ */

  private async assertIssueRebalancingSetWrappingEther(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    txOpts: Tx,
  ) {
    this.assert.common.isNotUndefined(txOpts.value, exchangeIssuanceErrors.ETHER_VALUE_NOT_UNDEFINED());

    await this.assert.issuance.assertRebalancingSetTokenIssueWrappingEther(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      txOpts.from,
      this.transferProxy,
      this.wrappedEther,
      new BigNumber(txOpts.value),
    );
  }

  private async assertRedeemRebalancingSetUnwrappingEther(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    txOpts: Tx,
  ) {
    await this.assert.issuance.assertRedeem(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      txOpts.from,
    );

    // Check that wrapped Ether is a base SetToken component
    const baseSetAddress = await this.rebalancingSetToken.currentSet(rebalancingSetAddress);
    await this.assert.setToken.isComponent(
      baseSetAddress,
      this.wrappedEther,
    );
  }
}
