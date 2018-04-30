// External
import * as Web3 from "web3";

// Assertions
import { AccountAssertions } from "./account";
import { SetTokenAssertions } from "./setToken";
import { TokenAssertions } from "./token";


export class Assertions {
  public account: AccountAssertions;
  public setToken: SetTokenAssertions
  public token: TokenAssertions;


  public constructor(web3: Web3) {
    this.account = new AccountAssertions();
    this.token = new TokenAssertions();
    this.setToken = new SetTokenAssertions(web3);
  }
}
