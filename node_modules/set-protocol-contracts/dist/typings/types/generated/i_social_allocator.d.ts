import Web3 from 'web3';
import Contract from "web3/eth/contract";
import { Tx } from "web3/eth/types";
import { BigNumber } from 'set-protocol-utils';
import { BaseContract } from '../base_contract';
export declare class ISocialAllocatorContract extends BaseContract {
    determineNewAllocation: {
        sendTransactionAsync(_targetBaseAssetAllocation: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(_targetBaseAssetAllocation: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_targetBaseAssetAllocation: BigNumber, txData?: Tx): string;
        callAsync(_targetBaseAssetAllocation: BigNumber, txData?: Tx): Promise<string>;
    };
    calculateCollateralSetValue: {
        callAsync(_collateralSet: string, defaultBlock?: any): Promise<BigNumber>;
    };
    deploy(data: string, args: any[]): Promise<any>;
    static deployed(web3: Web3, defaults: Tx): Promise<ISocialAllocatorContract>;
    static at(address: string, web3: Web3, defaults: Tx): Promise<ISocialAllocatorContract>;
    constructor(web3ContractInstance: Contract, defaults: Tx);
}
