import Web3 from 'web3';
import { HistoricalPriceFeedContract, MACOStrategyManagerContract, MovingAverageOracleContract } from 'set-protocol-strategies';
import { Address } from '../../types/common';
/**
 * @title ContractWrapper
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
export declare class ContractWrapper {
    private web3;
    private cache;
    constructor(web3: Web3);
    /**
     * Load a HistoricalPriceFeed contract
     *
     * @param  historicalPriceFeed          Address of the HistoricalPriceFeed contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The HistoricalPriceFeed Contract
     */
    loadHistoricalPriceFeedContract(historicalPriceFeed: Address, transactionOptions?: object): Promise<HistoricalPriceFeedContract>;
    /**
     * Load a MovingAverageOracle contract
     *
     * @param  movingAveragesOracle         Address of the MovingAveragesOracle contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The MovingAveragesOracle Contract
     */
    loadMovingAverageOracleContract(movingAveragesOracle: Address, transactionOptions?: object): Promise<MovingAverageOracleContract>;
    /**
     * Load a MACOStrategyManager contract
     *
     * @param  macoStrategyManager          Address of the MACOStrategyManager contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The MACOStrategyManager Contract
     */
    loadMACOStrategyManagerContractAsync(macoStrategyManager: Address, transactionOptions?: object): Promise<MACOStrategyManagerContract>;
}
