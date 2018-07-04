import * as Web3 from "web3";
import * as _ from "lodash";
import { BigNumber } from "../util/bignumber";
import { Address, UInt, Token, Component, TransactionOpts } from "../types/common";

import { Assertions } from "../invariants";
import { estimateIssueRedeemGasCost } from "../util/set_token_utils";
import { CoreContract } from "../wrappers";

// APIs
import { ContractsAPI } from ".";

export const SetTokenAPIErrors = {
  QUANTITY_NEEDS_TO_BE_NON_ZERO: (quantity: BigNumber) =>
    `The quantity ${quantity.toString()} inputted needs to be non-zero`,
};

const DEFAULT_GAS_PRICE: BigNumber = new BigNumber(6000000000); // 6 gwei

export class CoreAPI {
  private provider: Web3;
  private assert: Assertions;
  private contracts: ContractsAPI;

  constructor(web3: Web3, contracts: ContractsAPI) {
    this.provider = web3;
    this.contracts = contracts;
    this.assert = new Assertions(this.provider);
  }

  public async create(
    factoryAddress: string,
    components: string[],
    units: number[],
    naturalUnit: number,
    name: string,
    symbol: string,
  ): Promise<string> {
    const coreInstance = await this.contracts.loadCoreAsync(factoryAddress, {
      from: factoryAddress,
    });

    return coreInstance.sendTransactionAsync(
      factoryAddress,
      components,
      units,
      naturalUnit,
      name,
      symbol,
      { from: factoryAddress },
    );

    /* Asserts */
    // assert that factoryAddress is valid
    // assert components length and units length are the same
    // assert that components are valid
    // component addresses exist as a parameter
    // component addresses map to valid ERC20 contracts
    // assert that units are valid
    // greater than zero
    // assert naturalUnit is valid
    // greater than zero
    // greater than greatest decimal amount
    // assert name exists
    // assert symbol exists

    /* Functionality */
    // invoke create() on core with given parameters
    // return set address
  }
}
