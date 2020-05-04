import Web3 from 'web3';
import { BigNumber } from '../util';
import { Assertions } from '../assertions';
import { Address, SetProtocolConfig, Tx } from '../types/common';
import { AssetPairManagerDetails, BTCDAIRebalancingManagerDetails, BTCETHRebalancingManagerDetails, ETHDAIRebalancingManagerDetails, MovingAverageManagerDetails } from '../types/strategies';
/**
 * @title RebalancingManagerAPI
 * @author Set Protocol
 *
 * A library for interacting with Rebalancing Manager
 */
export declare class RebalancingManagerAPI {
    private assert;
    private setToken;
    private rebalancingSetToken;
    private medianizer;
    private movingAverageOracleWrapper;
    private protocolViewer;
    private btcEthRebalancingManager;
    private btcDaiRebalancingManager;
    private ethDaiRebalancingManager;
    private macoStrategyManager;
    private macoStrategyManagerV2;
    private assetPairManager;
    /**
     * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
     *
     * @param web3          The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param assertions    An instance of the Assertion library
     */
    constructor(web3: Web3, assertions: Assertions, config: SetProtocolConfig);
    /**
     * Calls the propose function on a specified rebalancing manager and rebalancing set token.
     * This function will generate a new set token using data from the btc and eth price feeds and ultimately generate
     * a proposal on the rebalancing set token.
     *
     * @param  managerType           BigNumber indicating which kind of manager is being called
     * @param  rebalancingManager    Address of the BTCETH Rebalancing Manager contract
     * @param  rebalancingSet        Rebalancing Set to call propose on
     * @param  txOpts                Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                       Transaction hash
     */
    proposeAsync(managerType: BigNumber, rebalancingManager: Address, rebalancingSet: Address, txOpts: Tx): Promise<string>;
    /**
     * This function is callable by anyone to advance the state of the Moving Average Crossover (MACO) manager.
     * To successfully call propose, the rebalancing Set must be in a rebalancable state and there must
     * be a crossover between the current price and the moving average oracle.
     * To successfully generate a proposal, this function needs to be called twice. The initial call is to
     * note that a crossover has occurred. The second call is to confirm the signal (must be called 6-12 hours)
     * after the initial call. When the confirmPropose is called, this function will generate
     * a proposal on the rebalancing set token.
     *
     * @param  macoManager   Address of the Moving Average Crossover Manager contract
     * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return               Transaction hash
     */
    initiateCrossoverProposeAsync(managerType: BigNumber, macoManager: Address, txOpts: Tx): Promise<string>;
    confirmCrossoverProposeAsync(managerType: BigNumber, macoManager: Address, txOpts: Tx): Promise<string>;
    /**
     * Fetches if initialPropose can be called without revert on AssetPairManager
     *
     * @param  manager         Address of AssetPairManager contract
     * @return                 Boolean if initialPropose can be called without revert
     */
    canInitialProposeAsync(manager: Address): Promise<boolean>;
    /**
     * Fetches if confirmPropose can be called without revert on AssetPairManager
     *
     * @param  manager         Address of AssetPairManager contract
     * @return                 Boolean if confirmPropose can be called without revert
     */
    canConfirmProposeAsync(manager: Address): Promise<boolean>;
    /**
     * Fetches the lastCrossoverConfirmationTimestamp of the Moving Average Crossover Manager contract.
     *
     * @param  macoManager         Address of the Moving Average Crossover Manager contract
     * @return                     BigNumber containing the lastCrossoverConfirmationTimestamp
     */
    getLastCrossoverConfirmationTimestampAsync(managerType: BigNumber, manager: Address): Promise<BigNumber>;
    /**
     * Fetches the state variables of the BTCETH Rebalancing Manager contract.
     *
     * @param  rebalancingManager    Address of the BTCETH Rebalancing Manager contract
     * @return                       Object containing the state information related to the rebalancing manager
     */
    getBTCETHRebalancingManagerDetailsAsync(rebalancingManager: Address): Promise<BTCETHRebalancingManagerDetails>;
    /**
     * Fetches the state variables of the BTCDAI Rebalancing Manager contract.
     *
     * @param  rebalancingManager    Address of the BTCDAI Rebalancing Manager contract
     * @return                       Object containing the state information related to the rebalancing manager
     */
    getBTCDAIRebalancingManagerDetailsAsync(rebalancingManager: Address): Promise<BTCDAIRebalancingManagerDetails>;
    /**
     * Fetches the state variables of the ETHDAI Rebalancing Manager contract.
     *
     * @param  rebalancingManager    Address of the ETHDAI Rebalancing Manager contract
     * @return                       Object containing the state information related to the rebalancing manager
     */
    getETHDAIRebalancingManagerDetailsAsync(rebalancingManager: Address): Promise<ETHDAIRebalancingManagerDetails>;
    /**
     * Fetches the state variables of the Moving Average Crossover Manager contract.
     *
     * @param  macoManager         Address of the Moving Average Crossover Manager contract
     * @return                     Object containing the state information related to the manager
     */
    getMovingAverageManagerDetailsAsync(managerType: BigNumber, macoManager: Address): Promise<MovingAverageManagerDetails>;
    /**
     * Fetches the state variables of the Asset Pair Manager contract.
     *
     * @param  manager         Address of the AssetPairManager contract
     * @return                 Object containing the state information related to the manager
     */
    getAssetPairManagerDetailsAsync(manager: Address): Promise<AssetPairManagerDetails>;
    /**
     * Fetches the crossover confirmation time of AssetPairManager contracts.
     *
     * @param  managers        Array of addresses of the manager contract
     * @return                 Object containing the crossover timestamps
     */
    batchFetchAssetPairCrossoverTimestampAsync(managers: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches the crossover confirmation time of AssetPairManager contracts.
     *
     * @param  managers        Array of addresses of the manager contract
     * @return                 Object containing the crossover timestamps
     */
    batchFetchMACOCrossoverTimestampAsync(managers: Address[]): Promise<BigNumber[]>;
    private assertPropose;
    private assertGeneralPropose;
    private assertBTCETHPriceTrigger;
    private assertBTCDAIPriceTrigger;
    private assertETHDAIPriceTrigger;
    private assertInitialPropose;
    private assertConfirmPropose;
    private assertAssetPairInitialPropose;
    private assertAssetPairConfirmPropose;
    private assertMACOPropose;
    private assertCrossoverTriggerMet;
    private computeSetTokenAllocation;
    private computeTokenDollarAmount;
    private isUsingRiskComponent;
}
