// External
import { BigNumber } from "../../../../src/util/bignumber";

// Wrappers
import {
  SetTokenContract,
} from "../../../../src/wrappers";

// Scenarios

// Types

import { SetTokenAPI } from "../../../../src/api";

export interface SetIssueScenario {
    description: string;
    successfullyIssues: boolean;
    errorType?: string;
    errorMessage?: string;
}

export interface SetRedeemScenario {
    description: string;
    successfullyRedeems: boolean;
    errorType?: string;
    errorMessage?: string;
}
