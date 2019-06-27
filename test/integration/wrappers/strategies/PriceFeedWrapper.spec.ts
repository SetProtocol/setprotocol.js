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
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import { MedianContract } from 'set-protocol-contracts';
import { Address, Bytes } from 'set-protocol-utils';

import { PriceFeedWrapper } from '@src/wrappers';
import { DEFAULT_ACCOUNT } from '@src/constants';
import { BigNumber } from '@src/util';
import { deployMedianizerAsync, addPriceFeedOwnerToMedianizer, updateMedianizerPriceAsync } from '@test/helpers';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('PriceFeedWrapper', () => {
  let priceFeedWrapper: PriceFeedWrapper;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    priceFeedWrapper = new PriceFeedWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('read', async () => {
    let subjectMedianizerAddress: Address;

    let btcMedianizer: MedianContract;
    let btcPrice: BigNumber;

    beforeEach(async () => {
      btcMedianizer = await deployMedianizerAsync(web3);
      await addPriceFeedOwnerToMedianizer(btcMedianizer, DEFAULT_ACCOUNT);

      btcPrice = new BigNumber(4082 * 10 ** 18);
      await updateMedianizerPriceAsync(
        web3,
        btcMedianizer,
        btcPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      subjectMedianizerAddress = btcMedianizer.address;
    });

    async function subject(): Promise<Bytes> {
      return await priceFeedWrapper.read(
        subjectMedianizerAddress
      );
    }

    test('gets the correct price', async () => {
      const price = await subject();

      const priceBuffer = SetUtils.paddedBufferForBigNumber(btcPrice);
      const expectedValue = SetTestUtils.bufferArrayToHex([priceBuffer]);
      expect(price).to.equal(expectedValue);
    });
  });
});
