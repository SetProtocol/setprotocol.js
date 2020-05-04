import Web3 from 'web3';
import { Address, TokenFlows, Tx } from '../../types/common';
import { BigNumber } from '../../util';
/**
 * @title  RebalancingSetCTokenBidderWrapper
 * @author Set Protocol
 *
 * The RebalancingSetCTokenBidderWrapper handles all functions on the RebalancingSetCTokenBidder smart contract.
 *
 */
export declare class RebalancingSetCTokenBidderWrapper {
    private web3;
    private contracts;
    private rebalancingSetCTokenBidderAddress;
    constructor(web3: Web3, rebalancingSetCTokenBidderAddress: Address);
    /**
     * Asynchronously retrieve BidPlacedCToken events from the RebalancingSetCTokenBidder contract
     * Optionally, you can filter by a specific rebalancing SetToken
     *
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
     * @return                               An array of raw events
     */
    bidPlacedCTokenEvent(fromBlock: number, toBlock?: any, rebalancingSetToken?: Address): Promise<any>;
    /**
     * Asynchronously submit a bid and withdraw bids while transacting in underlying of cTokens
     * for a rebalancing auction on a rebalancingSetToken
     *
     * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
     * @param  quantity                      Amount of currentSetToken the bidder wants to rebalance
     * @param  allowPartialFill              Boolean that signifies whether to bid if full amount is not possible
     * @param  txOpts                        The options for executing the transaction
     * @return                               A transaction hash
     */
    bidAndWithdraw(rebalancingSetTokenAddress: Address, quantity: BigNumber, allowPartialFill: boolean, txOpts?: Tx): Promise<string>;
    /**
     * Fetches the current cToken underlying component addresses, token inflows and outflows for a given bid quantity
     *
     * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
     * @param  bidQuantity                   Amount of currentSetToken the bidder wants to rebalance
     * @return                               Object conforming to `TokenFlows` interface
     */
    getAddressAndBidPriceArray(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber): Promise<TokenFlows>;
}
