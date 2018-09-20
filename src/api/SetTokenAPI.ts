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
import { coreAPIErrors } from '../errors';
import { Assertions } from '../assertions';
import { ERC20Wrapper, SetTokenWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { Component, SetDetails } from '../types/common';

/**
 * @title SetTokenAPI
 * @author Set Protocol
 *
 * A library for interacting with SetToken contracts
 */
export class SetTokenAPI {
  private web3: Web3;
  private assert: Assertions;
  private setToken: SetTokenWrapper;
  private erc20: ERC20Wrapper;

  /**
   * Instantiates a new SetTokenAPI instance that contains methods for interacting with SetToken contracts
   *
   * @param web3    Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                   with the Ethereum network
   * @param assertions  An instance of the Assertion library
   */
  constructor(web3: Web3, assertions: Assertions) {
    this.web3 = web3;
    this.assert = assertions;

    this.setToken = new SetTokenWrapper(this.web3);
    this.erc20 = new ERC20Wrapper(this.web3);
  }

  /**
   * Fetches the address of the factory that created the Set
   *
   * @param  setAddress    Address of the Set
   * @return               Address of the factory that ceated the Set
   */
  public async getFactoryAsync(setAddress: Address): Promise<Address> {
    this.assert.schema.isValidAddress('setAddress', setAddress);

    return await this.setToken.factory(setAddress);
  }

  /**
   * Fetches the addresses of the component tokens that make up the Set
   *
   * @param  setAddress    Address of the Set
   * @return               An array of token addresses
   */
  public async getComponentsAsync(setAddress: Address): Promise<Address[]> {
    this.assert.schema.isValidAddress('setAddress', setAddress);

    return await this.setToken.getComponents(setAddress);
  }

  /**
   * Fetches the natural unit of the Set
   *
   * @param  setAddress    Address of the Set
   * @return               Natural unit of the Set
   */
  public async getNaturalUnitAsync(setAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress('setAddress', setAddress);

    return await this.setToken.naturalUnit(setAddress);
  }

  /**
   * Fetches units of each component token that make up the Set
   *
   * @param  setAddress    Address of the Set
   * @return               An array of units that make up the Set composition which correspond
   *                         to the component tokens in the Set
   */
  public async getUnitsAsync(setAddress: Address): Promise<BigNumber[]> {
    this.assert.schema.isValidAddress('setAddress', setAddress);

    return await this.setToken.getUnits(setAddress);
  }

  /**
   * Fetches details of a Set comprised of factory address, name, symbol, natural unit, component addresses,
   * and component units
   *
   * @param  setAddress    Address of the Set
   * @return               Object conforming to SetDetails interface
   */
  public async getDetails(setAddress: Address): Promise<SetDetails> {
    this.assert.schema.isValidAddress('setAddress', setAddress);

    const [factoryAddress, naturalUnit, componentAddresses, componentUnits, name, symbol] = await Promise.all([
      this.setToken.factory(setAddress),
      this.setToken.naturalUnit(setAddress),
      this.setToken.getComponents(setAddress),
      this.setToken.getUnits(setAddress),
      this.erc20.name(setAddress),
      this.erc20.symbol(setAddress),
    ]);

    const components: Component[] = componentAddresses.map(function(address, idx) {
      return { address, unit: componentUnits[idx] } as Component;
    });

    return {
      address: setAddress,
      factoryAddress,
      name,
      symbol,
      naturalUnit,
      components,
    } as SetDetails;
  }

  /**
   * Validates whether the quantity passed in is a multiple of a Set's natural unit
   *
   * @param  setAddress    Address of the Set
   * @param  quantity      Quantity to be checked
   * @return boolean       Boolean representing whether the Set is a multiple of the natural unit
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
