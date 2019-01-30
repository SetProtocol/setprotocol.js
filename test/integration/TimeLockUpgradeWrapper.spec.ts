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
  TimeLockUpgradeContract,
  TransferProxyContract,
} from 'set-protocol-contracts';
import { Address, Bytes, Web3Utils } from 'set-protocol-utils';

import { CoreWrapper, TimeLockUpgradeWrapper } from '@src/wrappers';
import { DEFAULT_ACCOUNT, TX_DEFAULTS } from '@src/constants';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber } from '@src/util';
import { deployTransferProxyContract } from '@test/helpers';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('TimeLockUpgradeWrapper', () => {
  let timeLockUpgradeWrapper: TimeLockUpgradeWrapper;
  let transferProxy: TransferProxyContract;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    transferProxy = await deployTransferProxyContract(web3);

    timeLockUpgradeWrapper = new TimeLockUpgradeWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('timeLockPeriod', async () => {
    let subjectAuthorizableContract: Address;
    let timeLockPeriod: BigNumber;

    let authorizedTarget: Address;

    beforeEach(async () => {
      authorizedTarget = ACCOUNTS[1].address;
      timeLockPeriod = new BigNumber(100);

      // Set up timeLock
      await transferProxy.setTimeLockPeriod.sendTransactionAsync(
        timeLockPeriod,
        { from: DEFAULT_ACCOUNT }
      );

      subjectAuthorizableContract = transferProxy.address;
    });

    async function subject(): Promise<BigNumber> {
      return await timeLockUpgradeWrapper.timeLockPeriod(subjectAuthorizableContract);
    }

    test('gets the correct timeLockPeriod', async () => {
      const actualTimeLockPeriod = await subject();

      expect(actualTimeLockPeriod).to.bignumber.equal(timeLockPeriod);
    });
  });

  describe('timeLockedUpgrades', async () => {
    let subjectAuthorizableContract: Address;
    let subjectTimeLockUpgradeHash: Bytes;

    let timeLockPeriod: BigNumber;

    let submissionTimeStamp: BigNumber;

    let authorizedTarget: Address;

    beforeEach(async () => {
      authorizedTarget = ACCOUNTS[1].address;
      timeLockPeriod = new BigNumber(100);

      // Set up timeLock
      await transferProxy.setTimeLockPeriod.sendTransactionAsync(
        timeLockPeriod,
        { from: DEFAULT_ACCOUNT }
      );

      const txHash = await transferProxy.addAuthorizedAddress.sendTransactionAsync(
        authorizedTarget,
        { from: DEFAULT_ACCOUNT }
      );

      const { blockNumber } = await web3.eth.getTransactionReceipt(txHash);
      const { input } = await web3.eth.getTransaction(txHash);
      const { timestamp } = await web3.eth.getBlock(blockNumber);
      submissionTimeStamp = new BigNumber(timestamp);

      subjectTimeLockUpgradeHash = web3.utils.soliditySha3(input);

      subjectAuthorizableContract = transferProxy.address;
    });

    async function subject(): Promise<BigNumber> {
      return await timeLockUpgradeWrapper.timeLockedUpgrades(
        subjectAuthorizableContract,
        subjectTimeLockUpgradeHash,
      );
    }

    test('gets the correct timestamp', async () => {
      const actualTimeLockPeriod = await subject();

      expect(actualTimeLockPeriod).to.bignumber.equal(submissionTimeStamp);
    });
  });
});
