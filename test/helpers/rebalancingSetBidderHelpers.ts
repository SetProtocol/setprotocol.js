import * as _ from 'lodash';
import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import { 
  RebalancingSetEthBidder,
  RebalancingSetCTokenBidder,
} from 'set-protocol-contracts';
import {
  ERC20Wrapper,
  RebalancingSetEthBidderContract,
  RebalancingSetCTokenBidderContract,
  RebalanceAuctionModuleContract,
  TransferProxyContract,
  WethMockContract,
} from 'set-protocol-contracts';

import {
  DEFAULT_ACCOUNT,
  TX_DEFAULTS,
} from '@src/constants';

import { setDefaultTruffleContract } from './coreHelpers';

export const deployRebalancingSetEthBidderAsync = async (
  web3: Web3,
  rebalanceAuctionModule: RebalanceAuctionModuleContract,
  transferProxy: TransferProxyContract,
  wrappedEther: WethMockContract,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<RebalancingSetEthBidderContract> => {
  const truffleRebalancingSetEthBidderContract = setDefaultTruffleContract(web3, RebalancingSetEthBidder);
  const truffleERC20WrapperContract = setDefaultTruffleContract(web3, ERC20Wrapper);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleRebalancingSetEthBidderContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedRebalancingSetEthBidderContract =
    await truffleRebalancingSetEthBidderContract.new(
      rebalanceAuctionModule.address,
      transferProxy.address,
      wrappedEther.address,
    );

  // Initialize typed contract class
  const rebalancingSetEthBidder = await RebalancingSetEthBidderContract.at(
    deployedRebalancingSetEthBidderContract.address,
    web3,
    TX_DEFAULTS,
  );

  return rebalancingSetEthBidder;
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