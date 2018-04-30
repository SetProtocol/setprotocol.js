// External
import * as Web3 from "web3";

// Assertions
import { AccountAssertions } from "./account";
import { SetTokenAssertions } from "./setToken";
import { TokenAssertions } from "./token";


// APIs
import { ContractsAPI } from "../apis/";

export class Assertions {
  public account: AccountAssertions;
  public setToken: SetTokenAssertions
  public token: TokenAssertions;

  private contracts: ContractsAPI;

  public constructor(web3: Web3, contracts: ContractsAPI) {
    this.contracts = contracts;

    this.account = new AccountAssertions();
    this.token = new TokenAssertions();
    this.setToken = new SetTokenAssertions(web3);
  }
}
