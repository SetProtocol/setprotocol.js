import * as _ from 'lodash';
import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import {
  BTCDaiRebalancingManager,
  BTCDaiRebalancingManagerContract,
  BTCETHRebalancingManager,
  BTCETHRebalancingManagerContract,
  ETHDaiRebalancingManager,
  ETHDaiRebalancingManagerContract,
  MACOStrategyManager,
  MACOStrategyManagerContract,
  MACOStrategyManagerV2,
  MACOStrategyManagerV2Contract
} from 'set-protocol-strategies';

import { TX_DEFAULTS } from '@src/constants';
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

export const initializeMovingAverageStrategyManagerAsync = async(
  macoManager: MACOStrategyManagerContract | MACOStrategyManagerV2Contract,
  rebalancingSetTokenAddress: Address,
): Promise<void> => {
  await macoManager.initialize.sendTransactionAsync(rebalancingSetTokenAddress);
};