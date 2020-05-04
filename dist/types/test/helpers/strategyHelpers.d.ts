import Web3 from 'web3';
import { AssetPairManagerContract, BinaryAllocatorContract, BTCDaiRebalancingManagerContract, BTCETHRebalancingManagerContract, ETHDaiRebalancingManagerContract, MACOStrategyManagerContract, MACOStrategyManagerV2Contract, RSITrendingTriggerContract, SocialAllocatorContract, SocialTradingManagerContract, SocialTradingManagerV2Contract } from 'set-protocol-strategies';
import { SocialTradingManagerMockContract } from 'set-protocol-contracts';
import { BigNumber } from '@src/util';
export declare const deployBtcEthManagerContractAsync: (web3: Web3, coreAddress: string, btcPriceFeedAddress: string, ethPriceFeedAddress: string, btcAddress: string, ethAddress: string, setTokenFactory: string, auctionLibrary: string, auctionTimeToPivot: BigNumber, componentMultipliers: BigNumber[], allocationBounds: BigNumber[]) => Promise<BTCETHRebalancingManagerContract>;
export declare const deployBtcDaiManagerContractAsync: (web3: Web3, coreAddress: string, btcPriceFeedAddress: string, daiAddress: string, btcAddress: string, setTokenFactory: string, auctionLibrary: string, auctionTimeToPivot: BigNumber, componentMultipliers: BigNumber[], allocationBounds: BigNumber[]) => Promise<BTCDaiRebalancingManagerContract>;
export declare const deployEthDaiManagerContractAsync: (web3: Web3, coreAddress: string, ethPriceFeedAddress: string, daiAddress: string, ethAddress: string, setTokenFactory: string, auctionLibrary: string, auctionTimeToPivot: BigNumber, componentMultipliers: BigNumber[], allocationBounds: BigNumber[]) => Promise<ETHDaiRebalancingManagerContract>;
export declare const deployMovingAverageStrategyManagerAsync: (web3: Web3, coreAddress: string, movingAveragePriceFeed: string, stableAssetAddress: string, riskAssetAddress: string, initialStableCollateralAddress: string, initialRiskCollateralAddress: string, setTokenFactory: string, auctionLibrary: string, movingAverageDays: BigNumber, auctionTimeToPivot: BigNumber, crossoverConfirmationMinTime: BigNumber, crossoverConfirmationMaxTime: BigNumber, from?: string) => Promise<MACOStrategyManagerContract>;
export declare const deployMovingAverageStrategyManagerV2Async: (web3: Web3, coreAddress: string, movingAveragePriceFeed: string, riskAssetOracle: string, stableAssetAddress: string, riskAssetAddress: string, initialStableCollateralAddress: string, initialRiskCollateralAddress: string, setTokenFactory: string, auctionLibrary: string, movingAverageDays: BigNumber, auctionTimeToPivot: BigNumber, crossoverConfirmationMinTime: BigNumber, crossoverConfirmationMaxTime: BigNumber, from?: string) => Promise<MACOStrategyManagerV2Contract>;
export declare const deployAssetPairManagerAsync: (web3: Web3, coreInstance: string, allocatorInstance: string, triggerInstance: string, auctionLibraryInstance: string, baseAssetAllocation: BigNumber, allocationPrecision: BigNumber, bullishBaseAssetAllocation: BigNumber, auctionTimeToPivot: BigNumber, auctionStartPercentage: BigNumber, auctionEndPercentage: BigNumber, signalConfirmationMinTime: BigNumber, signalConfirmationMaxTime: BigNumber) => Promise<AssetPairManagerContract>;
export declare const deploySocialTradingManagerAsync: (web3: Web3, core: string, factory: string, allocators: string[], maxEntryFee?: BigNumber, feeUpdateTimelock?: BigNumber) => Promise<SocialTradingManagerContract>;
export declare const deploySocialTradingManagerV2Async: (web3: Web3, core: string, factory: string, allocators: string[], maxEntryFee?: BigNumber, feeUpdateTimelock?: BigNumber) => Promise<SocialTradingManagerV2Contract>;
export declare const deploySocialTradingManagerMockAsync: (web3: Web3, from?: string) => Promise<SocialTradingManagerMockContract>;
export declare const deployBinaryAllocatorAsync: (web3: Web3, baseAssetInstance: string, quoteAssetInstance: string, baseAssetOracleInstance: string, quoteAssetOracleInstance: string, baseAssetCollateralInstance: string, quoteAssetCollateralInstance: string, coreInstance: string, setTokenFactoryAddress: string) => Promise<BinaryAllocatorContract>;
export declare const deploySocialAllocatorAsync: (web3: Web3, baseAsset: string, quoteAsset: string, oracleWhiteList: string, core: string, setTokenFactoryAddress: string, pricePrecision: BigNumber, collateralName: string, collateralSymbol: string) => Promise<SocialAllocatorContract>;
export declare const deployRSITrendingTriggerAsync: (web3: Web3, rsiOracle: string, lowerBound: BigNumber, upperBound: BigNumber, rsiTimePeriod: BigNumber) => Promise<RSITrendingTriggerContract>;
export declare const initializeManagerAsync: (macoManager: AssetPairManagerContract | MACOStrategyManagerContract | MACOStrategyManagerV2Contract, rebalancingSetTokenAddress: string) => Promise<void>;
