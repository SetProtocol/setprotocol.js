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
var timeKeeper = require('timekeeper');
var moment = require('moment');
var ABIDecoder = __importStar(require("abi-decoder"));
var chai = __importStar(require("chai"));
var setProtocolUtils = __importStar(require("set-protocol-utils"));
var web3_1 = __importDefault(require("web3"));
var set_protocol_contracts_1 = require("set-protocol-contracts");
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
var accounts_1 = require("@src/constants/accounts");
var assertions_1 = require("@src/assertions");
var api_1 = require("@src/api");
var constants_1 = require("@src/constants");
var helpers_1 = require("@test/helpers");
var util_1 = require("@src/util");
var wrappers_1 = require("@src/wrappers");
chaiSetup_1.default.configure();
var chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(util_1.BigNumber));
var expect = chai.expect;
var contract = require('truffle-contract');
var web3 = new web3_1.default('http://localhost:8545');
var SetTestUtils = setProtocolUtils.SetProtocolTestUtils, Web3Utils = setProtocolUtils.Web3Utils;
var web3Utils = new Web3Utils(web3);
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('MACOManagerAPI', function () {
    var core;
    var transferProxy;
    var factory;
    var rebalancingFactory;
    var constantAuctionPriceCurve;
    var macoManager;
    var movingAverageOracle;
    var ethMedianizer;
    var usdc;
    var wrappedETH;
    var whitelist;
    var initialStableCollateral;
    var initialRiskCollateral;
    var rebalancingSetToken;
    var auctionTimeToPivot;
    var crossoverConfirmationMinTime;
    var crossoverConfirmationMaxTime;
    var priceFeedUpdateFrequency = new util_1.BigNumber(10);
    var initialMedianizerEthPrice = constants_1.E18;
    var priceFeedDataDescription = '200DailyETHPrice';
    var seededPriceFeedPrices = [
        constants_1.E18.mul(1),
        constants_1.E18.mul(2),
        constants_1.E18.mul(3),
        constants_1.E18.mul(4),
        constants_1.E18.mul(5),
    ];
    var movingAverageDays = new util_1.BigNumber(5);
    var stableCollateralUnit = new util_1.BigNumber(250);
    var stableCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 12));
    var riskCollateralUnit = new util_1.BigNumber(Math.pow(10, 6));
    var riskCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 6));
    var initializedProposalTimestamp = new util_1.BigNumber(0);
    var assertions = new assertions_1.Assertions(web3);
    var macoManagerWrapper = new wrappers_1.MACOStrategyManagerWrapper(web3);
    var macoManagerAPI = new api_1.MACOManagerAPI(web3, assertions);
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, dailyPriceFeed;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _c.sent();
                    crossoverConfirmationMinTime = constants_1.ONE_HOUR_IN_SECONDS.mul(6);
                    crossoverConfirmationMaxTime = constants_1.ONE_HOUR_IN_SECONDS.mul(12);
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 2:
                    _a = _c.sent(), core = _a[0], transferProxy = _a[1], factory = _a[3], rebalancingFactory = _a[4], whitelist = _a[6];
                    return [4 /*yield*/, helpers_1.deployMedianizerAsync(web3)];
                case 3:
                    ethMedianizer = _c.sent();
                    return [4 /*yield*/, helpers_1.addPriceFeedOwnerToMedianizer(ethMedianizer, accounts_1.DEFAULT_ACCOUNT)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice, SetTestUtils.generateTimestamp(1000))];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployHistoricalPriceFeedAsync(web3, priceFeedUpdateFrequency, ethMedianizer.address, priceFeedDataDescription, seededPriceFeedPrices)];
                case 6:
                    dailyPriceFeed = _c.sent();
                    return [4 /*yield*/, helpers_1.deployMovingAverageOracleAsync(web3, dailyPriceFeed.address, priceFeedDataDescription)];
                case 7:
                    movingAverageOracle = _c.sent();
                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [6, 18], web3, accounts_1.DEFAULT_ACCOUNT)];
                case 8:
                    _b = _c.sent(), usdc = _b[0], wrappedETH = _b[1];
                    return [4 /*yield*/, helpers_1.approveForTransferAsync([usdc, wrappedETH], transferProxy.address)];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, usdc.address)];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, wrappedETH.address)];
                case 11:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                case 12:
                    constantAuctionPriceCurve = _c.sent();
                    helpers_1.addPriceCurveToCoreAsync(core, constantAuctionPriceCurve.address);
                    auctionTimeToPivot = constants_1.ONE_DAY_IN_SECONDS;
                    return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [usdc.address], [stableCollateralUnit], stableCollateralNaturalUnit)];
                case 13:
                    // Create Stable Collateral Set
                    initialStableCollateral = _c.sent();
                    return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [wrappedETH.address], [riskCollateralUnit], riskCollateralNaturalUnit)];
                case 14:
                    // Create Risk Collateral Set
                    initialRiskCollateral = _c.sent();
                    return [4 /*yield*/, helpers_1.deployMovingAverageStrategyManagerAsync(web3, core.address, movingAverageOracle.address, usdc.address, wrappedETH.address, initialStableCollateral.address, initialRiskCollateral.address, factory.address, constantAuctionPriceCurve.address, movingAverageDays, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime)];
                case 15:
                    macoManager = _c.sent();
                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, macoManager.address, initialRiskCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                case 16:
                    rebalancingSetToken = _c.sent();
                    return [4 /*yield*/, helpers_1.initializeMovingAverageStrategyManagerAsync(macoManager, rebalancingSetToken.address)];
                case 17:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    timeKeeper.reset();
                    return [4 /*yield*/, web3Utils.revertToSnapshot(currentSnapshotId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('getLastCrossoverConfirmationTimestampAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoManagerAPI.getLastCrossoverConfirmationTimestampAsync(subjectManagerAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManagerAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    subjectManagerAddress = macoManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct lastCrossoverConfirmationTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                var lastCrossoverConfirmationTimestamp;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            lastCrossoverConfirmationTimestamp = _a.sent();
                            expect(lastCrossoverConfirmationTimestamp).to.bignumber.equal(initializedProposalTimestamp);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getMovingAverageManagerDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoManagerAPI.getMovingAverageManagerDetailsAsync(subjectManagerAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManagerAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    subjectManagerAddress = macoManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct auctionLibrary address', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.auctionLibrary).to.equal(constantAuctionPriceCurve.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct auctionTimeToPivot address', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.auctionTimeToPivot).to.bignumber.equal(auctionTimeToPivot);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct core address', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.core).to.equal(core.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct lastCrossoverConfirmationTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.lastCrossoverConfirmationTimestamp).to.bignumber.equal(initializedProposalTimestamp);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct movingAverageDays', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.movingAverageDays).to.bignumber.equal(movingAverageDays);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct movingAveragePriceFeed', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.movingAveragePriceFeed).to.equal(movingAverageOracle.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct rebalancingSetToken', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.rebalancingSetToken).to.equal(rebalancingSetToken.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct riskAsset', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.riskAsset).to.equal(wrappedETH.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct riskCollateral', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.riskCollateral).to.equal(initialRiskCollateral.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct setTokenFactory', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.setTokenFactory).to.equal(factory.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct stableAsset', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.stableAsset).to.equal(usdc.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct stableCollateral', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.stableCollateral).to.equal(initialStableCollateral.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct crossoverConfirmationMinTime', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.crossoverConfirmationMinTime).to.bignumber.equal(crossoverConfirmationMinTime);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets the correct crossoverConfirmationMaxTime', function () { return __awaiter(_this, void 0, void 0, function () {
                var details;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.crossoverConfirmationMaxTime).to.bignumber.equal(crossoverConfirmationMaxTime);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('initiateCrossoverProposeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoManagerAPI.initiateCrossoverProposeAsync(subjectManagerAddress, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManagerAddress, subjectCaller, nextRebalanceAvailableInSeconds;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var lastRebalancedTimestampSeconds, rebalanceInterval;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectManagerAddress = macoManager.address;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                        case 1:
                            lastRebalancedTimestampSeconds = _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.rebalanceInterval.callAsync()];
                        case 2:
                            rebalanceInterval = _a.sent();
                            nextRebalanceAvailableInSeconds = lastRebalancedTimestampSeconds.plus(rebalanceInterval);
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
            describe('when more than 12 hours has elapsed since the last Proposal timestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Elapse the rebalance interval
                                return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 1:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(1000))];
                                case 2:
                                    _a.sent();
                                    // Free time at the rebalance interval minimum
                                    timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('calls initialPropose and sets the lastCrossoverConfirmationTimestamp properly', function () { return __awaiter(_this, void 0, void 0, function () {
                        var txnHash, blockNumber, timestamp, lastTimestamp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    txnHash = _a.sent();
                                    return [4 /*yield*/, web3.eth.getTransactionReceipt(txnHash)];
                                case 2:
                                    blockNumber = (_a.sent()).blockNumber;
                                    return [4 /*yield*/, web3.eth.getBlock(blockNumber)];
                                case 3:
                                    timestamp = (_a.sent()).timestamp;
                                    return [4 /*yield*/, macoManagerWrapper.lastCrossoverConfirmationTimestamp(subjectManagerAddress)];
                                case 4:
                                    lastTimestamp = _a.sent();
                                    expect(lastTimestamp).to.bignumber.equal(timestamp);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the RebalancingSet is not in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var newDesiredTimestamp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Elapse the rebalance interval
                                return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 1:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(1000))];
                                case 2:
                                    _a.sent();
                                    // Call initialPropose to set the timestamp
                                    return [4 /*yield*/, macoManagerWrapper.initialPropose(subjectManagerAddress)];
                                case 3:
                                    // Call initialPropose to set the timestamp
                                    _a.sent();
                                    // Elapse signal confirmation period
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(7))];
                                case 4:
                                    // Elapse signal confirmation period
                                    _a.sent();
                                    // Put the rebalancing set into proposal state
                                    return [4 /*yield*/, macoManagerWrapper.confirmPropose(subjectManagerAddress)];
                                case 5:
                                    // Put the rebalancing set into proposal state
                                    _a.sent();
                                    newDesiredTimestamp = nextRebalanceAvailableInSeconds.plus(constants_1.ONE_HOUR_IN_SECONDS.mul(7));
                                    timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + rebalancingSetToken.address + " must be in Default state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when insufficient time has elapsed since the last rebalance', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                                case 1:
                                    lastRebalancedTimestampSeconds = _a.sent();
                                    timeKeeper.freeze(lastRebalancedTimestampSeconds.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalanceTime, rebalanceInterval, nextAvailableRebalance, nextRebalanceFormattedDate;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                                case 1:
                                    lastRebalanceTime = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.rebalanceInterval.callAsync()];
                                case 2:
                                    rebalanceInterval = _a.sent();
                                    nextAvailableRebalance = lastRebalanceTime.add(rebalanceInterval).mul(1000);
                                    nextRebalanceFormattedDate = moment(nextAvailableRebalance.toNumber())
                                        .format('dddd, MMMM Do YYYY, h:mm:ss a');
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Attempting to rebalance too soon. Rebalancing next " +
                                            ("available on " + nextRebalanceFormattedDate))];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when no MA crossover when rebalancing Set is risk collateral', function () { return __awaiter(_this, void 0, void 0, function () {
                var currentPrice;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    currentPrice = initialMedianizerEthPrice.mul(5);
                                    // Elapse the rebalance interval
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 1:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.mul(5), SetTestUtils.generateTimestamp(1000))];
                                case 2:
                                    _a.sent();
                                    // Freeze the time at rebalance interval
                                    timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var movingAverage, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = util_1.BigNumber.bind;
                                    return [4 /*yield*/, movingAverageOracle.read.callAsync(movingAverageDays)];
                                case 1:
                                    movingAverage = new (_a.apply(util_1.BigNumber, [void 0, _b.sent()]))();
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Current Price " + currentPrice.toString() + " must be less than Moving Average " + movingAverage.toString())];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when no MA crossover when rebalancing Set is stable collateral', function () { return __awaiter(_this, void 0, void 0, function () {
                var currentPriceThatIsBelowMA;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds, rebalanceInterval;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.deployMovingAverageStrategyManagerAsync(web3, core.address, movingAverageOracle.address, usdc.address, wrappedETH.address, initialStableCollateral.address, initialRiskCollateral.address, factory.address, constantAuctionPriceCurve.address, movingAverageDays, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime)];
                                case 1:
                                    macoManager = _a.sent();
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, macoManager.address, initialStableCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                                case 2:
                                    rebalancingSetToken = _a.sent();
                                    return [4 /*yield*/, helpers_1.initializeMovingAverageStrategyManagerAsync(macoManager, rebalancingSetToken.address)];
                                case 3:
                                    _a.sent();
                                    currentPriceThatIsBelowMA = initialMedianizerEthPrice.div(10);
                                    // Elapse the rebalance interval
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 4:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, currentPriceThatIsBelowMA, SetTestUtils.generateTimestamp(1000))];
                                case 5:
                                    _a.sent();
                                    subjectManagerAddress = macoManager.address;
                                    return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                                case 6:
                                    lastRebalancedTimestampSeconds = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.rebalanceInterval.callAsync()];
                                case 7:
                                    rebalanceInterval = _a.sent();
                                    nextRebalanceAvailableInSeconds = lastRebalancedTimestampSeconds.plus(rebalanceInterval);
                                    timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var movingAverage, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = util_1.BigNumber.bind;
                                    return [4 /*yield*/, movingAverageOracle.read.callAsync(movingAverageDays)];
                                case 1:
                                    movingAverage = new (_a.apply(util_1.BigNumber, [void 0, _b.sent()]))();
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Current Price " + currentPriceThatIsBelowMA.toString() + " must be " +
                                            ("greater than Moving Average " + movingAverage.toString()))];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('confirmCrossoverProposeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoManagerAPI.confirmCrossoverProposeAsync(subjectManagerAddress, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManagerAddress, subjectCaller, nextRebalanceAvailableInSeconds;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var lastRebalancedTimestampSeconds, rebalanceInterval;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectManagerAddress = macoManager.address;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                        case 1:
                            lastRebalancedTimestampSeconds = _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.rebalanceInterval.callAsync()];
                        case 2:
                            rebalanceInterval = _a.sent();
                            nextRebalanceAvailableInSeconds = lastRebalancedTimestampSeconds.plus(rebalanceInterval);
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
            describe('when 6 hours has elapsed since the lastCrossoverConfirmationTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastCrossoverConfirmationTimestamp, newDesiredTimestamp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Elapse the rebalance interval
                                return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 1:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(1000))];
                                case 2:
                                    _a.sent();
                                    // Call initialPropose to set the timestamp
                                    return [4 /*yield*/, macoManagerWrapper.initialPropose(subjectManagerAddress)];
                                case 3:
                                    // Call initialPropose to set the timestamp
                                    _a.sent();
                                    // Elapse 7 hours
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(7))];
                                case 4:
                                    // Elapse 7 hours
                                    _a.sent();
                                    // Need to perform a transaction to further the timestamp
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(2000))];
                                case 5:
                                    // Need to perform a transaction to further the timestamp
                                    _a.sent();
                                    return [4 /*yield*/, macoManager.lastCrossoverConfirmationTimestamp.callAsync(macoManager)];
                                case 6:
                                    lastCrossoverConfirmationTimestamp = _a.sent();
                                    newDesiredTimestamp = lastCrossoverConfirmationTimestamp.plus(constants_1.ONE_HOUR_IN_SECONDS.mul(7));
                                    timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('sets the rebalancing Set into proposal period', function () { return __awaiter(_this, void 0, void 0, function () {
                        var proposalStateEnum, rebalancingSetState;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a.sent();
                                    proposalStateEnum = new util_1.BigNumber(1);
                                    return [4 /*yield*/, rebalancingSetToken.rebalanceState.callAsync()];
                                case 2:
                                    rebalancingSetState = _a.sent();
                                    expect(rebalancingSetState).to.bignumber.equal(proposalStateEnum);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when more than 12 hours has not elapsed since the lastCrossoverConfirmationTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastCrossoverConfirmationTimestamp, newDesiredTimestamp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Elapse the rebalance interval
                                return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 1:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(1000))];
                                case 2:
                                    _a.sent();
                                    // Call initialPropose to set the timestamp
                                    return [4 /*yield*/, macoManagerWrapper.initialPropose(subjectManagerAddress)];
                                case 3:
                                    // Call initialPropose to set the timestamp
                                    _a.sent();
                                    // Elapse 3 hours
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(13))];
                                case 4:
                                    // Elapse 3 hours
                                    _a.sent();
                                    // Need to perform a transaction to further the timestamp
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(2000))];
                                case 5:
                                    // Need to perform a transaction to further the timestamp
                                    _a.sent();
                                    return [4 /*yield*/, macoManager.lastCrossoverConfirmationTimestamp.callAsync(macoManager)];
                                case 6:
                                    lastCrossoverConfirmationTimestamp = _a.sent();
                                    newDesiredTimestamp = lastCrossoverConfirmationTimestamp.plus(constants_1.ONE_HOUR_IN_SECONDS.mul(3));
                                    timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Confirm Crossover Propose is not called in the confirmation period since last proposal timestamp")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when 6 hours has not elapsed since the lastCrossoverConfirmationTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastCrossoverConfirmationTimestamp, newDesiredTimestamp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Elapse the rebalance interval
                                return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 1:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(1000))];
                                case 2:
                                    _a.sent();
                                    // Call initialPropose to set the timestamp
                                    return [4 /*yield*/, macoManagerWrapper.initialPropose(subjectManagerAddress)];
                                case 3:
                                    // Call initialPropose to set the timestamp
                                    _a.sent();
                                    // Elapse 3 hours
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(3))];
                                case 4:
                                    // Elapse 3 hours
                                    _a.sent();
                                    // Need to perform a transaction to further the timestamp
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(2000))];
                                case 5:
                                    // Need to perform a transaction to further the timestamp
                                    _a.sent();
                                    return [4 /*yield*/, macoManager.lastCrossoverConfirmationTimestamp.callAsync(macoManager)];
                                case 6:
                                    lastCrossoverConfirmationTimestamp = _a.sent();
                                    newDesiredTimestamp = lastCrossoverConfirmationTimestamp.plus(constants_1.ONE_HOUR_IN_SECONDS.mul(3));
                                    timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Confirm Crossover Propose is not called in the confirmation period since last proposal timestamp")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the RebalancingSet is not in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var newDesiredTimestamp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Elapse the rebalance interval
                                return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 1:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(1000))];
                                case 2:
                                    _a.sent();
                                    // Call initialPropose to set the timestamp
                                    return [4 /*yield*/, macoManagerWrapper.initialPropose(subjectManagerAddress)];
                                case 3:
                                    // Call initialPropose to set the timestamp
                                    _a.sent();
                                    // Elapse signal confirmation period
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(7))];
                                case 4:
                                    // Elapse signal confirmation period
                                    _a.sent();
                                    // Put the rebalancing set into proposal state
                                    return [4 /*yield*/, macoManagerWrapper.confirmPropose(subjectManagerAddress)];
                                case 5:
                                    // Put the rebalancing set into proposal state
                                    _a.sent();
                                    newDesiredTimestamp = nextRebalanceAvailableInSeconds.plus(constants_1.ONE_HOUR_IN_SECONDS.mul(7));
                                    timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + rebalancingSetToken.address + " must be in Default state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when insufficient time has elapsed since the last rebalance', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                                case 1:
                                    lastRebalancedTimestampSeconds = _a.sent();
                                    timeKeeper.freeze(lastRebalancedTimestampSeconds.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalanceTime, rebalanceInterval, nextAvailableRebalance, nextRebalanceFormattedDate;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                                case 1:
                                    lastRebalanceTime = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.rebalanceInterval.callAsync()];
                                case 2:
                                    rebalanceInterval = _a.sent();
                                    nextAvailableRebalance = lastRebalanceTime.add(rebalanceInterval).mul(1000);
                                    nextRebalanceFormattedDate = moment(nextAvailableRebalance.toNumber())
                                        .format('dddd, MMMM Do YYYY, h:mm:ss a');
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Attempting to rebalance too soon. Rebalancing next " +
                                            ("available on " + nextRebalanceFormattedDate))];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when no MA crossover when rebalancing Set is risk collateral', function () { return __awaiter(_this, void 0, void 0, function () {
                var currentPrice;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    currentPrice = initialMedianizerEthPrice.mul(5);
                                    // Elapse the rebalance interval
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 1:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.mul(5), SetTestUtils.generateTimestamp(1000))];
                                case 2:
                                    _a.sent();
                                    // Freeze the time at rebalance interval
                                    timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var movingAverage, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = util_1.BigNumber.bind;
                                    return [4 /*yield*/, movingAverageOracle.read.callAsync(movingAverageDays)];
                                case 1:
                                    movingAverage = new (_a.apply(util_1.BigNumber, [void 0, _b.sent()]))();
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Current Price " + currentPrice.toString() + " must be less than Moving Average " + movingAverage.toString())];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when no MA crossover when rebalancing Set is stable collateral', function () { return __awaiter(_this, void 0, void 0, function () {
                var currentPriceThatIsBelowMA;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds, rebalanceInterval;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.deployMovingAverageStrategyManagerAsync(web3, core.address, movingAverageOracle.address, usdc.address, wrappedETH.address, initialStableCollateral.address, initialRiskCollateral.address, factory.address, constantAuctionPriceCurve.address, movingAverageDays, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime)];
                                case 1:
                                    macoManager = _a.sent();
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, macoManager.address, initialStableCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                                case 2:
                                    rebalancingSetToken = _a.sent();
                                    return [4 /*yield*/, helpers_1.initializeMovingAverageStrategyManagerAsync(macoManager, rebalancingSetToken.address)];
                                case 3:
                                    _a.sent();
                                    currentPriceThatIsBelowMA = initialMedianizerEthPrice.div(10);
                                    // Elapse the rebalance interval
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 4:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, currentPriceThatIsBelowMA, SetTestUtils.generateTimestamp(1000))];
                                case 5:
                                    _a.sent();
                                    subjectManagerAddress = macoManager.address;
                                    return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                                case 6:
                                    lastRebalancedTimestampSeconds = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.rebalanceInterval.callAsync()];
                                case 7:
                                    rebalanceInterval = _a.sent();
                                    nextRebalanceAvailableInSeconds = lastRebalancedTimestampSeconds.plus(rebalanceInterval);
                                    timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var movingAverage, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = util_1.BigNumber.bind;
                                    return [4 /*yield*/, movingAverageOracle.read.callAsync(movingAverageDays)];
                                case 1:
                                    movingAverage = new (_a.apply(util_1.BigNumber, [void 0, _b.sent()]))();
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Current Price " + currentPriceThatIsBelowMA.toString() + " must be " +
                                            ("greater than Moving Average " + movingAverage.toString()))];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=MACOManagerAPI.spec.js.map