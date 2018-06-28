jest.mock("set-protocol-contracts-v1");

import * as promisify from "tiny-promisify";
import { Web3Utils } from "../../src/util/web3_utils";
import { ERC20Contract, SetTokenRegistryContract, SetTokenContract } from "../../src/wrappers";
import * as mockContracts from "set-protocol-contracts-v1";
import { CONTRACT_WRAPPER_ERRORS } from "../../src/wrappers/base_contract";
import { ACCOUNTS } from "../accounts";
import * as Web3 from "web3";

// We use an unmocked version of "fs" in order to pull the correct
// contract address from our artifacts for testing purposes
import * as fs from "fs";

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);

const TOKEN_REGISTRY_ARTIFACTS_PATH =
  "node_modules/set-protocol-contracts-v1/artifacts/json/SetTokenRegistry.json";
const ERC20_ARTIFACTS_PATH = "node_modules/set-protocol-contracts-v1/artifacts/json/DetailedERC20.json";
const SET_TOKEN_ARTIFACTS_PATH = "node_modules/set-protocol-contracts-v1/artifacts/json/SetToken.json";

const TX_DEFAULTS = { from: ACCOUNTS[0].address, gas: 4712388 };

describe("DetailedERC20 Token Contract Wrapper (Unit)", () => {
  let networkId: number;
  let erc20TokenContractAbi: Web3.ContractAbi;
  let firstTokenAddress: string;

  beforeAll(async () => {
    networkId = await web3Utils.getNetworkIdAsync();

    const readFilePromise = promisify(fs.readFile);

    // When we mock set-protocol-contracts, *all* contracts become by
    // default mocked.  Thus, if we depend on accessing any contract at
    // any point in time during this test, it needs to be mocked in some capacity.
    //
    // Given that we depend on the token registry to pull the addresses of
    // ERC20 contracts deployed on the current network, we have to manually
    // retrieve and mock its artifacts alongside the ERC20 artifacts.
    const erc20TokenArtifacts = await readFilePromise(ERC20_ARTIFACTS_PATH);
    const tokenRegistryArtifacts = await readFilePromise(TOKEN_REGISTRY_ARTIFACTS_PATH);
    const setTokenArtifacts = await readFilePromise(SET_TOKEN_ARTIFACTS_PATH);

    // Pull, parse, and store for later use erc20 token's ABI from JSON artifacts
    const { abi } = JSON.parse(erc20TokenArtifacts);
    erc20TokenContractAbi = abi;

    // Pull, parse, and store token registry's abi / network metadata
    // contract.
    const {
      abi: tokenRegistryContractAbi,
      networks: tokenRegistryContractNetworks,
    } = JSON.parse(tokenRegistryArtifacts);

    const { address } = tokenRegistryContractNetworks;

    // Pull, parse, and store token's abi / network metadata
    // contract.
    const {
      abi: setTokenContractAbi,
      networks: setTokenContractNetworks,
    } = JSON.parse(setTokenArtifacts);

    const setTokenRegistryMock: any = mockContracts.SetTokenRegistry;
    const setTokenMock: any = mockContracts.SetToken;

    // Mock the returned token registry artifacts using the stored abi / network metadata
    setTokenRegistryMock.mock(tokenRegistryContractAbi, tokenRegistryContractNetworks);
    const tokenRegistry = await SetTokenRegistryContract.at(tokenRegistryContractNetworks[networkId].address, web3, TX_DEFAULTS);
    const setAddresses = await tokenRegistry.getSetAddresses.callAsync();

    setTokenMock.mock(setTokenContractAbi, setTokenContractNetworks);
    const setToken = await SetTokenContract.at(setAddresses[0], web3, TX_DEFAULTS);
    const components = await setToken.getComponents.callAsync();

    firstTokenAddress = components[0];
  });

  // TODO: Create tests for general solidity method calls on the Debt Token contract
  describe("#at()", () => {
    describe("contract address does not point to contract", () => {
      beforeAll(async () => {
        const mockNetworks: { [index: number]: { address: string } } = {};

        mockNetworks[networkId] = {
          address: ACCOUNTS[0].address,
        };

        const ERC20TokenMock: any = mockContracts.ERC20;
        ERC20TokenMock.mock(erc20TokenContractAbi, mockNetworks);
      });

      test("throws CONTRACT_NOT_FOUND_ON_NETWORK error", async () => {
        await expect(
          ERC20Contract.at(ACCOUNTS[0].address, web3, TX_DEFAULTS),
        ).rejects.toThrowError(
          CONTRACT_WRAPPER_ERRORS.CONTRACT_NOT_FOUND_ON_NETWORK("DetailedERC20", networkId),
        );
      });
    });

    describe("local artifacts readable and contract address associated w/ network id is valid", () => {
      beforeAll(async () => {
        const mockNetworks: { [index: number]: { address: string } } = {};

        mockNetworks[networkId] = {
          address: firstTokenAddress,
        };

        const ERC20TokenMock: any = mockContracts.ERC20;
        ERC20TokenMock.mock(erc20TokenContractAbi, mockNetworks);
      });

      test("returns new ERC20Wrapper w/ current address correctly set", async () => {
        const contractWrapper = await ERC20Contract.at(firstTokenAddress, web3, TX_DEFAULTS);

        expect(contractWrapper.address).toBe(firstTokenAddress);
        expect(contractWrapper.abi).toEqual(erc20TokenContractAbi);
      });
    });
  });
});
