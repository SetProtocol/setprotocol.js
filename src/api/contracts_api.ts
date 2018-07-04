import * as _ from "lodash";
import * as Web3 from "web3";
import { BigNumber } from "../util/bignumber";

import { Assertions } from "../invariants";

// wrappers
import { BaseContract, ContractWrapper, CoreContract } from "../wrappers";

export interface SetContracts {
  Core: CoreContract;
}

export class ContractsAPI {
  private provider: Web3;
  private assert: Assertions;

  private cache: { [contractName: string]: ContractWrapper };

  public constructor(provider: Web3) {
    this.provider = provider;
    this.cache = {};
    this.assert = new Assertions(this.provider);
  }

  public async loadCoreAsync(
    coreAddress: string,
    transactionOptions: object = {},
  ): Promise<CoreContract> {
    this.assert.schema.isValidAddress("coreAddress", coreAddress);

    const cacheKey = this.getCoreCacheKey(coreAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as CoreContract;
    } else {
      const coreContract = await CoreContract.deployed(this.provider, transactionOptions);

      await this.assert.core.implementsCore(coreContract);

      this.cache[cacheKey] = coreContract;
      return coreContract;
    }
  }

  private getCoreCacheKey(coreAddress: string): string {
    return `Core_${coreAddress}`;
  }
}
