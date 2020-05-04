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
var chai = __importStar(require("chai"));
var web3_1 = __importDefault(require("web3"));
var set_protocol_utils_1 = require("set-protocol-utils");
var set_protocol_contracts_1 = require("set-protocol-contracts");
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
var api_1 = require("@src/api");
var util_1 = require("@src/util");
var assertions_1 = require("@src/assertions");
var wrappers_1 = require("@src/wrappers");
var accounts_1 = require("@src/constants/accounts");
var constants_1 = require("@src/constants");
var helpers_1 = require("@test/helpers");
chaiSetup_1.default.configure();
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var expect = chai.expect;
var currentSnapshotId;
describe('AccountingAPI', function () {
    var transferProxy;
    var vault;
    var core;
    var coreWrapper;
    var accountingAPI;
    var tokens;
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
                    _a = _b.sent(), core = _a[0], transferProxy = _a[1], vault = _a[2];
                    coreWrapper = new wrappers_1.CoreWrapper(web3, core.address, transferProxy.address, vault.address);
                    assertions = new assertions_1.Assertions(web3);
                    accountingAPI = new api_1.AccountingAPI(coreWrapper, assertions);
                    return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                case 3:
                    tokens = _b.sent();
                    return [4 /*yield*/, helpers_1.approveForTransferAsync(tokens, transferProxy.address)];
                case 4:
                    _b.sent();
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
    describe('depositAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, accountingAPI.depositAsync(subjectTokenAddressesToDeposit, subjectQuantitiesToDeposit, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTokenAddressesToDeposit, subjectQuantitiesToDeposit, subjectCaller, depositQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    depositQuantity = new util_1.BigNumber(100);
                    subjectTokenAddressesToDeposit = tokens.map(function (token) { return token.address; });
                    subjectQuantitiesToDeposit = tokens.map(function () { return depositQuantity; });
                    subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                    return [2 /*return*/];
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
            describe('when a single address and quantity is passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var tokenAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            tokenAddress = subjectTokenAddressesToDeposit[0];
                            subjectTokenAddressesToDeposit = [tokenAddress];
                            subjectQuantitiesToDeposit = subjectTokenAddressesToDeposit.map(function () { return depositQuantity; });
                            return [2 /*return*/];
                        });
                    }); });
                    test('correctly updates the vault balance', function () { return __awaiter(_this, void 0, void 0, function () {
                        var existingOwnerVaultBalance, expectedVaultOwnerBalance, newVaultOwnerBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, vault.getOwnerBalance.callAsync(tokenAddress, accounts_1.DEFAULT_ACCOUNT)];
                                case 1:
                                    existingOwnerVaultBalance = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _a.sent();
                                    expectedVaultOwnerBalance = existingOwnerVaultBalance.add(depositQuantity);
                                    return [4 /*yield*/, vault.getOwnerBalance.callAsync(tokenAddress, accounts_1.DEFAULT_ACCOUNT)];
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
            describe('when the transaction caller address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = 'invalidAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected txOpts.from to conform to schema /Address.\n\n        Encountered: \"invalidAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the token addresses and quantities are not the same length', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTokenAddressesToDeposit = [subjectTokenAddressesToDeposit[0]];
                            subjectQuantitiesToDeposit = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('The tokenAddresses and quantities arrays need to be equal lengths.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantities containes a negative number', function () { return __awaiter(_this, void 0, void 0, function () {
                var invalidQuantity;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            invalidQuantity = new util_1.BigNumber(-1);
                            subjectTokenAddressesToDeposit = [subjectTokenAddressesToDeposit[0]];
                            subjectQuantitiesToDeposit = [invalidQuantity];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + invalidQuantity + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the token addresses contains an empty address', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTokenAddressesToDeposit = [''];
                            subjectQuantitiesToDeposit = [depositQuantity];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('The string tokenAddress cannot be empty.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the token addresses contains an address for a contract that is not ERC20', function () { return __awaiter(_this, void 0, void 0, function () {
                var nonERC20ContractAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            nonERC20ContractAddress = coreWrapper.vaultAddress;
                            subjectTokenAddressesToDeposit = [nonERC20ContractAddress];
                            subjectQuantitiesToDeposit = [depositQuantity];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + nonERC20ContractAddress + " does not implement ERC20 interface.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the caller does not have enough balance of token', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var depositToken;
                        return __generator(this, function (_a) {
                            depositToken = tokens[0];
                            subjectTokenAddressesToDeposit = [depositToken.address];
                            subjectQuantitiesToDeposit = [depositQuantity];
                            subjectCaller = accounts_1.ACCOUNTS[1].address;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // TODO - Can add rejection message after promise race conditions are fixed
                            return [2 /*return*/, expect(subject()).to.be.rejected];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the caller has not granted enough allowance to the transfer proxy', function () { return __awaiter(_this, void 0, void 0, function () {
                var insufficientAllowance, tokenAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var tokenWrapper;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    insufficientAllowance = depositQuantity.sub(1);
                                    tokenAddress = subjectTokenAddressesToDeposit[0];
                                    return [4 /*yield*/, set_protocol_contracts_1.StandardTokenMockContract.at(tokenAddress, web3, constants_1.TX_DEFAULTS)];
                                case 1:
                                    tokenWrapper = _a.sent();
                                    return [4 /*yield*/, tokenWrapper.approve.sendTransactionAsync(coreWrapper.transferProxyAddress, insufficientAllowance, constants_1.TX_DEFAULTS)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + constants_1.TX_DEFAULTS.from + " has allowance of " + insufficientAllowance + "\n\n        when required allowance is " + depositQuantity + " at token\n\n        address: " + tokenAddress + " for spender: " + coreWrapper.transferProxyAddress + ".\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('withdrawAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, accountingAPI.withdrawAsync(subjectTokenAddressesToWithdraw, subjectQuantitiesToWithdraw, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTokenAddressesToWithdraw, subjectQuantitiesToWithdraw, subjectCaller, withdrawQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var quantitiesToDeposit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            withdrawQuantity = new util_1.BigNumber(100);
                            subjectTokenAddressesToWithdraw = tokens.map(function (token) { return token.address; });
                            quantitiesToDeposit = subjectTokenAddressesToWithdraw.map(function () { return withdrawQuantity; });
                            return [4 /*yield*/, accountingAPI.depositAsync(subjectTokenAddressesToWithdraw, quantitiesToDeposit, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 1:
                            _a.sent();
                            subjectQuantitiesToWithdraw = quantitiesToDeposit;
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
            describe('when a single address and quantity is passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var tokenAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            tokenAddress = subjectTokenAddressesToWithdraw[0];
                            subjectTokenAddressesToWithdraw = [tokenAddress];
                            subjectQuantitiesToWithdraw = subjectTokenAddressesToWithdraw.map(function () { return withdrawQuantity; });
                            return [2 /*return*/];
                        });
                    }); });
                    test('correctly updates the vault balance', function () { return __awaiter(_this, void 0, void 0, function () {
                        var existingOwnerVaultBalance, expectedVaultOwnerBalance, newVaultOwnerBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, vault.getOwnerBalance.callAsync(tokenAddress, accounts_1.DEFAULT_ACCOUNT)];
                                case 1:
                                    existingOwnerVaultBalance = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _a.sent();
                                    expectedVaultOwnerBalance = existingOwnerVaultBalance.sub(withdrawQuantity);
                                    return [4 /*yield*/, vault.getOwnerBalance.callAsync(tokenAddress, accounts_1.DEFAULT_ACCOUNT)];
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
            describe('when the transaction caller address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = 'invalidAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected txOpts.from to conform to schema /Address.\n\n        Encountered: \"invalidAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the token addresses and quantities are not the same length', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTokenAddressesToWithdraw = [subjectTokenAddressesToWithdraw[0]];
                            subjectQuantitiesToWithdraw = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('The tokenAddresses and quantities arrays need to be equal lengths.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantities containes a negative number', function () { return __awaiter(_this, void 0, void 0, function () {
                var invalidQuantity;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            invalidQuantity = new util_1.BigNumber(-1);
                            subjectTokenAddressesToWithdraw = [subjectTokenAddressesToWithdraw[0]];
                            subjectQuantitiesToWithdraw = [invalidQuantity];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + invalidQuantity + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the token addresses contains an empty address', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTokenAddressesToWithdraw = [''];
                            subjectQuantitiesToWithdraw = [withdrawQuantity];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('The string tokenAddress cannot be empty.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the token addresses contains an address for a contract that is not ERC20', function () { return __awaiter(_this, void 0, void 0, function () {
                var nonERC20ContractAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            nonERC20ContractAddress = coreWrapper.vaultAddress;
                            subjectTokenAddressesToWithdraw = [nonERC20ContractAddress];
                            subjectQuantitiesToWithdraw = [withdrawQuantity];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + nonERC20ContractAddress + " does not implement ERC20 interface.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the caller does not have enough balance to withdraw', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var tokenToWithdrawFromOriginallyDepositedAmount, quantityToWithdrawFromOringallyDepositedAmount;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    tokenToWithdrawFromOriginallyDepositedAmount = subjectTokenAddressesToWithdraw[0];
                                    quantityToWithdrawFromOringallyDepositedAmount = new util_1.BigNumber(1);
                                    return [4 /*yield*/, accountingAPI.withdrawAsync([tokenToWithdrawFromOriginallyDepositedAmount], [quantityToWithdrawFromOringallyDepositedAmount], { from: subjectCaller })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('User does not have enough balance of the token in vault.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=AccountingAPI.spec.js.map