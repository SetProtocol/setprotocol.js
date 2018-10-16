import * as Web3 from 'web3';
import * as _ from 'lodash';

import { Provider } from 'ethereum-types';
import {
  CoreContract,
  ERC20Wrapper,
  KyberNetworkWrapper,
  KyberNetworkWrapperContract,
  TakerWalletWrapper,
  TakerWalletWrapperContract,
  TransferProxyContract,
  ZeroExExchangeWrapper,
  ZeroExExchangeWrapperContract,
} from 'set-protocol-contracts';
import { Address, SetProtocolUtils, SetProtocolTestUtils } from 'set-protocol-utils';
import { BigNumber } from '@src/util';
import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { TX_DEFAULTS } from '@src/constants';

const contract = require('truffle-contract');


export const deployTakerWalletWrapperContract = async (
  transferProxy: TransferProxyContract,
  core: CoreContract,
  provider: Provider,
): Promise<TakerWalletWrapperContract> => {
  const web3 = new Web3(provider);

  const truffleTakerWalletWrapperContract = contract(TakerWalletWrapper);
  truffleTakerWalletWrapperContract.setProvider(provider);
  truffleTakerWalletWrapperContract.setNetwork(50);
  truffleTakerWalletWrapperContract.defaults(TX_DEFAULTS);

  const truffleERC20WrapperContract = contract(ERC20Wrapper);
  truffleERC20WrapperContract.setProvider(provider);
  truffleERC20WrapperContract.setNetwork(50);
  truffleERC20WrapperContract.defaults(TX_DEFAULTS);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleTakerWalletWrapperContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedTakerWalletWrapper = await truffleTakerWalletWrapperContract.new(transferProxy.address, TX_DEFAULTS);
  const takerWalletWrapperContract = await TakerWalletWrapperContract.at(
    deployedTakerWalletWrapper.address,
    web3,
    TX_DEFAULTS,
  );

  await takerWalletWrapperContract.addAuthorizedAddress.sendTransactionAsync(core.address, TX_DEFAULTS);
  await transferProxy.addAuthorizedAddress.sendTransactionAsync(deployedTakerWalletWrapper.address, TX_DEFAULTS);
  await core.registerExchange.sendTransactionAsync(
    SetProtocolUtils.EXCHANGES.TAKER_WALLET,
    takerWalletWrapperContract.address,
    TX_DEFAULTS
  );

  return takerWalletWrapperContract;
};

export const deployZeroExExchangeWrapperContract = async (
  zeroExExchangeAddress: Address,
  zeroExProxyAddress: Address,
  zeroExTokenAddress: Address,
  transferProxy: TransferProxyContract,
  core: CoreContract,
  provider: Provider,
): Promise<ZeroExExchangeWrapperContract> => {
  const web3 = new Web3(provider);

  const truffleZeroExExchangeWrapperContract = contract(ZeroExExchangeWrapper);
  truffleZeroExExchangeWrapperContract.setProvider(provider);
  truffleZeroExExchangeWrapperContract.setNetwork(50);
  truffleZeroExExchangeWrapperContract.defaults(TX_DEFAULTS);

  const truffleERC20WrapperContract = contract(ERC20Wrapper);
  truffleERC20WrapperContract.setProvider(provider);
  truffleERC20WrapperContract.setNetwork(50);
  truffleERC20WrapperContract.defaults(TX_DEFAULTS);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleZeroExExchangeWrapperContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedZeroExExchangeWrapper = await truffleZeroExExchangeWrapperContract.new(
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

  await zeroExExchangeWrapperContract.addAuthorizedAddress.sendTransactionAsync(core.address, TX_DEFAULTS);
  await core.registerExchange.sendTransactionAsync(
    SetProtocolUtils.EXCHANGES.ZERO_EX,
    zeroExExchangeWrapperContract.address,
    TX_DEFAULTS
  );

  return zeroExExchangeWrapperContract;
};

export const deployKyberNetworkWrapperContract = async (
  kyberNetworkProxyAddress: Address,
  transferProxy: TransferProxyContract,
  core: CoreContract,
  provider: Provider,
): Promise<KyberNetworkWrapperContract> => {
  const web3 = new Web3(provider);

  const truffleKyberNetworkWrapperContract = contract(KyberNetworkWrapper);
  truffleKyberNetworkWrapperContract.setProvider(provider);
  truffleKyberNetworkWrapperContract.setNetwork(50);
  truffleKyberNetworkWrapperContract.defaults(TX_DEFAULTS);

  const truffleERC20WrapperContract = contract(ERC20Wrapper);
  truffleERC20WrapperContract.setProvider(provider);
  truffleERC20WrapperContract.setNetwork(50);
  truffleERC20WrapperContract.defaults(TX_DEFAULTS);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleKyberNetworkWrapperContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedKyberNetworkWrapper = await truffleKyberNetworkWrapperContract.new(
    kyberNetworkProxyAddress,
    transferProxy.address,
    TX_DEFAULTS
  );
  const kyberNetworkWrapper = await KyberNetworkWrapperContract.at(
    deployedKyberNetworkWrapper.address,
    web3,
    TX_DEFAULTS,
  );

  await kyberNetworkWrapper.addAuthorizedAddress.sendTransactionAsync(core.address, TX_DEFAULTS);
  await core.registerExchange.sendTransactionAsync(
    SetProtocolUtils.EXCHANGES.KYBER,
    kyberNetworkWrapper.address,
    TX_DEFAULTS
  );

  return kyberNetworkWrapper;
};
