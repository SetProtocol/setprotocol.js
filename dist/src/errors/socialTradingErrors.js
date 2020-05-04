/*
  Copyright 2019 Set Labs Inc.

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
exports.socialTradingErrors = {
    ALLOCATION_EXCEEDS_ONE_HUNDERED_PERCENT: function (allocation) { return "Provided allocation " +
        (allocation.toString() + " is greater than 100%."); },
    ALLOCATION_NOT_MULTIPLE_OF_ONE_PERCENT: function (allocation) { return "Provided allocation " +
        (allocation.toString() + " is not multiple of 1% (10 ** 16)"); },
    FEE_NOT_MULTIPLE_OF_ONE_BASIS_POINT: function (fee) { return "Provided fee " + fee.toString() + " is not" +
        " multiple of one basis point (10 ** 14)"; },
    FEE_EXCEEDS_MAX_FEE: function (fee, maxFee) { return "Provided fee " + fee.toString() + " is not" +
        (" less than max fee, " + maxFee.toString() + "."); },
    NOT_TRADER: function (caller) { return "Caller " + caller + " is not trader of tradingPool."; },
    FEE_UPDATE_NOT_INITIATED: function () { return "Must call initiateEntryFeeChange first to start fee update process."; },
    INSUFFICIENT_TIME_PASSED: function (validUpdateTimestamp) { return "Attempting to finalize fee update too soon. " +
        ("Update available at " + validUpdateTimestamp); },
};
//# sourceMappingURL=socialTradingErrors.js.map