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
var setProtocolUtils = __importStar(require("set-protocol-utils"));
var web3_1 = __importDefault(require("web3"));
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
var accounts_1 = require("@src/constants/accounts");
var api_1 = require("@src/api");
var constants_1 = require("@src/constants");
var assertions_1 = require("@src/assertions");
var helpers_1 = require("@test/helpers");
var util_1 = require("@src/util");
var chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(util_1.BigNumber));
chaiSetup_1.default.configure();
var Web3Utils = setProtocolUtils.Web3Utils;
var expect = chai.expect;
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new Web3Utils(web3);
var currentSnapshotId;
var functionCaller = accounts_1.ACCOUNTS[2].address;
describe('RebalancingSetIssuanceAPI', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var wethMock;
    var rebalancingSetTokenFactory;
    var rebalancingSetIssuanceModule;
    var config;
    var rebalancingSetIssuanceAPI;
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var assertions;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _b.sent();
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 2:
                    _a = _b.sent(), core = _a[0], transferProxy = _a[1], vault = _a[2], setTokenFactory = _a[3], rebalancingSetTokenFactory = _a[4];
                    return [4 /*yield*/, helpers_1.deployWethMockAsync(web3, constants_1.NULL_ADDRESS, constants_1.ZERO)];
                case 3:
                    wethMock = _b.sent();
                    return [4 /*yield*/, helpers_1.deployRebalancingSetIssuanceModuleAsync(web3, core, vault, transferProxy, wethMock)];
                case 4:
                    rebalancingSetIssuanceModule = _b.sent();
                    return [4 /*yield*/, helpers_1.addModuleAsync(core, rebalancingSetIssuanceModule.address)];
                case 5:
                    _b.sent();
                    config = {
                        coreAddress: core.address,
                        transferProxyAddress: transferProxy.address,
                        vaultAddress: vault.address,
                        setTokenFactoryAddress: setTokenFactory.address,
                        exchangeIssuanceModuleAddress: constants_1.NULL_ADDRESS,
                        kyberNetworkWrapperAddress: constants_1.NULL_ADDRESS,
                        rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
                        rebalanceAuctionModuleAddress: constants_1.NULL_ADDRESS,
                        rebalancingSetExchangeIssuanceModule: constants_1.NULL_ADDRESS,
                        rebalancingSetIssuanceModule: rebalancingSetIssuanceModule.address,
                        wrappedEtherAddress: wethMock.address,
                        protocolViewerAddress: constants_1.NULL_ADDRESS,
                    };
                    assertions = new assertions_1.Assertions(web3);
                    rebalancingSetIssuanceAPI = new api_1.RebalancingSetIssuanceAPI(web3, assertions, config);
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
    describe('#issueRebalancingSet', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, rebalancingSetIssuanceAPI.issueRebalancingSet(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectKeepChangeInVault, {
                            from: subjectCaller,
                            gas: constants_1.DEFAULT_GAS_LIMIT,
                        })];
                });
            });
        }
        var subjectCaller, subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectKeepChangeInVault, baseSetComponent, baseSetComponent2, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, baseSetComponentUnit, baseSetIssueQuantity, customRebalancingUnitShares, customRebalancingSetQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentAddresses, componentUnits;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            subjectCaller = functionCaller;
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [18, 18], web3, subjectCaller)];
                        case 1:
                            _a = _b.sent(), baseSetComponent = _a[0], baseSetComponent2 = _a[1];
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent, baseSetComponent2], transferProxy.address, subjectCaller)];
                        case 2:
                            _b.sent();
                            componentAddresses = [baseSetComponent.address, baseSetComponent2.address];
                            baseSetComponentUnit = util_1.ether(1);
                            componentUnits = [baseSetComponentUnit, baseSetComponentUnit];
                            baseSetNaturalUnit = util_1.ether(1);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 3:
                            baseSetToken = _b.sent();
                            // Create the Rebalancing Set
                            rebalancingUnitShares = customRebalancingUnitShares || util_1.ether(1);
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, functionCaller, baseSetToken.address, constants_1.ONE_DAY_IN_SECONDS, rebalancingUnitShares)];
                        case 4:
                            rebalancingSetToken = _b.sent();
                            subjectRebalancingSetAddress = rebalancingSetToken.address;
                            subjectRebalancingSetQuantity = customRebalancingSetQuantity || new util_1.BigNumber(Math.pow(10, 18));
                            baseSetIssueQuantity =
                                subjectRebalancingSetQuantity.mul(rebalancingUnitShares).div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                            subjectKeepChangeInVault = false;
                            return [2 /*return*/];
                    }
                });
            }); });
            it('issues the rebalancing Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousRBSetTokenBalance, expectedRBSetTokenBalance, currentRBSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousRBSetTokenBalance = _a.sent();
                            expectedRBSetTokenBalance = previousRBSetTokenBalance.add(subjectRebalancingSetQuantity);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            currentRBSetTokenBalance = _a.sent();
                            expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('uses the correct amount of component tokens', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousComponentBalance, expectedComponentUsed, expectedComponentBalance, componentBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousComponentBalance = _a.sent();
                            expectedComponentUsed = baseSetIssueQuantity.mul(baseSetComponentUnit).div(baseSetNaturalUnit);
                            expectedComponentBalance = previousComponentBalance.sub(expectedComponentUsed);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            componentBalance = _a.sent();
                            expect(expectedComponentBalance).to.bignumber.equal(componentBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('uses the correct amount of component 2 tokens', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousComponentBalance, expectedComponentUsed, expectedComponentBalance, componentBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, baseSetComponent2.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousComponentBalance = _a.sent();
                            expectedComponentUsed = baseSetIssueQuantity.mul(baseSetComponentUnit).div(baseSetNaturalUnit);
                            expectedComponentBalance = previousComponentBalance.sub(expectedComponentUsed);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, baseSetComponent2.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            componentBalance = _a.sent();
                            expect(expectedComponentBalance).to.bignumber.equal(componentBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the rebalancing Set quantiy results in base Set change', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customRebalancingSetQuantity = new util_1.BigNumber(1.5).mul(Math.pow(10, 11));
                            customRebalancingUnitShares = new util_1.BigNumber(Math.pow(10, 17));
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customRebalancingSetQuantity = undefined;
                            customRebalancingUnitShares = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    it('returns the correct quantity of base Set change', function () { return __awaiter(_this, void 0, void 0, function () {
                        var baseSetChange, baseSetBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a.sent();
                                    baseSetChange = baseSetIssueQuantity.mod(baseSetNaturalUnit);
                                    return [4 /*yield*/, baseSetToken.balanceOf.callAsync(subjectCaller)];
                                case 2:
                                    baseSetBalance = _a.sent();
                                    expect(baseSetBalance).to.bignumber.equal(baseSetChange);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('when keepChangeInVault is true', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectKeepChangeInVault = true;
                                    return [2 /*return*/];
                                });
                            }); });
                            it('returns the correct quantity of base Set change in the Vault', function () { return __awaiter(_this, void 0, void 0, function () {
                                var baseSetChange, baseSetBalance;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, subject()];
                                        case 1:
                                            _a.sent();
                                            baseSetChange = baseSetIssueQuantity.mod(baseSetNaturalUnit);
                                            return [4 /*yield*/, vault.getOwnerBalance.callAsync(baseSetToken.address, subjectCaller)];
                                        case 2:
                                            baseSetBalance = _a.sent();
                                            expect(baseSetBalance).to.bignumber.equal(baseSetChange);
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
            describe('when the quantity is not positive', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetQuantity = new util_1.BigNumber(0);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + subjectRebalancingSetQuantity.toString() + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantity to issue is not a multiple of the sets natural unit', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetQuantity = subjectRebalancingSetQuantity.add(1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Issuance quantity needs to be multiple of natural unit.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the caller does not have the right amount of allowance to the transfer proxy', function () { return __awaiter(_this, void 0, void 0, function () {
                var componentWithInsufficientAllowance, requiredAllowance;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    componentWithInsufficientAllowance = baseSetComponent;
                                    requiredAllowance = baseSetIssueQuantity.mul(baseSetComponentUnit).div(baseSetNaturalUnit);
                                    return [4 /*yield*/, componentWithInsufficientAllowance.approve.sendTransactionAsync(transferProxy.address, constants_1.ZERO, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has allowance of " + constants_1.ZERO + "\n\n        when required allowance is " + requiredAllowance + " at token\n\n        address: " + componentWithInsufficientAllowance.address + " for spender: " + transferProxy.address + ".\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the user doesnt have enough the components', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var callerBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(subjectCaller)];
                                case 1:
                                    callerBalance = _a.sent();
                                    return [4 /*yield*/, baseSetComponent.transfer.sendTransactionAsync(accounts_1.ACCOUNTS[4].address, callerBalance, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejected];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#issueRebalancingSetWrappingEther', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, rebalancingSetIssuanceAPI.issueRebalancingSetWrappingEther(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectKeepChangeInVault, {
                            from: subjectCaller,
                            gas: constants_1.DEFAULT_GAS_LIMIT,
                            value: sendUndefinedEtherValue ? undefined : subjectWethQuantity.toNumber(),
                        })];
                });
            });
        }
        var subjectCaller, subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectKeepChangeInVault, subjectWethQuantity, baseSetWethComponent, baseSetComponent, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, baseSetComponentUnit, baseSetIssueQuantity, customBaseIssueQuantity, customRebalancingUnitShares, customRebalancingSetQuantity, customWethMock, sendUndefinedEtherValue, onlyWeth;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentAddresses, componentUnits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectCaller = functionCaller;
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(1, [18], web3, subjectCaller)];
                        case 1:
                            baseSetComponent = (_a.sent())[0];
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent], transferProxy.address, subjectCaller)];
                        case 2:
                            _a.sent();
                            baseSetWethComponent = customWethMock || wethMock;
                            baseSetWethComponent.approve.sendTransactionAsync(transferProxy.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT });
                            componentAddresses = onlyWeth ? [baseSetWethComponent.address] : [baseSetWethComponent.address, baseSetComponent.address];
                            baseSetComponentUnit = util_1.ether(1);
                            componentUnits = onlyWeth ? [baseSetComponentUnit] : [baseSetComponentUnit, baseSetComponentUnit];
                            baseSetNaturalUnit = util_1.ether(1);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 3:
                            baseSetToken = _a.sent();
                            // Create the Rebalancing Set
                            rebalancingUnitShares = customRebalancingUnitShares || util_1.ether(1);
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, functionCaller, baseSetToken.address, constants_1.ONE_DAY_IN_SECONDS, rebalancingUnitShares)];
                        case 4:
                            rebalancingSetToken = _a.sent();
                            subjectRebalancingSetAddress = rebalancingSetToken.address;
                            subjectRebalancingSetQuantity = customRebalancingSetQuantity || new util_1.BigNumber(Math.pow(10, 11));
                            baseSetIssueQuantity = customBaseIssueQuantity ||
                                subjectRebalancingSetQuantity.mul(rebalancingUnitShares).div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                            subjectWethQuantity = baseSetIssueQuantity.mul(baseSetComponentUnit).div(baseSetNaturalUnit);
                            subjectKeepChangeInVault = false;
                            sendUndefinedEtherValue = false;
                            return [2 /*return*/];
                    }
                });
            }); });
            it('issues the rebalancing Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousRBSetTokenBalance, expectedRBSetTokenBalance, currentRBSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousRBSetTokenBalance = _a.sent();
                            expectedRBSetTokenBalance = previousRBSetTokenBalance.add(subjectRebalancingSetQuantity);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            currentRBSetTokenBalance = _a.sent();
                            expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('uses the correct amount of component tokens', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousComponentBalance, expectedComponentUsed, expectedComponentBalance, componentBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousComponentBalance = _a.sent();
                            expectedComponentUsed = baseSetIssueQuantity.mul(baseSetComponentUnit).div(baseSetNaturalUnit);
                            expectedComponentBalance = previousComponentBalance.sub(expectedComponentUsed);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            componentBalance = _a.sent();
                            expect(expectedComponentBalance).to.bignumber.equal(componentBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('uses the correct amount of ETH from the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousEthBalance, _a, txHash, totalGasInEth, expectedEthBalance, ethBalance, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = util_1.BigNumber.bind;
                            return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                        case 1:
                            previousEthBalance = new (_a.apply(util_1.BigNumber, [void 0, _c.sent()]))();
                            return [4 /*yield*/, subject()];
                        case 2:
                            txHash = _c.sent();
                            return [4 /*yield*/, util_1.getGasUsageInEth(web3, txHash)];
                        case 3:
                            totalGasInEth = _c.sent();
                            expectedEthBalance = previousEthBalance
                                .sub(subjectWethQuantity)
                                .sub(totalGasInEth);
                            _b = util_1.BigNumber.bind;
                            return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                        case 4:
                            ethBalance = new (_b.apply(util_1.BigNumber, [void 0, _c.sent()]))();
                            expect(ethBalance).to.bignumber.equal(expectedEthBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the rebalancing Set quantiy results in base Set change', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customRebalancingSetQuantity = new util_1.BigNumber(1.5).mul(Math.pow(10, 11));
                            customRebalancingUnitShares = new util_1.BigNumber(Math.pow(10, 17));
                            customBaseIssueQuantity = util_1.ether(2);
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customRebalancingSetQuantity = undefined;
                            customRebalancingUnitShares = undefined;
                            customBaseIssueQuantity = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    it('returns the correct quantity of base Set change', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedBaseSetChange, baseSetBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    _a.sent();
                                    expectedBaseSetChange = new util_1.BigNumber(5).mul(Math.pow(10, 17));
                                    return [4 /*yield*/, baseSetToken.balanceOf.callAsync(subjectCaller)];
                                case 2:
                                    baseSetBalance = _a.sent();
                                    expect(baseSetBalance).to.bignumber.equal(expectedBaseSetChange);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('when keepChangeInVault is true', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectKeepChangeInVault = true;
                                    return [2 /*return*/];
                                });
                            }); });
                            it('returns the correct quantity of base Set change in the Vault', function () { return __awaiter(_this, void 0, void 0, function () {
                                var expectedBaseSetChange, baseSetBalance;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, subject()];
                                        case 1:
                                            _a.sent();
                                            expectedBaseSetChange = new util_1.BigNumber(5).mul(Math.pow(10, 17));
                                            return [4 /*yield*/, vault.getOwnerBalance.callAsync(baseSetToken.address, subjectCaller)];
                                        case 2:
                                            baseSetBalance = _a.sent();
                                            expect(baseSetBalance).to.bignumber.equal(expectedBaseSetChange);
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
            describe('when only 1 wrapped ether is the base component', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            onlyWeth = true;
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            onlyWeth = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    it('issues the rebalancing Set', function () { return __awaiter(_this, void 0, void 0, function () {
                        var previousRBSetTokenBalance, expectedRBSetTokenBalance, currentRBSetTokenBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                                case 1:
                                    previousRBSetTokenBalance = _a.sent();
                                    expectedRBSetTokenBalance = previousRBSetTokenBalance.add(subjectRebalancingSetQuantity);
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                                case 3:
                                    currentRBSetTokenBalance = _a.sent();
                                    expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantity is not positive', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetQuantity = new util_1.BigNumber(0);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + subjectRebalancingSetQuantity.toString() + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantity to issue is not a multiple of the sets natural unit', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetQuantity = subjectRebalancingSetQuantity.add(1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Issuance quantity needs to be multiple of natural unit.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the caller does not have the right amount of allowance to the transfer proxy', function () { return __awaiter(_this, void 0, void 0, function () {
                var componentWithInsufficientAllowance, requiredAllowance;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    componentWithInsufficientAllowance = baseSetComponent;
                                    requiredAllowance = baseSetIssueQuantity.mul(baseSetComponentUnit).div(baseSetNaturalUnit);
                                    return [4 /*yield*/, componentWithInsufficientAllowance.approve.sendTransactionAsync(transferProxy.address, constants_1.ZERO, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has allowance of " + constants_1.ZERO + "\n\n        when required allowance is " + requiredAllowance + " at token\n\n        address: " + componentWithInsufficientAllowance.address + " for spender: " + transferProxy.address + ".\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the user doesnt have enough the components', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var callerBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(subjectCaller)];
                                case 1:
                                    callerBalance = _a.sent();
                                    return [4 /*yield*/, baseSetComponent.transfer.sendTransactionAsync(accounts_1.ACCOUNTS[4].address, callerBalance, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejected];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the ether inputted is undefined', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            sendUndefinedEtherValue = true;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Payment Token quantity value should not be undefined (txOpts.value if Wrapped Ether)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the base SetToken components do not contain wrapped ether', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.deployWethMockAsync(web3, functionCaller, util_1.ether(100))];
                                case 1:
                                    customWethMock = _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customWethMock = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Token address at " + wethMock.address + " " +
                                    ("is not a component of the Set Token at " + baseSetToken.address + "."))];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when there is insufficient wrapped ether', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectWethQuantity = new util_1.BigNumber(1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
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
    describe('#redeemRebalancingSet', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, rebalancingSetIssuanceAPI.redeemRebalancingSet(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectKeepChangeInVault, {
                            from: subjectCaller,
                            gas: constants_1.DEFAULT_GAS_LIMIT,
                        })];
                });
            });
        }
        var subjectCaller, subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectKeepChangeInVault, baseSetIssueQuantity, baseSetComponentUnit, baseSetComponent, baseSetComponent2, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, customBaseIssueQuantity, customRebalancingUnitShares, customRedeemQuantity, customRebalancingSetIssueQuantity, customBaseComponentUnit;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentAddresses, componentUnits, rebalancingSetIssueQuantity;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            subjectCaller = functionCaller;
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [18, 18], web3, accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            _a = _b.sent(), baseSetComponent = _a[0], baseSetComponent2 = _a[1];
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent, baseSetComponent2], transferProxy.address, accounts_1.DEFAULT_ACCOUNT)];
                        case 2:
                            _b.sent();
                            componentAddresses = [baseSetComponent.address, baseSetComponent2.address];
                            baseSetComponentUnit = customBaseComponentUnit || util_1.ether(1);
                            componentUnits = [baseSetComponentUnit, baseSetComponentUnit];
                            baseSetNaturalUnit = util_1.ether(1);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 3:
                            baseSetToken = _b.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetToken], transferProxy.address, accounts_1.DEFAULT_ACCOUNT)];
                        case 4:
                            _b.sent();
                            // Create the Rebalancing Set
                            rebalancingUnitShares = customRebalancingUnitShares || util_1.ether(1);
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, functionCaller, baseSetToken.address, constants_1.ONE_DAY_IN_SECONDS, rebalancingUnitShares)];
                        case 5:
                            rebalancingSetToken = _b.sent();
                            subjectRebalancingSetAddress = rebalancingSetToken.address;
                            subjectRebalancingSetQuantity = customRedeemQuantity || new util_1.BigNumber(Math.pow(10, 11));
                            baseSetIssueQuantity = customBaseIssueQuantity ||
                                subjectRebalancingSetQuantity.mul(rebalancingUnitShares).div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                            return [4 /*yield*/, core.issue.sendTransactionAsync(baseSetToken.address, baseSetIssueQuantity, { from: accounts_1.DEFAULT_ACCOUNT, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 6:
                            _b.sent();
                            rebalancingSetIssueQuantity = customRebalancingSetIssueQuantity || subjectRebalancingSetQuantity;
                            // Issue the rebalancing Set Token
                            return [4 /*yield*/, core.issueTo.sendTransactionAsync(functionCaller, rebalancingSetToken.address, rebalancingSetIssueQuantity, { from: accounts_1.DEFAULT_ACCOUNT, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 7:
                            // Issue the rebalancing Set Token
                            _b.sent();
                            subjectKeepChangeInVault = false;
                            return [2 /*return*/];
                    }
                });
            }); });
            afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    customRedeemQuantity = undefined;
                    customRebalancingUnitShares = undefined;
                    customBaseIssueQuantity = undefined;
                    customRebalancingSetIssueQuantity = undefined;
                    customBaseComponentUnit = undefined;
                    return [2 /*return*/];
                });
            }); });
            it('redeems the rebalancing Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousRBSetTokenBalance, expectedRBSetTokenBalance, currentRBSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousRBSetTokenBalance = _a.sent();
                            expectedRBSetTokenBalance = previousRBSetTokenBalance.sub(subjectRebalancingSetQuantity);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            currentRBSetTokenBalance = _a.sent();
                            expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('redeems the base Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var currentSaseSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, baseSetToken.balanceOf.callAsync(subjectCaller)];
                        case 2:
                            currentSaseSetTokenBalance = _a.sent();
                            expect(currentSaseSetTokenBalance).to.bignumber.equal(constants_1.ZERO);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('attributes the base Set components to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var expectedBaseComponentBalance, baseSetComponentBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            expectedBaseComponentBalance = baseSetIssueQuantity.mul(baseSetComponentUnit).div(baseSetNaturalUnit);
                            return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(subjectCaller)];
                        case 2:
                            baseSetComponentBalance = _a.sent();
                            expect(baseSetComponentBalance).to.bignumber.equal(expectedBaseComponentBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('attributes the base Set components 2 to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var expectedBaseComponentBalance, baseSetComponentBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            expectedBaseComponentBalance = baseSetIssueQuantity.mul(baseSetComponentUnit).div(baseSetNaturalUnit);
                            return [4 /*yield*/, baseSetComponent2.balanceOf.callAsync(subjectCaller)];
                        case 2:
                            baseSetComponentBalance = _a.sent();
                            expect(baseSetComponentBalance).to.bignumber.equal(expectedBaseComponentBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the redeem quantity results in excess base Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    describe('when keep change in vault is false', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    customRebalancingUnitShares = new util_1.BigNumber(Math.pow(10, 17));
                                    customRedeemQuantity = new util_1.BigNumber(1.5).mul(Math.pow(10, 11));
                                    customBaseIssueQuantity = util_1.ether(2);
                                    customRebalancingSetIssueQuantity = new util_1.BigNumber(2).mul(Math.pow(10, 11));
                                    return [2 /*return*/];
                                });
                            }); });
                            afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    customRebalancingUnitShares = undefined;
                                    customRedeemQuantity = undefined;
                                    customBaseIssueQuantity = undefined;
                                    customRebalancingSetIssueQuantity = undefined;
                                    return [2 /*return*/];
                                });
                            }); });
                            // It sends the change to the user
                            it('sends the correct base set quantity to the user', function () { return __awaiter(_this, void 0, void 0, function () {
                                var expectedBalance, currentBaseSetBalance;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, subject()];
                                        case 1:
                                            _a.sent();
                                            expectedBalance = customRedeemQuantity
                                                .mul(rebalancingUnitShares)
                                                .div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                                .mod(baseSetNaturalUnit);
                                            return [4 /*yield*/, baseSetToken.balanceOf.callAsync(subjectCaller)];
                                        case 2:
                                            currentBaseSetBalance = _a.sent();
                                            expect(currentBaseSetBalance).to.bignumber.equal(expectedBalance);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('when keep change in vault is true', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    customRebalancingUnitShares = new util_1.BigNumber(Math.pow(10, 17));
                                    customRedeemQuantity = new util_1.BigNumber(1.5).mul(Math.pow(10, 11));
                                    customBaseIssueQuantity = util_1.ether(2);
                                    customRebalancingSetIssueQuantity = new util_1.BigNumber(2).mul(Math.pow(10, 11));
                                    return [2 /*return*/];
                                });
                            }); });
                            afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    customRebalancingUnitShares = undefined;
                                    customRedeemQuantity = undefined;
                                    customBaseIssueQuantity = undefined;
                                    customRebalancingSetIssueQuantity = undefined;
                                    return [2 /*return*/];
                                });
                            }); });
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectKeepChangeInVault = true;
                                    return [2 /*return*/];
                                });
                            }); });
                            it('sends the correct base set quantity to the user in the vault', function () { return __awaiter(_this, void 0, void 0, function () {
                                var expectedBalance, currentBaseSetBalance;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, subject()];
                                        case 1:
                                            _a.sent();
                                            expectedBalance = customRedeemQuantity
                                                .mul(rebalancingUnitShares)
                                                .div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                                .mod(baseSetNaturalUnit);
                                            return [4 /*yield*/, vault.getOwnerBalance.callAsync(baseSetToken.address, subjectCaller)];
                                        case 2:
                                            currentBaseSetBalance = _a.sent();
                                            expect(currentBaseSetBalance).to.bignumber.equal(expectedBalance);
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
            describe('when the quantity is not positive', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetQuantity = new util_1.BigNumber(0);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + subjectRebalancingSetQuantity.toString() + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantity to issue is not a multiple of the sets natural unit', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetQuantity = subjectRebalancingSetQuantity.add(1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Issuance quantity needs to be multiple of natural unit.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the user does not have enough rebalancing Set quantity', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customRebalancingSetIssueQuantity = constants_1.DEFAULT_REBALANCING_NATURAL_UNIT;
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customRebalancingSetIssueQuantity = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has balance of " + customRebalancingSetIssueQuantity + "\n\n        when required balance is " + subjectRebalancingSetQuantity + " at token address " + subjectRebalancingSetAddress + ".\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#redeemRebalancingSetUnwrappingEther', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, rebalancingSetIssuanceAPI.redeemRebalancingSetUnwrappingEther(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectKeepChangeInVault, {
                            from: subjectCaller,
                            gas: constants_1.DEFAULT_GAS_LIMIT,
                        })];
                });
            });
        }
        var subjectCaller, subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectKeepChangeInVault, baseSetIssueQuantity, baseSetComponentUnit, baseSetWethComponent, baseSetComponent, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, customBaseIssueQuantity, customRebalancingUnitShares, customRedeemQuantity, customRebalancingSetIssueQuantity, customWethMock, wethRequiredToMintSet, baseComponentQuantity, onlyWeth;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentAddresses, componentUnits, rebalancingSetIssueQuantity;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectCaller = functionCaller;
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(1, [18], web3, accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            baseSetComponent = (_a.sent())[0];
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent], transferProxy.address, accounts_1.DEFAULT_ACCOUNT)];
                        case 2:
                            _a.sent();
                            baseSetWethComponent = customWethMock || wethMock;
                            baseSetWethComponent.approve.sendTransactionAsync(transferProxy.address, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: accounts_1.DEFAULT_ACCOUNT, gas: constants_1.DEFAULT_GAS_LIMIT });
                            componentAddresses = onlyWeth ?
                                [baseSetWethComponent.address] : [baseSetWethComponent.address, baseSetComponent.address];
                            baseSetComponentUnit = util_1.ether(1);
                            componentUnits = onlyWeth ? [baseSetComponentUnit] : [baseSetComponentUnit, baseSetComponentUnit];
                            baseSetNaturalUnit = util_1.ether(1);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 3:
                            baseSetToken = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetToken], transferProxy.address, accounts_1.DEFAULT_ACCOUNT)];
                        case 4:
                            _a.sent();
                            // Create the Rebalancing Set
                            rebalancingUnitShares = customRebalancingUnitShares || util_1.ether(1);
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, accounts_1.DEFAULT_ACCOUNT, baseSetToken.address, constants_1.ONE_DAY_IN_SECONDS, rebalancingUnitShares)];
                        case 5:
                            rebalancingSetToken = _a.sent();
                            subjectRebalancingSetAddress = rebalancingSetToken.address;
                            subjectRebalancingSetQuantity = customRedeemQuantity || new util_1.BigNumber(Math.pow(10, 11));
                            baseSetIssueQuantity = customBaseIssueQuantity ||
                                subjectRebalancingSetQuantity.mul(rebalancingUnitShares).div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                            baseComponentQuantity = baseSetIssueQuantity.mul(baseSetComponentUnit).div(baseSetNaturalUnit);
                            // Wrap WETH
                            wethRequiredToMintSet = baseSetIssueQuantity.mul(baseSetComponentUnit).div(baseSetNaturalUnit);
                            return [4 /*yield*/, baseSetWethComponent.deposit.sendTransactionAsync({ from: accounts_1.DEFAULT_ACCOUNT, gas: constants_1.DEFAULT_GAS_LIMIT, value: wethRequiredToMintSet.toString() })];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(baseSetToken.address, baseSetIssueQuantity, { from: accounts_1.DEFAULT_ACCOUNT, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 7:
                            _a.sent();
                            rebalancingSetIssueQuantity = customRebalancingSetIssueQuantity || subjectRebalancingSetQuantity;
                            // Issue the rebalancing Set Token
                            return [4 /*yield*/, core.issueTo.sendTransactionAsync(functionCaller, rebalancingSetToken.address, rebalancingSetIssueQuantity, { from: accounts_1.DEFAULT_ACCOUNT, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 8:
                            // Issue the rebalancing Set Token
                            _a.sent();
                            subjectKeepChangeInVault = false;
                            return [2 /*return*/];
                    }
                });
            }); });
            afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    customRebalancingUnitShares = undefined;
                    customBaseIssueQuantity = undefined;
                    customRedeemQuantity = undefined;
                    customRebalancingSetIssueQuantity = undefined;
                    return [2 /*return*/];
                });
            }); });
            it('redeems the rebalancing Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousRBSetTokenBalance, expectedRBSetTokenBalance, currentRBSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousRBSetTokenBalance = _a.sent();
                            expectedRBSetTokenBalance = previousRBSetTokenBalance.sub(subjectRebalancingSetQuantity);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            currentRBSetTokenBalance = _a.sent();
                            expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('redeems the base Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var currentSaseSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, baseSetToken.balanceOf.callAsync(subjectCaller)];
                        case 2:
                            currentSaseSetTokenBalance = _a.sent();
                            expect(currentSaseSetTokenBalance).to.bignumber.equal(constants_1.ZERO);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('attributes the correct amount of ETH to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousEthBalance, _a, txHash, totalGasInEth, expectedEthBalance, ethBalance, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = util_1.BigNumber.bind;
                            return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                        case 1:
                            previousEthBalance = new (_a.apply(util_1.BigNumber, [void 0, _c.sent()]))();
                            return [4 /*yield*/, subject()];
                        case 2:
                            txHash = _c.sent();
                            return [4 /*yield*/, util_1.getGasUsageInEth(web3, txHash)];
                        case 3:
                            totalGasInEth = _c.sent();
                            expectedEthBalance = previousEthBalance
                                .add(wethRequiredToMintSet)
                                .sub(totalGasInEth);
                            _b = util_1.BigNumber.bind;
                            return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                        case 4:
                            ethBalance = new (_b.apply(util_1.BigNumber, [void 0, _c.sent()]))();
                            expect(ethBalance).to.bignumber.equal(expectedEthBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('attributes the base Set component to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var baseSetComponentBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(subjectCaller)];
                        case 2:
                            baseSetComponentBalance = _a.sent();
                            expect(baseSetComponentBalance).to.bignumber.equal(baseComponentQuantity);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when only 1 wrapped ether is the base component', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            onlyWeth = true;
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            onlyWeth = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    it('redeems the rebalancing Set', function () { return __awaiter(_this, void 0, void 0, function () {
                        var previousRBSetTokenBalance, expectedRBSetTokenBalance, currentRBSetTokenBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                                case 1:
                                    previousRBSetTokenBalance = _a.sent();
                                    expectedRBSetTokenBalance = previousRBSetTokenBalance.sub(subjectRebalancingSetQuantity);
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                                case 3:
                                    currentRBSetTokenBalance = _a.sent();
                                    expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the redeem quantity results in excess base Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    describe('when keep change in vault is false', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    customRebalancingUnitShares = new util_1.BigNumber(Math.pow(10, 17));
                                    customRedeemQuantity = new util_1.BigNumber(1.5).mul(Math.pow(10, 11));
                                    customBaseIssueQuantity = util_1.ether(2);
                                    customRebalancingSetIssueQuantity = new util_1.BigNumber(2).mul(Math.pow(10, 11));
                                    return [2 /*return*/];
                                });
                            }); });
                            afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    customRebalancingUnitShares = undefined;
                                    customRedeemQuantity = undefined;
                                    customBaseIssueQuantity = undefined;
                                    customRebalancingSetIssueQuantity = undefined;
                                    return [2 /*return*/];
                                });
                            }); });
                            // It sends the change to the user
                            it('sends the correct base set quantity to the user', function () { return __awaiter(_this, void 0, void 0, function () {
                                var expectedBalance, currentBaseSetBalance;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, subject()];
                                        case 1:
                                            _a.sent();
                                            expectedBalance = customRedeemQuantity
                                                .mul(rebalancingUnitShares)
                                                .div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                                .mod(baseSetNaturalUnit);
                                            return [4 /*yield*/, baseSetToken.balanceOf.callAsync(subjectCaller)];
                                        case 2:
                                            currentBaseSetBalance = _a.sent();
                                            expect(currentBaseSetBalance).to.bignumber.equal(expectedBalance);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    describe('when keep change in vault is true', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    customRebalancingUnitShares = new util_1.BigNumber(Math.pow(10, 17));
                                    customRedeemQuantity = new util_1.BigNumber(1.5).mul(Math.pow(10, 11));
                                    customBaseIssueQuantity = util_1.ether(2);
                                    customRebalancingSetIssueQuantity = new util_1.BigNumber(2).mul(Math.pow(10, 11));
                                    return [2 /*return*/];
                                });
                            }); });
                            afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    customRebalancingUnitShares = undefined;
                                    customRedeemQuantity = undefined;
                                    customBaseIssueQuantity = undefined;
                                    customRebalancingSetIssueQuantity = undefined;
                                    return [2 /*return*/];
                                });
                            }); });
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    subjectKeepChangeInVault = true;
                                    return [2 /*return*/];
                                });
                            }); });
                            it('sends the correct base set quantity to the user in the vault', function () { return __awaiter(_this, void 0, void 0, function () {
                                var expectedBalance, currentBaseSetBalance;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, subject()];
                                        case 1:
                                            _a.sent();
                                            expectedBalance = customRedeemQuantity
                                                .mul(rebalancingUnitShares)
                                                .div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                                .mod(baseSetNaturalUnit);
                                            return [4 /*yield*/, vault.getOwnerBalance.callAsync(baseSetToken.address, subjectCaller)];
                                        case 2:
                                            currentBaseSetBalance = _a.sent();
                                            expect(currentBaseSetBalance).to.bignumber.equal(expectedBalance);
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
            describe('when the quantity is not positive', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetQuantity = new util_1.BigNumber(0);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + subjectRebalancingSetQuantity.toString() + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantity to issue is not a multiple of the sets natural unit', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetQuantity = subjectRebalancingSetQuantity.add(1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Issuance quantity needs to be multiple of natural unit.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the user does not have enough rebalancing Set quantity', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customRebalancingSetIssueQuantity = constants_1.DEFAULT_REBALANCING_NATURAL_UNIT;
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customRebalancingSetIssueQuantity = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has balance of " + customRebalancingSetIssueQuantity + "\n\n        when required balance is " + subjectRebalancingSetQuantity + " at token address " + subjectRebalancingSetAddress + ".\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the base components do not contain wrapped ether', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.deployWethMockAsync(web3, functionCaller, util_1.ether(100))];
                                case 1:
                                    customWethMock = _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customWethMock = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Token address at " + wethMock.address + " " +
                                    ("is not a component of the Set Token at " + baseSetToken.address + "."))];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=RebalancingSetIssuanceAPI.spec.js.map