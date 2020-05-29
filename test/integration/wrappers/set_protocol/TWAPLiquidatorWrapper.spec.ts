/*
  Copyright 2020 Set Labs Inc.

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
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import {
  CoreContract,
  CoreHelper,
  ERC20Helper,
  FeeCalculatorHelper,
  LiquidatorHelper,
  OracleWhiteListContract,
  PerformanceFeeCalculatorContract,
  RebalancingSetTokenV3Contract,
  RebalancingSetTokenV3FactoryContract,
  RebalanceAuctionModuleContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  TWAPLiquidatorContract,
  ValuationHelper,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  OracleHelper,
  UpdatableOracleMockContract,
} from 'set-protocol-oracles';

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import {
  ONE_DAY_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ZERO
} from '@src/constants';
import {
  createDefaultRebalancingSetTokenV3Async,
  approveForTransferAsync,
  deployBaseContracts,
  deployTWAPLiquidatorAsync,
  deployOracleWhiteListAsync,
  deployRebalancingSetTokenV3FactoryContractAsync,
  deploySetTokenAsync,
  deployTokensSpecifyingDecimals,
  deployUpdatableOracleMockAsync,
  deployWhiteListContract,
  increaseChainTimeAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether
} from '@src/util';
import { Address, } from '@src/types/common';
import { TWAPLiquidatorWrapper } from '@src/wrappers';

import ChaiSetup from '@test/helpers/chaiSetup';
ChaiSetup.configure();

const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const { Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;

describe('TWAPLiquidatorWrapper', () => {
  let core: CoreContract;
  let transferProxy: TransferProxyContract;
  let factory: SetTokenFactoryContract;
  let rebalancingComponentWhiteList: WhiteListContract;
  let wrappedBTC: StandardTokenMockContract;
  let wrappedETH: StandardTokenMockContract;

  let liquidator: TWAPLiquidatorContract;
  let performanceFeeCalculator: PerformanceFeeCalculatorContract;
  let rebalancingV3Factory: RebalancingSetTokenV3FactoryContract;
  let oracleWhiteList: OracleWhiteListContract;
  let liquidatorWhiteList: WhiteListContract;
  let feeCalculatorWhiteList: WhiteListContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;

  let ethOracleProxy: UpdatableOracleMockContract;
  let btcOracleProxy: UpdatableOracleMockContract;

  let initialEthPrice: BigNumber;
  let initialBtcPrice: BigNumber;

  let maxProfitFeePercentage: BigNumber;
  let maxStreamingFeePercentage: BigNumber;

  let assetPairBounds: any[];

  const coreHelper = new CoreHelper(DEFAULT_ACCOUNT, DEFAULT_ACCOUNT);
  const erc20Helper = new ERC20Helper(DEFAULT_ACCOUNT);
  const oracleHelper = new OracleHelper(DEFAULT_ACCOUNT);
  const valuationHelper = new ValuationHelper(DEFAULT_ACCOUNT, coreHelper, erc20Helper, oracleHelper);
  const feeCalculatorHelper = new FeeCalculatorHelper(DEFAULT_ACCOUNT);
  const liquidatorHelper = new LiquidatorHelper(DEFAULT_ACCOUNT, erc20Helper, valuationHelper);

  const twapLiquidatorWrapper = new TWAPLiquidatorWrapper(web3);

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [wrappedBTC, wrappedETH] = await deployTokensSpecifyingDecimals(2, [8, 18], web3, DEFAULT_ACCOUNT);

    [
      core,
      transferProxy, ,
      factory,
      ,
      rebalanceAuctionModule,
      rebalancingComponentWhiteList,
    ] = await deployBaseContracts(web3, [wrappedBTC.address, wrappedETH.address]);

    await approveForTransferAsync(
      [wrappedBTC, wrappedETH],
      transferProxy.address
    );

    initialEthPrice = ether(180);
    initialBtcPrice = ether(9000);
    ethOracleProxy = await deployUpdatableOracleMockAsync(
      web3,
      initialEthPrice
    );

    btcOracleProxy = await deployUpdatableOracleMockAsync(
      web3,
      initialBtcPrice
    );

    oracleWhiteList = await deployOracleWhiteListAsync(
      web3,
      [wrappedETH.address, wrappedBTC.address],
      [ethOracleProxy.address, btcOracleProxy.address],
    );

    const auctionPeriod = ONE_HOUR_IN_SECONDS;
    const rangeStart = ether(.01);
    const rangeEnd = ether(.23);
    const name = 'liquidator';
    assetPairBounds = [
      {
        assetOne: wrappedETH.address,
        assetTwo: wrappedBTC.address,
        bounds: {lower: ether(10 ** 4).toString(), upper: ether(10 ** 6).toString()},
      },
    ];
    liquidator = await deployTWAPLiquidatorAsync(
      web3,
      core.address,
      oracleWhiteList.address,
      auctionPeriod,
      rangeStart,
      rangeEnd,
      assetPairBounds,
      name
    );
    liquidatorWhiteList = await deployWhiteListContract(web3, [liquidator.address]);

    maxProfitFeePercentage = ether(.4);
    maxStreamingFeePercentage = ether(.07);
    performanceFeeCalculator = await feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(
      core.address,
      oracleWhiteList.address,
      maxProfitFeePercentage,
      maxStreamingFeePercentage,
    );
    feeCalculatorWhiteList = await deployWhiteListContract(
      web3,
      [performanceFeeCalculator.address]
    );

    rebalancingV3Factory = await deployRebalancingSetTokenV3FactoryContractAsync(
      web3,
      core,
      rebalancingComponentWhiteList,
      liquidatorWhiteList,
      feeCalculatorWhiteList
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('iterateChunkAuction', async () => {
    let rebalancingSetTokenV3: RebalancingSetTokenV3Contract;
    let currentSet: SetTokenContract;
    let nextSet: SetTokenContract;

    let subjectLiquidator: Address;
    let subjectRebalancingSetToken: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const collateralNaturalUnit = new BigNumber(10 ** 14);

      const currentSetComponents = [wrappedETH.address, wrappedBTC.address];
      const currentSetUnits = [new BigNumber(10 ** 14), new BigNumber(2 * 10 ** 4)];
      currentSet = await deploySetTokenAsync(
        web3,
        core,
        factory.address,
        currentSetComponents,
        currentSetUnits,
        collateralNaturalUnit
      );

      const nextSetComponents = [wrappedETH.address, wrappedBTC.address];
      const nextSetUnits = [new BigNumber(50 * 10 ** 14), new BigNumber(10 ** 4)];
      nextSet = await deploySetTokenAsync(
        web3,
        core,
        factory.address,
        nextSetComponents,
        nextSetUnits,
        collateralNaturalUnit
      );

      const failRebalancePeriod = ONE_DAY_IN_SECONDS;
      const block = await web3.eth.getBlock('latest');
      rebalancingSetTokenV3 = await createDefaultRebalancingSetTokenV3Async(
        web3,
        core,
        rebalancingV3Factory.address,
        DEFAULT_ACCOUNT,
        liquidator.address,
        DEFAULT_ACCOUNT,
        performanceFeeCalculator.address,
        currentSet.address,
        failRebalancePeriod,
        new BigNumber(block.timestamp).sub(ONE_DAY_IN_SECONDS),
      );


      // Issue currentSetToken
      await core.issue.sendTransactionAsync(
        currentSet.address,
        ether(15),
        {from: DEFAULT_ACCOUNT}
      );
      await approveForTransferAsync([currentSet], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(15);
      await core.issue.sendTransactionAsync(rebalancingSetTokenV3.address, rebalancingSetQuantityToIssue);

      const liquidatorData = liquidatorHelper.generateTWAPLiquidatorCalldata(
        ether(10 ** 5),
        ONE_HOUR_IN_SECONDS,
      );

      await rebalancingSetTokenV3.startRebalance.sendTransactionAsync(nextSet.address, liquidatorData);

      await rebalanceAuctionModule.bidAndWithdraw.sendTransactionAsync(
        rebalancingSetTokenV3.address,
        rebalancingSetQuantityToIssue,
        true
      );

      await increaseChainTimeAsync(web3, ONE_HOUR_IN_SECONDS);

      subjectLiquidator = liquidator.address;
      subjectRebalancingSetToken = rebalancingSetTokenV3.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await twapLiquidatorWrapper.iterateChunkAuction(
        subjectLiquidator,
        subjectRebalancingSetToken,
        { from: subjectCaller }
      );
    }

    it('calls iterateChunkAuction correctly', async () => {
      const preTWAPState: any = await liquidator.auctions.callAsync(subjectRebalancingSetToken);

      await subject();

      const block = await web3.eth.getBlock('latest');
      const twapState: any = await liquidator.auctions.callAsync(subjectRebalancingSetToken);
      const expectedRemainingCurrentSets = new BigNumber(preTWAPState.orderRemaining)
          .add(preTWAPState.chunkAuction.auction.remainingCurrentSets);

      expect(twapState.orderRemaining).to.be.bignumber.equal(ZERO);
      expect(expectedRemainingCurrentSets).to.be.bignumber.equal(
        twapState.chunkAuction.auction.remainingCurrentSets
      );
      expect(twapState.chunkAuction.auction.startTime).to.be.bignumber.equal(block.timestamp);
    });
  });

  describe('chunkSizeWhiteList', async () => {
    let subjectLiquidator: Address;
    let subjectAssetOne: Address;
    let subjectAssetTwo: Address;

    beforeEach(async () => {
      subjectLiquidator = liquidator.address;
      subjectAssetOne = wrappedETH.address;
      subjectAssetTwo = wrappedBTC.address;
    });

    async function subject(): Promise<string> {
      return await twapLiquidatorWrapper.chunkSizeWhiteList(
        subjectLiquidator,
        subjectAssetOne,
        subjectAssetTwo,
      );
    }

    it('returns the correct chunkSizeWhiteList', async () => {
      const bounds: any = await subject();

      expect(bounds.lower).to.be.bignumber.equal(assetPairBounds[0].bounds.lower);
      expect(bounds.upper).to.be.bignumber.equal(assetPairBounds[0].bounds.upper);
    });
  });
});