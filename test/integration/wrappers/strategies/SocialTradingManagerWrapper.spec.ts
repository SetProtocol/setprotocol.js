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
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import {
  Core,
  CoreContract,
  FixedFeeCalculatorContract,
  LinearAuctionLiquidatorContract,
  OracleWhiteListContract,
  SetTokenContract,
  RebalancingSetTokenV2Contract,
  RebalancingSetTokenV2FactoryContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  ConstantPriceOracleContract,
  SocialAllocatorContract,
  SocialTradingManagerContract
} from 'set-protocol-strategies';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { SocialTradingManagerWrapper } from '@src/wrappers';
import {
  ONE_DAY_IN_SECONDS,
  TX_DEFAULTS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS
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
  deploySocialAllocatorAsync,
  deploySocialTradingManagerAsync,
  deployTokensSpecifyingDecimals,
  deployWhiteListContract,
  increaseChainTimeAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether,
  extractNewSetTokenAddressFromLogs,
  getFormattedLogsFromTxHash
} from '@src/util';
import { Address, Bytes } from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const { SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;

describe('SocialTradingManagerWrapper', () => {
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

  let ethOracleProxy: ConstantPriceOracleContract;
  let btcOracleProxy: ConstantPriceOracleContract;

  let allocator: SocialAllocatorContract;

  let initialEthPrice: BigNumber;
  let initialBtcPrice: BigNumber;
  let pricePrecision: BigNumber;

  let setManager: SocialTradingManagerContract;

  let socialTradingManagerWrapper: SocialTradingManagerWrapper;

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
      transferProxy, ,
      factory,
      , ,
      rebalancingComponentWhiteList,
    ] = await deployBaseContracts(web3);

    initialEthPrice = ether(180);
    initialBtcPrice = ether(9000);

    [wrappedBTC, wrappedETH] = await deployTokensSpecifyingDecimals(2, [8, 18], web3, DEFAULT_ACCOUNT);
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

    pricePrecision = new BigNumber(100);
    const collateralName = SetUtils.stringToBytes('Collateral');
    const collateralSymbol = SetUtils.stringToBytes('COL');
    allocator = await deploySocialAllocatorAsync(
      web3,
      wrappedETH.address,
      wrappedBTC.address,
      oracleWhiteList.address,
      core.address,
      factory.address,
      pricePrecision,
      collateralName,
      collateralSymbol
    );

    setManager = await deploySocialTradingManagerAsync(
      web3,
      core.address,
      rebalancingFactory.address,
      [allocator.address]
    );

    socialTradingManagerWrapper = new SocialTradingManagerWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('createTradingPool', async () => {
    let subjectManager: Address;
    let subjectAllocator: Address;
    let subjectStartingBaseAssetAllocation: BigNumber;
    let subjectStartingUSDValue: BigNumber;
    let subjectTradingPoolName: Bytes;
    let subjectTradingPoolSymbol: Bytes;
    let subjectRebalancingSetCallData: Bytes;
    let subjectCaller: Address;

    let poolName: string;
    let poolSymbol: string;

    beforeEach(async () => {
      poolName = 'CoolPool';
      poolSymbol = 'COOL';

      subjectManager = setManager.address;
      subjectAllocator = allocator.address;
      subjectStartingBaseAssetAllocation = ether(0.72);
      subjectStartingUSDValue = ether(100);
      subjectTradingPoolName = SetUtils.stringToBytes(poolName);
      subjectTradingPoolSymbol = SetUtils.stringToBytes(poolSymbol);

      const callDataManagerAddress = setManager.address;
      const callDataLiquidator = liquidator;
      const callDataFeeRecipient = DEFAULT_ACCOUNT;
      const callRebalanceFeeCalculator = feeCalculator.address;
      const callDataRebalanceInterval = ONE_DAY_IN_SECONDS;
      const callDataFailAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const callDataLastRebalanceTimestamp = new BigNumber(timestamp);
      const callDataEntryFee = ether(.01);
      const rebalanceFee = ether(.01);
      const callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
      subjectRebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(
        callDataManagerAddress,
        callDataLiquidator.address,
        callDataFeeRecipient,
        callRebalanceFeeCalculator,
        callDataRebalanceInterval,
        callDataFailAuctionPeriod,
        callDataLastRebalanceTimestamp,
        callDataEntryFee,
        callDataRebalanceFeeCallData,
      );
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await socialTradingManagerWrapper.createTradingPool(
        subjectManager,
        subjectAllocator,
        subjectStartingBaseAssetAllocation,
        subjectStartingUSDValue,
        subjectTradingPoolName,
        subjectTradingPoolSymbol,
        subjectRebalancingSetCallData,
        { from: subjectCaller }
      );
    }

    test('successfully creates poolInfo', async () => {
      const txHash = await subject();

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
      const poolInfo: any = await setManager.pools.callAsync(tradingPoolAddress);

      expect(poolInfo.trader).to.equal(subjectCaller);
      expect(poolInfo.allocator).to.equal(subjectAllocator);
      expect(poolInfo.currentAllocation).to.be.bignumber.equal(subjectStartingBaseAssetAllocation);
    });

    test('successfully creates tradingPool', async () => {
      const txHash = await subject();

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
      const tradingPoolInstance = await RebalancingSetTokenV2Contract.at(
        tradingPoolAddress,
        web3,
        TX_DEFAULTS
      );

      const actualName = await tradingPoolInstance.name.callAsync();
      const actualSymbol = await tradingPoolInstance.symbol.callAsync();

      expect(actualName).to.equal(poolName);
      expect(actualSymbol).to.equal(poolSymbol);
    });
  });

  describe('updateAllocation', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewAllocation: BigNumber;
    let subjectLiquidatorData: Bytes;
    let subjectCaller: Address;

    beforeEach(async () => {
      const managerAddress = setManager.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(.95);
      const startingUSDValue = ether(100);
      const tradingPoolName = SetUtils.stringToBytes('CoolPool');
      const tradingPoolSymbol = SetUtils.stringToBytes('COOL');

      const callDataManagerAddress = setManager.address;
      const callDataLiquidator = liquidator;
      const callDataFeeRecipient = DEFAULT_ACCOUNT;
      const callRebalanceFeeCalculator = feeCalculator.address;
      const callDataRebalanceInterval = ONE_DAY_IN_SECONDS;
      const callDataFailAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const callDataLastRebalanceTimestamp = new BigNumber(timestamp);
      const callDataEntryFee = ether(.01);
      const rebalanceFee = ether(.01);
      const callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
      const rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(
        callDataManagerAddress,
        callDataLiquidator.address,
        callDataFeeRecipient,
        callRebalanceFeeCalculator,
        callDataRebalanceInterval,
        callDataFailAuctionPeriod,
        callDataLastRebalanceTimestamp,
        callDataEntryFee,
        callDataRebalanceFeeCallData,
      );

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingManagerWrapper.createTradingPool(
        managerAddress,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        rebalancingSetCallData,
        { from: subjectCaller }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const collateralAddress = extractNewSetTokenAddressFromLogs(formattedLogs, 2);
      const collateralInstance = await SetTokenContract.at(
        collateralAddress,
        web3,
        TX_DEFAULTS
      );

      await collateralInstance.approve.sendTransactionAsync(
        transferProxy.address,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        { from: subjectCaller }
      );

      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectNewAllocation = ether(.75);
      subjectLiquidatorData = SetUtils.stringToBytes('');

      await core.issue.sendTransactionAsync(collateralAddress, ether(2), { from: subjectCaller });
      await core.issue.sendTransactionAsync(subjectTradingPool, ether(2), { from: subjectCaller });

      await increaseChainTimeAsync(web3, callDataRebalanceInterval);
    });

    async function subject(): Promise<string> {
      return await socialTradingManagerWrapper.updateAllocation(
        subjectManager,
        subjectTradingPool,
        subjectNewAllocation,
        subjectLiquidatorData,
        { from: subjectCaller }
      );
    }

    test('successfully updates tradingPool allocation', async () => {
      await subject();

      const poolInfo: any = await setManager.pools.callAsync(subjectTradingPool);

      expect(poolInfo.currentAllocation).to.be.bignumber.equal(subjectNewAllocation);
    });
  });

  describe('initiateEntryFeeChange', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewEntryFee: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const managerAddress = setManager.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = SetUtils.stringToBytes('CoolPool');
      const tradingPoolSymbol = SetUtils.stringToBytes('COOL');

      const callDataManagerAddress = setManager.address;
      const callDataLiquidator = liquidator;
      const callDataFeeRecipient = DEFAULT_ACCOUNT;
      const callRebalanceFeeCalculator = feeCalculator.address;
      const callDataRebalanceInterval = ONE_DAY_IN_SECONDS;
      const callDataFailAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const callDataLastRebalanceTimestamp = new BigNumber(timestamp);
      const callDataEntryFee = ether(.01);
      const rebalanceFee = ether(.01);
      const callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
      const rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(
        callDataManagerAddress,
        callDataLiquidator.address,
        callDataFeeRecipient,
        callRebalanceFeeCalculator,
        callDataRebalanceInterval,
        callDataFailAuctionPeriod,
        callDataLastRebalanceTimestamp,
        callDataEntryFee,
        callDataRebalanceFeeCallData,
      );

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingManagerWrapper.createTradingPool(
        managerAddress,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        rebalancingSetCallData,
        { from: subjectCaller }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectNewEntryFee = ether(.02);
    });

    async function subject(): Promise<string> {
      return await socialTradingManagerWrapper.initiateEntryFeeChange(
        subjectManager,
        subjectTradingPool,
        subjectNewEntryFee,
        { from: subjectCaller }
      );
    }

    test('successfully updates tradingPool newEntryFee', async () => {
      await subject();

      const poolInfo: any = await setManager.pools.callAsync(subjectTradingPool);

      expect(poolInfo.newEntryFee).to.be.bignumber.equal(subjectNewEntryFee);
    });
  });

  describe('finalizeEntryFeeChange', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectCaller: Address;

    let newEntryFee: BigNumber;

    beforeEach(async () => {
      const managerAddress = setManager.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = SetUtils.stringToBytes('CoolPool');
      const tradingPoolSymbol = SetUtils.stringToBytes('COOL');

      const callDataManagerAddress = setManager.address;
      const callDataLiquidator = liquidator;
      const callDataFeeRecipient = DEFAULT_ACCOUNT;
      const callRebalanceFeeCalculator = feeCalculator.address;
      const callDataRebalanceInterval = ONE_DAY_IN_SECONDS;
      const callDataFailAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const callDataLastRebalanceTimestamp = new BigNumber(timestamp);
      const callDataEntryFee = ether(.01);
      const rebalanceFee = ether(.01);
      const callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
      const rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(
        callDataManagerAddress,
        callDataLiquidator.address,
        callDataFeeRecipient,
        callRebalanceFeeCalculator,
        callDataRebalanceInterval,
        callDataFailAuctionPeriod,
        callDataLastRebalanceTimestamp,
        callDataEntryFee,
        callDataRebalanceFeeCallData,
      );

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingManagerWrapper.createTradingPool(
        managerAddress,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        rebalancingSetCallData,
        { from: subjectCaller }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      newEntryFee = ether(.02);
      await socialTradingManagerWrapper.initiateEntryFeeChange(
        setManager.address,
        tradingPoolAddress,
        newEntryFee,
        { from: subjectCaller }
      );

      await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS.add(1));

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
    });

    async function subject(): Promise<string> {
      return await socialTradingManagerWrapper.finalizeEntryFeeChange(
        subjectManager,
        subjectTradingPool,
        { from: subjectCaller }
      );
    }

    test('successfully updates tradingPool newEntryFee', async () => {
      await subject();

      const tradingPoolInstance = await RebalancingSetTokenV2Contract.at(
        subjectTradingPool,
        web3,
        TX_DEFAULTS
      );
      const actualNewFee = await tradingPoolInstance.entryFee.callAsync();

      expect(actualNewFee).to.be.bignumber.equal(newEntryFee);
    });
  });

  describe('setTrader', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewTrader: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const managerAddress = setManager.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = SetUtils.stringToBytes('CoolPool');
      const tradingPoolSymbol = SetUtils.stringToBytes('COOL');

      const callDataManagerAddress = setManager.address;
      const callDataLiquidator = liquidator;
      const callDataFeeRecipient = DEFAULT_ACCOUNT;
      const callRebalanceFeeCalculator = feeCalculator.address;
      const callDataRebalanceInterval = ONE_DAY_IN_SECONDS;
      const callDataFailAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const callDataLastRebalanceTimestamp = new BigNumber(timestamp);
      const callDataEntryFee = ether(.01);
      const rebalanceFee = ether(.01);
      const callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
      const rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(
        callDataManagerAddress,
        callDataLiquidator.address,
        callDataFeeRecipient,
        callRebalanceFeeCalculator,
        callDataRebalanceInterval,
        callDataFailAuctionPeriod,
        callDataLastRebalanceTimestamp,
        callDataEntryFee,
        callDataRebalanceFeeCallData,
      );

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingManagerWrapper.createTradingPool(
        managerAddress,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        rebalancingSetCallData,
        { from: subjectCaller }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectNewTrader = ACCOUNTS[1].address;
    });

    async function subject(): Promise<string> {
      return await socialTradingManagerWrapper.setTrader(
        subjectManager,
        subjectTradingPool,
        subjectNewTrader,
        { from: subjectCaller }
      );
    }

    test('successfully updates tradingPool trader', async () => {
      await subject();

      const poolInfo: any = await setManager.pools.callAsync(subjectTradingPool);

      expect(poolInfo.trader).to.equal(subjectNewTrader);
    });
  });

  describe('setLiquidator', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewLiquidator: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const managerAddress = setManager.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = SetUtils.stringToBytes('CoolPool');
      const tradingPoolSymbol = SetUtils.stringToBytes('COOL');

      const callDataManagerAddress = setManager.address;
      const callDataLiquidator = liquidator;
      const callDataFeeRecipient = DEFAULT_ACCOUNT;
      const callRebalanceFeeCalculator = feeCalculator.address;
      const callDataRebalanceInterval = ONE_DAY_IN_SECONDS;
      const callDataFailAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const callDataLastRebalanceTimestamp = new BigNumber(timestamp);
      const callDataEntryFee = ether(.01);
      const rebalanceFee = ether(.01);
      const callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
      const rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(
        callDataManagerAddress,
        callDataLiquidator.address,
        callDataFeeRecipient,
        callRebalanceFeeCalculator,
        callDataRebalanceInterval,
        callDataFailAuctionPeriod,
        callDataLastRebalanceTimestamp,
        callDataEntryFee,
        callDataRebalanceFeeCallData,
      );

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingManagerWrapper.createTradingPool(
        managerAddress,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        rebalancingSetCallData,
        { from: subjectCaller }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectNewLiquidator = ACCOUNTS[1].address;

      await liquidatorWhiteList.addAddress.sendTransactionAsync(subjectNewLiquidator);
    });

    async function subject(): Promise<string> {
      return await socialTradingManagerWrapper.setLiquidator(
        subjectManager,
        subjectTradingPool,
        subjectNewLiquidator,
        { from: subjectCaller }
      );
    }

    test('successfully updates tradingPool feeRecipient', async () => {
      await subject();

      const tradingPoolInstance = await RebalancingSetTokenV2Contract.at(
        subjectTradingPool,
        web3,
        TX_DEFAULTS
      );
      const actualLiquidator = await tradingPoolInstance.liquidator.callAsync();

      expect(actualLiquidator).to.equal(subjectNewLiquidator);
    });
  });

  describe('setFeeRecipient', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewFeeRecipient: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const managerAddress = setManager.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = SetUtils.stringToBytes('CoolPool');
      const tradingPoolSymbol = SetUtils.stringToBytes('COOL');

      const callDataManagerAddress = setManager.address;
      const callDataLiquidator = liquidator;
      const callDataFeeRecipient = DEFAULT_ACCOUNT;
      const callRebalanceFeeCalculator = feeCalculator.address;
      const callDataRebalanceInterval = ONE_DAY_IN_SECONDS;
      const callDataFailAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const callDataLastRebalanceTimestamp = new BigNumber(timestamp);
      const callDataEntryFee = ether(.01);
      const rebalanceFee = ether(.01);
      const callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
      const rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(
        callDataManagerAddress,
        callDataLiquidator.address,
        callDataFeeRecipient,
        callRebalanceFeeCalculator,
        callDataRebalanceInterval,
        callDataFailAuctionPeriod,
        callDataLastRebalanceTimestamp,
        callDataEntryFee,
        callDataRebalanceFeeCallData,
      );

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingManagerWrapper.createTradingPool(
        managerAddress,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        rebalancingSetCallData,
        { from: subjectCaller }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectNewFeeRecipient = ACCOUNTS[1].address;
    });

    async function subject(): Promise<string> {
      return await socialTradingManagerWrapper.setFeeRecipient(
        subjectManager,
        subjectTradingPool,
        subjectNewFeeRecipient,
        { from: subjectCaller }
      );
    }

    test('successfully updates tradingPool feeRecipient', async () => {
      await subject();

      const tradingPoolInstance = await RebalancingSetTokenV2Contract.at(
        subjectTradingPool,
        web3,
        TX_DEFAULTS
      );
      const actualFeeRecipient = await tradingPoolInstance.feeRecipient.callAsync();

      expect(actualFeeRecipient).to.equal(subjectNewFeeRecipient);
    });
  });

  describe('pools', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;

    let allocatorAddress: Address;
    let startingBaseAssetAllocation: BigNumber;
    let trader: Address;

    beforeEach(async () => {
      const managerAddress = setManager.address;
      allocatorAddress = allocator.address;
      startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = SetUtils.stringToBytes('CoolPool');
      const tradingPoolSymbol = SetUtils.stringToBytes('COOL');

      const callDataManagerAddress = setManager.address;
      const callDataLiquidator = liquidator;
      const callDataFeeRecipient = DEFAULT_ACCOUNT;
      const callRebalanceFeeCalculator = feeCalculator.address;
      const callDataRebalanceInterval = ONE_DAY_IN_SECONDS;
      const callDataFailAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const callDataLastRebalanceTimestamp = new BigNumber(timestamp);
      const callDataEntryFee = ether(.01);
      const rebalanceFee = ether(.01);
      const callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
      const rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(
        callDataManagerAddress,
        callDataLiquidator.address,
        callDataFeeRecipient,
        callRebalanceFeeCalculator,
        callDataRebalanceInterval,
        callDataFailAuctionPeriod,
        callDataLastRebalanceTimestamp,
        callDataEntryFee,
        callDataRebalanceFeeCallData,
      );

      trader = DEFAULT_ACCOUNT;

      const txHash = await socialTradingManagerWrapper.createTradingPool(
        managerAddress,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        rebalancingSetCallData,
        { from: trader }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
    });

    async function subject(): Promise<string> {
      return await socialTradingManagerWrapper.pools(
        subjectManager,
        subjectTradingPool
      );
    }

    test('successfully updates tradingPool feeRecipient', async () => {
      await subject();

      const actualPoolInfo: any = await setManager.pools.callAsync(subjectTradingPool);

      expect(actualPoolInfo.allocator).to.equal(allocatorAddress);
      expect(actualPoolInfo.currentAllocation).to.be.bignumber.equal(startingBaseAssetAllocation);
      expect(actualPoolInfo.trader).to.equal(trader);
    });
  });
});