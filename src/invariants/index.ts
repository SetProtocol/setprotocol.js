// External
import * as Web3 from "web3";

// Assertions
import { AccountAssertions } from "./account";
import { CommonAssertions } from "./common";
import { SchemaAssertions } from "./schema";
import { CoreAssertions } from "./core";

export class Assertions {
  public account: AccountAssertions;
  public common: CommonAssertions;
  public schema: SchemaAssertions;
  public core: CoreAssertions;

  public constructor(web3: Web3) {
    this.common = new CommonAssertions();
    this.account = new AccountAssertions();
    this.schema = new SchemaAssertions();
    this.core = new CoreAssertions();
  }
}
