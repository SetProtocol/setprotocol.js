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
var _ = __importStar(require("lodash"));
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
var accounts_2 = require("@src/constants/accounts");
var helpers_1 = require("@test/helpers");
var util_1 = require("@src/util");
var common_1 = require("@src/types/common");
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
describe('RebalancingManagerAPI', function () {
    var core;
    var transferProxy;
    var factory;
    var rebalancingFactory;
    var constantAuctionPriceCurve;
    var btcMedianizer;
    var ethMedianizer;
    var wrappedBTC;
    var wrappedETH;
    var dai;
    var usdc;
    var whitelist;
    var rebalancingManagerAPI;
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var protocolViewer, setProtocolConfig, assertions;
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
                    return [4 /*yield*/, helpers_1.deployMedianizerAsync(web3)];
                case 5:
                    ethMedianizer = _c.sent();
                    return [4 /*yield*/, helpers_1.addPriceFeedOwnerToMedianizer(ethMedianizer, accounts_1.DEFAULT_ACCOUNT)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(4, [8, 18, 18, 6], web3, accounts_1.DEFAULT_ACCOUNT)];
                case 7:
                    _b = _c.sent(), wrappedBTC = _b[0], wrappedETH = _b[1], dai = _b[2], usdc = _b[3];
                    return [4 /*yield*/, helpers_1.approveForTransferAsync([wrappedBTC, wrappedETH, dai, usdc], transferProxy.address)];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, wrappedBTC.address)];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, wrappedETH.address)];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, dai.address)];
                case 11:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, usdc.address)];
                case 12:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                case 13:
                    constantAuctionPriceCurve = _c.sent();
                    helpers_1.addPriceCurveToCoreAsync(core, constantAuctionPriceCurve.address);
                    return [4 /*yield*/, helpers_1.deployProtocolViewerAsync(web3)];
                case 14:
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
                    rebalancingManagerAPI = new api_1.RebalancingManagerAPI(web3, assertions, setProtocolConfig);
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
    describe('BTCETHRebalancingManager', function () { return __awaiter(_this, void 0, void 0, function () {
        var btcethRebalancingManager, btcMultiplier, ethMultiplier, auctionTimeToPivot, maximumLowerThreshold, minimumUpperThreshold;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            btcMultiplier = new util_1.BigNumber(1);
                            ethMultiplier = new util_1.BigNumber(1);
                            auctionTimeToPivot = constants_1.ONE_DAY_IN_SECONDS;
                            maximumLowerThreshold = new util_1.BigNumber(48);
                            minimumUpperThreshold = new util_1.BigNumber(52);
                            return [4 /*yield*/, helpers_1.deployBtcEthManagerContractAsync(web3, core.address, btcMedianizer.address, ethMedianizer.address, wrappedBTC.address, wrappedETH.address, factory.address, constantAuctionPriceCurve.address, auctionTimeToPivot, [btcMultiplier, ethMultiplier], [maximumLowerThreshold, minimumUpperThreshold])];
                        case 1:
                            btcethRebalancingManager = _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('getBTCETHRebalancingManagerDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.getBTCETHRebalancingManagerDetailsAsync(subjectManagerAddress)];
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
                            subjectManagerAddress = btcethRebalancingManager.address;
                            return [2 /*return*/];
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
                    test('gets the correct btcPriceFeed address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.btcPriceFeed).to.equal(btcMedianizer.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct ethPriceFeed address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.ethPriceFeed).to.equal(ethMedianizer.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct btcAddress address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.btcAddress).to.equal(wrappedBTC.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct ethAddress address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.ethAddress).to.equal(wrappedETH.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct setTokenFactory address', function () { return __awaiter(_this, void 0, void 0, function () {
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
                    test('gets the correct btcMultiplier address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.btcMultiplier).to.bignumber.equal(btcMultiplier);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct ethMultiplier address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.ethMultiplier).to.bignumber.equal(ethMultiplier);
                                    return [2 /*return*/];
                            }
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
                    test('gets the correct maximumLowerThreshold', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.maximumLowerThreshold).to.bignumber.equal(maximumLowerThreshold);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct minimumUpperThreshold', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.minimumUpperThreshold).to.bignumber.equal(minimumUpperThreshold);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('proposeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, timeFastForward)];
                                case 1:
                                    _a.sent();
                                    timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
                                    return [2 /*return*/, rebalancingManagerAPI.proposeAsync(subjectManagerType, subjectManagerAddress, subjectRebalancingSetToken, { from: subjectCaller })];
                            }
                        });
                    });
                }
                var rebalancingSetToken, proposalPeriod, btcPrice, ethPrice, ethUnit, initialAllocationToken, timeFastForward, nextRebalanceAvailableInSeconds, subjectManagerType, subjectRebalancingSetToken, subjectManagerAddress, subjectCaller, btcethManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    btcethManagerWrapper = new wrappers_1.BTCETHRebalancingManagerWrapper(web3);
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            btcPrice = new util_1.BigNumber(4082 * Math.pow(10, 18));
                            ethPrice = new util_1.BigNumber(128 * Math.pow(10, 18));
                            ethUnit = new util_1.BigNumber(28.999 * Math.pow(10, 10));
                            return [2 /*return*/];
                        });
                    }); });
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds, rebalanceInterval;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [wrappedBTC.address, wrappedETH.address], [new util_1.BigNumber(1).mul(btcMultiplier), ethUnit.mul(ethMultiplier)], new util_1.BigNumber(Math.pow(10, 10)))];
                                case 1:
                                    initialAllocationToken = _a.sent();
                                    proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, btcethRebalancingManager.address, initialAllocationToken.address, proposalPeriod)];
                                case 2:
                                    rebalancingSetToken = _a.sent();
                                    timeFastForward = constants_1.ONE_DAY_IN_SECONDS.add(1);
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, btcMedianizer, btcPrice, SetTestUtils.generateTimestamp(1000))];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, ethPrice, SetTestUtils.generateTimestamp(1000))];
                                case 4:
                                    _a.sent();
                                    subjectManagerType = common_1.ManagerType.BTCETH;
                                    subjectManagerAddress = btcethRebalancingManager.address;
                                    subjectRebalancingSetToken = rebalancingSetToken.address;
                                    subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                                    return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                                case 5:
                                    lastRebalancedTimestampSeconds = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.rebalanceInterval.callAsync()];
                                case 6:
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
                    describe('when price trigger is not met', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    btcPrice = new util_1.BigNumber(3700 * Math.pow(10, 18));
                                    return [2 /*return*/];
                                });
                            }); });
                            afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    btcPrice = new util_1.BigNumber(4082 * Math.pow(10, 18));
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                var btcAllocationAmount;
                                return __generator(this, function (_a) {
                                    btcAllocationAmount = new util_1.BigNumber(49);
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Current BTC allocation " + btcAllocationAmount.toString() + "% must be outside allocation bounds " +
                                            (maximumLowerThreshold.toString() + " and " + minimumUpperThreshold.toString() + "."))];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('when the RebalancingSet is not in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
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
                                            // Call propose to transition out of Default
                                            return [4 /*yield*/, btcethManagerWrapper.propose(btcethRebalancingManager.address, rebalancingSetToken.address)];
                                        case 2:
                                            // Call propose to transition out of Default
                                            _a.sent();
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
                    describe('when the rebalanceInterval has not elapsed', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    timeFastForward = new util_1.BigNumber(1);
                                    nextRebalanceAvailableInSeconds = nextRebalanceAvailableInSeconds.sub(1);
                                    return [2 /*return*/];
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
                    describe('when invalid rebalancing set token is passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectRebalancingSetToken = accounts_2.ACCOUNTS[2].address;
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + subjectRebalancingSetToken + " is not a valid Set token address.")];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('when invalid rebalancing manager type is passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectManagerType = new util_1.BigNumber(4);
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Passed manager type is not recognized.")];
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
    describe('MACOStrategyManager', function () { return __awaiter(_this, void 0, void 0, function () {
        var macoManager, movingAverageOracle, initialStableCollateral, initialRiskCollateral, rebalancingSetToken, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime, priceFeedUpdateFrequency, initialMedianizerEthPrice, priceFeedDataDescription, seededPriceFeedPrices, movingAverageDays, stableCollateralUnit, stableCollateralNaturalUnit, riskCollateralUnit, riskCollateralNaturalUnit, initializedProposalTimestamp;
        var _this = this;
        return __generator(this, function (_a) {
            priceFeedUpdateFrequency = new util_1.BigNumber(10);
            initialMedianizerEthPrice = constants_1.E18;
            priceFeedDataDescription = '200DailyETHPrice';
            seededPriceFeedPrices = [
                constants_1.E18.mul(1),
                constants_1.E18.mul(2),
                constants_1.E18.mul(3),
                constants_1.E18.mul(4),
                constants_1.E18.mul(5),
            ];
            movingAverageDays = new util_1.BigNumber(5);
            stableCollateralUnit = new util_1.BigNumber(250);
            stableCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 12));
            riskCollateralUnit = new util_1.BigNumber(Math.pow(10, 6));
            riskCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 6));
            initializedProposalTimestamp = new util_1.BigNumber(0);
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var dailyPriceFeed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            crossoverConfirmationMinTime = constants_1.ONE_HOUR_IN_SECONDS.mul(6);
                            crossoverConfirmationMaxTime = constants_1.ONE_HOUR_IN_SECONDS.mul(12);
                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice, SetTestUtils.generateTimestamp(1000))];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.deployHistoricalPriceFeedAsync(web3, priceFeedUpdateFrequency, ethMedianizer.address, priceFeedDataDescription, seededPriceFeedPrices)];
                        case 2:
                            dailyPriceFeed = _a.sent();
                            return [4 /*yield*/, helpers_1.deployMovingAverageOracleAsync(web3, dailyPriceFeed.address, priceFeedDataDescription)];
                        case 3:
                            movingAverageOracle = _a.sent();
                            auctionTimeToPivot = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [usdc.address], [stableCollateralUnit], stableCollateralNaturalUnit)];
                        case 4:
                            // Create Stable Collateral Set
                            initialStableCollateral = _a.sent();
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [wrappedETH.address], [riskCollateralUnit], riskCollateralNaturalUnit)];
                        case 5:
                            // Create Risk Collateral Set
                            initialRiskCollateral = _a.sent();
                            return [4 /*yield*/, helpers_1.deployMovingAverageStrategyManagerAsync(web3, core.address, movingAverageOracle.address, usdc.address, wrappedETH.address, initialStableCollateral.address, initialRiskCollateral.address, factory.address, constantAuctionPriceCurve.address, movingAverageDays, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime)];
                        case 6:
                            macoManager = _a.sent();
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, macoManager.address, initialRiskCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                        case 7:
                            rebalancingSetToken = _a.sent();
                            return [4 /*yield*/, helpers_1.initializeManagerAsync(macoManager, rebalancingSetToken.address)];
                        case 8:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('getMovingAverageManagerDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.getMovingAverageManagerDetailsAsync(common_1.ManagerType.MACO, subjectManagerAddress)];
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
            describe('getLastCrossoverConfirmationTimestampAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.getLastCrossoverConfirmationTimestampAsync(subjectManagerType, subjectManagerAddress)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerType, subjectManagerAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectManagerType = common_1.ManagerType.MACO;
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
            describe('initiateCrossoverProposeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.initiateCrossoverProposeAsync(subjectManagerType, subjectManagerAddress, { from: subjectCaller })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerAddress, subjectManagerType, subjectCaller, nextRebalanceAvailableInSeconds, macoManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    macoManagerWrapper = new wrappers_1.MACOStrategyManagerWrapper(web3);
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds, rebalanceInterval;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    subjectManagerAddress = macoManager.address;
                                    subjectManagerType = common_1.ManagerType.MACO;
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
                                            return [4 /*yield*/, helpers_1.initializeManagerAsync(macoManager, rebalancingSetToken.address)];
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
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.confirmCrossoverProposeAsync(subjectManagerType, subjectManagerAddress, { from: subjectCaller })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerAddress, subjectManagerType, subjectCaller, nextRebalanceAvailableInSeconds, macoManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    macoManagerWrapper = new wrappers_1.MACOStrategyManagerWrapper(web3);
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds, rebalanceInterval;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    subjectManagerAddress = macoManager.address;
                                    subjectManagerType = common_1.ManagerType.MACO;
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
                                var lastCrossoverConfirmationTimestamp, newDesiredTimestamp;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            currentPrice = initialMedianizerEthPrice.mul(5);
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
                                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, currentPrice, SetTestUtils.generateTimestamp(2000))];
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
                                var lastCrossoverConfirmationTimestamp, newDesiredTimestamp;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, helpers_1.deployMovingAverageStrategyManagerAsync(web3, core.address, movingAverageOracle.address, usdc.address, wrappedETH.address, initialStableCollateral.address, initialRiskCollateral.address, factory.address, constantAuctionPriceCurve.address, movingAverageDays, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime)];
                                        case 1:
                                            macoManager = _a.sent();
                                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, macoManager.address, initialStableCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                                        case 2:
                                            rebalancingSetToken = _a.sent();
                                            return [4 /*yield*/, helpers_1.initializeManagerAsync(macoManager, rebalancingSetToken.address)];
                                        case 3:
                                            _a.sent();
                                            currentPriceThatIsBelowMA = initialMedianizerEthPrice.div(10);
                                            // Elapse the rebalance interval
                                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                        case 4:
                                            // Elapse the rebalance interval
                                            _a.sent();
                                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.mul(5), SetTestUtils.generateTimestamp(1000))];
                                        case 5:
                                            _a.sent();
                                            subjectManagerAddress = macoManager.address;
                                            // Call initialPropose to set the timestamp
                                            return [4 /*yield*/, macoManagerWrapper.initialPropose(subjectManagerAddress)];
                                        case 6:
                                            // Call initialPropose to set the timestamp
                                            _a.sent();
                                            // Elapse 7 hours
                                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(7))];
                                        case 7:
                                            // Elapse 7 hours
                                            _a.sent();
                                            // Need to perform a transaction to further the timestamp
                                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, currentPriceThatIsBelowMA, SetTestUtils.generateTimestamp(2000))];
                                        case 8:
                                            // Need to perform a transaction to further the timestamp
                                            _a.sent();
                                            return [4 /*yield*/, macoManager.lastCrossoverConfirmationTimestamp.callAsync(macoManager)];
                                        case 9:
                                            lastCrossoverConfirmationTimestamp = _a.sent();
                                            newDesiredTimestamp = lastCrossoverConfirmationTimestamp.plus(constants_1.ONE_HOUR_IN_SECONDS.mul(7));
                                            timeKeeper.freeze(newDesiredTimestamp.toNumber() * 1000);
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
            return [2 /*return*/];
        });
    }); });
    describe('MACOStrategyManagerV2', function () { return __awaiter(_this, void 0, void 0, function () {
        var macoManager, ethOracleProxy, movingAverageOracle, initialStableCollateral, initialRiskCollateral, rebalancingSetToken, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime, seededPriceFeedPrices, initialMedianizerEthPrice, priceFeedDataDescription, movingAverageDays, stableCollateralUnit, stableCollateralNaturalUnit, riskCollateralUnit, riskCollateralNaturalUnit, initializedProposalTimestamp;
        var _this = this;
        return __generator(this, function (_a) {
            seededPriceFeedPrices = [
                constants_1.E18.mul(1),
                constants_1.E18.mul(2),
                constants_1.E18.mul(3),
                constants_1.E18.mul(4),
                constants_1.E18.mul(5),
            ];
            initialMedianizerEthPrice = constants_1.E18;
            priceFeedDataDescription = '200DailyETHPrice';
            movingAverageDays = new util_1.BigNumber(5);
            stableCollateralUnit = new util_1.BigNumber(250);
            stableCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 12));
            riskCollateralUnit = new util_1.BigNumber(Math.pow(10, 6));
            riskCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 6));
            initializedProposalTimestamp = new util_1.BigNumber(0);
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var medianizerAdapter, dataSource, timeSeriesFeed;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            crossoverConfirmationMinTime = constants_1.ONE_HOUR_IN_SECONDS.mul(6);
                            crossoverConfirmationMaxTime = constants_1.ONE_HOUR_IN_SECONDS.mul(12);
                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice, SetTestUtils.generateTimestamp(1000))];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.deployLegacyMakerOracleAdapterAsync(web3, ethMedianizer.address)];
                        case 2:
                            medianizerAdapter = _a.sent();
                            return [4 /*yield*/, helpers_1.deployOracleProxyAsync(web3, medianizerAdapter.address)];
                        case 3:
                            ethOracleProxy = _a.sent();
                            return [4 /*yield*/, helpers_1.deployLinearizedPriceDataSourceAsync(web3, ethOracleProxy.address, constants_1.ONE_HOUR_IN_SECONDS, '')];
                        case 4:
                            dataSource = _a.sent();
                            return [4 /*yield*/, helpers_1.approveContractToOracleProxy(ethOracleProxy, dataSource.address)];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.deployTimeSeriesFeedAsync(web3, dataSource.address, seededPriceFeedPrices)];
                        case 6:
                            timeSeriesFeed = _a.sent();
                            return [4 /*yield*/, helpers_1.deployMovingAverageOracleV2Async(web3, timeSeriesFeed.address, priceFeedDataDescription)];
                        case 7:
                            movingAverageOracle = _a.sent();
                            auctionTimeToPivot = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [usdc.address], [stableCollateralUnit], stableCollateralNaturalUnit)];
                        case 8:
                            // Create Stable Collateral Set
                            initialStableCollateral = _a.sent();
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [wrappedETH.address], [riskCollateralUnit], riskCollateralNaturalUnit)];
                        case 9:
                            // Create Risk Collateral Set
                            initialRiskCollateral = _a.sent();
                            return [4 /*yield*/, helpers_1.deployMovingAverageStrategyManagerV2Async(web3, core.address, movingAverageOracle.address, ethOracleProxy.address, usdc.address, wrappedETH.address, initialStableCollateral.address, initialRiskCollateral.address, factory.address, constantAuctionPriceCurve.address, movingAverageDays, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime)];
                        case 10:
                            macoManager = _a.sent();
                            return [4 /*yield*/, helpers_1.approveContractToOracleProxy(ethOracleProxy, macoManager.address)];
                        case 11:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, macoManager.address, initialRiskCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                        case 12:
                            rebalancingSetToken = _a.sent();
                            return [4 /*yield*/, helpers_1.initializeManagerAsync(macoManager, rebalancingSetToken.address)];
                        case 13:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('getMovingAverageManagerDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.getMovingAverageManagerDetailsAsync(common_1.ManagerType.MACOV2, subjectManagerAddress)];
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
            describe('getLastCrossoverConfirmationTimestampAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.getLastCrossoverConfirmationTimestampAsync(subjectManagerType, subjectManagerAddress)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerType, subjectManagerAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectManagerType = common_1.ManagerType.MACOV2;
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
            describe('initiateCrossoverProposeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.initiateCrossoverProposeAsync(subjectManagerType, subjectManagerAddress, { from: subjectCaller })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerAddress, subjectManagerType, subjectCaller, nextRebalanceAvailableInSeconds, macoManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    macoManagerWrapper = new wrappers_1.MACOStrategyManagerWrapper(web3);
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds, rebalanceInterval;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    subjectManagerAddress = macoManager.address;
                                    subjectManagerType = common_1.ManagerType.MACOV2;
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
                    return [2 /*return*/];
                });
            }); });
            describe('confirmCrossoverProposeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.confirmCrossoverProposeAsync(subjectManagerType, subjectManagerAddress, { from: subjectCaller })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerAddress, subjectManagerType, subjectCaller, nextRebalanceAvailableInSeconds, macoManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    macoManagerWrapper = new wrappers_1.MACOStrategyManagerWrapper(web3);
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds, rebalanceInterval;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    subjectManagerAddress = macoManager.address;
                                    subjectManagerType = common_1.ManagerType.MACOV2;
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
                    return [2 /*return*/];
                });
            }); });
            describe('batchFetchMACOCrossoverTimestampAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.batchFetchMACOCrossoverTimestampAsync(subjectManagers)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagers, macoManagerTwo, rebalancingSetTokenTwo;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.deployMovingAverageStrategyManagerV2Async(web3, core.address, movingAverageOracle.address, ethOracleProxy.address, usdc.address, wrappedETH.address, initialStableCollateral.address, initialRiskCollateral.address, factory.address, constantAuctionPriceCurve.address, movingAverageDays, auctionTimeToPivot, crossoverConfirmationMinTime, crossoverConfirmationMaxTime)];
                                case 1:
                                    macoManagerTwo = _a.sent();
                                    return [4 /*yield*/, helpers_1.approveContractToOracleProxy(ethOracleProxy, macoManagerTwo.address)];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, macoManagerTwo.address, initialRiskCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                                case 3:
                                    rebalancingSetTokenTwo = _a.sent();
                                    return [4 /*yield*/, helpers_1.initializeManagerAsync(macoManagerTwo, rebalancingSetTokenTwo.address)];
                                case 4:
                                    _a.sent();
                                    // Elapse the rebalance interval
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 5:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice.div(10), SetTestUtils.generateTimestamp(1000))];
                                case 6:
                                    _a.sent();
                                    subjectManagers = [macoManager.address, macoManagerTwo.address];
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('should match wrapper output', function () { return __awaiter(_this, void 0, void 0, function () {
                        var output, expectedOne, expectedTwo, expectedArray;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    output = _a.sent();
                                    return [4 /*yield*/, macoManager.lastCrossoverConfirmationTimestamp.callAsync()];
                                case 2:
                                    expectedOne = _a.sent();
                                    return [4 /*yield*/, macoManagerTwo.lastCrossoverConfirmationTimestamp.callAsync()];
                                case 3:
                                    expectedTwo = _a.sent();
                                    expectedArray = [expectedOne, expectedTwo];
                                    expect(JSON.stringify(output)).to.equal(JSON.stringify(expectedArray));
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
    describe('AssetPairManager', function () { return __awaiter(_this, void 0, void 0, function () {
        var assetPairManager, allocator, trigger, ethOracleProxy, usdcOracle, timeSeriesFeed, rsiOracle, initialQuoteCollateral, initialBaseCollateral, rebalancingSetToken, seededPriceFeedPrices, priceFeedDataDescription, stableCollateralUnit, stableCollateralNaturalUnit, riskCollateralUnit, riskCollateralNaturalUnit, initializedProposalTimestamp, baseAssetAllocation, allocationDenominator, bullishBaseAssetAllocation, bearishBaseAssetAllocation, auctionTimeToPivot, auctionStartPercentage, auctionPivotPercentage, signalConfirmationMinTime, signalConfirmationMaxTime;
        var _this = this;
        return __generator(this, function (_a) {
            priceFeedDataDescription = 'ETHRSIValue';
            stableCollateralUnit = new util_1.BigNumber(250);
            stableCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 12));
            riskCollateralUnit = new util_1.BigNumber(Math.pow(10, 6));
            riskCollateralNaturalUnit = new util_1.BigNumber(Math.pow(10, 6));
            initializedProposalTimestamp = new util_1.BigNumber(0);
            baseAssetAllocation = new util_1.BigNumber(100);
            allocationDenominator = new util_1.BigNumber(100);
            bullishBaseAssetAllocation = new util_1.BigNumber(100);
            bearishBaseAssetAllocation = allocationDenominator.sub(bullishBaseAssetAllocation);
            auctionTimeToPivot = constants_1.ONE_HOUR_IN_SECONDS.mul(6);
            auctionStartPercentage = new util_1.BigNumber(2);
            auctionPivotPercentage = new util_1.BigNumber(10);
            signalConfirmationMinTime = constants_1.ONE_HOUR_IN_SECONDS.mul(6);
            signalConfirmationMaxTime = constants_1.ONE_HOUR_IN_SECONDS.mul(12);
            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    seededPriceFeedPrices = _.map(new Array(15), function (el, i) { return new util_1.BigNumber((170 - i) * Math.pow(10, 18)); });
                    return [2 /*return*/];
                });
            }); });
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var initialMedianizerEthPrice, medianizerAdapter, dataSource, lowerBound, upperBound, rsiTimePeriod;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            initialMedianizerEthPrice = constants_1.E18.mul(70);
                            return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, initialMedianizerEthPrice, SetTestUtils.generateTimestamp(1000))];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.deployLegacyMakerOracleAdapterAsync(web3, ethMedianizer.address)];
                        case 2:
                            medianizerAdapter = _a.sent();
                            return [4 /*yield*/, helpers_1.deployOracleProxyAsync(web3, medianizerAdapter.address)];
                        case 3:
                            ethOracleProxy = _a.sent();
                            return [4 /*yield*/, helpers_1.deployConstantPriceOracleAsync(web3, new util_1.BigNumber(Math.pow(10, 18)))];
                        case 4:
                            usdcOracle = _a.sent();
                            return [4 /*yield*/, helpers_1.deployLinearizedPriceDataSourceAsync(web3, ethOracleProxy.address, constants_1.ONE_HOUR_IN_SECONDS, '')];
                        case 5:
                            dataSource = _a.sent();
                            return [4 /*yield*/, helpers_1.approveContractToOracleProxy(ethOracleProxy, dataSource.address)];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.deployTimeSeriesFeedAsync(web3, dataSource.address, seededPriceFeedPrices)];
                        case 7:
                            timeSeriesFeed = _a.sent();
                            return [4 /*yield*/, helpers_1.deployRSIOracleAsync(web3, timeSeriesFeed.address, priceFeedDataDescription)];
                        case 8:
                            rsiOracle = _a.sent();
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [usdc.address], [stableCollateralUnit], stableCollateralNaturalUnit)];
                        case 9:
                            // Create Stable Collateral Set
                            initialQuoteCollateral = _a.sent();
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [wrappedETH.address], [riskCollateralUnit], riskCollateralNaturalUnit)];
                        case 10:
                            // Create Risk Collateral Set
                            initialBaseCollateral = _a.sent();
                            return [4 /*yield*/, helpers_1.deployBinaryAllocatorAsync(web3, wrappedETH.address, usdc.address, ethOracleProxy.address, usdcOracle.address, initialBaseCollateral.address, initialQuoteCollateral.address, core.address, factory.address)];
                        case 11:
                            allocator = _a.sent();
                            lowerBound = new util_1.BigNumber(40);
                            upperBound = new util_1.BigNumber(60);
                            rsiTimePeriod = new util_1.BigNumber(14);
                            return [4 /*yield*/, helpers_1.deployRSITrendingTriggerAsync(web3, rsiOracle.address, lowerBound, upperBound, rsiTimePeriod)];
                        case 12:
                            trigger = _a.sent();
                            return [4 /*yield*/, helpers_1.deployAssetPairManagerAsync(web3, core.address, allocator.address, trigger.address, constantAuctionPriceCurve.address, baseAssetAllocation, allocationDenominator, bullishBaseAssetAllocation, auctionTimeToPivot, auctionStartPercentage, auctionPivotPercentage, signalConfirmationMinTime, signalConfirmationMaxTime)];
                        case 13:
                            assetPairManager = _a.sent();
                            return [4 /*yield*/, helpers_1.approveContractToOracleProxy(ethOracleProxy, allocator.address)];
                        case 14:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, assetPairManager.address, initialBaseCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                        case 15:
                            rebalancingSetToken = _a.sent();
                            return [4 /*yield*/, helpers_1.initializeManagerAsync(assetPairManager, rebalancingSetToken.address)];
                        case 16:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('getAssetPairManagerDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.getAssetPairManagerDetailsAsync(subjectManagerAddress)];
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
                    test('gets the correct allocation precision', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.allocationDenominator).to.be.bignumber.equal(allocationDenominator);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct allocator address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.allocator).to.equal(allocator.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct auctionPivotPercentage', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.auctionPivotPercentage).to.be.bignumber.equal(auctionPivotPercentage);
                                    return [2 /*return*/];
                            }
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
                    test('gets the correct auctionStartPercentage', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.auctionStartPercentage).to.be.bignumber.equal(auctionStartPercentage);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct auctionTimeToPivot', function () { return __awaiter(_this, void 0, void 0, function () {
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
                    test('gets the correct baseAssetAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.baseAssetAllocation).to.bignumber.equal(baseAssetAllocation);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct bullishBaseAssetAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.bullishBaseAssetAllocation).to.bignumber.equal(bullishBaseAssetAllocation);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct bearishBaseAssetAllocation', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.bearishBaseAssetAllocation).to.bignumber.equal(bearishBaseAssetAllocation);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct recentInitialProposeTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.recentInitialProposeTimestamp).to.bignumber.equal(initializedProposalTimestamp);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct rebalancingSetToken address', function () { return __awaiter(_this, void 0, void 0, function () {
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
                    test('gets the correct signalConfirmationMinTime', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.signalConfirmationMinTime).to.bignumber.equal(signalConfirmationMinTime);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct signalConfirmationMaxTime', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.signalConfirmationMaxTime).to.bignumber.equal(signalConfirmationMaxTime);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct trigger address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.trigger).to.equal(trigger.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('getLastCrossoverConfirmationTimestampAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.getLastCrossoverConfirmationTimestampAsync(subjectManagerType, subjectManagerAddress)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerType, subjectManagerAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectManagerType = common_1.ManagerType.PAIR;
                            subjectManagerAddress = assetPairManager.address;
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
            describe('initiateCrossoverProposeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, subjectTimeFastForward)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, rebalancingManagerAPI.initiateCrossoverProposeAsync(subjectManagerType, subjectManagerAddress, { from: subjectCaller })];
                                case 2: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerAddress, subjectManagerType, subjectTimeFastForward, subjectCaller, assetPairManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    assetPairManagerWrapper = new wrappers_1.AssetPairManagerWrapper(web3);
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectManagerAddress = assetPairManager.address;
                            subjectManagerType = common_1.ManagerType.PAIR;
                            subjectTimeFastForward = constants_1.ONE_DAY_IN_SECONDS;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                        });
                    }); });
                    describe('when more than 12 hours has elapsed since the last Proposal timestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    // Elapse the rebalance interval
                                    subjectTimeFastForward = constants_1.ONE_DAY_IN_SECONDS;
                                    return [2 /*return*/];
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
                    describe('when the RebalancingSet is not in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
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
                                            // Call initialPropose to set the timestamp
                                            return [4 /*yield*/, assetPairManagerWrapper.initialPropose(subjectManagerAddress)];
                                        case 2:
                                            // Call initialPropose to set the timestamp
                                            _a.sent();
                                            // Elapse signal confirmation period
                                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(7))];
                                        case 3:
                                            // Elapse signal confirmation period
                                            _a.sent();
                                            // Put the rebalancing set into proposal state
                                            return [4 /*yield*/, assetPairManagerWrapper.confirmPropose(subjectManagerAddress)];
                                        case 4:
                                            // Put the rebalancing set into proposal state
                                            _a.sent();
                                            subjectTimeFastForward = constants_1.ZERO;
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith('initialPropose cannot be called because necessary conditions are not met.')];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('when insufficient time has elapsed since the last rebalance', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    // Freeze the time at rebalance interval
                                    subjectTimeFastForward = constants_1.ZERO;
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith('initialPropose cannot be called because necessary conditions are not met.')];
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
                                case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, subjectTimeFastForward)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, rebalancingManagerAPI.confirmCrossoverProposeAsync(subjectManagerType, subjectManagerAddress, { from: subjectCaller })];
                                case 2: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerAddress, subjectManagerType, subjectTimeFastForward, subjectCaller, assetPairManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    assetPairManagerWrapper = new wrappers_1.AssetPairManagerWrapper(web3);
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Elapse the rebalance interval
                                return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 1:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, assetPairManager.initialPropose.sendTransactionAsync()];
                                case 2:
                                    _a.sent();
                                    subjectManagerAddress = assetPairManager.address;
                                    subjectManagerType = common_1.ManagerType.PAIR;
                                    subjectTimeFastForward = constants_1.ONE_HOUR_IN_SECONDS.mul(7);
                                    subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('when 6 hours has elapsed since the lastCrossoverConfirmationTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
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
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: 
                                        // Elapse the rebalance interval
                                        return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                        case 1:
                                            // Elapse the rebalance interval
                                            _a.sent();
                                            // Call initialPropose to set the timestamp
                                            return [4 /*yield*/, assetPairManagerWrapper.initialPropose(subjectManagerAddress)];
                                        case 2:
                                            // Call initialPropose to set the timestamp
                                            _a.sent();
                                            // Elapse 3 hours
                                            subjectTimeFastForward = constants_1.ONE_HOUR_IN_SECONDS.mul(13);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith('confirmPropose cannot be called because necessary conditions are not met.')];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('when 6 hours has not elapsed since the lastCrossoverConfirmationTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
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
                                            // Call initialPropose to set the timestamp
                                            return [4 /*yield*/, assetPairManagerWrapper.initialPropose(subjectManagerAddress)];
                                        case 2:
                                            // Call initialPropose to set the timestamp
                                            _a.sent();
                                            // Elapse 3 hours
                                            subjectTimeFastForward = constants_1.ONE_HOUR_IN_SECONDS.mul(5);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith('confirmPropose cannot be called because necessary conditions are not met.')];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('when the RebalancingSet is not in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
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
                                            // Call initialPropose to set the timestamp
                                            return [4 /*yield*/, assetPairManagerWrapper.initialPropose(subjectManagerAddress)];
                                        case 2:
                                            // Call initialPropose to set the timestamp
                                            _a.sent();
                                            // Elapse signal confirmation period
                                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(7))];
                                        case 3:
                                            // Elapse signal confirmation period
                                            _a.sent();
                                            // Put the rebalancing set into proposal state
                                            return [4 /*yield*/, assetPairManagerWrapper.confirmPropose(subjectManagerAddress)];
                                        case 4:
                                            // Put the rebalancing set into proposal state
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith('confirmPropose cannot be called because necessary conditions are not met.')];
                                });
                            }); });
                            return [2 /*return*/];
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
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.canInitialProposeAsync(subjectManagerAddress)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerAddress, assetPairManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    assetPairManagerWrapper = new wrappers_1.AssetPairManagerWrapper(web3);
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectManagerAddress = assetPairManager.address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('should match wrapper output', function () { return __awaiter(_this, void 0, void 0, function () {
                        var apiOutput, wrapperOutput;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    apiOutput = _a.sent();
                                    return [4 /*yield*/, assetPairManagerWrapper.canInitialPropose(subjectManagerAddress)];
                                case 2:
                                    wrapperOutput = _a.sent();
                                    expect(apiOutput).to.equal(wrapperOutput);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('when canInitialPropose should throw a revert', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    seededPriceFeedPrices = [
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                    ];
                                    return [2 /*return*/];
                                });
                            }); });
                            afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    seededPriceFeedPrices = _.map(new Array(15), function (el, i) { return new util_1.BigNumber((170 - i) * Math.pow(10, 18)); });
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
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.canConfirmProposeAsync(subjectManagerAddress)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagerAddress, assetPairManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    assetPairManagerWrapper = new wrappers_1.AssetPairManagerWrapper(web3);
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, timeSeriesFeed.poke.sendTransactionAsync()];
                                case 2:
                                    _a.sent();
                                    // Elapse the rebalance interval
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 3:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, assetPairManager.initialPropose.sendTransactionAsync()];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, constants_1.E18.mul(100), SetTestUtils.generateTimestamp(1000))];
                                case 5:
                                    _a.sent();
                                    return [4 /*yield*/, timeSeriesFeed.poke.sendTransactionAsync()];
                                case 6:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(7))];
                                case 7:
                                    _a.sent();
                                    subjectManagerAddress = assetPairManager.address;
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('should match wrapper output', function () { return __awaiter(_this, void 0, void 0, function () {
                        var apiOutput, wrapperOutput;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    apiOutput = _a.sent();
                                    return [4 /*yield*/, assetPairManagerWrapper.canConfirmPropose(subjectManagerAddress)];
                                case 2:
                                    wrapperOutput = _a.sent();
                                    expect(apiOutput).to.equal(wrapperOutput);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('when canConfirmPropose should throw a revert', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    seededPriceFeedPrices = [
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                        new util_1.BigNumber(150 * Math.pow(10, 18)),
                                        new util_1.BigNumber(170 * Math.pow(10, 18)),
                                    ];
                                    return [2 /*return*/];
                                });
                            }); });
                            afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    seededPriceFeedPrices = _.map(new Array(15), function (el, i) { return new util_1.BigNumber((170 - i) * Math.pow(10, 18)); });
                                    return [2 /*return*/];
                                });
                            }); });
                            test('returns false', function () { return __awaiter(_this, void 0, void 0, function () {
                                var canConfirmPropose;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, subject()];
                                        case 1:
                                            canConfirmPropose = _a.sent();
                                            expect(canConfirmPropose).to.be.false;
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
            describe('batchFetchAssetPairCrossoverTimestampAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.batchFetchAssetPairCrossoverTimestampAsync(subjectManagers)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var subjectManagers, assetPairManagerTwo, rebalancingSetTokenTwo, assetPairManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    assetPairManagerWrapper = new wrappers_1.AssetPairManagerWrapper(web3);
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.deployAssetPairManagerAsync(web3, core.address, allocator.address, trigger.address, constantAuctionPriceCurve.address, baseAssetAllocation, allocationDenominator, bullishBaseAssetAllocation, auctionTimeToPivot, auctionStartPercentage, auctionPivotPercentage, signalConfirmationMinTime, signalConfirmationMaxTime)];
                                case 1:
                                    assetPairManagerTwo = _a.sent();
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, assetPairManagerTwo.address, initialBaseCollateral.address, constants_1.ONE_DAY_IN_SECONDS)];
                                case 2:
                                    rebalancingSetTokenTwo = _a.sent();
                                    return [4 /*yield*/, helpers_1.initializeManagerAsync(assetPairManagerTwo, rebalancingSetTokenTwo.address)];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 4:
                                    _a.sent();
                                    return [4 /*yield*/, timeSeriesFeed.poke.sendTransactionAsync()];
                                case 5:
                                    _a.sent();
                                    // Elapse the rebalance interval
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 6:
                                    // Elapse the rebalance interval
                                    _a.sent();
                                    return [4 /*yield*/, assetPairManager.initialPropose.sendTransactionAsync()];
                                case 7:
                                    _a.sent();
                                    return [4 /*yield*/, assetPairManagerTwo.initialPropose.sendTransactionAsync()];
                                case 8:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, constants_1.E18.mul(100), SetTestUtils.generateTimestamp(1000))];
                                case 9:
                                    _a.sent();
                                    return [4 /*yield*/, timeSeriesFeed.poke.sendTransactionAsync()];
                                case 10:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_HOUR_IN_SECONDS.mul(7))];
                                case 11:
                                    _a.sent();
                                    subjectManagers = [assetPairManager.address, assetPairManagerTwo.address];
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('should match wrapper output', function () { return __awaiter(_this, void 0, void 0, function () {
                        var output, expectedOne, expectedTwo, expectedArray;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    output = _a.sent();
                                    return [4 /*yield*/, assetPairManagerWrapper.recentInitialProposeTimestamp(assetPairManager.address)];
                                case 2:
                                    expectedOne = _a.sent();
                                    return [4 /*yield*/, assetPairManagerWrapper.recentInitialProposeTimestamp(assetPairManagerTwo.address)];
                                case 3:
                                    expectedTwo = _a.sent();
                                    expectedArray = [expectedOne, expectedTwo];
                                    expect(JSON.stringify(output)).to.equal(JSON.stringify(expectedArray));
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
    describe('BTCDAIRebalancingManager', function () { return __awaiter(_this, void 0, void 0, function () {
        var btcDaiRebalancingManager, btcMultiplier, daiMultiplier, auctionTimeToPivot, maximumLowerThreshold, minimumUpperThreshold;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            btcMultiplier = new util_1.BigNumber(1);
                            daiMultiplier = new util_1.BigNumber(1);
                            auctionTimeToPivot = constants_1.ONE_DAY_IN_SECONDS;
                            maximumLowerThreshold = new util_1.BigNumber(47);
                            minimumUpperThreshold = new util_1.BigNumber(55);
                            return [4 /*yield*/, helpers_1.deployBtcDaiManagerContractAsync(web3, core.address, btcMedianizer.address, dai.address, wrappedBTC.address, factory.address, constantAuctionPriceCurve.address, auctionTimeToPivot, [btcMultiplier, daiMultiplier], [maximumLowerThreshold, minimumUpperThreshold])];
                        case 1:
                            btcDaiRebalancingManager = _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('getRebalancingManagerDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.getBTCDAIRebalancingManagerDetailsAsync(subjectManagerAddress)];
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
                    test('gets the correct btcPriceFeed address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.btcPriceFeed).to.equal(btcMedianizer.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct btcAddress address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.btcAddress).to.equal(wrappedBTC.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct daiAddress address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.daiAddress).to.equal(dai.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct setTokenFactory address', function () { return __awaiter(_this, void 0, void 0, function () {
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
                    test('gets the correct btcMultiplier address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.btcMultiplier).to.bignumber.equal(btcMultiplier);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct daiMultiplier address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.daiMultiplier).to.bignumber.equal(daiMultiplier);
                                    return [2 /*return*/];
                            }
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
                    test('gets the correct maximumLowerThreshold', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.maximumLowerThreshold).to.bignumber.equal(maximumLowerThreshold);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct minimumUpperThreshold', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.minimumUpperThreshold).to.bignumber.equal(minimumUpperThreshold);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('proposeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, timeFastForward)];
                                case 1:
                                    _a.sent();
                                    timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
                                    return [4 /*yield*/, rebalancingManagerAPI.proposeAsync(subjectManagerType, subjectManagerAddress, subjectRebalancingSetToken, { from: subjectCaller })];
                                case 2: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var rebalancingSetToken, proposalPeriod, btcPrice, daiUnit, initialAllocationToken, timeFastForward, nextRebalanceAvailableInSeconds, subjectManagerType, subjectRebalancingSetToken, subjectManagerAddress, subjectCaller, btcdaiManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    btcdaiManagerWrapper = new wrappers_1.BTCDAIRebalancingManagerWrapper(web3);
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            btcPrice = new util_1.BigNumber(4082 * Math.pow(10, 18));
                            daiUnit = new util_1.BigNumber(3000 * Math.pow(10, 10));
                            return [2 /*return*/];
                        });
                    }); });
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds, rebalanceInterval;
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
                                    subjectManagerType = common_1.ManagerType.BTCDAI;
                                    subjectManagerAddress = btcDaiRebalancingManager.address;
                                    subjectRebalancingSetToken = rebalancingSetToken.address;
                                    subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                                    return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                                case 4:
                                    lastRebalancedTimestampSeconds = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.rebalanceInterval.callAsync()];
                                case 5:
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
                    describe('when price trigger is not met', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    btcPrice = new util_1.BigNumber(2500 * Math.pow(10, 18));
                                    return [2 /*return*/];
                                });
                            }); });
                            afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    btcPrice = new util_1.BigNumber(4082 * Math.pow(10, 18));
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                var daiAllocationAmount;
                                return __generator(this, function (_a) {
                                    daiAllocationAmount = new util_1.BigNumber(54);
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Current DAI allocation " + daiAllocationAmount.toString() + "% must be outside allocation bounds " +
                                            (maximumLowerThreshold.toString() + " and " + minimumUpperThreshold.toString() + "."))];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('when the RebalancingSet is not in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
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
                                            // Call propose to transition out of Default
                                            return [4 /*yield*/, btcdaiManagerWrapper.propose(btcDaiRebalancingManager.address, rebalancingSetToken.address)];
                                        case 2:
                                            // Call propose to transition out of Default
                                            _a.sent();
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
                    describe('when the rebalanceInterval has not elapsed', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    timeFastForward = new util_1.BigNumber(1);
                                    nextRebalanceAvailableInSeconds = nextRebalanceAvailableInSeconds.sub(1);
                                    return [2 /*return*/];
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
                    describe('when invalid rebalancing set token is passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectRebalancingSetToken = accounts_2.ACCOUNTS[2].address;
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + subjectRebalancingSetToken + " is not a valid Set token address.")];
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
    describe('ETHDAIRebalancingManager', function () { return __awaiter(_this, void 0, void 0, function () {
        var ethDaiRebalancingManager, ethMultiplier, daiMultiplier, auctionTimeToPivot, maximumLowerThreshold, minimumUpperThreshold;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            ethMultiplier = new util_1.BigNumber(1);
                            daiMultiplier = new util_1.BigNumber(1);
                            auctionTimeToPivot = constants_1.ONE_DAY_IN_SECONDS;
                            maximumLowerThreshold = new util_1.BigNumber(47);
                            minimumUpperThreshold = new util_1.BigNumber(55);
                            return [4 /*yield*/, helpers_1.deployEthDaiManagerContractAsync(web3, core.address, ethMedianizer.address, dai.address, wrappedETH.address, factory.address, constantAuctionPriceCurve.address, auctionTimeToPivot, [ethMultiplier, daiMultiplier], [maximumLowerThreshold, minimumUpperThreshold])];
                        case 1:
                            ethDaiRebalancingManager = _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('getRebalancingManagerDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingManagerAPI.getETHDAIRebalancingManagerDetailsAsync(subjectManagerAddress)];
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
                            subjectManagerAddress = ethDaiRebalancingManager.address;
                            return [2 /*return*/];
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
                    test('gets the correct btcPriceFeed address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.ethPriceFeed).to.equal(ethMedianizer.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct btcAddress address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.ethAddress).to.equal(wrappedETH.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct daiAddress address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.daiAddress).to.equal(dai.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct setTokenFactory address', function () { return __awaiter(_this, void 0, void 0, function () {
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
                    test('gets the correct ethMultiplier address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.ethMultiplier).to.bignumber.equal(ethMultiplier);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct daiMultiplier address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.daiMultiplier).to.bignumber.equal(daiMultiplier);
                                    return [2 /*return*/];
                            }
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
                    test('gets the correct maximumLowerThreshold', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.maximumLowerThreshold).to.bignumber.equal(maximumLowerThreshold);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('gets the correct minimumUpperThreshold', function () { return __awaiter(_this, void 0, void 0, function () {
                        var details;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    details = _a.sent();
                                    expect(details.minimumUpperThreshold).to.bignumber.equal(minimumUpperThreshold);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('proposeAsync', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, timeFastForward)];
                                case 1:
                                    _a.sent();
                                    timeKeeper.freeze(nextRebalanceAvailableInSeconds.toNumber() * 1000);
                                    return [4 /*yield*/, rebalancingManagerAPI.proposeAsync(subjectManagerType, subjectManagerAddress, subjectRebalancingSetToken, { from: subjectCaller })];
                                case 2: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var rebalancingSetToken, proposalPeriod, ethPrice, daiUnit, initialAllocationToken, timeFastForward, nextRebalanceAvailableInSeconds, subjectManagerType, subjectRebalancingSetToken, subjectManagerAddress, subjectCaller, ethdaiManagerWrapper;
                var _this = this;
                return __generator(this, function (_a) {
                    ethdaiManagerWrapper = new wrappers_1.ETHDAIRebalancingManagerWrapper(web3);
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            ethPrice = new util_1.BigNumber(128 * Math.pow(10, 18));
                            daiUnit = new util_1.BigNumber(10000);
                            return [2 /*return*/];
                        });
                    }); });
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var lastRebalancedTimestampSeconds, rebalanceInterval;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, [dai.address, wrappedETH.address], [daiUnit.mul(daiMultiplier), new util_1.BigNumber(100).mul(ethMultiplier)], new util_1.BigNumber(100))];
                                case 1:
                                    initialAllocationToken = _a.sent();
                                    proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingFactory.address, ethDaiRebalancingManager.address, initialAllocationToken.address, proposalPeriod)];
                                case 2:
                                    rebalancingSetToken = _a.sent();
                                    timeFastForward = constants_1.ONE_DAY_IN_SECONDS.add(1);
                                    return [4 /*yield*/, helpers_1.updateMedianizerPriceAsync(web3, ethMedianizer, ethPrice, SetTestUtils.generateTimestamp(1000))];
                                case 3:
                                    _a.sent();
                                    subjectManagerType = common_1.ManagerType.ETHDAI;
                                    subjectManagerAddress = ethDaiRebalancingManager.address;
                                    subjectRebalancingSetToken = rebalancingSetToken.address;
                                    subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                                    return [4 /*yield*/, rebalancingSetToken.lastRebalanceTimestamp.callAsync()];
                                case 4:
                                    lastRebalancedTimestampSeconds = _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.rebalanceInterval.callAsync()];
                                case 5:
                                    rebalanceInterval = _a.sent();
                                    nextRebalanceAvailableInSeconds = lastRebalancedTimestampSeconds.plus(rebalanceInterval);
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
                    describe('when price trigger is not met', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    ethPrice = new util_1.BigNumber(83 * Math.pow(10, 18));
                                    return [2 /*return*/];
                                });
                            }); });
                            afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    ethPrice = new util_1.BigNumber(128 * Math.pow(10, 18));
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                var daiAllocationAmount;
                                return __generator(this, function (_a) {
                                    daiAllocationAmount = new util_1.BigNumber(54);
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Current DAI allocation " + daiAllocationAmount.toString() + "% must be outside allocation bounds " +
                                            (maximumLowerThreshold.toString() + " and " + minimumUpperThreshold.toString() + "."))];
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('when the RebalancingSet is not in Default state', function () { return __awaiter(_this, void 0, void 0, function () {
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
                                            // Call propose to transition out of Default
                                            return [4 /*yield*/, ethdaiManagerWrapper.propose(ethDaiRebalancingManager.address, rebalancingSetToken.address)];
                                        case 2:
                                            // Call propose to transition out of Default
                                            _a.sent();
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
                    describe('when the rebalanceInterval has not elapsed', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    timeFastForward = new util_1.BigNumber(1);
                                    nextRebalanceAvailableInSeconds = nextRebalanceAvailableInSeconds.sub(1);
                                    return [2 /*return*/];
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
                    describe('when invalid rebalancing set token is passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectRebalancingSetToken = accounts_2.ACCOUNTS[2].address;
                                    return [2 /*return*/];
                                });
                            }); });
                            test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + subjectRebalancingSetToken + " is not a valid Set token address.")];
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
});
//# sourceMappingURL=RebalancingManagerAPI.spec.js.map