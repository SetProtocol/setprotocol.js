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
var web3_1 = __importDefault(require("web3"));
var set_protocol_utils_1 = require("set-protocol-utils");
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
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('RebalancingSetTokenV2Wrapper', function () {
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
    var rebalanceAuctionModule;
    var ethOracleProxy;
    var btcOracleProxy;
    var initialEthPrice;
    var initialBtcPrice;
    var rbSetFeeRecipient;
    var rbSetEntryFee;
    var rbSetRebalanceFee;
    var rebalancingSetTokenV2Wrapper;
    var setToken;
    var rebalancingSetToken;
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var setTokenComponents, setTokenUnits, naturalUnit, managerAddress, rebalanceFeeCalculator, failRebalancePeriod, timestamp, lastRebalanceTimestamp;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _c.sent();
                    return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 2:
                    currentSnapshotId = _c.sent();
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 3:
                    _a = _c.sent(), core = _a[0], transferProxy = _a[1], factory = _a[3], rebalanceAuctionModule = _a[5], rebalancingComponentWhiteList = _a[6];
                    initialEthPrice = util_1.ether(180);
                    initialBtcPrice = util_1.ether(9000);
                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [8, 18], web3)];
                case 4:
                    _b = _c.sent(), wrappedBTC = _b[0], wrappedETH = _b[1];
                    return [4 /*yield*/, helpers_1.approveForTransferAsync([wrappedBTC, wrappedETH], transferProxy.address)];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(rebalancingComponentWhiteList, wrappedBTC.address)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(rebalancingComponentWhiteList, wrappedETH.address)];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployConstantPriceOracleAsync(web3, initialEthPrice)];
                case 8:
                    ethOracleProxy = _c.sent();
                    return [4 /*yield*/, helpers_1.deployConstantPriceOracleAsync(web3, initialBtcPrice)];
                case 9:
                    btcOracleProxy = _c.sent();
                    return [4 /*yield*/, helpers_1.deployOracleWhiteListAsync(web3, [wrappedETH.address, wrappedBTC.address], [ethOracleProxy.address, btcOracleProxy.address])];
                case 10:
                    oracleWhiteList = _c.sent();
                    return [4 /*yield*/, helpers_1.deployLinearAuctionLiquidatorContractAsync(web3, core, oracleWhiteList)];
                case 11:
                    liquidator = _c.sent();
                    return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [liquidator.address])];
                case 12:
                    liquidatorWhiteList = _c.sent();
                    return [4 /*yield*/, helpers_1.deployFixedFeeCalculatorAsync(web3)];
                case 13:
                    feeCalculator = _c.sent();
                    return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [feeCalculator.address])];
                case 14:
                    feeCalculatorWhiteList = _c.sent();
                    return [4 /*yield*/, helpers_1.deployRebalancingSetTokenV2FactoryContractAsync(web3, core, rebalancingComponentWhiteList, liquidatorWhiteList, feeCalculatorWhiteList)];
                case 15:
                    rebalancingFactory = _c.sent();
                    setTokenComponents = [wrappedETH.address, wrappedBTC.address];
                    setTokenUnits = [initialBtcPrice.mul(1e10).div(initialEthPrice).round(0, 3), new util_1.BigNumber(1)];
                    naturalUnit = new util_1.BigNumber(1e10);
                    return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, setTokenComponents, setTokenUnits, naturalUnit)];
                case 16:
                    setToken = _c.sent();
                    managerAddress = accounts_1.DEFAULT_ACCOUNT;
                    rbSetFeeRecipient = accounts_1.ACCOUNTS[2].address;
                    rebalanceFeeCalculator = feeCalculator.address;
                    failRebalancePeriod = constants_1.ONE_DAY_IN_SECONDS;
                    return [4 /*yield*/, web3.eth.getBlock('latest')];
                case 17:
                    timestamp = (_c.sent()).timestamp;
                    lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                    rbSetEntryFee = util_1.ether(.01);
                    rbSetRebalanceFee = util_1.ether(.02);
                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenV2Async(web3, core, rebalancingFactory.address, managerAddress, liquidator.address, rbSetFeeRecipient, rebalanceFeeCalculator, setToken.address, failRebalancePeriod, lastRebalanceTimestamp, rbSetEntryFee, rbSetRebalanceFee)];
                case 18:
                    rebalancingSetToken = _c.sent();
                    rebalancingSetTokenV2Wrapper = new wrappers_1.RebalancingSetTokenV2Wrapper(web3);
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
    describe('entryFeePaidEvent', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenV2Wrapper.entryFeePaidEvent(subjectRebalancingSetTokenV2, subjectFromBlock, subjectToBlock)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var earlyTxnHash, earlyBlockNumber, subjectFromBlock, subjectToBlock, subjectRebalancingSetTokenV2, rebalancingSetQuantityToIssue1, rebalancingSetQuantityToIssue2;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var lastTxnHash, earlyTransaction, lastTransaction, recentIssueBlockNumber;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 1:
                            earlyTxnHash = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([setToken], transferProxy.address)];
                        case 2:
                            _a.sent();
                            rebalancingSetQuantityToIssue1 = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1)];
                        case 3:
                            _a.sent();
                            // Issue setToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 4:
                            // Issue setToken
                            _a.sent();
                            rebalancingSetQuantityToIssue2 = util_1.ether(1);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue2)];
                        case 5:
                            lastTxnHash = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(earlyTxnHash)];
                        case 6:
                            earlyTransaction = _a.sent();
                            earlyBlockNumber = earlyTransaction['blockNumber'];
                            return [4 /*yield*/, web3.eth.getTransaction(lastTxnHash)];
                        case 7:
                            lastTransaction = _a.sent();
                            recentIssueBlockNumber = lastTransaction['blockNumber'];
                            subjectFromBlock = earlyBlockNumber;
                            subjectToBlock = recentIssueBlockNumber;
                            subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
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
                var events, returnValues, feeRecipient, feeQuantity, expectedFee;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _a.sent();
                            returnValues = events[0].returnValues;
                            feeRecipient = returnValues.feeRecipient, feeQuantity = returnValues.feeQuantity;
                            expect(feeRecipient).to.equal(rbSetFeeRecipient);
                            expectedFee = rebalancingSetQuantityToIssue1.mul(rbSetEntryFee).div(1e18);
                            expect(feeQuantity).to.bignumber.equal(expectedFee);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('retrieves the correct second log EntryFeePaid properties', function () { return __awaiter(_this, void 0, void 0, function () {
                var events, returnValues, feeRecipient, feeQuantity, expectedFee;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _a.sent();
                            returnValues = events[1].returnValues;
                            feeRecipient = returnValues.feeRecipient, feeQuantity = returnValues.feeQuantity;
                            expect(feeRecipient).to.equal(rbSetFeeRecipient);
                            expectedFee = rebalancingSetQuantityToIssue2.mul(rbSetEntryFee).div(1e18);
                            expect(feeQuantity).to.bignumber.equal(expectedFee);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the block range does not contain an event', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectFromBlock = 0;
                            subjectToBlock = earlyBlockNumber - 1;
                            return [2 /*return*/];
                        });
                    }); });
                    test('should return no events', function () { return __awaiter(_this, void 0, void 0, function () {
                        var events;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    events = _a.sent();
                                    expect(events.length).to.equal(0);
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
    describe('rebalanceStartedEvent', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenV2Wrapper.rebalanceStartedEvent(subjectRebalancingSetTokenV2, subjectFromBlock, subjectToBlock)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var earlyTxnHash, earlyBlockNumber, subjectFromBlock, subjectToBlock, subjectRebalancingSetTokenV2, rebalancingSetQuantityToIssue1, nextSetToken, liquidatorData;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var earlyTransaction, setTokenComponents, setTokenUnits, naturalUnit, lastTxnHash, lastTransaction, recentIssueBlockNumber;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 1:
                            earlyTxnHash = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([setToken], transferProxy.address)];
                        case 2:
                            _a.sent();
                            rebalancingSetQuantityToIssue1 = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(earlyTxnHash)];
                        case 4:
                            earlyTransaction = _a.sent();
                            earlyBlockNumber = earlyTransaction['blockNumber'];
                            setTokenComponents = [wrappedETH.address, wrappedBTC.address];
                            setTokenUnits = [initialBtcPrice.mul(1e10).div(initialEthPrice).round(0, 3), new util_1.BigNumber(3)];
                            naturalUnit = new util_1.BigNumber(1e10);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, setTokenComponents, setTokenUnits, naturalUnit)];
                        case 5:
                            nextSetToken = _a.sent();
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS.add(1))];
                        case 6:
                            _a.sent();
                            liquidatorData = '0x00';
                            return [4 /*yield*/, rebalancingSetToken.startRebalance.sendTransactionAsync(nextSetToken.address, liquidatorData, constants_1.TX_DEFAULTS)];
                        case 7:
                            lastTxnHash = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(lastTxnHash)];
                        case 8:
                            lastTransaction = _a.sent();
                            recentIssueBlockNumber = lastTransaction['blockNumber'];
                            subjectFromBlock = earlyBlockNumber;
                            subjectToBlock = recentIssueBlockNumber;
                            subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
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
            test('retrieves the correct first log RebalanceStarted properties', function () { return __awaiter(_this, void 0, void 0, function () {
                var events, returnValues, oldSet, newSet, rebalanceIndex, currentSetQuantity, expectedCurrentSet;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _a.sent();
                            returnValues = events[0].returnValues;
                            oldSet = returnValues.oldSet, newSet = returnValues.newSet, rebalanceIndex = returnValues.rebalanceIndex, currentSetQuantity = returnValues.currentSetQuantity;
                            expect(oldSet).to.equal(setToken.address);
                            expect(newSet).to.equal(nextSetToken.address);
                            expect(rebalanceIndex).to.bignumber.equal(0);
                            expectedCurrentSet = rebalancingSetQuantityToIssue1
                                .mul(constants_1.DEFAULT_UNIT_SHARES)
                                .div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                            expect(currentSetQuantity).to.bignumber.equal(expectedCurrentSet);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('rebalanceSettledEvent', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenV2Wrapper.rebalanceSettledEvent(subjectRebalancingSetTokenV2, subjectFromBlock, subjectToBlock)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var earlyTxnHash, earlyBlockNumber, subjectFromBlock, subjectToBlock, subjectRebalancingSetTokenV2, rebalancingSetQuantityToIssue1, currentSetQuantity, nextSetToken, liquidatorData;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var earlyTransaction, setTokenComponents, setTokenUnits, naturalUnit, lastTxnHash, lastTransaction, recentIssueBlockNumber;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 1:
                            earlyTxnHash = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([setToken], transferProxy.address)];
                        case 2:
                            _a.sent();
                            rebalancingSetQuantityToIssue1 = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue1)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(earlyTxnHash)];
                        case 4:
                            earlyTransaction = _a.sent();
                            earlyBlockNumber = earlyTransaction['blockNumber'];
                            setTokenComponents = [wrappedETH.address, wrappedBTC.address];
                            setTokenUnits = [initialBtcPrice.mul(1e10).div(initialEthPrice).round(0, 3), new util_1.BigNumber(3)];
                            naturalUnit = new util_1.BigNumber(1e10);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, factory.address, setTokenComponents, setTokenUnits, naturalUnit)];
                        case 5:
                            nextSetToken = _a.sent();
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS.add(1))];
                        case 6:
                            _a.sent();
                            liquidatorData = '0x00';
                            return [4 /*yield*/, rebalancingSetToken.startRebalance.sendTransactionAsync(nextSetToken.address, liquidatorData, constants_1.TX_DEFAULTS)];
                        case 7:
                            _a.sent();
                            currentSetQuantity = rebalancingSetQuantityToIssue1
                                .mul(constants_1.DEFAULT_UNIT_SHARES)
                                .div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                            return [4 /*yield*/, rebalanceAuctionModule.bid.sendTransactionAsync(rebalancingSetToken.address, currentSetQuantity, true, constants_1.TX_DEFAULTS)];
                        case 8:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.settleRebalance.sendTransactionAsync(constants_1.TX_DEFAULTS)];
                        case 9:
                            lastTxnHash = _a.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(lastTxnHash)];
                        case 10:
                            lastTransaction = _a.sent();
                            recentIssueBlockNumber = lastTransaction['blockNumber'];
                            subjectFromBlock = earlyBlockNumber;
                            subjectToBlock = recentIssueBlockNumber;
                            subjectRebalancingSetTokenV2 = rebalancingSetToken.address;
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
                var events, returnValues, feeRecipient, feeQuantity, feePercentage, rebalanceIndex, unitShares, expectedUnitShares, expectedFeeQuantity;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _a.sent();
                            returnValues = events[0].returnValues;
                            feeRecipient = returnValues.feeRecipient, feeQuantity = returnValues.feeQuantity, feePercentage = returnValues.feePercentage, rebalanceIndex = returnValues.rebalanceIndex, unitShares = returnValues.unitShares;
                            expect(feeRecipient).to.equal(rbSetFeeRecipient);
                            expect(rebalanceIndex).to.bignumber.equal(0);
                            expect(feePercentage).to.bignumber.equal(rbSetRebalanceFee);
                            return [4 /*yield*/, rebalancingSetToken.unitShares.callAsync()];
                        case 2:
                            expectedUnitShares = _a.sent();
                            expect(unitShares).to.bignumber.equal(expectedUnitShares);
                            expectedFeeQuantity = rebalancingSetQuantityToIssue1
                                .mul(rbSetRebalanceFee)
                                .div(new util_1.BigNumber(1e18).sub(rbSetRebalanceFee)).round(0, 3);
                            expect(feeQuantity).to.bignumber.equal(expectedFeeQuantity);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=RebalancingSetTokenV2Wrapper.spec.js.map