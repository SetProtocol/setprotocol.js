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
var set_protocol_contracts_1 = require("set-protocol-contracts");
var VaultAssertions = /** @class */ (function () {
    function VaultAssertions(web3) {
        this.web3 = web3;
    }
    /**
     * Throws if the Vault doesn't have enough of token
     *
     * @param  vaultAddress     The address of the Vault contract
     * @param  tokenAddress     The address of the Set token contract
     * @param  ownerAddress     Address of owner withdrawing from vault
     * @param  quantity         Amount of a Set in base units
     * @return                  Void Promise
     */
    VaultAssertions.prototype.hasSufficientTokenBalance = function (vaultAddress, tokenAddress, ownerAddress, quantity) {
        return __awaiter(this, void 0, void 0, function () {
            var vaultContract, ownerBalance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.VaultContract.at(vaultAddress, this.web3, {})];
                    case 1:
                        vaultContract = _a.sent();
                        return [4 /*yield*/, vaultContract.getOwnerBalance.callAsync(tokenAddress, ownerAddress)];
                    case 2:
                        ownerBalance = _a.sent();
                        if (ownerBalance.lt(quantity)) {
                            throw new Error(errors_1.vaultAssertionErrors.INSUFFICIENT_TOKEN_BALANCE());
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if the Set doesn't have a sufficient balance for its tokens in the Vault
     *
     * @param  vaultAddress     The address of the Vault contract
     * @param  setAddress       The address of the Set token contract
     * @param  quantity         Amount of a Set in base units
     * @return                  Void Promise
     */
    VaultAssertions.prototype.hasSufficientSetTokensBalances = function (vaultAddress, setTokenAddress, quantity) {
        return __awaiter(this, void 0, void 0, function () {
            var vaultInstance, setTokenInstance, components, units, naturalUnit, setAddress, componentInstancePromises, componentInstances, setHasSufficientBalancePromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.VaultContract.at(vaultAddress, this.web3, {})];
                    case 1:
                        vaultInstance = _a.sent();
                        return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(setTokenAddress, this.web3, {})];
                    case 2:
                        setTokenInstance = _a.sent();
                        return [4 /*yield*/, setTokenInstance.getComponents.callAsync()];
                    case 3:
                        components = _a.sent();
                        return [4 /*yield*/, setTokenInstance.getUnits.callAsync()];
                    case 4:
                        units = _a.sent();
                        return [4 /*yield*/, setTokenInstance.naturalUnit.callAsync()];
                    case 5:
                        naturalUnit = _a.sent();
                        setAddress = setTokenInstance.address;
                        componentInstancePromises = _.map(components, function (component) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, set_protocol_contracts_1.ERC20DetailedContract.at(component, this.web3, { from: setAddress })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); });
                        return [4 /*yield*/, Promise.all(componentInstancePromises)];
                    case 6:
                        componentInstances = _a.sent();
                        setHasSufficientBalancePromises = _.map(componentInstances, function (componentInstance, index) { return __awaiter(_this, void 0, void 0, function () {
                            var requiredBalance, ownerBalance;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        requiredBalance = units[index].div(naturalUnit).times(quantity);
                                        return [4 /*yield*/, vaultInstance.getOwnerBalance.callAsync(componentInstance.address, setAddress)];
                                    case 1:
                                        ownerBalance = _a.sent();
                                        if (ownerBalance.lt(requiredBalance)) {
                                            throw new Error(errors_1.vaultAssertionErrors.INSUFFICIENT_SET_TOKENS_BALANCE());
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(setHasSufficientBalancePromises)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return VaultAssertions;
}());
exports.VaultAssertions = VaultAssertions;
//# sourceMappingURL=VaultAssertions.js.map