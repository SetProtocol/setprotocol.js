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
import { Address } from '../../types/common';

/**
 * @title  WhitelistWrapper
 * @author Set Protocol
 *
 * The WhitelistWrapper handles all functions and states related to authorizable contracts
 *
 */
export class WhitelistWrapper {
  private web3: Web3;
  private contracts: ProtocolContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ProtocolContractWrapper(this.web3);
  }

  /**
   * Fetches the valid addresses in the whitelist contract
   *
   * @param  whitelistContract    Address of the contract
   * @return                      A list of whitelisted addresses
   */
  public async validAddresses(whitelistContract: Address): Promise<Address[]> {
    const whitelistInstance = await this.contracts.loadWhitelistAsync(
      whitelistContract
    );

    return await whitelistInstance.validAddresses.callAsync();
  }
}
