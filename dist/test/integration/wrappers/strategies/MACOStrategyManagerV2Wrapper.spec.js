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
var SetTestUtils = setProtocolUtils.SetProtocolTestUtils, Web3Utils = setProtocolUtils.Web3Utils;
var web3Utils = new Web3Utils(web3);
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('MACOStrategyManagerV2Wrapper', function () {
    var core;
    var transferProxy;
    var factory;
    var rebalancingFactory;
    var constantAuctionPriceCurve;
    var macoManager;
    var movingAverageOracle;
    var ethMedianizer;
    var ethOracleProxy;
    var usdc;
    var wrappedETH;
    var whitelist;
    var initialStableCollateral;
    var initialRiskCollateral;
    var rebalancingSetToken;
    var seededPriceFeedPrices;
    var auctionTimeToPivot;
    var macoStrategyManagerWrapper;
    var crossoverConfirmationMinTime = constants_1.ONE_HOUR_IN_SECONDS.mul(6);
    var crossoverConfirmationMaxTime = constants_1.ONE_HOUR_IN_SECONDS.mul(12);
    var initialMedianizerEthPrice = constants_1.E18;
    var priceFeedDataDescription = '200DailyETHPrice';
    var movingAverageDays = new util_1.BigNumber(5);
    var stableCollateralUnit = new util_1.BigNumber(250);
    var stableCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 12));
    var riskCollateralUnit = new util_1.BigNumber(Math.pow(10, 6));
    var riskCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 6));
    var initializedProposalTimestamp = new util_1.BigNumber(0);
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var medianizerAdapter, dataSource, timeSeriesFeed;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _c.sent();
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
                    return [4 /*yield*/, helpers_1.deployLegacyMakerOracleAdapterAsync(web3, ethMedianizer.address)];
                case 6:
                    medianizerAdapter = _c.sent();
                    return [4 /*yield*/, helpers_1.deployOracleProxyAsync(web3, medianizerAdapter.address)];
                case 7:
                    ethOracleProxy = _c.sent();
                    return [4 /*yield*/, helpers_1.deployLinearizedPriceDataSourceAsync(web3, ethOracleProxy.address, constants_1.ONE_HOUR_IN_SECONDS, '')];
                case 8:
                    dataSource = _c.sent();
                    return [4 /*yield*/, helpers_1.approveContractToOracleProxy(ethOracleProxy, dataSource.address)];
                case 9:
                    _c.sent();
                    seededPriceFeedPrices = _.map(new Array(20), function (el, i) { return new util_1.BigNumber((150 + i) * Math.pow(10, 18)); });
                    return [4 /*yield*/, helpers_1.deployTimeSeriesFeedAsync(web3, dataSource.address, seededPriceFeedPrices)];
                case 10:
                    timeSeriesFeed = _c.sent();
                    return [4 /*yield*/, helpers_1.deployMovingAverageOracleV2Async(web3, timeSeriesFeed.address, priceFeedDataDescription)];
                case 11:
                    movingAverageOracle = _c.sent();
                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [6, 18], web3, accounts_1.DEFAULT_ACCOUNT)];
                case 12:
                    _b = _c.sent(), usdc = _b[0], wrappedETH = _b[1];
                    return [4 /*yield*/, helpers_1.approveForTransferAsync([usdc, wrappedETH], transferProxy.address)];
                case 13:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, usdc.address)];
                case 14:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, wrappedETH.address)];
                case 15:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                case 16:
                    constantAuctionPriceCurve = _c.sent();
                    return [4 /*yield*/, helpers_1.addPriceCurveToCoreAsync(core, constantAuctionPriceCurve.address)];
                case 17:
                    _c.sent();
                    auctionTimeToPivot = constants_1.ONE_DAY_IN_SECONDS;
                    return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [usdc.address], [stableCollateralUnit], stableCollateralNaturalUnit)];
                case 18:
                    // Create Stable Collateral Set
                    initialStableCollateral = _c.sent();
                    return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [wrappedETH.address], [riskCollateralUnit], riskCollateralNaturalUnit)];
                case 19:
                    // Create Risk Collateral Set
                    initialRiskCollateral = _c.sent();
                    return [4 /*yield*/, helpers_1.deployMovingAverageStrategyManagerV2Async(web3, core.address, movingAverageOracle.address, ethOracleProxy.address, usdc.address, wrappedETH.address, initialStableCollateral.address, initialRiskCollateral.address, factory.address, constantAuctionPriceCurve.address, movingAverageDays, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime)];
                case 20:
                    macoManager = _c.sent();
                    return [4 /*yield*/, helpers_1.approveContractToOracleProxy(ethOracleProxy, macoManager.address)];
                case 21:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, macoManager.address, initialRiskCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                case 22:
                    rebalancingSetToken = _c.sent();
                    return [4 /*yield*/, helpers_1.initializeManagerAsync(macoManager, rebalancingSetToken.address)];
                case 23:
                    _c.sent();
                    macoStrategyManagerWrapper = new wrappers_1.MACOStrategyManagerV2Wrapper(web3);
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
    describe('coreAddress', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.coreAddress(subjectManagerAddress)];
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
            test('gets the correct core', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(core.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('rebalancingSetTokenAddress', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.rebalancingSetTokenAddress(subjectManagerAddress)];
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
            test('gets the correct rebalancingSetTokenAddress', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(rebalancingSetToken.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('movingAveragePriceFeed', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.movingAveragePriceFeed(subjectManagerAddress)];
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
            test('gets the correct movingAveragePriceFeed', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(movingAverageOracle.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('riskAssetOracle', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.riskAssetOracle(subjectManagerAddress)];
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
            test('gets the correct movingAveragePriceFeed', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(ethOracleProxy.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('stableAssetAddress', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.stableAssetAddress(subjectManagerAddress)];
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
            test('gets the correct stableAssetAddress', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(usdc.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('riskAssetAddress', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.riskAssetAddress(subjectManagerAddress)];
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
            test('gets the correct riskAssetAddress', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(wrappedETH.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('riskAssetAddress', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.riskAssetAddress(subjectManagerAddress)];
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
            test('gets the correct riskAssetAddress', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(wrappedETH.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('stableCollateralAddress', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.stableCollateralAddress(subjectManagerAddress)];
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
            test('gets the correct stableCollateralAddress', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(initialStableCollateral.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('riskCollateralAddress', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.riskCollateralAddress(subjectManagerAddress)];
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
            test('gets the correct riskCollateralAddress', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(initialRiskCollateral.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('setTokenFactory', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.setTokenFactory(subjectManagerAddress)];
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
            test('gets the correct setTokenFactory', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(factory.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('auctionLibrary', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.auctionLibrary(subjectManagerAddress)];
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
            test('gets the correct auctionLibrary', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(constantAuctionPriceCurve.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('movingAverageDays', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.movingAverageDays(subjectManagerAddress)];
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
            test('gets the correct movingAverageDays', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.bignumber.equal(movingAverageDays);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('lastCrossoverConfirmationTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.lastCrossoverConfirmationTimestamp(subjectManagerAddress)];
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
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.bignumber.equal(initializedProposalTimestamp);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('auctionTimeToPivot', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.auctionTimeToPivot(subjectManagerAddress)];
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
            test('gets the correct auctionTimeToPivot', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.bignumber.equal(auctionTimeToPivot);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('crossoverConfirmationMinTime', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.crossoverConfirmationMinTime(subjectManagerAddress)];
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
            test('gets the correct crossoverConfirmationMinTime', function () { return __awaiter(_this, void 0, void 0, function () {
                var minTime;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            minTime = _a.sent();
                            expect(minTime).to.bignumber.equal(crossoverConfirmationMinTime);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('crossoverConfirmationMaxTime', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.crossoverConfirmationMaxTime(subjectManagerAddress)];
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
            test('gets the correct crossoverConfirmationMaxTime', function () { return __awaiter(_this, void 0, void 0, function () {
                var minTime;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            minTime = _a.sent();
                            expect(minTime).to.bignumber.equal(crossoverConfirmationMaxTime);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('initialPropose', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.initialPropose(subjectManagerAddress)];
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
                    switch (_a.label) {
                        case 0:
                            subjectManagerAddress = macoManager.address;
                            // Elapse the rebalance interval
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                        case 1:
                            // Elapse the rebalance interval
                            _a.sent();
                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(1000))];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('sets the lastCrossoverConfirmationTimestamp properly', function () { return __awaiter(_this, void 0, void 0, function () {
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
                            return [4 /*yield*/, macoStrategyManagerWrapper.lastCrossoverConfirmationTimestamp(subjectManagerAddress)];
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
    describe('confirmPropose', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, macoStrategyManagerWrapper.confirmPropose(subjectManagerAddress)];
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
                    switch (_a.label) {
                        case 0:
                            subjectManagerAddress = macoManager.address;
                            // Elapse the rebalance interval
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                        case 1:
                            // Elapse the rebalance interval
                            _a.sent();
                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(4), SetTestUtils.generateTimestamp(1000))];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, macoManager.initialPropose.sendTransactionAsync()];
                        case 3:
                            _a.sent();
                            // Elapse the signal confirmation period
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(7))];
                        case 4:
                            // Elapse the signal confirmation period
                            _a.sent();
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
});
//# sourceMappingURL=MACOStrategyManagerV2Wrapper.spec.js.map