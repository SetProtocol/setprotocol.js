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
import { Core } from 'set-protocol-contracts';
import {
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
import { MACOStrategyManagerWrapper } from '@src/wrappers';
import {
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
  increaseChainTimeAsync,
  initializeMovingAverageStrategyManagerAsync,
  updateMedianizerPriceAsync,
} from '@test/helpers';
import {
  BigNumber,
} from '@src/util';
import { Address } from '@src/types/common';

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


describe('MACOStrategyManagerWrapper', () => {
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

  let macoStrategyManagerWrapper: MACOStrategyManagerWrapper;

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

  const movingAverageDays = new BigNumber(5);
  const stableCollateralUnit = new BigNumber(250);
  const stableCollateralNaturalUnit = new BigNumber(10 ** 12);

  const riskCollateralUnit = new BigNumber(10 ** 6);
  const riskCollateralNaturalUnit = new BigNumber(10 ** 6);
  const initializedProposalTimestamp = new BigNumber(0);

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

    rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
      web3,
      core,
      rebalancingFactory.address,
      DEFAULT_ACCOUNT,
      initialRiskCollateral.address,
      ONE_DAY_IN_SECONDS,
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

    await initializeMovingAverageStrategyManagerAsync(
      macoManager,
      rebalancingSetToken.address
    );

    macoStrategyManagerWrapper = new MACOStrategyManagerWrapper(web3,);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('coreAddress', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<Address> {
      return await macoStrategyManagerWrapper.coreAddress(
        subjectManagerAddress,
      );
    }

    test('gets the correct core', async () => {
      const address = await subject();
      expect(address).to.equal(core.address);
    });
  });

  describe('rebalancingSetTokenAddress', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<Address> {
      return await macoStrategyManagerWrapper.rebalancingSetTokenAddress(
        subjectManagerAddress,
      );
    }

    test('gets the correct rebalancingSetTokenAddress', async () => {
      const address = await subject();
      expect(address).to.equal(rebalancingSetToken.address);
    });
  });

  describe('movingAveragePriceFeed', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<Address> {
      return await macoStrategyManagerWrapper.movingAveragePriceFeed(
        subjectManagerAddress,
      );
    }

    test('gets the correct movingAveragePriceFeed', async () => {
      const address = await subject();
      expect(address).to.equal(movingAverageOracle.address);
    });
  });

  describe('stableAssetAddress', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<Address> {
      return await macoStrategyManagerWrapper.stableAssetAddress(
        subjectManagerAddress,
      );
    }

    test('gets the correct stableAssetAddress', async () => {
      const address = await subject();
      expect(address).to.equal(usdc.address);
    });
  });

  describe('riskAssetAddress', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<Address> {
      return await macoStrategyManagerWrapper.riskAssetAddress(
        subjectManagerAddress,
      );
    }

    test('gets the correct riskAssetAddress', async () => {
      const address = await subject();
      expect(address).to.equal(wrappedETH.address);
    });
  });

  describe('riskAssetAddress', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<Address> {
      return await macoStrategyManagerWrapper.riskAssetAddress(
        subjectManagerAddress,
      );
    }

    test('gets the correct riskAssetAddress', async () => {
      const address = await subject();
      expect(address).to.equal(wrappedETH.address);
    });
  });

  describe('stableCollateralAddress', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<Address> {
      return await macoStrategyManagerWrapper.stableCollateralAddress(
        subjectManagerAddress,
      );
    }

    test('gets the correct stableCollateralAddress', async () => {
      const address = await subject();
      expect(address).to.equal(initialStableCollateral.address);
    });
  });

  describe('riskCollateralAddress', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<Address> {
      return await macoStrategyManagerWrapper.riskCollateralAddress(
        subjectManagerAddress,
      );
    }

    test('gets the correct riskCollateralAddress', async () => {
      const address = await subject();
      expect(address).to.equal(initialRiskCollateral.address);
    });
  });

  describe('setTokenFactory', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<Address> {
      return await macoStrategyManagerWrapper.setTokenFactory(
        subjectManagerAddress,
      );
    }

    test('gets the correct setTokenFactory', async () => {
      const address = await subject();
      expect(address).to.equal(factory.address);
    });
  });

  describe('auctionLibrary', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<Address> {
      return await macoStrategyManagerWrapper.auctionLibrary(
        subjectManagerAddress,
      );
    }

    test('gets the correct auctionLibrary', async () => {
      const address = await subject();
      expect(address).to.equal(constantAuctionPriceCurve.address);
    });
  });

  describe('movingAverageDays', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<BigNumber> {
      return await macoStrategyManagerWrapper.movingAverageDays(
        subjectManagerAddress,
      );
    }

    test('gets the correct movingAverageDays', async () => {
      const address = await subject();
      expect(address).to.bignumber.equal(movingAverageDays);
    });
  });

  describe('lastProposalTimestamp', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<BigNumber> {
      return await macoStrategyManagerWrapper.lastProposalTimestamp(
        subjectManagerAddress,
      );
    }

    test('gets the correct lastProposalTimestamp', async () => {
      const address = await subject();
      expect(address).to.bignumber.equal(initializedProposalTimestamp);
    });
  });

  describe('auctionTimeToPivot', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = macoManager.address;
    });

    async function subject(): Promise<BigNumber> {
      return await macoStrategyManagerWrapper.auctionTimeToPivot(
        subjectManagerAddress,
      );
    }

    test('gets the correct auctionTimeToPivot', async () => {
      const address = await subject();
      expect(address).to.bignumber.equal(auctionTimeToPivot);
    });
  });
});
