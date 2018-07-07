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
import { DEFAULT_GAS_PRICE } from "../constants";
import { CoreAPIErrors } from "../errors";
import { Assertions } from "../assertions";
import { Address, Component, Token, TransactionOpts, UInt } from "../types/common";
import { BigNumber, estimateIssueRedeemGasCost } from "../util";
import { CoreContract } from "../contracts";

/**
 * @title  SetTokenAPI
 * @author Set Protocol
 *
 * The Set Token API handles all functions on the Set Token smart contract.
 *
 */
export class SetTokenAPI {
  private provider: Web3;
  private assert: Assertions;
  private contracts: ContractsAPI;

  constructor(web3: Web3) {
    this.provider = web3;
    this.contracts = new ContractsAPI(this.provider);
    this.assert = new Assertions();
  }

  /**
   * Gets balance of a user's Sets
   *
   * @param  setAddress  Address of the Set
   * @param  userAddress Address of the user
   * @return             The balance of the user's Set
   */
  public async getBalanceOf(setAddress: string, userAddress: string): number {
    this.assert.schema.isValidAddress("userAddress", userAddress);
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    return await setTokenInstance.balanceOf(userAddress);
  }

  /**
   * Gets component tokens that make up the Set
   *
   * @param  setAddress Address of the Set
   * @return            An array of addresses
   */
  public async getComponents(setAddress: string): string[] {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    return await setTokenInstance.getComponents();
  }

  /**
   * Gets name of the Set
   *
   * @param  setAddress Address of the Set
   * @return            A string of the Set's name
   */
  public async getName(setAddress: string): string {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    return await setTokenInstance.name();
  }

  /**
   * Gets natural unit of the Set
   *
   * @param  setAddress Address of the Set
   * @return            The natural unit of the Set
   */
  public async getNaturalUnit(setAddress: string): number {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    return await setTokenInstance.naturalUnit();
  }

  /**
   * Gets symbol of the Set
   *
   * @param  setAddress Address of the Set
   * @return            A string of the Set's symbol
   */
  public async getSymbol(setAddress: string): string {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    return await setTokenInstance.symbol();
  }

  /**
   * Gets total supply of the Set
   *
   * @param  setAddress Address of the Set
   * @return            The total supply of the Set
   */
  public async getTotalSupply(setAddress: string): number {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    return await setTokenInstance.totalSupply();
  }

  /**
   * Gets units of each component token that make up the Set
   *
   * @param  setAddress Address of the Set
   * @return            An array of units that make up the Set composition which
   *                    correspond to the component tokens in the Set
   */
  public async getUnits(setAddress: string): number[] {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    return await setTokenInstance.getUnits();
  }
}
