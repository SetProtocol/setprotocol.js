export declare const rebalancingErrors: {
    REBALANCE_IN_PROGRESS: (rebalancingSetAddress: string) => string;
    NOT_REBALANCING_MANAGER: (caller: string) => string;
    NOT_VALID_PRICE_CURVE: (priceCurve: string) => string;
    INSUFFICIENT_TIME_PASSED: (nextAvailableRebalance: string) => string;
    PROPOSED_SET_NATURAL_UNIT_IS_NOT_MULTIPLE_OF_CURRENT_SET: (currentSetAddress: string, nextSetAddress: string) => string;
    INCORRECT_STATE: (rebalancingSetAddress: string, requiredState: string) => string;
    NOT_ENOUGH_SETS_REBALANCED: (nextAvailableRebalance: string, minimumBid: string, remainingCurrentSets: string) => string;
    BID_AMOUNT_EXCEEDS_REMAINING_CURRENT_SETS: (remainingCurrentSets: string, bidQuantity: string) => string;
    BID_AMOUNT_NOT_MULTIPLE_OF_MINIMUM_BID: (bidQuantity: string, minimumBid: string) => string;
    PIVOT_TIME_NOT_PASSED: (pivotTimeStart: string) => string;
    NOT_VALID_DRAWDOWN: (rebalancingSetAddress: string) => string;
};
