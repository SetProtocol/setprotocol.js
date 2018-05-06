import { BigNumber } from "../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetRedeemScenario } from "./";

export const INVALID_REDEEMS: SetRedeemScenario[] = [
  {
    description: "invalid redeem of set with zero quantity",
    successfullyRedeems: false,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getIssueQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(1)),
    getRedeemQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(0),
    userAddress: ACCOUNTS[0].address, // Only ACCOUNTS[0] has tokens in balance
    errorType: "ZERO_QUANTITY",
    errorMessage: /inputted needs to be non\-zero/,
  },
];
