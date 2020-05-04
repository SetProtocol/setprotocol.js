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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __importStar(require("lodash"));
var CommonAssertions_1 = require("./CommonAssertions");
var ERC20Assertions_1 = require("./ERC20Assertions");
var set_protocol_contracts_1 = require("set-protocol-contracts");
var errors_1 = require("../errors");
var util_1 = require("../util");
var common_1 = require("../types/common");
var moment = require('moment');
var RebalancingAssertions = /** @class */ (function () {
    function RebalancingAssertions(web3) {
        this.web3 = web3;
        this.commonAssertions = new CommonAssertions_1.CommonAssertions();
        this.erc20Assertions = new ERC20Assertions_1.ERC20Assertions(this.web3);
    }
    /**
     * Throws if the proposal details cannot be fetched
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.canFetchProposalDetails = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, currentState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.rebalanceState.callAsync()];
                    case 2:
                        currentState = _a.sent();
                        if (currentState.lt(common_1.RebalancingState.PROPOSAL)) {
                            throw new Error(errors_1.rebalancingErrors.INCORRECT_STATE(rebalancingSetTokenAddress, 'Proposal'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if the rebalance details cannot be fetched
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.canFetchRebalanceState = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, currentState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.rebalanceState.callAsync()];
                    case 2:
                        currentState = _a.sent();
                        if (currentState.lt(common_1.RebalancingState.REBALANCE)) {
                            throw new Error(errors_1.rebalancingErrors.INCORRECT_STATE(rebalancingSetTokenAddress, 'Rebalance'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if given rebalancingSetToken in Rebalance state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.isNotInRebalanceState = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, currentState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.rebalanceState.callAsync()];
                    case 2:
                        currentState = _a.sent();
                        if (currentState.eq(common_1.RebalancingState.REBALANCE)) {
                            throw new Error(errors_1.rebalancingErrors.REBALANCE_IN_PROGRESS(rebalancingSetTokenAddress));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if given rebalancingSetToken is not in Default state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.isNotInDefaultState = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, currentState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.rebalanceState.callAsync()];
                    case 2:
                        currentState = _a.sent();
                        if (!currentState.eq(common_1.RebalancingState.DEFAULT)) {
                            throw new Error(errors_1.rebalancingErrors.INCORRECT_STATE(rebalancingSetTokenAddress, 'Default'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if given rebalancingSetToken is not in Proposal state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.isInProposalState = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, currentState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.rebalanceState.callAsync()];
                    case 2:
                        currentState = _a.sent();
                        if (!currentState.eq(common_1.RebalancingState.PROPOSAL)) {
                            throw new Error(errors_1.rebalancingErrors.INCORRECT_STATE(rebalancingSetTokenAddress, 'Proposal'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if given rebalancingSetToken is not in Rebalance state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.isInRebalanceState = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, currentState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.rebalanceState.callAsync()];
                    case 2:
                        currentState = _a.sent();
                        if (!currentState.eq(common_1.RebalancingState.REBALANCE)) {
                            throw new Error(errors_1.rebalancingErrors.INCORRECT_STATE(rebalancingSetTokenAddress, 'Rebalance'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if given rebalancingSetToken is not in Drawdown state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.isInDrawdownState = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, currentState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.rebalanceState.callAsync()];
                    case 2:
                        currentState = _a.sent();
                        if (!currentState.eq(common_1.RebalancingState.DRAWDOWN)) {
                            throw new Error(errors_1.rebalancingErrors.INCORRECT_STATE(rebalancingSetTokenAddress, 'Drawdown'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if caller of rebalancingSetToken is not manager
     *
     * @param  caller   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.isManager = function (rebalancingSetTokenAddress, caller) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, manager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.manager.callAsync()];
                    case 2:
                        manager = _a.sent();
                        this.commonAssertions.isEqualAddress(manager, caller, errors_1.rebalancingErrors.NOT_REBALANCING_MANAGER(caller));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if not enough time passed between last rebalance on rebalancing set token
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.sufficientTimeBetweenRebalance = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, lastRebalanceTime, rebalanceInterval, nextAvailableRebalance, currentTimeStamp, nextRebalanceFormattedDate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.lastRebalanceTimestamp.callAsync()];
                    case 2:
                        lastRebalanceTime = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.rebalanceInterval.callAsync()];
                    case 3:
                        rebalanceInterval = _a.sent();
                        nextAvailableRebalance = lastRebalanceTime.add(rebalanceInterval).mul(1000);
                        currentTimeStamp = new util_1.BigNumber(Date.now());
                        if (nextAvailableRebalance.greaterThan(currentTimeStamp)) {
                            nextRebalanceFormattedDate = moment(nextAvailableRebalance.toNumber())
                                .format('dddd, MMMM Do YYYY, h:mm:ss a');
                            throw new Error(errors_1.rebalancingErrors.INSUFFICIENT_TIME_PASSED(nextRebalanceFormattedDate));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if not enough time passed between last rebalance on rebalancing set token
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     * @param  nextSetAddress               The address of the nextSet being proposed
     */
    RebalancingAssertions.prototype.nextSetIsMultiple = function (rebalancingSetTokenAddress, nextSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, currentSetAddress, currentSetInstance, nextSetInstance, currentSetNaturalUnit, nextSetNaturalUnit, maxNaturalUnit, minNaturalUnit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.currentSet.callAsync()];
                    case 2:
                        currentSetAddress = _a.sent();
                        return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(currentSetAddress, this.web3, {})];
                    case 3:
                        currentSetInstance = _a.sent();
                        return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(nextSetAddress, this.web3, {})];
                    case 4:
                        nextSetInstance = _a.sent();
                        return [4 /*yield*/, currentSetInstance.naturalUnit.callAsync()];
                    case 5:
                        currentSetNaturalUnit = _a.sent();
                        return [4 /*yield*/, nextSetInstance.naturalUnit.callAsync()];
                    case 6:
                        nextSetNaturalUnit = _a.sent();
                        maxNaturalUnit = util_1.BigNumber.max(currentSetNaturalUnit, nextSetNaturalUnit);
                        minNaturalUnit = util_1.BigNumber.min(currentSetNaturalUnit, nextSetNaturalUnit);
                        if (!maxNaturalUnit.mod(minNaturalUnit).isZero()) {
                            throw new Error(errors_1.rebalancingErrors.PROPOSED_SET_NATURAL_UNIT_IS_NOT_MULTIPLE_OF_CURRENT_SET(currentSetAddress, nextSetAddress));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if given price curve is not approved in Core
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.isValidPriceCurve = function (priceCurve, coreAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, isValidCurve;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.CoreContract.at(coreAddress, this.web3, {})];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.validPriceLibraries.callAsync(priceCurve)];
                    case 2:
                        isValidCurve = _a.sent();
                        if (!isValidCurve) {
                            throw new Error(errors_1.rebalancingErrors.NOT_VALID_PRICE_CURVE(priceCurve));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if not enough time passed in proposal state
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.sufficientTimeInProposalState = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, proposalStartTime, proposalPeriod, nextAvailableRebalance, currentTimeStamp, nextRebalanceFormattedDate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.proposalStartTime.callAsync()];
                    case 2:
                        proposalStartTime = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.proposalPeriod.callAsync()];
                    case 3:
                        proposalPeriod = _a.sent();
                        nextAvailableRebalance = proposalStartTime.add(proposalPeriod).mul(1000);
                        currentTimeStamp = new util_1.BigNumber(Date.now());
                        if (nextAvailableRebalance.greaterThan(currentTimeStamp)) {
                            nextRebalanceFormattedDate = moment(nextAvailableRebalance.toNumber()).format('dddd, MMMM Do YYYY, h:mm:ss a');
                            throw new Error(errors_1.rebalancingErrors.INSUFFICIENT_TIME_PASSED(nextRebalanceFormattedDate));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if not enough current sets rebalanced in auction
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.enoughSetsRebalanced = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, _a, minimumBid, remainingCurrentSets;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _b.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getBiddingParameters.callAsync()];
                    case 2:
                        _a = _b.sent(), minimumBid = _a[0], remainingCurrentSets = _a[1];
                        if (remainingCurrentSets.greaterThanOrEqualTo(minimumBid)) {
                            throw new Error(errors_1.rebalancingErrors.NOT_ENOUGH_SETS_REBALANCED(rebalancingSetTokenAddress, minimumBid.toString(), remainingCurrentSets.toString()));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if not past pivot time
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.passedPivotTime = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, _a, auctionStartTime, auctionTimeToPivot, pivotTimeStart, currentTimeStamp, pivotTimeStartFormattedDate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _b.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getAuctionPriceParameters.callAsync()];
                    case 2:
                        _a = _b.sent(), auctionStartTime = _a[0], auctionTimeToPivot = _a[1];
                        pivotTimeStart = auctionStartTime.add(auctionTimeToPivot).mul(1000);
                        currentTimeStamp = new util_1.BigNumber(Date.now());
                        if (pivotTimeStart.greaterThanOrEqualTo(currentTimeStamp)) {
                            pivotTimeStartFormattedDate = moment(pivotTimeStart.toNumber()).format('dddd, MMMM Do YYYY, h:mm:ss a');
                            throw new Error(errors_1.rebalancingErrors.PIVOT_TIME_NOT_PASSED(pivotTimeStartFormattedDate));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if auction has no remaining bids
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     */
    RebalancingAssertions.prototype.enoughRemainingBids = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, _a, minimumBid, remainingCurrentSets;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _b.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getBiddingParameters.callAsync()];
                    case 2:
                        _a = _b.sent(), minimumBid = _a[0], remainingCurrentSets = _a[1];
                        if (remainingCurrentSets.lessThan(minimumBid)) {
                            throw new Error(errors_1.rebalancingErrors.NOT_VALID_DRAWDOWN(rebalancingSetTokenAddress));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if user bids to rebalance an amount of current set token that is greater than amount of current set
     * token remaining.
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     * @param  bidQuantity                  The amount of current set the user is seeking to rebalance
     */
    RebalancingAssertions.prototype.bidAmountLessThanRemainingSets = function (rebalancingSetTokenAddress, bidQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, _a, remainingCurrentSets;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _b.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getBiddingParameters.callAsync()];
                    case 2:
                        _a = _b.sent(), remainingCurrentSets = _a[1];
                        if (bidQuantity.greaterThan(remainingCurrentSets)) {
                            throw new Error(errors_1.rebalancingErrors.BID_AMOUNT_EXCEEDS_REMAINING_CURRENT_SETS(remainingCurrentSets.toString(), bidQuantity.toString()));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if user bids to rebalance an amount of current set token that is not a multiple of the minimumBid.
     *
     * @param  rebalancingSetTokenAddress   The address of the rebalancing set token
     * @param  bidQuantity                  The amount of current set the user is seeking to rebalance
     */
    RebalancingAssertions.prototype.bidIsMultipleOfMinimumBid = function (rebalancingSetTokenAddress, bidQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, minimumBid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getBiddingParameters.callAsync()];
                    case 2:
                        minimumBid = (_a.sent())[0];
                        if (!bidQuantity.modulo(minimumBid).isZero()) {
                            throw new Error(errors_1.rebalancingErrors.BID_AMOUNT_NOT_MULTIPLE_OF_MINIMUM_BID(bidQuantity.toString(), minimumBid.toString()));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
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
    RebalancingAssertions.prototype.hasSufficientBalances = function (rebalancingSetTokenAddress, ownerAddress, quantity, exclusions) {
        if (exclusions === void 0) { exclusions = []; }
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, inflowArray, components, componentsFilteredForExclusions, componentInstancePromises, componentInstances, userHasSufficientBalancePromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getBidPrice.callAsync(quantity)];
                    case 2:
                        inflowArray = (_a.sent())[0];
                        return [4 /*yield*/, rebalancingSetTokenInstance.getCombinedTokenArray.callAsync()];
                    case 3:
                        components = _a.sent();
                        componentsFilteredForExclusions = _.difference(components, exclusions);
                        componentInstancePromises = _.map(componentsFilteredForExclusions, function (component) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, set_protocol_contracts_1.ERC20DetailedContract.at(component, this.web3, { from: ownerAddress })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); });
                        return [4 /*yield*/, Promise.all(componentInstancePromises)];
                    case 4:
                        componentInstances = _a.sent();
                        userHasSufficientBalancePromises = _.map(componentInstances, function (componentInstance, index) { return __awaiter(_this, void 0, void 0, function () {
                            var requiredBalance;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        requiredBalance = inflowArray[index];
                                        return [4 /*yield*/, this.erc20Assertions.hasSufficientBalanceAsync(componentInstance.address, ownerAddress, requiredBalance)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(userHasSufficientBalancePromises)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAssertions.prototype.isOutsideAllocationBounds = function (quantity, lowerBound, upperBound, errorMessage) {
        if (quantity.gte(lowerBound) && quantity.lt(upperBound)) {
            throw new Error(errorMessage);
        }
    };
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
    RebalancingAssertions.prototype.hasSufficientAllowances = function (rebalancingSetTokenAddress, ownerAddress, spenderAddress, quantity, exclusions) {
        if (exclusions === void 0) { exclusions = []; }
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, inflowArray, components, componentsFilteredForExclusions, componentInstancePromises, componentInstances, userHasSufficientAllowancePromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getBidPrice.callAsync(quantity)];
                    case 2:
                        inflowArray = (_a.sent())[0];
                        return [4 /*yield*/, rebalancingSetTokenInstance.getCombinedTokenArray.callAsync()];
                    case 3:
                        components = _a.sent();
                        componentsFilteredForExclusions = _.difference(components, exclusions);
                        componentInstancePromises = _.map(componentsFilteredForExclusions, function (component) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, set_protocol_contracts_1.ERC20DetailedContract.at(component, this.web3, { from: ownerAddress })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); });
                        return [4 /*yield*/, Promise.all(componentInstancePromises)];
                    case 4:
                        componentInstances = _a.sent();
                        userHasSufficientAllowancePromises = _.map(componentInstances, function (componentInstance, index) { return __awaiter(_this, void 0, void 0, function () {
                            var requiredBalance;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        requiredBalance = inflowArray[index];
                                        return [4 /*yield*/, this.erc20Assertions.hasSufficientAllowanceAsync(componentInstance.address, ownerAddress, spenderAddress, requiredBalance)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(userHasSufficientAllowancePromises)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if the given user doesn't have a sufficient Ether value passed into function
     * injected for a bid.
     *
     * @param  rebalancingSetTokenAddress  The address of the Rebalancing Set Token contract
     * @param  quantity                    Amount of a Set in base units
     * @param  wrappedEtherAddress         Wrapped Ether address
     * @param  etherValue                  Ether value sent in transaction
     */
    RebalancingAssertions.prototype.hasRequiredEtherValue = function (rebalancingSetTokenAddress, quantity, wrappedEtherAddress, etherValue) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, inflowArray, components, indexOfWrappedEther, requiredWrappedEtherQuantity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, {})];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getBidPrice.callAsync(quantity)];
                    case 2:
                        inflowArray = (_a.sent())[0];
                        return [4 /*yield*/, rebalancingSetTokenInstance.getCombinedTokenArray.callAsync()];
                    case 3:
                        components = _a.sent();
                        indexOfWrappedEther = components.indexOf(wrappedEtherAddress);
                        // If components not in bid skip assertion
                        if (indexOfWrappedEther >= 0) {
                            requiredWrappedEtherQuantity = inflowArray[indexOfWrappedEther];
                            this.commonAssertions.isGreaterOrEqualThan(etherValue, requiredWrappedEtherQuantity, 'Ether value must be greater than required wrapped ether quantity');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return RebalancingAssertions;
}());
exports.RebalancingAssertions = RebalancingAssertions;
//# sourceMappingURL=RebalancingAssertions.js.map