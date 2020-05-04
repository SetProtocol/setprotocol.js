import Web3 from 'web3';
import Contract from "web3/eth/contract";
import { Tx } from "web3/eth/types";
import { BigNumber } from 'set-protocol-utils';
import { BaseContract } from '../base_contract';
export declare class IRebalancingSetTokenContract extends BaseContract {
    auctionLibrary: {
        callAsync(defaultBlock?: any): Promise<string>;
    };
    totalSupply: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    proposalStartTime: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    lastRebalanceTimestamp: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    rebalanceInterval: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    rebalanceState: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    startingCurrentSetAmount: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    balanceOf: {
        callAsync(owner: string, defaultBlock?: any): Promise<BigNumber>;
    };
    propose: {
        sendTransactionAsync(_nextSet: string, _auctionLibrary: string, _auctionTimeToPivot: BigNumber, _auctionStartPrice: BigNumber, _auctionPivotPrice: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(_nextSet: string, _auctionLibrary: string, _auctionTimeToPivot: BigNumber, _auctionStartPrice: BigNumber, _auctionPivotPrice: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_nextSet: string, _auctionLibrary: string, _auctionTimeToPivot: BigNumber, _auctionStartPrice: BigNumber, _auctionPivotPrice: BigNumber, txData?: Tx): string;
        callAsync(_nextSet: string, _auctionLibrary: string, _auctionTimeToPivot: BigNumber, _auctionStartPrice: BigNumber, _auctionPivotPrice: BigNumber, txData?: Tx): Promise<void>;
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
    burn: {
        sendTransactionAsync(_from: string, _quantity: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(_from: string, _quantity: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_from: string, _quantity: BigNumber, txData?: Tx): string;
        callAsync(_from: string, _quantity: BigNumber, txData?: Tx): Promise<void>;
    };
    placeBid: {
        sendTransactionAsync(_quantity: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(_quantity: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(_quantity: BigNumber, txData?: Tx): string;
        callAsync(_quantity: BigNumber, txData?: Tx): Promise<[string[], BigNumber[], BigNumber[]]>;
    };
    getCombinedTokenArrayLength: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    getCombinedTokenArray: {
        callAsync(defaultBlock?: any): Promise<string[]>;
    };
    getFailedAuctionWithdrawComponents: {
        callAsync(defaultBlock?: any): Promise<string[]>;
    };
    getAuctionPriceParameters: {
        callAsync(defaultBlock?: any): Promise<BigNumber[]>;
    };
    getBiddingParameters: {
        callAsync(defaultBlock?: any): Promise<BigNumber[]>;
    };
    getBidPrice: {
        callAsync(_quantity: BigNumber, defaultBlock?: any): Promise<[BigNumber[], BigNumber[]]>;
    };
    deploy(data: string, args: any[]): Promise<any>;
    static deployed(web3: Web3, defaults: Tx): Promise<IRebalancingSetTokenContract>;
    static at(address: string, web3: Web3, defaults: Tx): Promise<IRebalancingSetTokenContract>;
    constructor(web3ContractInstance: Contract, defaults: Tx);
}
