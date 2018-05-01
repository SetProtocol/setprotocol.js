import * as Web3 from "web3";
import { BigNumber } from "../util/bignumber";
import { Address, UInt, Token } from "../types/common";

import { Assertions } from "../invariants";
import {
  SetTokenContract,
  ERC20Contract as ERC20,
} from "../wrappers";

// APIs
import { ContractsAPI } from ".";

export const TokenAPIErrors = {
  // INSUFFICIENT_SENDER_BALANCE: (address) =>
  //   `SENDER with address ${address} does not have sufficient balance in the specified token to execute this transfer.`,
  // INSUFFICIENT_SENDER_ALLOWANCE: (address) =>
  //   `SENDER with address ${address} does not have sufficient allowance in the specified token to execute this transfer.`,
};

export class ERC20API {
  private provider: Web3;
  private assert: Assertions;
  private contracts: ContractsAPI;

  constructor(web3: Web3, contracts: ContractsAPI) {
    this.provider = web3;
    this.contracts = contracts;
    this.assert = new Assertions(this.provider);
  }

  /**
   *  Retrieves the token name of an ERC20 token
   */
  public async getTokenName(tokenAddress: Address): Promise<string> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const tokenName = await tokenInstance.name.callAsync();
    return tokenName;
  }

  /**
   *  Retrieves the token symbol of an ERC20 token
   */
  public async getTokenSymbol(tokenAddress: Address): Promise<string> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const tokenSymbol = await tokenInstance.symbol.callAsync();
    return tokenSymbol;
  }

  /**
   *  Retrieves the balance in wei of an ERC20 token for a user
   */
  public async getUserBalance(tokenAddress: Address, userAddress: Address): Promise<BigNumber> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const userBalance = await tokenInstance.balanceOf.callAsync(userAddress);
    return userBalance;
  }

  /**
   *  Retrieves the totalSupply or quantity of tokens of an existing {Set}
   */
  public async getTotalSupply(tokenAddress: Address): Promise<BigNumber> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const totalSupply = await tokenInstance.totalSupply.callAsync();
    return totalSupply;
  }

  /**
   *  Retrieves the decimals of an ERC20 token
   */
  public async getDecimals(tokenAddress: Address): Promise<BigNumber> {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const decimals = await tokenInstance.decimals.callAsync();
    return decimals || new BigNumber(18);
  }

  /**
   *  Given a list of tokens, retrieves the user balance as well as token metadata
   */
  public async getUserBalancesForTokens(tokenAddresses: Address[], userAddress: Address) {
    // For each token, get all the token metadata
    async function getUserBalanceAndAddtoResults(tokenAddress: Address) {
      const token: Token = {
        address: tokenAddress,
        name: "",
        symbol: "",
        balance: new BigNumber(0),
        decimals: new BigNumber(0)
      };
      const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
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
  public async transfer(tokenAddress: Address, userAddress: Address, to: Address, value: BigNumber) {
    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const txHash = await tokenInstance.transfer.sendTransactionAsync(to, value, { from: userAddress });
    return txHash;
  }
}
