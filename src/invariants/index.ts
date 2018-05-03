// External
import * as Web3 from "web3";

// Assertions
import { AccountAssertions } from "./account";
import { SetTokenAssertions } from "./set_token";
import { ERC20Assertions } from "./erc20";
import { CommonAssertions } from "./common";
import { SchemaAssertions } from "./schema";


export class Assertions {
  public account: AccountAssertions;
  public setToken: SetTokenAssertions;
  public erc20: ERC20Assertions;
  public common: CommonAssertions;
  public schema: SchemaAssertions;


  public constructor(web3: Web3) {
    this.common = new CommonAssertions();
    this.account = new AccountAssertions();
    this.erc20 = new ERC20Assertions();
    this.schema = new SchemaAssertions();
    this.setToken = new SetTokenAssertions(web3);
  }
}
