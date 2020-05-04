import Web3 from 'web3';
import Contract from "web3/eth/contract";
import { Tx } from "web3/eth/types";
import { BigNumber } from 'set-protocol-utils';
import { BaseContract } from '../base_contract';
export declare class IFeeCalculatorContract extends BaseContract {
    initialize: {
        sendTransactionAsync(_feeCalculatorData: string, txData?: Tx): Promise<string>;
        estimateGasAsync(_feeCalculatorData: string, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_feeCalculatorData: string, txData?: Tx): string;
        callAsync(_feeCalculatorData: string, txData?: Tx): Promise<void>;
    };
    getFee: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    updateAndGetFee: {
        sendTransactionAsync(txData?: Tx): Promise<string>;
        estimateGasAsync(txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(txData?: Tx): string;
        callAsync(txData?: Tx): Promise<BigNumber>;
    };
    adjustFee: {
        sendTransactionAsync(_newFeeData: string, txData?: Tx): Promise<string>;
        estimateGasAsync(_newFeeData: string, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_newFeeData: string, txData?: Tx): string;
        callAsync(_newFeeData: string, txData?: Tx): Promise<void>;
    };
    deploy(data: string, args: any[]): Promise<any>;
    static deployed(web3: Web3, defaults: Tx): Promise<IFeeCalculatorContract>;
    static at(address: string, web3: Web3, defaults: Tx): Promise<IFeeCalculatorContract>;
    constructor(web3ContractInstance: Contract, defaults: Tx);
}
