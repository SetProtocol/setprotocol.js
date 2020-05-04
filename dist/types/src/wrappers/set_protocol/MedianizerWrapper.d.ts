import Web3 from 'web3';
import { Address } from '../../types/common';
import { Bytes } from 'set-protocol-utils';
/**
 * @title  MedianizerWrapper
 * @author Set Protocol
 *
 * The MedianizerWrapper handles all functions on the Medianzer smart contracts.
 *
 */
export declare class MedianizerWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Fetch current price on the medianizer
     *
     * @return            Hex representation of the current price on the medianizer
     */
    read(medianizerAddress: Address): Promise<Bytes>;
}
