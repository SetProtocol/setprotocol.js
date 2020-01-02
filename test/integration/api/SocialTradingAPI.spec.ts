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
  ProtocolViewerContract,
  RebalancingSetTokenV2Contract,
  RebalancingSetTokenV2FactoryContract,
  SetTokenContract,
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
import { SocialTradingAPI } from '@src/api';
import {
  NULL_ADDRESS,
  ONE_DAY_IN_SECONDS,
  TX_DEFAULTS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  ZERO,
} from '@src/constants';
import {
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  deployBaseContracts,
  deployConstantPriceOracleAsync,
  deployFixedFeeCalculatorAsync,
  deployLinearAuctionLiquidatorContractAsync,
  deployOracleWhiteListAsync,
  deployProtocolViewerAsync,
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
import { Assertions } from '@src/assertions';
import { Address, Bytes, SetProtocolConfig } from '@src/types/common';
import { NewTradingPoolInfo, TradingPoolRebalanceInfo } from '@src/types/strategies';

import ChaiSetup from '@test/helpers/chaiSetup';
ChaiSetup.configure();
const { expect } = chai;
const contract = require('truffle-contract');
const timeKeeper = require('timekeeper');
const moment = require('moment');
const web3 = new Web3('http://localhost:8545');
const { SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;

describe('SocialTradingAPI', () => {
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
  let protocolViewer: ProtocolViewerContract;

  let assertions: Assertions;

  let socialTradingAPI: SocialTradingAPI;

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

    protocolViewer = await deployProtocolViewerAsync(web3);

    const setProtocolConfig: SetProtocolConfig = {
      coreAddress: NULL_ADDRESS,
      transferProxyAddress: NULL_ADDRESS,
      vaultAddress: NULL_ADDRESS,
      setTokenFactoryAddress: NULL_ADDRESS,
      rebalancingSetTokenFactoryAddress: NULL_ADDRESS,
      kyberNetworkWrapperAddress: NULL_ADDRESS,
      rebalanceAuctionModuleAddress: NULL_ADDRESS,
      exchangeIssuanceModuleAddress: NULL_ADDRESS,
      rebalancingSetIssuanceModule: NULL_ADDRESS,
      rebalancingSetEthBidderAddress: NULL_ADDRESS,
      rebalancingSetExchangeIssuanceModule: NULL_ADDRESS,
      wrappedEtherAddress: NULL_ADDRESS,
      protocolViewerAddress: protocolViewer.address,
    };

    assertions = new Assertions(web3);

    socialTradingAPI = new SocialTradingAPI(web3, assertions, setProtocolConfig);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('createTradingPoolAsync', async () => {
    let subjectManager: Address;
    let subjectAllocatorAddress: Address;
    let subjectStartingBaseAssetAllocation: BigNumber;
    let subjectStartingUSDValue: BigNumber;
    let subjectTradingPoolName: string;
    let subjectTradingPoolSymbol: string;
    let subjectLiquidator: Address;
    let subjectFeeRecipient: Address;
    let subjectFeeCalculator: Address;
    let subjectRebalanceInterval: BigNumber;
    let subjectFailAuctionPeriod: BigNumber;
    let subjectLastRebalanceTimestamp: BigNumber;
    let subjectEntryFee: BigNumber;
    let subjectRebalanceFee: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      subjectManager = setManager.address;
      subjectAllocatorAddress = allocator.address;
      subjectStartingBaseAssetAllocation = ether(0.72);
      subjectStartingUSDValue = ether(100);
      subjectTradingPoolName = 'CoolPool';
      subjectTradingPoolSymbol = 'COOL';
      subjectLiquidator = liquidator.address;
      subjectFeeRecipient = DEFAULT_ACCOUNT;
      subjectFeeCalculator = feeCalculator.address;
      subjectRebalanceInterval = ONE_DAY_IN_SECONDS;
      subjectFailAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      subjectLastRebalanceTimestamp = new BigNumber(timestamp);
      subjectEntryFee = ether(.0001);
      subjectRebalanceFee = ether(.0001);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await socialTradingAPI.createTradingPoolAsync(
        subjectManager,
        subjectAllocatorAddress,
        subjectStartingBaseAssetAllocation,
        subjectStartingUSDValue,
        subjectTradingPoolName,
        subjectTradingPoolSymbol,
        subjectLiquidator,
        subjectFeeRecipient,
        subjectFeeCalculator,
        subjectRebalanceInterval,
        subjectFailAuctionPeriod,
        subjectLastRebalanceTimestamp,
        subjectEntryFee,
        subjectRebalanceFee,
        { from: subjectCaller }
      );
    }

    test('successfully creates poolInfo', async () => {
      const txHash = await subject();

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
      const poolInfo: any = await setManager.pools.callAsync(tradingPoolAddress);

      expect(poolInfo.trader).to.equal(subjectCaller);
      expect(poolInfo.allocator).to.equal(subjectAllocatorAddress);
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

      expect(actualName).to.equal(subjectTradingPoolName);
      expect(actualSymbol).to.equal(subjectTradingPoolSymbol);
    });

    describe('when the passed allocation is equal to 0', async () => {
      beforeEach(async () => {
        subjectStartingBaseAssetAllocation = ZERO;
      });

      test('successfully sets currentAllocation', async () => {
        const txHash = await subject();

        const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
        const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
        const poolInfo: any = await setManager.pools.callAsync(tradingPoolAddress);

        expect(poolInfo.currentAllocation).to.be.bignumber.equal(subjectStartingBaseAssetAllocation);
      });
    });

    describe('when the passed allocation is less than 0', async () => {
      beforeEach(async () => {
        subjectStartingBaseAssetAllocation = new BigNumber(-1);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${subjectStartingBaseAssetAllocation.toString()} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the passed allocation is greater than 100', async () => {
      beforeEach(async () => {
        subjectStartingBaseAssetAllocation = ether(1.1);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided allocation ${subjectStartingBaseAssetAllocation.toString()} is greater than 100%.`
        );
      });
    });

    describe('when the passed allocation is not a multiple of 1%', async () => {
      beforeEach(async () => {
        subjectStartingBaseAssetAllocation = ether(.012);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided allocation ${subjectStartingBaseAssetAllocation.toString()} is not multiple of 1% (10 ** 16)`
        );
      });
    });

    describe('when the passed entryFee is not a multiple of 1 basis point', async () => {
      beforeEach(async () => {
        subjectEntryFee = ether(.00011);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided fee ${subjectEntryFee.toString()} is not multiple of one basis point (10 ** 14)`
        );
      });
    });

    describe('when the passed rebalanceFee is not a multiple of 1 basis point', async () => {
      beforeEach(async () => {
        subjectRebalanceFee = ether(.00011);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided fee ${subjectRebalanceFee.toString()} is not multiple of one basis point (10 ** 14)`
        );
      });
    });

    describe('when the passed tradingPoolName is an empty string', async () => {
      beforeEach(async () => {
        subjectTradingPoolName = '';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The string name cannot be empty.`
        );
      });
    });

    describe('when the passed tradingPoolSymbol is an empty string', async () => {
      beforeEach(async () => {
        subjectTradingPoolSymbol = '';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The string symbol cannot be empty.`
        );
      });
    });
  });

  describe('updateAllocationAsync', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewAllocation: BigNumber;
    let subjectLiquidatorData: Bytes;
    let subjectCaller: Address;

    let nextRebalanceAvailableAtSeconds: number;

    beforeEach(async () => {
      subjectManager = setManager.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';
      const liquidatorAddress = liquidator.address;
      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = feeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.01);
      const rebalanceFee = ether(.01);
      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingAPI.createTradingPoolAsync(
        subjectManager,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidatorAddress,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        rebalanceFee,
        { from: subjectCaller }
      );

      await increaseChainTimeAsync(web3, rebalanceInterval.add(1));

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
      const tradingPoolInstance = await RebalancingSetTokenV2Contract.at(
        tradingPoolAddress,
        web3,
        TX_DEFAULTS
      );

      // Fast forward to allow propose to be called
      const lastRebalancedTimestampSeconds = await tradingPoolInstance.lastRebalanceTimestamp.callAsync();
      nextRebalanceAvailableAtSeconds = lastRebalancedTimestampSeconds.toNumber() + rebalanceInterval.toNumber();
      timeKeeper.freeze(nextRebalanceAvailableAtSeconds * 1000);
      increaseChainTimeAsync(web3, rebalanceInterval.add(1));

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectNewAllocation = ether(.75);
      subjectLiquidatorData = SetUtils.stringToBytes('');

      await core.issue.sendTransactionAsync(collateralAddress, ether(2), { from: subjectCaller });
      await core.issue.sendTransactionAsync(subjectTradingPool, ether(2), { from: subjectCaller });
    });

    afterEach(async () => {
      timeKeeper.reset();
    });

    async function subject(): Promise<string> {
      return await socialTradingAPI.updateAllocationAsync(
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

    describe('when the passed allocation is less than 0', async () => {
      beforeEach(async () => {
        subjectNewAllocation = new BigNumber(-1);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${subjectNewAllocation.toString()} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the passed allocation is greater than 100', async () => {
      beforeEach(async () => {
        subjectNewAllocation = ether(1.1);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided allocation ${subjectNewAllocation.toString()} is greater than 100%.`
        );
      });
    });

    describe('when the passed allocation is not a multiple of 1%', async () => {
      beforeEach(async () => {
        subjectNewAllocation = ether(.012);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided allocation ${subjectNewAllocation.toString()} is not multiple of 1% (10 ** 16)`
        );
      });
    });

    describe('when the caller is not the trader', async () => {
      beforeEach(async () => {
        subjectCaller = ACCOUNTS[3].address;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Caller ${subjectCaller} is not trader of tradingPool.`
        );
      });
    });

    describe('when the tradingPool is in Rebalance state', async () => {
      beforeEach(async () => {
        await subject();
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Rebalancing token at ${subjectTradingPool} is currently in rebalancing state. ` +
          `Issue, Redeem, and propose functionality is not available during this time`
        );
      });
    });

    describe('when updateAllocationAsync is called before a new rebalance is allowed', async () => {
      beforeEach(async () => {
        timeKeeper.freeze((nextRebalanceAvailableAtSeconds * 1000) - 10);
      });

      test('throws', async () => {
        const nextAvailableRebalance = nextRebalanceAvailableAtSeconds * 1000;
        const nextRebalanceFormattedDate = moment(nextAvailableRebalance)
          .format('dddd, MMMM Do YYYY, h:mm:ss a');
        return expect(subject()).to.be.rejectedWith(
          `Attempting to rebalance too soon. Rebalancing next ` +
          `available on ${nextRebalanceFormattedDate}`
        );
      });
    });
  });

  describe('fetchNewTradingPoolDetailsAsync', async () => {
    let subjectTradingPool: Address;

    let manager: Address;
    let allocatorAddress: Address;
    let startingBaseAssetAllocation: BigNumber;
    let tradingPoolName: string;
    let tradingPoolSymbol: string;
    let liquidatorAddress: Address;
    let feeRecipient: Address;
    let rebalanceInterval: BigNumber;
    let entryFee: BigNumber;
    let rebalanceFee: BigNumber;
    let lastRebalanceTimestamp: BigNumber;

    let collateralInstance: SetTokenContract;
    let tradingPoolInstance: RebalancingSetTokenV2Contract;

    beforeEach(async () => {
      manager = setManager.address;
      allocatorAddress = allocator.address;
      startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      tradingPoolName = 'CoolPool';
      tradingPoolSymbol = 'COOL';
      liquidatorAddress = liquidator.address;
      feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = feeCalculator.address;
      rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      lastRebalanceTimestamp = new BigNumber(timestamp);
      entryFee = ether(.01);
      rebalanceFee = ether(.01);

      const txHash = await socialTradingAPI.createTradingPoolAsync(
        manager,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidatorAddress,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        rebalanceFee,
        { from: DEFAULT_ACCOUNT }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const collateralAddress = extractNewSetTokenAddressFromLogs(formattedLogs, 2);
      collateralInstance = await SetTokenContract.at(
        collateralAddress,
        web3,
        TX_DEFAULTS
      );

      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
      tradingPoolInstance = await RebalancingSetTokenV2Contract.at(
        tradingPoolAddress,
        web3,
        TX_DEFAULTS
      );

      subjectTradingPool = tradingPoolAddress;
    });

    async function subject(): Promise<NewTradingPoolInfo> {
      return await socialTradingAPI.fetchNewTradingPoolDetailsAsync(
        subjectTradingPool,
      );
    }

    test('successfully gets info from manager', async () => {
      const newPoolInfo = await subject();

      const poolInfo: any = await setManager.pools.callAsync(subjectTradingPool);

      expect(newPoolInfo.trader).to.equal(poolInfo.trader);
      expect(newPoolInfo.allocator).to.equal(poolInfo.allocator);
      expect(newPoolInfo.currentAllocation).to.be.bignumber.equal(poolInfo.currentAllocation);
    });

    test('successfully gets info from collateral Set', async () => {
      const newPoolInfo = await subject();

      const components = await collateralInstance.getComponents.callAsync();
      const units = await collateralInstance.getUnits.callAsync();
      const naturalUnit = await collateralInstance.naturalUnit.callAsync();
      const name = await collateralInstance.name.callAsync();
      const symbol = await collateralInstance.symbol.callAsync();

      expect(JSON.stringify(newPoolInfo.currentSetInfo.components)).to.equal(JSON.stringify(components));
      expect(JSON.stringify(newPoolInfo.currentSetInfo.units)).to.equal(JSON.stringify(units));
      expect(newPoolInfo.currentSetInfo.naturalUnit).to.be.bignumber.equal(naturalUnit);
      expect(newPoolInfo.currentSetInfo.name).to.equal(name);
      expect(newPoolInfo.currentSetInfo.symbol).to.equal(symbol);
    });

    test('successfully gets info from RebalancingSetTokenV2', async () => {
      const newPoolInfo = await subject();

      const currentSet = await tradingPoolInstance.currentSet.callAsync();
      const unitShares = await tradingPoolInstance.unitShares.callAsync();
      const naturalUnit = await tradingPoolInstance.naturalUnit.callAsync();
      const name = await tradingPoolInstance.name.callAsync();
      const symbol = await tradingPoolInstance.symbol.callAsync();

      expect(newPoolInfo.manager).to.equal(setManager.address);
      expect(newPoolInfo.feeRecipient).to.equal(feeRecipient);
      expect(newPoolInfo.currentSet).to.equal(currentSet);
      expect(newPoolInfo.unitShares).to.be.bignumber.equal(unitShares);
      expect(newPoolInfo.naturalUnit).to.be.bignumber.equal(naturalUnit);
      expect(newPoolInfo.rebalanceInterval).to.be.bignumber.equal(rebalanceInterval);
      expect(newPoolInfo.entryFee).to.be.bignumber.equal(entryFee);
      expect(newPoolInfo.rebalanceFee).to.be.bignumber.equal(rebalanceFee);
      expect(newPoolInfo.lastRebalanceTimestamp).to.be.bignumber.equal(lastRebalanceTimestamp);
      expect(newPoolInfo.rebalanceState).to.be.bignumber.equal(ZERO);
      expect(newPoolInfo.poolName).to.equal(name);
      expect(newPoolInfo.poolSymbol).to.equal(symbol);
    });
  });

  describe('fetchTradingPoolRebalanceDetailsAsync', async () => {
    let subjectTradingPool: Address;

    let newAllocation: BigNumber;

    let newCollateralInstance: SetTokenContract;
    let tradingPoolInstance: RebalancingSetTokenV2Contract;

    beforeEach(async () => {
      const manager = setManager.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';
      const liquidatorAddress = liquidator.address;
      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = feeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.01);
      const rebalanceFee = ether(.01);

      const txHash = await socialTradingAPI.createTradingPoolAsync(
        manager,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidatorAddress,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        rebalanceFee,
        { from: DEFAULT_ACCOUNT }
      );

      await increaseChainTimeAsync(web3, rebalanceInterval.add(1));

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
        { from: DEFAULT_ACCOUNT }
      );

      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
      tradingPoolInstance = await RebalancingSetTokenV2Contract.at(
        tradingPoolAddress,
        web3,
        TX_DEFAULTS
      );

      // Fast forward to allow propose to be called
      const lastRebalancedTimestampSeconds = await tradingPoolInstance.lastRebalanceTimestamp.callAsync();
      const nextRebalanceAvailableAtSeconds = lastRebalancedTimestampSeconds.toNumber() + rebalanceInterval.toNumber();
      timeKeeper.freeze(nextRebalanceAvailableAtSeconds * 1000);
      increaseChainTimeAsync(web3, rebalanceInterval.add(1));

      subjectTradingPool = tradingPoolAddress;

      await core.issue.sendTransactionAsync(collateralAddress, ether(2), { from: DEFAULT_ACCOUNT });
      await core.issue.sendTransactionAsync(subjectTradingPool, ether(2), { from: DEFAULT_ACCOUNT });

      const liquidatorData = '0x';
      newAllocation = ether(.37);
      const newTxHash = await socialTradingAPI.updateAllocationAsync(
        setManager.address,
        subjectTradingPool,
        newAllocation,
        liquidatorData,
        { from: DEFAULT_ACCOUNT }
      );

      const newFormattedLogs = await getFormattedLogsFromTxHash(web3, newTxHash);
      const newCollateralAddress = extractNewSetTokenAddressFromLogs(newFormattedLogs, 2);
      newCollateralInstance = await SetTokenContract.at(
        newCollateralAddress,
        web3,
        TX_DEFAULTS
      );
    });

    async function subject(): Promise<TradingPoolRebalanceInfo> {
      return await socialTradingAPI.fetchTradingPoolRebalanceDetailsAsync(
        subjectTradingPool,
      );
    }

    test('successfully gets info from manager', async () => {
      const newPoolInfo = await subject();

      const poolInfo: any = await setManager.pools.callAsync(subjectTradingPool);

      expect(newPoolInfo.trader).to.equal(poolInfo.trader);
      expect(newPoolInfo.allocator).to.equal(poolInfo.allocator);
      expect(newPoolInfo.currentAllocation).to.be.bignumber.equal(poolInfo.currentAllocation);
    });

    test('successfully gets info from collateral Set', async () => {
      const newPoolInfo = await subject();

      const components = await newCollateralInstance.getComponents.callAsync();
      const units = await newCollateralInstance.getUnits.callAsync();
      const naturalUnit = await newCollateralInstance.naturalUnit.callAsync();
      const name = await newCollateralInstance.name.callAsync();
      const symbol = await newCollateralInstance.symbol.callAsync();

      expect(JSON.stringify(newPoolInfo.nextSetInfo.components)).to.equal(JSON.stringify(components));
      expect(JSON.stringify(newPoolInfo.nextSetInfo.units)).to.equal(JSON.stringify(units));
      expect(newPoolInfo.nextSetInfo.naturalUnit).to.be.bignumber.equal(naturalUnit);
      expect(newPoolInfo.nextSetInfo.name).to.equal(name);
      expect(newPoolInfo.nextSetInfo.symbol).to.equal(symbol);
    });

    test('successfully gets info from RebalancingSetTokenV2', async () => {
      const newPoolInfo = await subject();

      const auctionParams = await tradingPoolInstance.getAuctionPriceParameters.callAsync();
      const startingCurrentSets = await tradingPoolInstance.startingCurrentSetAmount.callAsync();
      const biddingParams = await tradingPoolInstance.getBiddingParameters.callAsync();

      expect(newPoolInfo.liquidator).to.equal(liquidator.address);
      expect(newPoolInfo.nextSet).to.equal(newCollateralInstance.address);
      expect(newPoolInfo.rebalanceStartTime).to.be.bignumber.equal(auctionParams[0]);
      expect(newPoolInfo.timeToPivot).to.be.bignumber.equal(auctionParams[1]);
      expect(newPoolInfo.startPrice).to.be.bignumber.equal(auctionParams[2]);
      expect(newPoolInfo.endPrice).to.be.bignumber.equal(auctionParams[3]);
      expect(newPoolInfo.startingCurrentSets).to.be.bignumber.equal(startingCurrentSets);
      expect(newPoolInfo.remainingCurrentSets).to.be.bignumber.equal(biddingParams[1]);
      expect(newPoolInfo.minimumBid).to.be.bignumber.equal(biddingParams[0]);
      expect(newPoolInfo.rebalanceState).to.be.bignumber.equal(new BigNumber(2));
    });
  });

  describe('initiateEntryFeeChangeAsync', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewEntryFee: BigNumber;
    let subjectCaller: Address;

    const maxFee = ether(.1);
    beforeEach(async () => {
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';

      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = feeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.01);
      const rebalanceFee = ether(.01);

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingAPI.createTradingPoolAsync(
        setManager.address,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidator.address,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        rebalanceFee,
        { from: subjectCaller }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectNewEntryFee = ether(.02);
    });

    async function subject(): Promise<string> {
      return await socialTradingAPI.initiateEntryFeeChangeAsync(
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

    describe('when the caller is not the trader', async () => {
      beforeEach(async () => {
        subjectCaller = ACCOUNTS[3].address;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Caller ${subjectCaller} is not trader of tradingPool.`
        );
      });
    });

    describe('when the fee exceeds the entry fee', async () => {
      beforeEach(async () => {
        subjectNewEntryFee = ether(.15);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided fee ${subjectNewEntryFee} is not less than max fee, ${maxFee.toString()}.`
        );
      });
    });

    describe('when the passed entryFee is not a multiple of 1 basis point', async () => {
      beforeEach(async () => {
        subjectNewEntryFee = ether(.00011);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided fee ${subjectNewEntryFee.toString()} is not multiple of one basis point (10 ** 14)`
        );
      });
    });
  });

  describe('finalizeEntryFeeChangeAsync', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectCaller: Address;

    let isInitiated: boolean = true;
    let newEntryFee: BigNumber;
    let realTimeFallback: number = 0;
    beforeEach(async () => {
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';

      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = feeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.01);
      const rebalanceFee = ether(.01);

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingAPI.createTradingPoolAsync(
        setManager.address,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidator.address,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        rebalanceFee,
        { from: subjectCaller }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      if (isInitiated) {
        newEntryFee = ether(.02);
        await socialTradingAPI.initiateEntryFeeChangeAsync(
          setManager.address,
          tradingPoolAddress,
          newEntryFee,
          { from: subjectCaller }
        );
      }

      const poolInfo: any = await setManager.pools.callAsync(tradingPoolAddress);
      await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);
      timeKeeper.freeze((poolInfo.feeUpdateTimestamp - realTimeFallback) * 1000);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
    });

    afterEach(async () => {
      timeKeeper.reset();
    });

    async function subject(): Promise<string> {
      return await socialTradingAPI.finalizeEntryFeeChangeAsync(
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

    describe('when the caller is not the trader', async () => {
      beforeEach(async () => {
        subjectCaller = ACCOUNTS[3].address;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Caller ${subjectCaller} is not trader of tradingPool.`
        );
      });
    });

    describe('when the fee update process has not been initiated', async () => {
      beforeAll(async () => {
        isInitiated = false;
      });

      afterAll(async () => {
        isInitiated = true;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Must call initiateEntryFeeChange first to start fee update process.`
        );
      });
    });

    describe('when timelock period has not elapsed', async () => {
      beforeAll(async () => {
        realTimeFallback = 10;
      });

      afterAll(async () => {
        realTimeFallback = 0;
      });

      test('throws', async () => {
        const poolInfo: any = await setManager.pools.callAsync(subjectTradingPool);
        const formattedDate = moment(parseInt(poolInfo.feeUpdateTimestamp) * 1000)
          .format('dddd, MMMM Do YYYY, h:mm:ss a');

        return expect(subject()).to.be.rejectedWith(
          `Attempting to finalize fee update too soon. Update available at ${formattedDate}`,
        );
      });
    });
  });

  describe('setTraderAsync', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewTrader: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';

      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = feeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.01);
      const rebalanceFee = ether(.01);

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingAPI.createTradingPoolAsync(
        setManager.address,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidator.address,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        rebalanceFee,
        { from: subjectCaller }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectNewTrader = ACCOUNTS[1].address;
    });

    async function subject(): Promise<string> {
      return await socialTradingAPI.setTraderAsync(
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

    describe('when the caller is not the trader', async () => {
      beforeEach(async () => {
        subjectCaller = ACCOUNTS[3].address;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Caller ${subjectCaller} is not trader of tradingPool.`
        );
      });
    });
  });

  describe('setLiquidatorAsync', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewLiquidator: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';

      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = feeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.01);
      const rebalanceFee = ether(.01);

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingAPI.createTradingPoolAsync(
        setManager.address,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidator.address,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        rebalanceFee,
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
      return await socialTradingAPI.setLiquidatorAsync(
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

    describe('when the caller is not the trader', async () => {
      beforeEach(async () => {
        subjectCaller = ACCOUNTS[3].address;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Caller ${subjectCaller} is not trader of tradingPool.`
        );
      });
    });
  });

  describe('setFeeRecipientAsync', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewFeeRecipient: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';

      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = feeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.01);
      const rebalanceFee = ether(.01);

      subjectCaller = DEFAULT_ACCOUNT;

      const txHash = await socialTradingAPI.createTradingPoolAsync(
        setManager.address,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidator.address,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        rebalanceFee,
        { from: subjectCaller }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectNewFeeRecipient = ACCOUNTS[1].address;
    });

    async function subject(): Promise<string> {
      return await socialTradingAPI.setFeeRecipientAsync(
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

    describe('when the caller is not the trader', async () => {
      beforeEach(async () => {
        subjectCaller = ACCOUNTS[3].address;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Caller ${subjectCaller} is not trader of tradingPool.`
        );
      });
    });
  });

  describe.only('batchFetchTradingPoolEntryFeesAsync', async () => {
    let subjectTradingPools: Address[];

    let entryFeeOne: BigNumber;
    let entryFeeTwo: BigNumber;
    beforeEach(async () => {
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';

      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = feeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const rebalanceFee = ether(.01);
      const trader = DEFAULT_ACCOUNT;

      entryFeeOne = ether(.01);
      const txHashOne = await socialTradingAPI.createTradingPoolAsync(
        setManager.address,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidator.address,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFeeOne,
        rebalanceFee,
        { from: trader }
      );

      const formattedLogsOne = await getFormattedLogsFromTxHash(web3, txHashOne);
      const tradingPoolAddressOne = extractNewSetTokenAddressFromLogs(formattedLogsOne);

      entryFeeTwo = ether(.02);
      const txHashTwo = await socialTradingAPI.createTradingPoolAsync(
        setManager.address,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidator.address,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFeeTwo,
        rebalanceFee,
        { from: trader }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHashTwo);
      const tradingPoolAddressTwo = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectTradingPools = [tradingPoolAddressOne, tradingPoolAddressTwo];
    });

    async function subject(): Promise<BigNumber[]> {
      return await socialTradingAPI.batchFetchTradingPoolEntryFeesAsync(
        subjectTradingPools
      );
    }

    test('successfully updates tradingPool feeRecipient', async () => {
      const entryFees = await subject();

      const expectedEntryFees = [entryFeeOne, entryFeeTwo];

      expect(JSON.stringify(entryFees)).to.equal(JSON.stringify(expectedEntryFees));
    });
  });

  describe.only('batchFetchTradingPoolRebalanceFeesAsync', async () => {
    let subjectTradingPools: Address[];

    let rebalanceFeeOne: BigNumber;
    let rebalanceFeeTwo: BigNumber;
    beforeEach(async () => {
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';

      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = feeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.01);
      const trader = DEFAULT_ACCOUNT;

      rebalanceFeeOne = ether(.01);
      const txHashOne = await socialTradingAPI.createTradingPoolAsync(
        setManager.address,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidator.address,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        rebalanceFeeOne,
        { from: trader }
      );

      const formattedLogsOne = await getFormattedLogsFromTxHash(web3, txHashOne);
      const tradingPoolAddressOne = extractNewSetTokenAddressFromLogs(formattedLogsOne);

      rebalanceFeeTwo = ether(.02);
      const txHashTwo = await socialTradingAPI.createTradingPoolAsync(
        setManager.address,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidator.address,
        feeRecipient,
        feeCalculatorAddress,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        rebalanceFeeTwo,
        { from: trader }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHashTwo);
      const tradingPoolAddressTwo = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectTradingPools = [tradingPoolAddressOne, tradingPoolAddressTwo];
    });

    async function subject(): Promise<BigNumber[]> {
      return await socialTradingAPI.batchFetchTradingPoolRebalanceFeesAsync(
        subjectTradingPools
      );
    }

    test('successfully updates tradingPool feeRecipient', async () => {
      const rebalanceFees = await subject();

      const expectedRebalanceFees = [rebalanceFeeOne, rebalanceFeeTwo];

      expect(JSON.stringify(rebalanceFees)).to.equal(JSON.stringify(expectedRebalanceFees));
    });
  });
});