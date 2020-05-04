import Web3 from 'web3';
import { BigNumber } from '../../util';
import { Address } from '../../types/common';
/**
 * @title  MovingAverageOracle
 * @author Set Protocol
 *
 * The MovingAverageOracle handles interactions with Set's moving averages oracle
 *
 */
export declare class MovingAverageOracleWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Fetch the last dataPoints worth of price data from the MovingAverageOracle
     *
     * @param  movingAverageOracleAddress    Address of the moving average oracle to fetch data from
     * @param  dataPoints                    Number of days to fetch price data for
     * @return                               Moving average for passed number of dataPoints returned in bytes
     */
    read(movingAverageOracleAddress: Address, dataPoints: BigNumber): Promise<string>;
    /**
     * Fetch the MakerDAO risk asset price medianizer from the MovingAverageOracle
     *
     * @param  movingAverageOracleAddress    Address of the moving average oracle to fetch data from
     * @return                               Moving average for passed number of dataPoints returned in bytes
     */
    getSourceMedianizer(movingAverageOracleAddress: Address): Promise<string>;
}
