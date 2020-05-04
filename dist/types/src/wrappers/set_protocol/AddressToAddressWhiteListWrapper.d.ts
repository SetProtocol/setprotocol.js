import Web3 from 'web3';
import { Address } from '../../types/common';
/**
 * @title  AddressToAddressWhiteListWrapper
 * @author Set Protocol
 *
 * The AddressToAddressWhiteListWrapper handles all functions and states related to authorizable contracts
 *
 */
export declare class AddressToAddressWhiteListWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Fetches the valid addresses in the whitelist contract
     *
     * @param  whitelistContract    Address of the contract
     * @return                      A list of whitelisted addresses
     */
    validAddresses(whitelistContract: Address): Promise<Address[]>;
    /**
     * Fetches the value type addresses for a given array of keys
     *
     * @param  keys                 Key type addresses to fetch mapping for
     * @return                      An array of value type addresses
     */
    getValues(whitelistContract: Address, keys: Address[]): Promise<Address[]>;
}
