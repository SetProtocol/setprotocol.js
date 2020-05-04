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
var _ = __importStar(require("lodash"));
var ABIDecoder = __importStar(require("abi-decoder"));
var chai = __importStar(require("chai"));
var setProtocolUtils = __importStar(require("set-protocol-utils"));
var web3_1 = __importDefault(require("web3"));
var set_protocol_contracts_1 = require("set-protocol-contracts");
var set_protocol_oracles_1 = require("set-protocol-oracles");
var accounts_1 = require("@src/constants/accounts");
var api_1 = require("@src/api");
var constants_1 = require("@src/constants");
var helpers_1 = require("@test/helpers");
var util_1 = require("@src/util");
var assertions_1 = require("@src/assertions");
var common_1 = require("@src/types/common");
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
chaiSetup_1.default.configure();
var expect = chai.expect;
var contract = require('truffle-contract');
var timeKeeper = require('timekeeper');
var moment = require('moment');
var web3 = new web3_1.default('http://localhost:8545');
var SetUtils = setProtocolUtils.SetProtocolUtils, Web3Utils = setProtocolUtils.Web3Utils;
var web3Utils = new Web3Utils(web3);
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('SocialTradingAPI', function () {
    var core;
    var transferProxy;
    var factory;
    var rebalancingComponentWhiteList;
    var wrappedBTC;
    var wrappedETH;
    var liquidator;
    var feeCalculator;
    var performanceFeeCalculator;
    var rebalancingFactory;
    var rebalancingV3Factory;
    var oracleWhiteList;
    var liquidatorWhiteList;
    var feeCalculatorWhiteList;
    var rebalanceAuctionModule;
    var ethOracleProxy;
    var btcOracleProxy;
    var allocator;
    var initialEthPrice;
    var initialBtcPrice;
    var pricePrecision;
    var maxProfitFeePercentage;
    var maxStreamingFeePercentage;
    var setManager;
    var setManagerV2;
    var protocolViewer;
    var assertions;
    var socialTradingAPI;
    var coreHelper = new set_protocol_contracts_1.CoreHelper(accounts_1.DEFAULT_ACCOUNT, accounts_1.DEFAULT_ACCOUNT);
    var erc20Helper = new set_protocol_contracts_1.ERC20Helper(accounts_1.DEFAULT_ACCOUNT);
    var oracleHelper = new set_protocol_oracles_1.OracleHelper(accounts_1.DEFAULT_ACCOUNT);
    var valuationHelper = new set_protocol_contracts_1.ValuationHelper(accounts_1.DEFAULT_ACCOUNT, coreHelper, erc20Helper, oracleHelper);
    var feeCalculatorHelper = new set_protocol_contracts_1.FeeCalculatorHelper(accounts_1.DEFAULT_ACCOUNT);
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var collateralName, collateralSymbol, setProtocolConfig;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _c.sent();
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 2:
                    _a = _c.sent(), core = _a[0], transferProxy = _a[1], factory = _a[3], rebalanceAuctionModule = _a[5], rebalancingComponentWhiteList = _a[6];
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
                    return [4 /*yield*/, helpers_1.deployUpdatableOracleMockAsync(web3, initialEthPrice)];
                case 7:
                    ethOracleProxy = _c.sent();
                    return [4 /*yield*/, helpers_1.deployUpdatableOracleMockAsync(web3, initialBtcPrice)];
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
                    maxProfitFeePercentage = util_1.ether(.4);
                    maxStreamingFeePercentage = util_1.ether(.07);
                    return [4 /*yield*/, feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(core.address, oracleWhiteList.address, maxProfitFeePercentage, maxStreamingFeePercentage)];
                case 13:
                    performanceFeeCalculator = _c.sent();
                    return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [feeCalculator.address, performanceFeeCalculator.address])];
                case 14:
                    feeCalculatorWhiteList = _c.sent();
                    return [4 /*yield*/, helpers_1.deployRebalancingSetTokenV2FactoryContractAsync(web3, core, rebalancingComponentWhiteList, liquidatorWhiteList, feeCalculatorWhiteList)];
                case 15:
                    rebalancingFactory = _c.sent();
                    return [4 /*yield*/, helpers_1.deployRebalancingSetTokenV3FactoryContractAsync(web3, core, rebalancingComponentWhiteList, liquidatorWhiteList, feeCalculatorWhiteList)];
                case 16:
                    rebalancingV3Factory = _c.sent();
                    pricePrecision = new util_1.BigNumber(100);
                    collateralName = SetUtils.stringToBytes('Collateral');
                    collateralSymbol = SetUtils.stringToBytes('COL');
                    return [4 /*yield*/, helpers_1.deploySocialAllocatorAsync(web3, wrappedETH.address, wrappedBTC.address, oracleWhiteList.address, core.address, factory.address, pricePrecision, collateralName, collateralSymbol)];
                case 17:
                    allocator = _c.sent();
                    return [4 /*yield*/, helpers_1.deploySocialTradingManagerAsync(web3, core.address, rebalancingFactory.address, [allocator.address])];
                case 18:
                    setManager = _c.sent();
                    return [4 /*yield*/, helpers_1.deploySocialTradingManagerV2Async(web3, core.address, rebalancingV3Factory.address, [allocator.address])];
                case 19:
                    setManagerV2 = _c.sent();
                    return [4 /*yield*/, setManagerV2.setTimeLockPeriod.sendTransactionAsync(constants_1.ONE_DAY_IN_SECONDS)];
                case 20:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployProtocolViewerAsync(web3)];
                case 21:
                    protocolViewer = _c.sent();
                    setProtocolConfig = {
                        coreAddress: constants_1.NULL_ADDRESS,
                        transferProxyAddress: constants_1.NULL_ADDRESS,
                        vaultAddress: constants_1.NULL_ADDRESS,
                        setTokenFactoryAddress: constants_1.NULL_ADDRESS,
                        rebalancingSetTokenFactoryAddress: constants_1.NULL_ADDRESS,
                        kyberNetworkWrapperAddress: constants_1.NULL_ADDRESS,
                        rebalanceAuctionModuleAddress: constants_1.NULL_ADDRESS,
                        exchangeIssuanceModuleAddress: constants_1.NULL_ADDRESS,
                        rebalancingSetIssuanceModule: constants_1.NULL_ADDRESS,
                        rebalancingSetEthBidderAddress: constants_1.NULL_ADDRESS,
                        rebalancingSetExchangeIssuanceModule: constants_1.NULL_ADDRESS,
                        wrappedEtherAddress: constants_1.NULL_ADDRESS,
                        protocolViewerAddress: protocolViewer.address,
                    };
                    assertions = new assertions_1.Assertions(web3);
                    socialTradingAPI = new api_1.SocialTradingAPI(web3, assertions, setProtocolConfig);
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
    describe('createTradingPoolAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(subjectManager, subjectAllocatorAddress, subjectStartingBaseAssetAllocation, subjectStartingUSDValue, subjectTradingPoolName, subjectTradingPoolSymbol, subjectLiquidator, subjectFeeRecipient, subjectFeeCalculator, subjectRebalanceInterval, subjectFailAuctionPeriod, subjectLastRebalanceTimestamp, subjectEntryFee, subjectRebalanceFee, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectAllocatorAddress, subjectStartingBaseAssetAllocation, subjectStartingUSDValue, subjectTradingPoolName, subjectTradingPoolSymbol, subjectLiquidator, subjectFeeRecipient, subjectFeeCalculator, subjectRebalanceInterval, subjectFailAuctionPeriod, subjectLastRebalanceTimestamp, subjectEntryFee, subjectRebalanceFee, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var timestamp;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectManager = setManager.address;
                            subjectAllocatorAddress = allocator.address;
                            subjectStartingBaseAssetAllocation = util_1.ether(0.72);
                            subjectStartingUSDValue = util_1.ether(100);
                            subjectTradingPoolName = 'CoolPool';
                            subjectTradingPoolSymbol = 'COOL';
                            subjectLiquidator = liquidator.address;
                            subjectFeeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            subjectFeeCalculator = feeCalculator.address;
                            subjectRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            subjectFailAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            subjectLastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            subjectEntryFee = util_1.ether(.0001);
                            subjectRebalanceFee = util_1.ether(.0001);
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
                            expect(poolInfo.allocator).to.equal(subjectAllocatorAddress);
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
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV3Contract.at(tradingPoolAddress, web3, constants_1.TX_DEFAULTS)];
                        case 3:
                            tradingPoolInstance = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.name.callAsync()];
                        case 4:
                            actualName = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.symbol.callAsync()];
                        case 5:
                            actualSymbol = _a.sent();
                            expect(actualName).to.equal(subjectTradingPoolName);
                            expect(actualSymbol).to.equal(subjectTradingPoolSymbol);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the passed allocation is equal to 0', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectStartingBaseAssetAllocation = constants_1.ZERO;
                            return [2 /*return*/];
                        });
                    }); });
                    test('successfully sets currentAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
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
                                    expect(poolInfo.currentAllocation).to.be.bignumber.equal(subjectStartingBaseAssetAllocation);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed allocation is less than 0', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectStartingBaseAssetAllocation = new util_1.BigNumber(-1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + subjectStartingBaseAssetAllocation.toString() + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed allocation is greater than 100', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectStartingBaseAssetAllocation = util_1.ether(1.1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided allocation " + subjectStartingBaseAssetAllocation.toString() + " is greater than 100%.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed allocation is not a multiple of 1%', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectStartingBaseAssetAllocation = util_1.ether(.012);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided allocation " + subjectStartingBaseAssetAllocation.toString() + " is not multiple of 1% (10 ** 16)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed entryFee is not a multiple of 1 basis point', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectEntryFee = util_1.ether(.00011);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided fee " + subjectEntryFee.toString() + " is not multiple of one basis point (10 ** 14)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed rebalanceFee is not a multiple of 1 basis point', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalanceFee = util_1.ether(.00011);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided fee " + subjectRebalanceFee.toString() + " is not multiple of one basis point (10 ** 14)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed tradingPoolName is an empty string', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTradingPoolName = '';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The string name cannot be empty.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed tradingPoolSymbol is an empty string', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTradingPoolSymbol = '';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The string symbol cannot be empty.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('createTradingPoolV2Async', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.createTradingPoolV2Async(subjectManager, subjectAllocatorAddress, subjectStartingBaseAssetAllocation, subjectStartingUSDValue, subjectTradingPoolName, subjectTradingPoolSymbol, subjectLiquidator, subjectFeeRecipient, subjectFeeCalculator, subjectRebalanceInterval, subjectFailAuctionPeriod, subjectLastRebalanceTimestamp, subjectEntryFee, subjectProfitFeePeriod, subjectHighWatermarkResetPeriod, subjectProfitFee, subjectStreamingFee, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectAllocatorAddress, subjectStartingBaseAssetAllocation, subjectStartingUSDValue, subjectTradingPoolName, subjectTradingPoolSymbol, subjectLiquidator, subjectFeeRecipient, subjectFeeCalculator, subjectRebalanceInterval, subjectFailAuctionPeriod, subjectLastRebalanceTimestamp, subjectEntryFee, subjectProfitFeePeriod, subjectHighWatermarkResetPeriod, subjectProfitFee, subjectStreamingFee, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var timestamp;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectManager = setManagerV2.address;
                            subjectAllocatorAddress = allocator.address;
                            subjectStartingBaseAssetAllocation = util_1.ether(0.72);
                            subjectStartingUSDValue = util_1.ether(100);
                            subjectTradingPoolName = 'CoolPool';
                            subjectTradingPoolSymbol = 'COOL';
                            subjectLiquidator = liquidator.address;
                            subjectFeeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            subjectFeeCalculator = performanceFeeCalculator.address;
                            subjectRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            subjectFailAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            subjectLastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            subjectEntryFee = util_1.ether(.0001);
                            subjectProfitFeePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(30);
                            subjectHighWatermarkResetPeriod = constants_1.ONE_DAY_IN_SECONDS.mul(365);
                            subjectProfitFee = util_1.ether(.2);
                            subjectStreamingFee = util_1.ether(.02);
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
                            return [4 /*yield*/, setManagerV2.pools.callAsync(tradingPoolAddress)];
                        case 3:
                            poolInfo = _a.sent();
                            expect(poolInfo.trader).to.equal(subjectCaller);
                            expect(poolInfo.allocator).to.equal(subjectAllocatorAddress);
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
                            expect(actualName).to.equal(subjectTradingPoolName);
                            expect(actualSymbol).to.equal(subjectTradingPoolSymbol);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the passed allocation is equal to 0', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectStartingBaseAssetAllocation = constants_1.ZERO;
                            return [2 /*return*/];
                        });
                    }); });
                    test('successfully sets currentAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
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
                                    expect(poolInfo.currentAllocation).to.be.bignumber.equal(subjectStartingBaseAssetAllocation);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed allocation is less than 0', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectStartingBaseAssetAllocation = new util_1.BigNumber(-1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + subjectStartingBaseAssetAllocation.toString() + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed allocation is greater than 100', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectStartingBaseAssetAllocation = util_1.ether(1.1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided allocation " + subjectStartingBaseAssetAllocation.toString() + " is greater than 100%.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed allocation is not a multiple of 1%', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectStartingBaseAssetAllocation = util_1.ether(.012);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided allocation " + subjectStartingBaseAssetAllocation.toString() + " is not multiple of 1% (10 ** 16)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed entryFee is not a multiple of 1 basis point', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectEntryFee = util_1.ether(.00011);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided fee " + subjectEntryFee.toString() + " is not multiple of one basis point (10 ** 14)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed profitFee is not a multiple of 1 basis point', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectProfitFee = util_1.ether(.00011);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided fee " + subjectProfitFee.toString() + " is not multiple of one basis point (10 ** 14)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed streamingFee is not a multiple of 1 basis point', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectStreamingFee = util_1.ether(.00011);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided fee " + subjectStreamingFee.toString() + " is not multiple of one basis point (10 ** 14)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed profitFee is greater than maximum', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectProfitFee = util_1.ether(.5);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Passed fee exceeds allowed maximum.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed streamingFee is greater than maximum', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectStreamingFee = util_1.ether(.1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Passed fee exceeds allowed maximum.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed highWatermarkResetPeriod is less than profitFeePeriod', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectHighWatermarkResetPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("High watermark reset must be greater than profit fee period.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed tradingPoolName is an empty string', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTradingPoolName = '';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The string name cannot be empty.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed tradingPoolSymbol is an empty string', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTradingPoolSymbol = '';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The string symbol cannot be empty.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('updateAllocationAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.updateAllocationAsync(subjectManager, subjectTradingPool, subjectNewAllocation, subjectLiquidatorData, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewAllocation, subjectLiquidatorData, subjectCaller, nextRebalanceAvailableAtSeconds;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, rebalanceFee, txHash, formattedLogs, collateralAddress, collateralInstance, tradingPoolAddress, tradingPoolInstance, lastRebalancedTimestampSeconds;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectManager = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            liquidatorAddress = liquidator.address;
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(subjectManager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, { from: subjectCaller })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, rebalanceInterval.add(1))];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 4:
                            formattedLogs = _a.sent();
                            collateralAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs, 2);
                            return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(collateralAddress, web3, constants_1.TX_DEFAULTS)];
                        case 5:
                            collateralInstance = _a.sent();
                            return [4 /*yield*/, collateralInstance.approve.sendTransactionAsync(transferProxy.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: subjectCaller })];
                        case 6:
                            _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV2Contract.at(tradingPoolAddress, web3, constants_1.TX_DEFAULTS)];
                        case 7:
                            tradingPoolInstance = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.lastRebalanceTimestamp.callAsync()];
                        case 8:
                            lastRebalancedTimestampSeconds = _a.sent();
                            nextRebalanceAvailableAtSeconds = lastRebalancedTimestampSeconds.toNumber() + rebalanceInterval.toNumber();
                            timeKeeper.freeze(nextRebalanceAvailableAtSeconds * 1000);
                            helpers_1.increaseChainTimeAsync(web3, rebalanceInterval.add(1));
                            subjectManager = setManager.address;
                            subjectTradingPool = tradingPoolAddress;
                            subjectNewAllocation = util_1.ether(.75);
                            subjectLiquidatorData = SetUtils.stringToBytes('');
                            return [4 /*yield*/, core.issue.sendTransactionAsync(collateralAddress, util_1.ether(2), { from: subjectCaller })];
                        case 9:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(subjectTradingPool, util_1.ether(5), { from: subjectCaller })];
                        case 10:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    timeKeeper.reset();
                    return [2 /*return*/];
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
            describe('when the passed allocation is less than 0', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectNewAllocation = new util_1.BigNumber(-1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + subjectNewAllocation.toString() + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed allocation is greater than 100', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectNewAllocation = util_1.ether(1.1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided allocation " + subjectNewAllocation.toString() + " is greater than 100%.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed allocation is not a multiple of 1%', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectNewAllocation = util_1.ether(.012);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided allocation " + subjectNewAllocation.toString() + " is not multiple of 1% (10 ** 16)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the caller is not the trader', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Caller " + subjectCaller + " is not trader of tradingPool.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the tradingPool is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectTradingPool + " is currently in rebalancing state. " +
                                    "Issue, Redeem, and propose functionality is not available during this time")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when updateAllocationAsync is called before a new rebalance is allowed', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            timeKeeper.freeze((nextRebalanceAvailableAtSeconds * 1000) - 10);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var nextAvailableRebalance, nextRebalanceFormattedDate;
                        return __generator(this, function (_a) {
                            nextAvailableRebalance = nextRebalanceAvailableAtSeconds * 1000;
                            nextRebalanceFormattedDate = moment(nextAvailableRebalance)
                                .format('dddd, MMMM Do YYYY, h:mm:ss a');
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Attempting to rebalance too soon. Rebalancing next " +
                                    ("available on " + nextRebalanceFormattedDate))];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('acutalizeFeeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.actualizeFeesAsync(subjectTradingPool, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTradingPool, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, trader, txHash, formattedLogs, collateralAddress, collateralInstance, tradingPool, newEthPrice;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            manager = setManagerV2.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            liquidatorAddress = liquidator.address;
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculator = performanceFeeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.0001);
                            profitFeePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(30);
                            highWatermarkResetPeriod = constants_1.ONE_DAY_IN_SECONDS.mul(365);
                            profitFee = util_1.ether(.2);
                            streamingFee = util_1.ether(.02);
                            trader = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolV2Async(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, { from: trader })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, profitFeePeriod.add(1))];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 4:
                            formattedLogs = _a.sent();
                            collateralAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs, 2);
                            return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(collateralAddress, web3, constants_1.TX_DEFAULTS)];
                        case 5:
                            collateralInstance = _a.sent();
                            return [4 /*yield*/, collateralInstance.approve.sendTransactionAsync(transferProxy.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: subjectCaller })];
                        case 6:
                            _a.sent();
                            tradingPool = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(collateralAddress, util_1.ether(2), { from: subjectCaller })];
                        case 7:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(tradingPool, util_1.ether(5), { from: subjectCaller })];
                        case 8:
                            _a.sent();
                            newEthPrice = util_1.ether(250);
                            return [4 /*yield*/, ethOracleProxy.updatePrice.sendTransactionAsync(newEthPrice)];
                        case 9:
                            _a.sent();
                            subjectTradingPool = tradingPool;
                            subjectCaller = trader;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully creates poolInfo', function () { return __awaiter(_this, void 0, void 0, function () {
                var timestamp, feeState;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 2:
                            timestamp = (_a.sent()).timestamp;
                            return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(subjectTradingPool)];
                        case 3:
                            feeState = _a.sent();
                            expect(feeState.lastProfitFeeTimestamp).to.be.bignumber.equal(timestamp);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('adjustPerformanceFeesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.adjustPerformanceFeesAsync(subjectManager, subjectTradingPool, subjectFeeType, subjectFeePercentage, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectFeeType, subjectFeePercentage, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, trader, txHash, formattedLogs, collateralAddress, collateralInstance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            manager = setManagerV2.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            liquidatorAddress = liquidator.address;
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculator = performanceFeeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.0001);
                            profitFeePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(30);
                            highWatermarkResetPeriod = constants_1.ONE_DAY_IN_SECONDS.mul(365);
                            profitFee = util_1.ether(.2);
                            streamingFee = util_1.ether(.02);
                            trader = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolV2Async(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, { from: trader })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            subjectManager = manager;
                            subjectTradingPool = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            subjectFeeType = common_1.FeeType.StreamingFee;
                            subjectFeePercentage = util_1.ether(.03);
                            subjectCaller = trader;
                            collateralAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs, 2);
                            return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(collateralAddress, web3, constants_1.TX_DEFAULTS)];
                        case 4:
                            collateralInstance = _a.sent();
                            return [4 /*yield*/, collateralInstance.approve.sendTransactionAsync(transferProxy.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(collateralAddress, util_1.ether(2), { from: subjectCaller })];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(subjectTradingPool, util_1.ether(2), { from: subjectCaller })];
                        case 7:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully initiates adjustFee process', function () { return __awaiter(_this, void 0, void 0, function () {
                var txHash, input, upgradeHash, upgradeIdentifier;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            txHash = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(txHash)];
                        case 2:
                            input = (_a.sent()).input;
                            upgradeHash = web3.utils.soliditySha3(input);
                            return [4 /*yield*/, setManagerV2.upgradeIdentifier.callAsync(subjectTradingPool)];
                        case 3:
                            upgradeIdentifier = _a.sent();
                            expect(upgradeIdentifier).to.equal(upgradeHash);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('the confirmation transaction goes through', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('successfully initiates adjustFee process', function () { return __awaiter(_this, void 0, void 0, function () {
                        var poolData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, socialTradingAPI.fetchNewTradingPoolV2DetailsAsync(subjectTradingPool)];
                                case 2:
                                    poolData = _a.sent();
                                    expect(poolData.performanceFeeInfo.streamingFeePercentage).to.be.bignumber.equal(subjectFeePercentage);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the caller is not the trader', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Caller " + subjectCaller + " is not trader of tradingPool.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed streamingFee is not a multiple of 1 basis point', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectFeePercentage = util_1.ether(.00011);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided fee " + subjectFeePercentage.toString() + " is not multiple of one basis point (10 ** 14)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed profitFee is greater than maximum', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectFeePercentage = util_1.ether(.5);
                            subjectFeeType = common_1.FeeType.ProfitFee;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Passed fee exceeds allowed maximum.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed streamingFee is greater than maximum', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectFeePercentage = util_1.ether(.1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Passed fee exceeds allowed maximum.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('removeFeeUpdateAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.removeFeeUpdateAsync(subjectManager, subjectTradingPool, subjectUpgradeHash, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectUpgradeHash, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, trader, txHash, formattedLogs, tradingPool, feeType, feePercentage, caller, adjustTxHash, input;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            manager = setManagerV2.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            liquidatorAddress = liquidator.address;
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculator = performanceFeeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.0001);
                            profitFeePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(30);
                            highWatermarkResetPeriod = constants_1.ONE_DAY_IN_SECONDS.mul(365);
                            profitFee = util_1.ether(.2);
                            streamingFee = util_1.ether(.02);
                            trader = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolV2Async(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, { from: trader })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            tradingPool = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            feeType = common_1.FeeType.StreamingFee;
                            feePercentage = util_1.ether(.03);
                            caller = trader;
                            return [4 /*yield*/, socialTradingAPI.adjustPerformanceFeesAsync(manager, tradingPool, feeType, feePercentage, { from: caller })];
                        case 4:
                            adjustTxHash = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(adjustTxHash)];
                        case 5:
                            input = (_a.sent()).input;
                            subjectUpgradeHash = web3.utils.soliditySha3(input);
                            subjectManager = manager;
                            subjectTradingPool = tradingPool;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully removes upgradeHash', function () { return __awaiter(_this, void 0, void 0, function () {
                var upgradeIdentifier;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, setManagerV2.upgradeIdentifier.callAsync(subjectTradingPool)];
                        case 2:
                            upgradeIdentifier = _a.sent();
                            expect(upgradeIdentifier).to.equal(constants_1.ZERO_BYTES);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the caller is not the trader', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Caller " + subjectCaller + " is not trader of tradingPool.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('fetchNewTradingPoolDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.fetchNewTradingPoolDetailsAsync(subjectTradingPool)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTradingPool, manager, allocatorAddress, startingBaseAssetAllocation, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, rebalanceInterval, entryFee, rebalanceFee, lastRebalanceTimestamp, collateralInstance, tradingPoolInstance;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var startingUSDValue, feeCalculatorAddress, failAuctionPeriod, timestamp, txHash, formattedLogs, collateralAddress, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            manager = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            liquidatorAddress = liquidator.address;
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            collateralAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs, 2);
                            return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(collateralAddress, web3, constants_1.TX_DEFAULTS)];
                        case 4:
                            collateralInstance = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV2Contract.at(tradingPoolAddress, web3, constants_1.TX_DEFAULTS)];
                        case 5:
                            tradingPoolInstance = _a.sent();
                            subjectTradingPool = tradingPoolAddress;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully gets info from manager', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo, poolInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _a.sent();
                            return [4 /*yield*/, setManager.pools.callAsync(subjectTradingPool)];
                        case 2:
                            poolInfo = _a.sent();
                            expect(newPoolInfo.trader).to.equal(poolInfo.trader);
                            expect(newPoolInfo.allocator).to.equal(poolInfo.allocator);
                            expect(newPoolInfo.currentAllocation).to.be.bignumber.equal(poolInfo.currentAllocation);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully gets info from collateral Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo, components, units, naturalUnit, name, symbol;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _a.sent();
                            return [4 /*yield*/, collateralInstance.getComponents.callAsync()];
                        case 2:
                            components = _a.sent();
                            return [4 /*yield*/, collateralInstance.getUnits.callAsync()];
                        case 3:
                            units = _a.sent();
                            return [4 /*yield*/, collateralInstance.naturalUnit.callAsync()];
                        case 4:
                            naturalUnit = _a.sent();
                            return [4 /*yield*/, collateralInstance.name.callAsync()];
                        case 5:
                            name = _a.sent();
                            return [4 /*yield*/, collateralInstance.symbol.callAsync()];
                        case 6:
                            symbol = _a.sent();
                            expect(JSON.stringify(newPoolInfo.currentSetInfo.components)).to.equal(JSON.stringify(components));
                            expect(JSON.stringify(newPoolInfo.currentSetInfo.units)).to.equal(JSON.stringify(units));
                            expect(newPoolInfo.currentSetInfo.naturalUnit).to.be.bignumber.equal(naturalUnit);
                            expect(newPoolInfo.currentSetInfo.name).to.equal(name);
                            expect(newPoolInfo.currentSetInfo.symbol).to.equal(symbol);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully gets info from RebalancingSetTokenV2', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo, currentSet, unitShares, naturalUnit, name, symbol;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.currentSet.callAsync()];
                        case 2:
                            currentSet = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.unitShares.callAsync()];
                        case 3:
                            unitShares = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.naturalUnit.callAsync()];
                        case 4:
                            naturalUnit = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.name.callAsync()];
                        case 5:
                            name = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.symbol.callAsync()];
                        case 6:
                            symbol = _a.sent();
                            expect(newPoolInfo.manager).to.equal(setManager.address);
                            expect(newPoolInfo.feeRecipient).to.equal(feeRecipient);
                            expect(newPoolInfo.currentSet).to.equal(currentSet);
                            expect(newPoolInfo.unitShares).to.be.bignumber.equal(unitShares);
                            expect(newPoolInfo.naturalUnit).to.be.bignumber.equal(naturalUnit);
                            expect(newPoolInfo.rebalanceInterval).to.be.bignumber.equal(rebalanceInterval);
                            expect(newPoolInfo.entryFee).to.be.bignumber.equal(entryFee);
                            expect(newPoolInfo.rebalanceFee).to.be.bignumber.equal(rebalanceFee);
                            expect(newPoolInfo.lastRebalanceTimestamp).to.be.bignumber.equal(lastRebalanceTimestamp);
                            expect(newPoolInfo.rebalanceState).to.be.bignumber.equal(constants_1.ZERO);
                            expect(newPoolInfo.poolName).to.equal(name);
                            expect(newPoolInfo.poolSymbol).to.equal(symbol);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('fetchNewTradingPoolV2DetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.fetchNewTradingPoolV2DetailsAsync(subjectTradingPool)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTradingPool, manager, allocatorAddress, startingBaseAssetAllocation, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, rebalanceInterval, entryFee, lastRebalanceTimestamp, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, collateralInstance, tradingPoolInstance;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var startingUSDValue, feeCalculatorAddress, failAuctionPeriod, timestamp, txHash, formattedLogs, collateralAddress, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            manager = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            liquidatorAddress = liquidator.address;
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = performanceFeeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            profitFeePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(30);
                            highWatermarkResetPeriod = constants_1.ONE_DAY_IN_SECONDS.mul(365);
                            profitFee = util_1.ether(.2);
                            streamingFee = util_1.ether(.02);
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolV2Async(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            collateralAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs, 2);
                            return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(collateralAddress, web3, constants_1.TX_DEFAULTS)];
                        case 4:
                            collateralInstance = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV3Contract.at(tradingPoolAddress, web3, constants_1.TX_DEFAULTS)];
                        case 5:
                            tradingPoolInstance = _a.sent();
                            subjectTradingPool = tradingPoolAddress;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully gets info from manager', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo, poolInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _a.sent();
                            return [4 /*yield*/, setManager.pools.callAsync(subjectTradingPool)];
                        case 2:
                            poolInfo = _a.sent();
                            expect(newPoolInfo.trader).to.equal(poolInfo.trader);
                            expect(newPoolInfo.allocator).to.equal(poolInfo.allocator);
                            expect(newPoolInfo.currentAllocation).to.be.bignumber.equal(poolInfo.currentAllocation);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully gets info from collateral Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo, components, units, naturalUnit, name, symbol;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _a.sent();
                            return [4 /*yield*/, collateralInstance.getComponents.callAsync()];
                        case 2:
                            components = _a.sent();
                            return [4 /*yield*/, collateralInstance.getUnits.callAsync()];
                        case 3:
                            units = _a.sent();
                            return [4 /*yield*/, collateralInstance.naturalUnit.callAsync()];
                        case 4:
                            naturalUnit = _a.sent();
                            return [4 /*yield*/, collateralInstance.name.callAsync()];
                        case 5:
                            name = _a.sent();
                            return [4 /*yield*/, collateralInstance.symbol.callAsync()];
                        case 6:
                            symbol = _a.sent();
                            expect(JSON.stringify(newPoolInfo.currentSetInfo.components)).to.equal(JSON.stringify(components));
                            expect(JSON.stringify(newPoolInfo.currentSetInfo.units)).to.equal(JSON.stringify(units));
                            expect(newPoolInfo.currentSetInfo.naturalUnit).to.be.bignumber.equal(naturalUnit);
                            expect(newPoolInfo.currentSetInfo.name).to.equal(name);
                            expect(newPoolInfo.currentSetInfo.symbol).to.equal(symbol);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully gets info from RebalancingSetTokenV3', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo, currentSet, unitShares, naturalUnit, name, symbol;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.currentSet.callAsync()];
                        case 2:
                            currentSet = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.unitShares.callAsync()];
                        case 3:
                            unitShares = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.naturalUnit.callAsync()];
                        case 4:
                            naturalUnit = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.name.callAsync()];
                        case 5:
                            name = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.symbol.callAsync()];
                        case 6:
                            symbol = _a.sent();
                            expect(newPoolInfo.manager).to.equal(setManager.address);
                            expect(newPoolInfo.feeRecipient).to.equal(feeRecipient);
                            expect(newPoolInfo.currentSet).to.equal(currentSet);
                            expect(newPoolInfo.unitShares).to.be.bignumber.equal(unitShares);
                            expect(newPoolInfo.naturalUnit).to.be.bignumber.equal(naturalUnit);
                            expect(newPoolInfo.rebalanceInterval).to.be.bignumber.equal(rebalanceInterval);
                            expect(newPoolInfo.entryFee).to.be.bignumber.equal(entryFee);
                            expect(newPoolInfo.lastRebalanceTimestamp).to.be.bignumber.equal(lastRebalanceTimestamp);
                            expect(newPoolInfo.rebalanceState).to.be.bignumber.equal(constants_1.ZERO);
                            expect(newPoolInfo.poolName).to.equal(name);
                            expect(newPoolInfo.poolSymbol).to.equal(symbol);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('fetches the correct RebalancingSetTokenV3/Performance Fee data', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo, _a, profitFeePeriod, highWatermarkResetPeriod, profitFeePercentage, streamingFeePercentage, highWatermark, lastProfitFeeTimestamp, lastStreamingFeeTimestamp, expectedFeeStates;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _b.sent();
                            _a = newPoolInfo.performanceFeeInfo, profitFeePeriod = _a.profitFeePeriod, highWatermarkResetPeriod = _a.highWatermarkResetPeriod, profitFeePercentage = _a.profitFeePercentage, streamingFeePercentage = _a.streamingFeePercentage, highWatermark = _a.highWatermark, lastProfitFeeTimestamp = _a.lastProfitFeeTimestamp, lastStreamingFeeTimestamp = _a.lastStreamingFeeTimestamp;
                            return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(tradingPoolInstance.address)];
                        case 2:
                            expectedFeeStates = _b.sent();
                            expect(profitFeePeriod).to.equal(expectedFeeStates.profitFeePeriod);
                            expect(highWatermarkResetPeriod).to.equal(expectedFeeStates.highWatermarkResetPeriod);
                            expect(profitFeePercentage).to.equal(expectedFeeStates.profitFeePercentage);
                            expect(streamingFeePercentage).to.equal(expectedFeeStates.streamingFeePercentage);
                            expect(highWatermark).to.equal(expectedFeeStates.highWatermark);
                            expect(lastProfitFeeTimestamp).to.equal(expectedFeeStates.lastProfitFeeTimestamp);
                            expect(lastStreamingFeeTimestamp).to.equal(expectedFeeStates.lastStreamingFeeTimestamp);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('fetches the correct PerformanceFeeCalculator address', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _a.sent();
                            expect(newPoolInfo.performanceFeeCalculatorAddress).to.equal(performanceFeeCalculator.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('fetchTradingPoolRebalanceDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.fetchTradingPoolRebalanceDetailsAsync(subjectTradingPool)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTradingPool, newAllocation, newCollateralInstance, tradingPoolInstance;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, rebalanceFee, txHash, formattedLogs, collateralAddress, collateralInstance, tradingPoolAddress, lastRebalancedTimestampSeconds, nextRebalanceAvailableAtSeconds, liquidatorData, newTxHash, newFormattedLogs, newCollateralAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            manager = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            liquidatorAddress = liquidator.address;
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, rebalanceInterval.add(1))];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 4:
                            formattedLogs = _a.sent();
                            collateralAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs, 2);
                            return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(collateralAddress, web3, constants_1.TX_DEFAULTS)];
                        case 5:
                            collateralInstance = _a.sent();
                            return [4 /*yield*/, collateralInstance.approve.sendTransactionAsync(transferProxy.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 6:
                            _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV2Contract.at(tradingPoolAddress, web3, constants_1.TX_DEFAULTS)];
                        case 7:
                            tradingPoolInstance = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.lastRebalanceTimestamp.callAsync()];
                        case 8:
                            lastRebalancedTimestampSeconds = _a.sent();
                            nextRebalanceAvailableAtSeconds = lastRebalancedTimestampSeconds.toNumber() + rebalanceInterval.toNumber();
                            timeKeeper.freeze(nextRebalanceAvailableAtSeconds * 1000);
                            helpers_1.increaseChainTimeAsync(web3, rebalanceInterval.add(1));
                            subjectTradingPool = tradingPoolAddress;
                            return [4 /*yield*/, core.issue.sendTransactionAsync(collateralAddress, util_1.ether(2), { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 9:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(subjectTradingPool, util_1.ether(2), { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 10:
                            _a.sent();
                            liquidatorData = '0x';
                            newAllocation = util_1.ether(.37);
                            return [4 /*yield*/, socialTradingAPI.updateAllocationAsync(setManager.address, subjectTradingPool, newAllocation, liquidatorData, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 11:
                            newTxHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, newTxHash)];
                        case 12:
                            newFormattedLogs = _a.sent();
                            newCollateralAddress = util_1.extractNewSetTokenAddressFromLogs(newFormattedLogs, 2);
                            return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(newCollateralAddress, web3, constants_1.TX_DEFAULTS)];
                        case 13:
                            newCollateralInstance = _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully gets info from manager', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo, poolInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _a.sent();
                            return [4 /*yield*/, setManager.pools.callAsync(subjectTradingPool)];
                        case 2:
                            poolInfo = _a.sent();
                            expect(newPoolInfo.trader).to.equal(poolInfo.trader);
                            expect(newPoolInfo.allocator).to.equal(poolInfo.allocator);
                            expect(newPoolInfo.currentAllocation).to.be.bignumber.equal(poolInfo.currentAllocation);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully gets info from collateral Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo, components, units, naturalUnit, name, symbol;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _a.sent();
                            return [4 /*yield*/, newCollateralInstance.getComponents.callAsync()];
                        case 2:
                            components = _a.sent();
                            return [4 /*yield*/, newCollateralInstance.getUnits.callAsync()];
                        case 3:
                            units = _a.sent();
                            return [4 /*yield*/, newCollateralInstance.naturalUnit.callAsync()];
                        case 4:
                            naturalUnit = _a.sent();
                            return [4 /*yield*/, newCollateralInstance.name.callAsync()];
                        case 5:
                            name = _a.sent();
                            return [4 /*yield*/, newCollateralInstance.symbol.callAsync()];
                        case 6:
                            symbol = _a.sent();
                            expect(JSON.stringify(newPoolInfo.nextSetInfo.components)).to.equal(JSON.stringify(components));
                            expect(JSON.stringify(newPoolInfo.nextSetInfo.units)).to.equal(JSON.stringify(units));
                            expect(newPoolInfo.nextSetInfo.naturalUnit).to.be.bignumber.equal(naturalUnit);
                            expect(newPoolInfo.nextSetInfo.name).to.equal(name);
                            expect(newPoolInfo.nextSetInfo.symbol).to.equal(symbol);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully gets info from RebalancingSetTokenV2', function () { return __awaiter(_this, void 0, void 0, function () {
                var newPoolInfo, auctionParams, startingCurrentSets, biddingParams;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            newPoolInfo = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.getAuctionPriceParameters.callAsync()];
                        case 2:
                            auctionParams = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.startingCurrentSetAmount.callAsync()];
                        case 3:
                            startingCurrentSets = _a.sent();
                            return [4 /*yield*/, tradingPoolInstance.getBiddingParameters.callAsync()];
                        case 4:
                            biddingParams = _a.sent();
                            expect(newPoolInfo.liquidator).to.equal(liquidator.address);
                            expect(newPoolInfo.nextSet).to.equal(newCollateralInstance.address);
                            expect(newPoolInfo.rebalanceStartTime).to.be.bignumber.equal(auctionParams[0]);
                            expect(newPoolInfo.timeToPivot).to.be.bignumber.equal(auctionParams[1]);
                            expect(newPoolInfo.startPrice).to.be.bignumber.equal(auctionParams[2]);
                            expect(newPoolInfo.endPrice).to.be.bignumber.equal(auctionParams[3]);
                            expect(newPoolInfo.startingCurrentSets).to.be.bignumber.equal(startingCurrentSets);
                            expect(newPoolInfo.remainingCurrentSets).to.be.bignumber.equal(biddingParams[1]);
                            expect(newPoolInfo.minimumBid).to.be.bignumber.equal(biddingParams[0]);
                            expect(newPoolInfo.rebalanceState).to.be.bignumber.equal(new util_1.BigNumber(2));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('initiateEntryFeeChangeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.initiateEntryFeeChangeAsync(subjectManager, subjectTradingPool, subjectNewEntryFee, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewEntryFee, subjectCaller, maxFee;
        var _this = this;
        return __generator(this, function (_a) {
            maxFee = util_1.ether(.1);
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, rebalanceFee, txHash, formattedLogs, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, { from: subjectCaller })];
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
            describe('when the caller is not the trader', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Caller " + subjectCaller + " is not trader of tradingPool.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the fee exceeds the entry fee', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectNewEntryFee = util_1.ether(.15);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided fee " + subjectNewEntryFee + " is not less than max fee, " + maxFee.toString() + ".")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the passed entryFee is not a multiple of 1 basis point', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectNewEntryFee = util_1.ether(.00011);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Provided fee " + subjectNewEntryFee.toString() + " is not multiple of one basis point (10 ** 14)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('finalizeEntryFeeChangeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.finalizeEntryFeeChangeAsync(subjectManager, subjectTradingPool, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectCaller, isInitiated, newEntryFee, realTimeFallback;
        var _this = this;
        return __generator(this, function (_a) {
            isInitiated = true;
            realTimeFallback = 0;
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, rebalanceFee, txHash, formattedLogs, tradingPoolAddress, poolInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, { from: subjectCaller })];
                        case 2:
                            txHash = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                        case 3:
                            formattedLogs = _a.sent();
                            tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            if (!isInitiated) return [3 /*break*/, 5];
                            newEntryFee = util_1.ether(.02);
                            return [4 /*yield*/, socialTradingAPI.initiateEntryFeeChangeAsync(setManager.address, tradingPoolAddress, newEntryFee, { from: subjectCaller })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [4 /*yield*/, setManager.pools.callAsync(tradingPoolAddress)];
                        case 6:
                            poolInfo = _a.sent();
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                        case 7:
                            _a.sent();
                            timeKeeper.freeze((poolInfo.feeUpdateTimestamp - realTimeFallback) * 1000);
                            subjectManager = setManager.address;
                            subjectTradingPool = tradingPoolAddress;
                            return [2 /*return*/];
                    }
                });
            }); });
            afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    timeKeeper.reset();
                    return [2 /*return*/];
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
            describe('when the caller is not the trader', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Caller " + subjectCaller + " is not trader of tradingPool.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the fee update process has not been initiated', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            isInitiated = false;
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            isInitiated = true;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Must call initiateEntryFeeChange first to start fee update process.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when timelock period has not elapsed', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            realTimeFallback = 10;
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            realTimeFallback = 0;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var poolInfo, formattedDate;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, setManager.pools.callAsync(subjectTradingPool)];
                                case 1:
                                    poolInfo = _a.sent();
                                    formattedDate = moment(parseInt(poolInfo.feeUpdateTimestamp) * 1000)
                                        .format('dddd, MMMM Do YYYY, h:mm:ss a');
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Attempting to finalize fee update too soon. Update available at " + formattedDate)];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('setTraderAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.setTraderAsync(subjectManager, subjectTradingPool, subjectNewTrader, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewTrader, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, rebalanceFee, txHash, formattedLogs, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, { from: subjectCaller })];
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
            describe('when the caller is not the trader', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Caller " + subjectCaller + " is not trader of tradingPool.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('setLiquidatorAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.setLiquidatorAsync(subjectManager, subjectTradingPool, subjectNewLiquidator, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewLiquidator, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, rebalanceFee, txHash, formattedLogs, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, { from: subjectCaller })];
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
            describe('when the caller is not the trader', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Caller " + subjectCaller + " is not trader of tradingPool.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('setFeeRecipientAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.setFeeRecipientAsync(subjectManager, subjectTradingPool, subjectNewFeeRecipient, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewFeeRecipient, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, rebalanceFee, txHash, formattedLogs, tradingPoolAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, { from: subjectCaller })];
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
            describe('when the caller is not the trader', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Caller " + subjectCaller + " is not trader of tradingPool.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('batchFetchTradingPoolOperatorAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.batchFetchTradingPoolOperatorAsync(subjectTradingPools)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTradingPools, traderOne, traderTwo;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, rebalanceFee, txHashOne, formattedLogsOne, tradingPoolAddressOne, txHashTwo, formattedLogs, tradingPoolAddressTwo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            rebalanceFee = util_1.ether(.01);
                            traderOne = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, { from: traderOne })];
                        case 2:
                            txHashOne = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHashOne)];
                        case 3:
                            formattedLogsOne = _a.sent();
                            tradingPoolAddressOne = util_1.extractNewSetTokenAddressFromLogs(formattedLogsOne);
                            traderTwo = accounts_1.ACCOUNTS[2].address;
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee, { from: traderTwo })];
                        case 4:
                            txHashTwo = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHashTwo)];
                        case 5:
                            formattedLogs = _a.sent();
                            tradingPoolAddressTwo = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            subjectTradingPools = [tradingPoolAddressOne, tradingPoolAddressTwo];
                            return [2 /*return*/];
                    }
                });
            }); });
            test('fetches the correct operator addresses', function () { return __awaiter(_this, void 0, void 0, function () {
                var operators, expectedOperators;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            operators = _a.sent();
                            expectedOperators = [traderOne, traderTwo];
                            expect(JSON.stringify(operators)).to.equal(JSON.stringify(expectedOperators));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('batchFetchTradingPoolEntryFeesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.batchFetchTradingPoolEntryFeesAsync(subjectTradingPools)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTradingPools, entryFeeOne, entryFeeTwo;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, rebalanceFee, trader, txHashOne, formattedLogsOne, tradingPoolAddressOne, txHashTwo, formattedLogs, tradingPoolAddressTwo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            rebalanceFee = util_1.ether(.01);
                            trader = accounts_1.DEFAULT_ACCOUNT;
                            entryFeeOne = util_1.ether(.01);
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFeeOne, rebalanceFee, { from: trader })];
                        case 2:
                            txHashOne = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHashOne)];
                        case 3:
                            formattedLogsOne = _a.sent();
                            tradingPoolAddressOne = util_1.extractNewSetTokenAddressFromLogs(formattedLogsOne);
                            entryFeeTwo = util_1.ether(.02);
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFeeTwo, rebalanceFee, { from: trader })];
                        case 4:
                            txHashTwo = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHashTwo)];
                        case 5:
                            formattedLogs = _a.sent();
                            tradingPoolAddressTwo = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            subjectTradingPools = [tradingPoolAddressOne, tradingPoolAddressTwo];
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully updates tradingPool feeRecipient', function () { return __awaiter(_this, void 0, void 0, function () {
                var entryFees, expectedEntryFees;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            entryFees = _a.sent();
                            expectedEntryFees = [entryFeeOne, entryFeeTwo];
                            expect(JSON.stringify(entryFees)).to.equal(JSON.stringify(expectedEntryFees));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('batchFetchTradingPoolRebalanceFeesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.batchFetchTradingPoolRebalanceFeesAsync(subjectTradingPools)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTradingPools, rebalanceFeeOne, rebalanceFeeTwo;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, trader, txHashOne, formattedLogsOne, tradingPoolAddressOne, txHashTwo, formattedLogs, tradingPoolAddressTwo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = feeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            trader = accounts_1.DEFAULT_ACCOUNT;
                            rebalanceFeeOne = util_1.ether(.01);
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFeeOne, { from: trader })];
                        case 2:
                            txHashOne = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHashOne)];
                        case 3:
                            formattedLogsOne = _a.sent();
                            tradingPoolAddressOne = util_1.extractNewSetTokenAddressFromLogs(formattedLogsOne);
                            rebalanceFeeTwo = util_1.ether(.02);
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolAsync(setManager.address, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidator.address, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, rebalanceFeeTwo, { from: trader })];
                        case 4:
                            txHashTwo = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHashTwo)];
                        case 5:
                            formattedLogs = _a.sent();
                            tradingPoolAddressTwo = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            subjectTradingPools = [tradingPoolAddressOne, tradingPoolAddressTwo];
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully updates tradingPool feeRecipient', function () { return __awaiter(_this, void 0, void 0, function () {
                var rebalanceFees, expectedRebalanceFees;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            rebalanceFees = _a.sent();
                            expectedRebalanceFees = [rebalanceFeeOne, rebalanceFeeTwo];
                            expect(JSON.stringify(rebalanceFees)).to.equal(JSON.stringify(expectedRebalanceFees));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('batchFetchTradingPoolAccumulationAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, subjectIncreaseChainTime)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.mineBlockAsync(web3)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, socialTradingAPI.batchFetchTradingPoolAccumulationAsync(subjectTradingPools)];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTradingPools, profitFeeOne, streamingFeeOne, profitFeeTwo, streamingFeeTwo, tradingPoolInstanceOne, tradingPoolInstanceTwo, subjectIncreaseChainTime;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, txHashOne, formattedLogsOne, tradingPoolAddressOne, txHashTwo, formattedLogsTwo, tradingPoolAddressTwo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            manager = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            liquidatorAddress = liquidator.address;
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = performanceFeeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            profitFeePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(30);
                            highWatermarkResetPeriod = constants_1.ONE_DAY_IN_SECONDS.mul(365);
                            profitFeeOne = util_1.ether(.3);
                            streamingFeeOne = util_1.ether(.04);
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolV2Async(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFeeOne, streamingFeeOne, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 2:
                            txHashOne = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHashOne)];
                        case 3:
                            formattedLogsOne = _a.sent();
                            tradingPoolAddressOne = util_1.extractNewSetTokenAddressFromLogs(formattedLogsOne);
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV3Contract.at(tradingPoolAddressOne, web3, constants_1.TX_DEFAULTS)];
                        case 4:
                            tradingPoolInstanceOne = _a.sent();
                            profitFeeTwo = util_1.ether(.2);
                            streamingFeeTwo = util_1.ether(.02);
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolV2Async(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFeeTwo, streamingFeeTwo, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 5:
                            txHashTwo = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHashTwo)];
                        case 6:
                            formattedLogsTwo = _a.sent();
                            tradingPoolAddressTwo = util_1.extractNewSetTokenAddressFromLogs(formattedLogsTwo);
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV3Contract.at(tradingPoolAddressTwo, web3, constants_1.TX_DEFAULTS)];
                        case 7:
                            tradingPoolInstanceTwo = _a.sent();
                            subjectTradingPools = [tradingPoolInstanceOne.address, tradingPoolInstanceTwo.address];
                            subjectIncreaseChainTime = constants_1.ONE_YEAR_IN_SECONDS;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('fetches the correct profit/streaming fee accumulation array', function () { return __awaiter(_this, void 0, void 0, function () {
                var feeState1, feeState2, actualAccumulationArray, lastBlock, rebalancingSetValue1, rebalancingSetValue2, expectedStreamingFee1, expectedStreamingFee2, expectedProfitFee1, expectedProfitFee2, expectedAccumulationArray;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(tradingPoolInstanceOne.address)];
                        case 1:
                            feeState1 = _a.sent();
                            return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(tradingPoolInstanceTwo.address)];
                        case 2:
                            feeState2 = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 3:
                            actualAccumulationArray = _a.sent();
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 4:
                            lastBlock = _a.sent();
                            return [4 /*yield*/, valuationHelper.calculateRebalancingSetTokenValueAsync(tradingPoolInstanceOne, oracleWhiteList)];
                        case 5:
                            rebalancingSetValue1 = _a.sent();
                            return [4 /*yield*/, valuationHelper.calculateRebalancingSetTokenValueAsync(tradingPoolInstanceTwo, oracleWhiteList)];
                        case 6:
                            rebalancingSetValue2 = _a.sent();
                            return [4 /*yield*/, feeCalculatorHelper.calculateAccruedStreamingFee(feeState1.streamingFeePercentage, new util_1.BigNumber(lastBlock.timestamp).sub(feeState1.lastStreamingFeeTimestamp))];
                        case 7:
                            expectedStreamingFee1 = _a.sent();
                            return [4 /*yield*/, feeCalculatorHelper.calculateAccruedStreamingFee(feeState2.streamingFeePercentage, new util_1.BigNumber(lastBlock.timestamp).sub(feeState2.lastStreamingFeeTimestamp))];
                        case 8:
                            expectedStreamingFee2 = _a.sent();
                            return [4 /*yield*/, feeCalculatorHelper.calculateAccruedProfitFeeAsync(feeState1, rebalancingSetValue1, new util_1.BigNumber(lastBlock.timestamp))];
                        case 9:
                            expectedProfitFee1 = _a.sent();
                            return [4 /*yield*/, feeCalculatorHelper.calculateAccruedProfitFeeAsync(feeState2, rebalancingSetValue2, new util_1.BigNumber(lastBlock.timestamp))];
                        case 10:
                            expectedProfitFee2 = _a.sent();
                            expectedAccumulationArray = [
                                {
                                    streamingFee: expectedStreamingFee1,
                                    profitFee: expectedProfitFee1,
                                },
                                {
                                    streamingFee: expectedStreamingFee2,
                                    profitFee: expectedProfitFee2,
                                },
                            ];
                            expect(JSON.stringify(actualAccumulationArray)).to.equal(JSON.stringify(expectedAccumulationArray));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('batchFetchTradingPoolFeeStateAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, subjectIncreaseChainTime)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.mineBlockAsync(web3)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, socialTradingAPI.batchFetchTradingPoolFeeStateAsync(subjectTradingPools)];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTradingPools, tradingPoolInstanceOne, tradingPoolInstanceTwo, subjectIncreaseChainTime;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, txHashOne, formattedLogsOne, tradingPoolAddressOne, txHashTwo, formattedLogsTwo, tradingPoolAddressTwo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            manager = setManager.address;
                            allocatorAddress = allocator.address;
                            startingBaseAssetAllocation = util_1.ether(0.72);
                            startingUSDValue = util_1.ether(100);
                            tradingPoolName = 'CoolPool';
                            tradingPoolSymbol = 'COOL';
                            liquidatorAddress = liquidator.address;
                            feeRecipient = accounts_1.DEFAULT_ACCOUNT;
                            feeCalculatorAddress = performanceFeeCalculator.address;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            failAuctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 1:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            entryFee = util_1.ether(.01);
                            profitFeePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(30);
                            highWatermarkResetPeriod = constants_1.ONE_DAY_IN_SECONDS.mul(365);
                            profitFee = util_1.ether(.2);
                            streamingFee = util_1.ether(.02);
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolV2Async(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 2:
                            txHashOne = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHashOne)];
                        case 3:
                            formattedLogsOne = _a.sent();
                            tradingPoolAddressOne = util_1.extractNewSetTokenAddressFromLogs(formattedLogsOne);
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV3Contract.at(tradingPoolAddressOne, web3, constants_1.TX_DEFAULTS)];
                        case 4:
                            tradingPoolInstanceOne = _a.sent();
                            return [4 /*yield*/, socialTradingAPI.createTradingPoolV2Async(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculatorAddress, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 5:
                            txHashTwo = _a.sent();
                            return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHashTwo)];
                        case 6:
                            formattedLogsTwo = _a.sent();
                            tradingPoolAddressTwo = util_1.extractNewSetTokenAddressFromLogs(formattedLogsTwo);
                            return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenV3Contract.at(tradingPoolAddressTwo, web3, constants_1.TX_DEFAULTS)];
                        case 7:
                            tradingPoolInstanceTwo = _a.sent();
                            subjectTradingPools = [tradingPoolInstanceOne.address, tradingPoolInstanceTwo.address];
                            subjectIncreaseChainTime = constants_1.ONE_YEAR_IN_SECONDS;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('fetches the correct profit/streaming fee accumulation array', function () { return __awaiter(_this, void 0, void 0, function () {
                var tradingPoolFeeStates, firstFeeState, secondFeeState, expectedFeeStateInfo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            tradingPoolFeeStates = _a.sent();
                            return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(tradingPoolInstanceOne.address)];
                        case 2:
                            firstFeeState = _a.sent();
                            return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(tradingPoolInstanceTwo.address)];
                        case 3:
                            secondFeeState = _a.sent();
                            expectedFeeStateInfo = _.map([firstFeeState, secondFeeState], function (feeStates) {
                                return [
                                    feeStates.profitFeePeriod,
                                    feeStates.highWatermarkResetPeriod,
                                    feeStates.profitFeePercentage,
                                    feeStates.streamingFeePercentage,
                                    feeStates.highWatermark,
                                    feeStates.lastProfitFeeTimestamp,
                                    feeStates.lastStreamingFeeTimestamp,
                                ];
                            });
                            expect(JSON.stringify(tradingPoolFeeStates)).to.equal(JSON.stringify(expectedFeeStateInfo));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('fetchEntryFeeEventsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.fetchEntryFeeEventsAsync(subjectRebalancingSetTokenV2, subjectFromBlock, subjectToBlock, subjectGetTimestamp)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var issueOneTransactionHash, issueOneBlockNumber, issueOneBlockTimestamp, subjectFromBlock, subjectToBlock, subjectRebalancingSetTokenV2, subjectGetTimestamp, rebalancingSetQuantityToIssue1, rebalancingSetQuantityToIssue2, rbSetFeeRecipient, rbSetEntryFee, rbSetRebalanceFee, setToken, rebalancingSetToken;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokenComponents, setTokenUnits, naturalUnit, managerAddress, rebalanceFeeCalculator, failRebalancePeriod, timestamp, lastRebalanceTimestamp, lastTxnHash, issueOneTransaction, issueOneBlock, earlyBlockNumber, lastTransaction, recentIssueBlockNumber;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setTokenComponents = [wrappedBTC.address, wrappedETH.address];
                            setTokenUnits = [initialEthPrice.div(1e18), initialBtcPrice.div(1e18)];
                            naturalUnit = new util_1.BigNumber(1e10);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, setTokenComponents, setTokenUnits, naturalUnit)];
                        case 1:
                            setToken = _a.sent();
                            managerAddress = accounts_1.DEFAULT_ACCOUNT;
                            rbSetFeeRecipient = accounts_1.ACCOUNTS[2].address;
                            rebalanceFeeCalculator = feeCalculator.address;
                            failRebalancePeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 2:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            rbSetEntryFee = util_1.ether(.01);
                            rbSetRebalanceFee = util_1.ether(.02);
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenV2Async(web3, core, rebalancingFactory.address, managerAddress, liquidator.address, rbSetFeeRecipient, rebalanceFeeCalculator, setToken.address, failRebalancePeriod, lastRebalanceTimestamp, rbSetEntryFee, rbSetRebalanceFee)];
                        case 3:
                            rebalancingSetToken = _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([setToken], transferProxy.address)];
                        case 5:
                            _a.sent();
                            rebalancingSetQuantityToIssue1 = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1)];
                        case 6:
                            issueOneTransactionHash = _a.sent();
                            // Issue setToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 7:
                            // Issue setToken
                            _a.sent();
                            rebalancingSetQuantityToIssue2 = util_1.ether(1);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue2)];
                        case 8:
                            lastTxnHash = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(issueOneTransactionHash)];
                        case 9:
                            issueOneTransaction = _a.sent();
                            issueOneBlockNumber = issueOneTransaction['blockNumber'];
                            return [4 /*yield*/, web3.eth.getBlock(issueOneBlockNumber)];
                        case 10:
                            issueOneBlock = _a.sent();
                            issueOneBlockTimestamp = issueOneBlock.timestamp;
                            earlyBlockNumber = issueOneTransaction['blockNumber'];
                            return [4 /*yield*/, web3.eth.getTransaction(lastTxnHash)];
                        case 11:
                            lastTransaction = _a.sent();
                            recentIssueBlockNumber = lastTransaction['blockNumber'];
                            subjectFromBlock = earlyBlockNumber;
                            subjectToBlock = recentIssueBlockNumber;
                            subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
                            subjectGetTimestamp = true;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('retrieves the right event logs length', function () { return __awaiter(_this, void 0, void 0, function () {
                var events;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _a.sent();
                            expect(events.length).to.equal(2);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('retrieves the correct first log EntryFeePaid properties', function () { return __awaiter(_this, void 0, void 0, function () {
                var events, firstEvent, expectedFee;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _a.sent();
                            firstEvent = events[0];
                            expectedFee = rebalancingSetQuantityToIssue1.mul(rbSetEntryFee).div(1e18);
                            expect(issueOneTransactionHash).to.equal(firstEvent.transactionHash);
                            expect(rbSetFeeRecipient).to.equal(firstEvent.feeRecipient);
                            expect(expectedFee).to.bignumber.equal(firstEvent.feeQuantity);
                            expect(issueOneBlockTimestamp).to.equal(firstEvent.timestamp);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('fetchRebalanceFeePaidEventsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingAPI.fetchRebalanceFeePaidEventsAsync(subjectRebalancingSetTokenV2, subjectFromBlock, subjectToBlock, subjectGetTimestamp)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var earlyTxnHash, earlyBlockNumber, lastTransactionTimestamp, subjectFromBlock, subjectToBlock, subjectRebalancingSetTokenV2, subjectGetTimestamp, rebalancingSetQuantityToIssue1, currentSetQuantity, nextSetToken, liquidatorData, rbSetFeeRecipient, rbSetEntryFee, rbSetRebalanceFee, setToken, rebalancingSetToken;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokenComponents1, setTokenUnits1, naturalUnit1, managerAddress, rebalanceFeeCalculator, failRebalancePeriod, timestamp, lastRebalanceTimestamp, earlyTransaction, setTokenComponents2, setTokenUnits2, naturalUnit3, lastTxnHash, lastTransaction, recentIssueBlockNumber, lastTxnBlock;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setTokenComponents1 = [wrappedETH.address, wrappedBTC.address];
                            setTokenUnits1 = [initialBtcPrice.mul(1e10).div(initialEthPrice).round(0, 3), new util_1.BigNumber(1)];
                            naturalUnit1 = new util_1.BigNumber(1e10);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, setTokenComponents1, setTokenUnits1, naturalUnit1)];
                        case 1:
                            setToken = _a.sent();
                            managerAddress = accounts_1.DEFAULT_ACCOUNT;
                            rbSetFeeRecipient = accounts_1.ACCOUNTS[2].address;
                            rebalanceFeeCalculator = feeCalculator.address;
                            failRebalancePeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 2:
                            timestamp = (_a.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            rbSetEntryFee = util_1.ether(.01);
                            rbSetRebalanceFee = util_1.ether(.02);
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenV2Async(web3, core, rebalancingFactory.address, managerAddress, liquidator.address, rbSetFeeRecipient, rebalanceFeeCalculator, setToken.address, failRebalancePeriod, lastRebalanceTimestamp, rbSetEntryFee, rbSetRebalanceFee)];
                        case 3:
                            rebalancingSetToken = _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 4:
                            earlyTxnHash = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([setToken], transferProxy.address)];
                        case 5:
                            _a.sent();
                            rebalancingSetQuantityToIssue1 = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1)];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(earlyTxnHash)];
                        case 7:
                            earlyTransaction = _a.sent();
                            earlyBlockNumber = earlyTransaction['blockNumber'];
                            setTokenComponents2 = [wrappedETH.address, wrappedBTC.address];
                            setTokenUnits2 = [initialBtcPrice.mul(1e10).div(initialEthPrice).round(0, 3), new util_1.BigNumber(3)];
                            naturalUnit3 = new util_1.BigNumber(1e10);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, setTokenComponents2, setTokenUnits2, naturalUnit3)];
                        case 8:
                            nextSetToken = _a.sent();
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS.add(1))];
                        case 9:
                            _a.sent();
                            liquidatorData = '0x00';
                            return [4 /*yield*/, rebalancingSetToken.startRebalance.sendTransactionAsync(nextSetToken.address, liquidatorData, constants_1.TX_DEFAULTS)];
                        case 10:
                            _a.sent();
                            currentSetQuantity = rebalancingSetQuantityToIssue1
                                .mul(constants_1.DEFAULT_UNIT_SHARES)
                                .div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                            return [4 /*yield*/, rebalanceAuctionModule.bid.sendTransactionAsync(rebalancingSetToken.address, currentSetQuantity, true, constants_1.TX_DEFAULTS)];
                        case 11:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.settleRebalance.sendTransactionAsync(constants_1.TX_DEFAULTS)];
                        case 12:
                            lastTxnHash = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(lastTxnHash)];
                        case 13:
                            lastTransaction = _a.sent();
                            recentIssueBlockNumber = lastTransaction['blockNumber'];
                            return [4 /*yield*/, web3.eth.getBlock(recentIssueBlockNumber)];
                        case 14:
                            lastTxnBlock = _a.sent();
                            lastTransactionTimestamp = lastTxnBlock.timestamp;
                            subjectFromBlock = earlyBlockNumber;
                            subjectToBlock = recentIssueBlockNumber;
                            subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
                            subjectGetTimestamp = true;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('retrieves the right event logs length', function () { return __awaiter(_this, void 0, void 0, function () {
                var events;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _a.sent();
                            expect(events.length).to.equal(1);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('retrieves the correct first log RebalanceSettled properties', function () { return __awaiter(_this, void 0, void 0, function () {
                var events, firstEvent, expectedFeeQuantity;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _a.sent();
                            firstEvent = events[0];
                            expect(firstEvent.feeRecipient).to.equal(rbSetFeeRecipient);
                            expect(firstEvent.rebalanceIndex).to.bignumber.equal(0);
                            expectedFeeQuantity = rebalancingSetQuantityToIssue1
                                .mul(rbSetRebalanceFee)
                                .div(new util_1.BigNumber(1e18).sub(rbSetRebalanceFee)).round(0, 3);
                            expect(firstEvent.feeQuantity).to.bignumber.equal(expectedFeeQuantity);
                            expect(firstEvent.timestamp).to.equal(lastTransactionTimestamp);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=SocialTradingAPI.spec.js.map