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
var set_protocol_utils_1 = require("set-protocol-utils");
var set_protocol_oracles_1 = require("set-protocol-oracles");
var constants_1 = require("@src/constants");
var util_1 = require("@src/util");
var coreHelpers_1 = require("./coreHelpers");
exports.deployMedianizerAsync = function (web3) { return __awaiter(_this, void 0, void 0, function () {
    var truffleMedianContract, deployedMedianInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleMedianContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.Median);
                return [4 /*yield*/, truffleMedianContract.new()];
            case 1:
                deployedMedianInstance = _a.sent();
                return [4 /*yield*/, set_protocol_oracles_1.MedianContract.at(deployedMedianInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.addPriceFeedOwnerToMedianizer = function (medianizer, priceFeedSigner) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, medianizer.lift.sendTransactionAsync(priceFeedSigner)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.updateMedianizerPriceAsync = function (web3, medianizer, price, timestamp, from) {
    if (from === void 0) { from = constants_1.TX_DEFAULTS.from; }
    return __awaiter(_this, void 0, void 0, function () {
        var setUtils, standardSignature, ecSignature;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setUtils = new set_protocol_utils_1.SetProtocolUtils(web3);
                    standardSignature = set_protocol_utils_1.SetProtocolUtils.hashPriceFeedHex(price, timestamp);
                    return [4 /*yield*/, setUtils.signMessage(standardSignature, from)];
                case 1:
                    ecSignature = _a.sent();
                    return [4 /*yield*/, medianizer.poke.sendTransactionAsync([price], [timestamp], [new util_1.BigNumber(ecSignature.v)], [ecSignature.r], [ecSignature.s])];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deployHistoricalPriceFeedAsync = function (web3, updateFrequency, medianizerAddress, dataDescription, seededValues, from) {
    if (dataDescription === void 0) { dataDescription = '200DailyETHPrice'; }
    if (seededValues === void 0) { seededValues = []; }
    if (from === void 0) { from = constants_1.TX_DEFAULTS.from; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleHistoricalPriceFeedContract, deployedMedianInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleHistoricalPriceFeedContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.HistoricalPriceFeed);
                    return [4 /*yield*/, truffleHistoricalPriceFeedContract.new(updateFrequency, medianizerAddress, dataDescription, seededValues)];
                case 1:
                    deployedMedianInstance = _a.sent();
                    return [4 /*yield*/, set_protocol_oracles_1.HistoricalPriceFeedContract.at(deployedMedianInstance.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deployLegacyMakerOracleAdapterAsync = function (web3, medianizerInstance) { return __awaiter(_this, void 0, void 0, function () {
    var truffleAdapterContract, deployedAdapterContractInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleAdapterContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.LegacyMakerOracleAdapter);
                return [4 /*yield*/, truffleAdapterContract.new(medianizerInstance)];
            case 1:
                deployedAdapterContractInstance = _a.sent();
                return [4 /*yield*/, set_protocol_oracles_1.LegacyMakerOracleAdapterContract.at(deployedAdapterContractInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deployOracleProxyAsync = function (web3, oracleInstance) { return __awaiter(_this, void 0, void 0, function () {
    var truffleOracleProxy, deployedOracleProxyInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleOracleProxy = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.OracleProxy);
                return [4 /*yield*/, truffleOracleProxy.new(oracleInstance)];
            case 1:
                deployedOracleProxyInstance = _a.sent();
                return [4 /*yield*/, set_protocol_oracles_1.OracleProxyContract.at(deployedOracleProxyInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deployConstantPriceOracleAsync = function (web3, price) { return __awaiter(_this, void 0, void 0, function () {
    var truffleConstantPriceOracle, deployedConstantPriceOracle;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleConstantPriceOracle = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.ConstantPriceOracle);
                return [4 /*yield*/, truffleConstantPriceOracle.new(price)];
            case 1:
                deployedConstantPriceOracle = _a.sent();
                return [4 /*yield*/, set_protocol_oracles_1.ConstantPriceOracleContract.at(deployedConstantPriceOracle.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deployUpdatableOracleMockAsync = function (web3, price) { return __awaiter(_this, void 0, void 0, function () {
    var truffleConstantPriceOracle, deployedConstantPriceOracle;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleConstantPriceOracle = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.UpdatableOracleMock);
                return [4 /*yield*/, truffleConstantPriceOracle.new(price)];
            case 1:
                deployedConstantPriceOracle = _a.sent();
                return [4 /*yield*/, set_protocol_oracles_1.UpdatableOracleMockContract.at(deployedConstantPriceOracle.address, web3, constants_1.TX_DEFAULTS)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deployTimeSeriesFeedAsync = function (web3, dataSourceAddress, seededValues, updateFrequency, maxDataPoints, dataDescription, from) {
    if (seededValues === void 0) { seededValues = [new util_1.BigNumber(200 * Math.pow(10, 18))]; }
    if (updateFrequency === void 0) { updateFrequency = constants_1.ONE_DAY_IN_SECONDS; }
    if (maxDataPoints === void 0) { maxDataPoints = new util_1.BigNumber(200); }
    if (dataDescription === void 0) { dataDescription = '200DailyETHPrice'; }
    if (from === void 0) { from = constants_1.TX_DEFAULTS.from; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleTimeSeriesFeedContract, deployedTimeSeriesFeedInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleTimeSeriesFeedContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.TimeSeriesFeed);
                    return [4 /*yield*/, truffleTimeSeriesFeedContract.new(updateFrequency, maxDataPoints, dataSourceAddress, dataDescription, seededValues)];
                case 1:
                    deployedTimeSeriesFeedInstance = _a.sent();
                    return [4 /*yield*/, set_protocol_oracles_1.TimeSeriesFeedContract.at(deployedTimeSeriesFeedInstance.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deployLinearizedPriceDataSourceAsync = function (web3, medianizerAddress, interpolationThreshold, dataDescription, from) {
    if (interpolationThreshold === void 0) { interpolationThreshold = constants_1.ONE_DAY_IN_SECONDS.div(8); }
    if (dataDescription === void 0) { dataDescription = '200DailyETHPrice'; }
    if (from === void 0) { from = constants_1.TX_DEFAULTS.from; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleLinearizedPriceDataSourceContract, deployedDataSourceInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleLinearizedPriceDataSourceContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.LinearizedPriceDataSource);
                    return [4 /*yield*/, truffleLinearizedPriceDataSourceContract.new(interpolationThreshold, medianizerAddress, dataDescription)];
                case 1:
                    deployedDataSourceInstance = _a.sent();
                    return [4 /*yield*/, set_protocol_oracles_1.LinearizedPriceDataSourceContract.at(deployedDataSourceInstance.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deployMovingAverageOracleAsync = function (web3, priceFeedAddress, dataDescription, from) {
    if (from === void 0) { from = constants_1.TX_DEFAULTS.from; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleMovingAveragesOracleContract, deployedMovingAverageOracleInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleMovingAveragesOracleContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.MovingAverageOracle);
                    return [4 /*yield*/, truffleMovingAveragesOracleContract.new(priceFeedAddress, dataDescription)];
                case 1:
                    deployedMovingAverageOracleInstance = _a.sent();
                    return [4 /*yield*/, set_protocol_oracles_1.MovingAverageOracleContract.at(deployedMovingAverageOracleInstance.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deployMovingAverageOracleV2Async = function (web3, priceFeedAddress, dataDescription, from) {
    if (from === void 0) { from = constants_1.TX_DEFAULTS.from; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleMovingAveragesOracleContract, deployedMovingAverageOracleV2Instance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleMovingAveragesOracleContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.MovingAverageOracleV2);
                    return [4 /*yield*/, truffleMovingAveragesOracleContract.new(priceFeedAddress, dataDescription)];
                case 1:
                    deployedMovingAverageOracleV2Instance = _a.sent();
                    return [4 /*yield*/, set_protocol_oracles_1.MovingAverageOracleV2Contract.at(deployedMovingAverageOracleV2Instance.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.deployRSIOracleAsync = function (web3, priceFeedAddress, dataDescription, from) {
    if (from === void 0) { from = constants_1.TX_DEFAULTS.from; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleRSIOracleContract, deployedRSIOracleInstance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleRSIOracleContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_oracles_1.RSIOracle);
                    return [4 /*yield*/, truffleRSIOracleContract.new(priceFeedAddress, dataDescription)];
                case 1:
                    deployedRSIOracleInstance = _a.sent();
                    return [4 /*yield*/, set_protocol_oracles_1.RSIOracleContract.at(deployedRSIOracleInstance.address, web3, constants_1.TX_DEFAULTS)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.approveContractToOracleProxy = function (oracleProxy, authorizedAddress) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, oracleProxy.addAuthorizedAddress.sendTransactionAsync(authorizedAddress)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=oracleHelpers.js.map