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
var setProtocolUtils = __importStar(require("set-protocol-utils"));
var util_1 = require("../util");
var wrappers_1 = require("../wrappers");
var errors_1 = require("../errors");
var common_1 = require("../types/common");
var SetUtils = setProtocolUtils.SetProtocolUtils;
/**
 * @title SocialTradingAPI
 * @author Set Protocol
 *
 * A library for interacting with Social Trading contracts
 */
var SocialTradingAPI = /** @class */ (function () {
    /**
     * Instantiates a new RebalancingManagerAPI instance that contains methods for issuing and redeeming Sets
     *
     * @param web3          The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param assertions    An instance of the Assertion library
     * @param config        Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    function SocialTradingAPI(web3, assertions, config) {
        this.web3 = web3;
        this.protocolViewer = new wrappers_1.ProtocolViewerWrapper(web3, config.protocolViewerAddress);
        this.socialTradingManager = new wrappers_1.SocialTradingManagerWrapper(web3);
        this.socialTradingManagerV2 = new wrappers_1.SocialTradingManagerV2Wrapper(web3);
        this.rebalancingSetV2 = new wrappers_1.RebalancingSetTokenV2Wrapper(web3);
        this.rebalancingSetV3 = new wrappers_1.RebalancingSetTokenV3Wrapper(web3);
        this.performanceFeeCalculator = new wrappers_1.PerformanceFeeCalculatorWrapper(web3);
        this.assert = assertions;
    }
    /**
     * Calls SocialTradingManager's createTradingPool function. This function creates a new tradingPool for
     * the sender. Creates collateral Set and RebalancingSetTokenV2 then stores data relevant for updating
     * allocations in mapping indexed by created RebalancingSetTokenV2 address.
     *
     * @param  manager                        Address of the social trading manager contract
     * @param  allocatorAddress               Address of allocator to be used for pool, proxy for trading pair
     * @param  startingBaseAssetAllocation    Starting base asset allocation of tradingPool
     * @param  startingUSDValue               Starting USD value of one share of tradingPool
     * @param  tradingPoolName                Name of tradingPool as appears on RebalancingSetTokenV2
     * @param  tradingPoolSymbol              Symbol of tradingPool as appears on RebalancingSetTokenV2
     * @param  liquidator                     Address of liquidator contract
     * @param  feeRecipient                   Address receiving fees from contract
     * @param  feeCalculator                  Rebalance fee calculator being used
     * @param  rebalanceInterval              Time required between rebalances
     * @param  failAuctionPeriod              Time before auction can be failed
     * @param  lastRebalanceTimestamp         Passed time of last rebalance
     * @param  entryFee                       Trading Pool entrance fee
     * @param  rebalanceFee                   Trading Pool rebalance fee
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.createTradingPoolAsync = function (manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalanceFeeBytes, rebalancingSetV2CallData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertCreateTradingPool(startingBaseAssetAllocation, tradingPoolName, tradingPoolSymbol, manager, allocatorAddress, liquidator, feeRecipient, feeCalculator, entryFee, rebalanceFee)];
                    case 1:
                        _a.sent();
                        rebalanceFeeBytes = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
                        rebalancingSetV2CallData = SetUtils.generateRebalancingSetTokenV2CallData(manager, liquidator, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFeeBytes);
                        return [2 /*return*/, this.socialTradingManager.createTradingPool(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, SetUtils.stringToBytes(tradingPoolName), SetUtils.stringToBytes(tradingPoolSymbol), rebalancingSetV2CallData, txOpts)];
                }
            });
        });
    };
    /**
     * Calls SocialTradingManager's createTradingPool function. This function creates a new tradingPool for
     * the sender. Creates collateral Set and RebalancingSetTokenV2 then stores data relevant for updating
     * allocations in mapping indexed by created RebalancingSetTokenV2 address.
     *
     * @param  manager                        Address of the social trading manager contract
     * @param  allocatorAddress               Address of allocator to be used for pool, proxy for trading pair
     * @param  startingBaseAssetAllocation    Starting base asset allocation of tradingPool
     * @param  startingUSDValue               Starting USD value of one share of tradingPool
     * @param  tradingPoolName                Name of tradingPool as appears on RebalancingSetTokenV2
     * @param  tradingPoolSymbol              Symbol of tradingPool as appears on RebalancingSetTokenV2
     * @param  liquidator                     Address of liquidator contract
     * @param  feeRecipient                   Address receiving fees from contract
     * @param  feeCalculator                  Rebalance fee calculator being used
     * @param  rebalanceInterval              Time required between rebalances
     * @param  failAuctionPeriod              Time before auction can be failed
     * @param  lastRebalanceTimestamp         Passed time of last rebalance
     * @param  entryFee                       Trading Pool entrance fee
     * @param  streamingFee                   Trading Pool streaming fee
     * @param  profitFee                      Trading Pool profit fee
     * @param  profitFeePeriod                Period between actualizing profit fees
     * @param  highWatermarkResetPeriod       Time between last profit fee actualization before high watermark
     *                                        can be reset
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.createTradingPoolV2Async = function (manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var feeCalculatorBytes, rebalancingSetV2CallData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertCreateTradingPoolV2(startingBaseAssetAllocation, tradingPoolName, tradingPoolSymbol, manager, allocatorAddress, liquidator, feeRecipient, feeCalculator, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee)];
                    case 1:
                        _a.sent();
                        feeCalculatorBytes = SetUtils.generatePerformanceFeeCallDataBuffer(profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee);
                        rebalancingSetV2CallData = SetUtils.generateRebalancingSetTokenV3CallData(manager, liquidator, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, feeCalculatorBytes);
                        return [2 /*return*/, this.socialTradingManager.createTradingPool(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, SetUtils.stringToBytes(tradingPoolName), SetUtils.stringToBytes(tradingPoolSymbol), rebalancingSetV2CallData, txOpts)];
                }
            });
        });
    };
    /**
     * Calls SocialTradingManager's updateAllocation function. This function creates a new collateral Set and
     * calls startRebalance on RebalancingSetTokenV2. Updates allocation state on Manager contract.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  newAllocation          New allocation amount in base asset percentage
     * @param  liquidatorData         Arbitrary bytes data passed to liquidator
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.updateAllocationAsync = function (manager, tradingPool, newAllocation, liquidatorData, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertUpdateAllocation(manager, tradingPool, newAllocation, txOpts)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.socialTradingManager.updateAllocation(manager, tradingPool, newAllocation, liquidatorData, txOpts)];
                }
            });
        });
    };
    /**
     * Calls tradingPool to accrue fees to manager.
     *
     * @param  tradingPool        Address of tradingPool
     * @return                    The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.actualizeFeesAsync = function (tradingPool, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.rebalancingSetV3.actualizeFee(tradingPool, txOpts)];
            });
        });
    };
    /**
     * Calls manager to adjustFees for tradingPool
     *
     * @param  manager                  Address of manager
     * @param  tradingPool              Address of tradingPool
     * @param  newFeeType               Type of fee being changed
     * @param  newFeePercentage         New fee percentage
     * @return                          The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.adjustPerformanceFeesAsync = function (manager, tradingPool, newFeeType, newFeePercentage, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var newFeeCallData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertAdjustFees(manager, tradingPool, newFeeType, newFeePercentage, txOpts)];
                    case 1:
                        _a.sent();
                        newFeeCallData = SetUtils.generateAdjustFeeCallData(new util_1.BigNumber(newFeeType), newFeePercentage);
                        return [2 /*return*/, this.socialTradingManagerV2.adjustFee(manager, tradingPool, newFeeCallData, txOpts)];
                }
            });
        });
    };
    /**
     * Cancels previous fee adjustment (before enacted)
     *
     * @param  manager                  Address of manager
     * @param  tradingPool              Address of tradingPool
     * @param  upgradeHash              Hash of the inital fee adjustment call data
     * @return                          The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.removeFeeUpdateAsync = function (manager, tradingPool, upgradeHash, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertRemoveFeeUpdate(manager, tradingPool, txOpts)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.socialTradingManagerV2.removeRegisteredUpgrade(manager, tradingPool, upgradeHash)];
                }
            });
        });
    };
    /**
     * Calls SocialTradingManager's initiateEntryFeeChange function. Starts entry fee update process.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  newEntryFee            New entry fee
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.initiateEntryFeeChangeAsync = function (manager, tradingPool, newEntryFee, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertInitiateEntryFeeChange(manager, tradingPool, newEntryFee, txOpts)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.socialTradingManager.initiateEntryFeeChange(manager, tradingPool, newEntryFee, txOpts)];
                }
            });
        });
    };
    /**
     * Calls SocialTradingManager's finalizeEntryFeeChangeAsync function. Finalizes entry fee update process if timelock
     * period passes.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.finalizeEntryFeeChangeAsync = function (manager, tradingPool, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertFinalizeEntryFeeChange(manager, tradingPool, txOpts)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.socialTradingManager.finalizeEntryFeeChange(manager, tradingPool, txOpts)];
                }
            });
        });
    };
    /**
     * Calls SocialTradingManager's setTrader function. Passes pool permissions to new address.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  newTrader              New trading pool trader address
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.setTraderAsync = function (manager, tradingPool, newTrader, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertAddressSetters(manager, tradingPool, newTrader, txOpts.from)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.socialTradingManager.setTrader(manager, tradingPool, newTrader, txOpts)];
                }
            });
        });
    };
    /**
     * Calls SocialTradingManager's setLiquidator function. Changes liquidator used in rebalances.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  newLiquidator          New liquidator address
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.setLiquidatorAsync = function (manager, tradingPool, newLiquidator, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertAddressSetters(manager, tradingPool, newLiquidator, txOpts.from)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.socialTradingManager.setLiquidator(manager, tradingPool, newLiquidator, txOpts)];
                }
            });
        });
    };
    /**
     * Calls SocialTradingManager's setFeeRecipient function. Changes feeRecipient address.
     *
     * @param  manager                Address of the social trading manager contract
     * @param  tradingPool            Address of tradingPool being updated
     * @param  newFeeRecipient        New feeRecipient address
     * @param  txOpts                 Transaction options object conforming to `Tx` with signer, gas, and
     *                                  gasPrice data
     * @return                        The hash of the resulting transaction.
     */
    SocialTradingAPI.prototype.setFeeRecipientAsync = function (manager, tradingPool, newFeeRecipient, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertAddressSetters(manager, tradingPool, newFeeRecipient, txOpts.from)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.socialTradingManager.setFeeRecipient(manager, tradingPool, newFeeRecipient, txOpts)];
                }
            });
        });
    };
    /**
     * Returns relevant details of newly created Trading Pools. Return object adheres to the
     * NewTradingPoolInfo interface.
     *
     * @param  tradingPool            Address of tradingPool being updated
     * @return                        NewTradingPoolInfo
     */
    SocialTradingAPI.prototype.fetchNewTradingPoolDetailsAsync = function (tradingPool) {
        return __awaiter(this, void 0, void 0, function () {
            var newPoolInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.protocolViewer.fetchNewTradingPoolDetails(tradingPool)];
                    case 1:
                        newPoolInfo = _a.sent();
                        return [2 /*return*/, this.createNewTradingPoolObject(newPoolInfo)];
                }
            });
        });
    };
    /**
     * Returns relevant details of newly created Trading Pools V2 with performance fees. Return object adheres to the
     * NewTradingPoolV2Info interface.
     *
     * @param  tradingPool            Address of tradingPool being updated
     * @return                        NewTradingPoolInfo
     */
    SocialTradingAPI.prototype.fetchNewTradingPoolV2DetailsAsync = function (tradingPool) {
        return __awaiter(this, void 0, void 0, function () {
            var newPoolInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.protocolViewer.fetchNewTradingPoolV2Details(tradingPool)];
                    case 1:
                        newPoolInfo = _a.sent();
                        return [2 /*return*/, this.createNewTradingPoolV2Object(newPoolInfo)];
                }
            });
        });
    };
    /**
     * Returns relevant details of Trading Pools being rebalance. Return object adheres to the
     * TradingPoolRebalanceInfo interface.
     *
     * @param  tradingPool            Address of tradingPool being updated
     * @return                        NewTradingPoolInfo
     */
    SocialTradingAPI.prototype.fetchTradingPoolRebalanceDetailsAsync = function (tradingPool) {
        return __awaiter(this, void 0, void 0, function () {
            var newPoolInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.protocolViewer.fetchTradingPoolRebalanceDetails(tradingPool)];
                    case 1:
                        newPoolInfo = _a.sent();
                        return [2 /*return*/, this.createTradingPoolRebalanceObject(newPoolInfo)];
                }
            });
        });
    };
    /**
     * Fetches all trading pool operators for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    SocialTradingAPI.prototype.batchFetchTradingPoolOperatorAsync = function (tradingPoolAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.protocolViewer.batchFetchTradingPoolOperator(tradingPoolAddresses)];
            });
        });
    };
    /**
     * Fetches all entry fees for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    SocialTradingAPI.prototype.batchFetchTradingPoolEntryFeesAsync = function (tradingPoolAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.protocolViewer.batchFetchTradingPoolEntryFees(tradingPoolAddresses)];
            });
        });
    };
    /**
     * Fetches all rebalance fees for an array of trading pools
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    SocialTradingAPI.prototype.batchFetchTradingPoolRebalanceFeesAsync = function (tradingPoolAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.protocolViewer.batchFetchTradingPoolRebalanceFees(tradingPoolAddresses)];
            });
        });
    };
    /**
     * Fetches all profit and streaming fees for an array of trading pools. Return objects adhere to
     * TradingPoolAccumulationInfo interface
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    SocialTradingAPI.prototype.batchFetchTradingPoolAccumulationAsync = function (tradingPoolAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var tradingPoolFees;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.protocolViewer.batchFetchTradingPoolAccumulation(tradingPoolAddresses)];
                    case 1:
                        tradingPoolFees = _a.sent();
                        return [2 /*return*/, this.createTradingPoolAccumulationObject(tradingPoolFees)];
                }
            });
        });
    };
    /**
     * Fetches all fee states for an array of trading pools. Return objects adhere to
     * PerformanceFeeInfo interface
     *
     * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
     */
    SocialTradingAPI.prototype.batchFetchTradingPoolFeeStateAsync = function (tradingPoolAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.protocolViewer.batchFetchTradingPoolFeeState(tradingPoolAddresses)];
            });
        });
    };
    /**
     * Fetches EntryFeePaid event logs including information about the transactionHash, rebalancingSetToken,
     * feeRecipient, and feeQuantity.
     *
     * This fetch can be filtered by block.
     *
     * @param  tradingPoolAddress            Address of trading pool to pull events for
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @return                               An array of objects conforming to the EntryFeePaid interface
     */
    SocialTradingAPI.prototype.fetchEntryFeeEventsAsync = function (tradingPoolAddress, fromBlock, toBlock, getTimestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var events, formattedEventPromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rebalancingSetV2.entryFeePaidEvent(tradingPoolAddress, fromBlock, toBlock)];
                    case 1:
                        events = _a.sent();
                        formattedEventPromises = events.map(function (event) { return __awaiter(_this, void 0, void 0, function () {
                            var returnValues, feeRecipient, feeQuantity, timestamp, block;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        returnValues = event.returnValues;
                                        feeRecipient = returnValues['feeRecipient'];
                                        feeQuantity = returnValues['feeQuantity'];
                                        timestamp = undefined;
                                        if (!getTimestamp) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.web3.eth.getBlock(event.blockNumber)];
                                    case 1:
                                        block = _a.sent();
                                        timestamp = block.timestamp;
                                        _a.label = 2;
                                    case 2: return [2 /*return*/, {
                                            transactionHash: event.transactionHash,
                                            feeRecipient: feeRecipient,
                                            feeQuantity: new util_1.BigNumber(feeQuantity),
                                            timestamp: timestamp,
                                        }];
                                }
                            });
                        }); });
                        return [2 /*return*/, Promise.all(formattedEventPromises)];
                }
            });
        });
    };
    /**
     * Fetches RebalanceFeePaid event logs including information about the transactionHash, rebalancingSetToken,
     * rebalanceIndex, feeRecipient, feeQuantity
     *
     * This fetch can be filtered by block.
     *
     * @param  tradingPoolAddress            Address of trading pool to pull events for
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @return                               An array of objects conforming to the RebalanceFeePaid interface
     */
    SocialTradingAPI.prototype.fetchRebalanceFeePaidEventsAsync = function (tradingPoolAddress, fromBlock, toBlock, getTimestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var events, formattedEventPromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rebalancingSetV2.rebalanceSettledEvent(tradingPoolAddress, fromBlock, toBlock)];
                    case 1:
                        events = _a.sent();
                        formattedEventPromises = events.map(function (event) { return __awaiter(_this, void 0, void 0, function () {
                            var returnValues, rebalanceIndex, feeRecipient, feeQuantity, timestamp, block;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        returnValues = event.returnValues;
                                        rebalanceIndex = returnValues['rebalanceIndex'];
                                        feeRecipient = returnValues['feeRecipient'];
                                        feeQuantity = returnValues['feeQuantity'];
                                        timestamp = undefined;
                                        if (!getTimestamp) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.web3.eth.getBlock(event.blockNumber)];
                                    case 1:
                                        block = _a.sent();
                                        timestamp = block.timestamp;
                                        _a.label = 2;
                                    case 2: return [2 /*return*/, {
                                            transactionHash: event.transactionHash,
                                            rebalanceIndex: rebalanceIndex,
                                            feeRecipient: feeRecipient,
                                            feeQuantity: new util_1.BigNumber(feeQuantity),
                                            timestamp: timestamp,
                                        }];
                                }
                            });
                        }); });
                        return [2 /*return*/, Promise.all(formattedEventPromises)];
                }
            });
        });
    };
    /* ============ Private Functions ============ */
    SocialTradingAPI.prototype.createNewTradingPoolObject = function (newPoolInfo) {
        var poolInfo = newPoolInfo[0], rbSetInfo = newPoolInfo[1], collateralInfo = newPoolInfo[2];
        return {
            trader: poolInfo.trader,
            allocator: poolInfo.allocator,
            currentAllocation: poolInfo.currentAllocation,
            manager: rbSetInfo.manager,
            feeRecipient: rbSetInfo.feeRecipient,
            currentSet: rbSetInfo.currentSet,
            poolName: rbSetInfo.name,
            poolSymbol: rbSetInfo.symbol,
            unitShares: rbSetInfo.unitShares,
            naturalUnit: rbSetInfo.naturalUnit,
            rebalanceInterval: rbSetInfo.rebalanceInterval,
            entryFee: rbSetInfo.entryFee,
            rebalanceFee: rbSetInfo.rebalanceFee,
            lastRebalanceTimestamp: rbSetInfo.lastRebalanceTimestamp,
            rebalanceState: rbSetInfo.rebalanceState,
            currentSetInfo: collateralInfo,
        };
    };
    SocialTradingAPI.prototype.createNewTradingPoolV2Object = function (newPoolV2Info) {
        var poolInfo = newPoolV2Info[0], rbSetInfo = newPoolV2Info[1], perfFeeInfo = newPoolV2Info[2], collateralInfo = newPoolV2Info[3], perfFeeCalculator = newPoolV2Info[4];
        return {
            trader: poolInfo.trader,
            allocator: poolInfo.allocator,
            currentAllocation: poolInfo.currentAllocation,
            manager: rbSetInfo.manager,
            feeRecipient: rbSetInfo.feeRecipient,
            currentSet: rbSetInfo.currentSet,
            poolName: rbSetInfo.name,
            poolSymbol: rbSetInfo.symbol,
            unitShares: rbSetInfo.unitShares,
            naturalUnit: rbSetInfo.naturalUnit,
            rebalanceInterval: rbSetInfo.rebalanceInterval,
            entryFee: rbSetInfo.entryFee,
            rebalanceFee: rbSetInfo.rebalanceFee,
            lastRebalanceTimestamp: rbSetInfo.lastRebalanceTimestamp,
            rebalanceState: rbSetInfo.rebalanceState,
            currentSetInfo: collateralInfo,
            performanceFeeInfo: perfFeeInfo,
            performanceFeeCalculatorAddress: perfFeeCalculator,
        };
    };
    SocialTradingAPI.prototype.createTradingPoolRebalanceObject = function (newPoolInfo) {
        var poolInfo = newPoolInfo[0], rbSetInfo = newPoolInfo[1], collateralInfo = newPoolInfo[2];
        return {
            trader: poolInfo.trader,
            allocator: poolInfo.allocator,
            currentAllocation: poolInfo.currentAllocation,
            liquidator: rbSetInfo.liquidator,
            nextSet: rbSetInfo.nextSet,
            rebalanceStartTime: rbSetInfo.rebalanceStartTime,
            timeToPivot: rbSetInfo.timeToPivot,
            startPrice: rbSetInfo.startPrice,
            endPrice: rbSetInfo.endPrice,
            startingCurrentSets: rbSetInfo.startingCurrentSets,
            remainingCurrentSets: rbSetInfo.remainingCurrentSets,
            minimumBid: rbSetInfo.minimumBid,
            rebalanceState: rbSetInfo.rebalanceState,
            nextSetInfo: collateralInfo,
        };
    };
    SocialTradingAPI.prototype.createTradingPoolAccumulationObject = function (tradingPoolFees) {
        var streamingFees = tradingPoolFees[0];
        var profitFees = tradingPoolFees[1];
        var accumulationInfo = [];
        _.forEach(streamingFees, function (streamingFee, index) {
            accumulationInfo.push({
                streamingFee: streamingFee,
                profitFee: profitFees[index],
            });
        });
        return accumulationInfo;
    };
    /* ============ Private Assertions ============ */
    SocialTradingAPI.prototype.assertCreateTradingPool = function (allocation, tradingPoolName, tradingPoolSymbol, manager, allocatorAddress, liquidator, feeRecipient, feeCalculator, entryFee, rebalanceFee) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.assert.schema.isValidAddress('manager', manager);
                this.assert.schema.isValidAddress('allocatorAddress', allocatorAddress);
                this.assert.schema.isValidAddress('liquidator', liquidator);
                this.assert.schema.isValidAddress('feeRecipient', feeRecipient);
                this.assert.schema.isValidAddress('feeCalculator', feeCalculator);
                this.assertValidAllocation(allocation);
                this.assertValidFees(entryFee, rebalanceFee);
                this.assert.common.isValidString(tradingPoolName, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('name'));
                this.assert.common.isValidString(tradingPoolSymbol, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('symbol'));
                return [2 /*return*/];
            });
        });
    };
    SocialTradingAPI.prototype.assertCreateTradingPoolV2 = function (allocation, tradingPoolName, tradingPoolSymbol, manager, allocatorAddress, liquidator, feeRecipient, feeCalculator, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('manager', manager);
                        this.assert.schema.isValidAddress('allocatorAddress', allocatorAddress);
                        this.assert.schema.isValidAddress('liquidator', liquidator);
                        this.assert.schema.isValidAddress('feeRecipient', feeRecipient);
                        this.assert.schema.isValidAddress('feeCalculator', feeCalculator);
                        this.assertValidAllocation(allocation);
                        return [4 /*yield*/, this.assertValidPerformanceFees(feeCalculator, profitFeePeriod, highWatermarkResetPeriod, entryFee, profitFee, streamingFee)];
                    case 1:
                        _a.sent();
                        this.assert.common.isValidString(tradingPoolName, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('name'));
                        this.assert.common.isValidString(tradingPoolSymbol, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('symbol'));
                        return [2 /*return*/];
                }
            });
        });
    };
    SocialTradingAPI.prototype.assertAddressSetters = function (manager, tradingPool, newAddress, trader) {
        return __awaiter(this, void 0, void 0, function () {
            var poolInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('manager', manager);
                        this.assert.schema.isValidAddress('tradingPool', tradingPool);
                        this.assert.schema.isValidAddress('newAddress', newAddress);
                        return [4 /*yield*/, this.socialTradingManager.pools(manager, tradingPool)];
                    case 1:
                        poolInfo = _a.sent();
                        this.assert.socialTrading.isTrader(poolInfo.trader, trader);
                        return [2 /*return*/];
                }
            });
        });
    };
    SocialTradingAPI.prototype.assertUpdateAllocation = function (manager, tradingPool, newAllocation, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var poolInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('manager', manager);
                        this.assert.schema.isValidAddress('tradingPool', tradingPool);
                        return [4 /*yield*/, this.socialTradingManager.pools(manager, tradingPool)];
                    case 1:
                        poolInfo = _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.isNotInRebalanceState(tradingPool)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.sufficientTimeBetweenRebalance(tradingPool)];
                    case 3:
                        _a.sent();
                        this.assert.socialTrading.isTrader(poolInfo.trader, txOpts.from);
                        this.assertValidAllocation(newAllocation);
                        return [2 /*return*/];
                }
            });
        });
    };
    SocialTradingAPI.prototype.assertInitiateEntryFeeChange = function (manager, tradingPool, entryFee, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var poolInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('manager', manager);
                        this.assert.schema.isValidAddress('tradingPool', tradingPool);
                        return [4 /*yield*/, this.socialTradingManager.pools(manager, tradingPool)];
                    case 1:
                        poolInfo = _a.sent();
                        this.assert.socialTrading.isTrader(poolInfo.trader, txOpts.from);
                        this.assert.socialTrading.feeMultipleOfOneBasisPoint(entryFee);
                        return [4 /*yield*/, this.assert.socialTrading.feeDoesNotExceedMax(manager, entryFee)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SocialTradingAPI.prototype.assertFinalizeEntryFeeChange = function (manager, tradingPool, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var poolInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('manager', manager);
                        this.assert.schema.isValidAddress('tradingPool', tradingPool);
                        return [4 /*yield*/, this.socialTradingManager.pools(manager, tradingPool)];
                    case 1:
                        poolInfo = _a.sent();
                        this.assert.socialTrading.isTrader(poolInfo.trader, txOpts.from);
                        this.assert.socialTrading.feeChangeInitiated(new util_1.BigNumber(poolInfo.feeUpdateTimestamp));
                        this.assert.socialTrading.feeChangeTimelockElapsed(new util_1.BigNumber(poolInfo.feeUpdateTimestamp));
                        return [2 /*return*/];
                }
            });
        });
    };
    SocialTradingAPI.prototype.assertAdjustFees = function (manager, tradingPool, newFeeType, newFeePercentage, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var poolInfo, tradingPoolData, maxFee;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.socialTradingManager.pools(manager, tradingPool)];
                    case 1:
                        poolInfo = _a.sent();
                        this.assert.socialTrading.isTrader(poolInfo.trader, txOpts.from);
                        this.assert.socialTrading.feeMultipleOfOneBasisPoint(newFeePercentage);
                        return [4 /*yield*/, this.fetchNewTradingPoolV2DetailsAsync(tradingPool)];
                    case 2:
                        tradingPoolData = _a.sent();
                        if (!(newFeeType == common_1.FeeType.StreamingFee)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.performanceFeeCalculator.maximumStreamingFeePercentage(tradingPoolData.performanceFeeCalculatorAddress)];
                    case 3:
                        maxFee = _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.performanceFeeCalculator.maximumProfitFeePercentage(tradingPoolData.performanceFeeCalculatorAddress)];
                    case 5:
                        maxFee = _a.sent();
                        _a.label = 6;
                    case 6:
                        this.assert.common.isGreaterOrEqualThan(maxFee, newFeePercentage, 'Passed fee exceeds allowed maximum.');
                        return [2 /*return*/];
                }
            });
        });
    };
    SocialTradingAPI.prototype.assertRemoveFeeUpdate = function (manager, tradingPool, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var poolInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.socialTradingManager.pools(manager, tradingPool)];
                    case 1:
                        poolInfo = _a.sent();
                        this.assert.socialTrading.isTrader(poolInfo.trader, txOpts.from);
                        return [2 /*return*/];
                }
            });
        });
    };
    SocialTradingAPI.prototype.assertValidAllocation = function (newAllocation) {
        this.assert.socialTrading.allocationGreaterOrEqualToZero(newAllocation);
        this.assert.socialTrading.allocationLessThanOneHundred(newAllocation);
        this.assert.socialTrading.allocationMultipleOfOnePercent(newAllocation);
    };
    SocialTradingAPI.prototype.assertValidFees = function (entryFee, rebalanceFee) {
        this.assert.socialTrading.feeMultipleOfOneBasisPoint(entryFee);
        this.assert.socialTrading.feeMultipleOfOneBasisPoint(rebalanceFee);
    };
    SocialTradingAPI.prototype.assertValidPerformanceFees = function (feeCalculator, profitFeePeriod, highWatermarkResetPeriod, entryFee, profitFee, streamingFee) {
        return __awaiter(this, void 0, void 0, function () {
            var maxProfitFeePercentage, maxStreamingFeePercentage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.socialTrading.feeMultipleOfOneBasisPoint(entryFee);
                        this.assert.socialTrading.feeMultipleOfOneBasisPoint(profitFee);
                        this.assert.socialTrading.feeMultipleOfOneBasisPoint(streamingFee);
                        this.assert.common.isGreaterOrEqualThan(highWatermarkResetPeriod, profitFeePeriod, 'High watermark reset must be greater than profit fee period.');
                        return [4 /*yield*/, this.performanceFeeCalculator.maximumProfitFeePercentage(feeCalculator)];
                    case 1:
                        maxProfitFeePercentage = _a.sent();
                        return [4 /*yield*/, this.performanceFeeCalculator.maximumStreamingFeePercentage(feeCalculator)];
                    case 2:
                        maxStreamingFeePercentage = _a.sent();
                        this.assert.common.isGreaterOrEqualThan(maxProfitFeePercentage, profitFee, 'Passed fee exceeds allowed maximum.');
                        this.assert.common.isGreaterOrEqualThan(maxStreamingFeePercentage, streamingFee, 'Passed fee exceeds allowed maximum.');
                        return [2 /*return*/];
                }
            });
        });
    };
    return SocialTradingAPI;
}());
exports.SocialTradingAPI = SocialTradingAPI;
//# sourceMappingURL=SocialTradingAPI.js.map