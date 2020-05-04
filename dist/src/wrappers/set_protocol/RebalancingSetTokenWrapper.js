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
Object.defineProperty(exports, "__esModule", { value: true });
var ProtocolContractWrapper_1 = require("./ProtocolContractWrapper");
var util_1 = require("../../util");
/**
 * @title  RebalancingSetTokenWrapper
 * @author Set Protocol
 *
 * The Rebalancing Set Token API handles all functions on the Rebalancing Set Token smart contract.
 *
 */
var RebalancingSetTokenWrapper = /** @class */ (function () {
    function RebalancingSetTokenWrapper(web3) {
        this.web3 = web3;
        this.contracts = new ProtocolContractWrapper_1.ProtocolContractWrapper(this.web3);
    }
    /**
     * Proposes rebalance, can only be called by manager
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  nextSetAddress                 Set to rebalance into
     * @param  auctionLibrary                 Address of auction price curve to use
     * @param  auctionTimeToPivot             Amount of time until curve hits pivot
     * @param  auctionStartPrice              Used with priceNumerator, define auction start price
     * @param  auctionPivotPrice              Used with priceNumerator, price curve pivots at
     * @param  txOpts                         Transaction options
     * @return                                Transaction hash
     */
    RebalancingSetTokenWrapper.prototype.propose = function (rebalancingSetAddress, nextSet, auctionLibrary, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.propose.sendTransactionAsync(nextSet, auctionLibrary, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Starts rebalance after proposal period has elapsed
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  txOpts                  Transaction options
     * @return                         Transaction hash
     */
    RebalancingSetTokenWrapper.prototype.startRebalance = function (rebalancingSetAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.startRebalance.sendTransactionAsync(txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Settles rebalance after currentSets been rebalanced
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  txOpts                  Transaction options
     * @return                         Transaction hash
     */
    RebalancingSetTokenWrapper.prototype.settleRebalance = function (rebalancingSetAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.settleRebalance.sendTransactionAsync(txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Change token manager address
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  newManager              Address of new manager
     * @param  txOpts                  Transaction options
     * @return                         Transaction hash
     */
    RebalancingSetTokenWrapper.prototype.setManager = function (rebalancingSetAddress, newManager, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.setManager.sendTransactionAsync(newManager, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Ends a failed auction
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  txOpts                  Transaction options
     * @return                         Transaction hash
     */
    RebalancingSetTokenWrapper.prototype.endFailedAuction = function (rebalancingSetAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.endFailedAuction.sendTransactionAsync(txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets token inflow and outflows for current rebalance price
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  quantity                Amount of currentSet to rebalance
     * @return                         Array of token inflows
     * @return                         Array of token outflows
     */
    RebalancingSetTokenWrapper.prototype.getBidPrice = function (rebalancingSetAddress, quantity) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, tokenFlows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getBidPrice.callAsync(quantity)];
                    case 2:
                        tokenFlows = _a.sent();
                        return [2 /*return*/, { inflow: tokenFlows[0], outflow: tokenFlows[1] }];
                }
            });
        });
    };
    /**
     * Returns if passed Set is collateralizing the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @param  component               Address of collateral component
     * @return                         Boolean if component collateralizing Rebalancing Set
     */
    RebalancingSetTokenWrapper.prototype.tokenIsComponent = function (rebalancingSetAddress, component) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.tokenIsComponent.callAsync(component)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets manager of the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The manager's address
     */
    RebalancingSetTokenWrapper.prototype.manager = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.manager.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets state of the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The state of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.rebalanceState = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, stateNumber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.rebalanceState.callAsync()];
                    case 2:
                        stateNumber = _a.sent();
                        return [2 /*return*/, util_1.parseRebalanceState(stateNumber)];
                }
            });
        });
    };
    /**
     * Gets address of the currentSet for the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The currentSet of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.currentSet = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.currentSet.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets unitShares of the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The unitShares of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.unitShares = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.unitShares.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets naturalUnit of the Rebalancing Set
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The naturalUnit of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.naturalUnit = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.naturalUnit.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets Unix timestamp of last rebalance for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The lastRebalanceTimestamp of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.lastRebalanceTimestamp = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.lastRebalanceTimestamp.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets length of the proposal period for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The proposalPeriod of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.proposalPeriod = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.proposalPeriod.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets time between rebalances for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The rebalanceInterval of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.rebalanceInterval = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.rebalanceInterval.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets start time of proposal period for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The proposalStartTime of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.proposalStartTime = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.proposalStartTime.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets nextSet for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The nextSet of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.nextSet = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.nextSet.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets address of auctionLibrary for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionLibrary address of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.auctionLibrary = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.auctionLibrary.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets startingCurrentSetAmount for the Rebalancing Set Token.
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The starting Current Set AMount of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.startingCurrentSetAmount = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.startingCurrentSetAmount.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets auctionParameters struct for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionLibrary address of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.auctionParameters = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.auctionPriceParameters.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets minimumBid for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The minimumBid of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.minimumBid = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, minimumBid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.biddingParameters.callAsync()];
                    case 2:
                        minimumBid = (_a.sent())[0];
                        return [2 /*return*/, minimumBid];
                }
            });
        });
    };
    /**
     * Gets combinedTokenArray for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The combinedTokenArray of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.getCombinedTokenArray = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getCombinedTokenArray.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets combinedCurrentUnits for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The combinedCurrentUnits of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.getCombinedCurrentUnits = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getCombinedCurrentUnits.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets combinedNextSetUnits for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The combinedNextSetUnits of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.getCombinedNextSetUnits = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getCombinedNextSetUnits.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets remainingCurrentSets for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The remainingCurrentSets of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.remainingCurrentSets = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, _a, remainingCurrentSets;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _b.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.biddingParameters.callAsync()];
                    case 2:
                        _a = _b.sent(), remainingCurrentSets = _a[1];
                        return [2 /*return*/, remainingCurrentSets];
                }
            });
        });
    };
    /**
     * Gets auctionStartTime for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionStartTime of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.auctionStartTime = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, auctionStartTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getAuctionPriceParameters.callAsync()];
                    case 2:
                        auctionStartTime = (_a.sent())[0];
                        return [2 /*return*/, auctionStartTime];
                }
            });
        });
    };
    /**
     * Gets auctionTimeToPivot for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionTimeToPivot of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.auctionTimeToPivot = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, _a, auctionTimeToPivot;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _b.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getAuctionPriceParameters.callAsync()];
                    case 2:
                        _a = _b.sent(), auctionTimeToPivot = _a[1];
                        return [2 /*return*/, auctionTimeToPivot];
                }
            });
        });
    };
    /**
     * Gets auctionStartPrice for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionStartPrice of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.auctionStartPrice = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, _a, auctionStartPrice;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _b.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getAuctionPriceParameters.callAsync()];
                    case 2:
                        _a = _b.sent(), auctionStartPrice = _a[2];
                        return [2 /*return*/, auctionStartPrice];
                }
            });
        });
    };
    /**
     * Gets auctionPivotPrice for the Rebalancing Set Token
     *
     * @param  rebalancingSetAddress   Address of the Set
     * @return                         The auctionPivotPrice of the RebalancingSetToken
     */
    RebalancingSetTokenWrapper.prototype.auctionPivotPrice = function (rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetTokenInstance, _a, auctionPivotPrice;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetTokenAsync(rebalancingSetAddress)];
                    case 1:
                        rebalancingSetTokenInstance = _b.sent();
                        return [4 /*yield*/, rebalancingSetTokenInstance.getAuctionPriceParameters.callAsync()];
                    case 2:
                        _a = _b.sent(), auctionPivotPrice = _a[3];
                        return [2 /*return*/, auctionPivotPrice];
                }
            });
        });
    };
    return RebalancingSetTokenWrapper;
}());
exports.RebalancingSetTokenWrapper = RebalancingSetTokenWrapper;
//# sourceMappingURL=RebalancingSetTokenWrapper.js.map