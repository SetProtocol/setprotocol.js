import Web3 from 'web3';
import Contract from "web3/eth/contract";
import { Tx } from "web3/eth/types";
import { BigNumber } from 'set-protocol-utils';
import { BaseContract } from '../base_contract';
export declare class ERC20DetailedContract extends BaseContract {
    approve: {
        sendTransactionAsync(spender: string, value: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(spender: string, value: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(spender: string, value: BigNumber, txData?: Tx): string;
        callAsync(spender: string, value: BigNumber, txData?: Tx): Promise<boolean>;
    };
    totalSupply: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    transferFrom: {
        sendTransactionAsync(from: string, to: string, value: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(from: string, to: string, value: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(from: string, to: string, value: BigNumber, txData?: Tx): string;
        callAsync(from: string, to: string, value: BigNumber, txData?: Tx): Promise<boolean>;
    };
    balanceOf: {
        callAsync(who: string, defaultBlock?: any): Promise<BigNumber>;
    };
    transfer: {
        sendTransactionAsync(to: string, value: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(to: string, value: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(to: string, value: BigNumber, txData?: Tx): string;
        callAsync(to: string, value: BigNumber, txData?: Tx): Promise<boolean>;
    };
    allowance: {
        callAsync(owner: string, spender: string, defaultBlock?: any): Promise<BigNumber>;
    };
    name: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    symbol: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    decimals: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    deploy(data: string, args: any[]): Promise<any>;
    static deployed(web3: Web3, defaults: Tx): Promise<ERC20DetailedContract>;
    static at(address: string, web3: Web3, defaults: Tx): Promise<ERC20DetailedContract>;
    constructor(web3ContractInstance: Contract, defaults: Tx);
}
