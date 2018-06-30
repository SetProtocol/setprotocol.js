import { BigNumber } from "../../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetRedeemScenario } from "./";

export const VALID_REDEEMS: SetRedeemScenario[] = [
  {
    description: "valid redeem of set",
    successfullyRedeems: true,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getIssueQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(1)),
    getRedeemQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(1)),
    userAddress: ACCOUNTS[0].address,
  },
  {
    description: "valid redeem of another set",
    successfullyRedeems: true,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[setAddresses.length - 1],
    getIssueQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(2)),
    getRedeemQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(2)),
    userAddress: ACCOUNTS[0].address,
  },
];
