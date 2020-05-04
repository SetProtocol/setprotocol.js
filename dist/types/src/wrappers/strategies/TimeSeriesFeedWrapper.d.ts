import Web3 from 'web3';
import { TimeSeriesFeedState } from 'set-protocol-utils';
import { BigNumber } from '../../util';
import { Address } from '../../types/common';
/**
 * @title  TimeSeriesFeedWrapper
 * @author Set Protocol
 *
 * The TimeSeriesFeedWrapper handles interactions with Set's price feed for moving averages
 *
 */
export declare class TimeSeriesFeedWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Fetch the Unix timestamp of the next earliest update
     *
     * @param  timeSeriesFeedAddress         Address of the TimeSeriesFeed contract to fetch data from
     * @return                               Unix time
     */
    nextEarliestUpdate(timeSeriesFeedAddress: Address): Promise<BigNumber>;
    /**
     * Fetch TimeSeriesFeed state (nextEarliestUpdate, updateInterval, all logged prices)
     *
     * @param  timeSeriesFeedAddress         Address of the TimeSeriesFeed contract to fetch data from
     * @return                               TimeSeriesFeedState type
     */
    getTimeSeriesFeedState(timeSeriesFeedAddress: Address): Promise<TimeSeriesFeedState>;
}
