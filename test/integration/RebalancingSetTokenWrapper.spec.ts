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
import * as Web3 from 'web3';
import {
  CoreContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';
import { Address } from 'set-protocol-utils';

import { CoreWrapper, RebalancingSetTokenWrapper } from '@src/wrappers';
import {
  DEFAULT_ACCOUNT,
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
  DEFAULT_UNIT_SHARES,
  DEFAULT_REBALANCING_NATURAL_UNIT
} from '@src/constants';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber, Web3Utils } from '@src/util';
import { ether } from '@src/util/units';
import {
  addAuthorizationAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenAsync,
  deployCoreContract,
  deployRebalancingSetTokenFactoryContract,
  deploySetTokenFactoryContract,
  deploySetTokensAsync,
  deployVaultContract,
  deployTokensAsync,
  deployTransferProxyContract,
  transitionToProposeAsync,
  transitionToRebalanceAsync,
  getAuctionSetUpOutputs
} from '@test/helpers';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;

describe('SetTokenWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;

  let rebalancingSetTokenWrapper: RebalancingSetTokenWrapper;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    transferProxy = await deployTransferProxyContract(provider);
    vault = await deployVaultContract(provider);
    core = await deployCoreContract(provider, transferProxy.address, vault.address);
    setTokenFactory = await deploySetTokenFactoryContract(provider, core);
    rebalancingSetTokenFactory = await deployRebalancingSetTokenFactoryContract(provider, core);

    await addAuthorizationAsync(vault, core.address);
    await addAuthorizationAsync(transferProxy, core.address);

    rebalancingSetTokenWrapper = new RebalancingSetTokenWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('Default state variables: manager, rebalanceState, currentSet, unitShares,\
  lastRebalanceTimestamp, proposalPeriod, rebalanceInterval', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let managerAddress: Address;
    let rebalanceTimestamp: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      const setTokens = await deploySetTokensAsync(
        core,
        setTokenFactory.address,
        transferProxy.address,
        2,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      const proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      const lastBlock = await web3.eth.getBlock('latest');
      rebalanceTimestamp = lastBlock.timestamp;

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
    let setCurveCoefficient: BigNumber;
    let setAuctionStartPrice: BigNumber;
    let setAuctionPriceDivisor: BigNumber;
    let proposalStartTimestamp: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      const setTokens = await deploySetTokensAsync(
        core,
        setTokenFactory.address,
        transferProxy.address,
        2,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      const proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Transition to proposal state
      auctionPriceCurveAddress = ACCOUNTS[2].address;
      setCurveCoefficient = new BigNumber(1);
      setAuctionStartPrice = new BigNumber(500);
      setAuctionPriceDivisor = new BigNumber(1000);
      await transitionToProposeAsync(
        rebalancingSetToken,
        managerAddress,
        nextSetToken.address,
        auctionPriceCurveAddress,
        setCurveCoefficient,
        setAuctionStartPrice,
        setAuctionPriceDivisor
      );
      const lastBlock = await web3.eth.getBlock('latest');
      proposalStartTimestamp = lastBlock.timestamp;

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      const proposalStartTime = await rebalancingSetTokenWrapper.proposalStartTime(subjectRebalancingSetTokenAddress);
      const nextSet = await rebalancingSetTokenWrapper.nextSet(subjectRebalancingSetTokenAddress);
      const auctionLibrary = await rebalancingSetTokenWrapper.auctionLibrary(subjectRebalancingSetTokenAddress);
      const curveCoefficient = await rebalancingSetTokenWrapper.curveCoefficient(subjectRebalancingSetTokenAddress);
      const auctionStartPrice = await rebalancingSetTokenWrapper.auctionStartPrice(subjectRebalancingSetTokenAddress);
      const auctionPriceDivisor = await rebalancingSetTokenWrapper.auctionPriceDivisor(
        subjectRebalancingSetTokenAddress
      );
      const rebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);

      return { proposalStartTime,
        nextSet,
        auctionLibrary,
        curveCoefficient,
        auctionStartPrice,
        auctionPriceDivisor,
        rebalanceState,
      };
    }

    test('it fetches the set token properties correctly', async () => {
      const {
        proposalStartTime,
        nextSet,
        auctionLibrary,
        curveCoefficient,
        auctionStartPrice,
        auctionPriceDivisor,
        rebalanceState,
      } = await subject();

      expect(proposalStartTime).to.be.bignumber.equal(proposalStartTimestamp);
      expect(nextSet).to.eql(nextSetToken.address);
      expect(auctionLibrary).to.eql(auctionPriceCurveAddress);
      expect(curveCoefficient).to.be.bignumber.equal(setCurveCoefficient);
      expect(auctionStartPrice).to.be.bignumber.equal(setAuctionStartPrice);
      expect(auctionPriceDivisor).to.be.bignumber.equal(setAuctionPriceDivisor);
      expect(rebalanceState).to.eql('Proposal');
    });
  });

  describe('Rebalance state variables: auctionStartTime, minimumBid, remainingCurrentSets,\
  combinedTokenArray, combinedCurrentUnits, combinedNextSetUnits', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let managerAddress: Address;
    let setAuctionPriceDivisor: BigNumber;

    let auctionStartTimestamp: BigNumber;
    let rebalancingSetQuantityToIssue: BigNumber;

    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      const setTokens = await deploySetTokensAsync(
        core,
        setTokenFactory.address,
        transferProxy.address,
        2,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      const proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), {TX_DEFAULTS});
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Transition to proposal state
      const auctionPriceCurveAddress = ACCOUNTS[2].address;
      const setCurveCoefficient = new BigNumber(1);
      const setAuctionStartPrice = new BigNumber(500);
      setAuctionPriceDivisor = new BigNumber(1000);
      await transitionToRebalanceAsync(
        rebalancingSetToken,
        managerAddress,
        nextSetToken.address,
        auctionPriceCurveAddress,
        setCurveCoefficient,
        setAuctionStartPrice,
        setAuctionPriceDivisor
      );
      const lastBlock = await web3.eth.getBlock('latest');
      auctionStartTimestamp = lastBlock.timestamp;

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      const auctionStartTime = await rebalancingSetTokenWrapper.auctionStartTime(subjectRebalancingSetTokenAddress);
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
        auctionStartTime,
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
        auctionStartTime,
        rebalanceState,
        minimumBid,
        remainingCurrentSets,
        combinedTokenArray,
        combinedCurrentUnits,
        combinedNextSetUnits,
      } = await subject();

      const auctionSetUpOutputs = await getAuctionSetUpOutputs(
        rebalancingSetToken,
        currentSetToken,
        nextSetToken,
        setAuctionPriceDivisor
      );

      expect(auctionStartTime).to.be.bignumber.equal(auctionStartTimestamp);
      expect(minimumBid).to.be.bignumber.equal(auctionSetUpOutputs['expectedMinimumBid']);
      expect(remainingCurrentSets).to.be.bignumber.equal(rebalancingSetQuantityToIssue);
      expect(JSON.stringify(combinedTokenArray)).to.equal(
        JSON.stringify(auctionSetUpOutputs['expectedCombinedTokenArray'])
      );
      expect(JSON.stringify(combinedCurrentUnits)).to.equal(
        JSON.stringify(auctionSetUpOutputs['expectedCombinedCurrentUnits'])
      );
      expect(JSON.stringify(combinedNextSetUnits)).to.equal(
        JSON.stringify(auctionSetUpOutputs['expectedCombinedNextUnits'])
      );
      expect(rebalanceState).to.eql('Rebalance');
    });
  });
});
