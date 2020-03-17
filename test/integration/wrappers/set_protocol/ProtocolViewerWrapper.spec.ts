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
import * as chai from 'chai';
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import {
  CoreContract,
  CoreHelper,
  ConstantAuctionPriceCurveContract,
  ERC20Helper,
  FeeCalculatorHelper,
  FixedFeeCalculatorContract,
  LinearAuctionLiquidatorContract,
  OracleWhiteListContract,
  PerformanceFeeCalculatorContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenV2Contract,
  RebalancingSetTokenV3Contract,
  RebalancingSetTokenFactoryContract,
  RebalancingSetTokenV2FactoryContract,
  RebalancingSetTokenV3FactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  SocialTradingManagerMockContract,
  StandardTokenMockContract,
  TransferProxyContract,
  ValuationHelper,
  WhiteListContract,
} from 'set-protocol-contracts';
import {
  AssetPairManagerContract,
  MACOStrategyManagerV2Contract,
} from 'set-protocol-strategies';
import {
  ConstantPriceOracleContract,
  OracleHelper,
} from 'set-protocol-oracles';
import { Address } from 'set-protocol-utils';

import { ProtocolViewerWrapper } from '@src/wrappers';
import {
  DEFAULT_ACCOUNT,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
  DEFAULT_UNIT_SHARES,
  DEFAULT_REBALANCING_NATURAL_UNIT,
  ONE_DAY_IN_SECONDS,
  ONE_YEAR_IN_SECONDS,
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
  createDefaultRebalancingSetTokenV2Async,
  createDefaultRebalancingSetTokenV3Async,
  deployAssetPairManagerAsync,
  deployBaseContracts,
  deployConstantAuctionPriceCurveAsync,
  deployConstantPriceOracleAsync,
  deployFixedFeeCalculatorAsync,
  deployLinearAuctionLiquidatorContractAsync,
  deployMovingAverageStrategyManagerV2Async,
  deployOracleWhiteListAsync,
  deployProtocolViewerAsync,
  deployRebalancingSetTokenV2FactoryContractAsync,
  deployRebalancingSetTokenV3FactoryContractAsync,
  deploySetTokenAsync,
  deploySetTokensAsync,
  deploySocialTradingManagerMockAsync,
  deployTokensSpecifyingDecimals,
  deployWhiteListContract,
  increaseChainTimeAsync,
  mineBlockAsync,
  getTokenBalances,
  getTokenSupplies,
  transitionToProposeAsync,
  transitionToRebalanceAsync,
} from '@test/helpers';

import { CompoundHelper } from '@test/helpers/compoundHelper';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;
const coreHelper = new CoreHelper(DEFAULT_ACCOUNT, DEFAULT_ACCOUNT);
const erc20Helper = new ERC20Helper(DEFAULT_ACCOUNT);
const oracleHelper = new OracleHelper(DEFAULT_ACCOUNT);
const valuationHelper = new ValuationHelper(DEFAULT_ACCOUNT, coreHelper, erc20Helper, oracleHelper);
const compoundHelper = new CompoundHelper();
const feeCalculatorHelper = new FeeCalculatorHelper(DEFAULT_ACCOUNT);

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

  describe('Trading Pool V1 Tests', async () => {
    let rebalancingSetTokenV2: RebalancingSetTokenV2Contract;

    let rebalancingFactory: RebalancingSetTokenV2FactoryContract;
    let rebalancingComponentWhiteList: WhiteListContract;
    let liquidatorWhitelist: WhiteListContract;
    let liquidator: LinearAuctionLiquidatorContract;
    let fixedFeeCalculator: FixedFeeCalculatorContract;
    let feeCalculatorWhitelist: WhiteListContract;

    let name: string;
    let auctionPeriod: BigNumber;
    let rangeStart: BigNumber;
    let rangeEnd: BigNumber;
    let oracleWhiteList: OracleWhiteListContract;

    let component1: StandardTokenMockContract;
    let component2: StandardTokenMockContract;

    let component1Price: BigNumber;
    let component2Price: BigNumber;

    let set1: SetTokenContract;
    let set2: SetTokenContract;

    let set1Components: Address[];
    let set1Units: BigNumber[];
    let set1NaturalUnit: BigNumber;

    let set2Components: Address[];
    let set2Units: BigNumber[];
    let set2NaturalUnit: BigNumber;

    let component1Oracle: ConstantPriceOracleContract;
    let component2Oracle: ConstantPriceOracleContract;

    let currentSetTokenV2: SetTokenContract;
    let nextSetTokenV2: SetTokenContract;

    let currentAllocation: BigNumber;
    let lastRebalanceTimestamp: BigNumber;
    let setManager: SocialTradingManagerMockContract;

    const deployerAccount = DEFAULT_ACCOUNT;
    const trader = ACCOUNTS[1].address;
    const allocator = ACCOUNTS[2].address;
    const feeRecipient = ACCOUNTS[3].address;

    beforeEach(async () => {
      [component1, component2] = await deployTokensSpecifyingDecimals(2, [18, 18], web3, DEFAULT_ACCOUNT);
      await approveForTransferAsync([component1, component2], transferProxy.address);

      const component1Decimal = await component1.decimals.callAsync();
      const component2Decimal = await component2.decimals.callAsync();

      set1Components = [component1.address, component2.address];
      set1Units = [new BigNumber(1), new BigNumber(1)];
      const set1NaturalUnitExponent = 18 - Math.min(component1Decimal.toNumber(), component2Decimal.toNumber());
      set1NaturalUnit = new BigNumber(10 ** set1NaturalUnitExponent);

      set2Components = [component1.address, component2.address];
      set2Units = [new BigNumber(2), new BigNumber(3)];
      const set2NaturalUnitExponent = 18 - Math.min(component1Decimal.toNumber(), component2Decimal.toNumber());
      set2NaturalUnit = new BigNumber(2 * 10 ** set2NaturalUnitExponent);

      set1 = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        set1Components,
        set1Units,
        set1NaturalUnit,
      );

      set2 = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        set2Components,
        set2Units,
        set2NaturalUnit,
      );

      component1Price = ether(1);
      component2Price = ether(2);

      component1Oracle = await deployConstantPriceOracleAsync(web3, component1Price);
      component2Oracle = await deployConstantPriceOracleAsync(web3, component2Price);

      oracleWhiteList = await deployOracleWhiteListAsync(
        web3,
        [component1.address, component2.address],
        [component1Oracle.address, component2Oracle.address],
      );

      auctionPeriod = ONE_DAY_IN_SECONDS;
      rangeStart = new BigNumber(10); // 10% above fair value
      rangeEnd = new BigNumber(10); // 10% below fair value
      name = 'liquidator';

      liquidator = await deployLinearAuctionLiquidatorContractAsync(
        web3,
        core,
        oracleWhiteList,
        auctionPeriod,
        rangeStart,
        rangeEnd,
        name,
      );

      fixedFeeCalculator = await deployFixedFeeCalculatorAsync(web3);

      rebalancingComponentWhiteList = await deployWhiteListContract(web3, [component1.address, component2.address]);
      liquidatorWhitelist = await deployWhiteListContract(web3, [liquidator.address]);
      feeCalculatorWhitelist = await deployWhiteListContract(web3, [fixedFeeCalculator.address]);
      rebalancingFactory = await deployRebalancingSetTokenV2FactoryContractAsync(
        web3,
        core,
        rebalancingComponentWhiteList,
        liquidatorWhitelist,
        feeCalculatorWhitelist,
      );

      currentSetTokenV2 = set1;

      setManager = await deploySocialTradingManagerMockAsync(web3);

      const failPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      lastRebalanceTimestamp = new BigNumber(timestamp);

      rebalancingSetTokenV2 = await createDefaultRebalancingSetTokenV2Async(
        web3,
        core,
        rebalancingFactory.address,
        setManager.address,
        liquidator.address,
        feeRecipient,
        fixedFeeCalculator.address,
        currentSetTokenV2.address,
        failPeriod,
        lastRebalanceTimestamp,
      );

      currentAllocation = ether(.6);
      await setManager.updateRecord.sendTransactionAsync(
        rebalancingSetTokenV2.address,
        trader,
        allocator,
        currentAllocation
      );
    });

    describe('#fetchNewTradingPoolDetails', async () => {
      let subjectTradingPool: Address;

      beforeEach(async () => {
        subjectTradingPool = rebalancingSetTokenV2.address;
      });

      async function subject(): Promise<any> {
        return protocolViewerWrapper.fetchNewTradingPoolDetails(
          subjectTradingPool
        );
      }

      it('fetches the correct poolInfo data', async () => {
        const [ poolInfo, , ] = await subject();

        expect(poolInfo.trader).to.equal(trader);
        expect(poolInfo.allocator).to.equal(allocator);
        expect(poolInfo.currentAllocation).to.be.bignumber.equal(currentAllocation);
      });

      it('fetches the correct RebalancingSetTokenV2/TradingPool data', async () => {
        const [ , rbSetData, ] = await subject();

        expect(rbSetData.manager).to.equal(setManager.address);
        expect(rbSetData.feeRecipient).to.equal(feeRecipient);
        expect(rbSetData.currentSet).to.equal(currentSetTokenV2.address);
        expect(rbSetData.name).to.equal('Rebalancing Set Token');
        expect(rbSetData.symbol).to.equal('RBSET');
        expect(rbSetData.unitShares).to.be.bignumber.equal(DEFAULT_UNIT_SHARES);
        expect(rbSetData.naturalUnit).to.be.bignumber.equal(DEFAULT_REBALANCING_NATURAL_UNIT);
        expect(rbSetData.rebalanceInterval).to.be.bignumber.equal(ONE_DAY_IN_SECONDS);
        expect(rbSetData.entryFee).to.be.bignumber.equal(ZERO);
        expect(rbSetData.rebalanceFee).to.be.bignumber.equal(ZERO);
        expect(rbSetData.lastRebalanceTimestamp).to.be.bignumber.equal(lastRebalanceTimestamp);
        expect(rbSetData.rebalanceState).to.be.bignumber.equal(ZERO);
      });

      it('fetches the correct CollateralSet data', async () => {
        const [ , , collateralSetData ] = await subject();

        expect(JSON.stringify(collateralSetData.components)).to.equal(JSON.stringify(set1Components));
        expect(JSON.stringify(collateralSetData.units)).to.equal(JSON.stringify(set1Units));
        expect(collateralSetData.naturalUnit).to.be.bignumber.equal(set1NaturalUnit);
      });
    });

    describe('#fetchTradingPoolRebalanceDetails', async () => {
      let subjectTradingPool: Address;

      let newAllocation: BigNumber;
      beforeEach(async () => {
        // Issue currentSetToken
        await core.issue.sendTransactionAsync(
          currentSetTokenV2.address,
          ether(8),
          {from: deployerAccount}
        );

        await approveForTransferAsync([currentSetTokenV2], transferProxy.address);

        // Use issued currentSetToken to issue rebalancingSetToken
        const rebalancingSetQuantityToIssue = ether(7);
        await core.issue.sendTransactionAsync(rebalancingSetTokenV2.address, rebalancingSetQuantityToIssue);

        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        const liquidatorData = '0x';
        nextSetTokenV2 = set2;
        newAllocation = ether(.4);
        await setManager.rebalance.sendTransactionAsync(
          rebalancingSetTokenV2.address,
          nextSetTokenV2.address,
          newAllocation,
          liquidatorData
        );

        subjectTradingPool = rebalancingSetTokenV2.address;
      });

      async function subject(): Promise<any> {
        return protocolViewerWrapper.fetchTradingPoolRebalanceDetails(
          subjectTradingPool
        );
      }

      it('fetches the correct poolInfo data', async () => {
        const [ poolInfo, , ] = await subject();

        expect(poolInfo.trader).to.equal(trader);
        expect(poolInfo.allocator).to.equal(allocator);
        expect(poolInfo.currentAllocation).to.be.bignumber.equal(newAllocation);
      });

      it('fetches the correct RebalancingSetTokenV2/TradingPool data', async () => {
        const [ , rbSetData, ] = await subject();

        const auctionPriceParams = await rebalancingSetTokenV2.getAuctionPriceParameters.callAsync();
        const startingCurrentSets = await rebalancingSetTokenV2.startingCurrentSetAmount.callAsync();
        const biddingParams = await rebalancingSetTokenV2.getBiddingParameters.callAsync();

        expect(rbSetData.rebalanceStartTime).to.be.bignumber.equal(auctionPriceParams[0]);
        expect(rbSetData.timeToPivot).to.be.bignumber.equal(auctionPriceParams[1]);
        expect(rbSetData.startPrice).to.be.bignumber.equal(auctionPriceParams[2]);
        expect(rbSetData.endPrice).to.be.bignumber.equal(auctionPriceParams[3]);
        expect(rbSetData.startingCurrentSets).to.be.bignumber.equal(startingCurrentSets);
        expect(rbSetData.remainingCurrentSets).to.be.bignumber.equal(biddingParams[1]);
        expect(rbSetData.minimumBid).to.be.bignumber.equal(biddingParams[0]);
        expect(rbSetData.rebalanceState).to.be.bignumber.equal(new BigNumber(2));
        expect(rbSetData.nextSet).to.equal(nextSetTokenV2.address);
        expect(rbSetData.liquidator).to.equal(liquidator.address);
      });

      it('fetches the correct CollateralSet data', async () => {
        const [ , , collateralSetData ] = await subject();

        expect(JSON.stringify(collateralSetData.components)).to.equal(JSON.stringify(set2Components));
        expect(JSON.stringify(collateralSetData.units)).to.equal(JSON.stringify(set2Units));
        expect(collateralSetData.naturalUnit).to.be.bignumber.equal(set2NaturalUnit);
        expect(collateralSetData.name).to.equal('Set Token');
        expect(collateralSetData.symbol).to.equal('SET');
      });
    });

    describe('#batchFetchTradingPoolEntryFees', async () => {
      let subjectTradingPools: Address[];

      let secondRBSetV2: RebalancingSetTokenV2Contract;
      let entryFee: BigNumber;
      beforeEach(async () => {
        const failPeriod = ONE_DAY_IN_SECONDS;
        entryFee = ether(.02);
        secondRBSetV2 = await createDefaultRebalancingSetTokenV2Async(
          web3,
          core,
          rebalancingFactory.address,
          setManager.address,
          liquidator.address,
          feeRecipient,
          fixedFeeCalculator.address,
          currentSetTokenV2.address,
          failPeriod,
          lastRebalanceTimestamp,
          entryFee
        );

        subjectTradingPools = [rebalancingSetTokenV2.address, secondRBSetV2.address];
      });

      async function subject(): Promise<BigNumber[]> {
        return protocolViewerWrapper.batchFetchTradingPoolEntryFees(
          subjectTradingPools
        );
      }

      it('fetches the correct poolInfo data', async () => {
        const entryFees = await subject();
        const expectedEntryFees = [ZERO, entryFee];

        expect(JSON.stringify(entryFees)).to.equal(JSON.stringify(expectedEntryFees));
      });
    });

    describe('#batchFetchTradingPoolRebalanceFees', async () => {
      let subjectTradingPools: Address[];

      let secondRBSetV2: RebalancingSetTokenV2Contract;
      let rebalanceFee: BigNumber;
      beforeEach(async () => {
        const failPeriod = ONE_DAY_IN_SECONDS;
        const entryFee = ether(.02);
        rebalanceFee = ether(.02);
        secondRBSetV2 = await createDefaultRebalancingSetTokenV2Async(
          web3,
          core,
          rebalancingFactory.address,
          setManager.address,
          liquidator.address,
          feeRecipient,
          fixedFeeCalculator.address,
          currentSetTokenV2.address,
          failPeriod,
          lastRebalanceTimestamp,
          entryFee,
          rebalanceFee
        );

        subjectTradingPools = [rebalancingSetTokenV2.address, secondRBSetV2.address];
      });

      async function subject(): Promise<BigNumber[]> {
        return protocolViewerWrapper.batchFetchTradingPoolEntryFees(
          subjectTradingPools
        );
      }

      it('fetches the correct poolInfo data', async () => {
        const rebalanceFees = await subject();
        const expectedRebalanceFees = [ZERO, rebalanceFee];

        expect(JSON.stringify(rebalanceFees)).to.equal(JSON.stringify(expectedRebalanceFees));
      });
    });

    describe('#batchFetchTradingPoolOperator', async () => {
      let subjectTradingPools: Address[];

      let secondRBSetV2: RebalancingSetTokenV2Contract;
      let secondOperatorAddress: Address;

      beforeEach(async () => {
        const failPeriod = ONE_DAY_IN_SECONDS;
        const entryFee = ether(.02);
        const rebalanceFee = ether(.02);
        secondOperatorAddress = feeRecipient;
        secondRBSetV2 = await createDefaultRebalancingSetTokenV2Async(
          web3,
          core,
          rebalancingFactory.address,
          setManager.address,
          liquidator.address,
          feeRecipient,
          fixedFeeCalculator.address,
          currentSetTokenV2.address,
          failPeriod,
          lastRebalanceTimestamp,
          entryFee,
          rebalanceFee
        );

        const currentAllocation = ether(.5);
        await setManager.updateRecord.sendTransactionAsync(
          secondRBSetV2.address,
          secondOperatorAddress,
          allocator,
          currentAllocation
        );

        subjectTradingPools = [rebalancingSetTokenV2.address, secondRBSetV2.address];
      });

      async function subject(): Promise<string[]> {
        return protocolViewerWrapper.batchFetchTradingPoolOperator(
          subjectTradingPools
        );
      }

      it('fetches the correct operator addresses', async () => {
        const operators = await subject();
        const expectedOperators = [trader, secondOperatorAddress];

        expect(JSON.stringify(operators)).to.equal(JSON.stringify(expectedOperators));
      });
    });
  });

  describe('Trading Pool V2 Tests', async () => {
    let rebalancingSetTokenV3: RebalancingSetTokenV3Contract;

    let rebalancingFactory: RebalancingSetTokenV3FactoryContract;
    let rebalancingComponentWhiteList: WhiteListContract;
    let liquidatorWhitelist: WhiteListContract;
    let liquidator: LinearAuctionLiquidatorContract;
    let performanceFeeCalculator: PerformanceFeeCalculatorContract;
    let feeCalculatorWhitelist: WhiteListContract;

    let name: string;
    let auctionPeriod: BigNumber;
    let rangeStart: BigNumber;
    let rangeEnd: BigNumber;
    let oracleWhiteList: OracleWhiteListContract;

    let component1: StandardTokenMockContract;
    let component2: StandardTokenMockContract;

    let component1Price: BigNumber;
    let component2Price: BigNumber;

    let set1: SetTokenContract;
    let set2: SetTokenContract;

    let set1Components: Address[];
    let set1Units: BigNumber[];
    let set1NaturalUnit: BigNumber;

    let set2Components: Address[];
    let set2Units: BigNumber[];
    let set2NaturalUnit: BigNumber;

    let component1Oracle: ConstantPriceOracleContract;
    let component2Oracle: ConstantPriceOracleContract;

    let currentSetTokenV3: SetTokenContract;
    let nextSetTokenV3: SetTokenContract;

    let currentAllocation: BigNumber;
    let lastRebalanceTimestamp: BigNumber;
    let setManager: SocialTradingManagerMockContract;

    const deployerAccount = DEFAULT_ACCOUNT;
    const trader = ACCOUNTS[1].address;
    const allocator = ACCOUNTS[2].address;
    const feeRecipient = ACCOUNTS[3].address;

    beforeEach(async () => {
      [component1, component2] = await deployTokensSpecifyingDecimals(2, [18, 18], web3, DEFAULT_ACCOUNT);
      await approveForTransferAsync([component1, component2], transferProxy.address);

      const component1Decimal = await component1.decimals.callAsync();
      const component2Decimal = await component2.decimals.callAsync();

      set1Components = [component1.address, component2.address];
      set1Units = [new BigNumber(1), new BigNumber(1)];
      const set1NaturalUnitExponent = 18 - Math.min(component1Decimal.toNumber(), component2Decimal.toNumber());
      set1NaturalUnit = new BigNumber(10 ** set1NaturalUnitExponent);

      set2Components = [component1.address, component2.address];
      set2Units = [new BigNumber(2), new BigNumber(3)];
      const set2NaturalUnitExponent = 18 - Math.min(component1Decimal.toNumber(), component2Decimal.toNumber());
      set2NaturalUnit = new BigNumber(2 * 10 ** set2NaturalUnitExponent);

      set1 = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        set1Components,
        set1Units,
        set1NaturalUnit,
      );

      set2 = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        set2Components,
        set2Units,
        set2NaturalUnit,
      );

      component1Price = ether(1);
      component2Price = ether(2);

      component1Oracle = await deployConstantPriceOracleAsync(web3, component1Price);
      component2Oracle = await deployConstantPriceOracleAsync(web3, component2Price);

      oracleWhiteList = await deployOracleWhiteListAsync(
        web3,
        [component1.address, component2.address],
        [component1Oracle.address, component2Oracle.address],
      );

      auctionPeriod = ONE_DAY_IN_SECONDS;
      rangeStart = new BigNumber(10); // 10% above fair value
      rangeEnd = new BigNumber(10); // 10% below fair value
      name = 'liquidator';

      liquidator = await deployLinearAuctionLiquidatorContractAsync(
        web3,
        core,
        oracleWhiteList,
        auctionPeriod,
        rangeStart,
        rangeEnd,
        name,
      );

      const maxProfitFeePercentage = ether(.5);
      const maxStreamingFeePercentage = ether(.1);
      performanceFeeCalculator = await feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(
        core.address,
        oracleWhiteList.address,
        maxProfitFeePercentage,
        maxStreamingFeePercentage,
      );

      rebalancingComponentWhiteList = await deployWhiteListContract(web3, [component1.address, component2.address]);
      liquidatorWhitelist = await deployWhiteListContract(web3, [liquidator.address]);
      feeCalculatorWhitelist = await deployWhiteListContract(web3, [performanceFeeCalculator.address]);
      rebalancingFactory = await deployRebalancingSetTokenV3FactoryContractAsync(
        web3,
        core,
        rebalancingComponentWhiteList,
        liquidatorWhitelist,
        feeCalculatorWhitelist,
      );

      currentSetTokenV3 = set1;

      setManager = await deploySocialTradingManagerMockAsync(web3);

      const failPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      lastRebalanceTimestamp = new BigNumber(timestamp);

      rebalancingSetTokenV3 = await createDefaultRebalancingSetTokenV3Async(
        web3,
        core,
        rebalancingFactory.address,
        setManager.address,
        liquidator.address,
        feeRecipient,
        performanceFeeCalculator.address,
        currentSetTokenV3.address,
        failPeriod,
        lastRebalanceTimestamp,
      );

      currentAllocation = ether(.6);
      await setManager.updateRecord.sendTransactionAsync(
        rebalancingSetTokenV3.address,
        trader,
        allocator,
        currentAllocation
      );
    });

    describe('#fetchNewTradingPoolV2Details', async () => {
      let subjectTradingPool: Address;

      beforeEach(async () => {
        subjectTradingPool = rebalancingSetTokenV3.address;
      });

      async function subject(): Promise<any> {
        return protocolViewerWrapper.fetchNewTradingPoolV2Details(
          subjectTradingPool
        );
      }

      it('fetches the correct poolInfo data', async () => {
        const [ poolInfo, , ] = await subject();

        expect(poolInfo.trader).to.equal(trader);
        expect(poolInfo.allocator).to.equal(allocator);
        expect(poolInfo.currentAllocation).to.be.bignumber.equal(currentAllocation);
      });

      it('fetches the correct RebalancingSetTokenV3/TradingPool data', async () => {
        const [ , rbSetData, , , ] = await subject();

        expect(rbSetData.manager).to.equal(setManager.address);
        expect(rbSetData.feeRecipient).to.equal(feeRecipient);
        expect(rbSetData.currentSet).to.equal(currentSetTokenV3.address);
        expect(rbSetData.name).to.equal('Rebalancing Set Token');
        expect(rbSetData.symbol).to.equal('RBSET');
        expect(rbSetData.unitShares).to.be.bignumber.equal(DEFAULT_UNIT_SHARES);
        expect(rbSetData.naturalUnit).to.be.bignumber.equal(DEFAULT_REBALANCING_NATURAL_UNIT);
        expect(rbSetData.rebalanceInterval).to.be.bignumber.equal(ONE_DAY_IN_SECONDS);
        expect(rbSetData.entryFee).to.be.bignumber.equal(ZERO);
        expect(rbSetData.rebalanceFee).to.be.bignumber.equal(ZERO);
        expect(rbSetData.lastRebalanceTimestamp).to.be.bignumber.equal(lastRebalanceTimestamp);
        expect(rbSetData.rebalanceState).to.be.bignumber.equal(ZERO);
      });

      it('fetches the correct RebalancingSetTokenV3/Performance Fee data', async () => {
        const [ , , performanceFeeState, , ] = await subject();
        const [
          profitFeePeriod,
          highWatermarkResetPeriod,
          profitFeePercentage,
          streamingFeePercentage,
          highWatermark,
          lastProfitFeeTimestamp,
          lastStreamingFeeTimestamp,
        ] = performanceFeeState;

        const expectedFeeStates: any = await performanceFeeCalculator.feeState.callAsync(rebalancingSetTokenV3.address);

        expect(profitFeePeriod).to.equal(expectedFeeStates.profitFeePeriod);
        expect(highWatermarkResetPeriod).to.equal(expectedFeeStates.highWatermarkResetPeriod);
        expect(profitFeePercentage).to.equal(expectedFeeStates.profitFeePercentage);
        expect(streamingFeePercentage).to.equal(expectedFeeStates.streamingFeePercentage);
        expect(highWatermark).to.equal(expectedFeeStates.highWatermark);
        expect(lastProfitFeeTimestamp).to.equal(expectedFeeStates.lastProfitFeeTimestamp);
        expect(lastStreamingFeeTimestamp).to.equal(expectedFeeStates.lastStreamingFeeTimestamp);
      });

      it('fetches the correct CollateralSet data', async () => {
        const [ , , , collateralSetData, ] = await subject();

        expect(JSON.stringify(collateralSetData.components)).to.equal(JSON.stringify(set1Components));
        expect(JSON.stringify(collateralSetData.units)).to.equal(JSON.stringify(set1Units));
        expect(collateralSetData.naturalUnit).to.be.bignumber.equal(set1NaturalUnit);
      });

      it('fetches the correct PerformanceFeeCalculator address', async () => {
        const [ , , , , performanceFeeCalculatorAddress ] = await subject();

        expect(performanceFeeCalculatorAddress).to.equal(performanceFeeCalculator.address);
      });
    });

    describe('#fetchTradingPoolRebalanceDetails', async () => {
      let subjectTradingPool: Address;

      let newAllocation: BigNumber;
      beforeEach(async () => {
        // Issue currentSetToken
        await core.issue.sendTransactionAsync(
          currentSetTokenV3.address,
          ether(8),
          {from: deployerAccount}
        );

        await approveForTransferAsync([currentSetTokenV3], transferProxy.address);

        // Use issued currentSetToken to issue rebalancingSetToken
        const rebalancingSetQuantityToIssue = ether(7);
        await core.issue.sendTransactionAsync(rebalancingSetTokenV3.address, rebalancingSetQuantityToIssue);

        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

        const liquidatorData = '0x';
        nextSetTokenV3 = set2;
        newAllocation = ether(.4);
        await setManager.rebalance.sendTransactionAsync(
          rebalancingSetTokenV3.address,
          nextSetTokenV3.address,
          newAllocation,
          liquidatorData
        );

        subjectTradingPool = rebalancingSetTokenV3.address;
      });

      async function subject(): Promise<any> {
        return protocolViewerWrapper.fetchTradingPoolRebalanceDetails(
          subjectTradingPool
        );
      }

      it('fetches the correct poolInfo data', async () => {
        const [ poolInfo, , ] = await subject();

        expect(poolInfo.trader).to.equal(trader);
        expect(poolInfo.allocator).to.equal(allocator);
        expect(poolInfo.currentAllocation).to.be.bignumber.equal(newAllocation);
      });

      it('fetches the correct RebalancingSetTokenV3/TradingPool data', async () => {
        const [ , rbSetData, ] = await subject();

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
        expect(rbSetData.nextSet).to.equal(nextSetTokenV3.address);
        expect(rbSetData.liquidator).to.equal(liquidator.address);
      });

      it('fetches the correct CollateralSet data', async () => {
        const [ , , collateralSetData ] = await subject();

        expect(JSON.stringify(collateralSetData.components)).to.equal(JSON.stringify(set2Components));
        expect(JSON.stringify(collateralSetData.units)).to.equal(JSON.stringify(set2Units));
        expect(collateralSetData.naturalUnit).to.be.bignumber.equal(set2NaturalUnit);
        expect(collateralSetData.name).to.equal('Set Token');
        expect(collateralSetData.symbol).to.equal('SET');
      });
    });

    describe('#batchFetchTradingPoolAccumulation', async () => {
      let subjectTradingPools: Address[];

      let secondRBSetV3: RebalancingSetTokenV3Contract;
      let secondEntryFee: BigNumber;
      let secondProfitFee: BigNumber;
      let secondStreamingFee: BigNumber;

      let subjectIncreaseChainTime: BigNumber;

      beforeEach(async () => {
        const failPeriod = ONE_DAY_IN_SECONDS;
        secondEntryFee = ether(.01);
        secondProfitFee = ether(.2);
        secondStreamingFee = ether(.02);
        secondRBSetV3 = await await createDefaultRebalancingSetTokenV3Async(
          web3,
          core,
          rebalancingFactory.address,
          setManager.address,
          liquidator.address,
          trader,
          performanceFeeCalculator.address,
          currentSetTokenV3.address,
          failPeriod,
          lastRebalanceTimestamp,
          secondEntryFee,
          secondProfitFee,
          secondStreamingFee,
        );

        subjectTradingPools = [rebalancingSetTokenV3.address, secondRBSetV3.address];
        subjectIncreaseChainTime = ONE_YEAR_IN_SECONDS;
      });

      async function subject(): Promise<string[]> {
        await increaseChainTimeAsync(web3, subjectIncreaseChainTime);
        await mineBlockAsync(web3);
        return protocolViewerWrapper.batchFetchTradingPoolAccumulation(
          subjectTradingPools
        );
      }

      it('fetches the correct profit/streaming fee accumulation array', async () => {
        const feeState1: any = await performanceFeeCalculator.feeState.callAsync(rebalancingSetTokenV3.address);
        const feeState2: any = await performanceFeeCalculator.feeState.callAsync(secondRBSetV3.address);

        const [
          actualStreamingFeeArray,
          actualProfitFeeArray,
        ] = await subject();

        const lastBlock = await web3.eth.getBlock('latest');

        const rebalancingSetValue1 = await valuationHelper.calculateRebalancingSetTokenValueAsync(
          rebalancingSetTokenV3,
          oracleWhiteList,
        );
        const rebalancingSetValue2 = await valuationHelper.calculateRebalancingSetTokenValueAsync(
          secondRBSetV3,
          oracleWhiteList,
        );
        const expectedStreamingFee1 = await feeCalculatorHelper.calculateAccruedStreamingFee(
          feeState1.streamingFeePercentage,
          new BigNumber(lastBlock.timestamp).sub(feeState1.lastStreamingFeeTimestamp)
        );
        const expectedStreamingFee2 = await feeCalculatorHelper.calculateAccruedStreamingFee(
          feeState2.streamingFeePercentage,
          new BigNumber(lastBlock.timestamp).sub(feeState2.lastStreamingFeeTimestamp)
        );

        const expectedProfitFee1 = await feeCalculatorHelper.calculateAccruedProfitFeeAsync(
          feeState1,
          rebalancingSetValue1,
          new BigNumber(lastBlock.timestamp)
        );
        const expectedProfitFee2 = await feeCalculatorHelper.calculateAccruedProfitFeeAsync(
          feeState2,
          rebalancingSetValue2,
          new BigNumber(lastBlock.timestamp)
        );

        const expectedStreamingFeeArray = [expectedStreamingFee1, expectedStreamingFee2];
        const expectedProfitFeeArray = [expectedProfitFee1, expectedProfitFee2];

        expect(JSON.stringify(actualStreamingFeeArray)).to.equal(JSON.stringify(expectedStreamingFeeArray));
        expect(JSON.stringify(actualProfitFeeArray)).to.equal(JSON.stringify(expectedProfitFeeArray));
      });
    });

    describe('#batchFetchTradingPoolFeeState', async () => {
      let subjectTradingPools: Address[];

      let secondRBSetV3: RebalancingSetTokenV3Contract;
      let secondEntryFee: BigNumber;
      let secondProfitFee: BigNumber;
      let secondStreamingFee: BigNumber;

      let subjectIncreaseChainTime: BigNumber;

      beforeEach(async () => {
        const failPeriod = ONE_DAY_IN_SECONDS;
        secondEntryFee = ether(.01);
        secondProfitFee = ether(.2);
        secondStreamingFee = ether(.02);
        secondRBSetV3 = await await createDefaultRebalancingSetTokenV3Async(
          web3,
          core,
          rebalancingFactory.address,
          setManager.address,
          liquidator.address,
          trader,
          performanceFeeCalculator.address,
          currentSetTokenV3.address,
          failPeriod,
          lastRebalanceTimestamp,
          secondEntryFee,
          secondProfitFee,
          secondStreamingFee,
        );

        subjectTradingPools = [rebalancingSetTokenV3.address, secondRBSetV3.address];
        subjectIncreaseChainTime = ONE_YEAR_IN_SECONDS;
      });

      async function subject(): Promise<any[]> {
        await increaseChainTimeAsync(web3, subjectIncreaseChainTime);
        await mineBlockAsync(web3);
        return protocolViewerWrapper.batchFetchTradingPoolFeeState(
          subjectTradingPools
        );
      }

      it('fetches the correct performanceFee array', async () => {
        const tradingPoolFeeStates = await subject();

        const firstFeeState: any = await performanceFeeCalculator.feeState.callAsync(rebalancingSetTokenV3.address);
        const secondFeeState: any = await performanceFeeCalculator.feeState.callAsync(
          secondRBSetV3.address
        );

        const expectedFeeStateInfo = _.map([firstFeeState, secondFeeState], feeStates =>
          [
            feeStates.profitFeePeriod,
            feeStates.highWatermarkResetPeriod,
            feeStates.profitFeePercentage,
            feeStates.streamingFeePercentage,
            feeStates.highWatermark,
            feeStates.lastProfitFeeTimestamp,
            feeStates.lastStreamingFeeTimestamp,
          ]
        );

        expect(JSON.stringify(tradingPoolFeeStates)).to.equal(JSON.stringify(expectedFeeStateInfo));
      });
    });
  });

  describe('#batchFetchExchangeRateStored', async () => {
    let cUSDCAddress: Address;
    let cDAIAddress: Address;

    let subjectCTokenAddresses: Address[];

    beforeEach(async () => {
      const usdcDecimals = 6;
      const daiDecimals = 18;
      const underlyingInstances = await deployTokensSpecifyingDecimals(
        2,
        [usdcDecimals, daiDecimals],
        web3,
      );

      const usdcInstance = underlyingInstances[0];
      const daiInstance = underlyingInstances[1];

      cUSDCAddress = await compoundHelper.deployMockCUSDC(usdcInstance.address, DEFAULT_ACCOUNT);
      await compoundHelper.enableCToken(cUSDCAddress);
      // Set the Borrow Rate
      await compoundHelper.setBorrowRate(cUSDCAddress, new BigNumber('43084603999'));

      cDAIAddress = await compoundHelper.deployMockCDAI(daiInstance.address, DEFAULT_ACCOUNT);
      await compoundHelper.enableCToken(cDAIAddress);
      // Set the Borrow Rate
      await compoundHelper.setBorrowRate(cDAIAddress, new BigNumber('29313252165'));

      subjectCTokenAddresses = [cUSDCAddress, cDAIAddress];
    });

    async function subject(): Promise<BigNumber[]> {
      return protocolViewerWrapper.batchFetchExchangeRateStored(
        subjectCTokenAddresses
      );
    }

    it('fetches the correct exchangeRates data', async () => {
      const exchangeRates = await subject();
      const cUSDCExchangeRate = await compoundHelper.getExchangeRate(cUSDCAddress);
      const cDAIExchangeRate = await compoundHelper.getExchangeRate(cDAIAddress);

      const expectedExchangeRates = [cUSDCExchangeRate, cDAIExchangeRate];
      expect(JSON.stringify(exchangeRates)).to.equal(JSON.stringify(expectedExchangeRates));
    });
  });

  describe('#batchFetchMACOV2CrossoverTimestamp', async () => {
    let macoManager1: MACOStrategyManagerV2Contract;
    let macoManager2: MACOStrategyManagerV2Contract;

    let subjectManagerAddresses: Address[];

    beforeEach(async () => {
      // Set up MACO manager
      const [usdc, wrappedETH] = await deployTokensSpecifyingDecimals(2, [6, 18], web3, DEFAULT_ACCOUNT);
      const initialStableCollateral = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        [usdc.address],
        [new BigNumber(250)],
        new BigNumber(10 ** 12),
      );
      const initialRiskCollateral = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        [wrappedETH.address],
        [new BigNumber(10 ** 6)],
        new BigNumber(10 ** 6),
      );

      macoManager1 = await deployMovingAverageStrategyManagerV2Async(
        web3,
        core.address,
        DEFAULT_ACCOUNT,
        DEFAULT_ACCOUNT,
        usdc.address,
        wrappedETH.address,
        initialStableCollateral.address,
        initialRiskCollateral.address,
        setTokenFactory.address,
        priceCurve.address,
        new BigNumber(20),
        new BigNumber(3600),
        new BigNumber(0),
        new BigNumber(3600),
      );

      macoManager2 = await deployMovingAverageStrategyManagerV2Async(
        web3,
        core.address,
        DEFAULT_ACCOUNT,
        DEFAULT_ACCOUNT,
        usdc.address,
        wrappedETH.address,
        initialStableCollateral.address,
        initialRiskCollateral.address,
        setTokenFactory.address,
        priceCurve.address,
        new BigNumber(20),
        new BigNumber(3600),
        new BigNumber(0),
        new BigNumber(3600),
      );

      subjectManagerAddresses = [macoManager1.address, macoManager2.address];
    });

    async function subject(): Promise<BigNumber[]> {
      return protocolViewerWrapper.batchFetchMACOV2CrossoverTimestamp(
        subjectManagerAddresses
      );
    }

    it('fetches the lastCrossoverConfirmationTimestamp of the MACO Managers', async () => {
      const actualCrossoverArray = await subject();

      const expectedCrossoverArray = [new BigNumber(0), new BigNumber(0)];
      expect(JSON.stringify(actualCrossoverArray)).to.equal(JSON.stringify(expectedCrossoverArray));
    });
  });

  describe('#batchFetchAssetPairCrossoverTimestamp', async () => {
    let assetPairManager1: AssetPairManagerContract;
    let assetPairManager2: AssetPairManagerContract;

    let subjectManagerAddresses: Address[];

    beforeEach(async () => {
      assetPairManager1 = await deployAssetPairManagerAsync(
        web3,
        core.address,
        DEFAULT_ACCOUNT,
        DEFAULT_ACCOUNT,
        priceCurve.address,
        new BigNumber(100),
        new BigNumber(100),
        new BigNumber(100),
        new BigNumber(3600),
        new BigNumber(3),
        new BigNumber(21),
        new BigNumber(0),
        new BigNumber(3600)
      );

      assetPairManager2 = await deployAssetPairManagerAsync(
        web3,
        core.address,
        DEFAULT_ACCOUNT,
        DEFAULT_ACCOUNT,
        priceCurve.address,
        new BigNumber(100),
        new BigNumber(100),
        new BigNumber(100),
        new BigNumber(3600),
        new BigNumber(3),
        new BigNumber(21),
        new BigNumber(0),
        new BigNumber(3600)
      );

      subjectManagerAddresses = [assetPairManager1.address, assetPairManager2.address];
    });

    async function subject(): Promise<BigNumber[]> {
      return protocolViewerWrapper.batchFetchAssetPairCrossoverTimestamp(
        subjectManagerAddresses
      );
    }

    it('fetches the lastCrossoverConfirmationTimestamp of the MACO Managers', async () => {
      const actualCrossoverArray = await subject();

      const expectedCrossoverArray = [new BigNumber(0), new BigNumber(0)];
      expect(JSON.stringify(actualCrossoverArray)).to.equal(JSON.stringify(expectedCrossoverArray));
    });
  });
});
