/*
  Copyright 2019 Set Labs Inc.

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
var SetTestUtils = setProtocolUtils.SetProtocolTestUtils, Web3Utils = setProtocolUtils.Web3Utils;
var web3Utils = new Web3Utils(web3);
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('BTCDAIRebalancingManagerWrapper', function () {
    var core;
    var transferProxy;
    var factory;
    var rebalancingFactory;
    var constantAuctionPriceCurve;
    var btcDaiRebalancingManager;
    var btcMedianizer;
    var wrappedBTC;
    var dai;
    var whitelist;
    var btcMultiplier;
    var daiMultiplier;
    var maximumLowerThreshold;
    var minimumUpperThreshold;
    var auctionTimeToPivot;
    var btcDaiManagerWrapper;
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
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
                    btcMedianizer = _c.sent();
                    return [4 /*yield*/, helpers_1.addPriceFeedOwnerToMedianizer(btcMedianizer, accounts_1.DEFAULT_ACCOUNT)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [8, 18], web3, accounts_1.DEFAULT_ACCOUNT)];
                case 5:
                    _b = _c.sent(), wrappedBTC = _b[0], dai = _b[1];
                    return [4 /*yield*/, helpers_1.approveForTransferAsync([wrappedBTC, dai], transferProxy.address)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, wrappedBTC.address)];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, dai.address)];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                case 9:
                    constantAuctionPriceCurve = _c.sent();
                    return [4 /*yield*/, helpers_1.addPriceCurveToCoreAsync(core, constantAuctionPriceCurve.address)];
                case 10:
                    _c.sent();
                    btcMultiplier = new util_1.BigNumber(1);
                    daiMultiplier = new util_1.BigNumber(1);
                    auctionTimeToPivot = constants_1.ONE_DAY_IN_SECONDS;
                    maximumLowerThreshold = new util_1.BigNumber(48);
                    minimumUpperThreshold = new util_1.BigNumber(52);
                    return [4 /*yield*/, helpers_1.deployBtcDaiManagerContractAsync(web3, core.address, btcMedianizer.address, dai.address, wrappedBTC.address, factory.address, constantAuctionPriceCurve.address, auctionTimeToPivot, [btcMultiplier, daiMultiplier], [maximumLowerThreshold, minimumUpperThreshold])];
                case 11:
                    btcDaiRebalancingManager = _c.sent();
                    btcDaiManagerWrapper = new wrappers_1.BTCDAIRebalancingManagerWrapper(web3);
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
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.core(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
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
    describe('btcPriceFeed', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.btcPriceFeed(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct btcPriceFeed', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(btcMedianizer.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('btcAddress', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.btcAddress(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct btcAddress', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(wrappedBTC.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('daiAddress', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.daiAddress(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct ethAddress', function () { return __awaiter(_this, void 0, void 0, function () {
                var address;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            address = _a.sent();
                            expect(address).to.equal(dai.address);
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
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.setTokenFactory(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
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
    describe('btcMultiplier', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.btcMultiplier(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct btcMultiplier', function () { return __awaiter(_this, void 0, void 0, function () {
                var multiplier;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            multiplier = _a.sent();
                            expect(multiplier).to.bignumber.equal(btcMultiplier);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('daiMultiplier', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.daiMultiplier(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct daiMultiplier', function () { return __awaiter(_this, void 0, void 0, function () {
                var multiplier;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            multiplier = _a.sent();
                            expect(multiplier).to.bignumber.equal(daiMultiplier);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('maximumLowerThreshold', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.maximumLowerThreshold(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct maximumLowerThreshold', function () { return __awaiter(_this, void 0, void 0, function () {
                var threshold;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            threshold = _a.sent();
                            expect(threshold).to.bignumber.equal(maximumLowerThreshold);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('minimumUpperThreshold', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.minimumUpperThreshold(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct minimumUpperThreshold', function () { return __awaiter(_this, void 0, void 0, function () {
                var threshold;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            threshold = _a.sent();
                            expect(threshold).to.bignumber.equal(minimumUpperThreshold);
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
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.auctionLibrary(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
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
    describe('auctionTimeToPivot', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, btcDaiManagerWrapper.auctionTimeToPivot(subjectManagerAddress)];
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
                    subjectManagerAddress = btcDaiRebalancingManager.address;
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
    describe('propose', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, timeFastForward)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, btcDaiManagerWrapper.propose(subjectManagerAddress, subjectRebalancingSetToken, { from: subjectCaller })];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var rebalancingSetToken, proposalPeriod, btcPrice, daiUnit, initialAllocationToken, timeFastForward, subjectRebalancingSetToken, subjectManagerAddress, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    btcPrice = new util_1.BigNumber(6000 * Math.pow(10, 18));
                    daiUnit = new util_1.BigNumber(4082 * Math.pow(10, 10));
                    return [2 /*return*/];
                });
            }); });
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [dai.address, wrappedBTC.address], [daiUnit.mul(daiMultiplier), new util_1.BigNumber(1).mul(btcMultiplier)], new util_1.BigNumber(Math.pow(10, 10)))];
                        case 1:
                            initialAllocationToken = _a.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, btcDaiRebalancingManager.address, initialAllocationToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _a.sent();
                            timeFastForward = constants_1.ONE_DAY_IN_SECONDS.add(1);
                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, btcMedianizer, btcPrice, SetTestUtils.generateTimestamp(1000))];
                        case 3:
                            _a.sent();
                            subjectManagerAddress = btcDaiRebalancingManager.address;
                            subjectRebalancingSetToken = rebalancingSetToken.address;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('successfully proposes', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=BTCDAIRebalancingManagerWrapper.spec.js.map