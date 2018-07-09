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

/**
 * This file is auto-generated using abi-gen. Don't edit directly.
 * Templates can be found at https://github.com/0xProject/0x.js/tree/development/packages/abi-gen-templates.
 */
// tslint:disable-next-line:no-unused-variable

import { promisify } from "@0xproject/utils";
import { TransferProxy as ContractArtifacts } from "set-protocol-contracts";
import * as Web3 from "web3";

import { BaseContract, CONTRACT_WRAPPER_ERRORS } from "./BaseContract";
import { TxData, TxDataPayable } from "../types/common";
import { BigNumber, classUtils, Web3Utils } from "../util";

export class TransferProxyContract extends BaseContract {
  public addAuthorizedAddress = {
    async sendTransactionAsync(_authTarget: string, txData: TxData = {}): Promise<string> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.addAuthorizedAddress.estimateGasAsync.bind(self, _authTarget),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.addAuthorizedAddress,
        self.web3ContractInstance,
      )(_authTarget, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_authTarget: string, txData: TxData = {}): Promise<number> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.addAuthorizedAddress.estimateGas,
        self.web3ContractInstance,
      )(_authTarget, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_authTarget: string, txData: TxData = {}): string {
      const self = this as TransferProxyContract;
      const abiEncodedTransactionData = self.web3ContractInstance.addAuthorizedAddress.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_authTarget: string, txData: TxData = {}): Promise<void> {
      const self = this as TransferProxyContract;
      const result = await promisify<void>(
        self.web3ContractInstance.addAuthorizedAddress.call,
        self.web3ContractInstance,
      )(_authTarget);
      return result;
    },
  };
  public vaultAddress = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as TransferProxyContract;
      const result = await promisify<string>(
        self.web3ContractInstance.vaultAddress.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public authorities = {
    async callAsync(index_0: BigNumber, defaultBlock?: any): Promise<string> {
      const self = this as TransferProxyContract;
      const result = await promisify<string>(
        self.web3ContractInstance.authorities.call,
        self.web3ContractInstance,
      )(index_0);
      return result;
    },
  };
  public removeAuthorizedAddress = {
    async sendTransactionAsync(_authTarget: string, txData: TxData = {}): Promise<string> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.removeAuthorizedAddress.estimateGasAsync.bind(self, _authTarget),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.removeAuthorizedAddress,
        self.web3ContractInstance,
      )(_authTarget, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_authTarget: string, txData: TxData = {}): Promise<number> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.removeAuthorizedAddress.estimateGas,
        self.web3ContractInstance,
      )(_authTarget, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_authTarget: string, txData: TxData = {}): string {
      const self = this as TransferProxyContract;
      const abiEncodedTransactionData = self.web3ContractInstance.removeAuthorizedAddress.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_authTarget: string, txData: TxData = {}): Promise<void> {
      const self = this as TransferProxyContract;
      const result = await promisify<void>(
        self.web3ContractInstance.removeAuthorizedAddress.call,
        self.web3ContractInstance,
      )(_authTarget);
      return result;
    },
  };
  public renounceOwnership = {
    async sendTransactionAsync(txData: TxData = {}): Promise<string> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.renounceOwnership.estimateGasAsync.bind(self),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.renounceOwnership,
        self.web3ContractInstance,
      )(txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(txData: TxData = {}): Promise<number> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.renounceOwnership.estimateGas,
        self.web3ContractInstance,
      )(txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(txData: TxData = {}): string {
      const self = this as TransferProxyContract;
      const abiEncodedTransactionData = self.web3ContractInstance.renounceOwnership.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(txData: TxData = {}): Promise<void> {
      const self = this as TransferProxyContract;
      const result = await promisify<void>(
        self.web3ContractInstance.renounceOwnership.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public owner = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as TransferProxyContract;
      const result = await promisify<string>(
        self.web3ContractInstance.owner.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public removeAuthorizedAddressAtIndex = {
    async sendTransactionAsync(
      _authTarget: string,
      _index: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.removeAuthorizedAddressAtIndex.estimateGasAsync.bind(self, _authTarget, _index),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.removeAuthorizedAddressAtIndex,
        self.web3ContractInstance,
      )(_authTarget, _index, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _authTarget: string,
      _index: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.removeAuthorizedAddressAtIndex.estimateGas,
        self.web3ContractInstance,
      )(_authTarget, _index, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _authTarget: string,
      _index: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as TransferProxyContract;
      const abiEncodedTransactionData = self.web3ContractInstance.removeAuthorizedAddressAtIndex.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_authTarget: string, _index: BigNumber, txData: TxData = {}): Promise<void> {
      const self = this as TransferProxyContract;
      const result = await promisify<void>(
        self.web3ContractInstance.removeAuthorizedAddressAtIndex.call,
        self.web3ContractInstance,
      )(_authTarget, _index);
      return result;
    },
  };
  public authorized = {
    async callAsync(index_0: string, defaultBlock?: any): Promise<boolean> {
      const self = this as TransferProxyContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.authorized.call,
        self.web3ContractInstance,
      )(index_0);
      return result;
    },
  };
  public getAuthorizedAddresses = {
    async callAsync(defaultBlock?: any): Promise<string[]> {
      const self = this as TransferProxyContract;
      const result = await promisify<string[]>(
        self.web3ContractInstance.getAuthorizedAddresses.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public transferOwnership = {
    async sendTransactionAsync(_newOwner: string, txData: TxData = {}): Promise<string> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.transferOwnership.estimateGasAsync.bind(self, _newOwner),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.transferOwnership,
        self.web3ContractInstance,
      )(_newOwner, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_newOwner: string, txData: TxData = {}): Promise<number> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.transferOwnership.estimateGas,
        self.web3ContractInstance,
      )(_newOwner, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_newOwner: string, txData: TxData = {}): string {
      const self = this as TransferProxyContract;
      const abiEncodedTransactionData = self.web3ContractInstance.transferOwnership.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_newOwner: string, txData: TxData = {}): Promise<void> {
      const self = this as TransferProxyContract;
      const result = await promisify<void>(
        self.web3ContractInstance.transferOwnership.call,
        self.web3ContractInstance,
      )(_newOwner);
      return result;
    },
  };
  public setVaultAddress = {
    async sendTransactionAsync(_vaultAddress: string, txData: TxData = {}): Promise<string> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.setVaultAddress.estimateGasAsync.bind(self, _vaultAddress),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.setVaultAddress,
        self.web3ContractInstance,
      )(_vaultAddress, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_vaultAddress: string, txData: TxData = {}): Promise<number> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.setVaultAddress.estimateGas,
        self.web3ContractInstance,
      )(_vaultAddress, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_vaultAddress: string, txData: TxData = {}): string {
      const self = this as TransferProxyContract;
      const abiEncodedTransactionData = self.web3ContractInstance.setVaultAddress.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_vaultAddress: string, txData: TxData = {}): Promise<void> {
      const self = this as TransferProxyContract;
      const result = await promisify<void>(
        self.web3ContractInstance.setVaultAddress.call,
        self.web3ContractInstance,
      )(_vaultAddress);
      return result;
    },
  };
  public transferToVault = {
    async sendTransactionAsync(
      _from: string,
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.transferToVault.estimateGasAsync.bind(self, _from, _tokenAddress, _quantity),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.transferToVault,
        self.web3ContractInstance,
      )(_from, _tokenAddress, _quantity, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _from: string,
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as TransferProxyContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.transferToVault.estimateGas,
        self.web3ContractInstance,
      )(_from, _tokenAddress, _quantity, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _from: string,
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as TransferProxyContract;
      const abiEncodedTransactionData = self.web3ContractInstance.transferToVault.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _from: string,
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<void> {
      const self = this as TransferProxyContract;
      const result = await promisify<void>(
        self.web3ContractInstance.transferToVault.call,
        self.web3ContractInstance,
      )(_from, _tokenAddress, _quantity);
      return result;
    },
  };
  static async deployed(web3: Web3, defaults: Partial<TxData>): Promise<TransferProxyContract> {
    const currentNetwork = web3.version.network;
    const { abi, networks }: { abi: any; networks: any } = ContractArtifacts;
    const web3ContractInstance = web3.eth.contract(abi).at(networks[currentNetwork].address);

    return new TransferProxyContract(web3ContractInstance, defaults);
  }
  static async at(
    address: string,
    web3: Web3,
    defaults: Partial<TxData>,
  ): Promise<TransferProxyContract> {
    const { abi }: { abi: any } = ContractArtifacts;
    const web3Utils = new Web3Utils(web3);
    const contractExists = await web3Utils.doesContractExistAtAddressAsync(address);
    const currentNetwork = await web3Utils.getNetworkIdAsync();

    if (contractExists) {
      const web3ContractInstance = web3.eth.contract(abi).at(address);

      return new TransferProxyContract(web3ContractInstance, defaults);
    } else {
      throw new Error(
        CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK("TransferProxy", currentNetwork),
      );
    }
  }
  constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
    super(web3ContractInstance, defaults);
    classUtils.bindAll(this, ["web3ContractInstance", "defaults"]);
  }
} // tslint:disable:max-file-line-count
