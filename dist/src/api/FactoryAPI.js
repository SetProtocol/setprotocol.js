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
var set_protocol_utils_1 = require("set-protocol-utils");
var constants_1 = require("../constants");
var errors_1 = require("../errors");
var wrappers_1 = require("../wrappers");
var util_1 = require("../util");
/**
 * @title FactoryAPI
 * @author Set Protocol
 *
 * A library for deploying new Set contracts
 */
var FactoryAPI = /** @class */ (function () {
    /**
     * Instantiates a new FactoryAPI instance that contains methods for creating new Sets
     *
     * @param web3                      Web3.js Provider instance you would like the SetProtocol.js library to use
     *                                    for interacting with the Ethereum network
     * @param core                      An instance of CoreWrapper to interact with the deployed Core contract
     * @param assertions                An instance of the Assertion library
     * @param config                    Object conforming to SetProtocolConfig interface with contract addresses
     */
    function FactoryAPI(web3, core, assertions, config) {
        this.web3 = web3;
        this.core = core;
        this.erc20 = new wrappers_1.ERC20Wrapper(this.web3);
        this.assert = assertions;
        this.rebalancingSetTokenFactoryAddress = config.rebalancingSetTokenFactoryAddress;
        this.setTokenFactoryAddress = config.setTokenFactoryAddress;
    }
    /**
     * Calculates the minimum allowable natural unit for a list of ERC20 component addresses
     *
     * @param components        List of ERC20 token addresses to use for Set creation
     * @return                  Minimum natural unit allowed
     */
    FactoryAPI.prototype.calculateMinimumNaturalUnitAsync = function (components) {
        return __awaiter(this, void 0, void 0, function () {
            var minimumDecimal, decimals, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all(_.map(components, function (component) { return _this.erc20.decimals(component); }))];
                    case 1:
                        decimals = _a.sent();
                        minimumDecimal = util_1.BigNumber.min(decimals);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        // If any of the conponent addresses does not implement decimals(),
                        // we set minimumDecimal to 0 so that minimum natural unit will be 10 ** 18
                        minimumDecimal = constants_1.ZERO;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, this.calculateNaturalUnit(minimumDecimal)];
                }
            });
        });
    };
    /**
     * Helper for `calculateSetUnits` when a list of decimals is not available and needs to be fetched. Calculates unit
     * and naturalUnit inputs for `createSetAsync` for a given list of ERC20 token addreses, proportions of each, current
     * token prices, and target Set price
     *
     * @param components      List of ERC20 token addresses to use for Set creation
     * @param prices          List of current prices for the components in index order
     * @param proportions     Decimal-formatted allocations in index order. Must add up to 1
     * @param targetPrice     Target fiat-denominated price of a single natural unit of the Set
     * @param percentError    Allowable price error percentage of resulting Set price from the target price
     * @return                Object conforming to `SetUnits` containing a list of component units in index order and a
     *                          valid natural unit. These properties can be passed directly into `createSetAsync`
     */
    FactoryAPI.prototype.calculateSetUnitsAsync = function (components, prices, proportions, targetPrice, percentError) {
        if (percentError === void 0) { percentError = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var decimals;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getComponentsDecimalsAsync(components)];
                    case 1:
                        decimals = _a.sent();
                        return [2 /*return*/, this.calculateSetUnits(components, decimals, prices, proportions, targetPrice, percentError)];
                }
            });
        });
    };
    /**
     * Calculates unit and naturalUnit inputs for `createSetAsync` for a given list of ERC20 token addreses, their
     * decimals, proportions of each, current token prices, and target Set price
     *
     * @param components      List of ERC20 token addresses to use for Set creation
     * @param decimals        List of decimals for the components in index order
     * @param prices          List of current prices for the components in index order
     * @param proportions     Decimal-formatted allocations in index order. Must add up to 1
     * @param targetPrice     Target fiat-denominated price of a single natural unit of the Set
     * @param percentError    Allowable price error percentage of resulting Set price from the target price
     * @return                Object conforming to `SetUnits` containing a list of component units in index order and a
     *                          valid natural unit. These properties can be passed directly into `createSetAsync`
     */
    FactoryAPI.prototype.calculateSetUnits = function (components, decimals, prices, proportions, targetPrice, percentError) {
        if (percentError === void 0) { percentError = 10; }
        this.assertCalculateCreateUnitInputs(components, prices, proportions);
        var requiredComponentUnits = this.calculateRequiredComponentUnits(components, decimals, prices, proportions, targetPrice);
        var minimumUnitExponent = new util_1.BigNumber(util_1.BigNumber.min(requiredComponentUnits).e);
        var naturalUnitExponent = constants_1.UINT256(18).sub(minimumUnitExponent);
        var derivedNaturalUnit = constants_1.UINT256(10).pow(naturalUnitExponent.toNumber());
        var minimumDecimal = util_1.BigNumber.min(decimals);
        var minimumNaturalUnit = this.calculateNaturalUnit(minimumDecimal);
        var naturalUnit = util_1.BigNumber.max(minimumNaturalUnit, derivedNaturalUnit);
        var formattedComponentUnits;
        var priorPercentError = constants_1.E18; // Start with a large percentage figure
        var errorPercentage;
        // If the percentage error from the naturalUnit and units combination is greater
        // than the max allowable error, we attempt to improve the precision by increasing
        // the naturalUnit and recalculating the component units.
        while (true) {
            formattedComponentUnits = requiredComponentUnits.map(function (amountRequired) {
                return amountRequired
                    .mul(naturalUnit)
                    .div(util_1.ether(1))
                    .ceil();
            });
            var impliedSetPrice = this.calculateSetPrice(formattedComponentUnits, naturalUnit, prices, decimals);
            errorPercentage = util_1.calculatePercentDifference(impliedSetPrice, targetPrice);
            // Only continue to experiment with improvements if the following conditions are met:
            // 1. The Percent error is still greater than the maximum allowable error
            // 2. Increasing the natural unit helps with improving precision
            var error = new util_1.BigNumber(percentError).div(100);
            if (errorPercentage.gt(error) && errorPercentage.lt(priorPercentError)) {
                naturalUnit = naturalUnit.mul(constants_1.UINT256(10));
                priorPercentError = errorPercentage;
            }
            else {
                return {
                    units: formattedComponentUnits,
                    naturalUnit: naturalUnit,
                };
            }
        }
    };
    /**
     * Create a new Set by passing in parameters denoting component token addresses, quantities, natural
     * unit, and ERC20 properties
     *
     * Note: the return value is the transaction hash of the createSetAsync call, not the deployed SetToken
     * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the SetToken address
     *
     * @param  components     Component ERC20 token addresses
     * @param  units          Units of each component in Set paired in index order
     * @param  naturalUnit    Lowest common denominator for the Set
     * @param  name           Name for Set, i.e. "DEX Set"
     * @param  symbol         Symbol for Set, i.e. "DEX"
     * @param  txOpts         Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                Transaction hash
     */
    FactoryAPI.prototype.createSetAsync = function (components, units, naturalUnit, name, symbol, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertCreateSet(txOpts.from, this.setTokenFactoryAddress, components, units, naturalUnit, name, symbol)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.core.create(this.setTokenFactoryAddress, components, units, naturalUnit, name, symbol, '0x0', txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Create a new Rebalancing token by passing in parameters denoting a Set to track, the manager, and various
     * rebalancing properties to facilitate rebalancing events
     *
     * Note: the return value is the transaction hash of the createRebalancingSetTokenAsync call, not the deployed Token
     * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the SetToken address
     *
     * @param  manager              Address of account to propose, rebalance, and settle the Rebalancing token
     * @param  initialSet           Address of the Set the Rebalancing token is initially tracking
     * @param  initialUnitShares    Ratio between balance of this Rebalancing token and the currently tracked Set
     * @param  proposalPeriod       Duration after a manager proposes a new Set to rebalance into when users who wish to
     *                                pull out may redeem their balance of the RebalancingSetToken for balance of the Set
     *                                denominated in seconds
     * @param  rebalanceInterval    Duration after a rebalance is completed when the manager cannot initiate a new
     *                                Rebalance event
     * @param  name                 Name for RebalancingSet, i.e. "Top 10"
     * @param  symbol               Symbol for Set, i.e. "TOP10"
     * @param  txOpts               Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                      Transaction hash
     */
    FactoryAPI.prototype.createRebalancingSetTokenAsync = function (manager, initialSet, initialUnitShares, proposalPeriod, rebalanceInterval, name, symbol, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var callData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertCreateRebalancingSet(txOpts.from, this.setTokenFactoryAddress, initialSet, initialUnitShares, proposalPeriod, rebalanceInterval, name, symbol)];
                    case 1:
                        _a.sent();
                        callData = set_protocol_utils_1.SetProtocolUtils.generateRebalancingSetTokenCallData(manager, proposalPeriod, rebalanceInterval);
                        return [4 /*yield*/, this.core.create(this.rebalancingSetTokenFactoryAddress, [initialSet], [initialUnitShares], constants_1.DEFAULT_REBALANCING_NATURAL_UNIT, name, symbol, callData, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetch a Set Token address from a createSetAsync transaction hash
     *
     * @param  txHash    Transaction hash of the createSetAsync transaction
     * @return           Address of the newly created Set
     */
    FactoryAPI.prototype.getSetAddressFromCreateTxHash = function (txHash) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionLogs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidBytes32('txHash', txHash);
                        return [4 /*yield*/, util_1.getFormattedLogsFromTxHash(this.web3, txHash)];
                    case 1:
                        transactionLogs = _a.sent();
                        return [2 /*return*/, util_1.extractNewSetTokenAddressFromLogs(transactionLogs)];
                }
            });
        });
    };
    /* ============ Private Function ============ */
    /**
     * Fetch the component decimals from the chain
     *
     * @param componentAddresses    List of ERC20 token addresses
     * @return                      List of component decimals
     */
    FactoryAPI.prototype.getComponentsDecimalsAsync = function (componentAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var componentDecimalPromises;
            var _this = this;
            return __generator(this, function (_a) {
                componentDecimalPromises = _.map(componentAddresses, function (componentAddress) { return __awaiter(_this, void 0, void 0, function () {
                    var componentDecimals;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.getComponentDecimals(componentAddress)];
                            case 1:
                                componentDecimals = _a.sent();
                                return [2 /*return*/, componentDecimals];
                        }
                    });
                }); });
                return [2 /*return*/, Promise.all(componentDecimalPromises)];
            });
        });
    };
    /**
     * Fetch the decimals for one ERC20 token
     *
     * @param componentAddress    ERC20 token addresses
     * @return                    Token decimals
     */
    FactoryAPI.prototype.getComponentDecimals = function (componentAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var componentDecimals, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.erc20.decimals(componentAddress)];
                    case 1:
                        componentDecimals = (_a.sent()).toNumber();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        componentDecimals = 18;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, componentDecimals];
                }
            });
        });
    };
    /**
     * Calculates the target amount of tokens required for a Set with a target price
     *
     * @param components     List of ERC20 token addresses to use for Set creation
     * @param decimals       List of decimals for the components in index order
     * @param prices         List of current prices for the components in index order
     * @param proportions    Decimal-formatted allocations in index order. Must add up to 1
     * @param targetPrice    Target fiat-denominated price of a single natural unit of the Set
     * @return               Returns array of BigNumbers representing the minimum required units
     */
    FactoryAPI.prototype.calculateRequiredComponentUnits = function (components, decimals, prices, proportions, targetPrice) {
        var targetComponentValues = proportions.map(function (decimalAllocation) {
            return decimalAllocation.mul(targetPrice);
        });
        // Dividing the target component price with the price of a component and then multiply by
        // the token's base unit amount (10 ** componentDecimal) to get it in base units.
        return _.map(targetComponentValues, function (targetComponentValue, i) {
            var componentDecimals = decimals[i];
            var numComponentsRequired = targetComponentValue.div(prices[i]);
            var standardComponentUnit = new util_1.BigNumber(10).pow(componentDecimals);
            return numComponentsRequired.mul(standardComponentUnit);
        });
    };
    /**
     * Calculate a Set price for given component and Set properties. This is used to verify the total Set price
     * when assigning a natural unit to a list of components
     *
     * @param componentUnits    List of ERC20 token addresses to use for Set creation in index order
     * @param naturalUnit       Proposed natural unit for the component units
     * @param prices            Current price of the component tokens in index order
     * @param targetPrice       Target fiat-denominated price of a single natural unit of the Set
     * @return                  Returns the calculcated price from all of the component and Set data
     */
    FactoryAPI.prototype.calculateSetPrice = function (componentUnits, naturalUnit, prices, decimals) {
        var quantity = constants_1.E18.div(naturalUnit);
        return _.reduce(componentUnits, function (sum, componentUnit, index) {
            var componentPrice = componentUnit.mul(quantity).mul(prices[index]).div(Math.pow(10, decimals[index]));
            return sum.add(componentPrice);
        }, constants_1.ZERO);
    };
    /**
     * Calculates the natural unit from the smallest decimal in a list of token component decimals
     *
     * @param decimal           Smallest decimal for a list of component token decimals
     * @return                  Natural unit
     */
    FactoryAPI.prototype.calculateNaturalUnit = function (decimal) {
        return new util_1.BigNumber(Math.pow(10, (18 - decimal.toNumber())));
    };
    /* ============ Private Assertions ============ */
    FactoryAPI.prototype.assertCalculateCreateUnitInputs = function (components, prices, proportions) {
        this.assert.common.verifyProportionsSumToOne(proportions, errors_1.coreAPIErrors.PROPORTIONS_DONT_ADD_UP_TO_1());
        this.assert.common.isEqualLength(prices, components, errors_1.coreAPIErrors.ARRAYS_EQUAL_LENGTHS('prices', 'components'));
        this.assert.common.isEqualLength(prices, proportions, errors_1.coreAPIErrors.ARRAYS_EQUAL_LENGTHS('prices', 'proportions'));
    };
    FactoryAPI.prototype.assertCreateSet = function (userAddress, factoryAddress, components, units, naturalUnit, name, symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var minNaturalUnit;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('txOpts.from', userAddress);
                        this.assert.schema.isValidAddress('factoryAddress', factoryAddress);
                        this.assert.common.isEqualLength(components, units, errors_1.coreAPIErrors.ARRAYS_EQUAL_LENGTHS('components', 'units'));
                        this.assert.common.greaterThanZero(naturalUnit, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(naturalUnit));
                        this.assert.common.isValidString(name, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('name'));
                        this.assert.common.isValidString(symbol, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('symbol'));
                        _.each(units, function (unit) {
                            _this.assert.common.greaterThanZero(unit, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(unit));
                        });
                        return [4 /*yield*/, Promise.all(components.map(function (componentAddress) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            this.assert.common.isValidString(componentAddress, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('component'));
                                            this.assert.schema.isValidAddress('componentAddress', componentAddress);
                                            return [4 /*yield*/, this.assert.erc20.implementsERC20(componentAddress)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.calculateMinimumNaturalUnitAsync(components)];
                    case 2:
                        minNaturalUnit = _a.sent();
                        this.assert.common.isGreaterOrEqualThan(naturalUnit, minNaturalUnit, errors_1.coreAPIErrors.INVALID_NATURAL_UNIT(minNaturalUnit));
                        return [2 /*return*/];
                }
            });
        });
    };
    FactoryAPI.prototype.assertCreateRebalancingSet = function (userAddress, factoryAddress, initialSetAddress, initialUnitShares, proposalPeriod, rebalanceInterval, name, symbol) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('txOpts.from', userAddress);
                        this.assert.schema.isValidAddress('factoryAddress', factoryAddress);
                        this.assert.schema.isValidAddress('initialSet', initialSetAddress);
                        this.assert.common.isValidString(name, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('name'));
                        this.assert.common.isValidString(symbol, errors_1.coreAPIErrors.STRING_CANNOT_BE_EMPTY('symbol'));
                        this.assert.common.greaterThanZero(initialUnitShares, "Parameter initialUnitShares: " + initialUnitShares + " must be greater than 0.");
                        return [4 /*yield*/, this.assert.setToken.implementsSetToken(initialSetAddress)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return FactoryAPI;
}());
exports.FactoryAPI = FactoryAPI;
//# sourceMappingURL=FactoryAPI.js.map