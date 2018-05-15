import { BigNumber } from "./bignumber";

const TRANSFER_GAS_MAXIMUM = new BigNumber(70000);

export const estimateIssueRedeemGasCost = (numComponents: BigNumber): number => {
  const baseIssueRedeemGasCost = new BigNumber(70000);

  return numComponents
    .times(TRANSFER_GAS_MAXIMUM)
    .plus(baseIssueRedeemGasCost)
    .toNumber();
};
