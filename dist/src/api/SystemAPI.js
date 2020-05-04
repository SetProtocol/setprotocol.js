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
 * @title SystemAPI
 * @author Set Protocol
 *
 * A library for interacting with admin portions of Set Protocol system
 */
var SystemAPI = /** @class */ (function () {
    /**
     * Instantiates a new SystemAPI instance that contains methods for viewing the system-related state of
     * the protocol
     *
     * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param core        An instance of CoreWrapper to interact with the deployed Core contract
     */
    function SystemAPI(web3, core, config) {
        this.web3 = web3;
        this.core = core;
        this.contract = new wrappers_1.ProtocolContractWrapper(web3);
        this.config = config;
        this.authorizable = new wrappers_1.AuthorizableWrapper(web3);
        this.timeLockUpgrade = new wrappers_1.TimeLockUpgradeWrapper(web3);
        this.whitelist = new wrappers_1.WhitelistWrapper(web3);
        this.addressToAddressWhiteList = new wrappers_1.AddressToAddressWhiteListWrapper(web3);
    }
    /**
     * Fetches the operational state of Set Protocol. 0 is operational. 1 is shut down.
     *
     * @return               Operational State represented as a number
     */
    SystemAPI.prototype.getOperationStateAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.core.operationState()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the authorizable addresses of the transfer proxy and vault.
     *
     * @return               System Authorizable state object
     */
    SystemAPI.prototype.getSystemAuthorizableStateAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, transferProxyAuthorizable, vaultAuthorizable;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.authorizable.getAuthorizedAddresses(this.core.transferProxyAddress),
                            this.authorizable.getAuthorizedAddresses(this.core.vaultAddress),
                        ])];
                    case 1:
                        _a = _b.sent(), transferProxyAuthorizable = _a[0], vaultAuthorizable = _a[1];
                        return [2 /*return*/, {
                                transferProxy: transferProxyAuthorizable,
                                vault: vaultAuthorizable,
                            }];
                }
            });
        });
    };
    /**
     * Fetches the time lock periods of the contracts that have time lock upgrade functions.
     * These contracts include core, vault, transfer proxy, and issuance order module.
     *
     * @return               Object containing the current time lock periods.
     */
    SystemAPI.prototype.getSystemTimeLockPeriodsAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, coreInstance, vaultInstance, transferProxyInstance, _b, coreOwner, vaultOwner, transferProxyOwner;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.contract.loadCoreAsync(this.config.coreAddress),
                            this.contract.loadVaultAsync(this.config.vaultAddress),
                            this.contract.loadTransferProxyAsync(this.config.transferProxyAddress),
                        ])];
                    case 1:
                        _a = _c.sent(), coreInstance = _a[0], vaultInstance = _a[1], transferProxyInstance = _a[2];
                        return [4 /*yield*/, Promise.all([
                                coreInstance.timeLockPeriod.callAsync(),
                                vaultInstance.timeLockPeriod.callAsync(),
                                transferProxyInstance.timeLockPeriod.callAsync(),
                            ])];
                    case 2:
                        _b = _c.sent(), coreOwner = _b[0], vaultOwner = _b[1], transferProxyOwner = _b[2];
                        return [2 /*return*/, {
                                core: coreOwner,
                                vault: vaultOwner,
                                transferProxy: transferProxyOwner,
                            }];
                }
            });
        });
    };
    /**
     * Fetches time lock upgrade hash given a transaction hash. The timelock upgrade hash
     * is composed of the msg.data of a transaction. It is the first four bytes of the function
     * appended with the call data.
     *
     * @param transactionHash    The hash of the upgrade proposal transaction
     * @return               The hash of the time lock upgrade hash
     */
    SystemAPI.prototype.getTimeLockUpgradeHashAsync = function (transactionHash) {
        return __awaiter(this, void 0, void 0, function () {
            var input, subjectTimeLockUpgradeHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.web3.eth.getTransaction(transactionHash)];
                    case 1:
                        input = (_a.sent()).input;
                        subjectTimeLockUpgradeHash = this.web3.utils.soliditySha3(input);
                        return [2 /*return*/, subjectTimeLockUpgradeHash];
                }
            });
        });
    };
    /**
     * Fetches time lock upgrade initialization timestamp based on contract address and timelock upgrade hash.
     *
     * @param contractAddress        The hash of the upgrade proposal transaction
     * @param timeLockUpgradeHash    The hash of the time lock upgrade hash
     * @return               Timestamp that the upgrade was initiated
     */
    SystemAPI.prototype.getTimeLockedUpgradeInitializationAsync = function (contractAddress, timeLockUpgradeHash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.timeLockUpgrade.timeLockedUpgrades(contractAddress, timeLockUpgradeHash)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the owners of the system.
     * These contracts include core, vault, transfer proxy, and issuance order module.
     *
     * @return               Object containing the contract owners.
     */
    SystemAPI.prototype.getSystemOwnersAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, coreInstance, vaultInstance, transferProxyInstance, _b, coreOwner, vaultOwner, transferProxyOwner;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.contract.loadCoreAsync(this.config.coreAddress),
                            this.contract.loadVaultAsync(this.config.vaultAddress),
                            this.contract.loadTransferProxyAsync(this.config.transferProxyAddress),
                        ])];
                    case 1:
                        _a = _c.sent(), coreInstance = _a[0], vaultInstance = _a[1], transferProxyInstance = _a[2];
                        return [4 /*yield*/, Promise.all([
                                coreInstance.owner.callAsync(),
                                vaultInstance.owner.callAsync(),
                                transferProxyInstance.owner.callAsync(),
                            ])];
                    case 2:
                        _b = _c.sent(), coreOwner = _b[0], vaultOwner = _b[1], transferProxyOwner = _b[2];
                        return [2 /*return*/, {
                                core: coreOwner,
                                vault: vaultOwner,
                                transferProxy: transferProxyOwner,
                            }];
                }
            });
        });
    };
    /**
     * Fetches a list of whitelisted addresses on the whitelist contract.
     *
     * @param whitelistAddress    The address of the whitelist contract
     * @return               An array of whitelisted addresses
     */
    SystemAPI.prototype.getWhitelistedAddressesAsync = function (whitelistAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.whitelist.validAddresses(whitelistAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches value type addresses from keys on an AddressToAddressWhiteList contract.
     *
     * @param whitelistAddress    The address of the whitelist contract
     * @param keys                The array of key type addresses
     * @return                    An array of value type addresses
     */
    SystemAPI.prototype.getWhitelistedValuesAsync = function (whitelistAddress, keys) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addressToAddressWhiteList.getValues(whitelistAddress, keys)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetch the addresses of Modules enabled in the system.
     *
     * @return            A list of the enabled modules
     */
    SystemAPI.prototype.getModulesAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.core.modules()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetch the addresses of Factories enabled in the system.
     *
     * @return            A list of the enabled Factories
     */
    SystemAPI.prototype.getFactoriesAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.core.factories()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /*
     * Fetch the addresses of Exchanges enabled in the system.
     *
     * @return            A list of the enabled Exchanges
     */
    SystemAPI.prototype.getExchangesAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.core.exchanges()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetch the addresses of PriceLibraries enabled in the system.
     *
     * @return            A list of the enabled PriceLibraries
     */
    SystemAPI.prototype.getPriceLibrariesAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.core.priceLibraries()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return SystemAPI;
}());
exports.SystemAPI = SystemAPI;
//# sourceMappingURL=SystemAPI.js.map