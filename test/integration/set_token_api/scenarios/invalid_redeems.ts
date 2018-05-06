import { BigNumber } from "../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetRedeemScenario } from "./";

export const INVALID_REDEEMS: SetRedeemScenario[] = [
  {
    description: "invalid redeem of set with too low of quantity",
    successfullyRedeems: false,
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
    description: "invalid redeem of set with zero quantity",
    successfullyRedeems: false,
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
    description: "invalid redeem of set with user not having enough balance",
    successfullyRedeems: false,
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
  {
    description: "invalid redeem of set with not enough allowances",
    successfullyRedeems: false,
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
];
