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

"use strict";

import * as Web3 from "web3";
import * as _ from "lodash";
import { BigNumber } from "../util/bignumber";
import { Address, UInt, Token, Component, TransactionOpts } from "../types/common";

import { Assertions } from "../invariants";
import { estimateIssueRedeemGasCost } from "../util/set_token_utils";
import { CoreContract } from "../wrappers";

// APIs
import { ContractsAPI } from ".";

export const CoreAPIErrors = {
  COMPONENTS_AND_UNITS_EQUAL_LENGTHS: () =>
    "The components and units arrays need to be equal lengths",
  QUANTITY_NEEDS_TO_BE_NON_ZERO: (quantity: BigNumber) =>
    `The quantity ${quantity.toString()} inputted needs to be non-zero`,
  STRING_CANNOT_BE_EMPTY: (variable: string) => `The string ${variable} cannot be empty`,
};

const DEFAULT_GAS_PRICE: BigNumber = new BigNumber(6000000000); // 6 gwei

/**
 * @title CoreAPI
 * @author Set Protocol
 *
 * The Core API handles all functions on the Core SetProtocol smart contract.
 *
 */
export class CoreAPI {
  private provider: Web3;
  private assert: Assertions;
  private contracts: ContractsAPI;

  constructor(web3: Web3, contracts: ContractsAPI) {
    this.provider = web3;
    this.contracts = contracts;
    this.assert = new Assertions(this.provider);
  }

  /**
   * Create a new Set, specifying the components, units, name, symbol to use.
   *
   * @param  userAddress    Address of the user
   * @param  coreAddress    Address of the Core contract to use
   * @param  factoryAddress Set Token factory address of the token being created
   * @param  components     Component token addresses
   * @param  units          Units of corresponding token components
   * @param  naturalUnit    Supplied as the lowest common denominator for the Set
   * @param  name           User-supplied name for Set (i.e. "DEX Set")
   * @param  symbol         User-supplied symbol for Set (i.e. "DEX")
   * @return                a transaction hash to then later look up for the Set address
   */
  public async create(
    userAddress: string,
    coreAddress: string,
    factoryAddress: string,
    components: string[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
  ): Promise<string> {
    this.assert.schema.isValidAddress("factoryAddress", factoryAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.schema.isValidAddress("coreAddress", coreAddress);
    this.assert.common.isEqualLength(
      components,
      units,
      CoreAPIErrors.COMPONENTS_AND_UNITS_EQUAL_LENGTHS(),
    );
    this.assert.common.greaterThanZero(
      naturalUnit,
      CoreAPIErrors.QUANTITY_NEEDS_TO_BE_NON_ZERO(naturalUnit),
    );
    this.assert.common.isValidString(name, CoreAPIErrors.STRING_CANNOT_BE_EMPTY("name"));
    this.assert.common.isValidString(symbol, CoreAPIErrors.STRING_CANNOT_BE_EMPTY("symbol"));

    const coreInstance = await this.contracts.loadCoreAsync(coreAddress);

    const txHash = await coreInstance.create.sendTransactionAsync(
      factoryAddress,
      components,
      units,
      naturalUnit,
      name,
      symbol,
      { from: userAddress },
    );

    return txHash;

    /* Asserts */
    // assert that components are valid
    // component addresses exist as a parameter
    // component addresses map to valid ERC20 contracts
    // assert that units are valid
    // greater than zero
    // assert naturalUnit is valid
    // greater than zero
    // greater than greatest decimal amount

    /* Functionality */
    // invoke create() on core with given parameters
    // return txHash (transaction will have set address in it)
  }
}
