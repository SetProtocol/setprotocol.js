/*
  Copyright 2019 Set Labs Inc.

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
import {
  CoreContract,
  ConstantAuctionPriceCurveContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  TransferProxyContract,
  WhiteListContract,
} from 'set-protocol-contracts';
import { Address } from 'set-protocol-utils';

import { ProtocolViewerWrapper } from '@src/wrappers';
import {
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
  ONE_DAY_IN_SECONDS,
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
} from '@src/constants';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber, ether } from '@src/util';
import {
  addPriceCurveToCoreAsync,
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployConstantAuctionPriceCurveAsync,
  deployProtocolViewerAsync,
  deploySetTokensAsync,
  getTokenBalances,
  getTokenSupplies,
  transitionToProposeAsync,
  transitionToRebalanceAsync,
} from '@test/helpers';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('ProtocolViewer', () => {
  let transferProxy: TransferProxyContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let priceCurve: ConstantAuctionPriceCurveContract;
  let whitelist: WhiteListContract;

  let currentSetToken: SetTokenContract;
  let nextSetToken: SetTokenContract;
  let rebalancingSetToken: RebalancingSetTokenContract;

  let protocolViewerWrapper: ProtocolViewerWrapper;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy, ,
      setTokenFactory,
      rebalancingSetTokenFactory, ,
      whitelist,
    ] = await deployBaseContracts(web3);

    const setTokens = await deploySetTokensAsync(
      web3,
      core,
      setTokenFactory.address,
      transferProxy.address,
      2,
    );

    currentSetToken = setTokens[0];
    nextSetToken = setTokens[1];

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

    // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
    await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
    await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

    // Deploy price curve used in auction
    priceCurve = await deployConstantAuctionPriceCurveAsync(
      web3,
      DEFAULT_AUCTION_PRICE_NUMERATOR,
      DEFAULT_AUCTION_PRICE_DENOMINATOR
    );

    addPriceCurveToCoreAsync(
      core,
      priceCurve.address
    );

    const protocolViewer = await deployProtocolViewerAsync(web3);
    protocolViewerWrapper = new ProtocolViewerWrapper(web3, protocolViewer.address);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('#batchFetchBalancesOf', async () => {
    let subjectTokenAddresses: Address[];
    let subjectOwnerAddress: Address;

    beforeEach(async () => {
      subjectTokenAddresses = [currentSetToken.address, rebalancingSetToken.address];
      subjectOwnerAddress = ACCOUNTS[0].address;
    });

    async function subject(): Promise<BigNumber[]> {
      return await protocolViewerWrapper.batchFetchBalancesOf(
        subjectTokenAddresses,
        subjectOwnerAddress
      );
    }

    test('fetches the balances of the token addresses', async () => {
      const tokenBalances = await subject();

      const expectedTokenBalances = await getTokenBalances(
        [currentSetToken, rebalancingSetToken],
        subjectOwnerAddress
      );
      expect(JSON.stringify(tokenBalances)).to.equal(JSON.stringify(expectedTokenBalances));
    });
  });

  describe('#batchFetchUsersBalances', async () => {
    let subjectTokenAddresses: Address[];
    let subjectOwnerAddresses: Address[];

    let firstOwner: Address;
    let secondOwner: Address;

    beforeEach(async () => {
      firstOwner = ACCOUNTS[0].address;
      secondOwner = ACCOUNTS[1].address;

      subjectTokenAddresses = [currentSetToken.address, rebalancingSetToken.address, nextSetToken.address];
      subjectOwnerAddresses = [firstOwner, secondOwner, firstOwner];
    });

    async function subject(): Promise<BigNumber[]> {
      return await protocolViewerWrapper.batchFetchUsersBalances(
        subjectTokenAddresses,
        subjectOwnerAddresses
      );
    }

    test('fetches the balances of the token address, user address pairs', async () => {
      const tokenBalances = await subject();

      const expectedFirstOwnerBalances = await getTokenBalances(
        [currentSetToken, rebalancingSetToken],
        firstOwner
      );
      const expectedSecondOwnerBalances = await getTokenBalances(
        [nextSetToken],
        secondOwner
      );
      const expectedTokenBalances = [
        expectedFirstOwnerBalances[0],
        expectedSecondOwnerBalances[0],
        expectedFirstOwnerBalances[1],
      ];
      expect(JSON.stringify(tokenBalances)).to.equal(JSON.stringify(expectedTokenBalances));
    });
  });

  describe('#batchFetchSupplies', async () => {
    let subjectTokenAddresses: Address[];

    beforeEach(async () => {
      subjectTokenAddresses = [currentSetToken.address, rebalancingSetToken.address];
    });

    async function subject(): Promise<BigNumber[]> {
      return await protocolViewerWrapper.batchFetchSupplies(subjectTokenAddresses);
    }

    test('fetches the supplies of the token addresses', async () => {
      const tokenSupplies = await subject();

      const expectedTokenSupplies = await getTokenSupplies([currentSetToken, rebalancingSetToken]);
      expect(JSON.stringify(tokenSupplies)).to.equal(JSON.stringify(expectedTokenSupplies));
    });
  });

  describe('#fetchRebalanceProposalStateAsync', async () => {
    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      return await protocolViewerWrapper.fetchRebalanceProposalStateAsync(subjectRebalancingSetTokenAddress);
    }

    test('fetches the proposal state of the rebalancing set', async () => {
      const rebalanceProposalState = await subject();

      const rebalancingSetState = rebalanceProposalState[0];
      expect(rebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.DEFAULT);

      const [nextSetAddress, auctionLibraryAddress] = rebalanceProposalState[1];
      expect(nextSetAddress).to.equal(NULL_ADDRESS);
      expect(auctionLibraryAddress).to.equal(NULL_ADDRESS);

      const [
        proposalStartTime,
        auctionTimeToPivot,
        auctionStartPrice,
        auctionPivotPrice,
      ] = rebalanceProposalState[2];
      expect(proposalStartTime).to.be.bignumber.equal(ZERO);
      expect(auctionTimeToPivot).to.be.bignumber.equal(ZERO);
      expect(auctionStartPrice).to.be.bignumber.equal(ZERO);
      expect(auctionPivotPrice).to.be.bignumber.equal(ZERO);
    });

    describe('when the Rebalancing Set Token is in Proposal state', async () => {
      let setAuctionPriceCurveAddress: Address;
      let setAuctionTimeToPivot: BigNumber;
      let setAuctionStartPrice: BigNumber;
      let setAuctionPivotPrice: BigNumber;
      let managerAddress: Address;

      beforeEach(async () => {
        setAuctionPriceCurveAddress = priceCurve.address;
        setAuctionTimeToPivot = new BigNumber(100000);
        setAuctionStartPrice = new BigNumber(500);
        setAuctionPivotPrice = new BigNumber(1000);
        managerAddress = ACCOUNTS[1].address;
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
        const rebalanceProposalState: any[] = await subject();

        const rebalancingSetState = rebalanceProposalState[0];
        expect(rebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.PROPOSAL);

        const [nextSetAddress, auctionLibraryAddress] = rebalanceProposalState[1];
        expect(nextSetAddress).to.equal(nextSetToken.address);
        expect(auctionLibraryAddress).to.equal(priceCurve.address);

        const [
          proposalStartTime,
          auctionTimeToPivot,
          auctionStartPrice,
          auctionPivotPrice,
        ] = rebalanceProposalState[2];
        expect(auctionTimeToPivot).to.be.bignumber.equal(setAuctionTimeToPivot);
        expect(auctionStartPrice).to.be.bignumber.equal(setAuctionStartPrice);
        expect(auctionPivotPrice).to.be.bignumber.equal(setAuctionPivotPrice);

        const proposedAt = await rebalancingSetToken.proposalStartTime.callAsync();
        expect(proposalStartTime).to.bignumber.equal(proposedAt);
      });
    });
  });

  describe('#fetchRebalanceAuctionStateAsync', async () => {
    let subjectRebalancingSetTokenAddress: Address;

    beforeEach(async () => {
      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      return await protocolViewerWrapper.fetchRebalanceAuctionStateAsync(subjectRebalancingSetTokenAddress);
    }

    test('fetches the rebalance auction state of the rebalancing set', async () => {
      const rebalanceAuctionState: any[] = await subject();

      const rebalancingSetState = rebalanceAuctionState[0];
      expect(rebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.DEFAULT);

      const [
        startingCurrentSetAmount,
        auctionStartTime,
        minimumBid,
        remainingCurrentSets,
      ] = rebalanceAuctionState[1];
      expect(startingCurrentSetAmount).to.be.bignumber.equal(ZERO);
      expect(auctionStartTime).to.be.bignumber.equal(ZERO);
      expect(minimumBid).to.be.bignumber.equal(ZERO);
      expect(remainingCurrentSets).to.be.bignumber.equal(ZERO);
    });

    describe('when the Rebalancing Set Token is in Rebalance state', async () => {
      let managerAddress: Address;

      beforeEach(async () => {
        // Issue currentSetToken
        const baseSetIssueQuantity = ether(7);
        await core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, TX_DEFAULTS);
        await approveForTransferAsync([currentSetToken], transferProxy.address);

        // Use issued currentSetToken to issue rebalancingSetToken
        const rebalancingSetQuantityToIssue = ether(7);
        await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

        const setAuctionPriceCurveAddress = priceCurve.address;
        managerAddress = ACCOUNTS[1].address;
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          nextSetToken.address,
          setAuctionPriceCurveAddress,
        );
      });

      it('returns the proper rebalance details', async () => {
        const rebalanceAuctionState: any[] = await subject();

        const rebalancingSetState = rebalanceAuctionState[0];
        expect(rebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.REBALANCE);

        const [
          startingCurrentSetAmount,
          auctionStartTime,
          minimumBid,
        ] = rebalanceAuctionState[1];

        const expectedStartingCurrentSetAmount = await rebalancingSetToken.startingCurrentSetAmount.callAsync();
        expect(startingCurrentSetAmount).to.be.bignumber.equal(expectedStartingCurrentSetAmount);

        const [expectedAuctionStartTime] = await rebalancingSetToken.getAuctionPriceParameters.callAsync();
        expect(auctionStartTime).to.be.bignumber.equal(expectedAuctionStartTime);

        const [
          expectedMinimumBid,
          expectedRemainingCurrentSets,
        ] = await rebalancingSetToken.getBiddingParameters.callAsync();
        expect(minimumBid).to.be.bignumber.equal(expectedMinimumBid);
        expect(expectedRemainingCurrentSets).to.be.bignumber.equal(expectedRemainingCurrentSets);
      });
    });
  });

  describe('#batchFetchRebalanceStateAsync', async () => {
    let subjectRebalancingSetTokenAddresses: Address[];

    let managerAddress: Address;

    beforeEach(async () => {
      // Issue currentSetToken
      const baseSetIssueQuantity = ether(7);
      await core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      const setAuctionPriceCurveAddress = priceCurve.address;
      managerAddress = ACCOUNTS[1].address;
      await transitionToRebalanceAsync(
        web3,
        rebalancingSetToken,
        managerAddress,
        nextSetToken.address,
        setAuctionPriceCurveAddress,
      );

      // Create another rebalancing set token that is in Default state
      const proposalPeriod = ONE_DAY_IN_SECONDS;
      const defaultRebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      subjectRebalancingSetTokenAddresses = [rebalancingSetToken.address, defaultRebalancingSetToken.address];
    });

    async function subject(): Promise<any> {
      return await protocolViewerWrapper.batchFetchRebalanceStateAsync(subjectRebalancingSetTokenAddresses);
    }

    test('fetches the rebalance auction state of the rebalancing set', async () => {
      const rebalanceAuctionStates: BigNumber[] = await subject();

      const firstRebalancingSetState = rebalanceAuctionStates[0];
      expect(firstRebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.REBALANCE);

      const secondRebalancingSetState = rebalanceAuctionStates[1];
      expect(secondRebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.DEFAULT);
    });
  });
});
