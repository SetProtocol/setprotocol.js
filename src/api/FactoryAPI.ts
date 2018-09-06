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
import { StandardTokenMockContract, SetTokenContract, VaultContract } from 'set-protocol-contracts';

import { ZERO } from '../constants';
import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { CoreWrapper } from '../wrappers';
import { BigNumber, extractNewSetTokenAddressFromLogs, generateTxOpts, getFormattedLogsFromTxHash } from '../util';
import { TxData } from '../types/common';

/**
 * @title FactoryAPI
 * @author Set Protocol
 *
 * A library for deploying new Set contracts
 */
export class FactoryAPI {
  private web3: Web3;
  private assert: Assertions;
  private core: CoreWrapper;
  private setTokenFactoryAddress: Address;

  /**
   * Instantiates a new FactoryAPI instance that contains methods for creating new Sets
   *
   * @param web3                      Web3.js Provider instance you would like the SetProtocol.js library
   *                                    to use for interacting with the Ethereum network.
   * @param core                      An instance of CoreWrapper to interact with the deployed Core contract
   * @param setTokenFactoryAddress    Address of the SetTokenFactory associated with the deployed Core contract
   */
  constructor(web3: Web3 = undefined, core: CoreWrapper = undefined, setTokenFactoryAddress: Address) {
    this.web3 = web3;
    this.core = core;
    this.assert = new Assertions(this.web3);
    this.setTokenFactoryAddress = setTokenFactoryAddress;
  }

  /**
   * Create a new Set by passing in parameters denoting component token addresses, quantities, natural
   * unit, and ERC20 properties
   *
   * Note: the return value is the transaction hash of the createSetAsync call, not the deployed SetToken
   * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the SetToken address
   *
   * @param  components     Component ERC20 token addresses
   * @param  units          Units of each component in Set paired in index order
   * @param  naturalUnit    Lowest common denominator for the Set
   * @param  name           Name for Set, i.e. "DEX Set"
   * @param  symbol         Symbol for Set, i.e. "DEX"
   * @param  txOpts         Transaction options object conforming to TxData with signer, gas, and gasPrice data
   * @return                Transaction hash
   */
  public async createSetAsync(
    components: Address[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
    txOpts: TxData,
  ): Promise<string> {
    await this.assertCreateSet(txOpts.from, this.setTokenFactoryAddress, components, units, naturalUnit, name, symbol);

    return await this.core.create(
      this.setTokenFactoryAddress,
      components,
      units,
      naturalUnit,
      name,
      symbol,
      '',
      txOpts
    );
  }

  /**
   * Fetch a Set Token address from a createSetAsync transaction hash
   *
   * @param  txHash    Transaction hash of the createSetAsync transaction
   * @return           Address of the newly created Set
   */
  public async getSetAddressFromCreateTxHash(txHash: string): Promise<Address> {
    this.assert.schema.isValidBytes32('txHash', txHash);
    const transactionLogs = await getFormattedLogsFromTxHash(this.web3, txHash);

    return extractNewSetTokenAddressFromLogs(transactionLogs);
  }

  /* ============ Private Assertions ============ */

  private async assertCreateSet(
    userAddress: Address,
    factoryAddress: Address,
    components: Address[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
  ) {
    this.assert.schema.isValidAddress('txOpts.from', userAddress);
    this.assert.schema.isValidAddress('factoryAddress', factoryAddress);
    this.assert.common.isEqualLength(components, units, coreAPIErrors.ARRAYS_EQUAL_LENGTHS('components', 'units'));
    this.assert.common.greaterThanZero(naturalUnit, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(naturalUnit));
    this.assert.common.isValidString(name, coreAPIErrors.STRING_CANNOT_BE_EMPTY('name'));
    this.assert.common.isValidString(symbol, coreAPIErrors.STRING_CANNOT_BE_EMPTY('symbol'));
    _.each(units, unit => {
      this.assert.common.greaterThanZero(unit, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(unit));
    });

    let minDecimals = new BigNumber(18);
    let tokenDecimals;
    await Promise.all(
      components.map(async componentAddress => {
        this.assert.common.isValidString(componentAddress, coreAPIErrors.STRING_CANNOT_BE_EMPTY('component'));
        this.assert.schema.isValidAddress('componentAddress', componentAddress);

        const tokenContract = await StandardTokenMockContract.at(componentAddress, this.web3, {});
        try {
          tokenDecimals = await tokenContract.decimals.callAsync();
          if (tokenDecimals.lt(minDecimals)) {
            minDecimals = tokenDecimals;
          }
        } catch (err) {
          minDecimals = ZERO;
        }

        await this.assert.erc20.implementsERC20(componentAddress);
      }),
    );

    this.assert.core.validateNaturalUnit(naturalUnit, minDecimals, coreAPIErrors.INVALID_NATURAL_UNIT());
  }
}
