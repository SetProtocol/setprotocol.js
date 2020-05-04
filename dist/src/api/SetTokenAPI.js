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
var constants_1 = require("../constants");
var errors_1 = require("../errors");
var wrappers_1 = require("../wrappers");
var util_1 = require("../util");
/**
 * @title SetTokenAPI
 * @author Set Protocol
 *
 * A library for interacting with SetToken contracts
 */
var SetTokenAPI = /** @class */ (function () {
    /**
     * Instantiates a new SetTokenAPI instance that contains methods for interacting with SetToken contracts
     *
     * @param web3        Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param assertions  An instance of the Assertion library
     */
    function SetTokenAPI(web3, assertions) {
        this.web3 = web3;
        this.assert = assertions;
        this.erc20 = new wrappers_1.ERC20Wrapper(this.web3);
        this.setToken = new wrappers_1.SetTokenWrapper(this.web3);
    }
    /**
     * Calculates the required amount of a component token required for issuance or redemption for a quantity of the Set
     *
     * @param  setAddress          Address of the Set
     * @param  componentAddress    Address of the component
     * @param  quantity            Quantity of Set to issue or redeem
     * @return                     Amount of `componentAddress` required for issuance or redemption
     */
    SetTokenAPI.prototype.calculateComponentAmountForIssuanceAsync = function (setAddress, componentAddress, quantity) {
        return __awaiter(this, void 0, void 0, function () {
            var components, componentIndex, amountsForIssuance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertCalculateUnitTransferred(setAddress, componentAddress, quantity)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setToken.getComponents(setAddress)];
                    case 2:
                        components = _a.sent();
                        componentIndex = _.indexOf(components, componentAddress);
                        return [4 /*yield*/, this.calculateComponentAmountsForIssuanceAsync(setAddress, quantity)];
                    case 3:
                        amountsForIssuance = _a.sent();
                        return [2 /*return*/, amountsForIssuance[componentIndex].unit];
                }
            });
        });
    };
    /**
     * Calculates the amounts of each component required for issuance or redemption for a quantity of the Set
     *
     * @param  setAddress     Address of the Set
     * @param  quantity       Quantity of Set to issue or redeem
     * @return                List of objects conforming to `Component` interface with addresses and amounts required for
     *                          issuance or redemption
     */
    SetTokenAPI.prototype.calculateComponentAmountsForIssuanceAsync = function (setAddress, quantity) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, naturalUnit, componentUnits, components;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.assertcalculateComponentAmountsForIssuance(setAddress, quantity);
                        return [4 /*yield*/, Promise.all([
                                this.setToken.naturalUnit(setAddress),
                                this.setToken.getUnits(setAddress),
                                this.setToken.getComponents(setAddress),
                            ])];
                    case 1:
                        _a = _b.sent(), naturalUnit = _a[0], componentUnits = _a[1], components = _a[2];
                        return [2 /*return*/, _.map(componentUnits, function (componentUnit, index) {
                                return {
                                    address: components[index],
                                    unit: util_1.calculatePartialAmount(componentUnit, quantity, naturalUnit),
                                };
                            })];
                }
            });
        });
    };
    /**
     * Fetches the address of the factory that created the Set
     *
     * @param  setAddress    Address of the Set
     * @return               Address of the factory that ceated the Set
     */
    SetTokenAPI.prototype.getFactoryAsync = function (setAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('setAddress', setAddress);
                        return [4 /*yield*/, this.setToken.factory(setAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the addresses of the component tokens that make up the Set
     *
     * @param  setAddress    Address of the Set
     * @return               An array of token addresses
     */
    SetTokenAPI.prototype.getComponentsAsync = function (setAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('setAddress', setAddress);
                        return [4 /*yield*/, this.setToken.getComponents(setAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the natural unit of the Set
     *
     * @param  setAddress    Address of the Set
     * @return               Natural unit of the Set
     */
    SetTokenAPI.prototype.getNaturalUnitAsync = function (setAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('setAddress', setAddress);
                        return [4 /*yield*/, this.setToken.naturalUnit(setAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches units of each component token that make up the Set
     *
     * @param  setAddress    Address of the Set
     * @return               An array of units that make up the Set composition which correspond to the component tokens
     *                         in the Set
     */
    SetTokenAPI.prototype.getUnitsAsync = function (setAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('setAddress', setAddress);
                        return [4 /*yield*/, this.setToken.getUnits(setAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches details of a Set comprised of factory address, name, symbol, natural unit, component addresses,
     * and component units
     *
     * @param  setAddress    Address of the Set
     * @return               Object conforming to `SetDetails` interface
     */
    SetTokenAPI.prototype.getDetailsAsync = function (setAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, factoryAddress, naturalUnit, componentAddresses, componentUnits, name, symbol, components;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.assert.schema.isValidAddress('setAddress', setAddress);
                        return [4 /*yield*/, Promise.all([
                                this.setToken.factory(setAddress),
                                this.setToken.naturalUnit(setAddress),
                                this.setToken.getComponents(setAddress),
                                this.setToken.getUnits(setAddress),
                                this.erc20.name(setAddress),
                                this.erc20.symbol(setAddress),
                            ])];
                    case 1:
                        _a = _b.sent(), factoryAddress = _a[0], naturalUnit = _a[1], componentAddresses = _a[2], componentUnits = _a[3], name = _a[4], symbol = _a[5];
                        components = componentAddresses.map(function (address, idx) {
                            return { address: address, unit: componentUnits[idx] };
                        });
                        return [2 /*return*/, {
                                address: setAddress,
                                factoryAddress: factoryAddress,
                                name: name,
                                symbol: symbol,
                                naturalUnit: naturalUnit,
                                components: components,
                            }];
                }
            });
        });
    };
    /**
     * Validates whether the quantity of a Set to issue or redeem in is a multiple of the Set's natural unit
     *
     * @param  setAddress    Address of the Set
     * @param  quantity      Quantity to be checked
     * @return boolean       Boolean representing whether the Set is a multiple of the natural unit
     *
     */
    SetTokenAPI.prototype.isMultipleOfNaturalUnitAsync = function (setAddress, quantity) {
        return __awaiter(this, void 0, void 0, function () {
            var naturalUnit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertIsMultipleOfNaturalUnitAsync(setAddress, quantity);
                        return [4 /*yield*/, this.setToken.naturalUnit(setAddress)];
                    case 1:
                        naturalUnit = _a.sent();
                        return [2 /*return*/, quantity.mod(naturalUnit).eq(constants_1.ZERO)];
                }
            });
        });
    };
    /* ============ Private Assertions ============ */
    SetTokenAPI.prototype.assertIsMultipleOfNaturalUnitAsync = function (setAddress, quantity) {
        this.assert.schema.isValidAddress('setAddress', setAddress);
        this.assert.common.greaterThanZero(quantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
    };
    SetTokenAPI.prototype.assertcalculateComponentAmountsForIssuance = function (setAddress, quantity) {
        this.assert.schema.isValidAddress('setAddress', setAddress);
        this.assert.common.greaterThanZero(quantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
    };
    SetTokenAPI.prototype.assertCalculateUnitTransferred = function (setAddress, componentAddress, quantity) {
        return __awaiter(this, void 0, void 0, function () {
            var componentAddresses, componentIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('setAddress', setAddress);
                        this.assert.schema.isValidAddress('componentAddress', componentAddress);
                        this.assert.common.greaterThanZero(quantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
                        return [4 /*yield*/, this.setToken.getComponents(setAddress)];
                    case 1:
                        componentAddresses = _a.sent();
                        componentIndex = _.indexOf(componentAddresses, componentAddress);
                        if (componentIndex < 0) {
                            throw new Error(errors_1.setTokenAssertionsErrors.IS_NOT_COMPONENT(setAddress, componentAddress));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return SetTokenAPI;
}());
exports.SetTokenAPI = SetTokenAPI;
//# sourceMappingURL=SetTokenAPI.js.map