import { BigNumber } from "../../../../../src/util/bignumber";
import { ACCOUNTS } from "../../../accounts";
import { SetIssueScenario } from "./";

const DEFAULT_GAS_PRICE: BigNumber = new BigNumber(6000000000); // 6 gwei

export const INVALID_ISSUES: SetIssueScenario[] = [
  {
    description: "invalid issue of set with not enough allowances",
    successfullyIssues: false,
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
    gasPrice: DEFAULT_GAS_PRICE,
    gasLimit: 4712388,
  },
  {
    description: "invalid issue of set with too low of quantity",
    successfullyIssues: false,
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
    gasPrice: DEFAULT_GAS_PRICE,
    gasLimit: 4712388,
  },
  {
    description: "invalid issue of set with zero quantity",
    successfullyIssues: false,
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
    gasPrice: DEFAULT_GAS_PRICE,
    gasLimit: 4712388,
  },
  {
    description: "invalid issue of set with user not having enough balance",
    successfullyIssues: false,
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
    gasPrice: DEFAULT_GAS_PRICE,
    gasLimit: 4712388,
  },
  {
    description: "invalid issue of a set with low gas limit",
    successfullyIssues: false,
    hasAllowances: true,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(5)),
    userAddress: ACCOUNTS[0].address,
    errorType: "EXCEED_GAS_LIMIT",
    errorMessage: /base fee exceeds gas limit/,
    gasPrice: DEFAULT_GAS_PRICE,
    gasLimit: 1,
  },
  {
    description: "invalid issue of a set with out of gas causes revert",
    successfullyIssues: false,
    hasAllowances: true,
    selectSet: (
      setAddresses: string[],
    ) => setAddresses[0],
    getQuantity: (
      naturalUnit: BigNumber,
    ) => new BigNumber(naturalUnit.times(5)),
    userAddress: ACCOUNTS[0].address,
    errorType: "OUT_OF_GAS",
    errorMessage: /VM Exception while processing transaction: revert/,
    gasPrice: DEFAULT_GAS_PRICE,
    gasLimit: 100000,
  },
];
