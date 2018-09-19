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

import { ERC20Assertions } from './ERC20Assertions';
import { SetTokenContract, DetailedERC20Contract } from 'set-protocol-contracts';
import { coreAPIErrors, setTokenAssertionsErrors, erc20AssertionErrors } from '../errors';
import { BigNumber } from '../util';
import { ZERO } from '../constants';

export class SetTokenAssertions {
  private web3: Web3;
  private erc20Assertions: ERC20Assertions;

  constructor(web3: Web3) {
    this.web3 = web3;
    this.erc20Assertions = new ERC20Assertions(this.web3);
  }

  /**
   * Throws if the given candidateContract does not respond to some methods from the Set Token interface.
   *
   * @param  setTokenAddress  A Set Token contract address to check
   * @return                  Void Promise
   */
  public async implementsSetToken(setTokenAddress: Address): Promise<void> {
    const setTokenInstance = await SetTokenContract.at(setTokenAddress, this.web3, {});

    try {
      await setTokenInstance.name.callAsync();
      await setTokenInstance.totalSupply.callAsync();
      await setTokenInstance.decimals.callAsync();
      await setTokenInstance.naturalUnit.callAsync();
      await setTokenInstance.symbol.callAsync();
      await setTokenInstance.getComponents.callAsync();
      await setTokenInstance.getUnits.callAsync();
    } catch (error) {
      throw new Error(setTokenAssertionsErrors.IS_NOT_A_VALID_SET(setTokenAddress));
    }
  }

  /**
   * Throws if the given user doesn't have a sufficient balance for a component token in a Set
   *
   * @param  setTokenAddress  The address of the Set Token contract
   * @param  ownerAddress     The address of the owner
   * @param  quantity         Amount of a Set in base units
   * @return                  Void Promise
   */
  public async hasSufficientBalances(
    setTokenAddress: Address,
    ownerAddress: Address,
    quantity: BigNumber,
  ): Promise<void> {
    const setTokenInstance = await SetTokenContract.at(setTokenAddress, this.web3, {});

    const components: Address[] = await setTokenInstance.getComponents.callAsync();
    const units = await setTokenInstance.getUnits.callAsync();
    const naturalUnit = await setTokenInstance.naturalUnit.callAsync();

    // Create component ERC20 token instances
    const componentInstancePromises = _.map(
      components,
      async component =>
        await DetailedERC20Contract.at(component, this.web3, { from: ownerAddress }),
    );
    const componentInstances = await Promise.all(componentInstancePromises);

    // Assert that user has sufficient balance for each component token
    const userHasSufficientBalancePromises = _.map(
      componentInstances,
      async (componentInstance, index) => {
        const requiredBalance = units[index].div(naturalUnit).times(quantity);
        await this.erc20Assertions.hasSufficientBalanceAsync(
          componentInstance.address,
          ownerAddress,
          requiredBalance,
        );
      },
    );
    await Promise.all(userHasSufficientBalancePromises);
  }

  /**
   * Throws if the given user doesn't have a sufficient allowance for a component token in a Set
   *
   * @param  setTokenAddress  The address of the Set Token contract
   * @param  ownerAddress     The address of the owner
   * @param  quantity         Amount of a Set in base units
   * @return                  Void Promise
   */
  public async hasSufficientAllowances(
    setTokenAddress: Address,
    ownerAddress: Address,
    spenderAddress: Address,
    quantity: BigNumber,
  ): Promise<void> {
    const setTokenInstance = await SetTokenContract.at(setTokenAddress, this.web3, {});

    const components = await setTokenInstance.getComponents.callAsync();
    const units = await setTokenInstance.getUnits.callAsync();
    const naturalUnit = await setTokenInstance.naturalUnit.callAsync();

    // Create component ERC20 token instances
    const componentInstancePromises = _.map(
      components,
      async component =>
        await DetailedERC20Contract.at(component, this.web3, { from: ownerAddress }),
    );
    const componentInstances = await Promise.all(componentInstancePromises);

    // Assert that user has sufficient allowances for each component token
    const userHasSufficientAllowancePromises = _.map(
      componentInstances,
      async (componentInstance, index) => {
        const requiredBalance = units[index].div(naturalUnit).times(quantity);
        return await this.erc20Assertions.hasSufficientAllowanceAsync(
          componentInstance.address,
          ownerAddress,
          spenderAddress,
          requiredBalance,
        );
      },
    );
    await Promise.all(userHasSufficientAllowancePromises);
  }

  public async isMultipleOfNaturalUnit(
    setTokenAddress: Address,
    quantity: BigNumber,
    quantityType: string,
  ): Promise<void> {
    const setTokenInstance = await SetTokenContract.at(setTokenAddress, this.web3, {});

    const naturalUnit = await setTokenInstance.naturalUnit.callAsync();

    if (!quantity.mod(naturalUnit).eq(ZERO)) {
      throw new Error(coreAPIErrors.QUANTITY_NEEDS_TO_BE_MULTIPLE_OF_NATURAL_UNIT(quantityType));
    }
  }

  public async isComponent(
    setTokenAddress: Address,
    componentAddress: Address,
  ): Promise<void> {
    const setTokenInstance = await SetTokenContract.at(setTokenAddress, this.web3, {});
    const isComponent = await setTokenInstance.tokenIsComponent.callAsync(componentAddress);

    if (!isComponent) {
      throw new Error(setTokenAssertionsErrors.IS_NOT_COMPONENT(setTokenAddress, componentAddress));
    }
  }
}
