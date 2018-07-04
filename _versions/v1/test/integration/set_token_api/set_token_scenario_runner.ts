// External
import * as ABIDecoder from "abi-decoder";
import compact = require("lodash.compact");
import * as Web3 from "web3";
import * as _ from "lodash";

import { BigNumber } from "../../../src/util/bignumber";

// Wrappers
import {
  SetTokenContract,
  SetTokenRegistryContract,
} from "../../../src/wrappers";

// APIs
import { SetTokenAPI, ContractsAPI, ERC20API } from "../../../src/api";

// Scenarios
import {
  SetIssueScenario,
  SetRedeemScenario,
} from "./scenarios/";

// Types
import { Component } from "../../../src/types/common";

// Utils
import { Web3Utils } from "../../../src/util/web3_utils";
import { ACCOUNTS } from "../../accounts";

interface ReceiptLog {
  name: string;
  events: Object[];
  address: string;
}

export class SetTokenScenarioRunner {
  public web3Utils: Web3Utils;
  public setToken: SetTokenContract;
  public setTokenRegistry: SetTokenRegistryContract;
  public setTokenApi: SetTokenAPI;
  public contractsApi: ContractsAPI;
  public erc20Api: ERC20API;

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

  public async testIssueScenario(scenario: SetIssueScenario) {
    let primarySetToken: SetTokenContract;

    describe(scenario.description, () => {
      beforeAll(() => {
        ABIDecoder.addABI(this.setToken.abi);
      });

      afterAll(() => {
        ABIDecoder.removeABI(this.setToken.abi);
      });

      beforeEach(async () => {
        const setAddresses = await this.setTokenRegistry.getSetAddresses.callAsync();

        const primarySetAddress = scenario.selectSet(setAddresses);
        primarySetToken = await this.contractsApi.loadSetTokenAsync(primarySetAddress, {
          from: scenario.userAddress,
        });
      });

      if (scenario.successfullyIssues) {
        test("emits log indicating successful issue", async () => {
          // Grab token balances at beginning
          const components = await this.setTokenApi.getComponents(primarySetToken.address);
          const componentBalances = await this.erc20Api.getUserBalancesForTokens(components.map(c => c.address), scenario.userAddress);

          // Set allowances
          await _.each(components, async (component) => {
            if (scenario.hasAllowances) {
              await this.erc20Api.setUnlimitedAllowanceAsync(component.address, primarySetToken.address, scenario.userAddress);
            } else {
              await this.erc20Api.setAllowanceAsync(component.address, primarySetToken.address, new BigNumber(0), scenario.userAddress);
            }
          });

          const naturalUnit = await this.setTokenApi.getNaturalUnit(primarySetToken.address);
          const quantity = scenario.getQuantity(naturalUnit);

          const txHash = await this.setTokenApi.issueSetAsync(primarySetToken.address, quantity, scenario.userAddress);
          const receipt = await this.web3Utils.getTransactionReceiptAsync(txHash);

          const logs: ReceiptLog[] = compact(ABIDecoder.decodeLogs(receipt.logs));
          expect(logs[logs.length - 1].name).toBe("LogIssuance");

          // Check balances at end of set and underlying components
          expect(await this.erc20Api.getUserBalance(primarySetToken.address, scenario.userAddress)).toEqual(quantity);

          const newComponentBalances = await this.erc20Api.getUserBalancesForTokens(components.map(c => c.address), scenario.userAddress);
          _.each(newComponentBalances, async (token, index) => {
            // Difference between balances should equal the transfer value of token
            expect(componentBalances[index].balance.minus(token.balance)).toEqual(components[index].unit.div(naturalUnit).times(quantity));
          });
        }, 10000);
      } else {
        test(`throws ${scenario.errorType} error`, async () => {
          // Grab token balances at beginning
          const components = await this.setTokenApi.getComponents(primarySetToken.address);
          const componentBalances = await this.erc20Api.getUserBalancesForTokens(components.map(c => c.address), scenario.userAddress);

          // Set allowances
          await _.each(components, async (component) => {
            if (scenario.hasAllowances) {
              await this.erc20Api.setUnlimitedAllowanceAsync(component.address, primarySetToken.address, scenario.userAddress);
            } else {
              await this.erc20Api.setAllowanceAsync(component.address, primarySetToken.address, new BigNumber(0), scenario.userAddress);
            }
          });

          const quantity = scenario.getQuantity(await this.setTokenApi.getNaturalUnit(primarySetToken.address));
          await expect(
            this.setTokenApi.issueSetAsync(
              primarySetToken.address,
              quantity,
              scenario.userAddress,
              { gas: scenario.gasLimit, gasPrice: scenario.gasPrice }
            ),
          ).rejects.toThrow(scenario.errorMessage);
        }, 10000);
      }
    });
  }

  public async testRedeemScenario(scenario: SetRedeemScenario) {
    let primarySetToken: SetTokenContract;
    describe(scenario.description, () => {
      beforeAll(() => {
        ABIDecoder.addABI(this.setToken.abi);
      });

      afterAll(() => {
        ABIDecoder.removeABI(this.setToken.abi);
      });

      beforeEach(async () => {
        const setAddresses = await this.setTokenRegistry.getSetAddresses.callAsync();

        const primarySetAddress = scenario.selectSet(setAddresses);
        primarySetToken = await this.contractsApi.loadSetTokenAsync(primarySetAddress, {
          from: scenario.userAddress,
        });

        // Issue Set for the user to test redemption (set allowances first)
        const components = await this.setTokenApi.getComponents(primarySetToken.address);
        const naturalUnit = await this.setTokenApi.getNaturalUnit(primarySetToken.address);

        await _.each(components, async (component) => {
          await this.erc20Api.setUnlimitedAllowanceAsync(component.address, primarySetToken.address, scenario.userAddress);
        });
        const issueTxHash = await this.setTokenApi.issueSetAsync(primarySetToken.address, scenario.getIssueQuantity(naturalUnit), scenario.userAddress);
        await this.web3Utils.getTransactionReceiptAsync(issueTxHash);
      });

      if (scenario.successfullyRedeems) {
        test("emits log indicating successful redeem", async () => {
          // Issue Set for the user to test redemption (set allowances first)
          const components = await this.setTokenApi.getComponents(primarySetToken.address);
          const naturalUnit = await this.setTokenApi.getNaturalUnit(primarySetToken.address);
          const quantity = scenario.getRedeemQuantity(naturalUnit);

          // Grab token balances at beginning
          const componentBalances = await this.erc20Api.getUserBalancesForTokens(components.map(c => c.address), scenario.userAddress);

          const txHash = await this.setTokenApi.redeemSetAsync(primarySetToken.address, quantity, scenario.userAddress);
          const receipt = await this.web3Utils.getTransactionReceiptAsync(txHash);

          const logs: ReceiptLog[] = compact(ABIDecoder.decodeLogs(receipt.logs));
          expect(logs[logs.length - 1].name).toBe("LogRedemption");

          // Check balances at end of set and underlying components
          expect(await this.erc20Api.getUserBalance(primarySetToken.address, scenario.userAddress)).toEqual(new BigNumber(0));

          const newComponentBalances = await this.erc20Api.getUserBalancesForTokens(components.map(c => c.address), scenario.userAddress);
          _.each(newComponentBalances, async (token, index) => {
            // Difference between balances should equal the transfer value of token
            expect(token.balance.minus(componentBalances[index].balance)).toEqual(components[index].unit.div(naturalUnit).times(quantity));
          });
        }, 10000);
      } else {
        test(`throws ${scenario.errorType} error`, async () => {
          const quantity = scenario.getRedeemQuantity(await this.setTokenApi.getNaturalUnit(primarySetToken.address));
          await expect(
            this.setTokenApi.redeemSetAsync(
              primarySetToken.address,
              quantity,
              scenario.userAddress,
              { gas: scenario.gasLimit, gasPrice: scenario.gasPrice }
            ),
          ).rejects.toThrow(scenario.errorMessage);
        }, 10000);
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
