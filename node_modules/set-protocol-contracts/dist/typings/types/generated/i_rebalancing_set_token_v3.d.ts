import Web3 from 'web3';
import Contract from "web3/eth/contract";
import { Tx } from "web3/eth/types";
import { BigNumber } from 'set-protocol-utils';
import { BaseContract } from '../base_contract';
export declare class IRebalancingSetTokenV3Contract extends BaseContract {
    totalSupply: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    liquidator: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    lastRebalanceTimestamp: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    rebalanceStartTime: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    startingCurrentSetAmount: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    rebalanceInterval: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    getAuctionPriceParameters: {
        callAsync(defaultBlock?: any): Promise<BigNumber[]>;
    };
    getBiddingParameters: {
        callAsync(defaultBlock?: any): Promise<BigNumber[]>;
    };
    rebalanceState: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    balanceOf: {
        callAsync(owner: string, defaultBlock?: any): Promise<BigNumber>;
    };
    manager: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    feeRecipient: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    entryFee: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    rebalanceFee: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    rebalanceFeeCalculator: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    initialize: {
        sendTransactionAsync(_rebalanceFeeCalldata: string, txData?: Tx): Promise<string>;
        estimateGasAsync(_rebalanceFeeCalldata: string, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_rebalanceFeeCalldata: string, txData?: Tx): string;
        callAsync(_rebalanceFeeCalldata: string, txData?: Tx): Promise<void>;
    };
    setLiquidator: {
        sendTransactionAsync(_newLiquidator: string, txData?: Tx): Promise<string>;
        estimateGasAsync(_newLiquidator: string, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_newLiquidator: string, txData?: Tx): string;
        callAsync(_newLiquidator: string, txData?: Tx): Promise<void>;
    };
    setFeeRecipient: {
        sendTransactionAsync(_newFeeRecipient: string, txData?: Tx): Promise<string>;
        estimateGasAsync(_newFeeRecipient: string, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_newFeeRecipient: string, txData?: Tx): string;
        callAsync(_newFeeRecipient: string, txData?: Tx): Promise<void>;
    };
    setEntryFee: {
        sendTransactionAsync(_newEntryFee: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(_newEntryFee: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_newEntryFee: BigNumber, txData?: Tx): string;
        callAsync(_newEntryFee: BigNumber, txData?: Tx): Promise<void>;
    };
    startRebalance: {
        sendTransactionAsync(_nextSet: string, _liquidatorData: string, txData?: Tx): Promise<string>;
        estimateGasAsync(_nextSet: string, _liquidatorData: string, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_nextSet: string, _liquidatorData: string, txData?: Tx): string;
        callAsync(_nextSet: string, _liquidatorData: string, txData?: Tx): Promise<void>;
    };
    settleRebalance: {
        sendTransactionAsync(txData?: Tx): Promise<string>;
        estimateGasAsync(txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(txData?: Tx): string;
        callAsync(txData?: Tx): Promise<void>;
    };
    actualizeFee: {
        sendTransactionAsync(txData?: Tx): Promise<string>;
        estimateGasAsync(txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(txData?: Tx): string;
        callAsync(txData?: Tx): Promise<void>;
    };
    adjustFee: {
        sendTransactionAsync(_newFeeData: string, txData?: Tx): Promise<string>;
        estimateGasAsync(_newFeeData: string, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_newFeeData: string, txData?: Tx): string;
        callAsync(_newFeeData: string, txData?: Tx): Promise<void>;
    };
    naturalUnit: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    currentSet: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    nextSet: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    unitShares: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    placeBid: {
        sendTransactionAsync(_quantity: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(_quantity: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_quantity: BigNumber, txData?: Tx): string;
        callAsync(_quantity: BigNumber, txData?: Tx): Promise<[string[], BigNumber[], BigNumber[]]>;
    };
    getBidPrice: {
        callAsync(_quantity: BigNumber, defaultBlock?: any): Promise<[BigNumber[], BigNumber[]]>;
    };
    name: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    symbol: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    deploy(data: string, args: any[]): Promise<any>;
    static deployed(web3: Web3, defaults: Tx): Promise<IRebalancingSetTokenV3Contract>;
    static at(address: string, web3: Web3, defaults: Tx): Promise<IRebalancingSetTokenV3Contract>;
    constructor(web3ContractInstance: Contract, defaults: Tx);
}
