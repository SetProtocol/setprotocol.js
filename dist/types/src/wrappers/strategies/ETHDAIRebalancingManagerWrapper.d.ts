import Web3 from 'web3';
import { BigNumber } from '../../util';
import { Address, Tx } from '../../types/common';
/**
 * @title  ETHDAIRebalancingManagerWrapper
 * @author Set Protocol
 *
 * The ETHDAIRebalancingManagerWrapper API handles all functions on the ETHDAIRebalancingManager smart contract.
 *
 */
export declare class ETHDAIRebalancingManagerWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Calls a rebalancing ETHDAI rebalancing manager's propose function. This function deploys a new Set token
     * and calls the underling rebalancing set token's propose function with fixed parameters and the new deployed Set.
     *
     * @param  managerAddress               Address of the rebalancing manager contract
     * @param  rebalancingSetTokenAddress   Address of the set to be rebalanced (must be managed by the manager address)
     * @return                              The hash of the resulting transaction.
     */
    propose(managerAddress: Address, rebalancingSetTokenAddress: Address, txOpts?: Tx): Promise<string>;
    core(managerAddress: Address): Promise<Address>;
    ethPriceFeed(managerAddress: Address): Promise<Address>;
    ethAddress(managerAddress: Address): Promise<Address>;
    daiAddress(managerAddress: Address): Promise<Address>;
    setTokenFactory(managerAddress: Address): Promise<Address>;
    ethMultiplier(managerAddress: Address): Promise<BigNumber>;
    daiMultiplier(managerAddress: Address): Promise<BigNumber>;
    maximumLowerThreshold(managerAddress: Address): Promise<BigNumber>;
    minimumUpperThreshold(managerAddress: Address): Promise<BigNumber>;
    auctionLibrary(managerAddress: Address): Promise<Address>;
    auctionTimeToPivot(managerAddress: Address): Promise<BigNumber>;
}
