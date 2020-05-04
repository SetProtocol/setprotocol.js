import Web3 from 'web3';
import { Address } from '../../types/common';
import { MACOStrategyManagerBaseWrapper } from './MACOStrategyManagerBaseWrapper';
/**
 * @title  MACOStrategyManagerV2Wrapper
 * @author Set Protocol
 *
 * The MACOStrategyManagerV2Wrapper handles all functions on the MACOStrategyManagerV2 smart contract.
 *
 */
export declare class MACOStrategyManagerV2Wrapper extends MACOStrategyManagerBaseWrapper {
    constructor(web3: Web3);
    movingAveragePriceFeed(managerAddress: Address): Promise<Address>;
    riskAssetOracle(managerAddress: Address): Promise<Address>;
}
