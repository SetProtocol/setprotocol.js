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

import * as _ from 'lodash';
import * as chai from 'chai';
import Web3 from 'web3';
import { Address, Web3Utils } from 'set-protocol-utils';
import * as setProtocolUtils from 'set-protocol-utils';
import {
  ConstantPriceOracleContract,
  HistoricalPriceFeedContract,
  MedianContract,
  MovingAverageOracleContract,
} from 'set-protocol-oracles';

import { ProtocolViewerContract } from 'set-protocol-viewers';

import ChaiSetup from '@test/helpers/chaiSetup';
import { OracleAPI } from '@src/api';
import { BigNumber, ether } from '@src/util';
import { SetProtocolConfig } from '@src/types/common';
import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { NULL_ADDRESS } from '@src/constants';
import {
  addPriceFeedOwnerToMedianizer,
  deployConstantPriceOracleAsync,
  deployHistoricalPriceFeedAsync,
  deployMedianizerAsync,
  deployMovingAverageOracleAsync,
  deployProtocolViewerAsync,
  updateMedianizerPriceAsync,
} from '@test/helpers';

ChaiSetup.configure();
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);
const { expect } = chai;

let currentSnapshotId: number;

const { SetProtocolTestUtils: SetTestUtils } = setProtocolUtils;


describe('OracleAPI', () => {
  let oracleAPI: OracleAPI;
  let protocolViewer: ProtocolViewerContract;

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

    protocolViewer = await deployProtocolViewerAsync(web3);
    const setProtocolConfig: SetProtocolConfig = {
      coreAddress: NULL_ADDRESS,
      transferProxyAddress: NULL_ADDRESS,
      vaultAddress: NULL_ADDRESS,
      setTokenFactoryAddress: NULL_ADDRESS,
      rebalancingSetTokenFactoryAddress: NULL_ADDRESS,
      kyberNetworkWrapperAddress: NULL_ADDRESS,
      rebalanceAuctionModuleAddress: NULL_ADDRESS,
      exchangeIssuanceModuleAddress: NULL_ADDRESS,
      rebalancingSetIssuanceModule: NULL_ADDRESS,
      rebalancingSetEthBidderAddress: NULL_ADDRESS,
      rebalancingSetExchangeIssuanceModule: NULL_ADDRESS,
      wrappedEtherAddress: NULL_ADDRESS,
      protocolViewerAddress: protocolViewer.address,
    };

    oracleAPI = new OracleAPI(web3, setProtocolConfig);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('getMovingAverageOraclePrice', async () => {
    let subjectMovingAverageOracleAddress: Address;
    let subjectDataPoints: BigNumber;

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

      const movingAverageOracle: MovingAverageOracleContract = await deployMovingAverageOracleAsync(
        web3,
        historicalPriceFeed.address,
        priceFeedDataDescription
      );

      subjectMovingAverageOracleAddress = movingAverageOracle.address;
      subjectDataPoints = new BigNumber(seededPriceFeedPrices.length + 1);
    });

    async function subject(): Promise<BigNumber> {
      return await oracleAPI.getMovingAverageOraclePrice(
        subjectMovingAverageOracleAddress,
        subjectDataPoints
      );
    }

    test('gets the correct price as a big number', async () => {
      const priceAverage = await subject();

      const expectAverage = new BigNumber(2666666);
      expect(priceAverage).to.bignumber.equal(expectAverage);
    });
  });

  describe('getFeedPriceAsync', async () => {
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

    async function subject(): Promise<BigNumber> {
      return await oracleAPI.getFeedPriceAsync(
        subjectMedianizerAddress
      );
    }

    test('gets the correct price', async () => {
      const price = await subject();

      expect(price).to.bignumber.equal(btcPrice);
    });
  });

  describe('#batchFetchOraclePrices', async () => {
    let component1Price: BigNumber;
    let component2Price: BigNumber;

    let component1Oracle: ConstantPriceOracleContract;
    let component2Oracle: ConstantPriceOracleContract;

    let subjectOracleAddresses: Address[];

    beforeEach(async () => {
      component1Price = ether(1);
      component2Price = ether(2);

      component1Oracle = await deployConstantPriceOracleAsync(web3, component1Price);
      component2Oracle = await deployConstantPriceOracleAsync(web3, component2Price);

      subjectOracleAddresses = [
        component1Oracle.address,
        component2Oracle.address,
      ];
    });

    async function subject(): Promise<BigNumber[]> {
      return oracleAPI.getOraclePricesAsync(
        subjectOracleAddresses,
      );
    }

    it('fetches oracle prices', async () => {
      const oraclePrices = await subject();

      const expectedOraclePrices = [component1Price, component2Price];
      expect(JSON.stringify(oraclePrices)).to.equal(JSON.stringify(expectedOraclePrices));
    });
  });
});
