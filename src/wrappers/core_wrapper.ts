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

import { TxData, TxDataPayable } from "../types/common";
import { promisify } from "@0xproject/utils";
import { classUtils } from "../types/common";
import { BigNumber } from "../util/bignumber";
import { Web3Utils } from "../util/web3_utils";
import { Core as ContractArtifacts } from "set-protocol-contracts";
import * as Web3 from "web3";

import { BaseContract, CONTRACT_WRAPPER_ERRORS } from "./base_wrapper";

export class CoreContract extends BaseContract {
  public validFactories = {
    async callAsync(index_0: string, defaultBlock?: any): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.validFactories.call,
        self.web3ContractInstance,
      )(index_0);
      return result;
    },
  };
  public vaultAddress = {
    async callAsync(defaultBlock?: any): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.vaultAddress.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public renounceOwnership = {
    async sendTransactionAsync(txData: TxData = {}): Promise<string> {
      const self = this as CoreContract;
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
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.renounceOwnership.estimateGas,
        self.web3ContractInstance,
      )(txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(txData: TxData = {}): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.renounceOwnership.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(txData: TxData = {}): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.renounceOwnership.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public transferProxyAddress = {
    async callAsync(defaultBlock?: any): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.transferProxyAddress.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public owner = {
    async callAsync(defaultBlock?: any): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.owner.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public transferOwnership = {
    async sendTransactionAsync(_newOwner: string, txData: TxData = {}): Promise<string> {
      const self = this as CoreContract;
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
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.transferOwnership.estimateGas,
        self.web3ContractInstance,
      )(_newOwner, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_newOwner: string, txData: TxData = {}): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.transferOwnership.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_newOwner: string, txData: TxData = {}): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.transferOwnership.call,
        self.web3ContractInstance,
      )(_newOwner);
      return result;
    },
  };
  public validSets = {
    async callAsync(index_0: string, defaultBlock?: any): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.validSets.call,
        self.web3ContractInstance,
      )(index_0);
      return result;
    },
  };
  public setVaultAddress = {
    async sendTransactionAsync(_vaultAddress: string, txData: TxData = {}): Promise<string> {
      const self = this as CoreContract;
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
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.setVaultAddress.estimateGas,
        self.web3ContractInstance,
      )(_vaultAddress, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_vaultAddress: string, txData: TxData = {}): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.setVaultAddress.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_vaultAddress: string, txData: TxData = {}): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.setVaultAddress.call,
        self.web3ContractInstance,
      )(_vaultAddress);
      return result;
    },
  };
  public setTransferProxyAddress = {
    async sendTransactionAsync(
      _transferProxyAddress: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.setTransferProxyAddress.estimateGasAsync.bind(self, _transferProxyAddress),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.setTransferProxyAddress,
        self.web3ContractInstance,
      )(_transferProxyAddress, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_transferProxyAddress: string, txData: TxData = {}): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.setTransferProxyAddress.estimateGas,
        self.web3ContractInstance,
      )(_transferProxyAddress, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_transferProxyAddress: string, txData: TxData = {}): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.setTransferProxyAddress.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_transferProxyAddress: string, txData: TxData = {}): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.setTransferProxyAddress.call,
        self.web3ContractInstance,
      )(_transferProxyAddress);
      return result;
    },
  };
  public addFactory = {
    async sendTransactionAsync(_factoryAddress: string, txData: TxData = {}): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.addFactory.estimateGasAsync.bind(self, _factoryAddress),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.addFactory,
        self.web3ContractInstance,
      )(_factoryAddress, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_factoryAddress: string, txData: TxData = {}): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.addFactory.estimateGas,
        self.web3ContractInstance,
      )(_factoryAddress, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_factoryAddress: string, txData: TxData = {}): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.addFactory.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_factoryAddress: string, txData: TxData = {}): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.addFactory.call,
        self.web3ContractInstance,
      )(_factoryAddress);
      return result;
    },
  };
  public removeFactory = {
    async sendTransactionAsync(_factoryAddress: string, txData: TxData = {}): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.removeFactory.estimateGasAsync.bind(self, _factoryAddress),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.removeFactory,
        self.web3ContractInstance,
      )(_factoryAddress, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_factoryAddress: string, txData: TxData = {}): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.removeFactory.estimateGas,
        self.web3ContractInstance,
      )(_factoryAddress, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_factoryAddress: string, txData: TxData = {}): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.removeFactory.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_factoryAddress: string, txData: TxData = {}): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.removeFactory.call,
        self.web3ContractInstance,
      )(_factoryAddress);
      return result;
    },
  };
  public issue = {
    async sendTransactionAsync(
      _setAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.issue.estimateGasAsync.bind(self, _setAddress, _quantity),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.issue,
        self.web3ContractInstance,
      )(_setAddress, _quantity, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _setAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.issue.estimateGas,
        self.web3ContractInstance,
      )(_setAddress, _quantity, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _setAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.issue.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_setAddress: string, _quantity: BigNumber, txData: TxData = {}): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.issue.call,
        self.web3ContractInstance,
      )(_setAddress, _quantity);
      return result;
    },
  };
  public batchDeposit = {
    async sendTransactionAsync(
      _tokenAddresses: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.batchDeposit.estimateGasAsync.bind(self, _tokenAddresses, _quantities),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.batchDeposit,
        self.web3ContractInstance,
      )(_tokenAddresses, _quantities, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _tokenAddresses: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.batchDeposit.estimateGas,
        self.web3ContractInstance,
      )(_tokenAddresses, _quantities, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _tokenAddresses: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.batchDeposit.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _tokenAddresses: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.batchDeposit.call,
        self.web3ContractInstance,
      )(_tokenAddresses, _quantities);
      return result;
    },
  };
  public batchWithdraw = {
    async sendTransactionAsync(
      _tokenAddresses: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.batchWithdraw.estimateGasAsync.bind(self, _tokenAddresses, _quantities),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.batchWithdraw,
        self.web3ContractInstance,
      )(_tokenAddresses, _quantities, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _tokenAddresses: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.batchWithdraw.estimateGas,
        self.web3ContractInstance,
      )(_tokenAddresses, _quantities, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _tokenAddresses: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.batchWithdraw.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _tokenAddresses: string[],
      _quantities: BigNumber[],
      txData: TxData = {},
    ): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.batchWithdraw.call,
        self.web3ContractInstance,
      )(_tokenAddresses, _quantities);
      return result;
    },
  };
  public deposit = {
    async sendTransactionAsync(
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.deposit.estimateGasAsync.bind(self, _tokenAddress, _quantity),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.deposit,
        self.web3ContractInstance,
      )(_tokenAddress, _quantity, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.deposit.estimateGas,
        self.web3ContractInstance,
      )(_tokenAddress, _quantity, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.deposit.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.deposit.call,
        self.web3ContractInstance,
      )(_tokenAddress, _quantity);
      return result;
    },
  };
  public withdraw = {
    async sendTransactionAsync(
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.withdraw.estimateGasAsync.bind(self, _tokenAddress, _quantity),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.withdraw,
        self.web3ContractInstance,
      )(_tokenAddress, _quantity, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.withdraw.estimateGas,
        self.web3ContractInstance,
      )(_tokenAddress, _quantity, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.withdraw.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _tokenAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.withdraw.call,
        self.web3ContractInstance,
      )(_tokenAddress, _quantity);
      return result;
    },
  };
  public create = {
    async sendTransactionAsync(
      _factoryAddress: string,
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.create.estimateGasAsync.bind(
          self,
          _factoryAddress,
          _components,
          _units,
          _naturalUnit,
          _name,
          _symbol,
        ),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.create,
        self.web3ContractInstance,
      )(_factoryAddress, _components, _units, _naturalUnit, _name, _symbol, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _factoryAddress: string,
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.create.estimateGas,
        self.web3ContractInstance,
      )(_factoryAddress, _components, _units, _naturalUnit, _name, _symbol, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _factoryAddress: string,
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.create.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _factoryAddress: string,
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      txData: TxData = {},
    ): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.create.call,
        self.web3ContractInstance,
      )(_factoryAddress, _components, _units, _naturalUnit, _name, _symbol);
      return result;
    },
  };
  public redeem = {
    async sendTransactionAsync(
      _setAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.redeem.estimateGasAsync.bind(self, _setAddress, _quantity),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.redeem,
        self.web3ContractInstance,
      )(_setAddress, _quantity, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _setAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as CoreContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.redeem.estimateGas,
        self.web3ContractInstance,
      )(_setAddress, _quantity, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _setAddress: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as CoreContract;
      const abiEncodedTransactionData = self.web3ContractInstance.redeem.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_setAddress: string, _quantity: BigNumber, txData: TxData = {}): Promise<void> {
      const self = this as CoreContract;
      const result = await promisify<void>(
        self.web3ContractInstance.redeem.call,
        self.web3ContractInstance,
      )(_setAddress, _quantity);
      return result;
    },
  };
  async deploy(...args: any[]): Promise<any> {
    const wrapper = this;
    const rejected = false;

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
  static async at(address: string, web3: Web3, defaults: Partial<TxData>): Promise<CoreContract> {
    const { abi }: { abi: any } = ContractArtifacts;
    const web3Utils = new Web3Utils(web3);
    const contractExists = await web3Utils.doesContractExistAtAddressAsync(address);
    const currentNetwork = await web3Utils.getNetworkIdAsync();

    if (contractExists) {
      const web3ContractInstance = web3.eth.contract(abi).at(address);

      return new CoreContract(web3ContractInstance, defaults);
    } else {
      throw new Error(
        CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK("Core", currentNetwork),
      );
    }
  }
  constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
    super(web3ContractInstance, defaults);
    classUtils.bindAll(this, ["web3ContractInstance", "defaults"]);
  }
} // tslint:disable:max-file-line-count
