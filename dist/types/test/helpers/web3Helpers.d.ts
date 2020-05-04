import Web3 from 'web3';
import { BigNumber } from '@src/util';
export declare const getGasUsageInEth: (web3: Web3, txHash: string) => Promise<BigNumber>;
