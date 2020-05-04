import Web3 from 'web3';
import { BigNumber } from '../util';
import { Address } from '../types/common';
/**
 * @title OracleAPI
 * @author Set Protocol
 *
 * A library for reading oracles
 */
export declare class OracleAPI {
    private movingAverageOracleWrapper;
    private medianizer;
    /**
     * Instantiates a new OracleAPI instance that contains methods for interacting with and updating price oracles
     *
     * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     */
    constructor(web3: Web3);
    /**
     * Returns the current price feed price
     *
     * @param medianizerAddress    Address of the medianizer to ping
     * @return                     Price in base decimal of the asset represented by the medianizer
     */
    getFeedPriceAsync(medianizerAddress: Address): Promise<BigNumber>;
    /**
     * Get the average price of a sequential list of asset prices stored on the MovingAverageOracle's connected
     * HistoricalPriceFeed or TimesSeriesFeed contract
     *
     * @param  movingAverageOracle    Address of the MovingAverageOracle contract
     * @param  txOpts                 The options for executing the transaction
     * @return                        Price representing the average between the most recent dataPoints count
     */
    getMovingAverageOraclePrice(movingAverageOracle: Address, dataPoints: BigNumber): Promise<BigNumber>;
}
