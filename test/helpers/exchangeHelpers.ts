import * as Web3 from 'web3';
import * as _ from 'lodash';

import { Provider } from 'ethereum-types';
import {
  TakerWalletWrapper,
  ZeroExExchangeWrapper,
} from 'set-protocol-contracts';
import { Address } from 'set-protocol-utils';
import {
  TakerWalletWrapperContract,
  ZeroExExchangeWrapperContract,
  TransferProxyContract,
} from '../../src/contracts';
import { BigNumber } from '../../src/util';
import { DEFAULT_ACCOUNT } from '../accounts';
import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
} from '../../src/constants';

const contract = require('truffle-contract');

const txDefaults = {
  from: DEFAULT_ACCOUNT,
  gasPrice: DEFAULT_GAS_PRICE,
  gas: DEFAULT_GAS_LIMIT,
};

export const deployTakerWalletExchangeWrapper = async (
  transferProxyAddress: Address,
  coreAddress: Address,
  provider: Provider,
) => {
  const web3 = new Web3(provider);

  const takerWalletWrapperContract = contract(TakerWalletWrapper);
  takerWalletWrapperContract.setProvider(provider);
  takerWalletWrapperContract.defaults(txDefaults);

  const takerWalletWrapperInstance = await takerWalletWrapperContract.new(
    transferProxyAddress,
    txDefaults,
  );

  const takerWalletWrapperContractWrapper = await TakerWalletWrapperContract.at(
    takerWalletWrapperInstance.address,
    web3,
    txDefaults,
  );
  const transferProxyContractWrapper = await TransferProxyContract.at(
    transferProxyAddress,
    web3,
    txDefaults,
  );

  takerWalletWrapperContractWrapper.addAuthorizedAddress.sendTransactionAsync(
    coreAddress,
    txDefaults,
  );
  transferProxyContractWrapper.addAuthorizedAddress.sendTransactionAsync(
    takerWalletWrapperInstance.address,
    txDefaults,
  );

  return takerWalletWrapperInstance.address;
};

export const deployZeroExExchangeWrapper = async (
  zeroExExchangeAddress: Address,
  zeroExProxyAddress: Address,
  transferProxyAddress: Address,
  provider: Provider,
) => {
  const web3 = new Web3(provider);

  const zeroExExchangeWrapperContract = contract(ZeroExExchangeWrapper);
  zeroExExchangeWrapperContract.setProvider(provider);
  zeroExExchangeWrapperContract.defaults(txDefaults);

  const zeroExExchangeWrapperInstance = await zeroExExchangeWrapperContract.new(
    zeroExExchangeAddress,
    zeroExProxyAddress,
    transferProxyAddress,
    txDefaults,
  );

  return zeroExExchangeWrapperInstance.address;
};
