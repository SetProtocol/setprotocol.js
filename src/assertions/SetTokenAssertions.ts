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

import _ from "lodash";

import { ERC20Assertions } from "./ERC20Assertions";
import { setTokenAssertionsErrors } from "../errors";
import { BigNumber } from "../util";
import { ERC20, SetTokenContract } from "../contracts";

const erc20Assertions = new ERC20Assertions();

export class SetTokenAssertions {
  /**
   * Throws if the given candidateContract does not respond to some methods from the Set Token interface.
   *
   * @param  setTokenInstance An instance of the Set Token contract
   * @return                  Void Promise
   */
  public async implementsSetToken(setTokenInstance: SetTokenContract): Promise<void> {
    const { address } = setTokenInstance;

    try {
      await setTokenInstance.name.callAsync();
      await setTokenInstance.totalSupply.callAsync();
      await setTokenInstance.decimals.callAsync();
      await setTokenInstance.naturalUnit.callAsync();
      await setTokenInstance.symbol.callAsync();
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
    setTokenInstance: SetTokenContract,
    ownerAddress: Address,
    quantityInWei: BigNumber,
  ): Promise<void> {
    const components = await setTokenInstance.getComponents.callAsync();
    const units = await setTokenInstance.getUnits.callAsync();
    const naturalUnit = await setTokenInstance.naturalUnit.callAsync();

    // Create component ERC20 token instances
    const componentInstancePromises = _.map(components, component =>
      ERC20.at(component, this.web3, { from: ownerAddress }),
    );
    const componentInstances = await Promise.all(componentInstancePromises);

    // Assert that user has sufficient allowances for each component token
    const userHasSufficientBalancePromises = _.map(
      componentInstances,
      (componentInstance, index) => {
        const requiredBalance = units[index].div(naturalUnit).times(quantityInWei);
        return erc20Assertions.hasSufficientBalance(
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
    setTokenInstance: SetTokenContract,
    ownerAddress: Address,
    quantityInWei: BigNumber,
  ): Promise<void> {
    const components = await setTokenInstance.getComponents.callAsync();
    const units = await setTokenInstance.getUnits.callAsync();
    const naturalUnit = await setTokenInstance.naturalUnit.callAsync();

    // Create component ERC20 token instances
    const componentInstancePromises = _.map(components, component =>
      ERC20.at(component, this.web3, { from: ownerAddress }),
    );
    const componentInstances = await Promise.all(componentInstancePromises);

    // Assert that user has sufficient allowances for each component token
    const userHasSufficientAllowancePromises = _.map(
      componentInstances,
      (componentInstance, index) => {
        const requiredBalance = units[index].div(naturalUnit).times(quantityInWei);
        return erc20Assertions.hasSufficientAllowance(
          componentInstance,
          ownerAddress,
          setTokenInstance.address,
          requiredBalance,
          `User does not have enough allowance of token at address ${componentInstance.address}`,
        );
      },
    );
    await Promise.all(userHasSufficientAllowancePromises);
  }
}
