/*
  Copyright 2020 Set Labs Inc.

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
  FeeCalculatorHelper,
  LinearAuctionLiquidatorContract,
  OracleWhiteListContract,
  PerformanceFeeCalculatorContract,
  RebalancingSetTokenV3FactoryContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  SocialAllocatorContract,
  SocialTradingManagerV2Contract
} from 'set-protocol-strategies';

import {
  ConstantPriceOracleContract,
} from 'set-protocol-oracles';

import { DEFAULT_ACCOUNT, NULL_ADDRESS } from '@src/constants/accounts';
import { SocialTradingAPI } from '@src/api';
import { SocialTradingManagerV2Wrapper } from '@src/wrappers';
import {
  ONE_DAY_IN_SECONDS,
  TX_DEFAULTS,
  ZERO,
  ZERO_BYTES
} from '@src/constants';
import {
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  deployBaseContracts,
  deployConstantPriceOracleAsync,
  deployLinearAuctionLiquidatorContractAsync,
  deployOracleWhiteListAsync,
  deployRebalancingSetTokenV3FactoryContractAsync,
  deploySocialAllocatorAsync,
  deploySocialTradingManagerV2Async,
  deployTokensSpecifyingDecimals,
  deployWhiteListContract,
} from '@test/helpers';
import {
  BigNumber,
  ether,
  extractNewSetTokenAddressFromLogs,
  getFormattedLogsFromTxHash
} from '@src/util';
import { Address, SetProtocolConfig } from '@src/types/common';
import { Assertions } from '@src/assertions';

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

describe('SocialTradingManagerV2Wrapper', () => {
  let core: CoreContract;
  let transferProxy: TransferProxyContract;
  let factory: SetTokenFactoryContract;
  let rebalancingComponentWhiteList: WhiteListContract;
  let wrappedBTC: StandardTokenMockContract;
  let wrappedETH: StandardTokenMockContract;

  let liquidator: LinearAuctionLiquidatorContract;
  let performanceFeeCalculator: PerformanceFeeCalculatorContract;
  let rebalancingFactory: RebalancingSetTokenV3FactoryContract;
  let oracleWhiteList: OracleWhiteListContract;
  let liquidatorWhiteList: WhiteListContract;
  let feeCalculatorWhiteList: WhiteListContract;

  let ethOracleProxy: ConstantPriceOracleContract;
  let btcOracleProxy: ConstantPriceOracleContract;

  let allocator: SocialAllocatorContract;

  let initialEthPrice: BigNumber;
  let initialBtcPrice: BigNumber;
  let pricePrecision: BigNumber;

  let setManager: SocialTradingManagerV2Contract;
  let tradingPoolAddress: Address;
  let socialTradingManagerWrapper: SocialTradingManagerV2Wrapper;

  const feeCalculatorHelper = new FeeCalculatorHelper(DEFAULT_ACCOUNT);
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
    protocolViewerAddress: NULL_ADDRESS,
  };

  const assertions = new Assertions(web3);
  const socialTradingAPI = new SocialTradingAPI(web3, assertions, setProtocolConfig);

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

    const maxProfitFeePercentage = ether(.4);
    const maxStreamingFeePercentage = ether(.07);
    performanceFeeCalculator = await feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(
      core.address,
      oracleWhiteList.address,
      maxProfitFeePercentage,
      maxStreamingFeePercentage,
    );
    feeCalculatorWhiteList = await deployWhiteListContract(
      web3,
      [performanceFeeCalculator.address]
    );

    rebalancingFactory = await deployRebalancingSetTokenV3FactoryContractAsync(
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

    setManager = await deploySocialTradingManagerV2Async(
      web3,
      core.address,
      rebalancingFactory.address,
      [allocator.address]
    );

    await setManager.setTimeLockPeriod.sendTransactionAsync(ONE_DAY_IN_SECONDS);

    socialTradingManagerWrapper = new SocialTradingManagerV2Wrapper(web3);

    const manager = setManager.address;
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
    tradingPoolAddress = extractNewSetTokenAddressFromLogs(formattedLogs, 1);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('adjustFee', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectNewFeeCallData: string;
    let subjectCaller: Address;

    let feeType: BigNumber;
    let feePercentage: BigNumber;

    beforeEach(async () => {
      feeType = ZERO;
      feePercentage = ether(.03);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectNewFeeCallData = SetUtils.generateAdjustFeeCallData(
        feeType,
        feePercentage
      );

      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await socialTradingManagerWrapper.adjustFee(
        subjectManager,
        subjectTradingPool,
        subjectNewFeeCallData,
        { from: subjectCaller }
      );
    }

    test('successfully initiates adjustFee process', async () => {
      const txHash = await subject();

      const { input } = await web3.eth.getTransaction(txHash);
      const upgradeHash = web3.utils.soliditySha3(input);

      const upgradeIdentifier = await setManager.upgradeIdentifier.callAsync(subjectTradingPool);
      expect(upgradeIdentifier).to.equal(upgradeHash);
    });
  });

  describe('removeRegisteredUpgrade', async () => {
    let subjectManager: Address;
    let subjectTradingPool: Address;
    let subjectUpgradeHash: string;
    let subjectCaller: Address;

    let feeType: BigNumber;
    let feePercentage: BigNumber;

    beforeEach(async () => {
      feeType = ZERO;
      feePercentage = ether(.03);

      subjectManager = setManager.address;
      subjectTradingPool = tradingPoolAddress;
      subjectCaller = DEFAULT_ACCOUNT;

      const newFeeCallData = SetUtils.generateAdjustFeeCallData(
        feeType,
        feePercentage
      );

      const txHash = await socialTradingManagerWrapper.adjustFee(
        subjectManager,
        subjectTradingPool,
        newFeeCallData,
        { from: subjectCaller }
      );

      const { input } = await web3.eth.getTransaction(txHash);
      subjectUpgradeHash = web3.utils.soliditySha3(input);
    });

    async function subject(): Promise<string> {
      return await socialTradingManagerWrapper.removeRegisteredUpgrade(
        subjectManager,
        subjectTradingPool,
        subjectUpgradeHash,
        { from: subjectCaller }
      );
    }

    test('successfully removes upgradeHash', async () => {
      await subject();

      const upgradeIdentifier = await setManager.upgradeIdentifier.callAsync(subjectTradingPool);
      expect(upgradeIdentifier).to.equal(ZERO_BYTES);
    });
  });
});