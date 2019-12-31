import * as _ from 'lodash';
import Web3 from 'web3';
import { Address, Bytes } from 'set-protocol-utils';
import {
  AssetPairManager,
  AssetPairManagerContract,
  BinaryAllocator,
  BinaryAllocatorContract,
  BTCDaiRebalancingManager,
  BTCDaiRebalancingManagerContract,
  BTCETHRebalancingManager,
  BTCETHRebalancingManagerContract,
  ETHDaiRebalancingManager,
  ETHDaiRebalancingManagerContract,
  MACOStrategyManager,
  MACOStrategyManagerContract,
  MACOStrategyManagerV2,
  MACOStrategyManagerV2Contract,
  RSITrendingTrigger,
  RSITrendingTriggerContract,
  SocialAllocator,
  SocialAllocatorContract,
  SocialTradingManager,
  SocialTradingManagerContract,
} from 'set-protocol-strategies';
import {
  SocialTradingManagerMock,
  SocialTradingManagerMockContract,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT, TX_DEFAULTS } from '@src/constants';
import { BigNumber } from '@src/util';

import { setDefaultTruffleContract } from './coreHelpers';

export const deployBtcEthManagerContractAsync = async(
  web3: Web3,
  coreAddress: Address,
  btcPriceFeedAddress: Address,
  ethPriceFeedAddress: Address,
  btcAddress: Address,
  ethAddress: Address,
  setTokenFactory: Address,
  auctionLibrary: Address,
  auctionTimeToPivot: BigNumber,
  componentMultipliers: BigNumber[],
  allocationBounds: BigNumber[],
): Promise<BTCETHRebalancingManagerContract> => {
  const truffleBTCETHRebalancingManagerContract = setDefaultTruffleContract(web3, BTCETHRebalancingManager);

  // Deploy BTCETHRebalancingManager
  const deployedBtcEthManagerInstance = await truffleBTCETHRebalancingManagerContract.new(
    coreAddress,
    btcPriceFeedAddress,
    ethPriceFeedAddress,
    btcAddress,
    ethAddress,
    setTokenFactory,
    auctionLibrary,
    auctionTimeToPivot,
    componentMultipliers,
    allocationBounds,
  );
  return await BTCETHRebalancingManagerContract.at(
    deployedBtcEthManagerInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deployBtcDaiManagerContractAsync = async(
  web3: Web3,
  coreAddress: Address,
  btcPriceFeedAddress: Address,
  daiAddress: Address,
  btcAddress: Address,
  setTokenFactory: Address,
  auctionLibrary: Address,
  auctionTimeToPivot: BigNumber,
  componentMultipliers: BigNumber[],
  allocationBounds: BigNumber[],
): Promise<BTCDaiRebalancingManagerContract> => {
  const truffleBTCDaiRebalancingManagerContract = setDefaultTruffleContract(web3, BTCDaiRebalancingManager);

  // Deploy BTCDaiRebalancingManager
  const deployedBtcDaiManagerInstance = await truffleBTCDaiRebalancingManagerContract.new(
    coreAddress,
    btcPriceFeedAddress,
    daiAddress,
    btcAddress,
    setTokenFactory,
    auctionLibrary,
    auctionTimeToPivot,
    componentMultipliers,
    allocationBounds,
  );

  return await BTCDaiRebalancingManagerContract.at(
    deployedBtcDaiManagerInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deployEthDaiManagerContractAsync = async(
  web3: Web3,
  coreAddress: Address,
  ethPriceFeedAddress: Address,
  daiAddress: Address,
  ethAddress: Address,
  setTokenFactory: Address,
  auctionLibrary: Address,
  auctionTimeToPivot: BigNumber,
  componentMultipliers: BigNumber[],
  allocationBounds: BigNumber[],
): Promise<ETHDaiRebalancingManagerContract> => {
  const truffleETHDaiRebalancingManagerContract = setDefaultTruffleContract(web3, ETHDaiRebalancingManager);

  // Deploy BTCDaiRebalancingManager
  const deployedBtcDaiManagerInstance = await truffleETHDaiRebalancingManagerContract.new(
    coreAddress,
    ethPriceFeedAddress,
    daiAddress,
    ethAddress,
    setTokenFactory,
    auctionLibrary,
    auctionTimeToPivot,
    componentMultipliers,
    allocationBounds,
  );

  return await ETHDaiRebalancingManagerContract.at(
    deployedBtcDaiManagerInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deployMovingAverageStrategyManagerAsync = async(
  web3: Web3,
  coreAddress: Address,
  movingAveragePriceFeed: Address,
  stableAssetAddress: Address,
  riskAssetAddress: Address,
  initialStableCollateralAddress: Address,
  initialRiskCollateralAddress: Address,
  setTokenFactory: Address,
  auctionLibrary: Address,
  movingAverageDays: BigNumber,
  auctionTimeToPivot: BigNumber,
  crossoverConfirmationMinTime: BigNumber,
  crossoverConfirmationMaxTime: BigNumber,
  from: Address = TX_DEFAULTS.from,
): Promise<MACOStrategyManagerContract> => {
  const truffleMacoManagerContract = setDefaultTruffleContract(web3, MACOStrategyManager);

  // Deploy MACO Strategy Manager
  const deployedMacoStrategyInstance = await truffleMacoManagerContract.new(
    coreAddress,
    movingAveragePriceFeed,
    stableAssetAddress,
    riskAssetAddress,
    initialStableCollateralAddress,
    initialRiskCollateralAddress,
    setTokenFactory,
    auctionLibrary,
    movingAverageDays,
    auctionTimeToPivot,
    [crossoverConfirmationMinTime, crossoverConfirmationMaxTime],
  );
  return await MACOStrategyManagerContract.at(
    deployedMacoStrategyInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deployMovingAverageStrategyManagerV2Async = async(
  web3: Web3,
  coreAddress: Address,
  movingAveragePriceFeed: Address,
  riskAssetOracle: Address,
  stableAssetAddress: Address,
  riskAssetAddress: Address,
  initialStableCollateralAddress: Address,
  initialRiskCollateralAddress: Address,
  setTokenFactory: Address,
  auctionLibrary: Address,
  movingAverageDays: BigNumber,
  auctionTimeToPivot: BigNumber,
  crossoverConfirmationMinTime: BigNumber,
  crossoverConfirmationMaxTime: BigNumber,
  from: Address = TX_DEFAULTS.from,
): Promise<MACOStrategyManagerV2Contract> => {
  const truffleMacoManagerContract = setDefaultTruffleContract(web3, MACOStrategyManagerV2);

  // Deploy MACO Strategy Manager V2
  const deployedMacoStrategyInstance = await truffleMacoManagerContract.new(
    coreAddress,
    movingAveragePriceFeed,
    riskAssetOracle,
    stableAssetAddress,
    riskAssetAddress,
    [initialStableCollateralAddress, initialRiskCollateralAddress],
    setTokenFactory,
    auctionLibrary,
    movingAverageDays,
    auctionTimeToPivot,
    [crossoverConfirmationMinTime, crossoverConfirmationMaxTime],
  );
  return await MACOStrategyManagerV2Contract.at(
    deployedMacoStrategyInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deployAssetPairManagerAsync = async(
  web3: Web3,
  coreInstance: Address,
  allocatorInstance: Address,
  triggerInstance: Address,
  auctionLibraryInstance: Address,
  baseAssetAllocation: BigNumber,
  allocationPrecision: BigNumber,
  bullishBaseAssetAllocation: BigNumber,
  auctionTimeToPivot: BigNumber,
  auctionStartPercentage: BigNumber,
  auctionEndPercentage: BigNumber,
  signalConfirmationMinTime: BigNumber,
  signalConfirmationMaxTime: BigNumber,
): Promise<AssetPairManagerContract> => {
  const truffleAssetPairManager = setDefaultTruffleContract(web3, AssetPairManager);

  // Deploy MACO Strategy Manager V2
  const deployedAssetPairManagerInstance = await truffleAssetPairManager.new(
    coreInstance,
    allocatorInstance,
    triggerInstance,
    auctionLibraryInstance,
    baseAssetAllocation,
    allocationPrecision,
    bullishBaseAssetAllocation,
    auctionTimeToPivot,
    [auctionStartPercentage, auctionEndPercentage],
    [signalConfirmationMinTime, signalConfirmationMaxTime],
  );
  return await AssetPairManagerContract.at(
    deployedAssetPairManagerInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deploySocialTradingManagerAsync = async(
  web3: Web3,
  core: Address,
  factory: Address,
  allocators: Address[],
): Promise<SocialTradingManagerContract> => {
  const truffleSocialTradingManager = setDefaultTruffleContract(web3, SocialTradingManager);

  // Deploy MACO Strategy Manager V2
  const deployedSocialTradingManagerInstance = await truffleSocialTradingManager.new(
    core,
    factory,
    allocators,
  );
  return await SocialTradingManagerContract.at(
    deployedSocialTradingManagerInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deploySocialTradingManagerMockAsync = async(
  web3: Web3,
  from: Address = DEFAULT_ACCOUNT
): Promise<SocialTradingManagerMockContract> => {
  const truffleSocialManager = setDefaultTruffleContract(web3, SocialTradingManagerMock);

  const deployedSocialManager = await truffleSocialManager.new();

  return await SocialTradingManagerMockContract.at(
    deployedSocialManager.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deployBinaryAllocatorAsync = async(
  web3: Web3,
  baseAssetInstance: Address,
  quoteAssetInstance: Address,
  baseAssetOracleInstance: Address,
  quoteAssetOracleInstance: Address,
  baseAssetCollateralInstance: Address,
  quoteAssetCollateralInstance: Address,
  coreInstance: Address,
  setTokenFactoryAddress: Address
): Promise<BinaryAllocatorContract> => {
  const truffleBinaryAllocator = setDefaultTruffleContract(web3, BinaryAllocator);

  const deployedBinaryAllocator = await truffleBinaryAllocator.new(
    baseAssetInstance,
    quoteAssetInstance,
    baseAssetOracleInstance,
    quoteAssetOracleInstance,
    baseAssetCollateralInstance,
    quoteAssetCollateralInstance,
    coreInstance,
    setTokenFactoryAddress,
  );
  return await BinaryAllocatorContract.at(
    deployedBinaryAllocator.address,
    web3,
    TX_DEFAULTS
  );
};

export const deploySocialAllocatorAsync = async(
  web3: Web3,
  baseAsset: Address,
  quoteAsset: Address,
  oracleWhiteList: Address,
  core: Address,
  setTokenFactoryAddress: Address,
  pricePrecision: BigNumber,
  collateralName: Bytes,
  collateralSymbol: Bytes,
): Promise<SocialAllocatorContract> => {
  const truffleSocialAllocator = setDefaultTruffleContract(web3, SocialAllocator);

  const deployedSocialAllocator = await truffleSocialAllocator.new(
    baseAsset,
    quoteAsset,
    oracleWhiteList,
    core,
    setTokenFactoryAddress,
    pricePrecision,
    collateralName,
    collateralSymbol
  );
  return await SocialAllocatorContract.at(
    deployedSocialAllocator.address,
    web3,
    TX_DEFAULTS
  );
};

export const deployRSITrendingTriggerAsync = async(
  web3: Web3,
  rsiOracle: Address,
  lowerBound: BigNumber,
  upperBound: BigNumber,
  rsiTimePeriod: BigNumber,
): Promise<RSITrendingTriggerContract> => {
  const truffleRSITrendingTrigger = setDefaultTruffleContract(web3, RSITrendingTrigger);

  const deployedRSITrendingTrigger = await truffleRSITrendingTrigger.new(
    rsiOracle,
    lowerBound,
    upperBound,
    rsiTimePeriod
  );
  return await RSITrendingTriggerContract.at(
    deployedRSITrendingTrigger.address,
    web3,
    TX_DEFAULTS
  );
};

export const initializeManagerAsync = async(
  macoManager: MACOStrategyManagerContract | MACOStrategyManagerV2Contract | AssetPairManagerContract,
  rebalancingSetTokenAddress: Address,
): Promise<void> => {
  await macoManager.initialize.sendTransactionAsync(rebalancingSetTokenAddress);
};