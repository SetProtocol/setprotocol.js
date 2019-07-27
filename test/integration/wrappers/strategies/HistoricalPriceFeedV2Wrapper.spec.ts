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
import { HistoricalPriceFeedV2Contract } from 'set-protocol-strategies';
import { Address, Web3Utils } from 'set-protocol-utils';

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { HistoricalPriceFeedV2Wrapper } from '@src/wrappers';
import { BigNumber } from '@src/util';
import {
  addPriceFeedOwnerToMedianizer,
  deployHistoricalPriceFeedV2Async,
  deployMedianizerAsync,
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
  let dailyPriceFeed: HistoricalPriceFeedV2Contract;
  let historicalPriceFeedWrapper: HistoricalPriceFeedV2Wrapper;

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

    dailyPriceFeed = await deployHistoricalPriceFeedV2Async(
      web3,
      medianizer.address,
      priceFeedUpdateFrequency,
      undefined,
      undefined,
      undefined,
      seededPriceFeedPrices
    );

    historicalPriceFeedWrapper = new HistoricalPriceFeedV2Wrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('nextAvailableUpdate', async () => {
    let subjectPriceFeedAddress: Address;

    beforeEach(async () => {
      subjectPriceFeedAddress = dailyPriceFeed.address;
    });

    async function subject(): Promise<BigNumber> {
      return await historicalPriceFeedWrapper.nextAvailableUpdate(
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
});
