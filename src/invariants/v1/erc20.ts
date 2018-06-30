import { BigNumber } from "../../util/bignumber";
import { DetailedERC20Contract as ERC20 } from "../../wrappers/v1/detailed_erc20_wrapper";

export const TokenAssertionErrors = {
  MISSING_ERC20_METHOD: (address: string) =>
    `Contract at ${address} does not implement ERC20 interface.`,
};

export class ERC20Assertions {
  // Throws if the given candidateContract does not respond to some methods from the ERC20 interface.
  public async implementsERC20(tokenInstance: ERC20): Promise<void> {
    const { address } = tokenInstance;

    try {
      await tokenInstance.balanceOf.callAsync(address);
      await tokenInstance.allowance.callAsync(address, address);
      await tokenInstance.totalSupply.callAsync();
    } catch (error) {
      throw new Error(TokenAssertionErrors.MISSING_ERC20_METHOD(address));
    }
  }

  public async hasSufficientBalance(
    token: ERC20,
    payer: string,
    balanceRequired: BigNumber,
    errorMessage: string,
  ): Promise<void> {
    const payerBalance = await token.balanceOf.callAsync(payer);

    if (payerBalance.lt(balanceRequired)) {
      throw new Error(errorMessage);
    }
  }

  public async hasSufficientAllowance(
    token: ERC20,
    owner: string,
    spender: string,
    allowanceRequired: BigNumber,
    errorMessage: string,
  ): Promise<void> {
    const payerAllowance = await token.allowance.callAsync(owner, spender);

    if (payerAllowance.lt(allowanceRequired)) {
      throw new Error(errorMessage);
    }
  }
}
