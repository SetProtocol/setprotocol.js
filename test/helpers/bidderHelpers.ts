import * as _ from 'lodash';
import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import {
  BidderContract,
  KyberBidExchangeWrapperContract,
  ZeroExBidExchangeWrapperContract,
} from 'set-rebalancing-bot-contracts';

import {
  RebalancingSetCTokenBidderContract,
  RebalanceAuctionModuleContract,
  TransferProxyContract
} from 'set-protocol-contracts';

import {
  DEFAULT_ACCOUNT,
  TX_DEFAULTS,
} from '@src/constants';
import { TokenFlowsDetails, Component } from '@src/types/common';
import { BigNumber } from '@src/util';


import { setDefaultTruffleContract } from './coreHelpers';

const ERC20Wrapper =
  require('set-protocol-contracts/dist/artifacts/ts/ERC20Wrapper').ERC20Wrapper;
const RebalancingSetCTokenBidder =
  require(
    'set-protocol-contracts/dist/artifacts/ts/RebalancingSetCTokenBidder'
  ).RebalancingSetCTokenBidder;
const Bidder =
  require(
    'set-rebalancing-bot-contracts/dist/artifacts/ts/Bidder'
  ).Bidder;
const KyberBidExchangeWrapper =
  require(
    'set-rebalancing-bot-contracts/dist/artifacts/ts/KyberBidExchangeWrapper'
  ).KyberBidExchangeWrapper;
const ZeroExBidExchangeWrapper =
  require(
    'set-rebalancing-bot-contracts/dist/artifacts/ts/ZeroExBidExchangeWrapper'
  ).ZeroExBidExchangeWrapper;

export const deployRebalancingBidderBotAsync = async (
  web3: Web3,
  rebalancingSetCTokenBidder: RebalancingSetCTokenBidderContract,
  exchangeWrapperAddresses: Address[],
  exchangeProxyAddresses1: Address[],
  exchangeProxyAddresses2: Address[],
  owner: Address = DEFAULT_ACCOUNT,
): Promise<BidderContract> => {
  const truffleBidderContract = setDefaultTruffleContract(web3, Bidder);
  const truffleERC20WrapperContract = setDefaultTruffleContract(web3, ERC20Wrapper);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleBidderContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedBidderContract =
    await truffleBidderContract.new(
      rebalancingSetCTokenBidder.address,
      exchangeWrapperAddresses,
      exchangeProxyAddresses1,
      exchangeProxyAddresses2,
    );

  // Initialize typed contract class
  const bidder = await BidderContract.at(
    deployedBidderContract.address,
    web3,
    TX_DEFAULTS,
  );

  return bidder;
};

export const deployRebalancingSetCTokenBidderAsync = async (
  web3: Web3,
  rebalanceAuctionModule: RebalanceAuctionModuleContract,
  transferProxy: TransferProxyContract,
  cTokenAddressesArray: Address[],
  underlyingAddressesArray: Address[],
  dataDescription: string,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<RebalancingSetCTokenBidderContract> => {
  const truffleRebalancingSetCTokenBidderContract = setDefaultTruffleContract(web3, RebalancingSetCTokenBidder);
  const truffleERC20WrapperContract = setDefaultTruffleContract(web3, ERC20Wrapper);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleRebalancingSetCTokenBidderContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedRebalancingSetCTokenBidderContract =
    await truffleRebalancingSetCTokenBidderContract.new(
      rebalanceAuctionModule.address,
      transferProxy.address,
      cTokenAddressesArray,
      underlyingAddressesArray,
      dataDescription
    );

  // Initialize typed contract class
  const rebalancingSetCTokenBidder = await RebalancingSetCTokenBidderContract.at(
    deployedRebalancingSetCTokenBidderContract.address,
    web3,
    TX_DEFAULTS,
  );

  return rebalancingSetCTokenBidder;
};

export const deployKyberBidExchangeWrapperAsync = async (
  web3: Web3,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<KyberBidExchangeWrapperContract> => {
  const truffleKyberBidExchangeWrapperContract = setDefaultTruffleContract(web3, KyberBidExchangeWrapper);

  const deployedKyberBidExchangeWrapper = await truffleKyberBidExchangeWrapperContract.new();

  // Initialize typed contract class
  const kyberBidExchangeWrapper = await KyberBidExchangeWrapperContract.at(
    deployedKyberBidExchangeWrapper.address,
    web3,
    TX_DEFAULTS,
  );

  return kyberBidExchangeWrapper;
};

export const deployZeroExBidExchangeWrapperAsync = async (
  web3: Web3,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<ZeroExBidExchangeWrapperContract> => {
  const truffleZeroExBidExchangeWrapperContract = setDefaultTruffleContract(web3, ZeroExBidExchangeWrapper);

  const deployedZeroExBidExchangeWrapper = await truffleZeroExBidExchangeWrapperContract.new();

  // Initialize typed contract class
  const zeroExBidExchangeWrapper = await ZeroExBidExchangeWrapperContract.at(
    deployedZeroExBidExchangeWrapper.address,
    web3,
    TX_DEFAULTS,
  );

  return zeroExBidExchangeWrapper;
};

export const replaceFlowsWithCTokenUnderlyingAsync = (
  expectedTokenFlows: any,
  combinedTokenArray: Address[],
  cTokenAddressesArray: Address[],
  underlyingAddressesArray: Address[],
  cTokenExchangeRateArray: BigNumber[],
): any => {
  const inflow: BigNumber[] = [];
  const outflow: BigNumber[] = [];

  const cTokenToUnderlyingObject = constructObjectFromArray(
    cTokenAddressesArray,
    underlyingAddressesArray
  );

  const cTokenToExchangeRateObject = constructObjectFromArray(
    cTokenAddressesArray,
    cTokenExchangeRateArray
  );

  for (let i = 0; i < combinedTokenArray.length; i++) {
    // Check if address is cToken
    if (cTokenToUnderlyingObject[combinedTokenArray[i]]) {
      const cTokenConversion = cTokenToExchangeRateObject[combinedTokenArray[i]].div(10 ** 18);
      let newInflow = expectedTokenFlows['inflow'][i]
          .mul(cTokenConversion)
          .round(0, BigNumber.ROUND_DOWN);

      newInflow = newInflow.div(cTokenConversion).gte(expectedTokenFlows['inflow'][i])
        ? newInflow
        : newInflow.add(1);

      let newOutflow = expectedTokenFlows['outflow'][i]
          .mul(cTokenConversion)
          .round(0, BigNumber.ROUND_DOWN);

      newOutflow = newOutflow.div(cTokenConversion).gte(expectedTokenFlows['outflow'][i])
        ? newOutflow
        : newOutflow.add(1);

      inflow.push(newInflow);
      outflow.push(newOutflow);
    } else {
      inflow.push(expectedTokenFlows['inflow'][i]);
      outflow.push(expectedTokenFlows['outflow'][i]);
    }
  }

  return { inflow, outflow };
};

export const constructObjectFromArray = (
  array1: any[],
  array2: any[],
): any => {
  return array1.reduce((accumulator: object, currentValue: any, index: number) => {
    return {
      ...accumulator,
      [currentValue]: array2[index],
    };
  }, {});
};

export const replaceDetailFlowsWithCTokenUnderlyingAsync = (
  expectedTokenFlowsDetails: any,
  cTokenAddressesArray: Address[],
  underlyingAddressesArray: Address[],
  cTokenExchangeRateArray: BigNumber[],
): TokenFlowsDetails => {
  const cTokenToUnderlyingObject = constructObjectFromArray(
    cTokenAddressesArray,
    underlyingAddressesArray
  );

  const cTokenToExchangeRateObject = constructObjectFromArray(
    cTokenAddressesArray,
    cTokenExchangeRateArray
  );

  const newInflow = expectedTokenFlowsDetails['inflow'].map((component: Component) => {
    if (cTokenToUnderlyingObject[component.address]) {
      const cTokenConversion = cTokenToExchangeRateObject[component.address].div(10 ** 18);
      const newAddress = cTokenToUnderlyingObject[component.address];
      const newUnit = component.unit.mul(cTokenConversion).round(0, BigNumber.ROUND_DOWN);

      return { address: newAddress, unit: newUnit };
    } else {
      return component;
    }
  });

  const newOutflow = expectedTokenFlowsDetails['outflow'].map((component: Component) => {
    if (cTokenToUnderlyingObject[component.address]) {
      const cTokenConversion = cTokenToExchangeRateObject[component.address].div(10 ** 18);
      const newAddress = cTokenToUnderlyingObject[component.address];
      const newUnit = component.unit.mul(cTokenConversion).round(0, BigNumber.ROUND_DOWN);

      return { address: newAddress, unit: newUnit };
    } else {
      return component;
    }
  });

  return { inflow: newInflow, outflow: newOutflow };
};
