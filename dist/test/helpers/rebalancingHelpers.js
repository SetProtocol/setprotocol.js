"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __importStar(require("lodash"));
var tiny_promisify_1 = __importDefault(require("tiny-promisify"));
var set_protocol_utils_1 = require("set-protocol-utils");
var set_protocol_contracts_1 = require("set-protocol-contracts");
var set_protocol_contracts_2 = require("set-protocol-contracts");
var constants_1 = require("@src/constants");
var helpers_1 = require("@test/helpers");
var util_1 = require("@src/util");
var coreHelpers_1 = require("./coreHelpers");
exports.deploySetTokensAsync = function (web3, core, factory, transferProxy, tokenCount, naturalUnits) {
    if (naturalUnits === void 0) { naturalUnits = []; }
    return __awaiter(_this, void 0, void 0, function () {
        var naturalUnit, setTokenArray, components, indexArray, _a, _b, _i, index, minimumDecimal, idx, componentOneDecimal, componentTwoDecimal, setComponents, setComponentAddresses, setComponentUnits, setToken;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setTokenArray = [];
                    return [4 /*yield*/, helpers_1.deployTokensAsync(tokenCount + 1, web3)];
                case 1:
                    components = _c.sent();
                    return [4 /*yield*/, helpers_1.approveForTransferAsync(components, transferProxy)];
                case 2:
                    _c.sent();
                    indexArray = _.times(tokenCount, Number);
                    _a = [];
                    for (_b in indexArray)
                        _a.push(_b);
                    _i = 0;
                    _c.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    index = _a[_i];
                    minimumDecimal = void 0;
                    idx = Number(index);
                    return [4 /*yield*/, components[idx].decimals.callAsync()];
                case 4:
                    componentOneDecimal = _c.sent();
                    return [4 /*yield*/, components[idx + 1].decimals.callAsync()];
                case 5:
                    componentTwoDecimal = _c.sent();
                    // Determine minimum natural unit if not passed in
                    if (naturalUnits.length > 0) {
                        naturalUnit = naturalUnits[idx];
                        minimumDecimal = 18 - naturalUnit.e;
                    }
                    else {
                        minimumDecimal = Math.min(componentOneDecimal.toNumber(), componentTwoDecimal.toNumber());
                        naturalUnit = new util_1.BigNumber(Math.pow(10, (18 - minimumDecimal)));
                    }
                    setComponents = components.slice(idx, idx + 2);
                    setComponentAddresses = _.map(setComponents, function (token) { return token.address; });
                    setComponentUnits = [
                        new util_1.BigNumber(Math.pow(10, (componentOneDecimal.toNumber() - minimumDecimal))).mul(new util_1.BigNumber(idx + 1)),
                        new util_1.BigNumber(Math.pow(10, (componentTwoDecimal.toNumber() - minimumDecimal))).mul(new util_1.BigNumber(idx + 1)),
                    ];
                    return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory, setComponentAddresses, setComponentUnits, naturalUnit)];
                case 6:
                    setToken = _c.sent();
                    setTokenArray.push(setToken);
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8: return [2 /*return*/, setTokenArray];
            }
        });
    });
};
exports.deployConstantAuctionPriceCurveAsync = function (web3, priceNumerator, priceDenominator) { return __awaiter(_this, void 0, void 0, function () {
    var truffleConstantAuctionPriceCurveContract, deployedConstantAuctionPriceCurveInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleConstantAuctionPriceCurveContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_contracts_1.ConstantAuctionPriceCurve);
                return [4 /*yield*/, truffleConstantAuctionPriceCurveContract.new(priceNumerator, priceDenominator)];
            case 1:
                deployedConstantAuctionPriceCurveInstance = _a.sent();
                return [4 /*yield*/, set_protocol_contracts_2.ConstantAuctionPriceCurveContract.at(deployedConstantAuctionPriceCurveInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.addPriceCurveToCoreAsync = function (core, priceCurveAddress) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        core.addPriceLibrary.sendTransactionAsync(priceCurveAddress);
        return [2 /*return*/];
    });
}); };
exports.createRebalancingSetTokenAsync = function (web3, core, factory, componentAddresses, units, naturalUnit, callData, name, symbol) {
    if (callData === void 0) { callData = ''; }
    if (name === void 0) { name = 'Rebalancing Set Token'; }
    if (symbol === void 0) { symbol = 'RBSET'; }
    return __awaiter(_this, void 0, void 0, function () {
        var encodedName, encodedSymbol, txHash, logs, setAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encodedName = set_protocol_utils_1.SetProtocolUtils.stringToBytes(name);
                    encodedSymbol = set_protocol_utils_1.SetProtocolUtils.stringToBytes(symbol);
                    return [4 /*yield*/, core.createSet.sendTransactionAsync(factory, componentAddresses, units, naturalUnit, encodedName, encodedSymbol, callData, constants_1.TX_DEFAULTS)];
                case 1:
                    txHash = _a.sent();
                    return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                case 2:
                    logs = _a.sent();
                    setAddress = util_1.extractNewSetTokenAddressFromLogs(logs);
                    return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetTokenContract.at(setAddress, web3, constants_1.TX_DEFAULTS)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.createRebalancingTokenV2Async = function (web3, core, factory, componentAddresses, units, naturalUnit, callData, name, symbol, from) {
    if (callData === void 0) { callData = ''; }
    if (name === void 0) { name = 'Rebalancing Set Token'; }
    if (symbol === void 0) { symbol = 'RBSET'; }
    if (from === void 0) { from = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var encodedName, encodedSymbol, txHash, logs, setAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encodedName = set_protocol_utils_1.SetProtocolUtils.stringToBytes(name);
                    encodedSymbol = set_protocol_utils_1.SetProtocolUtils.stringToBytes(symbol);
                    return [4 /*yield*/, core.createSet.sendTransactionAsync(factory, componentAddresses, units, naturalUnit, encodedName, encodedSymbol, callData, { from: from })];
                case 1:
                    txHash = _a.sent();
                    return [4 /*yield*/, new set_protocol_utils_1.SetProtocolTestUtils(web3).getLogsFromTxHash(txHash)];
                case 2:
                    logs = _a.sent();
                    setAddress = util_1.extractNewSetTokenAddressFromLogs(logs);
                    return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetTokenV2Contract.at(setAddress, web3, { from: from })];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.createRebalancingTokenV3Async = function (web3, core, factory, componentAddresses, units, naturalUnit, callData, name, symbol, from) {
    if (callData === void 0) { callData = ''; }
    if (name === void 0) { name = 'Rebalancing Set Token'; }
    if (symbol === void 0) { symbol = 'RBSET'; }
    if (from === void 0) { from = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var encodedName, encodedSymbol, txHash, logs, setAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encodedName = set_protocol_utils_1.SetProtocolUtils.stringToBytes(name);
                    encodedSymbol = set_protocol_utils_1.SetProtocolUtils.stringToBytes(symbol);
                    return [4 /*yield*/, core.createSet.sendTransactionAsync(factory, componentAddresses, units, naturalUnit, encodedName, encodedSymbol, callData, { from: from })];
                case 1:
                    txHash = _a.sent();
                    return [4 /*yield*/, new set_protocol_utils_1.SetProtocolTestUtils(web3).getLogsFromTxHash(txHash)];
                case 2:
                    logs = _a.sent();
                    setAddress = util_1.extractNewSetTokenAddressFromLogs(logs);
                    return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetTokenV3Contract.at(setAddress, web3, { from: from })];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.createDefaultRebalancingSetTokenAsync = function (web3, core, factory, manager, initialSet, proposalPeriod, initialUnitShares) {
    if (initialUnitShares === void 0) { initialUnitShares = constants_1.DEFAULT_UNIT_SHARES; }
    return __awaiter(_this, void 0, void 0, function () {
        var rebalanceInterval, callData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                    callData = set_protocol_utils_1.SetProtocolTestUtils.bufferArrayToHex([
                        set_protocol_utils_1.SetProtocolUtils.paddedBufferForPrimitive(manager),
                        set_protocol_utils_1.SetProtocolUtils.paddedBufferForBigNumber(proposalPeriod),
                        set_protocol_utils_1.SetProtocolUtils.paddedBufferForBigNumber(rebalanceInterval),
                    ]);
                    return [4 /*yield*/, exports.createRebalancingSetTokenAsync(web3, core, factory, [initialSet], [initialUnitShares], constants_1.DEFAULT_REBALANCING_NATURAL_UNIT, callData)];
                case 1: 
                // Create rebalancingSetToken
                return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.createDefaultRebalancingSetTokenV2Async = function (web3, core, factory, manager, liquidator, feeRecipient, rebalanceFeeCalculator, initialSet, failRebalancePeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, initialUnitShares) {
    if (entryFee === void 0) { entryFee = constants_1.ZERO; }
    if (rebalanceFee === void 0) { rebalanceFee = constants_1.ZERO; }
    if (initialUnitShares === void 0) { initialUnitShares = constants_1.DEFAULT_UNIT_SHARES; }
    return __awaiter(_this, void 0, void 0, function () {
        var rebalanceInterval, rebalanceFeeCallData, callData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                    rebalanceFeeCallData = set_protocol_utils_1.SetProtocolUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
                    callData = set_protocol_utils_1.SetProtocolUtils.generateRebalancingSetTokenV2CallData(manager, liquidator, feeRecipient, rebalanceFeeCalculator, rebalanceInterval, failRebalancePeriod, lastRebalanceTimestamp, entryFee, rebalanceFeeCallData);
                    return [4 /*yield*/, exports.createRebalancingTokenV2Async(web3, core, factory, [initialSet], [initialUnitShares], constants_1.DEFAULT_REBALANCING_NATURAL_UNIT, callData)];
                case 1: 
                // Create rebalancingSetToken
                return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.createDefaultRebalancingSetTokenV3Async = function (web3, core, factory, manager, liquidator, feeRecipient, rebalanceFeeCalculator, initialSet, failRebalancePeriod, lastRebalanceTimestamp, entryFee, profitFee, streamingFee, profitFeePeriod, highWatermarkResetPeriod, initialUnitShares) {
    if (entryFee === void 0) { entryFee = constants_1.ZERO; }
    if (profitFee === void 0) { profitFee = constants_1.ZERO; }
    if (streamingFee === void 0) { streamingFee = constants_1.ZERO; }
    if (profitFeePeriod === void 0) { profitFeePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(30); }
    if (highWatermarkResetPeriod === void 0) { highWatermarkResetPeriod = constants_1.ONE_DAY_IN_SECONDS.mul(365); }
    if (initialUnitShares === void 0) { initialUnitShares = constants_1.DEFAULT_UNIT_SHARES; }
    return __awaiter(_this, void 0, void 0, function () {
        var rebalanceInterval, rebalanceFeeCallData, callData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                    rebalanceFeeCallData = set_protocol_utils_1.SetProtocolUtils.generatePerformanceFeeCallDataBuffer(profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee);
                    callData = set_protocol_utils_1.SetProtocolUtils.generateRebalancingSetTokenV3CallData(manager, liquidator, feeRecipient, rebalanceFeeCalculator, rebalanceInterval, failRebalancePeriod, lastRebalanceTimestamp, entryFee, rebalanceFeeCallData);
                    return [4 /*yield*/, exports.createRebalancingTokenV3Async(web3, core, factory, [initialSet], [initialUnitShares], constants_1.DEFAULT_REBALANCING_NATURAL_UNIT, callData)];
                case 1: 
                // Create rebalancingSetToken
                return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.transitionToProposeAsync = function (web3, rebalancingSetToken, manager, nextSetToken, auctionPriceCurve, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice) {
    if (auctionTimeToPivot === void 0) { auctionTimeToPivot = constants_1.DEFAULT_AUCTION_TIME_TO_PIVOT; }
    if (auctionStartPrice === void 0) { auctionStartPrice = constants_1.DEFAULT_AUCTION_START_PRICE; }
    if (auctionPivotPrice === void 0) { auctionPivotPrice = constants_1.DEFAULT_AUCTION_PIVOT_PRICE; }
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Transition to propose
                return [4 /*yield*/, exports.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS.add(1))];
                case 1:
                    // Transition to propose
                    _a.sent();
                    return [4 /*yield*/, rebalancingSetToken.propose.sendTransactionAsync(nextSetToken, auctionPriceCurve, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice, { from: manager, gas: constants_1.DEFAULT_GAS_LIMIT })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.transitionToRebalanceAsync = function (web3, rebalancingSetToken, manager, nextSetToken, auctionPriceCurve, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice) {
    if (auctionTimeToPivot === void 0) { auctionTimeToPivot = constants_1.DEFAULT_AUCTION_TIME_TO_PIVOT; }
    if (auctionStartPrice === void 0) { auctionStartPrice = constants_1.DEFAULT_AUCTION_START_PRICE; }
    if (auctionPivotPrice === void 0) { auctionPivotPrice = constants_1.DEFAULT_AUCTION_PIVOT_PRICE; }
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Transition to propose
                return [4 /*yield*/, exports.transitionToProposeAsync(web3, rebalancingSetToken, manager, nextSetToken, auctionPriceCurve, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice)];
                case 1:
                    // Transition to propose
                    _a.sent();
                    // Transition to rebalance
                    return [4 /*yield*/, exports.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS.add(1))];
                case 2:
                    // Transition to rebalance
                    _a.sent();
                    return [4 /*yield*/, rebalancingSetToken.startRebalance.sendTransactionAsync(constants_1.TX_DEFAULTS)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.transitionToDrawdownAsync = function (web3, rebalancingSetToken, manager, nextSetToken, auctionPriceCurve, rebalanceAuctionModule, bidAmount, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice) {
    if (auctionTimeToPivot === void 0) { auctionTimeToPivot = constants_1.DEFAULT_AUCTION_TIME_TO_PIVOT; }
    if (auctionStartPrice === void 0) { auctionStartPrice = constants_1.DEFAULT_AUCTION_START_PRICE; }
    if (auctionPivotPrice === void 0) { auctionPivotPrice = constants_1.DEFAULT_AUCTION_PIVOT_PRICE; }
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Transition to rebalance
                return [4 /*yield*/, exports.transitionToRebalanceAsync(web3, rebalancingSetToken, manager, nextSetToken, auctionPriceCurve, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice)];
                case 1:
                    // Transition to rebalance
                    _a.sent();
                    // Bid
                    return [4 /*yield*/, rebalanceAuctionModule.bidAndWithdraw.sendTransactionAsync(rebalancingSetToken.address, bidAmount, true, constants_1.TX_DEFAULTS)];
                case 2:
                    // Bid
                    _a.sent();
                    // Transition to 1 second after pivot time
                    return [4 /*yield*/, exports.increaseChainTimeAsync(web3, new util_1.BigNumber(auctionTimeToPivot).add(1).mul(1000))];
                case 3:
                    // Transition to 1 second after pivot time
                    _a.sent();
                    // Transition to Drawdown
                    return [4 /*yield*/, rebalancingSetToken.endFailedAuction.sendTransactionAsync(constants_1.TX_DEFAULTS)];
                case 4:
                    // Transition to Drawdown
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.increaseChainTimeAsync = function (web3, duration) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, sendJSONRpcRequestAsync(web3, 'evm_increaseTime', [duration.toNumber()])];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.mineBlockAsync = function (web3) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, sendJSONRpcRequestAsync(web3, 'evm_mine', [])];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var sendJSONRpcRequestAsync = function (web3, method, params) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, tiny_promisify_1.default(web3.currentProvider.send, {
                context: web3.currentProvider,
            })({
                jsonrpc: '2.0',
                method: method,
                params: params,
                id: new Date().getTime(),
            })];
    });
}); };
exports.constructCombinedUnitArrayAsync = function (rebalancingSetToken, targetSetToken, otherSetToken, combinedTokenArray) { return __awaiter(_this, void 0, void 0, function () {
    var setTokenComponents, setTokenUnits, targetSetNaturalUnit, otherSetNaturalUnit, maxNaturalUnit, combinedSetTokenUnits;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, targetSetToken.getComponents.callAsync()];
            case 1:
                setTokenComponents = _a.sent();
                return [4 /*yield*/, targetSetToken.getUnits.callAsync()];
            case 2:
                setTokenUnits = _a.sent();
                return [4 /*yield*/, targetSetToken.naturalUnit.callAsync()];
            case 3:
                targetSetNaturalUnit = _a.sent();
                return [4 /*yield*/, otherSetToken.naturalUnit.callAsync()];
            case 4:
                otherSetNaturalUnit = _a.sent();
                maxNaturalUnit = Math.max(targetSetNaturalUnit.toNumber(), otherSetNaturalUnit.toNumber());
                combinedSetTokenUnits = [];
                combinedTokenArray.forEach(function (address) {
                    var index = setTokenComponents.indexOf(address);
                    if (index != -1) {
                        var totalTokenAmount = setTokenUnits[index].mul(maxNaturalUnit).div(targetSetNaturalUnit);
                        combinedSetTokenUnits.push(totalTokenAmount);
                    }
                    else {
                        combinedSetTokenUnits.push(constants_1.ZERO);
                    }
                });
                return [2 /*return*/, combinedSetTokenUnits];
        }
    });
}); };
exports.getAuctionSetUpOutputsAsync = function (rebalancingSetToken, currentSetToken, nextSetToken, auctionPriceDivisor) { return __awaiter(_this, void 0, void 0, function () {
    var currentSetTokenComponents, nextSetTokenComponents, currentSetTokenNaturalUnit, nextSetTokenNaturalUnit, expectedCombinedTokenArray, expectedCombinedCurrentUnits, expectedCombinedNextUnits, maxNaturalUnit, expectedMinimumBid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, currentSetToken.getComponents.callAsync()];
            case 1:
                currentSetTokenComponents = _a.sent();
                return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
            case 2:
                nextSetTokenComponents = _a.sent();
                return [4 /*yield*/, currentSetToken.naturalUnit.callAsync()];
            case 3:
                currentSetTokenNaturalUnit = _a.sent();
                return [4 /*yield*/, nextSetToken.naturalUnit.callAsync()];
            case 4:
                nextSetTokenNaturalUnit = _a.sent();
                expectedCombinedTokenArray = _.union(currentSetTokenComponents, nextSetTokenComponents);
                return [4 /*yield*/, exports.constructCombinedUnitArrayAsync(rebalancingSetToken, currentSetToken, nextSetToken, expectedCombinedTokenArray)];
            case 5:
                expectedCombinedCurrentUnits = _a.sent();
                return [4 /*yield*/, exports.constructCombinedUnitArrayAsync(rebalancingSetToken, nextSetToken, currentSetToken, expectedCombinedTokenArray)];
            case 6:
                expectedCombinedNextUnits = _a.sent();
                maxNaturalUnit = Math.max(currentSetTokenNaturalUnit.toNumber(), nextSetTokenNaturalUnit.toNumber());
                expectedMinimumBid = new util_1.BigNumber(maxNaturalUnit).mul(auctionPriceDivisor);
                return [2 /*return*/, { expectedCombinedTokenArray: expectedCombinedTokenArray, expectedCombinedCurrentUnits: expectedCombinedCurrentUnits, expectedCombinedNextUnits: expectedCombinedNextUnits, expectedMinimumBid: expectedMinimumBid }];
        }
    });
}); };
exports.constructInflowOutflowArraysAsync = function (rebalancingSetToken, quantity, priceNumerator) { return __awaiter(_this, void 0, void 0, function () {
    var inflowArray, outflowArray, combinedCurrentUnits, combinedRebalanceUnits, priceDivisor, minimumBid, coefficient, effectiveQuantity, i, flow, outflow;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                inflowArray = [];
                outflowArray = [];
                return [4 /*yield*/, rebalancingSetToken.getCombinedCurrentUnits.callAsync()];
            case 1:
                combinedCurrentUnits = _a.sent();
                return [4 /*yield*/, rebalancingSetToken.getCombinedNextSetUnits.callAsync()];
            case 2:
                combinedRebalanceUnits = _a.sent();
                priceDivisor = constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR;
                return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
            case 3:
                minimumBid = (_a.sent())[0];
                coefficient = minimumBid.div(priceDivisor);
                effectiveQuantity = quantity.mul(priceDivisor).div(priceNumerator);
                for (i = 0; i < combinedCurrentUnits.length; i++) {
                    flow = combinedRebalanceUnits[i].mul(priceDivisor).sub(combinedCurrentUnits[i].mul(priceNumerator));
                    if (flow.greaterThan(constants_1.ZERO)) {
                        inflowArray.push(effectiveQuantity.mul(flow).div(coefficient).round(0, 3).div(priceDivisor).round(0, 3));
                        outflowArray.push(constants_1.ZERO);
                    }
                    else {
                        outflow = flow.mul(effectiveQuantity).div(coefficient).round(0, 3).div(priceDivisor).round(0, 3);
                        if (!outflow.isZero()) {
                            // We do this because this produces a negative 0
                            outflow = outflow.mul(new util_1.BigNumber(-1));
                        }
                        outflowArray.push(outflow);
                        inflowArray.push(constants_1.ZERO);
                    }
                }
                return [2 /*return*/, { inflow: inflowArray, outflow: outflowArray }];
        }
    });
}); };
exports.constructInflowOutflowAddressesArraysAsync = function (rebalancingSetToken, quantity, priceNumerator, combinedTokenArray) { return __awaiter(_this, void 0, void 0, function () {
    var inflowArray, outflowArray, combinedCurrentUnits, combinedRebalanceUnits, priceDivisor, minimumBid, coefficient, effectiveQuantity, i, flow, outflow;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                inflowArray = [];
                outflowArray = [];
                return [4 /*yield*/, rebalancingSetToken.getCombinedCurrentUnits.callAsync()];
            case 1:
                combinedCurrentUnits = _a.sent();
                return [4 /*yield*/, rebalancingSetToken.getCombinedNextSetUnits.callAsync()];
            case 2:
                combinedRebalanceUnits = _a.sent();
                priceDivisor = constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR;
                return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
            case 3:
                minimumBid = (_a.sent())[0];
                coefficient = minimumBid.div(priceDivisor);
                effectiveQuantity = quantity.mul(priceDivisor).div(priceNumerator);
                for (i = 0; i < combinedCurrentUnits.length; i++) {
                    flow = combinedRebalanceUnits[i].mul(priceDivisor).sub(combinedCurrentUnits[i].mul(priceNumerator));
                    if (flow.greaterThan(constants_1.ZERO)) {
                        inflowArray.push({
                            address: combinedTokenArray[i],
                            unit: effectiveQuantity.mul(flow).div(coefficient).round(0, 3).div(priceDivisor).round(0, 3),
                        });
                    }
                    else if (flow.lessThan(constants_1.ZERO)) {
                        outflow = flow.mul(effectiveQuantity).div(coefficient).round(0, 3).div(priceDivisor).round(0, 3);
                        if (!outflow.isZero()) {
                            // We do this because this produces a negative 0
                            outflow = outflow.mul(new util_1.BigNumber(-1));
                        }
                        outflowArray.push({
                            address: combinedTokenArray[i],
                            unit: outflow,
                        });
                    }
                }
                return [2 /*return*/, { inflow: inflowArray, outflow: outflowArray }];
        }
    });
}); };
exports.getExpectedUnitSharesAsync = function (rebalancingSetToken, newSet, vault) { return __awaiter(_this, void 0, void 0, function () {
    var totalSupply, rebalancingNaturalUnit, newSetNaturalUnit, components, units, maxIssueAmount, i, componentAmount, componentIssueAmount, naturalUnitsOutstanding, issueAmount, unitShares;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, rebalancingSetToken.totalSupply.callAsync()];
            case 1:
                totalSupply = _a.sent();
                return [4 /*yield*/, rebalancingSetToken.naturalUnit.callAsync()];
            case 2:
                rebalancingNaturalUnit = _a.sent();
                return [4 /*yield*/, newSet.naturalUnit.callAsync()];
            case 3:
                newSetNaturalUnit = _a.sent();
                return [4 /*yield*/, newSet.getComponents.callAsync()];
            case 4:
                components = _a.sent();
                return [4 /*yield*/, newSet.getUnits.callAsync()];
            case 5:
                units = _a.sent();
                maxIssueAmount = constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS;
                i = 0;
                _a.label = 6;
            case 6:
                if (!(i < components.length)) return [3 /*break*/, 9];
                return [4 /*yield*/, vault.getOwnerBalance.callAsync(components[i], rebalancingSetToken.address)];
            case 7:
                componentAmount = _a.sent();
                componentIssueAmount = componentAmount.div(units[i]).round(0, 3).mul(newSetNaturalUnit);
                if (componentIssueAmount.lessThan(maxIssueAmount)) {
                    maxIssueAmount = componentIssueAmount;
                }
                _a.label = 8;
            case 8:
                i++;
                return [3 /*break*/, 6];
            case 9:
                naturalUnitsOutstanding = totalSupply.div(rebalancingNaturalUnit);
                issueAmount = maxIssueAmount.div(newSetNaturalUnit).round(0, 3).mul(newSetNaturalUnit);
                unitShares = issueAmount.div(naturalUnitsOutstanding).round(0, 3);
                return [2 /*return*/, unitShares];
        }
    });
}); };
//# sourceMappingURL=rebalancingHelpers.js.map