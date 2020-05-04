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
var ProtocolContractWrapper_1 = require("./ProtocolContractWrapper");
/**
 * @title  ProtocolViewerWrapper
 * @author Set Protocol
 *
 * The ProtocolViewerWrapper handles all functions on the Protocol Viewer smart contract.
 *
 */
var ProtocolViewerWrapper = /** @class */ (function () {
    function ProtocolViewerWrapper(web3, protocolViewerAddress) {
        this.web3 = web3;
        this.protocolViewerAddress = protocolViewerAddress;
        this.contracts = new ProtocolContractWrapper_1.ProtocolContractWrapper(this.web3);
    }
    /**
     * Fetches multiple balances for passed in array of ERC20 contract addresses for an owner
     *
     * @param  tokenAddresses    Addresses of ERC20 contracts to check balance for
     * @param  owner             Address to check balance of tokenAddress for
     */
    ProtocolViewerWrapper.prototype.batchFetchBalancesOf = function (tokenAddresses, owner) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchBalancesOf.callAsync(tokenAddresses, owner)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches token balances for each tokenAddress, tokenOwner pair
     *
     * @param  tokenAddresses    Addresses of ERC20 contracts to check balance for
     * @param  tokenOwners       Addresses of users sequential to tokenAddress to fetch balance for
     */
    ProtocolViewerWrapper.prototype.batchFetchUsersBalances = function (tokenAddresses, tokenOwners) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchUsersBalances.callAsync(tokenAddresses, tokenOwners)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches multiple supplies for passed in array of ERC20 contract addresses
     *
     * @param  tokenAddresses    Addresses of ERC20 contracts to check supply for
     */
    ProtocolViewerWrapper.prototype.batchFetchSupplies = function (tokenAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchSupplies.callAsync(tokenAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches all RebalancingSetToken state associated with a rebalance proposal
     *
     * @param  rebalancingSetTokenAddress    RebalancingSetToken contract instance address
     */
    ProtocolViewerWrapper.prototype.fetchRebalanceProposalStateAsync = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.fetchRebalanceProposalStateAsync.callAsync(rebalancingSetTokenAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches all RebalancingSetToken state associated with a new rebalance auction
     *
     * @param  rebalancingSetTokenAddress    RebalancingSetToken contract instance address
     */
    ProtocolViewerWrapper.prototype.fetchRebalanceAuctionStateAsync = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.fetchRebalanceAuctionStateAsync.callAsync(rebalancingSetTokenAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches all rebalance states for an array of RebalancingSetToken contracts
     *
     * @param  rebalancingSetTokenAddresses[]    RebalancingSetToken contract instance addresses
     */
    ProtocolViewerWrapper.prototype.batchFetchRebalanceStateAsync = function (rebalancingSetTokenAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchRebalanceStateAsync.callAsync(rebalancingSetTokenAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches all unitShares for an array of RebalancingSetToken contracts
     *
     * @param  rebalancingSetTokenAddresses[]    RebalancingSetToken contract instance addresses
     */
    ProtocolViewerWrapper.prototype.batchFetchUnitSharesAsync = function (rebalancingSetTokenAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchUnitSharesAsync.callAsync(rebalancingSetTokenAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches state of trading pool info, underlying RebalancingSetTokenV2, and current collateralSet.
     *
     * @param  tradingPoolAddress      RebalancingSetTokenV2 contract address of tradingPool
     */
    ProtocolViewerWrapper.prototype.fetchNewTradingPoolDetails = function (tradingPoolAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.fetchNewTradingPoolDetails.callAsync(tradingPoolAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches state of trading pool v2 info, underlying RebalancingSetTokenV3, performance fee info
     * and current collateralSet.
     *
     * @param  tradingPoolAddress      RebalancingSetTokenV3 contract address of tradingPool
     */
    ProtocolViewerWrapper.prototype.fetchNewTradingPoolV2Details = function (tradingPoolAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.fetchNewTradingPoolV2Details.callAsync(tradingPoolAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches rebalance state of trading pool info, underlying RebalancingSetTokenV2, and current
     * collateralSet.
     *
     * @param  tradingPoolAddress      RebalancingSetTokenV2 contract address of tradingPool
     */
    ProtocolViewerWrapper.prototype.fetchTradingPoolRebalanceDetails = function (tradingPoolAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.fetchTradingPoolRebalanceDetails.callAsync(tradingPoolAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches all trading pool operators for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    ProtocolViewerWrapper.prototype.batchFetchTradingPoolOperator = function (tradingPoolAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchTradingPoolOperator.callAsync(tradingPoolAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches all entry fees for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    ProtocolViewerWrapper.prototype.batchFetchTradingPoolEntryFees = function (tradingPoolAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchTradingPoolEntryFees.callAsync(tradingPoolAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches all rebalance fees for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    ProtocolViewerWrapper.prototype.batchFetchTradingPoolRebalanceFees = function (tradingPoolAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchTradingPoolRebalanceFees.callAsync(tradingPoolAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches all profit and streaming fees for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    ProtocolViewerWrapper.prototype.batchFetchTradingPoolAccumulation = function (tradingPoolAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchTradingPoolAccumulation.callAsync(tradingPoolAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches all performance fee state info for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    ProtocolViewerWrapper.prototype.batchFetchTradingPoolFeeState = function (tradingPoolAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchTradingPoolFeeState.callAsync(tradingPoolAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches cToken exchange rate stored for an array of cToken addresses
     *
     * @param  cTokenAddresses[]    CToken contract instance addresses
     */
    ProtocolViewerWrapper.prototype.batchFetchExchangeRateStored = function (cTokenAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchExchangeRateStored.callAsync(cTokenAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the crossover confirmation timestamp given an array of MACO V2 managers
     *
     * @param  managerAddresses[]    Manager contract instance addresses
     */
    ProtocolViewerWrapper.prototype.batchFetchMACOV2CrossoverTimestamp = function (managerAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchMACOV2CrossoverTimestamp.callAsync(managerAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the crossover confirmation timestamp given an array of Asset Pair managers
     *
     * @param  managerAddresses[]    Manager contract instance addresses
     */
    ProtocolViewerWrapper.prototype.batchFetchAssetPairCrossoverTimestamp = function (managerAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolViewerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadProtocolViewerContract(this.protocolViewerAddress)];
                    case 1:
                        protocolViewerInstance = _a.sent();
                        return [4 /*yield*/, protocolViewerInstance.batchFetchAssetPairCrossoverTimestamp.callAsync(managerAddresses)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return ProtocolViewerWrapper;
}());
exports.ProtocolViewerWrapper = ProtocolViewerWrapper;
//# sourceMappingURL=ProtocolViewerWrapper.js.map