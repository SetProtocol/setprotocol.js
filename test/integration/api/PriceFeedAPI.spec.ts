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

import * as _ from 'lodash';
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import Web3 from 'web3';
import { Address, TimeSeriesFeedState, Web3Utils } from 'set-protocol-utils';
import * as setProtocolUtils from 'set-protocol-utils';
import {
  HistoricalPriceFeedContract,
  LinearizedPriceDataSourceContract,
  MedianContract,
  TimeSeriesFeedContract,
} from 'set-protocol-oracles';

import ChaiSetup from '@test/helpers/chaiSetup';
import { PriceFeedAPI } from '@src/api';
import { BigNumber } from '@src/util';
import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { TX_DEFAULTS } from '@src/constants';
import {
  addPriceFeedOwnerToMedianizer,
  deployHistoricalPriceFeedAsync,
  deployLinearizedPriceDataSourceAsync,
  deployMedianizerAsync,
  deployTimeSeriesFeedAsync,
  updateMedianizerPriceAsync,
  increaseChainTimeAsync,
} from '@test/helpers';

const Core = require('set-protocol-contracts/dist/artifacts/ts/Core').Core;

ChaiSetup.configure();
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);
const { expect } = chai;

let currentSnapshotId: number;

const { SetProtocolTestUtils: SetTestUtils } = setProtocolUtils;

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);


describe('PriceFeedAPI', () => {
  let priceFeedAPI: PriceFeedAPI;

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

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    priceFeedAPI = new PriceFeedAPI(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('getRollingHistoricalFeedLastUpdatedAsync', async () => {
    let subjectPriceFeedAddress: Address;

    beforeEach(async () => {
      const medianizer: MedianContract = await deployMedianizerAsync(web3);
      await addPriceFeedOwnerToMedianizer(medianizer, DEFAULT_ACCOUNT);
      await updateMedianizerPriceAsync(
        web3,
        medianizer,
        initialMedianizerEthPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      const historicalPriceFeed: HistoricalPriceFeedContract = await deployHistoricalPriceFeedAsync(
        web3,
        priceFeedUpdateFrequency,
        medianizer.address,
        priceFeedDataDescription,
        seededPriceFeedPrices
      );

      subjectPriceFeedAddress = historicalPriceFeed.address;
    });

    async function subject(): Promise<BigNumber> {
      return await priceFeedAPI.getHistoricalPriceFeedLastUpdatedAsync(
        subjectPriceFeedAddress,
      );
    }

    test('fetches the correct timestamp', async () => {
      const lastUpdatedTimestamp = await subject();

      const blockNumber = await web3.eth.getBlockNumber();
      const { timestamp } = await web3.eth.getBlock(blockNumber);
      expect(lastUpdatedTimestamp).to.bignumber.equal(timestamp);
    });
  });

  describe('getTimeSeriesFeedNextEarliestUpdateAsync', async () => {
    let subjectPriceFeedAddress: Address;

    beforeEach(async () => {
      const medianizer: MedianContract = await deployMedianizerAsync(web3);
      await addPriceFeedOwnerToMedianizer(medianizer, DEFAULT_ACCOUNT);
      await updateMedianizerPriceAsync(
        web3,
        medianizer,
        initialMedianizerEthPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      const timeSeriesFeed: TimeSeriesFeedContract = await deployTimeSeriesFeedAsync(
        web3,
        medianizer.address,
        seededPriceFeedPrices,
        priceFeedUpdateFrequency
      );

      subjectPriceFeedAddress = timeSeriesFeed.address;
    });

    async function subject(): Promise<BigNumber> {
      return await priceFeedAPI.getTimeSeriesFeedNextEarliestUpdateAsync(
        subjectPriceFeedAddress,
      );
    }

    test('fetches the correct timestamp', async () => {
      const lastUpdatedTimestamp = await subject();

      const blockNumber = await web3.eth.getBlockNumber();
      const { timestamp } = await web3.eth.getBlock(blockNumber);
      const expectedTimestamp = new BigNumber(timestamp).add(priceFeedUpdateFrequency);
      expect(lastUpdatedTimestamp).to.bignumber.equal(expectedTimestamp);
    });
  });

  describe('getTimeSeriesFeedState', async () => {
    let subjectPriceFeedAddress: Address;

    beforeEach(async () => {
      const medianizer: MedianContract = await deployMedianizerAsync(web3);
      await addPriceFeedOwnerToMedianizer(medianizer, DEFAULT_ACCOUNT);
      await updateMedianizerPriceAsync(
        web3,
        medianizer,
        initialMedianizerEthPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      const timeSeriesFeed: TimeSeriesFeedContract = await deployTimeSeriesFeedAsync(
        web3,
        medianizer.address,
        seededPriceFeedPrices,
        priceFeedUpdateFrequency,
      );

      subjectPriceFeedAddress = timeSeriesFeed.address;
    });

    async function subject(): Promise<TimeSeriesFeedState> {
      return await priceFeedAPI.getTimeSeriesFeedState(
        subjectPriceFeedAddress,
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

  describe('getRollingHistoricalFeedPricesAsync', async () => {
    let medianizer: MedianContract;

    let subjectPriceFeedAddress: Address;
    let subjectDayCount: BigNumber;

    beforeEach(async () => {
      medianizer = await deployMedianizerAsync(web3);
      await addPriceFeedOwnerToMedianizer(medianizer, DEFAULT_ACCOUNT);
      await updateMedianizerPriceAsync(
        web3,
        medianizer,
        initialMedianizerEthPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      const historicalPriceFeed: HistoricalPriceFeedContract = await deployHistoricalPriceFeedAsync(
        web3,
        priceFeedUpdateFrequency,
        medianizer.address,
        priceFeedDataDescription,
        seededPriceFeedPrices
      );

      subjectPriceFeedAddress = historicalPriceFeed.address;
      subjectDayCount = new BigNumber(seededPriceFeedPrices.length + 1);
    });

    async function subject(): Promise<BigNumber[]> {
      return await priceFeedAPI.getLatestPriceFeedDataAsync(
        subjectPriceFeedAddress,
        subjectDayCount
      );
    }

    test('gets the correct data for the number of data days in reverse', async () => {
      const prices = await subject();

      const expectedPrices = [initialMedianizerEthPrice].concat(seededPriceFeedPrices.reverse());
      expect(JSON.stringify(prices)).to.equal(JSON.stringify(expectedPrices));
    });

    describe('when price feed is TimeSeriesFeed', async () => {
      beforeEach(async () => {
        const linearizedPriceDataSource: LinearizedPriceDataSourceContract =
          await deployLinearizedPriceDataSourceAsync(
            web3,
            medianizer.address,
          );

        const timeSeriesFeed: TimeSeriesFeedContract = await deployTimeSeriesFeedAsync(
          web3,
          linearizedPriceDataSource.address,
          seededPriceFeedPrices,
          priceFeedUpdateFrequency,
        );

        increaseChainTimeAsync(web3, new BigNumber(10000000));

        subjectPriceFeedAddress = timeSeriesFeed.address;
        subjectDayCount = new BigNumber(seededPriceFeedPrices.length);
      });

      test('gets the correct data for the number of data days in reverse', async () => {
        const prices = await subject();

        const expectedPrices = seededPriceFeedPrices.reverse();
        expect(JSON.stringify(prices)).to.equal(JSON.stringify(expectedPrices));
      });
    });
  });

  describe('updateRollingHistoricalFeedPriceAsync', async () => {
    let medianizer: MedianContract;
    let newMedianizerPrice: BigNumber;

    let subjectPriceFeedAddress: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      medianizer = await deployMedianizerAsync(web3);
      await addPriceFeedOwnerToMedianizer(medianizer, DEFAULT_ACCOUNT);
      await updateMedianizerPriceAsync(
        web3,
        medianizer,
        initialMedianizerEthPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      const historicalPriceFeed: HistoricalPriceFeedContract = await deployHistoricalPriceFeedAsync(
        web3,
        priceFeedUpdateFrequency,
        medianizer.address,
        priceFeedDataDescription,
        seededPriceFeedPrices
      );

      newMedianizerPrice = new BigNumber(10 ** 18);
      await updateMedianizerPriceAsync(
        web3,
        medianizer,
        newMedianizerPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      increaseChainTimeAsync(web3, new BigNumber(10000000));

      subjectPriceFeedAddress = historicalPriceFeed.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await priceFeedAPI.updatePriceFeedDataAsync(
        subjectPriceFeedAddress,
        { from: subjectCaller }
      );
    }

    test('adds another data point to the price feed equivalent to the current price on the medianizer', async () => {
      await subject();

      const dataPointsToRead = new BigNumber(1);
      const [mostRecentPrice] = await priceFeedAPI.getLatestPriceFeedDataAsync(
        subjectPriceFeedAddress,
        dataPointsToRead
      );

      expect(mostRecentPrice).to.bignumber.equal(newMedianizerPrice);
    });

    describe('when price feed is TimeSeriesFeed', async () => {
      beforeEach(async () => {
        const linearizedPriceDataSource: LinearizedPriceDataSourceContract =
          await deployLinearizedPriceDataSourceAsync(
            web3,
            medianizer.address,
          );

        const timeSeriesFeed: TimeSeriesFeedContract = await deployTimeSeriesFeedAsync(
          web3,
          linearizedPriceDataSource.address,
          seededPriceFeedPrices,
          priceFeedUpdateFrequency,
        );

        newMedianizerPrice = new BigNumber(10 ** 18);
        await updateMedianizerPriceAsync(
          web3,
          medianizer,
          newMedianizerPrice,
          SetTestUtils.generateTimestamp(1000),
        );

        increaseChainTimeAsync(web3, priceFeedUpdateFrequency);

        subjectPriceFeedAddress = timeSeriesFeed.address;
      });

      test('adds another data point to the price feed equivalent to the current price on the medianizer', async () => {
        await subject();

        const dataPointsToRead = new BigNumber(1);
        const [mostRecentPrice] = await priceFeedAPI.getLatestPriceFeedDataAsync(
          subjectPriceFeedAddress,
          dataPointsToRead
        );

        expect(mostRecentPrice).to.bignumber.equal(newMedianizerPrice);
      });
    });
  });
});
