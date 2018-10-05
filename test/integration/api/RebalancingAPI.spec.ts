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
import * as Web3 from 'web3';
import {
  ConstantAuctionPriceCurveContract,
  CoreContract,
  DetailedERC20Contract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
} from 'set-protocol-contracts';

import { RebalancingAPI } from '@src/api';
import { RebalancingSetTokenWrapper, CoreWrapper } from '@src/wrappers';
import {
  DEFAULT_ACCOUNT,
  ONE_DAY_IN_SECONDS,
  DEFAULT_CONSTANT_AUCTION_PRICE,
  TX_DEFAULTS,
  ZERO,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
} from '@src/constants';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber, ether, Web3Utils } from '@src/util';
import { Assertions } from '@src/assertions';
import ChaiSetup from '@test/helpers/chaiSetup';
import {
  addAuthorizationAsync,
  approveForTransferAsync,
  constructInflowOutflowArraysAsync,
  createDefaultRebalancingSetTokenAsync,
  deployConstantAuctionPriceCurveAsync,
  deployCoreContract,
  deployRebalancingSetTokenFactoryContract,
  deploySetTokenAsync,
  deploySetTokensAsync,
  deploySetTokenFactoryContract,
  deployVaultContract,
  deployTransferProxyContract,
  getAuctionSetUpOutputsAsync,
  getExpectedUnitSharesAsync,
  getVaultBalances,
  increaseChainTimeAsync,
  transitionToProposeAsync,
  transitionToRebalanceAsync
} from '@test/helpers';
import { Address, Component, SetDetails } from '@src/types/common';

ChaiSetup.configure();
const { expect } = chai;
const timeKeeper = require('timekeeper');
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const moment = require('moment');

let currentSnapshotId: number;


describe('RebalancingAPI', () => {
  let nextRebalanceAvailableAtSeconds: number;

  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;

  let rebalancingSetTokenWrapper: RebalancingSetTokenWrapper;
  let rebalancingAPI: RebalancingAPI;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    transferProxy = await deployTransferProxyContract(provider);
    vault = await deployVaultContract(provider);
    core = await deployCoreContract(provider, transferProxy.address, vault.address);
    setTokenFactory = await deploySetTokenFactoryContract(provider, core);
    rebalancingSetTokenFactory = await deployRebalancingSetTokenFactoryContract(provider, core);

    await addAuthorizationAsync(vault, core.address);
    await addAuthorizationAsync(transferProxy, core.address);

    const coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);
    const assertions = new Assertions(web3, coreWrapper);

    rebalancingSetTokenWrapper = new RebalancingSetTokenWrapper(web3);
    rebalancingAPI = new RebalancingAPI(web3, assertions, coreWrapper);
  });

  afterEach(async () => {
    timeKeeper.reset();

    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('proposeAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectNextSet: Address;
    let subjectAuctionPriceCurveAddress: Address;
    let subjectCurveCoefficient: BigNumber;
    let subjectAuctionStartPrice: BigNumber;
    let subjectAuctionPriceDivisor: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      [currentSetToken, nextSetToken] = await deploySetTokensAsync(
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(provider, DEFAULT_CONSTANT_AUCTION_PRICE);

      // Fast forward to allow propose to be called
      const lastRebalancedTimestampSeconds = await rebalancingSetToken.lastRebalanceTimestamp.callAsync();
      nextRebalanceAvailableAtSeconds = lastRebalancedTimestampSeconds.toNumber() + proposalPeriod.toNumber();
      timeKeeper.freeze(nextRebalanceAvailableAtSeconds * 1000);
      increaseChainTimeAsync(proposalPeriod.add(1));

      subjectNextSet = nextSetToken.address;
      subjectAuctionPriceCurveAddress = priceCurve.address;
      subjectCurveCoefficient = new BigNumber(1);
      subjectAuctionStartPrice = new BigNumber(500);
      subjectAuctionPriceDivisor = new BigNumber(1000);
      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = managerAddress;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.proposeAsync(
        subjectRebalancingSetTokenAddress,
        subjectNextSet,
        subjectAuctionPriceCurveAddress,
        subjectCurveCoefficient,
        subjectAuctionStartPrice,
        subjectAuctionPriceDivisor,
        { from: subjectCaller }
      );
    }

    test('it fetches the rebalancing set token properties correctly', async () => {
      await subject();

      const nextSet = await rebalancingSetTokenWrapper.nextSet(subjectRebalancingSetTokenAddress);
      expect(nextSet).to.eql(subjectNextSet);

      const auctionLibrary = await rebalancingSetTokenWrapper.auctionLibrary(subjectRebalancingSetTokenAddress);
      expect(auctionLibrary).to.eql(subjectAuctionPriceCurveAddress);

      const curveCoefficient = await rebalancingSetTokenWrapper.curveCoefficient(subjectRebalancingSetTokenAddress);
      expect(curveCoefficient).to.be.bignumber.equal(subjectCurveCoefficient);

      const auctionStartPrice = await rebalancingSetTokenWrapper.auctionStartPrice(subjectRebalancingSetTokenAddress);
      expect(auctionStartPrice).to.be.bignumber.equal(subjectAuctionStartPrice);

      const auctionPriceDivisor = await rebalancingSetTokenWrapper.auctionPriceDivisor(
        subjectRebalancingSetTokenAddress
      );
      expect(auctionPriceDivisor).to.be.bignumber.equal(subjectAuctionPriceDivisor);

      const rebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);
      expect(rebalanceState).to.eql('Proposal');
    });

    describe("when the rebalance interval hasn't elapsed since the last rebalance", async () => {
      let nextRebalanceFormattedDate: string;

      beforeEach(async () => {
        const nextAvailableRebalanceMSeconds = nextRebalanceAvailableAtSeconds * 1000;
        nextRebalanceFormattedDate = moment(nextAvailableRebalanceMSeconds).format('dddd, MMMM Do YYYY, h:mm:ss a');

        timeKeeper.freeze(nextAvailableRebalanceMSeconds - 1);
      });

      it('throw', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Attempting to rebalance too soon. Rebalancing next available on ${nextRebalanceFormattedDate}`
        );
      });
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
        const setCurveCoefficient = new BigNumber(1);
        const setAuctionStartPrice = new BigNumber(500);
        const setAuctionPriceDivisor = new BigNumber(1000);
        await transitionToRebalanceAsync(
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          subjectAuctionPriceCurveAddress,
          setCurveCoefficient,
          setAuctionStartPrice,
          setAuctionPriceDivisor
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
  });

  describe('rebalanceAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;
    let priceCurve: ConstantAuctionPriceCurveContract;
    let setAuctionPriceDivisor: BigNumber;

    let nextRebalanceAvailableAtSeconds: number;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      [currentSetToken, nextSetToken] = await deploySetTokensAsync(
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Deploy price curve used in auction
      priceCurve = await deployConstantAuctionPriceCurveAsync(provider, DEFAULT_CONSTANT_AUCTION_PRICE);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.rebalanceAsync(
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
        const setNextSet = nextSetToken.address;
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setCurveCoefficient = new BigNumber(1);
        const setAuctionStartPrice = new BigNumber(500);
        setAuctionPriceDivisor = new BigNumber(1000);
        await transitionToProposeAsync(
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setCurveCoefficient,
          setAuctionStartPrice,
          setAuctionPriceDivisor
        );

        // Fast forward to allow rebalance to be called
        const proposalStartTimeSeconds = await rebalancingSetToken.proposalStartTime.callAsync();
        const fastForwardPeriod = proposalPeriod.toNumber();
        nextRebalanceAvailableAtSeconds = proposalStartTimeSeconds.toNumber() + fastForwardPeriod;
        timeKeeper.freeze(nextRebalanceAvailableAtSeconds * 1000 + 1);
        increaseChainTimeAsync(proposalPeriod.add(1));
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
          setAuctionPriceDivisor
        );

        expect(returnedMinimumBid).to.be.bignumber.equal(auctionSetUpOutputs['expectedMinimumBid']);

        expect(returnedRemainingCurrentSets).to.be.bignumber.equal(ZERO);

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

      describe('but not enough time has passed in the proposal period', async () => {
        let nextRebalanceFormattedDate: string;

        beforeEach(async () => {
          const nextAvailableRebalanceMSeconds = nextRebalanceAvailableAtSeconds * 1000;
          nextRebalanceFormattedDate = moment(nextAvailableRebalanceMSeconds).format('dddd, MMMM Do YYYY, h:mm:ss a');

          // Rewind time to create error
          const proposalStartTimeSeconds = await rebalancingSetToken.proposalStartTime.callAsync();
          const proposalStartTimeMSeconds = 1000 * proposalStartTimeSeconds.toNumber();
          timeKeeper.freeze(proposalStartTimeMSeconds);
        });

        it('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
            `Attempting to rebalance too soon. Rebalancing next available on ${nextRebalanceFormattedDate}`
          );
        });
      });
    });

    describe('when the Rebalancing Set Token is in Default state', async () => {
      beforeEach(async () => {
        const setNextSet = nextSetToken.address;
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setCurveCoefficient = new BigNumber(1);
        const setAuctionStartPrice = new BigNumber(500);
        setAuctionPriceDivisor = new BigNumber(1000);
        await transitionToRebalanceAsync(
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setCurveCoefficient,
          setAuctionStartPrice,
          setAuctionPriceDivisor
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
    let priceCurve: ConstantAuctionPriceCurveContract;
    let setAuctionPriceDivisor: BigNumber;

    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      [currentSetToken, nextSetToken] = await deploySetTokensAsync(
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
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

      // Deploy price curve used in auction
      priceCurve = await deployConstantAuctionPriceCurveAsync(provider, DEFAULT_CONSTANT_AUCTION_PRICE);

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
        const setNextSet = nextSetToken.address;
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setCurveCoefficient = new BigNumber(1);
        const setAuctionStartPrice = new BigNumber(500);
        setAuctionPriceDivisor = new BigNumber(1000);
        await transitionToProposeAsync(
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setCurveCoefficient,
          setAuctionStartPrice,
          setAuctionPriceDivisor
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
        const setNextSet = nextSetToken.address;
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setCurveCoefficient = new BigNumber(1);
        const setAuctionStartPrice = new BigNumber(500);
        setAuctionPriceDivisor = new BigNumber(1000);
        await transitionToRebalanceAsync(
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setCurveCoefficient,
          setAuctionStartPrice,
          setAuctionPriceDivisor
        );

        await core.bid.sendTransactionAsync(
          rebalancingSetToken.address,
          rebalancingSetQuantityToIssue
        );
      });

      test('it fetches the set token properties correctly', async () => {
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
        const setNextSet = nextSetToken.address;
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setCurveCoefficient = new BigNumber(1);
        const setAuctionStartPrice = new BigNumber(500);
        setAuctionPriceDivisor = new BigNumber(1000);
        await transitionToRebalanceAsync(
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setCurveCoefficient,
          setAuctionStartPrice,
          setAuctionPriceDivisor
        );
      });
      it('throw', async () => {
        const minimumBid = await rebalancingSetToken.minimumBid.callAsync();
        const remainingCurrentSets = await rebalancingSetToken.remainingCurrentSets.callAsync();

        return expect(subject()).to.be.rejectedWith(
          `In order to settle rebalance there must be less than current ${minimumBid} sets remaining ` +
            `to be rebalanced. There are currently ${remainingCurrentSets} remaining for rebalance.`
        );
      });
    });
  });

  describe('bidAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let proposalPeriod: BigNumber;
    let managerAddress: Address;
    let priceCurve: ConstantAuctionPriceCurveContract;
    let setAuctionPriceDivisor: BigNumber;

    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectBidQuantity: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      [currentSetToken, nextSetToken] = await deploySetTokensAsync(
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
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

      // Deploy price curve used in auction
      priceCurve = await deployConstantAuctionPriceCurveAsync(provider, DEFAULT_CONSTANT_AUCTION_PRICE);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectBidQuantity = rebalancingSetQuantityToIssue;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAPI.bidAsync(
        subjectRebalancingSetTokenAddress,
        subjectBidQuantity,
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
        const setNextSet = nextSetToken.address;
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setCurveCoefficient = new BigNumber(1);
        const setAuctionStartPrice = new BigNumber(500);
        setAuctionPriceDivisor = new BigNumber(1000);
        await transitionToProposeAsync(
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setCurveCoefficient,
          setAuctionStartPrice,
          setAuctionPriceDivisor
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
        const setNextSet = nextSetToken.address;
        const setAuctionPriceCurveAddress = priceCurve.address;
        const setCurveCoefficient = new BigNumber(1);
        const setAuctionStartPrice = new BigNumber(500);
        setAuctionPriceDivisor = new BigNumber(1000);
        await transitionToRebalanceAsync(
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
          setCurveCoefficient,
          setAuctionStartPrice,
          setAuctionPriceDivisor
        );
      });

      test('subtract correct amount from remainingCurrentSets', async () => {
        const existingRemainingCurrentSets = await rebalancingSetToken.remainingCurrentSets.callAsync();

        await subject();

        const expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
        const newRemainingCurrentSets = await rebalancingSetToken.remainingCurrentSets.callAsync();
        expect(newRemainingCurrentSets).to.eql(expectedRemainingCurrentSets);
      });

      test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', async () => {
        const expectedTokenFlows = await constructInflowOutflowArraysAsync(
          rebalancingSetToken,
          subjectBidQuantity,
          DEFAULT_CONSTANT_AUCTION_PRICE
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
          DEFAULT_CONSTANT_AUCTION_PRICE
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

      describe('and the bid amount is greater than remaining current sets', async () => {
        beforeEach(async () => {
          subjectBidQuantity = ether(10);
        });

        it('throw', async () => {
          const remainingCurrentSets = await rebalancingSetToken.remainingCurrentSets.callAsync();

          return expect(subject()).to.be.rejectedWith(
            `The submitted bid quantity, ${subjectBidQuantity}, exceeds the remaining current sets,` +
              ` ${remainingCurrentSets}.`
          );
        });
      });

      describe('and the bid amount is not a multiple of the minimumBid', async () => {
        let minimumBid: BigNumber;

        beforeEach(async () => {
          minimumBid = await rebalancingSetToken.minimumBid.callAsync();
          subjectBidQuantity = minimumBid.mul(1.5);
        });

        test('throw', async () => {
          const remainingCurrentSets = await rebalancingSetToken.remainingCurrentSets.callAsync();

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
          const [inflowArray, outflowArray] = await rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity);
          const components = await rebalancingSetToken.getCombinedTokenArray.callAsync();

          return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has allowance of 0

        when required allowance is ${inflowArray[2]} at token

        address: ${components[2]} for spender: ${transferProxy.address}.
      `
          );
        });
      });

      describe('and the caller does not have the balance to transfer', async () => {
        beforeEach(async () => {
          subjectCaller = ACCOUNTS[3].address;
          const components = await rebalancingSetToken.getCombinedTokenArray.callAsync();
          const approvalToken: DetailedERC20Contract = await DetailedERC20Contract.at(components[2], web3, {});
          await approvalToken.approve.sendTransactionAsync(
            transferProxy.address,
            UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
            { from: subjectCaller }
          );
        });

        test('throw', async () => {
          const [inflowArray, outflowArray] = await rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity);
          const components = await rebalancingSetToken.getCombinedTokenArray.callAsync();

          return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has balance of 0

        when required balance is ${inflowArray[2]} at token address ${components[2]}.
      `
          );
        });
      });
    });
  });
});
