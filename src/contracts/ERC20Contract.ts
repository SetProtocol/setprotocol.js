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
import { ERC20 as ContractArtifacts } from 'set-protocol-contracts';
import * as Web3 from 'web3';

import { BaseContract, CONTRACT_WRAPPER_ERRORS } from './BaseContract';
import { TxData } from '../types/common';
import { BigNumber, classUtils, Web3Utils } from '../util';

export class ERC20Contract extends BaseContract {
  public totalSupply = {
    async callAsync(defaultBlock?: any): Promise<BigNumber> {
      const self = this as ERC20Contract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.totalSupply.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public balanceOf = {
    async callAsync(who: string, defaultBlock?: any): Promise<BigNumber> {
      const self = this as ERC20Contract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.balanceOf.call,
        self.web3ContractInstance,
      )(who);
      return result;
    },
  };
  public transfer = {
    async sendTransactionAsync(to: string, value: BigNumber, txData: TxData = {}): Promise<string> {
      const self = this as ERC20Contract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.transfer.estimateGasAsync.bind(self, to, value),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.transfer,
        self.web3ContractInstance,
      )(to, value, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(to: string, value: BigNumber, txData: TxData = {}): Promise<number> {
      const self = this as ERC20Contract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.transfer.estimateGas,
        self.web3ContractInstance,
      )(to, value, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(to: string, value: BigNumber, txData: TxData = {}): string {
      const self = this as ERC20Contract;
      const abiEncodedTransactionData = self.web3ContractInstance.transfer.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(to: string, value: BigNumber, txData: TxData = {}): Promise<boolean> {
      const self = this as ERC20Contract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.transfer.call,
        self.web3ContractInstance,
      )(to, value);
      return result;
    },
  };
  public allowance = {
    async callAsync(owner: string, spender: string, defaultBlock?: any): Promise<BigNumber> {
      const self = this as ERC20Contract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.allowance.call,
        self.web3ContractInstance,
      )(owner, spender);
      return result;
    },
  };
  public transferFrom = {
    async sendTransactionAsync(
      from: string,
      to: string,
      value: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as ERC20Contract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.transferFrom.estimateGasAsync.bind(self, from, to, value),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.transferFrom,
        self.web3ContractInstance,
      )(from, to, value, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      from: string,
      to: string,
      value: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as ERC20Contract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.transferFrom.estimateGas,
        self.web3ContractInstance,
      )(from, to, value, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      from: string,
      to: string,
      value: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as ERC20Contract;
      const abiEncodedTransactionData = self.web3ContractInstance.transferFrom.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      from: string,
      to: string,
      value: BigNumber,
      txData: TxData = {},
    ): Promise<boolean> {
      const self = this as ERC20Contract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.transferFrom.call,
        self.web3ContractInstance,
      )(from, to, value);
      return result;
    },
  };
  public approve = {
    async sendTransactionAsync(
      spender: string,
      value: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as ERC20Contract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.approve.estimateGasAsync.bind(self, spender, value),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.approve,
        self.web3ContractInstance,
      )(spender, value, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      spender: string,
      value: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as ERC20Contract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.approve.estimateGas,
        self.web3ContractInstance,
      )(spender, value, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(spender: string, value: BigNumber, txData: TxData = {}): string {
      const self = this as ERC20Contract;
      const abiEncodedTransactionData = self.web3ContractInstance.approve.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(spender: string, value: BigNumber, txData: TxData = {}): Promise<boolean> {
      const self = this as ERC20Contract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.approve.call,
        self.web3ContractInstance,
      )(spender, value);
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
  static async deployed(web3: Web3, defaults: Partial<TxData>): Promise<ERC20Contract> {
    const currentNetwork = web3.version.network;
    const { abi, networks }: { abi: any; networks: any } = ContractArtifacts;
    const web3ContractInstance = web3.eth.contract(abi).at(networks[currentNetwork].address);

    return new ERC20Contract(web3ContractInstance, defaults);
  }
  static async at(address: string, web3: Web3, defaults: Partial<TxData>): Promise<ERC20Contract> {
    const { abi }: { abi: any } = ContractArtifacts;
    const web3Utils = new Web3Utils(web3);
    const contractExists = await web3Utils.doesContractExistAtAddressAsync(address);
    const currentNetwork = await web3Utils.getNetworkIdAsync();

    if (contractExists) {
      const web3ContractInstance = web3.eth.contract(abi).at(address);

      return new ERC20Contract(web3ContractInstance, defaults);
    } else {
      throw new Error(
        CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK('ERC20', currentNetwork),
      );
    }
  }
  constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
    super(web3ContractInstance, defaults);
    classUtils.bindAll(this, ['web3ContractInstance', 'defaults']);
  }
} // tslint:disable:max-file-line-count
