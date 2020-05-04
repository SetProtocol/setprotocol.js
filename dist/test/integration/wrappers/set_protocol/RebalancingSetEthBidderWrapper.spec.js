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
var _ = __importStar(require("lodash"));
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
describe('RebalancingSetEthBidderWrapper', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var rebalancingSetTokenFactory;
    var rebalanceAuctionModule;
    var rebalancingSetEthBidder;
    var weth;
    var whitelist;
    var erc20Wrapper;
    var rebalancingSetEthBidderWrapper;
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
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
                    return [4 /*yield*/, helpers_1.deployRebalancingSetEthBidderAsync(web3, rebalanceAuctionModule, transferProxy, weth)];
                case 4:
                    rebalancingSetEthBidder = _b.sent();
                    erc20Wrapper = new wrappers_1.ERC20Wrapper(web3);
                    rebalancingSetEthBidderWrapper = new wrappers_1.RebalancingSetEthBidderWrapper(web3, rebalancingSetEthBidder.address);
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
    describe('bidPlacedWithEth', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetEthBidderWrapper.bidPlacedWithEthEvent(subjectFromBlock, subjectToBlock, subjectRebalancingSetToken)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var rebalancingSetToken, defaultSetToken, wethSetToken, earlyTxnHash, earlyBlockNumber, defaultBaseSetComponent, defaultBaseSetComponent2, wethBaseSetComponent, wethBaseSetComponent2, bidQuantity, allowPartialFill, bidderAccount, bid1TxnHash, bid2TxnHash, subjectFromBlock, subjectToBlock, subjectRebalancingSetToken, subjectEthQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var defaultComponentAddresses, defaultComponentUnits, defaultBaseSetNaturalUnit, nextComponentAddresses, wethComponentUnits, nextComponentUnits, wethBaseSetNaturalUnit, proposalPeriod, managerAddress, baseSetIssueQuantity, rebalancingSetTokenQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice, decOne, decTwo, minBid, rebalancingSetToken2, earlyTransaction, lastBidTransaction, bidBlockNumber;
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
                            earlyTxnHash = _b.sent();
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
                            priceCurve = _b.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            auctionPriceCurveAddress = priceCurve.address;
                            setAuctionTimeToPivot = new util_1.BigNumber(100000);
                            setAuctionStartPrice = new util_1.BigNumber(500);
                            setAuctionPivotPrice = new util_1.BigNumber(1000);
                            return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, wethSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                        case 15:
                            _b.sent();
                            return [4 /*yield*/, defaultSetToken.naturalUnit.callAsync()];
                        case 16:
                            decOne = _b.sent();
                            return [4 /*yield*/, wethSetToken.naturalUnit.callAsync()];
                        case 17:
                            decTwo = _b.sent();
                            minBid = new util_1.BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);
                            bidQuantity = minBid;
                            allowPartialFill = false;
                            bidderAccount = accounts_1.DEFAULT_ACCOUNT;
                            // Approve tokens to rebalancingSetEthBidder contract
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                    wethBaseSetComponent,
                                    wethBaseSetComponent2,
                                ], rebalancingSetEthBidder.address)];
                        case 18:
                            // Approve tokens to rebalancingSetEthBidder contract
                            _b.sent();
                            subjectEthQuantity = baseSetIssueQuantity.mul(wethComponentUnits).div(wethBaseSetNaturalUnit);
                            return [4 /*yield*/, rebalancingSetEthBidderWrapper.bidAndWithdrawWithEther(rebalancingSetToken.address, bidQuantity, allowPartialFill, { from: bidderAccount, value: subjectEthQuantity.toNumber() })];
                        case 19:
                            bid1TxnHash = _b.sent();
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, defaultSetToken.address, proposalPeriod)];
                        case 20:
                            rebalancingSetToken2 = _b.sent();
                            // Issue defaultSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(defaultSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 21:
                            // Issue defaultSetToken
                            _b.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([defaultSetToken], transferProxy.address)];
                        case 22:
                            _b.sent();
                            // Use issued defaultSetToken to issue rebalancingSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken2.address, rebalancingSetTokenQuantityToIssue)];
                        case 23:
                            // Use issued defaultSetToken to issue rebalancingSetToken
                            _b.sent();
                            return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken2, managerAddress, wethSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                        case 24:
                            _b.sent();
                            return [4 /*yield*/, rebalancingSetEthBidderWrapper.bidAndWithdrawWithEther(rebalancingSetToken2.address, bidQuantity, allowPartialFill, { from: bidderAccount, value: subjectEthQuantity.toNumber() })];
                        case 25:
                            bid2TxnHash = _b.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(earlyTxnHash)];
                        case 26:
                            earlyTransaction = _b.sent();
                            earlyBlockNumber = earlyTransaction['blockNumber'];
                            return [4 /*yield*/, web3.eth.getTransaction(bid2TxnHash)];
                        case 27:
                            lastBidTransaction = _b.sent();
                            bidBlockNumber = lastBidTransaction['blockNumber'];
                            subjectFromBlock = earlyBlockNumber;
                            subjectToBlock = bidBlockNumber;
                            subjectRebalancingSetToken = undefined;
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
            test('retrieves the correct event properties', function () { return __awaiter(_this, void 0, void 0, function () {
                var events, _a, transactionHash, blockNumber, address, event, bidOneTransaction, bidOneBlockNumber;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _b.sent();
                            _a = events[0], transactionHash = _a.transactionHash, blockNumber = _a.blockNumber, address = _a.address, event = _a.event;
                            expect(transactionHash).to.equal(bid1TxnHash);
                            return [4 /*yield*/, web3.eth.getTransaction(bid1TxnHash)];
                        case 2:
                            bidOneTransaction = _b.sent();
                            bidOneBlockNumber = bidOneTransaction['blockNumber'];
                            expect(blockNumber).to.equal(bidOneBlockNumber);
                            expect(address).to.equal(rebalancingSetEthBidder.address);
                            expect(event).to.equal('BidPlacedWithEth');
                            return [2 /*return*/];
                    }
                });
            }); });
            test('retrieves the bid event properties', function () { return __awaiter(_this, void 0, void 0, function () {
                var events, returnValues, bidder, quantity, returnedRebalancingSetToken;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            events = _a.sent();
                            returnValues = events[0].returnValues;
                            bidder = returnValues.bidder, quantity = returnValues.quantity;
                            returnedRebalancingSetToken = returnValues['rebalancingSetToken'];
                            expect(returnedRebalancingSetToken).to.equal(rebalancingSetToken.address);
                            expect(bidder).to.equal(bidderAccount);
                            expect(quantity).to.equal(bidQuantity.toString());
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when a rebalancingSetToken filter is enabled', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetToken = rebalancingSetToken.address;
                            return [2 /*return*/];
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
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('bidAndWithdrawWithEther', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetEthBidderWrapper.bidAndWithdrawWithEther(subjectRebalancingSetToken, subjectBidQuantity, subjectAllowPartialFill, { from: subjectCaller, value: subjectEthQuantity.toNumber() })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var rebalancingSetToken, defaultSetToken, wethSetToken, defaultBaseSetComponent, defaultBaseSetComponent2, wethBaseSetComponent, wethBaseSetComponent2, wethComponentUnits, wethBaseSetNaturalUnit, subjectRebalancingSetToken, subjectBidQuantity, subjectAllowPartialFill, subjectCaller, subjectEthQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var defaultComponentAddresses, defaultComponentUnits, defaultBaseSetNaturalUnit, nextComponentAddresses, nextComponentUnits;
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
                            wethSetToken = _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when WETH is an inflow in a bid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var proposalPeriod, managerAddress, baseSetIssueQuantity, rebalancingSetTokenQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
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
                                    _b.sent();
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
                                    // Approve tokens to rebalancingSetEthBidder contract
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                            wethBaseSetComponent,
                                            wethBaseSetComponent2,
                                        ], rebalancingSetEthBidder.address)];
                                case 11:
                                    // Approve tokens to rebalancingSetEthBidder contract
                                    _b.sent();
                                    subjectEthQuantity = baseSetIssueQuantity.mul(wethComponentUnits).div(wethBaseSetNaturalUnit);
                                    subjectRebalancingSetToken = rebalancingSetToken.address;
                                    subjectBidQuantity = util_1.ether(1);
                                    subjectAllowPartialFill = false;
                                    subjectCaller = accounts_1.DEFAULT_ACCOUNT;
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
                                    return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, accounts_1.DEFAULT_ACCOUNT); }))];
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
                                    return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, accounts_1.DEFAULT_ACCOUNT); }))];
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
                    return [2 /*return*/];
                });
            }); });
            describe('when WETH is an outflow in a bid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var proposalPeriod, managerAddress, baseSetIssueQuantity, requiredWrappedEther, rebalancingSetTokenQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                    managerAddress = accounts_1.ACCOUNTS[1].address;
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, wethSetToken.address, proposalPeriod)];
                                case 1:
                                    rebalancingSetToken = _b.sent();
                                    baseSetIssueQuantity = util_1.ether(1);
                                    requiredWrappedEther = baseSetIssueQuantity.mul(wethComponentUnits).div(wethBaseSetNaturalUnit);
                                    return [4 /*yield*/, weth.deposit.sendTransactionAsync({ from: subjectCaller, value: requiredWrappedEther.toString() })];
                                case 2:
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                            wethBaseSetComponent,
                                            wethBaseSetComponent2,
                                        ], transferProxy.address)];
                                case 3:
                                    _b.sent();
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(wethSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                                case 4:
                                    _b.sent();
                                    // Use issued wethSetToken to issue rebalancingSetToken
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([wethSetToken], transferProxy.address)];
                                case 5:
                                    // Use issued wethSetToken to issue rebalancingSetToken
                                    _b.sent();
                                    rebalancingSetTokenQuantityToIssue = util_1.ether(1);
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue)];
                                case 6:
                                    _b.sent();
                                    return [4 /*yield*/, defaultSetToken.getComponents.callAsync()];
                                case 7:
                                    _a = _b.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                                case 8:
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                                case 9:
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                                case 10:
                                    priceCurve = _b.sent();
                                    helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                                    auctionPriceCurveAddress = priceCurve.address;
                                    setAuctionTimeToPivot = new util_1.BigNumber(100000);
                                    setAuctionStartPrice = new util_1.BigNumber(500);
                                    setAuctionPivotPrice = new util_1.BigNumber(1000);
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, defaultSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                                case 11:
                                    _b.sent();
                                    // Approve tokens to rebalancingSetEthBidder contract
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                            defaultBaseSetComponent,
                                            defaultBaseSetComponent2,
                                        ], rebalancingSetEthBidder.address)];
                                case 12:
                                    // Approve tokens to rebalancingSetEthBidder contract
                                    _b.sent();
                                    subjectEthQuantity = constants_1.ZERO;
                                    subjectRebalancingSetToken = rebalancingSetToken.address;
                                    subjectBidQuantity = util_1.ether(1);
                                    subjectAllowPartialFill = false;
                                    subjectCaller = accounts_1.DEFAULT_ACCOUNT;
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
                                    return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, accounts_1.DEFAULT_ACCOUNT); }))];
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
                                    return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, accounts_1.DEFAULT_ACCOUNT); }))];
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
                    return [2 /*return*/];
                });
            }); });
            describe('when WETH is neither an inflow nor outflow in a bid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var proposalPeriod, managerAddress, baseSetIssueQuantity, rebalancingSetTokenQuantityToIssue, defaultNextBaseSetComponent, defaultNextBaseSetComponent2, defaultNextComponentAddresses, defaultNextComponentUnits, defaultBaseSetNaturalUnit, defaultNextSetToken, _a, proposalComponentOne, proposalComponentTwo, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
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
                                    _b.sent();
                                    // Use issued defaultSetToken to issue rebalancingSetToken
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([defaultSetToken], transferProxy.address)];
                                case 4:
                                    // Use issued defaultSetToken to issue rebalancingSetToken
                                    _b.sent();
                                    rebalancingSetTokenQuantityToIssue = util_1.ether(1);
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetTokenQuantityToIssue)];
                                case 5:
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                                case 6:
                                    defaultNextBaseSetComponent = _b.sent();
                                    return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                                case 7:
                                    defaultNextBaseSetComponent2 = _b.sent();
                                    defaultNextComponentAddresses = [
                                        defaultNextBaseSetComponent.address, defaultNextBaseSetComponent2.address,
                                    ];
                                    defaultNextComponentUnits = [
                                        util_1.ether(0.01), util_1.ether(0.01),
                                    ];
                                    defaultBaseSetNaturalUnit = util_1.ether(0.001);
                                    return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, defaultNextComponentAddresses, defaultNextComponentUnits, defaultBaseSetNaturalUnit)];
                                case 8:
                                    defaultNextSetToken = _b.sent();
                                    return [4 /*yield*/, defaultNextSetToken.getComponents.callAsync()];
                                case 9:
                                    _a = _b.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                                case 10:
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                                case 11:
                                    _b.sent();
                                    return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                                case 12:
                                    priceCurve = _b.sent();
                                    helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                                    auctionPriceCurveAddress = priceCurve.address;
                                    setAuctionTimeToPivot = new util_1.BigNumber(100000);
                                    setAuctionStartPrice = new util_1.BigNumber(500);
                                    setAuctionPivotPrice = new util_1.BigNumber(1000);
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, defaultNextSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                                case 13:
                                    _b.sent();
                                    // Approve tokens to rebalancingSetEthBidder contract
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([
                                            defaultNextBaseSetComponent,
                                            defaultNextBaseSetComponent2,
                                        ], rebalancingSetEthBidder.address)];
                                case 14:
                                    // Approve tokens to rebalancingSetEthBidder contract
                                    _b.sent();
                                    subjectEthQuantity = util_1.ether(10);
                                    subjectRebalancingSetToken = rebalancingSetToken.address;
                                    subjectBidQuantity = util_1.ether(1);
                                    subjectAllowPartialFill = false;
                                    subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('returns the amount of ETH minus gas cost', function () { return __awaiter(_this, void 0, void 0, function () {
                        var previousEthBalance, _a, txHash, currentEthBalance, totalGasInEth, expectedEthBalance;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = util_1.BigNumber.bind;
                                    return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                                case 1:
                                    previousEthBalance = new (_a.apply(util_1.BigNumber, [void 0, _b.sent()]))();
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    txHash = _b.sent();
                                    return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                                case 3:
                                    currentEthBalance = _b.sent();
                                    return [4 /*yield*/, helpers_1.getGasUsageInEth(web3, txHash)];
                                case 4:
                                    totalGasInEth = _b.sent();
                                    expectedEthBalance = previousEthBalance.sub(totalGasInEth);
                                    expect(expectedEthBalance).to.bignumber.equal(currentEthBalance);
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
//# sourceMappingURL=RebalancingSetEthBidderWrapper.spec.js.map