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
var errors_1 = require("../errors");
var CommonAssertions_1 = require("./CommonAssertions");
var ERC20Assertions_1 = require("./ERC20Assertions");
var SetTokenAssertions_1 = require("./SetTokenAssertions");
var wrappers_1 = require("../wrappers");
var util_1 = require("../util");
var constants_1 = require("../constants");
var ExchangeAssertions = /** @class */ (function () {
    function ExchangeAssertions(web3) {
        this.erc20Assertions = new ERC20Assertions_1.ERC20Assertions(web3);
        this.commonAssertions = new CommonAssertions_1.CommonAssertions();
        this.setTokenAssertions = new SetTokenAssertions_1.SetTokenAssertions(web3);
        this.addressToAddressWhiteList = new wrappers_1.AddressToAddressWhiteListWrapper(web3);
    }
    ExchangeAssertions.prototype.assertExchangeIssuanceParams = function (exchangeIssuanceParams, orders, coreAddress, cTokenWhiteListAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var setAddress, sendTokens, sendTokenAmounts, sendTokenExchangeIds, quantity, receiveTokens, receiveTokenAmounts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setAddress = exchangeIssuanceParams.setAddress, sendTokens = exchangeIssuanceParams.sendTokens, sendTokenAmounts = exchangeIssuanceParams.sendTokenAmounts, sendTokenExchangeIds = exchangeIssuanceParams.sendTokenExchangeIds, quantity = exchangeIssuanceParams.quantity, receiveTokens = exchangeIssuanceParams.receiveTokens, receiveTokenAmounts = exchangeIssuanceParams.receiveTokenAmounts;
                        this.commonAssertions.greaterThanZero(quantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
                        this.commonAssertions.isEqualLength(receiveTokens, receiveTokenAmounts, errors_1.coreAPIErrors.ARRAYS_EQUAL_LENGTHS('receiveTokens', 'receiveTokenAmounts'));
                        // Set must be enabled by Core to be issued or redeemed and quantity must be multiple of natural unit
                        return [4 /*yield*/, this.setTokenAssertions.isValidSetToken(coreAddress, setAddress)];
                    case 1:
                        // Set must be enabled by Core to be issued or redeemed and quantity must be multiple of natural unit
                        _a.sent();
                        return [4 /*yield*/, this.setTokenAssertions.isMultipleOfNaturalUnit(setAddress, quantity, "Quantity of Exchange issue Params")];
                    case 2:
                        _a.sent();
                        // Validate the send and receive tokens are valid
                        this.assertSendTokenInputs(sendTokens, sendTokenExchangeIds, sendTokenAmounts, coreAddress);
                        this.assertReceiveTokenInputs(receiveTokens, receiveTokenAmounts, setAddress);
                        // Validate the liquiduity source orders net the correct component tokens
                        return [4 /*yield*/, this.assertExchangeIssuanceOrdersValidity(exchangeIssuanceParams, orders, cTokenWhiteListAddress)];
                    case 3:
                        // Validate the liquiduity source orders net the correct component tokens
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ExchangeAssertions.prototype.assertSendTokenInputs = function (sendTokens, sendTokenExchangeIds, sendTokenAmounts, coreAddress) {
        var _this = this;
        var validExchangeIds = [
            set_protocol_utils_1.SetProtocolUtils.EXCHANGES.ZERO_EX,
            set_protocol_utils_1.SetProtocolUtils.EXCHANGES.KYBER,
        ].map(function (exchangeEnumeration) { return exchangeEnumeration.toString(); });
        this.commonAssertions.isNotEmptyArray(sendTokens, errors_1.coreAPIErrors.EMPTY_ARRAY('sendTokens'));
        sendTokens.map(function (sendToken, i) {
            _this.commonAssertions.isEqualLength(sendTokens, sendTokenAmounts, errors_1.coreAPIErrors.ARRAYS_EQUAL_LENGTHS('sendTokens', 'sendTokenAmounts'));
            _this.commonAssertions.isEqualLength(sendTokens, sendTokenExchangeIds, errors_1.coreAPIErrors.ARRAYS_EQUAL_LENGTHS('sendTokens', 'sendTokenExchangeIds'));
            _this.commonAssertions.greaterThanZero(sendTokenAmounts[i], errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(sendTokenAmounts[i]));
            var exchangeId = sendTokenExchangeIds[i].toString();
            _this.commonAssertions.includes(validExchangeIds, exchangeId, errors_1.exchangeErrors.INVALID_EXCHANGE_ID(exchangeId));
        });
    };
    ExchangeAssertions.prototype.assertReceiveTokenInputs = function (receiveTokens, receiveTokenAmounts, setAddress) {
        var _this = this;
        this.commonAssertions.isNotEmptyArray(receiveTokens, errors_1.coreAPIErrors.EMPTY_ARRAY('receiveTokens'));
        receiveTokens.map(function (tokenAddress, i) {
            _this.commonAssertions.isEqualLength(receiveTokens, receiveTokenAmounts, errors_1.coreAPIErrors.ARRAYS_EQUAL_LENGTHS('receiveTokens', 'receiveTokenAmounts'));
            _this.commonAssertions.greaterThanZero(receiveTokenAmounts[i], errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(receiveTokenAmounts[i]));
        });
    };
    ExchangeAssertions.prototype.assertExchangeIssuanceOrdersValidity = function (exchangeIssuanceParams, orders, cTokenWhiteListAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var setAddress, quantity, receiveTokens, receiveTokenAmounts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setAddress = exchangeIssuanceParams.setAddress, quantity = exchangeIssuanceParams.quantity, receiveTokens = exchangeIssuanceParams.receiveTokens, receiveTokenAmounts = exchangeIssuanceParams.receiveTokenAmounts;
                        return [4 /*yield*/, Promise.all(_.map(orders, function (order) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!set_protocol_utils_1.SetProtocolUtils.isZeroExOrder(order)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.isValidZeroExOrderFill(setAddress, quantity, order)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            if (set_protocol_utils_1.SetProtocolUtils.isKyberTrade(order)) {
                                                this.isValidKyberTradeFill(setAddress, order);
                                            }
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        this.isValidLiquidityAmounts(quantity, receiveTokens, receiveTokenAmounts, quantity, orders, cTokenWhiteListAddress);
                        return [2 /*return*/];
                }
            });
        });
    };
    /* ============ Private Helpers =============== */
    ExchangeAssertions.prototype.isValidLiquidityAmounts = function (quantity, receiveTokens, receiveTokenAmounts, quantityToFill, orders, cTokenWhiteListAddress) {
        var _this = this;
        var componentAmountsFromLiquidity = this.calculateLiquidityFills(orders);
        _.each(receiveTokens, function (component, i) { return __awaiter(_this, void 0, void 0, function () {
            var underlyingComponent, normalizedUnderlyingTokenAddress, receiveTokenAmountForFillQuantity, normalizedTokenAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!cTokenWhiteListAddress) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.addressToAddressWhiteList.getValues(cTokenWhiteListAddress, [component])];
                    case 1:
                        underlyingComponent = (_a.sent())[0];
                        normalizedUnderlyingTokenAddress = underlyingComponent.toLowerCase();
                        this.commonAssertions.isNotUndefined(componentAmountsFromLiquidity[normalizedUnderlyingTokenAddress], errors_1.exchangeErrors.INSUFFIENT_LIQUIDITY_FOR_REQUIRED_COMPONENT(normalizedUnderlyingTokenAddress));
                        return [3 /*break*/, 3];
                    case 2:
                        receiveTokenAmountForFillQuantity = util_1.calculatePartialAmount(receiveTokenAmounts[i], quantityToFill, quantity);
                        normalizedTokenAddress = component.toLowerCase();
                        this.commonAssertions.isNotUndefined(componentAmountsFromLiquidity[normalizedTokenAddress], errors_1.exchangeErrors.INSUFFIENT_LIQUIDITY_FOR_REQUIRED_COMPONENT(normalizedTokenAddress));
                        this.commonAssertions.isGreaterOrEqualThan(componentAmountsFromLiquidity[normalizedTokenAddress], receiveTokenAmountForFillQuantity, errors_1.exchangeErrors.INSUFFICIENT_COMPONENT_AMOUNT_FROM_LIQUIDITY(normalizedTokenAddress, componentAmountsFromLiquidity[normalizedTokenAddress], receiveTokenAmountForFillQuantity));
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    ExchangeAssertions.prototype.calculateLiquidityFills = function (orders) {
        var _this = this;
        var requiredComponentFills = {};
        _.each(orders, function (order) {
            // Count up components of issuance order that have been filled from this liquidity order
            requiredComponentFills = _this.addLiquidityOrderContribution(order, requiredComponentFills);
        });
        return requiredComponentFills;
    };
    /*
     * This takes in an order from a liquidity source and adds up the amount of token being filled
     * for a given component.
     */
    ExchangeAssertions.prototype.addLiquidityOrderContribution = function (order, requiredComponentFills) {
        var _a, _b;
        var existingAmount;
        var currentOrderAmount;
        if (set_protocol_utils_1.SetProtocolUtils.isZeroExOrder(order)) {
            var fillAmount = order.fillAmount, makerAssetAmount = order.makerAssetAmount, makerAssetData = order.makerAssetData, takerAssetAmount = order.takerAssetAmount;
            var tokenAddress = set_protocol_utils_1.SetProtocolUtils.extractAddressFromAssetData(makerAssetData).toLowerCase();
            // Accumulate fraction of 0x order that was filled
            existingAmount = requiredComponentFills[tokenAddress] || constants_1.ZERO;
            currentOrderAmount = util_1.calculatePartialAmount(makerAssetAmount, fillAmount, takerAssetAmount);
            return Object.assign(requiredComponentFills, (_a = {}, _a[tokenAddress] = existingAmount.plus(currentOrderAmount), _a));
        }
        else if (set_protocol_utils_1.SetProtocolUtils.isKyberTrade(order)) {
            var destinationToken = order.destinationToken, maxDestinationQuantity = order.maxDestinationQuantity;
            var tokenAddress = destinationToken.toLowerCase();
            existingAmount = requiredComponentFills[tokenAddress] || constants_1.ZERO;
            currentOrderAmount = maxDestinationQuantity;
            return Object.assign(requiredComponentFills, (_b = {}, _b[tokenAddress] = existingAmount.plus(currentOrderAmount), _b));
        }
        return requiredComponentFills;
    };
    ExchangeAssertions.prototype.isValidKyberTradeFill = function (setAddress, trade) {
        this.commonAssertions.greaterThanZero(trade.sourceTokenQuantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(trade.sourceTokenQuantity));
        // TODO: Waiting on performance to see if this assertion is necessary. Conversion rate may not need to be
        // provided because we require the final received token amounts to match the trade amounts or it will revert
        // Kyber trade parameters will yield enough component token
        // const amountComponentTokenFromTrade = trade.minimumConversionRate.mul(trade.sourceTokenQuantity);
        // this.commonAssertions.isGreaterOrEqualThan(
        //   amountComponentTokenFromTrade,
        //   trade.maxDestinationQuantity,
        //   exchangeErrors.INSUFFICIENT_KYBER_SOURCE_TOKEN_FOR_RATE(
        //     trade.sourceTokenQuantity,
        //     amountComponentTokenFromTrade,
        //     trade.destinationToken
        //   )
        // );
    };
    ExchangeAssertions.prototype.isValidZeroExOrderFill = function (setAddress, quantityToFill, zeroExOrder) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.commonAssertions.greaterThanZero(zeroExOrder.fillAmount, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(zeroExOrder.fillAmount));
                        // 0x order maker has sufficient balance of the maker token
                        return [4 /*yield*/, this.erc20Assertions.hasSufficientBalanceAsync(set_protocol_utils_1.SetProtocolUtils.extractAddressFromAssetData(zeroExOrder.makerAssetData), zeroExOrder.makerAddress, zeroExOrder.makerAssetAmount)];
                    case 1:
                        // 0x order maker has sufficient balance of the maker token
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ExchangeAssertions;
}());
exports.ExchangeAssertions = ExchangeAssertions;
//# sourceMappingURL=ExchangeAssertions.js.map