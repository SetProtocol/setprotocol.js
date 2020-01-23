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
import { BigNumber } from '@src/util';

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