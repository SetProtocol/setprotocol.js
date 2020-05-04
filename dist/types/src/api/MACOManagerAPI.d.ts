import Web3 from 'web3';
import { BigNumber } from '../util';
import { Assertions } from '../assertions';
import { Address, Tx } from '../types/common';
import { MovingAverageManagerDetails } from '../types/strategies';
/**
 * @title MACOManagerAPI
 * @author Set Protocol
 *
 * A library for interacting with MovingAverageManager Manager
 */
export declare class MACOManagerAPI {
    private assert;
    private setToken;
    private rebalancingSetToken;
    private macoStrategyManager;
    private priceFeed;
    private movingAverageOracleWrapper;
    /**
     * Instantiates a new MACOManagerAPI instance that contains methods for interacting with
     * the Moving Average Crossover Manager.
     *
     * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param core        An instance of CoreWrapper to interact with the deployed Core contract
     */
    constructor(web3: Web3, assertions: Assertions);
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
    initiateCrossoverProposeAsync(macoManager: Address, txOpts: Tx): Promise<string>;
    confirmCrossoverProposeAsync(macoManager: Address, txOpts: Tx): Promise<string>;
    /**
     * Fetches the lastCrossoverConfirmationTimestamp of the Moving Average Crossover Manager contract.
     *
     * @param  macoManager         Address of the Moving Average Crossover Manager contract
     * @return                     BigNumber containing the lastCrossoverConfirmationTimestamp
     */
    getLastCrossoverConfirmationTimestampAsync(macoManager: Address): Promise<BigNumber>;
    /**
     * Fetches the state variables of the Moving Average Crossover Manager contract.
     *
     * @param  macoManager         Address of the Moving Average Crossover Manager contract
     * @return                     Object containing the state information related to the manager
     */
    getMovingAverageManagerDetailsAsync(macoManager: Address): Promise<MovingAverageManagerDetails>;
    private assertInitialPropose;
    private assertConfirmPropose;
    private assertPropose;
    private isUsingRiskComponent;
}
