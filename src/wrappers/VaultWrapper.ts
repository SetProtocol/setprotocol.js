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
import { Address } from 'set-protocol-utils';

import { ContractWrapper } from '.';
import { Assertions } from '../assertions';
import { BigNumber } from '../util';

/**
 * @title  VaultWrapper
 * @author Set Protocol
 *
 * The Vault API handles all functions on the Vault smart contract.
 *
 */
export class VaultWrapper {
  private web3: Web3;
  private assert: Assertions;
  private contracts: ContractWrapper;
  private vaultAddress: Address;

  public constructor(web3: Web3, vaultAddress: Address) {
    this.web3 = web3;
    this.vaultAddress = vaultAddress;
    this.assert = new Assertions(this.web3);
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Fetch the balance of the provided contract address inside the vault specified
   * in SetProtocolConfig
   *
   * @param  tokenAddress Address of the contract (typically SetToken or ERC20)
   * @param  ownerAddress Address of the user
   * @return              The balance of the user's Set
   */
  public async getBalanceInVault(tokenAddress: Address, ownerAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('ownerAddress', ownerAddress);
    const vaultInstance = await this.contracts.loadVaultAsync(this.vaultAddress);

    return await vaultInstance.getOwnerBalance.callAsync(tokenAddress, ownerAddress);
  }
}
