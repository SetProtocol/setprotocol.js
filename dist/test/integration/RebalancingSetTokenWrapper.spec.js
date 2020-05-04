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
var web3_1 = __importDefault(require("web3"));
var set_protocol_utils_1 = require("set-protocol-utils");
var wrappers_1 = require("@src/wrappers");
var constants_1 = require("@src/constants");
var accounts_1 = require("@src/constants/accounts");
var util_1 = require("@src/util");
var units_1 = require("@src/util/units");
var helpers_1 = require("@test/helpers");
var chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(util_1.BigNumber));
var expect = chai.expect;
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var currentSnapshotId;
describe('RebalancingSetTokenWrapper', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var rebalancingSetTokenFactory;
    var rebalanceAuctionModule;
    var whitelist;
    var rebalancingSetTokenWrapper;
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
    describe('Default state variables: manager, rebalanceState, currentSet, unitShares,\
  lastRebalanceTimestamp, proposalPeriod, rebalanceInterval', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                var manager, rebalanceState, currentSet, unitShares, lastRebalanceTimestamp, proposalPeriod, rebalanceInterval;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.manager(subjectRebalancingSetTokenAddress)];
                        case 1:
                            manager = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                        case 2:
                            rebalanceState = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.currentSet(subjectRebalancingSetTokenAddress)];
                        case 3:
                            currentSet = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.unitShares(subjectRebalancingSetTokenAddress)];
                        case 4:
                            unitShares = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.lastRebalanceTimestamp(subjectRebalancingSetTokenAddress)];
                        case 5:
                            lastRebalanceTimestamp = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.proposalPeriod(subjectRebalancingSetTokenAddress)];
                        case 6:
                            proposalPeriod = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceInterval(subjectRebalancingSetTokenAddress)];
                        case 7:
                            rebalanceInterval = _a.sent();
                            return [2 /*return*/, {
                                    manager: manager,
                                    rebalanceState: rebalanceState,
                                    currentSet: currentSet,
                                    unitShares: unitShares,
                                    lastRebalanceTimestamp: lastRebalanceTimestamp,
                                    proposalPeriod: proposalPeriod,
                                    rebalanceInterval: rebalanceInterval,
                                }];
                    }
                });
            });
        }
        var currentSetToken, rebalancingSetToken, managerAddress, rebalanceTimestamp, subjectRebalancingSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokens, proposalPeriod, lastBlock;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, 2)];
                        case 1:
                            setTokens = _a.sent();
                            currentSetToken = setTokens[0];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _a.sent();
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 3:
                            lastBlock = _a.sent();
                            rebalanceTimestamp = new util_1.BigNumber(lastBlock.timestamp);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it fetches the set token properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, manager, rebalanceState, currentSet, unitShares, lastRebalanceTimestamp, proposalPeriod, rebalanceInterval;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a = _b.sent(), manager = _a.manager, rebalanceState = _a.rebalanceState, currentSet = _a.currentSet, unitShares = _a.unitShares, lastRebalanceTimestamp = _a.lastRebalanceTimestamp, proposalPeriod = _a.proposalPeriod, rebalanceInterval = _a.rebalanceInterval;
                            expect(manager).to.eql(managerAddress);
                            expect(rebalanceState).to.eql('Default');
                            expect(currentSet).to.eql(currentSetToken.address);
                            expect(unitShares).to.be.bignumber.equal(constants_1.DEFAULT_UNIT_SHARES);
                            expect(lastRebalanceTimestamp).to.be.bignumber.equal(rebalanceTimestamp);
                            expect(proposalPeriod).to.be.bignumber.equal(constants_1.ONE_DAY_IN_SECONDS);
                            expect(rebalanceInterval).to.be.bignumber.equal(constants_1.ONE_DAY_IN_SECONDS);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('Proposal state variables: proposalStartTime, nextSet, auctionLibrary,\
  auctionPriceDivisor, auctionStartPrice, curveCoefficient', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                var proposalStartTime, nextSet, auctionLibrary, auctionParameters, rebalanceState;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.proposalStartTime(subjectRebalancingSetTokenAddress)];
                        case 1:
                            proposalStartTime = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.nextSet(subjectRebalancingSetTokenAddress)];
                        case 2:
                            nextSet = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.auctionLibrary(subjectRebalancingSetTokenAddress)];
                        case 3:
                            auctionLibrary = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.auctionParameters(subjectRebalancingSetTokenAddress)];
                        case 4:
                            auctionParameters = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                        case 5:
                            rebalanceState = _a.sent();
                            return [2 /*return*/, { proposalStartTime: proposalStartTime,
                                    nextSet: nextSet,
                                    auctionLibrary: auctionLibrary,
                                    auctionParameters: auctionParameters,
                                    rebalanceState: rebalanceState,
                                }];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, managerAddress, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice, proposalStartTimestamp, subjectRebalancingSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, setTokens, proposalPeriod, priceCurve, _a, proposalComponentOne, proposalComponentTwo, lastBlock;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            setTokensToDeploy = 2;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            setTokens = _b.sent();
                            currentSetToken = setTokens[0];
                            nextSetToken = setTokens[1];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _b.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 3:
                            priceCurve = _b.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                        case 4:
                            _a = _b.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                        case 6:
                            _b.sent();
                            // Transition to proposal state
                            auctionPriceCurveAddress = priceCurve.address;
                            setAuctionTimeToPivot = new util_1.BigNumber(100000);
                            setAuctionStartPrice = new util_1.BigNumber(500);
                            setAuctionPivotPrice = new util_1.BigNumber(1000);
                            return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                        case 7:
                            _b.sent();
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 8:
                            lastBlock = _b.sent();
                            proposalStartTimestamp = new util_1.BigNumber(lastBlock.timestamp);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it fetches the set token properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, proposalStartTime, nextSet, auctionLibrary, auctionParameters, rebalanceState;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a = _b.sent(), proposalStartTime = _a.proposalStartTime, nextSet = _a.nextSet, auctionLibrary = _a.auctionLibrary, auctionParameters = _a.auctionParameters, rebalanceState = _a.rebalanceState;
                            expect(proposalStartTime).to.be.bignumber.equal(proposalStartTimestamp);
                            expect(nextSet).to.eql(nextSetToken.address);
                            expect(auctionLibrary).to.eql(auctionPriceCurveAddress);
                            expect(auctionParameters[1]).to.be.bignumber.equal(setAuctionTimeToPivot);
                            expect(auctionParameters[2]).to.be.bignumber.equal(setAuctionStartPrice);
                            expect(auctionParameters[3]).to.be.bignumber.equal(setAuctionPivotPrice);
                            expect(rebalanceState).to.eql('Proposal');
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('Rebalance state variables: auctionStartTime, minimumBid, remainingCurrentSets,\
  combinedTokenArray, combinedCurrentUnits, combinedNextSetUnits', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                var minimumBid, remainingCurrentSets, combinedTokenArray, combinedCurrentUnits, combinedNextSetUnits, rebalanceState;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.minimumBid(subjectRebalancingSetTokenAddress)];
                        case 1:
                            minimumBid = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.remainingCurrentSets(subjectRebalancingSetTokenAddress)];
                        case 2:
                            remainingCurrentSets = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.getCombinedTokenArray(subjectRebalancingSetTokenAddress)];
                        case 3:
                            combinedTokenArray = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.getCombinedCurrentUnits(subjectRebalancingSetTokenAddress)];
                        case 4:
                            combinedCurrentUnits = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.getCombinedNextSetUnits(subjectRebalancingSetTokenAddress)];
                        case 5:
                            combinedNextSetUnits = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                        case 6:
                            rebalanceState = _a.sent();
                            return [2 /*return*/, {
                                    rebalanceState: rebalanceState,
                                    minimumBid: minimumBid,
                                    remainingCurrentSets: remainingCurrentSets,
                                    combinedTokenArray: combinedTokenArray,
                                    combinedCurrentUnits: combinedCurrentUnits,
                                    combinedNextSetUnits: combinedNextSetUnits,
                                }];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, managerAddress, setAuctionStartTimestamp, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice, setStartingCurrentSetAmount, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, setTokens, _a, proposalComponentOne, proposalComponentTwo, proposalPeriod, baseSetIssueQuantity, priceCurve, lastBlock;
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
                            baseSetIssueQuantity = units_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _b.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = units_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 8:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 9:
                            priceCurve = _b.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            // Transition to proposal state
                            setAuctionTimeToPivot = new util_1.BigNumber(100000);
                            setAuctionStartPrice = new util_1.BigNumber(500);
                            setAuctionPivotPrice = new util_1.BigNumber(1000);
                            return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, priceCurve.address, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                        case 10:
                            _b.sent();
                            setStartingCurrentSetAmount = baseSetIssueQuantity;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 11:
                            lastBlock = _b.sent();
                            setAuctionStartTimestamp = new util_1.BigNumber(lastBlock.timestamp);
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it fetches the set token properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, rebalanceState, minimumBid, remainingCurrentSets, combinedTokenArray, combinedCurrentUnits, combinedNextSetUnits, auctionSetUpOutputs, returnedCombinedTokenArray, expectedCombinedTokenArray, returnedCombinedCurrentUnits, expectedCombinedCurrentUnits, returnedCombinedNextSetUnits, expectedCombinedNextSetUnits;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a = _b.sent(), rebalanceState = _a.rebalanceState, minimumBid = _a.minimumBid, remainingCurrentSets = _a.remainingCurrentSets, combinedTokenArray = _a.combinedTokenArray, combinedCurrentUnits = _a.combinedCurrentUnits, combinedNextSetUnits = _a.combinedNextSetUnits;
                            return [4 /*yield*/, helpers_1.getAuctionSetUpOutputsAsync(rebalancingSetToken, currentSetToken, nextSetToken, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 2:
                            auctionSetUpOutputs = _b.sent();
                            expect(minimumBid).to.be.bignumber.equal(auctionSetUpOutputs['expectedMinimumBid']);
                            expect(remainingCurrentSets).to.be.bignumber.equal(rebalancingSetQuantityToIssue);
                            returnedCombinedTokenArray = JSON.stringify(combinedTokenArray);
                            expectedCombinedTokenArray = JSON.stringify(auctionSetUpOutputs['expectedCombinedTokenArray']);
                            expect(returnedCombinedTokenArray).to.equal(expectedCombinedTokenArray);
                            returnedCombinedCurrentUnits = JSON.stringify(combinedCurrentUnits);
                            expectedCombinedCurrentUnits = JSON.stringify(auctionSetUpOutputs['expectedCombinedCurrentUnits']);
                            expect(returnedCombinedCurrentUnits).to.equal(expectedCombinedCurrentUnits);
                            returnedCombinedNextSetUnits = JSON.stringify(combinedNextSetUnits);
                            expectedCombinedNextSetUnits = JSON.stringify(auctionSetUpOutputs['expectedCombinedNextUnits']);
                            expect(returnedCombinedNextSetUnits).to.equal(expectedCombinedNextSetUnits);
                            expect(rebalanceState).to.eql('Rebalance');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('fetches the correct auctionStartTime', function () { return __awaiter(_this, void 0, void 0, function () {
                var auctionStartTime;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.auctionStartTime(subjectRebalancingSetTokenAddress)];
                        case 1:
                            auctionStartTime = _a.sent();
                            expect(auctionStartTime).to.be.bignumber.equal(setAuctionStartTimestamp);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('fetches the correct auctionTimeToPivot', function () { return __awaiter(_this, void 0, void 0, function () {
                var auctionTimeToPivot;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.auctionTimeToPivot(subjectRebalancingSetTokenAddress)];
                        case 1:
                            auctionTimeToPivot = _a.sent();
                            expect(auctionTimeToPivot).to.be.bignumber.equal(setAuctionTimeToPivot);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('fetches the correct auctionStartPrice', function () { return __awaiter(_this, void 0, void 0, function () {
                var auctionStartPrice;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.auctionStartPrice(subjectRebalancingSetTokenAddress)];
                        case 1:
                            auctionStartPrice = _a.sent();
                            expect(auctionStartPrice).to.be.bignumber.equal(setAuctionStartPrice);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('fetches the correct startingCurrentSetAmount', function () { return __awaiter(_this, void 0, void 0, function () {
                var startingCurrentSetAmount;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.startingCurrentSetAmount(subjectRebalancingSetTokenAddress)];
                        case 1:
                            startingCurrentSetAmount = _a.sent();
                            expect(startingCurrentSetAmount).to.be.bignumber.equal(setStartingCurrentSetAmount);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('fetches the correct auctionPivotPrice', function () { return __awaiter(_this, void 0, void 0, function () {
                var auctionPivotPrice;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.auctionPivotPrice(subjectRebalancingSetTokenAddress)];
                        case 1:
                            auctionPivotPrice = _a.sent();
                            expect(auctionPivotPrice).to.be.bignumber.equal(setAuctionPivotPrice);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getBidPrice', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.getBidPrice(subjectRebalancingSetTokenAddress, subjectBidQuantity)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, managerAddress, subjectRebalancingSetTokenAddress, subjectBidQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, setTokens, _a, proposalComponentOne, proposalComponentTwo, proposalPeriod, priceCurve, baseSetIssueQuantity, rebalancingSetQuantityToIssue, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
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
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 6:
                            priceCurve = _b.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            baseSetIssueQuantity = units_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                        case 7:
                            _b.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 8:
                            _b.sent();
                            rebalancingSetQuantityToIssue = units_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 9:
                            _b.sent();
                            auctionPriceCurveAddress = priceCurve.address;
                            setAuctionTimeToPivot = new util_1.BigNumber(100000);
                            setAuctionStartPrice = new util_1.BigNumber(500);
                            setAuctionPivotPrice = new util_1.BigNumber(1000);
                            return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                        case 10:
                            _b.sent();
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectBidQuantity = units_1.ether(2);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it fetches the correct token flow arrays', function () { return __awaiter(_this, void 0, void 0, function () {
                var returnedTokenFlowArrays, expectedTokenFlowArrays, returnedInflowArray, expectedInflowArray, returnedOutflowArray, expectedOutflowArray;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            returnedTokenFlowArrays = _a.sent();
                            return [4 /*yield*/, helpers_1.constructInflowOutflowArraysAsync(rebalancingSetToken, subjectBidQuantity, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR)];
                        case 2:
                            expectedTokenFlowArrays = _a.sent();
                            returnedInflowArray = JSON.stringify(returnedTokenFlowArrays['inflow']);
                            expectedInflowArray = JSON.stringify(expectedTokenFlowArrays['inflow']);
                            expect(returnedInflowArray).to.eql(expectedInflowArray);
                            returnedOutflowArray = JSON.stringify(returnedTokenFlowArrays['outflow']);
                            expectedOutflowArray = JSON.stringify(expectedTokenFlowArrays['outflow']);
                            expect(returnedOutflowArray).to.eql(expectedOutflowArray);
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
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.propose(subjectRebalancingSetTokenAddress, subjectNextSet, subjectAuctionPriceCurveAddress, subjectAuctionTimeToPivot, subjectAuctionStartPrice, subjectAuctionPivotPrice, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, managerAddress, subjectRebalancingSetTokenAddress, subjectNextSet, subjectAuctionPriceCurveAddress, subjectAuctionTimeToPivot, subjectAuctionStartPrice, subjectAuctionPivotPrice, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, setTokens, _a, proposalComponentOne, proposalComponentTwo, proposalPeriod, priceCurve;
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
                            return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                        case 6:
                            priceCurve = _b.sent();
                            helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                            // Fast forward to allow propose to be called
                            helpers_1.increaseChainTimeAsync(web3, proposalPeriod.add(1));
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
            test('it sets the rebalancing set token properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var nextSet, auctionLibrary, auctionParameters, rebalanceState;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.nextSet(subjectRebalancingSetTokenAddress)];
                        case 2:
                            nextSet = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.auctionLibrary(subjectRebalancingSetTokenAddress)];
                        case 3:
                            auctionLibrary = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.auctionParameters(subjectRebalancingSetTokenAddress)];
                        case 4:
                            auctionParameters = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                        case 5:
                            rebalanceState = _a.sent();
                            expect(nextSet).to.eql(subjectNextSet);
                            expect(auctionLibrary).to.eql(subjectAuctionPriceCurveAddress);
                            expect(auctionParameters[1]).to.be.bignumber.equal(subjectAuctionTimeToPivot);
                            expect(auctionParameters[2]).to.be.bignumber.equal(subjectAuctionStartPrice);
                            expect(auctionParameters[3]).to.be.bignumber.equal(subjectAuctionPivotPrice);
                            expect(rebalanceState).to.eql('Proposal');
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('startRebalance', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.startRebalance(subjectRebalancingSetTokenAddress, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, setTokens, _a, proposalComponentOne, proposalComponentTwo, proposalPeriod, managerAddress, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
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
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, units_1.ether(7), constants_1.TX_DEFAULTS)];
                        case 6:
                            // Issue currentSetToken
                            _b.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _b.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = units_1.ether(7);
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
                            return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                        case 10:
                            _b.sent();
                            // Fast forward to allow propose to be called
                            helpers_1.increaseChainTimeAsync(web3, proposalPeriod.add(1));
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectCaller = managerAddress;
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
                            expect(returnedRemainingCurrentSets).to.be.bignumber.equal(rebalancingSetQuantityToIssue);
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
            return [2 /*return*/];
        });
    }); });
    describe('settleRebalance', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.settleRebalance(subjectRebalancingSetTokenAddress, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, setTokens, _a, proposalComponentOne, proposalComponentTwo, proposalPeriod, managerAddress, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
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
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, units_1.ether(7), constants_1.TX_DEFAULTS)];
                        case 6:
                            // Issue currentSetToken
                            _b.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _b.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = units_1.ether(7);
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
                            return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                        case 10:
                            _b.sent();
                            // Bid to rebalance the outstanding amount of currentSetToken
                            return [4 /*yield*/, rebalanceAuctionModule.bid.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue, false)];
                        case 11:
                            // Bid to rebalance the outstanding amount of currentSetToken
                            _b.sent();
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectCaller = managerAddress;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it fetches the set token properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
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
    describe('setManager', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.setManager(subjectRebalancingSetTokenAddress, subjectNewManager, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, rebalancingSetToken, subjectRebalancingSetTokenAddress, subjectNewManager, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, setTokens, proposalPeriod, managerAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setTokensToDeploy = 1;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            setTokens = _a.sent();
                            currentSetToken = setTokens[0];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _a.sent();
                            subjectNewManager = accounts_1.ACCOUNTS[2].address;
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
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
            return [2 /*return*/];
        });
    }); });
    describe('endFailedAuction', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.endFailedAuction(subjectRebalancingSetTokenAddress, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, nextSetToken, rebalancingSetToken, rebalancingSetQuantityToIssue, subjectRebalancingSetTokenAddress, subjectCaller, pivotTime;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, setTokens, _a, proposalComponentOne, proposalComponentTwo, proposalPeriod, managerAddress, priceCurve, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice;
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
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, units_1.ether(7), constants_1.TX_DEFAULTS)];
                        case 6:
                            // Issue currentSetToken
                            _b.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 7:
                            _b.sent();
                            // Use issued currentSetToken to issue rebalancingSetToken
                            rebalancingSetQuantityToIssue = units_1.ether(7);
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
                            return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, auctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                        case 10:
                            _b.sent();
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            subjectCaller = managerAddress;
                            pivotTime = setAuctionTimeToPivot;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it returns an auction to Default correctly if no bids and past the pivot time', function () { return __awaiter(_this, void 0, void 0, function () {
                var expectedUnitShares, lastBlock, auctionEndTimestamp, returnedRebalanceState, returnedCurrentSet, returnedUnitShares, returnedLastRebalanceTimestamp;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.getExpectedUnitSharesAsync(rebalancingSetToken, nextSetToken, vault)];
                        case 1:
                            expectedUnitShares = _a.sent();
                            // Fast forward to 1 second after pivot time
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, pivotTime.add(1))];
                        case 2:
                            // Fast forward to 1 second after pivot time
                            _a.sent();
                            return [4 /*yield*/, subject()];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 4:
                            lastBlock = _a.sent();
                            auctionEndTimestamp = new util_1.BigNumber(lastBlock.timestamp);
                            return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                        case 5:
                            returnedRebalanceState = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.currentSet(subjectRebalancingSetTokenAddress)];
                        case 6:
                            returnedCurrentSet = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.unitShares(subjectRebalancingSetTokenAddress)];
                        case 7:
                            returnedUnitShares = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.lastRebalanceTimestamp(subjectRebalancingSetTokenAddress)];
                        case 8:
                            returnedLastRebalanceTimestamp = _a.sent();
                            expect(returnedRebalanceState).to.eql('Default');
                            expect(returnedCurrentSet).to.not.eql(nextSetToken.address);
                            expect(returnedUnitShares).to.not.be.bignumber.equal(expectedUnitShares);
                            expect(returnedLastRebalanceTimestamp).to.be.bignumber.equal(auctionEndTimestamp);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it sets an auction to Drawdown correctly if there is a bid and past the pivot time', function () { return __awaiter(_this, void 0, void 0, function () {
                var expectedUnitShares, returnedMinimumBid, lastBlock, auctionEndTimestamp, returnedRebalanceState, returnedCurrentSet, returnedUnitShares, returnedLastRebalanceTimestamp;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.getExpectedUnitSharesAsync(rebalancingSetToken, nextSetToken, vault)];
                        case 1:
                            expectedUnitShares = _a.sent();
                            // Fast forward to 1 second after pivot time
                            return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, pivotTime.add(1))];
                        case 2:
                            // Fast forward to 1 second after pivot time
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.minimumBid(subjectRebalancingSetTokenAddress)];
                        case 3:
                            returnedMinimumBid = _a.sent();
                            return [4 /*yield*/, rebalanceAuctionModule.bid.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue.sub(returnedMinimumBid), false)];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, subject()];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 6:
                            lastBlock = _a.sent();
                            auctionEndTimestamp = new util_1.BigNumber(lastBlock.timestamp);
                            return [4 /*yield*/, rebalancingSetTokenWrapper.rebalanceState(subjectRebalancingSetTokenAddress)];
                        case 7:
                            returnedRebalanceState = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.currentSet(subjectRebalancingSetTokenAddress)];
                        case 8:
                            returnedCurrentSet = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.unitShares(subjectRebalancingSetTokenAddress)];
                        case 9:
                            returnedUnitShares = _a.sent();
                            return [4 /*yield*/, rebalancingSetTokenWrapper.lastRebalanceTimestamp(subjectRebalancingSetTokenAddress)];
                        case 10:
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
    describe('tokenIsComponent', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetTokenWrapper.tokenIsComponent(subjectRebalancingSetTokenAddress, subjectComponent)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var currentSetToken, rebalancingSetToken, subjectRebalancingSetTokenAddress, subjectComponent;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setTokensToDeploy, setTokens, proposalPeriod, managerAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setTokensToDeploy = 1;
                            return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                        case 1:
                            setTokens = _a.sent();
                            currentSetToken = setTokens[0];
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 2:
                            rebalancingSetToken = _a.sent();
                            subjectComponent = currentSetToken.address;
                            subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it returns true', function () { return __awaiter(_this, void 0, void 0, function () {
                var isComponent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            isComponent = _a.sent();
                            expect(isComponent).to.be.true;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectComponent = accounts_1.ACCOUNTS[3].address;
                            return [2 /*return*/];
                        });
                    }); });
                    it('returns the proper rebalancing details', function () { return __awaiter(_this, void 0, void 0, function () {
                        var isComponent;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    isComponent = _a.sent();
                                    expect(isComponent).to.be.false;
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
//# sourceMappingURL=RebalancingSetTokenWrapper.spec.js.map