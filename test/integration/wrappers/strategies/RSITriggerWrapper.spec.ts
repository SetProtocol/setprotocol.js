// /*
//   Copyright 2019 Set Labs Inc.

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
// import * as chai from 'chai';
// import * as setProtocolUtils from 'set-protocol-utils';
// import Web3 from 'web3';
// import { MedianContract } from 'set-protocol-contracts';
// import {
//   OracleProxyContract,
//   RSIOracleContract,
//   RSITrendingTriggerContract,
// } from 'set-protocol-strategies';

// import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
// import { RSITriggerWrapper } from '@src/wrappers';
// import {
//   ONE_HOUR_IN_SECONDS
// } from '@src/constants';

// import {
//   addPriceFeedOwnerToMedianizer,
//   approveContractToOracleProxy,
//   deployLegacyMakerOracleAdapterAsync,
//   deployLinearizedPriceDataSourceAsync,
//   deployMedianizerAsync,
//   deployOracleProxyAsync,
//   deployTimeSeriesFeedAsync,
// } from '@test/helpers';
// import {
//   BigNumber,
// } from '@src/util';

// const chaiBigNumber = require('chai-bignumber');
// chai.use(chaiBigNumber(BigNumber));
// const { expect } = chai;
// const contract = require('truffle-contract');
// const web3 = new Web3('http://localhost:8545');
// const { SetProtocolTestUtils: SetTestUtils, Web3Utils } = setProtocolUtils;
// const web3Utils = new Web3Utils(web3);

// let currentSnapshotId: number;

// describe('RSITriggerWrapper', () => {
//   let ethMedianizer: MedianContract;
//   let ethOracleProxy: OracleProxyContract;

//   let rsiOracle: RSIOracleContract;
//   let rsiTrigger: RSITrendingTriggerContract;

//   let seededPriceFeedPrices: BigNumber[];
//   let auctionTimeToPivot: BigNumber;

//   const priceFeedDataDescription: string = '200DailyETHPrice';
//   const movingAverageDays = new BigNumber(5);

//   let rsiTriggerWrapper: RSITriggerWrapper;

//   beforeEach(async () => {
//     currentSnapshotId = await web3Utils.saveTestSnapshot();

//     ethMedianizer = await deployMedianizerAsync(web3);
//     await addPriceFeedOwnerToMedianizer(ethMedianizer, DEFAULT_ACCOUNT);

//     const medianizerAdapter = await deployLegacyMakerOracleAdapterAsync(
//       web3,
//       ethMedianizer.address
//     );

//     ethOracleProxy = await deployOracleProxyAsync(
//       web3,
//       medianizerAdapter.address
//     );

//     const dataSource = await deployLinearizedPriceDataSourceAsync(
//       web3,
//       ethOracleProxy.address,
//       ONE_HOUR_IN_SECONDS,
//       ''
//     );

//     await approveContractToOracleProxy(
//       ethOracleProxy,
//       dataSource.address
//     );

//     seededPriceFeedPrices = _.map(new Array(20), function(el, i) {return new BigNumber((150 + i) * 10 ** 18); });
//     const timeSeriesFeed = await deployTimeSeriesFeedAsync(
//       web3,
//       dataSource.address,
//       seededPriceFeedPrices
//     );



//     rsiTriggerWrapper = new RSITriggerWrapper(web3);
//   });

//   afterEach(async () => {
//     await web3Utils.revertToSnapshot(currentSnapshotId);
//   });
// });