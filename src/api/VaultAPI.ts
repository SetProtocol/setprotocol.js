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

import * as Web3 from 'web3';

import { ContractsAPI } from '.';
import { Assertions } from '../assertions';
import { Address } from '../types/common';

/**
 * @title  VaultAPI
 * @author Set Protocol
 *
 * The Vault API handles all functions on the Vault smart contract.
 *
 */
export class VaultAPI {
  private web3: Web3;
  private assert: Assertions;
  private contracts: ContractsAPI;

  public constructor(web3: Web3, vaultAddress: Address) {
    this.web3 = web3;
    this.vaultAddress = vaultAddress;
    this.assert = new Assertions(this.web3);
    this.contracts = new ContractsAPI(this.web3);
  }

  /**
   * Gets balance of user's tokens in the vault
   *
   * @param  ownerAddress Address of the user
   * @param  tokenAddress Address of the Set
   * @return              The balance of the user's Set
   */
  public async getOwnerBalance(ownerAddress: Address, tokenAddress: Address): number {
    this.assert.schema.isValidAddress('ownerAddress', ownerAddress);
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    const vaultInstance = await this.contracts.loadVaultAsync(this.vaultAddress);
    return await vaultInstance.getOwnerBalance.callAsync(ownerAddress, tokenAddress);
  }
}
