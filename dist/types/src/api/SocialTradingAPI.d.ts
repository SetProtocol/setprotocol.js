import Web3 from 'web3';
import { BigNumber } from '../util';
import { Assertions } from '../assertions';
import { Address, Bytes, FeeType, SetProtocolConfig, Tx, EntryFeePaid, RebalanceFeePaid } from '../types/common';
import { NewTradingPoolInfo, NewTradingPoolV2Info, PerformanceFeeInfo, TradingPoolAccumulationInfo, TradingPoolRebalanceInfo } from '../types/strategies';
/**
 * @title SocialTradingAPI
 * @author Set Protocol
 *
 * A library for interacting with Social Trading contracts
 */
export declare class SocialTradingAPI {
    private web3;
    private assert;
    private protocolViewer;
    private socialTradingManager;
    private socialTradingManagerV2;
    private rebalancingSetV2;
    private rebalancingSetV3;
    private performanceFeeCalculator;
    /**
     * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
     *
     * @param web3          The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param assertions    An instance of the Assertion library
     * @param config        Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    constructor(web3: Web3, assertions: Assertions, config: SetProtocolConfig);
    /**
     * Calls SocialTradingManager's createTradingPool function. This function creates a new tradingPool for
     * the sender. Creates collateral Set and RebalancingSetTokenV2 then stores data relevant for updating
     * allocations in mapping indexed by created RebalancingSetTokenV2 address.
     *
     * @param  manager                        Address of the social trading manager contract
     * @param  allocatorAddress               Address of allocator to be used for pool, proxy for trading pair
     * @param  startingBaseAssetAllocation    Starting base asset allocation of tradingPool
     * @param  startingUSDValue               Starting USD value of one share of tradingPool
     * @param  tradingPoolName                Name of tradingPool as appears on RebalancingSetTokenV2
     * @param  tradingPoolSymbol              Symbol of tradingPool as appears on RebalancingSetTokenV2
     * @param  liquidator                     Address of liquidator contract
     * @param  feeRecipient                   Address receiving fees from contract
     * @param  feeCalculator                  Rebalance fee calculator being used
     * @param  rebalanceInterval              Time required between rebalances
     * @param  failAuctionPeriod              Time before auction can be failed
     * @param  lastRebalanceTimestamp         Passed time of last rebalance
     * @param  entryFee                       Trading Pool entrance fee
     * @param  rebalanceFee                   Trading Pool rebalance fee
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                The hash of the resulting transaction.
     */
    createTradingPoolAsync(manager: Address, allocatorAddress: Address, startingBaseAssetAllocation: BigNumber, startingUSDValue: BigNumber, tradingPoolName: string, tradingPoolSymbol: string, liquidator: Address, feeRecipient: Address, feeCalculator: Address, rebalanceInterval: BigNumber, failAuctionPeriod: BigNumber, lastRebalanceTimestamp: BigNumber, entryFee: BigNumber, rebalanceFee: BigNumber, txOpts: Tx): Promise<string>;
    /**
     * Calls SocialTradingManager's createTradingPool function. This function creates a new tradingPool for
     * the sender. Creates collateral Set and RebalancingSetTokenV2 then stores data relevant for updating
     * allocations in mapping indexed by created RebalancingSetTokenV2 address.
     *
     * @param  manager                        Address of the social trading manager contract
     * @param  allocatorAddress               Address of allocator to be used for pool, proxy for trading pair
     * @param  startingBaseAssetAllocation    Starting base asset allocation of tradingPool
     * @param  startingUSDValue               Starting USD value of one share of tradingPool
     * @param  tradingPoolName                Name of tradingPool as appears on RebalancingSetTokenV2
     * @param  tradingPoolSymbol              Symbol of tradingPool as appears on RebalancingSetTokenV2
     * @param  liquidator                     Address of liquidator contract
     * @param  feeRecipient                   Address receiving fees from contract
     * @param  feeCalculator                  Rebalance fee calculator being used
     * @param  rebalanceInterval              Time required between rebalances
     * @param  failAuctionPeriod              Time before auction can be failed
     * @param  lastRebalanceTimestamp         Passed time of last rebalance
     * @param  entryFee                       Trading Pool entrance fee
     * @param  streamingFee                   Trading Pool streaming fee
     * @param  profitFee                      Trading Pool profit fee
     * @param  profitFeePeriod                Period between actualizing profit fees
     * @param  highWatermarkResetPeriod       Time between last profit fee actualization before high watermark
     *                                        can be reset
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                The hash of the resulting transaction.
     */
    createTradingPoolV2Async(manager: Address, allocatorAddress: Address, startingBaseAssetAllocation: BigNumber, startingUSDValue: BigNumber, tradingPoolName: string, tradingPoolSymbol: string, liquidator: Address, feeRecipient: Address, feeCalculator: Address, rebalanceInterval: BigNumber, failAuctionPeriod: BigNumber, lastRebalanceTimestamp: BigNumber, entryFee: BigNumber, profitFeePeriod: BigNumber, highWatermarkResetPeriod: BigNumber, profitFee: BigNumber, streamingFee: BigNumber, txOpts: Tx): Promise<string>;
    /**
     * Calls SocialTradingManager's updateAllocation function. This function creates a new collateral Set and
     * calls startRebalance on RebalancingSetTokenV2. Updates allocation state on Manager contract.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  newAllocation          New allocation amount in base asset percentage
     * @param  liquidatorData         Arbitrary bytes data passed to liquidator
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    updateAllocationAsync(manager: Address, tradingPool: Address, newAllocation: BigNumber, liquidatorData: Bytes, txOpts: Tx): Promise<string>;
    /**
     * Calls tradingPool to accrue fees to manager.
     *
     * @param  tradingPool        Address of tradingPool
     * @return                    The hash of the resulting transaction.
     */
    actualizeFeesAsync(tradingPool: Address, txOpts: Tx): Promise<string>;
    /**
     * Calls manager to adjustFees for tradingPool
     *
     * @param  manager                  Address of manager
     * @param  tradingPool              Address of tradingPool
     * @param  newFeeType               Type of fee being changed
     * @param  newFeePercentage         New fee percentage
     * @return                          The hash of the resulting transaction.
     */
    adjustPerformanceFeesAsync(manager: Address, tradingPool: Address, newFeeType: FeeType, newFeePercentage: BigNumber, txOpts: Tx): Promise<string>;
    /**
     * Cancels previous fee adjustment (before enacted)
     *
     * @param  manager                  Address of manager
     * @param  tradingPool              Address of tradingPool
     * @param  upgradeHash              Hash of the inital fee adjustment call data
     * @return                          The hash of the resulting transaction.
     */
    removeFeeUpdateAsync(manager: Address, tradingPool: Address, upgradeHash: string, txOpts: Tx): Promise<string>;
    /**
     * Calls SocialTradingManager's initiateEntryFeeChange function. Starts entry fee update process.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  newEntryFee            New entry fee
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    initiateEntryFeeChangeAsync(manager: Address, tradingPool: Address, newEntryFee: BigNumber, txOpts: Tx): Promise<string>;
    /**
     * Calls SocialTradingManager's finalizeEntryFeeChangeAsync function. Finalizes entry fee update process if timelock
     * period passes.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    finalizeEntryFeeChangeAsync(manager: Address, tradingPool: Address, txOpts: Tx): Promise<string>;
    /**
     * Calls SocialTradingManager's setTrader function. Passes pool permissions to new address.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  newTrader              New trading pool trader address
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    setTraderAsync(manager: Address, tradingPool: Address, newTrader: Address, txOpts: Tx): Promise<string>;
    /**
     * Calls SocialTradingManager's setLiquidator function. Changes liquidator used in rebalances.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  newLiquidator          New liquidator address
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    setLiquidatorAsync(manager: Address, tradingPool: Address, newLiquidator: Address, txOpts: Tx): Promise<string>;
    /**
     * Calls SocialTradingManager's setFeeRecipient function. Changes feeRecipient address.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  newFeeRecipient        New feeRecipient address
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    setFeeRecipientAsync(manager: Address, tradingPool: Address, newFeeRecipient: Address, txOpts: Tx): Promise<string>;
    /**
     * Returns relevant details of newly created Trading Pools. Return object adheres to the
     * NewTradingPoolInfo interface.
     *
     * @param  tradingPool            Address of tradingPool being updated
     * @return                        NewTradingPoolInfo
     */
    fetchNewTradingPoolDetailsAsync(tradingPool: Address): Promise<NewTradingPoolInfo>;
    /**
     * Returns relevant details of newly created Trading Pools V2 with performance fees. Return object adheres to the
     * NewTradingPoolV2Info interface.
     *
     * @param  tradingPool            Address of tradingPool being updated
     * @return                        NewTradingPoolInfo
     */
    fetchNewTradingPoolV2DetailsAsync(tradingPool: Address): Promise<NewTradingPoolV2Info>;
    /**
     * Returns relevant details of Trading Pools being rebalance. Return object adheres to the
     * TradingPoolRebalanceInfo interface.
     *
     * @param  tradingPool            Address of tradingPool being updated
     * @return                        NewTradingPoolInfo
     */
    fetchTradingPoolRebalanceDetailsAsync(tradingPool: Address): Promise<TradingPoolRebalanceInfo>;
    /**
     * Fetches all trading pool operators for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchTradingPoolOperatorAsync(tradingPoolAddresses: Address[]): Promise<string[]>;
    /**
     * Fetches all entry fees for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchTradingPoolEntryFeesAsync(tradingPoolAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches all rebalance fees for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchTradingPoolRebalanceFeesAsync(tradingPoolAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches all profit and streaming fees for an array of trading pools. Return objects adhere to
     * TradingPoolAccumulationInfo interface
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchTradingPoolAccumulationAsync(tradingPoolAddresses: Address[]): Promise<TradingPoolAccumulationInfo[]>;
    /**
     * Fetches all fee states for an array of trading pools. Return objects adhere to
     * PerformanceFeeInfo interface
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchTradingPoolFeeStateAsync(tradingPoolAddresses: Address[]): Promise<PerformanceFeeInfo[]>;
    /**
     * Fetches EntryFeePaid event logs including information about the transactionHash, rebalancingSetToken,
     * feeRecipient, and feeQuantity.
     *
     * This fetch can be filtered by block.
     *
     * @param  tradingPoolAddress            Address of trading pool to pull events for
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @return                               An array of objects conforming to the EntryFeePaid interface
     */
    fetchEntryFeeEventsAsync(tradingPoolAddress: Address, fromBlock: number, toBlock?: any, getTimestamp?: boolean): Promise<EntryFeePaid[]>;
    /**
     * Fetches RebalanceFeePaid event logs including information about the transactionHash, rebalancingSetToken,
     * rebalanceIndex, feeRecipient, feeQuantity
     *
     * This fetch can be filtered by block.
     *
     * @param  tradingPoolAddress            Address of trading pool to pull events for
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @return                               An array of objects conforming to the RebalanceFeePaid interface
     */
    fetchRebalanceFeePaidEventsAsync(tradingPoolAddress: Address, fromBlock: number, toBlock?: any, getTimestamp?: boolean): Promise<RebalanceFeePaid[]>;
    private createNewTradingPoolObject;
    private createNewTradingPoolV2Object;
    private createTradingPoolRebalanceObject;
    private createTradingPoolAccumulationObject;
    private assertCreateTradingPool;
    private assertCreateTradingPoolV2;
    private assertAddressSetters;
    private assertUpdateAllocation;
    private assertInitiateEntryFeeChange;
    private assertFinalizeEntryFeeChange;
    private assertAdjustFees;
    private assertRemoveFeeUpdate;
    private assertValidAllocation;
    private assertValidFees;
    private assertValidPerformanceFees;
}
