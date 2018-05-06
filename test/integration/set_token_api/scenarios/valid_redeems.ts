import { BigNumber } from "../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetRedeemScenario } from "./";

export const VALID_REDEEMS: SetRedeemScenario[] = [
  {
    description: "valid redeem of set",
    successfullyRedeems: true,
    hasAllowances: true,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(5)),
    userAddress: ACCOUNTS[0].address,
  },
  {
    description: "valid redeem of a different set",
    successfullyRedeems: true,
    hasAllowances: true,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[setAddresses.length - 1],
    getQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(2)),
    userAddress: ACCOUNTS[0].address,
  },
];
