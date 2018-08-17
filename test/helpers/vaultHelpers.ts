/*
  Copyright 2018 Set Labs Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

import * as Web3 from 'web3';

import { Provider } from 'ethereum-types';
import { Vault } from 'set-protocol-contracts';
import { Address } from 'set-protocol-utils';
import { DEFAULT_ACCOUNT } from '../accounts';
import { VaultAPI } from '../../src/api';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT } from '../../src/constants';
import { VaultContract } from '../../src/contracts';

const contract = require('truffle-contract');

const txDefaults = {
  from: DEFAULT_ACCOUNT,
  gasPrice: DEFAULT_GAS_PRICE,
  gas: DEFAULT_GAS_LIMIT,
};

export const initializeVaultAPI = async (provider: Provider, vaultAddress: Address) => {
  const vaultContract = contract(Vault);
  vaultContract.setProvider(provider);
  vaultContract.defaults(txDefaults);

  // Instantiate web3
  const web3 = new Web3(provider);

  // Instantiate VaultAPI
  const vaultWrapper = await VaultContract.at(vaultAddress, web3, txDefaults);
  const vaultAPI = new VaultAPI(web3, vaultWrapper.address);
  return vaultAPI;
};
