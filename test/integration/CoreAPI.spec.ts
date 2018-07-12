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
jest.setTimeout(30000);

import * as chai from "chai";
import * as Web3 from "web3";
import * as ABIDecoder from "abi-decoder";
import * as _ from "lodash";
import compact = require("lodash.compact");

import { Core, StandardTokenMock, Vault } from "set-protocol-contracts";

import { ACCOUNTS } from "../accounts";
import { testSets, TestSet } from "../testSets";
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from "../logs";
import { CoreAPI } from "../../src/api";
import {
  DetailedERC20Contract,
  StandardTokenMockContract,
  VaultContract,
} from "../../src/contracts";
import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
} from "../../src/constants";
import { Web3Utils } from "../../src/util/Web3Utils";
import { BigNumber } from "../../src/util";
import {
  initializeCoreAPI,
  deploySetTokenFactory,
  deployTokensForSetWithApproval,
} from "../helpers/coreHelpers";

const contract = require("truffle-contract");

const { expect } = chai;

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

const txDefaults = {
  from: ACCOUNTS[0].address,
  gasPrice: DEFAULT_GAS_PRICE,
  gas: DEFAULT_GAS_LIMIT,
};

const coreContract = contract(Core);
coreContract.setProvider(provider);
coreContract.defaults(txDefaults);

let currentSnapshotId: number;

describe("Core API", () => {
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
    const coreInstance = await coreContract.new();
    expect(new CoreAPI(web3, coreInstance.address));
  });

  describe("create", async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );
    });

    test("creates a new set with valid parameters", async () => {
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
      const receipt = await web3Utils.getTransactionReceiptAsync(txHash);

      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal("SetTokenCreated");
    });
  });

  describe("issue", async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);
    });

    test("issues a new set with valid parameters", async () => {
      const txHash = await coreAPI.issue(ACCOUNTS[0].address, setTokenAddress, new BigNumber(100));
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      expect(formattedLogs[formattedLogs.length - 1].event).to.equal("IssuanceComponentDeposited");
    });
  });

  describe("redeem", async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      // Issue a Set to user
      txHash = await coreAPI.issue(ACCOUNTS[0].address, setTokenAddress, new BigNumber(100));
      formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
    });

    test("redeems a set with valid parameters", async () => {
      const tokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, txDefaults);
      expect(Number(await tokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address))).to.equal(100);
      const txHash = await coreAPI.redeem(ACCOUNTS[0].address, setTokenAddress, new BigNumber(100));
      expect(Number(await tokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address))).to.equal(0);
    });
  });

  describe("redeemAndWithdraw", async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];
    let setTokenAddress: Address;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);
      setTokenFactoryAddress = await deploySetTokenFactory(coreAPI.coreAddress, provider);

      setToCreate = testSets[0];
      componentAddresses = await deployTokensForSetWithApproval(
        setToCreate,
        coreAPI.transferProxyAddress,
        provider,
      );

      // Create a Set
      const txHash = await coreAPI.create(
        ACCOUNTS[0].address,
        setTokenFactoryAddress,
        componentAddresses,
        setToCreate.units,
        setToCreate.naturalUnit,
        setToCreate.setName,
        setToCreate.setSymbol,
      );
      const formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
      setTokenAddress = extractNewSetTokenAddressFromLogs(formattedLogs);

      // Issue a Set to user
      txHash = await coreAPI.issue(ACCOUNTS[0].address, setTokenAddress, new BigNumber(100));
      formattedLogs = await getFormattedLogsFromTxHash(web3, txHash);
    });

    test("redeems a set with valid parameters", async () => {
      const setTokenWrapper = await DetailedERC20Contract.at(setTokenAddress, web3, txDefaults);
      const componentTokenWrapper = await DetailedERC20Contract.at(
        componentAddresses[0],
        web3,
        txDefaults,
      );

      const oldComponentBalance = await componentTokenWrapper.balanceOf.callAsync(
        ACCOUNTS[0].address,
      );
      const quantity = new BigNumber(100);

      expect(Number(await setTokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address))).to.equal(100);
      const txHash = await coreAPI.redeemAndWithdraw(
        ACCOUNTS[0].address,
        setTokenAddress,
        quantity,
        [componentAddresses[0]],
      );
      const componentTransferValue = quantity
        .div(setToCreate.naturalUnit)
        .mul(setToCreate.units[0]);
      const newComponentBalance = await componentTokenWrapper.balanceOf.callAsync(
        ACCOUNTS[0].address,
      );

      expect(Number(newComponentBalance)).to.equal(
        Number(oldComponentBalance.plus(componentTransferValue)),
      );
      expect(Number(await setTokenWrapper.balanceOf.callAsync(ACCOUNTS[0].address))).to.equal(0);
    });
  });

  describe("deposit", async () => {
    let coreAPI: CoreAPI;
    let setTokenFactoryAddress: Address;
    let setToCreate: TestSet;
    let componentAddresses: Address[];

    let tokenAddress: Address;
    let vaultWrapper: VaultContract;

    beforeEach(async () => {
      coreAPI = await initializeCoreAPI(provider);

      setToCreate = testSets[0];
      const component = setToCreate.components[0];

      const vaultContract = contract(Vault);
      vaultContract.setProvider(provider);
      vaultContract.defaults(txDefaults);

      // Deploy Vault
      vaultWrapper = await VaultContract.at(coreAPI.vaultAddress, web3, txDefaults);

      const standardTokenMockContract = contract(StandardTokenMock);
      standardTokenMockContract.setProvider(provider);
      standardTokenMockContract.defaults(txDefaults);

      const standardTokenMockInstance = await standardTokenMockContract.new(
        ACCOUNTS[0].address,
        component.supply,
        component.name,
        component.symbol,
        component.decimals,
      );

      const tokenWrapper = await StandardTokenMockContract.at(
        standardTokenMockInstance.address,
        web3,
        txDefaults,
      );
      await tokenWrapper.approve.sendTransactionAsync(
        coreAPI.transferProxyAddress,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        { from: ACCOUNTS[0].address },
      );
      tokenAddress = tokenWrapper.address;
    });

    test("deposits a token into the vault with valid parameters", async () => {
      let userBalance = await vaultWrapper.getOwnerBalance.callAsync(
        ACCOUNTS[0].address,
        tokenAddress,
      );
      expect(Number(userBalance)).to.equal(0);
      const txHash = await coreAPI.deposit(
        ACCOUNTS[0].address,
        tokenAddress,
        new BigNumber(100),
        txDefaults,
      );
      userBalance = await vaultWrapper.getOwnerBalance.callAsync(ACCOUNTS[0].address, tokenAddress);
      expect(Number(userBalance)).to.equal(100);
    });
  });
});
