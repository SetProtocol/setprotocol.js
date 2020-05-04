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
describe('AssetPairManagerWrapper', function () {
    var core;
    var transferProxy;
    var factory;
    var rebalancingFactory;
    var constantAuctionPriceCurve;
    var whitelist;
    var assetPairManager;
    var allocator;
    var trigger;
    var rsiOracle;
    var ethMedianizer;
    var ethOracleProxy;
    var usdcOracle;
    var usdc;
    var wrappedETH;
    var initialQuoteCollateral;
    var initialBaseCollateral;
    var rebalancingSetToken;
    var seededPriceFeedPrices;
    var assetPairManagerWrapper;
    var baseAssetAllocation = new util_1.BigNumber(100);
    var allocationDenominator = new util_1.BigNumber(100);
    var bullishBaseAssetAllocation = new util_1.BigNumber(100);
    var bearishBaseAssetAllocation = allocationDenominator.sub(bullishBaseAssetAllocation);
    var auctionTimeToPivot = constants_1.ONE_HOUR_IN_SECONDS.mul(6);
    var auctionStartPercentage = new util_1.BigNumber(2);
    var auctionPivotPercentage = new util_1.BigNumber(10);
    var signalConfirmationMinTime = constants_1.ONE_HOUR_IN_SECONDS.mul(6);
    var signalConfirmationMaxTime = constants_1.ONE_HOUR_IN_SECONDS.mul(12);
    var initialMedianizerEthPrice = constants_1.E18;
    var priceFeedDataDescription = '200DailyETHPrice';
    var rsiTimePeriod = new util_1.BigNumber(14);
    var lowerBound = new util_1.BigNumber(40);
    var upperBound = new util_1.BigNumber(60);
    var quoteCollateralUnit = new util_1.BigNumber(250);
    var quoteCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 12));
    var baseCollateralUnit = new util_1.BigNumber(Math.pow(10, 6));
    var baseCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 6));
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
        seededPriceFeedPrices = _.map(new Array(15), function (el, i) { return new util_1.BigNumber((170 - i) * Math.pow(10, 18)); });
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
                    return [4 /*yield*/, helpers_1.deployConstantPriceOracleAsync(web3, new util_1.BigNumber(Math.pow(10, 18)))];
                case 8:
                    usdcOracle = _c.sent();
                    return [4 /*yield*/, helpers_1.deployLinearizedPriceDataSourceAsync(web3, ethOracleProxy.address, constants_1.ONE_HOUR_IN_SECONDS, '')];
                case 9:
                    dataSource = _c.sent();
                    return [4 /*yield*/, helpers_1.approveContractToOracleProxy(ethOracleProxy, dataSource.address)];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployTimeSeriesFeedAsync(web3, dataSource.address, seededPriceFeedPrices)];
                case 11:
                    timeSeriesFeed = _c.sent();
                    return [4 /*yield*/, helpers_1.deployRSIOracleAsync(web3, timeSeriesFeed.address, priceFeedDataDescription)];
                case 12:
                    rsiOracle = _c.sent();
                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [6, 18], web3, accounts_1.DEFAULT_ACCOUNT)];
                case 13:
                    _b = _c.sent(), usdc = _b[0], wrappedETH = _b[1];
                    return [4 /*yield*/, helpers_1.approveForTransferAsync([usdc, wrappedETH], transferProxy.address)];
                case 14:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, usdc.address)];
                case 15:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, wrappedETH.address)];
                case 16:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                case 17:
                    constantAuctionPriceCurve = _c.sent();
                    return [4 /*yield*/, helpers_1.addPriceCurveToCoreAsync(core, constantAuctionPriceCurve.address)];
                case 18:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [usdc.address], [quoteCollateralUnit], quoteCollateralNaturalUnit)];
                case 19:
                    // Create Stable Collateral Set
                    initialQuoteCollateral = _c.sent();
                    return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [wrappedETH.address], [baseCollateralUnit], baseCollateralNaturalUnit)];
                case 20:
                    // Create Risk Collateral Set
                    initialBaseCollateral = _c.sent();
                    return [4 /*yield*/, helpers_1.deployBinaryAllocatorAsync(web3, wrappedETH.address, usdc.address, ethOracleProxy.address, usdcOracle.address, initialBaseCollateral.address, initialQuoteCollateral.address, core.address, factory.address)];
                case 21:
                    allocator = _c.sent();
                    return [4 /*yield*/, helpers_1.deployRSITrendingTriggerAsync(web3, rsiOracle.address, lowerBound, upperBound, rsiTimePeriod)];
                case 22:
                    trigger = _c.sent();
                    return [4 /*yield*/, helpers_1.deployAssetPairManagerAsync(web3, core.address, allocator.address, trigger.address, constantAuctionPriceCurve.address, baseAssetAllocation, allocationDenominator, bullishBaseAssetAllocation, auctionTimeToPivot, auctionStartPercentage, auctionPivotPercentage, signalConfirmationMinTime, signalConfirmationMaxTime)];
                case 23:
                    assetPairManager = _c.sent();
                    return [4 /*yield*/, helpers_1.approveContractToOracleProxy(ethOracleProxy, trigger.address)];
                case 24:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.approveContractToOracleProxy(ethOracleProxy, allocator.address)];
                case 25:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, assetPairManager.address, initialBaseCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                case 26:
                    rebalancingSetToken = _c.sent();
                    return [4 /*yield*/, helpers_1.initializeManagerAsync(assetPairManager, rebalancingSetToken.address)];
                case 27:
                    _c.sent();
                    assetPairManagerWrapper = new wrappers_1.AssetPairManagerWrapper(web3);
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
    describe('core', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.core(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
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
    describe('allocator', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.allocator(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
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
                            expect(address).to.equal(allocator.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('trigger', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.trigger(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
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
                            expect(address).to.equal(trigger.address);
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
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.auctionLibrary(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
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
                            expect(address).to.equal(constantAuctionPriceCurve.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('rebalancingSetToken', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.rebalancingSetToken(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct rebalancingSetToken', function () { return __awaiter(_this, void 0, void 0, function () {
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
    describe('baseAssetAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.baseAssetAllocation(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct baseAssetAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.be.bignumber.equal(baseAssetAllocation);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('allocationDenominator', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.allocationDenominator(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct allocationDenominator', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.be.bignumber.equal(allocationDenominator);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('bullishBaseAssetAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.bullishBaseAssetAllocation(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct bullishBaseAssetAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.be.bignumber.equal(bullishBaseAssetAllocation);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('bearishBaseAssetAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.bearishBaseAssetAllocation(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct bearishBaseAssetAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.be.bignumber.equal(bearishBaseAssetAllocation);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('auctionStartPercentage', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.auctionStartPercentage(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct auctionStartPercentage', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.be.bignumber.equal(auctionStartPercentage);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('auctionPivotPercentage', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.auctionPivotPercentage(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct auctionPivotPercentage', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.be.bignumber.equal(auctionPivotPercentage);
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
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.auctionTimeToPivot(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
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
                            expect(address).to.be.bignumber.equal(auctionTimeToPivot);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('signalConfirmationMinTime', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.signalConfirmationMinTime(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct signalConfirmationMinTime', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.be.bignumber.equal(signalConfirmationMinTime);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('signalConfirmationMaxTime', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.signalConfirmationMaxTime(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct signalConfirmationMaxTime', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.be.bignumber.equal(signalConfirmationMaxTime);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('recentInitialProposeTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.recentInitialProposeTimestamp(subjectManagerAddress)];
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
                    subjectManagerAddress = assetPairManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct recentInitialProposeTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.be.bignumber.equal(constants_1.ZERO);
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
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.initialPropose(subjectManagerAddress)];
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
                            subjectManagerAddress = assetPairManager.address;
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
            test('sets the recentInitialProposeTimestamp properly', function () { return __awaiter(_this, void 0, void 0, function () {
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
                            return [4 /*yield*/, assetPairManagerWrapper.recentInitialProposeTimestamp(subjectManagerAddress)];
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
                        case 0: return [4 /*yield*/, assetPairManagerWrapper.confirmPropose(subjectManagerAddress)];
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
                            subjectManagerAddress = assetPairManager.address;
                            // Elapse the rebalance interval
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                        case 1:
                            // Elapse the rebalance interval
                            _a.sent();
                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(4), SetTestUtils.generateTimestamp(1000))];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, assetPairManager.initialPropose.sendTransactionAsync()];
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
    describe('canInitialPropose', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, subjectTimeFastForward)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, assetPairManagerWrapper.canInitialPropose(subjectManagerAddress)];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManagerAddress, subjectTimeFastForward;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectManagerAddress = assetPairManager.address;
                            subjectTimeFastForward = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(1000))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('sets the recentInitialProposeTimestamp properly', function () { return __awaiter(_this, void 0, void 0, function () {
                var canInitialPropose;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            canInitialPropose = _a.sent();
                            expect(canInitialPropose).to.be.true;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when initialPropose not valid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTimeFastForward = constants_1.ZERO;
                            return [2 /*return*/];
                        });
                    }); });
                    test('returns false', function () { return __awaiter(_this, void 0, void 0, function () {
                        var canInitialPropose;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    canInitialPropose = _a.sent();
                                    expect(canInitialPropose).to.be.false;
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('canConfirmPropose', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, subjectTimeFastForward)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, assetPairManagerWrapper.canConfirmPropose(subjectManagerAddress)];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectManagerAddress, subjectTimeFastForward;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectManagerAddress = assetPairManager.address;
                            subjectTimeFastForward = constants_1.ONE_HOUR_IN_SECONDS.mul(7);
                            // Elapse the rebalance interval
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                        case 1:
                            // Elapse the rebalance interval
                            _a.sent();
                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(4), SetTestUtils.generateTimestamp(1000))];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, assetPairManager.initialPropose.sendTransactionAsync()];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('sets the recentInitialProposeTimestamp properly', function () { return __awaiter(_this, void 0, void 0, function () {
                var canInitialPropose;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            canInitialPropose = _a.sent();
                            expect(canInitialPropose).to.be.true;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when initialPropose not valid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTimeFastForward = constants_1.ZERO;
                            return [2 /*return*/];
                        });
                    }); });
                    test('returns false', function () { return __awaiter(_this, void 0, void 0, function () {
                        var canInitialPropose;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    canInitialPropose = _a.sent();
                                    expect(canInitialPropose).to.be.false;
                                    return [2 /*return*/];
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
//# sourceMappingURL=AssetPairManagerWrapper.spec.js.map