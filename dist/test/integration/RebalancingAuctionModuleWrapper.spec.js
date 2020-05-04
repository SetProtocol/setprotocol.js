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
describe('RebalancingAuctionModuleWrapper', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var rebalancingSetTokenFactory;
    var rebalanceAuctionModule;
    var whitelist;
    var erc20Wrapper;
    var rebalancingAuctionModuleWrapper;
    var rebalancingSetTokenWrapper;
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
                    erc20Wrapper = new wrappers_1.ERC20Wrapper(web3);
                    rebalancingAuctionModuleWrapper = new wrappers_1.RebalancingAuctionModuleWrapper(web3, rebalanceAuctionModule.address);
                    rebalancingSetTokenWrapper = new wrappers_1.RebalancingSetTokenWrapper(web3);
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
    describe('bid', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAuctionModuleWrapper.bid(subjectRebalancingSetToken, subjectBidQuantity, subjectAllowPartialFill, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var rebalancingSetToken, currentSetToken, nextSetToken, subjectRebalancingSetToken, subjectBidQuantity, subjectAllowPartialFill, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokens, proposalPeriod, managerAddress, rebalancingSetQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
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
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 3:
                            // Issue currentSetToken
                            _b.sent();
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
                            subjectRebalancingSetToken = rebalancingSetToken.address;
                            subjectBidQuantity = util_1.ether(2);
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
            it('transfers the correct amount of tokens to the bidder in the Vault', function () { return __awaiter(_this, void 0, void 0, function () {
                var expectedTokenFlows, combinedTokenArray, oldReceiverBalances, newReceiverBalances, expectedReceiverBalances;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                        case 1:
                            expectedTokenFlows = _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                        case 2:
                            combinedTokenArray = _a.sent();
                            return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, accounts_1.DEFAULT_ACCOUNT)];
                        case 3:
                            oldReceiverBalances = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.getVaultBalances(vault, combinedTokenArray, accounts_1.DEFAULT_ACCOUNT)];
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
            return [2 /*return*/];
        });
    }); });
    describe('bidAndWithdraw', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAuctionModuleWrapper.bidAndWithdraw(subjectRebalancingSetToken, subjectBidQuantity, subjectAllowPartialFill, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var rebalancingSetToken, currentSetToken, nextSetToken, subjectRebalancingSetToken, subjectBidQuantity, subjectAllowPartialFill, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokens, proposalPeriod, managerAddress, rebalancingSetQuantityToIssue, _a, proposalComponentOne, proposalComponentTwo, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
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
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(9), constants_1.TX_DEFAULTS)];
                        case 3:
                            // Issue currentSetToken
                            _b.sent();
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
                            subjectRebalancingSetToken = rebalancingSetToken.address;
                            subjectBidQuantity = util_1.ether(2);
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
            it('transfers and withdraws the correct amount of tokens to the bidder wallet', function () { return __awaiter(_this, void 0, void 0, function () {
                var expectedTokenFlows, combinedTokenArray, oldReceiverBalances, newReceiverBalances, expectedReceiverBalances;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                        case 1:
                            expectedTokenFlows = _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.getCombinedTokenArray.callAsync()];
                        case 2:
                            combinedTokenArray = _a.sent();
                            return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, accounts_1.DEFAULT_ACCOUNT); }))];
                        case 3:
                            oldReceiverBalances = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, Promise.all(combinedTokenArray.map(function (tokenAddress) { return erc20Wrapper.balanceOf(tokenAddress, accounts_1.DEFAULT_ACCOUNT); }))];
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
            return [2 /*return*/];
        });
    }); });
    describe('redeemFromFailedRebalance', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingAuctionModuleWrapper.redeemFromFailedRebalance(subjectRebalancingSetTokenAddress, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, setTokens, _a, proposalComponentOne, proposalComponentTwo, proposalPeriod, managerAddress, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice, setBidAmount;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            setTokens = _b.sent();
                            currentSetToken = setTokens[0];
                            nextSetToken = setTokens[1];
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 2:
                            _a = _b.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 4:
                            _b.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            rebalancingSetToken = _b.sent();
                            // Issue currentSetToken
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, util_1.ether(7), constants_1.TX_DEFAULTS)];
                        case 6:
                            // Issue currentSetToken
                            _b.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _b.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
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
                            setBidAmount = util_1.ether(1);
                            return [4 /*yield*/, helpers_1.transitionToDrawdownAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice, rebalanceAuctionModule, setBidAmount)];
                        case 10:
                            _b.sent();
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
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
});
//# sourceMappingURL=RebalancingAuctionModuleWrapper.spec.js.map