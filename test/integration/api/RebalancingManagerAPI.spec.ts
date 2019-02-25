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
import { Core } from 'set-protocol-contracts';
import {
  BTCETHRebalancingManagerContract,
  CoreContract,
  ConstantAuctionPriceCurveContract,
  MedianContract,
  SetTokenContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { RebalancingManagerAPI } from '@src/api';
import {
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
} from '@src/constants';
import {
  addPriceCurveToCoreAsync,
  addPriceFeedOwnerToMedianizer,
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployBtcEthManagerContractAsync,
  deployConstantAuctionPriceCurveAsync,
  deploySetTokenAsync,
  deployMedianizerAsync,
  deployTokensSpecifyingDecimals,
  increaseChainTimeAsync,
  updateMedianizerPriceAsync,
} from '@test/helpers';
import { BigNumber } from '@src/util';
import { Address, RebalancingManagerDetails } from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const { SetProtocolTestUtils: SetTestUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('RebalancingManagerAPI', () => {
  let core: CoreContract;
  let transferProxy: TransferProxyContract;
  let factory: SetTokenFactoryContract;
  let rebalancingFactory: RebalancingSetTokenFactoryContract;
  let constantAuctionPriceCurve: ConstantAuctionPriceCurveContract;
  let btcethRebalancingManager: BTCETHRebalancingManagerContract;
  let btcMedianizer: MedianContract;
  let ethMedianizer: MedianContract;
  let wrappedBTC: StandardTokenMockContract;
  let wrappedETH: StandardTokenMockContract;
  let whitelist: WhiteListContract;

  let btcMultiplier: BigNumber;
  let ethMultiplier: BigNumber;
  let auctionTimeToPivot: BigNumber;

  let rebalancingManagerAPI: RebalancingManagerAPI;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [core, transferProxy, , factory, rebalancingFactory, , whitelist] = await deployBaseContracts(web3);

    btcMedianizer = await deployMedianizerAsync(web3);
    await addPriceFeedOwnerToMedianizer(btcMedianizer, DEFAULT_ACCOUNT);
    ethMedianizer = await deployMedianizerAsync(web3);
    await addPriceFeedOwnerToMedianizer(ethMedianizer, DEFAULT_ACCOUNT);

    [wrappedBTC, wrappedETH] = await deployTokensSpecifyingDecimals(2, [8, 18], web3, DEFAULT_ACCOUNT);
    await approveForTransferAsync(
      [wrappedBTC, wrappedETH],
      transferProxy.address
    );
    await addWhiteListedTokenAsync(
      whitelist,
      wrappedBTC.address,
    );
    await addWhiteListedTokenAsync(
      whitelist,
      wrappedETH.address,
    );

    constantAuctionPriceCurve = await deployConstantAuctionPriceCurveAsync(
      web3,
      DEFAULT_AUCTION_PRICE_NUMERATOR,
      DEFAULT_AUCTION_PRICE_DENOMINATOR,
    );

    addPriceCurveToCoreAsync(
      core,
      constantAuctionPriceCurve.address,
    );

    btcMultiplier = new BigNumber(1);
    ethMultiplier = new BigNumber(1);
    auctionTimeToPivot = ONE_DAY_IN_SECONDS;

    btcethRebalancingManager = await deployBtcEthManagerContractAsync(
      web3,
      core.address,
      btcMedianizer.address,
      ethMedianizer.address,
      wrappedBTC.address,
      wrappedETH.address,
      factory.address,
      constantAuctionPriceCurve.address,
      auctionTimeToPivot,
      btcMultiplier,
      ethMultiplier,
    );

    rebalancingManagerAPI = new RebalancingManagerAPI(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('getRebalancingManagerDetailsAsync', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = btcethRebalancingManager.address;
    });

    async function subject(): Promise<RebalancingManagerDetails> {
      return await rebalancingManagerAPI.getRebalancingManagerDetailsAsync(
        subjectManagerAddress,
      );
    }

    test('gets the correct core address', async () => {
      const details = await subject();
      expect(details.core).to.equal(core.address);
    });

    test('gets the correct btcPriceFeed address', async () => {
      const details = await subject();
      expect(details.btcPriceFeed).to.equal(btcMedianizer.address);
    });

    test('gets the correct ethPriceFeed address', async () => {
      const details = await subject();
      expect(details.ethPriceFeed).to.equal(ethMedianizer.address);
    });

    test('gets the correct btcAddress address', async () => {
      const details = await subject();
      expect(details.btcAddress).to.equal(wrappedBTC.address);
    });

    test('gets the correct ethAddress address', async () => {
      const details = await subject();
      expect(details.ethAddress).to.equal(wrappedETH.address);
    });

    test('gets the correct setTokenFactory address', async () => {
      const details = await subject();
      expect(details.setTokenFactory).to.equal(factory.address);
    });

    test('gets the correct btcMultiplier address', async () => {
      const details = await subject();
      expect(details.btcMultiplier).to.bignumber.equal(btcMultiplier);
    });

    test('gets the correct ethMultiplier address', async () => {
      const details = await subject();
      expect(details.ethMultiplier).to.bignumber.equal(ethMultiplier);
    });

    test('gets the correct auctionLibrary address', async () => {
      const details = await subject();
      expect(details.auctionLibrary).to.equal(constantAuctionPriceCurve.address);
    });

    test('gets the correct auctionTimeToPivot address', async () => {
      const details = await subject();
      expect(details.auctionTimeToPivot).to.bignumber.equal(auctionTimeToPivot);
    });
  });

  describe('proposeAsync', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;

    let proposalPeriod: BigNumber;
    let btcPrice: BigNumber;
    let ethPrice: BigNumber;
    let ethUnit: BigNumber;

    let initialAllocationToken: SetTokenContract;
    let timeFastForward: BigNumber;

    let subjectRebalancingSetToken: Address;
    let subjectManagerAddress: Address;
    let subjectCaller: Address;

    beforeAll(async () => {
      btcPrice = new BigNumber(4082 * 10 ** 18);
      ethPrice = new BigNumber(128 * 10 ** 18);
      ethUnit = new BigNumber(28.999 * 10 ** 10);
    });

    beforeEach(async () => {
      initialAllocationToken = await deploySetTokenAsync(
        web3,
        core,
        factory.address,
        [wrappedBTC.address, wrappedETH.address],
        [new BigNumber(1).mul(btcMultiplier), ethUnit.mul(ethMultiplier)],
        new BigNumber(10 ** 10),
      );

      proposalPeriod = ONE_DAY_IN_SECONDS;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingFactory.address,
        btcethRebalancingManager.address,
        initialAllocationToken.address,
        proposalPeriod
      );

      timeFastForward = ONE_DAY_IN_SECONDS.add(1);
      await updateMedianizerPriceAsync(
        web3,
        btcMedianizer,
        btcPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      await updateMedianizerPriceAsync(
        web3,
        ethMedianizer,
        ethPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      subjectManagerAddress = btcethRebalancingManager.address;
      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      await increaseChainTimeAsync(web3, timeFastForward);
      return await rebalancingManagerAPI.proposeAsync(
        subjectManagerAddress,
        subjectRebalancingSetToken,
        { from: subjectCaller },
      );
    }

    test('successfully proposes', async () => {
      await subject();
    });
  });
});
