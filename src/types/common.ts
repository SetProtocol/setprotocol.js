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

export const RebalancingState = {
  DEFAULT: new BigNumber(0),
  PROPOSAL: new BigNumber(1),
  REBALANCE: new BigNumber(2),
};

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

export interface RebalancingProposalDetails {
  proposedAt: BigNumber;
  nextSetAddress: Address;
  startingPrice: BigNumber;
  pricingLibraryAddress: Address;
  priceCurveCoefficient: BigNumber;
  priceDivisor: BigNumber;
}

export interface RebalancingProgressDetails {
  rebalancingStartedAt: BigNumber;
  nextSetAddress: Address;
  startingPrice: BigNumber;
  pricingLibraryAddress: Address;
  priceCurveCoefficient: BigNumber;
  priceDivisor: BigNumber;
  remainingCurrentSet: BigNumber;
}

export interface RebalancingSetDetails {
  address: Address;
  factoryAddress: Address;
  managerAddress: Address;
  currentSetAddress: Address;
  unitShares: BigNumber;
  naturalUnit: BigNumber;
  state: string;
  lastRebalancedAt: BigNumber;
  supply: BigNumber;
  name: string;
  symbol: string;
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

export interface TokenFlows {
  inflow: BigNumber[];
  outflow: BigNumber[];
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
