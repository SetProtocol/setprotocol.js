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
import {
  AuthorizableWrapper,
  ContractWrapper,
  CoreWrapper,
  TimeLockUpgradeWrapper,
  WhitelistWrapper,
} from '../wrappers';
import { BigNumber } from '../util';
import {
  Address,
  Bytes,
  SetProtocolConfig,
  SystemAuthorizableState,
  SystemOwnableState,
  SystemTimeLockPeriodState,
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
  private whitelist: WhitelistWrapper;


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
    this.whitelist = new WhitelistWrapper(web3);
  }

  /**
   * Fetches the operational state of Set Protocol. 0 is operational. 1 is shut down.
   *
   * @return               Operational State represented as a number
   */
  public async getOperationStateAsync(): Promise<BigNumber> {
    return await this.core.getOperationState();
  }

  /**
   * Fetches the authorizable addresses of the transfer proxy and vault.
   *
   * @return               System Authorizable state object
   */
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

  /**
   * Fetches the time lock periods of the contracts that have time lock upgrade functions.
   * These contracts include core, vault, transfer proxy, and issuance order module.
   *
   * @return               Object containing the current time lock periods.
   */
  public async getSystemTimeLockPeriods(): Promise<SystemTimeLockPeriodState> {
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
      coreInstance.timeLockPeriod.callAsync(),
      vaultInstance.timeLockPeriod.callAsync(),
      transferProxyInstance.timeLockPeriod.callAsync(),
      issuanceOrderModuleInstance.timeLockPeriod.callAsync(),
    ]);

    return {
      core: coreOwner,
      vault: vaultOwner,
      transferProxy: transferProxyOwner,
      issuanceOrderModule: issuanceOrderModuleOwner,
    };
  }

  /**
   * Fetches time lock upgrade hash given a transaction hash. The timelock upgrade hash
   * is composed of the msg.data of a transaction. It is the first four bytes of the function
   * appended with the call data.
   *
   * @param transactionHash    The hash of the upgrade proposal transaction
   * @return               The hash of the time lock upgrade hash
   */
  public async getTimeLockUpgradeHashAsync(transactionHash: string): Promise<Bytes> {
    const { input } = await this.web3.eth.getTransaction(transactionHash);

    const subjectTimeLockUpgradeHash = this.web3.utils.soliditySha3(input);

    return subjectTimeLockUpgradeHash;
  }

  /**
   * Fetches time lock upgrade initialization timestamp based on contract address and timelock upgrade hash.
   *
   * @param contractAddress        The hash of the upgrade proposal transaction
   * @param timeLockUpgradeHash    The hash of the time lock upgrade hash
   * @return               Timestamp that the upgrade was initiated
   */
  public async getTimeLockedUpgradeInitializationAsync(
    contractAddress: Address,
    timeLockUpgradeHash: Bytes
    ): Promise<BigNumber> {
      return await this.timeLockUpgrade.timeLockedUpgrades(contractAddress, timeLockUpgradeHash);
  }

  /**
   * Fetches the owners of the system.
   * These contracts include core, vault, transfer proxy, and issuance order module.
   *
   * @return               Object containing the contract owners.
   */
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
    };
  }

  /**
   * Fetches a list of whitelisted addresses on the whitelist contract.
   *
   * @param whitelistAddress    The address of the whitelist contract
   * @return               An array of whitelisted addresses
   */
  public async getWhitelistedAddresses(whitelistAddress: Address): Promise<Address[]> {
    return await this.whitelist.validAddresses(whitelistAddress);
  }

}

