import * as Web3 from "web3";
import { BigNumber } from "../util/bignumber";
import { Address, UInt, Token } from "../types/common";

import { Assertions } from "../invariants";
import { 
  SetTokenContract,
  ERC20Contract as ERC20,
} from "../wrappers";

export const TokenAPIErrors = {
  SET_TOKEN_CONTRACT_NOT_FOUND: (setTokenAddress: string) =>
    `Could not find a Set Token Contract at address ${setTokenAddress}`,
};

export class SetTokenAPI {
  private provider: Web3;
  private assert: Assertions;

  constructor(web3: Web3) {
    this.provider = web3;
    this.assert = new Assertions(this.provider);
  }

  /****************************************
   * Set Token Functions
   ****************************************/

  /**
   *  Issues a particular quantity of tokens from a particular {Set}s
   *  Note: all the tokens in the {Set} must be approved before you can successfully
   *  issue the desired quantity of {Set}s
   *  Note: the quantityInWei must be a multiple of the Set's naturalUnit
   */
  public async issueSetAsync(setAddress: Address, quantityInWei: BigNumber, userAddress: Address): Promise<string> {
    const setTokenInstance = await SetTokenContract.at(
      setAddress,
      this.provider,
      { from: userAddress }
    );

    if (!setTokenInstance) {
      throw new Error(TokenAPIErrors.SET_TOKEN_CONTRACT_NOT_FOUND(setAddress));
    }

    this.assert.setToken.isMultipleOfNaturalUnit(setTokenInstance, quantityInWei);

    // Check that the user has sufficient balance of each token
    // const components = await setTokenInstance.getComponents.callAsync();
    // const units = await setTokenInstance.getUnits.callAsync();

    // Check that the user has sufficient allowance of each token

    const txHash = setTokenInstance.issue.sendTransactionAsync(
      quantityInWei,
      { from: userAddress }
    );

    return txHash;
  }

  /**
   *  Redeems a particular quantity of tokens from a particular {Set}s
   */
  public async redeemSetAsync(setAddress: Address, quantityInWei: BigNumber, userAddress: Address): Promise<string> {
    const setTokenInstance = await SetTokenContract.at(
      setAddress,
      this.provider,
      { from: userAddress }
    );
    const txHash = setTokenInstance.redeem.sendTransactionAsync(quantityInWei, { from: userAddress });

    return txHash;
  }
}
