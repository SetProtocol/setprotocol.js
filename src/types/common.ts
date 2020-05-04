import { Address } from 'set-protocol-utils';
import { BigNumber } from '../util';

export { TransactionReceipt } from 'ethereum-types';
export { Tx } from 'web3/eth/types';
export {
  Address,
  Bytes,
  Constants,
  ECSig,
  KyberTrade,
  Log,
  SolidityTypes,
  UInt,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';

export interface BidderConfig {
  bidderAddress: Address;
}

export interface TokenFlows {
  tokens?: Address[];
  inflow: BigNumber[];
  outflow: BigNumber[];
}

export interface JSONRPCRequestPayload {
    params: any[];
    method: string;
    id: number;
    jsonrpc: string;
}

export interface JSONRPCResponsePayload {
    result: any;
    id: number;
    jsonrpc: string;
}

export declare type JSONRPCErrorCallback = (err: Error | null, result?: JSONRPCResponsePayload) => void;
