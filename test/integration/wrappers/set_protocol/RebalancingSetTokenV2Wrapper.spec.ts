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
  FixedFeeCalculatorContract,
  LinearAuctionLiquidatorContract,
  OracleWhiteListContract,
  RebalancingSetTokenV2Contract,
  RebalancingSetTokenV2FactoryContract,
  RebalanceAuctionModuleContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  ConstantPriceOracleContract,
} from 'set-protocol-oracles';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import {
  RebalancingSetTokenV2Wrapper
} from '@src/wrappers';
import {
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
  DEFAULT_REBALANCING_NATURAL_UNIT,
  DEFAULT_UNIT_SHARES,
} from '@src/constants';
import {
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  deployBaseContracts,
  deployConstantPriceOracleAsync,
  deployFixedFeeCalculatorAsync,
  deployLinearAuctionLiquidatorContractAsync,
  deployOracleWhiteListAsync,
  deployRebalancingSetTokenV2FactoryContractAsync,
  createDefaultRebalancingSetTokenV2Async,
  deploySetTokenAsync,
  deployTokensSpecifyingDecimals,
  deployWhiteListContract,
  increaseChainTimeAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether
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

describe('RebalancingSetTokenV2Wrapper', () => {
  let core: CoreContract;
  let transferProxy: TransferProxyContract;
  let factory: SetTokenFactoryContract;
  let rebalancingComponentWhiteList: WhiteListContract;
  let wrappedBTC: StandardTokenMockContract;
  let wrappedETH: StandardTokenMockContract;

  let liquidator: LinearAuctionLiquidatorContract;
  let feeCalculator: FixedFeeCalculatorContract;
  let rebalancingFactory: RebalancingSetTokenV2FactoryContract;
  let oracleWhiteList: OracleWhiteListContract;
  let liquidatorWhiteList: WhiteListContract;
  let feeCalculatorWhiteList: WhiteListContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;

  let ethOracleProxy: ConstantPriceOracleContract;
  let btcOracleProxy: ConstantPriceOracleContract;

  let initialEthPrice: BigNumber;
  let initialBtcPrice: BigNumber;

  let rbSetFeeRecipient: string;
  let rbSetEntryFee: BigNumber;
  let rbSetRebalanceFee: BigNumber;

  let rebalancingSetTokenV2Wrapper: RebalancingSetTokenV2Wrapper;

  let setToken: SetTokenContract;
  let rebalancingSetToken: RebalancingSetTokenV2Contract;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy, ,
      factory,
      ,
      rebalanceAuctionModule,
      rebalancingComponentWhiteList,
    ] = await deployBaseContracts(web3);

    initialEthPrice = ether(180);
    initialBtcPrice = ether(9000);

    [wrappedBTC, wrappedETH] = await deployTokensSpecifyingDecimals(2, [8, 18], web3);
    await approveForTransferAsync(
      [wrappedBTC, wrappedETH],
      transferProxy.address
    );
    await addWhiteListedTokenAsync(
      rebalancingComponentWhiteList,
      wrappedBTC.address,
    );
    await addWhiteListedTokenAsync(
      rebalancingComponentWhiteList,
      wrappedETH.address,
    );

    ethOracleProxy = await deployConstantPriceOracleAsync(
      web3,
      initialEthPrice
    );

    btcOracleProxy = await deployConstantPriceOracleAsync(
      web3,
      initialBtcPrice
    );

    oracleWhiteList = await deployOracleWhiteListAsync(
      web3,
      [wrappedETH.address, wrappedBTC.address],
      [ethOracleProxy.address, btcOracleProxy.address],
    );

    liquidator = await deployLinearAuctionLiquidatorContractAsync(
      web3,
      core,
      oracleWhiteList
    );
    liquidatorWhiteList = await deployWhiteListContract(web3, [liquidator.address]);

    feeCalculator = await deployFixedFeeCalculatorAsync(web3);
    feeCalculatorWhiteList = await deployWhiteListContract(web3, [feeCalculator.address]);

    rebalancingFactory = await deployRebalancingSetTokenV2FactoryContractAsync(
      web3,
      core,
      rebalancingComponentWhiteList,
      liquidatorWhiteList,
      feeCalculatorWhiteList
    );

    // Deploy a Set
    const setTokenComponents = [wrappedETH.address, wrappedBTC.address];
    const setTokenUnits = [initialBtcPrice.mul(1e10).div(initialEthPrice).round(0, 3), new BigNumber(1)];
    const naturalUnit = new BigNumber(1e10);
    setToken = await deploySetTokenAsync(
      web3,
      core,
      factory.address,
      setTokenComponents,
      setTokenUnits,
      naturalUnit,
    );

    // Deploy a RB Set
    const managerAddress = DEFAULT_ACCOUNT;
    rbSetFeeRecipient = ACCOUNTS[2].address;
    const rebalanceFeeCalculator = feeCalculator.address;
    const failRebalancePeriod = ONE_DAY_IN_SECONDS;
    const { timestamp } = await web3.eth.getBlock('latest');
    const lastRebalanceTimestamp = new BigNumber(timestamp);
    rbSetEntryFee = ether(.01);
    rbSetRebalanceFee = ether(.02);
    rebalancingSetToken = await createDefaultRebalancingSetTokenV2Async(
      web3,
      core,
      rebalancingFactory.address,
      managerAddress,
      liquidator.address,
      rbSetFeeRecipient,
      rebalanceFeeCalculator,
      setToken.address,
      failRebalancePeriod,
      lastRebalanceTimestamp,
      rbSetEntryFee,
      rbSetRebalanceFee,
    );

    rebalancingSetTokenV2Wrapper = new RebalancingSetTokenV2Wrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('entryFeePaidEvent', async () => {
    let earlyTxnHash: string;
    let earlyBlockNumber: number;

    let subjectFromBlock: number;
    let subjectToBlock: any;
    let subjectRebalancingSetTokenV2: Address;

    let rebalancingSetQuantityToIssue1: BigNumber;
    let rebalancingSetQuantityToIssue2: BigNumber;

    beforeEach(async () => {
      earlyTxnHash = await core.issue.sendTransactionAsync(setToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([setToken], transferProxy.address);

      rebalancingSetQuantityToIssue1 = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1);

      // Issue setToken
      await core.issue.sendTransactionAsync(setToken.address, ether(9), TX_DEFAULTS);
      rebalancingSetQuantityToIssue2 = ether(1);
      const lastTxnHash = await core.issue.sendTransactionAsync(
        rebalancingSetToken.address,
        rebalancingSetQuantityToIssue2,
      );

      const earlyTransaction = await web3.eth.getTransaction(earlyTxnHash);
      earlyBlockNumber = earlyTransaction['blockNumber'];

      const lastTransaction = await web3.eth.getTransaction(lastTxnHash);
      const recentIssueBlockNumber = lastTransaction['blockNumber'];

      subjectFromBlock = earlyBlockNumber;
      subjectToBlock = recentIssueBlockNumber;
      subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetTokenV2Wrapper.entryFeePaidEvent(
        subjectRebalancingSetTokenV2,
        subjectFromBlock,
        subjectToBlock,
      );
    }

    test('retrieves the right event logs length', async () => {
      const events = await subject();

      expect(events.length).to.equal(2);
    });

    test('retrieves the correct first log EntryFeePaid properties', async () => {
      const events = await subject();

      const { returnValues } = events[0];
      const { feeRecipient, feeQuantity } = returnValues;
      expect(feeRecipient).to.equal(rbSetFeeRecipient);
      const expectedFee = rebalancingSetQuantityToIssue1.mul(rbSetEntryFee).div(1e18);
      expect(feeQuantity).to.bignumber.equal(expectedFee);
    });

    test('retrieves the correct second log EntryFeePaid properties', async () => {
      const events = await subject();

      const { returnValues } = events[1];
      const { feeRecipient, feeQuantity } = returnValues;
      expect(feeRecipient).to.equal(rbSetFeeRecipient);
      const expectedFee = rebalancingSetQuantityToIssue2.mul(rbSetEntryFee).div(1e18);
      expect(feeQuantity).to.bignumber.equal(expectedFee);
    });

    describe('when the block range does not contain an event', async () => {
      beforeEach(async () => {
        subjectFromBlock = 0;
        subjectToBlock = earlyBlockNumber - 1;
      });

      test('should return no events', async () => {
        const events = await subject();

        expect(events.length).to.equal(0);
      });
    });
  });

  describe('rebalanceStartedEvent', async () => {
    let earlyTxnHash: string;
    let earlyBlockNumber: number;

    let subjectFromBlock: number;
    let subjectToBlock: any;
    let subjectRebalancingSetTokenV2: Address;

    let rebalancingSetQuantityToIssue1: BigNumber;

    let nextSetToken: SetTokenContract;
    let liquidatorData: string;

    beforeEach(async () => {
      earlyTxnHash = await core.issue.sendTransactionAsync(setToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([setToken], transferProxy.address);

      rebalancingSetQuantityToIssue1 = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1);

      const earlyTransaction = await web3.eth.getTransaction(earlyTxnHash);
      earlyBlockNumber = earlyTransaction['blockNumber'];

      // Deploy a Set
      const setTokenComponents = [wrappedETH.address, wrappedBTC.address];
      const setTokenUnits = [initialBtcPrice.mul(1e10).div(initialEthPrice).round(0, 3), new BigNumber(3)];
      const naturalUnit = new BigNumber(1e10);
      nextSetToken = await deploySetTokenAsync(
        web3,
        core,
        factory.address,
        setTokenComponents,
        setTokenUnits,
        naturalUnit,
      );

      await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS.add(1));
      liquidatorData = '0x00';
      const lastTxnHash = await rebalancingSetToken.startRebalance.sendTransactionAsync(
        nextSetToken.address,
        liquidatorData,
        TX_DEFAULTS,
      );

      const lastTransaction = await web3.eth.getTransaction(lastTxnHash);
      const recentIssueBlockNumber = lastTransaction['blockNumber'];

      subjectFromBlock = earlyBlockNumber;
      subjectToBlock = recentIssueBlockNumber;
      subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetTokenV2Wrapper.rebalanceStartedEvent(
        subjectRebalancingSetTokenV2,
        subjectFromBlock,
        subjectToBlock,
      );
    }

    test('retrieves the right event logs length', async () => {
      const events = await subject();

      expect(events.length).to.equal(1);
    });

    test('retrieves the correct first log RebalanceStarted properties', async () => {
      const events = await subject();

      const { returnValues } = events[0];
      const { oldSet, newSet, rebalanceIndex, currentSetQuantity } = returnValues;
      expect(oldSet).to.equal(setToken.address);
      expect(newSet).to.equal(nextSetToken.address);
      expect(rebalanceIndex).to.bignumber.equal(0);

      const expectedCurrentSet = rebalancingSetQuantityToIssue1
        .mul(DEFAULT_UNIT_SHARES)
        .div(DEFAULT_REBALANCING_NATURAL_UNIT);
      expect(currentSetQuantity).to.bignumber.equal(expectedCurrentSet);
    });
  });

  describe('rebalanceSettledEvent', async () => {
    let earlyTxnHash: string;
    let earlyBlockNumber: number;

    let subjectFromBlock: number;
    let subjectToBlock: any;
    let subjectRebalancingSetTokenV2: Address;

    let rebalancingSetQuantityToIssue1: BigNumber;
    let currentSetQuantity: BigNumber;

    let nextSetToken: SetTokenContract;
    let liquidatorData: string;

    beforeEach(async () => {
      earlyTxnHash = await core.issue.sendTransactionAsync(setToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([setToken], transferProxy.address);

      rebalancingSetQuantityToIssue1 = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1);

      const earlyTransaction = await web3.eth.getTransaction(earlyTxnHash);
      earlyBlockNumber = earlyTransaction['blockNumber'];

      // Deploy a Set
      const setTokenComponents = [wrappedETH.address, wrappedBTC.address];
      const setTokenUnits = [initialBtcPrice.mul(1e10).div(initialEthPrice).round(0, 3), new BigNumber(3)];
      const naturalUnit = new BigNumber(1e10);
      nextSetToken = await deploySetTokenAsync(
        web3,
        core,
        factory.address,
        setTokenComponents,
        setTokenUnits,
        naturalUnit,
      );

      await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS.add(1));
      liquidatorData = '0x00';
      await rebalancingSetToken.startRebalance.sendTransactionAsync(
        nextSetToken.address,
        liquidatorData,
        TX_DEFAULTS,
      );

      currentSetQuantity = rebalancingSetQuantityToIssue1
        .mul(DEFAULT_UNIT_SHARES)
        .div(DEFAULT_REBALANCING_NATURAL_UNIT);
      await rebalanceAuctionModule.bid.sendTransactionAsync(
        rebalancingSetToken.address,
        currentSetQuantity,
        true,
        TX_DEFAULTS
      );

      const lastTxnHash = await rebalancingSetToken.settleRebalance.sendTransactionAsync(
        TX_DEFAULTS,
      );

      const lastTransaction = await web3.eth.getTransaction(lastTxnHash);
      const recentIssueBlockNumber = lastTransaction['blockNumber'];

      subjectFromBlock = earlyBlockNumber;
      subjectToBlock = recentIssueBlockNumber;
      subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      return await rebalancingSetTokenV2Wrapper.rebalanceSettledEvent(
        subjectRebalancingSetTokenV2,
        subjectFromBlock,
        subjectToBlock,
      );
    }

    test('retrieves the right event logs length', async () => {
      const events = await subject();

      expect(events.length).to.equal(1);
    });

    test('retrieves the correct first log RebalanceSettled properties', async () => {
      const events = await subject();

      const { returnValues } = events[0];
      const {
        feeRecipient,
        feeQuantity,
        feePercentage,
        rebalanceIndex,
        unitShares } = returnValues;
      expect(feeRecipient).to.equal(rbSetFeeRecipient);
      expect(rebalanceIndex).to.bignumber.equal(0);
      expect(feePercentage).to.bignumber.equal(rbSetRebalanceFee);
      const expectedUnitShares = await rebalancingSetToken.unitShares.callAsync();
      expect(unitShares).to.bignumber.equal(expectedUnitShares);

      const expectedFeeQuantity = rebalancingSetQuantityToIssue1
                                    .mul(rbSetRebalanceFee)
                                    .div(new BigNumber(1e18).sub(rbSetRebalanceFee)).round(0, 3);
      expect(feeQuantity).to.bignumber.equal(expectedFeeQuantity);
    });
  });
});
