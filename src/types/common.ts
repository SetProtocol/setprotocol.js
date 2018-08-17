
import { BigNumber } from '../util';
import { Address, UInt } from 'set-protocol-utils';

export interface Component {
  address: Address;
  unit: BigNumber;
}

export interface SetComponent {
  address: Address;
  quantity: string;
  name: string;
  symbol: string;
}

export interface Token {
  address: Address;
  name: string;
  symbol: string;
  balance: BigNumber;
  decimals: BigNumber;
}

export interface TxData {
  from?: Address;
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
