import { BigNumber } from "./bignumber";

const TRANSFER_GAS_MAXIMUM = new BigNumber(70000);

export const estimateIssueRedeemGasCost = (numComponents: BigNumber): number => {
  return numComponents.times(TRANSFER_GAS_MAXIMUM).toNumber();
};
