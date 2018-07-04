import { BigNumber } from "../util/bignumber";

export class CommonAssertions {
  public greaterThanZero(quantity: BigNumber, errorMessage: string) {
    if (quantity.lte(new BigNumber(0))) {
      throw new Error(errorMessage);
    }
  }
  public isEqualLength(arr1: any[], arr2: any[], errorMessage: string) {
    if (arr1.length !== arr2.length) {
      throw new Error(errorMessage);
    }
  }

  public isValidString(value: string, errorMessage: string) {
    if (!value) {
      throw new Error(errorMessage);
    }
  }
}
