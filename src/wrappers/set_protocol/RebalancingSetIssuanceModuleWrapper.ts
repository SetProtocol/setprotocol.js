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

import { ProtocolContractWrapper } from './ProtocolContractWrapper';
import { BigNumber, generateTxOpts } from '../../util';
import { Address, Tx } from '../../types/common';

/**
 * @title  RebalancingSetIssuanceModuleWrapper
 * @author Set Protocol
 *
 * The RebalancingSetIssuanceModuleWrapper handles all functions for the Issuance and Redemption of Rebalancing Sets on
 * the RebalancingSetIssuanceModule smart contract
 *
 */
export class RebalancingSetIssuanceModuleWrapper {
  private web3: Web3;
  private contracts: ProtocolContractWrapper;
  private rebalancingSetIssuanceModule: Address;

  public constructor(web3: Web3, rebalancingSetIssuanceModuleAddress: Address) {
    this.web3 = web3;
    this.rebalancingSetIssuanceModule = rebalancingSetIssuanceModuleAddress;
    this.contracts = new ProtocolContractWrapper(this.web3);
  }

  /**
   * Issue a rebalancing SetToken using the base components of the base SetToken.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
   *                                    or is left in the vault
   * @param  txOpts                    The options for executing the transaction
   */
  public async issueRebalancingSet(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    keepChangeInVault: boolean,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetIssuanceModuleInstance =
      await this.contracts.loadRebalancingSetIssuanceModuleAsync(
        this.rebalancingSetIssuanceModule
      );

    return await rebalancingSetIssuanceModuleInstance.issueRebalancingSet.sendTransactionAsync(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      keepChangeInVault,
      txSettings,
    );
  }

  /**
   * Issue a rebalancing SetToken using the base components of the base SetToken.
   * Wrapped Ether must be a component of the base SetToken - which is wrapped using the
   * ether sent along with the transaction.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
   *                                    or is left in the vault
   * @param  txOpts                   The options for executing the transaction.
   */
  public async issueRebalancingSetWrappingEther(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    keepChangeInVault: boolean,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetIssuanceModuleInstance =
      await this.contracts.loadRebalancingSetIssuanceModuleAsync(
        this.rebalancingSetIssuanceModule
      );

    return await rebalancingSetIssuanceModuleInstance.issueRebalancingSetWrappingEther.sendTransactionAsync(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      keepChangeInVault,
      txSettings,
    );
  }

  /**
   * Redeems a Rebalancing Set into the base SetToken. Then the base SetToken is redeemed, and its components
   * are sent to the caller.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
   *                                    or is left in the vault
   * @param  txOpts                    The options for executing the transaction
   */
  public async redeemRebalancingSet(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    keepChangeInVault: boolean,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetIssuanceModuleInstance =
      await this.contracts.loadRebalancingSetIssuanceModuleAsync(
        this.rebalancingSetIssuanceModule
      );

    return await rebalancingSetIssuanceModuleInstance.redeemRebalancingSet.sendTransactionAsync(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      keepChangeInVault,
      txSettings,
    );
  }

  /**
   * Redeems a Rebalancing Set into the base SetToken. Then the base Set is redeemed, and its components
   * are sent to the caller. Any wrapped Ether is unwrapped and attributed to the caller.
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
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetIssuanceModuleInstance =
      await this.contracts.loadRebalancingSetIssuanceModuleAsync(
        this.rebalancingSetIssuanceModule
      );

    return await rebalancingSetIssuanceModuleInstance.redeemRebalancingSetUnwrappingEther.sendTransactionAsync(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      keepChangeInVault,
      txSettings,
    );
  }
}
