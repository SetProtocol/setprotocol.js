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

import { BigNumber } from "../util";
import { VaultContract } from "../contracts/VaultContract";
import { Address } from "../types/common";

export class VaultAssertions {
  public async hasSufficientBalance(
    vault: VaultContract,
    owner: Address,
    tokenAddress: Address,
    balanceRequired: BigNumber,
    errorMessage: string,
  ): Promise<void> {
    const ownerBalance = await vault.getOwnerBalance.callAsync(owner, tokenAddress);

    if (ownerBalance.lt(balanceRequired)) {
      throw new Error(errorMessage);
    }
  }
}
