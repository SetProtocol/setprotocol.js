import Web3 from 'web3';
import { TransactionReceipt } from '../types/common';
import { Assertions } from '../assertions';
export declare const BlockchainAPIErrors: {
    AWAIT_MINE_TX_TIMED_OUT: (txHash: string) => string;
};
/**
 * The following default timeout is provided to the IntervalManager when awaiting mined
 * transactions. The value is represented in milliseconds.
 *
 * @type {number}
 */
export declare const DEFAULT_TIMEOUT_FOR_TX_MINED = 30000;
/**
 * @title BlockchainAPI
 * @author Set Protocol
 *
 * A utility library for managing blockchain operations
 */
export declare class BlockchainAPI {
    private web3;
    private assert;
    private intervalManager;
    /**
     * Instantiates a new BlockchainAPI instance that contains methods for miscellaneous blockchain functionality
     *
     * @param web3        Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
     *                      the Ethereum network
     * @param assertions  An instance of the Assertion library
     */
    constructor(web3: Web3, assertions: Assertions);
    /**
     * Polls the Ethereum blockchain until the specified transaction has been mined or the timeout limit is reached,
     * whichever occurs first
     *
     * @param  txHash               Transaction hash to poll
     * @param  pollingIntervalMs    Interval at which the blockchain should be polled. Defaults to 1000
     * @param  timeoutMs            Number of milliseconds until this process times out. Defaults to 60000
     * @return                      Transaction receipt resulting from the mining process
     */
    awaitTransactionMinedAsync(txHash: string, pollingIntervalMs?: number, timeoutMs?: number): Promise<TransactionReceipt>;
}
