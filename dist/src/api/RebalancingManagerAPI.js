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
var util_1 = require("../util");
var wrappers_1 = require("../wrappers");
var common_1 = require("../types/common");
var constants_1 = require("../constants");
/**
 * @title RebalancingManagerAPI
 * @author Set Protocol
 *
 * A library for interacting with Rebalancing Manager
 */
var RebalancingManagerAPI = /** @class */ (function () {
    /**
     * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
     *
     * @param web3          The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param assertions    An instance of the Assertion library
     */
    function RebalancingManagerAPI(web3, assertions, config) {
        this.btcEthRebalancingManager = new wrappers_1.BTCETHRebalancingManagerWrapper(web3);
        this.btcDaiRebalancingManager = new wrappers_1.BTCDAIRebalancingManagerWrapper(web3);
        this.ethDaiRebalancingManager = new wrappers_1.ETHDAIRebalancingManagerWrapper(web3);
        this.macoStrategyManager = new wrappers_1.MACOStrategyManagerWrapper(web3);
        this.macoStrategyManagerV2 = new wrappers_1.MACOStrategyManagerV2Wrapper(web3);
        this.assetPairManager = new wrappers_1.AssetPairManagerWrapper(web3);
        this.assert = assertions;
        this.setToken = new wrappers_1.SetTokenWrapper(web3);
        this.medianizer = new wrappers_1.MedianizerWrapper(web3);
        this.movingAverageOracleWrapper = new wrappers_1.MovingAverageOracleWrapper(web3);
        this.rebalancingSetToken = new wrappers_1.RebalancingSetTokenWrapper(web3);
        this.protocolViewer = new wrappers_1.ProtocolViewerWrapper(web3, config.protocolViewerAddress);
    }
    /**
     * Calls the propose function on a specified rebalancing manager and rebalancing set token.
     * This function will generate a new set token using data from the btc and eth price feeds and ultimately generate
     * a proposal on the rebalancing set token.
     *
     * @param  managerType           BigNumber indicating which kind of manager is being called
     * @param  rebalancingManager    Address of the BTCETH Rebalancing Manager contract
     * @param  rebalancingSet        Rebalancing Set to call propose on
     * @param  txOpts                Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                       Transaction hash
     */
    RebalancingManagerAPI.prototype.proposeAsync = function (managerType, rebalancingManager, rebalancingSet, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertPropose(rebalancingManager, rebalancingSet)];
                    case 1:
                        _a.sent();
                        if (!(managerType == common_1.ManagerType.BTCETH)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.assertBTCETHPriceTrigger(rebalancingManager, rebalancingSet)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.btcEthRebalancingManager.propose(rebalancingManager, rebalancingSet, txOpts)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        if (!(managerType == common_1.ManagerType.BTCDAI)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.assertBTCDAIPriceTrigger(rebalancingManager, rebalancingSet)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.btcDaiRebalancingManager.propose(rebalancingManager, rebalancingSet, txOpts)];
                    case 6: return [2 /*return*/, _a.sent()];
                    case 7:
                        if (!(managerType == common_1.ManagerType.ETHDAI)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.assertETHDAIPriceTrigger(rebalancingManager, rebalancingSet)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.ethDaiRebalancingManager.propose(rebalancingManager, rebalancingSet, txOpts)];
                    case 9: return [2 /*return*/, _a.sent()];
                    case 10: throw new Error('Passed manager type is not recognized.');
                }
            });
        });
    };
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
    RebalancingManagerAPI.prototype.initiateCrossoverProposeAsync = function (managerType, macoManager, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(managerType == common_1.ManagerType.PAIR)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.assertAssetPairInitialPropose(macoManager)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 2: return [4 /*yield*/, this.assertInitialPropose(managerType, macoManager)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.assertMACOPropose(managerType, macoManager)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.macoStrategyManager.initialPropose(macoManager, txOpts)];
                    case 6: 
                    // If current timestamp > 12 hours since the last, call initialPropose
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RebalancingManagerAPI.prototype.confirmCrossoverProposeAsync = function (managerType, macoManager, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(managerType == common_1.ManagerType.PAIR)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.assertAssetPairConfirmPropose(macoManager)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 2: return [4 /*yield*/, this.assertConfirmPropose(managerType, macoManager)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.assertMACOPropose(managerType, macoManager)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.macoStrategyManager.confirmPropose(macoManager, txOpts)];
                    case 6: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches if initialPropose can be called without revert on AssetPairManager
     *
     * @param  manager         Address of AssetPairManager contract
     * @return                 Boolean if initialPropose can be called without revert
     */
    RebalancingManagerAPI.prototype.canInitialProposeAsync = function (manager) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assetPairManager.canInitialPropose(manager)
                            .then(function (value) { return value; })
                            .catch(function (error) { return false; })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches if confirmPropose can be called without revert on AssetPairManager
     *
     * @param  manager         Address of AssetPairManager contract
     * @return                 Boolean if confirmPropose can be called without revert
     */
    RebalancingManagerAPI.prototype.canConfirmProposeAsync = function (manager) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assetPairManager.canConfirmPropose(manager)
                            .then(function (value) { return value; })
                            .catch(function (error) { return false; })];
                    case 1: return [2 /*return*/, _a.sent()];
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
    RebalancingManagerAPI.prototype.getLastCrossoverConfirmationTimestampAsync = function (managerType, manager) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('manager', manager);
                        if (!(managerType == common_1.ManagerType.PAIR)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.assetPairManager.recentInitialProposeTimestamp(manager)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this.macoStrategyManager.lastCrossoverConfirmationTimestamp(manager)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the state variables of the BTCETH Rebalancing Manager contract.
     *
     * @param  rebalancingManager    Address of the BTCETH Rebalancing Manager contract
     * @return                       Object containing the state information related to the rebalancing manager
     */
    RebalancingManagerAPI.prototype.getBTCETHRebalancingManagerDetailsAsync = function (rebalancingManager) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, core, btcPriceFeed, ethPriceFeed, btcAddress, ethAddress, setTokenFactory, btcMultiplier, ethMultiplier, _b, auctionLibrary, auctionTimeToPivot, maximumLowerThreshold, minimumUpperThreshold;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.btcEthRebalancingManager.core(rebalancingManager),
                            this.btcEthRebalancingManager.btcPriceFeed(rebalancingManager),
                            this.btcEthRebalancingManager.ethPriceFeed(rebalancingManager),
                            this.btcEthRebalancingManager.btcAddress(rebalancingManager),
                            this.btcEthRebalancingManager.ethAddress(rebalancingManager),
                            this.btcEthRebalancingManager.setTokenFactory(rebalancingManager),
                            this.btcEthRebalancingManager.btcMultiplier(rebalancingManager),
                            this.btcEthRebalancingManager.ethMultiplier(rebalancingManager),
                        ])];
                    case 1:
                        _a = _c.sent(), core = _a[0], btcPriceFeed = _a[1], ethPriceFeed = _a[2], btcAddress = _a[3], ethAddress = _a[4], setTokenFactory = _a[5], btcMultiplier = _a[6], ethMultiplier = _a[7];
                        return [4 /*yield*/, Promise.all([
                                this.btcEthRebalancingManager.auctionLibrary(rebalancingManager),
                                this.btcEthRebalancingManager.auctionTimeToPivot(rebalancingManager),
                                this.btcEthRebalancingManager.maximumLowerThreshold(rebalancingManager),
                                this.btcEthRebalancingManager.minimumUpperThreshold(rebalancingManager),
                            ])];
                    case 2:
                        _b = _c.sent(), auctionLibrary = _b[0], auctionTimeToPivot = _b[1], maximumLowerThreshold = _b[2], minimumUpperThreshold = _b[3];
                        return [2 /*return*/, {
                                core: core,
                                btcPriceFeed: btcPriceFeed,
                                ethPriceFeed: ethPriceFeed,
                                btcAddress: btcAddress,
                                ethAddress: ethAddress,
                                setTokenFactory: setTokenFactory,
                                btcMultiplier: btcMultiplier,
                                ethMultiplier: ethMultiplier,
                                auctionLibrary: auctionLibrary,
                                auctionTimeToPivot: auctionTimeToPivot,
                                maximumLowerThreshold: maximumLowerThreshold,
                                minimumUpperThreshold: minimumUpperThreshold,
                            }];
                }
            });
        });
    };
    /**
     * Fetches the state variables of the BTCDAI Rebalancing Manager contract.
     *
     * @param  rebalancingManager    Address of the BTCDAI Rebalancing Manager contract
     * @return                       Object containing the state information related to the rebalancing manager
     */
    RebalancingManagerAPI.prototype.getBTCDAIRebalancingManagerDetailsAsync = function (rebalancingManager) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, core, btcPriceFeed, btcAddress, daiAddress, setTokenFactory, btcMultiplier, daiMultiplier, _b, auctionLibrary, auctionTimeToPivot, maximumLowerThreshold, minimumUpperThreshold;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.btcDaiRebalancingManager.core(rebalancingManager),
                            this.btcDaiRebalancingManager.btcPriceFeed(rebalancingManager),
                            this.btcDaiRebalancingManager.btcAddress(rebalancingManager),
                            this.btcDaiRebalancingManager.daiAddress(rebalancingManager),
                            this.btcDaiRebalancingManager.setTokenFactory(rebalancingManager),
                            this.btcDaiRebalancingManager.btcMultiplier(rebalancingManager),
                            this.btcDaiRebalancingManager.daiMultiplier(rebalancingManager),
                        ])];
                    case 1:
                        _a = _c.sent(), core = _a[0], btcPriceFeed = _a[1], btcAddress = _a[2], daiAddress = _a[3], setTokenFactory = _a[4], btcMultiplier = _a[5], daiMultiplier = _a[6];
                        return [4 /*yield*/, Promise.all([
                                this.btcDaiRebalancingManager.auctionLibrary(rebalancingManager),
                                this.btcDaiRebalancingManager.auctionTimeToPivot(rebalancingManager),
                                this.btcDaiRebalancingManager.maximumLowerThreshold(rebalancingManager),
                                this.btcDaiRebalancingManager.minimumUpperThreshold(rebalancingManager),
                            ])];
                    case 2:
                        _b = _c.sent(), auctionLibrary = _b[0], auctionTimeToPivot = _b[1], maximumLowerThreshold = _b[2], minimumUpperThreshold = _b[3];
                        return [2 /*return*/, {
                                core: core,
                                btcPriceFeed: btcPriceFeed,
                                btcAddress: btcAddress,
                                daiAddress: daiAddress,
                                setTokenFactory: setTokenFactory,
                                btcMultiplier: btcMultiplier,
                                daiMultiplier: daiMultiplier,
                                auctionLibrary: auctionLibrary,
                                auctionTimeToPivot: auctionTimeToPivot,
                                maximumLowerThreshold: maximumLowerThreshold,
                                minimumUpperThreshold: minimumUpperThreshold,
                            }];
                }
            });
        });
    };
    /**
     * Fetches the state variables of the ETHDAI Rebalancing Manager contract.
     *
     * @param  rebalancingManager    Address of the ETHDAI Rebalancing Manager contract
     * @return                       Object containing the state information related to the rebalancing manager
     */
    RebalancingManagerAPI.prototype.getETHDAIRebalancingManagerDetailsAsync = function (rebalancingManager) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, core, ethPriceFeed, ethAddress, daiAddress, setTokenFactory, ethMultiplier, daiMultiplier, _b, auctionLibrary, auctionTimeToPivot, maximumLowerThreshold, minimumUpperThreshold;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.ethDaiRebalancingManager.core(rebalancingManager),
                            this.ethDaiRebalancingManager.ethPriceFeed(rebalancingManager),
                            this.ethDaiRebalancingManager.ethAddress(rebalancingManager),
                            this.ethDaiRebalancingManager.daiAddress(rebalancingManager),
                            this.ethDaiRebalancingManager.setTokenFactory(rebalancingManager),
                            this.ethDaiRebalancingManager.ethMultiplier(rebalancingManager),
                            this.ethDaiRebalancingManager.daiMultiplier(rebalancingManager),
                        ])];
                    case 1:
                        _a = _c.sent(), core = _a[0], ethPriceFeed = _a[1], ethAddress = _a[2], daiAddress = _a[3], setTokenFactory = _a[4], ethMultiplier = _a[5], daiMultiplier = _a[6];
                        return [4 /*yield*/, Promise.all([
                                this.ethDaiRebalancingManager.auctionLibrary(rebalancingManager),
                                this.ethDaiRebalancingManager.auctionTimeToPivot(rebalancingManager),
                                this.ethDaiRebalancingManager.maximumLowerThreshold(rebalancingManager),
                                this.ethDaiRebalancingManager.minimumUpperThreshold(rebalancingManager),
                            ])];
                    case 2:
                        _b = _c.sent(), auctionLibrary = _b[0], auctionTimeToPivot = _b[1], maximumLowerThreshold = _b[2], minimumUpperThreshold = _b[3];
                        return [2 /*return*/, {
                                core: core,
                                ethPriceFeed: ethPriceFeed,
                                ethAddress: ethAddress,
                                daiAddress: daiAddress,
                                setTokenFactory: setTokenFactory,
                                ethMultiplier: ethMultiplier,
                                daiMultiplier: daiMultiplier,
                                auctionLibrary: auctionLibrary,
                                auctionTimeToPivot: auctionTimeToPivot,
                                maximumLowerThreshold: maximumLowerThreshold,
                                minimumUpperThreshold: minimumUpperThreshold,
                            }];
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
    RebalancingManagerAPI.prototype.getMovingAverageManagerDetailsAsync = function (managerType, macoManager) {
        return __awaiter(this, void 0, void 0, function () {
            var movingAveragePriceFeed, _a, auctionLibrary, auctionTimeToPivot, core, lastCrossoverConfirmationTimestamp, movingAverageDays, rebalancingSetToken, _b, riskAsset, riskCollateral, setTokenFactory, stableAsset, stableCollateral, crossoverConfirmationMinTime, crossoverConfirmationMaxTime;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(managerType == common_1.ManagerType.MACO)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.macoStrategyManager.movingAveragePriceFeed(macoManager)];
                    case 1:
                        movingAveragePriceFeed = _c.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.macoStrategyManagerV2.movingAveragePriceFeed(macoManager)];
                    case 3:
                        movingAveragePriceFeed = _c.sent();
                        _c.label = 4;
                    case 4: return [4 /*yield*/, Promise.all([
                            this.macoStrategyManager.auctionLibrary(macoManager),
                            this.macoStrategyManager.auctionTimeToPivot(macoManager),
                            this.macoStrategyManager.coreAddress(macoManager),
                            this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManager),
                            this.macoStrategyManager.movingAverageDays(macoManager),
                            this.macoStrategyManager.rebalancingSetTokenAddress(macoManager),
                        ])];
                    case 5:
                        _a = _c.sent(), auctionLibrary = _a[0], auctionTimeToPivot = _a[1], core = _a[2], lastCrossoverConfirmationTimestamp = _a[3], movingAverageDays = _a[4], rebalancingSetToken = _a[5];
                        return [4 /*yield*/, Promise.all([
                                this.macoStrategyManager.riskAssetAddress(macoManager),
                                this.macoStrategyManager.riskCollateralAddress(macoManager),
                                this.macoStrategyManager.setTokenFactory(macoManager),
                                this.macoStrategyManager.stableAssetAddress(macoManager),
                                this.macoStrategyManager.stableCollateralAddress(macoManager),
                                this.macoStrategyManager.crossoverConfirmationMinTime(macoManager),
                                this.macoStrategyManager.crossoverConfirmationMaxTime(macoManager),
                            ])];
                    case 6:
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
    /**
     * Fetches the state variables of the Asset Pair Manager contract.
     *
     * @param  manager         Address of the AssetPairManager contract
     * @return                 Object containing the state information related to the manager
     */
    RebalancingManagerAPI.prototype.getAssetPairManagerDetailsAsync = function (manager) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, allocationDenominator, allocator, auctionPivotPercentage, auctionLibrary, auctionStartPercentage, auctionTimeToPivot, baseAssetAllocation, _b, bullishBaseAssetAllocation, bearishBaseAssetAllocation, core, recentInitialProposeTimestamp, rebalancingSetToken, signalConfirmationMinTime, signalConfirmationMaxTime, trigger;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.assetPairManager.allocationDenominator(manager),
                            this.assetPairManager.allocator(manager),
                            this.assetPairManager.auctionPivotPercentage(manager),
                            this.assetPairManager.auctionLibrary(manager),
                            this.assetPairManager.auctionStartPercentage(manager),
                            this.assetPairManager.auctionTimeToPivot(manager),
                            this.assetPairManager.baseAssetAllocation(manager),
                        ])];
                    case 1:
                        _a = _c.sent(), allocationDenominator = _a[0], allocator = _a[1], auctionPivotPercentage = _a[2], auctionLibrary = _a[3], auctionStartPercentage = _a[4], auctionTimeToPivot = _a[5], baseAssetAllocation = _a[6];
                        return [4 /*yield*/, Promise.all([
                                this.assetPairManager.bullishBaseAssetAllocation(manager),
                                this.assetPairManager.bearishBaseAssetAllocation(manager),
                                this.assetPairManager.core(manager),
                                this.assetPairManager.recentInitialProposeTimestamp(manager),
                                this.assetPairManager.rebalancingSetToken(manager),
                                this.assetPairManager.signalConfirmationMinTime(manager),
                                this.assetPairManager.signalConfirmationMaxTime(manager),
                                this.assetPairManager.trigger(manager),
                            ])];
                    case 2:
                        _b = _c.sent(), bullishBaseAssetAllocation = _b[0], bearishBaseAssetAllocation = _b[1], core = _b[2], recentInitialProposeTimestamp = _b[3], rebalancingSetToken = _b[4], signalConfirmationMinTime = _b[5], signalConfirmationMaxTime = _b[6], trigger = _b[7];
                        return [2 /*return*/, {
                                allocationDenominator: allocationDenominator,
                                allocator: allocator,
                                auctionPivotPercentage: auctionPivotPercentage,
                                auctionLibrary: auctionLibrary,
                                auctionStartPercentage: auctionStartPercentage,
                                auctionTimeToPivot: auctionTimeToPivot,
                                baseAssetAllocation: baseAssetAllocation,
                                bullishBaseAssetAllocation: bullishBaseAssetAllocation,
                                bearishBaseAssetAllocation: bearishBaseAssetAllocation,
                                core: core,
                                recentInitialProposeTimestamp: recentInitialProposeTimestamp,
                                rebalancingSetToken: rebalancingSetToken,
                                signalConfirmationMinTime: signalConfirmationMinTime,
                                signalConfirmationMaxTime: signalConfirmationMaxTime,
                                trigger: trigger,
                            }];
                }
            });
        });
    };
    /**
     * Fetches the crossover confirmation time of AssetPairManager contracts.
     *
     * @param  managers        Array of addresses of the manager contract
     * @return                 Object containing the crossover timestamps
     */
    RebalancingManagerAPI.prototype.batchFetchAssetPairCrossoverTimestampAsync = function (managers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.protocolViewer.batchFetchAssetPairCrossoverTimestamp(managers)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the crossover confirmation time of AssetPairManager contracts.
     *
     * @param  managers        Array of addresses of the manager contract
     * @return                 Object containing the crossover timestamps
     */
    RebalancingManagerAPI.prototype.batchFetchMACOCrossoverTimestampAsync = function (managers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.protocolViewer.batchFetchMACOV2CrossoverTimestamp(managers)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /* ============ Private Functions ============ */
    RebalancingManagerAPI.prototype.assertPropose = function (managerAddress, rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var coreAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.btcEthRebalancingManager.core(managerAddress)];
                    case 1:
                        coreAddress = _a.sent();
                        return [4 /*yield*/, this.assert.setToken.isValidSetToken(coreAddress, rebalancingSetAddress)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.assertGeneralPropose(managerAddress, rebalancingSetAddress)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingManagerAPI.prototype.assertGeneralPropose = function (managerAddress, rebalancingSetAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('managerAddress', managerAddress);
                        this.assert.schema.isValidAddress('rebalancingSetAddress', rebalancingSetAddress);
                        // Assert the rebalancing Set is ready to be proposed
                        return [4 /*yield*/, this.assert.rebalancing.isNotInDefaultState(rebalancingSetAddress)];
                    case 1:
                        // Assert the rebalancing Set is ready to be proposed
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.sufficientTimeBetweenRebalance(rebalancingSetAddress)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingManagerAPI.prototype.assertBTCETHPriceTrigger = function (rebalancingManager, rebalancingSet) {
        return __awaiter(this, void 0, void 0, function () {
            var collateralSet, _a, btcPriceFeed, ethPriceFeed, maximumLowerThreshold, minimumUpperThreshold, _b, collateralNaturalUnit, collateralUnits, _c, btcPrice, ethPrice, btcAllocationAmount;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.rebalancingSetToken.currentSet(rebalancingSet)];
                    case 1:
                        collateralSet = _d.sent();
                        return [4 /*yield*/, Promise.all([
                                this.btcEthRebalancingManager.btcPriceFeed(rebalancingManager),
                                this.btcEthRebalancingManager.ethPriceFeed(rebalancingManager),
                                this.btcEthRebalancingManager.maximumLowerThreshold(rebalancingManager),
                                this.btcEthRebalancingManager.minimumUpperThreshold(rebalancingManager),
                            ])];
                    case 2:
                        _a = _d.sent(), btcPriceFeed = _a[0], ethPriceFeed = _a[1], maximumLowerThreshold = _a[2], minimumUpperThreshold = _a[3];
                        return [4 /*yield*/, Promise.all([
                                this.setToken.naturalUnit(collateralSet),
                                this.setToken.getUnits(collateralSet),
                            ])];
                    case 3:
                        _b = _d.sent(), collateralNaturalUnit = _b[0], collateralUnits = _b[1];
                        return [4 /*yield*/, Promise.all([
                                this.medianizer.read(btcPriceFeed),
                                this.medianizer.read(ethPriceFeed),
                            ])];
                    case 4:
                        _c = _d.sent(), btcPrice = _c[0], ethPrice = _c[1];
                        btcAllocationAmount = this.computeSetTokenAllocation(collateralUnits, collateralNaturalUnit, new util_1.BigNumber(btcPrice), new util_1.BigNumber(ethPrice), constants_1.WBTC_FULL_TOKEN_UNITS, constants_1.WETH_FULL_TOKEN_UNITS);
                        this.assert.rebalancing.isOutsideAllocationBounds(btcAllocationAmount, maximumLowerThreshold, minimumUpperThreshold, "Current BTC allocation " + btcAllocationAmount.toString() + "% must be outside allocation bounds " +
                            (maximumLowerThreshold.toString() + " and " + minimumUpperThreshold.toString() + "."));
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingManagerAPI.prototype.assertBTCDAIPriceTrigger = function (rebalancingManager, rebalancingSet) {
        return __awaiter(this, void 0, void 0, function () {
            var collateralSet, _a, btcPriceFeed, maximumLowerThreshold, minimumUpperThreshold, _b, collateralNaturalUnit, collateralUnits, btcPrice, daiAllocationAmount;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.rebalancingSetToken.currentSet(rebalancingSet)];
                    case 1:
                        collateralSet = _c.sent();
                        return [4 /*yield*/, Promise.all([
                                this.btcDaiRebalancingManager.btcPriceFeed(rebalancingManager),
                                this.btcDaiRebalancingManager.maximumLowerThreshold(rebalancingManager),
                                this.btcDaiRebalancingManager.minimumUpperThreshold(rebalancingManager),
                            ])];
                    case 2:
                        _a = _c.sent(), btcPriceFeed = _a[0], maximumLowerThreshold = _a[1], minimumUpperThreshold = _a[2];
                        return [4 /*yield*/, Promise.all([
                                this.setToken.naturalUnit(collateralSet),
                                this.setToken.getUnits(collateralSet),
                            ])];
                    case 3:
                        _b = _c.sent(), collateralNaturalUnit = _b[0], collateralUnits = _b[1];
                        return [4 /*yield*/, this.medianizer.read(btcPriceFeed)];
                    case 4:
                        btcPrice = _c.sent();
                        daiAllocationAmount = this.computeSetTokenAllocation(collateralUnits, collateralNaturalUnit, constants_1.DAI_PRICE, new util_1.BigNumber(btcPrice), constants_1.DAI_FULL_TOKEN_UNITS, constants_1.WBTC_FULL_TOKEN_UNITS);
                        this.assert.rebalancing.isOutsideAllocationBounds(daiAllocationAmount, maximumLowerThreshold, minimumUpperThreshold, "Current DAI allocation " + daiAllocationAmount.toString() + "% must be outside allocation bounds " +
                            (maximumLowerThreshold.toString() + " and " + minimumUpperThreshold.toString() + "."));
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingManagerAPI.prototype.assertETHDAIPriceTrigger = function (rebalancingManager, rebalancingSet) {
        return __awaiter(this, void 0, void 0, function () {
            var collateralSet, _a, ethPriceFeed, maximumLowerThreshold, minimumUpperThreshold, _b, collateralNaturalUnit, collateralUnits, ethPrice, daiAllocationAmount;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.rebalancingSetToken.currentSet(rebalancingSet)];
                    case 1:
                        collateralSet = _c.sent();
                        return [4 /*yield*/, Promise.all([
                                this.ethDaiRebalancingManager.ethPriceFeed(rebalancingManager),
                                this.ethDaiRebalancingManager.maximumLowerThreshold(rebalancingManager),
                                this.ethDaiRebalancingManager.minimumUpperThreshold(rebalancingManager),
                            ])];
                    case 2:
                        _a = _c.sent(), ethPriceFeed = _a[0], maximumLowerThreshold = _a[1], minimumUpperThreshold = _a[2];
                        return [4 /*yield*/, Promise.all([
                                this.setToken.naturalUnit(collateralSet),
                                this.setToken.getUnits(collateralSet),
                            ])];
                    case 3:
                        _b = _c.sent(), collateralNaturalUnit = _b[0], collateralUnits = _b[1];
                        return [4 /*yield*/, this.medianizer.read(ethPriceFeed)];
                    case 4:
                        ethPrice = _c.sent();
                        daiAllocationAmount = this.computeSetTokenAllocation(collateralUnits, collateralNaturalUnit, constants_1.DAI_PRICE, new util_1.BigNumber(ethPrice), constants_1.DAI_FULL_TOKEN_UNITS, constants_1.WETH_FULL_TOKEN_UNITS);
                        this.assert.rebalancing.isOutsideAllocationBounds(daiAllocationAmount, maximumLowerThreshold, minimumUpperThreshold, "Current DAI allocation " + daiAllocationAmount.toString() + "% must be outside allocation bounds " +
                            (maximumLowerThreshold.toString() + " and " + minimumUpperThreshold.toString() + "."));
                        return [2 /*return*/];
                }
            });
        });
    };
    // MACO Assertions
    RebalancingManagerAPI.prototype.assertInitialPropose = function (managerType, macoManagerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetAddress, currentTimeStampInSeconds, lastCrossoverConfirmationTimestamp, crossoverConfirmationMaxTime, lessThanTwelveHoursElapsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.macoStrategyManagerV2.rebalancingSetTokenAddress(macoManagerAddress)];
                    case 1:
                        rebalancingSetAddress = _a.sent();
                        return [4 /*yield*/, this.assertGeneralPropose(macoManagerAddress, rebalancingSetAddress)];
                    case 2:
                        _a.sent();
                        currentTimeStampInSeconds = new util_1.BigNumber(Date.now()).div(1000);
                        return [4 /*yield*/, this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManagerAddress)];
                    case 3:
                        lastCrossoverConfirmationTimestamp = _a.sent();
                        return [4 /*yield*/, this.macoStrategyManager.crossoverConfirmationMaxTime(macoManagerAddress)];
                    case 4:
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
    RebalancingManagerAPI.prototype.assertConfirmPropose = function (managerType, macoManagerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetAddress, currentTimeStampInSeconds, _a, lastCrossoverConfirmationTimestamp, crossoverConfirmationMaxTime, crossoverConfirmationMinTime, moreThanTwelveHoursElapsed, lessThanSixHoursElapsed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.macoStrategyManagerV2.rebalancingSetTokenAddress(macoManagerAddress)];
                    case 1:
                        rebalancingSetAddress = _b.sent();
                        return [4 /*yield*/, this.assertGeneralPropose(macoManagerAddress, rebalancingSetAddress)];
                    case 2:
                        _b.sent();
                        currentTimeStampInSeconds = new util_1.BigNumber(Date.now()).div(1000);
                        return [4 /*yield*/, Promise.all([
                                this.macoStrategyManager.lastCrossoverConfirmationTimestamp(macoManagerAddress),
                                this.macoStrategyManager.crossoverConfirmationMaxTime(macoManagerAddress),
                                this.macoStrategyManager.crossoverConfirmationMinTime(macoManagerAddress),
                            ])];
                    case 3:
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
    RebalancingManagerAPI.prototype.assertAssetPairInitialPropose = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var canPropose;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.canInitialProposeAsync(managerAddress)];
                    case 1:
                        canPropose = _a.sent();
                        if (!canPropose) {
                            throw new Error('initialPropose cannot be called because necessary conditions are not met.');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingManagerAPI.prototype.assertAssetPairConfirmPropose = function (managerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var canPropose;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.canConfirmProposeAsync(managerAddress)];
                    case 1:
                        canPropose = _a.sent();
                        if (!canPropose) {
                            throw new Error('confirmPropose cannot be called because necessary conditions are not met.');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingManagerAPI.prototype.assertMACOPropose = function (managerType, macoManagerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, movingAverageDays, movingAveragePriceFeed, isUsingRiskCollateral, riskCollateralPriceFeed, _b, currentPrice, movingAverage, currentPriceBN, movingAverageBN;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (managerType == common_1.ManagerType.MACOV2) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all([
                                this.macoStrategyManager.movingAverageDays(macoManagerAddress),
                                this.macoStrategyManager.movingAveragePriceFeed(macoManagerAddress),
                                this.isUsingRiskComponent(macoManagerAddress),
                            ])];
                    case 1:
                        _a = _c.sent(), movingAverageDays = _a[0], movingAveragePriceFeed = _a[1], isUsingRiskCollateral = _a[2];
                        return [4 /*yield*/, this.movingAverageOracleWrapper.getSourceMedianizer(movingAveragePriceFeed)];
                    case 2:
                        riskCollateralPriceFeed = _c.sent();
                        return [4 /*yield*/, Promise.all([
                                this.medianizer.read(riskCollateralPriceFeed),
                                this.movingAverageOracleWrapper.read(movingAveragePriceFeed, movingAverageDays),
                            ])];
                    case 3:
                        _b = _c.sent(), currentPrice = _b[0], movingAverage = _b[1];
                        currentPriceBN = new util_1.BigNumber(currentPrice);
                        movingAverageBN = new util_1.BigNumber(movingAverage);
                        this.assertCrossoverTriggerMet(isUsingRiskCollateral, currentPriceBN, movingAverageBN);
                        return [2 /*return*/];
                }
            });
        });
    };
    // Helper functions
    RebalancingManagerAPI.prototype.assertCrossoverTriggerMet = function (isUsingRiskCollateral, currentPrice, movingAverage) {
        if (isUsingRiskCollateral) {
            // Assert currentPrice < moving average
            this.assert.common.isGreaterThan(movingAverage, currentPrice, "Current Price " + currentPrice.toString() + " must be less than Moving Average " + movingAverage.toString());
        }
        else {
            // Assert currentPrice > moving average
            this.assert.common.isGreaterThan(currentPrice, movingAverage, "Current Price " + currentPrice.toString() + " must be greater than Moving Average " + movingAverage.toString());
        }
    };
    RebalancingManagerAPI.prototype.computeSetTokenAllocation = function (units, naturalUnit, tokenOnePrice, tokenTwoPrice, tokenOneDecimals, tokenTwoDecimals) {
        var tokenOneUnitsInFullToken = constants_1.SET_FULL_TOKEN_UNITS.mul(units[0]).div(naturalUnit).round(0, 3);
        var tokenTwoUnitsInFullToken = constants_1.SET_FULL_TOKEN_UNITS.mul(units[1]).div(naturalUnit).round(0, 3);
        var tokenOneDollarAmount = this.computeTokenDollarAmount(tokenOnePrice, tokenOneUnitsInFullToken, tokenOneDecimals);
        var tokenTwoDollarAmount = this.computeTokenDollarAmount(tokenTwoPrice, tokenTwoUnitsInFullToken, tokenTwoDecimals);
        return tokenOneDollarAmount.mul(100).div(tokenOneDollarAmount.add(tokenTwoDollarAmount)).round(0, 3);
    };
    RebalancingManagerAPI.prototype.computeTokenDollarAmount = function (tokenPrice, unitsInFullSet, tokenDecimals) {
        return tokenPrice
            .mul(unitsInFullSet)
            .div(tokenDecimals)
            .div(constants_1.VALUE_TO_CENTS_CONVERSION)
            .round(0, 3);
    };
    RebalancingManagerAPI.prototype.isUsingRiskComponent = function (macoManagerAddress) {
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
    return RebalancingManagerAPI;
}());
exports.RebalancingManagerAPI = RebalancingManagerAPI;
//# sourceMappingURL=RebalancingManagerAPI.js.map