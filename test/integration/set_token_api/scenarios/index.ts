// External
import { BigNumber } from "../../../../src/util/bignumber";

// Wrappers
import {
  SetTokenContract,
  SetTokenRegistryContract,
} from "../../../../src/wrappers";

// Scenarios
import { VALID_ISSUES } from "./valid_issues";
import { INVALID_ISSUES } from "./invalid_issues";

// Types

import { SetTokenAPI } from "../../../../src/api";

export interface SetIssueScenario {
  description: string;
  successfullyIssues: boolean;
  selectSet: (
    setAddresses: string[],
  ) => string;
  getQuantity: (
    naturalUnit: BigNumber,
  ) => BigNumber;
  userAddress: string;
  errorType?: string;
  errorMessage?: string;
}

export interface SetRedeemScenario {
  description: string;
  successfullyRedeems: boolean;
  selectSet: (
    setAddresses: string[],
  ) => string;
  getQuantity: (
    naturalUnit: BigNumber,
  ) => BigNumber;
  userAddress: string;
  errorType?: string;
  errorMessage?: string;
}

export {
  VALID_ISSUES,
  INVALID_ISSUES,
}
