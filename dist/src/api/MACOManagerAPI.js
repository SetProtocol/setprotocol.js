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
var util_1 = require("../util");
var wrappers_1 = require("../wrappers");
/**
 * @title MACOManagerAPI
 * @author Set Protocol
 *
 * A library for interacting with MovingAverageManager Manager
 */
var MACOManagerAPI = /** @class */ (function () {
    /**
     * Instantiates a new MACOManagerAPI instance that contains methods for interacting with
     * the Moving Average Crossover Manager.
     *
     * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param core        An instance of CoreWrapper to interact with the deployed Core contract
     */
    function MACOManagerAPI(web3, assertions) {
        this.macoStrategyManager = new wrappers_1.MACOStrategyManagerWrapper(web3);
        this.assert = assertions;
        this.setToken = new wrappers_1.SetTokenWrapper(web3);
        this.priceFeed = new wrappers_1.PriceFeedWrapper(web3);
        this.movingAverageOracleWrapper = new wrappers_1.MovingAverageOracleWrapper(web3);
        this.rebalancingSetToken = new wrappers_1.RebalancingSetTokenWrapper(web3);
    }
    /**
     * This function is callable by anyone to advance the state of the Moving Average Crossover (MACO) manager.
     * To successfully call propose, the rebalancing Set must be in a rebalancable state and there must
     * be a crossover between the current price and the moving average oracle.
     * To successfully generate a proposal, this function needs to be called twice. The initial call is to
     * note that a crossover has occurred. The second call is to confirm the signal (must be called 6-12 hours)
     * after the initial call. When the confirmPropose is called, this function will generate
     * a proposal on the rebalancing set token.
     *
     * @param  macoManager   Address of the Moving Average Crossover Manager contract
     * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return               Transaction hash
     */
    MACOManagerAPI.prototype.initiateCrossoverProposeAsync = function (macoManager, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertInitialPropose(macoManager)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.macoStrategyManager.initialPropose(macoManager, txOpts)];
                    case 2: 
                    // If current timestamp > 12 hours since the last, call initialPropose
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MACOManagerAPI.prototype.confirmCrossoverProposeAsync = function (macoManager, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertConfirmPropose(macoManager)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.macoStrategyManager.confirmPropose(macoManager, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the lastCrossoverConfirmationTimestamp of the Moving Average Crossover Manager contract.
     *
     * @param  macoManager         Address of the Moving Average Crossover Manager contract
     * @return                     BigNumber containing the lastCrossoverConfirmationTimestamp
     */
    MACOManagerAPI.prototype.getLastCrossoverConfirmationTimestampAsync = function (macoManager) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('macoManager', macoManager);
                        return [4 /*yield*/, this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManager)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the state variables of the Moving Average Crossover Manager contract.
     *
     * @param  macoManager         Address of the Moving Average Crossover Manager contract
     * @return                     Object containing the state information related to the manager
     */
    MACOManagerAPI.prototype.getMovingAverageManagerDetailsAsync = function (macoManager) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, auctionLibrary, auctionTimeToPivot, core, lastCrossoverConfirmationTimestamp, movingAverageDays, movingAveragePriceFeed, rebalancingSetToken, _b, riskAsset, riskCollateral, setTokenFactory, stableAsset, stableCollateral, crossoverConfirmationMinTime, crossoverConfirmationMaxTime;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.macoStrategyManager.auctionLibrary(macoManager),
                            this.macoStrategyManager.auctionTimeToPivot(macoManager),
                            this.macoStrategyManager.coreAddress(macoManager),
                            this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManager),
                            this.macoStrategyManager.movingAverageDays(macoManager),
                            this.macoStrategyManager.movingAveragePriceFeed(macoManager),
                            this.macoStrategyManager.rebalancingSetTokenAddress(macoManager),
                        ])];
                    case 1:
                        _a = _c.sent(), auctionLibrary = _a[0], auctionTimeToPivot = _a[1], core = _a[2], lastCrossoverConfirmationTimestamp = _a[3], movingAverageDays = _a[4], movingAveragePriceFeed = _a[5], rebalancingSetToken = _a[6];
                        return [4 /*yield*/, Promise.all([
                                this.macoStrategyManager.riskAssetAddress(macoManager),
                                this.macoStrategyManager.riskCollateralAddress(macoManager),
                                this.macoStrategyManager.setTokenFactory(macoManager),
                                this.macoStrategyManager.stableAssetAddress(macoManager),
                                this.macoStrategyManager.stableCollateralAddress(macoManager),
                                this.macoStrategyManager.crossoverConfirmationMinTime(macoManager),
                                this.macoStrategyManager.crossoverConfirmationMaxTime(macoManager),
                            ])];
                    case 2:
                        _b = _c.sent(), riskAsset = _b[0], riskCollateral = _b[1], setTokenFactory = _b[2], stableAsset = _b[3], stableCollateral = _b[4], crossoverConfirmationMinTime = _b[5], crossoverConfirmationMaxTime = _b[6];
                        return [2 /*return*/, {
                                auctionLibrary: auctionLibrary,
                                auctionTimeToPivot: auctionTimeToPivot,
                                core: core,
                                lastCrossoverConfirmationTimestamp: lastCrossoverConfirmationTimestamp,
                                movingAverageDays: movingAverageDays,
                                movingAveragePriceFeed: movingAveragePriceFeed,
                                rebalancingSetToken: rebalancingSetToken,
                                riskAsset: riskAsset,
                                riskCollateral: riskCollateral,
                                setTokenFactory: setTokenFactory,
                                stableAsset: stableAsset,
                                stableCollateral: stableCollateral,
                                crossoverConfirmationMinTime: crossoverConfirmationMinTime,
                                crossoverConfirmationMaxTime: crossoverConfirmationMaxTime,
                            }];
                }
            });
        });
    };
    /* ============ Private Functions ============ */
    MACOManagerAPI.prototype.assertInitialPropose = function (macoManagerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTimeStampInSeconds, lastCrossoverConfirmationTimestamp, crossoverConfirmationMaxTime, lessThanTwelveHoursElapsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertPropose(macoManagerAddress)];
                    case 1:
                        _a.sent();
                        currentTimeStampInSeconds = new util_1.BigNumber(Date.now()).div(1000);
                        return [4 /*yield*/, this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManagerAddress)];
                    case 2:
                        lastCrossoverConfirmationTimestamp = _a.sent();
                        return [4 /*yield*/, this.macoStrategyManager.crossoverConfirmationMaxTime(macoManagerAddress)];
                    case 3:
                        crossoverConfirmationMaxTime = _a.sent();
                        lessThanTwelveHoursElapsed = currentTimeStampInSeconds.minus(lastCrossoverConfirmationTimestamp).lt(crossoverConfirmationMaxTime);
                        if (lessThanTwelveHoursElapsed) {
                            throw new Error('Less than max confirm time has elapsed since the last proposal timestamp');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MACOManagerAPI.prototype.assertConfirmPropose = function (macoManagerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTimeStampInSeconds, _a, lastCrossoverConfirmationTimestamp, crossoverConfirmationMaxTime, crossoverConfirmationMinTime, moreThanTwelveHoursElapsed, lessThanSixHoursElapsed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.assertPropose(macoManagerAddress)];
                    case 1:
                        _b.sent();
                        currentTimeStampInSeconds = new util_1.BigNumber(Date.now()).div(1000);
                        return [4 /*yield*/, Promise.all([
                                this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManagerAddress),
                                this.macoStrategyManager.crossoverConfirmationMaxTime(macoManagerAddress),
                                this.macoStrategyManager.crossoverConfirmationMinTime(macoManagerAddress),
                            ])];
                    case 2:
                        _a = _b.sent(), lastCrossoverConfirmationTimestamp = _a[0], crossoverConfirmationMaxTime = _a[1], crossoverConfirmationMinTime = _a[2];
                        moreThanTwelveHoursElapsed = currentTimeStampInSeconds.minus(lastCrossoverConfirmationTimestamp).gt(crossoverConfirmationMaxTime);
                        lessThanSixHoursElapsed = currentTimeStampInSeconds
                            .minus(lastCrossoverConfirmationTimestamp)
                            .lt(crossoverConfirmationMinTime);
                        if (moreThanTwelveHoursElapsed || lessThanSixHoursElapsed) {
                            // If the current timestamp min confirm and max confirm time since last call, call confirmPropose
                            throw new Error('Confirm Crossover Propose is not called in the confirmation period since last proposal timestamp');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MACOManagerAPI.prototype.assertPropose = function (macoManagerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, rebalancingSetAddress, movingAverageDays, movingAveragePriceFeed, isUsingRiskCollateral, riskCollateralPriceFeed, _b, currentPrice, movingAverage, currentPriceBN, movingAverageBN;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.assert.schema.isValidAddress('macoManagerAddress', macoManagerAddress);
                        return [4 /*yield*/, Promise.all([
                                this.macoStrategyManager.rebalancingSetTokenAddress(macoManagerAddress),
                                this.macoStrategyManager.movingAverageDays(macoManagerAddress),
                                this.macoStrategyManager.movingAveragePriceFeed(macoManagerAddress),
                                this.isUsingRiskComponent(macoManagerAddress),
                            ])];
                    case 1:
                        _a = _c.sent(), rebalancingSetAddress = _a[0], movingAverageDays = _a[1], movingAveragePriceFeed = _a[2], isUsingRiskCollateral = _a[3];
                        // Assert the rebalancing Set is ready to be proposed
                        return [4 /*yield*/, this.assert.rebalancing.isNotInDefaultState(rebalancingSetAddress)];
                    case 2:
                        // Assert the rebalancing Set is ready to be proposed
                        _c.sent();
                        return [4 /*yield*/, this.assert.rebalancing.sufficientTimeBetweenRebalance(rebalancingSetAddress)];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, this.movingAverageOracleWrapper.getSourceMedianizer(movingAveragePriceFeed)];
                    case 4:
                        riskCollateralPriceFeed = _c.sent();
                        return [4 /*yield*/, Promise.all([
                                this.priceFeed.read(riskCollateralPriceFeed),
                                this.movingAverageOracleWrapper.read(movingAveragePriceFeed, movingAverageDays),
                            ])];
                    case 5:
                        _b = _c.sent(), currentPrice = _b[0], movingAverage = _b[1];
                        currentPriceBN = new util_1.BigNumber(currentPrice);
                        movingAverageBN = new util_1.BigNumber(movingAverage);
                        if (isUsingRiskCollateral) {
                            // Assert currentPrice < moving average
                            this.assert.common.isGreaterThan(movingAverageBN, currentPriceBN, "Current Price " + currentPriceBN.toString() + " must be less than Moving Average " + movingAverageBN.toString());
                        }
                        else {
                            // Assert currentPrice > moving average
                            this.assert.common.isGreaterThan(currentPriceBN, movingAverageBN, "Current Price " + currentPriceBN.toString() + " must be greater than Moving Average " + movingAverageBN.toString());
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MACOManagerAPI.prototype.isUsingRiskComponent = function (macoManagerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, rebalancingSetToken, riskComponent, rebalancingSetCurrentCollateral, collateralComponent;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.macoStrategyManager.rebalancingSetTokenAddress(macoManagerAddress),
                            this.macoStrategyManager.riskAssetAddress(macoManagerAddress),
                        ])];
                    case 1:
                        _a = _b.sent(), rebalancingSetToken = _a[0], riskComponent = _a[1];
                        return [4 /*yield*/, this.rebalancingSetToken.currentSet(rebalancingSetToken)];
                    case 2:
                        rebalancingSetCurrentCollateral = _b.sent();
                        return [4 /*yield*/, this.setToken.getComponents(rebalancingSetCurrentCollateral)];
                    case 3:
                        collateralComponent = (_b.sent())[0];
                        return [2 /*return*/, riskComponent.toLowerCase() === collateralComponent.toLowerCase()];
                }
            });
        });
    };
    return MACOManagerAPI;
}());
exports.MACOManagerAPI = MACOManagerAPI;
//# sourceMappingURL=MACOManagerAPI.js.map