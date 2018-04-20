import contract = require("truffle-contract");
import * as _ from "lodash";
import * as Web3 from "web3";
import { Utils } from "./util/utils";

import { BigNumber } from "bignumber.js";
import { Address, UInt } from "./types/common";

import * as setTokenJSON from "../contract-artifacts/SetToken.json";
import * as DetailedERC20JSON from "../contract-artifacts/DetailedERC20.json";

const SetTokenContract = contract(setTokenJSON);
const ERC20 = contract(DetailedERC20JSON);

/**
 * The SetProtocol class is the single entry-point into the SetProtocol library.
 * It contains all of the library's functionality
 * and all calls to the library should be made through a SetProtocol instance.
 */
class SetProtocol {
  provider: Web3.Provider; // A property storing the Web3.js Provider instance

  /**
   * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library.
   * @param   provider    The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
   *                      the Ethereum network.
   */
  constructor(provider: Web3.Provider = undefined) {
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
    SetTokenContract.setProvider(this.provider);
    ERC20.setProvider(this.provider);
  }

  /****************************************
   * Set Token Functions
   ****************************************/

  /**
   *  Issues a particular quantity of tokens from a particular {Set}s
   *  Note: all the tokens in the {Set} must be approved before you can successfully
   *  issue the desired quantity of {Set}s
   */
  async issueSetAsync(setAddress: Address, quantityInWei: BigNumber, userAddress: Address) {
    const setTokenInstance = await SetTokenContract.at(setAddress);
    const issueReceipt = setTokenInstance.issue(quantityInWei, { from: userAddress });

    return issueReceipt;
  }

  /**
   *  Redeems a particular quantity of tokens from a particular {Set}s
   */
  async redeemSetAsync(setAddress: Address, quantityInWei: BigNumber, userAddress: Address) {
    const setTokenInstance = await SetTokenContract.at(setAddress);
    const redeemReceipt = setTokenInstance.redeem(quantityInWei, { from: userAddress });

    return redeemReceipt;
  }

  /**
   *  Retrieves the list of all logs for an address
   *  Requires that the {Set} registry address has already been set.
   */
  async getSetLogsForUserAsync(setAddress: Address, userAddress: Address) {
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
  async getSetLogsForMultipleSetsUserAsync(setAddresses: Address[], userAddress: Address) {
    const results: Event[] = [];
    async function getSetLogsForToken(setAddress: Address) {
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
  async getTokenName(tokenAddress: Address) {
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
  async getTokenSymbol(tokenAddress: Address) {
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
  async getUserBalance(tokenAddress: Address, userAddress: Address) {
    try {
      const tokenInstance = await ERC20.at(tokenAddress);
      const userBalance = await tokenInstance.balanceOf(userAddress);

      return userBalance;
    } catch (error) {
      console.log("Error in retrieving user balance", error, tokenAddress, userAddress);
    }
  }

  /**
   *  Retrieves the totalSupply or quantity of tokens of an existing {Set}
   */
  async getTotalSupply(setAddress: Address) {
    const setTokenInstance = await ERC20.at(setAddress);
    const totalSupply = await ERC20.totalSupply();

    return totalSupply;
  }

  /**
   *  Retrieves the decimals of an ERC20 token
   */
  async getDecimals(tokenAddress: Address) {
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
  async getUserBalancesForTokens(tokenAddresses: Address[], userAddress: Address) {
    // For each token, get all the token metadata
    async function getUserBalanceAndAddtoResults(tokenAddress: Address) {
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
  async transfer(tokenAddress: Address, userAddress: Address, to: Address, value: BigNumber) {
    const tokenInstance = await ERC20.at(tokenAddress);
    const receipt = await tokenInstance.transfer(to, value, { from: userAddress });
    return receipt;
  }
}

export default SetProtocol;
