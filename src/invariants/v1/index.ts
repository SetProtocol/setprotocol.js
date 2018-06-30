// External
import * as Web3 from "web3";

// Assertions
import { AccountAssertions } from "./account";
import { CommonAssertions } from "./common";
import { ERC20Assertions } from "./erc20";
import { SchemaAssertions } from "./schema";
import { SetTokenAssertions } from "./set_token";


export class Assertions {
  public account: AccountAssertions;
  public common: CommonAssertions;
  public erc20: ERC20Assertions;
  public schema: SchemaAssertions;
  public setToken: SetTokenAssertions;

  public constructor(web3: Web3) {
    this.account = new AccountAssertions();
    this.common = new CommonAssertions();
    this.erc20 = new ERC20Assertions();
    this.schema = new SchemaAssertions();
    this.setToken = new SetTokenAssertions(web3);
  }
}
