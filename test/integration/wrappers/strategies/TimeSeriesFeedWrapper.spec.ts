/*
  Copyright 2019 Set Labs Inc.

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
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import { MedianContract } from 'set-protocol-contracts';
import { TimeSeriesFeedContract } from 'set-protocol-strategies';
import { Address, TimeSeriesFeedState, Web3Utils } from 'set-protocol-utils';

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { TimeSeriesFeedWrapper } from '@src/wrappers';
import { BigNumber } from '@src/util';
import {
  addPriceFeedOwnerToMedianizer,
  deployMedianizerAsync,
  deployTimeSeriesFeedAsync,
  updateMedianizerPriceAsync
} from '@test/helpers';

const { SetProtocolTestUtils: SetTestUtils } = setProtocolUtils;
const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('TimeSeriesFeedWrapper', () => {
  let dailyPriceFeed: TimeSeriesFeedContract;
  let timeSeriesFeedWrapper: TimeSeriesFeedWrapper;

  const priceFeedUpdateFrequency: BigNumber = new BigNumber(10);
  const initialMedianizerEthPrice: BigNumber = new BigNumber(1000000);
  const seededPriceFeedPrices: BigNumber[] = [
    new BigNumber(1000000),
    new BigNumber(2000000),
    new BigNumber(3000000),
    new BigNumber(4000000),
    new BigNumber(5000000),
  ];

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    const medianizer: MedianContract = await deployMedianizerAsync(web3);
    await addPriceFeedOwnerToMedianizer(medianizer, DEFAULT_ACCOUNT);
    await updateMedianizerPriceAsync(
      web3,
      medianizer,
      initialMedianizerEthPrice,
      SetTestUtils.generateTimestamp(1000),
    );

    // Since not testing data quality just use deployed medianizer as dataSource
    const dataSourceAddress = medianizer.address;
    dailyPriceFeed = await deployTimeSeriesFeedAsync(
      web3,
      dataSourceAddress,
      seededPriceFeedPrices,
      priceFeedUpdateFrequency
    );

    timeSeriesFeedWrapper = new TimeSeriesFeedWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('nextEarliestUpdate', async () => {
    let subjectPriceFeedAddress: Address;

    beforeEach(async () => {
      subjectPriceFeedAddress = dailyPriceFeed.address;
    });

    async function subject(): Promise<BigNumber> {
      return await timeSeriesFeedWrapper.nextEarliestUpdate(
        subjectPriceFeedAddress
      );
    }

    test('fetches the correct timestamp', async () => {
      const nextAvailableUpdate = await subject();

      const blockNumber = await web3.eth.getBlockNumber();
      const { timestamp } = await web3.eth.getBlock(blockNumber);
      const expectedTimestamp = new BigNumber(timestamp).add(priceFeedUpdateFrequency);
      expect(nextAvailableUpdate).to.bignumber.equal(expectedTimestamp);
    });
  });

  describe('getTimeSeriesFeedState', async () => {
    let subjectTimeSeriesFeedAddress: Address;

    beforeEach(async () => {
      subjectTimeSeriesFeedAddress = dailyPriceFeed.address;
    });

    async function subject(): Promise<TimeSeriesFeedState> {
      return await timeSeriesFeedWrapper.getTimeSeriesFeedState(
        subjectTimeSeriesFeedAddress
      );
    }

    test('fetches the correct TimeSeriesFeedState', async () => {
      const timeSeriesFeedState = await subject();

      const blockNumber = await web3.eth.getBlockNumber();
      const { timestamp } = await web3.eth.getBlock(blockNumber);
      const expectedUpdateTimestamp = new BigNumber(timestamp).add(priceFeedUpdateFrequency);

      expect(timeSeriesFeedState.nextEarliestUpdate).to.bignumber.equal(expectedUpdateTimestamp);
      expect(timeSeriesFeedState.updateInterval).to.bignumber.equal(priceFeedUpdateFrequency);
      expect(JSON.stringify(timeSeriesFeedState.timeSeriesData.dataArray))
        .to.equal(JSON.stringify(seededPriceFeedPrices));
    });
  });
});
