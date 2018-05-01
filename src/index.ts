import * as Web3 from "web3";
import {
  ContractsAPI,
  SetTokenAPI,
  ERC20API,
} from "./api";

/**
 * The SetProtocol class is the single entry-point into the SetProtocol library.
 * It contains all of the library's functionality
 * and all calls to the library should be made through a SetProtocol instance.
 */
export default class SetProtocol {
  private provider: Web3; // A property storing the Web3.js Provider instance
  public contracts: ContractsAPI; 
  public erc20: ERC20API;
  public setToken: SetTokenAPI;

  /**
   * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library.
   * @param   provider    The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
   *                      the Ethereum network.
   */
  constructor(provider: Web3 = undefined) {
    this.provider = provider;
    this.contracts = new ContractsAPI(this.provider);

    this.erc20 = new ERC20API(this.provider, this.contracts);
    this.setToken = new SetTokenAPI(this.provider, this.contracts);
  }
}
