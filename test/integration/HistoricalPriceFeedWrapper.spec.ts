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
import { HistoricalPriceFeedContract } from 'set-protocol-strategies';
import { Address, Web3Utils } from 'set-protocol-utils';

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { HistoricalPriceFeedWrapper } from '@src/wrappers/strategies';
import { BigNumber } from '@src/util';
import {
  addPriceFeedOwnerToMedianizer,
  deployHistoricalPriceFeedAsync,
  deployMedianizerAsync,
  increaseChainTimeAsync,
  updateMedianizerPriceAsync
} from '@test/helpers';

const { SetProtocolTestUtils: SetTestUtils } = setProtocolUtils;
const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('historicalPriceFeedWrapper', () => {
  let dailyPriceFeed: HistoricalPriceFeedContract;
  let historicalPriceFeedWrapper: HistoricalPriceFeedWrapper;

  const priceFeedUpdateFrequency: BigNumber = new BigNumber(10);
  const initialMedianizerEthPrice: BigNumber = new BigNumber(1000000);
  const priceFeedDataDescription: string = '200DailyETHPrice';
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

    dailyPriceFeed = await deployHistoricalPriceFeedAsync(
      web3,
      priceFeedUpdateFrequency,
      medianizer.address,
      priceFeedDataDescription,
      seededPriceFeedPrices
    );

    historicalPriceFeedWrapper = new HistoricalPriceFeedWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('read', async () => {
    let subjectPriceFeedAddress: Address;
    let subjectDataDays: BigNumber;

    beforeEach(async () => {
      subjectPriceFeedAddress = dailyPriceFeed.address;
      subjectDataDays = new BigNumber(seededPriceFeedPrices.length + 1);
    });

    async function subject(): Promise<BigNumber[]> {
      return await historicalPriceFeedWrapper.read(
        subjectPriceFeedAddress,
        subjectDataDays
      );
    }

    test('gets the correct data for the number of data days in reverse', async () => {
      const prices = await subject();

      const expectedPrices = [initialMedianizerEthPrice].concat(seededPriceFeedPrices.reverse());
      expect(JSON.stringify(prices)).to.equal(JSON.stringify(expectedPrices));
    });
  });

  describe('lastUpdatedAt', async () => {
    let subjectPriceFeedAddress: Address;

    beforeEach(async () => {
      subjectPriceFeedAddress = dailyPriceFeed.address;
    });

    async function subject(): Promise<BigNumber> {
      return await historicalPriceFeedWrapper.lastUpdatedAt(
        subjectPriceFeedAddress
      );
    }

    test('fetches the correct timestamp', async () => {
      const lastUpdatedTimestamp = await subject();

      const blockNumber = await web3.eth.getBlockNumber();
      const { timestamp } = await web3.eth.getBlock(blockNumber);
      expect(lastUpdatedTimestamp).to.bignumber.equal(timestamp);
    });
  });

  describe('poke', async () => {
    let subjectPriceFeedAddress: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      subjectPriceFeedAddress = dailyPriceFeed.address;
      subjectCaller = DEFAULT_ACCOUNT;

      increaseChainTimeAsync(web3, priceFeedUpdateFrequency);
    });

    async function subject(): Promise<string> {
      return await historicalPriceFeedWrapper.poke(
        subjectPriceFeedAddress,
        { from: subjectCaller }
      );
    }

    test('adds another', async () => {
      await subject();

      const dataPointsToRead = new BigNumber(1);
      const [mostRecentPrice] = await historicalPriceFeedWrapper.read(subjectPriceFeedAddress, dataPointsToRead);
      expect(mostRecentPrice).to.bignumber.equal(initialMedianizerEthPrice);
    });
  });
});
