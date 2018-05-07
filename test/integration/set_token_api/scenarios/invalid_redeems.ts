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
  {
    description: "invalid redeem of set with insufficient balance",
    successfullyRedeems: false,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getIssueQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(1)),
    getRedeemQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(2)),
    userAddress: ACCOUNTS[0].address, // Only ACCOUNTS[0] has tokens in balance
    errorType: "INSUFFICIENT_BALANCE",
    errorMessage: "Insufficient Balance",
  },
  {
    description: "invalid redeem of set with non-multiple of natural unit",
    successfullyRedeems: false,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getIssueQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(1)),
    getRedeemQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.minus(1)),
    userAddress: ACCOUNTS[0].address, // Only ACCOUNTS[0] has tokens in balance
    errorType: "QUANTITY_NOT_MULTIPLE_OF_NATURAL_UNIT",
    errorMessage: /not a multiple of natural unit/,
  },
];
