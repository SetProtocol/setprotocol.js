// External
import * as Web3 from "web3";

// Assertions
import { CoreAssertions } from "./set_token";

export class Assertions {
  public core: CoreAssertions;

  public constructor(web3: Web3) {
    this.core = new CoreAssertions(web3);
  }
}
