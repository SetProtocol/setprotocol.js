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

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { Assertions } from '@src/assertions';
import { MACOManagerAPI } from '@src/api';
import {
  E18,
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
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
  initializeMovingAverageStrategyManagerAsync,
  updateMedianizerPriceAsync,
} from '@test/helpers';
import {
  BigNumber,
} from '@src/util';
import { Address } from '@src/types/common';
import { MovingAverageManagerDetails } from '@src/types/strategies';

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

  const macoManagerAPI: MACOManagerAPI = new MACOManagerAPI(web3, assertions);

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

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
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('getRebalancingManagerDetailsAsync', async () => {
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

    test('gets the correct lastProposalTimestamp', async () => {
      const details = await subject();
      expect(details.lastProposalTimestamp).to.bignumber.equal(initializedProposalTimestamp);
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
  });

  // describe('initialPropose', async () => {
  //   let subjectManagerAddress: Address;

  //   beforeEach(async () => {
  //     subjectManagerAddress = macoManager.address;

  //     // Elapse the rebalance interval
  //     await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

  //     await updateMedianizerPriceAsync(
  //       web3,
  //       ethMedianizer,
  //       initialMedianizerEthPrice.div(10),
  //       SetTestUtils.generateTimestamp(1000),
  //     );
  //   });

  //   async function subject(): Promise<string> {
  //     return await macoManagerAPI.proposeAsync(
  //       subjectManagerAddress,
  //     );
  //   }

  //   test('sets the lastProposalTimestamp properly', async () => {
  //     const txnHash = await subject();
  //     const { blockNumber } = await web3.eth.getTransactionReceipt(txnHash);
  //     const { timestamp } = await web3.eth.getBlock(blockNumber);

  //     const lastTimestamp = await macoManagerAPI.lastProposalTimestamp(
  //       subjectManagerAddress,
  //     );
  //     expect(lastTimestamp).to.bignumber.equal(timestamp);
  //   });
  // });
});
