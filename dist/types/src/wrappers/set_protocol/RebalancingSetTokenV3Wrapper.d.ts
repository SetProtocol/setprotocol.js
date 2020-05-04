import Web3 from 'web3';
import { Address, Tx } from '../../types/common';
/**
 * @title  RebalancingSetTokenV3Wrapper
 * @author Set Protocol
 *
 * The Rebalancing Set Token V3 API contains interfaces for interacting with fee accrual functions.
 */
export declare class RebalancingSetTokenV3Wrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Starts rebalance after proposal period has elapsed
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  txOpts                  Transaction options
     * @return                         Transaction hash
     */
    actualizeFee(rebalancingSetAddress: Address, txOpts: Tx): Promise<string>;
}
