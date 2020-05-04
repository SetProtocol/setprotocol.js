import Web3 from 'web3';
import { Address, Tx } from '../../types/common';
import { BigNumber } from '../../util';
/**
 * @title RebalancingAuctionModuleWrapper
 * @author Set Protocol
 *
 * The Core API handles all functions on the Core SetProtocol smart contract.
 *
 */
export declare class RebalancingAuctionModuleWrapper {
    private web3;
    private contracts;
    rebalanceAuctionModuleAddress: Address;
    constructor(web3: Web3, rebalanceAuctionModule: Address);
    /**
     * Asynchronously retrieve BidPlaced events from the Rebalancing Auction Module
     * Optionally, you can filter by a specific rebalancing SetToken
     *
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
     * @return                               An array of raw events
     */
    bidPlacedEvent(fromBlock: number, toBlock?: any, rebalancingSetToken?: Address): Promise<any>;
    /**
     * Asynchronously submit a bid for a rebalancing auction on a rebalancingSetToken
     *
     * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
     * @param  quantity                      Amount of currentSetToken the bidder wants to rebalance
     * @param  allowPartialFill              Boolean that signifies whether to bid if full amount is not possible
     * @param  txOpts                        The options for executing the transaction
     * @return                               A transaction hash
     */
    bid(rebalancingSetTokenAddress: Address, quantity: BigNumber, allowPartialFill: boolean, txOpts?: Tx): Promise<string>;
    /**
     * Asynchronously submit a bid and withdraw bids for a rebalancing auction on a rebalancingSetToken
     *
     * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
     * @param  quantity                      Amount of currentSetToken the bidder wants to rebalance
     * @param  txOpts                        The options for executing the transaction
     * @param  allowPartialFill              Boolean that signifies whether to bid if full amount is not possible
     * @return                               A transaction hash
     */
    bidAndWithdraw(rebalancingSetTokenAddress: Address, quantity: BigNumber, allowPartialFill: boolean, txOpts?: Tx): Promise<string>;
    /**
     * Burns tokens in Drawdown state and transfers ownership of collateral to owner in the vault. Collateral
     * must be withdrawn separately
     *
     * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
     * @param  txOpts                        The options for executing the transaction
     * @return                               A transaction hash
     */
    redeemFromFailedRebalance(rebalancingSetTokenAddress: Address, txOpts?: Tx): Promise<string>;
}
