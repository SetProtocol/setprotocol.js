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
  RebalancingSetCTokenBidderContract,
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
  RebalancingSetCTokenBidderWrapper,
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
  deployRebalancingSetCTokenBidderAsync,
  deployConstantAuctionPriceCurveAsync,
  deploySetTokenAsync,
  deployTokenAsync,
  deployTokensSpecifyingDecimals,
  deployWethMockAsync,
  getTokenInstances,
  getGasUsageInEth,
  getVaultBalances,
  transitionToRebalanceAsync,
} from '@test/helpers';

import { CompoundHelper } from '@test/helpers/compoundHelper';

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

const compoundHelper = new CompoundHelper();

let currentSnapshotId: number;

describe('RebalancingSetCTokenBidderWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let dataDescription: string;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;
  let rebalancingSetCTokenBidder: RebalancingSetCTokenBidderContract;
  let whitelist: WhiteListContract;

  let cUSDCInstance: StandardTokenMockContract;
  let usdcInstance: StandardTokenMockContract;
  let cDAIInstance: StandardTokenMockContract;
  let daiInstance: StandardTokenMockContract;

  let erc20Wrapper: ERC20Wrapper;
  let rebalancingSetCTokenBidderWrapper: RebalancingSetCTokenBidderWrapper;

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
    console.log('1')
    const usdcDecimals = 6;
    const daiDecimals = 18;
    const underlyingInstances = await deployTokensSpecifyingDecimals(
      2,
      [usdcDecimals, daiDecimals],
      web3,
    );
    usdcInstance = underlyingInstances[0];
    daiInstance = underlyingInstances[1];
    console.log('2', underlyingInstances[0].address)
    const cUSDCAddress = await compoundHelper.deployMockCUSDC(usdcInstance.address, DEFAULT_ACCOUNT);
    console.log('3', cUSDCAddress)
    await compoundHelper.enableCToken(cUSDCAddress);
    // Set the Borrow Rate
    await compoundHelper.setBorrowRate(cUSDCAddress, new BigNumber('43084603999'));

    const cDAIAddress = await compoundHelper.deployMockCDAI(daiInstance.address, DEFAULT_ACCOUNT);
    await compoundHelper.enableCToken(cDAIAddress);
    // Set the Borrow Rate
    await compoundHelper.setBorrowRate(cDAIAddress, new BigNumber('29313252165'));
    console.log(cUSDCAddress, cDAIAddress)
    const cTokenInstances = await getTokenInstances(web3, [cUSDCAddress, cDAIAddress])
    cUSDCInstance = cTokenInstances[0];
    cDAIInstance = cTokenInstances[1];

    dataDescription = 'cDAI cUSDC Bidder Contract'
    rebalancingSetCTokenBidder = await deployRebalancingSetCTokenBidderAsync(
      web3,
      rebalanceAuctionModule,
      transferProxy,
      [cUSDCAddress, cDAIAddress],
      [usdcInstance.address, daiInstance.address],
      dataDescription
    );

    erc20Wrapper = new ERC20Wrapper(web3);

    rebalancingSetCTokenBidderWrapper = new RebalancingSetCTokenBidderWrapper(
      web3,
      rebalancingSetCTokenBidder.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('bidPlacedCToken', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let defaultSetToken: SetTokenContract;
    let cTokenSetToken: SetTokenContract;

    let earlyTxnHash: string;
    let earlyBlockNumber: number;

    let defaultBaseSetComponent: StandardTokenMockContract;
    let defaultBaseSetComponent2: StandardTokenMockContract;
    let cTokenBaseSetComponent: StandardTokenMockContract;
    let cTokenBaseSetComponent2: StandardTokenMockContract;

    let bidQuantity: BigNumber;
    let allowPartialFill: boolean;
    let bidderAccount: Address;
    let bid1TxnHash: string;
    let bid2TxnHash: string;

    let subjectFromBlock: number;
    let subjectToBlock: any;
    let subjectRebalancingSetToken: Address;

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
      cTokenBaseSetComponent = cUSDCInstance;
      cTokenBaseSetComponent2 = cDAIInstance;
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

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await cTokenSetToken.getComponents.callAsync();
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
        usdcInstance,
        daiInstance,
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

      const lastBidTransaction = await web3.eth.getTransaction(bid2TxnHash);
      const bidBlockNumber = lastBidTransaction['blockNumber'];

      subjectFromBlock = earlyBlockNumber;
      subjectToBlock = bidBlockNumber;
      subjectRebalancingSetToken = undefined;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetCTokenBidderWrapper.bidPlacedCTokenEvent(
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
      expect(address).to.equal(rebalancingSetCTokenBidder.address);
      expect(event).to.equal('BidPlacedCToken');
    });

    test('retrieves the bid event properties', async () => {
      const events = await subject();

      const { returnValues } = events[0];
      const { bidder } = returnValues;
      const returnedRebalancingSetToken = returnValues['rebalancingSetToken'];

      expect(returnedRebalancingSetToken).to.equal(rebalancingSetToken.address);
      expect(bidder).to.equal(bidderAccount);
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

  // describe('bidAndWithdraw', async () => {
  //   let rebalancingSetToken: RebalancingSetTokenContract;
  //   let defaultSetToken: SetTokenContract;
  //   let cTokenSetToken: SetTokenContract;

  //   let defaultBaseSetComponent: StandardTokenMockContract;
  //   let defaultBaseSetComponent2: StandardTokenMockContract;
  //   let cTokenBaseSetComponent: StandardTokenMockContract;
  //   let cTokenBaseSetComponent2: StandardTokenMockContract;

  //   let cTokenComponentUnits: BigNumber;
  //   let cTokenBaseSetNaturalUnit: BigNumber;

  //   let subjectRebalancingSetToken: Address;
  //   let subjectBidQuantity: BigNumber;
  //   let subjectAllowPartialFill: boolean;
  //   let subjectCaller: Address;

  //   beforeEach(async () => {
  //     // Create component tokens for default Set
  //     defaultBaseSetComponent = await deployTokenAsync(web3);
  //     defaultBaseSetComponent2 = await deployTokenAsync(web3);

  //     // Create the Set (default is 2 components)
  //     const defaultComponentAddresses = [
  //       defaultBaseSetComponent.address, defaultBaseSetComponent2.address,
  //     ];
  //     const defaultComponentUnits = [
  //       ether(0.01), ether(0.01),
  //     ];

  //     const defaultBaseSetNaturalUnit = ether(0.001);
  //     defaultSetToken = await deploySetTokenAsync(
  //       web3,
  //       core,
  //       setTokenFactory.address,
  //       defaultComponentAddresses,
  //       defaultComponentUnits,
  //       defaultBaseSetNaturalUnit,
  //     );

  //     // Create component tokens for Set containing cTokens
  //     cTokenBaseSetComponent = cUSDCInstance;
  //     cTokenBaseSetComponent2 = cDAIInstance;

  //     // Create the Set (default is 2 components)
  //     const nextComponentAddresses = [
  //       cTokenBaseSetComponent.address, cTokenBaseSetComponent2.address,
  //     ];

  //     const nextComponentUnits = [
  //       ether(0.001), ether(1),
  //     ];

  //     cTokenBaseSetNaturalUnit = ether(0.001);
  //     cTokenSetToken = await deploySetTokenAsync(
  //       web3,
  //       core,
  //       setTokenFactory.address,
  //       nextComponentAddresses,
  //       nextComponentUnits,
  //       cTokenBaseSetNaturalUnit,
  //     );
  //   });

  //   async function subject(): Promise<string> {
  //     return await rebalancingSetCTokenBidderWrapper.bidAndWithdraw(
  //       subjectRebalancingSetToken,
  //       subjectBidQuantity,
  //       subjectAllowPartialFill,
  //       { from: subjectCaller },
  //     );
  //   }

  //   describe('when cTokens are inflows in a bid', async () => {
  //     beforeEach(async () => {
  //       // Create the Rebalancing Set without cToken component
  //       const proposalPeriod = ONE_DAY_IN_SECONDS;
  //       const managerAddress = ACCOUNTS[1].address;

  //       rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
  //         web3,
  //         core,
  //         rebalancingSetTokenFactory.address,
  //         managerAddress,
  //         defaultSetToken.address,
  //         proposalPeriod
  //       );

  //       // Approve tokens and issue defaultSetToken
  //       const baseSetIssueQuantity = ether(1);

  //       await approveForTransferAsync([
  //         defaultBaseSetComponent,
  //         defaultBaseSetComponent2,
  //       ], transferProxy.address);

  //       await core.issue.sendTransactionAsync(
  //         defaultSetToken.address,
  //         baseSetIssueQuantity,
  //         TX_DEFAULTS,
  //       );

  //       // Use issued defaultSetToken to issue rebalancingSetToken
  //       await approveForTransferAsync([defaultSetToken], transferProxy.address);

  //       const rebalancingSetTokenQuantityToIssue = ether(1);

  //       await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

  //       // Approve proposed Set's components to the whitelist;
  //       const [proposalComponentOne, proposalComponentTwo] = await cTokenSetToken.getComponents.callAsync();
  //       await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
  //       await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

  //       // Deploy price curve used in auction
  //       const priceCurve = await deployConstantAuctionPriceCurveAsync(
  //         web3,
  //         DEFAULT_AUCTION_PRICE_NUMERATOR,
  //         DEFAULT_AUCTION_PRICE_DENOMINATOR
  //       );

  //       addPriceCurveToCoreAsync(
  //         core,
  //         priceCurve.address
  //       );

  //       // Transition to rebalance state
  //       const auctionPriceCurveAddress = priceCurve.address;
  //       const setAuctionTimeToPivot = new BigNumber(100000);
  //       const setAuctionStartPrice = new BigNumber(500);
  //       const setAuctionPivotPrice = new BigNumber(1000);
  //       await transitionToRebalanceAsync(
  //         web3,
  //         rebalancingSetToken,
  //         managerAddress,
  //         cTokenSetToken.address,
  //         auctionPriceCurveAddress,
  //         setAuctionTimeToPivot,
  //         setAuctionStartPrice,
  //         setAuctionPivotPrice,
  //       );

  //       // Approve tokens to rebalancingSetCTokenBidder contract
  //       await approveForTransferAsync([
  //         cTokenBaseSetComponent,
  //         cTokenBaseSetComponent2,
  //       ], rebalancingSetCTokenBidder.address);

  //       subjectRebalancingSetToken = rebalancingSetToken.address;
  //       subjectBidQuantity = ether(1);
  //       subjectAllowPartialFill = false;
  //       subjectCaller = DEFAULT_ACCOUNT;
  //     });

  //     test('subtract correct amount from remainingCurrentSets', async () => {
  //       const [, existingRemainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

  //       await subject();

  //       const expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
  //       const [, newRemainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();
  //       expect(newRemainingCurrentSets).to.eql(expectedRemainingCurrentSets);
  //     });

  //     test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', async () => {
  //       const expectedTokenFlows = await constructInflowOutflowArraysAsync(
  //         rebalancingSetToken,
  //         subjectBidQuantity,
  //         DEFAULT_AUCTION_PRICE_NUMERATOR,
  //       );
  //       const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

  //       const oldSenderBalances = await getVaultBalances(
  //         vault,
  //         combinedTokenArray,
  //         rebalancingSetToken.address
  //       );

  //       await subject();

  //       const newSenderBalances = await getVaultBalances(
  //         vault,
  //         combinedTokenArray,
  //         rebalancingSetToken.address
  //       );
  //       const expectedSenderBalances = _.map(oldSenderBalances, (balance, index) =>
  //         balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index])
  //       );
  //       expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
  //     });

  //     test('transfers and withdraws the correct amount of tokens to the bidder wallet', async () => {
  //       const expectedTokenFlows = await constructInflowOutflowArraysAsync(
  //         rebalancingSetToken,
  //         subjectBidQuantity,
  //         DEFAULT_AUCTION_PRICE_NUMERATOR,
  //       );
  //       const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

  //       const oldReceiverTokenBalances = await Promise.all(
  //         combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
  //       );
  //       const oldEthBalance = new BigNumber(await web3.eth.getBalance(subjectCaller));

  //       // Replace WETH balance with ETH balance
  //       const oldReceiverTokenAndEthBalances = _.map(oldReceiverTokenBalances, (balance, index) =>
  //         combinedTokenArray[index] === weth.address ? new BigNumber(oldEthBalance) : balance
  //       );

  //       const txHash = await subject();

  //       const newEthBalance =  await web3.eth.getBalance(subjectCaller);
  //       const newReceiverTokenBalances = await Promise.all(
  //         combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
  //       );
  //       // Replace WETH balance with ETH balance and factor in gas paid
  //       const totalGasInEth = await getGasUsageInEth(web3, txHash);
  //       const newReceiverTokenAndEthBalances = _.map(newReceiverTokenBalances, (balance, index) =>
  //         combinedTokenArray[index] === weth.address ? totalGasInEth.add(newEthBalance) : balance
  //       );

  //       const expectedReceiverBalances = _.map(oldReceiverTokenAndEthBalances, (balance, index) =>
  //         balance.add(expectedTokenFlows['outflow'][index]).sub(expectedTokenFlows['inflow'][index])
  //       );

  //       expect(JSON.stringify(newReceiverTokenAndEthBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
  //     });
  //   });

  //   describe('when WETH is an outflow in a bid', async () => {
  //     beforeEach(async () => {
  //       // Create the Rebalancing Set with WETH component
  //       const proposalPeriod = ONE_DAY_IN_SECONDS;
  //       const managerAddress = ACCOUNTS[1].address;

  //       rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
  //         web3,
  //         core,
  //         rebalancingSetTokenFactory.address,
  //         managerAddress,
  //         cTokenSetToken.address,
  //         proposalPeriod
  //       );

  //       // Approve tokens and issue cTokenSetToken


  //       await approveForTransferAsync([
  //         cTokenBaseSetComponent,
  //         cTokenBaseSetComponent2,
  //       ], transferProxy.address);

  //       await core.issue.sendTransactionAsync(
  //         cTokenSetToken.address,
  //         baseSetIssueQuantity,
  //         TX_DEFAULTS,
  //       );

  //       // Use issued cTokenSetToken to issue rebalancingSetToken
  //       await approveForTransferAsync([cTokenSetToken], transferProxy.address);

  //       const rebalancingSetTokenQuantityToIssue = ether(1);

  //       await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

  //       // Approve proposed Set's components to the whitelist;
  //       const [proposalComponentOne, proposalComponentTwo] = await defaultSetToken.getComponents.callAsync();
  //       await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
  //       await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

  //       // Deploy price curve used in auction
  //       const priceCurve = await deployConstantAuctionPriceCurveAsync(
  //         web3,
  //         DEFAULT_AUCTION_PRICE_NUMERATOR,
  //         DEFAULT_AUCTION_PRICE_DENOMINATOR
  //       );

  //       addPriceCurveToCoreAsync(
  //         core,
  //         priceCurve.address
  //       );

  //       // Transition to rebalance state
  //       const auctionPriceCurveAddress = priceCurve.address;
  //       const setAuctionTimeToPivot = new BigNumber(100000);
  //       const setAuctionStartPrice = new BigNumber(500);
  //       const setAuctionPivotPrice = new BigNumber(1000);
  //       await transitionToRebalanceAsync(
  //         web3,
  //         rebalancingSetToken,
  //         managerAddress,
  //         defaultSetToken.address,
  //         auctionPriceCurveAddress,
  //         setAuctionTimeToPivot,
  //         setAuctionStartPrice,
  //         setAuctionPivotPrice,
  //       );

  //       // Approve tokens to rebalancingSetCTokenBidder contract
  //       await approveForTransferAsync([
  //         defaultBaseSetComponent,
  //         defaultBaseSetComponent2,
  //       ], rebalancingSetCTokenBidder.address);

  //       subjectRebalancingSetToken = rebalancingSetToken.address;
  //       subjectBidQuantity = ether(1);
  //       subjectAllowPartialFill = false;
  //       subjectCaller = DEFAULT_ACCOUNT;
  //     });

  //     test('transfers and withdraws the correct amount of tokens to the bidder wallet', async () => {
  //       const expectedTokenFlows = await constructInflowOutflowArraysAsync(
  //         rebalancingSetToken,
  //         subjectBidQuantity,
  //         DEFAULT_AUCTION_PRICE_NUMERATOR,
  //       );
  //       const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

  //       const oldReceiverTokenBalances = await Promise.all(
  //         combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
  //       );
  //       const oldEthBalance = new BigNumber(await web3.eth.getBalance(subjectCaller));

  //       // Replace WETH balance with ETH balance
  //       const oldReceiverTokenAndEthBalances = _.map(oldReceiverTokenBalances, (balance, index) =>
  //         combinedTokenArray[index] === weth.address ? new BigNumber(oldEthBalance) : balance
  //       );

  //       const txHash = await subject();

  //       const newEthBalance =  await web3.eth.getBalance(subjectCaller);
  //       const newReceiverTokenBalances = await Promise.all(
  //         combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
  //       );
  //       // Replace WETH balance with ETH balance and factor in gas paid
  //       const totalGasInEth = await getGasUsageInEth(web3, txHash);
  //       const newReceiverTokenAndEthBalances = _.map(newReceiverTokenBalances, (balance, index) =>
  //         combinedTokenArray[index] === weth.address ? totalGasInEth.add(newEthBalance) : balance
  //       );

  //       const expectedReceiverBalances = _.map(oldReceiverTokenAndEthBalances, (balance, index) =>
  //         balance.add(expectedTokenFlows['outflow'][index]).sub(expectedTokenFlows['inflow'][index])
  //       );

  //       expect(JSON.stringify(newReceiverTokenAndEthBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
  //     });
  //   });

  //   describe('when WETH is neither an inflow nor outflow in a bid', async () => {
  //     beforeEach(async () => {
  //       // Create the Rebalancing Set without WETH component
  //       const proposalPeriod = ONE_DAY_IN_SECONDS;
  //       const managerAddress = ACCOUNTS[1].address;

  //       rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
  //         web3,
  //         core,
  //         rebalancingSetTokenFactory.address,
  //         managerAddress,
  //         defaultSetToken.address,
  //         proposalPeriod
  //       );

  //       // Approve tokens and issue defaultSetToken
  //       const baseSetIssueQuantity = ether(1);

  //       await approveForTransferAsync([
  //         defaultBaseSetComponent,
  //         defaultBaseSetComponent2,
  //       ], transferProxy.address);

  //       await core.issue.sendTransactionAsync(
  //         defaultSetToken.address,
  //         baseSetIssueQuantity,
  //         TX_DEFAULTS,
  //       );

  //       // Use issued defaultSetToken to issue rebalancingSetToken
  //       await approveForTransferAsync([defaultSetToken], transferProxy.address);

  //       const rebalancingSetTokenQuantityToIssue = ether(1);

  //       await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

  //       // Create new next Set with no weth component
  //       const defaultNextBaseSetComponent = await deployTokenAsync(web3);
  //       const defaultNextBaseSetComponent2 = await deployTokenAsync(web3);
  //       const defaultNextComponentAddresses = [
  //         defaultNextBaseSetComponent.address, defaultNextBaseSetComponent2.address,
  //       ];
  //       const defaultNextComponentUnits = [
  //         ether(0.01), ether(0.01),
  //       ];
  //       const defaultBaseSetNaturalUnit = ether(0.001);
  //       const defaultNextSetToken = await deploySetTokenAsync(
  //         web3,
  //         core,
  //         setTokenFactory.address,
  //         defaultNextComponentAddresses,
  //         defaultNextComponentUnits,
  //         defaultBaseSetNaturalUnit,
  //       );

  //       // Approve proposed Set's components to the whitelist;
  //       const [proposalComponentOne, proposalComponentTwo] = await defaultNextSetToken.getComponents.callAsync();
  //       await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
  //       await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

  //       // Deploy price curve used in auction
  //       const priceCurve = await deployConstantAuctionPriceCurveAsync(
  //         web3,
  //         DEFAULT_AUCTION_PRICE_NUMERATOR,
  //         DEFAULT_AUCTION_PRICE_DENOMINATOR
  //       );

  //       addPriceCurveToCoreAsync(
  //         core,
  //         priceCurve.address
  //       );

  //       // Transition to rebalance state
  //       const auctionPriceCurveAddress = priceCurve.address;
  //       const setAuctionTimeToPivot = new BigNumber(100000);
  //       const setAuctionStartPrice = new BigNumber(500);
  //       const setAuctionPivotPrice = new BigNumber(1000);
  //       await transitionToRebalanceAsync(
  //         web3,
  //         rebalancingSetToken,
  //         managerAddress,
  //         defaultNextSetToken.address,
  //         auctionPriceCurveAddress,
  //         setAuctionTimeToPivot,
  //         setAuctionStartPrice,
  //         setAuctionPivotPrice,
  //       );

  //       // Approve tokens to rebalancingSetCTokenBidder contract
  //       await approveForTransferAsync([
  //         defaultNextBaseSetComponent,
  //         defaultNextBaseSetComponent2,
  //       ], rebalancingSetCTokenBidder.address);

  //       subjectRebalancingSetToken = rebalancingSetToken.address;
  //       subjectBidQuantity = ether(1);
  //       subjectAllowPartialFill = false;
  //       subjectCaller = DEFAULT_ACCOUNT;
  //     });

  //     test('returns the amount of ETH minus gas cost', async () => {
  //       const previousEthBalance: BigNumber = new BigNumber(await web3.eth.getBalance(subjectCaller));

  //       const txHash = await subject();

  //       const currentEthBalance =  await web3.eth.getBalance(subjectCaller);

  //       const totalGasInEth = await getGasUsageInEth(web3, txHash);

  //       const expectedEthBalance = previousEthBalance.sub(totalGasInEth);

  //       expect(expectedEthBalance).to.bignumber.equal(currentEthBalance);
  //     });
  //   });
  // });
});
