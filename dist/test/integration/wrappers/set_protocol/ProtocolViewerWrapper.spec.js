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
var chai = __importStar(require("chai"));
var setProtocolUtils = __importStar(require("set-protocol-utils"));
var web3_1 = __importDefault(require("web3"));
var set_protocol_contracts_1 = require("set-protocol-contracts");
var set_protocol_oracles_1 = require("set-protocol-oracles");
var wrappers_1 = require("@src/wrappers");
var constants_1 = require("@src/constants");
var accounts_1 = require("@src/constants/accounts");
var util_1 = require("@src/util");
var helpers_1 = require("@test/helpers");
var compoundHelper_1 = require("@test/helpers/compoundHelper");
var chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(util_1.BigNumber));
var SetUtils = setProtocolUtils.SetProtocolUtils, Web3Utils = setProtocolUtils.Web3Utils;
var expect = chai.expect;
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new Web3Utils(web3);
var currentSnapshotId;
var coreHelper = new set_protocol_contracts_1.CoreHelper(constants_1.DEFAULT_ACCOUNT, constants_1.DEFAULT_ACCOUNT);
var erc20Helper = new set_protocol_contracts_1.ERC20Helper(constants_1.DEFAULT_ACCOUNT);
var oracleHelper = new set_protocol_oracles_1.OracleHelper(constants_1.DEFAULT_ACCOUNT);
var valuationHelper = new set_protocol_contracts_1.ValuationHelper(constants_1.DEFAULT_ACCOUNT, coreHelper, erc20Helper, oracleHelper);
var compoundHelper = new compoundHelper_1.CompoundHelper();
var feeCalculatorHelper = new set_protocol_contracts_1.FeeCalculatorHelper(constants_1.DEFAULT_ACCOUNT);
describe('ProtocolViewer', function () {
    var transferProxy;
    var core;
    var setTokenFactory;
    var rebalancingSetTokenFactory;
    var priceCurve;
    var whitelist;
    var currentSetToken;
    var nextSetToken;
    var rebalancingSetToken;
    var protocolViewerWrapper;
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var setTokens, proposalPeriod, managerAddress, _a, proposalComponentOne, proposalComponentTwo, protocolViewer;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _c.sent();
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 2:
                    _b = _c.sent(), core = _b[0], transferProxy = _b[1], setTokenFactory = _b[3], rebalancingSetTokenFactory = _b[4], whitelist = _b[6];
                    return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, 2)];
                case 3:
                    setTokens = _c.sent();
                    currentSetToken = setTokens[0];
                    nextSetToken = setTokens[1];
                    proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                    managerAddress = accounts_1.ACCOUNTS[1].address;
                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                case 4:
                    rebalancingSetToken = _c.sent();
                    return [4 /*yield*/, nextSetToken.getComponents.callAsync()];
                case 5:
                    _a = _c.sent(), proposalComponentOne = _a[0], proposalComponentTwo = _a[1];
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentOne)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.addWhiteListedTokenAsync(whitelist, proposalComponentTwo)];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, helpers_1.deployConstantAuctionPriceCurveAsync(web3, constants_1.DEFAULT_AUCTION_PRICE_NUMERATOR, constants_1.DEFAULT_AUCTION_PRICE_DENOMINATOR)];
                case 8:
                    // Deploy price curve used in auction
                    priceCurve = _c.sent();
                    helpers_1.addPriceCurveToCoreAsync(core, priceCurve.address);
                    return [4 /*yield*/, helpers_1.deployProtocolViewerAsync(web3)];
                case 9:
                    protocolViewer = _c.sent();
                    protocolViewerWrapper = new wrappers_1.ProtocolViewerWrapper(web3, protocolViewer.address);
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
    describe('#batchFetchBalancesOf', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, protocolViewerWrapper.batchFetchBalancesOf(subjectTokenAddresses, subjectOwnerAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTokenAddresses, subjectOwnerAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    subjectTokenAddresses = [currentSetToken.address, rebalancingSetToken.address];
                    subjectOwnerAddress = accounts_1.ACCOUNTS[0].address;
                    return [2 /*return*/];
                });
            }); });
            test('fetches the balances of the token addresses', function () { return __awaiter(_this, void 0, void 0, function () {
                var tokenBalances, expectedTokenBalances;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            tokenBalances = _a.sent();
                            return [4 /*yield*/, helpers_1.getTokenBalances([currentSetToken, rebalancingSetToken], subjectOwnerAddress)];
                        case 2:
                            expectedTokenBalances = _a.sent();
                            expect(JSON.stringify(tokenBalances)).to.equal(JSON.stringify(expectedTokenBalances));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#batchFetchUsersBalances', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, protocolViewerWrapper.batchFetchUsersBalances(subjectTokenAddresses, subjectOwnerAddresses)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTokenAddresses, subjectOwnerAddresses, firstOwner, secondOwner;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    firstOwner = accounts_1.ACCOUNTS[0].address;
                    secondOwner = accounts_1.ACCOUNTS[1].address;
                    subjectTokenAddresses = [currentSetToken.address, rebalancingSetToken.address, nextSetToken.address];
                    subjectOwnerAddresses = [firstOwner, secondOwner, firstOwner];
                    return [2 /*return*/];
                });
            }); });
            test('fetches the balances of the token address, user address pairs', function () { return __awaiter(_this, void 0, void 0, function () {
                var tokenBalances, expectedFirstOwnerBalances, expectedSecondOwnerBalances, expectedTokenBalances;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            tokenBalances = _a.sent();
                            return [4 /*yield*/, helpers_1.getTokenBalances([currentSetToken, rebalancingSetToken], firstOwner)];
                        case 2:
                            expectedFirstOwnerBalances = _a.sent();
                            return [4 /*yield*/, helpers_1.getTokenBalances([nextSetToken], secondOwner)];
                        case 3:
                            expectedSecondOwnerBalances = _a.sent();
                            expectedTokenBalances = [
                                expectedFirstOwnerBalances[0],
                                expectedSecondOwnerBalances[0],
                                expectedFirstOwnerBalances[1],
                            ];
                            expect(JSON.stringify(tokenBalances)).to.equal(JSON.stringify(expectedTokenBalances));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#batchFetchSupplies', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, protocolViewerWrapper.batchFetchSupplies(subjectTokenAddresses)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTokenAddresses;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    subjectTokenAddresses = [currentSetToken.address, rebalancingSetToken.address];
                    return [2 /*return*/];
                });
            }); });
            test('fetches the supplies of the token addresses', function () { return __awaiter(_this, void 0, void 0, function () {
                var tokenSupplies, expectedTokenSupplies;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            tokenSupplies = _a.sent();
                            return [4 /*yield*/, helpers_1.getTokenSupplies([currentSetToken, rebalancingSetToken])];
                        case 2:
                            expectedTokenSupplies = _a.sent();
                            expect(JSON.stringify(tokenSupplies)).to.equal(JSON.stringify(expectedTokenSupplies));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#fetchRebalanceProposalStateAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, protocolViewerWrapper.fetchRebalanceProposalStateAsync(subjectRebalancingSetTokenAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectRebalancingSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                    return [2 /*return*/];
                });
            }); });
            test('fetches the proposal state of the rebalancing set', function () { return __awaiter(_this, void 0, void 0, function () {
                var rebalanceProposalState, rebalancingSetState, _a, nextSetAddress, auctionLibraryAddress, _b, proposalStartTime, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            rebalanceProposalState = _c.sent();
                            rebalancingSetState = rebalanceProposalState[0];
                            expect(rebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.DEFAULT);
                            _a = rebalanceProposalState[1], nextSetAddress = _a[0], auctionLibraryAddress = _a[1];
                            expect(nextSetAddress).to.equal(constants_1.NULL_ADDRESS);
                            expect(auctionLibraryAddress).to.equal(constants_1.NULL_ADDRESS);
                            _b = rebalanceProposalState[2], proposalStartTime = _b[0], auctionTimeToPivot = _b[1], auctionStartPrice = _b[2], auctionPivotPrice = _b[3];
                            expect(proposalStartTime).to.be.bignumber.equal(constants_1.ZERO);
                            expect(auctionTimeToPivot).to.be.bignumber.equal(constants_1.ZERO);
                            expect(auctionStartPrice).to.be.bignumber.equal(constants_1.ZERO);
                            expect(auctionPivotPrice).to.be.bignumber.equal(constants_1.ZERO);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Proposal state', function () { return __awaiter(_this, void 0, void 0, function () {
                var setAuctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice, managerAddress;
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
                                    managerAddress = accounts_1.ACCOUNTS[1].address;
                                    return [4 /*yield*/, helpers_1.transitionToProposeAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress, setAuctionTimeToPivot, setAuctionStartPrice, setAuctionPivotPrice)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('returns the proper proposal details', function () { return __awaiter(_this, void 0, void 0, function () {
                        var rebalanceProposalState, rebalancingSetState, _a, nextSetAddress, auctionLibraryAddress, _b, proposalStartTime, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice, proposedAt;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    rebalanceProposalState = _c.sent();
                                    rebalancingSetState = rebalanceProposalState[0];
                                    expect(rebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.PROPOSAL);
                                    _a = rebalanceProposalState[1], nextSetAddress = _a[0], auctionLibraryAddress = _a[1];
                                    expect(nextSetAddress).to.equal(nextSetToken.address);
                                    expect(auctionLibraryAddress).to.equal(priceCurve.address);
                                    _b = rebalanceProposalState[2], proposalStartTime = _b[0], auctionTimeToPivot = _b[1], auctionStartPrice = _b[2], auctionPivotPrice = _b[3];
                                    expect(auctionTimeToPivot).to.be.bignumber.equal(setAuctionTimeToPivot);
                                    expect(auctionStartPrice).to.be.bignumber.equal(setAuctionStartPrice);
                                    expect(auctionPivotPrice).to.be.bignumber.equal(setAuctionPivotPrice);
                                    return [4 /*yield*/, rebalancingSetToken.proposalStartTime.callAsync()];
                                case 2:
                                    proposedAt = _c.sent();
                                    expect(proposalStartTime).to.bignumber.equal(proposedAt);
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
    describe('#fetchRebalanceAuctionStateAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, protocolViewerWrapper.fetchRebalanceAuctionStateAsync(subjectRebalancingSetTokenAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectRebalancingSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    subjectRebalancingSetTokenAddress = rebalancingSetToken.address;
                    return [2 /*return*/];
                });
            }); });
            test('fetches the rebalance auction state of the rebalancing set', function () { return __awaiter(_this, void 0, void 0, function () {
                var rebalanceAuctionState, rebalancingSetState, _a, startingCurrentSetAmount, auctionStartTime, minimumBid, remainingCurrentSets;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            rebalanceAuctionState = _b.sent();
                            rebalancingSetState = rebalanceAuctionState[0];
                            expect(rebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.DEFAULT);
                            _a = rebalanceAuctionState[1], startingCurrentSetAmount = _a[0], auctionStartTime = _a[1], minimumBid = _a[2], remainingCurrentSets = _a[3];
                            expect(startingCurrentSetAmount).to.be.bignumber.equal(constants_1.ZERO);
                            expect(auctionStartTime).to.be.bignumber.equal(constants_1.ZERO);
                            expect(minimumBid).to.be.bignumber.equal(constants_1.ZERO);
                            expect(remainingCurrentSets).to.be.bignumber.equal(constants_1.ZERO);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the Rebalancing Set Token is in Rebalance state', function () { return __awaiter(_this, void 0, void 0, function () {
                var managerAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var baseSetIssueQuantity, rebalancingSetQuantityToIssue, setAuctionPriceCurveAddress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    baseSetIssueQuantity = util_1.ether(7);
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                                case 2:
                                    _a.sent();
                                    rebalancingSetQuantityToIssue = util_1.ether(7);
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                                case 3:
                                    _a.sent();
                                    setAuctionPriceCurveAddress = priceCurve.address;
                                    managerAddress = accounts_1.ACCOUNTS[1].address;
                                    return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                                case 4:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('returns the proper rebalance details', function () { return __awaiter(_this, void 0, void 0, function () {
                        var rebalanceAuctionState, rebalancingSetState, _a, startingCurrentSetAmount, auctionStartTime, minimumBid, expectedStartingCurrentSetAmount, expectedAuctionStartTime, _b, expectedMinimumBid, expectedRemainingCurrentSets;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    rebalanceAuctionState = _c.sent();
                                    rebalancingSetState = rebalanceAuctionState[0];
                                    expect(rebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.REBALANCE);
                                    _a = rebalanceAuctionState[1], startingCurrentSetAmount = _a[0], auctionStartTime = _a[1], minimumBid = _a[2];
                                    return [4 /*yield*/, rebalancingSetToken.startingCurrentSetAmount.callAsync()];
                                case 2:
                                    expectedStartingCurrentSetAmount = _c.sent();
                                    expect(startingCurrentSetAmount).to.be.bignumber.equal(expectedStartingCurrentSetAmount);
                                    return [4 /*yield*/, rebalancingSetToken.getAuctionPriceParameters.callAsync()];
                                case 3:
                                    expectedAuctionStartTime = (_c.sent())[0];
                                    expect(auctionStartTime).to.be.bignumber.equal(expectedAuctionStartTime);
                                    return [4 /*yield*/, rebalancingSetToken.getBiddingParameters.callAsync()];
                                case 4:
                                    _b = _c.sent(), expectedMinimumBid = _b[0], expectedRemainingCurrentSets = _b[1];
                                    expect(minimumBid).to.be.bignumber.equal(expectedMinimumBid);
                                    expect(expectedRemainingCurrentSets).to.be.bignumber.equal(expectedRemainingCurrentSets);
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
    describe('#batchFetchRebalanceStateAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, protocolViewerWrapper.batchFetchRebalanceStateAsync(subjectRebalancingSetTokenAddresses)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectRebalancingSetTokenAddresses, managerAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var baseSetIssueQuantity, rebalancingSetQuantityToIssue, setAuctionPriceCurveAddress, proposalPeriod, defaultRebalancingSetToken;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            baseSetIssueQuantity = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetToken.address, baseSetIssueQuantity, constants_1.TX_DEFAULTS)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetToken], transferProxy.address)];
                        case 2:
                            _a.sent();
                            rebalancingSetQuantityToIssue = util_1.ether(7);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue)];
                        case 3:
                            _a.sent();
                            setAuctionPriceCurveAddress = priceCurve.address;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.transitionToRebalanceAsync(web3, rebalancingSetToken, managerAddress, nextSetToken.address, setAuctionPriceCurveAddress)];
                        case 4:
                            _a.sent();
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 5:
                            defaultRebalancingSetToken = _a.sent();
                            subjectRebalancingSetTokenAddresses = [rebalancingSetToken.address, defaultRebalancingSetToken.address];
                            return [2 /*return*/];
                    }
                });
            }); });
            test('fetches the rebalance auction state of the rebalancing set', function () { return __awaiter(_this, void 0, void 0, function () {
                var rebalanceAuctionStates, firstRebalancingSetState, secondRebalancingSetState;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            rebalanceAuctionStates = _a.sent();
                            firstRebalancingSetState = rebalanceAuctionStates[0];
                            expect(firstRebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.REBALANCE);
                            secondRebalancingSetState = rebalanceAuctionStates[1];
                            expect(secondRebalancingSetState).to.be.bignumber.equal(SetUtils.REBALANCING_STATE.DEFAULT);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#batchFetchUnitSharesAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, protocolViewerWrapper.batchFetchUnitSharesAsync(subjectRebalancingSetTokenAddresses)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectRebalancingSetTokenAddresses, defaultRebalancingSetToken;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var proposalPeriod, managerAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            proposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            managerAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, managerAddress, currentSetToken.address, proposalPeriod)];
                        case 1:
                            defaultRebalancingSetToken = _a.sent();
                            subjectRebalancingSetTokenAddresses = [rebalancingSetToken.address, defaultRebalancingSetToken.address];
                            return [2 /*return*/];
                    }
                });
            }); });
            test('fetches the RebalancingSetTokens\' unitShares', function () { return __awaiter(_this, void 0, void 0, function () {
                var rebalanceUnitShares, firstUnitShares, firstExpectedUnitShares, secondUnitShares, secondExpectedUnitShares;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            rebalanceUnitShares = _a.sent();
                            firstUnitShares = rebalanceUnitShares[0];
                            return [4 /*yield*/, rebalancingSetToken.unitShares.callAsync()];
                        case 2:
                            firstExpectedUnitShares = _a.sent();
                            expect(firstUnitShares).to.be.bignumber.equal(firstExpectedUnitShares);
                            secondUnitShares = rebalanceUnitShares[1];
                            return [4 /*yield*/, defaultRebalancingSetToken.unitShares.callAsync()];
                        case 3:
                            secondExpectedUnitShares = _a.sent();
                            expect(secondUnitShares).to.be.bignumber.equal(secondExpectedUnitShares);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('Trading Pool V1 Tests', function () { return __awaiter(_this, void 0, void 0, function () {
        var rebalancingSetTokenV2, rebalancingFactory, rebalancingComponentWhiteList, liquidatorWhitelist, liquidator, fixedFeeCalculator, feeCalculatorWhitelist, name, auctionPeriod, rangeStart, rangeEnd, oracleWhiteList, component1, component2, component1Price, component2Price, set1, set2, set1Components, set1Units, set1NaturalUnit, set2Components, set2Units, set2NaturalUnit, component1Oracle, component2Oracle, currentSetTokenV2, nextSetTokenV2, currentAllocation, lastRebalanceTimestamp, setManager, deployerAccount, trader, allocator, feeRecipient;
        var _this = this;
        return __generator(this, function (_a) {
            deployerAccount = constants_1.DEFAULT_ACCOUNT;
            trader = accounts_1.ACCOUNTS[1].address;
            allocator = accounts_1.ACCOUNTS[2].address;
            feeRecipient = accounts_1.ACCOUNTS[3].address;
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var component1Decimal, component2Decimal, set1NaturalUnitExponent, set2NaturalUnitExponent, failPeriod, timestamp;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [18, 18], web3, constants_1.DEFAULT_ACCOUNT)];
                        case 1:
                            _a = _b.sent(), component1 = _a[0], component2 = _a[1];
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([component1, component2], transferProxy.address)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, component1.decimals.callAsync()];
                        case 3:
                            component1Decimal = _b.sent();
                            return [4 /*yield*/, component2.decimals.callAsync()];
                        case 4:
                            component2Decimal = _b.sent();
                            set1Components = [component1.address, component2.address];
                            set1Units = [new util_1.BigNumber(1), new util_1.BigNumber(1)];
                            set1NaturalUnitExponent = 18 - Math.min(component1Decimal.toNumber(), component2Decimal.toNumber());
                            set1NaturalUnit = new util_1.BigNumber(Math.pow(10, set1NaturalUnitExponent));
                            set2Components = [component1.address, component2.address];
                            set2Units = [new util_1.BigNumber(2), new util_1.BigNumber(3)];
                            set2NaturalUnitExponent = 18 - Math.min(component1Decimal.toNumber(), component2Decimal.toNumber());
                            set2NaturalUnit = new util_1.BigNumber(2 * Math.pow(10, set2NaturalUnitExponent));
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, set1Components, set1Units, set1NaturalUnit)];
                        case 5:
                            set1 = _b.sent();
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, set2Components, set2Units, set2NaturalUnit)];
                        case 6:
                            set2 = _b.sent();
                            component1Price = util_1.ether(1);
                            component2Price = util_1.ether(2);
                            return [4 /*yield*/, helpers_1.deployConstantPriceOracleAsync(web3, component1Price)];
                        case 7:
                            component1Oracle = _b.sent();
                            return [4 /*yield*/, helpers_1.deployConstantPriceOracleAsync(web3, component2Price)];
                        case 8:
                            component2Oracle = _b.sent();
                            return [4 /*yield*/, helpers_1.deployOracleWhiteListAsync(web3, [component1.address, component2.address], [component1Oracle.address, component2Oracle.address])];
                        case 9:
                            oracleWhiteList = _b.sent();
                            auctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            rangeStart = new util_1.BigNumber(10); // 10% above fair value
                            rangeEnd = new util_1.BigNumber(10); // 10% below fair value
                            name = 'liquidator';
                            return [4 /*yield*/, helpers_1.deployLinearAuctionLiquidatorContractAsync(web3, core, oracleWhiteList, auctionPeriod, rangeStart, rangeEnd, name)];
                        case 10:
                            liquidator = _b.sent();
                            return [4 /*yield*/, helpers_1.deployFixedFeeCalculatorAsync(web3)];
                        case 11:
                            fixedFeeCalculator = _b.sent();
                            return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [component1.address, component2.address])];
                        case 12:
                            rebalancingComponentWhiteList = _b.sent();
                            return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [liquidator.address])];
                        case 13:
                            liquidatorWhitelist = _b.sent();
                            return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [fixedFeeCalculator.address])];
                        case 14:
                            feeCalculatorWhitelist = _b.sent();
                            return [4 /*yield*/, helpers_1.deployRebalancingSetTokenV2FactoryContractAsync(web3, core, rebalancingComponentWhiteList, liquidatorWhitelist, feeCalculatorWhitelist)];
                        case 15:
                            rebalancingFactory = _b.sent();
                            currentSetTokenV2 = set1;
                            return [4 /*yield*/, helpers_1.deploySocialTradingManagerMockAsync(web3)];
                        case 16:
                            setManager = _b.sent();
                            failPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 17:
                            timestamp = (_b.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenV2Async(web3, core, rebalancingFactory.address, setManager.address, liquidator.address, feeRecipient, fixedFeeCalculator.address, currentSetTokenV2.address, failPeriod, lastRebalanceTimestamp)];
                        case 18:
                            rebalancingSetTokenV2 = _b.sent();
                            currentAllocation = util_1.ether(.6);
                            return [4 /*yield*/, setManager.updateRecord.sendTransactionAsync(rebalancingSetTokenV2.address, trader, allocator, currentAllocation)];
                        case 19:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('#fetchNewTradingPoolDetails', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, protocolViewerWrapper.fetchNewTradingPoolDetails(subjectTradingPool)];
                        });
                    });
                }
                var subjectTradingPool;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTradingPool = rebalancingSetTokenV2.address;
                            return [2 /*return*/];
                        });
                    }); });
                    it('fetches the correct poolInfo data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, poolInfo;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), poolInfo = _a[0];
                                    expect(poolInfo.trader).to.equal(trader);
                                    expect(poolInfo.allocator).to.equal(allocator);
                                    expect(poolInfo.currentAllocation).to.be.bignumber.equal(currentAllocation);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct RebalancingSetTokenV2/TradingPool data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, rbSetData;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), rbSetData = _a[1];
                                    expect(rbSetData.manager).to.equal(setManager.address);
                                    expect(rbSetData.feeRecipient).to.equal(feeRecipient);
                                    expect(rbSetData.currentSet).to.equal(currentSetTokenV2.address);
                                    expect(rbSetData.name).to.equal('Rebalancing Set Token');
                                    expect(rbSetData.symbol).to.equal('RBSET');
                                    expect(rbSetData.unitShares).to.be.bignumber.equal(constants_1.DEFAULT_UNIT_SHARES);
                                    expect(rbSetData.naturalUnit).to.be.bignumber.equal(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                                    expect(rbSetData.rebalanceInterval).to.be.bignumber.equal(constants_1.ONE_DAY_IN_SECONDS);
                                    expect(rbSetData.entryFee).to.be.bignumber.equal(constants_1.ZERO);
                                    expect(rbSetData.rebalanceFee).to.be.bignumber.equal(constants_1.ZERO);
                                    expect(rbSetData.lastRebalanceTimestamp).to.be.bignumber.equal(lastRebalanceTimestamp);
                                    expect(rbSetData.rebalanceState).to.be.bignumber.equal(constants_1.ZERO);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct CollateralSet data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, collateralSetData;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), collateralSetData = _a[2];
                                    expect(JSON.stringify(collateralSetData.components)).to.equal(JSON.stringify(set1Components));
                                    expect(JSON.stringify(collateralSetData.units)).to.equal(JSON.stringify(set1Units));
                                    expect(collateralSetData.naturalUnit).to.be.bignumber.equal(set1NaturalUnit);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('#fetchTradingPoolRebalanceDetails', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, protocolViewerWrapper.fetchTradingPoolRebalanceDetails(subjectTradingPool)];
                        });
                    });
                }
                var subjectTradingPool, newAllocation;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var rebalancingSetQuantityToIssue, liquidatorData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Issue currentSetToken
                                return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetTokenV2.address, util_1.ether(8), { from: deployerAccount })];
                                case 1:
                                    // Issue currentSetToken
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetTokenV2], transferProxy.address)];
                                case 2:
                                    _a.sent();
                                    rebalancingSetQuantityToIssue = util_1.ether(7);
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetTokenV2.address, rebalancingSetQuantityToIssue)];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 4:
                                    _a.sent();
                                    liquidatorData = '0x';
                                    nextSetTokenV2 = set2;
                                    newAllocation = util_1.ether(.4);
                                    return [4 /*yield*/, setManager.rebalance.sendTransactionAsync(rebalancingSetTokenV2.address, nextSetTokenV2.address, newAllocation, liquidatorData)];
                                case 5:
                                    _a.sent();
                                    subjectTradingPool = rebalancingSetTokenV2.address;
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct poolInfo data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, poolInfo;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), poolInfo = _a[0];
                                    expect(poolInfo.trader).to.equal(trader);
                                    expect(poolInfo.allocator).to.equal(allocator);
                                    expect(poolInfo.currentAllocation).to.be.bignumber.equal(newAllocation);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct RebalancingSetTokenV2/TradingPool data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, rbSetData, auctionPriceParams, startingCurrentSets, biddingParams;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), rbSetData = _a[1];
                                    return [4 /*yield*/, rebalancingSetTokenV2.getAuctionPriceParameters.callAsync()];
                                case 2:
                                    auctionPriceParams = _b.sent();
                                    return [4 /*yield*/, rebalancingSetTokenV2.startingCurrentSetAmount.callAsync()];
                                case 3:
                                    startingCurrentSets = _b.sent();
                                    return [4 /*yield*/, rebalancingSetTokenV2.getBiddingParameters.callAsync()];
                                case 4:
                                    biddingParams = _b.sent();
                                    expect(rbSetData.rebalanceStartTime).to.be.bignumber.equal(auctionPriceParams[0]);
                                    expect(rbSetData.timeToPivot).to.be.bignumber.equal(auctionPriceParams[1]);
                                    expect(rbSetData.startPrice).to.be.bignumber.equal(auctionPriceParams[2]);
                                    expect(rbSetData.endPrice).to.be.bignumber.equal(auctionPriceParams[3]);
                                    expect(rbSetData.startingCurrentSets).to.be.bignumber.equal(startingCurrentSets);
                                    expect(rbSetData.remainingCurrentSets).to.be.bignumber.equal(biddingParams[1]);
                                    expect(rbSetData.minimumBid).to.be.bignumber.equal(biddingParams[0]);
                                    expect(rbSetData.rebalanceState).to.be.bignumber.equal(new util_1.BigNumber(2));
                                    expect(rbSetData.nextSet).to.equal(nextSetTokenV2.address);
                                    expect(rbSetData.liquidator).to.equal(liquidator.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct CollateralSet data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, collateralSetData;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), collateralSetData = _a[2];
                                    expect(JSON.stringify(collateralSetData.components)).to.equal(JSON.stringify(set2Components));
                                    expect(JSON.stringify(collateralSetData.units)).to.equal(JSON.stringify(set2Units));
                                    expect(collateralSetData.naturalUnit).to.be.bignumber.equal(set2NaturalUnit);
                                    expect(collateralSetData.name).to.equal('Set Token');
                                    expect(collateralSetData.symbol).to.equal('SET');
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('#batchFetchTradingPoolEntryFees', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, protocolViewerWrapper.batchFetchTradingPoolEntryFees(subjectTradingPools)];
                        });
                    });
                }
                var subjectTradingPools, secondRBSetV2, entryFee;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var failPeriod;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    failPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                    entryFee = util_1.ether(.02);
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenV2Async(web3, core, rebalancingFactory.address, setManager.address, liquidator.address, feeRecipient, fixedFeeCalculator.address, currentSetTokenV2.address, failPeriod, lastRebalanceTimestamp, entryFee)];
                                case 1:
                                    secondRBSetV2 = _a.sent();
                                    subjectTradingPools = [rebalancingSetTokenV2.address, secondRBSetV2.address];
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct poolInfo data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var entryFees, expectedEntryFees;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    entryFees = _a.sent();
                                    expectedEntryFees = [constants_1.ZERO, entryFee];
                                    expect(JSON.stringify(entryFees)).to.equal(JSON.stringify(expectedEntryFees));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('#batchFetchTradingPoolRebalanceFees', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, protocolViewerWrapper.batchFetchTradingPoolEntryFees(subjectTradingPools)];
                        });
                    });
                }
                var subjectTradingPools, secondRBSetV2, rebalanceFee;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var failPeriod, entryFee;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    failPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                    entryFee = util_1.ether(.02);
                                    rebalanceFee = util_1.ether(.02);
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenV2Async(web3, core, rebalancingFactory.address, setManager.address, liquidator.address, feeRecipient, fixedFeeCalculator.address, currentSetTokenV2.address, failPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee)];
                                case 1:
                                    secondRBSetV2 = _a.sent();
                                    subjectTradingPools = [rebalancingSetTokenV2.address, secondRBSetV2.address];
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct poolInfo data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var rebalanceFees, expectedRebalanceFees;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    rebalanceFees = _a.sent();
                                    expectedRebalanceFees = [constants_1.ZERO, rebalanceFee];
                                    expect(JSON.stringify(rebalanceFees)).to.equal(JSON.stringify(expectedRebalanceFees));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('#batchFetchTradingPoolOperator', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, protocolViewerWrapper.batchFetchTradingPoolOperator(subjectTradingPools)];
                        });
                    });
                }
                var subjectTradingPools, secondRBSetV2, secondOperatorAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var failPeriod, entryFee, rebalanceFee, currentAllocation;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    failPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                    entryFee = util_1.ether(.02);
                                    rebalanceFee = util_1.ether(.02);
                                    secondOperatorAddress = feeRecipient;
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenV2Async(web3, core, rebalancingFactory.address, setManager.address, liquidator.address, feeRecipient, fixedFeeCalculator.address, currentSetTokenV2.address, failPeriod, lastRebalanceTimestamp, entryFee, rebalanceFee)];
                                case 1:
                                    secondRBSetV2 = _a.sent();
                                    currentAllocation = util_1.ether(.5);
                                    return [4 /*yield*/, setManager.updateRecord.sendTransactionAsync(secondRBSetV2.address, secondOperatorAddress, allocator, currentAllocation)];
                                case 2:
                                    _a.sent();
                                    subjectTradingPools = [rebalancingSetTokenV2.address, secondRBSetV2.address];
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct operator addresses', function () { return __awaiter(_this, void 0, void 0, function () {
                        var operators, expectedOperators;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    operators = _a.sent();
                                    expectedOperators = [trader, secondOperatorAddress];
                                    expect(JSON.stringify(operators)).to.equal(JSON.stringify(expectedOperators));
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
    describe('Trading Pool V2 Tests', function () { return __awaiter(_this, void 0, void 0, function () {
        var rebalancingSetTokenV3, rebalancingFactory, rebalancingComponentWhiteList, liquidatorWhitelist, liquidator, performanceFeeCalculator, feeCalculatorWhitelist, name, auctionPeriod, rangeStart, rangeEnd, oracleWhiteList, component1, component2, component1Price, component2Price, set1, set2, set1Components, set1Units, set1NaturalUnit, set2Components, set2Units, set2NaturalUnit, component1Oracle, component2Oracle, currentSetTokenV3, nextSetTokenV3, currentAllocation, lastRebalanceTimestamp, setManager, deployerAccount, trader, allocator, feeRecipient;
        var _this = this;
        return __generator(this, function (_a) {
            deployerAccount = constants_1.DEFAULT_ACCOUNT;
            trader = accounts_1.ACCOUNTS[1].address;
            allocator = accounts_1.ACCOUNTS[2].address;
            feeRecipient = accounts_1.ACCOUNTS[3].address;
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var component1Decimal, component2Decimal, set1NaturalUnitExponent, set2NaturalUnitExponent, maxProfitFeePercentage, maxStreamingFeePercentage, failPeriod, timestamp;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [18, 18], web3, constants_1.DEFAULT_ACCOUNT)];
                        case 1:
                            _a = _b.sent(), component1 = _a[0], component2 = _a[1];
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([component1, component2], transferProxy.address)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, component1.decimals.callAsync()];
                        case 3:
                            component1Decimal = _b.sent();
                            return [4 /*yield*/, component2.decimals.callAsync()];
                        case 4:
                            component2Decimal = _b.sent();
                            set1Components = [component1.address, component2.address];
                            set1Units = [new util_1.BigNumber(1), new util_1.BigNumber(1)];
                            set1NaturalUnitExponent = 18 - Math.min(component1Decimal.toNumber(), component2Decimal.toNumber());
                            set1NaturalUnit = new util_1.BigNumber(Math.pow(10, set1NaturalUnitExponent));
                            set2Components = [component1.address, component2.address];
                            set2Units = [new util_1.BigNumber(2), new util_1.BigNumber(3)];
                            set2NaturalUnitExponent = 18 - Math.min(component1Decimal.toNumber(), component2Decimal.toNumber());
                            set2NaturalUnit = new util_1.BigNumber(2 * Math.pow(10, set2NaturalUnitExponent));
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, set1Components, set1Units, set1NaturalUnit)];
                        case 5:
                            set1 = _b.sent();
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, set2Components, set2Units, set2NaturalUnit)];
                        case 6:
                            set2 = _b.sent();
                            component1Price = util_1.ether(1);
                            component2Price = util_1.ether(2);
                            return [4 /*yield*/, helpers_1.deployConstantPriceOracleAsync(web3, component1Price)];
                        case 7:
                            component1Oracle = _b.sent();
                            return [4 /*yield*/, helpers_1.deployConstantPriceOracleAsync(web3, component2Price)];
                        case 8:
                            component2Oracle = _b.sent();
                            return [4 /*yield*/, helpers_1.deployOracleWhiteListAsync(web3, [component1.address, component2.address], [component1Oracle.address, component2Oracle.address])];
                        case 9:
                            oracleWhiteList = _b.sent();
                            auctionPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            rangeStart = new util_1.BigNumber(10); // 10% above fair value
                            rangeEnd = new util_1.BigNumber(10); // 10% below fair value
                            name = 'liquidator';
                            return [4 /*yield*/, helpers_1.deployLinearAuctionLiquidatorContractAsync(web3, core, oracleWhiteList, auctionPeriod, rangeStart, rangeEnd, name)];
                        case 10:
                            liquidator = _b.sent();
                            maxProfitFeePercentage = util_1.ether(.5);
                            maxStreamingFeePercentage = util_1.ether(.1);
                            return [4 /*yield*/, feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(core.address, oracleWhiteList.address, maxProfitFeePercentage, maxStreamingFeePercentage)];
                        case 11:
                            performanceFeeCalculator = _b.sent();
                            return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [component1.address, component2.address])];
                        case 12:
                            rebalancingComponentWhiteList = _b.sent();
                            return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [liquidator.address])];
                        case 13:
                            liquidatorWhitelist = _b.sent();
                            return [4 /*yield*/, helpers_1.deployWhiteListContract(web3, [performanceFeeCalculator.address])];
                        case 14:
                            feeCalculatorWhitelist = _b.sent();
                            return [4 /*yield*/, helpers_1.deployRebalancingSetTokenV3FactoryContractAsync(web3, core, rebalancingComponentWhiteList, liquidatorWhitelist, feeCalculatorWhitelist)];
                        case 15:
                            rebalancingFactory = _b.sent();
                            currentSetTokenV3 = set1;
                            return [4 /*yield*/, helpers_1.deploySocialTradingManagerMockAsync(web3)];
                        case 16:
                            setManager = _b.sent();
                            failPeriod = constants_1.ONE_DAY_IN_SECONDS;
                            return [4 /*yield*/, web3.eth.getBlock('latest')];
                        case 17:
                            timestamp = (_b.sent()).timestamp;
                            lastRebalanceTimestamp = new util_1.BigNumber(timestamp);
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenV3Async(web3, core, rebalancingFactory.address, setManager.address, liquidator.address, feeRecipient, performanceFeeCalculator.address, currentSetTokenV3.address, failPeriod, lastRebalanceTimestamp)];
                        case 18:
                            rebalancingSetTokenV3 = _b.sent();
                            currentAllocation = util_1.ether(.6);
                            return [4 /*yield*/, setManager.updateRecord.sendTransactionAsync(rebalancingSetTokenV3.address, trader, allocator, currentAllocation)];
                        case 19:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('#fetchNewTradingPoolV2Details', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, protocolViewerWrapper.fetchNewTradingPoolV2Details(subjectTradingPool)];
                        });
                    });
                }
                var subjectTradingPool;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTradingPool = rebalancingSetTokenV3.address;
                            return [2 /*return*/];
                        });
                    }); });
                    it('fetches the correct poolInfo data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, poolInfo;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), poolInfo = _a[0];
                                    expect(poolInfo.trader).to.equal(trader);
                                    expect(poolInfo.allocator).to.equal(allocator);
                                    expect(poolInfo.currentAllocation).to.be.bignumber.equal(currentAllocation);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct RebalancingSetTokenV3/TradingPool data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, rbSetData;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), rbSetData = _a[1];
                                    expect(rbSetData.manager).to.equal(setManager.address);
                                    expect(rbSetData.feeRecipient).to.equal(feeRecipient);
                                    expect(rbSetData.currentSet).to.equal(currentSetTokenV3.address);
                                    expect(rbSetData.name).to.equal('Rebalancing Set Token');
                                    expect(rbSetData.symbol).to.equal('RBSET');
                                    expect(rbSetData.unitShares).to.be.bignumber.equal(constants_1.DEFAULT_UNIT_SHARES);
                                    expect(rbSetData.naturalUnit).to.be.bignumber.equal(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                                    expect(rbSetData.rebalanceInterval).to.be.bignumber.equal(constants_1.ONE_DAY_IN_SECONDS);
                                    expect(rbSetData.entryFee).to.be.bignumber.equal(constants_1.ZERO);
                                    expect(rbSetData.rebalanceFee).to.be.bignumber.equal(constants_1.ZERO);
                                    expect(rbSetData.lastRebalanceTimestamp).to.be.bignumber.equal(lastRebalanceTimestamp);
                                    expect(rbSetData.rebalanceState).to.be.bignumber.equal(constants_1.ZERO);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct RebalancingSetTokenV3/Performance Fee data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, performanceFeeState, profitFeePeriod, highWatermarkResetPeriod, profitFeePercentage, streamingFeePercentage, highWatermark, lastProfitFeeTimestamp, lastStreamingFeeTimestamp, expectedFeeStates;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), performanceFeeState = _a[2];
                                    profitFeePeriod = performanceFeeState[0], highWatermarkResetPeriod = performanceFeeState[1], profitFeePercentage = performanceFeeState[2], streamingFeePercentage = performanceFeeState[3], highWatermark = performanceFeeState[4], lastProfitFeeTimestamp = performanceFeeState[5], lastStreamingFeeTimestamp = performanceFeeState[6];
                                    return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(rebalancingSetTokenV3.address)];
                                case 2:
                                    expectedFeeStates = _b.sent();
                                    expect(profitFeePeriod).to.equal(expectedFeeStates.profitFeePeriod);
                                    expect(highWatermarkResetPeriod).to.equal(expectedFeeStates.highWatermarkResetPeriod);
                                    expect(profitFeePercentage).to.equal(expectedFeeStates.profitFeePercentage);
                                    expect(streamingFeePercentage).to.equal(expectedFeeStates.streamingFeePercentage);
                                    expect(highWatermark).to.equal(expectedFeeStates.highWatermark);
                                    expect(lastProfitFeeTimestamp).to.equal(expectedFeeStates.lastProfitFeeTimestamp);
                                    expect(lastStreamingFeeTimestamp).to.equal(expectedFeeStates.lastStreamingFeeTimestamp);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct CollateralSet data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, collateralSetData;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), collateralSetData = _a[3];
                                    expect(JSON.stringify(collateralSetData.components)).to.equal(JSON.stringify(set1Components));
                                    expect(JSON.stringify(collateralSetData.units)).to.equal(JSON.stringify(set1Units));
                                    expect(collateralSetData.naturalUnit).to.be.bignumber.equal(set1NaturalUnit);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct PerformanceFeeCalculator address', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, performanceFeeCalculatorAddress;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), performanceFeeCalculatorAddress = _a[4];
                                    expect(performanceFeeCalculatorAddress).to.equal(performanceFeeCalculator.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('#fetchTradingPoolRebalanceDetails', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, protocolViewerWrapper.fetchTradingPoolRebalanceDetails(subjectTradingPool)];
                        });
                    });
                }
                var subjectTradingPool, newAllocation;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var rebalancingSetQuantityToIssue, liquidatorData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                // Issue currentSetToken
                                return [4 /*yield*/, core.issue.sendTransactionAsync(currentSetTokenV3.address, util_1.ether(8), { from: deployerAccount })];
                                case 1:
                                    // Issue currentSetToken
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.approveForTransferAsync([currentSetTokenV3], transferProxy.address)];
                                case 2:
                                    _a.sent();
                                    rebalancingSetQuantityToIssue = util_1.ether(7);
                                    return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetTokenV3.address, rebalancingSetQuantityToIssue)];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, constants_1.ONE_DAY_IN_SECONDS)];
                                case 4:
                                    _a.sent();
                                    liquidatorData = '0x';
                                    nextSetTokenV3 = set2;
                                    newAllocation = util_1.ether(.4);
                                    return [4 /*yield*/, setManager.rebalance.sendTransactionAsync(rebalancingSetTokenV3.address, nextSetTokenV3.address, newAllocation, liquidatorData)];
                                case 5:
                                    _a.sent();
                                    subjectTradingPool = rebalancingSetTokenV3.address;
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct poolInfo data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, poolInfo;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), poolInfo = _a[0];
                                    expect(poolInfo.trader).to.equal(trader);
                                    expect(poolInfo.allocator).to.equal(allocator);
                                    expect(poolInfo.currentAllocation).to.be.bignumber.equal(newAllocation);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct RebalancingSetTokenV3/TradingPool data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, rbSetData, auctionPriceParams, startingCurrentSets, biddingParams;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), rbSetData = _a[1];
                                    return [4 /*yield*/, rebalancingSetTokenV3.getAuctionPriceParameters.callAsync()];
                                case 2:
                                    auctionPriceParams = _b.sent();
                                    return [4 /*yield*/, rebalancingSetTokenV3.startingCurrentSetAmount.callAsync()];
                                case 3:
                                    startingCurrentSets = _b.sent();
                                    return [4 /*yield*/, rebalancingSetTokenV3.getBiddingParameters.callAsync()];
                                case 4:
                                    biddingParams = _b.sent();
                                    expect(rbSetData.rebalanceStartTime).to.be.bignumber.equal(auctionPriceParams[0]);
                                    expect(rbSetData.timeToPivot).to.be.bignumber.equal(auctionPriceParams[1]);
                                    expect(rbSetData.startPrice).to.be.bignumber.equal(auctionPriceParams[2]);
                                    expect(rbSetData.endPrice).to.be.bignumber.equal(auctionPriceParams[3]);
                                    expect(rbSetData.startingCurrentSets).to.be.bignumber.equal(startingCurrentSets);
                                    expect(rbSetData.remainingCurrentSets).to.be.bignumber.equal(biddingParams[1]);
                                    expect(rbSetData.minimumBid).to.be.bignumber.equal(biddingParams[0]);
                                    expect(rbSetData.rebalanceState).to.be.bignumber.equal(new util_1.BigNumber(2));
                                    expect(rbSetData.nextSet).to.equal(nextSetTokenV3.address);
                                    expect(rbSetData.liquidator).to.equal(liquidator.address);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct CollateralSet data', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, collateralSetData;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a = _b.sent(), collateralSetData = _a[2];
                                    expect(JSON.stringify(collateralSetData.components)).to.equal(JSON.stringify(set2Components));
                                    expect(JSON.stringify(collateralSetData.units)).to.equal(JSON.stringify(set2Units));
                                    expect(collateralSetData.naturalUnit).to.be.bignumber.equal(set2NaturalUnit);
                                    expect(collateralSetData.name).to.equal('Set Token');
                                    expect(collateralSetData.symbol).to.equal('SET');
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('#batchFetchTradingPoolAccumulation', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, subjectIncreaseChainTime)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.mineBlockAsync(web3)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, protocolViewerWrapper.batchFetchTradingPoolAccumulation(subjectTradingPools)];
                            }
                        });
                    });
                }
                var subjectTradingPools, secondRBSetV3, secondEntryFee, secondProfitFee, secondStreamingFee, subjectIncreaseChainTime;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var failPeriod;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    failPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                    secondEntryFee = util_1.ether(.01);
                                    secondProfitFee = util_1.ether(.2);
                                    secondStreamingFee = util_1.ether(.02);
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenV3Async(web3, core, rebalancingFactory.address, setManager.address, liquidator.address, trader, performanceFeeCalculator.address, currentSetTokenV3.address, failPeriod, lastRebalanceTimestamp, secondEntryFee, secondProfitFee, secondStreamingFee)];
                                case 1: return [4 /*yield*/, _a.sent()];
                                case 2:
                                    secondRBSetV3 = _a.sent();
                                    subjectTradingPools = [rebalancingSetTokenV3.address, secondRBSetV3.address];
                                    subjectIncreaseChainTime = constants_1.ONE_YEAR_IN_SECONDS;
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct profit/streaming fee accumulation array', function () { return __awaiter(_this, void 0, void 0, function () {
                        var feeState1, feeState2, _a, actualStreamingFeeArray, actualProfitFeeArray, lastBlock, rebalancingSetValue1, rebalancingSetValue2, expectedStreamingFee1, expectedStreamingFee2, expectedProfitFee1, expectedProfitFee2, expectedStreamingFeeArray, expectedProfitFeeArray;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(rebalancingSetTokenV3.address)];
                                case 1:
                                    feeState1 = _b.sent();
                                    return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(secondRBSetV3.address)];
                                case 2:
                                    feeState2 = _b.sent();
                                    return [4 /*yield*/, subject()];
                                case 3:
                                    _a = _b.sent(), actualStreamingFeeArray = _a[0], actualProfitFeeArray = _a[1];
                                    return [4 /*yield*/, web3.eth.getBlock('latest')];
                                case 4:
                                    lastBlock = _b.sent();
                                    return [4 /*yield*/, valuationHelper.calculateRebalancingSetTokenValueAsync(rebalancingSetTokenV3, oracleWhiteList)];
                                case 5:
                                    rebalancingSetValue1 = _b.sent();
                                    return [4 /*yield*/, valuationHelper.calculateRebalancingSetTokenValueAsync(secondRBSetV3, oracleWhiteList)];
                                case 6:
                                    rebalancingSetValue2 = _b.sent();
                                    return [4 /*yield*/, feeCalculatorHelper.calculateAccruedStreamingFee(feeState1.streamingFeePercentage, new util_1.BigNumber(lastBlock.timestamp).sub(feeState1.lastStreamingFeeTimestamp))];
                                case 7:
                                    expectedStreamingFee1 = _b.sent();
                                    return [4 /*yield*/, feeCalculatorHelper.calculateAccruedStreamingFee(feeState2.streamingFeePercentage, new util_1.BigNumber(lastBlock.timestamp).sub(feeState2.lastStreamingFeeTimestamp))];
                                case 8:
                                    expectedStreamingFee2 = _b.sent();
                                    return [4 /*yield*/, feeCalculatorHelper.calculateAccruedProfitFeeAsync(feeState1, rebalancingSetValue1, new util_1.BigNumber(lastBlock.timestamp))];
                                case 9:
                                    expectedProfitFee1 = _b.sent();
                                    return [4 /*yield*/, feeCalculatorHelper.calculateAccruedProfitFeeAsync(feeState2, rebalancingSetValue2, new util_1.BigNumber(lastBlock.timestamp))];
                                case 10:
                                    expectedProfitFee2 = _b.sent();
                                    expectedStreamingFeeArray = [expectedStreamingFee1, expectedStreamingFee2];
                                    expectedProfitFeeArray = [expectedProfitFee1, expectedProfitFee2];
                                    expect(JSON.stringify(actualStreamingFeeArray)).to.equal(JSON.stringify(expectedStreamingFeeArray));
                                    expect(JSON.stringify(actualProfitFeeArray)).to.equal(JSON.stringify(expectedProfitFeeArray));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('#batchFetchTradingPoolFeeState', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.increaseChainTimeAsync(web3, subjectIncreaseChainTime)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, helpers_1.mineBlockAsync(web3)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, protocolViewerWrapper.batchFetchTradingPoolFeeState(subjectTradingPools)];
                            }
                        });
                    });
                }
                var subjectTradingPools, secondRBSetV3, secondEntryFee, secondProfitFee, secondStreamingFee, subjectIncreaseChainTime;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var failPeriod;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    failPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                    secondEntryFee = util_1.ether(.01);
                                    secondProfitFee = util_1.ether(.2);
                                    secondStreamingFee = util_1.ether(.02);
                                    return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenV3Async(web3, core, rebalancingFactory.address, setManager.address, liquidator.address, trader, performanceFeeCalculator.address, currentSetTokenV3.address, failPeriod, lastRebalanceTimestamp, secondEntryFee, secondProfitFee, secondStreamingFee)];
                                case 1: return [4 /*yield*/, _a.sent()];
                                case 2:
                                    secondRBSetV3 = _a.sent();
                                    subjectTradingPools = [rebalancingSetTokenV3.address, secondRBSetV3.address];
                                    subjectIncreaseChainTime = constants_1.ONE_YEAR_IN_SECONDS;
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    it('fetches the correct performanceFee array', function () { return __awaiter(_this, void 0, void 0, function () {
                        var tradingPoolFeeStates, firstFeeState, secondFeeState, expectedFeeStateInfo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    tradingPoolFeeStates = _a.sent();
                                    return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(rebalancingSetTokenV3.address)];
                                case 2:
                                    firstFeeState = _a.sent();
                                    return [4 /*yield*/, performanceFeeCalculator.feeState.callAsync(secondRBSetV3.address)];
                                case 3:
                                    secondFeeState = _a.sent();
                                    expectedFeeStateInfo = _.map([firstFeeState, secondFeeState], function (feeStates) {
                                        return [
                                            feeStates.profitFeePeriod,
                                            feeStates.highWatermarkResetPeriod,
                                            feeStates.profitFeePercentage,
                                            feeStates.streamingFeePercentage,
                                            feeStates.highWatermark,
                                            feeStates.lastProfitFeeTimestamp,
                                            feeStates.lastStreamingFeeTimestamp,
                                        ];
                                    });
                                    expect(JSON.stringify(tradingPoolFeeStates)).to.equal(JSON.stringify(expectedFeeStateInfo));
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
    describe('#batchFetchExchangeRateStored', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, protocolViewerWrapper.batchFetchExchangeRateStored(subjectCTokenAddresses)];
                });
            });
        }
        var cUSDCAddress, cDAIAddress, subjectCTokenAddresses;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var usdcDecimals, daiDecimals, underlyingInstances, usdcInstance, daiInstance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            usdcDecimals = 6;
                            daiDecimals = 18;
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [usdcDecimals, daiDecimals], web3)];
                        case 1:
                            underlyingInstances = _a.sent();
                            usdcInstance = underlyingInstances[0];
                            daiInstance = underlyingInstances[1];
                            return [4 /*yield*/, compoundHelper.deployMockCUSDC(usdcInstance.address, constants_1.DEFAULT_ACCOUNT)];
                        case 2:
                            cUSDCAddress = _a.sent();
                            return [4 /*yield*/, compoundHelper.enableCToken(cUSDCAddress)];
                        case 3:
                            _a.sent();
                            // Set the Borrow Rate
                            return [4 /*yield*/, compoundHelper.setBorrowRate(cUSDCAddress, new util_1.BigNumber('43084603999'))];
                        case 4:
                            // Set the Borrow Rate
                            _a.sent();
                            return [4 /*yield*/, compoundHelper.deployMockCDAI(daiInstance.address, constants_1.DEFAULT_ACCOUNT)];
                        case 5:
                            cDAIAddress = _a.sent();
                            return [4 /*yield*/, compoundHelper.enableCToken(cDAIAddress)];
                        case 6:
                            _a.sent();
                            // Set the Borrow Rate
                            return [4 /*yield*/, compoundHelper.setBorrowRate(cDAIAddress, new util_1.BigNumber('29313252165'))];
                        case 7:
                            // Set the Borrow Rate
                            _a.sent();
                            subjectCTokenAddresses = [cUSDCAddress, cDAIAddress];
                            return [2 /*return*/];
                    }
                });
            }); });
            it('fetches the correct exchangeRates data', function () { return __awaiter(_this, void 0, void 0, function () {
                var exchangeRates, cUSDCExchangeRate, cDAIExchangeRate, expectedExchangeRates;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            exchangeRates = _a.sent();
                            return [4 /*yield*/, compoundHelper.getExchangeRate(cUSDCAddress)];
                        case 2:
                            cUSDCExchangeRate = _a.sent();
                            return [4 /*yield*/, compoundHelper.getExchangeRate(cDAIAddress)];
                        case 3:
                            cDAIExchangeRate = _a.sent();
                            expectedExchangeRates = [cUSDCExchangeRate, cDAIExchangeRate];
                            expect(JSON.stringify(exchangeRates)).to.equal(JSON.stringify(expectedExchangeRates));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#batchFetchMACOV2CrossoverTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, protocolViewerWrapper.batchFetchMACOV2CrossoverTimestamp(subjectManagerAddresses)];
                });
            });
        }
        var macoManager1, macoManager2, subjectManagerAddresses;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, usdc, wrappedETH, initialStableCollateral, initialRiskCollateral;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [6, 18], web3, constants_1.DEFAULT_ACCOUNT)];
                        case 1:
                            _a = _b.sent(), usdc = _a[0], wrappedETH = _a[1];
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, [usdc.address], [new util_1.BigNumber(250)], new util_1.BigNumber(Math.pow(10, 12)))];
                        case 2:
                            initialStableCollateral = _b.sent();
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, [wrappedETH.address], [new util_1.BigNumber(Math.pow(10, 6))], new util_1.BigNumber(Math.pow(10, 6)))];
                        case 3:
                            initialRiskCollateral = _b.sent();
                            return [4 /*yield*/, helpers_1.deployMovingAverageStrategyManagerV2Async(web3, core.address, constants_1.DEFAULT_ACCOUNT, constants_1.DEFAULT_ACCOUNT, usdc.address, wrappedETH.address, initialStableCollateral.address, initialRiskCollateral.address, setTokenFactory.address, priceCurve.address, new util_1.BigNumber(20), new util_1.BigNumber(3600), new util_1.BigNumber(0), new util_1.BigNumber(3600))];
                        case 4:
                            macoManager1 = _b.sent();
                            return [4 /*yield*/, helpers_1.deployMovingAverageStrategyManagerV2Async(web3, core.address, constants_1.DEFAULT_ACCOUNT, constants_1.DEFAULT_ACCOUNT, usdc.address, wrappedETH.address, initialStableCollateral.address, initialRiskCollateral.address, setTokenFactory.address, priceCurve.address, new util_1.BigNumber(20), new util_1.BigNumber(3600), new util_1.BigNumber(0), new util_1.BigNumber(3600))];
                        case 5:
                            macoManager2 = _b.sent();
                            subjectManagerAddresses = [macoManager1.address, macoManager2.address];
                            return [2 /*return*/];
                    }
                });
            }); });
            it('fetches the lastCrossoverConfirmationTimestamp of the MACO Managers', function () { return __awaiter(_this, void 0, void 0, function () {
                var actualCrossoverArray, expectedCrossoverArray;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            actualCrossoverArray = _a.sent();
                            expectedCrossoverArray = [new util_1.BigNumber(0), new util_1.BigNumber(0)];
                            expect(JSON.stringify(actualCrossoverArray)).to.equal(JSON.stringify(expectedCrossoverArray));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#batchFetchAssetPairCrossoverTimestamp', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, protocolViewerWrapper.batchFetchAssetPairCrossoverTimestamp(subjectManagerAddresses)];
                });
            });
        }
        var assetPairManager1, assetPairManager2, subjectManagerAddresses;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployAssetPairManagerAsync(web3, core.address, constants_1.DEFAULT_ACCOUNT, constants_1.DEFAULT_ACCOUNT, priceCurve.address, new util_1.BigNumber(100), new util_1.BigNumber(100), new util_1.BigNumber(100), new util_1.BigNumber(3600), new util_1.BigNumber(3), new util_1.BigNumber(21), new util_1.BigNumber(0), new util_1.BigNumber(3600))];
                        case 1:
                            assetPairManager1 = _a.sent();
                            return [4 /*yield*/, helpers_1.deployAssetPairManagerAsync(web3, core.address, constants_1.DEFAULT_ACCOUNT, constants_1.DEFAULT_ACCOUNT, priceCurve.address, new util_1.BigNumber(100), new util_1.BigNumber(100), new util_1.BigNumber(100), new util_1.BigNumber(3600), new util_1.BigNumber(3), new util_1.BigNumber(21), new util_1.BigNumber(0), new util_1.BigNumber(3600))];
                        case 2:
                            assetPairManager2 = _a.sent();
                            subjectManagerAddresses = [assetPairManager1.address, assetPairManager2.address];
                            return [2 /*return*/];
                    }
                });
            }); });
            it('fetches the lastCrossoverConfirmationTimestamp of the MACO Managers', function () { return __awaiter(_this, void 0, void 0, function () {
                var actualCrossoverArray, expectedCrossoverArray;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            actualCrossoverArray = _a.sent();
                            expectedCrossoverArray = [new util_1.BigNumber(0), new util_1.BigNumber(0)];
                            expect(JSON.stringify(actualCrossoverArray)).to.equal(JSON.stringify(expectedCrossoverArray));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=ProtocolViewerWrapper.spec.js.map