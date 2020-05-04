import Web3 from 'web3';
import { StrategyContractWrapper } from './StrategyContractWrapper';
import { BigNumber } from '../../util';
import { Address, Tx } from '../../types/common';
/**
 * @title  AssetPairManagerWrapper
 * @author Set Protocol
 *
 * The AssetPairManagerWrapper handles all functions on the AssetPairManager contract
 *
 */
export declare class AssetPairManagerWrapper {
    protected web3: Web3;
    protected contracts: StrategyContractWrapper;
    constructor(web3: Web3);
    /**
     * Calls an AssetPairManager's intialPropose function. This function kicks off a propose cycle on the
     * manager by checking that the time and price constraints have been met then logging a timestamp used later in the
     * process to confirm the signal.
     *
     * @param  managerAddress               Address of the rebalancing manager contract
     * @return                              The hash of the resulting transaction.
     */
    initialPropose(managerAddress: Address, txOpts?: Tx): Promise<string>;
    /**
     * Calls an AssetPairManager's confirmPropose function. This function again checks to make sure that
     * price and time constraints have been satisfied. After that it generates the new allocation proposal and sends the
     * results to the Rebalancing Set Token to kick off the official rebalance.
     *
     * @param  managerAddress               Address of the rebalancing manager contract
     * @return                              The hash of the resulting transaction.
     */
    confirmPropose(managerAddress: Address, txOpts?: Tx): Promise<string>;
    /**
     * Calls an AssetPairManager's canInitialPropose function. Returns whether initialPropose can be called
     * without reverting.
     *
     * @param  managerAddress               Address of the rebalancing manager contract
     * @return                              Boolean indicating whether initialPropose can be successfully called
     */
    canInitialPropose(managerAddress: Address): Promise<boolean>;
    /**
     * Calls an AssetPairManager's canConfirmPropose function. Returns whether confirmPropose can be called
     * without reverting.
     *
     * @param  managerAddress               Address of the rebalancing manager contract
     * @return                              Boolean indicating whether confirmPropose can be successfully called
     */
    canConfirmPropose(managerAddress: Address): Promise<boolean>;
    core(managerAddress: Address): Promise<Address>;
    allocator(managerAddress: Address): Promise<Address>;
    trigger(managerAddress: Address): Promise<Address>;
    auctionLibrary(managerAddress: Address): Promise<Address>;
    rebalancingSetToken(managerAddress: Address): Promise<Address>;
    baseAssetAllocation(managerAddress: Address): Promise<BigNumber>;
    allocationDenominator(managerAddress: Address): Promise<BigNumber>;
    bullishBaseAssetAllocation(managerAddress: Address): Promise<BigNumber>;
    bearishBaseAssetAllocation(managerAddress: Address): Promise<BigNumber>;
    auctionStartPercentage(managerAddress: Address): Promise<BigNumber>;
    auctionPivotPercentage(managerAddress: Address): Promise<BigNumber>;
    auctionTimeToPivot(managerAddress: Address): Promise<BigNumber>;
    signalConfirmationMinTime(managerAddress: Address): Promise<BigNumber>;
    signalConfirmationMaxTime(managerAddress: Address): Promise<BigNumber>;
    recentInitialProposeTimestamp(managerAddress: Address): Promise<BigNumber>;
}
