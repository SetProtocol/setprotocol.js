import * as _ from 'lodash';
import Web3 from 'web3';
import {
  CoreContract,
  ERC20Wrapper,
  KyberNetworkWrapper,
  KyberNetworkWrapperContract,
  TransferProxyContract,
  ZeroExExchangeWrapper,
  ZeroExExchangeWrapperContract,
} from 'set-protocol-contracts';
import { Address, SetProtocolUtils } from 'set-protocol-utils';

import { TX_DEFAULTS } from '@src/constants';

import { setDefaultTruffleContract } from './coreHelpers';

export const deployZeroExExchangeWrapperContract = async (
  web3: Web3,
  zeroExExchangeAddress: Address,
  zeroExProxyAddress: Address,
  zeroExTokenAddress: Address,
  transferProxy: TransferProxyContract,
  core: CoreContract,
): Promise<ZeroExExchangeWrapperContract> => {
  const truffleZeroExExchangeWrapperContract = setDefaultTruffleContract(web3, ZeroExExchangeWrapper);

  const truffleERC20WrapperContract = setDefaultTruffleContract(web3, ERC20Wrapper);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleZeroExExchangeWrapperContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedZeroExExchangeWrapper = await truffleZeroExExchangeWrapperContract.new(
    core.address,
    zeroExExchangeAddress,
    zeroExProxyAddress,
    zeroExTokenAddress,
    transferProxy.address,
    TX_DEFAULTS,
  );
  const zeroExExchangeWrapperContract = await ZeroExExchangeWrapperContract.at(
    deployedZeroExExchangeWrapper.address,
    web3,
    TX_DEFAULTS,
  );

  await core.addExchange.sendTransactionAsync(
    SetProtocolUtils.EXCHANGES.ZERO_EX,
    zeroExExchangeWrapperContract.address,
    TX_DEFAULTS
  );

  return zeroExExchangeWrapperContract;
};

export const deployKyberNetworkWrapperContract = async (
  web3: Web3,
  kyberNetworkProxyAddress: Address,
  transferProxy: TransferProxyContract,
  core: CoreContract,
): Promise<KyberNetworkWrapperContract> => {
  const truffleKyberNetworkWrapperContract = setDefaultTruffleContract(web3, KyberNetworkWrapper);

  const truffleERC20WrapperContract = setDefaultTruffleContract(web3, ERC20Wrapper);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleKyberNetworkWrapperContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedKyberNetworkWrapper = await truffleKyberNetworkWrapperContract.new(
    core.address,
    kyberNetworkProxyAddress,
    transferProxy.address,
    TX_DEFAULTS
  );
  const kyberNetworkWrapper = await KyberNetworkWrapperContract.at(
    deployedKyberNetworkWrapper.address,
    web3,
    TX_DEFAULTS,
  );

  await core.addExchange.sendTransactionAsync(
    SetProtocolUtils.EXCHANGES.KYBER,
    kyberNetworkWrapper.address,
    TX_DEFAULTS
  );

  return kyberNetworkWrapper;
};
