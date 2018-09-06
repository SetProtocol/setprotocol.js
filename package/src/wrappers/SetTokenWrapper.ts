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

import * as Web3 from 'web3';
import { Address } from 'set-protocol-utils';

import { ContractWrapper } from '.';
import { BigNumber } from '../util';
import { ZERO } from '../constants';
import { coreAPIErrors } from '../errors';

/**
 * @title  SetTokenWrapper
 * @author Set Protocol
 *
 * The Set Token API handles all functions on the Set Token smart contract.
 *
 */
export class SetTokenWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Gets the Set's origin factory
   *
   * @param  setAddress Address of the Set
   * @return            The factory address
   */
  public async factory(setAddress: Address): Promise<Address> {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);

    return await setTokenInstance.factory.callAsync();
  }

  /**
   * Gets component tokens that make up the Set
   *
   * @param  setAddress Address of the Set
   * @return            An array of addresses
   */
  public async getComponents(setAddress: Address): Promise<Address[]> {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);

    return await setTokenInstance.getComponents.callAsync();
  }

  /**
   * Gets natural unit of the Set
   *
   * @param  setAddress Address of the Set
   * @return            The natural unit of the Set
   */
  public async naturalUnit(setAddress: Address): Promise<BigNumber> {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);

    return await setTokenInstance.naturalUnit.callAsync();
  }

  /**
   * Gets units of each component token that make up the Set
   *
   * @param  setAddress Address of the Set
   * @return            An array of units that make up the Set composition which
   *                    correspond to the component tokens in the Set
   */
  public async getUnits(setAddress: Address): Promise<BigNumber[]> {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);

    return await setTokenInstance.getUnits.callAsync();
  }
}
