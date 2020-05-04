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
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
var api_1 = require("@src/api");
var util_1 = require("@src/util");
var wrappers_1 = require("@src/wrappers");
var accounts_1 = require("@src/constants/accounts");
var constants_1 = require("@src/constants");
var coreHelpers_1 = require("@test/helpers/coreHelpers");
var assertions_1 = require("@src/assertions");
var units_1 = require("@src/util/units");
chaiSetup_1.default.configure();
var contract = require('truffle-contract');
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var expect = chai.expect;
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('IssuanceAPI', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var issuanceAPI;
    var componentTokens;
    var setComponentUnit;
    var componentUnits;
    var setToken;
    var naturalUnit;
    var coreWrapper;
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var assertions;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _b.sent();
                    return [4 /*yield*/, coreHelpers_1.deployBaseContracts(web3)];
                case 2:
                    _a = _b.sent(), core = _a[0], transferProxy = _a[1], vault = _a[2], setTokenFactory = _a[3];
                    coreWrapper = new wrappers_1.CoreWrapper(web3, core.address, transferProxy.address, vault.address);
                    assertions = new assertions_1.Assertions(web3);
                    issuanceAPI = new api_1.IssuanceAPI(web3, coreWrapper, assertions);
                    return [4 /*yield*/, coreHelpers_1.deployTokensAsync(3, web3)];
                case 3:
                    componentTokens = _b.sent();
                    setComponentUnit = units_1.ether(4);
                    componentUnits = componentTokens.map(function () { return setComponentUnit; });
                    naturalUnit = units_1.ether(2);
                    return [4 /*yield*/, coreHelpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokens.map(function (token) { return token.address; }), componentUnits, naturalUnit)];
                case 4:
                    setToken = _b.sent();
                    return [4 /*yield*/, coreHelpers_1.approveForTransferAsync(componentTokens, transferProxy.address)];
                case 5:
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
    describe('issueAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, issuanceAPI.issueAsync(subjectSetToIssue, subjectQuantitytoIssue, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectSetToIssue, subjectQuantitytoIssue, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    subjectSetToIssue = setToken.address;
                    subjectQuantitytoIssue = units_1.ether(2);
                    subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                    return [2 /*return*/];
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
            describe('when the transaction caller address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = 'invalidCallerAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected transactionCaller to conform to schema /Address.\n\n        Encountered: \"invalidCallerAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the set address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectSetToIssue = 'invalidSetAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected setAddress to conform to schema /Address.\n\n        Encountered: \"invalidSetAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
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
                            subjectQuantitytoIssue = invalidQuantity;
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
            describe('when the quantity is not a multiple of the natural unit', function () { return __awaiter(_this, void 0, void 0, function () {
                var invalidQuantity;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            invalidQuantity = units_1.ether(3);
                            subjectQuantitytoIssue = invalidQuantity;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('Issuance quantity needs to be multiple of natural unit.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the caller does not have enough of a component', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var naturalUnit, componentUnit;
                        return __generator(this, function (_a) {
                            // Only the first component will have an insufficient balance
                            componentUnits = _.map(componentTokens, function (token, index) {
                                return index === 0 ? new util_1.BigNumber(1) : setComponentUnit;
                            });
                            naturalUnit = units_1.ether(2);
                            componentUnit = units_1.ether(4);
                            subjectQuantitytoIssue = constants_1.DEPLOYED_TOKEN_QUANTITY.div(naturalUnit).mul(componentUnit).add(naturalUnit);
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
            describe('when the caller does not have the right amount of allowance to the transfer proxy', function () { return __awaiter(_this, void 0, void 0, function () {
                var componentWithInsufficientAllowance, requiredAllowance;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    componentWithInsufficientAllowance = componentTokens[0];
                                    requiredAllowance = componentUnits[0];
                                    return [4 /*yield*/, componentWithInsufficientAllowance.approve.sendTransactionAsync(transferProxy.address, constants_1.ZERO, constants_1.TX_DEFAULTS)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + constants_1.TX_DEFAULTS.from + " has allowance of " + constants_1.ZERO + "\n\n        when required allowance is " + requiredAllowance + " at token\n\n        address: " + componentWithInsufficientAllowance.address + " for spender: " + transferProxy.address + ".\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('redeemAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, issuanceAPI.redeemAsync(subjectSetToRedeem, subjectQuantityToRedeem, subjectShouldWithdraw, subjectTokensToExclude, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectSetToRedeem, subjectQuantityToRedeem, subjectShouldWithdraw, subjectTokensToExclude, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, units_1.ether(2), constants_1.TX_DEFAULTS)];
                        case 1:
                            _a.sent();
                            subjectSetToRedeem = setToken.address;
                            subjectQuantityToRedeem = units_1.ether(2);
                            subjectShouldWithdraw = false;
                            subjectTokensToExclude = [];
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
            describe('when withdrawing after redeeming', function () { return __awaiter(_this, void 0, void 0, function () {
                var componentToExclude;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            componentToExclude = componentTokens[0];
                            subjectShouldWithdraw = true;
                            subjectTokensToExclude = [componentToExclude.address];
                            return [2 /*return*/];
                        });
                    }); });
                    test('increments the vault balance of the excluded token ', function () { return __awaiter(_this, void 0, void 0, function () {
                        var existingVaultBalance, requiredQuantityToRedeem, expectedVaultBalance, newVaultBalances;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, vault.getOwnerBalance.callAsync(componentToExclude.address, subjectCaller)];
                                case 1:
                                    existingVaultBalance = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _a.sent();
                                    requiredQuantityToRedeem = subjectQuantityToRedeem.div(naturalUnit).mul(setComponentUnit);
                                    expectedVaultBalance = existingVaultBalance.add(requiredQuantityToRedeem);
                                    return [4 /*yield*/, vault.getOwnerBalance.callAsync(componentToExclude.address, subjectCaller)];
                                case 3:
                                    newVaultBalances = _a.sent();
                                    expect(newVaultBalances).to.eql(expectedVaultBalance);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('withdraws the remaining components ', function () { return __awaiter(_this, void 0, void 0, function () {
                        var remainingComponentAddresses, existingBalances, expectedVaultBalances, newVaultBalances;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    remainingComponentAddresses = _.tail(componentTokens);
                                    return [4 /*yield*/, coreHelpers_1.getTokenBalances(remainingComponentAddresses, subjectCaller)];
                                case 1:
                                    existingBalances = _a.sent();
                                    return [4 /*yield*/, subject()];
                                case 2:
                                    _a.sent();
                                    expectedVaultBalances = _.map(remainingComponentAddresses, function (component, idx) {
                                        var requiredQuantityToRedeem = subjectQuantityToRedeem.div(naturalUnit).mul(setComponentUnit);
                                        return existingBalances[idx].add(requiredQuantityToRedeem);
                                    });
                                    return [4 /*yield*/, coreHelpers_1.getTokenBalances(remainingComponentAddresses, subjectCaller)];
                                case 3:
                                    newVaultBalances = _a.sent();
                                    expect(newVaultBalances).to.eql(expectedVaultBalances);
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
                            subjectCaller = 'invalidCallerAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected transactionCaller to conform to schema /Address.\n\n        Encountered: \"invalidCallerAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the set address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectSetToRedeem = 'invalidSetAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected setAddress to conform to schema /Address.\n\n        Encountered: \"invalidSetAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
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
                            subjectQuantityToRedeem = invalidQuantity;
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
            describe('when a token address in toExclude is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTokensToExclude = ['invalidAddress'];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected tokenAddress to conform to schema /Address.\n\n        Encountered: \"invalidAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantity is not a multiple of the natural unit', function () { return __awaiter(_this, void 0, void 0, function () {
                var invalidQuantity;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            invalidQuantity = units_1.ether(3);
                            subjectQuantityToRedeem = invalidQuantity;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('Issuance quantity needs to be multiple of natural unit.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantity to redeem is larger than the user\'s Set Token balance', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectQuantityToRedeem = units_1.ether(4);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var currentBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, setToken.balanceOf.callAsync(subjectCaller)];
                                case 1:
                                    currentBalance = _a.sent();
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        User: " + subjectCaller + " has balance of " + currentBalance + "\n\n        when required balance is " + subjectQuantityToRedeem + " at token address " + subjectSetToRedeem + ".\n      ")];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('calculateRequiredComponentsAndUnitsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, issuanceAPI.calculateRequiredComponentsAndUnitsAsync(subjectSetAddress, subjectMakerAddress, subjectQuantity)];
                });
            });
        }
        var setComponents, componentUnits, setToken, naturalUnit, subjectSetAddress, subjectMakerAddress, subjectQuantity, makerAccount, componentRecipient;
        var _this = this;
        return __generator(this, function (_a) {
            makerAccount = accounts_1.ACCOUNTS[3].address;
            componentRecipient = makerAccount;
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var setComponentUnit, componentAddresses;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, coreHelpers_1.deployTokensAsync(2, web3, componentRecipient)];
                        case 1:
                            setComponents = _a.sent();
                            setComponentUnit = units_1.ether(4);
                            componentAddresses = setComponents.map(function (token) { return token.address; });
                            componentUnits = setComponents.map(function (token) { return setComponentUnit; });
                            naturalUnit = units_1.ether(2);
                            return [4 /*yield*/, coreHelpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            subjectSetAddress = setToken.address;
                            subjectMakerAddress = makerAccount;
                            subjectQuantity = naturalUnit;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the maker has no token balances', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            componentRecipient = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            componentRecipient = makerAccount;
                            return [2 /*return*/];
                        });
                    }); });
                    test('should return the correct required components', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedComponents, requiredComponents, componentAddresses;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedComponents = setComponents.map(function (setComponent) { return setComponent.address; });
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    requiredComponents = _a.sent();
                                    componentAddresses = requiredComponents.map(function (requiredComponent) { return requiredComponent.address; });
                                    expectedComponents.sort();
                                    componentAddresses.sort();
                                    expect(JSON.stringify(expectedComponents)).to.equal(JSON.stringify(componentAddresses));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('should return the correct required units', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedUnits, requiredComponents, units;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedUnits = componentUnits.map(function (componentUnit) { return componentUnit.mul(subjectQuantity).div(naturalUnit); });
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    requiredComponents = _a.sent();
                                    units = requiredComponents.map(function (requiredComponent) { return requiredComponent.unit; });
                                    expectedUnits.sort();
                                    units.sort();
                                    expect(JSON.stringify(expectedUnits)).to.equal(JSON.stringify(units));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when a user has sufficient balance in the wallet', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    test('should return an empty array of required components', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedComponents, requiredComponents, components;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedComponents = [];
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    requiredComponents = _a.sent();
                                    components = requiredComponents.map(function (requiredComponent) { return requiredComponent.address; });
                                    expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('should return an empty array of required units', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedUnits, requiredComponents, units;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedUnits = [];
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    requiredComponents = _a.sent();
                                    units = requiredComponents.map(function (requiredComponent) { return requiredComponent.unit; });
                                    expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedUnits));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when a user has sufficient balance in the vault', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var i, currentComponent, makerComponentBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    i = 0;
                                    _a.label = 1;
                                case 1:
                                    if (!(i < setComponents.length)) return [3 /*break*/, 6];
                                    currentComponent = setComponents[i];
                                    return [4 /*yield*/, currentComponent.balanceOf.callAsync(makerAccount)];
                                case 2:
                                    makerComponentBalance = _a.sent();
                                    return [4 /*yield*/, currentComponent.approve.sendTransactionAsync(transferProxy.address, makerComponentBalance, { from: makerAccount })];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, coreWrapper.deposit(currentComponent.address, makerComponentBalance, { from: makerAccount })];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5:
                                    i++;
                                    return [3 /*break*/, 1];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    test('should return an empty array of required components', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedComponents, requiredComponents, components;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedComponents = [];
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    requiredComponents = _a.sent();
                                    components = requiredComponents.map(function (requiredComponent) { return requiredComponent.address; });
                                    expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('should return an empty array of required units', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedUnits, requiredComponents, units;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedUnits = [];
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    requiredComponents = _a.sent();
                                    units = requiredComponents.map(function (requiredComponent) { return requiredComponent.unit; });
                                    expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedUnits));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when a user has half of the required balance', function () { return __awaiter(_this, void 0, void 0, function () {
                var requiredBalances;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var i, currentComponent, currentUnit, halfRequiredAmount;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    subjectMakerAddress = accounts_1.DEFAULT_ACCOUNT;
                                    requiredBalances = [];
                                    i = 0;
                                    _a.label = 1;
                                case 1:
                                    if (!(i < setComponents.length)) return [3 /*break*/, 4];
                                    currentComponent = setComponents[i];
                                    currentUnit = componentUnits[i];
                                    halfRequiredAmount = subjectQuantity.mul(currentUnit).div(naturalUnit).div(2);
                                    return [4 /*yield*/, currentComponent.transfer.sendTransactionAsync(subjectMakerAddress, halfRequiredAmount, { from: componentRecipient })];
                                case 2:
                                    _a.sent();
                                    requiredBalances.push(halfRequiredAmount);
                                    _a.label = 3;
                                case 3:
                                    i++;
                                    return [3 /*break*/, 1];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    test('should return the correct array of required components', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedComponents, requiredComponents, components;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedComponents = setComponents.map(function (setComponent) { return setComponent.address; });
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    requiredComponents = _a.sent();
                                    components = requiredComponents.map(function (requiredComponent) { return requiredComponent.address; });
                                    expectedComponents.sort();
                                    components.sort();
                                    expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('should return the correct array of required units', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedUnits, requiredComponents, units;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedUnits = requiredBalances;
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    requiredComponents = _a.sent();
                                    units = requiredComponents.map(function (requiredComponent) { return requiredComponent.unit; });
                                    expectedUnits.sort();
                                    units.sort();
                                    expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedUnits));
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
//# sourceMappingURL=IssuanceAPI.spec.js.map