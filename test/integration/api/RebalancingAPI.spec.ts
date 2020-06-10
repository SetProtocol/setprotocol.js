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
import * as _ from 'lodash';
import Web3 from 'web3';
import {
  ConstantAuctionPriceCurveContract,
  CoreContract,
  CoreHelper,
  ERC20DetailedContract,
  ERC20Helper,
  FeeCalculatorHelper,
  LiquidatorHelper,
  LinearAuctionLiquidatorContract,
  OracleWhiteListContract,
  PerformanceFeeCalculatorContract,
  RebalanceAuctionModuleContract,
  RebalancingSetCTokenBidderContract,
  RebalancingSetEthBidderContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  RebalancingSetTokenV3Contract,
  RebalancingSetTokenV3FactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  TWAPLiquidatorContract,
  ValuationHelper,
  VaultContract,
  WhiteListContract,
  WethMockContract,
} from 'set-protocol-contracts';
import { UpdatableOracleMockContract, OracleHelper } from 'set-protocol-oracles';
import { Web3Utils } from 'set-protocol-utils';

import { RebalancingAPI } from '@src/api';
import {
  RebalancingSetTokenWrapper,
  CoreWrapper,
  ERC20Wrapper,
  RebalancingAuctionModuleWrapper,
  RebalancingSetEthBidderWrapper,
  RebalancingSetCTokenBidderWrapper
} from '@src/wrappers';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
  DEFAULT_REBALANCING_NATURAL_UNIT,
  DEFAULT_UNIT_SHARES,
  DEPLOYED_TOKEN_QUANTITY,
  ONE_DAY_IN_SECONDS,
  NULL_ADDRESS,
  TX_DEFAULTS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  ZERO,
  ONE_HOUR_IN_SECONDS,
} from '@src/constants';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber, ether } from '@src/util';
import { Assertions } from '@src/assertions';
import ChaiSetup from '@test/helpers/chaiSetup';
import {
  addPriceCurveToCoreAsync,
  approveForTransferAsync,
  constructInflowOutflowAddressesArraysAsync,
  constructInflowOutflowArraysAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployConstantAuctionPriceCurveAsync,
  deployOracleWhiteListAsync,
  deployProtocolViewerAsync,
  deployRebalancingSetCTokenBidderAsync,
  deployRebalancingSetEthBidderAsync,
  deployRebalancingSetTokenV3FactoryContractAsync,
  deploySetTokenAsync,
  deployTokenAsync,
  deployTokensSpecifyingDecimals,
  deployTWAPLiquidatorAsync,
  deployUpdatableOracleMockAsync,
  deployWethMockAsync,
  getAuctionSetUpOutputsAsync,
  getExpectedUnitSharesAsync,
  getGasUsageInEth,
  getLinearAuction,
  getTokenInstances,
  getVaultBalances,
  increaseChainTimeAsync,
  replaceDetailFlowsWithCTokenUnderlyingAsync,
  replaceFlowsWithCTokenUnderlyingAsync,
  transitionToDrawdownAsync,
  transitionToProposeAsync,
  transitionToRebalanceAsync,
  createDefaultRebalancingSetTokenV3Async,
  deployWhiteListContract,
  deployLinearAuctionLiquidatorContractAsync,
} from '@test/helpers';

import { CompoundHelper } from '@test/helpers/compoundHelper';

import {
  Address,
  BidPlacedEvent,
  BidPlacedHelperEvent,
  LinearAuction,
  RebalancingProgressDetails,
  RebalancingProposalDetails,
  RebalancingSetDetails,
  RebalancingSetStatus,
  SetProtocolConfig,
  TokenFlowsDetails,
} from '@src/types/common';

import {
  RBSetTWAPRebalanceInfo
} from '@src/types/strategies';

ChaiSetup.configure();
const { expect } = chai;
const timeKeeper = require('timekeeper');
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);
const moment = require('moment');

const compoundHelper = new CompoundHelper();
const coreHelper = new CoreHelper(DEFAULT_ACCOUNT, DEFAULT_ACCOUNT);
const erc20Helper = new ERC20Helper(DEFAULT_ACCOUNT);
const oracleHelper = new OracleHelper(DEFAULT_ACCOUNT);
const valuationHelper = new ValuationHelper(DEFAULT_ACCOUNT, coreHelper, erc20Helper, oracleHelper);
const liquidatorHelper = new LiquidatorHelper(DEFAULT_ACCOUNT, erc20Helper, valuationHelper);
const feeCalculatorHelper = new FeeCalculatorHelper(DEFAULT_ACCOUNT);
let currentSnapshotId: number;


describe('RebalancingAPI', () => {
  let nextRebalanceAvailableAtSeconds: number;

  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;
  let rebalancingSetCTokenBidder: RebalancingSetCTokenBidderContract;
  let rebalancingSetEthBidder: RebalancingSetEthBidderContract;
  let whitelist: WhiteListContract;
  let priceCurve: ConstantAuctionPriceCurveContract;

  let collateralNaturalUnit: BigNumber;
  let set1: SetTokenContract;
  let set1Components: Address[];
  let set1Units: BigNumber[];

  let set2: SetTokenContract;
  let set2Components: Address[];
  let set2Units: BigNumber[];

  let erc20Wrapper: ERC20Wrapper;
  let rebalancingSetTokenWrapper: RebalancingSetTokenWrapper;
  let rebalancingAuctionModuleWrapper: RebalancingAuctionModuleWrapper;
  let rebalancingSetCTokenBidderWrapper: RebalancingSetCTokenBidderWrapper;
  let rebalancingSetEthBidderWrapper: RebalancingSetEthBidderWrapper;
  let rebalancingAPI: RebalancingAPI;

  let weth: WethMockContract;
  let cUSDC: StandardTokenMockContract;
  let usdc: StandardTokenMockContract;
  let cDAI: StandardTokenMockContract;
  let dai: StandardTokenMockContract;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    // Deploy external dependencies
    weth = await deployWethMockAsync(web3, DEFAULT_ACCOUNT, DEPLOYED_TOKEN_QUANTITY);
    const usdcDecimals = 6;
    const daiDecimals = 18;
    const componentInstances = await deployTokensSpecifyingDecimals(
      2,
      [usdcDecimals, daiDecimals],
      web3,
    );

    usdc = componentInstances[0];
    dai = componentInstances[1];

    // Set up cTokens
    const cUSDCAddress = await compoundHelper.deployMockCUSDC(usdc.address, DEFAULT_ACCOUNT);
    await compoundHelper.enableCToken(cUSDCAddress);
    // Set the Borrow Rate
    await compoundHelper.setBorrowRate(cUSDCAddress, new BigNumber('43084603999'));

    const cDAIAddress = await compoundHelper.deployMockCDAI(dai.address, DEFAULT_ACCOUNT);
    await compoundHelper.enableCToken(cDAIAddress);
    // Set the Borrow Rate
    await compoundHelper.setBorrowRate(cDAIAddress, new BigNumber('29313252165'));
    const cTokenInstances = await getTokenInstances(web3, [cUSDCAddress, cDAIAddress]);
    cUSDC = cTokenInstances[0];
    cDAI = cTokenInstances[1];

    const whiteListedTokens = [weth, usdc, dai, cUSDC, cDAI];
    const whiteListedTokenAddresses = _.map(whiteListedTokens, token => token.address);

    [
      core,
      transferProxy,
      vault,
      setTokenFactory,
      rebalancingSetTokenFactory,
      rebalanceAuctionModule,
      whitelist,
    ] = await deployBaseContracts(web3, whiteListedTokenAddresses);

    approveForTransferAsync(whiteListedTokens, transferProxy.address);

    collateralNaturalUnit = new BigNumber(10 ** 12);
    set1Components = [weth.address, usdc.address];
    set1Units = [new BigNumber(10 ** 12), new BigNumber(200)];
    set1 = await deploySetTokenAsync(
      web3,
      core,
      setTokenFactory.address,
      set1Components,
      set1Units,
      collateralNaturalUnit
    );

    set2Components = [weth.address, usdc.address];
    set2Units = [new BigNumber(10 ** 12), new BigNumber(600)];
    set2 = await deploySetTokenAsync(
      web3,
      core,
      setTokenFactory.address,
      set2Components,
      set2Units,
      collateralNaturalUnit
    );

    // Legacy Section (RebalancingSetTokenV1 and dependencies)
    priceCurve = await deployConstantAuctionPriceCurveAsync(
      web3,
      DEFAULT_AUCTION_PRICE_NUMERATOR,
      DEFAULT_AUCTION_PRICE_DENOMINATOR
    );

    addPriceCurveToCoreAsync(
      core,
      priceCurve.address
    );

    rebalancingSetEthBidder = await deployRebalancingSetEthBidderAsync(
      web3,
      rebalanceAuctionModule,
      transferProxy,
      weth,
    );

    rebalancingSetCTokenBidder = await deployRebalancingSetCTokenBidderAsync(
      web3,
      rebalanceAuctionModule,
      transferProxy,
      [cUSDCAddress, cDAIAddress],
      [usdc.address, dai.address],
      'cToken Bidder Contract'
    );

    const coreWrapper = new CoreWrapper(
      web3,
      core.address,
      transferProxy.address,
      vault.address,
    );

    const protocolViewer = await deployProtocolViewerAsync(web3);
    erc20Wrapper = new ERC20Wrapper(web3);
    rebalancingSetTokenWrapper = new RebalancingSetTokenWrapper(web3);
    rebalancingAuctionModuleWrapper = new RebalancingAuctionModuleWrapper(
      web3,
      rebalanceAuctionModule.address,
    );
    rebalancingSetCTokenBidderWrapper = new RebalancingSetCTokenBidderWrapper(
      web3,
      rebalancingSetCTokenBidder.address,
    );
    rebalancingSetEthBidderWrapper = new RebalancingSetEthBidderWrapper(
      web3,
      rebalancingSetEthBidder.address,
    );

    const setProtocolConfig: SetProtocolConfig = {
      coreAddress: NULL_ADDRESS,
      transferProxyAddress: NULL_ADDRESS,
      vaultAddress: NULL_ADDRESS,
      setTokenFactoryAddress: NULL_ADDRESS,
      rebalancingSetTokenFactoryAddress: NULL_ADDRESS,
      kyberNetworkWrapperAddress: NULL_ADDRESS,
      rebalanceAuctionModuleAddress: rebalanceAuctionModule.address,
      exchangeIssuanceModuleAddress: NULL_ADDRESS,
      rebalancingSetIssuanceModule: NULL_ADDRESS,
      rebalancingSetCTokenBidderAddress: rebalancingSetCTokenBidder.address,
      rebalancingSetEthBidderAddress: rebalancingSetEthBidder.address,
      rebalancingSetExchangeIssuanceModule: NULL_ADDRESS,
      wrappedEtherAddress: weth.address,
      protocolViewerAddress: protocolViewer.address,
    };

    const assertions = new Assertions(web3);
    rebalancingAPI = new RebalancingAPI(web3, assertions, coreWrapper, setProtocolConfig);
  });

  afterEach(async () => {
    timeKeeper.reset();

    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('proposeAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let rebalanceInterval: BigNumber;
    let managerAddress: Address;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectNextSet: Address;
    let subjectAuctionPriceCurveAddress: Address;
    let subjectAuctionTimeToPivot: BigNumber;
    let subjectAuctionStartPrice: BigNumber;
    let subjectAuctionPivotPrice: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      const proposalPeriod = ONE_DAY_IN_SECONDS;
      rebalanceInterval = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      const baseSetIssueQuantity = ether(7);
      await core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Fast forward to allow propose to be called
      const lastRebalancedTimestampSeconds = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
      nextRebalanceAvailableAtSeconds = lastRebalancedTimestampSeconds.toNumber() + rebalanceInterval.toNumber();
      timeKeeper.freeze(nextRebalanceAvailableAtSeconds * 1000);
      await increaseChainTimeAsync(web3, rebalanceInterval.add(1));

      subjectNextSet = nextSetToken.address;
      subjectAuctionPriceCurveAddress = priceCurve.address;
      subjectAuctionTimeToPivot = new BigNumber(100000);
      subjectAuctionStartPrice = new BigNumber(500);
      subjectAuctionPivotPrice = new BigNumber(1000);
      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = managerAddress;
    });

    afterEach(async () => {
      timeKeeper.reset();
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.proposeAsync(
        subjectRebalancingSetTokenAddress,
        subjectNextSet,
        subjectAuctionPriceCurveAddress,
        subjectAuctionTimeToPivot,
        subjectAuctionStartPrice,
        subjectAuctionPivotPrice,
        { from: subjectCaller }
      );
    }

    test('it fetches the rebalancing set token properties correctly', async () => {
      await subject();

      const nextSet = await rebalancingSetTokenWrapper.nextSet(subjectRebalancingSetTokenAddress);
      expect(nextSet).to.eql(subjectNextSet);

      const auctionLibrary = await rebalancingSetTokenWrapper.auctionLibrary(subjectRebalancingSetTokenAddress);
      expect(auctionLibrary).to.eql(subjectAuctionPriceCurveAddress);

      const rebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);
      expect(rebalanceState).to.eql('Proposal');
    });

    describe('when the caller is not the manager', async () => {
      beforeEach(async () => {
        const invalidCallerAddress = ACCOUNTS[0].address;
        subjectCaller = invalidCallerAddress;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Caller ${subjectCaller} is not the manager of this Rebalancing Set Token.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      beforeEach(async () => {
        // Transition to rebalance state
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          subjectAuctionPriceCurveAddress,
        );
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} is currently in rebalancing state.` +
          ` Issue, Redeem, and propose functionality is not available during this time`
        );
      });
    });

    describe('when the proposed set token is not a valid set', async () => {
      beforeEach(async () => {
        const invalidNextSet = ACCOUNTS[3].address;
        subjectNextSet = invalidNextSet;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Contract at ${subjectNextSet} is not a valid Set token address.`
        );
      });
    });

    describe('when the proposed set natural unit is not a multiple of the current set', async () => {
      let badSet: SetTokenContract;

      beforeEach(async () => {
        badSet = await deploySetTokenAsync(
          web3,
          core,
          setTokenFactory.address,
          set1Components,
          set1Units,
          collateralNaturalUnit.mul(1.5)
        );

        subjectNextSet = badSet.address;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `${badSet.address} must be a multiple of ${currentSetToken.address},` +
          ` or vice versa to propose a valid rebalance.`
        );
      });
    });

    describe('when proposeAsync is called before a new rebalance is allowed', async () => {
      beforeEach(async () => {
        timeKeeper.freeze((nextRebalanceAvailableAtSeconds * 1000) - 10);
      });

      test('throws', async () => {
        const nextAvailableRebalance = nextRebalanceAvailableAtSeconds * 1000;
        const nextRebalanceFormattedDate = moment(nextAvailableRebalance)
          .format('dddd, MMMM Do YYYY, h:mm:ss a');
        return expect(subject()).to.be.rejectedWith(
          `Attempting to rebalance too soon. Rebalancing next ` +
          `available on ${nextRebalanceFormattedDate}`
        );
      });
    });

    describe('when proposeAsync is called with an invalid price curve', async () => {
      beforeEach(async () => {
        subjectAuctionPriceCurveAddress = ACCOUNTS[4].address;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Proposed ${subjectAuctionPriceCurveAddress} is not recognized by Core.`
        );
      });
    });
  });

  describe('startRebalanceAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let nextRebalanceAvailableAtSeconds: number;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      const baseSetIssueQuantity = ether(7);
      await core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.startRebalanceAsync(
        subjectRebalancingSetTokenAddress,
        { from: subjectCaller }
      );
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Proposal state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );

        // Fast forward to allow rebalance to be called
        const proposalStartTimeSeconds = await rebalancingSetToken.proposalStartTime.callAsync();
        const fastForwardPeriod = proposalPeriod.toNumber();
        nextRebalanceAvailableAtSeconds = proposalStartTimeSeconds.toNumber() + fastForwardPeriod;
        timeKeeper.freeze(nextRebalanceAvailableAtSeconds * 1000 + 1);
        increaseChainTimeAsync(web3, proposalPeriod.add(1));
      });

      test('it fetches the set token properties correctly', async () => {
        await subject();

        const returnedMinimumBid = await rebalancingSetTokenWrapper.minimumBid(subjectRebalancingSetTokenAddress);
        const returnedRemainingCurrentSets = await rebalancingSetTokenWrapper.remainingCurrentSets(
          subjectRebalancingSetTokenAddress
        );
        const combinedTokenArray = await rebalancingSetTokenWrapper.getCombinedTokenArray(
          subjectRebalancingSetTokenAddress
        );
        const combinedCurrentUnits = await rebalancingSetTokenWrapper.getCombinedCurrentUnits(
          subjectRebalancingSetTokenAddress
        );
        const combinedNextSetUnits = await rebalancingSetTokenWrapper.getCombinedNextSetUnits(
          subjectRebalancingSetTokenAddress
        );
        const returnedRebalanceState = await rebalancingSetTokenWrapper.rebalanceState(
          subjectRebalancingSetTokenAddress
        );

        const auctionSetUpOutputs = await getAuctionSetUpOutputsAsync(
          rebalancingSetToken,
          currentSetToken,
          nextSetToken,
          DEFAULT_AUCTION_PRICE_DENOMINATOR,
        );

        expect(returnedMinimumBid).to.be.bignumber.equal(auctionSetUpOutputs['expectedMinimumBid']);

        expect(returnedRemainingCurrentSets).to.be.bignumber.equal(ether(7));

        const returnedCombinedTokenArray = JSON.stringify(combinedTokenArray);
        const expectedCombinedTokenArray = JSON.stringify(auctionSetUpOutputs['expectedCombinedTokenArray']);
        expect(returnedCombinedTokenArray).to.equal(expectedCombinedTokenArray);

        const returnedCombinedCurrentUnits = JSON.stringify(combinedCurrentUnits);
        const expectedCombinedCurrentUnits = JSON.stringify(auctionSetUpOutputs['expectedCombinedCurrentUnits']);
        expect(returnedCombinedCurrentUnits).to.equal(expectedCombinedCurrentUnits);

        const returnedCombinedNextSetUnits = JSON.stringify(combinedNextSetUnits);
        const expectedCombinedNextSetUnits = JSON.stringify(auctionSetUpOutputs['expectedCombinedNextUnits']);
        expect(returnedCombinedNextSetUnits).to.equal(expectedCombinedNextSetUnits);

        expect(returnedRebalanceState).to.eql('Rebalance');
      });

      describe('when startRebalanceAsync is called before proposal period has elapsed', async () => {
        beforeEach(async () => {
          timeKeeper.freeze((nextRebalanceAvailableAtSeconds * 1000) - 10);
        });

        test('throws', async () => {
          const nextAvailableRebalance = nextRebalanceAvailableAtSeconds * 1000;
          const nextRebalanceFormattedDate = moment(nextAvailableRebalance)
            .format('dddd, MMMM Do YYYY, h:mm:ss a');
          return expect(subject()).to.be.rejectedWith(
            `Attempting to rebalance too soon. Rebalancing next ` +
            `available on ${nextRebalanceFormattedDate}`
          );
        });
      });
    });

    describe('when the Rebalancing Set Token is in Default state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Proposal state to call that function.`
        );
      });
    });
  });

  describe('settleRebalanceAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.settleRebalanceAsync(
        subjectRebalancingSetTokenAddress,
        { from: subjectCaller }
      );
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state and enough sets have been rebalanced', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );

        await rebalanceAuctionModule.bid.sendTransactionAsync(
          rebalancingSetToken.address,
          rebalancingSetQuantityToIssue,
          false,
        );
      });

      test('updates the rebalancing properties correctly', async () => {
        const expectedUnitShares = await getExpectedUnitSharesAsync(
          rebalancingSetToken,
          nextSetToken,
          vault
        );

        await subject();

        const lastBlock = await web3.eth.getBlock('latest');
        const auctionEndTimestamp = new BigNumber(lastBlock.timestamp);

        const returnedRebalanceState = await rebalancingSetTokenWrapper.rebalanceState(
          subjectRebalancingSetTokenAddress
        );
        const returnedCurrentSet = await rebalancingSetTokenWrapper.currentSet(subjectRebalancingSetTokenAddress);
        const returnedUnitShares = await rebalancingSetTokenWrapper.unitShares(subjectRebalancingSetTokenAddress);
        const returnedLastRebalanceTimestamp = await rebalancingSetTokenWrapper.lastRebalanceTimestamp(
          subjectRebalancingSetTokenAddress
        );

        expect(returnedRebalanceState).to.eql('Default');

        expect(returnedCurrentSet).to.eql(nextSetToken.address);

        expect(returnedUnitShares).to.be.bignumber.equal(expectedUnitShares);

        expect(returnedLastRebalanceTimestamp).to.be.bignumber.equal(auctionEndTimestamp);
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state but\
    not enough sets have been rebalanced', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });
      it('throw', async () => {
        const [minimumBid, remainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

        return expect(subject()).to.be.rejectedWith(
          `In order to settle rebalance there must be less than current ${minimumBid} sets remaining ` +
            `to be rebalanced. There are currently ${remainingCurrentSets} remaining for rebalance.`
        );
      });
    });
  });

  describe('endFailedAuctionAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectCaller: Address;

    let pivotTime: BigNumber;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.endFailedAuctionAsync(
        subjectRebalancingSetTokenAddress,
        { from: subjectCaller }
      );
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state and is before the pivot time', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );

        pivotTime = new BigNumber(100000);
      });

      it('throw', async () => {
        const lastBlock = await web3.eth.getBlock('latest');
        const auctionStartTimestamp = new BigNumber(lastBlock.timestamp);
        const pivotTimeStart = auctionStartTimestamp.add(pivotTime).toString();
        const pivotTimeFormattedDate = moment(+pivotTimeStart * 1000)
          .format('dddd, MMMM Do YYYY, h:mm:ss a');
        return expect(subject()).to.be.rejectedWith(
          `Pivot time not yet reached. Pivot time starts at ${pivotTimeFormattedDate}`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state, is in the pivot time and has 0 bids', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setAuctionTimeToPivot = new BigNumber(100000);
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setAuctionTimeToPivot,
        );

        // Calculate pivot time start
        const lastBlockStart = await web3.eth.getBlock('latest');
        const auctionStartTimestamp = new BigNumber(lastBlockStart.timestamp);
        const pivotTimeStart = auctionStartTimestamp.add(setAuctionTimeToPivot).toNumber();
        timeKeeper.freeze(pivotTimeStart * 1000 + 1);

        // Fast forward to 1 second after pivot time
        await increaseChainTimeAsync(web3, new BigNumber(pivotTimeStart).add(1).mul(1000));
      });

      afterEach(async () => {
        timeKeeper.reset();
      });

      test('updates the rebalancing properties correctly', async () => {
        const expectedUnitShares = await getExpectedUnitSharesAsync(
          rebalancingSetToken,
          nextSetToken,
          vault
        );

        await subject();

        const lastBlockEnd = await web3.eth.getBlock('latest');
        const auctionEndTimestamp = new BigNumber(lastBlockEnd.timestamp);
        const returnedRebalanceState = await rebalancingSetTokenWrapper.rebalanceState(
          subjectRebalancingSetTokenAddress
        );
        const returnedCurrentSet = await rebalancingSetTokenWrapper.currentSet(subjectRebalancingSetTokenAddress);
        const returnedUnitShares = await rebalancingSetTokenWrapper.unitShares(subjectRebalancingSetTokenAddress);
        const returnedLastRebalanceTimestamp = await rebalancingSetTokenWrapper.lastRebalanceTimestamp(
          subjectRebalancingSetTokenAddress
        );

        expect(returnedRebalanceState).to.eql('Default');

        expect(returnedCurrentSet).to.not.eql(nextSetToken.address);

        expect(returnedUnitShares).to.not.be.bignumber.equal(expectedUnitShares);

        expect(returnedLastRebalanceTimestamp).to.be.bignumber.equal(auctionEndTimestamp);
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state, in the pivot time and\
    no units are remaining', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setAuctionTimeToPivot = new BigNumber(100000);
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setAuctionTimeToPivot,
        );

        await rebalanceAuctionModule.bid.sendTransactionAsync(
          rebalancingSetToken.address,
          rebalancingSetQuantityToIssue,
          false,
        );

        // Calculate pivot time start
        const lastBlockStart = await web3.eth.getBlock('latest');
        const auctionStartTimestamp = new BigNumber(lastBlockStart.timestamp);
        const pivotTimeStart = auctionStartTimestamp.add(setAuctionTimeToPivot).toNumber();
        timeKeeper.freeze(pivotTimeStart * 1000 + 1);
      });

      afterEach(async () => {
        timeKeeper.reset();
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Auction has no remaining bids. Cannot drawdown Set at ${rebalancingSetToken.address}.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state, is in the pivot time and has 1 bid', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setAuctionTimeToPivot = new BigNumber(100000);
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setAuctionTimeToPivot,
        );

        // Calculate pivot time start
        const lastBlockStart = await web3.eth.getBlock('latest');
        const auctionStartTimestamp = new BigNumber(lastBlockStart.timestamp);
        const pivotTimeStart = auctionStartTimestamp.add(setAuctionTimeToPivot).toNumber();
        timeKeeper.freeze(pivotTimeStart * 1000 + 1);

        // Fast forward to 1 second after pivot time
        await increaseChainTimeAsync(web3, new BigNumber(pivotTimeStart).add(1).mul(1000));
      });

      afterEach(async () => {
        timeKeeper.reset();
      });

      test('draws down the ', async () => {
        const expectedUnitShares = await getExpectedUnitSharesAsync(
          rebalancingSetToken,
          nextSetToken,
          vault
        );

        const [minimumBid] = await rebalancingSetToken.getBiddingParameters.callAsync();

        // Bid entire minus minimum amount
        await rebalanceAuctionModule.bid.sendTransactionAsync(
          rebalancingSetToken.address,
          rebalancingSetQuantityToIssue.sub(minimumBid).sub(minimumBid),
          false,
        );

        await subject();

        const lastBlockEnd = await web3.eth.getBlock('latest');
        const auctionEndTimestamp = new BigNumber(lastBlockEnd.timestamp);
        const returnedRebalanceState = await rebalancingSetTokenWrapper.rebalanceState(
          subjectRebalancingSetTokenAddress
        );
        const returnedCurrentSet = await rebalancingSetTokenWrapper.currentSet(subjectRebalancingSetTokenAddress);
        const returnedUnitShares = await rebalancingSetTokenWrapper.unitShares(subjectRebalancingSetTokenAddress);
        const returnedLastRebalanceTimestamp = await rebalancingSetTokenWrapper.lastRebalanceTimestamp(
          subjectRebalancingSetTokenAddress
        );

        expect(returnedRebalanceState).to.eql('Drawdown');

        expect(returnedCurrentSet).to.not.eql(nextSetToken.address);

        expect(returnedUnitShares).to.not.be.bignumber.equal(expectedUnitShares);

        expect(returnedLastRebalanceTimestamp).to.be.bignumber.equal(auctionEndTimestamp);
      });
    });
  });

  describe('bidAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectBidQuantity: BigNumber;
    let subjectCaller: Address;
    let subjectShouldWithdraw: boolean;
    let subjectAllowPartialFill: boolean;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      subjectShouldWithdraw = false;
      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectBidQuantity = rebalancingSetQuantityToIssue;
      subjectAllowPartialFill = false;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.bidAsync(
        subjectRebalancingSetTokenAddress,
        subjectBidQuantity,
        subjectShouldWithdraw,
        subjectAllowPartialFill,
        { from: subjectCaller }
      );
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      test('subtract correct amount from remainingCurrentSets', async () => {
        const [, existingRemainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

        await subject();

        const expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
        const [, newRemainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();
        expect(newRemainingCurrentSets).to.eql(expectedRemainingCurrentSets);
      });

      test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', async () => {
        const expectedTokenFlows = await constructInflowOutflowArraysAsync(
          rebalancingSetToken,
          subjectBidQuantity,
          DEFAULT_AUCTION_PRICE_NUMERATOR,
        );
        const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        const oldSenderBalances = await getVaultBalances(
          vault,
          combinedTokenArray,
          rebalancingSetToken.address
        );

        await subject();

        const newSenderBalances = await getVaultBalances(
          vault,
          combinedTokenArray,
          rebalancingSetToken.address
        );
        const expectedSenderBalances = _.map(oldSenderBalances, (balance, index) =>
          balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index])
        );
        expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
      });

      test('transfers the correct amount of tokens to the bidder in the Vault', async () => {
        const expectedTokenFlows = await constructInflowOutflowArraysAsync(
          rebalancingSetToken,
          subjectBidQuantity,
          DEFAULT_AUCTION_PRICE_NUMERATOR,
        );
        const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        const oldReceiverBalances = await getVaultBalances(
          vault,
          combinedTokenArray,
          DEFAULT_ACCOUNT
        );

        await subject();

        const newReceiverBalances = await getVaultBalances(
          vault,
          combinedTokenArray,
          DEFAULT_ACCOUNT
        );
        const expectedReceiverBalances = _.map(oldReceiverBalances, (balance, index) =>
          balance.add(expectedTokenFlows['outflow'][index])
        );

        expect(JSON.stringify(newReceiverBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
      });

      test('transfers and withdraws the correct amount of tokens to the bidder wallet', async () => {
        const expectedTokenFlows = await constructInflowOutflowArraysAsync(
          rebalancingSetToken,
          subjectBidQuantity,
          DEFAULT_AUCTION_PRICE_NUMERATOR,
        );
        const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        const oldReceiverBalances = await Promise.all(
          combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );

        // Set withdrawal to true
        subjectShouldWithdraw = true;
        await subject();

        const newReceiverBalances = await Promise.all(
          combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );

        const expectedReceiverBalances = _.map(oldReceiverBalances, (balance, index) =>
          balance.add(expectedTokenFlows['outflow'][index]).sub(expectedTokenFlows['inflow'][index])
        );

        expect(JSON.stringify(newReceiverBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
      });

      describe('and the passed rebalancingSetToken is not tracked by Core', async () => {
        beforeEach(async () => {
          subjectRebalancingSetTokenAddress = ACCOUNTS[5].address;
        });

        it('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `Contract at ${subjectRebalancingSetTokenAddress} is not a valid Set token address.`
          );
        });
      });

      describe('and the bid amount is greater than remaining current sets', async () => {
        beforeEach(async () => {
          subjectBidQuantity = ether(10);
        });

        it('throw', async () => {
          const [, remainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, exceeds the remaining current sets,` +
              ` ${remainingCurrentSets}.`
          );
        });
      });

      describe('and the bid amount is not a multiple of the minimumBid', async () => {
        let minimumBid: BigNumber;

        beforeEach(async () => {
          [minimumBid] = await rebalancingSetToken.getBiddingParameters.callAsync();
          subjectBidQuantity = minimumBid.mul(1.5);
        });

        test('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, must be a multiple of the minimumBid, ${minimumBid}.`
          );
        });
      });

      describe('and the caller has not approved inflow tokens for transfer', async () => {
        beforeEach(async () => {
          subjectCaller = ACCOUNTS[3].address;
        });

        test('throw', async () => {
          const [inflowArray] = await rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity);
          const components = await rebalancingSetToken.getCombinedTokenArray.callAsync();

          return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has allowance of 0

        when required allowance is ${inflowArray[1]} at token

        address: ${components[1]} for spender: ${transferProxy.address}.
      `
          );
        });
      });

      describe('and the caller does not have the balance to transfer', async () => {
        beforeEach(async () => {
          subjectCaller = ACCOUNTS[3].address;
          const components = await rebalancingSetToken.getCombinedTokenArray.callAsync();
          const approvalToken: ERC20DetailedContract = await ERC20DetailedContract.at(components[1], web3, {});
          await approvalToken.approve.sendTransactionAsync(
            transferProxy.address,
            UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
            { from: subjectCaller }
          );
        });

        test('throw', async () => {
          const [inflowArray] = await rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity);
          const components = await rebalancingSetToken.getCombinedTokenArray.callAsync();

          return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has balance of 0

        when required balance is ${inflowArray[1]} at token address ${components[1]}.
      `
          );
        });
      });
    });
  });

  describe('bidWithEtherAsync', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let defaultSetToken: SetTokenContract;
    let wethSetToken: SetTokenContract;

    let managerAddress: Address;

    let defaultBaseSetComponent: StandardTokenMockContract | WethMockContract;
    let defaultBaseSetComponent2: StandardTokenMockContract | WethMockContract;
    let wethBaseSetComponent: StandardTokenMockContract | WethMockContract;
    let wethBaseSetComponent2: StandardTokenMockContract | WethMockContract;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectBidQuantity: BigNumber;
    let subjectAllowPartialFill: boolean;
    let subjectCaller: Address;
    let subjectEthQuantity: BigNumber;

    beforeEach(async () => {
      // Create component tokens for default Set
      defaultBaseSetComponent = await deployTokenAsync(web3);
      defaultBaseSetComponent2 = await deployTokenAsync(web3);

      // Create the Set (default is 2 components)
      const defaultComponentAddresses = [
        defaultBaseSetComponent.address, defaultBaseSetComponent2.address,
      ];
      const defaultComponentUnits = [
        ether(0.01), ether(0.01),
      ];

      const defaultBaseSetNaturalUnit = ether(0.001);
      defaultSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        defaultComponentAddresses,
        defaultComponentUnits,
        defaultBaseSetNaturalUnit,
      );

      // Create component tokens for Set containing weth
      wethBaseSetComponent = weth;
      wethBaseSetComponent2 = usdc;

      // Create the next Set containing WETH
      const nextComponentAddresses = [
        wethBaseSetComponent.address, wethBaseSetComponent2.address,
      ];

      const wethComponentUnits = ether(0.01);
      const nextComponentUnits = [
        wethComponentUnits, ether(0.01),
      ];

      const wethBaseSetNaturalUnit = ether(0.001);
      wethSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        nextComponentAddresses,
        nextComponentUnits,
        wethBaseSetNaturalUnit,
      );

      // Create the Rebalancing Set without WETH component
      const proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        defaultSetToken.address,
        proposalPeriod
      );

      // Approve tokens and issue defaultSetToken
      const baseSetIssueQuantity = ether(1);

      await approveForTransferAsync([
        defaultBaseSetComponent,
        defaultBaseSetComponent2,
      ], transferProxy.address);

      await core.issue.sendTransactionAsync(
        defaultSetToken.address,
        baseSetIssueQuantity,
        TX_DEFAULTS,
      );

      // Use issued defaultSetToken to issue rebalancingSetToken
      await approveForTransferAsync([defaultSetToken], transferProxy.address);

      const rebalancingSetTokenQuantityToIssue = ether(1);

      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

      // Determine minimum bid
      const decOne = await defaultSetToken.naturalUnit.callAsync();
      const decTwo = await wethSetToken.naturalUnit.callAsync();
      const minBid = new BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);

      // Approve tokens to rebalancingSetEthBidder contract
      await approveForTransferAsync([
        wethBaseSetComponent,
        wethBaseSetComponent2,
      ], rebalancingSetEthBidder.address);

      subjectEthQuantity = baseSetIssueQuantity.mul(wethComponentUnits).div(wethBaseSetNaturalUnit);
      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectBidQuantity = minBid;
      subjectAllowPartialFill = false;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.bidWithEtherAsync(
        subjectRebalancingSetTokenAddress,
        subjectBidQuantity,
        subjectAllowPartialFill,
        { from: subjectCaller, value: subjectEthQuantity.toNumber() }
      );
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          wethSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          wethSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      test('subtract correct amount from remainingCurrentSets', async () => {
        const [, existingRemainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

        await subject();

        const expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
        const [, newRemainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();
        expect(newRemainingCurrentSets).to.eql(expectedRemainingCurrentSets);
      });

      test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', async () => {
        const expectedTokenFlows = await constructInflowOutflowArraysAsync(
          rebalancingSetToken,
          subjectBidQuantity,
          DEFAULT_AUCTION_PRICE_NUMERATOR,
        );
        const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        const oldSenderBalances = await getVaultBalances(
          vault,
          combinedTokenArray,
          rebalancingSetToken.address
        );

        await subject();

        const newSenderBalances = await getVaultBalances(
          vault,
          combinedTokenArray,
          rebalancingSetToken.address
        );
        const expectedSenderBalances = _.map(oldSenderBalances, (balance, index) =>
          balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index])
        );
        expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
      });

      test('transfers and withdraws the correct amount of tokens to the bidder wallet', async () => {
        const expectedTokenFlows = await constructInflowOutflowArraysAsync(
          rebalancingSetToken,
          subjectBidQuantity,
          DEFAULT_AUCTION_PRICE_NUMERATOR,
        );
        const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        const oldReceiverTokenBalances = await Promise.all(
          combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );
        const oldEthBalance = new BigNumber(await web3.eth.getBalance(subjectCaller));

        // Replace WETH balance with ETH balance
        const oldReceiverTokenAndEthBalances = _.map(oldReceiverTokenBalances, (balance, index) =>
          combinedTokenArray[index] === weth.address ? new BigNumber(oldEthBalance) : balance
        );

        const txHash = await subject();

        const newEthBalance =  await web3.eth.getBalance(subjectCaller);
        const newReceiverTokenBalances = await Promise.all(
          combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );
        // Replace WETH balance with ETH balance and factor in gas paid
        const totalGasInEth = await getGasUsageInEth(web3, txHash);
        const newReceiverTokenAndEthBalances = _.map(newReceiverTokenBalances, (balance, index) =>
          combinedTokenArray[index] === weth.address ? totalGasInEth.add(newEthBalance) : balance
        );

        const expectedReceiverBalances = _.map(oldReceiverTokenAndEthBalances, (balance, index) =>
          balance.add(expectedTokenFlows['outflow'][index]).sub(expectedTokenFlows['inflow'][index])
        );

        expect(JSON.stringify(newReceiverTokenAndEthBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
      });

      describe('and the passed rebalancingSetToken is not tracked by Core', async () => {
        beforeEach(async () => {
          subjectRebalancingSetTokenAddress = ACCOUNTS[5].address;
        });

        it('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `Contract at ${subjectRebalancingSetTokenAddress} is not a valid Set token address.`
          );
        });
      });

      describe('and the bid amount is greater than remaining current sets', async () => {
        beforeEach(async () => {
          subjectBidQuantity = ether(10);
        });

        it('throw', async () => {
          const [, remainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, exceeds the remaining current sets,` +
              ` ${remainingCurrentSets}.`
          );
        });
      });

      describe('and the bid amount is not a multiple of the minimumBid', async () => {
        let minimumBid: BigNumber;

        beforeEach(async () => {
          [minimumBid] = await rebalancingSetToken.getBiddingParameters.callAsync();
          subjectBidQuantity = minimumBid.mul(0.5);
        });

        test('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, must be a multiple of the minimumBid, ${minimumBid}.`
          );
        });
      });

      describe('and the caller has not approved inflow tokens for transfer', async () => {
        beforeEach(async () => {
          subjectCaller = ACCOUNTS[3].address;
        });

        test('throw', async () => {
          const [inflowArray] = await rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity);
          const components = await rebalancingSetToken.getCombinedTokenArray.callAsync();

          return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has allowance of 0

        when required allowance is ${inflowArray[3]} at token

        address: ${components[3]} for spender: ${rebalancingSetEthBidder.address}.
      `
          );
        });
      });

      describe('and the caller does not have the balance to transfer', async () => {
        beforeEach(async () => {
          subjectCaller = ACCOUNTS[3].address;
          const components = await rebalancingSetToken.getCombinedTokenArray.callAsync();
          const approvalToken: ERC20DetailedContract = await ERC20DetailedContract.at(components[3], web3, {});
          await approvalToken.approve.sendTransactionAsync(
            rebalancingSetEthBidder.address,
            UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
            { from: subjectCaller }
          );
        });

        test('throw', async () => {
          const [inflowArray] = await rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity);
          const components = await rebalancingSetToken.getCombinedTokenArray.callAsync();

          return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has balance of 0

        when required balance is ${inflowArray[3]} at token address ${components[3]}.
      `
          );
        });
      });

      describe('and the caller did not send enough Ether', async () => {
        beforeEach(async () => {
          subjectEthQuantity = ZERO;
        });

        test('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `Ether value must be greater than required wrapped ether quantity`
          );
        });
      });
    });
  });

  describe('bidWithCTokenUnderlyingAsync', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let defaultSetToken: SetTokenContract;
    let cTokenSetToken: SetTokenContract;
    let managerAddress: Address;

    let defaultBaseSetComponent: StandardTokenMockContract;
    let defaultBaseSetComponent2: StandardTokenMockContract;
    let cTokenBaseSetComponent: StandardTokenMockContract;
    let cTokenBaseSetComponent2: StandardTokenMockContract;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectBidQuantity: BigNumber;
    let subjectAllowPartialFill: boolean;
    let subjectCaller: Address;

    beforeEach(async () => {
      // Create component tokens for default Set
      defaultBaseSetComponent = await deployTokenAsync(web3);
      defaultBaseSetComponent2 = await deployTokenAsync(web3);

      // Create the Set (default is 2 components)
      const defaultComponentAddresses = [
        defaultBaseSetComponent.address, defaultBaseSetComponent2.address,
      ];
      const defaultComponentUnits = [
        ether(0.01), ether(0.01),
      ];

      const defaultBaseSetNaturalUnit = ether(0.001);
      defaultSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        defaultComponentAddresses,
        defaultComponentUnits,
        defaultBaseSetNaturalUnit,
      );

      // Create component tokens for Set containing cTokens
      cTokenBaseSetComponent = cUSDC;
      cTokenBaseSetComponent2 = cDAI;

      // Create the Set (default is 2 components)
      const nextComponentAddresses = [
        cTokenBaseSetComponent.address, cTokenBaseSetComponent2.address,
      ];

      const nextComponentUnits = [
        ether(0.001), ether(1),
      ];

      const cTokenBaseSetNaturalUnit = ether(0.001);
      cTokenSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        nextComponentAddresses,
        nextComponentUnits,
        cTokenBaseSetNaturalUnit,
      );

      // Create the Rebalancing Set without cToken component
      const proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        defaultSetToken.address,
        proposalPeriod
      );

      // Approve tokens and issue defaultSetToken
      const baseSetIssueQuantity = ether(1);

      await approveForTransferAsync([
        defaultBaseSetComponent,
        defaultBaseSetComponent2,
      ], transferProxy.address);

      await core.issue.sendTransactionAsync(
        defaultSetToken.address,
        baseSetIssueQuantity,
        TX_DEFAULTS,
      );

      // Use issued defaultSetToken to issue rebalancingSetToken
      await approveForTransferAsync([defaultSetToken], transferProxy.address);

      const rebalancingSetTokenQuantityToIssue = ether(1);

      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

      // Determine minimum bid
      const decOne = await defaultSetToken.naturalUnit.callAsync();
      const decTwo = await cTokenSetToken.naturalUnit.callAsync();
      const minBid = new BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);

      // Approve tokens to rebalancingSetCTokenBidder contract
      await approveForTransferAsync([
        usdc,
        dai,
      ], rebalancingSetCTokenBidder.address);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectBidQuantity = minBid;
      subjectAllowPartialFill = false;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.bidWithCTokenUnderlyingAsync(
        subjectRebalancingSetTokenAddress,
        subjectBidQuantity,
        subjectAllowPartialFill,
        { from: subjectCaller }
      );
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;

        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          cTokenSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      beforeEach(async () => {
        // Transition to rebalance state
        const auctionPriceCurveAddress = priceCurve.address;

        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          cTokenSetToken.address,
          auctionPriceCurveAddress,
        );
      });

      test('subtract correct amount from remainingCurrentSets', async () => {
        const [, existingRemainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

        await subject();

        const expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
        const [, newRemainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();
        expect(newRemainingCurrentSets).to.eql(expectedRemainingCurrentSets);
      });

      test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', async () => {
        const expectedTokenFlows = await constructInflowOutflowArraysAsync(
          rebalancingSetToken,
          subjectBidQuantity,
          DEFAULT_AUCTION_PRICE_NUMERATOR,
        );
        const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        const oldSenderBalances = await getVaultBalances(
          vault,
          combinedTokenArray,
          rebalancingSetToken.address
        );

        await subject();

        const newSenderBalances = await getVaultBalances(
          vault,
          combinedTokenArray,
          rebalancingSetToken.address
        );
        const expectedSenderBalances = _.map(oldSenderBalances, (balance, index) =>
          balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index])
        );
        expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
      });

      test('transfers and withdraws the correct amount of tokens to the bidder wallet', async () => {
        const expectedTokenFlows = await constructInflowOutflowArraysAsync(
          rebalancingSetToken,
          subjectBidQuantity,
          DEFAULT_AUCTION_PRICE_NUMERATOR
        );
        const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        // Get current exchange rate
        const cUSDCExchangeRate = await compoundHelper.getExchangeRateCurrent(cUSDC.address);
        const cDAIExchangeRate = await compoundHelper.getExchangeRateCurrent(cDAI.address);
        // Replace expected token flow arrays with cToken underlying
        const expectedTokenFlowsUnderlying = replaceFlowsWithCTokenUnderlyingAsync(
          expectedTokenFlows,
          combinedTokenArray,
          [cUSDC.address, cDAI.address],
          [usdc.address, dai.address],
          [cUSDCExchangeRate, cDAIExchangeRate],
        );

        const oldReceiverTokenBalances = await Promise.all(
          combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );

        const oldUnderlyingTokenBalances = await Promise.all(
          [
            usdc.address,
            dai.address,
          ].map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );

        // Replace cToken balance with underlying token balance
        const oldReceiverTokenUnderlyingBalances = _.map(oldReceiverTokenBalances, (balance, index) => {
          if (combinedTokenArray[index] === cUSDC.address) {
            return oldUnderlyingTokenBalances[0];
          } else if (combinedTokenArray[index] === cDAI.address) {
            return oldUnderlyingTokenBalances[1];
          } else {
            return balance;
          }
        });

        await subject();

        const newReceiverTokenBalances = await Promise.all(
          combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );
        const newUnderlyingTokenBalances = await Promise.all(
          [
            usdc.address,
            dai.address,
          ].map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );
        // Replace cToken balance with underlying token balance
        const newReceiverTokenUnderlyingBalances = _.map(newReceiverTokenBalances, (balance, index) => {
          if (combinedTokenArray[index] === cUSDC.address) {
            return newUnderlyingTokenBalances[0];
          } else if (combinedTokenArray[index] === cDAI.address) {
            return newUnderlyingTokenBalances[1];
          } else {
            return balance;
          }
        });
        const expectedReceiverBalances = _.map(oldReceiverTokenUnderlyingBalances, (balance, index) =>
          balance
          .add(expectedTokenFlowsUnderlying['outflow'][index])
          .sub(expectedTokenFlowsUnderlying['inflow'][index])
        );

        expect(JSON.stringify(newReceiverTokenUnderlyingBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
      });

      describe('and the passed rebalancingSetToken is not tracked by Core', async () => {
        beforeEach(async () => {
          subjectRebalancingSetTokenAddress = ACCOUNTS[5].address;
        });

        it('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `Contract at ${subjectRebalancingSetTokenAddress} is not a valid Set token address.`
          );
        });
      });

      describe('and the bid amount is greater than remaining current sets', async () => {
        beforeEach(async () => {
          subjectBidQuantity = ether(10);
        });

        it('throw', async () => {
          const [, remainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, exceeds the remaining current sets,` +
              ` ${remainingCurrentSets}.`
          );
        });
      });

      describe('and the bid amount is not a multiple of the minimumBid', async () => {
        let minimumBid: BigNumber;

        beforeEach(async () => {
          [minimumBid] = await rebalancingSetToken.getBiddingParameters.callAsync();
          subjectBidQuantity = minimumBid.mul(0.5);
        });

        test('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, must be a multiple of the minimumBid, ${minimumBid}.`
          );
        });
      });

      describe('and the caller has not approved inflow tokens for transfer', async () => {
        beforeEach(async () => {
          subjectCaller = ACCOUNTS[3].address;
        });

        test('throw', async () => {
          const expectedTokenFlows = await constructInflowOutflowArraysAsync(
            rebalancingSetToken,
            subjectBidQuantity,
            DEFAULT_AUCTION_PRICE_NUMERATOR
          );
          const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

          // Get current exchange rate
          const cUSDCExchangeRate = await compoundHelper.getExchangeRateCurrent(cUSDC.address);
          const cDAIExchangeRate = await compoundHelper.getExchangeRateCurrent(cDAI.address);
          // Replace expected token flow arrays with cToken underlying
          const expectedTokenFlowsUnderlying = replaceFlowsWithCTokenUnderlyingAsync(
            expectedTokenFlows,
            combinedTokenArray,
            [cUSDC.address, cDAI.address],
            [usdc.address, dai.address],
            [cUSDCExchangeRate, cDAIExchangeRate],
          );

          return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has allowance of 0

        when required allowance is ${expectedTokenFlowsUnderlying['inflow'][2]} at token

        address: ${usdc.address} for spender: ${rebalancingSetCTokenBidder.address}.
      `
          );
        });
      });

      describe('and the caller does not have the balance to transfer', async () => {
        beforeEach(async () => {
          subjectCaller = ACCOUNTS[3].address;
          const approvalToken: ERC20DetailedContract = await ERC20DetailedContract.at(usdc.address, web3, {});
          await approvalToken.approve.sendTransactionAsync(
            rebalancingSetCTokenBidder.address,
            UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
            { from: subjectCaller }
          );

          const approvalToken2: ERC20DetailedContract = await ERC20DetailedContract.at(dai.address, web3, {});
          await approvalToken2.approve.sendTransactionAsync(
            rebalancingSetCTokenBidder.address,
            UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
            { from: subjectCaller }
          );
        });

        test('throw', async () => {
          const expectedTokenFlows = await constructInflowOutflowArraysAsync(
            rebalancingSetToken,
            subjectBidQuantity,
            DEFAULT_AUCTION_PRICE_NUMERATOR
          );
          const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

          // Get current exchange rate
          const cUSDCExchangeRate = await compoundHelper.getExchangeRateCurrent(cUSDC.address);
          const cDAIExchangeRate = await compoundHelper.getExchangeRateCurrent(cDAI.address);
          // Replace expected token flow arrays with cToken underlying
          const expectedTokenFlowsUnderlying = replaceFlowsWithCTokenUnderlyingAsync(
            expectedTokenFlows,
            combinedTokenArray,
            [cUSDC.address, cDAI.address],
            [usdc.address, dai.address],
            [cUSDCExchangeRate, cDAIExchangeRate],
          );

          return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has balance of 0

        when required balance is ${expectedTokenFlowsUnderlying['inflow'][2]} at token address ${usdc.address}.
      `
          );
        });
      });
    });
  });

  describe('updateManagerAsync', async () => {
    let currentSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let managerAddress: Address;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectNewManager: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      currentSetToken = set1;

      const proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectNewManager = ACCOUNTS[2].address;
      subjectCaller = managerAddress;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.updateManagerAsync(
        subjectRebalancingSetTokenAddress,
        subjectNewManager,
        { from: subjectCaller }
      );
    }

    test('it changes the set manager correctly', async () => {
      await subject();

      const returnedManager = await rebalancingSetTokenWrapper.manager(subjectRebalancingSetTokenAddress);
      expect(returnedManager).to.eql(subjectNewManager);
    });

    describe('when the updateManager is not called by the manager', async () => {
      beforeEach(async () => {
        subjectCaller = ACCOUNTS[2].address;
      });

      test('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Caller ${subjectCaller} is not the manager of this Rebalancing Set Token.`
        );
      });
    });
  });

  describe('redeemFromFailedRebalanceAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<any> {
      return await rebalancingAPI.redeemFromFailedRebalanceAsync(
        subjectRebalancingSetTokenAddress,
        { from: subjectCaller }
      );
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Drawdown state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Drawdown state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Drawdown state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Drawdown state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setBidAmount = ether(1);

        await transitionToDrawdownAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          rebalanceAuctionModule,
          setBidAmount,
        );
      });

      it('transfers the collateral to owner after burning the rebalancing Set', async () => {
        const returnedRebalanceState =
          await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);
        const combinedTokenArray =
          await rebalancingSetToken.getCombinedTokenArray.callAsync();
        const existingCollateralBalances = await getVaultBalances(
          vault,
          combinedTokenArray,
          subjectRebalancingSetTokenAddress
        );

        await subject();

        const expectedRBSetTokenBalance = new BigNumber(0);
        const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
        const newOwnerVaultBalances = await getVaultBalances(vault, combinedTokenArray, subjectCaller);

        expect(returnedRebalanceState).to.eql('Drawdown');
        expect(expectedRBSetTokenBalance.toString()).to.eql(currentRBSetTokenBalance.toString());
        expect(JSON.stringify(existingCollateralBalances)).to.be.eql(JSON.stringify(newOwnerVaultBalances));
      });
    });
  });

  describe('getBidPriceAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectBidQuantity: BigNumber;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectBidQuantity = rebalancingSetQuantityToIssue;
    });

    async function subject(): Promise<TokenFlowsDetails> {
      return await rebalancingAPI.getBidPriceAsync(subjectRebalancingSetTokenAddress, subjectBidQuantity);
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress
        );
      });

      test('it fetches the correct token flow details arrays', async () => {
        const returnedTokenFlowDetailsArrays = await subject();

        const expectedTokenAddresses = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        const expectedTokenFlowDetailsArrays = await constructInflowOutflowAddressesArraysAsync(
          rebalancingSetToken,
          subjectBidQuantity,
          DEFAULT_AUCTION_PRICE_NUMERATOR,
          expectedTokenAddresses,
        );

        const returnedInflowArray = JSON.stringify(returnedTokenFlowDetailsArrays['inflow']);
        const expectedInflowArray = JSON.stringify(expectedTokenFlowDetailsArrays['inflow']);
        expect(returnedInflowArray).to.eql(expectedInflowArray);

        const returnedOutflowArray = JSON.stringify(returnedTokenFlowDetailsArrays['outflow']);
        const expectedOutflowArray = JSON.stringify(expectedTokenFlowDetailsArrays['outflow']);
        expect(returnedOutflowArray).to.eql(expectedOutflowArray);
      });

      test('it filters out components with zero units from token flows', async () => {
        const expectedOutflowDetailsZeroCount = 1;
        const expectedInflowDetailsZeroCount = 1;

        const returnedTokenFlowDetailsArrays = await subject();

        // Get Token Flow bid units not filtered for 0s and count of 0 units
        const [
          returnedInflowArray,
          returnedOutflowArray,
        ] = await rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity);

        const returnedInflowZeroCount = returnedInflowArray.reduce((accumulator, unit) => {
          const bigNumberUnit = new BigNumber(unit);
          if (bigNumberUnit.eq(0)) {
            accumulator++;
          }
          return accumulator;
        }, 0);

        const returnedOutflowZeroCount = returnedOutflowArray.reduce((accumulator, unit) => {
          const bigNumberUnit = new BigNumber(unit);
          if (bigNumberUnit.eq(0)) {
            accumulator++;
          }
          return accumulator;
        }, 0);

        // Get Token Flow Details which should filter for 0s and count of 0 units
        const returnedInflowDetailsZeroCount = returnedTokenFlowDetailsArrays.inflow.reduce((
          accumulator,
          component
          ) => {
          const bigNumberUnit = new BigNumber(component.unit);
          if (bigNumberUnit.eq(0)) {
            accumulator++;
          }
          return accumulator;
        }, 0);

        const returnedOutflowDetailsZeroCount = returnedTokenFlowDetailsArrays.outflow.reduce((
          accumulator,
          component
          ) => {
          const bigNumberUnit = new BigNumber(component.unit);
          if (bigNumberUnit.eq(0)) {
            accumulator++;
          }
          return accumulator;
        }, 0);

        // Ensure there are inflow / outflow components with zero amounts
        expect(returnedInflowZeroCount).to.eql(expectedInflowDetailsZeroCount);
        expect(returnedOutflowZeroCount).to.eql(expectedOutflowDetailsZeroCount);

        // Expect subject to filter out 0s
        expect(returnedInflowDetailsZeroCount).to.eql(0);
        expect(returnedOutflowDetailsZeroCount).to.eql(0);
      });

      describe('and the bid amount is greater than remaining current sets', async () => {
        beforeEach(async () => {
          subjectBidQuantity = ether(10);
        });

        it('throw', async () => {
          const [, remainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, exceeds the remaining current sets,` +
              ` ${remainingCurrentSets}.`
          );
        });
      });

      describe('and the bid amount is not a multiple of the minimumBid', async () => {
        let minimumBid: BigNumber;

        beforeEach(async () => {
          [minimumBid] = await rebalancingSetToken.getBiddingParameters.callAsync();
          subjectBidQuantity = minimumBid.mul(1.5);
        });

        test('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, must be a multiple of the minimumBid, ${minimumBid}.`
          );
        });
      });
    });
  });

  describe('getBidPriceCTokenUnderlyingAsync', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let defaultSetToken: SetTokenContract;
    let cTokenSetToken: SetTokenContract;
    let managerAddress: Address;

    let defaultBaseSetComponent: StandardTokenMockContract;
    let defaultBaseSetComponent2: StandardTokenMockContract;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectBidQuantity: BigNumber;

    beforeEach(async () => {
      // Create component tokens for default Set
      defaultBaseSetComponent = await deployTokenAsync(web3);
      defaultBaseSetComponent2 = await deployTokenAsync(web3);

      // Create the Set (default is 2 components)
      const defaultComponentAddresses = [
        defaultBaseSetComponent.address, defaultBaseSetComponent2.address,
      ];
      const defaultComponentUnits = [
        ether(0.01), ether(0.01),
      ];

      const defaultBaseSetNaturalUnit = ether(0.001);
      defaultSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        defaultComponentAddresses,
        defaultComponentUnits,
        defaultBaseSetNaturalUnit,
      );

      // Create the Set (default is 2 components)
      const nextComponentAddresses = [
        cUSDC.address, cDAI.address,
      ];

      const nextComponentUnits = [
        ether(0.001), ether(1),
      ];

      const cTokenBaseSetNaturalUnit = ether(0.001);
      cTokenSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        nextComponentAddresses,
        nextComponentUnits,
        cTokenBaseSetNaturalUnit,
      );

      // Create the Rebalancing Set without cToken component
      const proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        defaultSetToken.address,
        proposalPeriod
      );

      // Approve tokens and issue defaultSetToken
      const baseSetIssueQuantity = ether(1);

      await approveForTransferAsync([
        defaultBaseSetComponent,
        defaultBaseSetComponent2,
      ], transferProxy.address);

      await core.issue.sendTransactionAsync(
        defaultSetToken.address,
        baseSetIssueQuantity,
        TX_DEFAULTS,
      );

      // Use issued defaultSetToken to issue rebalancingSetToken
      await approveForTransferAsync([defaultSetToken], transferProxy.address);

      const rebalancingSetTokenQuantityToIssue = ether(1);

      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

      // Determine minimum bid
      const decOne = await defaultSetToken.naturalUnit.callAsync();
      const decTwo = await cTokenSetToken.naturalUnit.callAsync();
      const minBid = new BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);

      // Approve tokens to rebalancingSetCTokenBidder contract
      await approveForTransferAsync([
        usdc,
        dai,
      ], rebalancingSetCTokenBidder.address);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectBidQuantity = minBid;
    });

    async function subject(): Promise<TokenFlowsDetails> {
      return await rebalancingAPI.getBidPriceCTokenUnderlyingAsync(
        subjectRebalancingSetTokenAddress,
        subjectBidQuantity
      );
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          cTokenSetToken.address,
          setAuctionPriceCurveAddress
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          cTokenSetToken.address,
          setAuctionPriceCurveAddress
        );
      });

      test('it fetches the correct token flow details arrays', async () => {
        const returnedTokenFlowDetailsArrays = await subject();

        const expectedTokenAddresses = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        const expectedTokenFlowDetailsArrays = await constructInflowOutflowAddressesArraysAsync(
          rebalancingSetToken,
          subjectBidQuantity,
          DEFAULT_AUCTION_PRICE_NUMERATOR,
          expectedTokenAddresses,
        );

        // Get exchange rate stored
        const cUSDCExchangeRate = await compoundHelper.getExchangeRate(cUSDC.address);
        const cDAIExchangeRate = await compoundHelper.getExchangeRate(cDAI.address);
        // Replace expected token flow arrays with cToken underlying
        const expectedTokenFlowDetailsUnderlyingArrays: TokenFlowsDetails = replaceDetailFlowsWithCTokenUnderlyingAsync(
          expectedTokenFlowDetailsArrays,
          [cUSDC.address, cDAI.address],
          [usdc.address, dai.address],
          [cUSDCExchangeRate, cDAIExchangeRate],
        );

        const returnedInflowArray = JSON.stringify(returnedTokenFlowDetailsArrays['inflow']);
        const expectedInflowArray = JSON.stringify(expectedTokenFlowDetailsUnderlyingArrays['inflow']);
        expect(returnedInflowArray).to.eql(expectedInflowArray);

        const returnedOutflowArray = JSON.stringify(returnedTokenFlowDetailsArrays['outflow']);
        const expectedOutflowArray = JSON.stringify(expectedTokenFlowDetailsUnderlyingArrays['outflow']);
        expect(returnedOutflowArray).to.eql(expectedOutflowArray);
      });

      test('it filters out components with zero units from token flows', async () => {
        const expectedOutflowDetailsZeroCount = 2;
        const expectedInflowDetailsZeroCount = 2;

        const returnedTokenFlowDetailsArrays = await subject();

        // Get Token Flow bid units not filtered for 0s and count of 0 units
        const [
          returnedInflowArray,
          returnedOutflowArray,
        ] = await rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity);

        const returnedInflowZeroCount = returnedInflowArray.reduce((accumulator, unit) => {
          const bigNumberUnit = new BigNumber(unit);
          if (bigNumberUnit.eq(0)) {
            accumulator++;
          }
          return accumulator;
        }, 0);

        const returnedOutflowZeroCount = returnedOutflowArray.reduce((accumulator, unit) => {
          const bigNumberUnit = new BigNumber(unit);
          if (bigNumberUnit.eq(0)) {
            accumulator++;
          }
          return accumulator;
        }, 0);

        // Get Token Flow Details which should filter for 0s and count of 0 units
        const returnedInflowDetailsZeroCount = returnedTokenFlowDetailsArrays.inflow.reduce((
          accumulator,
          component
          ) => {
          const bigNumberUnit = new BigNumber(component.unit);
          if (bigNumberUnit.eq(0)) {
            accumulator++;
          }
          return accumulator;
        }, 0);

        const returnedOutflowDetailsZeroCount = returnedTokenFlowDetailsArrays.outflow.reduce((
          accumulator,
          component
          ) => {
          const bigNumberUnit = new BigNumber(component.unit);
          if (bigNumberUnit.eq(0)) {
            accumulator++;
          }
          return accumulator;
        }, 0);

        // Ensure there are inflow / outflow components with zero amounts
        expect(returnedInflowZeroCount).to.eql(expectedInflowDetailsZeroCount);
        expect(returnedOutflowZeroCount).to.eql(expectedOutflowDetailsZeroCount);

        // Expect subject to filter out 0s
        expect(returnedInflowDetailsZeroCount).to.eql(0);
        expect(returnedOutflowDetailsZeroCount).to.eql(0);
      });

      describe('and the bid amount is greater than remaining current sets', async () => {
        beforeEach(async () => {
          subjectBidQuantity = ether(10);
        });

        it('throw', async () => {
          const [, remainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, exceeds the remaining current sets,` +
              ` ${remainingCurrentSets}.`
          );
        });
      });

      describe('and the bid amount is not a multiple of the minimumBid', async () => {
        let minimumBid: BigNumber;

        beforeEach(async () => {
          [minimumBid] = await rebalancingSetToken.getBiddingParameters.callAsync();
          subjectBidQuantity = minimumBid.mul(0.8);
        });

        test('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, must be a multiple of the minimumBid, ${minimumBid}.`
          );
        });
      });
    });
  });

  describe('getRebalanceStateAsync', async () => {
    let currentSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      currentSetToken = set1;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.getRebalanceStateAsync(subjectRebalancingSetTokenAddress);
    }

    it('returns the rebalancing token state', async () => {
      const states = await subject();

      expect(states).to.eql('Default');
    });

    describe('when the rebalancing set address is invalid', async () => {
      beforeEach(async () => {
        subjectRebalancingSetTokenAddress = 'InvalidRebalancingSetTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected rebalancingSetTokenAddress to conform to schema /Address.

        Encountered: "InvalidRebalancingSetTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });
  });

  describe('getRebalanceStatesAsync', async () => {
    let currentSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let subjectRebalancingSetTokenAddresses: Address[];

    beforeEach(async () => {
      currentSetToken = set1;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      subjectRebalancingSetTokenAddresses = [rebalancingSetToken.address];
    });

    async function subject(): Promise<string[]> {
      return await rebalancingAPI.getRebalanceStatesAsync(subjectRebalancingSetTokenAddresses);
    }

    it('returns the rebalancing token state', async () => {
      const state = await subject();

      expect(state).to.eql(['Default']);
    });

    describe('when the rebalancing set address is invalid', async () => {
      beforeEach(async () => {
        subjectRebalancingSetTokenAddresses = ['InvalidRebalancingSetTokenAddress'];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected rebalancingSetTokenAddress to conform to schema /Address.

        Encountered: "InvalidRebalancingSetTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });
  });

  describe('getUnitSharesAsync', async () => {
    let currentSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let subjectRebalancingSetTokenAddresses: Address[];

    beforeEach(async () => {
      currentSetToken = set1;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      subjectRebalancingSetTokenAddresses = [rebalancingSetToken.address];
    });

    async function subject(): Promise<BigNumber[]> {
      return await rebalancingAPI.getUnitSharesAsync(subjectRebalancingSetTokenAddresses);
    }

    it('returns the rebalancing token state', async () => {
      const unitShares = await subject();

      const expectedUnitShares = await rebalancingSetToken.unitShares.callAsync();
      expect(unitShares[0]).to.eql(expectedUnitShares.toString());
    });

    describe('when the rebalancing set address is invalid', async () => {
      beforeEach(async () => {
        subjectRebalancingSetTokenAddresses = ['InvalidRebalancingSetTokenAddress'];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected rebalancingSetTokenAddress to conform to schema /Address.

        Encountered: "InvalidRebalancingSetTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });
  });

  describe('getRebalancingSetCurrentSetAsync', async () => {
    let currentSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      currentSetToken = set1;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.getRebalancingSetCurrentSetAsync(subjectRebalancingSetTokenAddress);
    }

    it('returns the set token address', async () => {
      const currentSetAddress = await subject();

      expect(currentSetAddress).to.eql(currentSetToken.address);
    });
  });

  describe('getBidPlacedEventsAsync', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;

    let bid1BlockNumber: number;
    let earlyTxnHash: string;
    let earlyBlockNumber: number;
    let earlyBlockTimestamp: number;

    let bidQuantity: BigNumber;
    let allowPartialFill: boolean;
    let bidderAccount: Address;
    let bid1TxnHash: string;
    let bid2TxnHash: string;

    let subjectFromBlock: number;
    let subjectToBlock: any;
    let subjectRebalancingSetToken: Address;
    let subjectGetTimestamp: boolean;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      const proposalPeriod = ONE_DAY_IN_SECONDS;
      const managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      earlyTxnHash = await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Transition to proposal state
      const auctionPriceCurveAddress = priceCurve.address;
      const setAuctionTimeToPivot = new BigNumber(100000);
      const setAuctionStartPrice = new BigNumber(500);
      const setAuctionPivotPrice = new BigNumber(1000);
      await transitionToRebalanceAsync(
        web3,
        rebalancingSetToken,
        managerAddress,
        nextSetToken.address,
        auctionPriceCurveAddress,
        setAuctionTimeToPivot,
        setAuctionStartPrice,
        setAuctionPivotPrice,
      );

      bidQuantity = ether(2);
      allowPartialFill = false;
      bidderAccount = DEFAULT_ACCOUNT;

      bid1TxnHash = await rebalancingAuctionModuleWrapper.bid(
        rebalancingSetToken.address,
        bidQuantity,
        allowPartialFill,
        { from: bidderAccount },
      );

      // Create a second bid transaction
      const rebalancingSetToken2 = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      await core.issue.sendTransactionAsync(rebalancingSetToken2.address, rebalancingSetQuantityToIssue);

      await transitionToRebalanceAsync(
        web3,
        rebalancingSetToken2,
        managerAddress,
        nextSetToken.address,
        auctionPriceCurveAddress,
        setAuctionTimeToPivot,
        setAuctionStartPrice,
        setAuctionPivotPrice,
      );

      bid2TxnHash = await rebalancingAuctionModuleWrapper.bid(
        rebalancingSetToken2.address,
        bidQuantity,
        allowPartialFill,
        { from: bidderAccount },
      );

      const earlyTransaction = await web3.eth.getTransaction(earlyTxnHash);
      earlyBlockNumber = earlyTransaction['blockNumber'];

      const firstBidTransaction = await web3.eth.getTransaction(bid1TxnHash);
      bid1BlockNumber = firstBidTransaction['blockNumber'];
      const bid1Block = await web3.eth.getBlock(bid1BlockNumber);
      earlyBlockTimestamp = bid1Block.timestamp;

      const lastBidTransaction = await web3.eth.getTransaction(bid2TxnHash);
      const bidBlockNumber = lastBidTransaction['blockNumber'];

      subjectFromBlock = earlyBlockNumber;
      subjectToBlock = bidBlockNumber;
      subjectRebalancingSetToken = undefined;
      subjectGetTimestamp = true;
    });

    async function subject(): Promise<BidPlacedEvent[]> {
      return await rebalancingAPI.getBidPlacedEventsAsync(
        subjectFromBlock,
        subjectToBlock,
        subjectRebalancingSetToken,
        subjectGetTimestamp
      );
    }

    test('retrieves the right event logs length', async () => {
      const events = await subject();

      expect(events.length).to.equal(2);
    });

    test('retrieves the correct properties', async () => {
      const events = await subject();

      const [firstEvent] = events;

      expect(firstEvent.transactionHash).to.equal(bid1TxnHash);
      expect(firstEvent.rebalancingSetToken).to.equal(rebalancingSetToken.address);
      expect(firstEvent.executionQuantity).to.bignumber.equal(bidQuantity);
      expect(firstEvent.timestamp).to.equal(earlyBlockTimestamp);
      expect(firstEvent.blockNumber).to.equal(bid1BlockNumber);
    });
  });

  describe('getBidPlacedHelperEventsAsync', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let defaultSetToken: SetTokenContract;
    let wethSetToken: SetTokenContract;
    let cTokenSetToken: SetTokenContract;

    let earlyTxnHash: string;
    let earlyBlockNumber: number;
    let earlyBlockTimestamp: number;

    let defaultBaseSetComponent: StandardTokenMockContract | WethMockContract;
    let defaultBaseSetComponent2: StandardTokenMockContract | WethMockContract;
    let wethComponentUnits: BigNumber;
    let wethBaseSetNaturalUnit: BigNumber;
    let cTokenBaseSetComponent: StandardTokenMockContract;
    let cTokenBaseSetComponent2: StandardTokenMockContract;

    let bidQuantity: BigNumber;
    let allowPartialFill: boolean;
    let bidderAccount: Address;
    let bid1TxnHash: string;
    let bid2TxnHash: string;

    let subjectBidderType: BigNumber;
    let subjectFromBlock: number;
    let subjectToBlock: any;
    let subjectRebalancingSetToken: Address;
    let subjectEthQuantity: BigNumber;
    let subjectGetTimestamp: boolean;

    beforeEach(async () => {
      // Create component tokens for default Set
      defaultBaseSetComponent = await deployTokenAsync(web3);
      defaultBaseSetComponent2 = await deployTokenAsync(web3);

      // Create the Set (default is 2 components)
      const defaultComponentAddresses = [
        defaultBaseSetComponent.address, defaultBaseSetComponent2.address,
      ];
      const defaultComponentUnits = [
        ether(0.01), ether(0.01),
      ];

      const defaultBaseSetNaturalUnit = ether(0.001);
      defaultSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        defaultComponentAddresses,
        defaultComponentUnits,
        defaultBaseSetNaturalUnit,
      );

      // Create the Set (default is 2 components)
      const nextWethComponentAddresses = [
        weth.address, usdc.address,
      ];

      wethComponentUnits = ether(0.01);
      const nextWethComponentUnits = [
        wethComponentUnits, ether(0.01),
      ];

      wethBaseSetNaturalUnit = ether(0.001);
      wethSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        nextWethComponentAddresses,
        nextWethComponentUnits,
        wethBaseSetNaturalUnit,
      );

      // Create component tokens for Set containing cTokens
      cTokenBaseSetComponent = cUSDC;
      cTokenBaseSetComponent2 = cDAI;
      // Create the Set (default is 2 components)
      const nextCTokenComponentAddresses = [
        cTokenBaseSetComponent.address, cTokenBaseSetComponent2.address,
      ];

      const nextCTokenComponentUnits = [
        ether(0.001), ether(1),
      ];

      const cTokenBaseSetNaturalUnit = ether(0.001);
      cTokenSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        nextCTokenComponentAddresses,
        nextCTokenComponentUnits,
        cTokenBaseSetNaturalUnit,
      );
    });

    async function subject(): Promise<BidPlacedHelperEvent[]> {
      return await rebalancingAPI.getBidPlacedHelperEventsAsync(
        subjectBidderType,
        subjectFromBlock,
        subjectToBlock,
        subjectRebalancingSetToken,
        subjectGetTimestamp
      );
    }

    describe('when bidder type inputted is ETH bidder helper', async () => {
      beforeEach(async () => {
        // Create the Rebalancing Set without WETH component
        const proposalPeriod = ONE_DAY_IN_SECONDS;
        const managerAddress = ACCOUNTS[1].address;

        rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
          web3,
          core,
          rebalancingSetTokenFactory.address,
          managerAddress,
          defaultSetToken.address,
          proposalPeriod
        );

        // Approve tokens and issue defaultSetToken
        const baseSetIssueQuantity = ether(1);

        await approveForTransferAsync([
          defaultBaseSetComponent,
          defaultBaseSetComponent2,
        ], transferProxy.address);

        earlyTxnHash = await core.issue.sendTransactionAsync(
          defaultSetToken.address,
          baseSetIssueQuantity,
          TX_DEFAULTS,
        );

        // Use issued defaultSetToken to issue rebalancingSetToken
        await approveForTransferAsync([defaultSetToken], transferProxy.address);

        const rebalancingSetTokenQuantityToIssue = ether(1);

        await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

        // Transition to rebalance state
        const auctionPriceCurveAddress = priceCurve.address;
        const setAuctionTimeToPivot = new BigNumber(100000);
        const setAuctionStartPrice = new BigNumber(500);
        const setAuctionPivotPrice = new BigNumber(1000);
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          wethSetToken.address,
          auctionPriceCurveAddress,
          setAuctionTimeToPivot,
          setAuctionStartPrice,
          setAuctionPivotPrice,
        );

        // Determine minimum bid
        const decOne = await defaultSetToken.naturalUnit.callAsync();
        const decTwo = await wethSetToken.naturalUnit.callAsync();
        const minBid = new BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);

        bidQuantity = minBid;
        allowPartialFill = false;
        bidderAccount = DEFAULT_ACCOUNT;

        // Approve tokens to rebalancingSetEthBidder contract
        await approveForTransferAsync([
          weth,
          usdc,
        ], rebalancingSetEthBidder.address);

        subjectEthQuantity = baseSetIssueQuantity.mul(wethComponentUnits).div(wethBaseSetNaturalUnit);

        bid1TxnHash = await rebalancingSetEthBidderWrapper.bidAndWithdrawWithEther(
          rebalancingSetToken.address,
          bidQuantity,
          allowPartialFill,
          { from: bidderAccount, value: subjectEthQuantity.toNumber() },
        );

        // Create a second bid transaction
        const rebalancingSetToken2 = await createDefaultRebalancingSetTokenAsync(
          web3,
          core,
          rebalancingSetTokenFactory.address,
          managerAddress,
          defaultSetToken.address,
          proposalPeriod
        );

        // Issue defaultSetToken
        await core.issue.sendTransactionAsync(defaultSetToken.address, ether(9), TX_DEFAULTS);
        await approveForTransferAsync([defaultSetToken], transferProxy.address);

        // Use issued defaultSetToken to issue rebalancingSetToken
        await core.issue.sendTransactionAsync(rebalancingSetToken2.address, rebalancingSetTokenQuantityToIssue);

        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken2,
          managerAddress,
          wethSetToken.address,
          auctionPriceCurveAddress,
          setAuctionTimeToPivot,
          setAuctionStartPrice,
          setAuctionPivotPrice,
        );

        bid2TxnHash = await rebalancingSetEthBidderWrapper.bidAndWithdrawWithEther(
          rebalancingSetToken2.address,
          bidQuantity,
          allowPartialFill,
          { from: bidderAccount, value: subjectEthQuantity.toNumber() },
        );

        const earlyTransaction = await web3.eth.getTransaction(earlyTxnHash);
        earlyBlockNumber = earlyTransaction['blockNumber'];

        const firstBidTransaction = await web3.eth.getTransaction(bid1TxnHash);
        const bid1BlockNumber = firstBidTransaction['blockNumber'];
        const bid1Block = await web3.eth.getBlock(bid1BlockNumber);
        earlyBlockTimestamp = bid1Block.timestamp;

        const lastBidTransaction = await web3.eth.getTransaction(bid2TxnHash);
        const bidBlockNumber = lastBidTransaction['blockNumber'];

        subjectBidderType = new BigNumber(0);
        subjectFromBlock = earlyBlockNumber;
        subjectToBlock = bidBlockNumber;
        subjectRebalancingSetToken = undefined;
        subjectGetTimestamp = true;
      });

      test('retrieves the right event logs length', async () => {
        const events = await subject();

        expect(events.length).to.equal(2);
      });

      test('retrieves the correct properties', async () => {
        const events = await subject();

        const [firstEvent] = events;

        expect(bid1TxnHash).to.equal(firstEvent.transactionHash);
        expect(bidderAccount).to.equal(firstEvent.bidder);
        expect(rebalancingSetToken.address).to.equal(firstEvent.rebalancingSetToken);
        expect(earlyBlockTimestamp).to.equal(firstEvent.timestamp);
      });
    });

    describe('when bidder type inputted is cToken bidder helper', async () => {
      beforeEach(async () => {
        // Create the Rebalancing Set without cToken components
        const proposalPeriod = ONE_DAY_IN_SECONDS;
        const managerAddress = ACCOUNTS[1].address;

        rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
          web3,
          core,
          rebalancingSetTokenFactory.address,
          managerAddress,
          defaultSetToken.address,
          proposalPeriod
        );

        // Approve tokens and issue defaultSetToken
        const baseSetIssueQuantity = ether(1);

        await approveForTransferAsync([
          defaultBaseSetComponent,
          defaultBaseSetComponent2,
        ], transferProxy.address);

        earlyTxnHash = await core.issue.sendTransactionAsync(
          defaultSetToken.address,
          baseSetIssueQuantity,
          TX_DEFAULTS,
        );

        // Use issued defaultSetToken to issue rebalancingSetToken
        await approveForTransferAsync([defaultSetToken], transferProxy.address);

        const rebalancingSetTokenQuantityToIssue = ether(1);

        await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

        // Transition to rebalance state
        const auctionPriceCurveAddress = priceCurve.address;
        const setAuctionTimeToPivot = new BigNumber(100000);
        const setAuctionStartPrice = new BigNumber(500);
        const setAuctionPivotPrice = new BigNumber(1000);
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          cTokenSetToken.address,
          auctionPriceCurveAddress,
          setAuctionTimeToPivot,
          setAuctionStartPrice,
          setAuctionPivotPrice,
        );

        // Determine minimum bid
        const decOne = await defaultSetToken.naturalUnit.callAsync();
        const decTwo = await cTokenSetToken.naturalUnit.callAsync();
        const minBid = new BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);

        bidQuantity = minBid;
        allowPartialFill = false;
        bidderAccount = DEFAULT_ACCOUNT;

        // Approve underlying tokens to rebalancingSetCTokenBidder contract
        await approveForTransferAsync([
          usdc,
          dai,
        ], rebalancingSetCTokenBidder.address);

        bid1TxnHash = await rebalancingSetCTokenBidderWrapper.bidAndWithdraw(
          rebalancingSetToken.address,
          bidQuantity,
          allowPartialFill,
          { from: bidderAccount },
        );

        // Create a second bid transaction
        const rebalancingSetToken2 = await createDefaultRebalancingSetTokenAsync(
          web3,
          core,
          rebalancingSetTokenFactory.address,
          managerAddress,
          defaultSetToken.address,
          proposalPeriod
        );

        // Issue defaultSetToken
        await core.issue.sendTransactionAsync(defaultSetToken.address, ether(9), TX_DEFAULTS);
        await approveForTransferAsync([defaultSetToken], transferProxy.address);

        // Use issued defaultSetToken to issue rebalancingSetToken
        await core.issue.sendTransactionAsync(rebalancingSetToken2.address, rebalancingSetTokenQuantityToIssue);

        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken2,
          managerAddress,
          cTokenSetToken.address,
          auctionPriceCurveAddress,
          setAuctionTimeToPivot,
          setAuctionStartPrice,
          setAuctionPivotPrice,
        );

        bid2TxnHash = await rebalancingSetCTokenBidderWrapper.bidAndWithdraw(
          rebalancingSetToken2.address,
          bidQuantity,
          allowPartialFill,
          { from: bidderAccount },
        );

        const earlyTransaction = await web3.eth.getTransaction(earlyTxnHash);
        earlyBlockNumber = earlyTransaction['blockNumber'];

        const firstBidTransaction = await web3.eth.getTransaction(bid1TxnHash);
        const bid1BlockNumber = firstBidTransaction['blockNumber'];
        const bid1Block = await web3.eth.getBlock(bid1BlockNumber);
        earlyBlockTimestamp = bid1Block.timestamp;

        const lastBidTransaction = await web3.eth.getTransaction(bid2TxnHash);
        const bidBlockNumber = lastBidTransaction['blockNumber'];

        subjectBidderType = new BigNumber(1);
        subjectFromBlock = earlyBlockNumber;
        subjectToBlock = bidBlockNumber;
        subjectRebalancingSetToken = undefined;
        subjectGetTimestamp = true;
      });

      test('retrieves the right event logs length', async () => {
        const events = await subject();

        expect(events.length).to.equal(2);
      });

      test('retrieves the correct properties', async () => {
        const events = await subject();

        const [firstEvent] = events;

        expect(bid1TxnHash).to.equal(firstEvent.transactionHash);
        expect(bidderAccount).to.equal(firstEvent.bidder);
        expect(rebalancingSetToken.address).to.equal(firstEvent.rebalancingSetToken);
        expect(earlyBlockTimestamp).to.equal(firstEvent.timestamp);
      });
    });
  });

  describe('getDetailsAsync', async () => {
    let currentSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;
    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;

    const standardRebalanceInterval = ONE_DAY_IN_SECONDS;

    beforeEach(async () => {
      currentSetToken = set1;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<RebalancingSetDetails> {
      return await rebalancingAPI.getDetailsAsync(subjectRebalancingSetTokenAddress);
    }

    it('returns the rebalancing token properties', async () => {
      const details = await subject();

      const lastRebalancedAt = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
      expect(details.lastRebalancedAt).to.bignumber.equal(lastRebalancedAt);

      expect(details.address).to.eql(subjectRebalancingSetTokenAddress);
      expect(details.factoryAddress).to.eql(rebalancingSetTokenFactory.address);
      expect(details.managerAddress).to.eql(managerAddress);
      expect(details.currentSetAddress).to.eql(currentSetToken.address);
      expect(details.unitShares).to.bignumber.equal(DEFAULT_UNIT_SHARES);
      expect(details.naturalUnit).to.bignumber.equal(DEFAULT_REBALANCING_NATURAL_UNIT);
      expect(details.state).to.eql('Default');
      expect(details.supply).to.bignumber.equal(rebalancingSetQuantityToIssue);
      expect(details.name).to.eql('Rebalancing Set Token');
      expect(details.symbol).to.eql('RBSET');
      expect(details.proposalPeriod).to.bignumber.equal(proposalPeriod);
      expect(details.rebalanceInterval).to.bignumber.equal(standardRebalanceInterval);
    });
  });

  describe('getProposalDetailsAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;
    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<RebalancingProposalDetails> {
      return await rebalancingAPI.getProposalDetailsAsync(subjectRebalancingSetTokenAddress);
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Proposal state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      let setAuctionPriceCurveAddress: Address;
      let setAuctionTimeToPivot: BigNumber;
      let setAuctionStartPrice: BigNumber;
      let setAuctionPivotPrice: BigNumber;

      beforeEach(async () => {
        setAuctionPriceCurveAddress = priceCurve.address;
        setAuctionTimeToPivot = new BigNumber(100000);
        setAuctionStartPrice = new BigNumber(500);
        setAuctionPivotPrice = new BigNumber(1000);
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setAuctionTimeToPivot,
          setAuctionStartPrice,
          setAuctionPivotPrice,
        );
      });

      it('returns the proper proposal details', async () => {
        const proposalDetails = await subject();

        expect(proposalDetails.state).to.equal('Proposal');
        expect(proposalDetails.nextSetAddress).eql(nextSetToken.address);
        expect(proposalDetails.pricingLibraryAddress).eql(setAuctionPriceCurveAddress);
        expect(proposalDetails.timeToPivot).to.bignumber.equal(setAuctionTimeToPivot);
        expect(proposalDetails.startingPrice).to.bignumber.equal(setAuctionStartPrice);
        expect(proposalDetails.auctionPivotPrice).to.bignumber.equal(setAuctionPivotPrice);

        const proposedAt = await rebalancingSetToken.proposalStartTime.callAsync();
        expect(proposalDetails.proposalStartTime).to.bignumber.equal(proposedAt);
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      let setAuctionPriceCurveAddress: Address;
      let setAuctionTimeToPivot: BigNumber;
      let setAuctionStartPrice: BigNumber;
      let setAuctionPivotPrice: BigNumber;

      beforeEach(async () => {
        setAuctionPriceCurveAddress = priceCurve.address;
        setAuctionTimeToPivot = new BigNumber(100000);
        setAuctionStartPrice = new BigNumber(500);
        setAuctionPivotPrice = new BigNumber(1000);
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress
        );
      });

      it('returns the proper proposal details', async () => {
        const proposalDetails = await subject();

        expect(proposalDetails.state).to.equal('Rebalance');
        expect(proposalDetails.nextSetAddress).eql(nextSetToken.address);
        expect(proposalDetails.pricingLibraryAddress).eql(setAuctionPriceCurveAddress);
        expect(proposalDetails.timeToPivot).to.bignumber.equal(setAuctionTimeToPivot);
        expect(proposalDetails.startingPrice).to.bignumber.equal(setAuctionStartPrice);
        expect(proposalDetails.auctionPivotPrice).to.bignumber.equal(setAuctionPivotPrice);

        const proposedAt = await rebalancingSetToken.proposalStartTime.callAsync();
        expect(proposalDetails.proposalStartTime).to.bignumber.equal(proposedAt);
      });
    });
  });

  describe('getRebalanceDetailsAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;
    let rebalancingSetQuantityToIssue: BigNumber;
    let currentSetStartingQuantity: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      currentSetStartingQuantity = ether(7);
      await core.issue.sendTransactionAsync(currentSetToken.address, currentSetStartingQuantity, TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<RebalancingProgressDetails> {
      return await rebalancingAPI.getRebalanceDetailsAsync(subjectRebalancingSetTokenAddress);
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      let setAuctionPriceCurveAddress: Address;
      let setAuctionTimeToPivot: BigNumber;
      let setAuctionStartPrice: BigNumber;
      let setAuctionPivotPrice: BigNumber;
      let setCurrentSetStartingQuantity: BigNumber;

      beforeEach(async () => {
        setCurrentSetStartingQuantity = currentSetStartingQuantity;
        setAuctionPriceCurveAddress = priceCurve.address;
        setAuctionTimeToPivot = new BigNumber(100000);
        setAuctionStartPrice = new BigNumber(500);
        setAuctionPivotPrice = new BigNumber(1000);
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setAuctionTimeToPivot,
          setAuctionStartPrice,
          setAuctionPivotPrice,
        );
      });

      it('returns the proper rebalancing details', async () => {
        const rebalanceDetails = await subject();

        expect(rebalanceDetails.state).to.equal('Rebalance');

        const [rebalancingStartedAt] = await rebalancingSetToken.getAuctionPriceParameters.callAsync();
        expect(rebalanceDetails.rebalancingStartedAt).to.bignumber.equal(rebalancingStartedAt);

        const [minimumBid, remainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();
        expect(rebalanceDetails.remainingCurrentSet).to.bignumber.equal(remainingCurrentSets);
        expect(rebalanceDetails.minimumBid).to.bignumber.equal(minimumBid);

        expect(rebalanceDetails.startingCurrentSetAmount).to.bignumber.equal(setCurrentSetStartingQuantity);
      });
    });
  });

  describe('getRebalancingSetAuctionRemainingCurrentSets', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let rebalancingSetQuantityToIssue: BigNumber;
    let currentSetStartingQuantity: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      currentSetToken = set1;
      nextSetToken = set2;

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      currentSetStartingQuantity = ether(7);
      await core.issue.sendTransactionAsync(currentSetToken.address, currentSetStartingQuantity, TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<BigNumber> {
      return await rebalancingAPI.getRebalancingSetAuctionRemainingCurrentSets(subjectRebalancingSetTokenAddress);
    }

    describe('when the Rebalancing Set Token is in Default state', async () => {
      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToProposeAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call that function.`
        );
      });
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      beforeEach(async () => {
        const setAuctionPriceCurveAddress = priceCurve.address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('returns the proper rebalancing details', async () => {
        const rebalancingAuctionRemainingCurrentShares = await subject();

        const [, remainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();
        expect(rebalancingAuctionRemainingCurrentShares).to.bignumber.equal(remainingCurrentSets);
      });
    });
  });

  describe('RebalancingSetTokenV3', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetTokenV3Factory: RebalancingSetTokenV3FactoryContract;
    let rebalancingSetTokenV3: RebalancingSetTokenV3Contract;

    let feeCalculator: PerformanceFeeCalculatorContract;
    let liquidator: TWAPLiquidatorContract;
    let liquidatorWhiteList: WhiteListContract;
    let feeCalculatorWhiteList: WhiteListContract;

    let usdcOracleProxy: UpdatableOracleMockContract;
    let ethOracleProxy: UpdatableOracleMockContract;
    let oracleWhiteList: OracleWhiteListContract;

    let rebalancingSetQuantityToIssue: BigNumber;
    let currentSetStartingQuantity: BigNumber;

    beforeEach(async () => {
      ethOracleProxy = await deployUpdatableOracleMockAsync(
        web3,
        ether(200)
      );

      usdcOracleProxy = await deployUpdatableOracleMockAsync(
        web3,
        ether(1)
      );

      oracleWhiteList = await deployOracleWhiteListAsync(
        web3,
        [weth.address, usdc.address],
        [ethOracleProxy.address, usdcOracleProxy.address],
      );

      currentSetToken = set1;
      nextSetToken = set2;

      const auctionPeriod = ONE_HOUR_IN_SECONDS;
      const rangeStart = ether(.01);
      const rangeEnd = ether(.23);
      const name = 'liquidator';
      const assetPairBounds = [
        {
          assetOne: weth.address,
          assetTwo: usdc.address,
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

      feeCalculator = await feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(
        core.address,
        oracleWhiteList.address,
        ether(.5),
        ether(.1)
      );

      liquidatorWhiteList = await deployWhiteListContract(web3, [liquidator.address]);
      feeCalculatorWhiteList = await deployWhiteListContract(web3, [feeCalculator.address]);

      rebalancingSetTokenV3Factory = await deployRebalancingSetTokenV3FactoryContractAsync(
        web3,
        core,
        whitelist,
        liquidatorWhiteList,
        feeCalculatorWhiteList
      );

      rebalancingSetTokenV3 = await createDefaultRebalancingSetTokenV3Async(
        web3,
        core,
        rebalancingSetTokenV3Factory.address,
        DEFAULT_ACCOUNT,
        liquidator.address,
        DEFAULT_ACCOUNT,
        feeCalculator.address,
        currentSetToken.address,
        ONE_DAY_IN_SECONDS,
        ZERO,
      );
    });

    describe('fetchRBSetTWAPRebalanceDetailsAsync', async () => {
      const chunkAuctionPeriod: BigNumber = ONE_HOUR_IN_SECONDS;

      let subjectRebalancingSetTokenAddress: Address;

      beforeEach(async () => {
        // Issue currentSetToken
        currentSetStartingQuantity = ether(7);
        await core.issue.sendTransactionAsync(currentSetToken.address, currentSetStartingQuantity, TX_DEFAULTS);
        await approveForTransferAsync([currentSetToken], transferProxy.address);

        // Use issued currentSetToken to issue rebalancingSetToken
        rebalancingSetQuantityToIssue = ether(7);
        await core.issue.sendTransactionAsync(rebalancingSetTokenV3.address, rebalancingSetQuantityToIssue);

        const liquidatorData = liquidatorHelper.generateTWAPLiquidatorCalldata(
          ether(10 ** 6),
          chunkAuctionPeriod,
        );
        await rebalancingSetTokenV3.startRebalance.sendTransactionAsync(
          nextSetToken.address,
          liquidatorData
        );

        subjectRebalancingSetTokenAddress = rebalancingSetTokenV3.address;
      });

      async function subject(): Promise<RBSetTWAPRebalanceInfo> {
        return await rebalancingAPI.fetchRBSetTWAPRebalanceDetailsAsync(subjectRebalancingSetTokenAddress);
      }

      it('fetches the correct RebalancingSetTokenV3/TradingPool data', async () => {
        const rbSetData = await subject();

        const auctionPriceParams = await rebalancingSetTokenV3.getAuctionPriceParameters.callAsync();
        const startingCurrentSets = await rebalancingSetTokenV3.startingCurrentSetAmount.callAsync();
        const biddingParams = await rebalancingSetTokenV3.getBiddingParameters.callAsync();

        expect(rbSetData.rebalanceStartTime).to.be.bignumber.equal(auctionPriceParams[0]);
        expect(rbSetData.timeToPivot).to.be.bignumber.equal(auctionPriceParams[1]);
        expect(rbSetData.startPrice).to.be.bignumber.equal(auctionPriceParams[2]);
        expect(rbSetData.endPrice).to.be.bignumber.equal(auctionPriceParams[3]);
        expect(rbSetData.startingCurrentSets).to.be.bignumber.equal(startingCurrentSets);
        expect(rbSetData.remainingCurrentSets).to.be.bignumber.equal(biddingParams[1]);
        expect(rbSetData.minimumBid).to.be.bignumber.equal(biddingParams[0]);
        expect(rbSetData.rebalanceState).to.be.bignumber.equal(new BigNumber(2));
        expect(rbSetData.nextSet).to.equal(nextSetToken.address);
        expect(rbSetData.liquidator).to.equal(liquidator.address);
        expect(rbSetData.orderSize).to.be.bignumber.equal(startingCurrentSets);
        expect(rbSetData.orderRemaining).to.be.bignumber.equal(ZERO);
        expect(rbSetData.totalSetsRemaining).to.be.bignumber.equal(startingCurrentSets);
        expect(rbSetData.chunkSize).to.be.bignumber.equal(startingCurrentSets);
        expect(rbSetData.chunkAuctionPeriod).to.be.bignumber.equal(chunkAuctionPeriod);
        expect(rbSetData.lastChunkAuctionEnd).to.be.bignumber.equal(ZERO);
        expect(JSON.stringify(rbSetData.nextSetInfo.components)).to.equal(JSON.stringify(set2Components));
        expect(JSON.stringify(rbSetData.nextSetInfo.units)).to.equal(JSON.stringify(set2Units));
        expect(rbSetData.nextSetInfo.naturalUnit).to.be.bignumber.equal(collateralNaturalUnit);
        expect(rbSetData.nextSetInfo.name).to.equal('Set Token');
        expect(rbSetData.nextSetInfo.symbol).to.equal('SET');
      });
    });

    describe('iterateChunkAuction', async () => {
      const chunkAuctionPeriod: BigNumber = ONE_HOUR_IN_SECONDS;

      let bidAmount: BigNumber;
      let systemTimeIncrease: number;

      let subjectLiquidator: Address;
      let subjectRebalancingSetTokenAddress: Address;

      beforeAll(async () => {
        currentSetStartingQuantity = ether(1001);
        systemTimeIncrease = ONE_HOUR_IN_SECONDS.mul(1000).toNumber();
        bidAmount = currentSetStartingQuantity;
      });

      beforeEach(async () => {
        // Issue currentSetToken
        await core.issue.sendTransactionAsync(currentSetToken.address, currentSetStartingQuantity, TX_DEFAULTS);
        await approveForTransferAsync([currentSetToken], transferProxy.address);

        // Use issued currentSetToken to issue rebalancingSetToken
        const rebalancingSetQuantityToIssue = currentSetStartingQuantity;
        await core.issue.sendTransactionAsync(rebalancingSetTokenV3.address, rebalancingSetQuantityToIssue);

        const liquidatorData = liquidatorHelper.generateTWAPLiquidatorCalldata(
          ether(10 ** 5),
          chunkAuctionPeriod,
        );
        await rebalancingSetTokenV3.startRebalance.sendTransactionAsync(
          nextSetToken.address,
          liquidatorData
        );

        await rebalanceAuctionModule.bidAndWithdraw.sendTransactionAsync(
          rebalancingSetTokenV3.address,
          bidAmount,
          true
        );

        const block = await web3.eth.getBlock('latest');
        timeKeeper.freeze(block.timestamp * 1000 + systemTimeIncrease);
        await increaseChainTimeAsync(web3, ONE_HOUR_IN_SECONDS);

        subjectLiquidator = liquidator.address;
        subjectRebalancingSetTokenAddress = rebalancingSetTokenV3.address;
      });

      afterEach(async () => {
        timeKeeper.reset();
      });

      async function subject(): Promise<string> {
        return await rebalancingAPI.iterateChunkAuction(
          subjectLiquidator,
          subjectRebalancingSetTokenAddress,
          TX_DEFAULTS
        );
      }

      it('runs with no error and sets correct state', async () => {
        await subject();

        const twapState = await rebalancingAPI.fetchRBSetTWAPRebalanceDetailsAsync(subjectRebalancingSetTokenAddress);

        expect(twapState.remainingCurrentSets).to.be.bignumber.equal(
          currentSetStartingQuantity.sub(twapState.chunkSize)
        );
        expect(twapState.orderSize).to.be.bignumber.equal(currentSetStartingQuantity);
        expect(twapState.orderRemaining).to.be.bignumber.equal(ZERO);
        expect(twapState.totalSetsRemaining).to.be.bignumber.equal(currentSetStartingQuantity.sub(twapState.chunkSize));
      });

      describe('when the TWAP auction is finished', async () => {
        beforeAll(async () => {
          currentSetStartingQuantity = ether(999);
        });

        afterAll(async () => {
          currentSetStartingQuantity = ether(1001);
        });

        it('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `The TWAPAuction for ${subjectRebalancingSetTokenAddress} is finished. Cannot iterate to next chunk.`
          );
        });
      });

      describe('when the current chunk auction is not finished', async () => {
        beforeAll(async () => {
          bidAmount = ether(1);
        });

        afterAll(async () => {
          bidAmount = currentSetStartingQuantity;
        });

        it('throw', async () => {
          const twapState = await rebalancingAPI.fetchRBSetTWAPRebalanceDetailsAsync(subjectRebalancingSetTokenAddress);
          return expect(subject()).to.be.rejectedWith(
            `In order to iterate the chunk auction there must be less than current ${twapState.minimumBid} sets ` +
            `remaining to be rebalanced. There are currently ${twapState.remainingCurrentSets} remaining for the ` +
            `chunk auction.`
          );
        });
      });

      describe('when not enough time has elapsed between chunk auctions', async () => {
        beforeAll(async () => {
          systemTimeIncrease = 0;
        });

        afterAll(async () => {
          systemTimeIncrease = ONE_HOUR_IN_SECONDS.mul(1000).toNumber();
        });

        it('throw', async () => {
          const twapState = await rebalancingAPI.fetchRBSetTWAPRebalanceDetailsAsync(subjectRebalancingSetTokenAddress);
          const nextAvailableChunk = new BigNumber(twapState.lastChunkAuctionEnd)
                                        .add(twapState.chunkAuctionPeriod)
                                        .mul(1000);
          const nextChunkAuctionFormattedDate = moment(nextAvailableChunk.toNumber())
          .format('dddd, MMMM Do YYYY, h:mm:ss a');
          return expect(subject()).to.be.rejectedWith(
            `Attempting to iterate auction too soon. Next chunk ` +
            `available at ${nextChunkAuctionFormattedDate}`
          );
        });
      });
    });

    describe('bidWithTWAPAsync', async () => {
      const chunkAuctionPeriod: BigNumber = ONE_HOUR_IN_SECONDS;

      let subjectRebalancingSetTokenAddress: Address;
      let subjectBidQuantity: BigNumber;
      let subjectLastChunkTimestamp: BigNumber;
      let subjectAllowPartialFill: boolean;
      let subjectCaller: Address;

      beforeAll(async () => {
        currentSetStartingQuantity = ether(900);
      });

      beforeEach(async () => {
        // Issue currentSetToken
        await core.issue.sendTransactionAsync(currentSetToken.address, currentSetStartingQuantity, TX_DEFAULTS);
        await approveForTransferAsync([currentSetToken], transferProxy.address);

        // Use issued currentSetToken to issue rebalancingSetToken
        const rebalancingSetQuantityToIssue = currentSetStartingQuantity;
        await core.issue.sendTransactionAsync(rebalancingSetTokenV3.address, rebalancingSetQuantityToIssue);

        // Approve tokens to rebalancingSetCTokenBidder contract
        await approveForTransferAsync([
          usdc,
          weth,
        ], rebalancingSetCTokenBidder.address);

        subjectRebalancingSetTokenAddress = rebalancingSetTokenV3.address;
        subjectBidQuantity = currentSetStartingQuantity;
        subjectLastChunkTimestamp = ZERO;
        subjectAllowPartialFill = false;
        subjectCaller = DEFAULT_ACCOUNT;
      });

      afterEach(async () => {
        timeKeeper.reset();
      });

      async function subject(): Promise<string> {
        return await rebalancingAPI.bidWithTWAPAsync(
          subjectRebalancingSetTokenAddress,
          subjectBidQuantity,
          subjectLastChunkTimestamp,
          subjectAllowPartialFill,
          { from: subjectCaller }
        );
      }

      describe('when the Rebalancing Set Token is in Default state', async () => {
        it('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `Rebalancing token at ${subjectRebalancingSetTokenAddress} must be in Rebalance state to call` +
            ` that function.`
          );
        });
      });

      describe('when the Rebalancing Set Token is in Rebalance state', async () => {
        beforeEach(async () => {
          const liquidatorData = liquidatorHelper.generateTWAPLiquidatorCalldata(
            ether(10 ** 5),
            chunkAuctionPeriod,
          );
          await rebalancingSetTokenV3.startRebalance.sendTransactionAsync(
            nextSetToken.address,
            liquidatorData
          );
        });

        test('subtract correct amount from remainingCurrentSets', async () => {
          const [, existingRemainingCurrentSets] = await rebalancingSetTokenV3.getBiddingParameters.callAsync();

          await subject();

          const expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
          const [, newRemainingCurrentSets] = await rebalancingSetTokenV3.getBiddingParameters.callAsync();
          expect(newRemainingCurrentSets).to.be.bignumber.eql(expectedRemainingCurrentSets);
        });

        test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', async () => {
          const auction = await liquidator.auctions.callAsync(subjectRebalancingSetTokenAddress);
          const linearAuction = getLinearAuction(auction[0]);

          const combinedTokenArray = await rebalancingSetTokenV3.getCombinedTokenArray.callAsync();

          const oldSenderBalances = await getVaultBalances(
            vault,
            combinedTokenArray,
            rebalancingSetTokenV3.address
          );

          await subject();

          const { timestamp } = await web3.eth.getBlock('latest');
          const currentPrice = await liquidatorHelper.calculateCurrentPrice(
            linearAuction,
            new BigNumber(timestamp),
            ONE_HOUR_IN_SECONDS,
          );

          const expectedTokenFlows = liquidatorHelper.constructTokenFlow(
            linearAuction,
            subjectBidQuantity,
            currentPrice,
          );

          const newSenderBalances = await getVaultBalances(
            vault,
            combinedTokenArray,
            rebalancingSetTokenV3.address
          );
          const expectedSenderBalances = _.map(oldSenderBalances, (balance, index) =>
            balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index])
          );
          expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
        });

        test('transfers and withdraws the correct amount of tokens to the bidder wallet', async () => {
          const auction = await liquidator.auctions.callAsync(subjectRebalancingSetTokenAddress);
          const linearAuction = getLinearAuction(auction[0]);

          const combinedTokenArray = await rebalancingSetTokenV3.getCombinedTokenArray.callAsync();

          const oldReceiverTokenBalances = await Promise.all(
            combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
          );

          const oldUnderlyingTokenBalances = await Promise.all(
            [
              usdc.address,
              dai.address,
            ].map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
          );

          // Replace cToken balance with underlying token balance
          const oldReceiverTokenUnderlyingBalances = _.map(oldReceiverTokenBalances, (balance, index) => {
            if (combinedTokenArray[index] === cUSDC.address) {
              return oldUnderlyingTokenBalances[0];
            } else if (combinedTokenArray[index] === cDAI.address) {
              return oldUnderlyingTokenBalances[1];
            } else {
              return balance;
            }
          });

          await subject();

          const { timestamp } = await web3.eth.getBlock('latest');
          const currentPrice = await liquidatorHelper.calculateCurrentPrice(
            linearAuction,
            new BigNumber(timestamp),
            ONE_HOUR_IN_SECONDS,
          );

          const expectedTokenFlows = liquidatorHelper.constructTokenFlow(
            linearAuction,
            subjectBidQuantity,
            currentPrice,
          );

          // Get current exchange rate
          const cUSDCExchangeRate = await compoundHelper.getExchangeRateCurrent(cUSDC.address);
          const cDAIExchangeRate = await compoundHelper.getExchangeRateCurrent(cDAI.address);
          // Replace expected token flow arrays with cToken underlying
          const expectedTokenFlowsUnderlying = replaceFlowsWithCTokenUnderlyingAsync(
            expectedTokenFlows,
            combinedTokenArray,
            [cUSDC.address, cDAI.address],
            [usdc.address, dai.address],
            [cUSDCExchangeRate, cDAIExchangeRate],
          );

          const newReceiverTokenBalances = await Promise.all(
            combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
          );
          const newUnderlyingTokenBalances = await Promise.all(
            [
              usdc.address,
              dai.address,
            ].map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
          );
          // Replace cToken balance with underlying token balance
          const newReceiverTokenUnderlyingBalances = _.map(newReceiverTokenBalances, (balance, index) => {
            if (combinedTokenArray[index] === cUSDC.address) {
              return newUnderlyingTokenBalances[0];
            } else if (combinedTokenArray[index] === cDAI.address) {
              return newUnderlyingTokenBalances[1];
            } else {
              return balance;
            }
          });
          const expectedReceiverBalances = _.map(oldReceiverTokenUnderlyingBalances, (balance, index) =>
            balance
            .add(expectedTokenFlowsUnderlying['outflow'][index])
            .sub(expectedTokenFlowsUnderlying['inflow'][index])
          );

          expect(JSON.stringify(newReceiverTokenUnderlyingBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
        });

        describe('and the passed rebalancingSetToken is not tracked by Core', async () => {
          beforeEach(async () => {
            subjectRebalancingSetTokenAddress = ACCOUNTS[5].address;
          });

          it('throw', async () => {
            return expect(subject()).to.be.rejectedWith(
              `Contract at ${subjectRebalancingSetTokenAddress} is not a valid Set token address.`
            );
          });
        });

        describe('and the bid amount is greater than remaining current sets', async () => {
          beforeEach(async () => {
            subjectBidQuantity = ether(2000);
          });

          it('throw', async () => {
            const [, remainingCurrentSets] = await rebalancingSetTokenV3.getBiddingParameters.callAsync();

            return expect(subject()).to.be.rejectedWith(
              `The submitted bid quantity, ${subjectBidQuantity}, exceeds the remaining current sets,` +
                ` ${remainingCurrentSets}.`
            );
          });
        });

        describe('and the bid amount is not a multiple of the minimumBid', async () => {
          let minimumBid: BigNumber;

          beforeEach(async () => {
            [minimumBid] = await rebalancingSetTokenV3.getBiddingParameters.callAsync();
            subjectBidQuantity = minimumBid.mul(0.5);
          });

          test('throw', async () => {
            return expect(subject()).to.be.rejectedWith(
              `The submitted bid quantity, ${subjectBidQuantity}, must be a multiple of the minimumBid, ${minimumBid}.`
            );
          });
        });

        describe('and the identified chunk auction has expired', async () => {
          beforeEach(async () => {
            subjectLastChunkTimestamp = new BigNumber(1);
          });

          test('throw', async () => {
            return expect(subject()).to.be.rejectedWith(
              `The chunk you are bidding on has expired.`
            );
          });
        });

        describe('and the caller has not approved inflow tokens for transfer', async () => {
          beforeEach(async () => {
            subjectCaller = ACCOUNTS[3].address;
          });

          test('throw', async () => {
            return expect(subject()).to.be.rejected;
          });
        });

        describe('and the caller does not have the balance to transfer', async () => {
          beforeEach(async () => {
            subjectCaller = ACCOUNTS[3].address;
            const approvalToken: ERC20DetailedContract = await ERC20DetailedContract.at(usdc.address, web3, {});
            await approvalToken.approve.sendTransactionAsync(
              rebalancingSetCTokenBidder.address,
              UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
              { from: subjectCaller }
            );

            const approvalToken2: ERC20DetailedContract = await ERC20DetailedContract.at(dai.address, web3, {});
            await approvalToken2.approve.sendTransactionAsync(
              rebalancingSetCTokenBidder.address,
              UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
              { from: subjectCaller }
            );
          });

          test('throw', async () => {
            return expect(subject()).to.be.rejected;
          });
        });
      });
    });

    describe('getLiquidatorsAsync', async () => {
      let lastRebalanceTimestamp: BigNumber;
      let secondRBSetV3: RebalancingSetTokenV3Contract;
      let linearLiquidator: LinearAuctionLiquidatorContract;

      let subjectRebalancingSetTokenAddresses: Address[];

      beforeEach(async () => {
        linearLiquidator = await deployLinearAuctionLiquidatorContractAsync(
          web3,
          core,
          oracleWhiteList
        );
        liquidatorWhiteList.addAddress.sendTransactionAsync(linearLiquidator.address);

        const failPeriod = ONE_DAY_IN_SECONDS;
        const nextSetTokenV3 = set2;
        const { timestamp } = await web3.eth.getBlock('latest');
        lastRebalanceTimestamp = new BigNumber(timestamp);
        secondRBSetV3 = await createDefaultRebalancingSetTokenV3Async(
          web3,
          core,
          rebalancingSetTokenV3Factory.address,
          DEFAULT_ACCOUNT[0],
          linearLiquidator.address,
          DEFAULT_ACCOUNT[0],
          feeCalculator.address,
          nextSetTokenV3.address,
          failPeriod,
          lastRebalanceTimestamp,
        );

        subjectRebalancingSetTokenAddresses = [rebalancingSetTokenV3.address, secondRBSetV3.address];
      });

      async function subject(): Promise<Address[]> {
        return await rebalancingAPI.getLiquidatorsAsync(subjectRebalancingSetTokenAddresses);
      }

      it('fetches the correct liquidators', async () => {
        const liquidators = await subject();

        const expectedLiquidators = [liquidator.address, linearLiquidator.address];
        expect(JSON.stringify(liquidators)).to.equal(JSON.stringify(expectedLiquidators));
      });
    });

    describe('getRebalanceCompleteStateAsync', async () => {
      let lastRebalanceTimestamp: BigNumber;
      let secondRBSetV3: RebalancingSetTokenV3Contract;

      let subjectRebalancingSetTokenAddresses: Address[];

      beforeEach(async () => {
        const failPeriod = ONE_DAY_IN_SECONDS;
        const nextSetTokenV3 = set2;
        const { timestamp } = await web3.eth.getBlock('latest');
        lastRebalanceTimestamp = new BigNumber(timestamp);
        secondRBSetV3 = await createDefaultRebalancingSetTokenV3Async(
          web3,
          core,
          rebalancingSetTokenV3Factory.address,
          DEFAULT_ACCOUNT[0],
          liquidator.address,
          DEFAULT_ACCOUNT[0],
          feeCalculator.address,
          nextSetTokenV3.address,
          failPeriod,
          lastRebalanceTimestamp,
        );

        subjectRebalancingSetTokenAddresses = [rebalancingSetTokenV3.address, secondRBSetV3.address];
      });

      async function subject(): Promise<RebalancingSetStatus[]> {
        return await rebalancingAPI.getRebalanceCompleteStateAsync(subjectRebalancingSetTokenAddresses);
      }

      it('fetches the correct statuses', async () => {
        const statuses: any[] = await subject();

        expect(statuses[0].collateralSet).to.equal(set1.address);
        expect(statuses[1].collateralSet).to.equal(set2.address);
        expect(statuses[0].state).to.be.bignumber.equal(ZERO);
        expect(statuses[1].state).to.be.bignumber.equal(ZERO);
      });
    });
  });
});
