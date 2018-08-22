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
import { SetTokenFactory as ContractArtifacts } from 'set-protocol-contracts';
import * as Web3 from 'web3';

import { BaseContract, CONTRACT_WRAPPER_ERRORS } from './BaseContract';
import { TxData } from '../types/common';
import { BigNumber, classUtils, Web3Utils } from '../util';

export class SetTokenFactoryContract extends BaseContract {
  public core = {
    async callAsync(
      defaultBlock?: any,
    ): Promise<string> {
      const self = this as SetTokenFactoryContract;
      const result = await promisify<string>(
        self.web3ContractInstance.core.call,
        self.web3ContractInstance,
      )(
      );
      return result;
    },
  };
  public create = {
    async sendTransactionAsync(
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      _callData: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenFactoryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.create.estimateGasAsync.bind(
          self,
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
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      _callData: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as SetTokenFactoryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const gas = await promisify<number>(
        self.web3ContractInstance.create.estimateGas, self.web3ContractInstance,
      )(
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
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      _callData: string,
      txData: TxData = {},
    ): string {
      const self = this as SetTokenFactoryContract;
      const abiEncodedTransactionData = self.web3ContractInstance.create.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _components: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      _callData: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenFactoryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
      );
      const result = await promisify<string>(
        self.web3ContractInstance.create.call,
        self.web3ContractInstance,
      )(
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
  static async deployed(web3: Web3, defaults: Partial<TxData>): Promise<SetTokenFactoryContract> {
    const currentNetwork = web3.version.network;
    const { abi, networks }: { abi: any; networks: any } = ContractArtifacts;
    const web3ContractInstance = web3.eth.contract(abi).at(networks[currentNetwork].address);

    return new SetTokenFactoryContract(web3ContractInstance, defaults);
  }
  static async at(
    address: string,
    web3: Web3,
    defaults: Partial<TxData>,
  ): Promise<SetTokenFactoryContract> {
    const { abi }: { abi: any } = ContractArtifacts;
    const web3Utils = new Web3Utils(web3);
    const contractExists = await web3Utils.doesContractExistAtAddressAsync(address);
    const currentNetwork = await web3Utils.getNetworkIdAsync();

    if (contractExists) {
      const web3ContractInstance = web3.eth.contract(abi).at(address);

      return new SetTokenFactoryContract(web3ContractInstance, defaults);
    } else {
      throw new Error(
        CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK('SetTokenFactory', currentNetwork),
      );
    }
  }
  constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
    super(web3ContractInstance, defaults);
    classUtils.bindAll(this, ['web3ContractInstance', 'defaults']);
  }
} // tslint:disable:max-file-line-count
