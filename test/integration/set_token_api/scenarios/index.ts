// External
import { BigNumber } from "../../../../src/util/bignumber";

// Wrappers
import {
  SetTokenContract,
} from "../../../../src/wrappers";

// Scenarios
import { VALID_ISSUES } from "./valid_issues";

// Types

import { SetTokenAPI } from "../../../../src/api";

export interface SetIssueScenario {
    description: string;
    successfullyIssues: boolean;
    quantity: BigNumber;
    userAddress: string;
    errorType?: string;
    errorMessage?: string;
}

export interface SetRedeemScenario {
    description: string;
    successfullyRedeems: boolean;
    quantity: BigNumber;
    userAddress: string;
    errorType?: string;
    errorMessage?: string;
}

export {
    VALID_ISSUES,
}
