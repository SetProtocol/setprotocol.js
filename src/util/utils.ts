import { BigNumber } from "bignumber.js";

export function isMultipleOf(number: BigNumber, base: BigNumber): boolean {
  return (number.mod(base) === new BigNumber(0));
}