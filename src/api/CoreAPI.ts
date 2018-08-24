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
import * as _ from 'lodash';
import {
  SetProtocolUtils,
  Address,
  Bytes,
  IssuanceOrder,
  SignedIssuanceOrder,
  TakerWalletOrder,
} from 'set-protocol-utils';
import { SignedOrder as ZeroExOrder } from '@0xproject/types';

import { ContractsAPI } from '.';
import { ZERO } from '../constants';
import { coreAPIErrors, erc20AssertionErrors, vaultAssertionErrors } from '../errors';
import { Assertions } from '../assertions';
import { TxData } from '../types/common';
import { BigNumber, generateTxOpts } from '../util';
import { DetailedERC20Contract, SetTokenContract, VaultContract } from '../contracts';

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
  private setProtocolUtils: SetProtocolUtils;

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

    this.assert.schema.isValidAddress('coreAddress', coreAddress);
    this.coreAddress = coreAddress;

    this.setProtocolUtils = new SetProtocolUtils(this.web3);

    if (transferProxyAddress) {
      this.assert.schema.isValidAddress('transferProxyAddress', transferProxyAddress);
      this.transferProxyAddress = transferProxyAddress;
    }

    if (vaultAddress) {
      this.assert.schema.isValidAddress('vaultAddress', vaultAddress);
      this.vaultAddress = vaultAddress;
    }
  }

  /* ============ Public Functions ============ */

  /**
   * Create a new Set, specifying the components, units, name, symbol to use.
   *
   * @param  factoryAddress Set Token factory address of the token being created
   * @param  components     Component token addresses
   * @param  units          Units of corresponding token components
   * @param  naturalUnit    Supplied as the lowest common denominator for the Set
   * @param  name           User-supplied name for Set (i.e. "DEX Set")
   * @param  symbol         User-supplied symbol for Set (i.e. "DEX")
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up for the Set address
   */
  public async createSet(
    factoryAddress: Address,
    components: Address[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);

    await this.assertCreateSet(
      txSettings.from,
      factoryAddress,
      components,
      units,
      naturalUnit,
      name,
      symbol
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txHash = await coreInstance.create.sendTransactionAsync(
      factoryAddress,
      components,
      units,
      naturalUnit,
      SetProtocolUtils.stringToBytes(name),
      SetProtocolUtils.stringToBytes(symbol),
      '',
      txSettings,
    );

    return txHash;
  }

  /**
   * Asynchronously issues a particular quantity of tokens from a particular Sets
   *
   * @param  setAddress     Set token address of Set being issued
   * @param  quantityInWei  Number of Sets a user wants to issue in Wei
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up
   */
  public async issue(
    setAddress: Address,
    quantityInWei: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);

    await this.assertIssue(
      txSettings.from,
      setAddress,
      quantityInWei,
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

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
   * @param  setAddress     Set token address of Set being issued
   * @param  quantityInWei  Number of Sets a user wants to redeem in Wei
   * @param  txOpts         The options for executing the transaction
   * @return                A transaction hash to then later look up
   */
  public async redeemToVault(
    setAddress: Address,
    quantityInWei: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);

    await this.assertRedeem(
      txSettings.from,
      setAddress,
      quantityInWei,
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

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
   * @param  tokenAddress  Address of the ERC20 token
   * @param  quantityInWei Number of tokens a user wants to deposit into the vault
   * @param  txOpts        The options for executing the transaction
   * @return               A transaction hash
   */
  public async singleDeposit(
    tokenAddress: Address,
    quantityInWei: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);

    await this.assertDeposit(
      txSettings.from,
      tokenAddress,
      quantityInWei,
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

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
   * @param  tokenAddress  Address of the ERC20 token
   * @param  quantityInWei Number of tokens a user wants to withdraw from the vault
   * @param  txOpts        The options for executing the transaction
   * @return               A transaction hash
   */
  public async singleWithdraw(
    tokenAddress: Address,
    quantityInWei: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);

    await this.assertWithdraw(
      txSettings.from,
      tokenAddress,
      quantityInWei,
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txHash = await coreInstance.withdraw.sendTransactionAsync(
      tokenAddress,
      quantityInWei,
      txSettings,
    );

    return txHash;
  }

  /**
   * Redeem and withdraw with a single transaction
   *
   * Normally, you should expect to be able to withdraw all of the tokens.
   * However, some have central abilities to freeze transfers (e.g. EOS). _toExclude
   * allows you to optionally specify which component tokens to remain under the user's
   * address in the vault. The rest will be transferred to the user.
   *
   * @param  setAddress        The address of the Set token
   * @param  quantityInWei     The number of tokens to redeem
   * @param  tokensToExclude   Array of token addresses to exclude from withdrawal
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash to then later look up
   */
  public async redeemAndWithdraw(
    setAddress: Address,
    quantityInWei: BigNumber,
    tokensToExclude: Address[],
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);

    this.assertRedeemAndWithdraw(setAddress, quantityInWei);

    const setTokenContract = await SetTokenContract.at(setAddress, this.web3, {});
    const components = await setTokenContract.getComponents.callAsync();

    let toExclude: BigNumber = ZERO;
    const tokensToExcludeMapping: any = {};
    _.each(tokensToExclude, tokenAddress => {
      this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
      tokensToExcludeMapping[tokenAddress] = true;
    });
    _.each(components, (component, componentIndex) => {
      if (tokensToExcludeMapping[component]) {
        toExclude = toExclude.plus(new BigNumber(2).pow(componentIndex));
      }
    });

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txHash = await coreInstance.redeemAndWithdraw.sendTransactionAsync(
      setAddress,
      quantityInWei,
      toExclude,
      txSettings,
    );

    return txHash;
  }

  /**
   * Asynchronously batch deposits tokens to the vault
   *
   * @param  tokenAddresses[]  Addresses of ERC20 tokens user wants to deposit into the vault
   * @param  quantitiesInWei[] Numbers of tokens a user wants to deposit into the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash
   */
  public async batchDeposit(
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);

    this.assertBatchDeposit(
      txSettings.from,
      tokenAddresses,
      quantitiesInWei,
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txHash = await coreInstance.batchDeposit.sendTransactionAsync(
      tokenAddresses,
      quantitiesInWei,
      txSettings,
    );

    return txHash;
  }

  /**
   * Asynchronously batch withdraws tokens from the vault
   *
   * @param  tokenAddresses[]  Addresses of ERC20 tokens user wants to withdraw from the vault
   * @param  quantitiesInWei[] Numbers of tokens a user wants to withdraw from the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash
   */
  public async batchWithdraw(
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);

    await this.assertBatchWithdraw(
      txSettings.from,
      tokenAddresses,
      quantitiesInWei,
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);

    const txHash = await coreInstance.batchWithdraw.sendTransactionAsync(
      tokenAddresses,
      quantitiesInWei,
      txSettings,
    );

    return txHash;
  }

  /**
   * Creates a new Issuance Order including the signature
   *
   * @param  setAddress                Address of the Set token for issuance order
   * @param  quantity                  Number of Set tokens to create as part of issuance order
   * @param  requiredComponents        Addresses of required component tokens of Set
   * @param  requiredComponentAmounts  Amounts of each required component needed
   * @param  makerAddress              Address of person making the order
   * @param  makerToken                Address of token the issuer is paying in
   * @param  makerTokenAmount          Number of tokens being exchanged for aggregate order size
   * @param  expiration                Unix timestamp of expiration (in seconds)
   * @param  relayerAddress            Address of relayer of order
   * @param  relayerToken              Address of token paid to relayer
   * @param  makerRelayerFee           Number of token paid to relayer by maker
   * @param  takerRelayerFee           Number of token paid tp relayer by taker
   * @return                           A transaction hash
   */
  public async createOrder(
    setAddress: Address,
    quantity: BigNumber,
    requiredComponents: Address[],
    requiredComponentAmounts: BigNumber[],
    makerAddress: Address,
    makerToken: Address,
    makerTokenAmount: BigNumber,
    expiration: BigNumber,
    relayerAddress: Address,
    relayerToken: Address,
    makerRelayerFee: BigNumber,
    takerRelayerFee: BigNumber,
  ): Promise<SignedIssuanceOrder> {
    await this.assertCreateSignedIssuanceOrder(
      setAddress,
      quantity,
      requiredComponents,
      requiredComponentAmounts,
      makerAddress,
      makerToken,
      makerTokenAmount,
      expiration,
      relayerAddress,
      relayerToken,
      makerRelayerFee,
      takerRelayerFee,
    );

    const order: IssuanceOrder = {
      setAddress,
      makerAddress,
      makerToken,
      relayerAddress,
      relayerToken,
      quantity,
      makerTokenAmount,
      expiration,
      makerRelayerFee,
      takerRelayerFee,
      requiredComponents,
      requiredComponentAmounts,
      salt: SetProtocolUtils.generateSalt(),
    };
    const orderHash = SetProtocolUtils.hashOrderHex(order);

    const signature = await this.setProtocolUtils.signMessage(orderHash, makerAddress);
    return Object.assign({}, order, { signature });
  }

  /**
   * Fills an Issuance Order
   *
   * @param  signedIssuanceOrder       Signed issuance order to fill
   * @param  signature                 Signature of the order
   * @param  quantityToFill            Number of Set to fill in this call
   * @param  orderData                 Bytes representation of orders used to fill issuance order
   * @param  txOpts                    The options for executing the transaction
   * @return                           A transaction hash
   */
  public async fillOrder(
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (ZeroExOrder | TakerWalletOrder)[],
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);

    const {
      setAddress,
      makerAddress,
      makerToken,
      relayerAddress,
      relayerToken,
      quantity,
      makerTokenAmount,
      expiration,
      makerRelayerFee,
      takerRelayerFee,
      requiredComponents,
      requiredComponentAmounts,
      salt,
      signature,
    } = signedIssuanceOrder;

    const orderData = await this.setProtocolUtils.generateSerializedOrders(
      makerToken,
      makerTokenAmount,
      orders,
    );

    await this.assertFillIssuanceOrder(
      txSettings.from,
      signedIssuanceOrder,
      quantityToFill,
      orderData,
    );

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const txHash = await coreInstance.fillOrder.sendTransactionAsync(
      [setAddress, makerAddress, makerToken, relayerAddress, relayerToken],
      [quantity, makerTokenAmount, expiration, makerRelayerFee, takerRelayerFee, salt],
      requiredComponents,
      requiredComponentAmounts,
      quantityToFill,
      signature.v,
      [signature.r, signature.s],
      orderData,
      txSettings,
    );

    return txHash;
  }

  /**
   * Cancels an Issuance Order
   *
   * @param  issuanceOrder             Issuance order to cancel
   * @param  quantityToCancel          Number of Set to cancel in this call
   * @param  txOpts                    The options for executing the transaction
   * @return                           A transaction hash
   */
  public async cancelOrder(
    issuanceOrder: IssuanceOrder,
    quantityToCancel: BigNumber,
    txOpts?: TxData,
  ): Promise<string> {
    const txSettings = await generateTxOpts(this.web3, txOpts);

    await this.assertCancelIssuanceOrder(
      issuanceOrder,
      quantityToCancel,
    );

    const {
      setAddress,
      makerAddress,
      makerToken,
      relayerAddress,
      relayerToken,
      quantity,
      makerTokenAmount,
      expiration,
      makerRelayerFee,
      takerRelayerFee,
      requiredComponents,
      requiredComponentAmounts,
      salt,
    } = issuanceOrder;

    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const txHash = await coreInstance.cancelOrder.sendTransactionAsync(
      [setAddress, makerAddress, makerToken, relayerAddress, relayerToken],
      [quantity, makerTokenAmount, expiration, makerRelayerFee, takerRelayerFee, salt],
      requiredComponents,
      requiredComponentAmounts,
      quantityToCancel,
      txSettings,
    );

    return txHash;
  }

  /* ============ Composite Implementation Functions ============ */

  /**
   * Composite method to redeem and optionally withdraw tokens
   *
   * @param  setAddress        The address of the Set token
   * @param  quantityInWei     The number of tokens to redeem
   * @param  withdraw          Boolean determining whether or not to withdraw
   * @param  tokensToExclude   Array of token addresses to exclude from withdrawal
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash to then later look up
   */
  public async redeem(
    setAddress: Address,
    quantityInWei: BigNumber,
    withdraw: boolean = true,
    tokensToExclude: Address[],
    txOpts?: TxData
  ) {
   if (withdraw) {
     return await this.redeemAndWithdraw(
       setAddress,
       quantityInWei,
       tokensToExclude,
       txOpts,
     );
   } else {
     return await this.redeemToVault(
       setAddress,
       quantityInWei,
       txOpts,
     );
   }
  }

  /**
   * Withdraws tokens either using single token type withdraw or batch withdraw
   *
   * @param  tokenAddresses[]  Addresses of ERC20 tokens user wants to withdraw from the vault
   * @param  quantitiesInWei[] Numbers of tokens a user wants to withdraw from the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash
   */
  public async withdraw(
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TxData,
  ) {
    if (tokenAddresses.length === 1) {
      return await this.singleWithdraw(
        tokenAddresses[0],
        quantitiesInWei[0],
        txOpts,
      );
    } else {
      return await this.batchWithdraw(
        tokenAddresses,
        quantitiesInWei,
        txOpts,
      );
    }
  }

  /**
   * Deposits token either using single token type deposit or batch deposit
   *
   * @param  tokenAddresses[]  Addresses of ERC20 tokens user wants to deposit into the vault
   * @param  quantitiesInWei[] Numbers of tokens a user wants to deposit into the vault
   * @param  txOpts            The options for executing the transaction
   * @return                   A transaction hash
   */
  public async deposit(
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
    txOpts?: TxData,
  ) {
    if (tokenAddresses.length === 1) {
      return await this.singleDeposit(
        tokenAddresses[0],
        quantitiesInWei[0],
        txOpts,
      );
    } else {
      return await this.batchDeposit(
        tokenAddresses,
        quantitiesInWei,
        txOpts,
      );
    }
  }

  /* ============ Core State Getters ============ */

  /**
   * Asynchronously gets the exchange address for a given exhange id
   *
   * @param  exchangeId Enum id of the exchange
   * @return            An exchange address
   */
  public async getExchangeAddress(exchangeId: number): Promise<Address> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const exchangeAddress = await coreInstance.exchanges.callAsync(exchangeId);
    return exchangeAddress;
  }

  /**
   * Asynchronously gets the transfer proxy address
   *
   * @return Transfer proxy address
   */
  public async getTransferProxyAddress(): Promise<Address> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const transferProxyAddress = await coreInstance.transferProxy.callAsync();
    return transferProxyAddress;
  }

  /**
   * Asynchronously gets the vault address
   *
   * @return Vault address
   */
  public async getVaultAddress(): Promise<Address> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const vaultAddress = await coreInstance.vault.callAsync();
    return vaultAddress;
  }

  /**
   * Asynchronously gets factory addresses
   *
   * @return Array of factory addresses
   */
  public async getFactories(): Promise<Address[]> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const factoryAddresses = await coreInstance.factories.callAsync();
    return factoryAddresses;
  }

  /**
   * Asynchronously gets Set addresses
   *
   * @return Array of Set addresses
   */
  public async getSetAddresses(): Promise<Address[]> {
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const setAddresses = await coreInstance.setTokens.callAsync();
    return setAddresses;
  }

  /**
   * Asynchronously validates if an address is a valid factory address
   *
   * @param  factoryAddress Address of the factory contract
   * @return                Boolean equalling if factory address is valid
   */
  public async getIsValidFactory(factoryAddress: Address): Promise<boolean> {
    this.assert.schema.isValidAddress('factoryAddress', factoryAddress);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const isValidFactoryAddress = await coreInstance.validFactories.callAsync(factoryAddress);
    return isValidFactoryAddress;
  }

  /**
   * Asynchronously validates if an address is a valid Set address
   *
   * @param  setAddress Address of the Set contract
   * @return            Boolean equalling if Set address is valid
   */
  public async getIsValidSet(setAddress: Address): Promise<boolean> {
    this.assert.schema.isValidAddress('setAddress', setAddress);
    const coreInstance = await this.contracts.loadCoreAsync(this.coreAddress);
    const isValidSetAddress = await coreInstance.validSets.callAsync(setAddress);
    return isValidSetAddress;
  }

  /* ============ Private Assertions ============ */

  private async assertCreateSet(
    userAddress: Address,
    factoryAddress: Address,
    components: Address[],
    units: BigNumber[],
    naturalUnit: BigNumber,
    name: string,
    symbol: string,
  ) {
    this.assert.schema.isValidAddress('factoryAddress', factoryAddress);
    this.assert.schema.isValidAddress('userAddress', userAddress);
    this.assert.common.isEqualLength(
      components,
      units,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('components', 'units'),
    );
    this.assert.common.greaterThanZero(
      naturalUnit,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(naturalUnit),
    );
    this.assert.common.isValidString(name, coreAPIErrors.STRING_CANNOT_BE_EMPTY('name'));
    this.assert.common.isValidString(symbol, coreAPIErrors.STRING_CANNOT_BE_EMPTY('symbol'));

    let minDecimals = new BigNumber(18);
    let tokenDecimals;
    await Promise.all(
      components.map(async componentAddress => {
        this.assert.common.isValidString(
          componentAddress,
          coreAPIErrors.STRING_CANNOT_BE_EMPTY('component'),
        );
        this.assert.schema.isValidAddress('componentAddress', componentAddress);

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
  }

  private async assertIssue(
    userAddress: Address,
    setAddress: Address,
    quantityInWei: BigNumber,
  ) {
    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.schema.isValidAddress('userAddress', userAddress);
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
  }

  private async assertRedeem(
    userAddress: Address,
    setAddress: Address,
    quantityInWei: BigNumber,
  ) {
    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.schema.isValidAddress('userAddress', userAddress);
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
  }

  private assertRedeemAndWithdraw(
    setAddress: Address,
    quantityInWei: BigNumber,
  ) {
    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.common.greaterThanZero(
      quantityInWei,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityInWei),
    );
  }

  private async assertDeposit(
    userAddress: Address,
    tokenAddress: Address,
    quantityInWei: BigNumber,
  ) {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('userAddress', userAddress);
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
  }

  private async assertWithdraw(
    userAddress: Address,
    tokenAddress: Address,
    quantityInWei: BigNumber,
  ) {
    this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
    this.assert.schema.isValidAddress('userAddress', userAddress);
    this.assert.common.greaterThanZero(
      quantityInWei,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityInWei),
    );

    const vaultContract = await VaultContract.at(this.vaultAddress, this.web3, {});

    const detailedERC20Contract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});
    await this.assert.erc20.implementsERC20(detailedERC20Contract);

    await this.assert.vault.hasSufficientTokenBalance(
      vaultContract,
      tokenAddress,
      userAddress,
      quantityInWei,
      vaultAssertionErrors.INSUFFICIENT_TOKEN_BALANCE(),
    );
  }

  private async assertBatchDeposit(
    userAddress: Address,
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
  ) {
    this.assert.schema.isValidAddress('userAddress', userAddress);
    this.assert.common.isEqualLength(
      tokenAddresses,
      quantitiesInWei,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('tokenAddresses', 'quantitiesInWei'),
    );
    // Token assertions
    await Promise.all(
      tokenAddresses.map(async (tokenAddress, i) => {
        this.assert.common.isValidString(
          tokenAddress,
          coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'),
        );
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
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
  }

  private async assertBatchWithdraw(
    userAddress: Address,
    tokenAddresses: Address[],
    quantitiesInWei: BigNumber[],
  ) {
    this.assert.schema.isValidAddress('userAddress', userAddress);
    this.assert.common.isEqualLength(
      tokenAddresses,
      quantitiesInWei,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('tokenAddresses', 'quantitiesInWei'),
    );
    // Token assertions
    await Promise.all(
      tokenAddresses.map(async (tokenAddress, i) => {
        this.assert.common.isValidString(
          tokenAddress,
          coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'),
        );
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

        const vaultContract = await VaultContract.at(this.vaultAddress, this.web3, {});

        const detailedERC20Contract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});
        await this.assert.erc20.implementsERC20(detailedERC20Contract);

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
    _.each(quantitiesInWei, quantity => {
      this.assert.common.greaterThanZero(
        quantity,
        coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity),
      );
    });
  }

  private async assertCreateSignedIssuanceOrder(
    setAddress: Address,
    quantity: BigNumber,
    requiredComponents: Address[],
    requiredComponentAmounts: BigNumber[],
    makerAddress: Address,
    makerToken: Address,
    makerTokenAmount: BigNumber,
    expiration: BigNumber,
    relayerAddress: Address,
    relayerToken: Address,
    makerRelayerFee: BigNumber,
    takerRelayerFee: BigNumber,
  ) {
    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.schema.isValidAddress('makerAddress', makerAddress);
    this.assert.schema.isValidAddress('relayerAddress', relayerAddress);
    this.assert.schema.isValidAddress('relayerToken', relayerToken);
    this.assert.common.greaterThanZero(
      quantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity),
    );
    await Promise.all(
      requiredComponents.map(async (tokenAddress, i) => {
        this.assert.common.isValidString(
          tokenAddress,
          coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'),
        );
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

        const detailedERC20Contract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});
        await this.assert.erc20.implementsERC20(detailedERC20Contract);

        this.assert.common.greaterThanZero(
          requiredComponentAmounts[i],
          coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(requiredComponentAmounts[i]),
        );
      }),
    );
    this.assert.common.isEqualLength(
      requiredComponents,
      requiredComponentAmounts,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('requiredComponents', 'requiredComponentAmounts'),
    );
    const makerTokenContract = await DetailedERC20Contract.at(makerToken, this.web3, {});
    await this.assert.erc20.implementsERC20(makerTokenContract);
    this.assert.common.greaterThanZero(
      makerTokenAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(makerTokenAmount),
    );
    const relayerTokenContract = await DetailedERC20Contract.at(relayerToken, this.web3, {});
    await this.assert.erc20.implementsERC20(relayerTokenContract);
    this.assert.common.greaterThanZero(
      makerRelayerFee,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(makerRelayerFee),
    );
    this.assert.common.greaterThanZero(
      takerRelayerFee,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(takerRelayerFee),
    );
    this.assert.common.isValidExpiration(
      expiration,
      coreAPIErrors.EXPIRATION_PASSED(),
    );
  }

  private async assertFillIssuanceOrder(
    userAddress: Address,
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orderData: Bytes,
  ) {
    const {
      setAddress,
      makerAddress,
      makerToken,
      relayerAddress,
      relayerToken,
      quantity,
      makerTokenAmount,
      expiration,
      makerRelayerFee,
      takerRelayerFee,
      requiredComponents,
      requiredComponentAmounts,
      salt,
    } = signedIssuanceOrder;

    const { signature, ...issuanceOrder } = signedIssuanceOrder;

    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.schema.isValidAddress('makerAddress', makerAddress);
    this.assert.schema.isValidAddress('relayerAddress', relayerAddress);
    this.assert.schema.isValidAddress('relayerToken', relayerToken);
    this.assert.common.greaterThanZero(
      quantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity),
    );
    await Promise.all(
      requiredComponents.map(async (tokenAddress, i) => {
        this.assert.common.isValidString(
          tokenAddress,
          coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'),
        );
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

        const detailedERC20Contract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});
        await this.assert.erc20.implementsERC20(detailedERC20Contract);

        this.assert.common.greaterThanZero(
          requiredComponentAmounts[i],
          coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(requiredComponentAmounts[i]),
        );
      }),
    );
    this.assert.common.isEqualLength(
      requiredComponents,
      requiredComponentAmounts,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('requiredComponents', 'requiredComponentAmounts'),
    );
    const makerTokenContract = await DetailedERC20Contract.at(makerToken, this.web3, {});
    await this.assert.erc20.implementsERC20(makerTokenContract);
    this.assert.common.greaterThanZero(
      makerTokenAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(makerTokenAmount),
    );
    const relayerTokenContract = await DetailedERC20Contract.at(relayerToken, this.web3, {});
    await this.assert.erc20.implementsERC20(relayerTokenContract);
    this.assert.common.greaterThanZero(
      makerRelayerFee,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(makerRelayerFee),
    );
    this.assert.common.greaterThanZero(
      takerRelayerFee,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(takerRelayerFee),
    );
    this.assert.common.greaterThanZero(
      quantityToFill,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityToFill),
    );
    this.assert.common.isValidString(
      orderData,
      coreAPIErrors.STRING_CANNOT_BE_EMPTY('orderData'),
    );
    await this.assert.core.isValidSignature(
      issuanceOrder,
      signature,
      coreAPIErrors.SIGNATURE_MISMATCH(),
    );
    this.assert.common.isValidExpiration(
      expiration,
      coreAPIErrors.EXPIRATION_PASSED(),
    );
  }

  private async assertCancelIssuanceOrder(
    issuanceOrder: IssuanceOrder,
    quantityToCancel: BigNumber,
  ) {
    const {
      setAddress,
      makerAddress,
      makerToken,
      relayerAddress,
      relayerToken,
      quantity,
      makerTokenAmount,
      expiration,
      makerRelayerFee,
      takerRelayerFee,
      requiredComponents,
      requiredComponentAmounts,
      salt,
    } = issuanceOrder;

    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.schema.isValidAddress('makerAddress', makerAddress);
    this.assert.schema.isValidAddress('relayerAddress', relayerAddress);
    this.assert.schema.isValidAddress('relayerToken', relayerToken);
    this.assert.common.greaterThanZero(
      quantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity),
    );
    await Promise.all(
      requiredComponents.map(async (tokenAddress, i) => {
        this.assert.common.isValidString(
          tokenAddress,
          coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'),
        );
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);

        const detailedERC20Contract = await DetailedERC20Contract.at(tokenAddress, this.web3, {});
        await this.assert.erc20.implementsERC20(detailedERC20Contract);

        this.assert.common.greaterThanZero(
          requiredComponentAmounts[i],
          coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(requiredComponentAmounts[i]),
        );
      }),
    );
    this.assert.common.isEqualLength(
      requiredComponents,
      requiredComponentAmounts,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('requiredComponents', 'requiredComponentAmounts'),
    );
    const makerTokenContract = await DetailedERC20Contract.at(makerToken, this.web3, {});
    await this.assert.erc20.implementsERC20(makerTokenContract);
    this.assert.common.greaterThanZero(
      makerTokenAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(makerTokenAmount),
    );
    const relayerTokenContract = await DetailedERC20Contract.at(relayerToken, this.web3, {});
    await this.assert.erc20.implementsERC20(relayerTokenContract);
    this.assert.common.greaterThanZero(
      makerRelayerFee,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(makerRelayerFee),
    );
    this.assert.common.greaterThanZero(
      takerRelayerFee,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(takerRelayerFee),
    );
    this.assert.common.greaterThanZero(
      quantityToCancel,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantityToCancel),
    );
    this.assert.common.isValidExpiration(
      expiration,
      coreAPIErrors.EXPIRATION_PASSED(),
    );
  }
}
