import * as _ from "lodash";
import * as Web3 from "web3";

import { BigNumber } from "bignumber.js";
import { Address, UInt, Token } from "./types/common";

// wrappers
import { SetTokenContract } from "./wrappers/SetToken_wrapper";
import { DetailedERC20Contract as ERC20 } from "./wrappers/DetailedERC20_wrapper";

// const SetTokenContract = contract(setTokenJSON);
// const ERC20 = contract(DetailedERC20JSON);

/**
 * The SetProtocol class is the single entry-point into the SetProtocol library.
 * It contains all of the library's functionality
 * and all calls to the library should be made through a SetProtocol instance.
 */
class SetProtocol {
  provider: Web3; // A property storing the Web3.js Provider instance

  /**
   * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library.
   * @param   provider    The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
   *                      the Ethereum network.
   */
  constructor(provider: Web3 = undefined) {
    if (provider) {
      this.setProvider(provider);
    }
  }

  /**
   * Sets a new web3 provider for SetProtocol.js. Also adds the providers for all the contracts.
   * @param   provider    The Web3Provider you would like the SetProtocol.js library to use from now on.
   */
  setProvider(provider: Web3) {
    this.provider = provider;
  }

  /****************************************
   * Set Token Functions
   ****************************************/

  /**
   *  Issues a particular quantity of tokens from a particular {Set}s
   *  Note: all the tokens in the {Set} must be approved before you can successfully
   *  issue the desired quantity of {Set}s
   */
  async issueSetAsync(setAddress: Address, quantityInWei: BigNumber, userAddress: Address): Promise<string> {
    const setTokenInstance = await SetTokenContract.at(
      setAddress,
      this.provider,
      { from: userAddress }
    );

    const txHash = setTokenInstance.issue.sendTransactionAsync(
      quantityInWei,
      { from: userAddress }
    );

    return txHash;
  }

  /**
   *  Redeems a particular quantity of tokens from a particular {Set}s
   */
  async redeemSetAsync(setAddress: Address, quantityInWei: BigNumber, userAddress: Address): Promise<string> {
    const setTokenInstance = await SetTokenContract.at(
      setAddress,
      this.provider,
      { from: userAddress }
    );
    const txHash = setTokenInstance.redeem.sendTransactionAsync(quantityInWei, { from: userAddress });

    return txHash;
  }

  /****************************************
   * ERC20 Token Functions
   ****************************************/

  /**
   *  Retrieves the token name of an ERC20 token
   */
  async getTokenName(tokenAddress: Address) {
    try {
      const tokenInstance = await ERC20.at(
        tokenAddress,
        this.provider,
        {},
      );

      const tokenName = await tokenInstance.name.callAsync();

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
      const tokenInstance = await ERC20.at(
        tokenAddress,
        this.provider,
        {},
      );
      const tokenSymbol = await tokenInstance.symbol.callAsync();

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
      const tokenInstance = await ERC20.at(
        tokenAddress,
        this.provider,
        {},
      );
      const userBalance = await tokenInstance.balanceOf.callAsync(userAddress);

      return userBalance;
    } catch (error) {
      console.log("Error in retrieving user balance", error, tokenAddress, userAddress);
    }
  }

  /**
   *  Retrieves the totalSupply or quantity of tokens of an existing {Set}
   */
  async getTotalSupply(tokenAddress: Address) {
    const tokenInstance = await ERC20.at(
        tokenAddress,
        this.provider,
        {},
      );
    const totalSupply = await tokenInstance.totalSupply.callAsync();

    return totalSupply;
  }

  /**
   *  Retrieves the decimals of an ERC20 token
   */
  async getDecimals(tokenAddress: Address) {
    try {
      const tokenInstance = await ERC20.at(
        tokenAddress,
        this.provider,
        {},
      );
      const decimals = await tokenInstance.decimals.callAsync();

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
      const token: Token = {
        address: tokenAddress,
        name: "",
        symbol: "",
        balance: new BigNumber(0),
        decimals: new BigNumber(0)
      };
      const tokenInstance = await ERC20.at(
        tokenAddress,
        this.provider,
        {},
      );
      token.name = await tokenInstance.name.callAsync();
      token.symbol = await tokenInstance.symbol.callAsync();
      token.balance = await tokenInstance.balanceOf.callAsync(userAddress);
      token.decimals = await tokenInstance.decimals.callAsync();
      return token;
    }

    const tokensToProcess = tokenAddresses.map(getUserBalanceAndAddtoResults.bind(this));
    return await Promise.all(tokensToProcess);
  }

  /**
   *  Transfer token
   */
  async transfer(tokenAddress: Address, userAddress: Address, to: Address, value: BigNumber) {
    const tokenInstance = await ERC20.at(
        tokenAddress,
        this.provider,
        {},
      );
    const txHash = await tokenInstance.transfer.sendTransactionAsync(to, value, { from: userAddress });
    return txHash;
  }
}

export default SetProtocol;
