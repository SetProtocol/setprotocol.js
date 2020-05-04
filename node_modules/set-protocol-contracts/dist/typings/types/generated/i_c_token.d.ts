import Web3 from 'web3';
import Contract from "web3/eth/contract";
import { Tx } from "web3/eth/types";
import { BigNumber } from 'set-protocol-utils';
import { BaseContract } from '../base_contract';
export declare class ICTokenContract extends BaseContract {
    exchangeRateCurrent: {
        sendTransactionAsync(txData?: Tx): Promise<string>;
        estimateGasAsync(txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(txData?: Tx): string;
        callAsync(txData?: Tx): Promise<BigNumber>;
    };
    exchangeRateStored: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    decimals: {
        callAsync(defaultBlock?: any): Promise<BigNumber>;
    };
    mint: {
        sendTransactionAsync(mintAmount: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(mintAmount: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(mintAmount: BigNumber, txData?: Tx): string;
        callAsync(mintAmount: BigNumber, txData?: Tx): Promise<BigNumber>;
    };
    redeem: {
        sendTransactionAsync(redeemTokens: BigNumber, txData?: Tx): Promise<string>;
        estimateGasAsync(redeemTokens: BigNumber, txData?: Tx): Promise<number>;
        getABIEncodedTransactionData(redeemTokens: BigNumber, txData?: Tx): string;
        callAsync(redeemTokens: BigNumber, txData?: Tx): Promise<BigNumber>;
    };
    deploy(data: string, args: any[]): Promise<any>;
    static deployed(web3: Web3, defaults: Tx): Promise<ICTokenContract>;
    static at(address: string, web3: Web3, defaults: Tx): Promise<ICTokenContract>;
    constructor(web3ContractInstance: Contract, defaults: Tx);
}
