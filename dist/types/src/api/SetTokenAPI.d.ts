import Web3 from 'web3';
import { Assertions } from '../assertions';
import { BigNumber } from '../util';
import { Address, Component, SetDetails } from '../types/common';
/**
 * @title SetTokenAPI
 * @author Set Protocol
 *
 * A library for interacting with SetToken contracts
 */
export declare class SetTokenAPI {
    private web3;
    private assert;
    private setToken;
    private erc20;
    /**
     * Instantiates a new SetTokenAPI instance that contains methods for interacting with SetToken contracts
     *
     * @param web3        Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param assertions  An instance of the Assertion library
     */
    constructor(web3: Web3, assertions: Assertions);
    /**
     * Calculates the required amount of a component token required for issuance or redemption for a quantity of the Set
     *
     * @param  setAddress          Address of the Set
     * @param  componentAddress    Address of the component
     * @param  quantity            Quantity of Set to issue or redeem
     * @return                     Amount of `componentAddress` required for issuance or redemption
     */
    calculateComponentAmountForIssuanceAsync(setAddress: Address, componentAddress: Address, quantity: BigNumber): Promise<BigNumber>;
    /**
     * Calculates the amounts of each component required for issuance or redemption for a quantity of the Set
     *
     * @param  setAddress     Address of the Set
     * @param  quantity       Quantity of Set to issue or redeem
     * @return                List of objects conforming to `Component` interface with addresses and amounts required for
     *                          issuance or redemption
     */
    calculateComponentAmountsForIssuanceAsync(setAddress: Address, quantity: BigNumber): Promise<Component[]>;
    /**
     * Fetches the address of the factory that created the Set
     *
     * @param  setAddress    Address of the Set
     * @return               Address of the factory that ceated the Set
     */
    getFactoryAsync(setAddress: Address): Promise<Address>;
    /**
     * Fetches the addresses of the component tokens that make up the Set
     *
     * @param  setAddress    Address of the Set
     * @return               An array of token addresses
     */
    getComponentsAsync(setAddress: Address): Promise<Address[]>;
    /**
     * Fetches the natural unit of the Set
     *
     * @param  setAddress    Address of the Set
     * @return               Natural unit of the Set
     */
    getNaturalUnitAsync(setAddress: Address): Promise<BigNumber>;
    /**
     * Fetches units of each component token that make up the Set
     *
     * @param  setAddress    Address of the Set
     * @return               An array of units that make up the Set composition which correspond to the component tokens
     *                         in the Set
     */
    getUnitsAsync(setAddress: Address): Promise<BigNumber[]>;
    /**
     * Fetches details of a Set comprised of factory address, name, symbol, natural unit, component addresses,
     * and component units
     *
     * @param  setAddress    Address of the Set
     * @return               Object conforming to `SetDetails` interface
     */
    getDetailsAsync(setAddress: Address): Promise<SetDetails>;
    /**
     * Validates whether the quantity of a Set to issue or redeem in is a multiple of the Set's natural unit
     *
     * @param  setAddress    Address of the Set
     * @param  quantity      Quantity to be checked
     * @return boolean       Boolean representing whether the Set is a multiple of the natural unit
     *
     */
    isMultipleOfNaturalUnitAsync(setAddress: Address, quantity: BigNumber): Promise<boolean>;
    private assertIsMultipleOfNaturalUnitAsync;
    private assertcalculateComponentAmountsForIssuance;
    private assertCalculateUnitTransferred;
}
