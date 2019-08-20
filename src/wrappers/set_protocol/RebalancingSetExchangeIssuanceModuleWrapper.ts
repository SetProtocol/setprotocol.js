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
import { Bytes, ExchangeIssuanceParams } from 'set-protocol-utils';

/**
 * @title  RebalancingSetExchangeIssuanceModuleWrapper
 * @author Set Protocol
 *
 * The RebalancingSetExchangeIssuanceModuleWrapper handles all functions on the Payable Exchange Issue smart contract.
 *
 */
export class RebalancingSetExchangeIssuanceModuleWrapper {
  private web3: Web3;
  private contracts: ProtocolContractWrapper;
  private rebalancingSetExchangeIssuanceModule: Address;

  public constructor(web3: Web3, rebalancingSetExchangeIssuanceModuleAddress: Address) {
    this.web3 = web3;
    this.rebalancingSetExchangeIssuanceModule = rebalancingSetExchangeIssuanceModuleAddress;
    this.contracts = new ProtocolContractWrapper(this.web3);
  }

  /**
   * Issue a Rebalancing Set using Wrapped Ether to acquire the base components of the Base Set.
   * The Base Set is then issued using Exchange Issue and reissued into the Rebalancing Set.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
   * @param  exchangeIssuanceData     Struct containing data around the base Set issuance
   * @param  orderData                Bytecode formatted data with exchange data for acquiring base set components
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transferred to the user 
   *                                     or left in the vault
   * @param  txOpts                    The options for executing the transaction
   */
  public async issueRebalancingSetWithEther(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orderData: Bytes,
    keepChangeInVault: boolean,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetExchangeIssuanceModuleInstance =
      await this.contracts.loadRebalancingSetExchangeIssuanceModuleAsync(
        this.rebalancingSetExchangeIssuanceModule
      );

    return await rebalancingSetExchangeIssuanceModuleInstance.issueRebalancingSetWithEther.sendTransactionAsync(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      exchangeIssuanceParams,
      orderData,
      keepChangeInVault,
      txSettings,
    );
  }

  /**
   * Issue a Rebalancing Set using a specified ERC20 payment token. The payment token is used in ExchangeIssue
   * to acquire the base SetToken components and issue the base SetToken. The base SetToken is then used to
   * issue the Rebalancing SetToken. The payment token can be utilized as a component of the base SetToken.
   * All remaining tokens / change are flushed and returned to the user.
   * Ahead of calling this function, the user must approve their paymentToken to the transferProxy.
   *
   * @param  rebalancingSetAddress     Address of the rebalancing Set to issue
   * @param  rebalancingSetQuantity    Quantity of the rebalancing Set
   * @param  paymentTokenAddress       Address of the ERC20 token to pay with
   * @param  paymentTokenQuantity      Quantity of the payment token
   * @param  exchangeIssuanceParams    Struct containing data around the base Set issuance
   * @param  orderData                 Bytecode formatted data with exchange data for acquiring base set components
   * @param  keepChangeInVault         Boolean signifying whether excess base SetToken is transfered to the user 
   *                                     or left in the vault
   * @param  txOpts                    The options for executing the transaction
   */
  public async issueRebalancingSetWithERC20(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    paymentTokenAddress: Address,
    paymentTokenQuantity: BigNumber,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orderData: Bytes,
    keepChangeInVault: boolean,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetExchangeIssuanceModuleInstance =
      await this.contracts.loadRebalancingSetExchangeIssuanceModuleAsync(
        this.rebalancingSetExchangeIssuanceModule
      );

    return await rebalancingSetExchangeIssuanceModuleInstance.issueRebalancingSetWithERC20.sendTransactionAsync(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      paymentTokenAddress,
      paymentTokenQuantity,
      exchangeIssuanceParams,
      orderData,
      keepChangeInVault,
      txSettings,
    );
  }

  /**
   * Redeems a Rebalancing Set into the base Set. Then the base Set is redeemed, and its components
   * are exchanged for Wrapped Ether. The wrapped Ether is then unwrapped and attributed to the caller.
   *
   * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
   * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
   * @param  exchangeIssuanceData     Struct containing data around the base Set issuance
   * @param  orderData                Bytecode formatted data with exchange data for acquiring base set components
   * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transferred to the user 
   *                                     or left in the vault
   * @param  txOpts                    The options for executing the transaction
   */
  public async redeemRebalancingSetIntoEther(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orderData: Bytes,
    keepChangeInVault: boolean,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetExchangeIssuanceModuleInstance =
      await this.contracts.loadRebalancingSetExchangeIssuanceModuleAsync(
        this.rebalancingSetExchangeIssuanceModule
      );

    return await rebalancingSetExchangeIssuanceModuleInstance.redeemRebalancingSetIntoEther.sendTransactionAsync(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      exchangeIssuanceParams,
      orderData,
      keepChangeInVault,
      txSettings,
    );
  }

  /**
   * Redeems a Rebalancing Set into a specified ERC20 token. The Rebalancing Set is redeemed into the Base Set, and
   * Base Set components are traded for the ERC20 and sent to the caller.
   *
   * @param  rebalancingSetAddress     Address of the rebalancing Set
   * @param  rebalancingSetQuantity    Quantity of rebalancing Set to redeem
   * @param  outputTokenAddress        Address of the resulting ERC20 token sent to the user
   * @param  exchangeIssuanceParams    Struct containing data around the base Set issuance
   * @param  orderData                 Bytecode formatted data with exchange data for disposing base set components
   * @param  keepChangeInVault         Boolean signifying whether excess base SetToken is transfered to the user 
   *                                     or left in the vault
   * @param  txOpts                    The options for executing the transaction
   */
  public async redeemRebalancingSetIntoERC20(
    rebalancingSetAddress: Address,
    rebalancingSetQuantity: BigNumber,
    paymentTokenAddress: Address,
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orderData: Bytes,
    keepChangeInVault: boolean,
    txOpts?: Tx,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);
    const rebalancingSetExchangeIssuanceModuleInstance =
      await this.contracts.loadRebalancingSetExchangeIssuanceModuleAsync(
        this.rebalancingSetExchangeIssuanceModule
      );

    return await rebalancingSetExchangeIssuanceModuleInstance.redeemRebalancingSetIntoERC20.sendTransactionAsync(
      rebalancingSetAddress,
      rebalancingSetQuantity,
      paymentTokenAddress,
      exchangeIssuanceParams,
      orderData,
      keepChangeInVault,
      txSettings,
    );
  }
}
