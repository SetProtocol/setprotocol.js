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
import { Address, SetProtocolUtils } from 'set-protocol-utils';
import {
  StandardTokenMockContract,
  SetTokenContract,
  VaultContract,
} from 'set-protocol-contracts';

import { ZERO } from '../constants';
import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { CoreWrapper, ERC20Wrapper } from '../wrappers';
import {
  BigNumber,
  ether,
  extractNewSetTokenAddressFromLogs,
  generateTxOpts,
  getFormattedLogsFromTxHash
} from '../util';
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
  private erc20: ERC20Wrapper;
  private setTokenFactoryAddress: Address;

  /**
   * Instantiates a new FactoryAPI instance that contains methods for creating new Sets
   *
   * @param web3                      Web3.js Provider instance you would like the SetProtocol.js library
   *                                    to use for interacting with the Ethereum network.
   * @param core                      An instance of CoreWrapper to interact with the deployed Core contract
   * @param assertions                An instance of the Assertion library
   * @param setTokenFactoryAddress    Address of the SetTokenFactory associated with the deployed Core contract
   */
  constructor(web3: Web3, core: CoreWrapper, assertions: Assertions, setTokenFactoryAddress: Address) {
    this.web3 = web3;
    this.core = core;
    this.erc20 = new ERC20Wrapper(this.web3);
    this.assert = assertions;
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

  /**
   * Calculates the minimum allowable natural unit for a list of ERC20 component addresses
   * where the minimum natural unit allowed equal 10 ** (18 - minDecimal)
   *
   * @param componentAddresses    Component ERC20 addresses
   * @return                      The minimum value of the natural unit allowed by component decimals
   */
  public async calculateMinimumNaturalUnit(components: Address[]): Promise<BigNumber> {
    let minDecimal;
    try {
      const componentDecimalPromises = _.map(components, component =>
        this.erc20.decimals(component)
      );

      const decimals = await Promise.all(componentDecimalPromises);
      minDecimal = BigNumber.min(decimals);
    } catch (error) {
      // If any of the conponent addresses does not implement decimals(),
      // we assume the worst and set minDecimal to 0 so that minimum natural unit
      // will be 10^18.
      minDecimal = SetProtocolUtils.CONSTANTS.ZERO;
    }

    return new BigNumber(10 ** (18 - minDecimal.toNumber()));
  }

  public async calculateRequiredComponentUnits(
    componentPrices: BigNumber[],
    components: Address[],
    componentAllocation: BigNumber[],
    targetSetPrice: BigNumber,
  ): Promise<BigNumber[]> {
    this.assert.common.proportionsSumToOne(componentAllocation, coreAPIErrors.PROPORTIONS_DONT_ADD_UP_TO_1());
    this.assert.common.isEqualLength(
      componentPrices,
      components,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('componentPrices', 'components')
    );
    this.assert.common.isEqualLength(
      componentPrices,
      componentAllocation,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('componentPrices', 'componentAllocation')
    );

    const targetComponentValues = this.calculateTargetComponentValues(componentAllocation, targetSetPrice);

    // Calculate the target amount of tokens required by dividing the target component price
    // with the price of a component and then multiply by the token's base unit amount
    // (10 ** componentDecimal) to get it in base units.
    const componentAmountRequiredPromises = targetComponentValues.map(async(targetComponentValue, i) => {
      const componentDecimals: number = await this.getComponentDecimals(components[i]);

      const numComponentsRequired = targetComponentValue.div(componentPrices[i]);

      const standardComponentUnit = new BigNumber(10).pow(componentDecimals);

      return numComponentsRequired.mul(standardComponentUnit);
    });

    return Promise.all(componentAmountRequiredPromises);
  }

  public async calculateComponentUnitsForSet(
    naturalUnit: BigNumber,
    requiredComponentUnits: BigNumber[],
  ): Promise<BigNumber[]> {
    const componentUnits = requiredComponentUnits.map((amountRequired, i) => {
      return amountRequired.mul(naturalUnit).div(ether(1));
    });

    return componentUnits;
  }

  /* ============ Private Function ============ */
  private async getComponentDecimals(componentAddress: Address): Promise<number> {
    let componentDecimals: number;
    try {
      componentDecimals = (await this.erc20.decimals(componentAddress)).toNumber();
    } catch (err) {
      componentDecimals = 18;
    }

    return componentDecimals;
  }

  private calculateTargetComponentValues(
    componentAllocation: BigNumber[],
    targetSetPrice: BigNumber
  ): BigNumber[] {
    return componentAllocation.map(percentage => {
      return percentage.mul(targetSetPrice);
    });
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

    await Promise.all(
      components.map(async componentAddress => {
        this.assert.common.isValidString(componentAddress, coreAPIErrors.STRING_CANNOT_BE_EMPTY('component'));
        this.assert.schema.isValidAddress('componentAddress', componentAddress);

        await this.assert.erc20.implementsERC20(componentAddress);
      }),
    );

    const minNaturalUnit = await this.calculateMinimumNaturalUnit(components);

    this.assert.common.isGreaterOrEqualThan(
      naturalUnit,
      minNaturalUnit,
      coreAPIErrors.INVALID_NATURAL_UNIT(minNaturalUnit),
    );
  }
}
