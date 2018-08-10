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

import { BigNumber } from '../util';
import { VaultContract, SetTokenContract, DetailedERC20Contract } from '../contracts';

export class VaultAssertions {
  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  /**
   * Throws if the Vault doesn't have enough of token
   *
   * @param  vaultInstance    An instance of the Vault contract
   * @param  tokenAddress     An instance of the Set token contract
   * @param  ownerAddress     Address of owner withdrawing from vault
   * @param  quantityInWei    Amount of a Set in wei
   * @return                  Void Promise
   */
  public async hasSufficientTokenBalance(
    vaultInstance: VaultContract,
    tokenAddress: Address,
    ownerAddress: Address,
    quantityInWei: BigNumber,
    errorMessage: string,
  ): Promise<void> {
    // Assert that user has sufficient balance of Set
    const ownerBalance = await vaultInstance.getOwnerBalance.callAsync(ownerAddress, tokenAddress);

    if (ownerBalance.lt(quantityInWei)) {
      throw new Error(errorMessage);
    }
  }

  /**
   * Throws if the Set doesn't have a sufficient balance for its tokens in the Vault
   *
   * @param  vaultInstance    An instance of the Vault contract
   * @param  setTokenInstance An instance of the Set token contract
   * @param  quantityInWei    Amount of a Set in wei
   * @return                  Void Promise
   */
  public async hasSufficientSetTokensBalances(
    vaultInstance: VaultContract,
    setTokenInstance: SetTokenContract,
    quantityInWei: BigNumber,
    errorMessage: string,
  ): Promise<void> {
    const components: Address[] = await setTokenInstance.getComponents.callAsync();
    const units = await setTokenInstance.getUnits.callAsync();
    const naturalUnit = await setTokenInstance.naturalUnit.callAsync();

    const setTokenAddress = setTokenInstance.address;

    // Create component ERC20 token instances
    const componentInstancePromises = _.map(
      components,
      async component =>
        await DetailedERC20Contract.at(component, this.web3, { from: setTokenAddress }),
    );
    const componentInstances = await Promise.all(componentInstancePromises);

    // Assert that user has sufficient balance for each component token
    const setHasSufficientBalancePromises = _.map(
      componentInstances,
      async (componentInstance, index) => {
        const requiredBalance = units[index].div(naturalUnit).times(quantityInWei);
        const ownerBalance = await vaultInstance.getOwnerBalance.callAsync(
          setTokenAddress,
          components[index],
        );
        if (ownerBalance.lt(requiredBalance)) {
          throw new Error(errorMessage);
        }
      },
    );
    await Promise.all(setHasSufficientBalancePromises);
  }
}
