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

export interface Component {
  address: Address;
  unit: BigNumber;
}

export const RebalancingState = {
  DEFAULT: new BigNumber(0),
  PROPOSAL: new BigNumber(1),
  REBALANCE: new BigNumber(2),
  DRAWDOWN: new BigNumber(3),
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
  pricingLibraryAddress: Address;
  timeToPivot: BigNumber;
  startingPrice: BigNumber;
  auctionPivotPrice: BigNumber;
}

export interface RebalancingProgressDetails {
  rebalancingStartedAt: BigNumber;
  nextSetAddress: Address;
  pricingLibraryAddress: Address;
  timeToPivot: BigNumber;
  startingPrice: BigNumber;
  auctionPivotPrice: BigNumber;
  remainingCurrentSet: BigNumber;
  minimumBid: BigNumber;
  startingCurrentSetAmount: BigNumber;
}

export interface RebalancingSetDetails {
  address: Address;
  factoryAddress: Address;
  managerAddress: Address;
  currentSetAddress: Address;
  unitShares: BigNumber;
  naturalUnit: BigNumber;
  state: string;
  proposalPeriod: BigNumber;
  rebalanceInterval: BigNumber;
  lastRebalancedAt: BigNumber;
  supply: BigNumber;
  name: string;
  symbol: string;
}

export interface RebalancingManagerDetails {
  core: Address;
  btcPriceFeed: Address;
  ethPriceFeed: Address;
  btcAddress: Address;
  ethAddress: Address;
  setTokenFactory: Address;
  auctionLibrary: Address;
  auctionTimeToPivot: BigNumber;
  btcMultiplier: BigNumber;
  ethMultiplier: BigNumber;
}

export interface SetProtocolConfig {
  coreAddress: Address;
  transferProxyAddress: Address;
  vaultAddress: Address;
  rebalanceAuctionModuleAddress: Address;
  kyberNetworkWrapperAddress: Address;
  setTokenFactoryAddress: Address;
  rebalancingSetTokenFactoryAddress: Address;
  exchangeIssuanceModuleAddress: Address;
  rebalancingTokenIssuanceModule: Address;
  payableExchangeIssuance: Address;
  wrappedEtherAddress: Address;
}

export interface SystemAuthorizableState {
  transferProxy: Address[];
  vault: Address[];
}

export interface SystemOwnableState {
  core: Address;
  vault: Address;
  transferProxy: Address;
}

export interface SystemTimeLockPeriodState {
  core: BigNumber;
  vault: BigNumber;
  transferProxy: BigNumber;
}

export interface TokenFlows {
  inflow: BigNumber[];
  outflow: BigNumber[];
}

export interface TokenFlowsDetails {
  inflow: Component[];
  outflow: Component[];
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
