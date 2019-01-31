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
import * as ethUtil from 'ethereumjs-util';
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import { Core, Vault } from 'set-protocol-contracts';
import {
  BTCETHRebalancingManagerContract,
  CoreContract,
  ConstantAuctionPriceCurveContract,
  MedianContract,
  SetTokenContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { BTCETHRebalancingManagerWrapper } from '@src/wrappers';
import { OrderAPI } from '@src/api';
import {
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
  ONE_DAY_IN_SECONDS,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
} from '@src/constants';
import { Assertions } from '@src/assertions';
import {
  addPriceCurveToCoreAsync,
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  constructInflowOutflowArraysAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployConstantAuctionPriceCurveAsync,
  deployCoreContract,
  deployKyberNetworkWrapperContract,
  deploySetTokenAsync,
  deploySetTokensAsync,
  deployTakerWalletWrapperContract,
  deployTokenAsync,
  deployTokensAsync,
  deployZeroExExchangeWrapperContract,
  getVaultBalances,
  tokenDeployedOnSnapshot,
  transitionToRebalanceAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether,
  extractNewSetTokenAddressFromLogs,
  generateFutureTimestamp,
  getFormattedLogsFromTxHash,
} from '@src/util';
import { Address, SignedIssuanceOrder, KyberTrade, TakerWalletOrder, ZeroExSignedFillOrder } from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);
const setUtils = new SetUtils(web3);
const setTestUtils = new SetTestUtils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('BTCETHRebalancingManagerWrapper', () => {
  let rebalancingSetToken: RebalancingSetTokenContract;

  let core: CoreContract;
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;
  let factory: SetTokenFactoryContract;
  let rebalancingFactory: RebalancingSetTokenFactoryContract;
  let rebalancingComponentWhiteList: WhiteListContract;
  let constantAuctionPriceCurve: ConstantAuctionPriceCurveContract;
  let btcethRebalancingManager: BTCETHRebalancingManagerContract;
  let btcMedianizer: MedianContract;
  let ethMedianizer: MedianContract;
  let wrappedBTC: StandardTokenMockContract;
  let wrappedETH: StandardTokenMockContract;

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
      transferProxy,
      vault,
      setTokenFactory,
      rebalancingSetTokenFactory,
      rebalanceAuctionModule,
      issuanceOrderModule,
      whitelist,
    ] = await deployBaseContracts(web3);

    btcMedianizer = await deployMedianizerAsync();
    await addPriceFeedOwnerToMedianizer(btcMedianizer, deployerAccount);
    ethMedianizer = await deployMedianizerAsync();
    await addPriceFeedOwnerToMedianizer(ethMedianizer, deployerAccount);

    wrappedBTC = await erc20Wrapper.deployTokenAsync(deployerAccount, 8);
    wrappedETH = await erc20Wrapper.deployTokenAsync(deployerAccount, 18);
    await erc20Wrapper.approveTransfersAsync(
      [wrappedBTC, wrappedETH],
      transferProxy.address
    );
    await coreWrapper.addTokensToWhiteList(
      [wrappedBTC.address, wrappedETH.address],
      rebalancingComponentWhiteList
    );

    btcEthManagerWrapper = new BTCETHRebalancingManagerWrapper(
      web3,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  // describe('propose', async () => {
  //   let rebalancingSetToken: RebalancingSetTokenContract;
  //   let currentSetToken: SetTokenContract;
  //   let nextSetToken: SetTokenContract;

  //   let subjectRebalancingSetToken: Address;
  //   let subjectBidQuantity: BigNumber;
  //   let subjectCaller: Address;

  //   beforeEach(async () => {
  //     const setTokens = await deploySetTokensAsync(
  //       web3,
  //       core,
  //       setTokenFactory.address,
  //       transferProxy.address,
  //       2,
  //     );

  //     currentSetToken = setTokens[0];
  //     nextSetToken = setTokens[1];

  //     const proposalPeriod = ONE_DAY_IN_SECONDS;
  //     const managerAddress = ACCOUNTS[1].address;
  //     rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
  //       web3,
  //       core,
  //       rebalancingSetTokenFactory.address,
  //       managerAddress,
  //       currentSetToken.address,
  //       proposalPeriod
  //     );

  //     // Issue currentSetToken
  //     await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
  //     await approveForTransferAsync([currentSetToken], transferProxy.address);

  //     // Use issued currentSetToken to issue rebalancingSetToken
  //     const rebalancingSetQuantityToIssue = ether(7);
  //     await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

  //     // Approve proposed Set's components to the whitelist;
  //     const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
  //     await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
  //     await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

  //     // Deploy price curve used in auction
  //     const priceCurve = await deployConstantAuctionPriceCurveAsync(
  //       web3,
  //       DEFAULT_AUCTION_PRICE_NUMERATOR,
  //       DEFAULT_AUCTION_PRICE_DENOMINATOR
  //     );

  //     addPriceCurveToCoreAsync(
  //       core,
  //       priceCurve.address
  //     );

      

  //     subjectRebalancingSetToken = rebalancingSetToken.address;
  //     subjectBidQuantity = ether(2);
  //     subjectCaller = DEFAULT_ACCOUNT;
  //   });

  //   async function subject(): Promise<string> {
  //     return await btcEthManagerWrapper.propose(
  //       'wrapper contract address',
  //       subjectRebalancingSetToken,
  //       { from: subjectCaller },
  //     );
  //   }

  //   test('successfully proposes', async () => {
  //     await subject();
  //   });
  // });
});
