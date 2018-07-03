import * as Web3 from "web3";

import { CoreAPI } from "./api";
import { Config } from "./types/common";

/**
 * The SetProtocol class is the single entry-point into the SetProtocol library.
 * It contains all of the library's functionality
 * and all calls to the library should be made through a SetProtocol instance.
 */
export default class SetProtocol {
  private provider: Web3; // A property storing the Web3.js Provider instance
  public v1: SetProtocolV1;

  /**
   * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library.
   * @param   provider    The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
   *                      the Ethereum network.
   * @param   config     Config object that allow setProtocol.js to be exposed differently
   */
  constructor(provider: Web3 = undefined, config: Config = {}) {
    this.provider = provider;
    this.setCore = new CoreAPI(this.provider);
  }
}
