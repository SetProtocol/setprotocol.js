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

import {
  ETHDaiRebalancingManagerContract,
} from 'set-protocol-strategies';

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { ETHDAIRebalancingManagerWrapper } from '@src/wrappers';
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
  deployEthDaiManagerContractAsync,
  deployConstantAuctionPriceCurveAsync,
  deploySetTokenAsync,
  deployMedianizerAsync,
  deployTokensSpecifyingDecimals,
  increaseChainTimeAsync,
  updateMedianizerPriceAsync,
} from '@test/helpers';
import {
  BigNumber,
} from '@src/util';
import { Address } from '@src/types/common';

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


describe('ETHDAIRebalancingManagerWrapper', () => {
  let core: CoreContract;
  let transferProxy: TransferProxyContract;
  let factory: SetTokenFactoryContract;
  let rebalancingFactory: RebalancingSetTokenFactoryContract;
  let constantAuctionPriceCurve: ConstantAuctionPriceCurveContract;
  let ethDaiRebalancingManager: ETHDaiRebalancingManagerContract;
  let ethMedianizer: MedianContract;
  let wrappedETH: StandardTokenMockContract;
  let dai: StandardTokenMockContract;
  let whitelist: WhiteListContract;

  let ethMultiplier: BigNumber;
  let daiMultiplier: BigNumber;
  let maximumLowerThreshold: BigNumber;
  let minimumUpperThreshold: BigNumber;
  let auctionTimeToPivot: BigNumber;

  let ethDaiManagerWrapper: ETHDAIRebalancingManagerWrapper;

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
      rebalancingFactory, ,
      whitelist,
    ] = await deployBaseContracts(web3);

    ethMedianizer = await deployMedianizerAsync(web3);
    await addPriceFeedOwnerToMedianizer(ethMedianizer, DEFAULT_ACCOUNT);

    [wrappedETH, dai] = await deployTokensSpecifyingDecimals(2, [18, 18], web3, DEFAULT_ACCOUNT);

    await approveForTransferAsync(
      [wrappedETH, dai],
      transferProxy.address
    );
    await addWhiteListedTokenAsync(
      whitelist,
      wrappedETH.address,
    );

    await addWhiteListedTokenAsync(
      whitelist,
      dai.address,
    );

    constantAuctionPriceCurve = await deployConstantAuctionPriceCurveAsync(
      web3,
      DEFAULT_AUCTION_PRICE_NUMERATOR,
      DEFAULT_AUCTION_PRICE_DENOMINATOR,
    );

    await addPriceCurveToCoreAsync(
      core,
      constantAuctionPriceCurve.address,
    );

    ethMultiplier = new BigNumber(1);
    daiMultiplier = new BigNumber(1);

    auctionTimeToPivot = ONE_DAY_IN_SECONDS;

    maximumLowerThreshold = new BigNumber(48);
    minimumUpperThreshold = new BigNumber(52);
    ethDaiRebalancingManager = await deployEthDaiManagerContractAsync(
      web3,
      core.address,
      ethMedianizer.address,
      dai.address,
      wrappedETH.address,
      factory.address,
      constantAuctionPriceCurve.address,
      auctionTimeToPivot,
      [ethMultiplier, daiMultiplier],
      [maximumLowerThreshold, minimumUpperThreshold]
    );

    ethDaiManagerWrapper = new ETHDAIRebalancingManagerWrapper(
      web3,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('core', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<Address> {
      return await ethDaiManagerWrapper.core(
        subjectManagerAddress,
      );
    }

    test('gets the correct core', async () => {
      const address = await subject();
      expect(address).to.equal(core.address);
    });
  });

  describe('ethPriceFeed', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<Address> {
      return await ethDaiManagerWrapper.ethPriceFeed(
        subjectManagerAddress,
      );
    }

    test('gets the correct ethPriceFeed', async () => {
      const address = await subject();
      expect(address).to.equal(ethMedianizer.address);
    });
  });

  describe('ethAddress', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<Address> {
      return await ethDaiManagerWrapper.ethAddress(
        subjectManagerAddress,
      );
    }

    test('gets the correct ethAddress', async () => {
      const address = await subject();
      expect(address).to.equal(wrappedETH.address);
    });
  });

  describe('daiAddress', async () => {
    let subjectManagerAddress: Address;


    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<Address> {
      return await ethDaiManagerWrapper.daiAddress(
        subjectManagerAddress,
      );
    }

    test('gets the correct ethAddress', async () => {
      const address = await subject();
      expect(address).to.equal(dai.address);
    });
  });

  describe('setTokenFactory', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<Address> {
      return await ethDaiManagerWrapper.setTokenFactory(
        subjectManagerAddress,
      );
    }

    test('gets the correct setTokenFactory', async () => {
      const address = await subject();
      expect(address).to.equal(factory.address);
    });
  });

  describe('ethMultiplier', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<BigNumber> {
      return await ethDaiManagerWrapper.ethMultiplier(
        subjectManagerAddress,
      );
    }

    test('gets the correct ethMultiplier', async () => {
      const multiplier = await subject();
      expect(multiplier).to.bignumber.equal(ethMultiplier);
    });
  });

  describe('daiMultiplier', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<BigNumber> {
      return await ethDaiManagerWrapper.daiMultiplier(
        subjectManagerAddress,
      );
    }

    test('gets the correct daiMultiplier', async () => {
      const multiplier = await subject();
      expect(multiplier).to.bignumber.equal(daiMultiplier);
    });
  });

  describe('maximumLowerThreshold', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<BigNumber> {
      return await ethDaiManagerWrapper.maximumLowerThreshold(
        subjectManagerAddress,
      );
    }

    test('gets the correct maximumLowerThreshold', async () => {
      const multiplier = await subject();
      expect(multiplier).to.bignumber.equal(maximumLowerThreshold);
    });
  });

  describe('minimumUpperThreshold', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<BigNumber> {
      return await ethDaiManagerWrapper.minimumUpperThreshold(
        subjectManagerAddress,
      );
    }

    test('gets the correct minimumUpperThreshold', async () => {
      const multiplier = await subject();
      expect(multiplier).to.bignumber.equal(minimumUpperThreshold);
    });
  });

  describe('auctionLibrary', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<Address> {
      return await ethDaiManagerWrapper.auctionLibrary(
        subjectManagerAddress,
      );
    }

    test('gets the correct auctionLibrary', async () => {
      const address = await subject();
      expect(address).to.equal(constantAuctionPriceCurve.address);
    });
  });

  describe('auctionTimeToPivot', async () => {
    let subjectManagerAddress: Address;


    beforeEach(async () => {
      subjectManagerAddress = ethDaiRebalancingManager.address;
    });

    async function subject(): Promise<BigNumber> {
      return await ethDaiManagerWrapper.auctionTimeToPivot(
        subjectManagerAddress,
      );
    }

    test('gets the correct auctionTimeToPivot', async () => {
      const address = await subject();
      expect(address).to.bignumber.equal(auctionTimeToPivot);
    });
  });

  describe('propose', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;

    let proposalPeriod: BigNumber;
    let ethPrice: BigNumber;
    let daiUnit: BigNumber;

    let initialAllocationToken: SetTokenContract;
    let timeFastForward: BigNumber;

    let subjectRebalancingSetToken: Address;
    let subjectManagerAddress: Address;
    let subjectCaller: Address;

    beforeAll(async () => {
      ethPrice = new BigNumber(350 * 10 ** 18);
      daiUnit = new BigNumber(300 * 100);
    });

    beforeEach(async () => {
      initialAllocationToken = await deploySetTokenAsync(
        web3,
        core,
        factory.address,
        [dai.address, wrappedETH.address],
        [daiUnit.mul(daiMultiplier), new BigNumber(100).mul(ethMultiplier)],
        new BigNumber(100),
      );

      proposalPeriod = ONE_DAY_IN_SECONDS;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingFactory.address,
        ethDaiRebalancingManager.address,
        initialAllocationToken.address,
        proposalPeriod
      );

      timeFastForward = ONE_DAY_IN_SECONDS.add(1);
      await updateMedianizerPriceAsync(
        web3,
        ethMedianizer,
        ethPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      subjectManagerAddress = ethDaiRebalancingManager.address;
      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      await increaseChainTimeAsync(web3, timeFastForward);
      return await ethDaiManagerWrapper.propose(
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
