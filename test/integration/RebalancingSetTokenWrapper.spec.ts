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
import Web3 from 'web3';
import {
  CoreContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  TransferProxyContract,
  VaultContract,
  WhiteListContract,
} from 'set-protocol-contracts';
import { Web3Utils } from 'set-protocol-utils';

import { RebalancingSetTokenWrapper } from '@src/wrappers';
import {
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
  DEFAULT_UNIT_SHARES,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
} from '@src/constants';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber } from '@src/util';
import { Address } from '@src/types/common';
import { ether } from '@src/util/units';
import {
  addPriceCurveToCoreAsync,
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  constructInflowOutflowArraysAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployConstantAuctionPriceCurveAsync,
  deploySetTokensAsync,
  getAuctionSetUpOutputsAsync,
  getExpectedUnitSharesAsync,
  increaseChainTimeAsync,
  transitionToProposeAsync,
  transitionToRebalanceAsync,
} from '@test/helpers';
import { TokenFlows } from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;

describe('SetTokenWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;
  let whitelist: WhiteListContract;

  let rebalancingSetTokenWrapper: RebalancingSetTokenWrapper;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy,
      vault,
      setTokenFactory,
      rebalancingSetTokenFactory,
      rebalanceAuctionModule, ,
      whitelist,
    ] = await deployBaseContracts(web3);

    rebalancingSetTokenWrapper = new RebalancingSetTokenWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('Default state variables: manager, rebalanceState, currentSet, unitShares,\
  lastRebalanceTimestamp, proposalPeriod, rebalanceInterval', async () => {
    let currentSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let managerAddress: Address;
    let rebalanceTimestamp: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        2,
      );

      currentSetToken = setTokens[0];

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

      const lastBlock = await web3.eth.getBlock('latest');
      rebalanceTimestamp = new BigNumber(lastBlock.timestamp);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      const manager = await rebalancingSetTokenWrapper.manager(subjectRebalancingSetTokenAddress);
      const rebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);
      const currentSet = await rebalancingSetTokenWrapper.currentSet(subjectRebalancingSetTokenAddress);
      const unitShares = await rebalancingSetTokenWrapper.unitShares(subjectRebalancingSetTokenAddress);
      const lastRebalanceTimestamp = await rebalancingSetTokenWrapper.lastRebalanceTimestamp(
        subjectRebalancingSetTokenAddress
      );
      const proposalPeriod = await rebalancingSetTokenWrapper.proposalPeriod(subjectRebalancingSetTokenAddress);
      const rebalanceInterval = await rebalancingSetTokenWrapper.rebalanceInterval(subjectRebalancingSetTokenAddress);

      return {
        manager,
        rebalanceState,
        currentSet,
        unitShares,
        lastRebalanceTimestamp,
        proposalPeriod,
        rebalanceInterval,
      };
    }

    test('it fetches the set token properties correctly', async () => {
      const {
        manager,
        rebalanceState,
        currentSet,
        unitShares,
        lastRebalanceTimestamp,
        proposalPeriod,
        rebalanceInterval,
      } = await subject();

      expect(manager).to.eql(managerAddress);

      expect(rebalanceState).to.eql('Default');

      expect(currentSet).to.eql(currentSetToken.address);

      expect(unitShares).to.be.bignumber.equal(DEFAULT_UNIT_SHARES);

      expect(lastRebalanceTimestamp).to.be.bignumber.equal(rebalanceTimestamp);

      expect(proposalPeriod).to.be.bignumber.equal(ONE_DAY_IN_SECONDS);

      expect(rebalanceInterval).to.be.bignumber.equal(ONE_DAY_IN_SECONDS);
    });
  });

  describe('Proposal state variables: proposalStartTime, nextSet, auctionLibrary,\
  auctionPriceDivisor, auctionStartPrice, curveCoefficient', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let managerAddress: Address;

    let auctionPriceCurveAddress: Address;
    let setAuctionTimeToPivot: BigNumber;
    let setAuctionStartPrice: BigNumber;
    let setAuctionPivotPrice: BigNumber;
    let proposalStartTimestamp: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

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

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(
        web3,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
        DEFAULT_AUCTION_PRICE_DENOMINATOR
      );

      addPriceCurveToCoreAsync(
        core,
        priceCurve.address
      );

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

      // Transition to proposal state
      auctionPriceCurveAddress = priceCurve.address;
      setAuctionTimeToPivot = new BigNumber(100000);
      setAuctionStartPrice = new BigNumber(500);
      setAuctionPivotPrice = new BigNumber(1000);
      await transitionToProposeAsync(
        web3,
        rebalancingSetToken,
        managerAddress,
        nextSetToken.address,
        auctionPriceCurveAddress,
        setAuctionTimeToPivot,
        setAuctionStartPrice,
        setAuctionPivotPrice,
      );

      const lastBlock = await web3.eth.getBlock('latest');
      proposalStartTimestamp = new BigNumber(lastBlock.timestamp);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      const proposalStartTime = await rebalancingSetTokenWrapper.proposalStartTime(subjectRebalancingSetTokenAddress);
      const nextSet = await rebalancingSetTokenWrapper.nextSet(subjectRebalancingSetTokenAddress);
      const auctionLibrary = await rebalancingSetTokenWrapper.auctionLibrary(subjectRebalancingSetTokenAddress);
      const auctionParameters = await rebalancingSetTokenWrapper.auctionParameters(subjectRebalancingSetTokenAddress);
      const rebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);

      return { proposalStartTime,
        nextSet,
        auctionLibrary,
        auctionParameters,
        rebalanceState,
      };
    }

    test('it fetches the set token properties correctly', async () => {
      const {
        proposalStartTime,
        nextSet,
        auctionLibrary,
        auctionParameters,
        rebalanceState,
      } = await subject();

      expect(proposalStartTime).to.be.bignumber.equal(proposalStartTimestamp);

      expect(nextSet).to.eql(nextSetToken.address);

      expect(auctionLibrary).to.eql(auctionPriceCurveAddress);

      expect(auctionParameters[1]).to.be.bignumber.equal(setAuctionTimeToPivot);

      expect(auctionParameters[2]).to.be.bignumber.equal(setAuctionStartPrice);

      expect(auctionParameters[3]).to.be.bignumber.equal(setAuctionPivotPrice);

      expect(rebalanceState).to.eql('Proposal');
    });
  });

  describe('Rebalance state variables: auctionStartTime, minimumBid, remainingCurrentSets,\
  combinedTokenArray, combinedCurrentUnits, combinedNextSetUnits', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let managerAddress: Address;

    let setAuctionStartTimestamp: BigNumber;
    let setAuctionTimeToPivot: BigNumber;
    let setAuctionStartPrice: BigNumber;
    let setAuctionPivotPrice: BigNumber;
    let setStartingCurrentSetAmount: BigNumber;
    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

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

      // Issue currentSetToken
      const baseSetIssueQuantity = ether(7);
      await core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(
        web3,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
        DEFAULT_AUCTION_PRICE_DENOMINATOR
      );

      addPriceCurveToCoreAsync(
        core,
        priceCurve.address
      );

      // Transition to proposal state
      setAuctionTimeToPivot = new BigNumber(100000);
      setAuctionStartPrice = new BigNumber(500);
      setAuctionPivotPrice = new BigNumber(1000);
      await transitionToRebalanceAsync(
        web3,
        rebalancingSetToken,
        managerAddress,
        nextSetToken.address,
        priceCurve.address,
        setAuctionTimeToPivot,
        setAuctionStartPrice,
        setAuctionPivotPrice
      );

      setStartingCurrentSetAmount = baseSetIssueQuantity;

      const lastBlock = await web3.eth.getBlock('latest');
      setAuctionStartTimestamp = new BigNumber(lastBlock.timestamp);

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      const minimumBid = await rebalancingSetTokenWrapper.minimumBid(subjectRebalancingSetTokenAddress);
      const remainingCurrentSets = await rebalancingSetTokenWrapper.remainingCurrentSets(
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
      const rebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);

      return {
        rebalanceState,
        minimumBid,
        remainingCurrentSets,
        combinedTokenArray,
        combinedCurrentUnits,
        combinedNextSetUnits,
      };
    }

    test('it fetches the set token properties correctly', async () => {
      const {
        rebalanceState,
        minimumBid,
        remainingCurrentSets,
        combinedTokenArray,
        combinedCurrentUnits,
        combinedNextSetUnits,
      } = await subject();

      const auctionSetUpOutputs = await getAuctionSetUpOutputsAsync(
        rebalancingSetToken,
        currentSetToken,
        nextSetToken,
        DEFAULT_AUCTION_PRICE_DENOMINATOR,
      );

      expect(minimumBid).to.be.bignumber.equal(auctionSetUpOutputs['expectedMinimumBid']);

      expect(remainingCurrentSets).to.be.bignumber.equal(rebalancingSetQuantityToIssue);

      const returnedCombinedTokenArray = JSON.stringify(combinedTokenArray);
      const expectedCombinedTokenArray = JSON.stringify(auctionSetUpOutputs['expectedCombinedTokenArray']);
      expect(returnedCombinedTokenArray).to.equal(expectedCombinedTokenArray);

      const returnedCombinedCurrentUnits = JSON.stringify(combinedCurrentUnits);
      const expectedCombinedCurrentUnits = JSON.stringify(auctionSetUpOutputs['expectedCombinedCurrentUnits']);
      expect(returnedCombinedCurrentUnits).to.equal(expectedCombinedCurrentUnits);

      const returnedCombinedNextSetUnits = JSON.stringify(combinedNextSetUnits);
      const expectedCombinedNextSetUnits = JSON.stringify(auctionSetUpOutputs['expectedCombinedNextUnits']);
      expect(returnedCombinedNextSetUnits).to.equal(expectedCombinedNextSetUnits);

      expect(rebalanceState).to.eql('Rebalance');
    });

    it('fetches the correct auctionStartTime', async () => {
      const auctionStartTime = await rebalancingSetTokenWrapper.auctionStartTime(subjectRebalancingSetTokenAddress);
      expect(auctionStartTime).to.be.bignumber.equal(setAuctionStartTimestamp);
    });

    it('fetches the correct auctionTimeToPivot', async () => {
      const auctionTimeToPivot = await rebalancingSetTokenWrapper.auctionTimeToPivot(subjectRebalancingSetTokenAddress);
      expect(auctionTimeToPivot).to.be.bignumber.equal(setAuctionTimeToPivot);
    });

    it('fetches the correct auctionStartPrice', async () => {
      const auctionStartPrice = await rebalancingSetTokenWrapper.auctionStartPrice(subjectRebalancingSetTokenAddress);
      expect(auctionStartPrice).to.be.bignumber.equal(setAuctionStartPrice);
    });

    it('fetches the correct startingCurrentSetAmount', async () => {
      const startingCurrentSetAmount = await rebalancingSetTokenWrapper.startingCurrentSetAmount(
        subjectRebalancingSetTokenAddress
      );
      expect(startingCurrentSetAmount).to.be.bignumber.equal(setStartingCurrentSetAmount);
    });

    it('fetches the correct auctionPivotPrice', async () => {
      const auctionPivotPrice = await rebalancingSetTokenWrapper.auctionPivotPrice(subjectRebalancingSetTokenAddress);
      expect(auctionPivotPrice).to.be.bignumber.equal(setAuctionPivotPrice);
    });
  });

  describe('getBidPrice', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let managerAddress: Address;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectBidQuantity: BigNumber;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

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

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(
        web3,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
        DEFAULT_AUCTION_PRICE_DENOMINATOR
      );

      addPriceCurveToCoreAsync(
        core,
        priceCurve.address
      );

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

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectBidQuantity = ether(2);
    });

    async function subject(): Promise<TokenFlows> {
      return await rebalancingSetTokenWrapper.getBidPrice(
        subjectRebalancingSetTokenAddress,
        subjectBidQuantity
      );
    }

    test('it fetches the correct token flow arrays', async () => {
      const returnedTokenFlowArrays = await subject();

      const expectedTokenFlowArrays = await constructInflowOutflowArraysAsync(
        rebalancingSetToken,
        subjectBidQuantity,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
      );

      const returnedInflowArray = JSON.stringify(returnedTokenFlowArrays['inflow']);
      const expectedInflowArray = JSON.stringify(expectedTokenFlowArrays['inflow']);
      expect(returnedInflowArray).to.eql(expectedInflowArray);

      const returnedOutflowArray = JSON.stringify(returnedTokenFlowArrays['outflow']);
      const expectedOutflowArray = JSON.stringify(expectedTokenFlowArrays['outflow']);
      expect(returnedOutflowArray).to.eql(expectedOutflowArray);
    });
  });

  describe('propose', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let managerAddress: Address;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectNextSet: Address;
    let subjectAuctionPriceCurveAddress: Address;
    let subjectAuctionTimeToPivot: BigNumber;
    let subjectAuctionStartPrice: BigNumber;
    let subjectAuctionPivotPrice: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

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

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(
        web3,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
        DEFAULT_AUCTION_PRICE_DENOMINATOR
      );

      addPriceCurveToCoreAsync(
        core,
        priceCurve.address
      );

      // Fast forward to allow propose to be called
      increaseChainTimeAsync(web3, proposalPeriod.add(1));

      subjectNextSet = nextSetToken.address;
      subjectAuctionPriceCurveAddress = priceCurve.address;
      subjectAuctionTimeToPivot = new BigNumber(100000);
      subjectAuctionStartPrice = new BigNumber(500);
      subjectAuctionPivotPrice = new BigNumber(1000);
      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = managerAddress;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetTokenWrapper.propose(
        subjectRebalancingSetTokenAddress,
        subjectNextSet,
        subjectAuctionPriceCurveAddress,
        subjectAuctionTimeToPivot,
        subjectAuctionStartPrice,
        subjectAuctionPivotPrice,
        { from: subjectCaller }
      );
    }

    test('it sets the rebalancing set token properties correctly', async () => {
      await subject();

      const nextSet = await rebalancingSetTokenWrapper.nextSet(subjectRebalancingSetTokenAddress);
      const auctionLibrary = await rebalancingSetTokenWrapper.auctionLibrary(subjectRebalancingSetTokenAddress);
      const auctionParameters = await rebalancingSetTokenWrapper.auctionParameters(subjectRebalancingSetTokenAddress);
      const rebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);

      expect(nextSet).to.eql(subjectNextSet);

      expect(auctionLibrary).to.eql(subjectAuctionPriceCurveAddress);

      expect(auctionParameters[1]).to.be.bignumber.equal(subjectAuctionTimeToPivot);

      expect(auctionParameters[2]).to.be.bignumber.equal(subjectAuctionStartPrice);

      expect(auctionParameters[3]).to.be.bignumber.equal(subjectAuctionPivotPrice);

      expect(rebalanceState).to.eql('Proposal');
    });
  });

  describe('startRebalance', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

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
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(7), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(
        web3,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
        DEFAULT_AUCTION_PRICE_DENOMINATOR
      );

      addPriceCurveToCoreAsync(
        core,
        priceCurve.address
      );

      // Transition to proposal state
      const auctionPriceCurveAddress = priceCurve.address;
      const setAuctionTimeToPivot = new BigNumber(100000);
      const setAuctionStartPrice = new BigNumber(500);
      const setAuctionPivotPrice = new BigNumber(1000);
      await transitionToProposeAsync(
        web3,
        rebalancingSetToken,
        managerAddress,
        nextSetToken.address,
        auctionPriceCurveAddress,
        setAuctionTimeToPivot,
        setAuctionStartPrice,
        setAuctionPivotPrice
      );

      // Fast forward to allow propose to be called
      increaseChainTimeAsync(web3, proposalPeriod.add(1));

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = managerAddress;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetTokenWrapper.startRebalance(
        subjectRebalancingSetTokenAddress,
        { from: subjectCaller }
      );
    }

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
      const returnedRebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);

      const auctionSetUpOutputs = await getAuctionSetUpOutputsAsync(
        rebalancingSetToken,
        currentSetToken,
        nextSetToken,
        DEFAULT_AUCTION_PRICE_DENOMINATOR,
      );

      expect(returnedMinimumBid).to.be.bignumber.equal(auctionSetUpOutputs['expectedMinimumBid']);

      expect(returnedRemainingCurrentSets).to.be.bignumber.equal(rebalancingSetQuantityToIssue);

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
  });

  describe('settleRebalance', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

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
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(7), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(
        web3,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
        DEFAULT_AUCTION_PRICE_DENOMINATOR
      );

      addPriceCurveToCoreAsync(
        core,
        priceCurve.address
      );

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
        setAuctionPivotPrice
      );

      // Bid to rebalance the outstanding amount of currentSetToken
      await rebalanceAuctionModule.bid.sendTransactionAsync(
        rebalancingSetToken.address,
        rebalancingSetQuantityToIssue
      );

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = managerAddress;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetTokenWrapper.settleRebalance(
        subjectRebalancingSetTokenAddress,
        { from: subjectCaller }
      );
    }

    test('it fetches the set token properties correctly', async () => {
      const expectedUnitShares = await getExpectedUnitSharesAsync(
        rebalancingSetToken,
        nextSetToken,
        vault
      );

      await subject();

      const lastBlock = await web3.eth.getBlock('latest');
      const auctionEndTimestamp = new BigNumber(lastBlock.timestamp);

      const returnedRebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);
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

  describe('setManager', async () => {
    let currentSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectNewManager: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 1;
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      currentSetToken = setTokens[0];

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

      subjectNewManager = ACCOUNTS[2].address;
      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = managerAddress;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetTokenWrapper.setManager(
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
  });

  describe('endFailedAuction', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectCaller: Address;

    let pivotTime: BigNumber;

    beforeEach(async () => {
      const setTokensToDeploy = 2;
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

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
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(7), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(
        web3,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
        DEFAULT_AUCTION_PRICE_DENOMINATOR
      );

      addPriceCurveToCoreAsync(
        core,
        priceCurve.address
      );

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
        setAuctionPivotPrice
      );

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = managerAddress;
      pivotTime = setAuctionTimeToPivot;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetTokenWrapper.endFailedAuction(
        subjectRebalancingSetTokenAddress,
        { from: subjectCaller }
      );
    }

    test('it returns an auction to Default correctly if no bids and past the pivot time', async () => {
      const expectedUnitShares = await getExpectedUnitSharesAsync(
        rebalancingSetToken,
        nextSetToken,
        vault
      );

      // Fast forward to 1 second after pivot time
      await increaseChainTimeAsync(web3, pivotTime.add(1));

      await subject();

      const lastBlock = await web3.eth.getBlock('latest');
      const auctionEndTimestamp = new BigNumber(lastBlock.timestamp);

      const returnedRebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);
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

    test('it sets an auction to Drawdown correctly if there is a bid and past the pivot time', async () => {
      const expectedUnitShares = await getExpectedUnitSharesAsync(
        rebalancingSetToken,
        nextSetToken,
        vault
      );

      // Fast forward to 1 second after pivot time
      await increaseChainTimeAsync(web3, pivotTime.add(1));

      // Bid entire minus minimum amount
      const returnedMinimumBid = await rebalancingSetTokenWrapper.minimumBid(subjectRebalancingSetTokenAddress);
      await rebalanceAuctionModule.bid.sendTransactionAsync(
        rebalancingSetToken.address,
        rebalancingSetQuantityToIssue.sub(returnedMinimumBid)
      );

      await subject();

      const lastBlock = await web3.eth.getBlock('latest');
      const auctionEndTimestamp = new BigNumber(lastBlock.timestamp);

      const returnedRebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);
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

  describe('tokenIsComponent', async () => {
    let currentSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectComponent: Address;

    beforeEach(async () => {
      const setTokensToDeploy = 1;
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        setTokensToDeploy,
      );

      currentSetToken = setTokens[0];

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

      subjectComponent = currentSetToken.address;
      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetTokenWrapper.tokenIsComponent(
        subjectRebalancingSetTokenAddress,
        subjectComponent,
      );
    }

    test('it returns true', async () => {
      const isComponent = await subject();

      expect(isComponent).to.be.true;
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      beforeEach(async () => {
        subjectComponent = ACCOUNTS[3].address;
      });

      it('returns the proper rebalancing details', async () => {
      const isComponent = await subject();

      expect(isComponent).to.be.false;
      });
    });
  });
});
