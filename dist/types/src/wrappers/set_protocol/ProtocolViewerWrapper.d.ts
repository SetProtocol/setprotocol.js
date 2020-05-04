import Web3 from 'web3';
import { Address } from '../../types/common';
import { BigNumber } from '../../util';
/**
 * @title  ProtocolViewerWrapper
 * @author Set Protocol
 *
 * The ProtocolViewerWrapper handles all functions on the Protocol Viewer smart contract.
 *
 */
export declare class ProtocolViewerWrapper {
    private web3;
    private contracts;
    private protocolViewerAddress;
    constructor(web3: Web3, protocolViewerAddress: Address);
    /**
     * Fetches multiple balances for passed in array of ERC20 contract addresses for an owner
     *
     * @param  tokenAddresses    Addresses of ERC20 contracts to check balance for
     * @param  owner             Address to check balance of tokenAddress for
     */
    batchFetchBalancesOf(tokenAddresses: Address[], owner: Address): Promise<BigNumber[]>;
    /**
     * Fetches token balances for each tokenAddress, tokenOwner pair
     *
     * @param  tokenAddresses    Addresses of ERC20 contracts to check balance for
     * @param  tokenOwners       Addresses of users sequential to tokenAddress to fetch balance for
     */
    batchFetchUsersBalances(tokenAddresses: Address[], tokenOwners: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches multiple supplies for passed in array of ERC20 contract addresses
     *
     * @param  tokenAddresses    Addresses of ERC20 contracts to check supply for
     */
    batchFetchSupplies(tokenAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches all RebalancingSetToken state associated with a rebalance proposal
     *
     * @param  rebalancingSetTokenAddress    RebalancingSetToken contract instance address
     */
    fetchRebalanceProposalStateAsync(rebalancingSetTokenAddress: Address): Promise<any>;
    /**
     * Fetches all RebalancingSetToken state associated with a new rebalance auction
     *
     * @param  rebalancingSetTokenAddress    RebalancingSetToken contract instance address
     */
    fetchRebalanceAuctionStateAsync(rebalancingSetTokenAddress: Address): Promise<any>;
    /**
     * Fetches all rebalance states for an array of RebalancingSetToken contracts
     *
     * @param  rebalancingSetTokenAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchRebalanceStateAsync(rebalancingSetTokenAddresses: Address[]): Promise<any>;
    /**
     * Fetches all unitShares for an array of RebalancingSetToken contracts
     *
     * @param  rebalancingSetTokenAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchUnitSharesAsync(rebalancingSetTokenAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches state of trading pool info, underlying RebalancingSetTokenV2, and current collateralSet.
     *
     * @param  tradingPoolAddress      RebalancingSetTokenV2 contract address of tradingPool
     */
    fetchNewTradingPoolDetails(tradingPoolAddress: Address): Promise<any>;
    /**
     * Fetches state of trading pool v2 info, underlying RebalancingSetTokenV3, performance fee info
     * and current collateralSet.
     *
     * @param  tradingPoolAddress      RebalancingSetTokenV3 contract address of tradingPool
     */
    fetchNewTradingPoolV2Details(tradingPoolAddress: Address): Promise<any>;
    /**
     * Fetches rebalance state of trading pool info, underlying RebalancingSetTokenV2, and current
     * collateralSet.
     *
     * @param  tradingPoolAddress      RebalancingSetTokenV2 contract address of tradingPool
     */
    fetchTradingPoolRebalanceDetails(tradingPoolAddress: Address): Promise<any>;
    /**
     * Fetches all trading pool operators for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchTradingPoolOperator(tradingPoolAddresses: Address[]): Promise<string[]>;
    /**
     * Fetches all entry fees for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchTradingPoolEntryFees(tradingPoolAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches all rebalance fees for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchTradingPoolRebalanceFees(tradingPoolAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches all profit and streaming fees for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchTradingPoolAccumulation(tradingPoolAddresses: Address[]): Promise<any[]>;
    /**
     * Fetches all performance fee state info for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    batchFetchTradingPoolFeeState(tradingPoolAddresses: Address[]): Promise<any[]>;
    /**
     * Fetches cToken exchange rate stored for an array of cToken addresses
     *
     * @param  cTokenAddresses[]    CToken contract instance addresses
     */
    batchFetchExchangeRateStored(cTokenAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches the crossover confirmation timestamp given an array of MACO V2 managers
     *
     * @param  managerAddresses[]    Manager contract instance addresses
     */
    batchFetchMACOV2CrossoverTimestamp(managerAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches the crossover confirmation timestamp given an array of Asset Pair managers
     *
     * @param  managerAddresses[]    Manager contract instance addresses
     */
    batchFetchAssetPairCrossoverTimestamp(managerAddresses: Address[]): Promise<BigNumber[]>;
}
