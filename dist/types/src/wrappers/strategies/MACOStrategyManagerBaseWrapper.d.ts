import Web3 from 'web3';
import { StrategyContractWrapper } from './StrategyContractWrapper';
import { BigNumber } from '../../util';
import { Address, Tx } from '../../types/common';
/**
 * @title  MACOStrategyManagerBaseWrapper
 * @author Set Protocol
 *
 * The MACOStrategyManagerBaseWrapper handles all functions shared on the MACOStrategyManager
 * V1 and V2 smart contract.
 *
 */
export declare class MACOStrategyManagerBaseWrapper {
    protected web3: Web3;
    protected contracts: StrategyContractWrapper;
    constructor(web3: Web3);
    /**
     * Calls a rebalancing MACO Strategy manager's intialPropose function. This function kicks off a propose cycle on the
     * manager by checking that the time and price constraints have been met then logging a timestamp used later in the
     * process to confirm the signal.
     *
     * @param  managerAddress               Address of the rebalancing manager contract
     * @return                              The hash of the resulting transaction.
     */
    initialPropose(managerAddress: Address, txOpts?: Tx): Promise<string>;
    /**
     * Calls a rebalancing MACO Strategy manager's confirmPropose function. This function again checks to make sure that
     * price and time constraints have been satisfied. After that it generates the new allocation proposal and sends the
     * results to the Rebalancing Set Token to kick off the official rebalance.
     *
     * @param  managerAddress               Address of the rebalancing manager contract
     * @return                              The hash of the resulting transaction.
     */
    confirmPropose(managerAddress: Address, txOpts?: Tx): Promise<string>;
    coreAddress(managerAddress: Address): Promise<Address>;
    rebalancingSetTokenAddress(managerAddress: Address): Promise<Address>;
    stableAssetAddress(managerAddress: Address): Promise<Address>;
    riskAssetAddress(managerAddress: Address): Promise<Address>;
    stableCollateralAddress(managerAddress: Address): Promise<Address>;
    riskCollateralAddress(managerAddress: Address): Promise<Address>;
    setTokenFactory(managerAddress: Address): Promise<Address>;
    auctionLibrary(managerAddress: Address): Promise<Address>;
    movingAverageDays(managerAddress: Address): Promise<BigNumber>;
    lastCrossoverConfirmationTimestamp(managerAddress: Address): Promise<BigNumber>;
    crossoverConfirmationMinTime(managerAddress: Address): Promise<BigNumber>;
    crossoverConfirmationMaxTime(managerAddress: Address): Promise<BigNumber>;
    auctionTimeToPivot(managerAddress: Address): Promise<BigNumber>;
}
