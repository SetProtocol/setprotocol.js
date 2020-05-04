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
var chai = __importStar(require("chai"));
var _ = __importStar(require("lodash"));
var web3_1 = __importDefault(require("web3"));
var set_protocol_contracts_1 = require("set-protocol-contracts");
var set_protocol_utils_1 = require("set-protocol-utils");
var api_1 = require("@src/api");
var wrappers_1 = require("@src/wrappers");
var constants_1 = require("@src/constants");
var accounts_1 = require("@src/constants/accounts");
var util_1 = require("@src/util");
var assertions_1 = require("@src/assertions");
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
var helpers_1 = require("@test/helpers");
var compoundHelper_1 = require("@test/helpers/compoundHelper");
chaiSetup_1.default.configure();
var expect = chai.expect;
var timeKeeper = require('timekeeper');
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var moment = require('moment');
var compoundHelper = new compoundHelper_1.CompoundHelper();
var currentSnapshotId;
describe('RebalancingAPI', function () {
    var nextRebalanceAvailableAtSeconds;
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var rebalancingSetTokenFactory;
    var rebalanceAuctionModule;
    var rebalancingSetCTokenBidder;
    var rebalancingSetEthBidder;
    var whitelist;
    var erc20Wrapper;
    var rebalancingSetTokenWrapper;
    var rebalancingAuctionModuleWrapper;
    var rebalancingSetCTokenBidderWrapper;
    var rebalancingSetEthBidderWrapper;
    var rebalancingAPI;
    var weth;
    var cUSDCInstance;
    var usdcInstance;
    var cDAIInstance;
    var daiInstance;
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var usdcDecimals, daiDecimals, underlyingInstances, cUSDCAddress, cDAIAddress, cTokenInstances, coreWrapper, protocolViewer, setProtocolConfig, assertions;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _b.sent();
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 2:
                    _a = _b.sent(), core = _a[0], transferProxy = _a[1], vault = _a[2], setTokenFactory = _a[3], rebalancingSetTokenFactory = _a[4], rebalanceAuctionModule = _a[5], whitelist = _a[6];
                    return [4 /*yield*/, helpers_1.deployWethMockAsync(web3, constants_1.NULL_ADDRESS, constants_1.ZERO)];
                case 3:
                    weth = _b.sent();
                    usdcDecimals = 6;
                    daiDecimals = 18;
                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [usdcDecimals, daiDecimals], web3)];
                case 4:
                    underlyingInstances = _b.sent();
                    usdcInstance = underlyingInstances[0];
                    daiInstance = underlyingInstances[1];
                    return [4 /*yield*/, compoundHelper.deployMockCUSDC(usdcInstance.address, constants_1.DEFAULT_ACCOUNT)];
                case 5:
                    cUSDCAddress = _b.sent();
                    return [4 /*yield*/, compoundHelper.enableCToken(cUSDCAddress)];
                case 6:
                    _b.sent();
                    // Set the Borrow Rate
                    return [4 /*yield*/, compoundHelper.setBorrowRate(cUSDCAddress, new util_1.BigNumber('43084603999'))];
                case 7:
                    // Set the Borrow Rate
                    _b.sent();
                    return [4 /*yield*/, compoundHelper.deployMockCDAI(daiInstance.address, constants_1.DEFAULT_ACCOUNT)];
                case 8:
                    cDAIAddress = _b.sent();
                    return [4 /*yield*/, compoundHelper.enableCToken(cDAIAddress)];
                case 9:
                    _b.sent();
                    // Set the Borrow Rate
                    return [4 /*yield*/, compoundHelper.setBorrowRate(cDAIAddress, new util_1.BigNumber('29313252165'))];
                case 10:
                    // Set the Borrow Rate
                    _b.sent();
                    return [4 /*yield*/, helpers_1.getTokenInstances(web3, [cUSDCAddress, cDAIAddress])];
                case 11:
                    cTokenInstances = _b.sent();
                    cUSDCInstance = cTokenInstances[0];
                    cDAIInstance = cTokenInstances[1];
                    return [4 /*yield*/, helpers_1.deployRebalancingSetEthBidderAsync(web3, rebalanceAuctionModule, transferProxy, weth)];
                case 12:
                    rebalancingSetEthBidder = _b.sent();
                    return [4 /*yield*/, helpers_1.deployRebalancingSetCTokenBidderAsync(web3, rebalanceAuctionModule, transferProxy, [cUSDCAddress, cDAIAddress], [usdcInstance.address, daiInstance.address], 'cToken Bidder Contract')];
                case 13:
                    rebalancingSetCTokenBidder = _b.sent();
                    setTokenFactory = setTokenFactory;
                    coreWrapper = new wrappers_1.CoreWrapper(web3, core.address, transferProxy.address, vault.address);
                    return [4 /*yield*/, helpers_1.deployProtocolViewerAsync(web3)];
                case 14:
                    protocolViewer = _b.sent();
                    erc20Wrapper = new wrappers_1.ERC20Wrapper(web3);
                    rebalancingSetTokenWrapper = new wrappers_1.RebalancingSetTokenWrapper(web3);
                    rebalancingAuctionModuleWrapper = new wrappers_1.RebalancingAuctionModuleWrapper(web3, rebalanceAuctionModule.address);
                    rebalancingSetCTokenBidderWrapper = new wrappers_1.RebalancingSetCTokenBidderWrapper(web3, rebalancingSetCTokenBidder.address);
                    rebalancingSetEthBidderWrapper = new wrappers_1.RebalancingSetEthBidderWrapper(web3, rebalancingSetEthBidder.address);
                    setProtocolConfig = {
                        coreAddress: constants_1.NULL_ADDRESS,
                        transferProxyAddress: constants_1.NULL_ADDRESS,
                        vaultAddress: constants_1.NULL_ADDRESS,
                        setTokenFactoryAddress: constants_1.NULL_ADDRESS,
                        rebalancingSetTokenFactoryAddress: constants_1.NULL_ADDRESS,
                        kyberNetworkWrapperAddress: constants_1.NULL_ADDRESS,
                        rebalanceAuctionModuleAddress: rebalanceAuctionModule.address,
                        exchangeIssuanceModuleAddress: constants_1.NULL_ADDRESS,
                        rebalancingSetIssuanceModule: constants_1.NULL_ADDRESS,
                        rebalancingSetCTokenBidderAddress: rebalancingSetCTokenBidder.address,
                        rebalancingSetEthBidderAddress: rebalancingSetEthBidder.address,
                        rebalancingSetExchangeIssuanceModule: constants_1.NULL_ADDRESS,
                        wrappedEtherAddress: weth.address,
                        protocolViewerAddress: protocolViewer.address,
                    };
                    assertions = new assertions_1.Assertions(web3);
                    rebalancingAPI = new api_1.RebalancingAPI(web3, assertions, coreWrapper, setProtocolConfig);
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
    describe('proposeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.proposeAsync(subjectRebalancingSetTokenAddress, subjectNextSet, subjectAuctionPriceCurveAddress, subjectAuctionTimeToPivot, subjectAuctionStartPrice, subjectAuctionPivotPrice, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, deployedSetTokenNaturalUnits, rebalancingSetToken, rebalanceInterval, managerAddress, subjectRebalancingSetTokenAddress, subjectNextSet, subjectAuctionPriceCurveAddress, subjectAuctionTimeToPivot, subjectAuctionStartPrice, subjectAuctionPivotPrice, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            deployedSetTokenNaturalUnits = [];
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, _a, proposalComponentOne, proposalComponentTwo, proposalPeriod, priceCurve, baseSetIssueQuantity, rebalancingSetQuantityToIssue, lastRebalancedTimestampSeconds;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy, deployedSetTokenNaturalUnits)];
                        case 1:
                            _b = _c.sent(), currentSetToken = _b[0], nextSetToken = _b[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _c.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            rebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _c.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 6:
                            priceCurve = _c.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            baseSetIssueQuantity = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                        case 7:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 8:
                            _c.sent();
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 9:
                            _c.sent();
                            return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                        case 10:
                            lastRebalancedTimestampSeconds = _c.sent();
                            nextRebalanceAvailableAtSeconds = lastRebalancedTimestampSeconds.toNumber() + rebalanceInterval.toNumber();
                            timeKeeper.freeze(nextRebalanceAvailableAtSeconds * 1000);
                            helpers_1.increaseChainTimeAsync(web3, rebalanceInterval.add(1));
                            subjectNextSet = nextSetToken.address;
                            subjectAuctionPriceCurveAddress = priceCurve.address;
                            subjectAuctionTimeToPivot = new util_1.BigNumber(100000);
                            subjectAuctionStartPrice = new util_1.BigNumber(500);
                            subjectAuctionPivotPrice = new util_1.BigNumber(1000);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectCaller = managerAddress;
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
            test('it fetches the rebalancing set token properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var nextSet, auctionLibrary, rebalanceState;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.nextSet(subjectRebalancingSetTokenAddress)];
                        case 2:
                            nextSet = _a.sent();
                            expect(nextSet).to.eql(subjectNextSet);
                            return [4 /*yield*/, rebalancingSetTokenWrapper.auctionLibrary(subjectRebalancingSetTokenAddress)];
                        case 3:
                            auctionLibrary = _a.sent();
                            expect(auctionLibrary).to.eql(subjectAuctionPriceCurveAddress);
                            return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                        case 4:
                            rebalanceState = _a.sent();
                            expect(rebalanceState).to.eql('Proposal');
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the caller is not the manager', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var invalidCallerAddress;
                        return __generator(this, function (_a) {
                            invalidCallerAddress = accounts_1.ACCOUNTS[0].address;
                            subjectCaller = invalidCallerAddress;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Caller " + subjectCaller + " is not the manager of this Rebalancing Set Token.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Transition to rebalance state
                                return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, subjectAuctionPriceCurveAddress)];
                                case 1:
                                    // Transition to rebalance state
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " is currently in rebalancing state." +
                                    " Issue, Redeem, and propose functionality is not available during this time")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the proposed set token is not a valid set', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var invalidNextSet;
                        return __generator(this, function (_a) {
                            invalidNextSet = accounts_1.ACCOUNTS[3].address;
                            subjectNextSet = invalidNextSet;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + subjectNextSet + " is not a valid Set token address.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the proposed set natural unit is not a multiple of the current set', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            deployedSetTokenNaturalUnits = [util_1.ether(.01), util_1.ether(.015)];
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            deployedSetTokenNaturalUnits = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith(nextSetToken.address + " must be a multiple of " + currentSetToken.address + "," +
                                    " or vice versa to propose a valid rebalance.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when proposeAsync is called before a new rebalance is allowed', function () { return __awaiter(_this, void 0, void 0, function () {
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
            describe('when proposeAsync is called with an invalid price curve', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectAuctionPriceCurveAddress = accounts_1.ACCOUNTS[4].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Proposed " + subjectAuctionPriceCurveAddress + " is not recognized by Core.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('startRebalanceAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.startRebalanceAsync(subjectRebalancingSetTokenAddress, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, proposalPeriod, managerAddress, priceCurve, nextRebalanceAvailableAtSeconds, subjectRebalancingSetTokenAddress, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, _a, proposalComponentOne, proposalComponentTwo, baseSetIssueQuantity, rebalancingSetQuantityToIssue;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            _b = _c.sent(), currentSetToken = _b[0], nextSetToken = _b[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _c.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _c.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 6:
                            // Deploy price curve used in auction
                            priceCurve = _c.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            baseSetIssueQuantity = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                        case 7:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 8:
                            _c.sent();
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 9:
                            _c.sent();
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectCaller = constants_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Proposal state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress, proposalStartTimeSeconds, fastForwardPeriod;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.proposalStartTime.callAsync()];
                                case 2:
                                    proposalStartTimeSeconds = _a.sent();
                                    fastForwardPeriod = proposalPeriod.toNumber();
                                    nextRebalanceAvailableAtSeconds = proposalStartTimeSeconds.toNumber() + fastForwardPeriod;
                                    timeKeeper.freeze(nextRebalanceAvailableAtSeconds * 1000 + 1);
                                    helpers_1.increaseChainTimeAsync(web3, proposalPeriod.add(1));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('it fetches the set token properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                        var returnedMinimumBid, returnedRemainingCurrentSets, combinedTokenArray, combinedCurrentUnits, combinedNextSetUnits, returnedRebalanceState, auctionSetUpOutputs, returnedCombinedTokenArray, expectedCombinedTokenArray, returnedCombinedCurrentUnits, expectedCombinedCurrentUnits, returnedCombinedNextSetUnits, expectedCombinedNextSetUnits;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.minimumBid(subjectRebalancingSetTokenAddress)];
                                case 2:
                                    returnedMinimumBid = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.remainingCurrentSets(subjectRebalancingSetTokenAddress)];
                                case 3:
                                    returnedRemainingCurrentSets = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.getCombinedTokenArray(subjectRebalancingSetTokenAddress)];
                                case 4:
                                    combinedTokenArray = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.getCombinedCurrentUnits(subjectRebalancingSetTokenAddress)];
                                case 5:
                                    combinedCurrentUnits = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.getCombinedNextSetUnits(subjectRebalancingSetTokenAddress)];
                                case 6:
                                    combinedNextSetUnits = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                                case 7:
                                    returnedRebalanceState = _a.sent();
                                    return [4 /*yield*/, helpers_1.getAuctionSetUpOutputsAsync(rebalancingSetToken, currentSetToken, nextSetToken, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                                case 8:
                                    auctionSetUpOutputs = _a.sent();
                                    expect(returnedMinimumBid).to.be.bignumber.equal(auctionSetUpOutputs['expectedMinimumBid']);
                                    expect(returnedRemainingCurrentSets).to.be.bignumber.equal(util_1.ether(7));
                                    returnedCombinedTokenArray = JSON.stringify(combinedTokenArray);
                                    expectedCombinedTokenArray = JSON.stringify(auctionSetUpOutputs['expectedCombinedTokenArray']);
                                    expect(returnedCombinedTokenArray).to.equal(expectedCombinedTokenArray);
                                    returnedCombinedCurrentUnits = JSON.stringify(combinedCurrentUnits);
                                    expectedCombinedCurrentUnits = JSON.stringify(auctionSetUpOutputs['expectedCombinedCurrentUnits']);
                                    expect(returnedCombinedCurrentUnits).to.equal(expectedCombinedCurrentUnits);
                                    returnedCombinedNextSetUnits = JSON.stringify(combinedNextSetUnits);
                                    expectedCombinedNextSetUnits = JSON.stringify(auctionSetUpOutputs['expectedCombinedNextUnits']);
                                    expect(returnedCombinedNextSetUnits).to.equal(expectedCombinedNextSetUnits);
                                    expect(returnedRebalanceState).to.eql('Rebalance');
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('when startRebalanceAsync is called before proposal period has elapsed', function () { return __awaiter(_this, void 0, void 0, function () {
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
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Proposal state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('settleRebalanceAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.settleRebalanceAsync(subjectRebalancingSetTokenAddress, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, proposalPeriod, managerAddress, priceCurve, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, _a, proposalComponentOne, proposalComponentTwo;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            _b = _c.sent(), currentSetToken = _b[0], nextSetToken = _b[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _c.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _c.sent();
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 6:
                            // Issue currentSetToken
                            _c.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _c.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 9:
                            // Deploy price curve used in auction
                            priceCurve = _c.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectCaller = constants_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state and enough sets have been rebalanced', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, rebalanceAuctionModule.bid.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue, false)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('updates the rebalancing properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedUnitShares, lastBlock, auctionEndTimestamp, returnedRebalanceState, returnedCurrentSet, returnedUnitShares, returnedLastRebalanceTimestamp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.getExpectedUnitSharesAsync(rebalancingSetToken, nextSetToken, vault)];
                                case 1:
                                    expectedUnitShares = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, web3.eth.getBlock('latest')];
                                case 3:
                                    lastBlock = _a.sent();
                                    auctionEndTimestamp = new util_1.BigNumber(lastBlock.timestamp);
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                                case 4:
                                    returnedRebalanceState = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.currentSet(subjectRebalancingSetTokenAddress)];
                                case 5:
                                    returnedCurrentSet = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.unitShares(subjectRebalancingSetTokenAddress)];
                                case 6:
                                    returnedUnitShares = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.lastRebalanceTimestamp(subjectRebalancingSetTokenAddress)];
                                case 7:
                                    returnedLastRebalanceTimestamp = _a.sent();
                                    expect(returnedRebalanceState).to.eql('Default');
                                    expect(returnedCurrentSet).to.eql(nextSetToken.address);
                                    expect(returnedUnitShares).to.be.bignumber.equal(expectedUnitShares);
                                    expect(returnedLastRebalanceTimestamp).to.be.bignumber.equal(auctionEndTimestamp);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state but\
    not enough sets have been rebalanced', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, minimumBid, remainingCurrentSets;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 1:
                                    _a = _b.sent(), minimumBid = _a[0], remainingCurrentSets = _a[1];
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("In order to settle rebalance there must be less than current " + minimumBid + " sets remaining " +
                                            ("to be rebalanced. There are currently " + remainingCurrentSets + " remaining for rebalance."))];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('endFailedAuctionAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.endFailedAuctionAsync(subjectRebalancingSetTokenAddress, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, proposalPeriod, managerAddress, priceCurve, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress, subjectCaller, pivotTime;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, _a, proposalComponentOne, proposalComponentTwo;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            _b = _c.sent(), currentSetToken = _b[0], nextSetToken = _b[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _c.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _c.sent();
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 6:
                            // Issue currentSetToken
                            _c.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _c.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 9:
                            // Deploy price curve used in auction
                            priceCurve = _c.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectCaller = constants_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state and is before the pivot time', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    pivotTime = new util_1.BigNumber(100000);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastBlock, auctionStartTimestamp, pivotTimeStart, pivotTimeFormattedDate;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, web3.eth.getBlock('latest')];
                                case 1:
                                    lastBlock = _a.sent();
                                    auctionStartTimestamp = new util_1.BigNumber(lastBlock.timestamp);
                                    pivotTimeStart = auctionStartTimestamp.add(pivotTime).toString();
                                    pivotTimeFormattedDate = moment(+pivotTimeStart * 1000)
                                        .format('dddd, MMMM Do YYYY, h:mm:ss a');
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Pivot time not yet reached. Pivot time starts at " + pivotTimeFormattedDate)];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state, is in the pivot time and has 0 bids', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress, setAuctionTimeToPivot, lastBlockStart, auctionStartTimestamp, pivotTimeStart;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    setAuctionTimeToPivot = new util_1.BigNumber(100000);
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress, setAuctionTimeToPivot)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, web3.eth.getBlock('latest')];
                                case 2:
                                    lastBlockStart = _a.sent();
                                    auctionStartTimestamp = new util_1.BigNumber(lastBlockStart.timestamp);
                                    pivotTimeStart = auctionStartTimestamp.add(setAuctionTimeToPivot).toNumber();
                                    timeKeeper.freeze(pivotTimeStart * 1000 + 1);
                                    // Fast forward to 1 second after pivot time
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, new util_1.BigNumber(pivotTimeStart).add(1).mul(1000))];
                                case 3:
                                    // Fast forward to 1 second after pivot time
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
                    test('updates the rebalancing properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedUnitShares, lastBlockEnd, auctionEndTimestamp, returnedRebalanceState, returnedCurrentSet, returnedUnitShares, returnedLastRebalanceTimestamp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.getExpectedUnitSharesAsync(rebalancingSetToken, nextSetToken, vault)];
                                case 1:
                                    expectedUnitShares = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, web3.eth.getBlock('latest')];
                                case 3:
                                    lastBlockEnd = _a.sent();
                                    auctionEndTimestamp = new util_1.BigNumber(lastBlockEnd.timestamp);
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                                case 4:
                                    returnedRebalanceState = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.currentSet(subjectRebalancingSetTokenAddress)];
                                case 5:
                                    returnedCurrentSet = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.unitShares(subjectRebalancingSetTokenAddress)];
                                case 6:
                                    returnedUnitShares = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.lastRebalanceTimestamp(subjectRebalancingSetTokenAddress)];
                                case 7:
                                    returnedLastRebalanceTimestamp = _a.sent();
                                    expect(returnedRebalanceState).to.eql('Default');
                                    expect(returnedCurrentSet).to.not.eql(nextSetToken.address);
                                    expect(returnedUnitShares).to.not.be.bignumber.equal(expectedUnitShares);
                                    expect(returnedLastRebalanceTimestamp).to.be.bignumber.equal(auctionEndTimestamp);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state, in the pivot time and\
    no units are remaining', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress, setAuctionTimeToPivot, lastBlockStart, auctionStartTimestamp, pivotTimeStart;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    setAuctionTimeToPivot = new util_1.BigNumber(100000);
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress, setAuctionTimeToPivot)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, rebalanceAuctionModule.bid.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue, false)];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, web3.eth.getBlock('latest')];
                                case 3:
                                    lastBlockStart = _a.sent();
                                    auctionStartTimestamp = new util_1.BigNumber(lastBlockStart.timestamp);
                                    pivotTimeStart = auctionStartTimestamp.add(setAuctionTimeToPivot).toNumber();
                                    timeKeeper.freeze(pivotTimeStart * 1000 + 1);
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
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Auction has no remaining bids. Cannot drawdown Set at " + rebalancingSetToken.address + ".")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state, is in the pivot time and has 1 bid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress, setAuctionTimeToPivot, lastBlockStart, auctionStartTimestamp, pivotTimeStart;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    setAuctionTimeToPivot = new util_1.BigNumber(100000);
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress, setAuctionTimeToPivot)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, web3.eth.getBlock('latest')];
                                case 2:
                                    lastBlockStart = _a.sent();
                                    auctionStartTimestamp = new util_1.BigNumber(lastBlockStart.timestamp);
                                    pivotTimeStart = auctionStartTimestamp.add(setAuctionTimeToPivot).toNumber();
                                    timeKeeper.freeze(pivotTimeStart * 1000 + 1);
                                    // Fast forward to 1 second after pivot time
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, new util_1.BigNumber(pivotTimeStart).add(1).mul(1000))];
                                case 3:
                                    // Fast forward to 1 second after pivot time
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
                    test('draws down the ', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedUnitShares, minimumBid, lastBlockEnd, auctionEndTimestamp, returnedRebalanceState, returnedCurrentSet, returnedUnitShares, returnedLastRebalanceTimestamp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.getExpectedUnitSharesAsync(rebalancingSetToken, nextSetToken, vault)];
                                case 1:
                                    expectedUnitShares = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 2:
                                    minimumBid = (_a.sent())[0];
                                    // Bid entire minus minimum amount
                                    return [4 /*yield*/, rebalanceAuctionModule.bid.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue.sub(minimumBid).sub(minimumBid), false)];
                                case 3:
                                    // Bid entire minus minimum amount
                                    _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, web3.eth.getBlock('latest')];
                                case 5:
                                    lastBlockEnd = _a.sent();
                                    auctionEndTimestamp = new util_1.BigNumber(lastBlockEnd.timestamp);
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                                case 6:
                                    returnedRebalanceState = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.currentSet(subjectRebalancingSetTokenAddress)];
                                case 7:
                                    returnedCurrentSet = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.unitShares(subjectRebalancingSetTokenAddress)];
                                case 8:
                                    returnedUnitShares = _a.sent();
                                    return [4 /*yield*/, rebalancingSetTokenWrapper.lastRebalanceTimestamp(subjectRebalancingSetTokenAddress)];
                                case 9:
                                    returnedLastRebalanceTimestamp = _a.sent();
                                    expect(returnedRebalanceState).to.eql('Drawdown');
                                    expect(returnedCurrentSet).to.not.eql(nextSetToken.address);
                                    expect(returnedUnitShares).to.not.be.bignumber.equal(expectedUnitShares);
                                    expect(returnedLastRebalanceTimestamp).to.be.bignumber.equal(auctionEndTimestamp);
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
    describe('bidAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.bidAsync(subjectRebalancingSetTokenAddress, subjectBidQuantity, subjectShouldWithdraw, subjectAllowPartialFill, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, proposalPeriod, managerAddress, priceCurve, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress, subjectBidQuantity, subjectCaller, subjectShouldWithdraw, subjectAllowPartialFill;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, _a, proposalComponentOne, proposalComponentTwo;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            _b = _c.sent(), currentSetToken = _b[0], nextSetToken = _b[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _c.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _c.sent();
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 6:
                            // Issue currentSetToken
                            _c.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _c.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 9:
                            // Deploy price curve used in auction
                            priceCurve = _c.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            subjectShouldWithdraw = false;
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectBidQuantity = rebalancingSetQuantityToIssue;
                            subjectAllowPartialFill = false;
                            subjectCaller = constants_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('subtract correct amount from remainingCurrentSets', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, existingRemainingCurrentSets, expectedRemainingCurrentSets, _b, newRemainingCurrentSets;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 1:
                                    _a = _c.sent(), existingRemainingCurrentSets = _a[1];
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _c.sent();
                                    expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
                                    return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 3:
                                    _b = _c.sent(), newRemainingCurrentSets = _b[1];
                                    expect(newRemainingCurrentSets).to.eql(expectedRemainingCurrentSets);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedTokenFlows, combinedTokenArray, oldSenderBalances, newSenderBalances, expectedSenderBalances;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                                case 1:
                                    expectedTokenFlows = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                case 2:
                                    combinedTokenArray = _a.sent();
                                    return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, rebalancingSetToken.address)];
                                case 3:
                                    oldSenderBalances = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, rebalancingSetToken.address)];
                                case 5:
                                    newSenderBalances = _a.sent();
                                    expectedSenderBalances = _.map(oldSenderBalances, function (balance, index) {
                                        return balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index]);
                                    });
                                    expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('transfers the correct amount of tokens to the bidder in the Vault', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedTokenFlows, combinedTokenArray, oldReceiverBalances, newReceiverBalances, expectedReceiverBalances;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                                case 1:
                                    expectedTokenFlows = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                case 2:
                                    combinedTokenArray = _a.sent();
                                    return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, constants_1.DEFAULT_ACCOUNT)];
                                case 3:
                                    oldReceiverBalances = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, constants_1.DEFAULT_ACCOUNT)];
                                case 5:
                                    newReceiverBalances = _a.sent();
                                    expectedReceiverBalances = _.map(oldReceiverBalances, function (balance, index) {
                                        return balance.add(expectedTokenFlows['outflow'][index]);
                                    });
                                    expect(JSON.stringify(newReceiverBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('transfers and withdraws the correct amount of tokens to the bidder wallet', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedTokenFlows, combinedTokenArray, oldReceiverBalances, newReceiverBalances, expectedReceiverBalances;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                                case 1:
                                    expectedTokenFlows = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                case 2:
                                    combinedTokenArray = _a.sent();
                                    return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, constants_1.DEFAULT_ACCOUNT); }))];
                                case 3:
                                    oldReceiverBalances = _a.sent();
                                    // Set withdrawal to true
                                    subjectShouldWithdraw = true;
                                    return [4 /*yield*/, subject()];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, constants_1.DEFAULT_ACCOUNT); }))];
                                case 5:
                                    newReceiverBalances = _a.sent();
                                    expectedReceiverBalances = _.map(oldReceiverBalances, function (balance, index) {
                                        return balance.add(expectedTokenFlows['outflow'][index]).sub(expectedTokenFlows['inflow'][index]);
                                    });
                                    expect(JSON.stringify(newReceiverBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('and the passed rebalancingSetToken is not tracked by Core', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectRebalancingSetTokenAddress = accounts_1.ACCOUNTS[5].address;
                                    return [2 /*return*/];
                                });
                            }); });
                            it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + subjectRebalancingSetTokenAddress + " is not a valid Set token address.")];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the bid amount is greater than remaining current sets', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectBidQuantity = util_1.ether(10);
                                    return [2 /*return*/];
                                });
                            }); });
                            it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, remainingCurrentSets;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                        case 1:
                                            _a = _b.sent(), remainingCurrentSets = _a[1];
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The submitted bid quantity, " + subjectBidQuantity + ", exceeds the remaining current sets," +
                                                    (" " + remainingCurrentSets + "."))];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the bid amount is not a multiple of the minimumBid', function () { return __awaiter(_this, void 0, void 0, function () {
                        var minimumBid;
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                        case 1:
                                            minimumBid = (_a.sent())[0];
                                            subjectBidQuantity = minimumBid.mul(1.5);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("The submitted bid quantity, " + subjectBidQuantity + ", must be a multiple of the minimumBid, " + minimumBid + ".")];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the caller has not approved inflow tokens for transfer', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectCaller = accounts_1.ACCOUNTS[3].address;
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var inflowArray, components;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity)];
                                        case 1:
                                            inflowArray = (_a.sent())[0];
                                            return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                        case 2:
                                            components = _a.sent();
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has allowance of 0\n\n        when required allowance is " + inflowArray[2] + " at token\n\n        address: " + components[2] + " for spender: " + transferProxy.address + ".\n      ")];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the caller does not have the balance to transfer', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                var components, approvalToken;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                                            return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                        case 1:
                                            components = _a.sent();
                                            return [4 /*yield*/, set_protocol_contracts_1.ERC20DetailedContract.at(components[2], web3, {})];
                                        case 2:
                                            approvalToken = _a.sent();
                                            return [4 /*yield*/, approvalToken.approve.sendTransactionAsync(transferProxy.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: subjectCaller })];
                                        case 3:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var inflowArray, components;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity)];
                                        case 1:
                                            inflowArray = (_a.sent())[0];
                                            return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                        case 2:
                                            components = _a.sent();
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has balance of 0\n\n        when required balance is " + inflowArray[2] + " at token address " + components[2] + ".\n      ")];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('bidWithEtherAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.bidWithEtherAsync(subjectRebalancingSetTokenAddress, subjectBidQuantity, subjectAllowPartialFill, { from: subjectCaller, value: subjectEthQuantity.toNumber() })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var rebalancingSetToken, defaultSetToken, wethSetToken, managerAddress, priceCurve, defaultBaseSetComponent, defaultBaseSetComponent2, wethBaseSetComponent, wethBaseSetComponent2, subjectRebalancingSetTokenAddress, subjectBidQuantity, subjectAllowPartialFill, subjectCaller, subjectEthQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var defaultComponentAddresses, defaultComponentUnits, defaultBaseSetNaturalUnit, nextComponentAddresses, wethComponentUnits, nextComponentUnits, wethBaseSetNaturalUnit, proposalPeriod, baseSetIssueQuantity, rebalancingSetTokenQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, decOne, decTwo, minBid;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            // Create component tokens for default Set
                            defaultBaseSetComponent = _b.sent();
                            return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 2:
                            defaultBaseSetComponent2 = _b.sent();
                            defaultComponentAddresses = [
                                defaultBaseSetComponent.address, defaultBaseSetComponent2.address,
                            ];
                            defaultComponentUnits = [
                                util_1.ether(0.01), util_1.ether(0.01),
                            ];
                            defaultBaseSetNaturalUnit = util_1.ether(0.001);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, defaultComponentAddresses, defaultComponentUnits, defaultBaseSetNaturalUnit)];
                        case 3:
                            defaultSetToken = _b.sent();
                            // Create component tokens for Set containing weth
                            wethBaseSetComponent = weth;
                            return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 4:
                            wethBaseSetComponent2 = _b.sent();
                            nextComponentAddresses = [
                                wethBaseSetComponent.address, wethBaseSetComponent2.address,
                            ];
                            wethComponentUnits = util_1.ether(0.01);
                            nextComponentUnits = [
                                wethComponentUnits, util_1.ether(0.01),
                            ];
                            wethBaseSetNaturalUnit = util_1.ether(0.001);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, nextComponentAddresses, nextComponentUnits, wethBaseSetNaturalUnit)];
                        case 5:
                            wethSetToken = _b.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, defaultSetToken.address, proposalPeriod)];
                        case 6:
                            rebalancingSetToken = _b.sent();
                            baseSetIssueQuantity = util_1.ether(1);
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                    defaultBaseSetComponent,
                                    defaultBaseSetComponent2,
                                ], transferProxy.address)];
                        case 7:
                            _b.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(defaultSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                        case 8:
                            _b.sent();
                            // Use issued defaultSetToken to issue rebalancingSetToken
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([defaultSetToken], transferProxy.address)];
                        case 9:
                            // Use issued defaultSetToken to issue rebalancingSetToken
                            _b.sent();
                            rebalancingSetTokenQuantityToIssue = util_1.ether(1);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue)];
                        case 10:
                            _b.sent();
                            return [4 /*yield*/, wethSetToken.getComponents.callAsync()];
                        case 11:
                            _a = _b.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 12:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 13:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 14:
                            // Deploy price curve used in auction
                            priceCurve = _b.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            return [4 /*yield*/, defaultSetToken.naturalUnit.callAsync()];
                        case 15:
                            decOne = _b.sent();
                            return [4 /*yield*/, wethSetToken.naturalUnit.callAsync()];
                        case 16:
                            decTwo = _b.sent();
                            minBid = new util_1.BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);
                            // Approve tokens to rebalancingSetEthBidder contract
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                    wethBaseSetComponent,
                                    wethBaseSetComponent2,
                                ], rebalancingSetEthBidder.address)];
                        case 17:
                            // Approve tokens to rebalancingSetEthBidder contract
                            _b.sent();
                            subjectEthQuantity = baseSetIssueQuantity.mul(wethComponentUnits).div(wethBaseSetNaturalUnit);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectBidQuantity = minBid;
                            subjectAllowPartialFill = false;
                            subjectCaller = constants_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, wethSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, wethSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('subtract correct amount from remainingCurrentSets', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, existingRemainingCurrentSets, expectedRemainingCurrentSets, _b, newRemainingCurrentSets;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 1:
                                    _a = _c.sent(), existingRemainingCurrentSets = _a[1];
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _c.sent();
                                    expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
                                    return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 3:
                                    _b = _c.sent(), newRemainingCurrentSets = _b[1];
                                    expect(newRemainingCurrentSets).to.eql(expectedRemainingCurrentSets);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedTokenFlows, combinedTokenArray, oldSenderBalances, newSenderBalances, expectedSenderBalances;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                                case 1:
                                    expectedTokenFlows = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                case 2:
                                    combinedTokenArray = _a.sent();
                                    return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, rebalancingSetToken.address)];
                                case 3:
                                    oldSenderBalances = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, rebalancingSetToken.address)];
                                case 5:
                                    newSenderBalances = _a.sent();
                                    expectedSenderBalances = _.map(oldSenderBalances, function (balance, index) {
                                        return balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index]);
                                    });
                                    expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('transfers and withdraws the correct amount of tokens to the bidder wallet', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedTokenFlows, combinedTokenArray, oldReceiverTokenBalances, oldEthBalance, _a, oldReceiverTokenAndEthBalances, txHash, newEthBalance, newReceiverTokenBalances, totalGasInEth, newReceiverTokenAndEthBalances, expectedReceiverBalances;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                                case 1:
                                    expectedTokenFlows = _b.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                case 2:
                                    combinedTokenArray = _b.sent();
                                    return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, constants_1.DEFAULT_ACCOUNT); }))];
                                case 3:
                                    oldReceiverTokenBalances = _b.sent();
                                    _a = util_1.BigNumber.bind;
                                    return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                                case 4:
                                    oldEthBalance = new (_a.apply(util_1.BigNumber, [void 0, _b.sent()]))();
                                    oldReceiverTokenAndEthBalances = _.map(oldReceiverTokenBalances, function (balance, index) {
                                        return combinedTokenArray[index] === weth.address ? new util_1.BigNumber(oldEthBalance) : balance;
                                    });
                                    return [4 /*yield*/, subject()];
                                case 5:
                                    txHash = _b.sent();
                                    return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                                case 6:
                                    newEthBalance = _b.sent();
                                    return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, constants_1.DEFAULT_ACCOUNT); }))];
                                case 7:
                                    newReceiverTokenBalances = _b.sent();
                                    return [4 /*yield*/, helpers_1.getGasUsageInEth(web3, txHash)];
                                case 8:
                                    totalGasInEth = _b.sent();
                                    newReceiverTokenAndEthBalances = _.map(newReceiverTokenBalances, function (balance, index) {
                                        return combinedTokenArray[index] === weth.address ? totalGasInEth.add(newEthBalance) : balance;
                                    });
                                    expectedReceiverBalances = _.map(oldReceiverTokenAndEthBalances, function (balance, index) {
                                        return balance.add(expectedTokenFlows['outflow'][index]).sub(expectedTokenFlows['inflow'][index]);
                                    });
                                    expect(JSON.stringify(newReceiverTokenAndEthBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('and the passed rebalancingSetToken is not tracked by Core', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectRebalancingSetTokenAddress = accounts_1.ACCOUNTS[5].address;
                                    return [2 /*return*/];
                                });
                            }); });
                            it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + subjectRebalancingSetTokenAddress + " is not a valid Set token address.")];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the bid amount is greater than remaining current sets', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectBidQuantity = util_1.ether(10);
                                    return [2 /*return*/];
                                });
                            }); });
                            it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, remainingCurrentSets;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                        case 1:
                                            _a = _b.sent(), remainingCurrentSets = _a[1];
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The submitted bid quantity, " + subjectBidQuantity + ", exceeds the remaining current sets," +
                                                    (" " + remainingCurrentSets + "."))];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the bid amount is not a multiple of the minimumBid', function () { return __awaiter(_this, void 0, void 0, function () {
                        var minimumBid;
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                        case 1:
                                            minimumBid = (_a.sent())[0];
                                            subjectBidQuantity = minimumBid.mul(0.5);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("The submitted bid quantity, " + subjectBidQuantity + ", must be a multiple of the minimumBid, " + minimumBid + ".")];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the caller has not approved inflow tokens for transfer', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectCaller = accounts_1.ACCOUNTS[3].address;
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var inflowArray, components;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity)];
                                        case 1:
                                            inflowArray = (_a.sent())[0];
                                            return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                        case 2:
                                            components = _a.sent();
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has allowance of 0\n\n        when required allowance is " + inflowArray[3] + " at token\n\n        address: " + components[3] + " for spender: " + rebalancingSetEthBidder.address + ".\n      ")];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the caller does not have the balance to transfer', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                var components, approvalToken;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                                            return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                        case 1:
                                            components = _a.sent();
                                            return [4 /*yield*/, set_protocol_contracts_1.ERC20DetailedContract.at(components[3], web3, {})];
                                        case 2:
                                            approvalToken = _a.sent();
                                            return [4 /*yield*/, approvalToken.approve.sendTransactionAsync(rebalancingSetEthBidder.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: subjectCaller })];
                                        case 3:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var inflowArray, components;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity)];
                                        case 1:
                                            inflowArray = (_a.sent())[0];
                                            return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                        case 2:
                                            components = _a.sent();
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has balance of 0\n\n        when required balance is " + inflowArray[3] + " at token address " + components[3] + ".\n      ")];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the caller did not send enough Ether', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectEthQuantity = constants_1.ZERO;
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Ether value must be greater than required wrapped ether quantity")];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('bidWithCTokenUnderlyingAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.bidWithCTokenUnderlyingAsync(subjectRebalancingSetTokenAddress, subjectBidQuantity, subjectAllowPartialFill, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var rebalancingSetToken, defaultSetToken, cTokenSetToken, managerAddress, priceCurve, defaultBaseSetComponent, defaultBaseSetComponent2, cTokenBaseSetComponent, cTokenBaseSetComponent2, subjectRebalancingSetTokenAddress, subjectBidQuantity, subjectAllowPartialFill, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var defaultComponentAddresses, defaultComponentUnits, defaultBaseSetNaturalUnit, nextComponentAddresses, nextComponentUnits, cTokenBaseSetNaturalUnit, proposalPeriod, baseSetIssueQuantity, rebalancingSetTokenQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, decOne, decTwo, minBid;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            // Create component tokens for default Set
                            defaultBaseSetComponent = _b.sent();
                            return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 2:
                            defaultBaseSetComponent2 = _b.sent();
                            defaultComponentAddresses = [
                                defaultBaseSetComponent.address, defaultBaseSetComponent2.address,
                            ];
                            defaultComponentUnits = [
                                util_1.ether(0.01), util_1.ether(0.01),
                            ];
                            defaultBaseSetNaturalUnit = util_1.ether(0.001);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, defaultComponentAddresses, defaultComponentUnits, defaultBaseSetNaturalUnit)];
                        case 3:
                            defaultSetToken = _b.sent();
                            // Create component tokens for Set containing cTokens
                            cTokenBaseSetComponent = cUSDCInstance;
                            cTokenBaseSetComponent2 = cDAIInstance;
                            nextComponentAddresses = [
                                cTokenBaseSetComponent.address, cTokenBaseSetComponent2.address,
                            ];
                            nextComponentUnits = [
                                util_1.ether(0.001), util_1.ether(1),
                            ];
                            cTokenBaseSetNaturalUnit = util_1.ether(0.001);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, nextComponentAddresses, nextComponentUnits, cTokenBaseSetNaturalUnit)];
                        case 4:
                            cTokenSetToken = _b.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, defaultSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _b.sent();
                            baseSetIssueQuantity = util_1.ether(1);
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                    defaultBaseSetComponent,
                                    defaultBaseSetComponent2,
                                ], transferProxy.address)];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(defaultSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                        case 7:
                            _b.sent();
                            // Use issued defaultSetToken to issue rebalancingSetToken
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([defaultSetToken], transferProxy.address)];
                        case 8:
                            // Use issued defaultSetToken to issue rebalancingSetToken
                            _b.sent();
                            rebalancingSetTokenQuantityToIssue = util_1.ether(1);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue)];
                        case 9:
                            _b.sent();
                            return [4 /*yield*/, cTokenSetToken.getComponents.callAsync()];
                        case 10:
                            _a = _b.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 11:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 12:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 13:
                            // Deploy price curve used in auction
                            priceCurve = _b.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            return [4 /*yield*/, defaultSetToken.naturalUnit.callAsync()];
                        case 14:
                            decOne = _b.sent();
                            return [4 /*yield*/, cTokenSetToken.naturalUnit.callAsync()];
                        case 15:
                            decTwo = _b.sent();
                            minBid = new util_1.BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);
                            // Approve tokens to rebalancingSetCTokenBidder contract
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                    usdcInstance,
                                    daiInstance,
                                ], rebalancingSetCTokenBidder.address)];
                        case 16:
                            // Approve tokens to rebalancingSetCTokenBidder contract
                            _b.sent();
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectBidQuantity = minBid;
                            subjectAllowPartialFill = false;
                            subjectCaller = constants_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, cTokenSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var auctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    auctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, cTokenSetToken.address, auctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('subtract correct amount from remainingCurrentSets', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, existingRemainingCurrentSets, expectedRemainingCurrentSets, _b, newRemainingCurrentSets;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 1:
                                    _a = _c.sent(), existingRemainingCurrentSets = _a[1];
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _c.sent();
                                    expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
                                    return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 3:
                                    _b = _c.sent(), newRemainingCurrentSets = _b[1];
                                    expect(newRemainingCurrentSets).to.eql(expectedRemainingCurrentSets);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedTokenFlows, combinedTokenArray, oldSenderBalances, newSenderBalances, expectedSenderBalances;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                                case 1:
                                    expectedTokenFlows = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                case 2:
                                    combinedTokenArray = _a.sent();
                                    return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, rebalancingSetToken.address)];
                                case 3:
                                    oldSenderBalances = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, rebalancingSetToken.address)];
                                case 5:
                                    newSenderBalances = _a.sent();
                                    expectedSenderBalances = _.map(oldSenderBalances, function (balance, index) {
                                        return balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index]);
                                    });
                                    expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('transfers and withdraws the correct amount of tokens to the bidder wallet', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedTokenFlows, combinedTokenArray, cUSDCExchangeRate, cDAIExchangeRate, expectedTokenFlowsUnderlying, oldReceiverTokenBalances, oldUnderlyingTokenBalances, oldReceiverTokenUnderlyingBalances, newReceiverTokenBalances, newUnderlyingTokenBalances, newReceiverTokenUnderlyingBalances, expectedReceiverBalances;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                                case 1:
                                    expectedTokenFlows = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                case 2:
                                    combinedTokenArray = _a.sent();
                                    return [4 /*yield*/, compoundHelper.getExchangeRateCurrent(cUSDCInstance.address)];
                                case 3:
                                    cUSDCExchangeRate = _a.sent();
                                    return [4 /*yield*/, compoundHelper.getExchangeRateCurrent(cDAIInstance.address)];
                                case 4:
                                    cDAIExchangeRate = _a.sent();
                                    expectedTokenFlowsUnderlying = helpers_1.replaceFlowsWithCTokenUnderlyingAsync(expectedTokenFlows, combinedTokenArray, [cUSDCInstance.address, cDAIInstance.address], [usdcInstance.address, daiInstance.address], [cUSDCExchangeRate, cDAIExchangeRate]);
                                    return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, constants_1.DEFAULT_ACCOUNT); }))];
                                case 5:
                                    oldReceiverTokenBalances = _a.sent();
                                    return [4 /*yield*/, Promise.all([
                                            usdcInstance.address,
                                            daiInstance.address,
                                        ].map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, constants_1.DEFAULT_ACCOUNT); }))];
                                case 6:
                                    oldUnderlyingTokenBalances = _a.sent();
                                    oldReceiverTokenUnderlyingBalances = _.map(oldReceiverTokenBalances, function (balance, index) {
                                        if (combinedTokenArray[index] === cUSDCInstance.address) {
                                            return oldUnderlyingTokenBalances[0];
                                        }
                                        else if (combinedTokenArray[index] === cDAIInstance.address) {
                                            return oldUnderlyingTokenBalances[1];
                                        }
                                        else {
                                            return balance;
                                        }
                                    });
                                    return [4 /*yield*/, subject()];
                                case 7:
                                    _a.sent();
                                    return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, constants_1.DEFAULT_ACCOUNT); }))];
                                case 8:
                                    newReceiverTokenBalances = _a.sent();
                                    return [4 /*yield*/, Promise.all([
                                            usdcInstance.address,
                                            daiInstance.address,
                                        ].map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, constants_1.DEFAULT_ACCOUNT); }))];
                                case 9:
                                    newUnderlyingTokenBalances = _a.sent();
                                    newReceiverTokenUnderlyingBalances = _.map(newReceiverTokenBalances, function (balance, index) {
                                        if (combinedTokenArray[index] === cUSDCInstance.address) {
                                            return newUnderlyingTokenBalances[0];
                                        }
                                        else if (combinedTokenArray[index] === cDAIInstance.address) {
                                            return newUnderlyingTokenBalances[1];
                                        }
                                        else {
                                            return balance;
                                        }
                                    });
                                    expectedReceiverBalances = _.map(oldReceiverTokenUnderlyingBalances, function (balance, index) {
                                        return balance
                                            .add(expectedTokenFlowsUnderlying['outflow'][index])
                                            .sub(expectedTokenFlowsUnderlying['inflow'][index]);
                                    });
                                    expect(JSON.stringify(newReceiverTokenUnderlyingBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('and the passed rebalancingSetToken is not tracked by Core', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectRebalancingSetTokenAddress = accounts_1.ACCOUNTS[5].address;
                                    return [2 /*return*/];
                                });
                            }); });
                            it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + subjectRebalancingSetTokenAddress + " is not a valid Set token address.")];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the bid amount is greater than remaining current sets', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectBidQuantity = util_1.ether(10);
                                    return [2 /*return*/];
                                });
                            }); });
                            it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, remainingCurrentSets;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                        case 1:
                                            _a = _b.sent(), remainingCurrentSets = _a[1];
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The submitted bid quantity, " + subjectBidQuantity + ", exceeds the remaining current sets," +
                                                    (" " + remainingCurrentSets + "."))];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the bid amount is not a multiple of the minimumBid', function () { return __awaiter(_this, void 0, void 0, function () {
                        var minimumBid;
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                        case 1:
                                            minimumBid = (_a.sent())[0];
                                            subjectBidQuantity = minimumBid.mul(0.5);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("The submitted bid quantity, " + subjectBidQuantity + ", must be a multiple of the minimumBid, " + minimumBid + ".")];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the caller has not approved inflow tokens for transfer', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectCaller = accounts_1.ACCOUNTS[3].address;
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var expectedTokenFlows, combinedTokenArray, cUSDCExchangeRate, cDAIExchangeRate, expectedTokenFlowsUnderlying;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                                        case 1:
                                            expectedTokenFlows = _a.sent();
                                            return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                        case 2:
                                            combinedTokenArray = _a.sent();
                                            return [4 /*yield*/, compoundHelper.getExchangeRateCurrent(cUSDCInstance.address)];
                                        case 3:
                                            cUSDCExchangeRate = _a.sent();
                                            return [4 /*yield*/, compoundHelper.getExchangeRateCurrent(cDAIInstance.address)];
                                        case 4:
                                            cDAIExchangeRate = _a.sent();
                                            expectedTokenFlowsUnderlying = helpers_1.replaceFlowsWithCTokenUnderlyingAsync(expectedTokenFlows, combinedTokenArray, [cUSDCInstance.address, cDAIInstance.address], [usdcInstance.address, daiInstance.address], [cUSDCExchangeRate, cDAIExchangeRate]);
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has allowance of 0\n\n        when required allowance is " + expectedTokenFlowsUnderlying['inflow'][2] + " at token\n\n        address: " + usdcInstance.address + " for spender: " + rebalancingSetCTokenBidder.address + ".\n      ")];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the caller does not have the balance to transfer', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                var approvalToken, approvalToken2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            subjectCaller = accounts_1.ACCOUNTS[3].address;
                                            return [4 /*yield*/, set_protocol_contracts_1.ERC20DetailedContract.at(usdcInstance.address, web3, {})];
                                        case 1:
                                            approvalToken = _a.sent();
                                            return [4 /*yield*/, approvalToken.approve.sendTransactionAsync(rebalancingSetCTokenBidder.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: subjectCaller })];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, set_protocol_contracts_1.ERC20DetailedContract.at(daiInstance.address, web3, {})];
                                        case 3:
                                            approvalToken2 = _a.sent();
                                            return [4 /*yield*/, approvalToken2.approve.sendTransactionAsync(rebalancingSetCTokenBidder.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: subjectCaller })];
                                        case 4:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var expectedTokenFlows, combinedTokenArray, cUSDCExchangeRate, cDAIExchangeRate, expectedTokenFlowsUnderlying;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                                        case 1:
                                            expectedTokenFlows = _a.sent();
                                            return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                        case 2:
                                            combinedTokenArray = _a.sent();
                                            return [4 /*yield*/, compoundHelper.getExchangeRateCurrent(cUSDCInstance.address)];
                                        case 3:
                                            cUSDCExchangeRate = _a.sent();
                                            return [4 /*yield*/, compoundHelper.getExchangeRateCurrent(cDAIInstance.address)];
                                        case 4:
                                            cDAIExchangeRate = _a.sent();
                                            expectedTokenFlowsUnderlying = helpers_1.replaceFlowsWithCTokenUnderlyingAsync(expectedTokenFlows, combinedTokenArray, [cUSDCInstance.address, cDAIInstance.address], [usdcInstance.address, daiInstance.address], [cUSDCExchangeRate, cDAIExchangeRate]);
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has balance of 0\n\n        when required balance is " + expectedTokenFlowsUnderlying['inflow'][2] + " at token address " + usdcInstance.address + ".\n      ")];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('updateManagerAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.updateManagerAsync(subjectRebalancingSetTokenAddress, subjectNewManager, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, rebalancingSetToken, managerAddress, subjectRebalancingSetTokenAddress, subjectNewManager, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, proposalPeriod;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            currentSetToken = (_a.sent())[0];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _a.sent();
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectNewManager = accounts_1.ACCOUNTS[2].address;
                            subjectCaller = managerAddress;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it changes the set manager correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var returnedManager;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.manager(subjectRebalancingSetTokenAddress)];
                        case 2:
                            returnedManager = _a.sent();
                            expect(returnedManager).to.eql(subjectNewManager);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the updateManager is not called by the manager', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = accounts_1.ACCOUNTS[2].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Caller " + subjectCaller + " is not the manager of this Rebalancing Set Token.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('redeemFromFailedRebalanceAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.redeemFromFailedRebalanceAsync(subjectRebalancingSetTokenAddress, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, proposalPeriod, managerAddress, priceCurve, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, _a, proposalComponentOne, proposalComponentTwo;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            _b = _c.sent(), currentSetToken = _b[0], nextSetToken = _b[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _c.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _c.sent();
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 6:
                            // Issue currentSetToken
                            _c.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _c.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 9:
                            // Deploy price curve used in auction
                            priceCurve = _c.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectCaller = constants_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Drawdown state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Drawdown state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Drawdown state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Drawdown state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress, setBidAmount;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    setBidAmount = util_1.ether(1);
                                    return [4 /*yield*/, helpers_1.transitionToDrawdownAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress, rebalanceAuctionModule, setBidAmount)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('transfers the collateral to owner after burning the rebalancing Set', function () { return __awaiter(_this, void 0, void 0, function () {
                        var returnedRebalanceState, combinedTokenArray, existingCollateralBalances, expectedRBSetTokenBalance, currentRBSetTokenBalance, newOwnerVaultBalances;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                                case 1:
                                    returnedRebalanceState = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                case 2:
                                    combinedTokenArray = _a.sent();
                                    return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, subjectRebalancingSetTokenAddress)];
                                case 3:
                                    existingCollateralBalances = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 4:
                                    _a.sent();
                                    expectedRBSetTokenBalance = new util_1.BigNumber(0);
                                    return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                                case 5:
                                    currentRBSetTokenBalance = _a.sent();
                                    return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, subjectCaller)];
                                case 6:
                                    newOwnerVaultBalances = _a.sent();
                                    expect(returnedRebalanceState).to.eql('Drawdown');
                                    expect(expectedRBSetTokenBalance.toString()).to.eql(currentRBSetTokenBalance.toString());
                                    expect(JSON.stringify(existingCollateralBalances)).to.be.eql(JSON.stringify(newOwnerVaultBalances));
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
    describe('getBidPriceAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getBidPriceAsync(subjectRebalancingSetTokenAddress, subjectBidQuantity)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, proposalPeriod, managerAddress, priceCurve, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress, subjectBidQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, _a, proposalComponentOne, proposalComponentTwo;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            _b = _c.sent(), currentSetToken = _b[0], nextSetToken = _b[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _c.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _c.sent();
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 6:
                            // Issue currentSetToken
                            _c.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _c.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 9:
                            // Deploy price curve used in auction
                            priceCurve = _c.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectBidQuantity = rebalancingSetQuantityToIssue;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('it fetches the correct token flow details arrays', function () { return __awaiter(_this, void 0, void 0, function () {
                        var returnedTokenFlowDetailsArrays, expectedTokenAddresses, expectedTokenFlowDetailsArrays, returnedInflowArray, expectedInflowArray, returnedOutflowArray, expectedOutflowArray;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    returnedTokenFlowDetailsArrays = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                case 2:
                                    expectedTokenAddresses = _a.sent();
                                    return [4 /*yield*/, helpers_1.constructInflowOutflowAddressesArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, expectedTokenAddresses)];
                                case 3:
                                    expectedTokenFlowDetailsArrays = _a.sent();
                                    returnedInflowArray = JSON.stringify(returnedTokenFlowDetailsArrays['inflow']);
                                    expectedInflowArray = JSON.stringify(expectedTokenFlowDetailsArrays['inflow']);
                                    expect(returnedInflowArray).to.eql(expectedInflowArray);
                                    returnedOutflowArray = JSON.stringify(returnedTokenFlowDetailsArrays['outflow']);
                                    expectedOutflowArray = JSON.stringify(expectedTokenFlowDetailsArrays['outflow']);
                                    expect(returnedOutflowArray).to.eql(expectedOutflowArray);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('it filters out components with zero units from token flows', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedOutflowDetailsZeroCount, expectedInflowDetailsZeroCount, returnedTokenFlowDetailsArrays, _a, returnedInflowArray, returnedOutflowArray, returnedInflowZeroCount, returnedOutflowZeroCount, returnedInflowDetailsZeroCount, returnedOutflowDetailsZeroCount;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    expectedOutflowDetailsZeroCount = 2;
                                    expectedInflowDetailsZeroCount = 2;
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    returnedTokenFlowDetailsArrays = _b.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity)];
                                case 2:
                                    _a = _b.sent(), returnedInflowArray = _a[0], returnedOutflowArray = _a[1];
                                    returnedInflowZeroCount = returnedInflowArray.reduce(function (accumulator, unit) {
                                        var bigNumberUnit = new util_1.BigNumber(unit);
                                        if (bigNumberUnit.eq(0)) {
                                            accumulator++;
                                        }
                                        return accumulator;
                                    }, 0);
                                    returnedOutflowZeroCount = returnedOutflowArray.reduce(function (accumulator, unit) {
                                        var bigNumberUnit = new util_1.BigNumber(unit);
                                        if (bigNumberUnit.eq(0)) {
                                            accumulator++;
                                        }
                                        return accumulator;
                                    }, 0);
                                    returnedInflowDetailsZeroCount = returnedTokenFlowDetailsArrays.inflow.reduce(function (accumulator, component) {
                                        var bigNumberUnit = new util_1.BigNumber(component.unit);
                                        if (bigNumberUnit.eq(0)) {
                                            accumulator++;
                                        }
                                        return accumulator;
                                    }, 0);
                                    returnedOutflowDetailsZeroCount = returnedTokenFlowDetailsArrays.outflow.reduce(function (accumulator, component) {
                                        var bigNumberUnit = new util_1.BigNumber(component.unit);
                                        if (bigNumberUnit.eq(0)) {
                                            accumulator++;
                                        }
                                        return accumulator;
                                    }, 0);
                                    // Ensure there are inflow / outflow components with zero amounts
                                    expect(returnedInflowZeroCount).to.eql(expectedInflowDetailsZeroCount);
                                    expect(returnedOutflowZeroCount).to.eql(expectedOutflowDetailsZeroCount);
                                    // Expect subject to filter out 0s
                                    expect(returnedInflowDetailsZeroCount).to.eql(0);
                                    expect(returnedOutflowDetailsZeroCount).to.eql(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('and the bid amount is greater than remaining current sets', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectBidQuantity = util_1.ether(10);
                                    return [2 /*return*/];
                                });
                            }); });
                            it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, remainingCurrentSets;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                        case 1:
                                            _a = _b.sent(), remainingCurrentSets = _a[1];
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The submitted bid quantity, " + subjectBidQuantity + ", exceeds the remaining current sets," +
                                                    (" " + remainingCurrentSets + "."))];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the bid amount is not a multiple of the minimumBid', function () { return __awaiter(_this, void 0, void 0, function () {
                        var minimumBid;
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                        case 1:
                                            minimumBid = (_a.sent())[0];
                                            subjectBidQuantity = minimumBid.mul(1.5);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("The submitted bid quantity, " + subjectBidQuantity + ", must be a multiple of the minimumBid, " + minimumBid + ".")];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getBidPriceCTokenUnderlyingAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getBidPriceCTokenUnderlyingAsync(subjectRebalancingSetTokenAddress, subjectBidQuantity)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var rebalancingSetToken, defaultSetToken, cTokenSetToken, managerAddress, priceCurve, defaultBaseSetComponent, defaultBaseSetComponent2, cTokenBaseSetComponent, cTokenBaseSetComponent2, subjectRebalancingSetTokenAddress, subjectBidQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var defaultComponentAddresses, defaultComponentUnits, defaultBaseSetNaturalUnit, nextComponentAddresses, nextComponentUnits, cTokenBaseSetNaturalUnit, proposalPeriod, baseSetIssueQuantity, rebalancingSetTokenQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, decOne, decTwo, minBid;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            // Create component tokens for default Set
                            defaultBaseSetComponent = _b.sent();
                            return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 2:
                            defaultBaseSetComponent2 = _b.sent();
                            defaultComponentAddresses = [
                                defaultBaseSetComponent.address, defaultBaseSetComponent2.address,
                            ];
                            defaultComponentUnits = [
                                util_1.ether(0.01), util_1.ether(0.01),
                            ];
                            defaultBaseSetNaturalUnit = util_1.ether(0.001);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, defaultComponentAddresses, defaultComponentUnits, defaultBaseSetNaturalUnit)];
                        case 3:
                            defaultSetToken = _b.sent();
                            // Create component tokens for Set containing cTokens
                            cTokenBaseSetComponent = cUSDCInstance;
                            cTokenBaseSetComponent2 = cDAIInstance;
                            nextComponentAddresses = [
                                cTokenBaseSetComponent.address, cTokenBaseSetComponent2.address,
                            ];
                            nextComponentUnits = [
                                util_1.ether(0.001), util_1.ether(1),
                            ];
                            cTokenBaseSetNaturalUnit = util_1.ether(0.001);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, nextComponentAddresses, nextComponentUnits, cTokenBaseSetNaturalUnit)];
                        case 4:
                            cTokenSetToken = _b.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, defaultSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _b.sent();
                            baseSetIssueQuantity = util_1.ether(1);
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                    defaultBaseSetComponent,
                                    defaultBaseSetComponent2,
                                ], transferProxy.address)];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(defaultSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                        case 7:
                            _b.sent();
                            // Use issued defaultSetToken to issue rebalancingSetToken
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([defaultSetToken], transferProxy.address)];
                        case 8:
                            // Use issued defaultSetToken to issue rebalancingSetToken
                            _b.sent();
                            rebalancingSetTokenQuantityToIssue = util_1.ether(1);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue)];
                        case 9:
                            _b.sent();
                            return [4 /*yield*/, cTokenSetToken.getComponents.callAsync()];
                        case 10:
                            _a = _b.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 11:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 12:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 13:
                            // Deploy price curve used in auction
                            priceCurve = _b.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            return [4 /*yield*/, defaultSetToken.naturalUnit.callAsync()];
                        case 14:
                            decOne = _b.sent();
                            return [4 /*yield*/, cTokenSetToken.naturalUnit.callAsync()];
                        case 15:
                            decTwo = _b.sent();
                            minBid = new util_1.BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);
                            // Approve tokens to rebalancingSetCTokenBidder contract
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                    usdcInstance,
                                    daiInstance,
                                ], rebalancingSetCTokenBidder.address)];
                        case 16:
                            // Approve tokens to rebalancingSetCTokenBidder contract
                            _b.sent();
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectBidQuantity = minBid;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, cTokenSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, cTokenSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('it fetches the correct token flow details arrays', function () { return __awaiter(_this, void 0, void 0, function () {
                        var returnedTokenFlowDetailsArrays, expectedTokenAddresses, expectedTokenFlowDetailsArrays, cUSDCExchangeRate, cDAIExchangeRate, expectedTokenFlowDetailsUnderlyingArrays, returnedInflowArray, expectedInflowArray, returnedOutflowArray, expectedOutflowArray;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    returnedTokenFlowDetailsArrays = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                                case 2:
                                    expectedTokenAddresses = _a.sent();
                                    return [4 /*yield*/, helpers_1.constructInflowOutflowAddressesArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, expectedTokenAddresses)];
                                case 3:
                                    expectedTokenFlowDetailsArrays = _a.sent();
                                    return [4 /*yield*/, compoundHelper.getExchangeRate(cUSDCInstance.address)];
                                case 4:
                                    cUSDCExchangeRate = _a.sent();
                                    return [4 /*yield*/, compoundHelper.getExchangeRate(cDAIInstance.address)];
                                case 5:
                                    cDAIExchangeRate = _a.sent();
                                    expectedTokenFlowDetailsUnderlyingArrays = helpers_1.replaceDetailFlowsWithCTokenUnderlyingAsync(expectedTokenFlowDetailsArrays, [cUSDCInstance.address, cDAIInstance.address], [usdcInstance.address, daiInstance.address], [cUSDCExchangeRate, cDAIExchangeRate]);
                                    returnedInflowArray = JSON.stringify(returnedTokenFlowDetailsArrays['inflow']);
                                    expectedInflowArray = JSON.stringify(expectedTokenFlowDetailsUnderlyingArrays['inflow']);
                                    expect(returnedInflowArray).to.eql(expectedInflowArray);
                                    returnedOutflowArray = JSON.stringify(returnedTokenFlowDetailsArrays['outflow']);
                                    expectedOutflowArray = JSON.stringify(expectedTokenFlowDetailsUnderlyingArrays['outflow']);
                                    expect(returnedOutflowArray).to.eql(expectedOutflowArray);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('it filters out components with zero units from token flows', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedOutflowDetailsZeroCount, expectedInflowDetailsZeroCount, returnedTokenFlowDetailsArrays, _a, returnedInflowArray, returnedOutflowArray, returnedInflowZeroCount, returnedOutflowZeroCount, returnedInflowDetailsZeroCount, returnedOutflowDetailsZeroCount;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    expectedOutflowDetailsZeroCount = 2;
                                    expectedInflowDetailsZeroCount = 2;
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    returnedTokenFlowDetailsArrays = _b.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getBidPrice.callAsync(subjectBidQuantity)];
                                case 2:
                                    _a = _b.sent(), returnedInflowArray = _a[0], returnedOutflowArray = _a[1];
                                    returnedInflowZeroCount = returnedInflowArray.reduce(function (accumulator, unit) {
                                        var bigNumberUnit = new util_1.BigNumber(unit);
                                        if (bigNumberUnit.eq(0)) {
                                            accumulator++;
                                        }
                                        return accumulator;
                                    }, 0);
                                    returnedOutflowZeroCount = returnedOutflowArray.reduce(function (accumulator, unit) {
                                        var bigNumberUnit = new util_1.BigNumber(unit);
                                        if (bigNumberUnit.eq(0)) {
                                            accumulator++;
                                        }
                                        return accumulator;
                                    }, 0);
                                    returnedInflowDetailsZeroCount = returnedTokenFlowDetailsArrays.inflow.reduce(function (accumulator, component) {
                                        var bigNumberUnit = new util_1.BigNumber(component.unit);
                                        if (bigNumberUnit.eq(0)) {
                                            accumulator++;
                                        }
                                        return accumulator;
                                    }, 0);
                                    returnedOutflowDetailsZeroCount = returnedTokenFlowDetailsArrays.outflow.reduce(function (accumulator, component) {
                                        var bigNumberUnit = new util_1.BigNumber(component.unit);
                                        if (bigNumberUnit.eq(0)) {
                                            accumulator++;
                                        }
                                        return accumulator;
                                    }, 0);
                                    // Ensure there are inflow / outflow components with zero amounts
                                    expect(returnedInflowZeroCount).to.eql(expectedInflowDetailsZeroCount);
                                    expect(returnedOutflowZeroCount).to.eql(expectedOutflowDetailsZeroCount);
                                    // Expect subject to filter out 0s
                                    expect(returnedInflowDetailsZeroCount).to.eql(0);
                                    expect(returnedOutflowDetailsZeroCount).to.eql(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('and the bid amount is greater than remaining current sets', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectBidQuantity = util_1.ether(10);
                                    return [2 /*return*/];
                                });
                            }); });
                            it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, remainingCurrentSets;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                        case 1:
                                            _a = _b.sent(), remainingCurrentSets = _a[1];
                                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The submitted bid quantity, " + subjectBidQuantity + ", exceeds the remaining current sets," +
                                                    (" " + remainingCurrentSets + "."))];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('and the bid amount is not a multiple of the minimumBid', function () { return __awaiter(_this, void 0, void 0, function () {
                        var minimumBid;
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                        case 1:
                                            minimumBid = (_a.sent())[0];
                                            subjectBidQuantity = minimumBid.mul(0.8);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("The submitted bid quantity, " + subjectBidQuantity + ", must be a multiple of the minimumBid, " + minimumBid + ".")];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getRebalanceStateAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getRebalanceStateAsync(subjectRebalancingSetTokenAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, rebalancingSetToken, proposalPeriod, managerAddress, subjectRebalancingSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setTokensToDeploy = 1;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            currentSetToken = (_a.sent())[0];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _a.sent();
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns the rebalancing token state', function () { return __awaiter(_this, void 0, void 0, function () {
                var states;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            states = _a.sent();
                            expect(states).to.eql('Default');
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the rebalancing set address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetTokenAddress = 'InvalidRebalancingSetTokenAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected rebalancingSetTokenAddress to conform to schema /Address.\n\n        Encountered: \"InvalidRebalancingSetTokenAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getRebalanceStatesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getRebalanceStatesAsync(subjectRebalancingSetTokenAddresses)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, rebalancingSetToken, proposalPeriod, managerAddress, subjectRebalancingSetTokenAddresses;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setTokensToDeploy = 1;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            currentSetToken = (_a.sent())[0];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _a.sent();
                            subjectRebalancingSetTokenAddresses = [rebalancingSetToken.address];
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns the rebalancing token state', function () { return __awaiter(_this, void 0, void 0, function () {
                var state;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            state = _a.sent();
                            expect(state).to.eql(['Default']);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the rebalancing set address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetTokenAddresses = ['InvalidRebalancingSetTokenAddress'];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected rebalancingSetTokenAddress to conform to schema /Address.\n\n        Encountered: \"InvalidRebalancingSetTokenAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getUnitSharesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getUnitSharesAsync(subjectRebalancingSetTokenAddresses)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, rebalancingSetToken, proposalPeriod, managerAddress, subjectRebalancingSetTokenAddresses;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setTokensToDeploy = 1;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            currentSetToken = (_a.sent())[0];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _a.sent();
                            subjectRebalancingSetTokenAddresses = [rebalancingSetToken.address];
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns the rebalancing token state', function () { return __awaiter(_this, void 0, void 0, function () {
                var unitShares, expectedUnitShares;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            unitShares = _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.unitShares.callAsync()];
                        case 2:
                            expectedUnitShares = _a.sent();
                            expect(unitShares[0]).to.eql(expectedUnitShares.toString());
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the rebalancing set address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetTokenAddresses = ['InvalidRebalancingSetTokenAddress'];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected rebalancingSetTokenAddress to conform to schema /Address.\n\n        Encountered: \"InvalidRebalancingSetTokenAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getRebalancingSetCurrentSetAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getRebalancingSetCurrentSetAsync(subjectRebalancingSetTokenAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, rebalancingSetToken, proposalPeriod, managerAddress, subjectRebalancingSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setTokensToDeploy = 1;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            currentSetToken = (_a.sent())[0];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _a.sent();
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns the set token address', function () { return __awaiter(_this, void 0, void 0, function () {
                var currentSetAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            currentSetAddress = _a.sent();
                            expect(currentSetAddress).to.eql(currentSetToken.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getBidPlacedEventsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getBidPlacedEventsAsync(subjectFromBlock, subjectToBlock, subjectRebalancingSetToken, subjectGetTimestamp)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var rebalancingSetToken, currentSetToken, nextSetToken, bid1BlockNumber, earlyTxnHash, earlyBlockNumber, earlyBlockTimestamp, bidQuantity, allowPartialFill, bidderAccount, bid1TxnHash, bid2TxnHash, subjectFromBlock, subjectToBlock, subjectRebalancingSetToken, subjectGetTimestamp;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokens, proposalPeriod, managerAddress, rebalancingSetQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice, rebalancingSetToken2, earlyTransaction, firstBidTransaction, bid1Block, lastBidTransaction, bidBlockNumber;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, 2)];
                        case 1:
                            setTokens = _b.sent();
                            currentSetToken = setTokens[0];
                            nextSetToken = setTokens[1];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _b.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 3:
                            // Issue currentSetToken
                            earlyTxnHash = _b.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 4:
                            _b.sent();
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 6:
                            _a = _b.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 7:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 8:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 9:
                            priceCurve = _b.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            auctionPriceCurveAddress = priceCurve.address;
                            setAuctionTimeToPivot = new util_1.BigNumber(100000);
                            setAuctionStartPrice = new util_1.BigNumber(500);
                            setAuctionPivotPrice = new util_1.BigNumber(1000);
                            return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                        case 10:
                            _b.sent();
                            bidQuantity = util_1.ether(2);
                            allowPartialFill = false;
                            bidderAccount = constants_1.DEFAULT_ACCOUNT;
                            return [4 /*yield*/, rebalancingAuctionModuleWrapper.bid(rebalancingSetToken.address, bidQuantity, allowPartialFill, { from: bidderAccount })];
                        case 11:
                            bid1TxnHash = _b.sent();
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 12:
                            rebalancingSetToken2 = _b.sent();
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 13:
                            // Issue currentSetToken
                            _b.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 14:
                            _b.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken2.address, rebalancingSetQuantityToIssue)];
                        case 15:
                            // Use issued currentSetToken to issue rebalancingSetToken
                            _b.sent();
                            return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken2, managerAddress, nextSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                        case 16:
                            _b.sent();
                            return [4 /*yield*/, rebalancingAuctionModuleWrapper.bid(rebalancingSetToken2.address, bidQuantity, allowPartialFill, { from: bidderAccount })];
                        case 17:
                            bid2TxnHash = _b.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(earlyTxnHash)];
                        case 18:
                            earlyTransaction = _b.sent();
                            earlyBlockNumber = earlyTransaction['blockNumber'];
                            return [4 /*yield*/, web3.eth.getTransaction(bid1TxnHash)];
                        case 19:
                            firstBidTransaction = _b.sent();
                            bid1BlockNumber = firstBidTransaction['blockNumber'];
                            return [4 /*yield*/, web3.eth.getBlock(bid1BlockNumber)];
                        case 20:
                            bid1Block = _b.sent();
                            earlyBlockTimestamp = bid1Block.timestamp;
                            return [4 /*yield*/, web3.eth.getTransaction(bid2TxnHash)];
                        case 21:
                            lastBidTransaction = _b.sent();
                            bidBlockNumber = lastBidTransaction['blockNumber'];
                            subjectFromBlock = earlyBlockNumber;
                            subjectToBlock = bidBlockNumber;
                            subjectRebalancingSetToken = undefined;
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
            test('retrieves the correct properties', function () { return __awaiter(_this, void 0, void 0, function () {
                var events, firstEvent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _a.sent();
                            firstEvent = events[0];
                            expect(firstEvent.transactionHash).to.equal(bid1TxnHash);
                            expect(firstEvent.rebalancingSetToken).to.equal(rebalancingSetToken.address);
                            expect(firstEvent.executionQuantity).to.bignumber.equal(bidQuantity);
                            expect(firstEvent.timestamp).to.equal(earlyBlockTimestamp);
                            expect(firstEvent.blockNumber).to.equal(bid1BlockNumber);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getBidPlacedHelperEventsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getBidPlacedHelperEventsAsync(subjectBidderType, subjectFromBlock, subjectToBlock, subjectRebalancingSetToken, subjectGetTimestamp)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var rebalancingSetToken, defaultSetToken, wethSetToken, cTokenSetToken, earlyTxnHash, earlyBlockNumber, earlyBlockTimestamp, defaultBaseSetComponent, defaultBaseSetComponent2, wethBaseSetComponent, wethBaseSetComponent2, wethComponentUnits, wethBaseSetNaturalUnit, cTokenBaseSetComponent, cTokenBaseSetComponent2, bidQuantity, allowPartialFill, bidderAccount, bid1TxnHash, bid2TxnHash, subjectBidderType, subjectFromBlock, subjectToBlock, subjectRebalancingSetToken, subjectEthQuantity, subjectGetTimestamp;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var defaultComponentAddresses, defaultComponentUnits, defaultBaseSetNaturalUnit, nextWethComponentAddresses, nextWethComponentUnits, nextCTokenComponentAddresses, nextCTokenComponentUnits, cTokenBaseSetNaturalUnit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            // Create component tokens for default Set
                            defaultBaseSetComponent = _a.sent();
                            return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 2:
                            defaultBaseSetComponent2 = _a.sent();
                            defaultComponentAddresses = [
                                defaultBaseSetComponent.address, defaultBaseSetComponent2.address,
                            ];
                            defaultComponentUnits = [
                                util_1.ether(0.01), util_1.ether(0.01),
                            ];
                            defaultBaseSetNaturalUnit = util_1.ether(0.001);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, defaultComponentAddresses, defaultComponentUnits, defaultBaseSetNaturalUnit)];
                        case 3:
                            defaultSetToken = _a.sent();
                            // Create component tokens for Set containing weth
                            wethBaseSetComponent = weth;
                            return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 4:
                            wethBaseSetComponent2 = _a.sent();
                            nextWethComponentAddresses = [
                                wethBaseSetComponent.address, wethBaseSetComponent2.address,
                            ];
                            wethComponentUnits = util_1.ether(0.01);
                            nextWethComponentUnits = [
                                wethComponentUnits, util_1.ether(0.01),
                            ];
                            wethBaseSetNaturalUnit = util_1.ether(0.001);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, nextWethComponentAddresses, nextWethComponentUnits, wethBaseSetNaturalUnit)];
                        case 5:
                            wethSetToken = _a.sent();
                            // Create component tokens for Set containing cTokens
                            cTokenBaseSetComponent = cUSDCInstance;
                            cTokenBaseSetComponent2 = cDAIInstance;
                            nextCTokenComponentAddresses = [
                                cTokenBaseSetComponent.address, cTokenBaseSetComponent2.address,
                            ];
                            nextCTokenComponentUnits = [
                                util_1.ether(0.001), util_1.ether(1),
                            ];
                            cTokenBaseSetNaturalUnit = util_1.ether(0.001);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, nextCTokenComponentAddresses, nextCTokenComponentUnits, cTokenBaseSetNaturalUnit)];
                        case 6:
                            cTokenSetToken = _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when bidder type inputted is ETH bidder helper', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var proposalPeriod, managerAddress, baseSetIssueQuantity, rebalancingSetTokenQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice, decOne, decTwo, minBid, rebalancingSetToken2, earlyTransaction, firstBidTransaction, bid1BlockNumber, bid1Block, lastBidTransaction, bidBlockNumber;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                    managerAddress = accounts_1.ACCOUNTS[1].address;
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, defaultSetToken.address, proposalPeriod)];
                                case 1:
                                    rebalancingSetToken = _b.sent();
                                    baseSetIssueQuantity = util_1.ether(1);
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                            defaultBaseSetComponent,
                                            defaultBaseSetComponent2,
                                        ], transferProxy.address)];
                                case 2:
                                    _b.sent();
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(defaultSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                                case 3:
                                    earlyTxnHash = _b.sent();
                                    // Use issued defaultSetToken to issue rebalancingSetToken
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([defaultSetToken], transferProxy.address)];
                                case 4:
                                    // Use issued defaultSetToken to issue rebalancingSetToken
                                    _b.sent();
                                    rebalancingSetTokenQuantityToIssue = util_1.ether(1);
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue)];
                                case 5:
                                    _b.sent();
                                    return [4 /*yield*/, wethSetToken.getComponents.callAsync()];
                                case 6:
                                    _a = _b.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                                case 7:
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                                case 8:
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                                case 9:
                                    priceCurve = _b.sent();
                                    helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                                    auctionPriceCurveAddress = priceCurve.address;
                                    setAuctionTimeToPivot = new util_1.BigNumber(100000);
                                    setAuctionStartPrice = new util_1.BigNumber(500);
                                    setAuctionPivotPrice = new util_1.BigNumber(1000);
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, wethSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                                case 10:
                                    _b.sent();
                                    return [4 /*yield*/, defaultSetToken.naturalUnit.callAsync()];
                                case 11:
                                    decOne = _b.sent();
                                    return [4 /*yield*/, wethSetToken.naturalUnit.callAsync()];
                                case 12:
                                    decTwo = _b.sent();
                                    minBid = new util_1.BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);
                                    bidQuantity = minBid;
                                    allowPartialFill = false;
                                    bidderAccount = constants_1.DEFAULT_ACCOUNT;
                                    // Approve tokens to rebalancingSetEthBidder contract
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                            wethBaseSetComponent,
                                            wethBaseSetComponent2,
                                        ], rebalancingSetEthBidder.address)];
                                case 13:
                                    // Approve tokens to rebalancingSetEthBidder contract
                                    _b.sent();
                                    subjectEthQuantity = baseSetIssueQuantity.mul(wethComponentUnits).div(wethBaseSetNaturalUnit);
                                    return [4 /*yield*/, rebalancingSetEthBidderWrapper.bidAndWithdrawWithEther(rebalancingSetToken.address, bidQuantity, allowPartialFill, { from: bidderAccount, value: subjectEthQuantity.toNumber() })];
                                case 14:
                                    bid1TxnHash = _b.sent();
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, defaultSetToken.address, proposalPeriod)];
                                case 15:
                                    rebalancingSetToken2 = _b.sent();
                                    // Issue defaultSetToken
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(defaultSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                                case 16:
                                    // Issue defaultSetToken
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([defaultSetToken], transferProxy.address)];
                                case 17:
                                    _b.sent();
                                    // Use issued defaultSetToken to issue rebalancingSetToken
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken2.address, rebalancingSetTokenQuantityToIssue)];
                                case 18:
                                    // Use issued defaultSetToken to issue rebalancingSetToken
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken2, managerAddress, wethSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                                case 19:
                                    _b.sent();
                                    return [4 /*yield*/, rebalancingSetEthBidderWrapper.bidAndWithdrawWithEther(rebalancingSetToken2.address, bidQuantity, allowPartialFill, { from: bidderAccount, value: subjectEthQuantity.toNumber() })];
                                case 20:
                                    bid2TxnHash = _b.sent();
                                    return [4 /*yield*/, web3.eth.getTransaction(earlyTxnHash)];
                                case 21:
                                    earlyTransaction = _b.sent();
                                    earlyBlockNumber = earlyTransaction['blockNumber'];
                                    return [4 /*yield*/, web3.eth.getTransaction(bid1TxnHash)];
                                case 22:
                                    firstBidTransaction = _b.sent();
                                    bid1BlockNumber = firstBidTransaction['blockNumber'];
                                    return [4 /*yield*/, web3.eth.getBlock(bid1BlockNumber)];
                                case 23:
                                    bid1Block = _b.sent();
                                    earlyBlockTimestamp = bid1Block.timestamp;
                                    return [4 /*yield*/, web3.eth.getTransaction(bid2TxnHash)];
                                case 24:
                                    lastBidTransaction = _b.sent();
                                    bidBlockNumber = lastBidTransaction['blockNumber'];
                                    subjectBidderType = new util_1.BigNumber(0);
                                    subjectFromBlock = earlyBlockNumber;
                                    subjectToBlock = bidBlockNumber;
                                    subjectRebalancingSetToken = undefined;
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
                    test('retrieves the correct properties', function () { return __awaiter(_this, void 0, void 0, function () {
                        var events, firstEvent;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    events = _a.sent();
                                    firstEvent = events[0];
                                    expect(bid1TxnHash).to.equal(firstEvent.transactionHash);
                                    expect(bidderAccount).to.equal(firstEvent.bidder);
                                    expect(rebalancingSetToken.address).to.equal(firstEvent.rebalancingSetToken);
                                    expect(earlyBlockTimestamp).to.equal(firstEvent.timestamp);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when bidder type inputted is cToken bidder helper', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var proposalPeriod, managerAddress, baseSetIssueQuantity, rebalancingSetTokenQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice, decOne, decTwo, minBid, rebalancingSetToken2, earlyTransaction, firstBidTransaction, bid1BlockNumber, bid1Block, lastBidTransaction, bidBlockNumber;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                    managerAddress = accounts_1.ACCOUNTS[1].address;
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, defaultSetToken.address, proposalPeriod)];
                                case 1:
                                    rebalancingSetToken = _b.sent();
                                    baseSetIssueQuantity = util_1.ether(1);
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                            defaultBaseSetComponent,
                                            defaultBaseSetComponent2,
                                        ], transferProxy.address)];
                                case 2:
                                    _b.sent();
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(defaultSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                                case 3:
                                    earlyTxnHash = _b.sent();
                                    // Use issued defaultSetToken to issue rebalancingSetToken
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([defaultSetToken], transferProxy.address)];
                                case 4:
                                    // Use issued defaultSetToken to issue rebalancingSetToken
                                    _b.sent();
                                    rebalancingSetTokenQuantityToIssue = util_1.ether(1);
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue)];
                                case 5:
                                    _b.sent();
                                    return [4 /*yield*/, cTokenSetToken.getComponents.callAsync()];
                                case 6:
                                    _a = _b.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                                case 7:
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                                case 8:
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                                case 9:
                                    priceCurve = _b.sent();
                                    helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                                    auctionPriceCurveAddress = priceCurve.address;
                                    setAuctionTimeToPivot = new util_1.BigNumber(100000);
                                    setAuctionStartPrice = new util_1.BigNumber(500);
                                    setAuctionPivotPrice = new util_1.BigNumber(1000);
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, cTokenSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                                case 10:
                                    _b.sent();
                                    return [4 /*yield*/, defaultSetToken.naturalUnit.callAsync()];
                                case 11:
                                    decOne = _b.sent();
                                    return [4 /*yield*/, cTokenSetToken.naturalUnit.callAsync()];
                                case 12:
                                    decTwo = _b.sent();
                                    minBid = new util_1.BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);
                                    bidQuantity = minBid;
                                    allowPartialFill = false;
                                    bidderAccount = constants_1.DEFAULT_ACCOUNT;
                                    // Approve underlying tokens to rebalancingSetCTokenBidder contract
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                            usdcInstance,
                                            daiInstance,
                                        ], rebalancingSetCTokenBidder.address)];
                                case 13:
                                    // Approve underlying tokens to rebalancingSetCTokenBidder contract
                                    _b.sent();
                                    return [4 /*yield*/, rebalancingSetCTokenBidderWrapper.bidAndWithdraw(rebalancingSetToken.address, bidQuantity, allowPartialFill, { from: bidderAccount })];
                                case 14:
                                    bid1TxnHash = _b.sent();
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, defaultSetToken.address, proposalPeriod)];
                                case 15:
                                    rebalancingSetToken2 = _b.sent();
                                    // Issue defaultSetToken
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(defaultSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                                case 16:
                                    // Issue defaultSetToken
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([defaultSetToken], transferProxy.address)];
                                case 17:
                                    _b.sent();
                                    // Use issued defaultSetToken to issue rebalancingSetToken
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken2.address, rebalancingSetTokenQuantityToIssue)];
                                case 18:
                                    // Use issued defaultSetToken to issue rebalancingSetToken
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken2, managerAddress, cTokenSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                                case 19:
                                    _b.sent();
                                    return [4 /*yield*/, rebalancingSetCTokenBidderWrapper.bidAndWithdraw(rebalancingSetToken2.address, bidQuantity, allowPartialFill, { from: bidderAccount })];
                                case 20:
                                    bid2TxnHash = _b.sent();
                                    return [4 /*yield*/, web3.eth.getTransaction(earlyTxnHash)];
                                case 21:
                                    earlyTransaction = _b.sent();
                                    earlyBlockNumber = earlyTransaction['blockNumber'];
                                    return [4 /*yield*/, web3.eth.getTransaction(bid1TxnHash)];
                                case 22:
                                    firstBidTransaction = _b.sent();
                                    bid1BlockNumber = firstBidTransaction['blockNumber'];
                                    return [4 /*yield*/, web3.eth.getBlock(bid1BlockNumber)];
                                case 23:
                                    bid1Block = _b.sent();
                                    earlyBlockTimestamp = bid1Block.timestamp;
                                    return [4 /*yield*/, web3.eth.getTransaction(bid2TxnHash)];
                                case 24:
                                    lastBidTransaction = _b.sent();
                                    bidBlockNumber = lastBidTransaction['blockNumber'];
                                    subjectBidderType = new util_1.BigNumber(1);
                                    subjectFromBlock = earlyBlockNumber;
                                    subjectToBlock = bidBlockNumber;
                                    subjectRebalancingSetToken = undefined;
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
                    test('retrieves the correct properties', function () { return __awaiter(_this, void 0, void 0, function () {
                        var events, firstEvent;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    events = _a.sent();
                                    firstEvent = events[0];
                                    expect(bid1TxnHash).to.equal(firstEvent.transactionHash);
                                    expect(bidderAccount).to.equal(firstEvent.bidder);
                                    expect(rebalancingSetToken.address).to.equal(firstEvent.rebalancingSetToken);
                                    expect(earlyBlockTimestamp).to.equal(firstEvent.timestamp);
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
    describe('getDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getDetailsAsync(subjectRebalancingSetTokenAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, rebalancingSetToken, proposalPeriod, managerAddress, priceCurve, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress, standardRebalanceInterval;
        var _this = this;
        return __generator(this, function (_a) {
            standardRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setTokensToDeploy = 1;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            currentSetToken = (_a.sent())[0];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _a.sent();
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 3:
                            // Issue currentSetToken
                            _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 4:
                            _a.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 6:
                            // Deploy price curve used in auction
                            priceCurve = _a.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns the rebalancing token properties', function () { return __awaiter(_this, void 0, void 0, function () {
                var details, lastRebalancedAt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                        case 2:
                            lastRebalancedAt = _a.sent();
                            expect(details.lastRebalancedAt).to.bignumber.equal(lastRebalancedAt);
                            expect(details.address).to.eql(subjectRebalancingSetTokenAddress);
                            expect(details.factoryAddress).to.eql(rebalancingSetTokenFactory.address);
                            expect(details.managerAddress).to.eql(managerAddress);
                            expect(details.currentSetAddress).to.eql(currentSetToken.address);
                            expect(details.unitShares).to.bignumber.equal(constants_1.DEFAULT_UNIT_SHARES);
                            expect(details.naturalUnit).to.bignumber.equal(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                            expect(details.state).to.eql('Default');
                            expect(details.supply).to.bignumber.equal(rebalancingSetQuantityToIssue);
                            expect(details.name).to.eql('Rebalancing Set Token');
                            expect(details.symbol).to.eql('RBSET');
                            expect(details.proposalPeriod).to.bignumber.equal(proposalPeriod);
                            expect(details.rebalanceInterval).to.bignumber.equal(standardRebalanceInterval);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getProposalDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getProposalDetailsAsync(subjectRebalancingSetTokenAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, proposalPeriod, managerAddress, priceCurve, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, _a, proposalComponentOne, proposalComponentTwo;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            _b = _c.sent(), currentSetToken = _b[0], nextSetToken = _b[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _c.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _c.sent();
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 6:
                            // Issue currentSetToken
                            _c.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _c.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 9:
                            // Deploy price curve used in auction
                            priceCurve = _c.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Proposal state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var setAuctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    setAuctionTimeToPivot = new util_1.BigNumber(100000);
                                    setAuctionStartPrice = new util_1.BigNumber(500);
                                    setAuctionPivotPrice = new util_1.BigNumber(1000);
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('returns the proper proposal details', function () { return __awaiter(_this, void 0, void 0, function () {
                        var proposalDetails, proposedAt;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    proposalDetails = _a.sent();
                                    expect(proposalDetails.state).to.equal('Proposal');
                                    expect(proposalDetails.nextSetAddress).eql(nextSetToken.address);
                                    expect(proposalDetails.pricingLibraryAddress).eql(setAuctionPriceCurveAddress);
                                    expect(proposalDetails.timeToPivot).to.bignumber.equal(setAuctionTimeToPivot);
                                    expect(proposalDetails.startingPrice).to.bignumber.equal(setAuctionStartPrice);
                                    expect(proposalDetails.auctionPivotPrice).to.bignumber.equal(setAuctionPivotPrice);
                                    return [4 /*yield*/, rebalancingSetToken.proposalStartTime.callAsync()];
                                case 2:
                                    proposedAt = _a.sent();
                                    expect(proposalDetails.proposalStartTime).to.bignumber.equal(proposedAt);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var setAuctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    setAuctionTimeToPivot = new util_1.BigNumber(100000);
                                    setAuctionStartPrice = new util_1.BigNumber(500);
                                    setAuctionPivotPrice = new util_1.BigNumber(1000);
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('returns the proper proposal details', function () { return __awaiter(_this, void 0, void 0, function () {
                        var proposalDetails, proposedAt;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    proposalDetails = _a.sent();
                                    expect(proposalDetails.state).to.equal('Rebalance');
                                    expect(proposalDetails.nextSetAddress).eql(nextSetToken.address);
                                    expect(proposalDetails.pricingLibraryAddress).eql(setAuctionPriceCurveAddress);
                                    expect(proposalDetails.timeToPivot).to.bignumber.equal(setAuctionTimeToPivot);
                                    expect(proposalDetails.startingPrice).to.bignumber.equal(setAuctionStartPrice);
                                    expect(proposalDetails.auctionPivotPrice).to.bignumber.equal(setAuctionPivotPrice);
                                    return [4 /*yield*/, rebalancingSetToken.proposalStartTime.callAsync()];
                                case 2:
                                    proposedAt = _a.sent();
                                    expect(proposalDetails.proposalStartTime).to.bignumber.equal(proposedAt);
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
    describe('getRebalanceDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getRebalanceDetailsAsync(subjectRebalancingSetTokenAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, proposalPeriod, managerAddress, priceCurve, rebalancingSetQuantityToIssue, currentSetStartingQuantity, subjectRebalancingSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, _a, proposalComponentOne, proposalComponentTwo;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            _b = _c.sent(), currentSetToken = _b[0], nextSetToken = _b[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _c.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _c.sent();
                            // Issue currentSetToken
                            currentSetStartingQuantity = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, currentSetStartingQuantity, constants_1.TX_DEFAULTS)];
                        case 6:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _c.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 9:
                            // Deploy price curve used in auction
                            priceCurve = _c.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var setAuctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice, setCurrentSetStartingQuantity;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setCurrentSetStartingQuantity = currentSetStartingQuantity;
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    setAuctionTimeToPivot = new util_1.BigNumber(100000);
                                    setAuctionStartPrice = new util_1.BigNumber(500);
                                    setAuctionPivotPrice = new util_1.BigNumber(1000);
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('returns the proper rebalancing details', function () { return __awaiter(_this, void 0, void 0, function () {
                        var rebalanceDetails, rebalancingStartedAt, _a, minimumBid, remainingCurrentSets;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    rebalanceDetails = _b.sent();
                                    expect(rebalanceDetails.state).to.equal('Rebalance');
                                    return [4 /*yield*/, rebalancingSetToken.getAuctionPriceParameters.callAsync()];
                                case 2:
                                    rebalancingStartedAt = (_b.sent())[0];
                                    expect(rebalanceDetails.rebalancingStartedAt).to.bignumber.equal(rebalancingStartedAt);
                                    return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 3:
                                    _a = _b.sent(), minimumBid = _a[0], remainingCurrentSets = _a[1];
                                    expect(rebalanceDetails.remainingCurrentSet).to.bignumber.equal(remainingCurrentSets);
                                    expect(rebalanceDetails.minimumBid).to.bignumber.equal(minimumBid);
                                    expect(rebalanceDetails.startingCurrentSetAmount).to.bignumber.equal(setCurrentSetStartingQuantity);
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
    describe('getRebalancingSetAuctionRemainingCurrentSets', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAPI.getRebalancingSetAuctionRemainingCurrentSets(subjectRebalancingSetTokenAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, proposalPeriod, managerAddress, priceCurve, rebalancingSetQuantityToIssue, currentSetStartingQuantity, subjectRebalancingSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, _a, proposalComponentOne, proposalComponentTwo;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            _b = _c.sent(), currentSetToken = _b[0], nextSetToken = _b[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _c.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _c.sent();
                            // Issue currentSetToken
                            currentSetStartingQuantity = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, currentSetStartingQuantity, constants_1.TX_DEFAULTS)];
                        case 6:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _c.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 9:
                            // Deploy price curve used in auction
                            priceCurve = _c.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('throw', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Rebalancing token at " + subjectRebalancingSetTokenAddress + " must be in Rebalance state to call that function.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('returns the proper rebalancing details', function () { return __awaiter(_this, void 0, void 0, function () {
                        var rebalancingAuctionRemainingCurrentShares, _a, remainingCurrentSets;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    rebalancingAuctionRemainingCurrentShares = _b.sent();
                                    return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 2:
                                    _a = _b.sent(), remainingCurrentSets = _a[1];
                                    expect(rebalancingAuctionRemainingCurrentShares).to.bignumber.equal(remainingCurrentSets);
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
//# sourceMappingURL=RebalancingAPI.spec.js.map