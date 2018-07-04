import * as _ from "lodash";
import * as Web3 from "web3";
import { BigNumber } from "../util/bignumber";

import { Assertions } from "../invariants";

// wrappers
import {
  BaseContract,
  ContractWrapper,
  ERC20Contract,
  SetTokenContract,
  SetTokenRegistryContract,
} from "../wrappers";

export interface SetContracts {
  ERC20: ERC20Contract;
  setToken: SetTokenContract;
  setTokenRegistry: SetTokenRegistryContract;
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

  public async loadSetTokenAsync(
    setTokenAddress: string,
    transactionOptions: object = {},
  ): Promise<SetTokenContract> {
    this.assert.schema.isValidAddress("setTokenAddress", setTokenAddress);

    const cacheKey = this.getSetTokenCacheKey(setTokenAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as SetTokenContract;
    } else {
      const setTokenContract = await SetTokenContract.at(
        setTokenAddress,
        this.provider,
        transactionOptions,
      );

      await this.assert.setToken.implementsSet(setTokenContract);

      this.cache[cacheKey] = setTokenContract;
      return setTokenContract;
    }
  }

  public async loadERC20TokenAsync(
    tokenAddress: string,
    transactionOptions: object = {},
  ): Promise<ERC20Contract> {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);

    const cacheKey = this.getERC20TokenCacheKey(tokenAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as ERC20Contract;
    } else {
      const tokenContract = await ERC20Contract.at(tokenAddress, this.provider, transactionOptions);

      await this.assert.erc20.implementsERC20(tokenContract);

      this.cache[cacheKey] = tokenContract;
      return tokenContract;
    }
  }

  private getERC20TokenCacheKey(tokenAddress: string): string {
    return `ERC20_${tokenAddress}`;
  }

  private getSetTokenCacheKey(tokenAddress: string): string {
    return `Set_${tokenAddress}`;
  }
}
