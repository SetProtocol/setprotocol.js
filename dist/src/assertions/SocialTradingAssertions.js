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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var set_protocol_strategies_1 = require("set-protocol-strategies");
var CommonAssertions_1 = require("./CommonAssertions");
var errors_1 = require("../errors");
var util_1 = require("../util");
var constants_1 = require("../constants");
var moment = require('moment');
var SocialTradingAssertions = /** @class */ (function () {
    function SocialTradingAssertions(web3) {
        this.web3 = web3;
        this.commonAssertions = new CommonAssertions_1.CommonAssertions();
    }
    /**
     * Throws if the passed allocation is less than 0
     *
     * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
     */
    SocialTradingAssertions.prototype.allocationGreaterOrEqualToZero = function (newAllocation) {
        this.commonAssertions.isGreaterOrEqualThan(newAllocation, constants_1.ZERO, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(newAllocation));
    };
    /**
     * Throws if the passed allocation is greater than 100%
     *
     * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
     */
    SocialTradingAssertions.prototype.allocationLessThanOneHundred = function (newAllocation) {
        var ONE_HUNDRED_PERCENT = util_1.ether(1);
        this.commonAssertions.isLessOrEqualThan(newAllocation, ONE_HUNDRED_PERCENT, errors_1.socialTradingErrors.ALLOCATION_EXCEEDS_ONE_HUNDERED_PERCENT(newAllocation));
    };
    /**
     * Throws if the passed allocation is not multiple of 1%
     *
     * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
     */
    SocialTradingAssertions.prototype.allocationMultipleOfOnePercent = function (newAllocation) {
        var ONE_PERCENT = util_1.ether(.01);
        this.commonAssertions.isMultipleOf(newAllocation, ONE_PERCENT, errors_1.socialTradingErrors.ALLOCATION_NOT_MULTIPLE_OF_ONE_PERCENT(newAllocation));
    };
    /**
     * Throws if the passed fee is not multiple of 1 basis point
     *
     * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
     */
    SocialTradingAssertions.prototype.feeMultipleOfOneBasisPoint = function (fee) {
        var ONE_BASIS_POINT = util_1.ether(.0001);
        this.commonAssertions.isMultipleOf(fee, ONE_BASIS_POINT, errors_1.socialTradingErrors.FEE_NOT_MULTIPLE_OF_ONE_BASIS_POINT(fee));
    };
    /**
     * Throws if the passed fee is not multiple of 1 basis point
     *
     * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
     */
    SocialTradingAssertions.prototype.feeDoesNotExceedMax = function (manager, fee) {
        return __awaiter(this, void 0, void 0, function () {
            var socialTradingInstance, maxFee;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_strategies_1.SocialTradingManagerContract.at(manager, this.web3, {})];
                    case 1:
                        socialTradingInstance = _a.sent();
                        return [4 /*yield*/, socialTradingInstance.maxEntryFee.callAsync()];
                    case 2:
                        maxFee = _a.sent();
                        this.commonAssertions.isLessOrEqualThan(fee, maxFee, errors_1.socialTradingErrors.FEE_EXCEEDS_MAX_FEE(fee, maxFee));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if caller is not the trader of tradingPool
     *
     * @param  trader         Trader of trading pool
     * @param  caller         Caller of transaction
     */
    SocialTradingAssertions.prototype.isTrader = function (trader, caller) {
        this.commonAssertions.isEqualAddress(trader, caller, errors_1.socialTradingErrors.NOT_TRADER(caller));
    };
    /**
     * Throws if caller is not the trader of tradingPool
     *
     * @param  trader         Trader of trading pool
     * @param  caller         Caller of transaction
     */
    SocialTradingAssertions.prototype.feeChangeInitiated = function (feeChangeTimestamp) {
        this.commonAssertions.greaterThanZero(feeChangeTimestamp, errors_1.socialTradingErrors.FEE_UPDATE_NOT_INITIATED());
    };
    /**
     * Throws if caller is not the trader of tradingPool
     *
     * @param  trader         Trader of trading pool
     * @param  caller         Caller of transaction
     */
    SocialTradingAssertions.prototype.feeChangeTimelockElapsed = function (feeChangeTimestamp) {
        var validUpdateTime = feeChangeTimestamp.mul(1000);
        var currentTimeStamp = new util_1.BigNumber(Date.now());
        if (validUpdateTime.greaterThan(currentTimeStamp)) {
            var validUpdateFormattedDate = moment(validUpdateTime.toNumber())
                .format('dddd, MMMM Do YYYY, h:mm:ss a');
            throw new Error(errors_1.socialTradingErrors.INSUFFICIENT_TIME_PASSED(validUpdateFormattedDate));
        }
    };
    return SocialTradingAssertions;
}());
exports.SocialTradingAssertions = SocialTradingAssertions;
//# sourceMappingURL=SocialTradingAssertions.js.map