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

import * as chai from 'chai';
import * as Web3 from 'web3';
import {
  CoreContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';
import { Address } from 'set-protocol-utils';

import { RebalancingSetTokenAPI } from '@src/api';
import { RebalancingSetTokenWrapper } from '@src/wrappers';
import {
  DEFAULT_ACCOUNT,
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
  DEFAULT_CONSTANT_AUCTION_PRICE
} from '@src/constants';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber, ether, Web3Utils } from '@src/util';
import { Assertions } from '@src/assertions';
import { CoreWrapper } from '@src/wrappers';
import ChaiSetup from '@test/helpers/chaiSetup';
import {
  addAuthorizationAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenAsync,
  deployConstantAuctionPriceCurveAsync,
  deployCoreContract,
  deployRebalancingSetTokenFactoryContract,
  deploySetTokenAsync,
  deploySetTokensAsync,
  deploySetTokenFactoryContract,
  deployVaultContract,
  deployTransferProxyContract,
  increaseChainTimeAsync
} from '@test/helpers';
import { Component, SetDetails } from '@src/types/common';

ChaiSetup.configure();
const { expect } = chai;
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;

describe('RebalancingSetTokenAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;

  let rebalancingSetTokenWrapper: RebalancingSetTokenWrapper;
  let rebalancingSetTokenAPI: RebalancingSetTokenAPI;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    transferProxy = await deployTransferProxyContract(provider);
    vault = await deployVaultContract(provider);
    core = await deployCoreContract(provider, transferProxy.address, vault.address);
    setTokenFactory = await deploySetTokenFactoryContract(provider, core);
    rebalancingSetTokenFactory = await deployRebalancingSetTokenFactoryContract(provider, core);

    await addAuthorizationAsync(vault, core.address);
    await addAuthorizationAsync(transferProxy, core.address);

    const coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);
    const assertions = new Assertions(web3, coreWrapper);

    rebalancingSetTokenWrapper = new RebalancingSetTokenWrapper(web3);
    rebalancingSetTokenAPI = new RebalancingSetTokenAPI(web3, assertions, core.address);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('proposeAsync', async () => {
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;
    let rebalancingSetToken: RebalancingSetTokenContract;

    let managerAddress: Address;

    let subjectRebalancingSetTokenAddress: Address;
    let subjectNextSet: Address;
    let subjectAuctionPriceCurveAddress: Address;
    let subjectCurveCoefficient: BigNumber;
    let subjectAuctionStartPrice: BigNumber;
    let subjectAuctionPriceDivisor: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokens = await deploySetTokensAsync(
        core,
        setTokenFactory.address,
        transferProxy.address,
        2,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      const proposalPeriod = ONE_DAY_IN_SECONDS;
      managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(provider, DEFAULT_CONSTANT_AUCTION_PRICE);

      // Fast forward to allow propose to be called
      increaseChainTimeAsync(proposalPeriod.add(1));

      subjectNextSet = nextSetToken.address;
      subjectAuctionPriceCurveAddress = priceCurve.address;
      subjectCurveCoefficient = new BigNumber(1);
      subjectAuctionStartPrice = new BigNumber(500);
      subjectAuctionPriceDivisor = new BigNumber(1000);
      subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
      subjectCaller = managerAddress;
    });

    async function subject(): Promise<string> {
      return await rebalancingSetTokenAPI.proposeAsync(
        subjectRebalancingSetTokenAddress,
        subjectNextSet,
        subjectAuctionPriceCurveAddress,
        subjectCurveCoefficient,
        subjectAuctionStartPrice,
        subjectAuctionPriceDivisor,
        { from: subjectCaller}
      );
    }

    test('it fetchs the rebalancing set token properties correctly', async () => {
      await subject();

      const nextSet = await rebalancingSetTokenWrapper.nextSet(subjectRebalancingSetTokenAddress);
      const auctionLibrary = await rebalancingSetTokenWrapper.auctionLibrary(subjectRebalancingSetTokenAddress);
      const curveCoefficient = await rebalancingSetTokenWrapper.curveCoefficient(subjectRebalancingSetTokenAddress);
      const auctionStartPrice = await rebalancingSetTokenWrapper.auctionStartPrice(subjectRebalancingSetTokenAddress);
      const auctionPriceDivisor = await rebalancingSetTokenWrapper.auctionPriceDivisor(
        subjectRebalancingSetTokenAddress
      );
      const rebalanceState = await rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress);

      expect(nextSet).to.eql(subjectNextSet);

      expect(auctionLibrary).to.eql(subjectAuctionPriceCurveAddress);

      expect(curveCoefficient).to.be.bignumber.equal(subjectCurveCoefficient);

      expect(auctionStartPrice).to.be.bignumber.equal(subjectAuctionStartPrice);

      expect(auctionPriceDivisor).to.be.bignumber.equal(subjectAuctionPriceDivisor);

      expect(rebalanceState).to.eql('Proposal');
    });

    // describe('when the component is not part of the Set', async () => {
    //   beforeEach(async () => {
    //     subjectComponentAddress = DEFAULT_ACCOUNT;
    //   });

    //   test('throws', async () => {
    //     return expect(subject()).to.be.rejectedWith(
    //       `Token address at ${subjectComponentAddress} is not a ` +
    //       `component of the Set Token at ${subjectSetTokenAddress}.`
    //     );
    //   });
    // });
  });
});
