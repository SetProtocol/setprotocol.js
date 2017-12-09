const contract = require('truffle-contract');
const _ = require('lodash');

const Utils = require('./util/utils');

const SetRegistryContract = contract(require('../contract-artifacts/SetRegistry.json'));
const SetTokenContract = contract(require('../contract-artifacts/SetToken.json'));
const ERC20 = contract(require('../contract-artifacts/ERC20.json'));

/**
 * The SetProtocol class is the single entry-point into the SetProtocol library. 
 * It contains all of the library's functionality
 * and all calls to the library should be made through a SetProtocol instance.
 */
class SetProtocol {
  provider; // A property storing the Web3.js Provider instance
  setRegistryAddress; // The Set Registry address on the active network
  setRegistryInstance; // The truffle-contract instance of the deployed SetRegistry

  /**
   * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library.
   * @param   provider    The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
   *                      the Ethereum network.
   */
  constructor(provider = null, setRegistryAddress = null) {
    if (provider) { this.setProvider(provider); }
  }

  /**
   * Sets a new web3 provider for SetProtocol.js. Also adds the providers for all the contracts.
   * @param   provider    The Web3Provider you would like the SetProtocol.js library to use from now on.
   */
  setProvider(provider) {
    this.provider = provider;
    SetRegistryContract.setProvider(this.provider);
    SetTokenContract.setProvider(this.provider);
    ERC20.setProvider(this.provider);
  }

  /****************************************
  * Set Registry Functions
  ****************************************/

  /**
   *  Sets the Set Registry address that we want to use. This can be set before usage with Registry
   *  NOTE: In our current setup, we are dealing with a single registry. Thus, we are allowing users
   *  to set their registry. In the future, we may want to allow users to specify the registry in 
   *  each of the functions
   */
  async updateSetRegistryAddress(setRegistryAddress) {
    this.setRegistryAddress = setRegistryAddress;
    this.setRegistryInstance = await SetRegistryContract.at(setRegistryAddress); 
  }

  /**
   * Fetches all the {Set}s from the Registry, fetches metadata about each component token
   * from each Set token, and gets the token supply for each {Set}.
   * @return  A list of sets full of information from the Registry
   * let sets = [{
   *   address: "0x5259742d812cfec2a12bc1969506e75926e092cb"
   *   component: [
   *     {address: "0x0a18ad43a9dc991db9401ee7ac5aad0a3b219159", quantity: "1", name: "Token A", symbol: "A"},
   *     {address: "0xe42464cbc4c077d1534b5323636c77e829161ef0", quantity: "1", name: "Token B", symbol: "B"}
   *   ],
   *   name: "FelixABSet",
   *   symbol: 'FELIX',
   *   supply: 100
   * }];
   */
  async getSetsFromRegistryAsync() {
    let results = [];

    const setAddresses = await this.setRegistryInstance.getSetAddresses();

    // For each set, get the set metadata, supply, and component info
    async function processSet(setAddress) {
      let metadata = await this.getSetMetadataFromRegistryAsync(setAddress);
      results.push(await this.convertSetMetadataToObjectForm(metadata));
    }

    const setsToProcess = setAddresses.map(processSet.bind(this));
    await Promise.all(setsToProcess);
    return results;    
  }

  /**
   *  Sets the Set Registry address that we want to use. This can be set before usage with Registry
   *  Requires that the {Set} registry address has already been set.
   */
  async createSetFromRegistryAsync(tokens, units, name, symbol, account) {
    const createReceipt = await this.setRegistryInstance.create(tokens, units, name, symbol, { from: account });
    return createReceipt;
  }

  /**
   *  Removes an existing {Set} from the registry
   */
  async removeSetFromRegistryAsync(setAddress, account) {
    const listOfSets = await this.getSetAddressesFromRegistryAsync();
    const setAddressIndex = _.findIndex(listOfSets, set => set === setAddress);

    const removeReceipt = await this.setRegistryInstance.remove(setAddress, setAddressIndex, { from: account });
    return removeReceipt;
  }

  /**
   *  Retrieves the list of all {Set} addresses from the {Set} registry
   *  Requires that the {Set} registry address has already been set.
   */
  async getSetAddressesFromRegistryAsync() {
    const setAddresses = await this.setRegistryInstance.getSetAddresses();
    return setAddresses;
  }

  /**
   *  Retrieves the {Set} metadata from the {Set} registry
   *  Requires that the {Set} registry address has already been set.   
   */
  async getSetMetadataFromRegistryAsync(setAddress) {
    const setMetadata = await this.setRegistryInstance.getSetMetadata(setAddress);
    return setMetadata;  
  }

  /**
   *  Retrieves the list of all logs for an address from the {Set} registry
   *  Requires that the {Set} registry address has already been set.   
   */
  async getSetRegistryLogsForUserAsync(userAddress) {
    const setRegistryEvents = await this.setRegistryInstance.allEvents({
      fromBlock: 0,
      toBlock: 'latest',
      from: userAddress,
    });
    const logs = await Utils.getLogsAsync(setRegistryEvents);
    return _.sortBy(logs, 'blockNumber');
  }

  /**
   *  Takes an array of set metadata retrieved from the {Set} contract
   *  @param   setMetadata    An array formatted piece of metadata from a {Set}
   *  The input expected is of the following shape:
   *  [
   *     address, // set address
   *     string, // name;
   *     string, // symbol;
   *     address[], // component tokens;
   *     uint[] // component units;      
   *  ] 
   *  @return   set  An object that follows the following shape:
   *  {
   *   address: "0x5259742d812cfec2a12bc1969506e75926e092cb"
   *   component: [
   *     {address: "0x0a18ad43a9dc991db9401ee7ac5aad0a3b219159", quantity: "1", name: "Token A", symbol: "A"},
   *     {address: "0xe42464cbc4c077d1534b5323636c77e829161ef0", quantity: "1", name: "Token B", symbol: "B"}
   *   ],
   *   name: "FelixABSet",
   *   symbol: 'FELIX',
   *   supply: 100
   *  }
   */
  async convertSetMetadataToObjectForm(setMetadata) {
    let setAddress = setMetadata[0];
    let tokens = setMetadata[3];
    let units = setMetadata[4];
    let supply = await this.getSetTotalSupply(setAddress);
    
    let components = [];

    // Function that takes a token and retrieves pertinent 
    // information and adds it to the components array
    async function processToken(token, index) {
      let [name, symbol] = await Promise.all([
        this.getTokenName(token),
        this.getTokenSymbol(token),
      ]);

      components.push({
        address: token,
        quantity: units[index].toString(),
        name,
        symbol,
      });
    }

    const tokensToProcess = tokens.map(processToken.bind(this));
    await Promise.all(tokensToProcess);

    return {
      address: setAddress,
      name: setMetadata[1],
      symbol: setMetadata[2],
      supply,
      components,
    }
  }

  /****************************************
  * Set Token Functions
  ****************************************/

  /**
   *  Issues a particular quantity of tokens from a particular {Set}s
   *  Note: all the tokens in the {Set} must be approved before you can successfully 
   *  issue the desired quantity of {Set}s
   */
  async issueSetAsync(setAddress, quantityInWei, account) {
    let setTokenInstance = await SetTokenContract.at(setAddress);
    const issueReceipt = await setTokenInstance.issue(quantityInWei, { from: account });

    return issueReceipt;
  }

  /**
   *  Redeems a particular quantity of tokens from a particular {Set}s
   */
  async redeemSetAsync(setAddress, quantityInWei, account) {
    let setTokenInstance = await SetTokenContract.at(setAddress);
    const redeemReceipt = await setTokenInstance.redeem(quantityInWei, { from: account });

    return redeemReceipt;  
  }

  /**
   *  Retrieves the totalSupply or quantity of tokens of an existing {Set}
   */
  async getSetTotalSupply(setAddress) {
    let setTokenInstance = await SetTokenContract.at(setAddress);
    let totalSupply = await setTokenInstance.totalSupply();

    return totalSupply;
  }

  /**
   *  Retrieves the list of all logs for an address from the {Set} registry
   *  Requires that the {Set} registry address has already been set.   
   */
  async getSetLogsForUserAsync(setAddress, userAddress) {
    let setTokenInstance = await SetTokenContract.at(setAddress);
    const setLogs = await setTokenInstance.allEvents({
      fromBlock: 2000000,
      toBlock: 'latest',
      _sender: userAddress,
    });
    return setLogs;
  }

  /**
   *  Retrieves the list of sorted logs for a list of set addresses
   */
  async getSetLogsForMultipleSetsUserAsync(setAddresses, userAddress) {
    let results = [];
    async function getSetLogsForToken(setAddress) {
      const events = await this.getSetLogsForUserAsync(setAddress, userAddress);
      const eventLogs = await Utils.getLogsAsync(events);
      _.each(eventLogs, event => results.push(event));
    }

    const setsToProcess = setAddresses.map(getSetLogsForToken.bind(this));
    await Promise.all(setsToProcess);
    return _.sortBy(results, 'blockNumber');
  }

  /****************************************
  * ERC20 Token Functions
  ****************************************/

  /**
   *  Retrieves the token name of an ERC20 token
   */
  async getTokenName(tokenAddress) {
    let tokenInstance = await ERC20.at(tokenAddress);
    let tokenName = await tokenInstance.name();

    return tokenName;
  }

  /**
   *  Retrieves the token symbol of an ERC20 token
   */
  async getTokenSymbol(tokenAddress) {
    let tokenInstance = await ERC20.at(tokenAddress);
    let tokenSymbol = await tokenInstance.symbol();

    return tokenSymbol;
  }

  /**
   *  Retrieves the balance in wei of an ERC20 token for a user
   */
  async getUserBalance(tokenAddress, userAddress) {
    let tokenInstance = await ERC20.at(tokenAddress);
    let userBalance = await tokenInstance.balanceOf(userAddress);

    return userBalance;
  }

  /**
   *  Given a list of tokens, retrieves the user balance as well as token metadata
   */
  async getUserBalancesForTokens(tokenAddresses, userAddress) {
    let results = [];

    // For each token, get all the token metadata
    async function getUserBalanceAndAddtoResults(tokenAddress) {
      let token = { address: tokenAddress };
      let tokenPromises = [
        this.getTokenName(tokenAddress),
        this.getTokenSymbol(tokenAddress),
        this.getUserBalance(tokenAddress, userAddress)
      ];
      let tokenPromiseResults = await Promise.all(tokenPromises);
      token.name = tokenPromiseResults[0];
      token.symbol = tokenPromiseResults[1];
      token.balance = tokenPromiseResults[2];
      results.push(token);
    }

    const tokensToProcess = tokenAddresses.map(getUserBalanceAndAddtoResults.bind(this));
    await Promise.all(tokensToProcess);
    return results;    
  }
}

export default SetProtocol
