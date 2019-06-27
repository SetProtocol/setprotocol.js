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
import { HistoricalPriceFeedContract, MovingAverageOracleContract } from 'set-protocol-strategies';
import { Address, Web3Utils } from 'set-protocol-utils';

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { MovingAverageOracleWrapper } from '@src/wrappers';
import { BigNumber } from '@src/util';
import {
  addPriceFeedOwnerToMedianizer,
  deployHistoricalPriceFeedAsync,
  deployMedianizerAsync,
  deployMovingAverageOracleAsync,
  updateMedianizerPriceAsync,
} from '@test/helpers';

const { SetProtocolTestUtils: SetTestUtils } = setProtocolUtils;
const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('MovingAveragesOracleWrapper', () => {
  let movingAverageOracle: MovingAverageOracleContract;
  let movingAveragesOracleWrapper: MovingAverageOracleWrapper;

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

    const dailyPriceFeed: HistoricalPriceFeedContract = await deployHistoricalPriceFeedAsync(
      web3,
      priceFeedUpdateFrequency,
      medianizer.address,
      priceFeedDataDescription,
      seededPriceFeedPrices
    );

    movingAverageOracle = await deployMovingAverageOracleAsync(
      web3,
      dailyPriceFeed.address,
      priceFeedDataDescription
    );

    movingAveragesOracleWrapper = new MovingAverageOracleWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('read', async () => {
    let subjectMovingAverageOracleAddress: Address;
    let subjectDataPoints: BigNumber;

    beforeEach(async () => {
      subjectMovingAverageOracleAddress = movingAverageOracle.address;
      subjectDataPoints = new BigNumber(seededPriceFeedPrices.length + 1);
    });

    async function subject(): Promise<string> {
      return await movingAveragesOracleWrapper.read(
        subjectMovingAverageOracleAddress,
        subjectDataPoints
      );
    }

    test('gets the correct data for the number of data days in reverse', async () => {
      const priceAverage = await subject();

      const expectedAverage = '0x000000000000000000000000000000000000000000000000000000000028b0aa';
      expect(priceAverage).to.equal(expectedAverage);
    });
  });
});
