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

import * as _ from 'lodash';
import * as Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import { Provider } from 'ethereum-types';
import { Vault, VaultContract } from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT } from '../accounts';
import { VaultWrapper } from '../../src/wrappers';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT, TX_DEFAULTS } from '../../src/constants';
import { BigNumber } from '../../src/util';

const contract = require('truffle-contract');

export const deployVaultContract = async (provider: Provider, vaultAddress: Address): Promise<VaultContract> => {
  const vaultContract = contract(Vault);
  vaultContract.setProvider(provider);
  vaultContract.defaults(TX_DEFAULTS);

  // Instantiate web3
  const web3 = new Web3(provider);

  // Instantiate VaultWrapper
  return await VaultContract.at(vaultAddress, web3, TX_DEFAULTS);
};

export const initializeVaultWrapper = async (provider: Provider, vaultAddress: Address) => {
  const vaultContract: VaultContract = await deployVaultContract(provider, vaultAddress);
  const web3 = new Web3(provider);

  return new VaultWrapper(web3, vaultContract.address);
};

export const getVaultBalances = async (
  vault: VaultContract,
  tokenAddresses: Address[],
  owner: Address
): Promise<BigNumber[]> => {
  const balancePromises = _.map(tokenAddresses, address => {
    return vault.getOwnerBalance.callAsync(address, owner);
  });

  let vaultBalances: BigNumber[];
  await Promise.all(balancePromises).then(fetchedTokenBalances => {
    vaultBalances = fetchedTokenBalances;
  });

  return vaultBalances;
};