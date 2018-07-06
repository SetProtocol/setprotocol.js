import * as _ from "lodash";

import { BigNumber } from "../util";

export type Address = string;
export type Bytes32 = string;
export type UInt = number | BigNumber;

export interface Component {
  address: Address;
  unit: BigNumber;
}

export interface SetComponent {
  address: string;
  quantity: string;
  name: string;
  symbol: string;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  balance: BigNumber;
  decimals: BigNumber;
}

export interface TransactionOpts {
  gas?: number;
  gasPrice?: BigNumber;
}

export interface TxData {
  from?: string;
  gas?: number;
  gasPrice?: BigNumber;
  nonce?: number;
}

export interface TxDataPayable extends TxData {
  value?: BigNumber;
}
