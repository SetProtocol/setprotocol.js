import * as ABIDecoder from 'abi-decoder';
import Web3 from 'web3';
import { Address, Log } from 'set-protocol-utils';
import { TransactionReceipt } from 'ethereum-types';
export declare function getFormattedLogsFromTxHash(web3: Web3, txHash: string): Promise<Log[]>;
export declare function getFormattedLogsFromReceipt(receipt: TransactionReceipt): Log[];
/**
 * Converts a ABI Decoded Log into a Log
 * Input Example
 * {
 *   name: 'Transfer',
 *   events: [
 *    { name: 'from',
 *      type: 'address',
 *      value: '0xc604980c49f5c3be6e7e42526ec00f211e333385' },
 *    { name: 'to',
 *      type: 'address',
 *      value: '0xf8600afbf76236454a53e8dcc4d1feaa26fe1a77' },
 *    { name: 'value', type: 'uint256', value: '10000000000000000000' },
 *   ],
 *   address: '0xea76972f7587c27887aa403d84671717f6826f62'
 * }
 *
 * Output Example
 * {
 *   event: "Transfer",
 *   address: tokenAddress,
 *   args: {
 *     from,
 *     to,
 *     value,
 *   },
 * };
 */
export declare function formatLogEntry(logs: ABIDecoder.DecodedLog): Log;
export declare function extractNewSetTokenAddressFromLogs(logs: Log[], logIndex?: number): Address;
