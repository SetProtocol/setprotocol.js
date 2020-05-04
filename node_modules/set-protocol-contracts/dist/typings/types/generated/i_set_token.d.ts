import Web3 from 'web3';
import Contract from "web3/eth/contract";
import { Tx } from "web3/eth/types";
import { BigNumber } from 'set-protocol-utils';
import { BaseContract } from '../base_contract';
export declare class ISetTokenContract extends BaseContract {
    naturalUnit: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    getComponents: {
        callAsync(defaultBlock?: any): Promise<string[]>;
    };
    getUnits: {
        callAsync(defaultBlock?: any): Promise<BigNumber[]>;
    };
    tokenIsComponent: {
        callAsync(_tokenAddress: string, defaultBlock?: any): Promise<boolean>;
    };
    mint: {
        sendTransactionAsync(_issuer: string, _quantity: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(_issuer: string, _quantity: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_issuer: string, _quantity: BigNumber, txData?: Tx): string;
        callAsync(_issuer: string, _quantity: BigNumber, txData?: Tx): Promise<void>;
    };
    burn: {
        sendTransactionAsync(_from: string, _quantity: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(_from: string, _quantity: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_from: string, _quantity: BigNumber, txData?: Tx): string;
        callAsync(_from: string, _quantity: BigNumber, txData?: Tx): Promise<void>;
    };
    transfer: {
        sendTransactionAsync(to: string, value: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(to: string, value: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(to: string, value: BigNumber, txData?: Tx): string;
        callAsync(to: string, value: BigNumber, txData?: Tx): Promise<void>;
    };
    deploy(data: string, args: any[]): Promise<any>;
    static deployed(web3: Web3, defaults: Tx): Promise<ISetTokenContract>;
    static at(address: string, web3: Web3, defaults: Tx): Promise<ISetTokenContract>;
    constructor(web3ContractInstance: Contract, defaults: Tx);
}
