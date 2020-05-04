import Web3 from 'web3';
import { Address } from '../../types/common';
import { BigNumber } from '../../util';
/**
 * @title  SetTokenWrapper
 * @author Set Protocol
 *
 * The Set Token API handles all functions on the Set Token smart contract.
 *
 */
export declare class SetTokenWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Gets the Set's origin factory
     *
     * @param  setAddress Address of the Set
     * @return            The factory address
     */
    factory(setAddress: Address): Promise<Address>;
    /**
     * Gets component tokens that make up the Set
     *
     * @param  setAddress Address of the Set
     * @return            An array of addresses
     */
    getComponents(setAddress: Address): Promise<Address[]>;
    /**
     * Gets natural unit of the Set
     *
     * @param  setAddress Address of the Set
     * @return            The natural unit of the Set
     */
    naturalUnit(setAddress: Address): Promise<BigNumber>;
    /**
     * Gets units of each component token that make up the Set
     *
     * @param  setAddress Address of the Set
     * @return            An array of units that make up the Set composition which
     *                    correspond to the component tokens in the Set
     */
    getUnits(setAddress: Address): Promise<BigNumber[]>;
}
