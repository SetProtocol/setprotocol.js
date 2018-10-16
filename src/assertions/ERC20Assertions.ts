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

import { Address } from 'set-protocol-utils';
import { DetailedERC20Contract } from 'set-protocol-contracts';
import Web3 from 'web3';

import { erc20AssertionErrors } from '../errors';
import { BigNumber } from '../util';

export class ERC20Assertions {
  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  /**
   * Throws if the given contract address does not respond to some methods from the ERC20 interface
   */
  public async implementsERC20(tokenAddress: Address): Promise<void> {
    const tokenContract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});

    try {
      await Promise.all([
        tokenContract.balanceOf.callAsync(tokenAddress),
        tokenContract.allowance.callAsync(tokenAddress, tokenAddress),
        tokenContract.totalSupply.callAsync(),
      ]);
    } catch (error) {
      throw new Error(erc20AssertionErrors.MISSING_ERC20_METHOD(tokenAddress));
    }
  }

  public async hasSufficientBalanceAsync(
    tokenAddress: Address,
    userAddress: Address,
    requiredBalance: BigNumber,
  ): Promise<void> {
    const tokenContract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});

    const userBalance = await tokenContract.balanceOf.callAsync(userAddress);

    if (userBalance.lt(requiredBalance)) {
      throw new Error(erc20AssertionErrors.INSUFFICIENT_BALANCE(
        tokenAddress,
        userAddress,
        userBalance,
        requiredBalance,
      ));
    }
  }

  public async hasSufficientAllowanceAsync(
    tokenAddress: Address,
    ownerAddress: Address,
    spenderAddress: Address,
    requiredAllowance: BigNumber,
  ): Promise<void> {
    const tokenContract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});

    const payerAllowance = await tokenContract.allowance.callAsync(ownerAddress, spenderAddress);

    if (payerAllowance.lt(requiredAllowance)) {
      throw new Error(erc20AssertionErrors.INSUFFICIENT_ALLOWANCE(
        tokenAddress,
        ownerAddress,
        spenderAddress,
        payerAllowance,
        requiredAllowance,
      ));
    }
  }
}
