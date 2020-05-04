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
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __importStar(require("lodash"));
var errors_1 = require("../errors");
/**
 * @title AccountingAPI
 * @author Set Protocol
 *
 * A library for managing ERC20 token and Set balances for users throughout the SetProtocol system
 */
var AccountingAPI = /** @class */ (function () {
    /**
     * Instantiates a new AccountingAPI instance that contains methods for transferring balances in the vault
     *
     * @param core        An instance of CoreWrapper to interact with the deployed Core contract
     * @param assertions  An instance of the Assertion library
     */
    function AccountingAPI(core, assertions) {
        this.core = core;
        this.assert = assertions;
    }
    /**
     * Deposits tokens into the vault under the signer's address that can be used to issue a Set. Uses a different
     * transaction method depending on number of tokens to deposit in order to save gas
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens to deposit into the vault
     * @param  quantities        Amount of each token to deposit into the vault in index order with `tokenAddresses`
     * @param  txOpts            Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                   Transaction hash
     */
    AccountingAPI.prototype.depositAsync = function (tokenAddresses, quantities, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertDeposit(txOpts.from, tokenAddresses, quantities)];
                    case 1:
                        _a.sent();
                        if (!(tokenAddresses.length === 1)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.core.deposit(tokenAddresses[0], quantities[0], txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [4 /*yield*/, this.core.batchDeposit(tokenAddresses, quantities, txOpts)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Withdraws tokens from the vault belonging to the signer. Uses a different transaction method depending on
     * number of tokens to withdraw in order to save gas
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens to withdraw from the vault
     * @param  quantities        Amount of each token token to withdraw from vault in index order with `tokenAddresses`
     * @param  txOpts            Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                   Transaction hash
     */
    AccountingAPI.prototype.withdrawAsync = function (tokenAddresses, quantities, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertWithdraw(txOpts.from, tokenAddresses, quantities)];
                    case 1:
                        _a.sent();
                        if (!(tokenAddresses.length === 1)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.core.withdraw(tokenAddresses[0], quantities[0], txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [4 /*yield*/, this.core.batchWithdraw(tokenAddresses, quantities, txOpts)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /* ============ Private Assertions ============ */
    AccountingAPI.prototype.assertDeposit = function (transactionCaller, tokenAddresses, quantities) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Schema validations
                        this.assert.schema.isValidAddress('txOpts.from', transactionCaller);
                        this.assert.common.isEqualLength(tokenAddresses, quantities, errors_1.coreAPIErrors.ARRAYS_EQUAL_LENGTHS('tokenAddresses', 'quantities'));
                        // Quantity assertions
                        quantities.map(function (quantity) {
                            _this.assert.common.greaterThanZero(quantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
                        });
                        // Token assertions
                        return [4 /*yield*/, Promise.all(tokenAddresses.map(function (tokenAddress, i) { return __awaiter(_this, void 0, void 0, function () {
                                var transferProxyAddress;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            this.assert.common.isValidString(tokenAddress, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'));
                                            this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
                                            return [4 /*yield*/, this.assert.erc20.implementsERC20(tokenAddress)];
                                        case 1:
                                            _a.sent();
                                            // Check balance
                                            return [4 /*yield*/, this.assert.erc20.hasSufficientBalanceAsync(tokenAddress, transactionCaller, quantities[i])];
                                        case 2:
                                            // Check balance
                                            _a.sent();
                                            transferProxyAddress = this.core.transferProxyAddress;
                                            return [4 /*yield*/, this.assert.erc20.hasSufficientAllowanceAsync(tokenAddress, transactionCaller, transferProxyAddress, quantities[i])];
                                        case 3:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        // Token assertions
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AccountingAPI.prototype.assertWithdraw = function (transactionCaller, tokenAddresses, quantities) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('txOpts.from', transactionCaller);
                        this.assert.common.isEqualLength(tokenAddresses, quantities, errors_1.coreAPIErrors.ARRAYS_EQUAL_LENGTHS('tokenAddresses', 'quantities'));
                        // Quantity assertions
                        _.each(quantities, function (quantity) {
                            _this.assert.common.greaterThanZero(quantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
                        });
                        // Token assertions
                        return [4 /*yield*/, Promise.all(tokenAddresses.map(function (tokenAddress, i) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            this.assert.common.isValidString(tokenAddress, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'));
                                            this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
                                            return [4 /*yield*/, this.assert.erc20.implementsERC20(tokenAddress)];
                                        case 1:
                                            _a.sent();
                                            // Check balance
                                            return [4 /*yield*/, this.assert.vault.hasSufficientTokenBalance(this.core.vaultAddress, tokenAddress, transactionCaller, quantities[i])];
                                        case 2:
                                            // Check balance
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        // Token assertions
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AccountingAPI;
}());
exports.AccountingAPI = AccountingAPI;
//# sourceMappingURL=AccountingAPI.js.map