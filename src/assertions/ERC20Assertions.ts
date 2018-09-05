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
import { erc20AssertionErrors } from '../errors';
import { BigNumber } from '../util';
import * as Web3 from 'web3';

export class ERC20Assertions {
  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  // Throws if the given candidateContract does not respond to some methods from the ERC20 interface.
  public async implementsERC20(tokenAddress: Address): Promise<void> {
    const tokenContract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});

    try {
      await tokenContract.balanceOf.callAsync(tokenAddress);
      await tokenContract.allowance.callAsync(tokenAddress, tokenAddress);
      await tokenContract.totalSupply.callAsync();
    } catch (error) {
      throw new Error(erc20AssertionErrors.MISSING_ERC20_METHOD(tokenAddress));
    }
  }

  public async hasSufficientBalance(
    tokenAddress: Address,
    payer: Address,
    balanceRequired: BigNumber,
    errorMessage: string,
  ): Promise<void> {
    const tokenContract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});

    const payerBalance = await tokenContract.balanceOf.callAsync(payer);

    if (payerBalance.lt(balanceRequired)) {
      throw new Error(errorMessage);
    }
  }

  public async hasSufficientAllowance(
    tokenAddress: Address,
    owner: string,
    spender: string,
    allowanceRequired: BigNumber,
    errorMessage: string,
  ): Promise<void> {
    const tokenContract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});

    const payerAllowance = await tokenContract.allowance.callAsync(owner, spender);

    if (payerAllowance.lt(allowanceRequired)) {
      throw new Error(errorMessage);
    }
  }
}
