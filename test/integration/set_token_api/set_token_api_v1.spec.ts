// External
import * as ABIDecoder from "abi-decoder";
import * as Web3 from "web3";

import { BigNumber } from "../../../src/util/bignumber";

// APIs
import { SetTokenV1API, ContractsAPI, ERC20API } from "../../../src/api";

// Utils
import { Web3Utils } from "../../../src/util/web3_utils";
import { ACCOUNTS } from "../../accounts";

// Scenarios
import {
    VALID_ISSUES,
    INVALID_ISSUES,
    VALID_REDEEMS,
    INVALID_REDEEMS,
} from "./scenarios";

// Runners
import { SetTokenScenarioRunner } from "./set_token_scenario_runner";

// Wrappers
import {
  SetTokenContract,
  SetTokenRegistryContract,
} from "../../../src/wrappers/v1";

// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock("set-protocol-contracts-v1");

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);

const scenarioRunner = new SetTokenScenarioRunner(web3);

const TX_DEFAULTS = { from: ACCOUNTS[0].address, gas: 4712388 };

describe("Set Token API (Integration Tests)", () => {
  beforeAll(async () => {
    // All balances set already from development migration:
    // https://github.com/SetProtocol/set-protocol-contracts/blob/master/migrations/migration_constants.js
    scenarioRunner.web3Utils = new Web3Utils(web3);
    scenarioRunner.contractsApi = new ContractsAPI(web3);
    scenarioRunner.setTokenApi = new SetTokenV1API(web3, scenarioRunner.contractsApi);
    scenarioRunner.erc20Api = new ERC20API(web3, scenarioRunner.contractsApi);

    const setTokenRegistryInstance = await SetTokenRegistryContract.deployed(web3, TX_DEFAULTS);
    const setAddresses = await setTokenRegistryInstance.getSetAddresses.callAsync();
    scenarioRunner.setTokenRegistry = setTokenRegistryInstance;
    scenarioRunner.setToken = await SetTokenContract.at(setAddresses[0], web3, TX_DEFAULTS);
  });

  beforeEach(scenarioRunner.saveSnapshotAsync);

  afterEach(scenarioRunner.revertToSavedSnapshot);

  describe("#issueSetAsync", () => {
    describe("Valid Set issues", () => {
      VALID_ISSUES.forEach(scenarioRunner.testIssueScenario);
    });

    describe("Invalid Set issues", () => {
      INVALID_ISSUES.forEach(scenarioRunner.testIssueScenario);
    });
  });

  describe("#redeemSetAsync", () => {
    describe("Valid Set redeems", () => {
      VALID_REDEEMS.forEach(scenarioRunner.testRedeemScenario);
    });

    describe("Invalid Set redeems", () => {
      INVALID_REDEEMS.forEach(scenarioRunner.testRedeemScenario);
    });
  });
});
