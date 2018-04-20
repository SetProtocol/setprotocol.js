/**
 * This file is auto-generated using abi-gen. Don't edit directly.
 * Templates can be found at https://github.com/0xProject/0x.js/tree/development/packages/abi-gen-templates.
 */
// tslint:disable-next-line:no-unused-variable
import { TxData, TxDataPayable, classUtils } from '../types/common';
import { promisify } from '@0xproject/utils';
import { BigNumber } from 'bignumber.js';
import * as fs from "fs-extra";
import * as Web3 from 'web3';

import { BaseContract } from './base_contract';

export class DetailedERC20Contract extends BaseContract {
    public name = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<string
    > {
            const self = this as DetailedERC20Contract;
            const result = await promisify<string
    >(
                self.web3ContractInstance.name.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public approve = {
        async sendTransactionAsync(
            spender: string,
            value: BigNumber,
            txData: TxData = {},
        ): Promise<string> {
            const self = this as DetailedERC20Contract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.approve.estimateGasAsync.bind(
                    self,
                    spender,
                    value,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.approve, self.web3ContractInstance,
            )(
                spender,
                value,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            spender: string,
            value: BigNumber,
            txData: TxData = {},
        ): Promise<number> {
            const self = this as DetailedERC20Contract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.approve.estimateGas, self.web3ContractInstance,
            )(
                spender,
                value,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            spender: string,
            value: BigNumber,
            txData: TxData = {},
        ): string {
            const self = this as DetailedERC20Contract;
            const abiEncodedTransactionData = self.web3ContractInstance.approve.getData();
            return abiEncodedTransactionData;
        },
    };
    public totalSupply = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<BigNumber
    > {
            const self = this as DetailedERC20Contract;
            const result = await promisify<BigNumber
    >(
                self.web3ContractInstance.totalSupply.call,
                self.web3ContractInstance,
            )(
            );
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
            const self = this as DetailedERC20Contract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.transferFrom.estimateGasAsync.bind(
                    self,
                    from,
                    to,
                    value,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.transferFrom, self.web3ContractInstance,
            )(
                from,
                to,
                value,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            from: string,
            to: string,
            value: BigNumber,
            txData: TxData = {},
        ): Promise<number> {
            const self = this as DetailedERC20Contract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.transferFrom.estimateGas, self.web3ContractInstance,
            )(
                from,
                to,
                value,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            from: string,
            to: string,
            value: BigNumber,
            txData: TxData = {},
        ): string {
            const self = this as DetailedERC20Contract;
            const abiEncodedTransactionData = self.web3ContractInstance.transferFrom.getData();
            return abiEncodedTransactionData;
        },
    };
    public decimals = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<BigNumber
    > {
            const self = this as DetailedERC20Contract;
            const result = await promisify<BigNumber
    >(
                self.web3ContractInstance.decimals.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public balanceOf = {
        async callAsync(
            who: string,
            defaultBlock?: any,
        ): Promise<BigNumber
    > {
            const self = this as DetailedERC20Contract;
            const result = await promisify<BigNumber
    >(
                self.web3ContractInstance.balanceOf.call,
                self.web3ContractInstance,
            )(
                who,
            );
            return result;
        },
    };
    public symbol = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<string
    > {
            const self = this as DetailedERC20Contract;
            const result = await promisify<string
    >(
                self.web3ContractInstance.symbol.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public transfer = {
        async sendTransactionAsync(
            to: string,
            value: BigNumber,
            txData: TxData = {},
        ): Promise<string> {
            const self = this as DetailedERC20Contract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.transfer.estimateGasAsync.bind(
                    self,
                    to,
                    value,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.transfer, self.web3ContractInstance,
            )(
                to,
                value,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            to: string,
            value: BigNumber,
            txData: TxData = {},
        ): Promise<number> {
            const self = this as DetailedERC20Contract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.transfer.estimateGas, self.web3ContractInstance,
            )(
                to,
                value,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            to: string,
            value: BigNumber,
            txData: TxData = {},
        ): string {
            const self = this as DetailedERC20Contract;
            const abiEncodedTransactionData = self.web3ContractInstance.transfer.getData();
            return abiEncodedTransactionData;
        },
    };
    public allowance = {
        async callAsync(
            owner: string,
            spender: string,
            defaultBlock?: any,
        ): Promise<BigNumber
    > {
            const self = this as DetailedERC20Contract;
            const result = await promisify<BigNumber
    >(
                self.web3ContractInstance.allowance.call,
                self.web3ContractInstance,
            )(
                owner,
                spender,
            );
            return result;
        },
    };
    async deploy(...args: any[]): Promise<any> {
        const wrapper = this;
        const rejected = false;

        return new Promise((resolve, reject) => {
            wrapper.web3ContractInstance.new(wrapper.defaults, (err: string, contract: Web3.ContractInstance) => {
                if (err) {
                    reject(err);
                } else if (contract.address) {
                    wrapper.web3ContractInstance = wrapper.web3ContractInstance.at(contract.address);
                    wrapper.address = contract.address;
                    resolve();
                }
            })
        });
    }
    static async deployed(web3: Web3, defaults: Partial<TxData>): Promise<DetailedERC20Contract> {
        const currentNetwork = web3.version.network;
        const { abi, networks } = await this.getArtifactsData(web3);
        const web3ContractInstance = web3.eth.contract(abi).at(networks[currentNetwork].address);

        return new DetailedERC20Contract(web3ContractInstance, defaults);
    }
    static async at(address: string, web3: Web3, defaults: Partial<TxData>): Promise<DetailedERC20Contract> {
        const { abi } = await this.getArtifactsData(web3);
        const web3ContractInstance = web3.eth.contract(abi).at(address);

        return new DetailedERC20Contract(web3ContractInstance, defaults);
    }
    private static async getArtifactsData(web3: Web3):
        Promise<any>
    {
        try {
            const artifact = await fs.readFile("build/contracts/DetailedERC20.json", "utf8");
            const { abi, networks } = JSON.parse(artifact);
            return { abi, networks };
        } catch (e) {
            console.error("Artifacts malformed or nonexistent: " + e.toString());
        }
    }
    constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
        super(web3ContractInstance, defaults);
        classUtils.bindAll(this, ['web3ContractInstance', 'defaults']);
    }
} // tslint:disable:max-file-line-count
