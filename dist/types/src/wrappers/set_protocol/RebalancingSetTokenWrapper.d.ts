import Web3 from 'web3';
import { Address, TokenFlows, Tx } from '../../types/common';
import { BigNumber } from '../../util';
/**
 * @title  RebalancingSetTokenWrapper
 * @author Set Protocol
 *
 * The Rebalancing Set Token API handles all functions on the Rebalancing Set Token smart contract.
 *
 */
export declare class RebalancingSetTokenWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Proposes rebalance, can only be called by manager
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  nextSetAddress                 Set to rebalance into
     * @param  auctionLibrary                 Address of auction price curve to use
     * @param  auctionTimeToPivot             Amount of time until curve hits pivot
     * @param  auctionStartPrice              Used with priceNumerator, define auction start price
     * @param  auctionPivotPrice              Used with priceNumerator, price curve pivots at
     * @param  txOpts                         Transaction options
     * @return                                Transaction hash
     */
    propose(rebalancingSetAddress: Address, nextSet: Address, auctionLibrary: Address, auctionTimeToPivot: BigNumber, auctionStartPrice: BigNumber, auctionPivotPrice: BigNumber, txOpts: Tx): Promise<string>;
    /**
     * Starts rebalance after proposal period has elapsed
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  txOpts                  Transaction options
     * @return                         Transaction hash
     */
    startRebalance(rebalancingSetAddress: Address, txOpts: Tx): Promise<string>;
    /**
     * Settles rebalance after currentSets been rebalanced
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  txOpts                  Transaction options
     * @return                         Transaction hash
     */
    settleRebalance(rebalancingSetAddress: Address, txOpts: Tx): Promise<string>;
    /**
     * Change token manager address
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  newManager              Address of new manager
     * @param  txOpts                  Transaction options
     * @return                         Transaction hash
     */
    setManager(rebalancingSetAddress: Address, newManager: Address, txOpts: Tx): Promise<string>;
    /**
     * Ends a failed auction
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  txOpts                  Transaction options
     * @return                         Transaction hash
     */
    endFailedAuction(rebalancingSetAddress: Address, txOpts: Tx): Promise<string>;
    /**
     * Gets token inflow and outflows for current rebalance price
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  quantity                Amount of currentSet to rebalance
     * @return                         Array of token inflows
     * @return                         Array of token outflows
     */
    getBidPrice(rebalancingSetAddress: Address, quantity: BigNumber): Promise<TokenFlows>;
    /**
     * Returns if passed Set is collateralizing the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  component               Address of collateral component
     * @return                         Boolean if component collateralizing Rebalancing Set
     */
    tokenIsComponent(rebalancingSetAddress: Address, component: Address): Promise<boolean>;
    /**
     * Gets manager of the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The manager's address
     */
    manager(rebalancingSetAddress: Address): Promise<Address>;
    /**
     * Gets state of the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The state of the RebalancingSetToken
     */
    rebalanceState(rebalancingSetAddress: Address): Promise<string>;
    /**
     * Gets address of the currentSet for the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The currentSet of the RebalancingSetToken
     */
    currentSet(rebalancingSetAddress: Address): Promise<Address>;
    /**
     * Gets unitShares of the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The unitShares of the RebalancingSetToken
     */
    unitShares(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets naturalUnit of the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The naturalUnit of the RebalancingSetToken
     */
    naturalUnit(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets Unix timestamp of last rebalance for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The lastRebalanceTimestamp of the RebalancingSetToken
     */
    lastRebalanceTimestamp(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets length of the proposal period for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The proposalPeriod of the RebalancingSetToken
     */
    proposalPeriod(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets time between rebalances for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The rebalanceInterval of the RebalancingSetToken
     */
    rebalanceInterval(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets start time of proposal period for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The proposalStartTime of the RebalancingSetToken
     */
    proposalStartTime(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets nextSet for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The nextSet of the RebalancingSetToken
     */
    nextSet(rebalancingSetAddress: Address): Promise<Address>;
    /**
     * Gets address of auctionLibrary for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionLibrary address of the RebalancingSetToken
     */
    auctionLibrary(rebalancingSetAddress: Address): Promise<Address>;
    /**
     * Gets startingCurrentSetAmount for the Rebalancing Set Token.
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The starting Current Set AMount of the RebalancingSetToken
     */
    startingCurrentSetAmount(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets auctionParameters struct for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionLibrary address of the RebalancingSetToken
     */
    auctionParameters(rebalancingSetAddress: Address): Promise<BigNumber[]>;
    /**
     * Gets minimumBid for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The minimumBid of the RebalancingSetToken
     */
    minimumBid(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets combinedTokenArray for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The combinedTokenArray of the RebalancingSetToken
     */
    getCombinedTokenArray(rebalancingSetAddress: Address): Promise<Address[]>;
    /**
     * Gets combinedCurrentUnits for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The combinedCurrentUnits of the RebalancingSetToken
     */
    getCombinedCurrentUnits(rebalancingSetAddress: Address): Promise<BigNumber[]>;
    /**
     * Gets combinedNextSetUnits for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The combinedNextSetUnits of the RebalancingSetToken
     */
    getCombinedNextSetUnits(rebalancingSetAddress: Address): Promise<BigNumber[]>;
    /**
     * Gets remainingCurrentSets for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The remainingCurrentSets of the RebalancingSetToken
     */
    remainingCurrentSets(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets auctionStartTime for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionStartTime of the RebalancingSetToken
     */
    auctionStartTime(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets auctionTimeToPivot for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionTimeToPivot of the RebalancingSetToken
     */
    auctionTimeToPivot(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets auctionStartPrice for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionStartPrice of the RebalancingSetToken
     */
    auctionStartPrice(rebalancingSetAddress: Address): Promise<BigNumber>;
    /**
     * Gets auctionPivotPrice for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionPivotPrice of the RebalancingSetToken
     */
    auctionPivotPrice(rebalancingSetAddress: Address): Promise<BigNumber>;
}
