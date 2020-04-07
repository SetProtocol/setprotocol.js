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
  CoreContract,
  CoreHelper,
  ERC20Helper,
  FeeCalculatorHelper,
  FixedFeeCalculatorContract,
  LinearAuctionLiquidatorContract,
  OracleWhiteListContract,
  PerformanceFeeCalculatorContract,
  RebalancingSetTokenV2Contract,
  RebalancingSetTokenV2FactoryContract,
  RebalancingSetTokenV3Contract,
  RebalancingSetTokenV3FactoryContract,
  RebalanceAuctionModuleContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  ValuationHelper,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  SocialAllocatorContract,
  SocialTradingManagerContract,
  SocialTradingManagerV2Contract,
} from 'set-protocol-strategies';

import {
  OracleHelper,
  UpdatableOracleMockContract,
} from 'set-protocol-oracles';

import {
  ProtocolViewerContract,
} from 'set-protocol-viewers';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { SocialTradingAPI } from '@src/api';
import {
  DEFAULT_REBALANCING_NATURAL_UNIT,
  DEFAULT_UNIT_SHARES,
  NULL_ADDRESS,
  ONE_DAY_IN_SECONDS,
  ONE_YEAR_IN_SECONDS,
  TX_DEFAULTS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  ZERO,
  ZERO_BYTES
} from '@src/constants';
import {
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenV2Async,
  deployBaseContracts,
  deployFixedFeeCalculatorAsync,
  deployLinearAuctionLiquidatorContractAsync,
  deployOracleWhiteListAsync,
  deployProtocolViewerAsync,
  deployRebalancingSetTokenV2FactoryContractAsync,
  deployRebalancingSetTokenV3FactoryContractAsync,
  deploySetTokenAsync,
  deploySocialAllocatorAsync,
  deploySocialTradingManagerAsync,
  deploySocialTradingManagerV2Async,
  deployTokensSpecifyingDecimals,
  deployUpdatableOracleMockAsync,
  deployWhiteListContract,
  increaseChainTimeAsync,
  mineBlockAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether,
  extractNewSetTokenAddressFromLogs,
  getFormattedLogsFromTxHash
} from '@src/util';
import { Assertions } from '@src/assertions';
import { Address, Bytes, SetProtocolConfig, EntryFeePaid, FeeType } from '@src/types/common';
import {
  NewTradingPoolInfo,
  NewTradingPoolV2Info,
  PerformanceFeeInfo,
  TradingPoolAccumulationInfo,
  TradingPoolRebalanceInfo
} from '@src/types/strategies';

import ChaiSetup from '@test/helpers/chaiSetup';
ChaiSetup.configure();

const Core = require('set-protocol-contracts/dist/artifacts/ts/Core').Core;

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
  let performanceFeeCalculator: PerformanceFeeCalculatorContract;
  let rebalancingFactory: RebalancingSetTokenV2FactoryContract;
  let rebalancingV3Factory: RebalancingSetTokenV3FactoryContract;
  let oracleWhiteList: OracleWhiteListContract;
  let liquidatorWhiteList: WhiteListContract;
  let feeCalculatorWhiteList: WhiteListContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;

  let ethOracleProxy: UpdatableOracleMockContract;
  let btcOracleProxy: UpdatableOracleMockContract;

  let allocator: SocialAllocatorContract;

  let initialEthPrice: BigNumber;
  let initialBtcPrice: BigNumber;
  let pricePrecision: BigNumber;

  let maxProfitFeePercentage: BigNumber;
  let maxStreamingFeePercentage: BigNumber;

  let setManager: SocialTradingManagerContract;
  let setManagerV2: SocialTradingManagerV2Contract;
  let protocolViewer: ProtocolViewerContract;

  let assertions: Assertions;

  let socialTradingAPI: SocialTradingAPI;

  const coreHelper = new CoreHelper(DEFAULT_ACCOUNT, DEFAULT_ACCOUNT);
  const erc20Helper = new ERC20Helper(DEFAULT_ACCOUNT);
  const oracleHelper = new OracleHelper(DEFAULT_ACCOUNT);
  const valuationHelper = new ValuationHelper(DEFAULT_ACCOUNT, coreHelper, erc20Helper, oracleHelper);
  const feeCalculatorHelper = new FeeCalculatorHelper(DEFAULT_ACCOUNT);

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
      ,
      rebalanceAuctionModule,
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

    ethOracleProxy = await deployUpdatableOracleMockAsync(
      web3,
      initialEthPrice
    );

    btcOracleProxy = await deployUpdatableOracleMockAsync(
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

    maxProfitFeePercentage = ether(.4);
    maxStreamingFeePercentage = ether(.07);
    performanceFeeCalculator = await feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(
      core.address,
      oracleWhiteList.address,
      maxProfitFeePercentage,
      maxStreamingFeePercentage,
    );
    feeCalculatorWhiteList = await deployWhiteListContract(
      web3,
      [feeCalculator.address, performanceFeeCalculator.address]
    );

    rebalancingFactory = await deployRebalancingSetTokenV2FactoryContractAsync(
      web3,
      core,
      rebalancingComponentWhiteList,
      liquidatorWhiteList,
      feeCalculatorWhiteList
    );

    rebalancingV3Factory = await deployRebalancingSetTokenV3FactoryContractAsync(
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
    setManagerV2 = await deploySocialTradingManagerV2Async(
      web3,
      core.address,
      rebalancingV3Factory.address,
      [allocator.address]
    );
    await setManagerV2.setTimeLockPeriod.sendTransactionAsync(ONE_DAY_IN_SECONDS);

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
      const tradingPoolInstance = await RebalancingSetTokenV3Contract.at(
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

  describe('createTradingPoolV2Async', async () => {
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
    let subjectProfitFeePeriod: BigNumber;
    let subjectHighWatermarkResetPeriod: BigNumber;
    let subjectProfitFee: BigNumber;
    let subjectStreamingFee: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      subjectManager = setManagerV2.address;
      subjectAllocatorAddress = allocator.address;
      subjectStartingBaseAssetAllocation = ether(0.72);
      subjectStartingUSDValue = ether(100);
      subjectTradingPoolName = 'CoolPool';
      subjectTradingPoolSymbol = 'COOL';
      subjectLiquidator = liquidator.address;
      subjectFeeRecipient = DEFAULT_ACCOUNT;
      subjectFeeCalculator = performanceFeeCalculator.address;
      subjectRebalanceInterval = ONE_DAY_IN_SECONDS;
      subjectFailAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      subjectLastRebalanceTimestamp = new BigNumber(timestamp);
      subjectEntryFee = ether(.0001);
      subjectProfitFeePeriod = ONE_DAY_IN_SECONDS.mul(30);
      subjectHighWatermarkResetPeriod = ONE_DAY_IN_SECONDS.mul(365);
      subjectProfitFee = ether(.2);
      subjectStreamingFee = ether(.02);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await socialTradingAPI.createTradingPoolV2Async(
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
        subjectProfitFeePeriod,
        subjectHighWatermarkResetPeriod,
        subjectProfitFee,
        subjectStreamingFee,
        { from: subjectCaller }
      );
    }

    test('successfully creates poolInfo', async () => {
      const txHash = await subject();

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
      const poolInfo: any = await setManagerV2.pools.callAsync(tradingPoolAddress);

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

    describe('when the passed profitFee is not a multiple of 1 basis point', async () => {
      beforeEach(async () => {
        subjectProfitFee = ether(.00011);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided fee ${subjectProfitFee.toString()} is not multiple of one basis point (10 ** 14)`
        );
      });
    });

    describe('when the passed streamingFee is not a multiple of 1 basis point', async () => {
      beforeEach(async () => {
        subjectStreamingFee = ether(.00011);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided fee ${subjectStreamingFee.toString()} is not multiple of one basis point (10 ** 14)`
        );
      });
    });

    describe('when the passed profitFee is greater than maximum', async () => {
      beforeEach(async () => {
        subjectProfitFee = ether(.5);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Passed fee exceeds allowed maximum.`
        );
      });
    });

    describe('when the passed streamingFee is greater than maximum', async () => {
      beforeEach(async () => {
        subjectStreamingFee = ether(.1);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Passed fee exceeds allowed maximum.`
        );
      });
    });

    describe('when the passed highWatermarkResetPeriod is less than profitFeePeriod', async () => {
      beforeEach(async () => {
        subjectHighWatermarkResetPeriod = ONE_DAY_IN_SECONDS;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `High watermark reset must be greater than profit fee period.`
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
      await core.issue.sendTransactionAsync(subjectTradingPool, ether(5), { from: subjectCaller });
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

  describe('acutalizeFeeAsync', async () => {
    let subjectTradingPool: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const manager = setManagerV2.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';
      const liquidatorAddress = liquidator.address;
      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculator = performanceFeeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.0001);
      const profitFeePeriod = ONE_DAY_IN_SECONDS.mul(30);
      const highWatermarkResetPeriod = ONE_DAY_IN_SECONDS.mul(365);
      const profitFee = ether(.2);
      const streamingFee = ether(.02);
      const trader = DEFAULT_ACCOUNT;

      const txHash = await socialTradingAPI.createTradingPoolV2Async(
        manager,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidatorAddress,
        feeRecipient,
        feeCalculator,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        profitFeePeriod,
        highWatermarkResetPeriod,
        profitFee,
        streamingFee,
        { from: trader }
      );

      await increaseChainTimeAsync(web3, profitFeePeriod.add(1));

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

      const tradingPool = extractNewSetTokenAddressFromLogs(formattedLogs);

      await core.issue.sendTransactionAsync(collateralAddress, ether(2), { from: subjectCaller });
      await core.issue.sendTransactionAsync(tradingPool, ether(5), { from: subjectCaller });

      const newEthPrice = ether(250);
      await ethOracleProxy.updatePrice.sendTransactionAsync(newEthPrice);

      subjectTradingPool = tradingPool;
      subjectCaller = trader;
    });

    async function subject(): Promise<string> {
      return await socialTradingAPI.actualizeFeesAsync(
        subjectTradingPool,
        { from: subjectCaller }
      );
    }

    test('successfully creates poolInfo', async () => {
      await subject();

      const { timestamp } = await web3.eth.getBlock('latest');

      const feeState: any = await performanceFeeCalculator.feeState.callAsync(subjectTradingPool);
      expect(feeState.lastProfitFeeTimestamp).to.be.bignumber.equal(timestamp);
    });
  });

  describe('adjustPerformanceFeesAsync', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectFeeType: FeeType;
    let subjectFeePercentage: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const manager = setManagerV2.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';
      const liquidatorAddress = liquidator.address;
      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculator = performanceFeeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.0001);
      const profitFeePeriod = ONE_DAY_IN_SECONDS.mul(30);
      const highWatermarkResetPeriod = ONE_DAY_IN_SECONDS.mul(365);
      const profitFee = ether(.2);
      const streamingFee = ether(.02);
      const trader = DEFAULT_ACCOUNT;

      const txHash = await socialTradingAPI.createTradingPoolV2Async(
        manager,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidatorAddress,
        feeRecipient,
        feeCalculator,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        profitFeePeriod,
        highWatermarkResetPeriod,
        profitFee,
        streamingFee,
        { from: trader }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      subjectManager = manager;
      subjectTradingPool = extractNewSetTokenAddressFromLogs(formattedLogs);
      subjectFeeType = FeeType.StreamingFee;
      subjectFeePercentage = ether(.03);
      subjectCaller = trader;

      const collateralAddress = extractNewSetTokenAddressFromLogs(formattedLogs, 2);
      const collateralInstance = await SetTokenContract.at(
        collateralAddress,
        web3,
        TX_DEFAULTS,
      );
      await collateralInstance.approve.sendTransactionAsync(
        transferProxy.address,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        { from: DEFAULT_ACCOUNT }
      );

      await core.issue.sendTransactionAsync(collateralAddress, ether(2), { from: subjectCaller });
      await core.issue.sendTransactionAsync(subjectTradingPool, ether(2), { from: subjectCaller });
    });

    async function subject(): Promise<string> {
      return await socialTradingAPI.adjustPerformanceFeesAsync(
        subjectManager,
        subjectTradingPool,
        subjectFeeType,
        subjectFeePercentage,
        { from: subjectCaller }
      );
    }

    test('successfully initiates adjustFee process', async () => {
      const txHash = await subject();

      const { input } = await web3.eth.getTransaction(txHash);
      const upgradeHash = web3.utils.soliditySha3(input);

      const upgradeIdentifier = await setManagerV2.upgradeIdentifier.callAsync(subjectTradingPool);
      expect(upgradeIdentifier).to.equal(upgradeHash);
    });

    describe('the confirmation transaction goes through', async () => {
      beforeEach(async () => {
        await subject();

        await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);
      });

      test('successfully initiates adjustFee process', async () => {
        await subject();

        const poolData = await socialTradingAPI.fetchNewTradingPoolV2DetailsAsync(subjectTradingPool);
        expect(poolData.performanceFeeInfo.streamingFeePercentage).to.be.bignumber.equal(subjectFeePercentage);
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

    describe('when the passed streamingFee is not a multiple of 1 basis point', async () => {
      beforeEach(async () => {
        subjectFeePercentage = ether(.00011);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Provided fee ${subjectFeePercentage.toString()} is not multiple of one basis point (10 ** 14)`
        );
      });
    });

    describe('when the passed profitFee is greater than maximum', async () => {
      beforeEach(async () => {
        subjectFeePercentage = ether(.5);
        subjectFeeType = FeeType.ProfitFee;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Passed fee exceeds allowed maximum.`
        );
      });
    });

    describe('when the passed streamingFee is greater than maximum', async () => {
      beforeEach(async () => {
        subjectFeePercentage = ether(.1);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Passed fee exceeds allowed maximum.`
        );
      });
    });
  });

  describe('removeFeeUpdateAsync', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectUpgradeHash: string;
    let subjectCaller: Address;

    beforeEach(async () => {
      const manager = setManagerV2.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';
      const liquidatorAddress = liquidator.address;
      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculator = performanceFeeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.0001);
      const profitFeePeriod = ONE_DAY_IN_SECONDS.mul(30);
      const highWatermarkResetPeriod = ONE_DAY_IN_SECONDS.mul(365);
      const profitFee = ether(.2);
      const streamingFee = ether(.02);
      const trader = DEFAULT_ACCOUNT;

      const txHash = await socialTradingAPI.createTradingPoolV2Async(
        manager,
        allocatorAddress,
        startingBaseAssetAllocation,
        startingUSDValue,
        tradingPoolName,
        tradingPoolSymbol,
        liquidatorAddress,
        feeRecipient,
        feeCalculator,
        rebalanceInterval,
        failAuctionPeriod,
        lastRebalanceTimestamp,
        entryFee,
        profitFeePeriod,
        highWatermarkResetPeriod,
        profitFee,
        streamingFee,
        { from: trader }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      const tradingPool = extractNewSetTokenAddressFromLogs(formattedLogs);
      const feeType = FeeType.StreamingFee;
      const feePercentage = ether(.03);
      const caller = trader;

      const adjustTxHash = await socialTradingAPI.adjustPerformanceFeesAsync(
        manager,
        tradingPool,
        feeType,
        feePercentage,
        { from: caller }
      );

      const { input } = await web3.eth.getTransaction(adjustTxHash);
      subjectUpgradeHash = web3.utils.soliditySha3(input);
      subjectManager = manager;
      subjectTradingPool = tradingPool;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await socialTradingAPI.removeFeeUpdateAsync(
        subjectManager,
        subjectTradingPool,
        subjectUpgradeHash,
        { from: subjectCaller }
      );
    }

    test('successfully removes upgradeHash', async () => {
      await subject();

      const upgradeIdentifier = await setManagerV2.upgradeIdentifier.callAsync(subjectTradingPool);
      expect(upgradeIdentifier).to.equal(ZERO_BYTES);
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



  describe('fetchNewTradingPoolV2DetailsAsync', async () => {
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
    let lastRebalanceTimestamp: BigNumber;
    let profitFeePeriod: BigNumber;
    let highWatermarkResetPeriod: BigNumber;
    let profitFee: BigNumber;
    let streamingFee: BigNumber;

    let collateralInstance: SetTokenContract;
    let tradingPoolInstance: RebalancingSetTokenV3Contract;

    beforeEach(async () => {
      manager = setManager.address;
      allocatorAddress = allocator.address;
      startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      tradingPoolName = 'CoolPool';
      tradingPoolSymbol = 'COOL';
      liquidatorAddress = liquidator.address;
      feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = performanceFeeCalculator.address;
      rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      lastRebalanceTimestamp = new BigNumber(timestamp);
      entryFee = ether(.01);
      profitFeePeriod = ONE_DAY_IN_SECONDS.mul(30);
      highWatermarkResetPeriod = ONE_DAY_IN_SECONDS.mul(365);
      profitFee = ether(.2);
      streamingFee = ether(.02);

      const txHash = await socialTradingAPI.createTradingPoolV2Async(
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
        profitFeePeriod,
        highWatermarkResetPeriod,
        profitFee,
        streamingFee,
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
      tradingPoolInstance = await RebalancingSetTokenV3Contract.at(
        tradingPoolAddress,
        web3,
        TX_DEFAULTS
      );

      subjectTradingPool = tradingPoolAddress;
    });

    async function subject(): Promise<NewTradingPoolV2Info> {
      return await socialTradingAPI.fetchNewTradingPoolV2DetailsAsync(
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

    test('successfully gets info from RebalancingSetTokenV3', async () => {
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
      expect(newPoolInfo.lastRebalanceTimestamp).to.be.bignumber.equal(lastRebalanceTimestamp);
      expect(newPoolInfo.rebalanceState).to.be.bignumber.equal(ZERO);
      expect(newPoolInfo.poolName).to.equal(name);
      expect(newPoolInfo.poolSymbol).to.equal(symbol);
    });

    it('fetches the correct RebalancingSetTokenV3/Performance Fee data', async () => {
      const newPoolInfo = await subject();
      const {
        profitFeePeriod,
        highWatermarkResetPeriod,
        profitFeePercentage,
        streamingFeePercentage,
        highWatermark,
        lastProfitFeeTimestamp,
        lastStreamingFeeTimestamp,
      } = newPoolInfo.performanceFeeInfo;

      const expectedFeeStates: any = await performanceFeeCalculator.feeState.callAsync(tradingPoolInstance.address);

      expect(profitFeePeriod).to.equal(expectedFeeStates.profitFeePeriod);
      expect(highWatermarkResetPeriod).to.equal(expectedFeeStates.highWatermarkResetPeriod);
      expect(profitFeePercentage).to.equal(expectedFeeStates.profitFeePercentage);
      expect(streamingFeePercentage).to.equal(expectedFeeStates.streamingFeePercentage);
      expect(highWatermark).to.equal(expectedFeeStates.highWatermark);
      expect(lastProfitFeeTimestamp).to.equal(expectedFeeStates.lastProfitFeeTimestamp);
      expect(lastStreamingFeeTimestamp).to.equal(expectedFeeStates.lastStreamingFeeTimestamp);
    });

    it('fetches the correct PerformanceFeeCalculator address', async () => {
      const newPoolInfo = await subject();

      expect(newPoolInfo.performanceFeeCalculatorAddress).to.equal(performanceFeeCalculator.address);
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

  describe('batchFetchTradingPoolOperatorAsync', async () => {
    let subjectTradingPools: Address[];

    let traderOne: Address;
    let traderTwo: Address;
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
      traderOne = DEFAULT_ACCOUNT;

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
        rebalanceFee,
        { from: traderOne }
      );

      const formattedLogsOne = await getFormattedLogsFromTxHash(web3, txHashOne);
      const tradingPoolAddressOne = extractNewSetTokenAddressFromLogs(formattedLogsOne);

      traderTwo = ACCOUNTS[2].address;
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
        rebalanceFee,
        { from: traderTwo }
      );

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHashTwo);
      const tradingPoolAddressTwo = extractNewSetTokenAddressFromLogs(formattedLogs);

      subjectTradingPools = [tradingPoolAddressOne, tradingPoolAddressTwo];
    });

    async function subject(): Promise<Address[]> {
      return await socialTradingAPI.batchFetchTradingPoolOperatorAsync(
        subjectTradingPools
      );
    }

    test('fetches the correct operator addresses', async () => {
      const operators = await subject();
      const expectedOperators = [traderOne, traderTwo];

      expect(JSON.stringify(operators)).to.equal(JSON.stringify(expectedOperators));
    });
  });

  describe('batchFetchTradingPoolEntryFeesAsync', async () => {
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

  describe('batchFetchTradingPoolRebalanceFeesAsync', async () => {
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

  describe('batchFetchTradingPoolAccumulationAsync', async () => {
    let subjectTradingPools: Address[];

    let profitFeeOne: BigNumber;
    let streamingFeeOne: BigNumber;
    let profitFeeTwo: BigNumber;
    let streamingFeeTwo: BigNumber;

    let tradingPoolInstanceOne: RebalancingSetTokenV3Contract;
    let tradingPoolInstanceTwo: RebalancingSetTokenV3Contract;

    let subjectIncreaseChainTime: BigNumber;

    beforeEach(async () => {
      const manager = setManager.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';
      const liquidatorAddress = liquidator.address;
      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = performanceFeeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.01);
      const profitFeePeriod = ONE_DAY_IN_SECONDS.mul(30);
      const highWatermarkResetPeriod = ONE_DAY_IN_SECONDS.mul(365);
      profitFeeOne = ether(.3);
      streamingFeeOne = ether(.04);

      const txHashOne = await socialTradingAPI.createTradingPoolV2Async(
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
        profitFeePeriod,
        highWatermarkResetPeriod,
        profitFeeOne,
        streamingFeeOne,
        { from: DEFAULT_ACCOUNT }
      );

      const formattedLogsOne = await getFormattedLogsFromTxHash(web3, txHashOne);
      const tradingPoolAddressOne = extractNewSetTokenAddressFromLogs(formattedLogsOne);
      tradingPoolInstanceOne = await RebalancingSetTokenV3Contract.at(
        tradingPoolAddressOne,
        web3,
        TX_DEFAULTS
      );

      profitFeeTwo = ether(.2);
      streamingFeeTwo = ether(.02);

      const txHashTwo = await socialTradingAPI.createTradingPoolV2Async(
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
        profitFeePeriod,
        highWatermarkResetPeriod,
        profitFeeTwo,
        streamingFeeTwo,
        { from: DEFAULT_ACCOUNT }
      );

      const formattedLogsTwo = await getFormattedLogsFromTxHash(web3, txHashTwo);
      const tradingPoolAddressTwo = extractNewSetTokenAddressFromLogs(formattedLogsTwo);
      tradingPoolInstanceTwo = await RebalancingSetTokenV3Contract.at(
        tradingPoolAddressTwo,
        web3,
        TX_DEFAULTS
      );

      subjectTradingPools = [tradingPoolInstanceOne.address, tradingPoolInstanceTwo.address];
      subjectIncreaseChainTime = ONE_YEAR_IN_SECONDS;
    });

    async function subject(): Promise<TradingPoolAccumulationInfo[]> {
      await increaseChainTimeAsync(web3, subjectIncreaseChainTime);
      await mineBlockAsync(web3);
      return await socialTradingAPI.batchFetchTradingPoolAccumulationAsync(
        subjectTradingPools
      );
    }

    test('fetches the correct profit/streaming fee accumulation array', async () => {
      const feeState1: any = await performanceFeeCalculator.feeState.callAsync(tradingPoolInstanceOne.address);
      const feeState2: any = await performanceFeeCalculator.feeState.callAsync(tradingPoolInstanceTwo.address);

      const actualAccumulationArray = await subject();

      const lastBlock = await web3.eth.getBlock('latest');

      const rebalancingSetValue1 = await valuationHelper.calculateRebalancingSetTokenValueAsync(
        tradingPoolInstanceOne,
        oracleWhiteList,
      );
      const rebalancingSetValue2 = await valuationHelper.calculateRebalancingSetTokenValueAsync(
        tradingPoolInstanceTwo,
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

      const expectedAccumulationArray = [
        {
          streamingFee: expectedStreamingFee1,
          profitFee: expectedProfitFee1,
        },
        {
          streamingFee: expectedStreamingFee2,
          profitFee: expectedProfitFee2,
        },
      ];

      expect(JSON.stringify(actualAccumulationArray)).to.equal(JSON.stringify(expectedAccumulationArray));
    });
  });

  describe('batchFetchTradingPoolFeeStateAsync', async () => {
    let subjectTradingPools: Address[];

    let tradingPoolInstanceOne: RebalancingSetTokenV3Contract;
    let tradingPoolInstanceTwo: RebalancingSetTokenV3Contract;

    let subjectIncreaseChainTime: BigNumber;

    beforeEach(async () => {
      const manager = setManager.address;
      const allocatorAddress = allocator.address;
      const startingBaseAssetAllocation = ether(0.72);
      const startingUSDValue = ether(100);
      const tradingPoolName = 'CoolPool';
      const tradingPoolSymbol = 'COOL';
      const liquidatorAddress = liquidator.address;
      const feeRecipient = DEFAULT_ACCOUNT;
      const feeCalculatorAddress = performanceFeeCalculator.address;
      const rebalanceInterval = ONE_DAY_IN_SECONDS;
      const failAuctionPeriod = ONE_DAY_IN_SECONDS;
      const { timestamp } = await web3.eth.getBlock('latest');
      const lastRebalanceTimestamp = new BigNumber(timestamp);
      const entryFee = ether(.01);
      const profitFeePeriod = ONE_DAY_IN_SECONDS.mul(30);
      const highWatermarkResetPeriod = ONE_DAY_IN_SECONDS.mul(365);
      const profitFee = ether(.2);
      const streamingFee = ether(.02);

      const txHashOne = await socialTradingAPI.createTradingPoolV2Async(
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
        profitFeePeriod,
        highWatermarkResetPeriod,
        profitFee,
        streamingFee,
        { from: DEFAULT_ACCOUNT }
      );

      const formattedLogsOne = await getFormattedLogsFromTxHash(web3, txHashOne);
      const tradingPoolAddressOne = extractNewSetTokenAddressFromLogs(formattedLogsOne);
      tradingPoolInstanceOne = await RebalancingSetTokenV3Contract.at(
        tradingPoolAddressOne,
        web3,
        TX_DEFAULTS
      );

      const txHashTwo = await socialTradingAPI.createTradingPoolV2Async(
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
        profitFeePeriod,
        highWatermarkResetPeriod,
        profitFee,
        streamingFee,
        { from: DEFAULT_ACCOUNT }
      );

      const formattedLogsTwo = await getFormattedLogsFromTxHash(web3, txHashTwo);
      const tradingPoolAddressTwo = extractNewSetTokenAddressFromLogs(formattedLogsTwo);
      tradingPoolInstanceTwo = await RebalancingSetTokenV3Contract.at(
        tradingPoolAddressTwo,
        web3,
        TX_DEFAULTS
      );

      subjectTradingPools = [tradingPoolInstanceOne.address, tradingPoolInstanceTwo.address];
      subjectIncreaseChainTime = ONE_YEAR_IN_SECONDS;
    });

    async function subject(): Promise<PerformanceFeeInfo[]> {
      await increaseChainTimeAsync(web3, subjectIncreaseChainTime);
      await mineBlockAsync(web3);
      return await socialTradingAPI.batchFetchTradingPoolFeeStateAsync(
        subjectTradingPools
      );
    }

    test('fetches the correct profit/streaming fee accumulation array', async () => {
      const tradingPoolFeeStates = await subject();

      const firstFeeState: any = await performanceFeeCalculator.feeState.callAsync(tradingPoolInstanceOne.address);
      const secondFeeState: any = await performanceFeeCalculator.feeState.callAsync(tradingPoolInstanceTwo.address);

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

  describe('fetchEntryFeeEventsAsync', async () => {
    let issueOneTransactionHash: string;
    let issueOneBlockNumber: number;
    let issueOneBlockTimestamp: number;

    let subjectFromBlock: number;
    let subjectToBlock: any;
    let subjectRebalancingSetTokenV2: Address;
    let subjectGetTimestamp: boolean;

    let rebalancingSetQuantityToIssue1: BigNumber;
    let rebalancingSetQuantityToIssue2: BigNumber;

    let rbSetFeeRecipient: string;
    let rbSetEntryFee: BigNumber;
    let rbSetRebalanceFee: BigNumber;

    let setToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenV2Contract;

    beforeEach(async () => {
      // Deploy a Set
      const setTokenComponents = [wrappedBTC.address, wrappedETH.address];
      const setTokenUnits = [initialEthPrice.div(1e18), initialBtcPrice.div(1e18)];
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

      await core.issue.sendTransactionAsync(setToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([setToken], transferProxy.address);

      rebalancingSetQuantityToIssue1 = ether(7);
      issueOneTransactionHash = await core.issue.sendTransactionAsync(
        rebalancingSetToken.address, rebalancingSetQuantityToIssue1
      );

      // Issue setToken
      await core.issue.sendTransactionAsync(setToken.address, ether(9), TX_DEFAULTS);
      rebalancingSetQuantityToIssue2 = ether(1);
      const lastTxnHash = await core.issue.sendTransactionAsync(
        rebalancingSetToken.address,
        rebalancingSetQuantityToIssue2,
      );

      const issueOneTransaction = await web3.eth.getTransaction(issueOneTransactionHash);
      issueOneBlockNumber = issueOneTransaction['blockNumber'];
      const issueOneBlock = await web3.eth.getBlock(issueOneBlockNumber);
      issueOneBlockTimestamp = issueOneBlock.timestamp;

      const earlyBlockNumber = issueOneTransaction['blockNumber'];

      const lastTransaction = await web3.eth.getTransaction(lastTxnHash);
      const recentIssueBlockNumber = lastTransaction['blockNumber'];

      subjectFromBlock = earlyBlockNumber;
      subjectToBlock = recentIssueBlockNumber;
      subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
      subjectGetTimestamp = true;
    });

    async function subject(): Promise<EntryFeePaid[]> {
      return await socialTradingAPI.fetchEntryFeeEventsAsync(
        subjectRebalancingSetTokenV2,
        subjectFromBlock,
        subjectToBlock,
        subjectGetTimestamp
      );
    }

    test('retrieves the right event logs length', async () => {
      const events = await subject();

      expect(events.length).to.equal(2);
    });

    test('retrieves the correct first log EntryFeePaid properties', async () => {
      const events = await subject();

      const [firstEvent] = events;
      const expectedFee = rebalancingSetQuantityToIssue1.mul(rbSetEntryFee).div(1e18);

      expect(issueOneTransactionHash).to.equal(firstEvent.transactionHash);
      expect(rbSetFeeRecipient).to.equal(firstEvent.feeRecipient);
      expect(expectedFee).to.bignumber.equal(firstEvent.feeQuantity);
      expect(issueOneBlockTimestamp).to.equal(firstEvent.timestamp);
    });
  });

  describe('fetchRebalanceFeePaidEventsAsync', async () => {
    let earlyTxnHash: string;
    let earlyBlockNumber: number;
    let lastTransactionTimestamp: number;

    let subjectFromBlock: number;
    let subjectToBlock: any;
    let subjectRebalancingSetTokenV2: Address;
    let subjectGetTimestamp: boolean;

    let rebalancingSetQuantityToIssue1: BigNumber;
    let currentSetQuantity: BigNumber;

    let nextSetToken: SetTokenContract;
    let liquidatorData: string;

    let rbSetFeeRecipient: string;
    let rbSetEntryFee: BigNumber;
    let rbSetRebalanceFee: BigNumber;

    let setToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenV2Contract;

    beforeEach(async () => {
      // Deploy a Set
      const setTokenComponents1 = [wrappedETH.address, wrappedBTC.address];
      const setTokenUnits1 = [initialBtcPrice.mul(1e10).div(initialEthPrice).round(0, 3), new BigNumber(1)];
      const naturalUnit1 = new BigNumber(1e10);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        factory.address,
        setTokenComponents1,
        setTokenUnits1,
        naturalUnit1,
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

      earlyTxnHash = await core.issue.sendTransactionAsync(setToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([setToken], transferProxy.address);

      rebalancingSetQuantityToIssue1 = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1);

      const earlyTransaction = await web3.eth.getTransaction(earlyTxnHash);
      earlyBlockNumber = earlyTransaction['blockNumber'];

      // Deploy a Set
      const setTokenComponents2 = [wrappedETH.address, wrappedBTC.address];
      const setTokenUnits2 = [initialBtcPrice.mul(1e10).div(initialEthPrice).round(0, 3), new BigNumber(3)];
      const naturalUnit3 = new BigNumber(1e10);
      nextSetToken = await deploySetTokenAsync(
        web3,
        core,
        factory.address,
        setTokenComponents2,
        setTokenUnits2,
        naturalUnit3,
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
      const lastTxnBlock = await web3.eth.getBlock(recentIssueBlockNumber);
      lastTransactionTimestamp = lastTxnBlock.timestamp;

      subjectFromBlock = earlyBlockNumber;
      subjectToBlock = recentIssueBlockNumber;
      subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
      subjectGetTimestamp = true;
    });

    async function subject(): Promise<any> {
      return await socialTradingAPI.fetchRebalanceFeePaidEventsAsync(
        subjectRebalancingSetTokenV2,
        subjectFromBlock,
        subjectToBlock,
        subjectGetTimestamp,
      );
    }

    test('retrieves the right event logs length', async () => {
      const events = await subject();

      expect(events.length).to.equal(1);
    });

    test('retrieves the correct first log RebalanceSettled properties', async () => {
      const events = await subject();

      const [firstEvent] = events;
      expect(firstEvent.feeRecipient).to.equal(rbSetFeeRecipient);
      expect(firstEvent.rebalanceIndex).to.bignumber.equal(0);
      const expectedFeeQuantity = rebalancingSetQuantityToIssue1
                                    .mul(rbSetRebalanceFee)
                                    .div(new BigNumber(1e18).sub(rbSetRebalanceFee)).round(0, 3);
      expect(firstEvent.feeQuantity).to.bignumber.equal(expectedFeeQuantity);
      expect(firstEvent.timestamp).to.equal(lastTransactionTimestamp);
    });
  });

});
