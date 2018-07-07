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

import { ContractsAPI } from ".";
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT, ZERO } from "../constants";
import { coreAPIErrors } from "../errors";
import { Assertions } from "../assertions";
import { Address, Component, Token, TransactionOpts, UInt } from "../types/common";
import { BigNumber, estimateIssueRedeemGasCost } from "../util";
import { CoreContract, DetailedERC20Contract } from "../contracts";

/**
 * @title CoreAPI
 * @author Set Protocol
 *
 * The Core API handles all functions on the Core SetProtocol smart contract.
 *
 */
export class CoreAPI {
  private provider: Web3;
  private coreAddress: string;
  private assert: Assertions;
  private contracts: ContractsAPI;

  constructor(web3: Web3, coreAddress: string) {
    this.provider = web3;
    this.coreAddress = coreAddress;
    this.contracts = new ContractsAPI(this.provider);
    this.assert = new Assertions(this.provider);
  }

  /**
   * Create a new Set, specifying the components, units, name, symbol to use.
   *
   * @param  userAddress    Address of the user
   * @param  factoryAddress Set Token factory address of the token being created
   * @param  components     Component token addresses
   * @param  units          Units of corresponding token components
   * @param  naturalUnit    Supplied as the lowest common denominator for the Set
   * @param  name           User-supplied name for Set (i.e. "DEX Set")
   * @param  symbol         User-supplied symbol for Set (i.e. "DEX")
   * @param  txOpts         The options for executing the transaction
   * @return                a transaction hash to then later look up for the Set address
   */
  public async create(
    userAddress: string,
    factoryAddress: string,
    components: string[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("factoryAddress", factoryAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.schema.isValidAddress("coreAddress", this.coreAddress);
    this.assert.common.isEqualLength(
      components,
      units,
      coreAPIErrors.COMPONENTS_AND_UNITS_EQUAL_LENGTHS(),
    );
    this.assert.common.greaterThanZero(
      naturalUnit,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_NON_ZERO(naturalUnit),
    );
    this.assert.common.isValidString(name, coreAPIErrors.STRING_CANNOT_BE_EMPTY("name"));
    this.assert.common.isValidString(symbol, coreAPIErrors.STRING_CANNOT_BE_EMPTY("symbol"));

    let minDecimals = new BigNumber(18);
    let tokenDecimals;
    await Promise.all(
      components.map(async componentAddress => {
        this.assert.common.isValidString(
          componentAddress,
          coreAPIErrors.STRING_CANNOT_BE_EMPTY("component"),
        );
        this.assert.schema.isValidAddress("componentAddress", componentAddress);

        const tokenContract = await DetailedERC20Contract.at(componentAddress, this.provider, {});

        try {
          tokenDecimals = await tokenContract.decimals.callAsync();
          if (tokenDecimals.lt(minDecimals)) {
            minDecimals = tokenDecimals;
          }
        } catch (err) {
          minDecimals = ZERO;
        }

        await this.assert.erc20.implementsERC20(tokenContract);
      }),
    );

    this.assert.core.validateNaturalUnit(
      naturalUnit,
      minDecimals,
      coreAPIErrors.INVALID_NATURAL_UNIT(),
    );

    _.each(units, unit => {
      this.assert.common.greaterThanZero(unit, coreAPIErrors.QUANTITY_NEEDS_TO_BE_NON_ZERO(unit));
    });

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txSettings = Object.assign(
      { from: userAddress, gas: DEFAULT_GAS_LIMIT, gasPrice: DEFAULT_GAS_PRICE },
      txOpts,
    );
    const txHash = await coreInstance.create.sendTransactionAsync(
      factoryAddress,
      components,
      units,
      naturalUnit,
      name,
      symbol,
      txSettings,
    );

    return txHash;
  }
}
