// /*
//   Copyright 2018 Set Labs Inc.

//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at

//   http://www.apache.org/licenses/LICENSE-2.0

//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
// */

// 'use strict';

// // Given that this is an integration test, we unmock the Set Protocol
// // smart contracts artifacts package to pull the most recently
// // deployed contracts on the current network.
// jest.unmock('set-protocol-contracts');
// jest.setTimeout(30000);

// import * as _ from 'lodash';
// import * as ABIDecoder from 'abi-decoder';
// import * as chai from 'chai';
// import * as ethUtil from 'ethereumjs-util';
// import * as setProtocolUtils from 'set-protocol-utils';
// import { Bytes, ExchangeIssueParams } from 'set-protocol-utils';
// import Web3 from 'web3';
// import { Core, Vault } from 'set-protocol-contracts';
// import {
//   CoreContract,
//   IssuanceOrderModuleContract,
//   RebalanceAuctionModuleContract,
//   RebalancingSetTokenContract,
//   RebalancingSetTokenFactoryContract,
//   SetTokenContract,
//   SetTokenFactoryContract,
//   StandardTokenMockContract,
//   TransferProxyContract,
//   VaultContract,
//   WhiteListContract,
//   ZeroExExchangeWrapperContract,
// } from 'set-protocol-contracts';

// import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
// import { CoreWrapper, PayableExchangeIssueWrapper } from '@src/wrappers';
// import { OrderAPI } from '@src/api';
// import {
//   NULL_ADDRESS,
//   TX_DEFAULTS,
//   ZERO,
//   ONE_DAY_IN_SECONDS,
//   DEFAULT_AUCTION_PRICE_NUMERATOR,
//   DEFAULT_AUCTION_PRICE_DENOMINATOR,
// } from '@src/constants';
// import { Assertions } from '@src/assertions';
// import {
//   addPriceCurveToCoreAsync,
//   addWhiteListedTokenAsync,
//   approveForTransferAsync,
//   constructInflowOutflowArraysAsync,
//   createDefaultRebalancingSetTokenAsync,
//   deployBaseContracts,
//   deployConstantAuctionPriceCurveAsync,
//   deployCoreContract,
//   deployKyberNetworkWrapperContract,
//   deploySetTokenAsync,
//   deploySetTokensAsync,
//   deployTakerWalletWrapperContract,
//   deployTokenAsync,
//   deployTokensAsync,
//   deployZeroExExchangeWrapperContract,
//   getVaultBalances,
//   tokenDeployedOnSnapshot,
//   transitionToRebalanceAsync,
// } from '@test/helpers';
// import {
//   BigNumber,
//   ether,
//   extractNewSetTokenAddressFromLogs,
//   generateFutureTimestamp,
//   getFormattedLogsFromTxHash,
// } from '@src/util';
// import {
//   Address,
//   SignedIssuanceOrder,
//   KyberTrade,
//   TakerWalletOrder,
//   ZeroExSignedFillOrder,
// } from '@src/types/common';

// const chaiBigNumber = require('chai-bignumber');
// chai.use(chaiBigNumber(BigNumber));
// const { expect } = chai;
// const contract = require('truffle-contract');
// const web3 = new Web3('http://localhost:8545');
// const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
// const web3Utils = new Web3Utils(web3);
// const setUtils = new SetUtils(web3);
// const setTestUtils = new SetTestUtils(web3);

// const coreContract = contract(Core);
// coreContract.setProvider(web3.currentProvider);
// coreContract.defaults(TX_DEFAULTS);

// let currentSnapshotId: number;


// describe('PayableExchangeIssueWrapper', () => {
//   let transferProxy: TransferProxyContract;
//   let vault: VaultContract;
//   let core: CoreContract;
//   let setTokenFactory: SetTokenFactoryContract;
//   let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
//   let issuanceOrderModule: IssuanceOrderModuleContract;
//   let rebalanceAuctionModule: RebalanceAuctionModuleContract;
//   let whitelist: WhiteListContract;

//   let coreWrapper: CoreWrapper;
//   let payableExchangeIssueWrapper: PayableExchangeIssueWrapper;

//   beforeAll(() => {
//     ABIDecoder.addABI(coreContract.abi);
//   });

//   afterAll(() => {
//     ABIDecoder.removeABI(coreContract.abi);
//   });

//   beforeEach(async () => {
//     currentSnapshotId = await web3Utils.saveTestSnapshot();

//     [
//       core,
//       transferProxy,
//       vault,
//       setTokenFactory,
//       rebalancingSetTokenFactory,
//       rebalanceAuctionModule,
//       issuanceOrderModule,
//       whitelist,
//     ] = await deployBaseContracts(web3);

//     coreWrapper = new CoreWrapper(
//       web3,
//       core.address,
//       transferProxy.address,
//       vault.address,
//       rebalanceAuctionModule.address,
//     );

//     payableExchangeIssueWrapper = new PayableExchangeIssueWrapper(
//       web3,
//       issuanceOrderModule.address,
//     );
//   });

//   afterEach(async () => {
//     await web3Utils.revertToSnapshot(currentSnapshotId);
//   });

//   describe('issueRebalancingSetWithEther', async () => {

//     beforeEach(async () => {

//     });

//     async function subject(): Promise<string> {
//       return await payableExchangeIssueWrapper.issueRebalancingSetWithEther(
//         subjectSignedIssuanceOrder,
//         subjectQuantityToFill,
//         subjectOrdersData,
//         { from: subjectCaller }
//       );
//     }

//     test('issues the set to the order maker', async () => {
//     });
//   });
// });
