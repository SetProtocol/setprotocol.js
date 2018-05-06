import { BigNumber } from "../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetIssueScenario } from "./";

export const INVALID_ISSUES: SetIssueScenario[] = [
  {
    description: "invalid issue of set with not enough allowances",
    successfullyIssues: false,
    hasAllowances: false,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(1)),
    userAddress: ACCOUNTS[0].address,
    errorType: "INSUFFICIENT_ALLOWANCES",
    errorMessage: /User does not have enough allowance of token at address/,
  },
  {
    description: "invalid issue of set with too low of quantity",
    successfullyIssues: false,
    hasAllowances: true,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.minus(1)),
    userAddress: ACCOUNTS[0].address,
    errorType: "QUANTITY_NOT_MULTIPLE_OF_NATURAL_UNIT",
    errorMessage: /not a multiple of natural unit/,
  },
  {
    description: "invalid issue of set with zero quantity",
    successfullyIssues: false,
    hasAllowances: true,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(0),
    userAddress: ACCOUNTS[0].address, // Only ACCOUNTS[0] has tokens in balance
    errorType: "ZERO_QUANTITY",
    errorMessage: /inputted needs to be non\-zero/,
  },
  {
    description: "invalid issue of set with user not having enough balance",
    successfullyIssues: false,
    hasAllowances: true,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(2)),
    userAddress: ACCOUNTS[2].address, // Only ACCOUNTS[0] has tokens in balance
    errorType: "INSUFFICIENT_BALANCE",
    errorMessage: /User does not have enough balance of token/,
  },
];
