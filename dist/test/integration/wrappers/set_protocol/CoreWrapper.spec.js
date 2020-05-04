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
var set_protocol_contracts_2 = require("set-protocol-contracts");
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
var SetUtils = setProtocolUtils.SetProtocolUtils, Web3Utils = setProtocolUtils.Web3Utils;
var web3Utils = new Web3Utils(web3);
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('CoreWrapper', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var rebalancingSetTokenFactory;
    var rebalanceAuctionModule;
    var coreWrapper;
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
                    _a = _b.sent(), core = _a[0], transferProxy = _a[1], vault = _a[2], setTokenFactory = _a[3], rebalancingSetTokenFactory = _a[4], rebalanceAuctionModule = _a[5];
                    coreWrapper = new wrappers_1.CoreWrapper(web3, core.address, transferProxy.address, vault.address);
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
    describe('create', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.create(subjectFactoryAddress, subjectComponents, subjectUnits, subjectNaturalUnit, subjectName, subjectSymbol, subjectCallData, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var componentTokens, subjectFactoryAddress, subjectComponents, subjectUnits, subjectNaturalUnit, subjectName, subjectSymbol, subjectCallData, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            subjectComponents = componentTokens.map(function (component) { return component.address; });
                            subjectUnits = subjectComponents.map(function (component) { return util_1.ether(4); });
                            subjectNaturalUnit = util_1.ether(2);
                            subjectName = 'My Set';
                            subjectSymbol = 'SET';
                            subjectCallData = '0x0';
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the factory address is for vanilla SetToken', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectFactoryAddress = setTokenFactory.address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('creates a new SetToken contract', function () { return __awaiter(_this, void 0, void 0, function () {
                        var createSetTransactionHash, formattedLogs, deployedSetTokenAddress, setTokenContract, componentAddresses, componentUnits, naturalUnit, name, symbol;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    createSetTransactionHash = _a.sent();
                                    return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(web3, createSetTransactionHash)];
                                case 2:
                                    formattedLogs = _a.sent();
                                    deployedSetTokenAddress = util_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                                    return [4 /*yield*/, set_protocol_contracts_2.SetTokenContract.at(deployedSetTokenAddress, web3, constants_1.TX_DEFAULTS)];
                                case 3:
                                    setTokenContract = _a.sent();
                                    return [4 /*yield*/, setTokenContract.getComponents.callAsync()];
                                case 4:
                                    componentAddresses = _a.sent();
                                    expect(componentAddresses).to.eql(subjectComponents);
                                    return [4 /*yield*/, setTokenContract.getUnits.callAsync()];
                                case 5:
                                    componentUnits = _a.sent();
                                    expect(JSON.stringify(componentUnits)).to.eql(JSON.stringify(subjectUnits));
                                    return [4 /*yield*/, setTokenContract.naturalUnit.callAsync()];
                                case 6:
                                    naturalUnit = _a.sent();
                                    expect(naturalUnit).to.bignumber.equal(subjectNaturalUnit);
                                    return [4 /*yield*/, setTokenContract.name.callAsync()];
                                case 7:
                                    name = _a.sent();
                                    expect(name).to.eql(subjectName);
                                    return [4 /*yield*/, setTokenContract.symbol.callAsync()];
                                case 8:
                                    symbol = _a.sent();
                                    expect(symbol).to.eql(subjectSymbol);
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
    describe('issue', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.issue(subjectSetToIssue, subjectQuantitytoIssue, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var setToken, subjectSetToIssue, subjectQuantitytoIssue, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentTokens, setComponentUnit, naturalUnit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            setComponentUnit = util_1.ether(4);
                            naturalUnit = util_1.ether(2);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokens.map(function (token) { return token.address; }), componentTokens.map(function (token) { return setComponentUnit; }), naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync(componentTokens, transferProxy.address)];
                        case 3:
                            _a.sent();
                            subjectSetToIssue = setToken.address;
                            subjectQuantitytoIssue = util_1.ether(2);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('updates the set balance of the user by the issue quantity', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingSetUserBalance, expectedSetUserBalance, newSetUserBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setToken.balanceOf.callAsync(accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            existingSetUserBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedSetUserBalance = existingSetUserBalance.add(subjectQuantitytoIssue);
                            return [4 /*yield*/, setToken.balanceOf.callAsync(accounts_1.DEFAULT_ACCOUNT)];
                        case 3:
                            newSetUserBalance = _a.sent();
                            expect(newSetUserBalance).to.eql(expectedSetUserBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('redeem', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.redeem(subjectSetToRedeem, subjectQuantityToRedeem, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var setToken, subjectSetToRedeem, subjectQuantityToRedeem, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentTokens, setComponentUnit, naturalUnit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            setComponentUnit = util_1.ether(4);
                            naturalUnit = util_1.ether(2);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokens.map(function (token) { return token.address; }), componentTokens.map(function (token) { return setComponentUnit; }), naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync(componentTokens, transferProxy.address)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, util_1.ether(2), constants_1.TX_DEFAULTS)];
                        case 4:
                            _a.sent();
                            subjectSetToRedeem = setToken.address;
                            subjectQuantityToRedeem = util_1.ether(2);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('updates the set balance of the user by the redeem quantity', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingSetUserBalance, expectedSetUserBalance, newSetUserBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setToken.balanceOf.callAsync(accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            existingSetUserBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedSetUserBalance = existingSetUserBalance.sub(subjectQuantityToRedeem);
                            return [4 /*yield*/, setToken.balanceOf.callAsync(accounts_1.DEFAULT_ACCOUNT)];
                        case 3:
                            newSetUserBalance = _a.sent();
                            expect(newSetUserBalance).to.eql(expectedSetUserBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('redeemAndWithdraw', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.redeemAndWithdrawTo(subjectSetToRedeem, subjectQuantityToRedeem, subjectTokensToExcludeBitmask, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var setToken, subjectSetToRedeem, subjectQuantityToRedeem, subjectTokensToExcludeBitmask, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentTokens, setComponentUnit, naturalUnit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            setComponentUnit = util_1.ether(4);
                            naturalUnit = util_1.ether(2);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokens.map(function (token) { return token.address; }), componentTokens.map(function (token) { return setComponentUnit; }), naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync(componentTokens, transferProxy.address)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, util_1.ether(2), constants_1.TX_DEFAULTS)];
                        case 4:
                            _a.sent();
                            subjectSetToRedeem = setToken.address;
                            subjectQuantityToRedeem = util_1.ether(2);
                            subjectTokensToExcludeBitmask = constants_1.ZERO;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('updates the set balance of the user by the redeem quantity', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingSetUserBalance, expectedSetUserBalance, newSetUserBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setToken.balanceOf.callAsync(accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            existingSetUserBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedSetUserBalance = existingSetUserBalance.sub(subjectQuantityToRedeem);
                            return [4 /*yield*/, setToken.balanceOf.callAsync(accounts_1.DEFAULT_ACCOUNT)];
                        case 3:
                            newSetUserBalance = _a.sent();
                            expect(newSetUserBalance).to.eql(expectedSetUserBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('deposit', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.deposit(subjectTokenAddressToDeposit, subjectQuantityToDeposit, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var token, depositQuantity, subjectTokenAddressToDeposit, subjectQuantityToDeposit, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            token = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([token], transferProxy.address)];
                        case 2:
                            _a.sent();
                            subjectTokenAddressToDeposit = token.address;
                            depositQuantity = new util_1.BigNumber(100);
                            subjectQuantityToDeposit = depositQuantity;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('correctly updates the vault balance', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingOwnerVaultBalance, expectedVaultOwnerBalance, newVaultOwnerBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, vault.getOwnerBalance.callAsync(subjectTokenAddressToDeposit, accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            existingOwnerVaultBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedVaultOwnerBalance = existingOwnerVaultBalance.add(depositQuantity);
                            return [4 /*yield*/, vault.getOwnerBalance.callAsync(subjectTokenAddressToDeposit, accounts_1.DEFAULT_ACCOUNT)];
                        case 3:
                            newVaultOwnerBalance = _a.sent();
                            expect(newVaultOwnerBalance).to.eql(expectedVaultOwnerBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('batchDeposit', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.batchDeposit(subjectTokenAddressesToDeposit, subjectQuantitesToWithdraw, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var tokens, depositQuantity, subjectTokenAddressesToDeposit, subjectQuantitesToWithdraw, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            tokens = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync(tokens, transferProxy.address)];
                        case 2:
                            _a.sent();
                            subjectTokenAddressesToDeposit = tokens.map(function (token) { return token.address; });
                            depositQuantity = new util_1.BigNumber(100);
                            subjectQuantitesToWithdraw = tokens.map(function () { return depositQuantity; });
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('correctly updates the vault balances', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingVaultOwnerBalances, expectedVaultOwnerBalances, newOwnerVaultBalances;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.getVaultBalances(vault, subjectTokenAddressesToDeposit, subjectCaller)];
                        case 1:
                            existingVaultOwnerBalances = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedVaultOwnerBalances = _.map(existingVaultOwnerBalances, function (balance) { return balance.add(depositQuantity); });
                            return [4 /*yield*/, helpers_1.getVaultBalances(vault, subjectTokenAddressesToDeposit, subjectCaller)];
                        case 3:
                            newOwnerVaultBalances = _a.sent();
                            expect(newOwnerVaultBalances).to.eql(expectedVaultOwnerBalances);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('withdraw', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.withdraw(subjectTokenAddressToWithdraw, subjectQuantityToWithdraw, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var token, withdrawQuantity, subjectTokenAddressToWithdraw, subjectQuantityToWithdraw, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            token = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([token], transferProxy.address)];
                        case 2:
                            _a.sent();
                            subjectTokenAddressToWithdraw = token.address;
                            withdrawQuantity = new util_1.BigNumber(100);
                            return [4 /*yield*/, coreWrapper.deposit(token.address, withdrawQuantity, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 3:
                            _a.sent();
                            subjectQuantityToWithdraw = withdrawQuantity;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('correctly updates the vault balance', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingOwnerVaultBalance, expectedVaultOwnerBalance, newVaultOwnerBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, vault.getOwnerBalance.callAsync(subjectTokenAddressToWithdraw, accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            existingOwnerVaultBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedVaultOwnerBalance = existingOwnerVaultBalance.sub(withdrawQuantity);
                            return [4 /*yield*/, vault.getOwnerBalance.callAsync(subjectTokenAddressToWithdraw, accounts_1.DEFAULT_ACCOUNT)];
                        case 3:
                            newVaultOwnerBalance = _a.sent();
                            expect(newVaultOwnerBalance).to.eql(expectedVaultOwnerBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('batchWithdraw', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.batchWithdraw(subjectTokenAddressesToWithdraw, subjectQuantitesToWithdraw, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var tokens, withdrawQuantity, subjectTokenAddressesToWithdraw, subjectQuantitesToWithdraw, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var tokenAddresses, quantitesToDeposit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            tokens = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync(tokens, transferProxy.address)];
                        case 2:
                            _a.sent();
                            tokenAddresses = tokens.map(function (token) { return token.address; });
                            withdrawQuantity = new util_1.BigNumber(100);
                            quantitesToDeposit = tokenAddresses.map(function () { return withdrawQuantity; });
                            return [4 /*yield*/, coreWrapper.batchDeposit(tokenAddresses, quantitesToDeposit, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 3:
                            _a.sent();
                            subjectTokenAddressesToWithdraw = tokenAddresses;
                            subjectQuantitesToWithdraw = quantitesToDeposit;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('correctly updates the vault balances', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingVaultOwnerBalances, expectedVaultOwnerBalances, newOwnerVaultBalances;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.getVaultBalances(vault, subjectTokenAddressesToWithdraw, subjectCaller)];
                        case 1:
                            existingVaultOwnerBalances = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedVaultOwnerBalances = _.map(existingVaultOwnerBalances, function (balance) { return balance.sub(withdrawQuantity); });
                            return [4 /*yield*/, helpers_1.getVaultBalances(vault, subjectTokenAddressesToWithdraw, subjectCaller)];
                        case 3:
                            newOwnerVaultBalances = _a.sent();
                            expect(newOwnerVaultBalances).to.eql(expectedVaultOwnerBalances);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('Core State Getters', function () { return __awaiter(_this, void 0, void 0, function () {
        var setComponentUnit, moduleAddress, priceLibraryAddress, setToken;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentTokens, naturalUnit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            setComponentUnit = util_1.ether(4);
                            naturalUnit = util_1.ether(2);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokens.map(function (token) { return token.address; }), componentTokens.map(function (token) { return setComponentUnit; }), naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            moduleAddress = accounts_1.ACCOUNTS[2].address;
                            priceLibraryAddress = accounts_1.ACCOUNTS[3].address;
                            return [4 /*yield*/, helpers_1.addModuleAsync(core, moduleAddress)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, helpers_1.addPriceLibraryAsync(core, priceLibraryAddress)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets exchange address', function () { return __awaiter(_this, void 0, void 0, function () {
                var kyberWrapper, exchangeAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployKyberNetworkWrapperContract(web3, constants_1.NULL_ADDRESS, transferProxy, core)];
                        case 1:
                            kyberWrapper = _a.sent();
                            return [4 /*yield*/, coreWrapper.exchangeIds(SetUtils.EXCHANGES.KYBER)];
                        case 2:
                            exchangeAddress = _a.sent();
                            expect(exchangeAddress).to.equal(kyberWrapper.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets transfer proxy address', function () { return __awaiter(_this, void 0, void 0, function () {
                var transferProxyAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.transferProxy()];
                        case 1:
                            transferProxyAddress = _a.sent();
                            expect(coreWrapper.transferProxyAddress).to.equal(transferProxyAddress);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets vault address', function () { return __awaiter(_this, void 0, void 0, function () {
                var vaultAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.vault()];
                        case 1:
                            vaultAddress = _a.sent();
                            expect(coreWrapper.vaultAddress).to.equal(vaultAddress);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets Set addresses', function () { return __awaiter(_this, void 0, void 0, function () {
                var setAddresses;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.setTokens()];
                        case 1:
                            setAddresses = _a.sent();
                            expect(setAddresses.length).to.equal(1);
                            expect(setAddresses[0]).to.equal(setToken.address);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets is valid factory address', function () { return __awaiter(_this, void 0, void 0, function () {
                var isValidVaultAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.validFactories(setTokenFactory.address)];
                        case 1:
                            isValidVaultAddress = _a.sent();
                            expect(isValidVaultAddress).to.equal(true);
                            return [4 /*yield*/, coreWrapper.validFactories(constants_1.NULL_ADDRESS)];
                        case 2:
                            isValidVaultAddress = _a.sent();
                            expect(isValidVaultAddress).to.equal(false);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets is valid Set address', function () { return __awaiter(_this, void 0, void 0, function () {
                var isValidSetAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.validSets(setToken.address)];
                        case 1:
                            isValidSetAddress = _a.sent();
                            expect(isValidSetAddress).to.equal(true);
                            return [4 /*yield*/, coreWrapper.validSets(constants_1.NULL_ADDRESS)];
                        case 2:
                            isValidSetAddress = _a.sent();
                            expect(isValidSetAddress).to.equal(false);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets is valid module', function () { return __awaiter(_this, void 0, void 0, function () {
                var isValidModule;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.validModules(moduleAddress)];
                        case 1:
                            isValidModule = _a.sent();
                            expect(isValidModule).to.equal(true);
                            return [4 /*yield*/, coreWrapper.validModules(constants_1.NULL_ADDRESS)];
                        case 2:
                            isValidModule = _a.sent();
                            expect(isValidModule).to.equal(false);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets is valid price library', function () { return __awaiter(_this, void 0, void 0, function () {
                var isValidPriceLibrary;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.validPriceLibrary(priceLibraryAddress)];
                        case 1:
                            isValidPriceLibrary = _a.sent();
                            expect(isValidPriceLibrary).to.equal(true);
                            return [4 /*yield*/, coreWrapper.validPriceLibrary(constants_1.NULL_ADDRESS)];
                        case 2:
                            isValidPriceLibrary = _a.sent();
                            expect(isValidPriceLibrary).to.equal(false);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets operation state', function () { return __awaiter(_this, void 0, void 0, function () {
                var operationalState, operationState;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            operationalState = new util_1.BigNumber(0);
                            return [4 /*yield*/, coreWrapper.operationState()];
                        case 1:
                            operationState = _a.sent();
                            expect(operationState).to.bignumber.equal(operationalState);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets modules', function () { return __awaiter(_this, void 0, void 0, function () {
                var modules, expectedModules;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.modules()];
                        case 1:
                            modules = _a.sent();
                            expectedModules = [
                                rebalanceAuctionModule.address,
                                moduleAddress,
                            ];
                            expect(JSON.stringify(modules)).to.equal(JSON.stringify(expectedModules));
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets factories', function () { return __awaiter(_this, void 0, void 0, function () {
                var factories, expectedFactories;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreWrapper.factories()];
                        case 1:
                            factories = _a.sent();
                            expectedFactories = [
                                setTokenFactory.address,
                                rebalancingSetTokenFactory.address,
                            ];
                            expect(JSON.stringify(factories)).to.equal(JSON.stringify(expectedFactories));
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets exchanges', function () { return __awaiter(_this, void 0, void 0, function () {
                var exchanges, expectedExchanges;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.registerExchange(web3, core.address, 1, accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, coreWrapper.exchanges()];
                        case 2:
                            exchanges = _a.sent();
                            expectedExchanges = [
                                accounts_1.DEFAULT_ACCOUNT,
                            ];
                            expect(JSON.stringify(exchanges)).to.equal(JSON.stringify(expectedExchanges));
                            return [2 /*return*/];
                    }
                });
            }); });
            test('gets price libraries', function () { return __awaiter(_this, void 0, void 0, function () {
                var priceLibraries, expectedPriceLibraries;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.addPriceLibraryAsync(core, accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, coreWrapper.priceLibraries()];
                        case 2:
                            priceLibraries = _a.sent();
                            expectedPriceLibraries = [
                                priceLibraryAddress,
                                accounts_1.DEFAULT_ACCOUNT,
                            ];
                            expect(JSON.stringify(priceLibraries)).to.equal(JSON.stringify(expectedPriceLibraries));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=CoreWrapper.spec.js.map