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
import Web3 from 'web3';
import { Web3Utils } from 'set-protocol-utils';
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

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import {
  ERC20Wrapper,
  RebalancingAuctionModuleWrapper,
  RebalancingSetTokenWrapper
} from '@src/wrappers';
import {
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
} from '@src/constants';
import {
  addPriceCurveToCoreAsync,
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  constructInflowOutflowArraysAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployConstantAuctionPriceCurveAsync,
  deploySetTokensAsync,
  getVaultBalances,
  transitionToRebalanceAsync,
  transitionToDrawdownAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether,
} from '@src/util';
import { Address } from '@src/types/common';

const Core = require('set-protocol-contracts/dist/artifacts/ts/Core').Core;

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('RebalancingAuctionModuleWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;
  let whitelist: WhiteListContract;

  let erc20Wrapper: ERC20Wrapper;
  let rebalancingAuctionModuleWrapper: RebalancingAuctionModuleWrapper;
  let rebalancingSetTokenWrapper: RebalancingSetTokenWrapper;

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
      transferProxy,
      vault,
      setTokenFactory,
      rebalancingSetTokenFactory,
      rebalanceAuctionModule,
      whitelist,
    ] = await deployBaseContracts(web3);

    erc20Wrapper = new ERC20Wrapper(web3);

    rebalancingAuctionModuleWrapper = new RebalancingAuctionModuleWrapper(
      web3,
      rebalanceAuctionModule.address,
    );

    rebalancingSetTokenWrapper = new RebalancingSetTokenWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('bidPlacedEvent', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;

    let earlyTxnHash: string;
    let earlyBlockNumber: number;

    let bidQuantity: BigNumber;
    let allowPartialFill: boolean;
    let bidderAccount: Address;
    let bid1TxnHash: string;
    let bid2TxnHash: string;

    let subjectFromBlock: number;
    let subjectToBlock: any;
    let subjectRebalancingSetToken: Address;

    beforeEach(async () => {
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

      // Issue currentSetToken
      earlyTxnHash = await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

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

      const lastBidTransaction = await web3.eth.getTransaction(bid2TxnHash);
      const bidBlockNumber = lastBidTransaction['blockNumber'];

      subjectFromBlock = earlyBlockNumber;
      subjectToBlock = bidBlockNumber;
      subjectRebalancingSetToken = undefined;
    });

    async function subject(): Promise<any> {
      return await rebalancingAuctionModuleWrapper.bidPlacedEvent(
        subjectFromBlock,
        subjectToBlock,
        subjectRebalancingSetToken,
      );
    }

    test('retrieves the right event logs length', async () => {
      const events = await subject();

      expect(events.length).to.equal(2);
    });

    test('retrieves the correct event properties', async () => {
      const events = await subject();

      const { transactionHash, blockNumber, address, event } = events[0];

      expect(transactionHash).to.equal(bid1TxnHash);

      const bidOneTransaction = await web3.eth.getTransaction(bid1TxnHash);
      const bidOneBlockNumber = bidOneTransaction['blockNumber'];
      expect(blockNumber).to.equal(bidOneBlockNumber);
      expect(address).to.equal(rebalanceAuctionModule.address);
      expect(event).to.equal('BidPlaced');
    });

    test('retrieves the bid event properties', async () => {
      const events = await subject();

      const { returnValues } = events[0];
      const { bidder, executionQuantity } = returnValues;
      const returnedRebalancingSetToken = returnValues['rebalancingSetToken'];

      expect(returnedRebalancingSetToken).to.equal(rebalancingSetToken.address);
      expect(bidder).to.equal(bidderAccount);
      expect(executionQuantity).to.bignumber.equal(bidQuantity);
    });

    describe('when a rebalancingSetToken filter is enabled', async () => {
      beforeEach(async () => {
        subjectRebalancingSetToken = rebalancingSetToken.address;
      });

      test('retrieves the right event logs length', async () => {
        const events = await subject();

        expect(events.length).to.equal(1);
      });
    });
  });

  describe('bid', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;

    let subjectRebalancingSetToken: Address;
    let subjectBidQuantity: BigNumber;
    let subjectAllowPartialFill: boolean;
    let subjectCaller: Address;

    beforeEach(async () => {
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

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

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

      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectBidQuantity = ether(2);
      subjectAllowPartialFill = false;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAuctionModuleWrapper.bid(
        subjectRebalancingSetToken,
        subjectBidQuantity,
        subjectAllowPartialFill,
        { from: subjectCaller },
      );
    }

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

    it('transfers the correct amount of tokens to the bidder in the Vault', async () => {
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
  });

  describe('bidAndWithdraw', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;

    let subjectRebalancingSetToken: Address;
    let subjectBidQuantity: BigNumber;
    let subjectAllowPartialFill: boolean;
    let subjectCaller: Address;

    beforeEach(async () => {
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

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

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

      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectBidQuantity = ether(2);
      subjectAllowPartialFill = false;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAuctionModuleWrapper.bidAndWithdraw(
        subjectRebalancingSetToken,
        subjectBidQuantity,
        subjectAllowPartialFill,
        { from: subjectCaller },
      );
    }

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

    it('transfers and withdraws the correct amount of tokens to the bidder wallet', async () => {
      const expectedTokenFlows = await constructInflowOutflowArraysAsync(
        rebalancingSetToken,
        subjectBidQuantity,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
      );
      const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

      const oldReceiverBalances = await Promise.all(
        combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
      );

      await subject();

      const newReceiverBalances = await Promise.all(
        combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
      );

      const expectedReceiverBalances = _.map(oldReceiverBalances, (balance, index) =>
        balance.add(expectedTokenFlows['outflow'][index]).sub(expectedTokenFlows['inflow'][index])
      );

      expect(JSON.stringify(newReceiverBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
    });
  });

  describe('redeemFromFailedRebalance', async () => {
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
      const setBidAmount = ether(1);

      await transitionToDrawdownAsync(
        web3,
        rebalancingSetToken,
        managerAddress,
        nextSetToken.address,
        auctionPriceCurveAddress,
        rebalanceAuctionModule,
        setBidAmount,
        setAuctionTimeToPivot,
        setAuctionStartPrice,
        setAuctionPivotPrice,
      );

      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<any> {
      return await rebalancingAuctionModuleWrapper.redeemFromFailedRebalance(
        subjectRebalancingSetTokenAddress,
        { from: subjectCaller }
      );
    }

    it('transfers the collateral to owner after burning the rebalancing Set', async () => {
      const returnedRebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);
      const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();
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
