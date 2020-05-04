import { BigNumber } from './bignumber';

export type Address = string;
export type Bytes = string;
export type UInt = number | BigNumber;
export type ExchangeOrder = ZeroExSignedFillOrder | KyberTrade;

export interface Constants {
  [constantId: string]: any;
}

export interface Log {
  event: string;
  address: Address;
  args: any;
}

export enum SolidityTypes {
  Address = 'address',
  Bytes32 = 'bytes32',
  Uint256 = 'uint256',
  Uint8 = 'uint8',
  Uint = 'uint',
  AddressArray = 'address[]',
  UintArray = 'uint256[]',
  String = 'string',
}

export interface ECSig {
  v: UInt;
  r: string;
  s: string;
}

export interface Exchanges {
  [exchangeId: string]: ExchangeOrder[];
}

export interface ExchangeIssuanceParams {
  setAddress: Address;
  sendTokenExchangeIds: BigNumber[];
  sendTokens: Address[];
  sendTokenAmounts: BigNumber[];
  quantity: BigNumber;
  receiveTokens: Address[];
  receiveTokenAmounts: BigNumber[];
}

export interface KyberTrade {
  destinationToken: Address;
  sourceToken: Address;
  sourceTokenQuantity: BigNumber;
  minimumConversionRate: BigNumber;
  maxDestinationQuantity: BigNumber;
}

export interface ZeroExSignedFillOrder {
  senderAddress: Address;
  makerAddress: Address;
  takerAddress: Address;
  makerFee: BigNumber;
  takerFee: BigNumber;
  makerAssetAmount: BigNumber;
  takerAssetAmount: BigNumber;
  makerAssetData: string;
  takerAssetData: string;
  salt: BigNumber;
  exchangeAddress: Address;
  feeRecipientAddress: Address;
  expirationTimeSeconds: BigNumber;
  signature: string;
  fillAmount: BigNumber;
}

export interface LinkedList {
  dataSizeLimit: BigNumber;
  lastUpdatedIndex: BigNumber;
  dataArray: BigNumber[];
}

export interface TimeSeriesFeedState {
  nextEarliestUpdate: BigNumber;
  updateInterval: BigNumber;
  timeSeriesData: LinkedList;
}
