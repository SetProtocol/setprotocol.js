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

import { StrategyContractWrapper } from './StrategyContractWrapper';
import { BigNumber } from '../../util';
import { Address } from '../../types/common';

/**
 * @title  OracleProxyWrapper
 * @author Set Protocol
 *
 * Wrapper for interacting with OraclProxy functions
 *
 */
export class OracleProxyWrapper {
  private web3: Web3;
  private contracts: StrategyContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new StrategyContractWrapper(this.web3);
  }

  /**
   * Get the oracle the OracleProxy is currently getting prices from
   *
   * @param  oracleProxyAddress           Address of the rebalancing manager contract
   * @return                              Address supplying prices to OracleProxy
   */
  public async oracleInstance(
    oracleProxyAddress: Address
  ): Promise<Address> {
    const oracleProxyInstance = await this.contracts.loadOracleProxyContract(oracleProxyAddress);

    return await oracleProxyInstance.oracleInstance.callAsync();
  }

  /**
   * Get the current price from the OracleProxy
   *
   * @param  oracleProxyAddress           Address of the rebalancing manager contract
   * @return                              Current price given by OracleProxy
   */
  public async read(
    oracleProxyAddress: Address
  ): Promise<BigNumber> {
    const oracleProxyInstance = await this.contracts.loadOracleProxyContract(oracleProxyAddress);

    return await oracleProxyInstance.read.callAsync();
  }
}