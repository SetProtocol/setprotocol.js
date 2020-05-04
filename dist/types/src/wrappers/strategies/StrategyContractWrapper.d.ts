import Web3 from 'web3';
import { HistoricalPriceFeedContract, MovingAverageOracleContract, OracleProxyContract, TimeSeriesFeedContract } from 'set-protocol-oracles';
import { AssetPairManagerContract, BTCDaiRebalancingManagerContract, BTCETHRebalancingManagerContract, ETHDaiRebalancingManagerContract, MACOStrategyManagerContract, MACOStrategyManagerV2Contract, SocialTradingManagerContract, SocialTradingManagerV2Contract } from 'set-protocol-strategies';
import { Address } from '../../types/common';
/**
 * @title ContractWrapper
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
export declare class StrategyContractWrapper {
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
     * Load a TimeSeriesFeed contract
     *
     * @param  timeSeriesFeed               Address of the TimeSeriesFeed contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The TimeSeriesFeed Contract
     */
    loadTimeSeriesFeedContract(timeSeriesFeed: Address, transactionOptions?: object): Promise<TimeSeriesFeedContract>;
    /**
     * Load a MovingAverageOracle contract
     *
     * @param  oracleProxy         Address of the MovingAveragesOracle contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The MovingAveragesOracle Contract
     */
    loadMovingAverageOracleContract(movingAveragesOracle: Address, transactionOptions?: object): Promise<MovingAverageOracleContract>;
    /**
     * Load an OracleProxy contract
     *
     * @param  OracleProxy contract         Address of the OracleProxy contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The OracleProxy Contract
     */
    loadOracleProxyContract(oracleProxy: Address, transactionOptions?: object): Promise<OracleProxyContract>;
    /**
     * Load BTCETHManagerContract contract
     *
     * @param  btcEthManagerAddress           Address of the BTCETHRebalancingManagerContract contract
     * @param  transactionOptions             Options sent into the contract deployed method
     * @return                                The BtcEthManagerContract Contract
     */
    loadBtcEthManagerContractAsync(btcEthManagerAddress: Address, transactionOptions?: object): Promise<BTCETHRebalancingManagerContract>;
    /**
     * Load a BTCDAIRebalancingManager contract
     *
     * @param  btcDaiManager                Address of the BTCDAIRebalancingManager contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The BTCDAIRebalancingManager Contract
     */
    loadBtcDaiManagerContractAsync(btcDaiManager: Address, transactionOptions?: object): Promise<BTCDaiRebalancingManagerContract>;
    /**
     * Load a ETHDAIRebalancingManager contract
     *
     * @param  ethDaiManager                Address of the ETHDAIRebalancingManager contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The ETHDAIRebalancingManager Contract
     */
    loadEthDaiManagerContractAsync(ethDaiManager: Address, transactionOptions?: object): Promise<ETHDaiRebalancingManagerContract>;
    /**
     * Load a MACOStrategyManager contract
     *
     * @param  macoStrategyManager          Address of the MACOStrategyManager contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The MACOStrategyManager Contract
     */
    loadMACOStrategyManagerContractAsync(macoStrategyManager: Address, transactionOptions?: object): Promise<MACOStrategyManagerContract>;
    /**
     * Load a MACOStrategyManagerV2 contract
     *
     * @param  macoStrategyManager          Address of the MACOStrategyManager contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The MACOStrategyManager Contract
     */
    loadMACOStrategyManagerV2ContractAsync(macoStrategyManager: Address, transactionOptions?: object): Promise<MACOStrategyManagerV2Contract>;
    /**
     * Load a AssetPairManager contract
     *
     * @param  assetPairManager             Address of the AssetPairManager contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The AssetPairManager Contract
     */
    loadAssetPairManagerContractAsync(assetPairManager: Address, transactionOptions?: object): Promise<AssetPairManagerContract>;
    /**
     * Load a SocialTradingManager contract
     *
     * @param  socialTradingManager         Address of the SocialTradingManager contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The SocialTradingManager Contract
     */
    loadSocialTradingManagerContractAsync(socialTradingManager: Address, transactionOptions?: object): Promise<SocialTradingManagerContract>;
    /**
     * Load a SocialTradingManagerV2 contract
     *
     * @param  socialTradingManager         Address of the SocialTradingManager contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The SocialTradingManager Contract
     */
    loadSocialTradingManagerV2ContractAsync(socialTradingManager: Address, transactionOptions?: object): Promise<SocialTradingManagerV2Contract>;
}
