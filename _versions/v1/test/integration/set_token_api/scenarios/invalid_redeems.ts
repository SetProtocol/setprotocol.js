import { BigNumber } from "../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetRedeemScenario } from "./";

const DEFAULT_GAS_PRICE: BigNumber = new BigNumber(6000000000); // 6 gwei

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
  {
    description: "invalid redeem of set due to low gas limit",
    successfullyRedeems: false,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getIssueQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(1)),
    getRedeemQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(1)),
    userAddress: ACCOUNTS[0].address,
    errorType: "EXCEED_GAS_LIMIT",
    errorMessage: /base fee exceeds gas limit/,
    gasPrice: DEFAULT_GAS_PRICE,
    gasLimit: 1,
  },
  {
    description: "invalid redeem of set with out of gas causes revert",
    successfullyRedeems: false,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getIssueQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(1)),
    getRedeemQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(1)),
    userAddress: ACCOUNTS[0].address,
    errorType: "OUT_OF_GAS",
    errorMessage: /VM Exception while processing transaction: out of gas/,
    gasPrice: DEFAULT_GAS_PRICE,
    gasLimit: 40000,
  },
];
