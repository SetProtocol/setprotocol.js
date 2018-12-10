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
import { Address } from 'set-protocol-utils';

import { vaultAssertionErrors } from '../errors';
import { BigNumber } from '../util';
import { ERC20DetailedContract, SetTokenContract, VaultContract } from 'set-protocol-contracts';

export class VaultAssertions {
  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  /**
   * Throws if the Vault doesn't have enough of token
   *
   * @param  vaultAddress     The address of the Vault contract
   * @param  tokenAddress     The address of the Set token contract
   * @param  ownerAddress     Address of owner withdrawing from vault
   * @param  quantity         Amount of a Set in base units
   * @return                  Void Promise
   */
  public async hasSufficientTokenBalance(
    vaultAddress: Address,
    tokenAddress: Address,
    ownerAddress: Address,
    quantity: BigNumber,
  ): Promise<void> {
    const vaultContract = await VaultContract.at(vaultAddress, this.web3, {});

    // Assert that user has sufficient balance of Set
    const ownerBalance = await vaultContract.getOwnerBalance.callAsync(tokenAddress, ownerAddress);

    if (ownerBalance.lt(quantity)) {
      throw new Error(vaultAssertionErrors.INSUFFICIENT_TOKEN_BALANCE());
    }
  }

  /**
   * Throws if the Set doesn't have a sufficient balance for its tokens in the Vault
   *
   * @param  vaultAddress     The address of the Vault contract
   * @param  setAddress       The address of the Set token contract
   * @param  quantity         Amount of a Set in base units
   * @return                  Void Promise
   */
  public async hasSufficientSetTokensBalances(
    vaultAddress: Address,
    setTokenAddress: Address,
    quantity: BigNumber,
  ): Promise<void> {
    const vaultInstance = await VaultContract.at(vaultAddress, this.web3, {});
    const setTokenInstance = await SetTokenContract.at(setTokenAddress, this.web3, {});

    const components: Address[] = await setTokenInstance.getComponents.callAsync();
    const units = await setTokenInstance.getUnits.callAsync();
    const naturalUnit = await setTokenInstance.naturalUnit.callAsync();

    const setAddress = setTokenInstance.address;

    // Create component ERC20 token instances
    const componentInstancePromises = _.map(
      components,
      async component =>
        await ERC20DetailedContract.at(component, this.web3, { from: setAddress }),
    );
    const componentInstances = await Promise.all(componentInstancePromises);

    // Assert that user has sufficient balance for each component token
    const setHasSufficientBalancePromises = _.map(
      componentInstances,
      async (componentInstance, index) => {
        const requiredBalance = units[index].div(naturalUnit).times(quantity);
        const ownerBalance = await vaultInstance.getOwnerBalance.callAsync(
          componentInstance.address,
          setAddress,
        );
        if (ownerBalance.lt(requiredBalance)) {
          throw new Error(vaultAssertionErrors.INSUFFICIENT_SET_TOKENS_BALANCE());
        }
      },
    );
    await Promise.all(setHasSufficientBalancePromises);
  }
}
