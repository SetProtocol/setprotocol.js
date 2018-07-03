/**
 * This file is auto-generated using abi-gen. Don't edit directly.
 * Templates can be found at https://github.com/0xProject/0x.js/tree/development/packages/abi-gen-templates.
 */
// tslint:disable-next-line:no-unused-variable
import { promisify } from "@0xproject/utils";
import { BigNumber } from "bignumber.js";
import * as fs from "fs-extra";
import * as Web3 from "web3";

import { classUtils, TxData, TxDataPayable } from "../types/common";
import { BaseContract } from "./base_contract";

export class CoreContract extends BaseContract {
  public validFactories = {
    async callAsync(index_0: string, defaultBlock?: any): Promise<boolean> {
      const self = this as CoreContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.validFactories.call,
        self.web3ContractInstance,
      )(index_0);
      return result;
    },
  };
  public vaultAddress = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as CoreContract;
      const result = await promisify<string>(
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
  };
  public transferProxyAddress = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as CoreContract;
      const result = await promisify<string>(
        self.web3ContractInstance.transferProxyAddress.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public owner = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as CoreContract;
      const result = await promisify<string>(
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
  };
  public validSets = {
    async callAsync(index_0: string, defaultBlock?: any): Promise<boolean> {
      const self = this as CoreContract;
      const result = await promisify<boolean>(
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
    const { abi, networks } = await this.getArtifactsData(web3);
    const web3ContractInstance = web3.eth.contract(abi).at(networks[currentNetwork].address);

    return new CoreContract(web3ContractInstance, defaults);
  }
  static async at(address: string, web3: Web3, defaults: Partial<TxData>): Promise<CoreContract> {
    const { abi } = await this.getArtifactsData(web3);
    const web3ContractInstance = web3.eth.contract(abi).at(address);

    return new CoreContract(web3ContractInstance, defaults);
  }
  private static async getArtifactsData(web3: Web3): Promise<any> {
    try {
      const artifact = await fs.readFile("build/contracts/Core.json", "utf8");
      const { abi, networks } = JSON.parse(artifact);
      return { abi, networks };
    } catch (e) {
      console.error("Artifacts malformed or nonexistent: " + e.toString());
    }
  }
  constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
    super(web3ContractInstance, defaults);
    classUtils.bindAll(this, ["web3ContractInstance", "defaults"]);
  }
} // tslint:disable:max-file-line-count
