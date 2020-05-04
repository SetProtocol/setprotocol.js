import Web3 from 'web3';
import { Tx } from '../types/common';
import { BigNumber } from '.';
export interface TransactionMiningOpts {
    interval: number;
    ensureNotUncle: boolean;
}
export declare function generateTxOpts(web3: Web3, txOpts?: Tx): Promise<Tx>;
export declare function awaitTx(web3: Web3, txHash: string, options?: TransactionMiningOpts): Promise<any>;
export declare const getGasUsageInEth: (web3: any, txHash: string) => Promise<BigNumber>;
