import * as Web3 from 'web3';
import { UInt } from 'set-protocol-utils';

import { Web3Utils } from './Web3Utils';
import { TxData } from '../types/common';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT } from '../constants';

export async function generateTxOpts(
  web3: Web3,
  txOpts?: TxData,
): Promise<TxData> {
  const web3Utils = new Web3Utils(web3);
  const accounts = await web3Utils.getAvailableAddressesAsync();

  return {
    from: accounts[0], // default to first account from provider
    gas: DEFAULT_GAS_LIMIT,
    gasPrice: DEFAULT_GAS_PRICE,
    ...txOpts,
  };
}
