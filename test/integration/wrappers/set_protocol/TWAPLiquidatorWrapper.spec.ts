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
  CoreContract,
  CoreHelper,
  ERC20Helper,
  FeeCalculatorHelper,
  LiquidatorHelper,
  OracleWhiteListContract,
  PerformanceFeeCalculatorContract,
  RebalancingSetTokenV3Contract,
  RebalancingSetTokenV3FactoryContract,
  RebalanceAuctionModuleContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  TWAPLiquidatorContract,
  ValuationHelper,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  OracleHelper,
  UpdatableOracleMockContract,
} from 'set-protocol-oracles';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import {
  ONE_DAY_IN_SECONDS,
  TX_DEFAULTS,
  ONE_HOUR_IN_SECONDS
} from '@src/constants';
import {
  addWhiteListedTokenAsync,
  createDefaultRebalancingSetTokenV3Async,
  approveForTransferAsync,
  deployBaseContracts,
  deployTWAPLiquidatorAsync,
  deployOracleWhiteListAsync,
  deployRebalancingSetTokenV3FactoryContractAsync,
  deploySetTokenAsync,
  deploySocialTradingManagerMockAsync,
  deployTokensSpecifyingDecimals,
  deployUpdatableOracleMockAsync,
  deployWhiteListContract,
  increaseChainTimeAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether
} from '@src/util';
import { Address, } from '@src/types/common';
import { TWAPLiquidatorWrapper } from '@src/wrappers';

import ChaiSetup from '@test/helpers/chaiSetup';
ChaiSetup.configure();

const Core = require('set-protocol-contracts/dist/artifacts/ts/Core').Core;

const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const { Web3Utils } = setProtocolUtils;
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

  let liquidator: TWAPLiquidatorContract;
  let performanceFeeCalculator: PerformanceFeeCalculatorContract;
  let rebalancingV3Factory: RebalancingSetTokenV3FactoryContract;
  let oracleWhiteList: OracleWhiteListContract;
  let liquidatorWhiteList: WhiteListContract;
  let feeCalculatorWhiteList: WhiteListContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;

  let ethOracleProxy: UpdatableOracleMockContract;
  let btcOracleProxy: UpdatableOracleMockContract;

  let initialEthPrice: BigNumber;
  let initialBtcPrice: BigNumber;

  let maxProfitFeePercentage: BigNumber;
  let maxStreamingFeePercentage: BigNumber;

  const coreHelper = new CoreHelper(DEFAULT_ACCOUNT, DEFAULT_ACCOUNT);
  const erc20Helper = new ERC20Helper(DEFAULT_ACCOUNT);
  const oracleHelper = new OracleHelper(DEFAULT_ACCOUNT);
  const valuationHelper = new ValuationHelper(DEFAULT_ACCOUNT, coreHelper, erc20Helper, oracleHelper);
  const feeCalculatorHelper = new FeeCalculatorHelper(DEFAULT_ACCOUNT);
  const liquidatorHelper = new LiquidatorHelper(DEFAULT_ACCOUNT, erc20Helper, valuationHelper);
  // const rebalancingSetV3Helper = new RebalancingSetV3Helper(
  //   DEFAULT_ACCOUNT,
  //   coreHelper,
  //   erc20Helper,
  //   blockchain,
  // );

  let twapLiquidatorWrapper: TWAPLiquidatorWrapper;

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

    const auctionPeriod = ONE_HOUR_IN_SECONDS;
    const rangeStart = new BigNumber(10); // 10% above fair value
    const rangeEnd = new BigNumber(10); // 10% below fair value
    const name = 'liquidator';
    const assetPairHashes = [
      liquidatorHelper.generateAssetPairHashes(wrappedETH.address, wrappedBTC.address),
    ];
    const assetPairBounds = [
      {min: ether(10 ** 4).toString(), max: ether(10 ** 6).toString()},
    ];
    liquidator = await deployTWAPLiquidatorAsync(
      web3,
      core.address,
      oracleWhiteList.address,
      auctionPeriod,
      rangeStart,
      rangeEnd,
      assetPairHashes,
      assetPairBounds,
      name
    );
    liquidatorWhiteList = await deployWhiteListContract(web3, [liquidator.address]);

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
      [performanceFeeCalculator.address]
    );

    rebalancingV3Factory = await deployRebalancingSetTokenV3FactoryContractAsync(
      web3,
      core,
      rebalancingComponentWhiteList,
      liquidatorWhiteList,
      feeCalculatorWhiteList
    );
    await core.addFactory.sendTransactionAsync(rebalancingV3Factory.address);

    twapLiquidatorWrapper = new TWAPLiquidatorWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('iterateChunkAuction', async () => {
    let rebalancingSetTokenV3: RebalancingSetTokenV3Contract;
    let currentSet: SetTokenContract;
    let nextSet: SetTokenContract;

    let subjectLiquidator: Address;
    let subjectRebalancingSetToken: Address;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setManager = await deploySocialTradingManagerMockAsync(web3);
      console.log('here');
      const collateralNaturalUnit = new BigNumber(10 ** 12);

      const currentSetComponents = [wrappedETH.address, wrappedBTC.address];
      const currentSetUnits = [new BigNumber(100), new BigNumber(10 ** 12)];
      currentSet = await deploySetTokenAsync(
        web3,
        core,
        factory.address,
        currentSetComponents,
        currentSetUnits,
        collateralNaturalUnit
      );

      const nextSetComponents = [wrappedETH.address, wrappedBTC.address];
      const nextSetUnits = [new BigNumber(100), new BigNumber(5 * 10 ** 12)];
      nextSet = await deploySetTokenAsync(
        web3,
        core,
        factory.address,
        nextSetComponents,
        nextSetUnits,
        collateralNaturalUnit
      );
      console.log('here');
      const failRebalancePeriod = ONE_DAY_IN_SECONDS;
      const block = await web3.eth.getBlock('latest');
      console.log(setManager.address);
      rebalancingSetTokenV3 = await createDefaultRebalancingSetTokenV3Async(
        web3,
        core,
        rebalancingV3Factory.address,
        setManager.address,
        liquidator.address,
        DEFAULT_ACCOUNT,
        performanceFeeCalculator.address,
        currentSet.address,
        failRebalancePeriod,
        new BigNumber(block.timestamp).sub(ONE_DAY_IN_SECONDS),
      );
      console.log('here');
      await setManager.updateRecord.sendTransactionAsync(
        rebalancingSetTokenV3.address,
        ACCOUNTS[1].address,
        ACCOUNTS[2].address,
        ether(.6)
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(
        currentSet.address,
        ether(8),
        {from: DEFAULT_ACCOUNT}
      );
      await approveForTransferAsync([currentSet], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetTokenV3.address, rebalancingSetQuantityToIssue);

      await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

      const liquidatorData = liquidatorHelper.generateTWAPLiquidatorCalldata(
        ether(10 ** 6),
        ONE_HOUR_IN_SECONDS,
      );
      console.log(liquidatorData);
      await setManager.rebalance.sendTransactionAsync(
        rebalancingSetTokenV3.address,
        nextSet.address,
        ether(.4),
        liquidatorData
      );
      console.log('here');
      await rebalanceAuctionModule.bidAndWithdraw.sendTransactionAsync(
        rebalancingSetTokenV3.address,
        rebalancingSetQuantityToIssue,
        true
      );

      subjectLiquidator = liquidator.address;
      subjectRebalancingSetToken = rebalancingSetTokenV3.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await twapLiquidatorWrapper.iterateChunkAuction(
        subjectLiquidator,
        subjectRebalancingSetToken,
        { from: subjectCaller }
      );
    }

    it('fetches the correct poolInfo data', async () => {
      await subject();

      expect();
    });
  });
});