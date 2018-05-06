import { BigNumber } from "../util/bignumber";

export class CommonAssertions {
  public greaterThanZero(quantity: BigNumber, errorMessage: string) {
    if (quantity.lte(new BigNumber(0))) {
      throw new Error(errorMessage);
    }
  }
}
