import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import { BigNumber } from '../util';
export declare class RebalancingAssertions {
    private web3;
    private erc20Assertions;
    private commonAssertions;
    constructor(web3: Web3);
    /**
     * Throws if the proposal details cannot be fetched
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    canFetchProposalDetails(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if the rebalance details cannot be fetched
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    canFetchRebalanceState(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if given rebalancingSetToken in Rebalance state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    isNotInRebalanceState(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if given rebalancingSetToken is not in Default state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    isNotInDefaultState(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if given rebalancingSetToken is not in Proposal state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    isInProposalState(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if given rebalancingSetToken is not in Rebalance state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    isInRebalanceState(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if given rebalancingSetToken is not in Drawdown state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    isInDrawdownState(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if caller of rebalancingSetToken is not manager
     *
     * @param  caller   The address of the rebalancing set token
     */
    isManager(rebalancingSetTokenAddress: Address, caller: Address): Promise<void>;
    /**
     * Throws if not enough time passed between last rebalance on rebalancing set token
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    sufficientTimeBetweenRebalance(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if not enough time passed between last rebalance on rebalancing set token
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     * @param  nextSetAddress               The address of the nextSet being proposed
     */
    nextSetIsMultiple(rebalancingSetTokenAddress: Address, nextSetAddress: Address): Promise<void>;
    /**
     * Throws if given price curve is not approved in Core
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    isValidPriceCurve(priceCurve: Address, coreAddress: Address): Promise<void>;
    /**
     * Throws if not enough time passed in proposal state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    sufficientTimeInProposalState(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if not enough current sets rebalanced in auction
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    enoughSetsRebalanced(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if not past pivot time
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    passedPivotTime(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if auction has no remaining bids
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    enoughRemainingBids(rebalancingSetTokenAddress: Address): Promise<void>;
    /**
     * Throws if user bids to rebalance an amount of current set token that is greater than amount of current set
     * token remaining.
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     * @param  bidQuantity                  The amount of current set the user is seeking to rebalance
     */
    bidAmountLessThanRemainingSets(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber): Promise<void>;
    /**
     * Throws if user bids to rebalance an amount of current set token that is not a multiple of the minimumBid.
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     * @param  bidQuantity                  The amount of current set the user is seeking to rebalance
     */
    bidIsMultipleOfMinimumBid(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber): Promise<void>;
    /**
     * Throws if the given user doesn't have a sufficient balance for a component token needed to be
     * injected for a bid. Since the price can only get better for a bidder the inflow amounts queried
     * when this function is called suffices.
     *
     * @param  rebalancingSetTokenAddress  The address of the Rebalancing Set Token contract
     * @param  ownerAddress                The address of the owner
     * @param  quantity                    Amount of a Set in base units
     * @param  exclusions                  The addresses to exclude from checking
     */
    hasSufficientBalances(rebalancingSetTokenAddress: Address, ownerAddress: Address, quantity: BigNumber, exclusions?: Address[]): Promise<void>;
    isOutsideAllocationBounds(quantity: BigNumber, lowerBound: BigNumber, upperBound: BigNumber, errorMessage: string): void;
    /**
     * Throws if the given user doesn't have a sufficient allowance for a component token needed to be
     * injected for a bid. Since the price can only get better for a bidder the inflow amounts queried
     * when this function is called suffices.
     *
     * @param  rebalancingSetTokenAddress  The address of the Rebalancing Set Token contract
     * @param  ownerAddress                The address of the owner
     * @param  quantity                    Amount of a Set in base units
     * @param  exclusions                  The addresses to exclude from checking
     */
    hasSufficientAllowances(rebalancingSetTokenAddress: Address, ownerAddress: Address, spenderAddress: Address, quantity: BigNumber, exclusions?: Address[]): Promise<void>;
    /**
     * Throws if the given user doesn't have a sufficient Ether value passed into function
     * injected for a bid.
     *
     * @param  rebalancingSetTokenAddress  The address of the Rebalancing Set Token contract
     * @param  quantity                    Amount of a Set in base units
     * @param  wrappedEtherAddress         Wrapped Ether address
     * @param  etherValue                  Ether value sent in transaction
     */
    hasRequiredEtherValue(rebalancingSetTokenAddress: Address, quantity: BigNumber, wrappedEtherAddress: Address, etherValue: BigNumber): Promise<void>;
}
