import * as _ from 'lodash';
import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import { RebalancingSetEthBidder } from 'set-protocol-contracts';
import {
  ERC20Wrapper,
  RebalancingSetEthBidderContract,
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
