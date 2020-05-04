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
var wrappers_1 = require("../wrappers");
/**
 * @title ERC20API
 * @author Set Protocol
 *
 * A library for interacting with ERC20 compliant token contracts
 */
var ERC20API = /** @class */ (function () {
    /**
     * Instantiates a new IssuanceAPI instance that contains methods for transferring balances in the vault
     *
     * @param web3          Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                        with the Ethereum network
     * @param assertions    An instance of the Assertion library
     * @param config        Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    function ERC20API(web3, assertions, config) {
        this.assert = assertions;
        this.erc20Wrapper = new wrappers_1.ERC20Wrapper(web3);
        this.protocolViewerWrapper = new wrappers_1.ProtocolViewerWrapper(web3, config.protocolViewerAddress);
    }
    /**
     * Fetches the user's ERC20 token balance
     *
     * @param  tokenAddress    Address of the ERC20 token
     * @param  userAddress     Wallet address of the user
     * @return                 Balance of the ERC20 token
     */
    ERC20API.prototype.getBalanceOfAsync = function (tokenAddress, userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertGetBalanceOf(tokenAddress, userAddress);
                        return [4 /*yield*/, this.erc20Wrapper.balanceOf(tokenAddress, userAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches an addresses balance of multiple ERC20 tokens
     *
     * @param  tokenAddresses    Address of the ERC20 token
     * @param  userAddress       Wallet address of the user
     * @return                   Balance of the ERC20 token
     */
    ERC20API.prototype.getBalancesOfAsync = function (tokenAddresses, userAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertGetBalancesOf(tokenAddresses, userAddress);
                        return [4 /*yield*/, this.protocolViewerWrapper.batchFetchBalancesOf(tokenAddresses, userAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches exchange rate stored for a given array of cToken addresses
     *
     * @param  cTokenAddresses    Addresses of the cToken to fetch exchange rates for
     * @return                    Exchange rate of cTokens
     */
    ERC20API.prototype.getCTokenExchangeRatesAsync = function (cTokenAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertGetCTokenExchangeRates(cTokenAddresses);
                        return [4 /*yield*/, this.protocolViewerWrapper.batchFetchExchangeRateStored(cTokenAddresses)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches token balances for each tokenAddress, userAddress pair
     *
     * @param  tokenAddresses    Addresses of the ERC20 tokens to fetch balances for
     * @param  userAddresses     Addresses of users sequential to tokenAddressesto fetch balances for
     * @return                   Balance of the ERC20 token
     */
    ERC20API.prototype.getUsersBalancesOfAsync = function (tokenAddresses, userAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertGetUsersBalancesOf(tokenAddresses, userAddresses);
                        return [4 /*yield*/, this.protocolViewerWrapper.batchFetchUsersBalances(tokenAddresses, userAddresses)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the name of the ERC20 token
     *
     * @param  tokenAddress    Address of the ERC20 token
     * @return                 Name of the ERC20 token
     */
    ERC20API.prototype.getNameAsync = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
                        return [4 /*yield*/, this.erc20Wrapper.name(tokenAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the symbol of the ERC20 token
     *
     * @param  tokenAddress    Address of the ERC20 token
     * @return                 Symbol of the ERC20 token
     */
    ERC20API.prototype.getSymbolAsync = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
                        return [4 /*yield*/, this.erc20Wrapper.symbol(tokenAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the total supply of the ERC20 token
     *
     * @param  tokenAddress    Address of the ERC20 token
     * @return                 Total supply of the ERC20 token
     */
    ERC20API.prototype.getTotalSupplyAsync = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
                        return [4 /*yield*/, this.erc20Wrapper.totalSupply(tokenAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the total supply of multiple ERC20 token contracts, returned in the
     * order the addresses were submitted to the request
     *
     * @param  tokenAddresses    Addresses of the ERC20 tokens
     * @return                   Total supply property of multiple ERC20 contracts
     */
    ERC20API.prototype.getTotalSuppliesAsync = function (tokenAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertGetTotalSuppliesAsync(tokenAddresses);
                        return [4 /*yield*/, this.protocolViewerWrapper.batchFetchSupplies(tokenAddresses)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the decimals of the ERC20 token
     *
     * @param  tokenAddress    Address of the ERC20 token
     * @return                 Decimals of the ERC20 token
     */
    ERC20API.prototype.getDecimalsAsync = function (tokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
                        return [4 /*yield*/, this.erc20Wrapper.decimals(tokenAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the allowance of the spender for the token by the owner
     *
     * @param  tokenAddress      Address of the token
     * @param  ownerAddress      Address of the owner
     * @param  spenderAddress    Address of the spender
     * @return                   Allowance of the spender
     */
    ERC20API.prototype.getAllowanceAsync = function (tokenAddress, ownerAddress, spenderAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertGetAllowance(tokenAddress, ownerAddress, spenderAddress);
                        return [4 /*yield*/, this.erc20Wrapper.allowance(tokenAddress, ownerAddress, spenderAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Transfer balance denominated in the specified ERC20 token to another address
     *
     * @param  tokenAddress    Address of the token to transfer
     * @param  to              Address of the receiver
     * @param  value           Amount being transferred
     * @param  txOpts          Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                 Transaction hash
     */
    ERC20API.prototype.transferAsync = function (tokenAddress, to, value, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertTransfer(tokenAddress, to);
                        return [4 /*yield*/, this.erc20Wrapper.transfer(tokenAddress, to, value, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Transfer balance denominated in the specified ERC20 token on behalf of the owner. Caller
     * must have sufficient allowance from owner in order to complete transfer. Use `approveAsync`
     * to grant allowance
     *
     * @param  tokenAddress    Address of the token to transfer
     * @param  from            Token owner
     * @param  to              Address of the receiver
     * @param  value           Amount to be transferred
     * @param  txOpts          Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                 Transaction hash
     */
    ERC20API.prototype.transferFromAsync = function (tokenAddress, from, to, value, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertTransferFrom(tokenAddress, from, to);
                        return [4 /*yield*/, this.erc20Wrapper.transferFrom(tokenAddress, from, to, value, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Approves the specified amount of allowance to the spender on behalf of the signer
     *
     * @param  tokenAddress      Address of the token being used
     * @param  spenderAddress    Address to approve allowance to
     * @param  value             Amount of allowance to grant
     * @param  txOpts            Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                   Transaction hash
     */
    ERC20API.prototype.approveAsync = function (tokenAddress, spenderAddress, value, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertApprove(tokenAddress, spenderAddress);
                        return [4 /*yield*/, this.erc20Wrapper.approve(tokenAddress, spenderAddress, value, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /* ============ Private Assertions ============ */
    ERC20API.prototype.assertGetBalanceOf = function (tokenAddress, userAddress) {
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
        this.assert.schema.isValidAddress('userAddress', userAddress);
    };
    ERC20API.prototype.assertGetBalancesOf = function (tokenAddresses, userAddress) {
        var _this = this;
        this.assert.schema.isValidAddress('userAddress', userAddress);
        tokenAddresses.forEach(function (tokenAddress) {
            _this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
        });
    };
    ERC20API.prototype.assertGetUsersBalancesOf = function (tokenAddresses, userAddresses) {
        var _this = this;
        userAddresses.forEach(function (userAddress) {
            _this.assert.schema.isValidAddress('userAddress', userAddress);
        });
        tokenAddresses.forEach(function (tokenAddress) {
            _this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
        });
    };
    ERC20API.prototype.assertGetCTokenExchangeRates = function (cTokenAddresses) {
        var _this = this;
        cTokenAddresses.forEach(function (cTokenAddress) {
            _this.assert.schema.isValidAddress('cTokenAddress', cTokenAddress);
        });
    };
    ERC20API.prototype.assertGetAllowance = function (tokenAddress, ownerAddress, spenderAddress) {
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
        this.assert.schema.isValidAddress('ownerAddress', ownerAddress);
        this.assert.schema.isValidAddress('spenderAddress', spenderAddress);
    };
    ERC20API.prototype.assertTransfer = function (tokenAddress, to) {
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
        this.assert.schema.isValidAddress('to', to);
    };
    ERC20API.prototype.assertTransferFrom = function (tokenAddress, from, to) {
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
        this.assert.schema.isValidAddress('from', from);
        this.assert.schema.isValidAddress('to', to);
    };
    ERC20API.prototype.assertApprove = function (tokenAddress, spenderAddress) {
        this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
        this.assert.schema.isValidAddress('spenderAddress', spenderAddress);
    };
    ERC20API.prototype.assertGetTotalSuppliesAsync = function (tokenAddresses) {
        var _this = this;
        tokenAddresses.forEach(function (tokenAddress) {
            _this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
        });
    };
    return ERC20API;
}());
exports.ERC20API = ERC20API;
//# sourceMappingURL=ERC20API.js.map