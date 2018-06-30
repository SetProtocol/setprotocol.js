// External Libraries
import * as ABIDecoder from "abi-decoder";
import * as _ from "lodash";
import compact = require("lodash.compact");
import * as Web3 from "web3";

// Utils
import { BigNumber } from "../../../src/util/bignumber";
import { Web3Utils } from "../../../src/util/web3_utils";

import { ContractsAPI, ERC20API, SetTokenAPI } from "../../../src/api/v1";
import { ERC20APIErrors } from "../../../src/api/v1/erc20_api";
import { Assertions } from "../../../src/invariants/v1";
import { TokenAssertionErrors } from "../../../src/invariants/v1/erc20";
import { CONTRACT_WRAPPER_ERRORS } from "../../../src/wrappers/v1/base_contract";
import { ERC20Contract, SetTokenContract, SetTokenRegistryContract } from "../../../src/wrappers/v1";

import { ACCOUNTS } from "../accounts";

// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock("set-protocol-contracts-v1");

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const contractsApi = new ContractsAPI(web3);
const erc20Api = new ERC20API(web3, contractsApi);


const TOKEN_OWNER = ACCOUNTS[0].address;
const OTHER_USER = ACCOUNTS[1].address;
const TX_DEFAULTS = { from: TOKEN_OWNER, gas: 400000 };

describe("Token API (Integration Tests)", () => {
  let firstToken: ERC20Contract;
  let secondToken: ERC20Contract;

  let primarySetToken: SetTokenContract;

  let currentNetworkId: number;
  let currentSnapshotId: number;

  beforeEach(async () => {
    // All balances set already from development migration:
    // https://github.com/SetProtocol/set-protocol-contracts/blob/master/migrations/migration_constants.js
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    const setTokenRegistry = await SetTokenRegistryContract.deployed(web3, TX_DEFAULTS);
    const setAddresses = await setTokenRegistry.getSetAddresses.callAsync();

    const contractsApi = new ContractsAPI(web3);
    const setTokenApi = new SetTokenAPI(web3, contractsApi);

    const components = await setTokenApi.getComponents(setAddresses[0]);

    const firstTokenAddress = components[0].address;
    const secondTokenAddress = components[1].address;

    firstToken = await ERC20Contract.at(firstTokenAddress, web3, TX_DEFAULTS);
    secondToken = await ERC20Contract.at(secondTokenAddress, web3, TX_DEFAULTS);
    primarySetToken = await SetTokenContract.at(setAddresses[0], web3, TX_DEFAULTS);

    ABIDecoder.addABI(firstToken.abi);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
    ABIDecoder.removeABI(firstToken.abi);
  });

  beforeAll(async () => {
    currentNetworkId = await web3Utils.getNetworkIdAsync();
  });

  describe("#transferAsync", () => {
    describe("no contract at token address", () => {
      test("should throw ERC20_TOKEN_CONTRACT_NOT_FOUND", async () => {
        const invalidAddress = "0x2172def2a99133b6259249728ff8b289efe32c37";
        await expect(
          erc20Api.transferAsync(invalidAddress, TOKEN_OWNER, OTHER_USER, new BigNumber(10)),
        ).rejects.toThrow(
          CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK("DetailedERC20", currentNetworkId)
        );
      });
    });

    describe("contract exists at token address", () => {
      describe("the sender has insufficient balance", async () => {
        test("should throw INSUFFICIENT_SENDER_BALANCE", async () => {
          await expect(
            erc20Api.transferAsync(
              firstToken.address,
              OTHER_USER,
              TOKEN_OWNER,
              new BigNumber(10)
            ),
          ).rejects.toThrow(ERC20APIErrors.INSUFFICIENT_SENDER_BALANCE(OTHER_USER));
        });
      });

      describe("sender transfers 10 tokens to recipient", () => {
        let txHash: string;
        let spenderBalanceBefore: BigNumber;
        let recipientBalanceBefore: BigNumber;

        beforeEach(async () => {
          spenderBalanceBefore = await firstToken.balanceOf.callAsync(TOKEN_OWNER);
          recipientBalanceBefore = await firstToken.balanceOf.callAsync(OTHER_USER);

          txHash = await erc20Api.transferAsync(
            firstToken.address,
            TOKEN_OWNER,
            OTHER_USER,
            new BigNumber(10)
          );
        });

        test("should emit log indicating transfer success", async () => {
          const receipt = await web3Utils.getTransactionReceiptAsync(txHash);
          const [transferLog] = compact(ABIDecoder.decodeLogs(receipt.logs));

          expect(transferLog.name).toBe("Transfer");
        });

        test("should debit sender 10 tokens", async () => {
          await expect(firstToken.balanceOf.callAsync(TOKEN_OWNER)).resolves.toEqual(
            spenderBalanceBefore.minus(10),
          );
        });

        test("should credit recipient 10 tokens", async () => {
          await expect(firstToken.balanceOf.callAsync(OTHER_USER)).resolves.toEqual(
            recipientBalanceBefore.plus(10),
          );
        });
      });
    });
  });

  describe("#getUserBalance", () => {
    describe("no contract at token address", () => {
      test("should throw CONTRACT_NOT_FOUND_ON_NETWORK", async () => {
        const invalidAddress = "0x2172def2a99133b6259249728ff8b289efe32c37";
        await expect(
          erc20Api.getUserBalance(invalidAddress, TOKEN_OWNER),
        ).rejects.toThrow(
          CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK(
            "DetailedERC20",
            currentNetworkId,
          ),
        );
      });
    });

    describe("contract exists at token address", () => {
      describe("token does not implement ERC20", () => {
        let nonERC20: SetTokenRegistryContract;

        beforeEach(async () => {
          nonERC20 = await SetTokenRegistryContract.deployed(web3, TX_DEFAULTS);
        });

        test("should throw MISSING_ERC20_METHOD", async () => {
          await expect(
            erc20Api.getUserBalance(nonERC20.address, TOKEN_OWNER),
          ).rejects.toThrow(TokenAssertionErrors.MISSING_ERC20_METHOD(nonERC20.address));
        });
      });

      describe("Account #1", () => {
        test("should return correct balance for account", async () => {
          await expect(
            erc20Api.getUserBalance(firstToken.address, TOKEN_OWNER),
          ).resolves.toEqual(await firstToken.balanceOf.callAsync(TOKEN_OWNER));
        });
      });

      describe("Account #2", () => {
        test("should return correct balance for account", async () => {
          await expect(
            erc20Api.getUserBalance(secondToken.address, TOKEN_OWNER),
          ).resolves.toEqual(await secondToken.balanceOf.callAsync(TOKEN_OWNER));
        });
      });
    });
  });

  describe("#setAllowanceAsync", () => {
    describe("no contract at token address", () => {
      test("should throw CONTRACT_NOT_FOUND_ON_NETWORK", async () => {
        const invalidAddress = "0x2172def2a99133b6259249728ff8b289efe32c37";
        await expect(
          erc20Api.setAllowanceAsync(invalidAddress, TOKEN_OWNER, new BigNumber(100), TOKEN_OWNER),
        ).rejects.toThrow(
            CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK(
              "DetailedERC20",
              currentNetworkId,
            ),
        );
      });
    });

    describe("contract exists at token address", () => {
      describe("sender is owner of account", () => {
        let txHash: string;

        beforeEach(async () => {
          txHash = await erc20Api.setAllowanceAsync(
            firstToken.address,
            TOKEN_OWNER,
            new BigNumber(100),
            TOKEN_OWNER,
          );
        });

        test("should emit log indicating successful", async () => {
          const receipt = await web3Utils.getTransactionReceiptAsync(txHash);
          const [approveLog] = compact(ABIDecoder.decodeLogs(receipt.logs));

          expect(approveLog.name).toBe("Approval");
        });

        test("should return specified allowance to proxy", async () => {
          await expect(
            firstToken.allowance.callAsync(TOKEN_OWNER, TOKEN_OWNER),
          ).resolves.toEqual(new BigNumber(100));
        });
      });
    });
  });

  describe("#setUnlimitedAllowanceAsync", () => {
    describe("no contract at token address", () => {
      test("should throw CONTRACT_NOT_FOUND_ON_NETWORK", async () => {
        const invalidAddress = "0x2172def2a99133b6259249728ff8b289efe32c37";
        await expect(
          erc20Api.setUnlimitedAllowanceAsync(invalidAddress, primarySetToken.address, TOKEN_OWNER),
        ).rejects.toThrow(
          CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK(
            "DetailedERC20",
            currentNetworkId,
          ),
        );
      });
    });

    describe("contract exists at token address", () => {
      describe("sender is owner of account", () => {
        let txHash: string;

        beforeEach(async () => {
          txHash = await erc20Api.setUnlimitedAllowanceAsync(firstToken.address, TOKEN_OWNER, TOKEN_OWNER);
        });

        test("should emit log indicating successful", async () => {
          const receipt = await web3Utils.getTransactionReceiptAsync(txHash);
          const [approveLog] = compact(ABIDecoder.decodeLogs(receipt.logs));

          expect(approveLog.name).toBe("Approval");
        });

        test("should return specified allowance to proxy", async () => {
          const unlimitedAllowance = new BigNumber(2).pow(256).sub(1);

          await expect(
            firstToken.allowance.callAsync(TOKEN_OWNER, TOKEN_OWNER),
          ).resolves.toEqual(new BigNumber(unlimitedAllowance));
        });
      });
    });
  });

  describe("#getDecimals", () => {
    test("should return the number of decimal places that the token uses", async () => {
      const numDecimals = await erc20Api.getDecimals(firstToken.address);

      expect(numDecimals).toEqual(new BigNumber(18));
    });
  });
});
