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
