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

// import { Address } from 'set-protocol-utils';
// import * as ABIDecoder from 'abi-decoder';
// import * as chai from 'chai';
// import * as _ from 'lodash';
// import * as Web3 from 'web3';
// import compact = require('lodash.compact');

// import { BigNumber } from '../../../src/util';
// import ChaiSetup from '../../helpers/chaiSetup';
// import {
//   StandardTokenMock,
// } from 'set-protocol-contracts';

// import { DEFAULT_ACCOUNT, ACCOUNTS } from '../../accounts';
// import { Erc20Wrapper } from '../../../src/wrappers';
// import {
//   DEFAULT_GAS_PRICE,
//   DEFAULT_GAS_LIMIT,
//   STANDARD_DECIMALS,
//   STANDARD_SUPPLY,
//   STANDARD_TRANSFER_VALUE,
//   ZERO,
// } from '../../../src/constants';
// import { Web3Utils } from '../../../src/util';
// import {
//   initializeCoreWrapper,
// } from '../../helpers/coreHelpers';

// const OTHER_ACCOUNT = ACCOUNTS[1].address;

// ChaiSetup.configure();
// const { expect } = chai;

// const contract = require('truffle-contract');

// const provider = new Web3.providers.HttpProvider('http://localhost:8545');
// const web3 = new Web3(provider);
// const web3Utils = new Web3Utils(web3);

// const txDefaults = {
//   from: DEFAULT_ACCOUNT,
//   gasPrice: DEFAULT_GAS_PRICE,
//   gas: DEFAULT_GAS_LIMIT,
// };

// const standardTokenMockContract = contract(StandardTokenMock);
// standardTokenMockContract.setProvider(provider);
// standardTokenMockContract.defaults(txDefaults);

// let currentSnapshotId: number;

// describe('Orders API', () => {
//   let erc20API: Erc20Wrapper;
//   // let standardTokenMock: StandardTokenMock;
//   // let subjectCaller: Address;
//   const subjectSupply: BigNumber = STANDARD_SUPPLY;
//   const subjectName: string = 'ERC20 Token';
//   const subjectSymbol: string = 'ERC';
//   const subjectDecimals: BigNumber = STANDARD_DECIMALS;
//   let subjectSpender: Address;
//   let subjectAllowance: BigNumber;


//   beforeEach(async () => {
//     currentSnapshotId = await web3Utils.saveTestSnapshot();
//   });

//   afterEach(async () => {
//     await web3Utils.revertToSnapshot(currentSnapshotId);
//   });

//   test('Erc20Wrapper can be instantiated', async () => {
//     erc20API = new Erc20Wrapper(web3);
//     expect(erc20API);

//     expect(erc20API.getBalanceOfAsync);
//     expect(erc20API.getNameAsync);
//     expect(erc20API.getSymbolAsync);
//     expect(erc20API.getAllowanceAsync);
//     expect(erc20API.transferAsync);
//     expect(erc20API.transferFromAsync);
//     expect(erc20API.approveAsync);
//   });

// });
