import { BigNumber } from "../../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetIssueScenario } from "./";

export const VALID_ISSUES: SetIssueScenario[] = [
  {
    description: "valid issue of set",
    successfullyIssues: true,
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
    description: "valid issue of a different set",
    successfullyIssues: true,
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
