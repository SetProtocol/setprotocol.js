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
import * as Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import { SetTokenContract, VaultContract } from 'set-protocol-contracts';

import { ZERO } from '../constants';
import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { SetTokenWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { TxData, TxDataWithFrom } from '../types/common';

/**
 * @title SetTokenAPI
 * @author Set Protocol
 *
 * A library for interacting with set tokens
 */
export class SetTokenAPI {
  private web3: Web3;
  private assert: Assertions;
  private setToken: SetTokenWrapper;

  /**
   * Instantiates a new IssuanceAPI instance that contains methods for transferring balances in the vault.
   *
   * @param web3                  The Web3.js Provider instance you would like the SetProtocol.js library
   *                              to use for interacting with the Ethereum network.
   * @param core                  The address of the Set Core contract
   */
  constructor(web3: Web3 = undefined) {
    this.web3 = web3;
    this.assert = new Assertions(this.web3);

    this.setToken = new SetTokenWrapper(web3);
  }

  /**
   * Gets the Set's origin factory
   *
   * @param  setAddress Address of the Set
   * @return            The factory address
   */
  public async getFactoryAsync(setAddress: Address): Promise<Address> {
    return await this.setToken.factory(setAddress);
  }

  /**
   * Gets component tokens that make up the Set
   *
   * @param  setAddress Address of the Set
   * @return            An array of addresses
   */
  public async getComponentsAsync(setAddress: Address): Promise<Address[]> {
    return await this.setToken.getComponents(setAddress);
  }

  /**
   * Gets natural unit of the Set
   *
   * @param  setAddress Address of the Set
   * @return            The natural unit of the Set
   */
  public async getNaturalUnitAsync(setAddress: Address): Promise<BigNumber> {
    return await this.setToken.naturalUnit(setAddress);
  }

  /**
   * Gets units of each component token that make up the Set
   *
   * @param  setAddress Address of the Set
   * @return            An array of units that make up the Set composition which
   *                    correspond to the component tokens in the Set
   */
  public async getUnitsAsync(setAddress: Address): Promise<BigNumber[]> {
    return await this.setToken.getUnits(setAddress);
  }

  /**
   * Returns whether the quantity passed in is a multiple of a Set's natural unit
   *
   * @param  setAddress Address of the Set
   * @param  quantity   Quantity to be checked
   * @return boolean    A boolean representing whether the Set is a multiple of the natural Unit
   *
   */
  public async isMultipleOfNaturalUnitAsync(setAddress: Address, quantity: BigNumber): Promise<boolean> {
    this.assertIsMultipleOfNaturalUnitAsync(setAddress, quantity);

    const naturalUnit = await this.setToken.naturalUnit(setAddress);
    return quantity.mod(naturalUnit).eq(ZERO);
  }

  /* ============ Private Assertions ============ */

  private async assertIsMultipleOfNaturalUnitAsync(setAddress: Address, quantity: BigNumber) {
    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.common.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
  }
}
