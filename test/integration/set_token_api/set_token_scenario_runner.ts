// External
import * as ABIDecoder from "abi-decoder";
import compact = require("lodash.compact");
import * as Web3 from "web3";
import { BigNumber } from "../../../src/util/bignumber";

// Wrappers
import {
    SetTokenContract,
} from "../../../src/wrappers";

// APIs
import { SetTokenAPI, ContractsAPI } from "../../../src/api";

// Scenarios
import {
    SetIssueScenario,
    SetRedeemScenario,
} from "./scenarios/";

// Types

// Utils
import { Web3Utils } from "../../../src/util/web3_utils";
import { ACCOUNTS } from "../../accounts";

const TX_DEFAULTS = { from: ACCOUNTS[0].address, gas: 4712388 };

export class SetTokenScenarioRunner {
    public web3Utils: Web3Utils;
    public setToken: SetTokenContract;
    public setTokenApi: SetTokenAPI;
    public contractsApi: ContractsAPI;

    private currentSnapshotId: number;

    private readonly web3: Web3;

    constructor(web3: Web3) {
        this.web3Utils = new Web3Utils(web3);
        this.web3 = web3;

        this.testIssueScenario = this.testIssueScenario.bind(this);
        this.testRedeemScenario = this.testRedeemScenario.bind(this);

        this.saveSnapshotAsync = this.saveSnapshotAsync.bind(this);
        this.revertToSavedSnapshot = this.revertToSavedSnapshot.bind(this);
    }

    public testIssueScenario(scenario: SetIssueScenario) {
        describe(scenario.description, () => {
            beforeAll(() => {
                ABIDecoder.addABI(this.setToken.abi);
            });

            afterAll(() => {
                ABIDecoder.removeABI(this.setToken.abi);
            });

            beforeEach(async () => {

            });

            if (scenario.successfullyIssues) {
                test("emits log indicating successful issue", async () => {
                    const txHash = await this.setTokenApi.issueSetAsync(SetTokenContract.address, new BigNumber(1), ACCOUNTS[0].address);

                    const receipt = await this.web3Utils.getTransactionReceiptAsync(txHash);

                    const [setIssuedLog] = compact(ABIDecoder.decodeLogs(receipt.logs));

                    expect(setIssuedLog.name).toBe("LogIssuance");
                });
            } else {
                test(`throws ${scenario.errorType} error`, async () => {
                    await expect(
                        this.setTokenApi.issueSetAsync(SetTokenContract.address, new BigNumber(1), ACCOUNTS[0].address),
                    ).rejects.toThrow(scenario.errorMessage);
                });
            }
        });
    }

    public async testRedeemScenario(scenario: SetRedeemScenario) {
        describe(scenario.description, () => {
            beforeAll(() => {
                ABIDecoder.addABI(this.setToken.abi);
            });

            afterAll(() => {
                ABIDecoder.removeABI(this.setToken.abi);
            });

            beforeEach(async () => {
                // Setup work for the network
            });

            if (scenario.successfullyRedeems) {
                test("emits log indicating successful redeem", async () => {
                    const txHash = await this.setTokenApi.redeemSetAsync(address, new BigNumber(1), ACCOUNTS[0].address);
                    const receipt = await this.web3Utils.getTransactionReceiptAsync(txHash);

                    const [setRedeemedLog] = compact(ABIDecoder.decodeLogs(receipt.logs));

                    expect(setRedeemedLog.name).toBe("LogRedemption");
                });
            } else {
                test(`throws ${scenario.errorType} error`, async () => {
                    await expect(
                        this.setTokenApi.redeemSetAsync(address, new BigNumber(1), ACCOUNTS[0].address),
                    ).rejects.toThrow(scenario.errorMessage);
                });
            }
        });
    }

    public async saveSnapshotAsync() {
        this.currentSnapshotId = await this.web3Utils.saveTestSnapshot();
    }

    public async revertToSavedSnapshot() {
        await this.web3Utils.revertToSnapshot(this.currentSnapshotId);
    }
}
