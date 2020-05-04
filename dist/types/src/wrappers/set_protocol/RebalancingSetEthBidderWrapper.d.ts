import Web3 from 'web3';
import { Address, Tx } from '../../types/common';
import { BigNumber } from '../../util';
/**
 * @title  RebalancingSetEthBidderWrapper
 * @author Set Protocol
 *
 * The RebalancingSetEthBidderWrapper handles all functions on the RebalancingSetEthBidder smart contract.
 *
 */
export declare class RebalancingSetEthBidderWrapper {
    private web3;
    private contracts;
    private rebalancingSetEthBidderAddress;
    constructor(web3: Web3, rebalancingSetEthBidderAddress: Address);
    /**
     * Asynchronously retrieve BidPlacedWithEth events from the RebalancingSetEthBidder contract
     * Optionally, you can filter by a specific rebalancing SetToken
     *
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
     * @return                               An array of raw events
     */
    bidPlacedWithEthEvent(fromBlock: number, toBlock?: any, rebalancingSetToken?: Address): Promise<any>;
    /**
     * Asynchronously submit a bid and withdraw bids while transacting in Eth
     * for a rebalancing auction on a rebalancingSetToken
     *
     * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
     * @param  quantity                      Amount of currentSetToken the bidder wants to rebalance
     * @param  allowPartialFill              Boolean that signifies whether to bid if full amount is not possible
     * @param  txOpts                        The options for executing the transaction
     * @return                               A transaction hash
     */
    bidAndWithdrawWithEther(rebalancingSetTokenAddress: Address, quantity: BigNumber, allowPartialFill: boolean, txOpts?: Tx): Promise<string>;
}
