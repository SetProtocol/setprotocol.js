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
jest.setTimeout(20000);

import * as chai from "chai";
import * as Web3 from "web3";
import * as ABIDecoder from "abi-decoder";
import * as _ from "lodash";
import compact = require("lodash.compact");

import { Core, SetTokenFactory, DummyToken } from "set-protocol-contracts";

import { ACCOUNTS } from "../accounts";
import { testSets, TestSet } from "../testSets";
import { CoreAPI } from '../../src/api';
import { CoreContract, SetTokenFactoryContract } from '../../src/contracts';
import { DEFAULT_GAS_PRICE, DEFAULT_GAS_LIMIT } from "../../src/constants";
import { Web3Utils } from "../../src/util/Web3Utils";
import { ReceiptLog } from "../../src/types/common";

const { expect } = chai;

const contract = require("truffle-contract");

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

const txDefaults = { from: ACCOUNTS[0].address, gasPrice: DEFAULT_GAS_PRICE, gas: DEFAULT_GAS_LIMIT };

const coreContract = contract(Core);
coreContract.setProvider(provider);
coreContract.defaults(txDefaults);

const setTokenFactoryContract = contract(SetTokenFactory);
setTokenFactoryContract.setProvider(provider);
setTokenFactoryContract.defaults(txDefaults);

const dummyTokenContract = contract(DummyToken);
dummyTokenContract.setProvider(provider);
dummyTokenContract.defaults(txDefaults);

let currentSnapshotId: number;

describe("Core API", () => {
  let contract;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  test("CoreAPI can be instantiated", async () => {
    // deploy Core
    const coreContractInstance = await coreContract.new();
    expect(new CoreAPI(web3, coreContractInstance.address));
  });

  describe("create", async () => {
    let coreAPI: CoreAPI;
    let setToCreate: TestSet;
    let componentAddresses: string[];
    let setTokenFactoryInstance: any;

    beforeEach(async () => {
      // Deploy Core
      const coreContractInstance = await coreContract.new();
      const coreWrapper = await CoreContract.at(coreContractInstance.address, web3, txDefaults);
      coreAPI = new CoreAPI(web3, coreContractInstance.address);
      // Deploy SetTokenFactory
      setTokenFactoryInstance = await setTokenFactoryContract.new();
      const setTokenFactoryWrapper = await SetTokenFactoryContract.at(
        setTokenFactoryInstance.address,
        web3,
        txDefaults
      );
      // Authorize Core
      await setTokenFactoryWrapper.addAuthorizedAddress.sendTransactionAsync(
        coreContractInstance.address,
        txDefaults
      );

      // Enable Factory
      await coreWrapper.enableFactory.sendTransactionAsync(
        setTokenFactoryInstance.address,
        txDefaults
      );

      setToCreate = testSets[0];
      // Deploy DummyTokens to add to Set
      componentAddresses = [];
      await Promise.all(setToCreate.components.map(async component => {
        const dummyTokenInstance = await dummyTokenContract.new(
          component.name,
          component.symbol,
          component.decimals,
          component.supply
        );
        componentAddresses.push(dummyTokenInstance.address);
      }));
    });

    test("creates a new set with valid parameters", async () => {
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryInstance.address,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol
      );
      const receipt = await web3Utils.getTransactionReceiptAsync(txHash);

      const logs: ReceiptLog[] = compact(ABIDecoder.decodeLogs(receipt.logs));
      expect(logs[logs.length - 1].name).to.equal("SetTokenCreated");
    });
  });
});
