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
var StrategyContractWrapper_1 = require("./StrategyContractWrapper");
var util_1 = require("../../util");
/**
 * @title  MACOStrategyManagerBaseWrapper
 * @author Set Protocol
 *
 * The MACOStrategyManagerBaseWrapper handles all functions shared on the MACOStrategyManager
 * V1 and V2 smart contract.
 *
 */
var MACOStrategyManagerBaseWrapper = /** @class */ (function () {
    function MACOStrategyManagerBaseWrapper(web3) {
        this.web3 = web3;
        this.contracts = new StrategyContractWrapper_1.StrategyContractWrapper(this.web3);
    }
    /**
     * Calls a rebalancing MACO Strategy manager's intialPropose function. This function kicks off a propose cycle on the
     * manager by checking that the time and price constraints have been met then logging a timestamp used later in the
     * process to confirm the signal.
     *
     * @param  managerAddress               Address of the rebalancing manager contract
     * @return                              The hash of the resulting transaction.
     */
    MACOStrategyManagerBaseWrapper.prototype.initialPropose = function (managerAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance, txOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 2:
                        txOptions = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.initialPropose.sendTransactionAsync(txOptions)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Calls a rebalancing MACO Strategy manager's confirmPropose function. This function again checks to make sure that
     * price and time constraints have been satisfied. After that it generates the new allocation proposal and sends the
     * results to the Rebalancing Set Token to kick off the official rebalance.
     *
     * @param  managerAddress               Address of the rebalancing manager contract
     * @return                              The hash of the resulting transaction.
     */
    MACOStrategyManagerBaseWrapper.prototype.confirmPropose = function (managerAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance, txOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 2:
                        txOptions = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.confirmPropose.sendTransactionAsync(txOptions)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.coreAddress = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.coreAddress.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.rebalancingSetTokenAddress = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.rebalancingSetTokenAddress.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.stableAssetAddress = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.stableAssetAddress.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.riskAssetAddress = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.riskAssetAddress.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.stableCollateralAddress = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.stableCollateralAddress.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.riskCollateralAddress = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.riskCollateralAddress.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.setTokenFactory = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.setTokenFactory.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.auctionLibrary = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.auctionLibrary.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.movingAverageDays = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.movingAverageDays.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.lastCrossoverConfirmationTimestamp = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.lastCrossoverConfirmationTimestamp.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.crossoverConfirmationMinTime = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.crossoverConfirmationMinTime.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.crossoverConfirmationMaxTime = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.crossoverConfirmationMaxTime.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOStrategyManagerBaseWrapper.prototype.auctionTimeToPivot = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var macoStrategyManagerInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadMACOStrategyManagerContractAsync(managerAddress)];
                    case 1:
                        macoStrategyManagerInstance = _a.sent();
                        return [4 /*yield*/, macoStrategyManagerInstance.auctionTimeToPivot.callAsync()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return MACOStrategyManagerBaseWrapper;
}());
exports.MACOStrategyManagerBaseWrapper = MACOStrategyManagerBaseWrapper;
//# sourceMappingURL=MACOStrategyManagerBaseWrapper.js.map