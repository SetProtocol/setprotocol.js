import { BigNumber } from "../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetIssueScenario } from "./";

import {
    SetTokenRegistryContract,
} from "../../../../src/wrappers";

export const VALID_ISSUES: SetIssueScenario[] = [
    {
        description: "valid issue of set",
        successfullyIssues: true,
        quantity: new BigNumber(10),
        userAddress: ACCOUNTS[0].address,
    },
];
