import { BigNumber } from "../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetIssueScenario } from "./";

export const VALID_ISSUES: SetIssueScenario[] = [
    {
        description: "valid issue of set",
        successfullyIssues: true,
        setTokenAddress: "0x54c890990b07c737c6e99db713c7b47a316c6e0d",
        quantity: new BigNumber(1),
        userAddress: ACCOUNTS[0].address,
    },
];
