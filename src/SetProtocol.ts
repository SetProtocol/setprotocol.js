import contract from 'truffle-contract';


const SetRegistryContract = contract(require('./contracts/SetRegistry.json'));
const SetTokenContract = contract(require('./contracts/SetToken.json'));
const ERC20 = contract(require('./contracts/ERC20.json'));

/**
 * The SetProtocol class is the single entry-point into the SetProtocol library. 
 * It contains all of the library's functionality
 * and all calls to the library should be made through a SetProtocol instance.
 */
class SetProtocol {
  // eslint-disable-next-line
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
         {address: "0x0a18ad43a9dc991db9401ee7ac5aad0a3b219159", quantity: "1", name: "Token A", symbol: "A"},
         {address: "0xe42464cbc4c077d1534b5323636c77e829161ef0", quantity: "1", name: "Token B", symbol: "B"}
       ],
       name: "FelixABSet",
       symbol: 'FELIX',
       supply: 100
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
   */
  async createSetFromRegistryAsync(tokens, units, name, symbol, account) {
    const createReceipt = await this.setRegistryInstance.create(tokens, units, name, symbol, { from: account });
    return createReceipt;
  }

  async getSetAddressesFromRegistryAsync() {
    const setAddresses = await this.setRegistryInstance.getSetAddresses();
    return setAddresses;
  }

  async getSetMetadataFromRegistryAsync(setAddress) {
    const setMetadata = await this.setRegistryInstance.getSetMetadata(setAddress);
    return setMetadata;  
  }

  async convertSetMetadataToObjectForm(setMetadata) {
    // Merge tokens and units
    let setAddress = setMetadata[0];
    let tokens = setMetadata[3];
    let units = setMetadata[4];
    let supply = await this.getSetTotalSupply(setAddress);
    
    let components = [];

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
      address: setMetadata[0],
      name: setMetadata[1],
      symbol: setMetadata[2],
      supply: supply,
      components,
    }
  }

  /****************************************
  * Set Token Functions
  ****************************************/

  async issueSetAsync(setAddress, quantityInWei, account) {
    let setTokenInstance = await SetTokenContract.at(setAddress);
    const issueReceipt = await setTokenInstance.issue(quantityInWei, { from: account });

    return issueReceipt;
  }

  async redeemSetAsync(setAddress, quantityInWei, account) {
    let setTokenInstance = await SetTokenContract.at(setAddress);
    const redeemReceipt = await setTokenInstance.redeem(quantityInWei, { from: account });

    return redeemReceipt;  
  }

  async getSetTotalSupply(setAddress) {
    let setTokenInstance = await SetTokenContract.at(setAddress);
    let totalSupply = await setTokenInstance.totalSupply();

    return totalSupply;
  }

  /****************************************
  * ERC20 Token Functions
  ****************************************/

  async getTokenName(tokenAddress) {
    let tokenInstance = await ERC20.at(tokenAddress);
    let tokenName = await tokenInstance.name();

    return tokenName;
  }

  async getTokenSymbol(tokenAddress) {
    let tokenInstance = await ERC20.at(tokenAddress);
    let tokenSymbol = await tokenInstance.symbol();

    return tokenSymbol;
  }
}

export default SetProtocol
