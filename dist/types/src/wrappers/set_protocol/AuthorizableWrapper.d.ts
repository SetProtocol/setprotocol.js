import Web3 from 'web3';
import { Address } from '../../types/common';
/**
 * @title  AuthorizableWrapper
 * @author Set Protocol
 *
 * The AuthorizableWrapper handles all functions and states related to authorizable contracts
 *
 */
export declare class AuthorizableWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Fetches an array of authorized addresses for the autorized contract
     *
     * @param  authorizableContract Address of the contract
     * @return                      A list of authorized addresses
     */
    getAuthorizedAddresses(authorizableContract: Address): Promise<Address[]>;
}
