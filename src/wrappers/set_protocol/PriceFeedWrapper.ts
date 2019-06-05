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

import Web3 from 'web3';

import { ContractWrapper } from '.';
import { Address } from '../../types/common';
import { Bytes } from 'set-protocol-utils';

/**
 * @title  PriceFeedWrapper
 * @author Set Protocol
 *
 * The PriceFeedWrapper handles all functions on the Medianzer and PriceFeed smart contracts.
 *
 */
export class PriceFeedWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Fetch current price on the medianizer
   *
   * @return            Hex representation of the current price on the medianizer
   */
  public async read(medianizerAddress: Address): Promise<Bytes> {
    const medianizerContract = await this.contracts.loadMedianizerContract(medianizerAddress);

    return await medianizerContract.read.callAsync();
  }
}
