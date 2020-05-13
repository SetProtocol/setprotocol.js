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
  allocationDenominator: BigNumber;
  allocator: Address;
  auctionPivotPercentage: BigNumber;
  auctionLibrary: Address;
  auctionStartPercentage: BigNumber;
  auctionTimeToPivot: BigNumber;
  baseAssetAllocation: BigNumber;
  bullishBaseAssetAllocation: BigNumber;
  bearishBaseAssetAllocation: BigNumber;
  core: Address;
  recentInitialProposeTimestamp: BigNumber;
  rebalancingSetToken: Address;
  signalConfirmationMinTime: BigNumber;
  signalConfirmationMaxTime: BigNumber;
  trigger: Address;
}

export interface AssetPairManagerV2Details {
  allocationDenominator: BigNumber;
  allocator: Address;
  baseAssetAllocation: BigNumber;
  bullishBaseAssetAllocation: BigNumber;
  bearishBaseAssetAllocation: BigNumber;
  core: Address;
  recentInitialProposeTimestamp: BigNumber;
  rebalancingSetToken: Address;
  signalConfirmationMinTime: BigNumber;
  signalConfirmationMaxTime: BigNumber;
  trigger: Address;
  liquidatorData: string;
  rebalanceFeeCalculator: Address;
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

export interface CollateralSetInfo {
  components: Address[];
  units: BigNumber[];
  naturalUnit: BigNumber;
  name: string;
  symbol: string;
}

export interface PerformanceFeeInfo {
  profitFeePeriod: BigNumber;
  highWatermarkResetPeriod: BigNumber;
  profitFeePercentage: BigNumber;
  streamingFeePercentage: BigNumber;
  highWatermark: BigNumber;
  lastProfitFeeTimestamp: BigNumber;
  lastStreamingFeeTimestamp: BigNumber;
}

export interface NewTradingPoolInfo {
  trader: Address;
  allocator: Address;
  currentAllocation: BigNumber;
  manager: Address;
  feeRecipient: Address;
  currentSet: Address;
  liquidator: Address;
  poolName: string;
  poolSymbol: string;
  unitShares: BigNumber;
  naturalUnit: BigNumber;
  rebalanceInterval: BigNumber;
  entryFee: BigNumber;
  rebalanceFee: BigNumber;
  lastRebalanceTimestamp: BigNumber;
  rebalanceState: BigNumber;
  currentSetInfo: CollateralSetInfo;
}

export interface NewTradingPoolV2Info {
  trader: Address;
  allocator: Address;
  currentAllocation: BigNumber;
  manager: Address;
  feeRecipient: Address;
  currentSet: Address;
  liquidator: Address;
  poolName: string;
  poolSymbol: string;
  unitShares: BigNumber;
  naturalUnit: BigNumber;
  rebalanceInterval: BigNumber;
  entryFee: BigNumber;
  rebalanceFee: BigNumber;
  lastRebalanceTimestamp: BigNumber;
  rebalanceState: BigNumber;
  currentSetInfo: CollateralSetInfo;
  performanceFeeInfo: PerformanceFeeInfo;
  performanceFeeCalculatorAddress: Address;
}

export interface TradingPoolAccumulationInfo {
  streamingFee: BigNumber;
  profitFee: BigNumber;
}

export interface TradingPoolRebalanceInfo {
  trader: Address;
  allocator: Address;
  currentAllocation: BigNumber;
  liquidator: Address;
  nextSet: Address;
  rebalanceStartTime: BigNumber;
  timeToPivot: BigNumber;
  startPrice: BigNumber;
  endPrice: BigNumber;
  startingCurrentSets: BigNumber;
  remainingCurrentSets: BigNumber;
  minimumBid: BigNumber;
  rebalanceState: BigNumber;
  nextSetInfo: CollateralSetInfo;
}

export interface RBSetTWAPRebalanceInfo {
  liquidator: Address;
  nextSet: Address;
  rebalanceStartTime: BigNumber;
  timeToPivot: BigNumber;
  startPrice: BigNumber;
  endPrice: BigNumber;
  startingCurrentSets: BigNumber;
  remainingCurrentSets: BigNumber;
  minimumBid: BigNumber;
  rebalanceState: BigNumber;
  nextSetInfo: CollateralSetInfo;
  orderSize: BigNumber;
  orderRemaining: BigNumber;
  totalSetsRemaining: BigNumber;
  chunkSize: BigNumber;
  chunkAuctionPeriod: BigNumber;
  lastChunkAuctionEnd: BigNumber;
}

export interface TradingPoolTWAPRebalanceInfo extends TradingPoolRebalanceInfo {
  orderSize: BigNumber;
  orderRemaining: BigNumber;
  totalSetsRemaining: BigNumber;
  chunkSize: BigNumber;
  chunkAuctionPeriod: BigNumber;
  lastChunkAuctionEnd: BigNumber;
}