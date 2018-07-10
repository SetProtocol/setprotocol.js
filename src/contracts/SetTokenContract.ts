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
import { BigNumber } from "bignumber.js";
import { SetToken as ContractArtifacts } from "set-protocol-contracts";
import * as fs from "fs-extra";
import * as Web3 from "web3";

import { BaseContract, CONTRACT_WRAPPER_ERRORS } from "./BaseContract";
import { TxData, TxDataPayable } from "../types/common";
import { BigNumber, classUtils, Web3Utils } from "../util";

export class SetTokenContract extends BaseContract {
  public name = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as SetTokenContract;
      const result = await promisify<string>(
        self.web3ContractInstance.name.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public approve = {
    async sendTransactionAsync(
      _spender: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.approve.estimateGasAsync.bind(self, _spender, _value),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.approve,
        self.web3ContractInstance,
      )(_spender, _value, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _spender: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.approve.estimateGas,
        self.web3ContractInstance,
      )(_spender, _value, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_spender: string, _value: BigNumber, txData: TxData = {}): string {
      const self = this as SetTokenContract;
      const abiEncodedTransactionData = self.web3ContractInstance.approve.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_spender: string, _value: BigNumber, txData: TxData = {}): Promise<boolean> {
      const self = this as SetTokenContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.approve.call,
        self.web3ContractInstance,
      )(_spender, _value);
      return result;
    },
  };
  public totalSupply = {
    async callAsync(defaultBlock?: any): Promise<BigNumber> {
      const self = this as SetTokenContract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.totalSupply.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public decimals = {
    async callAsync(defaultBlock?: any): Promise<BigNumber> {
      const self = this as SetTokenContract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.decimals.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public naturalUnit = {
    async callAsync(defaultBlock?: any): Promise<BigNumber> {
      const self = this as SetTokenContract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.naturalUnit.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public decreaseApproval = {
    async sendTransactionAsync(
      _spender: string,
      _subtractedValue: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.decreaseApproval.estimateGasAsync.bind(self, _spender, _subtractedValue),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.decreaseApproval,
        self.web3ContractInstance,
      )(_spender, _subtractedValue, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _spender: string,
      _subtractedValue: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.decreaseApproval.estimateGas,
        self.web3ContractInstance,
      )(_spender, _subtractedValue, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _spender: string,
      _subtractedValue: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as SetTokenContract;
      const abiEncodedTransactionData = self.web3ContractInstance.decreaseApproval.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _spender: string,
      _subtractedValue: BigNumber,
      txData: TxData = {},
    ): Promise<boolean> {
      const self = this as SetTokenContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.decreaseApproval.call,
        self.web3ContractInstance,
      )(_spender, _subtractedValue);
      return result;
    },
  };
  public balanceOf = {
    async callAsync(_owner: string, defaultBlock?: any): Promise<BigNumber> {
      const self = this as SetTokenContract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.balanceOf.call,
        self.web3ContractInstance,
      )(_owner);
      return result;
    },
  };
  public symbol = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as SetTokenContract;
      const result = await promisify<string>(
        self.web3ContractInstance.symbol.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public factory = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as SetTokenContract;
      const result = await promisify<string>(
        self.web3ContractInstance.factory.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public components = {
    async callAsync(index_0: BigNumber, defaultBlock?: any): Promise<[string, BigNumber]> {
      const self = this as SetTokenContract;
      const result = await promisify<[string, BigNumber]>(
        self.web3ContractInstance.components.call,
        self.web3ContractInstance,
      )(index_0);
      return result;
    },
  };
  public increaseApproval = {
    async sendTransactionAsync(
      _spender: string,
      _addedValue: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.increaseApproval.estimateGasAsync.bind(self, _spender, _addedValue),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.increaseApproval,
        self.web3ContractInstance,
      )(_spender, _addedValue, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _spender: string,
      _addedValue: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.increaseApproval.estimateGas,
        self.web3ContractInstance,
      )(_spender, _addedValue, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _spender: string,
      _addedValue: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as SetTokenContract;
      const abiEncodedTransactionData = self.web3ContractInstance.increaseApproval.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _spender: string,
      _addedValue: BigNumber,
      txData: TxData = {},
    ): Promise<boolean> {
      const self = this as SetTokenContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.increaseApproval.call,
        self.web3ContractInstance,
      )(_spender, _addedValue);
      return result;
    },
  };
  public allowance = {
    async callAsync(_owner: string, _spender: string, defaultBlock?: any): Promise<BigNumber> {
      const self = this as SetTokenContract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.allowance.call,
        self.web3ContractInstance,
      )(_owner, _spender);
      return result;
    },
  };
  public mint = {
    async sendTransactionAsync(
      _issuer: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.mint.estimateGasAsync.bind(self, _issuer, _quantity),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.mint,
        self.web3ContractInstance,
      )(_issuer, _quantity, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _issuer: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.mint.estimateGas,
        self.web3ContractInstance,
      )(_issuer, _quantity, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _issuer: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as SetTokenContract;
      const abiEncodedTransactionData = self.web3ContractInstance.mint.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_issuer: string, _quantity: BigNumber, txData: TxData = {}): Promise<void> {
      const self = this as SetTokenContract;
      const result = await promisify<void>(
        self.web3ContractInstance.mint.call,
        self.web3ContractInstance,
      )(_issuer, _quantity);
      return result;
    },
  };
  public burn = {
    async sendTransactionAsync(
      _from: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.burn.estimateGasAsync.bind(self, _from, _quantity),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.burn,
        self.web3ContractInstance,
      )(_from, _quantity, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _from: string,
      _quantity: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.burn.estimateGas,
        self.web3ContractInstance,
      )(_from, _quantity, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_from: string, _quantity: BigNumber, txData: TxData = {}): string {
      const self = this as SetTokenContract;
      const abiEncodedTransactionData = self.web3ContractInstance.burn.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_from: string, _quantity: BigNumber, txData: TxData = {}): Promise<void> {
      const self = this as SetTokenContract;
      const result = await promisify<void>(
        self.web3ContractInstance.burn.call,
        self.web3ContractInstance,
      )(_from, _quantity);
      return result;
    },
  };
  public getComponents = {
    async callAsync(defaultBlock?: any): Promise<string[]> {
      const self = this as SetTokenContract;
      const result = await promisify<string[]>(
        self.web3ContractInstance.getComponents.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public getUnits = {
    async callAsync(defaultBlock?: any): Promise<BigNumber[]> {
      const self = this as SetTokenContract;
      const result = await promisify<BigNumber[]>(
        self.web3ContractInstance.getUnits.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public transfer = {
    async sendTransactionAsync(
      _to: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.transfer.estimateGasAsync.bind(self, _to, _value),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.transfer,
        self.web3ContractInstance,
      )(_to, _value, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_to: string, _value: BigNumber, txData: TxData = {}): Promise<number> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.transfer.estimateGas,
        self.web3ContractInstance,
      )(_to, _value, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_to: string, _value: BigNumber, txData: TxData = {}): string {
      const self = this as SetTokenContract;
      const abiEncodedTransactionData = self.web3ContractInstance.transfer.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_to: string, _value: BigNumber, txData: TxData = {}): Promise<boolean> {
      const self = this as SetTokenContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.transfer.call,
        self.web3ContractInstance,
      )(_to, _value);
      return result;
    },
  };
  public transferFrom = {
    async sendTransactionAsync(
      _from: string,
      _to: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.transferFrom.estimateGasAsync.bind(self, _from, _to, _value),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.transferFrom,
        self.web3ContractInstance,
      )(_from, _to, _value, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _from: string,
      _to: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as SetTokenContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.transferFrom.estimateGas,
        self.web3ContractInstance,
      )(_from, _to, _value, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _from: string,
      _to: string,
      _value: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as SetTokenContract;
      const abiEncodedTransactionData = self.web3ContractInstance.transferFrom.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _from: string,
      _to: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<boolean> {
      const self = this as SetTokenContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.transferFrom.call,
        self.web3ContractInstance,
      )(_from, _to, _value);
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
  static async deployed(web3: Web3, defaults: Partial<TxData>): Promise<SetTokenContract> {
    const currentNetwork = web3.version.network;
    const { abi, networks }: { abi: any; networks: any } = ContractArtifacts;
    const web3ContractInstance = web3.eth.contract(abi).at(networks[currentNetwork].address);

    return new SetTokenContract(web3ContractInstance, defaults);
  }
  static async at(
    address: string,
    web3: Web3,
    defaults: Partial<TxData>,
  ): Promise<SetTokenContract> {
    const { abi }: { abi: any } = ContractArtifacts;
    const web3Utils = new Web3Utils(web3);
    const contractExists = await web3Utils.doesContractExistAtAddressAsync(address);
    const currentNetwork = await web3Utils.getNetworkIdAsync();

    if (contractExists) {
      const web3ContractInstance = web3.eth.contract(abi).at(address);

      return new SetTokenContract(web3ContractInstance, defaults);
    } else {
      throw new Error(
        CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK("SetToken", currentNetwork),
      );
    }
  }
  constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
    super(web3ContractInstance, defaults);
    classUtils.bindAll(this, ["web3ContractInstance", "defaults"]);
  }
} // tslint:disable:max-file-line-count
