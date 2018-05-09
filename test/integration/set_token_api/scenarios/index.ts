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
import { VALID_REDEEMS } from "./valid_redeems";
import { INVALID_REDEEMS } from "./invalid_redeems";

// Types

import { SetTokenAPI } from "../../../../src/api";

export interface SetIssueScenario {
  description: string;
  successfullyIssues: boolean;
  hasAllowances: boolean;
  selectSet: (
    setAddresses: string[],
  ) => string;
  getQuantity: (
    naturalUnit: BigNumber,
  ) => BigNumber;
  userAddress: string;
  errorType?: string;
  errorMessage?: string | RegExp;
}

export interface SetRedeemScenario {
  description: string;
  successfullyRedeems: boolean;
  selectSet: (
    setAddresses: string[],
  ) => string;
  getIssueQuantity: (
    naturalUnit: BigNumber,
  ) => BigNumber;
  getRedeemQuantity: (
    naturalUnit: BigNumber,
  ) => BigNumber;
  userAddress: string;
  errorType?: string;
  errorMessage?: string | RegExp;
}

export {
  VALID_ISSUES,
  INVALID_ISSUES,
  VALID_REDEEMS,
  INVALID_REDEEMS,
};
