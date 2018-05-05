import { BigNumber } from "../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetIssueScenario } from "./";

export const INVALID_ISSUES: SetIssueScenario[] = [
  {
    description: "invalid issue of set with too low of quantity",
    successfullyIssues: false,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.minus(1)),
    userAddress: ACCOUNTS[0].address,
    errorType: "QUANTITY_NOT_MULTIPLE_OF_NATURAL_UNIT",
    errorMessage: "",
  },
];
