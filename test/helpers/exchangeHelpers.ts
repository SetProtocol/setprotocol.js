import * as Web3 from 'web3';
import * as _ from 'lodash';

import {
  TakerWalletWrapper,
} from 'set-protocol-contracts';
import { BigNumber } from '../../src/util';
import { Address } from '../../src/types/common.js';
import { ACCOUNTS } from '../accounts';
import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
} from '../../src/constants';

const contract = require('truffle-contract');

const txDefaults = {
  from: ACCOUNTS[0].address,
  gasPrice: DEFAULT_GAS_PRICE,
  gas: DEFAULT_GAS_LIMIT,
};

export const deployTakerWalletExchangeWrapper = async (
  transferProxyAddress: Address,
  provider: Web3.Provider,
) => {
  const web3 = new Web3(provider);

  const takerWalletWrapperContract = contract(TakerWalletWrapper);
  takerWalletWrapperContract.setProvider(provider);
  takerWalletWrapperContract.defaults(txDefaults);

  const takerWalletWrapperInstance = await takerWalletWrapperContract.new(
    transferProxyAddress,
    txDefaults,
  );

  return takerWalletWrapperInstance.address;
};
