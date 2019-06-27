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
} from 'set-protocol-strategies';

import { TX_DEFAULTS } from '@src/constants';
import { BigNumber } from '@src/util';

const contract = require('truffle-contract');

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
  const truffleBTCETHRebalancingManagerContract = contract(BTCETHRebalancingManager);
  truffleBTCETHRebalancingManagerContract.setProvider(web3.currentProvider);
  truffleBTCETHRebalancingManagerContract.setNetwork(50);
  truffleBTCETHRebalancingManagerContract.defaults(TX_DEFAULTS);

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
  const truffleBTCDaiRebalancingManagerContract = contract(BTCDaiRebalancingManager);
  truffleBTCDaiRebalancingManagerContract.setProvider(web3.currentProvider);
  truffleBTCDaiRebalancingManagerContract.setNetwork(50);
  truffleBTCDaiRebalancingManagerContract.defaults(TX_DEFAULTS);

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
  const truffleETHDaiRebalancingManagerContract = contract(ETHDaiRebalancingManager);
  truffleETHDaiRebalancingManagerContract.setProvider(web3.currentProvider);
  truffleETHDaiRebalancingManagerContract.setNetwork(50);
  truffleETHDaiRebalancingManagerContract.defaults(TX_DEFAULTS);

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
  const truffleMacoManagerContract = contract(MACOStrategyManager);
  truffleMacoManagerContract.setProvider(web3.currentProvider);
  truffleMacoManagerContract.setNetwork(50);
  truffleMacoManagerContract.defaults(TX_DEFAULTS);

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

export const initializeMovingAverageStrategyManagerAsync = async(
  macoManager: MACOStrategyManagerContract,
  rebalancingSetTokenAddress: Address,
): Promise<void> => {
  await macoManager.initialize.sendTransactionAsync(rebalancingSetTokenAddress);
};