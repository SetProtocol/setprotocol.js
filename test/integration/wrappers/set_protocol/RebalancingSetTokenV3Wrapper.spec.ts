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
  FeeCalculatorHelper,
  LinearAuctionLiquidatorContract,
  OracleWhiteListContract,
  PerformanceFeeCalculatorContract,
  RebalancingSetTokenV3Contract,
  RebalancingSetTokenV3FactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  UpdatableOracleMockContract,
} from 'set-protocol-oracles';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import {
  RebalancingSetTokenV3Wrapper
} from '@src/wrappers';
import {
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
  ONE_WEEK_IN_SECONDS,
} from '@src/constants';
import {
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  deployBaseContracts,
  deployLinearAuctionLiquidatorContractAsync,
  deployOracleWhiteListAsync,
  deployRebalancingSetTokenV3FactoryContractAsync,
  createDefaultRebalancingSetTokenV3Async,
  deploySetTokenAsync,
  deployTokensSpecifyingDecimals,
  deployWhiteListContract,
  deployUpdatableOracleMockAsync,
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

describe('RebalancingSetTokenV3Wrapper', () => {
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

  let ethOracleProxy: UpdatableOracleMockContract;
  let btcOracleProxy: UpdatableOracleMockContract;

  let initialEthPrice: BigNumber;
  let initialBtcPrice: BigNumber;

  let rbSetFeeRecipient: string;
  let rbSetEntryFee: BigNumber;
  let rbSetProfitFee: BigNumber;
  let rbSetStreamingFee: BigNumber;

  let rebalancingSetTokenV3Wrapper: RebalancingSetTokenV3Wrapper;

  let setToken: SetTokenContract;
  let rebalancingSetToken: RebalancingSetTokenV3Contract;

  const feeCalculatorHelper = new FeeCalculatorHelper(DEFAULT_ACCOUNT);

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
      ,
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

    const maxProfitFeePercentage = ether(.4);
    const maxStreamingFeePercentage = ether(.07);
    performanceFeeCalculator = await feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(
      core.address,
      oracleWhiteList.address,
      maxProfitFeePercentage,
      maxStreamingFeePercentage,
    );
    feeCalculatorWhiteList = await deployWhiteListContract(web3, [performanceFeeCalculator.address]);

    rebalancingFactory = await deployRebalancingSetTokenV3FactoryContractAsync(
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
    const rebalanceFeeCalculator = performanceFeeCalculator.address;
    const failRebalancePeriod = ONE_DAY_IN_SECONDS;
    const { timestamp } = await web3.eth.getBlock('latest');
    const lastRebalanceTimestamp = new BigNumber(timestamp);
    rbSetEntryFee = ether(.01);
    rbSetProfitFee = ether(.2);
    rbSetStreamingFee = ether(.02);
    rebalancingSetToken = await createDefaultRebalancingSetTokenV3Async(
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
      rbSetProfitFee,
      rbSetStreamingFee
    );

    rebalancingSetTokenV3Wrapper = new RebalancingSetTokenV3Wrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('actualizeFee', async () => {
    let subjectRebalancingSetTokenV3: Address;

    let rebalancingSetQuantityToIssue1: BigNumber;

    beforeEach(async () => {
      await core.issue.sendTransactionAsync(setToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([setToken], transferProxy.address);

      rebalancingSetQuantityToIssue1 = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1);

      await increaseChainTimeAsync(web3, ONE_WEEK_IN_SECONDS.mul(52));
      subjectRebalancingSetTokenV3 = rebalancingSetToken.address;

      const newPrice = ether(250);
      await ethOracleProxy.updatePrice.sendTransactionAsync(newPrice);
    });

    async function subject(): Promise<any> {
      return await rebalancingSetTokenV3Wrapper.actualizeFee(
        subjectRebalancingSetTokenV3,
        TX_DEFAULTS
      );
    }

    test('successfully creates poolInfo', async () => {
      await subject();

      const { timestamp } = await web3.eth.getBlock('latest');

      const feeState: any = await performanceFeeCalculator.feeState.callAsync(subjectRebalancingSetTokenV3);
      expect(feeState.lastProfitFeeTimestamp).to.be.bignumber.equal(timestamp);
    });
  });
});
