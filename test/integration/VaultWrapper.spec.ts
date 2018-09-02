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

// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock('set-protocol-contracts');
jest.setTimeout(30000);

import * as chai from 'chai';
import * as Web3 from 'web3';
import {
  CoreContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';
import { Address } from 'set-protocol-utils';

import { CoreWrapper, VaultWrapper } from '../../src/wrappers';
import { DEFAULT_ACCOUNT, TX_DEFAULTS } from '../../src/constants';
import { BigNumber, Web3Utils } from '../../src/util';
import {
  addAuthorizationAsync,
  approveForTransferAsync,
  deployCoreContract,
  deployVaultContract,
  deployTokenAsync,
  deployTransferProxyContract
} from '../helpers';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('VaultWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;

  let coreWrapper: CoreWrapper;
  let vaultWrapper: VaultWrapper;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    transferProxy = await deployTransferProxyContract(provider);
    vault = await deployVaultContract(provider);
    core = await deployCoreContract(provider, transferProxy.address, vault.address);

    await addAuthorizationAsync(vault, core.address);
    await addAuthorizationAsync(transferProxy, core.address);

    coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);
    vaultWrapper = new VaultWrapper(web3, vault.address);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('getBalanceInVault', async () => {
    let token: StandardTokenMockContract;
    let vaultBalance: BigNumber;

    let subjectTokenAddress: Address;
    let subjectTokenOwner: Address;

    beforeEach(async () => {
      token = await deployTokenAsync(provider);
      await approveForTransferAsync([token], transferProxy.address);

      vaultBalance = new BigNumber(100);
      await coreWrapper.deposit(
        token.address,
        vaultBalance,
        { from: DEFAULT_ACCOUNT }
      );

      subjectTokenAddress = token.address;
      subjectTokenOwner = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<BigNumber> {
      return await vaultWrapper.getBalanceInVault(
        subjectTokenAddress,
        subjectTokenOwner,
      );
    }

    test('gets owner balance', async () => {
      const vaultTokenBalance = await subject();

      expect(vaultTokenBalance).to.bignumber.equal(vaultBalance);
    });
  });
});
