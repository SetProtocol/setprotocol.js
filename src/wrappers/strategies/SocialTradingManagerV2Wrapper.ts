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

import { SocialTradingManagerWrapper } from './SocialTradingManagerWrapper';
import { generateTxOpts } from '../../util';
import { Address, Tx } from '../../types/common';

/**
 * @title  SocialTradingManagerWrapper
 * @author Set Protocol
 *
 * The SocialTradingManagerV2Wrapper extends SocialTradingManagerWrapper and adds fee setting functions.
 *
 */
export class SocialTradingManagerV2Wrapper extends SocialTradingManagerWrapper {
  public constructor(web3: Web3) {
    super(web3);
  }

  /**
   * Calls SocialTradingManager's adjustFee function. Allows trader to change performance fees.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  tradingPool                    Address of tradingPool being updated
   * @param  newFeeCallData                 New fee call data
   * @return                                The hash of the resulting transaction.
   */
  public async adjustFee(
    manager: Address,
    tradingPool: Address,
    newFeeCallData: string,
    txOpts?: Tx,
  ): Promise<string> {
    const socialTradingManagerInstance = await this.contracts.loadSocialTradingManagerV2ContractAsync(manager);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await socialTradingManagerInstance.adjustFee.sendTransactionAsync(
      tradingPool,
      newFeeCallData,
      txOptions
    );
  }

  /**
   * Calls SocialTradingManager's adjustFee function. Allows trader to change performance fees.
   *
   * @param  manager                        Address of the social trading manager contract
   * @param  tradingPool                    Address of tradingPool being updated
   * @param  upgradeHash                    Hash of upgrade to be removed
   * @return                                The hash of the resulting transaction.
   */
  public async removeRegisteredUpgrade(
    manager: Address,
    tradingPool: Address,
    upgradeHash: string,
    txOpts?: Tx,
  ): Promise<string> {
    const socialTradingManagerInstance = await this.contracts.loadSocialTradingManagerV2ContractAsync(manager);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await socialTradingManagerInstance.removeRegisteredUpgrade.sendTransactionAsync(
      tradingPool,
      upgradeHash,
      txOptions
    );
  }
}