
import { BigNumber } from '../util';
import { Address, UInt } from 'set-protocol-utils';

export {
  Address,
  Bytes,
  Constants,
  ECSig,
  Exchanges,
  IssuanceOrder,
  KyberTrade,
  Log,
  SetProtocolUtils,
  SignedIssuanceOrder,
  SolidityTypes,
  TakerWalletOrder,
  UInt,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';

export interface Component {
  address: Address;
  unit: BigNumber;
}

export interface SetUnits {
  units: BigNumber[];
  naturalUnit: BigNumber;
}

export interface SetDetails {
  address: Address;
  factoryAddress: Address;
  name: string;
  symbol: string;
  naturalUnit: BigNumber;
  components: Component[];
}

export interface TxData {
  from: Address;
  gas?: UInt;
  gasPrice?: UInt;
  nonce?: number;
}

export interface TxDataPayable extends TxData {
  value?: BigNumber;
}

export interface CreateLogArgs {
  _setTokenAddress: Address;
  _factoryAddress: Address;
  _components: Address[];
  _units: BigNumber[];
  _naturalUnit: BigNumber;
  _name: string;
  _symbol: string;
}

/**
 * Do not create your own provider. Use an existing provider from a Web3 or ProviderEngine library
 * Read more about Providers in the 0x wiki.
 */
export interface Provider {
    sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback): void;
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
