import * as Web3 from "web3";
import { BigNumber } from "../util/bignumber";
import { Address, UInt, Token } from "../types/common";

import { Assertions } from "../invariants";
import { SetTokenContract, ERC20Contract as ERC20 } from "../wrappers";

// APIs
import { ContractsAPI } from ".";

export const ERC20APIErrors = {
  INSUFFICIENT_SENDER_BALANCE: (address: Address) =>
    `SENDER with address ${address} does not have sufficient balance in the specified token to execute this transfer.`,
  INSUFFICIENT_SENDER_ALLOWANCE: (address: Address) =>
    `SENDER with address ${address} does not have sufficient allowance in the specified token to execute this transfer.`,
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
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);

    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const tokenName = await tokenInstance.name.callAsync();
    return tokenName;
  }

  /**
   *  Retrieves the token symbol of an ERC20 token
   */
  public async getTokenSymbol(tokenAddress: Address): Promise<string> {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);

    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const tokenSymbol = await tokenInstance.symbol.callAsync();
    return tokenSymbol;
  }

  /**
   *  Retrieves the balance in wei of an ERC20 token for a user
   */
  public async getUserBalance(tokenAddress: Address, userAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);

    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const userBalance = await tokenInstance.balanceOf.callAsync(userAddress);
    return userBalance;
  }

  /**
   *  Retrieves the totalSupply or quantity of an ERC20 token
   */
  public async getTotalSupply(tokenAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);

    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const totalSupply = await tokenInstance.totalSupply.callAsync();
    return totalSupply;
  }

  /**
   *  Retrieves the decimals of an ERC20 token
   */
  public async getDecimals(tokenAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);

    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const decimals = await tokenInstance.decimals.callAsync();
    return decimals || new BigNumber(18);
  }

  /**
   *  Given a list of tokens, retrieves the user balance as well as token metadata
   */
  public async getUserBalancesForTokens(
    tokenAddresses: Address[],
    userAddress: Address,
  ): Promise<Token[]> {
    // For each token, get all the token metadata
    async function getUserBalanceAndAddtoResults(tokenAddress: Address) {
      const token: Token = {
        address: tokenAddress,
        name: "",
        symbol: "",
        balance: new BigNumber(0),
        decimals: new BigNumber(0),
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
   *  Asynchronously transfers token
   */
  public async transferAsync(tokenAddress: Address, from: Address, to: Address, value: BigNumber) {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);
    this.assert.schema.isValidAddress("from", from);
    this.assert.schema.isValidAddress("to", to);
    this.assert.schema.isValidNumber("value", value);

    const tokenInstance = await this.contracts.loadERC20TokenAsync(tokenAddress);

    await this.assert.erc20.hasSufficientBalance(
      tokenInstance,
      from,
      value,
      ERC20APIErrors.INSUFFICIENT_SENDER_BALANCE(from),
    );

    const txHash = await tokenInstance.transfer.sendTransactionAsync(to, value, { from });
    return txHash;
  }

  /**
   *  Asynchronously sets user allowance
   */
  public async setAllowanceAsync(
    tokenAddress: string,
    spender: string,
    allowance: BigNumber,
    userAddress: string,
  ): Promise<string> {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.schema.isValidAddress("spender", spender);
    this.assert.schema.isValidNumber("allowance", allowance);

    const tokenContract = await this.contracts.loadERC20TokenAsync(tokenAddress);

    return tokenContract.approve.sendTransactionAsync(spender, allowance, { from: userAddress });
  }

  /**
   *  Asynchronously sets user allowance to unlimited
   */
  public async setUnlimitedAllowanceAsync(
    tokenAddress: string,
    spender: string,
    userAddress: string,
  ): Promise<string> {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.schema.isValidAddress("spender", spender);

    const tokenContract = await this.contracts.loadERC20TokenAsync(tokenAddress);
    const unlimitedAllowance = new BigNumber(2).pow(256).minus(100);

    return tokenContract.approve.sendTransactionAsync(spender, unlimitedAllowance, {
      from: userAddress,
    });
  }
}
