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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var set_protocol_strategies_1 = require("set-protocol-strategies");
var set_protocol_contracts_1 = require("set-protocol-contracts");
var constants_1 = require("@src/constants");
var util_1 = require("@src/util");
var coreHelpers_1 = require("./coreHelpers");
exports.deployBtcEthManagerContractAsync = function (web3, coreAddress, btcPriceFeedAddress, ethPriceFeedAddress, btcAddress, ethAddress, setTokenFactory, auctionLibrary, auctionTimeToPivot, componentMultipliers, allocationBounds) { return __awaiter(_this, void 0, void 0, function () {
    var truffleBTCETHRebalancingManagerContract, deployedBtcEthManagerInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleBTCETHRebalancingManagerContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.BTCETHRebalancingManager);
                return [4 /*yield*/, truffleBTCETHRebalancingManagerContract.new(coreAddress, btcPriceFeedAddress, ethPriceFeedAddress, btcAddress, ethAddress, setTokenFactory, auctionLibrary, auctionTimeToPivot, componentMultipliers, allocationBounds)];
            case 1:
                deployedBtcEthManagerInstance = _a.sent();
                return [4 /*yield*/, set_protocol_strategies_1.BTCETHRebalancingManagerContract.at(deployedBtcEthManagerInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deployBtcDaiManagerContractAsync = function (web3, coreAddress, btcPriceFeedAddress, daiAddress, btcAddress, setTokenFactory, auctionLibrary, auctionTimeToPivot, componentMultipliers, allocationBounds) { return __awaiter(_this, void 0, void 0, function () {
    var truffleBTCDaiRebalancingManagerContract, deployedBtcDaiManagerInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleBTCDaiRebalancingManagerContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.BTCDaiRebalancingManager);
                return [4 /*yield*/, truffleBTCDaiRebalancingManagerContract.new(coreAddress, btcPriceFeedAddress, daiAddress, btcAddress, setTokenFactory, auctionLibrary, auctionTimeToPivot, componentMultipliers, allocationBounds)];
            case 1:
                deployedBtcDaiManagerInstance = _a.sent();
                return [4 /*yield*/, set_protocol_strategies_1.BTCDaiRebalancingManagerContract.at(deployedBtcDaiManagerInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deployEthDaiManagerContractAsync = function (web3, coreAddress, ethPriceFeedAddress, daiAddress, ethAddress, setTokenFactory, auctionLibrary, auctionTimeToPivot, componentMultipliers, allocationBounds) { return __awaiter(_this, void 0, void 0, function () {
    var truffleETHDaiRebalancingManagerContract, deployedBtcDaiManagerInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleETHDaiRebalancingManagerContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.ETHDaiRebalancingManager);
                return [4 /*yield*/, truffleETHDaiRebalancingManagerContract.new(coreAddress, ethPriceFeedAddress, daiAddress, ethAddress, setTokenFactory, auctionLibrary, auctionTimeToPivot, componentMultipliers, allocationBounds)];
            case 1:
                deployedBtcDaiManagerInstance = _a.sent();
                return [4 /*yield*/, set_protocol_strategies_1.ETHDaiRebalancingManagerContract.at(deployedBtcDaiManagerInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deployMovingAverageStrategyManagerAsync = function (web3, coreAddress, movingAveragePriceFeed, stableAssetAddress, riskAssetAddress, initialStableCollateralAddress, initialRiskCollateralAddress, setTokenFactory, auctionLibrary, movingAverageDays, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime, from) {
    if (from === void 0) { from = constants_1.TX_DEFAULTS.from; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleMacoManagerContract, deployedMacoStrategyInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleMacoManagerContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.MACOStrategyManager);
                    return [4 /*yield*/, truffleMacoManagerContract.new(coreAddress, movingAveragePriceFeed, stableAssetAddress, riskAssetAddress, initialStableCollateralAddress, initialRiskCollateralAddress, setTokenFactory, auctionLibrary, movingAverageDays, auctionTimeToPivot, [crossoverConfirmationMinTime, crossoverConfirmationMaxTime])];
                case 1:
                    deployedMacoStrategyInstance = _a.sent();
                    return [4 /*yield*/, set_protocol_strategies_1.MACOStrategyManagerContract.at(deployedMacoStrategyInstance.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deployMovingAverageStrategyManagerV2Async = function (web3, coreAddress, movingAveragePriceFeed, riskAssetOracle, stableAssetAddress, riskAssetAddress, initialStableCollateralAddress, initialRiskCollateralAddress, setTokenFactory, auctionLibrary, movingAverageDays, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime, from) {
    if (from === void 0) { from = constants_1.TX_DEFAULTS.from; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleMacoManagerContract, deployedMacoStrategyInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleMacoManagerContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.MACOStrategyManagerV2);
                    return [4 /*yield*/, truffleMacoManagerContract.new(coreAddress, movingAveragePriceFeed, riskAssetOracle, stableAssetAddress, riskAssetAddress, [initialStableCollateralAddress, initialRiskCollateralAddress], setTokenFactory, auctionLibrary, movingAverageDays, auctionTimeToPivot, [crossoverConfirmationMinTime, crossoverConfirmationMaxTime])];
                case 1:
                    deployedMacoStrategyInstance = _a.sent();
                    return [4 /*yield*/, set_protocol_strategies_1.MACOStrategyManagerV2Contract.at(deployedMacoStrategyInstance.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deployAssetPairManagerAsync = function (web3, coreInstance, allocatorInstance, triggerInstance, auctionLibraryInstance, baseAssetAllocation, allocationPrecision, bullishBaseAssetAllocation, auctionTimeToPivot, auctionStartPercentage, auctionEndPercentage, signalConfirmationMinTime, signalConfirmationMaxTime) { return __awaiter(_this, void 0, void 0, function () {
    var truffleAssetPairManager, deployedAssetPairManagerInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleAssetPairManager = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.AssetPairManager);
                return [4 /*yield*/, truffleAssetPairManager.new(coreInstance, allocatorInstance, triggerInstance, auctionLibraryInstance, baseAssetAllocation, allocationPrecision, bullishBaseAssetAllocation, auctionTimeToPivot, [auctionStartPercentage, auctionEndPercentage], [signalConfirmationMinTime, signalConfirmationMaxTime])];
            case 1:
                deployedAssetPairManagerInstance = _a.sent();
                return [4 /*yield*/, set_protocol_strategies_1.AssetPairManagerContract.at(deployedAssetPairManagerInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deploySocialTradingManagerAsync = function (web3, core, factory, allocators, maxEntryFee, feeUpdateTimelock) {
    if (maxEntryFee === void 0) { maxEntryFee = util_1.ether(.1); }
    if (feeUpdateTimelock === void 0) { feeUpdateTimelock = constants_1.ONE_DAY_IN_SECONDS; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleSocialTradingManager, deployedSocialTradingManagerInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleSocialTradingManager = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.SocialTradingManager);
                    return [4 /*yield*/, truffleSocialTradingManager.new(core, factory, allocators, maxEntryFee, feeUpdateTimelock)];
                case 1:
                    deployedSocialTradingManagerInstance = _a.sent();
                    return [4 /*yield*/, set_protocol_strategies_1.SocialTradingManagerContract.at(deployedSocialTradingManagerInstance.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deploySocialTradingManagerV2Async = function (web3, core, factory, allocators, maxEntryFee, feeUpdateTimelock) {
    if (maxEntryFee === void 0) { maxEntryFee = util_1.ether(.1); }
    if (feeUpdateTimelock === void 0) { feeUpdateTimelock = constants_1.ONE_DAY_IN_SECONDS; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleSocialTradingManager, deployedSocialTradingManagerInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleSocialTradingManager = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.SocialTradingManagerV2);
                    return [4 /*yield*/, truffleSocialTradingManager.new(core, factory, allocators, maxEntryFee, feeUpdateTimelock)];
                case 1:
                    deployedSocialTradingManagerInstance = _a.sent();
                    return [4 /*yield*/, set_protocol_strategies_1.SocialTradingManagerV2Contract.at(deployedSocialTradingManagerInstance.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deploySocialTradingManagerMockAsync = function (web3, from) {
    if (from === void 0) { from = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleSocialManager, deployedSocialManager;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleSocialManager = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_contracts_1.SocialTradingManagerMock);
                    return [4 /*yield*/, truffleSocialManager.new()];
                case 1:
                    deployedSocialManager = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_1.SocialTradingManagerMockContract.at(deployedSocialManager.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deployBinaryAllocatorAsync = function (web3, baseAssetInstance, quoteAssetInstance, baseAssetOracleInstance, quoteAssetOracleInstance, baseAssetCollateralInstance, quoteAssetCollateralInstance, coreInstance, setTokenFactoryAddress) { return __awaiter(_this, void 0, void 0, function () {
    var truffleBinaryAllocator, deployedBinaryAllocator;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleBinaryAllocator = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.BinaryAllocator);
                return [4 /*yield*/, truffleBinaryAllocator.new(baseAssetInstance, quoteAssetInstance, baseAssetOracleInstance, quoteAssetOracleInstance, baseAssetCollateralInstance, quoteAssetCollateralInstance, coreInstance, setTokenFactoryAddress)];
            case 1:
                deployedBinaryAllocator = _a.sent();
                return [4 /*yield*/, set_protocol_strategies_1.BinaryAllocatorContract.at(deployedBinaryAllocator.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deploySocialAllocatorAsync = function (web3, baseAsset, quoteAsset, oracleWhiteList, core, setTokenFactoryAddress, pricePrecision, collateralName, collateralSymbol) { return __awaiter(_this, void 0, void 0, function () {
    var truffleSocialAllocator, deployedSocialAllocator;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleSocialAllocator = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.SocialAllocator);
                return [4 /*yield*/, truffleSocialAllocator.new(baseAsset, quoteAsset, oracleWhiteList, core, setTokenFactoryAddress, pricePrecision, collateralName, collateralSymbol)];
            case 1:
                deployedSocialAllocator = _a.sent();
                return [4 /*yield*/, set_protocol_strategies_1.SocialAllocatorContract.at(deployedSocialAllocator.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deployRSITrendingTriggerAsync = function (web3, rsiOracle, lowerBound, upperBound, rsiTimePeriod) { return __awaiter(_this, void 0, void 0, function () {
    var truffleRSITrendingTrigger, deployedRSITrendingTrigger;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleRSITrendingTrigger = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_strategies_1.RSITrendingTrigger);
                return [4 /*yield*/, truffleRSITrendingTrigger.new(rsiOracle, lowerBound, upperBound, rsiTimePeriod)];
            case 1:
                deployedRSITrendingTrigger = _a.sent();
                return [4 /*yield*/, set_protocol_strategies_1.RSITrendingTriggerContract.at(deployedRSITrendingTrigger.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.initializeManagerAsync = function (macoManager, rebalancingSetTokenAddress) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, macoManager.initialize.sendTransactionAsync(rebalancingSetTokenAddress)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=strategyHelpers.js.map