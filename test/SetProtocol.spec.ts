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

"use strict";

// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock("set-protocol-contracts");

import * as chai from "chai";
import * as Web3 from "web3";

import { Core } from "set-protocol-contracts";

import { ACCOUNTS } from "./accounts";
import SetProtocol from '../src';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT } from "../src/constants";
import { Web3Utils } from "../src/util/Web3Utils";

const { expect } = chai;

const contract = require("truffle-contract");

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

const txDefaults = { from: ACCOUNTS[0].address, gasPrice: DEFAULT_GAS_PRICE, gas: DEFAULT_GAS_LIMIT };

const coreContract = contract(Core);
coreContract.setProvider(provider);
coreContract.defaults(txDefaults);

let currentSnapshotId: number;

describe('SetProtocol', async () => {
  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();
  });

  afterEach(() => {
    web3Utils.revertToSnapshot(currentSnapshotId);
  });

  test('should instantiate a new setProtocolInstance', async () => {
    // Deploy Core
    const coreContractInstance = await coreContract.new();

    const setProtocolInstance = new SetProtocol(web3, coreContractInstance.address);
    expect(setProtocolInstance instanceof SetProtocol);
  });
});
