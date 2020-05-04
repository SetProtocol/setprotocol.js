import Web3 from 'web3';
import { Address } from '../../types/common';
/**
 * @title  RebalancingSetTokenV2Wrapper
 * @author Set Protocol
 *
 * The Rebalancing Set Token V2 API handles all functions on the Rebalancing Set Token V2 smart contract.
 *
 */
export declare class RebalancingSetTokenV2Wrapper {
    private web3;
    constructor(web3: Web3);
    /**
     * Asynchronously retrieve EntryFeePaid events from the specified Rebalancing Set Token V2
     *
     * @param  rebalancingSetToken           Address of rebalancing set token to retrieve events from
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @return                               An array of raw events
     */
    entryFeePaidEvent(rebalancingSetToken: Address, fromBlock: number, toBlock?: any): Promise<any>;
    /**
     * Asynchronously retrieve RebalanceStarted events from the specified Rebalancing Set Token V2
     *
     * @param  rebalancingSetToken           Address of rebalancing set token to retrieve events from
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @return                               An array of raw events
     */
    rebalanceStartedEvent(rebalancingSetToken: Address, fromBlock: number, toBlock?: any): Promise<any>;
    /**
     * Asynchronously retrieve RebalanceSettled events from the specified Rebalancing Set Token V2
     *
     * @param  rebalancingSetToken           Address of rebalancing set token to retrieve events from
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @return                               An array of raw events
     */
    rebalanceSettledEvent(rebalancingSetToken: Address, fromBlock: number, toBlock?: any): Promise<any>;
}
