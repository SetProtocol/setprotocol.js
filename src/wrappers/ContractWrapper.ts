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

import Web3 from 'web3';
import {
  AuthorizableContract,
  BaseContract,
  BTCETHRebalancingManagerContract,
  CoreContract,
  ERC20DetailedContract,
  ExchangeIssueModuleContract,
  KyberNetworkWrapperContract,
  PayableExchangeIssueContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenContract,
  RebalancingTokenIssuanceModuleContract,
  MedianContract,
  SetTokenContract,
  TimeLockUpgradeContract,
  TransferProxyContract,
  WhiteListContract,
  VaultContract,
} from 'set-protocol-contracts';

import { Address } from '../types/common';

/**
 * @title ContractWrapper
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
export class ContractWrapper {
  private web3: Web3;
  private cache: { [contractName: string]: BaseContract };

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.cache = {};
  }

  /**
   * Load Core contract
   *
   * @param  coreAddress        Address of the Core contract
   * @param  transactionOptions Options sent into the contract deployed method
   * @return                    The Core Contract
   */
  public async loadCoreAsync(
    coreAddress: Address,
    transactionOptions: object = {},
  ): Promise<CoreContract> {
    const cacheKey = `Core_${coreAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as CoreContract;
    } else {
      const coreContract = await CoreContract.at(
        coreAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = coreContract;
      return coreContract;
    }
  }

  /**
   * Load Set Token contract
   *
   * @param  setTokenAddress    Address of the Set Token contract
   * @param  transactionOptions Options sent into the contract deployed method
   * @return                    The Set Token Contract
   */
  public async loadSetTokenAsync(
    setTokenAddress: Address,
    transactionOptions: object = {},
  ): Promise<SetTokenContract> {
    const cacheKey = `SetToken_${setTokenAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as SetTokenContract;
    } else {
      const setTokenContract = await SetTokenContract.at(
        setTokenAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = setTokenContract;
      return setTokenContract;
    }
  }

  /**
   * Load Rebalancing Set Token contract
   *
   * @param  rebalancingSetTokenAddress    Address of the Set Token contract
   * @param  transactionOptions            Options sent into the contract deployed method
   * @return                               The Set Token Contract
   */
  public async loadRebalancingSetTokenAsync(
    rebalancingSetTokenAddress: Address,
    transactionOptions: object = {},
  ): Promise<RebalancingSetTokenContract> {
    const cacheKey = `RebalancingSetToken_${rebalancingSetTokenAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as RebalancingSetTokenContract;
    } else {
      const rebalancingSetTokenContract = await RebalancingSetTokenContract.at(
        rebalancingSetTokenAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = rebalancingSetTokenContract;
      return rebalancingSetTokenContract;
    }
  }

  /**
   * Load ERC20 Token contract
   *
   * @param  tokenAddress    Address of the ERC20 Token contract
   * @param  transactionOptions Options sent into the contract deployed method
   * @return                    The ERC20 Token Contract
   */
  public async loadERC20TokenAsync(
    tokenAddress: Address,
    transactionOptions: object = {},
  ): Promise<ERC20DetailedContract> {
    const cacheKey = `ERC20Token_${tokenAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as ERC20DetailedContract;
    } else {
      const erc20TokenContract = await ERC20DetailedContract.at(
        tokenAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = erc20TokenContract;
      return erc20TokenContract;
    }
  }

  /**
   * Load Vault contract
   *
   * @param  vaultAddress       Address of the Vault contract
   * @param  transactionOptions Options sent into the contract deployed method
   * @return                    The Vault Contract
   */
  public async loadVaultAsync(
    vaultAddress: Address,
    transactionOptions: object = {},
  ): Promise<VaultContract> {
    const cacheKey = `Vault_${vaultAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as VaultContract;
    } else {
      const vaultContract = await VaultContract.at(vaultAddress, this.web3, transactionOptions);
      this.cache[cacheKey] = vaultContract;
      return vaultContract;
    }
  }

  /**
   * Load TransferProxy contract
   *
   * @param  transferProxyAddress       Address of the TransferProxy contract
   * @param  transactionOptions Options sent into the contract deployed method
   * @return                    The TransferProxy Contract
   */
  public async loadTransferProxyAsync(
    transferProxyAddress: Address,
    transactionOptions: object = {},
  ): Promise<TransferProxyContract> {
    const cacheKey = `Vault_${transferProxyAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as TransferProxyContract;
    } else {
      const transferProxyContract = await TransferProxyContract.at(transferProxyAddress, this.web3, transactionOptions);
      this.cache[cacheKey] = transferProxyContract;
      return transferProxyContract;
    }
  }

  /**
   * Load Rebalance Auction Module contract
   *
   * @param  rebalanceAuctionModuleAddress       Address of the Rebalance Auction Module contract
   * @param  transactionOptions                  Options sent into the contract deployed method
   * @return                                     The Rebalance Auction Module Contract
   */
  public async loadRebalanceAuctionModuleAsync(
    rebalanceAuctionModuleAddress: Address,
    transactionOptions: object = {},
  ): Promise<RebalanceAuctionModuleContract> {
    const cacheKey = `RebalanceAuctionModule_${rebalanceAuctionModuleAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as RebalanceAuctionModuleContract;
    } else {
      const rebalanceAuctionModuleContract = await RebalanceAuctionModuleContract.at(
        rebalanceAuctionModuleAddress,
        this.web3,
        transactionOptions
      );
      this.cache[cacheKey] = rebalanceAuctionModuleContract;
      return rebalanceAuctionModuleContract;
    }
  }

  /**
   * Load Kyber Network Wrapper contract
   *
   * @param  kyberNetworkWrapperAddress          Address of the Kyber Network Wrapper contract
   * @param  transactionOptions                  Options sent into the contract deployed method
   * @return                                     The Kyber Network Wrapper Contract
   */
  public async loadKyberNetworkWrapperAsync(
    kyberNetworkWrapperAddress: Address,
    transactionOptions: object = {},
  ): Promise<KyberNetworkWrapperContract> {
    const cacheKey = `KyberNetworkWrapper_${kyberNetworkWrapperAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as KyberNetworkWrapperContract;
    } else {
      const kyberNetworkWrapperContract = await KyberNetworkWrapperContract.at(
        kyberNetworkWrapperAddress,
        this.web3,
        transactionOptions
      );
      this.cache[cacheKey] = kyberNetworkWrapperContract;
      return kyberNetworkWrapperContract;
    }
  }

  /**
   * Load PayableExchangeIssue contract
   *
   * @param  payableExchangeIssueAddress    Address of the PayableExchangeIssue contract
   * @param  transactionOptions             Options sent into the contract deployed method
   * @return                                The PayableExchangeIssue Contract
   */
  public async loadPayableExchangeIssueAsync(
    payableExchangeIssueAddress: Address,
    transactionOptions: object = {},
  ): Promise<PayableExchangeIssueContract> {
    const cacheKey = `PayableExchangeIssue_${payableExchangeIssueAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as PayableExchangeIssueContract;
    } else {
      const payableExchangeIssueContract = await PayableExchangeIssueContract.at(
        payableExchangeIssueAddress,
        this.web3,
        transactionOptions
      );
      this.cache[cacheKey] = payableExchangeIssueContract;
      return payableExchangeIssueContract;
    }
  }

  /**
   * Load an Authorizable contract
   *
   * @param  authorizableAddress    Address of the Authorizable contract
   * @param  transactionOptions     Options sent into the contract deployed method
   * @return                        The Authorizable Contract
   */
  public async loadAuthorizableAsync(
    authorizableAddress: Address,
    transactionOptions: object = {},
  ): Promise<AuthorizableContract> {
    const cacheKey = `Authorizable_${authorizableAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as AuthorizableContract;
    } else {
      const setTokenContract = await AuthorizableContract.at(
        authorizableAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = setTokenContract;
      return setTokenContract;
    }
  }

  /**
   * Load a TimeLockUpgrade contract
   *
   * @param  timeLockUpgradeAddress Address of the TimeLockUpgrade contract
   * @param  transactionOptions     Options sent into the contract deployed method
   * @return                        The TimeLockUpgrade Contract
   */
  public async loadTimeLockUpgradeAsync(
    timeLockUpgradeAddress: Address,
    transactionOptions: object = {},
  ): Promise<TimeLockUpgradeContract> {
    const cacheKey = `TimeLockUpgrade_${timeLockUpgradeAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as TimeLockUpgradeContract;
    } else {
      const setTokenContract = await TimeLockUpgradeContract.at(
        timeLockUpgradeAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = setTokenContract;
      return setTokenContract;
    }
  }

  /**
   * Load a Whitelist contract
   *
   * @param  whitelistAddress Address of the Whitelist contract
   * @param  transactionOptions     Options sent into the contract deployed method
   * @return                        The Whitelist Contract
   */
  public async loadWhitelistAsync(
    whitelistAddress: Address,
    transactionOptions: object = {},
  ): Promise<WhiteListContract> {
    const cacheKey = `WhiteList_${whitelistAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as WhiteListContract;
    } else {
      const whitelistContract = await WhiteListContract.at(
        whitelistAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = whitelistContract;
      return whitelistContract;
    }
  }

  /**
   * Load BtcEthManagerContract contract
   *
   * @param  btcEthManagerAddress           Address of the BTCETHRebalancingManagerContract contract
   * @param  transactionOptions             Options sent into the contract deployed method
   * @return                                The BtcEthManagerContract Contract
   */
  public async loadBtcEthManagerAsync(
    btcEthManagerAddress: Address,
    transactionOptions: object = {},
  ): Promise<BTCETHRebalancingManagerContract> {
    const cacheKey = `BtcEthManager_${btcEthManagerAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as BTCETHRebalancingManagerContract;
    } else {
      const btcEthRebalancingManagerContract = await BTCETHRebalancingManagerContract.at(
        btcEthManagerAddress,
        this.web3,
        transactionOptions
      );
      this.cache[cacheKey] = btcEthRebalancingManagerContract;
      return btcEthRebalancingManagerContract;
    }
  }

  /**
   * Load a RebalancingTokenIssuanceModule contract
   *
   * @param  rebalancingTokenIssuanceModuleAddress Address of the RebalancingTokenIssuanceModule contract
   * @param  transactionOptions                    Options sent into the contract deployed method
   * @return                                       The RebalancingTokenIssuanceModule Contract
   */
  public async loadRebalancingTokenIssuanceModuleAsync(
    rebalancingTokenIssuanceModuleAddress: Address,
    transactionOptions: object = {},
  ): Promise<RebalancingTokenIssuanceModuleContract> {
    const cacheKey = `RebalancingTokenIssuanceModule_${rebalancingTokenIssuanceModuleAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as RebalancingTokenIssuanceModuleContract;
    } else {
      const rebalancingTokenIssuanceModuleContract = await RebalancingTokenIssuanceModuleContract.at(
        rebalancingTokenIssuanceModuleAddress,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = rebalancingTokenIssuanceModuleContract;
      return rebalancingTokenIssuanceModuleContract;
    }
  }

  /**
   * Load a ExchangeIssueModule contract
   *
   * @param  exchangeIssueModule                   Address of the ExchangeIssueModule contract
   * @param  transactionOptions                    Options sent into the contract deployed method
   * @return                                       The ExchangeIssueModule Contract
   */
  public async loadExchangeIssueModuleAsync(
    exchangeIssueModule: Address,
    transactionOptions: object = {},
  ): Promise<ExchangeIssueModuleContract> {
    const cacheKey = `ExchangeIssueModule_${exchangeIssueModule}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as ExchangeIssueModuleContract;
    } else {
      const rebalancingTokenIssuanceModuleContract = await ExchangeIssueModuleContract.at(
        exchangeIssueModule,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = rebalancingTokenIssuanceModuleContract;
      return rebalancingTokenIssuanceModuleContract;
    }
  }

  /**
   * Load a Medianizer contract
   *
   * @param  medianizer                   Address of the Medianizer contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The ExchangeIssueModule Contract
   */
  public async loadMedianizerContract(
    medianizer: Address,
    transactionOptions: object = {},
  ): Promise<MedianContract> {
    const cacheKey = `Medianizer_${medianizer}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as MedianContract;
    } else {
      const medianizerContract = await MedianContract.at(
        medianizer,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = medianizerContract;
      return medianizerContract;
    }
  }
}
