import * as Web3 from "web3";
import { v1 } from "./api";
import { SetProtocolV1 } from "./types/common";

const { ContractsAPI, SetTokenAPI, ERC20API } = v1;

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
   */
  constructor(provider: Web3 = undefined) {
    const contractsV1 = new ContractsAPI(this.provider);
    const erc20V1 = new ERC20API(this.provider, this.contracts);
    const setTokenV1 = new SetTokenAPI(this.provider, this.contracts);

    this.provider = provider;
    this.v1 = {
      contracts: contractsV1,
      erc20: erc20V1,
      setToken: setTokenV1,
    };
  }
}
