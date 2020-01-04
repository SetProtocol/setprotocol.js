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
  Core,
  CoreContract,
  FixedFeeCalculatorContract,
  LinearAuctionLiquidatorContract,
  OracleWhiteListContract,
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
} from 'set-protocol-strategies';

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import {
  ERC20Wrapper,
  RebalancingSetTokenV2Wrapper
} from '@src/wrappers';
import {
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
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
} from '@test/helpers';
import {
  BigNumber,
  ether
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

  let ethOracleProxy: ConstantPriceOracleContract;
  let btcOracleProxy: ConstantPriceOracleContract;

  let initialEthPrice: BigNumber;
  let initialBtcPrice: BigNumber;
  let pricePrecision: BigNumber;

  let erc20Wrapper: ERC20Wrapper;
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

    // Deploy a Set
    const setTokenComponents = [wrappedBTC.address, wrappedETH.address];
    const setTokenUnits = [initialEthPrice, initialBtcPrice];
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
    const feeRecipient = DEFAULT_ACCOUNT;
    const rebalanceFeeCalculator = feeCalculator.address;
    const rebalanceInterval = ONE_DAY_IN_SECONDS;
    const failRebalancePeriod = ONE_DAY_IN_SECONDS;
    const { timestamp } = await web3.eth.getBlock('latest');
    const lastRebalanceTimestamp = new BigNumber(timestamp);
    const entryFee = ether(.01);
    const rebalanceFee = ether(.01);
    rebalancingSetToken = await createDefaultRebalancingSetTokenV2Async(
      web3,
      core,
      rebalancingFactory.address,
      managerAddress,
      liquidator.address,
      feeRecipient,
      rebalanceFeeCalculator,
      setToken.address,
      failRebalancePeriod,
      lastRebalanceTimestamp,
      entryFee,
      rebalanceFee,
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

    beforeEach(async () => {
      console.log(1);

      // Issue setToken
      // await core.issue.sendTransactionAsync(setToken.address, ether(1), TX_DEFAULTS);

      console.log(1.3);
      // await approveForTransferAsync([setToken], transferProxy.address);

      // Use issued setToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue1 = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1);
      console.log(1.5);
      // Issue setToken
      await core.issue.sendTransactionAsync(setToken.address, ether(9), TX_DEFAULTS);

      console.log(2);
      // Use issued setToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue2 = ether(1);
      const lastTxnHash = await core.issue.sendTransactionAsync(
        rebalancingSetToken.address,
        rebalancingSetQuantityToIssue2,
      );

      console.log(3);

      const earlyTransaction = await web3.eth.getTransaction(earlyTxnHash);
      earlyBlockNumber = earlyTransaction['blockNumber'];

      console.log(4);

      const lastTransaction = await web3.eth.getTransaction(lastTxnHash);
      const recentIssueBlockNumber = lastTransaction['blockNumber'];

      console.log(5);

      subjectFromBlock = earlyBlockNumber;
      subjectToBlock = recentIssueBlockNumber;
      subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
    });

    async function subject(): Promise<any> {
      console.log('geetting called here');
      // return await rebalancingSetTokenV2Wrapper.entryFeePaidEvent(
      //   subjectRebalancingSetTokenV2,
      //   subjectFromBlock,
      //   subjectToBlock,
      // );
    }

    test('retrieves the right event logs length', async () => {
      const events = await subject();

      expect(events.length).to.equal(2);
    });

    // test('retrieves the correct event properties', async () => {
    //   const events = await subject();

    //   const { transactionHash, blockNumber, address, event } = events[0];

    //   expect(transactionHash).to.equal(bid1TxnHash);

    //   const bidOneTransaction = await web3.eth.getTransaction(bid1TxnHash);
    //   const bidOneBlockNumber = bidOneTransaction['blockNumber'];
    //   expect(blockNumber).to.equal(bidOneBlockNumber);
    //   expect(address).to.equal(rebalanceAuctionModule.address);
    //   expect(event).to.equal('BidPlaced');
    // });

    // test('retrieves the bid event properties', async () => {
    //   const events = await subject();

    //   const { returnValues } = events[0];
    //   const { bidder, executionQuantity } = returnValues;
    //   const returnedRebalancingSetTokenV2 = returnValues['rebalancingSetToken'];

    //   expect(returnedRebalancingSetTokenV2).to.equal(rebalancingSetToken.address);
    //   expect(bidder).to.equal(bidderAccount);
    //   expect(executionQuantity).to.bignumber.equal(bidQuantity);
    // });
  });
});
