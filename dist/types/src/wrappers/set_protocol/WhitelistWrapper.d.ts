import Web3 from 'web3';
import { Address } from '../../types/common';
/**
 * @title  WhitelistWrapper
 * @author Set Protocol
 *
 * The WhitelistWrapper handles all functions and states related to authorizable contracts
 *
 */
export declare class WhitelistWrapper {
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
}
