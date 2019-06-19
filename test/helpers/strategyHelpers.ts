import * as _ from 'lodash';
import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import {
  MACOStrategyManager,
  MACOStrategyManagerContract,
} from 'set-protocol-strategies';

import { TX_DEFAULTS } from '@src/constants';
import { BigNumber } from '@src/util';

const contract = require('truffle-contract');

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