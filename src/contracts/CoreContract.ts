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

/**
 * This file is auto-generated using abi-gen. Don't edit directly.
 * Templates can be found at https://github.com/0xProject/0x.js/tree/development/packages/abi-gen-templates.
 */
// tslint:disable-next-line:no-unused-variable

import { promisify } from '@0xproject/utils';
import { Core as ContractArtifacts } from 'set-protocol-contracts';
import * as Web3 from 'web3';

import { BaseContract, CONTRACT_WRAPPER_ERRORS } from './BaseContract';
import { TxData } from '../types/common';
import { BigNumber, classUtils, Web3Utils } from '../util';

export class CoreContract extends BaseContract {
  public validFactories = {
    async callAsync(
      _factory: string,
      defaultBlock?: any,
    ): Promise<boolean
  > {
      const self = this as CoreContract;
      const result = await promisify<boolean
  >(
        self.web3ContractInstance.validFactories.call,
        self.web3ContractInstance,
      )(
        _factory,
      );
      return result;
    },
  };
  public disableFactory = {
    async sendTransactionAsync(
      _factory: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.disableFactory.estimateGasAsync.bind(
          self,
          _factory,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.disableFactory, self.web3ContractInstance,
      )(
        _factory,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _factory: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.disableFactory.estimateGas, self.web3ContractInstance,
      )(
        _factory,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _factory: string,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.disableFactory.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _factory: string,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.disableFactory.call,
        self.web3ContractInstance,
      )(
        _factory,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public cancelOrder = {
    async sendTransactionAsync(
      _addresses: string[],
      _values: BigNumber[],
      _requiredComponents: string[],
      _requiredComponentAmounts: BigNumber[],
      _cancelQuantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.cancelOrder.estimateGasAsync.bind(
          self,
          _addresses,
          _values,
          _requiredComponents,
          _requiredComponentAmounts,
          _cancelQuantity,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.cancelOrder, self.web3ContractInstance,
      )(
        _addresses,
        _values,
        _requiredComponents,
        _requiredComponentAmounts,
        _cancelQuantity,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _addresses: string[],
      _values: BigNumber[],
      _requiredComponents: string[],
      _requiredComponentAmounts: BigNumber[],
      _cancelQuantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.cancelOrder.estimateGas, self.web3ContractInstance,
      )(
        _addresses,
        _values,
        _requiredComponents,
        _requiredComponentAmounts,
        _cancelQuantity,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _addresses: string[],
      _values: BigNumber[],
      _requiredComponents: string[],
      _requiredComponentAmounts: BigNumber[],
      _cancelQuantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.cancelOrder.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _addresses: string[],
      _values: BigNumber[],
      _requiredComponents: string[],
      _requiredComponentAmounts: BigNumber[],
      _cancelQuantity: BigNumber,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.cancelOrder.call,
        self.web3ContractInstance,
      )(
        _addresses,
        _values,
        _requiredComponents,
        _requiredComponentAmounts,
        _cancelQuantity,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public orderCancels = {
    async callAsync(
      _orderHash: string,
      defaultBlock?: any,
    ): Promise<BigNumber
  > {
      const self = this as CoreContract;
      const result = await promisify<BigNumber
  >(
        self.web3ContractInstance.orderCancels.call,
        self.web3ContractInstance,
      )(
        _orderHash,
      );
      return result;
    },
  };
  public redeem = {
    async sendTransactionAsync(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.redeem.estimateGasAsync.bind(
          self,
          _set,
          _quantity,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.redeem, self.web3ContractInstance,
      )(
        _set,
        _quantity,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.redeem.estimateGas, self.web3ContractInstance,
      )(
        _set,
        _quantity,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.redeem.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.redeem.call,
        self.web3ContractInstance,
      )(
        _set,
        _quantity,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public batchDeposit = {
    async sendTransactionAsync(
      _tokens: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.batchDeposit.estimateGasAsync.bind(
          self,
          _tokens,
          _quantities,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.batchDeposit, self.web3ContractInstance,
      )(
        _tokens,
        _quantities,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _tokens: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.batchDeposit.estimateGas, self.web3ContractInstance,
      )(
        _tokens,
        _quantities,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _tokens: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.batchDeposit.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _tokens: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.batchDeposit.call,
        self.web3ContractInstance,
      )(
        _tokens,
        _quantities,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public registerExchange = {
    async sendTransactionAsync(
      _exchangeId: number|BigNumber,
      _exchange: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.registerExchange.estimateGasAsync.bind(
          self,
          _exchangeId,
          _exchange,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.registerExchange, self.web3ContractInstance,
      )(
        _exchangeId,
        _exchange,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _exchangeId: number|BigNumber,
      _exchange: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.registerExchange.estimateGas, self.web3ContractInstance,
      )(
        _exchangeId,
        _exchange,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _exchangeId: number|BigNumber,
      _exchange: string,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.registerExchange.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _exchangeId: number|BigNumber,
      _exchange: string,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.registerExchange.call,
        self.web3ContractInstance,
      )(
        _exchangeId,
        _exchange,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public deposit = {
    async sendTransactionAsync(
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.deposit.estimateGasAsync.bind(
          self,
          _token,
          _quantity,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.deposit, self.web3ContractInstance,
      )(
        _token,
        _quantity,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.deposit.estimateGas, self.web3ContractInstance,
      )(
        _token,
        _quantity,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.deposit.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.deposit.call,
        self.web3ContractInstance,
      )(
        _token,
        _quantity,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public setTokens = {
    async callAsync(
      defaultBlock?: any,
    ): Promise<string[]
  > {
      const self = this as CoreContract;
      const result = await promisify<string[]
  >(
        self.web3ContractInstance.setTokens.call,
        self.web3ContractInstance,
      )(
      );
      return result;
    },
  };
  public internalTransfer = {
    async sendTransactionAsync(
      _to: string,
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.internalTransfer.estimateGasAsync.bind(
          self,
          _to,
          _token,
          _quantity,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.internalTransfer, self.web3ContractInstance,
      )(
        _to,
        _token,
        _quantity,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _to: string,
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.internalTransfer.estimateGas, self.web3ContractInstance,
      )(
        _to,
        _token,
        _quantity,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _to: string,
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.internalTransfer.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _to: string,
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.internalTransfer.call,
        self.web3ContractInstance,
      )(
        _to,
        _token,
        _quantity,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public transferProxy = {
    async callAsync(
      defaultBlock?: any,
    ): Promise<string
  > {
      const self = this as CoreContract;
      const result = await promisify<string
  >(
        self.web3ContractInstance.transferProxy.call,
        self.web3ContractInstance,
      )(
      );
      return result;
    },
  };
  public renounceOwnership = {
    async sendTransactionAsync(
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.renounceOwnership.estimateGasAsync.bind(
          self,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.renounceOwnership, self.web3ContractInstance,
      )(
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.renounceOwnership.estimateGas, self.web3ContractInstance,
      )(
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.renounceOwnership.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.renounceOwnership.call,
        self.web3ContractInstance,
      )(
        txDataWithDefaults,
      );
      return result;
    },
  };
  public disableSet = {
    async sendTransactionAsync(
      _set: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.disableSet.estimateGasAsync.bind(
          self,
          _set,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.disableSet, self.web3ContractInstance,
      )(
        _set,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _set: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.disableSet.estimateGas, self.web3ContractInstance,
      )(
        _set,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _set: string,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.disableSet.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _set: string,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.disableSet.call,
        self.web3ContractInstance,
      )(
        _set,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public issue = {
    async sendTransactionAsync(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.issue.estimateGasAsync.bind(
          self,
          _set,
          _quantity,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.issue, self.web3ContractInstance,
      )(
        _set,
        _quantity,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.issue.estimateGas, self.web3ContractInstance,
      )(
        _set,
        _quantity,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.issue.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.issue.call,
        self.web3ContractInstance,
      )(
        _set,
        _quantity,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public owner = {
    async callAsync(
      defaultBlock?: any,
    ): Promise<string
  > {
      const self = this as CoreContract;
      const result = await promisify<string
  >(
        self.web3ContractInstance.owner.call,
        self.web3ContractInstance,
      )(
      );
      return result;
    },
  };
  public enableFactory = {
    async sendTransactionAsync(
      _factory: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.enableFactory.estimateGasAsync.bind(
          self,
          _factory,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.enableFactory, self.web3ContractInstance,
      )(
        _factory,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _factory: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.enableFactory.estimateGas, self.web3ContractInstance,
      )(
        _factory,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _factory: string,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.enableFactory.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _factory: string,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.enableFactory.call,
        self.web3ContractInstance,
      )(
        _factory,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public exchanges = {
    async callAsync(
      _exchangeId: number|BigNumber,
      defaultBlock?: any,
    ): Promise<string
  > {
      const self = this as CoreContract;
      const result = await promisify<string
  >(
        self.web3ContractInstance.exchanges.call,
        self.web3ContractInstance,
      )(
        _exchangeId,
      );
      return result;
    },
  };
  public redeemInVault = {
    async sendTransactionAsync(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.redeemInVault.estimateGasAsync.bind(
          self,
          _set,
          _quantity,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.redeemInVault, self.web3ContractInstance,
      )(
        _set,
        _quantity,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.redeemInVault.estimateGas, self.web3ContractInstance,
      )(
        _set,
        _quantity,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.redeemInVault.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _set: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.redeemInVault.call,
        self.web3ContractInstance,
      )(
        _set,
        _quantity,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public redeemAndWithdraw = {
    async sendTransactionAsync(
      _set: string,
      _quantity: BigNumber,
      _toExclude: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.redeemAndWithdraw.estimateGasAsync.bind(
          self,
          _set,
          _quantity,
          _toExclude,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.redeemAndWithdraw, self.web3ContractInstance,
      )(
        _set,
        _quantity,
        _toExclude,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _set: string,
      _quantity: BigNumber,
      _toExclude: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.redeemAndWithdraw.estimateGas, self.web3ContractInstance,
      )(
        _set,
        _quantity,
        _toExclude,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _set: string,
      _quantity: BigNumber,
      _toExclude: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.redeemAndWithdraw.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _set: string,
      _quantity: BigNumber,
      _toExclude: BigNumber,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.redeemAndWithdraw.call,
        self.web3ContractInstance,
      )(
        _set,
        _quantity,
        _toExclude,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public state = {
    async callAsync(
      defaultBlock?: any,
    ): Promise<[string, string]
  > {
      const self = this as CoreContract;
      const result = await promisify<[string, string]
  >(
        self.web3ContractInstance.state.call,
        self.web3ContractInstance,
      )(
      );
      return result;
    },
  };
  public batchWithdraw = {
    async sendTransactionAsync(
      _tokens: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.batchWithdraw.estimateGasAsync.bind(
          self,
          _tokens,
          _quantities,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.batchWithdraw, self.web3ContractInstance,
      )(
        _tokens,
        _quantities,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _tokens: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.batchWithdraw.estimateGas, self.web3ContractInstance,
      )(
        _tokens,
        _quantities,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _tokens: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.batchWithdraw.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _tokens: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.batchWithdraw.call,
        self.web3ContractInstance,
      )(
        _tokens,
        _quantities,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public fillOrder = {
    async sendTransactionAsync(
      _addresses: string[],
      _values: BigNumber[],
      _requiredComponents: string[],
      _requiredComponentAmounts: BigNumber[],
      _fillQuantity: BigNumber,
      _v: number|BigNumber,
      sigBytes: string[],
      _orderData: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.fillOrder.estimateGasAsync.bind(
          self,
          _addresses,
          _values,
          _requiredComponents,
          _requiredComponentAmounts,
          _fillQuantity,
          _v,
          sigBytes,
          _orderData,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.fillOrder, self.web3ContractInstance,
      )(
        _addresses,
        _values,
        _requiredComponents,
        _requiredComponentAmounts,
        _fillQuantity,
        _v,
        sigBytes,
        _orderData,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _addresses: string[],
      _values: BigNumber[],
      _requiredComponents: string[],
      _requiredComponentAmounts: BigNumber[],
      _fillQuantity: BigNumber,
      _v: number|BigNumber,
      sigBytes: string[],
      _orderData: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.fillOrder.estimateGas, self.web3ContractInstance,
      )(
        _addresses,
        _values,
        _requiredComponents,
        _requiredComponentAmounts,
        _fillQuantity,
        _v,
        sigBytes,
        _orderData,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _addresses: string[],
      _values: BigNumber[],
      _requiredComponents: string[],
      _requiredComponentAmounts: BigNumber[],
      _fillQuantity: BigNumber,
      _v: number|BigNumber,
      sigBytes: string[],
      _orderData: string,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.fillOrder.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _addresses: string[],
      _values: BigNumber[],
      _requiredComponents: string[],
      _requiredComponentAmounts: BigNumber[],
      _fillQuantity: BigNumber,
      _v: number|BigNumber,
      sigBytes: string[],
      _orderData: string,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.fillOrder.call,
        self.web3ContractInstance,
      )(
        _addresses,
        _values,
        _requiredComponents,
        _requiredComponentAmounts,
        _fillQuantity,
        _v,
        sigBytes,
        _orderData,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public transferOwnership = {
    async sendTransactionAsync(
      _newOwner: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.transferOwnership.estimateGasAsync.bind(
          self,
          _newOwner,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.transferOwnership, self.web3ContractInstance,
      )(
        _newOwner,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _newOwner: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.transferOwnership.estimateGas, self.web3ContractInstance,
      )(
        _newOwner,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _newOwner: string,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.transferOwnership.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _newOwner: string,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.transferOwnership.call,
        self.web3ContractInstance,
      )(
        _newOwner,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public withdraw = {
    async sendTransactionAsync(
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.withdraw.estimateGasAsync.bind(
          self,
          _token,
          _quantity,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.withdraw, self.web3ContractInstance,
      )(
        _token,
        _quantity,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.withdraw.estimateGas, self.web3ContractInstance,
      )(
        _token,
        _quantity,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.withdraw.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _token: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<void
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<void
  >(
        self.web3ContractInstance.withdraw.call,
        self.web3ContractInstance,
      )(
        _token,
        _quantity,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public create = {
    async sendTransactionAsync(
      _factory: string,
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      _callData: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.create.estimateGasAsync.bind(
          self,
          _factory,
          _components,
          _units,
          _naturalUnit,
          _name,
          _symbol,
          _callData,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.create, self.web3ContractInstance,
      )(
        _factory,
        _components,
        _units,
        _naturalUnit,
        _name,
        _symbol,
        _callData,
        txDataWithDefaults,
      );
      return txHash;
    },
    async estimateGasAsync(
      _factory: string,
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      _callData: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.create.estimateGas, self.web3ContractInstance,
      )(
        _factory,
        _components,
        _units,
        _naturalUnit,
        _name,
        _symbol,
        _callData,
        txDataWithDefaults,
      );
      return gas;
    },
    getABIEncodedTransactionData(
      _factory: string,
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      _callData: string,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.create.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _factory: string,
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      _callData: string,
      txData: TxData = {},
    ): Promise<string
  > {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<string
  >(
        self.web3ContractInstance.create.call,
        self.web3ContractInstance,
      )(
        _factory,
        _components,
        _units,
        _naturalUnit,
        _name,
        _symbol,
        _callData,
        txDataWithDefaults,
      );
      return result;
    },
  };
  public orderFills = {
    async callAsync(
      _orderHash: string,
      defaultBlock?: any,
    ): Promise<BigNumber
  > {
      const self = this as CoreContract;
      const result = await promisify<BigNumber
  >(
        self.web3ContractInstance.orderFills.call,
        self.web3ContractInstance,
      )(
        _orderHash,
      );
      return result;
    },
  };
  public vault = {
    async callAsync(
      defaultBlock?: any,
    ): Promise<string
  > {
      const self = this as CoreContract;
      const result = await promisify<string
  >(
        self.web3ContractInstance.vault.call,
        self.web3ContractInstance,
      )(
      );
      return result;
    },
  };
  public factories = {
    async callAsync(
      defaultBlock?: any,
    ): Promise<string[]
  > {
      const self = this as CoreContract;
      const result = await promisify<string[]
  >(
        self.web3ContractInstance.factories.call,
        self.web3ContractInstance,
      )(
      );
      return result;
    },
  };
  public validSets = {
    async callAsync(
      _set: string,
      defaultBlock?: any,
    ): Promise<boolean
  > {
      const self = this as CoreContract;
      const result = await promisify<boolean
  >(
        self.web3ContractInstance.validSets.call,
        self.web3ContractInstance,
      )(
        _set,
      );
      return result;
    },
  };
  async deploy(...args: any[]): Promise<any> {
    const wrapper = this;

    return new Promise((resolve, reject) => {
      wrapper.web3ContractInstance.new(
        wrapper.defaults,
        (err: string, contract: Web3.ContractInstance) => {
          if (err) {
            reject(err);
          } else if (contract.address) {
            wrapper.web3ContractInstance = wrapper.web3ContractInstance.at(contract.address);
            wrapper.address = contract.address;
            resolve();
          }
        },
      );
    });
  }
  static async deployed(web3: Web3, defaults: Partial<TxData>): Promise<CoreContract> {
    const currentNetwork = web3.version.network;
    const { abi, networks }: { abi: any; networks: any } = ContractArtifacts;
    const web3ContractInstance = web3.eth.contract(abi).at(networks[currentNetwork].address);

    return new CoreContract(web3ContractInstance, defaults);
  }
  static async at(
    address: string,
    web3: Web3,
    defaults: Partial<TxData>,
  ): Promise<CoreContract> {
    const { abi }: { abi: any } = ContractArtifacts;
    const web3Utils = new Web3Utils(web3);
    const contractExists = await web3Utils.doesContractExistAtAddressAsync(address);
    const currentNetwork = await web3Utils.getNetworkIdAsync();

    if (contractExists) {
      const web3ContractInstance = web3.eth.contract(abi).at(address);

      return new CoreContract(web3ContractInstance, defaults);
    } else {
      throw new Error(
        CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK('Core', currentNetwork),
      );
    }
  }
  constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
    super(web3ContractInstance, defaults);
    classUtils.bindAll(this, ['web3ContractInstance', 'defaults']);
  }
} // tslint:disable:max-file-line-count
