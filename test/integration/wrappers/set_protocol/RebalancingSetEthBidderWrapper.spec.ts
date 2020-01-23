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

import * as _ from 'lodash';
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import Web3 from 'web3';
import { Web3Utils } from 'set-protocol-utils';
import { Core } from 'set-protocol-contracts';
import {
  CoreContract,
  RebalanceAuctionModuleContract,
  RebalancingSetEthBidderContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
  WhiteListContract,
  WethMockContract,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import {
  ERC20Wrapper,
  RebalancingSetEthBidderWrapper,
} from '@src/wrappers';
import {
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
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
  deployRebalancingSetEthBidderAsync,
  deployConstantAuctionPriceCurveAsync,
  deploySetTokenAsync,
  deployTokenAsync,
  deployWethMockAsync,
  getGasUsageInEth,
  getVaultBalances,
  transitionToRebalanceAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether,
} from '@src/util';
import { Address } from '@src/types/common';

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


describe('RebalancingSetEthBidderWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;
  let rebalancingSetEthBidder: RebalancingSetEthBidderContract;
  let weth: WethMockContract;
  let whitelist: WhiteListContract;

  let erc20Wrapper: ERC20Wrapper;
  let rebalancingSetEthBidderWrapper: RebalancingSetEthBidderWrapper;

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

    weth = await deployWethMockAsync(web3, NULL_ADDRESS, ZERO);

    rebalancingSetEthBidder = await deployRebalancingSetEthBidderAsync(
      web3,
      rebalanceAuctionModule,
      transferProxy,
      weth,
    );

    erc20Wrapper = new ERC20Wrapper(web3);

    rebalancingSetEthBidderWrapper = new RebalancingSetEthBidderWrapper(
      web3,
      rebalancingSetEthBidder.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('bidPlacedWithEth', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let defaultSetToken: SetTokenContract;
    let wethSetToken: SetTokenContract;

    let earlyTxnHash: string;
    let earlyBlockNumber: number;

    let defaultBaseSetComponent: StandardTokenMockContract | WethMockContract;
    let defaultBaseSetComponent2: StandardTokenMockContract | WethMockContract;
    let wethBaseSetComponent: StandardTokenMockContract | WethMockContract;
    let wethBaseSetComponent2: StandardTokenMockContract | WethMockContract;

    let bidQuantity: BigNumber;
    let allowPartialFill: boolean;
    let bidderAccount: Address;
    let bid1TxnHash: string;
    let bid2TxnHash: string;

    let subjectFromBlock: number;
    let subjectToBlock: any;
    let subjectRebalancingSetToken: Address;
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
      wethBaseSetComponent2 = await deployTokenAsync(web3);

      // Create the Set (default is 2 components)
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

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await wethSetToken.getComponents.callAsync();
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
        wethBaseSetComponent,
        wethBaseSetComponent2,
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

      const lastBidTransaction = await web3.eth.getTransaction(bid2TxnHash);
      const bidBlockNumber = lastBidTransaction['blockNumber'];

      subjectFromBlock = earlyBlockNumber;
      subjectToBlock = bidBlockNumber;
      subjectRebalancingSetToken = undefined;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetEthBidderWrapper.bidPlacedWithEthEvent(
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
      expect(address).to.equal(rebalancingSetEthBidder.address);
      expect(event).to.equal('BidPlacedWithEth');
    });

    test('retrieves the bid event properties', async () => {
      const events = await subject();

      const { returnValues } = events[0];
      const { bidder, quantity } = returnValues;
      const returnedRebalancingSetToken = returnValues['rebalancingSetToken'];

      expect(returnedRebalancingSetToken).to.equal(rebalancingSetToken.address);
      expect(bidder).to.equal(bidderAccount);
      expect(quantity).to.equal(bidQuantity.toString());
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

  describe('bidAndWithdrawWithEther', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let defaultSetToken: SetTokenContract;
    let wethSetToken: SetTokenContract;

    let defaultBaseSetComponent: StandardTokenMockContract | WethMockContract;
    let defaultBaseSetComponent2: StandardTokenMockContract | WethMockContract;
    let wethBaseSetComponent: StandardTokenMockContract | WethMockContract;
    let wethBaseSetComponent2: StandardTokenMockContract | WethMockContract;

    let wethComponentUnits: BigNumber;
    let wethBaseSetNaturalUnit: BigNumber;

    let subjectRebalancingSetToken: Address;
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
      wethBaseSetComponent2 = await deployTokenAsync(web3);

      // Create the Set (default is 2 components)
      const nextComponentAddresses = [
        wethBaseSetComponent.address, wethBaseSetComponent2.address,
      ];

      wethComponentUnits = ether(0.01);
      const nextComponentUnits = [
        wethComponentUnits, ether(0.01),
      ];

      wethBaseSetNaturalUnit = ether(0.001);
      wethSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        nextComponentAddresses,
        nextComponentUnits,
        wethBaseSetNaturalUnit,
      );
    });

    async function subject(): Promise<string> {
      return await rebalancingSetEthBidderWrapper.bidAndWithdrawWithEther(
        subjectRebalancingSetToken,
        subjectBidQuantity,
        subjectAllowPartialFill,
        { from: subjectCaller, value: subjectEthQuantity.toNumber() },
      );
    }

    describe('when WETH is an inflow in a bid', async () => {
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

        await core.issue.sendTransactionAsync(
          defaultSetToken.address,
          baseSetIssueQuantity,
          TX_DEFAULTS,
        );

        // Use issued defaultSetToken to issue rebalancingSetToken
        await approveForTransferAsync([defaultSetToken], transferProxy.address);

        const rebalancingSetTokenQuantityToIssue = ether(1);

        await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

        // Approve proposed Set's components to the whitelist;
        const [proposalComponentOne, proposalComponentTwo] = await wethSetToken.getComponents.callAsync();
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

        // Approve tokens to rebalancingSetEthBidder contract
        await approveForTransferAsync([
          wethBaseSetComponent,
          wethBaseSetComponent2,
        ], rebalancingSetEthBidder.address);

        subjectEthQuantity = baseSetIssueQuantity.mul(wethComponentUnits).div(wethBaseSetNaturalUnit);
        subjectRebalancingSetToken = rebalancingSetToken.address;
        subjectBidQuantity = ether(1);
        subjectAllowPartialFill = false;
        subjectCaller = DEFAULT_ACCOUNT;
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
    });

    describe('when WETH is an outflow in a bid', async () => {
      beforeEach(async () => {
        // Create the Rebalancing Set with WETH component
        const proposalPeriod = ONE_DAY_IN_SECONDS;
        const managerAddress = ACCOUNTS[1].address;

        rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
          web3,
          core,
          rebalancingSetTokenFactory.address,
          managerAddress,
          wethSetToken.address,
          proposalPeriod
        );

        // Approve tokens and issue wethSetToken
        const baseSetIssueQuantity = ether(1);
        const requiredWrappedEther = baseSetIssueQuantity.mul(wethComponentUnits).div(wethBaseSetNaturalUnit);
        await weth.deposit.sendTransactionAsync(
          { from: subjectCaller, value: requiredWrappedEther.toString() }
        );

        await approveForTransferAsync([
          wethBaseSetComponent,
          wethBaseSetComponent2,
        ], transferProxy.address);

        await core.issue.sendTransactionAsync(
          wethSetToken.address,
          baseSetIssueQuantity,
          TX_DEFAULTS,
        );

        // Use issued wethSetToken to issue rebalancingSetToken
        await approveForTransferAsync([wethSetToken], transferProxy.address);

        const rebalancingSetTokenQuantityToIssue = ether(1);

        await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

        // Approve proposed Set's components to the whitelist;
        const [proposalComponentOne, proposalComponentTwo] = await defaultSetToken.getComponents.callAsync();
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

        // Transition to rebalance state
        const auctionPriceCurveAddress = priceCurve.address;
        const setAuctionTimeToPivot = new BigNumber(100000);
        const setAuctionStartPrice = new BigNumber(500);
        const setAuctionPivotPrice = new BigNumber(1000);
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          defaultSetToken.address,
          auctionPriceCurveAddress,
          setAuctionTimeToPivot,
          setAuctionStartPrice,
          setAuctionPivotPrice,
        );

        // Approve tokens to rebalancingSetEthBidder contract
        await approveForTransferAsync([
          defaultBaseSetComponent,
          defaultBaseSetComponent2,
        ], rebalancingSetEthBidder.address);

        subjectEthQuantity = ZERO;
        subjectRebalancingSetToken = rebalancingSetToken.address;
        subjectBidQuantity = ether(1);
        subjectAllowPartialFill = false;
        subjectCaller = DEFAULT_ACCOUNT;
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
    });

    describe('when WETH is neither an inflow nor outflow in a bid', async () => {
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

        await core.issue.sendTransactionAsync(
          defaultSetToken.address,
          baseSetIssueQuantity,
          TX_DEFAULTS,
        );

        // Use issued defaultSetToken to issue rebalancingSetToken
        await approveForTransferAsync([defaultSetToken], transferProxy.address);

        const rebalancingSetTokenQuantityToIssue = ether(1);

        await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

        // Create new next Set with no weth component
        const defaultNextBaseSetComponent = await deployTokenAsync(web3);
        const defaultNextBaseSetComponent2 = await deployTokenAsync(web3);
        const defaultNextComponentAddresses = [
          defaultNextBaseSetComponent.address, defaultNextBaseSetComponent2.address,
        ];
        const defaultNextComponentUnits = [
          ether(0.01), ether(0.01),
        ];
        const defaultBaseSetNaturalUnit = ether(0.001);
        const defaultNextSetToken = await deploySetTokenAsync(
          web3,
          core,
          setTokenFactory.address,
          defaultNextComponentAddresses,
          defaultNextComponentUnits,
          defaultBaseSetNaturalUnit,
        );

        // Approve proposed Set's components to the whitelist;
        const [proposalComponentOne, proposalComponentTwo] = await defaultNextSetToken.getComponents.callAsync();
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

        // Transition to rebalance state
        const auctionPriceCurveAddress = priceCurve.address;
        const setAuctionTimeToPivot = new BigNumber(100000);
        const setAuctionStartPrice = new BigNumber(500);
        const setAuctionPivotPrice = new BigNumber(1000);
        await transitionToRebalanceAsync(
          web3,
          rebalancingSetToken,
          managerAddress,
          defaultNextSetToken.address,
          auctionPriceCurveAddress,
          setAuctionTimeToPivot,
          setAuctionStartPrice,
          setAuctionPivotPrice,
        );

        // Approve tokens to rebalancingSetEthBidder contract
        await approveForTransferAsync([
          defaultNextBaseSetComponent,
          defaultNextBaseSetComponent2,
        ], rebalancingSetEthBidder.address);

        subjectEthQuantity = ether(10);
        subjectRebalancingSetToken = rebalancingSetToken.address;
        subjectBidQuantity = ether(1);
        subjectAllowPartialFill = false;
        subjectCaller = DEFAULT_ACCOUNT;
      });

      test('returns the amount of ETH minus gas cost', async () => {
        const previousEthBalance: BigNumber = new BigNumber(await web3.eth.getBalance(subjectCaller));

        const txHash = await subject();

        const currentEthBalance =  await web3.eth.getBalance(subjectCaller);

        const totalGasInEth = await getGasUsageInEth(web3, txHash);

        const expectedEthBalance = previousEthBalance.sub(totalGasInEth);

        expect(expectedEthBalance).to.bignumber.equal(currentEthBalance);
      });
    });
  });
});
