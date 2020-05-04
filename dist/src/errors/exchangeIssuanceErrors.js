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
exports.exchangeIssuanceErrors = {
    ONLY_ONE_RECEIVE_TOKEN: function () { return "Only one receive token is allowed in Payable Exchange Redemption"; },
    REDEEM_AND_TRADE_QUANTITIES_MISMATCH: function (quantityFromRebalancingSetQuantity, quantityToTrade) {
        return "The quantity of base set redeemable from the quantity of the rebalancing set: " +
            (quantityFromRebalancingSetQuantity + " must be greater or equal to the amount required for the redemption ") +
            ("trades: " + quantityToTrade);
    },
    INVALID_SEND_TOKEN: function (sendToken, paymentToken) { return "Send token at " + sendToken + " is " +
        ("not the payment token at " + paymentToken); },
    INVALID_RECEIVE_TOKEN: function (receiveToken, outputToken) { return "Receive token at " + receiveToken + " is " +
        ("not the output token at " + outputToken); },
    ISSUING_SET_NOT_BASE_SET: function (setAddress, currentSet) { return "Set token at " + setAddress + " is " +
        ("not the expected rebalancing set token current Set at " + currentSet); },
    REDEEMING_SET_NOT_BASE_SET: function (setAddress, currentSet) { return "Set token at " + setAddress + " is " +
        ("not the expected rebalancing set token current Set at " + currentSet); },
    PAYMENT_TOKEN_QUANTITY_NOT_UNDEFINED: function () {
        return "Payment Token quantity value should not be undefined (txOpts.value if Wrapped Ether)";
    },
    TRADE_TOKENS_NOT_COMPONENT: function (setAddress, componentAddress) { return "Component at " + componentAddress + " " +
        ("is not part of the collateralizing set at " + setAddress); },
};
//# sourceMappingURL=exchangeIssuanceErrors.js.map