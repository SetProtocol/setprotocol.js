import Web3 from 'web3';
import Contract from "web3/eth/contract";
import { Tx } from "web3/eth/types";
import { BigNumber } from 'set-protocol-utils';
import { BaseContract } from '../base_contract';
export declare class SocialTradingManagerMockContract extends BaseContract {
    pools: {
        callAsync(index_0: string, defaultBlock?: any): Promise<[string, string, BigNumber, BigNumber, BigNumber]>;
    };
    updateRecord: {
        sendTransactionAsync(_tradingPool: string, _trader: string, _allocator: string, _currentAllocation: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(_tradingPool: string, _trader: string, _allocator: string, _currentAllocation: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_tradingPool: string, _trader: string, _allocator: string, _currentAllocation: BigNumber, txData?: Tx): string;
        callAsync(_tradingPool: string, _trader: string, _allocator: string, _currentAllocation: BigNumber, txData?: Tx): Promise<void>;
    };
    rebalance: {
        sendTransactionAsync(_tradingPool: string, _nextSet: string, _newAllocation: BigNumber, _liquidatorData: string, txData?: Tx): Promise<string>;
        estimateGasAsync(_tradingPool: string, _nextSet: string, _newAllocation: BigNumber, _liquidatorData: string, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_tradingPool: string, _nextSet: string, _newAllocation: BigNumber, _liquidatorData: string, txData?: Tx): string;
        callAsync(_tradingPool: string, _nextSet: string, _newAllocation: BigNumber, _liquidatorData: string, txData?: Tx): Promise<void>;
    };
    updateFee: {
        sendTransactionAsync(_tradingPool: string, _newFee: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(_tradingPool: string, _newFee: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_tradingPool: string, _newFee: BigNumber, txData?: Tx): string;
        callAsync(_tradingPool: string, _newFee: BigNumber, txData?: Tx): Promise<void>;
    };
    deploy(data: string, args: any[]): Promise<any>;
    static deployed(web3: Web3, defaults: Tx): Promise<SocialTradingManagerMockContract>;
    static at(address: string, web3: Web3, defaults: Tx): Promise<SocialTradingManagerMockContract>;
    constructor(web3ContractInstance: Contract, defaults: Tx);
}
