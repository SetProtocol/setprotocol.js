// External
import * as Web3 from "web3";

// Assertions
import { AccountAssertions } from "./account";
import { SetTokenAssertions } from "./setToken";
import { ERC20Assertions } from "./erc20";
import { CommonAssertions } from "./common";


export class Assertions {
  public account: AccountAssertions;
  public setToken: SetTokenAssertions;
  public token: ERC20Assertions;
  public common: CommonAssertions;


  public constructor(web3: Web3) {
    this.common = new CommonAssertions();
    this.account = new AccountAssertions();
    this.token = new ERC20Assertions();
    this.setToken = new SetTokenAssertions(web3);
  }
}
