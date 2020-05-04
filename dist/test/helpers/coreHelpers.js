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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __importStar(require("lodash"));
var set_protocol_utils_1 = require("set-protocol-utils");
var set_protocol_contracts_1 = require("set-protocol-contracts");
var set_protocol_contracts_2 = require("set-protocol-contracts");
var constants_1 = require("@src/constants");
var util_1 = require("@src/util");
var contract = require('truffle-contract');
exports.deployTransferProxyContract = function (web3) { return __awaiter(_this, void 0, void 0, function () {
    var truffleTransferProxyContract, truffleERC20WrapperContract, deployedERC20Wrapper, deployedTransferProxyInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleTransferProxyContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.TransferProxy);
                truffleERC20WrapperContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.ERC20Wrapper);
                return [4 /*yield*/, truffleERC20WrapperContract.new()];
            case 1:
                deployedERC20Wrapper = _a.sent();
                return [4 /*yield*/, truffleTransferProxyContract.link('ERC20Wrapper', deployedERC20Wrapper.address)];
            case 2:
                _a.sent();
                return [4 /*yield*/, truffleTransferProxyContract.new()];
            case 3:
                deployedTransferProxyInstance = _a.sent();
                return [4 /*yield*/, set_protocol_contracts_2.TransferProxyContract.at(deployedTransferProxyInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 4: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deployVaultContract = function (web3) { return __awaiter(_this, void 0, void 0, function () {
    var truffleVaultContract, truffleErc20WrapperContract, deployedERC20Wrapper, deployedVaultInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleVaultContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.Vault);
                truffleErc20WrapperContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.ERC20Wrapper);
                return [4 /*yield*/, truffleErc20WrapperContract.new()];
            case 1:
                deployedERC20Wrapper = _a.sent();
                return [4 /*yield*/, truffleVaultContract.link('ERC20Wrapper', deployedERC20Wrapper.address)];
            case 2:
                _a.sent();
                return [4 /*yield*/, truffleVaultContract.new()];
            case 3:
                deployedVaultInstance = _a.sent();
                return [4 /*yield*/, set_protocol_contracts_2.VaultContract.at(deployedVaultInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 4: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deployCoreContract = function (web3, transferProxyAddress, vaultAddress) { return __awaiter(_this, void 0, void 0, function () {
    var truffleCoreContract, truffleCoreIssuanceLibraryContract, deployedCoreIssuanceLibraryContract, truffleCommonValidationsLibraryContract, deployedCommonValidationsLibraryContract, truffleSetTokenLibraryContract, deployedSetTokenLibraryContract, deployedCoreInstance;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleCoreContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.Core);
                truffleCoreIssuanceLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.CoreIssuanceLibrary);
                return [4 /*yield*/, truffleCoreIssuanceLibraryContract.new()];
            case 1:
                deployedCoreIssuanceLibraryContract = _a.sent();
                return [4 /*yield*/, truffleCoreContract.link('CoreIssuanceLibrary', deployedCoreIssuanceLibraryContract.address)];
            case 2:
                _a.sent();
                truffleCommonValidationsLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.CommonValidationsLibrary);
                return [4 /*yield*/, truffleCommonValidationsLibraryContract.new()];
            case 3:
                deployedCommonValidationsLibraryContract = _a.sent();
                return [4 /*yield*/, truffleCoreContract.link('CommonValidationsLibrary', deployedCommonValidationsLibraryContract.address)];
            case 4:
                _a.sent();
                truffleSetTokenLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.SetTokenLibrary);
                return [4 /*yield*/, truffleSetTokenLibraryContract.new()];
            case 5:
                deployedSetTokenLibraryContract = _a.sent();
                return [4 /*yield*/, truffleCoreContract.link('SetTokenLibrary', deployedSetTokenLibraryContract.address)];
            case 6:
                _a.sent();
                return [4 /*yield*/, truffleCoreContract.new(transferProxyAddress, vaultAddress)];
            case 7:
                deployedCoreInstance = _a.sent();
                return [4 /*yield*/, set_protocol_contracts_2.CoreContract.at(deployedCoreInstance.address, web3, constants_1.TX_DEFAULTS)];
            case 8: 
            // Initialize typed contract class
            return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.deploySetTokenFactoryContract = function (web3, core) { return __awaiter(_this, void 0, void 0, function () {
    var truffleSetTokenFactoryContract, truffleCommonValidationsLibraryContract, deployedCommonValidationsLibraryContract, truffleBytes32LibraryContract, deployedBytes32LibraryContract, deployedSetTokenFactory, setTokenFactoryContract;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleSetTokenFactoryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.SetTokenFactory);
                truffleCommonValidationsLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.CommonValidationsLibrary);
                return [4 /*yield*/, truffleCommonValidationsLibraryContract.new()];
            case 1:
                deployedCommonValidationsLibraryContract = _a.sent();
                return [4 /*yield*/, truffleSetTokenFactoryContract.link('CommonValidationsLibrary', deployedCommonValidationsLibraryContract.address)];
            case 2:
                _a.sent();
                truffleBytes32LibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.Bytes32Library);
                return [4 /*yield*/, truffleBytes32LibraryContract.new()];
            case 3:
                deployedBytes32LibraryContract = _a.sent();
                return [4 /*yield*/, truffleSetTokenFactoryContract.link('Bytes32Library', deployedBytes32LibraryContract.address)];
            case 4:
                _a.sent();
                return [4 /*yield*/, truffleSetTokenFactoryContract.new(core.address)];
            case 5:
                deployedSetTokenFactory = _a.sent();
                return [4 /*yield*/, set_protocol_contracts_2.SetTokenFactoryContract.at(deployedSetTokenFactory.address, web3, constants_1.TX_DEFAULTS)];
            case 6:
                setTokenFactoryContract = _a.sent();
                // Enable factory for provided core
                return [4 /*yield*/, core.addFactory.sendTransactionAsync(setTokenFactoryContract.address, constants_1.TX_DEFAULTS)];
            case 7:
                // Enable factory for provided core
                _a.sent();
                return [2 /*return*/, setTokenFactoryContract];
        }
    });
}); };
exports.deployRebalancingSetTokenFactoryContract = function (web3, core, whitelist, minimumRebalanceInterval, minimumProposalPeriod, minimumTimeToPivot, maximumTimeToPivot, minimumNaturalUnit, maximumNaturalUnit) {
    if (minimumRebalanceInterval === void 0) { minimumRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS; }
    if (minimumProposalPeriod === void 0) { minimumProposalPeriod = constants_1.ONE_DAY_IN_SECONDS; }
    if (minimumTimeToPivot === void 0) { minimumTimeToPivot = constants_1.ONE_DAY_IN_SECONDS.div(4); }
    if (maximumTimeToPivot === void 0) { maximumTimeToPivot = constants_1.ONE_DAY_IN_SECONDS.mul(3); }
    if (minimumNaturalUnit === void 0) { minimumNaturalUnit = constants_1.DEFAULT_REBALANCING_MINIMUM_NATURAL_UNIT; }
    if (maximumNaturalUnit === void 0) { maximumNaturalUnit = constants_1.DEFAULT_REBALANCING_MAXIMUM_NATURAL_UNIT; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleRebalancingSetTokenFactoryContract, truffleBytes32LibraryContract, deployedBytes32LibraryContract, deployedRebalancingSetTokenFactory, rebalancingSetTokenFactoryContract;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleRebalancingSetTokenFactoryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.RebalancingSetTokenFactory);
                    return [4 /*yield*/, linkRebalancingLibrariesAsync(truffleRebalancingSetTokenFactoryContract, web3)];
                case 1:
                    _a.sent();
                    truffleBytes32LibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.Bytes32Library);
                    return [4 /*yield*/, truffleBytes32LibraryContract.new()];
                case 2:
                    deployedBytes32LibraryContract = _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetTokenFactoryContract.link('Bytes32Library', deployedBytes32LibraryContract.address)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetTokenFactoryContract.new(core.address, whitelist.address, minimumRebalanceInterval, minimumProposalPeriod, minimumTimeToPivot, maximumTimeToPivot, minimumNaturalUnit, maximumNaturalUnit)];
                case 4:
                    deployedRebalancingSetTokenFactory = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetTokenFactoryContract.at(deployedRebalancingSetTokenFactory.address, web3, constants_1.TX_DEFAULTS)];
                case 5:
                    rebalancingSetTokenFactoryContract = _a.sent();
                    // Enable factory for provided core
                    return [4 /*yield*/, core.addFactory.sendTransactionAsync(rebalancingSetTokenFactoryContract.address, constants_1.TX_DEFAULTS)];
                case 6:
                    // Enable factory for provided core
                    _a.sent();
                    return [2 /*return*/, rebalancingSetTokenFactoryContract];
            }
        });
    });
};
exports.deployRebalancingSetTokenV2FactoryContractAsync = function (web3, core, componentWhitelist, liquidatorWhitelist, feeCalculatorWhitelist, minimumRebalanceInterval, minimumFailRebalancePeriod, maximumFailRebalancePeriod, minimumNaturalUnit, maximumNaturalUnit) {
    if (minimumRebalanceInterval === void 0) { minimumRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS; }
    if (minimumFailRebalancePeriod === void 0) { minimumFailRebalancePeriod = constants_1.ONE_DAY_IN_SECONDS.div(2); }
    if (maximumFailRebalancePeriod === void 0) { maximumFailRebalancePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(4); }
    if (minimumNaturalUnit === void 0) { minimumNaturalUnit = constants_1.DEFAULT_REBALANCING_MINIMUM_NATURAL_UNIT; }
    if (maximumNaturalUnit === void 0) { maximumNaturalUnit = constants_1.DEFAULT_REBALANCING_MAXIMUM_NATURAL_UNIT; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleRebalancingSetTokenV2FactoryContract, truffleBytes32LibraryContract, deployedBytes32LibraryContract, deployedRebalancingSetTokenV2Factory, rebalancingSetTokenV2FactoryContract;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleRebalancingSetTokenV2FactoryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.RebalancingSetTokenV2Factory);
                    truffleBytes32LibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.Bytes32Library);
                    return [4 /*yield*/, truffleBytes32LibraryContract.new()];
                case 1:
                    deployedBytes32LibraryContract = _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetTokenV2FactoryContract.link('Bytes32Library', deployedBytes32LibraryContract.address)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetTokenV2FactoryContract.new(core.address, componentWhitelist.address, liquidatorWhitelist.address, feeCalculatorWhitelist.address, minimumRebalanceInterval, minimumFailRebalancePeriod, maximumFailRebalancePeriod, minimumNaturalUnit, maximumNaturalUnit)];
                case 3:
                    deployedRebalancingSetTokenV2Factory = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetTokenV2FactoryContract.at(deployedRebalancingSetTokenV2Factory.address, web3, constants_1.TX_DEFAULTS)];
                case 4:
                    rebalancingSetTokenV2FactoryContract = _a.sent();
                    // Enable factory for provided core
                    return [4 /*yield*/, core.addFactory.sendTransactionAsync(rebalancingSetTokenV2FactoryContract.address, constants_1.TX_DEFAULTS)];
                case 5:
                    // Enable factory for provided core
                    _a.sent();
                    return [2 /*return*/, rebalancingSetTokenV2FactoryContract];
            }
        });
    });
};
exports.deployRebalancingSetTokenV3FactoryContractAsync = function (web3, core, componentWhitelist, liquidatorWhitelist, feeCalculatorWhitelist, minimumRebalanceInterval, minimumFailRebalancePeriod, maximumFailRebalancePeriod, minimumNaturalUnit, maximumNaturalUnit) {
    if (minimumRebalanceInterval === void 0) { minimumRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS; }
    if (minimumFailRebalancePeriod === void 0) { minimumFailRebalancePeriod = constants_1.ONE_DAY_IN_SECONDS.div(2); }
    if (maximumFailRebalancePeriod === void 0) { maximumFailRebalancePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(4); }
    if (minimumNaturalUnit === void 0) { minimumNaturalUnit = constants_1.DEFAULT_REBALANCING_MINIMUM_NATURAL_UNIT; }
    if (maximumNaturalUnit === void 0) { maximumNaturalUnit = constants_1.DEFAULT_REBALANCING_MAXIMUM_NATURAL_UNIT; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleRebalancingSetTokenV3FactoryContract, truffleBytes32LibraryContract, deployedBytes32LibraryContract, truffleFactoryUtilsLibraryContract, deployedFactoryUtilsLibraryContract, deployedRebalancingSetTokenV3Factory, rebalancingSetTokenV2FactoryContract;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleRebalancingSetTokenV3FactoryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.RebalancingSetTokenV3Factory);
                    truffleBytes32LibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.Bytes32Library);
                    return [4 /*yield*/, truffleBytes32LibraryContract.new()];
                case 1:
                    deployedBytes32LibraryContract = _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetTokenV3FactoryContract.link('Bytes32Library', deployedBytes32LibraryContract.address)];
                case 2:
                    _a.sent();
                    truffleFactoryUtilsLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.FactoryUtilsLibrary);
                    return [4 /*yield*/, truffleFactoryUtilsLibraryContract.new()];
                case 3:
                    deployedFactoryUtilsLibraryContract = _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetTokenV3FactoryContract.link('FactoryUtilsLibrary', deployedFactoryUtilsLibraryContract.address)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetTokenV3FactoryContract.new(core.address, componentWhitelist.address, liquidatorWhitelist.address, feeCalculatorWhitelist.address, minimumRebalanceInterval, minimumFailRebalancePeriod, maximumFailRebalancePeriod, minimumNaturalUnit, maximumNaturalUnit)];
                case 5:
                    deployedRebalancingSetTokenV3Factory = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetTokenV3FactoryContract.at(deployedRebalancingSetTokenV3Factory.address, web3, constants_1.TX_DEFAULTS)];
                case 6:
                    rebalancingSetTokenV2FactoryContract = _a.sent();
                    // Enable factory for provided core
                    return [4 /*yield*/, core.addFactory.sendTransactionAsync(rebalancingSetTokenV2FactoryContract.address, constants_1.TX_DEFAULTS)];
                case 7:
                    // Enable factory for provided core
                    _a.sent();
                    return [2 /*return*/, rebalancingSetTokenV2FactoryContract];
            }
        });
    });
};
exports.deployLinearAuctionLiquidatorContractAsync = function (web3, core, oracleWhiteList, auctionPeriod, rangeStart, rangeEnd, name) {
    if (auctionPeriod === void 0) { auctionPeriod = constants_1.ONE_HOUR_IN_SECONDS.mul(2); }
    if (rangeStart === void 0) { rangeStart = new util_1.BigNumber(3); }
    if (rangeEnd === void 0) { rangeEnd = new util_1.BigNumber(21); }
    if (name === void 0) { name = 'Liquidator'; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleLinearAuctionLiquidatorContract, deployedLinearAuctionLiquidator, linearAuctionLiquidatorContract;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleLinearAuctionLiquidatorContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.LinearAuctionLiquidator);
                    return [4 /*yield*/, truffleLinearAuctionLiquidatorContract.new(core.address, oracleWhiteList.address, auctionPeriod, rangeStart, rangeEnd, name)];
                case 1:
                    deployedLinearAuctionLiquidator = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_2.LinearAuctionLiquidatorContract.at(deployedLinearAuctionLiquidator.address, web3, constants_1.TX_DEFAULTS)];
                case 2:
                    linearAuctionLiquidatorContract = _a.sent();
                    return [2 /*return*/, linearAuctionLiquidatorContract];
            }
        });
    });
};
exports.deployFixedFeeCalculatorAsync = function (web3) { return __awaiter(_this, void 0, void 0, function () {
    var truffleFeeCalculator, deployedFeeCalculator, feeCalculatorContract;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleFeeCalculator = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.FixedFeeCalculator);
                return [4 /*yield*/, truffleFeeCalculator.new()];
            case 1:
                deployedFeeCalculator = _a.sent();
                return [4 /*yield*/, set_protocol_contracts_2.FixedFeeCalculatorContract.at(deployedFeeCalculator.address, web3, constants_1.TX_DEFAULTS)];
            case 2:
                feeCalculatorContract = _a.sent();
                return [2 /*return*/, feeCalculatorContract];
        }
    });
}); };
var linkRebalancingLibrariesAsync = function (contractToLink, web3) { return __awaiter(_this, void 0, void 0, function () {
    var truffleProposeLibraryContract, truffleProposeLibrary, truffleStartRebalanceLibraryContract, truffleStartRebalanceLibrary, trufflePlaceBidLibraryContract, trufflePlaceBidLibrary, truffleSettleRebalanceLibraryContract, truffleSettleRebalanceLibrary, truffleFailAuctionLibraryContract, truffleFailAuctionLibrary;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleProposeLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.ProposeLibrary);
                return [4 /*yield*/, truffleProposeLibraryContract.new()];
            case 1:
                truffleProposeLibrary = _a.sent();
                truffleStartRebalanceLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.StartRebalanceLibrary);
                return [4 /*yield*/, truffleStartRebalanceLibraryContract.new()];
            case 2:
                truffleStartRebalanceLibrary = _a.sent();
                trufflePlaceBidLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.PlaceBidLibrary);
                return [4 /*yield*/, trufflePlaceBidLibraryContract.new()];
            case 3:
                trufflePlaceBidLibrary = _a.sent();
                truffleSettleRebalanceLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.SettleRebalanceLibrary);
                return [4 /*yield*/, truffleSettleRebalanceLibraryContract.new()];
            case 4:
                truffleSettleRebalanceLibrary = _a.sent();
                truffleFailAuctionLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.FailAuctionLibrary);
                return [4 /*yield*/, truffleFailAuctionLibraryContract.new()];
            case 5:
                truffleFailAuctionLibrary = _a.sent();
                return [4 /*yield*/, contractToLink.link('ProposeLibrary', truffleProposeLibrary.address)];
            case 6:
                _a.sent();
                return [4 /*yield*/, contractToLink.link('StartRebalanceLibrary', truffleStartRebalanceLibrary.address)];
            case 7:
                _a.sent();
                return [4 /*yield*/, contractToLink.link('PlaceBidLibrary', trufflePlaceBidLibrary.address)];
            case 8:
                _a.sent();
                return [4 /*yield*/, contractToLink.link('SettleRebalanceLibrary', truffleSettleRebalanceLibrary.address)];
            case 9:
                _a.sent();
                return [4 /*yield*/, contractToLink.link('FailAuctionLibrary', truffleFailAuctionLibrary.address)];
            case 10:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deployRebalanceAuctionModuleContract = function (web3, core, vault) { return __awaiter(_this, void 0, void 0, function () {
    var truffleRebalanceAuctionModuleContract, deployedRebalanceAuctionModule, rebalanceAuctionModuleContract;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleRebalanceAuctionModuleContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.RebalanceAuctionModule);
                return [4 /*yield*/, truffleRebalanceAuctionModuleContract.new(core.address, vault.address, constants_1.TX_DEFAULTS)];
            case 1:
                deployedRebalanceAuctionModule = _a.sent();
                return [4 /*yield*/, set_protocol_contracts_2.RebalanceAuctionModuleContract.at(deployedRebalanceAuctionModule.address, web3, constants_1.TX_DEFAULTS)];
            case 2:
                rebalanceAuctionModuleContract = _a.sent();
                return [4 /*yield*/, core.addModule.sendTransactionAsync(deployedRebalanceAuctionModule.address, constants_1.TX_DEFAULTS)];
            case 3:
                _a.sent();
                return [4 /*yield*/, vault.addAuthorizedAddress.sendTransactionAsync(deployedRebalanceAuctionModule.address, constants_1.TX_DEFAULTS)];
            case 4:
                _a.sent();
                return [2 /*return*/, rebalanceAuctionModuleContract];
        }
    });
}); };
exports.deployBaseContracts = function (web3) { return __awaiter(_this, void 0, void 0, function () {
    var _a, transferProxy, vault, core, whitelist, _b, setTokenFactory, rebalancingSetTokenFactory, rebalanceAuctionModule;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    exports.deployTransferProxyContract(web3),
                    exports.deployVaultContract(web3),
                ])];
            case 1:
                _a = _c.sent(), transferProxy = _a[0], vault = _a[1];
                return [4 /*yield*/, exports.deployCoreContract(web3, transferProxy.address, vault.address)];
            case 2:
                core = _c.sent();
                return [4 /*yield*/, exports.deployWhiteListContract(web3, [])];
            case 3:
                whitelist = _c.sent();
                return [4 /*yield*/, Promise.all([
                        exports.deploySetTokenFactoryContract(web3, core),
                        exports.deployRebalancingSetTokenFactoryContract(web3, core, whitelist),
                        exports.addAuthorizationAsync(vault, core.address),
                        exports.addAuthorizationAsync(transferProxy, core.address),
                    ])];
            case 4:
                _b = _c.sent(), setTokenFactory = _b[0], rebalancingSetTokenFactory = _b[1];
                return [4 /*yield*/, exports.deployRebalanceAuctionModuleContract(web3, core, vault)];
            case 5:
                rebalanceAuctionModule = _c.sent();
                return [2 /*return*/, [
                        core,
                        transferProxy,
                        vault,
                        setTokenFactory,
                        rebalancingSetTokenFactory,
                        rebalanceAuctionModule,
                        whitelist,
                    ]];
        }
    });
}); };
exports.deployWhiteListContract = function (web3, initialAddresses) { return __awaiter(_this, void 0, void 0, function () {
    var truffleWhitelistContract, deployedWhitelistContract, whitelistContract;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleWhitelistContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.WhiteList);
                return [4 /*yield*/, truffleWhitelistContract.new(initialAddresses)];
            case 1:
                deployedWhitelistContract = _a.sent();
                return [4 /*yield*/, set_protocol_contracts_2.WhiteListContract.at(deployedWhitelistContract.address, web3, constants_1.TX_DEFAULTS)];
            case 2:
                whitelistContract = _a.sent();
                return [2 /*return*/, whitelistContract];
        }
    });
}); };
exports.deployOracleWhiteListAsync = function (web3, tokenAddresses, oracleAddresses) { return __awaiter(_this, void 0, void 0, function () {
    var truffleOracleWhiteListContract, deployedOracleWhiteListContract, whiteListContract;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                truffleOracleWhiteListContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.OracleWhiteList);
                return [4 /*yield*/, truffleOracleWhiteListContract.new(tokenAddresses, oracleAddresses)];
            case 1:
                deployedOracleWhiteListContract = _a.sent();
                return [4 /*yield*/, set_protocol_contracts_2.OracleWhiteListContract.at(deployedOracleWhiteListContract.address, web3, constants_1.TX_DEFAULTS)];
            case 2:
                whiteListContract = _a.sent();
                return [2 /*return*/, whiteListContract];
        }
    });
}); };
exports.deployExchangeIssuanceModuleAsync = function (web3, core, vault, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleExchangeIssuanceModuleContract, truffleSetTokenLibraryContract, deployedSetTokenLibraryContract, deployedExchangeIssuanceModuleContract, exchangeIssuanceModule;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleExchangeIssuanceModuleContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.ExchangeIssuanceModule);
                    truffleSetTokenLibraryContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.SetTokenLibrary);
                    return [4 /*yield*/, truffleSetTokenLibraryContract.new()];
                case 1:
                    deployedSetTokenLibraryContract = _a.sent();
                    return [4 /*yield*/, truffleExchangeIssuanceModuleContract.link('SetTokenLibrary', deployedSetTokenLibraryContract.address)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, truffleExchangeIssuanceModuleContract.new(core.address, vault.address)];
                case 3:
                    deployedExchangeIssuanceModuleContract = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_2.ExchangeIssuanceModuleContract.at(deployedExchangeIssuanceModuleContract.address, web3, constants_1.TX_DEFAULTS)];
                case 4:
                    exchangeIssuanceModule = _a.sent();
                    return [2 /*return*/, exchangeIssuanceModule];
            }
        });
    });
};
exports.deployRebalancingSetExchangeIssuanceModuleAsync = function (web3, core, transferProxy, exchangeIssuanceModule, wrappedEther, vault, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleRebalancingSetExchangeIssuanceModuleContract, truffleERC20WrapperContract, deployedERC20Wrapper, deployedRebalancingSetExchangeIssuanceModuleContract, rebalancingSetExchangeIssuanceModule;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleRebalancingSetExchangeIssuanceModuleContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.RebalancingSetExchangeIssuanceModule);
                    truffleERC20WrapperContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.ERC20Wrapper);
                    return [4 /*yield*/, truffleERC20WrapperContract.new()];
                case 1:
                    deployedERC20Wrapper = _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetExchangeIssuanceModuleContract.link('ERC20Wrapper', deployedERC20Wrapper.address)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetExchangeIssuanceModuleContract.new(core.address, transferProxy.address, exchangeIssuanceModule.address, wrappedEther.address, vault.address)];
                case 3:
                    deployedRebalancingSetExchangeIssuanceModuleContract = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetExchangeIssuanceModuleContract.at(deployedRebalancingSetExchangeIssuanceModuleContract.address, web3, constants_1.TX_DEFAULTS)];
                case 4:
                    rebalancingSetExchangeIssuanceModule = _a.sent();
                    return [2 /*return*/, rebalancingSetExchangeIssuanceModule];
            }
        });
    });
};
exports.deployRebalancingSetIssuanceModuleAsync = function (web3, core, vault, transferProxy, wrappedEther, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleRebalancingSetIssuanceModuleContract, truffleERC20WrapperContract, deployedERC20Wrapper, deployedRebalancingSetIssuanceModuleContract, rebalancingSetIssuanceModule;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleRebalancingSetIssuanceModuleContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.RebalancingSetIssuanceModule);
                    truffleERC20WrapperContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.ERC20Wrapper);
                    return [4 /*yield*/, truffleERC20WrapperContract.new()];
                case 1:
                    deployedERC20Wrapper = _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetIssuanceModuleContract.link('ERC20Wrapper', deployedERC20Wrapper.address)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetIssuanceModuleContract.new(core.address, vault.address, transferProxy.address, wrappedEther.address)];
                case 3:
                    deployedRebalancingSetIssuanceModuleContract = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetIssuanceModuleContract.at(deployedRebalancingSetIssuanceModuleContract.address, web3, constants_1.TX_DEFAULTS)];
                case 4:
                    rebalancingSetIssuanceModule = _a.sent();
                    return [2 /*return*/, rebalancingSetIssuanceModule];
            }
        });
    });
};
exports.deployWethMockAsync = function (web3, initialAccount, initialBalance, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleWethMockContract, deployedWethMockContract, wethMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleWethMockContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.WethMock);
                    return [4 /*yield*/, truffleWethMockContract.new(initialAccount, initialBalance)];
                case 1:
                    deployedWethMockContract = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_2.WethMockContract.at(deployedWethMockContract.address, web3, constants_1.TX_DEFAULTS)];
                case 2:
                    wethMock = _a.sent();
                    return [2 /*return*/, wethMock];
            }
        });
    });
};
exports.deployTokenAsync = function (web3, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var tokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.deployTokensAsync(1, web3, owner)];
                case 1:
                    tokens = _a.sent();
                    return [2 /*return*/, tokens[0]];
            }
        });
    });
};
exports.deployTokensAsync = function (tokenCount, web3, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var decimals;
        return __generator(this, function (_a) {
            decimals = [];
            _.times(tokenCount, function () { return decimals.push(_.random(4, 18)); });
            return [2 /*return*/, exports.deployTokensSpecifyingDecimals(tokenCount, decimals, web3, owner)];
        });
    });
};
exports.deployTokenSpecifyingDecimalAsync = function (decimalCount, web3, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var tokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.deployTokensSpecifyingDecimals(1, [decimalCount], web3, owner)];
                case 1:
                    tokens = _a.sent();
                    return [2 /*return*/, tokens[0]];
            }
        });
    });
};
exports.deployTokensSpecifyingDecimals = function (tokenCount, decimalsList, web3, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var standardTokenMockContract, mockTokens, mockTokenPromises;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (tokenCount != decimalsList.length) {
                        throw new Error('Amount of tokens must match passed decimal list length');
                    }
                    standardTokenMockContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.StandardTokenMock);
                    mockTokens = [];
                    mockTokenPromises = _.times(tokenCount, function (index) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, standardTokenMockContract.new(owner, constants_1.DEPLOYED_TOKEN_QUANTITY, "Component " + index, index.toString(), decimalsList[index], constants_1.TX_DEFAULTS)];
                                case 1: return [2 /*return*/, (_a.sent())];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(mockTokenPromises).then(function (tokenMock) {
                            _.each(tokenMock, function (standardToken) {
                                mockTokens.push(new set_protocol_contracts_2.StandardTokenMockContract(new web3.eth.Contract(standardToken.abi, standardToken.address), constants_1.TX_DEFAULTS));
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, mockTokens];
            }
        });
    });
};
exports.deployNoDecimalTokenAsync = function (web3, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var noDecimalTokenMockContract, mockToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    noDecimalTokenMockContract = exports.setDefaultTruffleContract(web3, set_protocol_contracts_1.NoDecimalTokenMock);
                    return [4 /*yield*/, noDecimalTokenMockContract.new(owner, constants_1.DEPLOYED_TOKEN_QUANTITY, 'Test', 'TST')];
                case 1:
                    mockToken = _a.sent();
                    return [2 /*return*/, mockToken];
            }
        });
    });
};
exports.deploySetTokenAsync = function (web3, core, setTokenFactoryAddress, componentAddresses, componentUnits, naturalUnit, name, symbol) {
    if (name === void 0) { name = 'Set Token'; }
    if (symbol === void 0) { symbol = 'SET'; }
    return __awaiter(_this, void 0, void 0, function () {
        var encodedName, encodedSymbol, createSetTokenTransactionHash, logs, deployedSetTokenAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encodedName = set_protocol_utils_1.SetProtocolUtils.stringToBytes(name);
                    encodedSymbol = set_protocol_utils_1.SetProtocolUtils.stringToBytes(symbol);
                    return [4 /*yield*/, core.createSet.sendTransactionAsync(setTokenFactoryAddress, componentAddresses, componentUnits, naturalUnit, encodedName, encodedSymbol, '0x0', constants_1.TX_DEFAULTS)];
                case 1:
                    createSetTokenTransactionHash = _a.sent();
                    return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, createSetTokenTransactionHash)];
                case 2:
                    logs = _a.sent();
                    deployedSetTokenAddress = util_1.extractNewSetTokenAddressFromLogs(logs);
                    return [4 /*yield*/, set_protocol_contracts_2.SetTokenContract.at(deployedSetTokenAddress, web3, constants_1.TX_DEFAULTS)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.tokenDeployedOnSnapshot = function (web3, tokenAddress) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, set_protocol_contracts_2.StandardTokenMockContract.at(tokenAddress, web3, constants_1.TX_DEFAULTS)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.registerExchange = function (web3, coreAddress, exchangeId, exchangeAddress) { return __awaiter(_this, void 0, void 0, function () {
    var coreWrapper;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, set_protocol_contracts_2.CoreContract.at(coreAddress, web3, constants_1.TX_DEFAULTS)];
            case 1:
                coreWrapper = _a.sent();
                return [4 /*yield*/, coreWrapper.addExchange.sendTransactionAsync(exchangeId, exchangeAddress, constants_1.TX_DEFAULTS)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.approveForTransferAsync = function (tokens, spender, from) {
    if (from === void 0) { from = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var approvePromises;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    approvePromises = _.map(tokens, function (token) {
                        return token.approve.sendTransactionAsync(spender, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: from });
                    });
                    return [4 /*yield*/, Promise.all(approvePromises)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.transferTokenAsync = function (token, spender, quantity, from) {
    if (from === void 0) { from = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, token.transfer.sendTransactionAsync(spender, quantity, { from: from })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.addAuthorizationAsync = function (contract, toAuthorize) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.addAuthorizedAddress.sendTransactionAsync(toAuthorize, constants_1.TX_DEFAULTS)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.addModuleAsync = function (core, moduleAddress) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, core.addModule.sendTransactionAsync(moduleAddress, constants_1.TX_DEFAULTS)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.addPriceLibraryAsync = function (core, priceLibrary) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, core.addPriceLibrary.sendTransactionAsync(priceLibrary, constants_1.TX_DEFAULTS)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.addWhiteListedTokenAsync = function (whitelist, toAdd) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, whitelist.addAddress.sendTransactionAsync(toAdd, constants_1.TX_DEFAULTS)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.getTokenBalances = function (tokens, owner) { return __awaiter(_this, void 0, void 0, function () {
    var balancePromises, ownerBalances;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                balancePromises = _.map(tokens, function (token) {
                    return token.balanceOf.callAsync(owner);
                });
                ownerBalances = new Array(tokens.length).fill(set_protocol_utils_1.SetProtocolUtils.CONSTANTS.ZERO);
                return [4 /*yield*/, Promise.all(balancePromises).then(function (fetchedTokenBalances) {
                        ownerBalances = fetchedTokenBalances;
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/, ownerBalances];
        }
    });
}); };
exports.getTokenInstances = function (web3, tokenAddresses) { return __awaiter(_this, void 0, void 0, function () {
    var tokenInstances;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all(tokenAddresses.map(function (tokenAddress) {
                    return set_protocol_contracts_2.StandardTokenMockContract.at(tokenAddress, web3, constants_1.TX_DEFAULTS);
                }))];
            case 1:
                tokenInstances = _a.sent();
                return [2 /*return*/, tokenInstances];
        }
    });
}); };
exports.getTokenSupplies = function (tokens) { return __awaiter(_this, void 0, void 0, function () {
    var supplyPromises, supplies;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                supplyPromises = _.map(tokens, function (token) {
                    return token.totalSupply.callAsync();
                });
                supplies = new Array(tokens.length).fill(set_protocol_utils_1.SetProtocolUtils.CONSTANTS.ZERO);
                return [4 /*yield*/, Promise.all(supplyPromises).then(function (fetchedSupplyBalances) {
                        supplies = fetchedSupplyBalances;
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/, supplies];
        }
    });
}); };
exports.setDefaultTruffleContract = function (web3, contractInstance) {
    var truffleContract = contract(contractInstance);
    truffleContract.setProvider(web3.currentProvider);
    truffleContract.setNetwork(50);
    truffleContract.defaults(constants_1.TX_DEFAULTS);
    return truffleContract;
};
//# sourceMappingURL=coreHelpers.js.map