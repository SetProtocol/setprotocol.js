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
var set_protocol_utils_1 = require("set-protocol-utils");
var ProtocolContractWrapper_1 = require("./ProtocolContractWrapper");
var util_1 = require("../../util");
/**
 * @title CoreWrapper
 * @author Set Protocol
 *
 * The Core API handles all functions on the Core SetProtocol smart contract.
 *
 */
var CoreWrapper = /** @class */ (function () {
    function CoreWrapper(web3, coreAddress, transferProxyAddress, vaultAddress) {
        this.web3 = web3;
        this.contracts = new ProtocolContractWrapper_1.ProtocolContractWrapper(this.web3);
        this.coreAddress = coreAddress;
        this.transferProxyAddress = transferProxyAddress;
        this.vaultAddress = vaultAddress;
    }
    /**
     * Create a new Set, specifying the components, units, name, symbol to use.
     *
     * @param  factoryAddress Set Token factory address of the token being created
     * @param  components     Component token addresses
     * @param  units          Units of corresponding token components
     * @param  naturalUnit    Supplied as the lowest common denominator for the Set
     * @param  name           User-supplied name for Set (i.e. "DEX Set")
     * @param  symbol         User-supplied symbol for Set (i.e. "DEX")
     * @param  callData       Additional call data used to create different Sets
     * @param  txOpts         The options for executing the transaction
     * @return                A transaction hash to then later look up for the Set address
     */
    CoreWrapper.prototype.create = function (factoryAddress, components, units, naturalUnit, name, symbol, callData, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, coreInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 2:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.createSet.sendTransactionAsync(factoryAddress, components, units, naturalUnit, set_protocol_utils_1.SetProtocolUtils.stringToBytes(name), set_protocol_utils_1.SetProtocolUtils.stringToBytes(symbol), callData, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously issues a particular quantity of tokens from a particular Sets
     *
     * @param  setAddress     Set token address of Set being issued
     * @param  quantity       Number of Sets a user wants to issue in base units
     * @param  txOpts         The options for executing the transaction
     * @return                A transaction hash to then later look up
     */
    CoreWrapper.prototype.issue = function (setAddress, quantity, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, coreInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 2:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.issue.sendTransactionAsync(setAddress, quantity, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously redeems a particular quantity of tokens from a particular Sets
     *
     * @param  setAddress     Set token address of Set being issued
     * @param  quantity       Number of Sets a user wants to redeem in base units
     * @param  txOpts         The options for executing the transaction
     * @return                A transaction hash to then later look up
     */
    CoreWrapper.prototype.redeem = function (setAddress, quantity, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, coreInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 2:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.redeem.sendTransactionAsync(setAddress, quantity, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Redeem and withdraw with a single transaction
     *
     * Normally, you should expect to be able to withdraw all of the tokens.
     * However, some have central abilities to freeze transfers (e.g. EOS). The parameter toExclude
     * allows you to optionally specify which component tokens to remain under the user's
     * address in the vault. The rest will be transferred to the user.
     *
     * @param  setAddress        The address of the Set token
     * @param  quantity          Number of Sets a user wants to redeem in base units
     * @param  toExclude         Bitmask of component indexes to exclude from withdrawal
     * @param  txOpts            The options for executing the transaction
     * @return                   A transaction hash to then later look up
     */
    CoreWrapper.prototype.redeemAndWithdrawTo = function (setAddress, quantity, toExclude, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, coreInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 2:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.redeemAndWithdrawTo.sendTransactionAsync(setAddress, txSettings.from, quantity, toExclude, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously deposits tokens to the vault
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @param  quantity      Number of tokens a user wants to deposit into the vault in base units
     * @param  txOpts        The options for executing the transaction
     * @return               A transaction hash
     */
    CoreWrapper.prototype.deposit = function (tokenAddress, quantity, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, coreInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 2:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.deposit.sendTransactionAsync(tokenAddress, quantity, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously withdraw tokens from the vault
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @param  quantity      Number of tokens a user wants to withdraw from the vault in base units
     * @param  txOpts        The options for executing the transaction
     * @return               A transaction hash
     */
    CoreWrapper.prototype.withdraw = function (tokenAddress, quantity, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, coreInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 2:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.withdraw.sendTransactionAsync(tokenAddress, quantity, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously batch deposits tokens to the vault
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens user wants to deposit into the vault
     * @param  quantities        Numbers of tokens a user wants to deposit into the vault in base units
     * @param  txOpts            The options for executing the transaction
     * @return                   A transaction hash
     */
    CoreWrapper.prototype.batchDeposit = function (tokenAddresses, quantities, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, coreInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 2:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.batchDeposit.sendTransactionAsync(tokenAddresses, quantities, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously batch withdraws tokens from the vault
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens user wants to withdraw from the vault
     * @param  quantities        Numbers of tokens a user wants to withdraw from the vault
     * @param  txOpts            The options for executing the transaction
     * @return                   A transaction hash
     */
    CoreWrapper.prototype.batchWithdraw = function (tokenAddresses, quantities, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, coreInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 2:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.batchWithdraw.sendTransactionAsync(tokenAddresses, quantities, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Asynchronously gets the exchange address for a given exhange id
     *
     * @param  exchangeId Enum id of the exchange
     * @return            An exchange address
     */
    CoreWrapper.prototype.exchangeIds = function (exchangeId) {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, exchangeAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.exchangeIds.callAsync(exchangeId)];
                    case 2:
                        exchangeAddress = _a.sent();
                        return [2 /*return*/, exchangeAddress];
                }
            });
        });
    };
    /**
     * Asynchronously gets the transfer proxy address
     *
     * @return Transfer proxy address
     */
    CoreWrapper.prototype.transferProxy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, transferProxyAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.transferProxy.callAsync()];
                    case 2:
                        transferProxyAddress = _a.sent();
                        return [2 /*return*/, transferProxyAddress];
                }
            });
        });
    };
    /**
     * Asynchronously gets the vault address
     *
     * @return Vault address
     */
    CoreWrapper.prototype.vault = function () {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, vaultAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.vault.callAsync()];
                    case 2:
                        vaultAddress = _a.sent();
                        return [2 /*return*/, vaultAddress];
                }
            });
        });
    };
    /**
     * Fetch the addresses of SetTokens and RebalancingSetTokens created by the system
     * of contracts specified in SetProtcolConfig
     *
     * @return Array of SetToken and RebalancingSetToken addresses
     */
    CoreWrapper.prototype.setTokens = function () {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, setAddresses;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.setTokens.callAsync()];
                    case 2:
                        setAddresses = _a.sent();
                        return [2 /*return*/, setAddresses];
                }
            });
        });
    };
    /**
     * Fetch the current Operation State of the protocol
     *
     * @return Operation state of the protocol
     */
    CoreWrapper.prototype.operationState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, operationState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.operationState.callAsync()];
                    case 2:
                        operationState = _a.sent();
                        return [2 /*return*/, operationState];
                }
            });
        });
    };
    /**
     * Verifies that the provided Module is enabled
     *
     * @param  moduleAddress  Address of the module contract
     * @return                Whether the module contract is enabled
     */
    CoreWrapper.prototype.validModules = function (moduleAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, isValidModule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.validModules.callAsync(moduleAddress)];
                    case 2:
                        isValidModule = _a.sent();
                        return [2 /*return*/, isValidModule];
                }
            });
        });
    };
    /**
     * Verifies that the provided price library is enabled
     *
     * @param  priceLibraryAddress  Address of the price library contract
     * @return                Whether the price library contract is enabled
     */
    CoreWrapper.prototype.validPriceLibrary = function (priceLibraryAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, isValidPriceLibrary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.validPriceLibraries.callAsync(priceLibraryAddress)];
                    case 2:
                        isValidPriceLibrary = _a.sent();
                        return [2 /*return*/, isValidPriceLibrary];
                }
            });
        });
    };
    /**
     * Verifies that the provided SetToken factory is enabled for creating a new SetToken
     *
     * @param  factoryAddress Address of the factory contract
     * @return                Whether the factory contract is enabled
     */
    CoreWrapper.prototype.validFactories = function (factoryAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, isValidFactoryAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.validFactories.callAsync(factoryAddress)];
                    case 2:
                        isValidFactoryAddress = _a.sent();
                        return [2 /*return*/, isValidFactoryAddress];
                }
            });
        });
    };
    /**
     * Verifies that the provided SetToken or RebalancingSetToken address is enabled
     * for issuance and redemption
     *
     * @param  setAddress Address of the SetToken or RebalancingSetToken contract
     * @return            Whether the contract is enabled
     */
    CoreWrapper.prototype.validSets = function (setAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, isValidSetAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.validSets.callAsync(setAddress)];
                    case 2:
                        isValidSetAddress = _a.sent();
                        return [2 /*return*/, isValidSetAddress];
                }
            });
        });
    };
    /**
     * Fetch the addresses of Modules enabled in the system.
     *
     * @return            A list of the enabled modules
     */
    CoreWrapper.prototype.modules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, modules;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.modules.callAsync()];
                    case 2:
                        modules = _a.sent();
                        return [2 /*return*/, modules];
                }
            });
        });
    };
    /**
     * Fetch the addresses of Factories enabled in the system.
     *
     * @return            A list of the enabled Factories
     */
    CoreWrapper.prototype.factories = function () {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, factories;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.factories.callAsync()];
                    case 2:
                        factories = _a.sent();
                        return [2 /*return*/, factories];
                }
            });
        });
    };
    /**
     * Fetch the addresses of Exchanges enabled in the system.
     *
     * @return            A list of the enabled Exchanges
     */
    CoreWrapper.prototype.exchanges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, exchanges;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.exchanges.callAsync()];
                    case 2:
                        exchanges = _a.sent();
                        return [2 /*return*/, exchanges];
                }
            });
        });
    };
    /**
     * Fetch the addresses of PriceLibraries enabled in the system.
     *
     * @return            A list of the enabled PriceLibraries
     */
    CoreWrapper.prototype.priceLibraries = function () {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, priceLibraries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadCoreAsync(this.coreAddress)];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.priceLibraries.callAsync()];
                    case 2:
                        priceLibraries = _a.sent();
                        return [2 /*return*/, priceLibraries];
                }
            });
        });
    };
    return CoreWrapper;
}());
exports.CoreWrapper = CoreWrapper;
//# sourceMappingURL=CoreWrapper.js.map