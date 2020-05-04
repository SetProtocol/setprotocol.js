/*
  Copyright 2018 Set Labs Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebalancingErrors = {
    REBALANCE_IN_PROGRESS: function (rebalancingSetAddress) { return "Rebalancing token at " + rebalancingSetAddress + " is " +
        "currently in rebalancing state. Issue, Redeem, and propose functionality is not available during this time"; },
    NOT_REBALANCING_MANAGER: function (caller) { return "Caller " + caller + " is not the manager of this Rebalancing Set Token."; },
    NOT_VALID_PRICE_CURVE: function (priceCurve) { return "Proposed " + priceCurve + " is not recognized by Core."; },
    INSUFFICIENT_TIME_PASSED: function (nextAvailableRebalance) { return "Attempting to rebalance too soon. Rebalancing next " +
        ("available on " + nextAvailableRebalance); },
    PROPOSED_SET_NATURAL_UNIT_IS_NOT_MULTIPLE_OF_CURRENT_SET: function (currentSetAddress, nextSetAddress) {
        return nextSetAddress + " must be a multiple of " + currentSetAddress + ", or vice versa to propose a valid rebalance.";
    },
    INCORRECT_STATE: function (rebalancingSetAddress, requiredState) { return "Rebalancing token at " +
        (rebalancingSetAddress + " must be in " + requiredState + " state to call that function."); },
    NOT_ENOUGH_SETS_REBALANCED: function (nextAvailableRebalance, minimumBid, remainingCurrentSets) {
        return "In order to settle rebalance there must be less than current " + minimumBid + " sets remaining to be rebalanced. " +
            ("There are currently " + remainingCurrentSets + " remaining for rebalance.");
    },
    BID_AMOUNT_EXCEEDS_REMAINING_CURRENT_SETS: function (remainingCurrentSets, bidQuantity) { return "The submitted " +
        ("bid quantity, " + bidQuantity + ", exceeds the remaining current sets, " + remainingCurrentSets + "."); },
    BID_AMOUNT_NOT_MULTIPLE_OF_MINIMUM_BID: function (bidQuantity, minimumBid) { return "The submitted bid quantity" +
        (", " + bidQuantity + ", must be a multiple of the minimumBid, " + minimumBid + "."); },
    PIVOT_TIME_NOT_PASSED: function (pivotTimeStart) { return "Pivot time not yet reached. Pivot time " +
        ("starts at " + pivotTimeStart); },
    NOT_VALID_DRAWDOWN: function (rebalancingSetAddress) {
        return "Auction has no remaining bids. Cannot drawdown Set at " + rebalancingSetAddress + ".";
    },
};
//# sourceMappingURL=rebalancingErrors.js.map