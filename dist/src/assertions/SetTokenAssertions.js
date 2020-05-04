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
var ERC20Assertions_1 = require("./ERC20Assertions");
var set_protocol_contracts_1 = require("set-protocol-contracts");
var errors_1 = require("../errors");
var constants_1 = require("../constants");
var SetTokenAssertions = /** @class */ (function () {
    function SetTokenAssertions(web3) {
        this.web3 = web3;
        this.erc20Assertions = new ERC20Assertions_1.ERC20Assertions(this.web3);
    }
    /**
     * Throws if the given candidateContract does not respond to some methods from the Set Token interface.
     *
     * @param  setTokenAddress  A Set Token contract address to check
     */
    SetTokenAssertions.prototype.implementsSetToken = function (setTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var setTokenInstance, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(setTokenAddress, this.web3, {})];
                    case 1:
                        setTokenInstance = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 10, , 11]);
                        return [4 /*yield*/, setTokenInstance.name.callAsync()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, setTokenInstance.totalSupply.callAsync()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, setTokenInstance.decimals.callAsync()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, setTokenInstance.naturalUnit.callAsync()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, setTokenInstance.symbol.callAsync()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, setTokenInstance.getComponents.callAsync()];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, setTokenInstance.getUnits.callAsync()];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        error_1 = _a.sent();
                        throw new Error(errors_1.setTokenAssertionsErrors.IS_NOT_A_VALID_SET(setTokenAddress));
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if the given user doesn't have a sufficient balance for a component token in a Set
     *
     * @param  setTokenAddress  The address of the Set Token contract
     * @param  ownerAddress     The address of the owner
     * @param  quantity         Amount of a Set in base units
     * @param  exclusions       The addresses to exclude from checking
     */
    SetTokenAssertions.prototype.hasSufficientBalances = function (setTokenAddress, ownerAddress, quantity, exclusions) {
        if (exclusions === void 0) { exclusions = []; }
        return __awaiter(this, void 0, void 0, function () {
            var setTokenInstance, components, componentsFilteredForExclusions, units, naturalUnit, componentInstancePromises, componentInstances, userHasSufficientBalancePromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(setTokenAddress, this.web3, {})];
                    case 1:
                        setTokenInstance = _a.sent();
                        return [4 /*yield*/, setTokenInstance.getComponents.callAsync()];
                    case 2:
                        components = _a.sent();
                        componentsFilteredForExclusions = _.difference(components, exclusions);
                        return [4 /*yield*/, setTokenInstance.getUnits.callAsync()];
                    case 3:
                        units = _a.sent();
                        return [4 /*yield*/, setTokenInstance.naturalUnit.callAsync()];
                    case 4:
                        naturalUnit = _a.sent();
                        componentInstancePromises = _.map(componentsFilteredForExclusions, function (component) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, set_protocol_contracts_1.ERC20DetailedContract.at(component, this.web3, { from: ownerAddress })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); });
                        return [4 /*yield*/, Promise.all(componentInstancePromises)];
                    case 5:
                        componentInstances = _a.sent();
                        userHasSufficientBalancePromises = _.map(componentInstances, function (componentInstance, index) { return __awaiter(_this, void 0, void 0, function () {
                            var requiredBalance;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        requiredBalance = units[index].div(naturalUnit).times(quantity);
                                        return [4 /*yield*/, this.erc20Assertions.hasSufficientBalanceAsync(componentInstance.address, ownerAddress, requiredBalance)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(userHasSufficientBalancePromises)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Throws if the given user doesn't have a sufficient allowance for a component token in a Set
     *
     * @param  setTokenAddress  The address of the Set Token contract
     * @param  ownerAddress     The address of the owner
     * @param  quantity         Amount of a Set in base units
     */
    SetTokenAssertions.prototype.hasSufficientAllowances = function (setTokenAddress, ownerAddress, spenderAddress, quantity, exclusions) {
        if (exclusions === void 0) { exclusions = []; }
        return __awaiter(this, void 0, void 0, function () {
            var setTokenInstance, components, units, naturalUnit, componentsFilteredForExclusions, componentInstancePromises, componentInstances, userHasSufficientAllowancePromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(setTokenAddress, this.web3, {})];
                    case 1:
                        setTokenInstance = _a.sent();
                        return [4 /*yield*/, setTokenInstance.getComponents.callAsync()];
                    case 2:
                        components = _a.sent();
                        return [4 /*yield*/, setTokenInstance.getUnits.callAsync()];
                    case 3:
                        units = _a.sent();
                        return [4 /*yield*/, setTokenInstance.naturalUnit.callAsync()];
                    case 4:
                        naturalUnit = _a.sent();
                        componentsFilteredForExclusions = _.difference(components, exclusions);
                        componentInstancePromises = _.map(componentsFilteredForExclusions, function (component) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, set_protocol_contracts_1.ERC20DetailedContract.at(component, this.web3, { from: ownerAddress })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); });
                        return [4 /*yield*/, Promise.all(componentInstancePromises)];
                    case 5:
                        componentInstances = _a.sent();
                        userHasSufficientAllowancePromises = _.map(componentInstances, function (componentInstance, index) { return __awaiter(_this, void 0, void 0, function () {
                            var requiredBalance;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        requiredBalance = units[index].div(naturalUnit).times(quantity);
                                        return [4 /*yield*/, this.erc20Assertions.hasSufficientAllowanceAsync(componentInstance.address, ownerAddress, spenderAddress, requiredBalance)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(userHasSufficientAllowancePromises)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SetTokenAssertions.prototype.isMultipleOfNaturalUnit = function (setTokenAddress, quantity, quantityType) {
        return __awaiter(this, void 0, void 0, function () {
            var setTokenInstance, naturalUnit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(setTokenAddress, this.web3, {})];
                    case 1:
                        setTokenInstance = _a.sent();
                        return [4 /*yield*/, setTokenInstance.naturalUnit.callAsync()];
                    case 2:
                        naturalUnit = _a.sent();
                        if (!quantity.mod(naturalUnit).eq(constants_1.ZERO)) {
                            throw new Error(errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_MULTIPLE_OF_NATURAL_UNIT(quantityType));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SetTokenAssertions.prototype.isComponent = function (setTokenAddress, componentAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var setTokenInstance, isComponent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(setTokenAddress, this.web3, {})];
                    case 1:
                        setTokenInstance = _a.sent();
                        return [4 /*yield*/, setTokenInstance.tokenIsComponent.callAsync(componentAddress)];
                    case 2:
                        isComponent = _a.sent();
                        if (!isComponent) {
                            throw new Error(errors_1.setTokenAssertionsErrors.IS_NOT_COMPONENT(setTokenAddress, componentAddress));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SetTokenAssertions.prototype.isValidSetToken = function (coreAddress, setTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var coreInstance, isValidSet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, set_protocol_contracts_1.CoreContract.at(coreAddress, this.web3, {})];
                    case 1:
                        coreInstance = _a.sent();
                        return [4 /*yield*/, coreInstance.validSets.callAsync(setTokenAddress)];
                    case 2:
                        isValidSet = _a.sent();
                        if (!isValidSet) {
                            throw new Error(errors_1.setTokenAssertionsErrors.IS_NOT_A_VALID_SET(setTokenAddress));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return SetTokenAssertions;
}());
exports.SetTokenAssertions = SetTokenAssertions;
//# sourceMappingURL=SetTokenAssertions.js.map