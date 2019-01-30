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

import {
  OwnableContract,
} from 'set-protocol-contracts';

import { ContractWrapper } from '.';
import { BigNumber } from '../util';
import { Address, Bytes } from '../types/common';

/**
 * @title  TimeLockUpgradeWrapper
 * @author Set Protocol
 *
 * The TimeLockUpgradeWrapper handles all functions and states related to authorizable contracts
 *
 */
export class TimeLockUpgradeWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Fetches the current timeLock period
   *
   * @param  timeLockUpgradeContract Address of the contract
   * @return                      A list of authorized addresses
   */
  public async timeLockPeriod(timeLockUpgradeContract: Address): Promise<BigNumber> {
    const timeLockUpgradeInstance = await this.contracts.loadTimeLockUpgradeAsync(
      timeLockUpgradeContract
    );

    return await timeLockUpgradeInstance.timeLockPeriod.callAsync();
  }

  /**
   * Fetches the timestamp in which a pending timelock upgrade has been initiated
   *
   * @param  timeLockUpgradeContract     Address of the contract
   * @param  timeLockUpgradeHash         Hash of the call data
   * @return                             Timestamp of the intiation of the upgrade
   */
  public async timeLockedUpgrades(timeLockUpgradeContract: Address, timeLockUpgradeHash: Bytes): Promise<BigNumber> {
    const timeLockUpgradeInstance = await this.contracts.loadTimeLockUpgradeAsync(
      timeLockUpgradeContract
    );

    return await timeLockUpgradeInstance.timeLockedUpgrades.callAsync(timeLockUpgradeHash);
  }
}
