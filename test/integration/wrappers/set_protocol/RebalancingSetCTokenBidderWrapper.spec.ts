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
import {
  CoreContract,
  CoreHelper,
  ERC20Helper,
  FeeCalculatorHelper,
  LinearAuctionLiquidatorContract,
  LiquidatorHelper,
  OracleWhiteListContract,
  PerformanceFeeCalculatorContract,
  RebalanceAuctionModuleContract,
  RebalancingSetCTokenBidderContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenV3Contract,
  RebalancingSetTokenFactoryContract,
  RebalancingSetTokenV3FactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  TWAPLiquidatorContract,
  ValuationHelper,
  VaultContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  CTokenOracleContract,
  OracleHelper,
  UpdatableOracleMockContract,
} from 'set-protocol-oracles';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import {
  ERC20Wrapper,
  RebalancingSetCTokenBidderWrapper,
} from '@src/wrappers';
import {
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
  ZERO,
  ZERO_BYTES,
  ONE_HOUR_IN_SECONDS,
} from '@src/constants';
import {
  addPriceCurveToCoreAsync,
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  constructInflowOutflowArraysAsync,
  createDefaultRebalancingSetTokenAsync,
  createDefaultRebalancingSetTokenV3Async,
  deployBaseContracts,
  deployConstantAuctionPriceCurveAsync,
  deployLinearAuctionLiquidatorContractAsync,
  deployOracleWhiteListAsync,
  deployRebalancingSetCTokenBidderAsync,
  deployRebalancingSetTokenV3FactoryContractAsync,
  deploySetTokenAsync,
  deployTokenAsync,
  deployTokensSpecifyingDecimals,
  deployTWAPLiquidatorAsync,
  deployUpdatableOracleMockAsync,
  deployWhiteListContract,
  getLinearAuction,
  getTokenInstances,
  getVaultBalances,
  replaceFlowsWithCTokenUnderlyingAsync,
  transitionToRebalanceAsync,
} from '@test/helpers';

import { CompoundHelper } from '@test/helpers/compoundHelper';

import {
  BigNumber,
  ether,
} from '@src/util';
import { Address, LinearAuction, } from '@src/types/common';

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

const compoundHelper = new CompoundHelper();

let currentSnapshotId: number;

describe('RebalancingSetCTokenBidderWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let dataDescription: string;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let rebalancingSetTokenV3Factory: RebalancingSetTokenV3FactoryContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;
  let rebalancingSetCTokenBidder: RebalancingSetCTokenBidderContract;
  let whitelist: WhiteListContract;

  let liquidator: LinearAuctionLiquidatorContract;
  let twapLiquidator: TWAPLiquidatorContract;
  let performanceFeeCalculator: PerformanceFeeCalculatorContract;
  let oracleWhiteList: OracleWhiteListContract;
  let liquidatorWhiteList: WhiteListContract;
  let feeCalculatorWhiteList: WhiteListContract;

  let ethOracleProxy: UpdatableOracleMockContract;
  let btcOracleProxy: UpdatableOracleMockContract;
  let usdcOracle: UpdatableOracleMockContract;
  let daiOracle: UpdatableOracleMockContract;
  let cUSDCOracle: CTokenOracleContract;
  let cDaiOracle: CTokenOracleContract;

  let cUSDCInstance: StandardTokenMockContract;
  let usdcInstance: StandardTokenMockContract;
  let cDAIInstance: StandardTokenMockContract;
  let daiInstance: StandardTokenMockContract;
  let wrappedBTC: StandardTokenMockContract;
  let wrappedETH: StandardTokenMockContract;

  let erc20Wrapper: ERC20Wrapper;
  let rebalancingSetCTokenBidderWrapper: RebalancingSetCTokenBidderWrapper;

  const feeCalculatorHelper = new FeeCalculatorHelper(DEFAULT_ACCOUNT);
  const coreHelper = new CoreHelper(DEFAULT_ACCOUNT, DEFAULT_ACCOUNT);
  const erc20Helper = new ERC20Helper(DEFAULT_ACCOUNT);
  const oracleHelper = new OracleHelper(DEFAULT_ACCOUNT);
  const valuationHelper = new ValuationHelper(DEFAULT_ACCOUNT, coreHelper, erc20Helper, oracleHelper);
  const liquidatorHelper = new LiquidatorHelper(DEFAULT_ACCOUNT, erc20Helper, valuationHelper);

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

    [wrappedBTC, wrappedETH] = await deployTokensSpecifyingDecimals(2, [8, 18], web3);

    const usdcDecimals = 6;
    const daiDecimals = 18;
    const underlyingInstances = await deployTokensSpecifyingDecimals(
      2,
      [usdcDecimals, daiDecimals],
      web3,
    );

    usdcInstance = underlyingInstances[0];
    daiInstance = underlyingInstances[1];

    const cUSDCAddress = await compoundHelper.deployMockCUSDC(usdcInstance.address, DEFAULT_ACCOUNT);
    await compoundHelper.enableCToken(cUSDCAddress);
    // Set the Borrow Rate
    await compoundHelper.setBorrowRate(cUSDCAddress, new BigNumber('43084603999'));

    const cDAIAddress = await compoundHelper.deployMockCDAI(daiInstance.address, DEFAULT_ACCOUNT);
    await compoundHelper.enableCToken(cDAIAddress);
    // Set the Borrow Rate
    await compoundHelper.setBorrowRate(cDAIAddress, new BigNumber('29313252165'));
    const cTokenInstances = await getTokenInstances(web3, [cUSDCAddress, cDAIAddress]);
    cUSDCInstance = cTokenInstances[0];
    cDAIInstance = cTokenInstances[1];

    await addWhiteListedTokenAsync(whitelist, wrappedETH.address);
    await addWhiteListedTokenAsync(whitelist, wrappedBTC.address);
    await addWhiteListedTokenAsync(whitelist, cUSDCInstance.address);
    await addWhiteListedTokenAsync(whitelist, cDAIInstance.address);

    const initialEthPrice = ether(180);
    const initialBtcPrice = ether(9000);
    const initialDaiPrice = ether(1);
    const initialUSDCPrice = ether(1);
    ethOracleProxy = await deployUpdatableOracleMockAsync(
      web3,
      initialEthPrice
    );
    btcOracleProxy = await deployUpdatableOracleMockAsync(
      web3,
      initialBtcPrice
    );
    daiOracle = await deployUpdatableOracleMockAsync(
      web3,
      initialDaiPrice
    );
    usdcOracle = await deployUpdatableOracleMockAsync(
      web3,
      initialUSDCPrice
    );
    cDaiOracle = await oracleHelper.deployCTokenOracleAsync(
      cDAIInstance.address,
      daiOracle.address,
      new BigNumber(10).pow(8),
      ether(1),
    );
    cUSDCOracle = await oracleHelper.deployCTokenOracleAsync(
      cUSDCInstance.address,
      usdcOracle.address,
      new BigNumber(10).pow(8),
      new BigNumber(10).pow(6),
    );

    oracleWhiteList = await deployOracleWhiteListAsync(
      web3,
      [wrappedETH.address, wrappedBTC.address, cDAIInstance.address, cUSDCInstance.address],
      [ethOracleProxy.address, btcOracleProxy.address, cDaiOracle.address, cUSDCOracle.address],
    );

    liquidator = await deployLinearAuctionLiquidatorContractAsync(
      web3,
      core,
      oracleWhiteList,
      ONE_HOUR_IN_SECONDS
    );
    const assetPairBounds = [
      {
        assetOne: wrappedETH.address,
        assetTwo: cUSDCInstance.address,
        bounds: {lower: ether(10 ** 4).toString(), upper: ether(10 ** 6).toString()},
      },
    ];
    twapLiquidator = await deployTWAPLiquidatorAsync(
      web3,
      core.address,
      oracleWhiteList.address,
      ONE_HOUR_IN_SECONDS,
      ether(.01),
      ether(.23),
      assetPairBounds,
      'TWAPLiquidator'
    );
    liquidatorWhiteList = await deployWhiteListContract(web3, [liquidator.address, twapLiquidator.address]);

    const maxProfitFeePercentage = ether(.4);
    const maxStreamingFeePercentage = ether(.07);
    performanceFeeCalculator = await feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(
      core.address,
      oracleWhiteList.address,
      maxProfitFeePercentage,
      maxStreamingFeePercentage,
    );
    feeCalculatorWhiteList = await deployWhiteListContract(web3, [performanceFeeCalculator.address]);

    rebalancingSetTokenV3Factory = await deployRebalancingSetTokenV3FactoryContractAsync(
      web3,
      core,
      whitelist,
      liquidatorWhiteList,
      feeCalculatorWhiteList
    );

    dataDescription = 'cDAI cUSDC Bidder Contract';
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

  describe('bidAndWithdraw', async () => {
    let rebalancingSetToken: RebalancingSetTokenV3Contract;
    let defaultSetToken: SetTokenContract;
    let cTokenSetToken: SetTokenContract;

    let cTokenBaseSetNaturalUnit: BigNumber;

    let subjectRebalancingSetToken: Address;
    let subjectBidQuantity: BigNumber;
    let subjectAllowPartialFill: boolean;
    let subjectCaller: Address;

    beforeEach(async () => {
      // Create the Set
      const defaultComponentAddresses = [
        wrappedETH.address,
      ];
      const defaultComponentUnits = [
        ether(0.001),
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

      // Create the Set
      const nextComponentAddresses = [
        wrappedETH.address, cUSDCInstance.address,
      ];

      const nextComponentUnits = [
        ether(0.001), new BigNumber(10 ** 10),
      ];

      cTokenBaseSetNaturalUnit = ether(0.001);
      cTokenSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        nextComponentAddresses,
        nextComponentUnits,
        cTokenBaseSetNaturalUnit,
      );
    });

    async function subject(): Promise<string> {
      return await rebalancingSetCTokenBidderWrapper.bidAndWithdraw(
        subjectRebalancingSetToken,
        subjectBidQuantity,
        subjectAllowPartialFill,
        { from: subjectCaller },
      );
    }

    describe('when cTokens are inflows in a bid', async () => {
      beforeEach(async () => {
        // Create the Rebalancing Set without cToken component
        const managerAddress = ACCOUNTS[1].address;

        rebalancingSetToken = await createDefaultRebalancingSetTokenV3Async(
          web3,
          core,
          rebalancingSetTokenV3Factory.address,
          managerAddress,
          liquidator.address,
          managerAddress,
          performanceFeeCalculator.address,
          defaultSetToken.address,
          ONE_DAY_IN_SECONDS,
          ZERO
        );

        // Approve tokens and issue defaultSetToken
        const baseSetIssueQuantity = ether(1);

        await approveForTransferAsync([
          wrappedETH,
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

        // Transition to rebalance state
        await rebalancingSetToken.startRebalance.sendTransactionAsync(
          cTokenSetToken.address,
          ZERO_BYTES,
          { from: managerAddress }
        );

        // Approve tokens to rebalancingSetCTokenBidder contract
        await approveForTransferAsync([
          usdcInstance,
          daiInstance,
        ], rebalancingSetCTokenBidder.address);

        subjectRebalancingSetToken = rebalancingSetToken.address;
        subjectBidQuantity = rebalancingSetTokenQuantityToIssue;
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
        const auction = await liquidator.auctions.callAsync(subjectRebalancingSetToken);
        const linearAuction = getLinearAuction(auction);

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
        const auction = await liquidator.auctions.callAsync(subjectRebalancingSetToken);
        const linearAuction = getLinearAuction(auction);

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
        const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        // Get current exchange rate
        const cUSDCExchangeRate = await compoundHelper.getExchangeRateCurrent(cUSDCInstance.address);
        const cDAIExchangeRate = await compoundHelper.getExchangeRateCurrent(cDAIInstance.address);
        // Replace expected token flow arrays with cToken underlying
        const expectedTokenFlowsUnderlying = replaceFlowsWithCTokenUnderlyingAsync(
          expectedTokenFlows,
          combinedTokenArray,
          [cUSDCInstance.address, cDAIInstance.address],
          [usdcInstance.address, daiInstance.address],
          [cUSDCExchangeRate, cDAIExchangeRate],
        );

        const oldReceiverTokenBalances = await Promise.all(
          combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );

        const oldUnderlyingTokenBalances = await Promise.all(
          [
            usdcInstance.address,
            daiInstance.address,
          ].map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );

        // Replace cToken balance with underlying token balance
        const oldReceiverTokenUnderlyingBalances = _.map(oldReceiverTokenBalances, (balance, index) => {
          if (combinedTokenArray[index] === cUSDCInstance.address) {
            return oldUnderlyingTokenBalances[0];
          } else if (combinedTokenArray[index] === cDAIInstance.address) {
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
            usdcInstance.address,
            daiInstance.address,
          ].map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );
        // Replace cToken balance with underlying token balance
        const newReceiverTokenUnderlyingBalances = _.map(newReceiverTokenBalances, (balance, index) => {
          if (combinedTokenArray[index] === cUSDCInstance.address) {
            return newUnderlyingTokenBalances[0];
          } else if (combinedTokenArray[index] === cDAIInstance.address) {
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
    });

    describe('when cTokens are outflows in a bid', async () => {
      beforeEach(async () => {
        // Create the Rebalancing Set with no cToken component
        const managerAddress = ACCOUNTS[1].address;

        rebalancingSetToken = await createDefaultRebalancingSetTokenV3Async(
          web3,
          core,
          rebalancingSetTokenV3Factory.address,
          managerAddress,
          liquidator.address,
          managerAddress,
          performanceFeeCalculator.address,
          cTokenSetToken.address,
          ONE_DAY_IN_SECONDS,
          ZERO
        );

        // Approve tokens, mint cToken and issue cTokenSetToken
        const baseSetIssueQuantity = ether(1);

        await approveForTransferAsync([usdcInstance], cUSDCInstance.address);
        await compoundHelper.mintCToken(
          cUSDCInstance.address,
          new BigNumber(10 ** 18)
        );

        await approveForTransferAsync([
          cUSDCInstance,
          wrappedETH,
        ], transferProxy.address);

        await core.issue.sendTransactionAsync(
          cTokenSetToken.address,
          baseSetIssueQuantity,
          TX_DEFAULTS,
        );

        // Use issued cTokenSetToken to issue rebalancingSetToken
        await approveForTransferAsync([cTokenSetToken], transferProxy.address);

        const rebalancingSetTokenQuantityToIssue = ether(1);

        await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

        // Transition to rebalance state
        await rebalancingSetToken.startRebalance.sendTransactionAsync(
          defaultSetToken.address,
          ZERO_BYTES,
          { from: managerAddress }
        );

        // Determine minimum bid
        const decOne = await defaultSetToken.naturalUnit.callAsync();
        const decTwo = await cTokenSetToken.naturalUnit.callAsync();
        const minBid = new BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);

        // Approve tokens to rebalancingSetCTokenBidder contract
        await approveForTransferAsync([
          wrappedETH,
        ], rebalancingSetCTokenBidder.address);

        subjectRebalancingSetToken = rebalancingSetToken.address;
        subjectBidQuantity = minBid;
        subjectAllowPartialFill = false;
        subjectCaller = DEFAULT_ACCOUNT;
      });

      test('transfers and withdraws the correct amount of tokens to the bidder wallet', async () => {
        const auction = await liquidator.auctions.callAsync(subjectRebalancingSetToken);
        const linearAuction = getLinearAuction(auction);

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

        const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

        const cUSDCExchangeRate = await compoundHelper.getExchangeRateCurrent(cUSDCInstance.address);
        const cDAIExchangeRate = await compoundHelper.getExchangeRateCurrent(cDAIInstance.address);
        // Replace expected token flow arrays with cToken underlying
        const expectedTokenFlowsUnderlying = replaceFlowsWithCTokenUnderlyingAsync(
          expectedTokenFlows,
          combinedTokenArray,
          [cUSDCInstance.address, cDAIInstance.address],
          [usdcInstance.address, daiInstance.address],
          [cUSDCExchangeRate, cDAIExchangeRate],
        );

        const oldReceiverTokenBalances = await Promise.all(
          combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );

        const oldUnderlyingTokenBalances = await Promise.all(
          [
            usdcInstance.address,
            daiInstance.address,
          ].map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );
        // Replace cToken balance with underlying token balance
        const oldReceiverTokenUnderlyingBalances = _.map(oldReceiverTokenBalances, (balance, index) => {
          if (combinedTokenArray[index] === cUSDCInstance.address) {
            return oldUnderlyingTokenBalances[0];
          } else if (combinedTokenArray[index] === cDAIInstance.address) {
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
            usdcInstance.address,
            daiInstance.address,
          ].map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );
        // Replace cToken balance with underlying token balance
        const newReceiverTokenUnderlyingBalances = _.map(newReceiverTokenBalances, (balance, index) => {
          if (combinedTokenArray[index] === cUSDCInstance.address) {
            return newUnderlyingTokenBalances[0];
          } else if (combinedTokenArray[index] === cDAIInstance.address) {
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
    });

    describe('when cToken is neither an inflow nor outflow in a bid', async () => {
      beforeEach(async () => {
        // Create the Rebalancing Set with default component
        const proposalPeriod = ONE_DAY_IN_SECONDS;
        const managerAddress = ACCOUNTS[1].address;

        rebalancingSetToken = await createDefaultRebalancingSetTokenV3Async(
          web3,
          core,
          rebalancingSetTokenV3Factory.address,
          managerAddress,
          liquidator.address,
          managerAddress,
          performanceFeeCalculator.address,
          defaultSetToken.address,
          ONE_DAY_IN_SECONDS,
          ZERO,
          proposalPeriod
        );

        // Approve tokens and issue defaultSetToken
        const baseSetIssueQuantity = ether(1);

        await approveForTransferAsync([
          wrappedETH,
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

        // Create new next Set with no cToken component
        const defaultBaseSetNaturalUnit = ether(0.001);
        const defaultNextSetToken = await deploySetTokenAsync(
          web3,
          core,
          setTokenFactory.address,
          [wrappedETH.address, wrappedBTC.address],
          [ether(.001), new BigNumber(10 ** 5)],
          defaultBaseSetNaturalUnit,
        );

        // Transition to rebalance state
        await rebalancingSetToken.startRebalance.sendTransactionAsync(
          defaultNextSetToken.address,
          ZERO_BYTES,
          { from: managerAddress }
        );

        // Approve tokens to rebalancingSetCTokenBidder contract
        await approveForTransferAsync([
          wrappedBTC,
          wrappedETH,
        ], rebalancingSetCTokenBidder.address);

        subjectRebalancingSetToken = rebalancingSetToken.address;
        subjectBidQuantity = ether(1);
        subjectAllowPartialFill = false;
        subjectCaller = DEFAULT_ACCOUNT;
      });

      test("transfers the correct amount of tokens to the bidder's wallet", async () => {
        const auction = await liquidator.auctions.callAsync(subjectRebalancingSetToken);
        const linearAuction = getLinearAuction(auction);

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

        const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();
        const oldReceiverTokenBalances = await Promise.all(
          combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );

        await subject();

        const newReceiverBalances = await Promise.all(
          combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
        );

        const expectedReceiverBalances = _.map(oldReceiverTokenBalances, (balance, index) =>
          balance
          .add(expectedTokenFlows['outflow'][index])
          .sub(expectedTokenFlows['inflow'][index])
        );

        expect(JSON.stringify(newReceiverBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
      });
    });
  });

  describe('bidAndWithdrawTWAP', async () => {
    let rebalancingSetToken: RebalancingSetTokenV3Contract;
    let defaultSetToken: SetTokenContract;
    let cTokenSetToken: SetTokenContract;

    let cTokenBaseSetNaturalUnit: BigNumber;

    let subjectRebalancingSetToken: Address;
    let subjectBidQuantity: BigNumber;
    let subjectLastChunkTimestamp: BigNumber;
    let subjectAllowPartialFill: boolean;
    let subjectCaller: Address;

    beforeEach(async () => {
      // Create the Set
      const defaultComponentAddresses = [
        wrappedETH.address,
      ];
      const defaultComponentUnits = [
        ether(0.001),
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

      // Create the Set
      const nextComponentAddresses = [
        wrappedETH.address, cUSDCInstance.address,
      ];

      const nextComponentUnits = [
        ether(0.001), new BigNumber(10 ** 10),
      ];

      cTokenBaseSetNaturalUnit = ether(0.001);
      cTokenSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        nextComponentAddresses,
        nextComponentUnits,
        cTokenBaseSetNaturalUnit,
      );

      // Create the Rebalancing Set without cToken component
      const managerAddress = ACCOUNTS[1].address;

      rebalancingSetToken = await createDefaultRebalancingSetTokenV3Async(
        web3,
        core,
        rebalancingSetTokenV3Factory.address,
        managerAddress,
        twapLiquidator.address,
        managerAddress,
        performanceFeeCalculator.address,
        defaultSetToken.address,
        ONE_DAY_IN_SECONDS,
        ZERO
      );

      // Approve tokens and issue defaultSetToken
      const baseSetIssueQuantity = ether(100);

      await approveForTransferAsync([
        wrappedETH,
      ], transferProxy.address);

      await core.issue.sendTransactionAsync(
        defaultSetToken.address,
        baseSetIssueQuantity,
        TX_DEFAULTS,
      );

      // Use issued defaultSetToken to issue rebalancingSetToken
      await approveForTransferAsync([defaultSetToken], transferProxy.address);

      const rebalancingSetTokenQuantityToIssue = ether(100);

      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue);

      // Transition to rebalance state
      const liquidatorData = liquidatorHelper.generateTWAPLiquidatorCalldata(
        ether(10 ** 5),
        ONE_HOUR_IN_SECONDS,
      );
      await rebalancingSetToken.startRebalance.sendTransactionAsync(
        cTokenSetToken.address,
        liquidatorData,
        { from: managerAddress }
      );

      // Approve tokens to rebalancingSetCTokenBidder contract
      await approveForTransferAsync([
        usdcInstance,
        daiInstance,
      ], rebalancingSetCTokenBidder.address);

      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectBidQuantity = rebalancingSetTokenQuantityToIssue;
      subjectLastChunkTimestamp = ZERO;
      subjectAllowPartialFill = false;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingSetCTokenBidderWrapper.bidAndWithdrawTWAP(
        subjectRebalancingSetToken,
        subjectBidQuantity,
        subjectLastChunkTimestamp,
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
      const auction = await twapLiquidator.auctions.callAsync(subjectRebalancingSetToken);
      const linearAuction = getLinearAuction(auction[0]);

      const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

      const oldSenderBalances = await getVaultBalances(
        vault,
        combinedTokenArray,
        rebalancingSetToken.address
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
        rebalancingSetToken.address
      );
      const expectedSenderBalances = _.map(oldSenderBalances, (balance, index) =>
        balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index])
      );

      expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
    });

    test('transfers and withdraws the correct amount of tokens to the bidder wallet', async () => {
      const auction = await twapLiquidator.auctions.callAsync(subjectRebalancingSetToken);
      const linearAuction = getLinearAuction(auction[0]);

      const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

      const oldReceiverTokenBalances = await Promise.all(
        combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
      );

      const oldUnderlyingTokenBalances = await Promise.all(
        [
          usdcInstance.address,
          daiInstance.address,
        ].map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
      );

      // Replace cToken balance with underlying token balance
      const oldReceiverTokenUnderlyingBalances = _.map(oldReceiverTokenBalances, (balance, index) => {
        if (combinedTokenArray[index] === cUSDCInstance.address) {
          return oldUnderlyingTokenBalances[0];
        } else if (combinedTokenArray[index] === cDAIInstance.address) {
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
      const cUSDCExchangeRate = await compoundHelper.getExchangeRateCurrent(cUSDCInstance.address);
      const cDAIExchangeRate = await compoundHelper.getExchangeRateCurrent(cDAIInstance.address);
      // Replace expected token flow arrays with cToken underlying
      const expectedTokenFlowsUnderlying = replaceFlowsWithCTokenUnderlyingAsync(
        expectedTokenFlows,
        combinedTokenArray,
        [cUSDCInstance.address, cDAIInstance.address],
        [usdcInstance.address, daiInstance.address],
        [cUSDCExchangeRate, cDAIExchangeRate],
      );

      const newReceiverTokenBalances = await Promise.all(
        combinedTokenArray.map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
      );
      const newUnderlyingTokenBalances = await Promise.all(
        [
          usdcInstance.address,
          daiInstance.address,
        ].map(tokenAddress => erc20Wrapper.balanceOf(tokenAddress, DEFAULT_ACCOUNT))
      );
      // Replace cToken balance with underlying token balance
      const newReceiverTokenUnderlyingBalances = _.map(newReceiverTokenBalances, (balance, index) => {
        if (combinedTokenArray[index] === cUSDCInstance.address) {
          return newUnderlyingTokenBalances[0];
        } else if (combinedTokenArray[index] === cDAIInstance.address) {
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
  });

  describe('getAddressAndBidPriceArray', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let defaultSetToken: SetTokenContract;
    let cTokenSetToken: SetTokenContract;

    let defaultBaseSetComponent: StandardTokenMockContract;
    let defaultBaseSetComponent2: StandardTokenMockContract;
    let cTokenBaseSetComponent: StandardTokenMockContract;
    let cTokenBaseSetComponent2: StandardTokenMockContract;

    let cTokenBaseSetNaturalUnit: BigNumber;

    let subjectRebalancingSetToken: Address;
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

      cTokenBaseSetNaturalUnit = ether(0.001);
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

      // Approve tokens to rebalancingSetCTokenBidder contract
      await approveForTransferAsync([
        usdcInstance,
        daiInstance,
      ], rebalancingSetCTokenBidder.address);

      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectBidQuantity = minBid;
    });

    async function subject(): Promise<any> {
      return rebalancingSetCTokenBidderWrapper.getAddressAndBidPriceArray(
        subjectRebalancingSetToken,
        subjectBidQuantity,
      );
    }

    it('should return the correct inflow, outflow and address arrays', async () => {
      const actualTokenFlows = await subject();

      const expectedTokenFlows = await constructInflowOutflowArraysAsync(
        rebalancingSetToken,
        subjectBidQuantity,
        DEFAULT_AUCTION_PRICE_NUMERATOR
      );

      const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();
      const expectedCombinedTokenArray = _.map(combinedTokenArray, token => {
        if (token === cUSDCInstance.address) {
          return usdcInstance.address;
        } else if (token === cDAIInstance.address) {
          return daiInstance.address;
        } else {
          return token;
        }
      });
      // Get exchange rate stored
      const cUSDCExchangeRate = await compoundHelper.getExchangeRate(cUSDCInstance.address);
      const cDAIExchangeRate = await compoundHelper.getExchangeRate(cDAIInstance.address);
      // Replace expected token flow arrays with cToken underlying
      const expectedTokenFlowsUnderlying = replaceFlowsWithCTokenUnderlyingAsync(
        expectedTokenFlows,
        combinedTokenArray,
        [cUSDCInstance.address, cDAIInstance.address],
        [usdcInstance.address, daiInstance.address],
        [cUSDCExchangeRate, cDAIExchangeRate],
      );

      expect(
        JSON.stringify(actualTokenFlows.inflow)
      ).to.equal(
        JSON.stringify(expectedTokenFlowsUnderlying['inflow'])
      );
      expect(
        JSON.stringify(actualTokenFlows.outflow)
      ).to.equal(
        JSON.stringify(expectedTokenFlowsUnderlying['outflow'])
      );
      expect(
        JSON.stringify(actualTokenFlows.tokens)
      ).to.equal(
        JSON.stringify(expectedCombinedTokenArray)
      );
    });
  });
});
