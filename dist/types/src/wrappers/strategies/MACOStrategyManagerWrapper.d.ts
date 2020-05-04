import Web3 from 'web3';
import { Address } from '../../types/common';
import { MACOStrategyManagerBaseWrapper } from './MACOStrategyManagerBaseWrapper';
/**
 * @title  MACOStrategyManagerWrapper
 * @author Set Protocol
 *
 * The MACOStrategyManagerWrapper handles all functions on the MACOStrategyManager smart contract.
 *
 */
export declare class MACOStrategyManagerWrapper extends MACOStrategyManagerBaseWrapper {
    constructor(web3: Web3);
    movingAveragePriceFeed(managerAddress: Address): Promise<Address>;
}
