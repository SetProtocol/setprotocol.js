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

import {
  AuthorizableWrapper,
  ContractWrapper,
  CoreWrapper,
  PriceFeedWrapper,
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
} from '../types/common';

/**
 * @title SystemAPI
 * @author Set Protocol
 *
 * A library for issuing and redeeming Sets
 */
export class SystemAPI {
  private web3: Web3;
  private contract: ContractWrapper;
  private config: SetProtocolConfig;
  private core: CoreWrapper;
  private authorizable: AuthorizableWrapper;
  private priceFeed: PriceFeedWrapper;
  private timeLockUpgrade: TimeLockUpgradeWrapper;
  private whitelist: WhitelistWrapper;


  /**
   * Instantiates a new SystemAPI instance that contains methods for viewing the system-related state of
   * the protocol
   *
   * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
   *                      with the Ethereum network
   * @param core        An instance of CoreWrapper to interact with the deployed Core contract
   */
  constructor(web3: Web3, core: CoreWrapper, config: SetProtocolConfig) {
    this.web3 = web3;
    this.core = core;
    this.contract = new ContractWrapper(web3);
    this.config = config;
    this.authorizable = new AuthorizableWrapper(web3);
    this.priceFeed = new PriceFeedWrapper(web3);
    this.timeLockUpgrade = new TimeLockUpgradeWrapper(web3);
    this.whitelist = new WhitelistWrapper(web3);
  }

  /**
   * Fetches the operational state of Set Protocol. 0 is operational. 1 is shut down.
   *
   * @return               Operational State represented as a number
   */
  public async getOperationStateAsync(): Promise<BigNumber> {
    return await this.core.operationState();
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
  public async getSystemTimeLockPeriodsAsync(): Promise<SystemTimeLockPeriodState> {
    const [
      coreInstance,
      vaultInstance,
      transferProxyInstance,
    ] = await Promise.all([
      this.contract.loadCoreAsync(this.config.coreAddress),
      this.contract.loadVaultAsync(this.config.vaultAddress),
      this.contract.loadTransferProxyAsync(this.config.transferProxyAddress),
    ]);

    const [
      coreOwner,
      vaultOwner,
      transferProxyOwner,
    ] = await Promise.all([
      coreInstance.timeLockPeriod.callAsync(),
      vaultInstance.timeLockPeriod.callAsync(),
      transferProxyInstance.timeLockPeriod.callAsync(),
    ]);

    return {
      core: coreOwner,
      vault: vaultOwner,
      transferProxy: transferProxyOwner,
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
  public async getSystemOwnersAsync(): Promise<SystemOwnableState> {
    const [
      coreInstance,
      vaultInstance,
      transferProxyInstance,
    ] = await Promise.all([
      this.contract.loadCoreAsync(this.config.coreAddress),
      this.contract.loadVaultAsync(this.config.vaultAddress),
      this.contract.loadTransferProxyAsync(this.config.transferProxyAddress),
    ]);

    const [
      coreOwner,
      vaultOwner,
      transferProxyOwner,
    ] = await Promise.all([
      coreInstance.owner.callAsync(),
      vaultInstance.owner.callAsync(),
      transferProxyInstance.owner.callAsync(),
    ]);

    return {
      core: coreOwner,
      vault: vaultOwner,
      transferProxy: transferProxyOwner,
    };
  }

  /**
   * Returns the current price feed price
   *
   * @param medianizerAddress    Address of the medianizer to ping
   * @return                     Price in base decimal of the asset represented by the medianizer
   */
  public async getFeedPriceAsync(medianizerAddress: Address): Promise<BigNumber> {
    const priceFeedUpdateHex = await this.priceFeed.read(medianizerAddress);

    return new BigNumber(priceFeedUpdateHex);
  }

  /**
   * Fetches a list of whitelisted addresses on the whitelist contract.
   *
   * @param whitelistAddress    The address of the whitelist contract
   * @return               An array of whitelisted addresses
   */
  public async getWhitelistedAddressesAsync(whitelistAddress: Address): Promise<Address[]> {
    return await this.whitelist.validAddresses(whitelistAddress);
  }

  /**
   * Fetch the addresses of Modules enabled in the system.
   *
   * @return            A list of the enabled modules
   */
  public async getModulesAsync(): Promise<Address[]> {
    return await this.core.modules();
  }

  /**
   * Fetch the addresses of Factories enabled in the system.
   *
   * @return            A list of the enabled Factories
   */
  public async getFactoriesAsync(): Promise<Address[]> {
    return await this.core.factories();
  }

  /*
   * Fetch the addresses of Exchanges enabled in the system.
   *
   * @return            A list of the enabled Exchanges
   */
  public async getExchangesAsync(): Promise<Address[]> {
    return await this.core.exchanges();
  }

  /**
   * Fetch the addresses of PriceLibraries enabled in the system.
   *
   * @return            A list of the enabled PriceLibraries
   */
  public async getPriceLibrariesAsync(): Promise<Address[]> {
    return await this.core.priceLibraries();
  }
}

