/*
  Copyright 2020 Set Labs Inc.

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
var api_1 = require("@src/api");
var wrappers_1 = require("@src/wrappers");
var constants_1 = require("@src/constants");
var helpers_1 = require("@test/helpers");
var util_1 = require("@src/util");
var assertions_1 = require("@src/assertions");
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
describe('SocialTradingManagerV2Wrapper', function () {
    var core;
    var transferProxy;
    var factory;
    var rebalancingComponentWhiteList;
    var wrappedBTC;
    var wrappedETH;
    var liquidator;
    var performanceFeeCalculator;
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
    var tradingPoolAddress;
    var socialTradingManagerWrapper;
    var feeCalculatorHelper = new set_protocol_contracts_1.FeeCalculatorHelper(accounts_1.DEFAULT_ACCOUNT);
    var setProtocolConfig = {
        coreAddress: accounts_1.NULL_ADDRESS,
        transferProxyAddress: accounts_1.NULL_ADDRESS,
        vaultAddress: accounts_1.NULL_ADDRESS,
        setTokenFactoryAddress: accounts_1.NULL_ADDRESS,
        rebalancingSetTokenFactoryAddress: accounts_1.NULL_ADDRESS,
        kyberNetworkWrapperAddress: accounts_1.NULL_ADDRESS,
        rebalanceAuctionModuleAddress: accounts_1.NULL_ADDRESS,
        exchangeIssuanceModuleAddress: accounts_1.NULL_ADDRESS,
        rebalancingSetIssuanceModule: accounts_1.NULL_ADDRESS,
        rebalancingSetEthBidderAddress: accounts_1.NULL_ADDRESS,
        rebalancingSetExchangeIssuanceModule: accounts_1.NULL_ADDRESS,
        wrappedEtherAddress: accounts_1.NULL_ADDRESS,
        protocolViewerAddress: accounts_1.NULL_ADDRESS,
    };
    var assertions = new assertions_1.Assertions(web3);
    var socialTradingAPI = new api_1.SocialTradingAPI(web3, assertions, setProtocolConfig);
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var maxProfitFeePercentage, maxStreamingFeePercentage, collateralName, collateralSymbol, manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, timestamp, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, trader, txHash, formattedLogs;
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
                    maxProfitFeePercentage = util_1.ether(.4);
                    maxStreamingFeePercentage = util_1.ether(.07);
                    return [4 /*yield*/, feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(core.address, oracleWhiteList.address, maxProfitFeePercentage, maxStreamingFeePercentage)];
                case 12:
                    performanceFeeCalculator = _c.sent();
                    return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [performanceFeeCalculator.address])];
                case 13:
                    feeCalculatorWhiteList = _c.sent();
                    return [4 /*yield*/, helpers_1.deployRebalancingSetTokenV3FactoryContractAsync(web3, core, rebalancingComponentWhiteList, liquidatorWhiteList, feeCalculatorWhiteList)];
                case 14:
                    rebalancingFactory = _c.sent();
                    pricePrecision = new util_1.BigNumber(100);
                    collateralName = SetUtils.stringToBytes('Collateral');
                    collateralSymbol = SetUtils.stringToBytes('COL');
                    return [4 /*yield*/, helpers_1.deploySocialAllocatorAsync(web3, wrappedETH.address, wrappedBTC.address, oracleWhiteList.address, core.address, factory.address, pricePrecision, collateralName, collateralSymbol)];
                case 15:
                    allocator = _c.sent();
                    return [4 /*yield*/, helpers_1.deploySocialTradingManagerV2Async(web3, core.address, rebalancingFactory.address, [allocator.address])];
                case 16:
                    setManager = _c.sent();
                    return [4 /*yield*/, setManager.setTimeLockPeriod.sendTransactionAsync(constants_1.ONE_DAY_IN_SECONDS)];
                case 17:
                    _c.sent();
                    socialTradingManagerWrapper = new wrappers_1.SocialTradingManagerV2Wrapper(web3);
                    manager = setManager.address;
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
                case 18:
                    timestamp = (_c.sent()).timestamp;
                    lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                    entryFee = util_1.ether(.0001);
                    profitFeePeriod = constants_1.ONE_DAY_IN_SECONDS.mul(30);
                    highWatermarkResetPeriod = constants_1.ONE_DAY_IN_SECONDS.mul(365);
                    profitFee = util_1.ether(.2);
                    streamingFee = util_1.ether(.02);
                    trader = accounts_1.DEFAULT_ACCOUNT;
                    return [4 /*yield*/, socialTradingAPI.createTradingPoolV2Async(manager, allocatorAddress, startingBaseAssetAllocation, startingUSDValue, tradingPoolName, tradingPoolSymbol, liquidatorAddress, feeRecipient, feeCalculator, rebalanceInterval, failAuctionPeriod, lastRebalanceTimestamp, entryFee, profitFeePeriod, highWatermarkResetPeriod, profitFee, streamingFee, { from: trader })];
                case 19:
                    txHash = _c.sent();
                    return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, txHash)];
                case 20:
                    formattedLogs = _c.sent();
                    tradingPoolAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs, 1);
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
    describe('adjustFee', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingManagerWrapper.adjustFee(subjectManager, subjectTradingPool, subjectNewFeeCallData, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectNewFeeCallData, subjectCaller, feeType, feePercentage;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    feeType = constants_1.ZERO;
                    feePercentage = util_1.ether(.03);
                    subjectManager = setManager.address;
                    subjectTradingPool = tradingPoolAddress;
                    subjectNewFeeCallData = SetUtils.generateAdjustFeeCallData(feeType, feePercentage);
                    subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                    return [2 /*return*/];
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
                            return [4 /*yield*/, setManager.upgradeIdentifier.callAsync(subjectTradingPool)];
                        case 3:
                            upgradeIdentifier = _a.sent();
                            expect(upgradeIdentifier).to.equal(upgradeHash);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('removeRegisteredUpgrade', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, socialTradingManagerWrapper.removeRegisteredUpgrade(subjectManager, subjectTradingPool, subjectUpgradeHash, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManager, subjectTradingPool, subjectUpgradeHash, subjectCaller, feeType, feePercentage;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var newFeeCallData, txHash, input;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            feeType = constants_1.ZERO;
                            feePercentage = util_1.ether(.03);
                            subjectManager = setManager.address;
                            subjectTradingPool = tradingPoolAddress;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            newFeeCallData = SetUtils.generateAdjustFeeCallData(feeType, feePercentage);
                            return [4 /*yield*/, socialTradingManagerWrapper.adjustFee(subjectManager, subjectTradingPool, newFeeCallData, { from: subjectCaller })];
                        case 1:
                            txHash = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(txHash)];
                        case 2:
                            input = (_a.sent()).input;
                            subjectUpgradeHash = web3.utils.soliditySha3(input);
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
                            return [4 /*yield*/, setManager.upgradeIdentifier.callAsync(subjectTradingPool)];
                        case 2:
                            upgradeIdentifier = _a.sent();
                            expect(upgradeIdentifier).to.equal(constants_1.ZERO_BYTES);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=SocialTradingManagerV2Wrapper.spec.js.map