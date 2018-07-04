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
import { SetTokenRegistry as ContractArtifacts } from "set-protocol-contracts";
import * as Web3 from "web3";

import { BaseContract, CONTRACT_WRAPPER_ERRORS } from "./base_contract";

export class SetTokenRegistryContract extends BaseContract {
  public setAddressByHashedSymbol = {
    async callAsync(index_0: string, defaultBlock?: any): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const result = await promisify<string>(
        self.web3ContractInstance.setAddressByHashedSymbol.call,
        self.web3ContractInstance,
      )(index_0);
      return result;
    },
  };
  public setAddressByHashedName = {
    async callAsync(index_0: string, defaultBlock?: any): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const result = await promisify<string>(
        self.web3ContractInstance.setAddressByHashedName.call,
        self.web3ContractInstance,
      )(index_0);
      return result;
    },
  };
  public setAddresses = {
    async callAsync(index_0: BigNumber, defaultBlock?: any): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const result = await promisify<string>(
        self.web3ContractInstance.setAddresses.call,
        self.web3ContractInstance,
      )(index_0);
      return result;
    },
  };
  public sets = {
    async callAsync(index_0: string, defaultBlock?: any): Promise<[string, string, string]> {
      const self = this as SetTokenRegistryContract;
      const result = await promisify<[string, string, string]>(
        self.web3ContractInstance.sets.call,
        self.web3ContractInstance,
      )(index_0);
      return result;
    },
  };
  public owner = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const result = await promisify<string>(
        self.web3ContractInstance.owner.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public transferOwnership = {
    async sendTransactionAsync(newOwner: string, txData: TxData = {}): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.transferOwnership.estimateGasAsync.bind(self, newOwner),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.transferOwnership,
        self.web3ContractInstance,
      )(newOwner, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(newOwner: string, txData: TxData = {}): Promise<number> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.transferOwnership.estimateGas,
        self.web3ContractInstance,
      )(newOwner, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(newOwner: string, txData: TxData = {}): string {
      const self = this as SetTokenRegistryContract;
      const abiEncodedTransactionData = self.web3ContractInstance.transferOwnership.getData();
      return abiEncodedTransactionData;
    },
  };
  public create = {
    async sendTransactionAsync(
      _tokens: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.create.estimateGasAsync.bind(self, _tokens, _units, _naturalUnit, _name, _symbol),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.create,
        self.web3ContractInstance,
      )(_tokens, _units, _naturalUnit, _name, _symbol, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _tokens: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.create.estimateGas,
        self.web3ContractInstance,
      )(_tokens, _units, _naturalUnit, _name, _symbol, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _tokens: string[],
      _units: BigNumber[],
      _naturalUnit: BigNumber,
      _name: string,
      _symbol: string,
      txData: TxData = {},
    ): string {
      const self = this as SetTokenRegistryContract;
      const abiEncodedTransactionData = self.web3ContractInstance.create.getData();
      return abiEncodedTransactionData;
    },
  };
  public add = {
    async sendTransactionAsync(
      _set: string,
      _name: string,
      _symbol: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.add.estimateGasAsync.bind(self, _set, _name, _symbol),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.add,
        self.web3ContractInstance,
      )(_set, _name, _symbol, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _set: string,
      _name: string,
      _symbol: string,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.add.estimateGas,
        self.web3ContractInstance,
      )(_set, _name, _symbol, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _set: string,
      _name: string,
      _symbol: string,
      txData: TxData = {},
    ): string {
      const self = this as SetTokenRegistryContract;
      const abiEncodedTransactionData = self.web3ContractInstance.add.getData();
      return abiEncodedTransactionData;
    },
  };
  public remove = {
    async sendTransactionAsync(
      _set: string,
      _setAddressIndex: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.remove.estimateGasAsync.bind(self, _set, _setAddressIndex),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.remove,
        self.web3ContractInstance,
      )(_set, _setAddressIndex, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _set: string,
      _setAddressIndex: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.remove.estimateGas,
        self.web3ContractInstance,
      )(_set, _setAddressIndex, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _set: string,
      _setAddressIndex: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as SetTokenRegistryContract;
      const abiEncodedTransactionData = self.web3ContractInstance.remove.getData();
      return abiEncodedTransactionData;
    },
  };
  public modifySetName = {
    async sendTransactionAsync(_set: string, _name: string, txData: TxData = {}): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.modifySetName.estimateGasAsync.bind(self, _set, _name),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.modifySetName,
        self.web3ContractInstance,
      )(_set, _name, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_set: string, _name: string, txData: TxData = {}): Promise<number> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.modifySetName.estimateGas,
        self.web3ContractInstance,
      )(_set, _name, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_set: string, _name: string, txData: TxData = {}): string {
      const self = this as SetTokenRegistryContract;
      const abiEncodedTransactionData = self.web3ContractInstance.modifySetName.getData();
      return abiEncodedTransactionData;
    },
  };
  public modifySetSymbol = {
    async sendTransactionAsync(
      _set: string,
      _symbol: string,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.modifySetSymbol.estimateGasAsync.bind(self, _set, _symbol),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.modifySetSymbol,
        self.web3ContractInstance,
      )(_set, _symbol, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_set: string, _symbol: string, txData: TxData = {}): Promise<number> {
      const self = this as SetTokenRegistryContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.modifySetSymbol.estimateGas,
        self.web3ContractInstance,
      )(_set, _symbol, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_set: string, _symbol: string, txData: TxData = {}): string {
      const self = this as SetTokenRegistryContract;
      const abiEncodedTransactionData = self.web3ContractInstance.modifySetSymbol.getData();
      return abiEncodedTransactionData;
    },
  };
  public getSetAddresses = {
    async callAsync(defaultBlock?: any): Promise<string[]> {
      const self = this as SetTokenRegistryContract;
      const result = await promisify<string[]>(
        self.web3ContractInstance.getSetAddresses.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public getSetAddressBySymbol = {
    async callAsync(_setSymbol: string, defaultBlock?: any): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const result = await promisify<string>(
        self.web3ContractInstance.getSetAddressBySymbol.call,
        self.web3ContractInstance,
      )(_setSymbol);
      return result;
    },
  };
  public getSetCount = {
    async callAsync(defaultBlock?: any): Promise<BigNumber> {
      const self = this as SetTokenRegistryContract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.getSetCount.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public getSetAddressByName = {
    async callAsync(_name: string, defaultBlock?: any): Promise<string> {
      const self = this as SetTokenRegistryContract;
      const result = await promisify<string>(
        self.web3ContractInstance.getSetAddressByName.call,
        self.web3ContractInstance,
      )(_name);
      return result;
    },
  };
  public getSetMetadata = {
    async callAsync(_set: string, defaultBlock?: any): Promise<[string, string, string]> {
      const self = this as SetTokenRegistryContract;
      const result = await promisify<[string, string, string]>(
        self.web3ContractInstance.getSetMetadata.call,
        self.web3ContractInstance,
      )(_set);
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
  static async deployed(web3: Web3, defaults: Partial<TxData>): Promise<SetTokenRegistryContract> {
    const currentNetwork = web3.version.network;
    const { abi, networks }: { abi: any; networks: any } = ContractArtifacts;
    const web3ContractInstance = web3.eth.contract(abi).at(networks[currentNetwork].address);

    return new SetTokenRegistryContract(web3ContractInstance, defaults);
  }
  static async at(
    address: string,
    web3: Web3,
    defaults: Partial<TxData>,
  ): Promise<SetTokenRegistryContract> {
    const { abi }: { abi: any } = ContractArtifacts;

    const web3Utils = new Web3Utils(web3);
    const contractExists = await web3Utils.doesContractExistAtAddressAsync(address);
    const currentNetwork = await web3Utils.getNetworkIdAsync();

    if (contractExists) {
      const web3ContractInstance = web3.eth.contract(abi).at(address);

      return new SetTokenRegistryContract(web3ContractInstance, defaults);
    } else {
      throw new Error(
        CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK("SetTokenRegistry", currentNetwork),
      );
    }
  }
  constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
    super(web3ContractInstance, defaults);
    classUtils.bindAll(this, ["web3ContractInstance", "defaults"]);
  }
} // tslint:disable:max-file-line-count
