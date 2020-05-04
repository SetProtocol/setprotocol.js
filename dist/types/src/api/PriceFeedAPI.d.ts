import Web3 from 'web3';
import { TimeSeriesFeedState } from 'set-protocol-utils';
import { BigNumber } from '../util';
import { Address, Tx } from '../types/common';
/**
 * @title PriceFeedAPI
 * @author Set Protocol
 *
 * A library for reading and updating price feeds
 */
export declare class PriceFeedAPI {
    private historicalPriceFeedWrapper;
    private timeSeriesFeedWrapper;
    /**
     * Instantiates a new PriceFeedAPI instance that contains methods for interacting with and updating price oracles
     *
     * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     */
    constructor(web3: Web3);
    /**
     * Returns the Unix timestamp of when the price feed was last updated. Only applies to HistoricalPriceFeed contracts.
     *
     * @param  historicalPriceFeed    Address of the HistoricalPriceFeed contract to poll
     * @return                        Timestamp of when the price feed was last updated
     */
    getHistoricalPriceFeedLastUpdatedAsync(historicalPriceFeed: Address): Promise<BigNumber>;
    /**
     * Returns the Unix timestamp of earliest time the TimeSeriesFeed can be updated. Only applies to
     * TimeSeriesFeed contracts.
     *
     * @param  timeSeriesFeed         Address of the TimeSeriesFeed contract to poll
     * @return                        Timestamp of when the price feed can be updated next
     */
    getTimeSeriesFeedNextEarliestUpdateAsync(timeSeriesFeed: Address): Promise<BigNumber>;
    /**
     * Fetch TimeSeriesFeed state (nextEarliestUpdate, updateInterval, all logged prices)
     *
     * @param  timeSeriesFeed         Address of the TimeSeriesFeed contract to fetch data from
     * @return                        TimeSeriesFeedState type
     */
    getTimeSeriesFeedState(timeSeriesFeed: Address): Promise<TimeSeriesFeedState>;
    /**
     * Returns the current price feed prices for dayCount number of days. Can be used by either HistoricalPriceFeed or
     * TimeSeriesFeed contracts.
     *
     * @param  historicalPriceFeed    Address of the HistoricalPriceFeed/TimeSeriesFeed contract to update
     * @param  dayCount               Number of days to fetch price data for
     * @return                        List of prices recorded on the feed
     */
    getLatestPriceFeedDataAsync(historicalPriceFeed: Address, dayCount: BigNumber): Promise<BigNumber[]>;
    /**
     * Updates the price feed to record the current price from another Medianizer oracle. Can be used by either
     * HistoricalPriceFeed or TimeSeriesFeed contracts.
     *
     * @param  historicalPriceFeed    Address of the HistoricalPriceFeed/TimeSeriesFeed contract to update
     * @param  txOpts                 The options for executing the transaction
     * @return                        Transaction hash
     */
    updatePriceFeedDataAsync(historicalPriceFeedAddress: Address, txOpts: Tx): Promise<string>;
}
