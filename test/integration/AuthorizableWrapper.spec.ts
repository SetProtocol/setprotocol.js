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
import Web3 from 'web3';
import {
  TransferProxyContract,
} from 'set-protocol-contracts';
import { Address, Web3Utils } from 'set-protocol-utils';

import { AuthorizableWrapper } from '@src/wrappers';
import { DEFAULT_ACCOUNT } from '@src/constants';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber } from '@src/util';
import { deployTransferProxyContract } from '@test/helpers';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('AuthorizableWrapper', () => {
  let authorizableWrapper: AuthorizableWrapper;
  let transferProxy: TransferProxyContract;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    transferProxy = await deployTransferProxyContract(web3);

    authorizableWrapper = new AuthorizableWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('getAuthorizedAddresses', async () => {
    let subjectAuthorizableContract: Address;

    let authorizedTarget: Address;

    beforeEach(async () => {
      authorizedTarget = ACCOUNTS[1].address;

      await transferProxy.addAuthorizedAddress.sendTransactionAsync(
        authorizedTarget,
        { from: DEFAULT_ACCOUNT }
      );

      subjectAuthorizableContract = transferProxy.address;
    });

    async function subject(): Promise<Address[]> {
      return await authorizableWrapper.getAuthorizedAddresses(
        subjectAuthorizableContract,
      );
    }

    test('gets a list of authorized addresses', async () => {
      const authorizedAddresses = await subject();

      const expectedAuthorizedAddresses = [authorizedTarget];
      expect(JSON.stringify(authorizedAddresses)).to.equal(JSON.stringify(expectedAuthorizedAddresses));
    });
  });
});
