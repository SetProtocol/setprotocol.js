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

import * as Web3 from "web3";
import * as _ from "lodash";

import { ContractsAPI } from ".";
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT, ZERO } from "../constants";
import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from "../errors";
import { Assertions } from "../assertions";
import { Address, Component, Token, TransactionOpts, UInt } from "../types/common";
import { BigNumber, estimateIssueRedeemGasCost } from "../util";
import { CoreContract, DetailedERC20Contract, SetTokenContract, VaultContract } from "../contracts";

/**
 * @title CoreAPI
 * @author Set Protocol
 *
 * The Core API handles all functions on the Core SetProtocol smart contract.
 *
 */
export class CoreAPI {
  private web3: Web3;
  private assert: Assertions;
  private contracts: ContractsAPI;

  public coreAddress: Address;
  public transferProxyAddress: Address;
  public vaultAddress: Address;

  public constructor(
    web3: Web3,
    coreAddress: Address,
    transferProxyAddress: Address = undefined,
    vaultAddress: Address = undefined,
  ) {
    this.web3 = web3;
    this.contracts = new ContractsAPI(this.web3);
    this.assert = new Assertions(this.web3);

    this.assert.schema.isValidAddress("coreAddress", coreAddress);
    this.coreAddress = coreAddress;

    if (transferProxyAddress) {
      this.assert.schema.isValidAddress("transferProxyAddress", transferProxyAddress);
      this.transferProxyAddress = transferProxyAddress;
    }

    if (vaultAddress) {
      this.assert.schema.isValidAddress("vaultAddress", vaultAddress);
      this.vaultAddress = vaultAddress;
    }
  }

  /**
   * Create a new Set, specifying the components, units, name, symbol to use.
   *
   * @param  userAddress    Address of the user
   * @param  factoryAddress Set Token factory address of the token being created
   * @param  components     Component token addresses
   * @param  units          Units of corresponding token components
   * @param  naturalUnit    Supplied as the lowest common denominator for the Set
   * @param  name           User-supplied name for Set (i.e. "DEX Set")
   * @param  symbol         User-supplied symbol for Set (i.e. "DEX")
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up for the Set address
   */
  public async create(
    userAddress: Address,
    factoryAddress: Address,
    components: Address[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("factoryAddress", factoryAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.common.isEqualLength(
      components,
      units,
      coreAPIErrors.TOKENS_AND_UNITS_EQUAL_LENGTHS(),
    );
    this.assert.common.greaterThanZero(
      naturalUnit,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(naturalUnit),
    );
    this.assert.common.isValidString(name, coreAPIErrors.STRING_CANNOT_BE_EMPTY("name"));
    this.assert.common.isValidString(symbol, coreAPIErrors.STRING_CANNOT_BE_EMPTY("symbol"));

    let minDecimals = new BigNumber(18);
    let tokenDecimals;
    await Promise.all(
      components.map(async componentAddress => {
        this.assert.common.isValidString(
          componentAddress,
          coreAPIErrors.STRING_CANNOT_BE_EMPTY("component"),
        );
        this.assert.schema.isValidAddress("componentAddress", componentAddress);

        const tokenContract = await DetailedERC20Contract.at(componentAddress, this.web3, {});

        try {
          tokenDecimals = await tokenContract.decimals.callAsync();
          if (tokenDecimals.lt(minDecimals)) {
            minDecimals = tokenDecimals;
          }
        } catch (err) {
          minDecimals = ZERO;
        }

        await this.assert.erc20.implementsERC20(tokenContract);
      }),
    );

    this.assert.core.validateNaturalUnit(
      naturalUnit,
      minDecimals,
      coreAPIErrors.INVALID_NATURAL_UNIT(),
    );

    _.each(units, unit => {
      this.assert.common.greaterThanZero(unit, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(unit));
    });

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txSettings = Object.assign(
      { from: userAddress, gas: DEFAULT_GAS_LIMIT, gasPrice: DEFAULT_GAS_PRICE },
      txOpts,
    );

    const txHash = await coreInstance.create.sendTransactionAsync(
      factoryAddress,
      components,
      units,
      naturalUnit,
      name,
      symbol,
      txSettings,
    );

    return txHash;
  }

  /**
   * Asynchronously issues a particular quantity of tokens from a particular Sets
   *
   * @param  userAddress    Address of the user
   * @param  setAddress     Set token address of Set being issued
   * @param  quantityInWei  Number of Sets a user wants to issue in Wei
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up
   */
  public async issue(
    userAddress: Address,
    setAddress: Address,
    quantityInWei: BigNumber,
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("setAddress", setAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.common.greaterThanZero(
      quantityInWei,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityInWei),
    );

    const setTokenContract = await SetTokenContract.at(setAddress, this.web3, {});
    await this.assert.setToken.isMultipleOfNaturalUnit(
      setTokenContract,
      quantityInWei,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_MULTIPLE_OF_NATURAL_UNIT(),
    );

    await this.assert.setToken.hasSufficientBalances(setTokenContract, userAddress, quantityInWei);
    await this.assert.setToken.hasSufficientAllowances(
      setTokenContract,
      userAddress,
      this.transferProxyAddress,
      quantityInWei,
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txSettings = Object.assign(
      { from: userAddress, gas: DEFAULT_GAS_LIMIT, gasPrice: DEFAULT_GAS_PRICE },
      txOpts,
    );
    const txHash = await coreInstance.issue.sendTransactionAsync(
      setAddress,
      quantityInWei,
      txSettings,
    );

    return txHash;
  }

  /**
   * Asynchronously redeems a particular quantity of tokens from a particular Sets
   *
   * @param  userAddress    Address of the user
   * @param  setAddress     Set token address of Set being issued
   * @param  quantityInWei  Number of Sets a user wants to redeem in Wei
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up
   */
  public async redeem(
    userAddress: Address,
    setAddress: Address,
    quantityInWei: BigNumber,
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("setAddress", setAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.common.greaterThanZero(
      quantityInWei,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityInWei),
    );

    const setTokenContract = await SetTokenContract.at(setAddress, this.web3, {});
    await this.assert.setToken.isMultipleOfNaturalUnit(
      setTokenContract,
      quantityInWei,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_MULTIPLE_OF_NATURAL_UNIT(),
    );

    // SetToken is also a DetailedERC20 token.
    // Check balances of token in token balance as well as Vault balance (should be same)
    const detailedERC20Contract = await DetailedERC20Contract.at(setAddress, this.web3, {});
    await this.assert.erc20.hasSufficientBalance(
      detailedERC20Contract,
      userAddress,
      quantityInWei,
      erc20AssertionErrors.INSUFFICIENT_BALANCE(),
    );
    const vaultContract = await VaultContract.at(this.vaultAddress, this.web3, {});
    await this.assert.vault.hasSufficientSetTokensBalances(
      vaultContract,
      setTokenContract,
      quantityInWei,
      vaultAssertionErrors.INSUFFICIENT_SET_TOKENS_BALANCE(),
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txSettings = Object.assign(
      { from: userAddress, gas: DEFAULT_GAS_LIMIT, gasPrice: DEFAULT_GAS_PRICE },
      txOpts,
    );
    const txHash = await coreInstance.redeem.sendTransactionAsync(
      setAddress,
      quantityInWei,
      txSettings,
    );

    return txHash;
  }

  /**
   * Asynchronously deposits tokens to the vault
   *
   * @param  userAddress   Address of the user
   * @param  tokenAddress  Address of the ERC20 token
   * @param  quantityInWei Number of tokens a user wants to deposit into the vault
   * @return               A transaction hash
   */
  public async deposit(
    userAddress: Address,
    tokenAddress: Address,
    quantityInWei: BigNumber,
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.common.greaterThanZero(
      quantityInWei,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityInWei),
    );

    const detailedERC20Contract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});
    await this.assert.erc20.hasSufficientBalance(
      detailedERC20Contract,
      userAddress,
      quantityInWei,
      erc20AssertionErrors.INSUFFICIENT_BALANCE(),
    );
    await this.assert.erc20.hasSufficientAllowance(
      detailedERC20Contract,
      userAddress,
      this.transferProxyAddress,
      quantityInWei,
      erc20AssertionErrors.INSUFFICIENT_ALLOWANCE(),
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txSettings = Object.assign(
      { from: userAddress, gas: DEFAULT_GAS_LIMIT, gasPrice: DEFAULT_GAS_PRICE },
      txOpts,
    );
    const txHash = await coreInstance.deposit.sendTransactionAsync(
      tokenAddress,
      quantityInWei,
      txSettings,
    );

    return txHash;
  }

  /**
   * Asynchronously withdraw tokens from the vault
   *
   * @param  userAddress   Address of the user
   * @param  tokenAddress  Address of the ERC20 token
   * @param  quantityInWei Number of tokens a user wants to withdraw from the vault
   * @return               A transaction hash
   */
  public async withdraw(
    userAddress: Address,
    tokenAddress: Address,
    quantityInWei: BigNumber,
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.common.greaterThanZero(
      quantityInWei,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityInWei),
    );

    const vaultContract = await VaultContract.at(this.vaultAddress, this.web3, {});

    await this.assert.vault.hasSufficientTokenBalance(
      vaultContract,
      tokenAddress,
      userAddress,
      quantityInWei,
      vaultAssertionErrors.INSUFFICIENT_TOKEN_BALANCE(),
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txSettings = Object.assign(
      { from: userAddress, gas: DEFAULT_GAS_LIMIT, gasPrice: DEFAULT_GAS_PRICE },
      txOpts,
    );
    const txHash = await coreInstance.withdraw.sendTransactionAsync(
      tokenAddress,
      quantityInWei,
      txSettings,
    );

    return txHash;
  }

  /**
   * Composite method to redeem and withdraw with a single transaction
   *
   * Normally, you should expect to be able to withdraw all of the tokens.
   * However, some have central abilities to freeze transfers (e.g. EOS). _toWithdraw
   * allows you to optionally specify which component tokens to transfer
   * back to the user. The rest will remain in the vault under the users' addresses.
   *
   * @param  userAddress       The address of the user
   * @param  setAddress        The address of the Set token
   * @param  quantityInWei     The number of tokens to redeem
   * @param  tokensToWithdraw  Array of token addresses to withdraw
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash to then later look up
   */
  public async redeemAndWithdraw(
    userAddress: Address,
    setAddress: Address,
    quantityInWei: BigNumber,
    tokensToWithdraw: Address[],
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("setAddress", setAddress);
    this.assert.common.greaterThanZero(
      quantityInWei,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityInWei),
    );

    const setTokenContract = await SetTokenContract.at(setAddress, this.web3, {});
    const components = await setTokenContract.getComponents.callAsync();

    let toWithdraw: BigNumber = ZERO;
    const tokensToWithdrawMapping = {};
    _.each(tokensToWithdraw, withdrawTokenAddress => {
      this.assert.schema.isValidAddress("withdrawTokenAddress", withdrawTokenAddress);
      tokensToWithdrawMapping[withdrawTokenAddress] = true;
    });
    _.each(components, (component, componentIndex) => {
      if (tokensToWithdrawMapping[component]) {
        toWithdraw = toWithdraw.plus(new BigNumber(2).pow(componentIndex));
      }
    });

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txSettings = Object.assign(
      { from: userAddress, gas: DEFAULT_GAS_LIMIT, gasPrice: DEFAULT_GAS_PRICE },
      txOpts,
    );

    const txHash = await coreInstance.redeemAndWithdraw.sendTransactionAsync(
      setAddress,
      quantityInWei,
      toWithdraw,
      txSettings,
    );
  }

  /*
   * Asynchronously batch deposits tokens to the vault
   *
   * @param  userAddress       Address of the user
   * @param  tokenAddresses[]  Addresses of ERC20 tokens user wants to deposit into the vault
   * @param  quantitiesInWei[] Numbers of tokens a user wants to deposit into the vault
   * @return                   A transaction hash
   */
  public async batchDeposit(
    userAddress: Address,
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.common.isEqualLength(
      tokenAddresses,
      quantitiesInWei,
      coreAPIErrors.TOKENS_AND_UNITS_EQUAL_LENGTHS(),
    );
    // Token assertions
    await Promise.all(
      tokenAddresses.map(async (tokenAddress, i) => {
        this.assert.common.isValidString(
          tokenAddress,
          coreAPIErrors.STRING_CANNOT_BE_EMPTY("tokenAddress"),
        );
        this.assert.schema.isValidAddress("tokenAddress", tokenAddress);
        const tokenContract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});
        await this.assert.erc20.implementsERC20(tokenContract);

        // Check balance
        await this.assert.erc20.hasSufficientBalance(
          tokenContract,
          userAddress,
          quantitiesInWei[i],
          erc20AssertionErrors.INSUFFICIENT_BALANCE(),
        );
        // Check allowance
        await this.assert.erc20.hasSufficientAllowance(
          tokenContract,
          userAddress,
          this.transferProxyAddress,
          quantitiesInWei[i],
          erc20AssertionErrors.INSUFFICIENT_ALLOWANCE(),
        );
      }),
    );
    // Quantity assertions
    quantitiesInWei.map(quantity => {
      this.assert.common.greaterThanZero(
        quantity,
        coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity),
      );
    });

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txSettings = Object.assign(
      { from: userAddress, gas: DEFAULT_GAS_LIMIT, gasPrice: DEFAULT_GAS_PRICE },
      txOpts,
    );

    const txHash = await coreInstance.batchDeposit.sendTransactionAsync(
      tokenAddresses,
      quantitiesInWei,
      txSettings,
    );

    return txHash;
  }

  /*
   * Asynchronously batch withdraws tokens from the vault
   *
   * @param  userAddress       Address of the user
   * @param  tokenAddresses[]  Addresses of ERC20 tokens user wants to withdraw from the vault
   * @param  quantitiesInWei[] Numbers of tokens a user wants to withdraw from the vault
   * @return                   A transaction hash
   */
  public async batchWithdraw(
    userAddress: Address,
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.common.isEqualLength(
      tokenAddresses,
      quantitiesInWei,
      coreAPIErrors.TOKENS_AND_UNITS_EQUAL_LENGTHS(),
    );
    // Token assertions
    await Promise.all(
      tokenAddresses.map(async (tokenAddress, i) => {
        this.assert.common.isValidString(
          tokenAddress,
          coreAPIErrors.STRING_CANNOT_BE_EMPTY("tokenAddress"),
        );
        this.assert.schema.isValidAddress("tokenAddress", tokenAddress);
        const vaultContract = await VaultContract.at(this.vaultAddress, this.web3, {});

        // Check balance
        await this.assert.vault.hasSufficientTokenBalance(
          vaultContract,
          tokenAddress,
          userAddress,
          quantitiesInWei[i],
          vaultAssertionErrors.INSUFFICIENT_TOKEN_BALANCE(),
        );
      }),
    );
    // Quantity assertions
    quantitiesInWei.map(quantity => {
      this.assert.common.greaterThanZero(
        quantity,
        coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity),
      );
    });

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txSettings = Object.assign(
      { from: userAddress, gas: DEFAULT_GAS_LIMIT, gasPrice: DEFAULT_GAS_PRICE },
      txOpts,
    );

    const txHash = await coreInstance.batchWithdraw.sendTransactionAsync(
      tokenAddresses,
      quantitiesInWei,
      txSettings,
    );

    return txHash;
  }
}
