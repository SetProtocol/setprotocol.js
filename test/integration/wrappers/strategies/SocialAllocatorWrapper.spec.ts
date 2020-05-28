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
  OracleWhiteListContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  SocialAllocatorContract,
} from 'set-protocol-strategies';

import {
  ConstantPriceOracleContract,
} from 'set-protocol-oracles';

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { SocialAllocatorWrapper } from '@src/wrappers';
import {
  TX_DEFAULTS,
} from '@src/constants';
import {
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  deployBaseContracts,
  deployConstantPriceOracleAsync,
  deployOracleWhiteListAsync,
  deploySocialAllocatorAsync,
  deployTokensSpecifyingDecimals,
} from '@test/helpers';
import {
  BigNumber,
  ether,
} from '@src/util';
import { Address } from '@src/types/common';

const Core = require('set-protocol-contracts/dist/artifacts/ts/Core').Core;

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

  let oracleWhiteList: OracleWhiteListContract;

  let ethOracleProxy: ConstantPriceOracleContract;
  let btcOracleProxy: ConstantPriceOracleContract;

  let allocator: SocialAllocatorContract;

  let initialEthPrice: BigNumber;
  let initialBtcPrice: BigNumber;
  let pricePrecision: BigNumber;

  let socialAllocatorWrapper: SocialAllocatorWrapper;

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

    socialAllocatorWrapper = new SocialAllocatorWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('baseAsset', async () => {
    let subjectAllocator: Address;

    beforeEach(async () => {
      subjectAllocator = allocator.address;
    });

    async function subject(): Promise<string> {
      return await socialAllocatorWrapper.baseAsset(
        subjectAllocator,
      );
    }

    test('successfully gets correct base asset', async () => {
      const baseAsset = await subject();

      expect(baseAsset).to.equal(wrappedETH.address);
    });
  });

  describe('quoteAsset', async () => {
    let subjectAllocator: Address;

    beforeEach(async () => {
      subjectAllocator = allocator.address;
    });

    async function subject(): Promise<string> {
      return await socialAllocatorWrapper.quoteAsset(
        subjectAllocator,
      );
    }

    test('successfully gets correct quote asset', async () => {
      const baseAsset = await subject();

      expect(baseAsset).to.equal(wrappedBTC.address);
    });
  });
});
