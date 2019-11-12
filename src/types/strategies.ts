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

export interface RSITriggerDetails {
  dataOracle: Address;
  lowerBound: BigNumber;
  upperBound: BigNumber;
  timePeriod: BigNumber;
}

export interface MovingAverageManagerDetails {
  auctionLibrary: Address;
  auctionTimeToPivot: BigNumber;
  core: Address;
  crossoverConfirmationMaxTime: BigNumber;
  crossoverConfirmationMinTime: BigNumber;
  lastCrossoverConfirmationTimestamp: BigNumber;
  movingAverageDays: BigNumber;
  movingAveragePriceFeed: Address;
  rebalancingSetToken: Address;
  riskAsset: Address;
  riskCollateral: Address;
  setTokenFactory: Address;
  stableAsset: Address;
  stableCollateral: Address;
}

export interface AssetPairManagerDetails {
  allocationPrecision: BigNumber;
  allocator: Address;
  auctionEndPercentage: BigNumber;
  auctionLibrary: Address;
  auctionStartPercentage: BigNumber;
  auctionTimeToPivot: BigNumber;
  baseAssetAllocation: BigNumber;
  bullishBaseAssetAllocation: BigNumber;
  core: Address;
  lastInitialTriggerTimestamp: BigNumber;
  rebalancingSetToken: Address;
  signalConfirmationMinTime: BigNumber;
  signalConfirmationMaxTime: BigNumber;
  trigger: Address;
}

export interface BTCETHRebalancingManagerDetails {
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
  maximumLowerThreshold: BigNumber;
  minimumUpperThreshold: BigNumber;
}

export interface BTCDAIRebalancingManagerDetails {
  core: Address;
  btcPriceFeed: Address;
  btcAddress: Address;
  daiAddress: Address;
  setTokenFactory: Address;
  auctionLibrary: Address;
  auctionTimeToPivot: BigNumber;
  btcMultiplier: BigNumber;
  daiMultiplier: BigNumber;
  maximumLowerThreshold: BigNumber;
  minimumUpperThreshold: BigNumber;
}

export interface ETHDAIRebalancingManagerDetails {
  core: Address;
  ethPriceFeed: Address;
  ethAddress: Address;
  daiAddress: Address;
  setTokenFactory: Address;
  auctionLibrary: Address;
  auctionTimeToPivot: BigNumber;
  ethMultiplier: BigNumber;
  daiMultiplier: BigNumber;
  maximumLowerThreshold: BigNumber;
  minimumUpperThreshold: BigNumber;
}