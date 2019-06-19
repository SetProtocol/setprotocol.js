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

const timeKeeper = require('timekeeper');
const moment = require('moment');
import * as _ from 'lodash';
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import {
  Core,
  CoreContract,
  ConstantAuctionPriceCurveContract,
  MedianContract,
  SetTokenContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  MACOStrategyManagerContract,
  HistoricalPriceFeedContract,
  MovingAverageOracleContract,
} from 'set-protocol-strategies';

import ChaiSetup from '@test/helpers/chaiSetup';
import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { Assertions } from '@src/assertions';
import { MACOManagerAPI } from '@src/api';
import {
  E18,
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
} from '@src/constants';
import {
  addPriceCurveToCoreAsync,
  addPriceFeedOwnerToMedianizer,
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployHistoricalPriceFeedAsync,
  deployMovingAverageStrategyManagerAsync,
  deployMovingAverageOracleAsync,
  deployConstantAuctionPriceCurveAsync,
  deploySetTokenAsync,
  deployMedianizerAsync,
  deployTokensSpecifyingDecimals,
  increaseChainTimeAsync,
  initializeMovingAverageStrategyManagerAsync,
  updateMedianizerPriceAsync,
} from '@test/helpers';
import {
  BigNumber,
} from '@src/util';
import { Address } from '@src/types/common';
import { MACOStrategyManagerWrapper } from '@src/wrappers';
import { MovingAverageManagerDetails } from '@src/types/strategies';

ChaiSetup.configure();
const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const { SetProtocolTestUtils: SetTestUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('MACOManagerAPI', () => {
  let core: CoreContract;
  let transferProxy: TransferProxyContract;
  let factory: SetTokenFactoryContract;
  let rebalancingFactory: RebalancingSetTokenFactoryContract;
  let constantAuctionPriceCurve: ConstantAuctionPriceCurveContract;
  let macoManager: MACOStrategyManagerContract;
  let movingAverageOracle: MovingAverageOracleContract;
  let ethMedianizer: MedianContract;
  let usdc: StandardTokenMockContract;
  let wrappedETH: StandardTokenMockContract;
  let whitelist: WhiteListContract;
  let initialStableCollateral: SetTokenContract;
  let initialRiskCollateral: SetTokenContract;
  let rebalancingSetToken: RebalancingSetTokenContract;
  let auctionTimeToPivot: BigNumber;
  let crossoverConfirmationMinTime: BigNumber;
  let crossoverConfirmationMaxTime: BigNumber;

  const priceFeedUpdateFrequency: BigNumber = new BigNumber(10);
  const initialMedianizerEthPrice: BigNumber = E18;
  const priceFeedDataDescription: string = '200DailyETHPrice';
  const seededPriceFeedPrices: BigNumber[] = [
    E18.mul(1),
    E18.mul(2),
    E18.mul(3),
    E18.mul(4),
    E18.mul(5),
  ];

  const movingAverageDays = new BigNumber(5);
  const stableCollateralUnit = new BigNumber(250);
  const stableCollateralNaturalUnit = new BigNumber(10 ** 12);

  const riskCollateralUnit = new BigNumber(10 ** 6);
  const riskCollateralNaturalUnit = new BigNumber(10 ** 6);
  const initializedProposalTimestamp = new BigNumber(0);

  const assertions = new Assertions(web3);

  const macoManagerWrapper: MACOStrategyManagerWrapper = new MACOStrategyManagerWrapper(web3);

  const macoManagerAPI: MACOManagerAPI = new MACOManagerAPI(web3, assertions);

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    crossoverConfirmationMinTime = ONE_HOUR_IN_SECONDS.mul(6);
    crossoverConfirmationMaxTime = ONE_HOUR_IN_SECONDS.mul(12);

    [
      core,
      transferProxy, ,
      factory,
      rebalancingFactory, ,
      whitelist,
    ] = await deployBaseContracts(web3);

    ethMedianizer = await deployMedianizerAsync(web3);
    await addPriceFeedOwnerToMedianizer(ethMedianizer, DEFAULT_ACCOUNT);
    await updateMedianizerPriceAsync(
      web3,
      ethMedianizer,
      initialMedianizerEthPrice,
      SetTestUtils.generateTimestamp(1000),
    );

    const dailyPriceFeed: HistoricalPriceFeedContract = await deployHistoricalPriceFeedAsync(
      web3,
      priceFeedUpdateFrequency,
      ethMedianizer.address,
      priceFeedDataDescription,
      seededPriceFeedPrices
    );

    movingAverageOracle = await deployMovingAverageOracleAsync(
      web3,
      dailyPriceFeed.address,
      priceFeedDataDescription
    );

    [usdc, wrappedETH] = await deployTokensSpecifyingDecimals(2, [6, 18], web3, DEFAULT_ACCOUNT);
    await approveForTransferAsync(
      [usdc, wrappedETH],
      transferProxy.address
    );
    await addWhiteListedTokenAsync(
      whitelist,
      usdc.address,
    );
    await addWhiteListedTokenAsync(
      whitelist,
      wrappedETH.address,
    );

    constantAuctionPriceCurve = await deployConstantAuctionPriceCurveAsync(
      web3,
      DEFAULT_AUCTION_PRICE_NUMERATOR,
      DEFAULT_AUCTION_PRICE_DENOMINATOR,
    );

    addPriceCurveToCoreAsync(
      core,
      constantAuctionPriceCurve.address,
    );

    auctionTimeToPivot = ONE_DAY_IN_SECONDS;

    // Create Stable Collateral Set
    initialStableCollateral = await deploySetTokenAsync(
      web3,
      core,
      factory.address,
      [usdc.address],
      [stableCollateralUnit],
      stableCollateralNaturalUnit,
    );

    // Create Risk Collateral Set
    initialRiskCollateral = await deploySetTokenAsync(
      web3,
      core,
      factory.address,
      [wrappedETH.address],
      [riskCollateralUnit],
      riskCollateralNaturalUnit,
    );

    macoManager = await deployMovingAverageStrategyManagerAsync(
      web3,
      core.address,
      movingAverageOracle.address,
      usdc.address,
      wrappedETH.address,
      initialStableCollateral.address,
      initialRiskCollateral.address,
      factory.address,
      constantAuctionPriceCurve.address,
      movingAverageDays,
      auctionTimeToPivot,
      crossoverConfirmationMinTime,
      crossoverConfirmationMaxTime,
    );

    rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
      web3,
      core,
      rebalancingFactory.address,
      macoManager.address,
      initialRiskCollateral.address,
      ONE_DAY_IN_SECONDS,
    );

    await initializeMovingAverageStrategyManagerAsync(
      macoManager,
      rebalancingSetToken.address
    );
  });

  afterEach(async () => {
    timeKeeper.reset();

    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('getLastCrossoverConfirmationTimestampAsync', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<BigNumber> {
      return await macoManagerAPI.getLastCrossoverConfirmationTimestampAsync(
        subjectManagerAddress,
      );
    }

    test('gets the correct lastCrossoverConfirmationTimestamp', async () => {
      const lastCrossoverConfirmationTimestamp = await subject();
      expect(lastCrossoverConfirmationTimestamp).to.bignumber.equal(initializedProposalTimestamp);
    });
  });

  describe('getMovingAverageManagerDetailsAsync', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<MovingAverageManagerDetails> {
      return await macoManagerAPI.getMovingAverageManagerDetailsAsync(
        subjectManagerAddress,
      );
    }

    test('gets the correct auctionLibrary address', async () => {
      const details = await subject();
      expect(details.auctionLibrary).to.equal(constantAuctionPriceCurve.address);
    });

    test('gets the correct auctionTimeToPivot address', async () => {
      const details = await subject();
      expect(details.auctionTimeToPivot).to.bignumber.equal(auctionTimeToPivot);
    });

    test('gets the correct core address', async () => {
      const details = await subject();
      expect(details.core).to.equal(core.address);
    });

    test('gets the correct lastCrossoverConfirmationTimestamp', async () => {
      const details = await subject();
      expect(details.lastCrossoverConfirmationTimestamp).to.bignumber.equal(initializedProposalTimestamp);
    });

    test('gets the correct movingAverageDays', async () => {
      const details = await subject();
      expect(details.movingAverageDays).to.bignumber.equal(movingAverageDays);
    });

    test('gets the correct movingAveragePriceFeed', async () => {
      const details = await subject();
      expect(details.movingAveragePriceFeed).to.equal(movingAverageOracle.address);
    });

    test('gets the correct rebalancingSetToken', async () => {
      const details = await subject();
      expect(details.rebalancingSetToken).to.equal(rebalancingSetToken.address);
    });

    test('gets the correct riskAsset', async () => {
      const details = await subject();
      expect(details.riskAsset).to.equal(wrappedETH.address);
    });

    test('gets the correct riskCollateral', async () => {
      const details = await subject();
      expect(details.riskCollateral).to.equal(initialRiskCollateral.address);
    });

    test('gets the correct setTokenFactory', async () => {
      const details = await subject();
      expect(details.setTokenFactory).to.equal(factory.address);
    });

    test('gets the correct stableAsset', async () => {
      const details = await subject();
      expect(details.stableAsset).to.equal(usdc.address);
    });

    test('gets the correct stableCollateral', async () => {
      const details = await subject();
      expect(details.stableCollateral).to.equal(initialStableCollateral.address);
    });

    test('gets the correct crossoverConfirmationMinTime', async () => {
      const details = await subject();
      expect(details.crossoverConfirmationMinTime).to.bignumber.equal(crossoverConfirmationMinTime);
    });

    test('gets the correct crossoverConfirmationMaxTime', async () => {
      const details = await subject();
      expect(details.crossoverConfirmationMaxTime).to.bignumber.equal(crossoverConfirmationMaxTime);
    });
  });

  describe('initiateCrossoverProposeAsync', async () => {
    let subjectManagerAddress: Address;
    let subjectCaller: Address;

    let nextRebalanceAvailableInSeconds: BigNumber;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
      subjectCaller = DEFAULT_ACCOUNT;

      const lastRebalancedTimestampSeconds = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
      const rebalanceInterval = await rebalancingSetToken.rebalanceInterval.callAsync();
      nextRebalanceAvailableInSeconds = lastRebalancedTimestampSeconds.plus(rebalanceInterval);
    });

    afterEach(async () => {
      timeKeeper.reset();
    });

    async function subject(): Promise<string> {
      return await macoManagerAPI.initiateCrossoverProposeAsync(
        subjectManagerAddress,
        { from: subjectCaller },
      );
    }

    describe('when more than 12 hours has elapsed since the last Proposal timestamp', async () => {
      beforeEach(async () => {
        // Elapse the rebalance interval
        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.div(10),
          SetTestUtils.generateTimestamp(1000),
        );

        // Free time at the rebalance interval minimum
        timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
      });

      test('calls initialPropose and sets the lastCrossoverConfirmationTimestamp properly', async () => {
        const txnHash = await subject();
        const { blockNumber } = await web3.eth.getTransactionReceipt(txnHash);
        const { timestamp } = await web3.eth.getBlock(blockNumber);

        const lastTimestamp = await macoManagerWrapper.lastCrossoverConfirmationTimestamp(
          subjectManagerAddress,
        );
        expect(lastTimestamp).to.bignumber.equal(timestamp);
      });
    });

    describe('when the RebalancingSet is not in Default state', async () => {
      beforeEach(async () => {
        // Elapse the rebalance interval
        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.div(10),
          SetTestUtils.generateTimestamp(1000),
        );

        // Call initialPropose to set the timestamp
        await macoManagerWrapper.initialPropose(subjectManagerAddress);

        // Elapse signal confirmation period
        await increaseChainTimeAsync(web3, ONE_HOUR_IN_SECONDS.mul(7));

        // Put the rebalancing set into proposal state
        await macoManagerWrapper.confirmPropose(subjectManagerAddress);

        // Freeze the time at rebalance interval + 3 hours
        const newDesiredTimestamp = nextRebalanceAvailableInSeconds.plus(ONE_HOUR_IN_SECONDS.mul(7));
        timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${rebalancingSetToken.address} must be in Default state to call that function.`
        );
      });
    });

    describe('when insufficient time has elapsed since the last rebalance', async () => {
      beforeEach(async () => {
        // Freeze the time at rebalance interval
        const lastRebalancedTimestampSeconds = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
        timeKeeper.freeze(lastRebalancedTimestampSeconds.toNumber() * 1000);
      });

      test('throws', async () => {
        const lastRebalanceTime = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
        const rebalanceInterval = await rebalancingSetToken.rebalanceInterval.callAsync();
        const nextAvailableRebalance = lastRebalanceTime.add(rebalanceInterval).mul(1000);
        const nextRebalanceFormattedDate = moment(nextAvailableRebalance.toNumber())
        .format('dddd, MMMM Do YYYY, h:mm:ss a');

        return expect(subject()).to.be.rejectedWith(
          `Attempting to rebalance too soon. Rebalancing next ` +
          `available on ${nextRebalanceFormattedDate}`
        );
      });
    });

    describe('when no MA crossover when rebalancing Set is risk collateral', async () => {
      let currentPrice: BigNumber;

      beforeEach(async () => {
        currentPrice = initialMedianizerEthPrice.mul(5);

        // Elapse the rebalance interval
        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.mul(5),
          SetTestUtils.generateTimestamp(1000),
        );

        // Freeze the time at rebalance interval
        timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
      });

      test('throws', async () => {
        const movingAverage = new BigNumber(await movingAverageOracle.read.callAsync(movingAverageDays));

        return expect(subject()).to.be.rejectedWith(
          `Current Price ${currentPrice.toString()} must be less than Moving Average ${movingAverage.toString()}`
        );
      });
    });

    describe('when no MA crossover when rebalancing Set is stable collateral', async () => {
      let currentPriceThatIsBelowMA: BigNumber;

      beforeEach(async () => {

        macoManager = await deployMovingAverageStrategyManagerAsync(
          web3,
          core.address,
          movingAverageOracle.address,
          usdc.address,
          wrappedETH.address,
          initialStableCollateral.address,
          initialRiskCollateral.address,
          factory.address,
          constantAuctionPriceCurve.address,
          movingAverageDays,
          auctionTimeToPivot,
          crossoverConfirmationMinTime,
          crossoverConfirmationMaxTime,
        );

        rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
          web3,
          core,
          rebalancingFactory.address,
          macoManager.address,
          initialStableCollateral.address,
          ONE_DAY_IN_SECONDS,
        );

        await initializeMovingAverageStrategyManagerAsync(
          macoManager,
          rebalancingSetToken.address
        );

        currentPriceThatIsBelowMA = initialMedianizerEthPrice.div(10);

        // Elapse the rebalance interval
        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          currentPriceThatIsBelowMA,
          SetTestUtils.generateTimestamp(1000),
        );

        subjectManagerAddress = macoManager.address;

        // Freeze the time at rebalance interval
        const lastRebalancedTimestampSeconds = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
        const rebalanceInterval = await rebalancingSetToken.rebalanceInterval.callAsync();
        nextRebalanceAvailableInSeconds = lastRebalancedTimestampSeconds.plus(rebalanceInterval);
        timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
      });

      test('throws', async () => {
        const movingAverage = new BigNumber(await movingAverageOracle.read.callAsync(movingAverageDays));

        return expect(subject()).to.be.rejectedWith(
          `Current Price ${currentPriceThatIsBelowMA.toString()} must be ` +
          `greater than Moving Average ${movingAverage.toString()}`
        );
      });
    });
  });

  describe('confirmCrossoverProposeAsync', async () => {
    let subjectManagerAddress: Address;
    let subjectCaller: Address;

    let nextRebalanceAvailableInSeconds: BigNumber;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
      subjectCaller = DEFAULT_ACCOUNT;

      const lastRebalancedTimestampSeconds = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
      const rebalanceInterval = await rebalancingSetToken.rebalanceInterval.callAsync();
      nextRebalanceAvailableInSeconds = lastRebalancedTimestampSeconds.plus(rebalanceInterval);
    });

    afterEach(async () => {
      timeKeeper.reset();
    });

    async function subject(): Promise<string> {
      return await macoManagerAPI.confirmCrossoverProposeAsync(
        subjectManagerAddress,
        { from: subjectCaller },
      );
    }

    describe('when 6 hours has elapsed since the lastCrossoverConfirmationTimestamp', async () => {
      beforeEach(async () => {
         // Elapse the rebalance interval
        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.div(10),
          SetTestUtils.generateTimestamp(1000),
        );

        // Call initialPropose to set the timestamp
        await macoManagerWrapper.initialPropose(subjectManagerAddress);

        // Elapse 7 hours
        await increaseChainTimeAsync(web3, ONE_HOUR_IN_SECONDS.mul(7));

        // Need to perform a transaction to further the timestamp
        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.div(10),
          SetTestUtils.generateTimestamp(2000),
        );

        // Freeze the time at rebalance interval + 7 hours
        const lastCrossoverConfirmationTimestamp =
          await macoManager.lastCrossoverConfirmationTimestamp.callAsync(macoManager);
        const newDesiredTimestamp = lastCrossoverConfirmationTimestamp.plus(ONE_HOUR_IN_SECONDS.mul(7));
        timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
      });

      test('sets the rebalancing Set into proposal period', async () => {
        await subject();
        const proposalStateEnum = new BigNumber(1);
        const rebalancingSetState = await rebalancingSetToken.rebalanceState.callAsync();

        expect(rebalancingSetState).to.bignumber.equal(proposalStateEnum);
      });
    });

    describe('when more than 12 hours has not elapsed since the lastCrossoverConfirmationTimestamp', async () => {
      beforeEach(async () => {
         // Elapse the rebalance interval
        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.div(10),
          SetTestUtils.generateTimestamp(1000),
        );

        // Call initialPropose to set the timestamp
        await macoManagerWrapper.initialPropose(subjectManagerAddress);

        // Elapse 3 hours
        await increaseChainTimeAsync(web3, ONE_HOUR_IN_SECONDS.mul(13));

        // Need to perform a transaction to further the timestamp
        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.div(10),
          SetTestUtils.generateTimestamp(2000),
        );

        // Freeze the time at rebalance interval + 3 hours
        const lastCrossoverConfirmationTimestamp =
          await macoManager.lastCrossoverConfirmationTimestamp.callAsync(macoManager);
        const newDesiredTimestamp = lastCrossoverConfirmationTimestamp.plus(ONE_HOUR_IN_SECONDS.mul(3));
        timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Confirm Crossover Propose is not called 6-12 hours since last proposal timestamp`
        );
      });
    });

    describe('when 6 hours has not elapsed since the lastCrossoverConfirmationTimestamp', async () => {
      beforeEach(async () => {
         // Elapse the rebalance interval
        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.div(10),
          SetTestUtils.generateTimestamp(1000),
        );

        // Call initialPropose to set the timestamp
        await macoManagerWrapper.initialPropose(subjectManagerAddress);

        // Elapse 3 hours
        await increaseChainTimeAsync(web3, ONE_HOUR_IN_SECONDS.mul(3));

        // Need to perform a transaction to further the timestamp
        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.div(10),
          SetTestUtils.generateTimestamp(2000),
        );

        // Freeze the time at rebalance interval + 3 hours
        const lastCrossoverConfirmationTimestamp =
          await macoManager.lastCrossoverConfirmationTimestamp.callAsync(macoManager);
        const newDesiredTimestamp = lastCrossoverConfirmationTimestamp.plus(ONE_HOUR_IN_SECONDS.mul(3));
        timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Confirm Crossover Propose is not called 6-12 hours since last proposal timestamp`
        );
      });
    });

    describe('when the RebalancingSet is not in Default state', async () => {
      beforeEach(async () => {
        // Elapse the rebalance interval
        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.div(10),
          SetTestUtils.generateTimestamp(1000),
        );

        // Call initialPropose to set the timestamp
        await macoManagerWrapper.initialPropose(subjectManagerAddress);

        // Elapse signal confirmation period
        await increaseChainTimeAsync(web3, ONE_HOUR_IN_SECONDS.mul(7));

        // Put the rebalancing set into proposal state
        await macoManagerWrapper.confirmPropose(subjectManagerAddress);

        // Freeze the time at rebalance interval + 3 hours
        const newDesiredTimestamp = nextRebalanceAvailableInSeconds.plus(ONE_HOUR_IN_SECONDS.mul(7));
        timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${rebalancingSetToken.address} must be in Default state to call that function.`
        );
      });
    });

    describe('when insufficient time has elapsed since the last rebalance', async () => {
      beforeEach(async () => {
        // Freeze the time at rebalance interval
        const lastRebalancedTimestampSeconds = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
        timeKeeper.freeze(lastRebalancedTimestampSeconds.toNumber() * 1000);
      });

      test('throws', async () => {
        const lastRebalanceTime = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
        const rebalanceInterval = await rebalancingSetToken.rebalanceInterval.callAsync();
        const nextAvailableRebalance = lastRebalanceTime.add(rebalanceInterval).mul(1000);
        const nextRebalanceFormattedDate = moment(nextAvailableRebalance.toNumber())
        .format('dddd, MMMM Do YYYY, h:mm:ss a');

        return expect(subject()).to.be.rejectedWith(
          `Attempting to rebalance too soon. Rebalancing next ` +
          `available on ${nextRebalanceFormattedDate}`
        );
      });
    });

    describe('when no MA crossover when rebalancing Set is risk collateral', async () => {
      let currentPrice: BigNumber;

      beforeEach(async () => {
        currentPrice = initialMedianizerEthPrice.mul(5);

        // Elapse the rebalance interval
        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          initialMedianizerEthPrice.mul(5),
          SetTestUtils.generateTimestamp(1000),
        );

        // Freeze the time at rebalance interval
        timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
      });

      test('throws', async () => {
        const movingAverage = new BigNumber(await movingAverageOracle.read.callAsync(movingAverageDays));

        return expect(subject()).to.be.rejectedWith(
          `Current Price ${currentPrice.toString()} must be less than Moving Average ${movingAverage.toString()}`
        );
      });
    });

    describe('when no MA crossover when rebalancing Set is stable collateral', async () => {
      let currentPriceThatIsBelowMA: BigNumber;

      beforeEach(async () => {

        macoManager = await deployMovingAverageStrategyManagerAsync(
          web3,
          core.address,
          movingAverageOracle.address,
          usdc.address,
          wrappedETH.address,
          initialStableCollateral.address,
          initialRiskCollateral.address,
          factory.address,
          constantAuctionPriceCurve.address,
          movingAverageDays,
          auctionTimeToPivot,
          crossoverConfirmationMinTime,
          crossoverConfirmationMaxTime,
        );

        rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
          web3,
          core,
          rebalancingFactory.address,
          macoManager.address,
          initialStableCollateral.address,
          ONE_DAY_IN_SECONDS,
        );

        await initializeMovingAverageStrategyManagerAsync(
          macoManager,
          rebalancingSetToken.address
        );

        currentPriceThatIsBelowMA = initialMedianizerEthPrice.div(10);

        // Elapse the rebalance interval
        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        await updateMedianizerPriceAsync(
          web3,
          ethMedianizer,
          currentPriceThatIsBelowMA,
          SetTestUtils.generateTimestamp(1000),
        );

        subjectManagerAddress = macoManager.address;

        // Freeze the time at rebalance interval
        const lastRebalancedTimestampSeconds = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
        const rebalanceInterval = await rebalancingSetToken.rebalanceInterval.callAsync();
        nextRebalanceAvailableInSeconds = lastRebalancedTimestampSeconds.plus(rebalanceInterval);
        timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
      });

      test('throws', async () => {
        const movingAverage = new BigNumber(await movingAverageOracle.read.callAsync(movingAverageDays));

        return expect(subject()).to.be.rejectedWith(
          `Current Price ${currentPriceThatIsBelowMA.toString()} must be ` +
          `greater than Moving Average ${movingAverage.toString()}`
        );
      });
    });
  });
});
