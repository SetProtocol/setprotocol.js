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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock('set-protocol-contracts');
jest.setTimeout(30000);
var ABIDecoder = __importStar(require("abi-decoder"));
var chai = __importStar(require("chai"));
var setProtocolUtils = __importStar(require("set-protocol-utils"));
var web3_1 = __importDefault(require("web3"));
var set_protocol_contracts_1 = require("set-protocol-contracts");
var accounts_1 = require("@src/constants/accounts");
var wrappers_1 = require("@src/wrappers");
var constants_1 = require("@src/constants");
var helpers_1 = require("@test/helpers");
var util_1 = require("@src/util");
var chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(util_1.BigNumber));
var expect = chai.expect;
var contract = require('truffle-contract');
var web3 = new web3_1.default('http://localhost:8545');
var SetUtils = setProtocolUtils.SetProtocolUtils, Web3Utils = setProtocolUtils.Web3Utils;
var web3Utils = new Web3Utils(web3);
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('SocialTradingManagerWrapper', function () {
    var core;
    var transferProxy;
    var factory;
    var rebalancingComponentWhiteList;
    var wrappedBTC;
    var wrappedETH;
    var liquidator;
    var feeCalculator;
    var rebalancingFactory;
    var oracleWhiteList;
    var liquidatorWhiteList;
    var feeCalculatorWhiteList;
    var ethOracleProxy;
    var btcOracleProxy;
    var allocator;
    var initialEthPrice;
    var initialBtcPrice;
    var pricePrecision;
    var setManager;
    var socialTradingManagerWrapper;
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var collateralName, collateralSymbol;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _c.sent();
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 2:
                    _a = _c.sent(), core = _a[0], transferProxy = _a[1], factory = _a[3], rebalancingComponentWhiteList = _a[6];
                    initialEthPrice = util_1.ether(180);
                    initialBtcPrice = util_1.ether(9000);
                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [8, 18], web3, accounts_1.DEFAULT_ACCOUNT)];
                case 3:
                    _b = _c.sent(), wrappedBTC = _b[0], wrappedETH = _b[1];
                    return [4 /*yield*/, helpers_1.approveForTransferAsync([wrappedBTC, wrappedETH], transferProxy.address)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(rebalancingComponentWhiteList, wrappedBTC.address)];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(rebalancingComponentWhiteList, wrappedETH.address)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployConstantPriceOracleAsync(web3, initialEthPrice)];
                case 7:
                    ethOracleProxy = _c.sent();
                    return [4 /*yield*/, helpers_1.deployConstantPriceOracleAsync(web3, initialBtcPrice)];
                case 8:
                    btcOracleProxy = _c.sent();
                    return [4 /*yield*/, helpers_1.deployOracleWhiteListAsync(web3, [wrappedETH.address, wrappedBTC.address], [ethOracleProxy.address, btcOracleProxy.address])];
                case 9:
                    oracleWhiteList = _c.sent();
                    return [4 /*yield*/, helpers_1.deployLinearAuctionLiquidatorContractAsync(web3, core, oracleWhiteList)];
                case 10:
                    liquidator = _c.sent();
                    return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [liquidator.address])];
                case 11:
                    liquidatorWhiteList = _c.sent();
                    return [4 /*yield*/, helpers_1.deployFixedFeeCalculatorAsync(web3)];
                case 12:
                    feeCalculator = _c.sent();
                    return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [feeCalculator.address])];
                case 13:
                    feeCalculatorWhiteList = _c.sent();
                    return [4 /*yield*/, helpers_1.deployRebalancingSetTokenV2FactoryContractAsync(web3, core, rebalancingComponentWhiteList, liquidatorWhiteList, feeCalculatorWhiteList)];
                case 14:
                    rebalancingFactory = _c.sent();
                    pricePrecision = new util_1.BigNumber(100);
                    collateralName = SetUtils.stringToBytes('Collateral');
                    collateralSymbol = SetUtils.stringToBytes('COL');
                    return [4 /*yield*/, helpers_1.deploySocialAllocatorAsync(web3, wrappedETH.address, wrappedBTC.address, oracleWhiteList.address, core.address, factory.address, pricePrecision, collateralName, collateralSymbol)];
                case 15:
                    allocator = _c.sent();
                    return [4 /*yield*/, helpers_1.deploySocialTradingManagerAsync(web3, core.address, rebalancingFactory.address, [allocator.address])];
                case 16:
                    setManager = _c.sent();
                    socialTradingManagerWrapper = new wrappers_1.SocialTradingManagerWrapper(web3);
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3Utils.revertToSnapshot(currentSnapshotId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('createTradingPool', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingManagerWrapper.createTradingPool(subjectManager, subjectAllocator, subjectStartingBaseAssetAllocation, subjectStartingUSDValue, subjectTradingPoolName, subjectTradingPoolSymbol, subjectRebalancingSetCallData, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectAllocator, subjectStartingBaseAssetAllocation, subjectStartingUSDValue, subjectTradingPoolName, subjectTradingPoolSymbol, subjectRebalancingSetCallData, subjectCaller, poolName, poolSymbol;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var callDataManagerAddress, callDataLiquidator, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, timestamp, callDataLastRebalanceTimestamp, callDataEntryFee, rebalanceFee, callDataRebalanceFeeCallData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            poolName = 'CoolPool';
                            poolSymbol = 'COOL';
                            subjectManager = setManager.address;
                            subjectAllocator = allocator.address;
                            subjectStartingBaseAssetAllocation = util_1.ether(0.72);
                            subjectStartingUSDValue = util_1.ether(100);
                            subjectTradingPoolName = SetUtils.stringToBytes(poolName);
                            subjectTradingPoolSymbol = SetUtils.stringToBytes(poolSymbol);
                            callDataManagerAddress = setManager.address;
                            callDataLiquidator = liquidator;
                            callDataFeeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            callRebalanceFeeCalculator = feeCalculator.address;
                            callDataRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            callDataFailAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            callDataLastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            callDataEntryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
                            subjectRebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(callDataManagerAddress, callDataLiquidator.address, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, callDataLastRebalanceTimestamp, callDataEntryFee, callDataRebalanceFeeCallData);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully creates poolInfo', function () { return __awaiter(_this, void 0, void 0, function () {
                var txHash, formattedLogs, tradingPoolAddress, poolInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 2:
                            formattedLogs = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            return [4 /*yield*/, setManager.pools.callAsync(tradingPoolAddress)];
                        case 3:
                            poolInfo = _a.sent();
                            expect(poolInfo.trader).to.equal(subjectCaller);
                            expect(poolInfo.allocator).to.equal(subjectAllocator);
                            expect(poolInfo.currentAllocation).to.be.bignumber.equal(subjectStartingBaseAssetAllocation);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully creates tradingPool', function () { return __awaiter(_this, void 0, void 0, function () {
                var txHash, formattedLogs, tradingPoolAddress, tradingPoolInstance, actualName, actualSymbol;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 2:
                            formattedLogs = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV2Contract.at(tradingPoolAddress, web3, constants_1.TX_DEFAULTS)];
                        case 3:
                            tradingPoolInstance = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.name.callAsync()];
                        case 4:
                            actualName = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.symbol.callAsync()];
                        case 5:
                            actualSymbol = _a.sent();
                            expect(actualName).to.equal(poolName);
                            expect(actualSymbol).to.equal(poolSymbol);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('updateAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingManagerWrapper.updateAllocation(subjectManager, subjectTradingPool, subjectNewAllocation, subjectLiquidatorData, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewAllocation, subjectLiquidatorData, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, callDataManagerAddress, callDataLiquidator, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, timestamp, callDataLastRebalanceTimestamp, callDataEntryFee, rebalanceFee, callDataRebalanceFeeCallData, rebalancingSetCallData, txHash, formattedLogs, collateralAddress, collateralInstance, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            managerAddress = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(.95);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = SetUtils.stringToBytes('CoolPool');
                            tradingPoolSymbol = SetUtils.stringToBytes('COOL');
                            callDataManagerAddress = setManager.address;
                            callDataLiquidator = liquidator;
                            callDataFeeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            callRebalanceFeeCalculator = feeCalculator.address;
                            callDataRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            callDataFailAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            callDataLastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            callDataEntryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
                            rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(callDataManagerAddress, callDataLiquidator.address, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, callDataLastRebalanceTimestamp, callDataEntryFee, callDataRebalanceFeeCallData);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingManagerWrapper.createTradingPool(managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, rebalancingSetCallData, { from: subjectCaller })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            collateralAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs, 2);
                            return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(collateralAddress, web3, constants_1.TX_DEFAULTS)];
                        case 4:
                            collateralInstance = _a.sent();
                            return [4 /*yield*/, collateralInstance.approve.sendTransactionAsync(transferProxy.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: subjectCaller })];
                        case 5:
                            _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            subjectManager = setManager.address;
                            subjectTradingPool = tradingPoolAddress;
                            subjectNewAllocation = util_1.ether(.75);
                            subjectLiquidatorData = SetUtils.stringToBytes('');
                            return [4 /*yield*/, core.issue.sendTransactionAsync(collateralAddress, util_1.ether(2), { from: subjectCaller })];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(subjectTradingPool, util_1.ether(2), { from: subjectCaller })];
                        case 7:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, callDataRebalanceInterval)];
                        case 8:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully updates tradingPool allocation', function () { return __awaiter(_this, void 0, void 0, function () {
                var poolInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, setManager.pools.callAsync(subjectTradingPool)];
                        case 2:
                            poolInfo = _a.sent();
                            expect(poolInfo.currentAllocation).to.be.bignumber.equal(subjectNewAllocation);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('initiateEntryFeeChange', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingManagerWrapper.initiateEntryFeeChange(subjectManager, subjectTradingPool, subjectNewEntryFee, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewEntryFee, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, callDataManagerAddress, callDataLiquidator, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, timestamp, callDataLastRebalanceTimestamp, callDataEntryFee, rebalanceFee, callDataRebalanceFeeCallData, rebalancingSetCallData, txHash, formattedLogs, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            managerAddress = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = SetUtils.stringToBytes('CoolPool');
                            tradingPoolSymbol = SetUtils.stringToBytes('COOL');
                            callDataManagerAddress = setManager.address;
                            callDataLiquidator = liquidator;
                            callDataFeeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            callRebalanceFeeCalculator = feeCalculator.address;
                            callDataRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            callDataFailAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            callDataLastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            callDataEntryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
                            rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(callDataManagerAddress, callDataLiquidator.address, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, callDataLastRebalanceTimestamp, callDataEntryFee, callDataRebalanceFeeCallData);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingManagerWrapper.createTradingPool(managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, rebalancingSetCallData, { from: subjectCaller })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            subjectManager = setManager.address;
                            subjectTradingPool = tradingPoolAddress;
                            subjectNewEntryFee = util_1.ether(.02);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully updates tradingPool newEntryFee', function () { return __awaiter(_this, void 0, void 0, function () {
                var poolInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, setManager.pools.callAsync(subjectTradingPool)];
                        case 2:
                            poolInfo = _a.sent();
                            expect(poolInfo.newEntryFee).to.be.bignumber.equal(subjectNewEntryFee);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('finalizeEntryFeeChange', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingManagerWrapper.finalizeEntryFeeChange(subjectManager, subjectTradingPool, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectCaller, newEntryFee;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, callDataManagerAddress, callDataLiquidator, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, timestamp, callDataLastRebalanceTimestamp, callDataEntryFee, rebalanceFee, callDataRebalanceFeeCallData, rebalancingSetCallData, txHash, formattedLogs, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            managerAddress = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = SetUtils.stringToBytes('CoolPool');
                            tradingPoolSymbol = SetUtils.stringToBytes('COOL');
                            callDataManagerAddress = setManager.address;
                            callDataLiquidator = liquidator;
                            callDataFeeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            callRebalanceFeeCalculator = feeCalculator.address;
                            callDataRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            callDataFailAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            callDataLastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            callDataEntryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
                            rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(callDataManagerAddress, callDataLiquidator.address, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, callDataLastRebalanceTimestamp, callDataEntryFee, callDataRebalanceFeeCallData);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingManagerWrapper.createTradingPool(managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, rebalancingSetCallData, { from: subjectCaller })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            newEntryFee = util_1.ether(.02);
                            return [4 /*yield*/, socialTradingManagerWrapper.initiateEntryFeeChange(setManager.address, tradingPoolAddress, newEntryFee, { from: subjectCaller })];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS.add(1))];
                        case 5:
                            _a.sent();
                            subjectManager = setManager.address;
                            subjectTradingPool = tradingPoolAddress;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully updates tradingPool newEntryFee', function () { return __awaiter(_this, void 0, void 0, function () {
                var tradingPoolInstance, actualNewFee;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV2Contract.at(subjectTradingPool, web3, constants_1.TX_DEFAULTS)];
                        case 2:
                            tradingPoolInstance = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.entryFee.callAsync()];
                        case 3:
                            actualNewFee = _a.sent();
                            expect(actualNewFee).to.be.bignumber.equal(newEntryFee);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('setTrader', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingManagerWrapper.setTrader(subjectManager, subjectTradingPool, subjectNewTrader, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewTrader, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, callDataManagerAddress, callDataLiquidator, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, timestamp, callDataLastRebalanceTimestamp, callDataEntryFee, rebalanceFee, callDataRebalanceFeeCallData, rebalancingSetCallData, txHash, formattedLogs, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            managerAddress = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = SetUtils.stringToBytes('CoolPool');
                            tradingPoolSymbol = SetUtils.stringToBytes('COOL');
                            callDataManagerAddress = setManager.address;
                            callDataLiquidator = liquidator;
                            callDataFeeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            callRebalanceFeeCalculator = feeCalculator.address;
                            callDataRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            callDataFailAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            callDataLastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            callDataEntryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
                            rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(callDataManagerAddress, callDataLiquidator.address, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, callDataLastRebalanceTimestamp, callDataEntryFee, callDataRebalanceFeeCallData);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingManagerWrapper.createTradingPool(managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, rebalancingSetCallData, { from: subjectCaller })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            subjectManager = setManager.address;
                            subjectTradingPool = tradingPoolAddress;
                            subjectNewTrader = accounts_1.ACCOUNTS[1].address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully updates tradingPool trader', function () { return __awaiter(_this, void 0, void 0, function () {
                var poolInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, setManager.pools.callAsync(subjectTradingPool)];
                        case 2:
                            poolInfo = _a.sent();
                            expect(poolInfo.trader).to.equal(subjectNewTrader);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('setLiquidator', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingManagerWrapper.setLiquidator(subjectManager, subjectTradingPool, subjectNewLiquidator, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewLiquidator, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, callDataManagerAddress, callDataLiquidator, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, timestamp, callDataLastRebalanceTimestamp, callDataEntryFee, rebalanceFee, callDataRebalanceFeeCallData, rebalancingSetCallData, txHash, formattedLogs, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            managerAddress = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = SetUtils.stringToBytes('CoolPool');
                            tradingPoolSymbol = SetUtils.stringToBytes('COOL');
                            callDataManagerAddress = setManager.address;
                            callDataLiquidator = liquidator;
                            callDataFeeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            callRebalanceFeeCalculator = feeCalculator.address;
                            callDataRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            callDataFailAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            callDataLastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            callDataEntryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
                            rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(callDataManagerAddress, callDataLiquidator.address, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, callDataLastRebalanceTimestamp, callDataEntryFee, callDataRebalanceFeeCallData);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingManagerWrapper.createTradingPool(managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, rebalancingSetCallData, { from: subjectCaller })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            subjectManager = setManager.address;
                            subjectTradingPool = tradingPoolAddress;
                            subjectNewLiquidator = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, liquidatorWhiteList.addAddress.sendTransactionAsync(subjectNewLiquidator)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully updates tradingPool feeRecipient', function () { return __awaiter(_this, void 0, void 0, function () {
                var tradingPoolInstance, actualLiquidator;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV2Contract.at(subjectTradingPool, web3, constants_1.TX_DEFAULTS)];
                        case 2:
                            tradingPoolInstance = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.liquidator.callAsync()];
                        case 3:
                            actualLiquidator = _a.sent();
                            expect(actualLiquidator).to.equal(subjectNewLiquidator);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('setFeeRecipient', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingManagerWrapper.setFeeRecipient(subjectManager, subjectTradingPool, subjectNewFeeRecipient, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewFeeRecipient, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, callDataManagerAddress, callDataLiquidator, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, timestamp, callDataLastRebalanceTimestamp, callDataEntryFee, rebalanceFee, callDataRebalanceFeeCallData, rebalancingSetCallData, txHash, formattedLogs, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            managerAddress = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = SetUtils.stringToBytes('CoolPool');
                            tradingPoolSymbol = SetUtils.stringToBytes('COOL');
                            callDataManagerAddress = setManager.address;
                            callDataLiquidator = liquidator;
                            callDataFeeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            callRebalanceFeeCalculator = feeCalculator.address;
                            callDataRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            callDataFailAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            callDataLastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            callDataEntryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
                            rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(callDataManagerAddress, callDataLiquidator.address, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, callDataLastRebalanceTimestamp, callDataEntryFee, callDataRebalanceFeeCallData);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingManagerWrapper.createTradingPool(managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, rebalancingSetCallData, { from: subjectCaller })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            subjectManager = setManager.address;
                            subjectTradingPool = tradingPoolAddress;
                            subjectNewFeeRecipient = accounts_1.ACCOUNTS[1].address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully updates tradingPool feeRecipient', function () { return __awaiter(_this, void 0, void 0, function () {
                var tradingPoolInstance, actualFeeRecipient;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV2Contract.at(subjectTradingPool, web3, constants_1.TX_DEFAULTS)];
                        case 2:
                            tradingPoolInstance = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.feeRecipient.callAsync()];
                        case 3:
                            actualFeeRecipient = _a.sent();
                            expect(actualFeeRecipient).to.equal(subjectNewFeeRecipient);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('pools', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingManagerWrapper.pools(subjectManager, subjectTradingPool)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, allocatorAddress, startingBaseAssetAllocation, trader;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var managerAddress, startingUSDValue, tradingPoolName, tradingPoolSymbol, callDataManagerAddress, callDataLiquidator, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, timestamp, callDataLastRebalanceTimestamp, callDataEntryFee, rebalanceFee, callDataRebalanceFeeCallData, rebalancingSetCallData, txHash, formattedLogs, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            managerAddress = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = SetUtils.stringToBytes('CoolPool');
                            tradingPoolSymbol = SetUtils.stringToBytes('COOL');
                            callDataManagerAddress = setManager.address;
                            callDataLiquidator = liquidator;
                            callDataFeeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            callRebalanceFeeCalculator = feeCalculator.address;
                            callDataRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            callDataFailAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            callDataLastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            callDataEntryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            callDataRebalanceFeeCallData = SetUtils.generateFixedFeeCalculatorCalldata(rebalanceFee);
                            rebalancingSetCallData = SetUtils.generateRebalancingSetTokenV2CallData(callDataManagerAddress, callDataLiquidator.address, callDataFeeRecipient, callRebalanceFeeCalculator, callDataRebalanceInterval, callDataFailAuctionPeriod, callDataLastRebalanceTimestamp, callDataEntryFee, callDataRebalanceFeeCallData);
                            trader = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingManagerWrapper.createTradingPool(managerAddress, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, rebalancingSetCallData, { from: trader })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            subjectManager = setManager.address;
                            subjectTradingPool = tradingPoolAddress;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully updates tradingPool feeRecipient', function () { return __awaiter(_this, void 0, void 0, function () {
                var actualPoolInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, setManager.pools.callAsync(subjectTradingPool)];
                        case 2:
                            actualPoolInfo = _a.sent();
                            expect(actualPoolInfo.allocator).to.equal(allocatorAddress);
                            expect(actualPoolInfo.currentAllocation).to.be.bignumber.equal(startingBaseAssetAllocation);
                            expect(actualPoolInfo.trader).to.equal(trader);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=SocialTradingManagerWrapper.spec.js.map