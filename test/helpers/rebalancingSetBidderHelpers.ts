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

const contract = require('truffle-contract');

export const deployRebalancingSetEthBidderAsync = async (
  web3: Web3,
  rebalanceAuctionModule: RebalanceAuctionModuleContract,
  transferProxy: TransferProxyContract,
  wrappedEther: WethMockContract,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<RebalancingSetEthBidderContract> => {
  const truffleRebalancingSetEthBidderContract = contract(RebalancingSetEthBidder);
  truffleRebalancingSetEthBidderContract.setProvider(web3.currentProvider);
  truffleRebalancingSetEthBidderContract.setNetwork(50);
  truffleRebalancingSetEthBidderContract.defaults(TX_DEFAULTS);

  const truffleERC20WrapperContract = contract(ERC20Wrapper);
  truffleERC20WrapperContract.setProvider(web3.currentProvider);
  truffleERC20WrapperContract.setNetwork(50);
  truffleERC20WrapperContract.defaults(TX_DEFAULTS);
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
