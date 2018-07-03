import * as _ from "lodash";
import * as Web3 from "web3";
import { BigNumber } from "../../util/bignumber";

// wrappers
import { CoreWrapper } from "../../wrappers";

/**
 * @title CoreAPI
 * @author Set Protocol
 *
 * The Core handles all functions including creating, issuing, redeeming, withdrawing, and depositing
 *
 */

export class CoreAPI {
  private provider: Web3;

  public constructor(provider: Web3) {
    this.provider = provider;
  }
}
