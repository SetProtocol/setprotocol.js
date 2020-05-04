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
Object.defineProperty(exports, "__esModule", { value: true });
var ProtocolContractWrapper_1 = require("./ProtocolContractWrapper");
var util_1 = require("../../util");
/**
 * @title  VaultAPI
 * @author Set Protocol
 *
 * The Vault API handles all functions on the Vault smart contract.
 *
 */
var ERC20Wrapper = /** @class */ (function () {
    function ERC20Wrapper(web3) {
        this.web3 = web3;
        this.contracts = new ProtocolContractWrapper_1.ProtocolContractWrapper(this.web3);
    }
    /**
     * Gets balance of the ERC20 token
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @param  userAddress   Address of the user
     * @return               The balance of the ERC20 token
     */
    ERC20Wrapper.prototype.balanceOf = function (tokenAddress, userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadERC20TokenAsync(tokenAddress)];
                    case 1:
                        tokenInstance = _a.sent();
                        return [4 /*yield*/, tokenInstance.balanceOf.callAsync(userAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets name of the ERC20 token
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @return               The name of the ERC20 token
     */
    ERC20Wrapper.prototype.name = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadERC20TokenAsync(tokenAddress)];
                    case 1:
                        tokenInstance = _a.sent();
                        return [4 /*yield*/, tokenInstance.name.callAsync(tokenAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets balance of the ERC20 token
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @return               The symbol of the ERC20 token
     */
    ERC20Wrapper.prototype.symbol = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadERC20TokenAsync(tokenAddress)];
                    case 1:
                        tokenInstance = _a.sent();
                        return [4 /*yield*/, tokenInstance.symbol.callAsync(tokenAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets the total supply of the ERC20 token
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @return               The symbol of the ERC20 token
     */
    ERC20Wrapper.prototype.totalSupply = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadERC20TokenAsync(tokenAddress)];
                    case 1:
                        tokenInstance = _a.sent();
                        return [4 /*yield*/, tokenInstance.totalSupply.callAsync(tokenAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets decimals of the ERC20 token
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @param  userAddress   Address of the user
     * @return               The decimals of the ERC20 token
     */
    ERC20Wrapper.prototype.decimals = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadERC20TokenAsync(tokenAddress)];
                    case 1:
                        tokenInstance = _a.sent();
                        return [4 /*yield*/, tokenInstance.decimals.callAsync(tokenAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets the allowance of the spender by the owner account
     *
     * @param  tokenAddress      Address of the token
     * @param  ownerAddress      Address of the owner
     * @param  spenderAddress    Address of the spender
     * @return                   The allowance of the spender
     */
    ERC20Wrapper.prototype.allowance = function (tokenAddress, ownerAddress, spenderAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadERC20TokenAsync(tokenAddress)];
                    case 1:
                        tokenInstance = _a.sent();
                        return [4 /*yield*/, tokenInstance.allowance.callAsync(ownerAddress, spenderAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously transfer value denominated in the specified ERC20 token to
     * the address specified.
     *
     * @param  tokenAddress   The address of the token being used.
     * @param  to             To whom the transfer is being made.
     * @param  value          The amount being transferred.
     * @param  txOpts         Any parameters necessary to modify the transaction.
     * @return                The hash of the resulting transaction.
     */
    ERC20Wrapper.prototype.transfer = function (tokenAddress, to, value, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txOptions, tokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txOptions = _a.sent();
                        return [4 /*yield*/, this.contracts.loadERC20TokenAsync(tokenAddress)];
                    case 2:
                        tokenInstance = _a.sent();
                        return [4 /*yield*/, tokenInstance.transfer.sendTransactionAsync(to, value, txOptions)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously transfer the value amount in the token specified so long
     * as the sender of the message has received sufficient allowance on behalf
     * of `from` to do so.
     *
     * @param  tokenAddress   The address of the token being used.
     * @param  from           From whom are the funds being transferred.
     * @param  to             To whom are the funds being transferred.
     * @param  value          The amount to be transferred.
     * @param  txOpts         Any parameters necessary to modify the transaction.
     * @return                The hash of the resulting transaction.
     */
    ERC20Wrapper.prototype.transferFrom = function (tokenAddress, from, to, value, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenInstance, txOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadERC20TokenAsync(tokenAddress)];
                    case 1:
                        tokenInstance = _a.sent();
                        return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 2:
                        txOptions = _a.sent();
                        return [4 /*yield*/, tokenInstance.transferFrom.sendTransactionAsync(from, to, value, txOptions)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously approves the value amount of the spender from the owner
     *
     * @param  tokenAddress         the address of the token being used.
     * @param  spenderAddress       the spender.
     * @param  value                the amount to be approved.
     * @param  txOpts               any parameters necessary to modify the transaction.
     * @return                      the hash of the resulting transaction.
     */
    ERC20Wrapper.prototype.approve = function (tokenAddress, spenderAddress, value, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txOptions, tokenInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txOptions = _a.sent();
                        return [4 /*yield*/, this.contracts.loadERC20TokenAsync(tokenAddress)];
                    case 2:
                        tokenInstance = _a.sent();
                        return [4 /*yield*/, tokenInstance.approve.sendTransactionAsync(spenderAddress, value, txOptions)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return ERC20Wrapper;
}());
exports.ERC20Wrapper = ERC20Wrapper;
//# sourceMappingURL=ERC20Wrapper.js.map