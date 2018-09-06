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
import { DetailedERC20Contract } from 'set-protocol-contracts';
import { setTokenAssertionsErrors } from '../errors';
import { BigNumber } from '../util';
import { ZERO } from '../constants';

const erc20Assertions = new ERC20Assertions();

export class SetTokenAssertions {
  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  /**
   * Throws if the given candidateContract does not respond to some methods from the Set Token interface.
   *
   * @param  setTokenInstance An instance of the Set Token contract
   * @return                  Void Promise
   */
  public async implementsSetToken(setTokenInstance: Web3.ContractInstance): Promise<void> {
    const { address } = setTokenInstance;

    try {
      await setTokenInstance.name.callAsync();
      await setTokenInstance.totalSupply.callAsync();
      await setTokenInstance.decimals.callAsync();
      await setTokenInstance.naturalUnit.callAsync();
      await setTokenInstance.symbol.callAsync();
      await setTokenInstance.getComponents.callAsync();
      await setTokenInstance.getUnits.callAsync();
    } catch (error) {
      throw new Error(setTokenAssertionsErrors.IS_NOT_A_VALID_SET(address));
    }
  }

  /**
   * Throws if the given user doesn't have a sufficient balance for a component token in a Set
   *
   * @param  setTokenInstance An instance of the Set Token contract
   * @param  ownerAddress     The address of the owner
   * @param  quantityInWei    Amount of a Set in wei
   * @return                  Void Promise
   */
  public async hasSufficientBalances(
    setTokenInstance: Web3.ContractInstance,
    ownerAddress: Address,
    quantityInWei: BigNumber,
  ): Promise<void> {
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
        const requiredBalance = units[index].div(naturalUnit).times(quantityInWei);
        await erc20Assertions.hasSufficientBalance(
          componentInstance,
          ownerAddress,
          requiredBalance,
          `User does not have enough balance of token at address ${componentInstance.address}`,
        );
      },
    );
    await Promise.all(userHasSufficientBalancePromises);
  }

  /**
   * Throws if the given user doesn't have a sufficient allowance for a component token in a Set
   *
   * @param  setTokenInstance An instance of the Set Token contract
   * @param  ownerAddress     The address of the owner
   * @param  quantityInWei    Amount of a Set in wei
   * @return                  Void Promise
   */
  public async hasSufficientAllowances(
    setTokenInstance: Web3.ContractInstance,
    ownerAddress: Address,
    spenderAddress: Address,
    quantityInWei: BigNumber,
  ): Promise<void> {
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
        const requiredBalance = units[index].div(naturalUnit).times(quantityInWei);
        return await erc20Assertions.hasSufficientAllowance(
          componentInstance,
          ownerAddress,
          spenderAddress,
          requiredBalance,
          `User does not have enough allowance of token at address ${componentInstance.address}`,
        );
      },
    );
    await Promise.all(userHasSufficientAllowancePromises);
  }

  public async isMultipleOfNaturalUnit(
    setTokenInstance: Web3.ContractInstance,
    quantityInWei: BigNumber,
    errorMessage: string,
  ): Promise<void> {
    const naturalUnit = await setTokenInstance.naturalUnit.callAsync();
    if (!quantityInWei.mod(naturalUnit).eq(ZERO)) {
      throw new Error(errorMessage);
    }
  }
}
