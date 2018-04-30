import { BigNumber } from "../util/bignumber";
import { DetailedERC20Contract as ERC20 } from "../wrappers/DetailedERC20_wrapper";

export const TokenAssertionErrors = {
  MISSING_ERC20_METHOD: (address: string) =>
      `Contract at ${address} does not implement ERC20 interface.`,
};

export class TokenAssertions {
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
    payer: string,
    target: string,
    allowanceRequired: BigNumber,
    errorMessage: string,
  ): Promise<void> {
    const payerAllowance = await token.allowance.callAsync(payer, target);

    if (payerAllowance.lt(allowanceRequired)) {
      throw new Error(errorMessage);
    }
  }
}
