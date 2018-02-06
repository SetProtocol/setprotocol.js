import contract = require("truffle-contract");
import * as _ from "lodash";
import * as Web3 from "web3";
import { Utils } from "./util/utils";

import * as setRegistryJSON from "../contract-artifacts/SetRegistry.json";
import * as setTokenJSON from "../contract-artifacts/SetToken.json";
import * as DetailedERC20JSON from "../contract-artifacts/DetailedERC20.json";

const SetRegistryContract = contract(setRegistryJSON);
const SetTokenContract = contract(setTokenJSON);
const ERC20 = contract(DetailedERC20JSON);

/**
 * The SetProtocol class is the single entry-point into the SetProtocol library.
 * It contains all of the library's functionality
 * and all calls to the library should be made through a SetProtocol instance.
 */
class SetProtocol {
  provider: Web3.Provider; // A property storing the Web3.js Provider instance
  setRegistryAddress: string; // The Set Registry address on the active network
  setRegistryInstance: Web3.ContractInstance; // The truffle-contract instance of the deployed SetRegistry

  /**
   * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library.
   * @param   provider    The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
   *                      the Ethereum network.
   */
  constructor(provider: Web3.Provider = undefined, setRegistryAddress: string = undefined) {
    this.setRegistryAddress = setRegistryAddress;
    if (provider) {
      this.setProvider(provider);
    }
  }

  /**
   * Sets a new web3 provider for SetProtocol.js. Also adds the providers for all the contracts.
   * @param   provider    The Web3Provider you would like the SetProtocol.js library to use from now on.
   */
  setProvider(provider: Web3.Provider) {
    this.provider = provider;
    SetRegistryContract.setProvider(this.provider);
    SetTokenContract.setProvider(this.provider);
    ERC20.setProvider(this.provider);
  }

  /****************************************
   * Set Registry Functions
   ****************************************/

  /**
   *  Sets the Set Registry address that we want to use. This can be set before usage with Registry
   *  NOTE: In our current setup, we are dealing with a single registry. Thus, we are allowing users
   *  to set their registry. In the future, we may want to allow users to specify the registry in
   *  each of the functions
   */
  async updateSetRegistryAddress(setRegistryAddress: string) {
    this.setRegistryAddress = setRegistryAddress;
    this.setRegistryInstance = await SetRegistryContract.at(setRegistryAddress);
  }

  /**
   * Fetches all the {Set}s from the Registry, fetches metadata about each component token
   * from each Set token, and gets the token supply for each {Set}.
   * @return  A list of sets full of information from the Registry
   * let sets = [{
   *   address: "0x5259742d812cfec2a12bc1969506e75926e092cb"
   *   component: [
   *     {address: "0x0a18ad43a9dc991db9401ee7ac5aad0a3b219159", quantity: "1", name: "Token A", symbol: "A"},
   *     {address: "0xe42464cbc4c077d1534b5323636c77e829161ef0", quantity: "1", name: "Token B", symbol: "B"}
   *   ],
   *   name: "FelixABSet",
   *   symbol: 'FELIX',
   *   supply: 100
   * }];
   */
  async getSetsFromRegistryAsync() {
    const results: SetObject[] = [];

    const setAddresses = await this.setRegistryInstance.getSetAddresses();

    // For each set, get the set metadata, supply, and component info
    async function processSet(setAddress: string) {
      const metadata = await this.getSetMetadataFromRegistryAsync(setAddress);
      results.push(await this.convertSetMetadataToObjectForm(metadata));
    }

    const setsToProcess = setAddresses.map(processSet.bind(this));
    await Promise.all(setsToProcess);
    return results;
  }

  /**
   *  Sets the Set Registry address that we want to use. This can be set before usage with Registry
   *  Requires that the {Set} registry address has already been set.
   */
  async createSetFromRegistryAsync(
    tokens: string[],
    units: number[],
    name: string,
    symbol: string,
    account: string,
  ) {
    try {
      async function checkErc20(token: string) {
        await ERC20.at(token);
      }
      const tokensToCheck = tokens.map(checkErc20);
      await Promise.all(tokensToCheck);
    } catch (error) {
      console.log(error);
    }

    const createReceipt = this.setRegistryInstance.create(tokens, units, name, symbol, {
      from: account,
    });
    return createReceipt;
  }

  /**
   *  Removes an existing {Set} from the registry
   */
  async removeSetFromRegistryAsync(setAddress: string, account: string) {
    const listOfSets = await this.getSetAddressesFromRegistryAsync();
    const setAddressIndex = _.findIndex(listOfSets, set => set === setAddress);

    const removeReceipt = this.setRegistryInstance.remove(setAddress, setAddressIndex, {
      from: account,
    });
    return removeReceipt;
  }

  /**
   *  Retrieves the list of all {Set} addresses from the {Set} registry
   *  Requires that the {Set} registry address has already been set.
   */
  async getSetAddressesFromRegistryAsync() {
    const setAddresses = await this.setRegistryInstance.getSetAddresses();
    return setAddresses;
  }

  /**
   *  Retrieves the {Set} metadata from the {Set} registry
   *  Requires that the {Set} registry address has already been set.
   */
  async getSetMetadataFromRegistryAsync(setAddress: string) {
    const setMetadata = await this.setRegistryInstance.getSetMetadata(setAddress);
    return setMetadata;
  }

  /**
   *  Retrieves the list of all logs for an address from the {Set} registry
   *  Requires that the {Set} registry address has already been set.
   */
  async getSetRegistryLogsForUserAsync(userAddress: string) {
    const setRegistryEvents = await this.setRegistryInstance.allEvents({
      fromBlock: 0,
      toBlock: "latest",
      from: userAddress,
    });
    const logs = await Utils.getLogsAsync(setRegistryEvents);
    return _.sortBy(logs, "blockNumber");
  }

  /**
   *  Takes an array of set metadata retrieved from the {Set} contract
   *  @param   setMetadata    An array formatted piece of metadata from a {Set}
   *  The input expected is of the following shape:
   *  [
   *     address, // set address
   *     string, // name;
   *     string, // symbol;
   *  ]
   *  @return   set  An object that follows the following shape:
   *  {
   *   address: "0x5259742d812cfec2a12bc1969506e75926e092cb"
   *   component: [
   *     {address: "0x0a18ad43a9dc991db9401ee7ac5aad0a3b219159", quantity: "1", name: "Token A", symbol: "A"},
   *     {address: "0xe42464cbc4c077d1534b5323636c77e829161ef0", quantity: "1", name: "Token B", symbol: "B"}
   *   ],
   *   name: "FelixABSet",
   *   symbol: 'FELIX',
   *   supply: 100
   *  }
   */
  async convertSetMetadataToObjectForm(setMetadata: string[]) {
    const setAddress: string = setMetadata[0];
    const setTokenInstance = await SetTokenContract.at(setAddress);
    const tokens = await setTokenInstance.getTokens();
    const units = await setTokenInstance.getUnits();
    const supply = await this.getSetTotalSupply(setAddress);

    const components: SetComponent[] = [];

    // Function that takes a token and retrieves pertinent
    // information and adds it to the components array
    async function processToken(token: string, index: number) {
      const [name, symbol] = await Promise.all([
        this.getTokenName(token),
        this.getTokenSymbol(token),
      ]);

      components.push({
        address: token,
        quantity: units[index].toString(),
        name,
        symbol,
      });
    }

    const tokensToProcess = tokens.map(processToken.bind(this));
    await Promise.all(tokensToProcess);

    return {
      address: setAddress,
      name: setMetadata[1],
      symbol: setMetadata[2],
      supply,
      components,
    };
  }

  /****************************************
   * Set Token Functions
   ****************************************/

  /**
   *  Issues a particular quantity of tokens from a particular {Set}s
   *  Note: all the tokens in the {Set} must be approved before you can successfully
   *  issue the desired quantity of {Set}s
   */
  async issueSetAsync(setAddress: string, quantityInWei: number, account: string) {
    const setTokenInstance = await SetTokenContract.at(setAddress);
    const issueReceipt = setTokenInstance.issue(quantityInWei, { from: account });

    return issueReceipt;
  }

  /**
   *  Redeems a particular quantity of tokens from a particular {Set}s
   */
  async redeemSetAsync(setAddress: string, quantityInWei: number, account: string) {
    const setTokenInstance = await SetTokenContract.at(setAddress);
    const redeemReceipt = setTokenInstance.redeem(quantityInWei, { from: account });

    return redeemReceipt;
  }

  /**
   *  Retrieves the totalSupply or quantity of tokens of an existing {Set}
   */
  async getSetTotalSupply(setAddress: string) {
    const setTokenInstance = await SetTokenContract.at(setAddress);
    const totalSupply = await setTokenInstance.totalSupply();

    return totalSupply;
  }

  /**
   *  Retrieves the list of all logs for an address from the {Set} registry
   *  Requires that the {Set} registry address has already been set.
   */
  async getSetLogsForUserAsync(setAddress: string, userAddress: string) {
    const setTokenInstance = await SetTokenContract.at(setAddress);
    const setLogs = await setTokenInstance.allEvents({
      fromBlock: 2000000,
      toBlock: "latest",
      _sender: userAddress,
    });
    return setLogs;
  }

  /**
   *  Retrieves the list of sorted logs for a list of set addresses
   */
  async getSetLogsForMultipleSetsUserAsync(setAddresses: string[], userAddress: string) {
    const results: Event[] = [];
    async function getSetLogsForToken(setAddress: string) {
      const events = await this.getSetLogsForUserAsync(setAddress, userAddress);
      const eventLogs = await Utils.getLogsAsync(events);
      _.each(eventLogs, event => results.push(event));
    }

    const setsToProcess = setAddresses.map(getSetLogsForToken.bind(this));
    await Promise.all(setsToProcess);
    return _.sortBy(results, "blockNumber");
  }

  /****************************************
   * ERC20 Token Functions
   ****************************************/

  /**
   *  Retrieves the token name of an ERC20 token
   */
  async getTokenName(tokenAddress: string) {
    try {
      const tokenInstance = await ERC20.at(tokenAddress);
      const tokenName = await tokenInstance.name();

      return tokenName;
    } catch (error) {
      console.log("Error in retrieving token name", error, tokenAddress);
    }
  }

  /**
   *  Retrieves the token symbol of an ERC20 token
   */
  async getTokenSymbol(tokenAddress: string) {
    try {
      const tokenInstance = await ERC20.at(tokenAddress);
      const tokenSymbol = await tokenInstance.symbol();

      return tokenSymbol;
    } catch (error) {
      console.log("Error in retrieving token symbol", error, tokenAddress);
    }
  }

  /**
   *  Retrieves the balance in wei of an ERC20 token for a user
   */
  async getUserBalance(tokenAddress: string, userAddress: string) {
    try {
      const tokenInstance = await ERC20.at(tokenAddress);
      const userBalance = await tokenInstance.balanceOf(userAddress);

      return userBalance;
    } catch (error) {
      console.log("Error in retrieving user balance", error, tokenAddress, userAddress);
    }
  }

  /**
   *  Retrieves the decimals of an ERC20 token
   */
  async getDecimals(tokenAddress: string) {
    try {
      const tokenInstance = await ERC20.at(tokenAddress);
      const decimals = await tokenInstance.decimals();

      return decimals || 18;
    } catch (error) {
      console.log("Error in retrieving decimals", error, tokenAddress);
    }
  }

  /**
   *  Given a list of tokens, retrieves the user balance as well as token metadata
   */
  async getUserBalancesForTokens(tokenAddresses: string[], userAddress: string) {
    // For each token, get all the token metadata
    async function getUserBalanceAndAddtoResults(tokenAddress: string) {
      const token: Token = { address: tokenAddress, name: "", symbol: "", balance: 0, decimals: 0 };
      const tokenInstance = await ERC20.at(tokenAddress);
      token.name = await tokenInstance.name();
      token.symbol = await tokenInstance.symbol();
      token.balance = await tokenInstance.balanceOf(userAddress);
      token.decimals = await tokenInstance.decimals();
      return token;
    }

    const tokensToProcess = tokenAddresses.map(getUserBalanceAndAddtoResults.bind(this));
    return await Promise.all(tokensToProcess);
  }

  /**
   *  Transfer token
   */
  async transfer(tokenAddress: string, userAddress: string, to: string, value: number) {
    const tokenInstance = await ERC20.at(tokenAddress);
    const receipt = await tokenInstance.transfer(to, value, { from: userAddress });
    return receipt;
  }
}

export default SetProtocol;
