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
import Web3 from 'web3';
import { StandardTokenMockContract, SetTokenContract, VaultContract } from 'set-protocol-contracts';
import { SetProtocolUtils } from 'set-protocol-utils';

import { DEFAULT_REBALANCING_NATURAL_UNIT, E18, ONE_DAY_IN_SECONDS, UINT256, ZERO } from '../constants';
import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { CoreWrapper, ERC20Wrapper } from '../wrappers';
import {
  BigNumber,
  ether,
  calculatePercentDifference,
  extractNewSetTokenAddressFromLogs,
  generateTxOpts,
  getFormattedLogsFromTxHash,
} from '../util';
import { Address, SetProtocolConfig, SetUnits, Tx } from '../types/common';

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
  private rebalancingSetTokenFactoryAddress: Address;
  private setTokenFactoryAddress: Address;

  /**
   * Instantiates a new FactoryAPI instance that contains methods for creating new Sets
   *
   * @param web3                      Web3.js Provider instance you would like the SetProtocol.js library to use
   *                                    for interacting with the Ethereum network
   * @param core                      An instance of CoreWrapper to interact with the deployed Core contract
   * @param assertions                An instance of the Assertion library
   * @param config                    Object conforming to SetProtocolConfig interface with contract addresses
   */
  constructor(web3: Web3, core: CoreWrapper, assertions: Assertions, config: SetProtocolConfig) {
    this.web3 = web3;
    this.core = core;
    this.erc20 = new ERC20Wrapper(this.web3);
    this.assert = assertions;
    this.rebalancingSetTokenFactoryAddress = config.rebalancingSetTokenFactoryAddress;
    this.setTokenFactoryAddress = config.setTokenFactoryAddress;
  }

  /**
   * Calculates the minimum allowable natural unit for a list of ERC20 component addresses
   *
   * @param components        List of ERC20 token addresses to use for Set creation
   * @return                  Minimum natural unit allowed
   */
  public async calculateMinimumNaturalUnitAsync(components: Address[]): Promise<BigNumber> {
    let minimumDecimal;
    try {
      const decimals = await Promise.all(_.map(components, component => this.erc20.decimals(component)));
      minimumDecimal = BigNumber.min(decimals);
    } catch (error) {
      // If any of the conponent addresses does not implement decimals(),
      // we set minimumDecimal to 0 so that minimum natural unit will be 10 ** 18
      minimumDecimal = ZERO;
    }

    return this.calculateNaturalUnit(minimumDecimal);
  }

  /**
   * Helper for `calculateSetUnits` when a list of decimals is not available and needs to be fetched. Calculates unit
   * and naturalUnit inputs for `createSetAsync` for a given list of ERC20 token addreses, proportions of each, current
   * token prices, and target Set price
   *
   * @param components      List of ERC20 token addresses to use for Set creation
   * @param prices          List of current prices for the components in index order
   * @param proportions     Decimal-formatted allocations in index order. Must add up to 1
   * @param targetPrice     Target fiat-denominated price of a single natural unit of the Set
   * @param percentError    Allowable price error percentage of resulting Set price from the target price
   * @return                Object conforming to `SetUnits` containing a list of component units in index order and a
   *                          valid natural unit. These properties can be passed directly into `createSetAsync`
   */
  public async calculateSetUnitsAsync(
    components: Address[],
    prices: BigNumber[],
    proportions: BigNumber[],
    targetPrice: BigNumber,
    percentError: number = 10,
  ): Promise<SetUnits> {
    const decimals = await this.getComponentsDecimalsAsync(components);

    return this.calculateSetUnits(components, decimals, prices, proportions, targetPrice, percentError);
  }

  /**
   * Calculates unit and naturalUnit inputs for `createSetAsync` for a given list of ERC20 token addreses, their
   * decimals, proportions of each, current token prices, and target Set price
   *
   * @param components      List of ERC20 token addresses to use for Set creation
   * @param decimals        List of decimals for the components in index order
   * @param prices          List of current prices for the components in index order
   * @param proportions     Decimal-formatted allocations in index order. Must add up to 1
   * @param targetPrice     Target fiat-denominated price of a single natural unit of the Set
   * @param percentError    Allowable price error percentage of resulting Set price from the target price
   * @return                Object conforming to `SetUnits` containing a list of component units in index order and a
   *                          valid natural unit. These properties can be passed directly into `createSetAsync`
   */
  public calculateSetUnits(
    components: Address[],
    decimals: number[],
    prices: BigNumber[],
    proportions: BigNumber[],
    targetPrice: BigNumber,
    percentError: number = 10,
  ): SetUnits {
    this.assertCalculateCreateUnitInputs(components, prices, proportions);

    const requiredComponentUnits = this.calculateRequiredComponentUnits(
      components,
      decimals,
      prices,
      proportions,
      targetPrice,
    );

    const minimumUnitExponent = new BigNumber(BigNumber.min(requiredComponentUnits).e);
    const naturalUnitExponent = UINT256(18).sub(minimumUnitExponent);
    const derivedNaturalUnit = UINT256(10).pow(naturalUnitExponent.toNumber());

    const minimumDecimal = BigNumber.min(decimals);
    const minimumNaturalUnit = this.calculateNaturalUnit(minimumDecimal);

    let naturalUnit = BigNumber.max(minimumNaturalUnit, derivedNaturalUnit);
    let formattedComponentUnits: BigNumber[];
    let priorPercentError: BigNumber = E18; // Start with a large percentage figure
    let errorPercentage: BigNumber;

    // If the percentage error from the naturalUnit and units combination is greater
    // than the max allowable error, we attempt to improve the precision by increasing
    // the naturalUnit and recalculating the component units.
    while (true) {
      formattedComponentUnits = requiredComponentUnits.map(amountRequired => {
        return amountRequired
          .mul(naturalUnit)
          .div(ether(1))
          .ceil();
      });

      const impliedSetPrice = this.calculateSetPrice(formattedComponentUnits, naturalUnit, prices, decimals);
      errorPercentage = calculatePercentDifference(impliedSetPrice, targetPrice);

      // Only continue to experiment with improvements if the following conditions are met:
      // 1. The Percent error is still greater than the maximum allowable error
      // 2. Increasing the natural unit helps with improving precision
      const error = new BigNumber(percentError).div(100);
      if (errorPercentage.gt(error) && errorPercentage.lt(priorPercentError)) {
        naturalUnit = naturalUnit.mul(UINT256(10));
        priorPercentError = errorPercentage;
      } else {
        return {
          units: formattedComponentUnits,
          naturalUnit,
        };
      }
    }
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
   * @param  txOpts         Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return                Transaction hash
   */
  public async createSetAsync(
    components: Address[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertCreateSet(txOpts.from, this.setTokenFactoryAddress, components, units, naturalUnit, name, symbol);

    return await this.core.create(
      this.setTokenFactoryAddress,
      components,
      units,
      naturalUnit,
      name,
      symbol,
      '0x0',
      txOpts
    );
  }

  /**
   * Create a new Rebalancing token by passing in parameters denoting a Set to track, the manager, and various
   * rebalancing properties to facilitate rebalancing events
   *
   * Note: the return value is the transaction hash of the createRebalancingSetTokenAsync call, not the deployed Token
   * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the SetToken address
   *
   * @param  manager              Address of account to propose, rebalance, and settle the Rebalancing token
   * @param  initialSet           Address of the Set the Rebalancing token is initially tracking
   * @param  initialUnitShares    Ratio between balance of this Rebalancing token and the currently tracked Set
   * @param  proposalPeriod       Duration after a manager proposes a new Set to rebalance into when users who wish to
   *                                pull out may redeem their balance of the RebalancingSetToken for balance of the Set
   *                                denominated in seconds
   * @param  rebalanceInterval    Duration after a rebalance is completed when the manager cannot initiate a new
   *                                Rebalance event
   * @param  entranceFee          Entrance fee as a percentage of initialSet when minting the Rebalancing Set
   * @param  rebalanceFee         Rebalance fee as a percentage of the nextSet when rebalance is settled
   * @param  name                 Name for RebalancingSet, i.e. "Top 10"
   * @param  symbol               Symbol for Set, i.e. "TOP10"
   * @param  txOpts               Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return                      Transaction hash
   */
  public async createRebalancingSetTokenAsync(
    manager: Address,
    initialSet: Address,
    initialUnitShares: BigNumber,
    proposalPeriod: BigNumber,
    rebalanceInterval: BigNumber,
    entranceFee: BigNumber,
    rebalanceFee: BigNumber,
    name: string,
    symbol: string,
    txOpts: Tx,
  ): Promise<string> {
    await this.assertCreateRebalancingSet(
      txOpts.from,
      this.setTokenFactoryAddress,
      initialSet,
      initialUnitShares,
      proposalPeriod,
      rebalanceInterval,
      name,
      symbol,
    );

    const callData = SetProtocolUtils.generateRebalancingSetTokenCallData(
      manager,
      proposalPeriod,
      rebalanceInterval,
      entranceFee,
      rebalanceFee,
    );

    return await this.core.create(
      this.rebalancingSetTokenFactoryAddress,
      [initialSet],
      [initialUnitShares],
      DEFAULT_REBALANCING_NATURAL_UNIT,
      name,
      symbol,
      callData,
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

  /* ============ Private Function ============ */

  /**
   * Fetch the component decimals from the chain
   *
   * @param componentAddresses    List of ERC20 token addresses
   * @return                      List of component decimals
   */
  private async getComponentsDecimalsAsync(componentAddresses: Address[]): Promise<number[]> {
    const componentDecimalPromises = _.map(componentAddresses, async componentAddress => {
      const componentDecimals: number = await this.getComponentDecimals(componentAddress);

      return componentDecimals;
    });

    return Promise.all(componentDecimalPromises);
  }

  /**
   * Fetch the decimals for one ERC20 token
   *
   * @param componentAddress    ERC20 token addresses
   * @return                    Token decimals
   */
  private async getComponentDecimals(componentAddress: Address): Promise<number> {
    let componentDecimals: number;
    try {
      componentDecimals = (await this.erc20.decimals(componentAddress)).toNumber();
    } catch (err) {
      componentDecimals = 18;
    }

    return componentDecimals;
  }

  /**
   * Calculates the target amount of tokens required for a Set with a target price
   *
   * @param components     List of ERC20 token addresses to use for Set creation
   * @param decimals       List of decimals for the components in index order
   * @param prices         List of current prices for the components in index order
   * @param proportions    Decimal-formatted allocations in index order. Must add up to 1
   * @param targetPrice    Target fiat-denominated price of a single natural unit of the Set
   * @return               Returns array of BigNumbers representing the minimum required units
   */
  private calculateRequiredComponentUnits(
    components: Address[],
    decimals: number[],
    prices: BigNumber[],
    proportions: BigNumber[],
    targetPrice: BigNumber,
  ): BigNumber[] {
    const targetComponentValues = proportions.map(decimalAllocation => {
      return decimalAllocation.mul(targetPrice);
    });

    // Dividing the target component price with the price of a component and then multiply by
    // the token's base unit amount (10 ** componentDecimal) to get it in base units.
    return _.map(targetComponentValues, (targetComponentValue, i) => {
      const componentDecimals: number = decimals[i];
      const numComponentsRequired = targetComponentValue.div(prices[i]);
      const standardComponentUnit = new BigNumber(10).pow(componentDecimals);

      return numComponentsRequired.mul(standardComponentUnit);
    });
  }

  /**
   * Calculate a Set price for given component and Set properties. This is used to verify the total Set price
   * when assigning a natural unit to a list of components
   *
   * @param componentUnits    List of ERC20 token addresses to use for Set creation in index order
   * @param naturalUnit       Proposed natural unit for the component units
   * @param prices            Current price of the component tokens in index order
   * @param targetPrice       Target fiat-denominated price of a single natural unit of the Set
   * @return                  Returns the calculcated price from all of the component and Set data
   */
  private calculateSetPrice(
    componentUnits: BigNumber[],
    naturalUnit: BigNumber,
    prices: BigNumber[],
    decimals: number[],
  ): BigNumber {
    const quantity = E18.div(naturalUnit);
    return _.reduce(componentUnits, (sum, componentUnit, index) => {
      const componentPrice = componentUnit.mul(quantity).mul(prices[index]).div(10 ** decimals[index]);
      return sum.add(componentPrice);
    }, ZERO);
  }

  /**
   * Calculates the natural unit from the smallest decimal in a list of token component decimals
   *
   * @param decimal           Smallest decimal for a list of component token decimals
   * @return                  Natural unit
   */
  public calculateNaturalUnit(decimal: BigNumber): BigNumber {
    return new BigNumber(10 ** (18 - decimal.toNumber()));
  }

  /* ============ Private Assertions ============ */

  private assertCalculateCreateUnitInputs(components: Address[], prices: BigNumber[], proportions: BigNumber[]) {
    this.assert.common.verifyProportionsSumToOne(proportions, coreAPIErrors.PROPORTIONS_DONT_ADD_UP_TO_1());
    this.assert.common.isEqualLength(
      prices,
      components,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('prices', 'components')
    );
    this.assert.common.isEqualLength(
      prices,
      proportions,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('prices', 'proportions')
    );
  }

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

    const minNaturalUnit = await this.calculateMinimumNaturalUnitAsync(components);

    this.assert.common.isGreaterOrEqualThan(
      naturalUnit,
      minNaturalUnit,
      coreAPIErrors.INVALID_NATURAL_UNIT(minNaturalUnit),
    );
  }

  private async assertCreateRebalancingSet(
    userAddress: Address,
    factoryAddress: Address,
    initialSetAddress: Address,
    initialUnitShares: BigNumber,
    proposalPeriod: BigNumber,
    rebalanceInterval: BigNumber,
    name: string,
    symbol: string,
  ) {
    this.assert.schema.isValidAddress('txOpts.from', userAddress);
    this.assert.schema.isValidAddress('factoryAddress', factoryAddress);
    this.assert.schema.isValidAddress('initialSet', initialSetAddress);
    this.assert.common.isValidString(name, coreAPIErrors.STRING_CANNOT_BE_EMPTY('name'));
    this.assert.common.isValidString(symbol, coreAPIErrors.STRING_CANNOT_BE_EMPTY('symbol'));
    this.assert.common.greaterThanZero(initialUnitShares,
      `Parameter initialUnitShares: ${initialUnitShares} must be greater than 0.`);

    await this.assert.setToken.implementsSetToken(initialSetAddress);
  }
}
