// External
import * as ABIDecoder from "abi-decoder";
import * as Web3 from "web3";
import { BigNumber } from "../../../src/util/bignumber";

// APIs
import { SetTokenAPI, ContractsAPI } from "../../../src/api";

// Utils
import { Web3Utils } from "../../../src/util/web3_utils";
import { ACCOUNTS } from "../../accounts";

// Scenarios
import {

} from "./scenarios";

// Runners
import { SetTokenScenarioRunner } from "./set_token_scenario_runner";

// Wrappers
import {
  SetTokenContract,
} from "../../../src/wrappers";

// Given that this is an integration test, we unmock the Dharma
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock("set-protocol-contracts");

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);

const scenarioRunner = new SetTokenScenarioRunner(web3);

const TX_DEFAULTS = { from: ACCOUNTS[0].address, gas: 4712388 };

describe("Set Token API (Integration Tests)", () => {
    beforeAll(async () => {
        scenarioRunner.web3Utils = new Web3Utils(web3);
        scenarioRunner.contractsApi = new ContractsAPI(web3);
        scenarioRunner.setTokenApi = new SetTokenAPI(web3, scenarioRunner.contractsApi);

        scenarioRunner.setToken = await SetTokenContract.deployed(web3, TX_DEFAULTS);
    });

    beforeEach(scenarioRunner.saveSnapshotAsync);

    afterEach(scenarioRunner.revertToSavedSnapshot);

    describe("#issueSetAsync", () => {
        describe("Valid Set issues", () => {
            // VALID_ORDERS.forEach(scenarioRunner.testIssueScenario);
        });

        describe("Invalid Set issues", () => {
            // INVALID_ORDERS.forEach(scenarioRunner.testIssueScenario);
        });
    });

    describe("#redeemSetAsync", () => {
        describe("Valid Set redeems", () => {
            // VALID_ORDERS.forEach(scenarioRunner.testRedeemScenario);
        });

        describe("Invalid Set redeems", () => {
            // INVALID_ORDERS.forEach(scenarioRunner.testRedeemScenario);
        });
    });
});
