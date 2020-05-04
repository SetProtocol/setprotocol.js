import Web3 from 'web3';
import { BigNumber } from '../../util';
import { Address, Tx } from '../../types/common';
/**
 * @title  HistoricalPriceFeedWrapper
 * @author Set Protocol
 *
 * The HistoricalPriceFeedWrapper handles interactions with Set's price feed for moving averages
 *
 */
export declare class HistoricalPriceFeedWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Fetch the last dataDays worth of price data from the MovingAverageOracle
     *
     * @param  historicalPriceFeedAddress    Address of the HistoricalPriceFeed contract to update
     * @param  dataDays                      Number of days to fetch price data for
     * @return                               Price data for dataDays count days
     */
    read(historicalPriceFeedAddress: Address, dataDays: BigNumber): Promise<BigNumber[]>;
    /**
     * Fetch the Unix timestamp of the last price feed update
     *
     * @param  historicalPriceFeedAddress    Address of the HistoricalPriceFeed contract to fetch date from
     * @return                               Unix time
     */
    lastUpdatedAt(historicalPriceFeedAddress: Address): Promise<BigNumber>;
    /**
     * Updates the price feed to record the current price from another Medianizer oracle
     *
     * @param  historicalPriceFeedAddress    Address of the HistoricalPriceFeed contract to update
     * @param  txOpts                        The options for executing the transaction
     * @return                               Transaction hash
     */
    poke(historicalPriceFeedAddress: Address, txOpts?: Tx): Promise<string>;
}
