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
import { SetTokenContract, VaultContract } from 'set-protocol-contracts';

import { ZERO } from '../constants';
import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { AuthorizableWrapper, ContractWrapper, CoreWrapper, TimeLockUpgradeWrapper } from '../wrappers';
import { BigNumber } from '../util';
import {
  Address,
  Bytes,
  SetProtocolConfig,
  SystemOwnableState,
  SystemAuthorizableState,
  Tx,
} from '../types/common';

/**
 * @title SystemAPI
 * @author Set Protocol
 *
 * A library for issuing and redeeming Sets
 */
export class SystemAPI {
  private web3: Web3;
  private assert: Assertions;
  private contract: ContractWrapper;
  private config: SetProtocolConfig;
  private core: CoreWrapper;
  private authorizable: AuthorizableWrapper;
  private timeLockUpgrade: TimeLockUpgradeWrapper;

  /**
   * Instantiates a new SystemAPI instance that contains methods for viewing the system-related state of
   * the protocol
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   * @param core        An instance of CoreWrapper to interact with the deployed Core contract
   * @param assertions  An instance of the Assertion library
   */
  constructor(web3: Web3, core: CoreWrapper, assert: Assertions, config: SetProtocolConfig) {
    this.web3 = web3;
    this.core = core;
    this.contract = new ContractWrapper(web3);
    this.config = config;
    this.assert = assert;
    this.authorizable = new AuthorizableWrapper(web3);
    this.timeLockUpgrade = new TimeLockUpgradeWrapper(web3);
  }

  /**
   * Issues a Set to the transaction signer. Must have component tokens in the correct quantites in either
   * the vault or in the signer's wallet. Component tokens must be approved to the Transfer
   * Proxy contract via setTransferProxyAllowanceAsync
   *
   * @param  setAddress    Address Set to issue
   * @param  quantity      Amount of Set to issue. Must be multiple of the natural unit of the Set
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async getOperationStateAsync(): Promise<BigNumber> {
    return await this.core.getOperationState();
  }

  public async getSetAddressesAsync(): Promise<Address[]> {
    return await this.core.getSetAddresses();
  }

  // Get the authorizable addresses of all contracts that have authorizability
  public async getSystemAuthorizableStateAsync(): Promise<SystemAuthorizableState> {
    const [
      transferProxyAuthorizable,
      vaultAuthorizable,
    ] = await Promise.all([
      this.authorizable.getAuthorizedAddresses(this.core.transferProxyAddress),
      this.authorizable.getAuthorizedAddresses(this.core.vaultAddress),
    ]);

    return {
      transferProxy: transferProxyAuthorizable,
      vault: vaultAuthorizable,
    };
  }

  // Get the time lock periods of all contracts that can be time locked
  public async getSystemTimeLockPeriods(): Promise<void> {
    // Find all the contracts that have time lock and put them here
  }

  // Get time lock upgrade hash based on transaction hash
  public async getTimeLockUpgradeHashAsync(transactionHash: string): Promise<Bytes> {
    const { input } = await this.web3.eth.getTransaction(transactionHash);

    const subjectTimeLockUpgradeHash = this.web3.utils.soliditySha3(input);

    return subjectTimeLockUpgradeHash;
  }

  // Get time lock upgrade status based on contract address and hash
  public async getTimeLockedUpgradeInitializationAsync(
    contractAddress: Address,
    timeLockUpgradeHash: Bytes
    ): Promise<BigNumber> {
      return await this.timeLockUpgrade.timeLockedUpgrades(contractAddress, timeLockUpgradeHash);
  }

  // Get System owners
    // Find all the ownable contracts and list their owners
  public async getSystemOwners(): Promise<SystemOwnableState> {
    const [
      coreInstance,
      vaultInstance,
      transferProxyInstance,
      issuanceOrderModuleInstance,
    ] = await Promise.all([
      this.contract.loadCoreAsync(this.config.transferProxyAddress),
      this.contract.loadVaultAsync(this.config.vaultAddress),
      this.contract.loadTransferProxyAsync(this.config.transferProxyAddress),
      this.contract.loadIssuanceOrderModuleAsync(this.config.issuanceOrderModuleAddress),
    ]);

    const [
      coreOwner,
      vaultOwner,
      transferProxyOwner,
      issuanceOrderModuleOwner,
    ] = await Promise.all([
      coreInstance.owner.callAsync(),
      vaultInstance.owner.callAsync(),
      transferProxyInstance.owner.callAsync(),
      issuanceOrderModuleInstance.owner.callAsync(),
    ]);

    return {
      core: coreOwner,
      vault: vaultOwner,
      transferProxy: transferProxyOwner,
      issuanceOrderModule: issuanceOrderModuleOwner,
    }
  }

  // Get modules
  // getPriceLibraries
    // Scrape through contract logs to get all the price libraries or wait for brians list
  // getValidFactories
    // Scrape through contract logs to get all the factories or wait for brians list
}

