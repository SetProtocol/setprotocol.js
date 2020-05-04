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
var util_1 = require("../util");
var wrappers_1 = require("../wrappers");
var errors_1 = require("../errors");
/**
 * @title ExchangeIssuanceAPI
 * @author Set Protocol
 *
 * A library for issuing RebalancingSets using Ether.
 */
var ExchangeIssuanceAPI = /** @class */ (function () {
    /**
     * Instantiates a new ExchangeIssuanceAPI instance that contains methods for issuing and redeeming Sets
     *
     * @param web3            The Web3.js Provider instance you would like the SetProtocol.js library
     *                        to use for interacting with the Ethereum network
     * @param assertions      An instance of the Assertion library
     * @param config          Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    function ExchangeIssuanceAPI(web3, assertions, config) {
        this.web3 = web3;
        this.setProtocolUtils = new set_protocol_utils_1.SetProtocolUtils(this.web3);
        this.assert = assertions;
        this.core = new wrappers_1.CoreWrapper(this.web3, config.coreAddress, config.transferProxyAddress, config.vaultAddress);
        this.cTokenWhiteList = config.cTokenWhiteListAddress;
        this.exchangeIssuance = new wrappers_1.ExchangeIssuanceModuleWrapper(web3, config.exchangeIssuanceModuleAddress);
        this.kyberNetworkWrapper = new wrappers_1.KyberNetworkWrapper(this.web3, config.kyberNetworkWrapperAddress);
        this.rebalancingSetExchangeIssuanceModule = new wrappers_1.RebalancingSetExchangeIssuanceModuleWrapper(web3, config.rebalancingSetExchangeIssuanceModule);
        this.rebalancingSetToken = new wrappers_1.RebalancingSetTokenWrapper(this.web3);
        this.setToken = new wrappers_1.SetTokenWrapper(this.web3);
        this.wrappedEther = config.wrappedEtherAddress;
    }
    /**
     * Issues a Set to the transaction signer. Must have payment tokens in the correct quantites
     * Payment tokens must be approved to the TransferProxy contract via setTransferProxyAllowanceAsync
     *
     * @param  exchangeIssuanceParams      Parameters required to facilitate an exchange issue
     * @param  orders                   A list of signed 0x orders or kyber trades
     * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return               Transaction hash
     */
    ExchangeIssuanceAPI.prototype.exchangeIssueAsync = function (exchangeIssuanceParams, orders, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var orderData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertExchangeIssue(exchangeIssuanceParams, orders)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setProtocolUtils.generateSerializedOrders(orders)];
                    case 2:
                        orderData = _a.sent();
                        return [2 /*return*/, this.exchangeIssuance.exchangeIssue(exchangeIssuanceParams, orderData, txOpts)];
                }
            });
        });
    };
    /**
     * Issues a Rebalancing Set to the transaction signer using Ether as payment.
     *
     * @param  rebalancingSetAddress    Address of the Rebalancing Set to issue
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
     * @param  exchangeIssuanceParams   Parameters required to facilitate an exchange issuance
     * @param  orders                   A list of signed 0x orders or kyber trades
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transferred to the user
     *                                     or left in the vault
     * @param  txOpts                   Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                          Transaction hash
     */
    ExchangeIssuanceAPI.prototype.issueRebalancingSetWithEtherAsync = function (rebalancingSetAddress, rebalancingSetQuantity, exchangeIssuanceParams, orders, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var orderData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertIssueRebalancingSetWithEther(rebalancingSetAddress, exchangeIssuanceParams, orders, txOpts)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setProtocolUtils.generateSerializedOrders(orders)];
                    case 2:
                        orderData = _a.sent();
                        return [2 /*return*/, this.rebalancingSetExchangeIssuanceModule.issueRebalancingSetWithEther(rebalancingSetAddress, rebalancingSetQuantity, exchangeIssuanceParams, orderData, keepChangeInVault, txOpts)];
                }
            });
        });
    };
    /**
     * Issue a Rebalancing Set using a specified ERC20 payment token. The payment token is used in ExchangeIssue
     * to acquire the base SetToken components and issue the base SetToken. The base SetToken is then used to
     * issue the Rebalancing SetToken. The payment token can be utilized as a component of the base SetToken.
     * All remaining tokens / change are flushed and returned to the user.
     * Ahead of calling this function, the user must approve their paymentToken to the transferProxy.
     *
     * @param  rebalancingSetAddress     Address of the rebalancing Set to issue
     * @param  rebalancingSetQuantity    Quantity of the rebalancing Set
     * @param  paymentTokenAddress       Address of the ERC20 token to pay with
     * @param  paymentTokenQuantity      Quantity of the payment token
     * @param  exchangeIssuanceParams    Struct containing data around the base Set issuance
     * @param  orderData                 Bytecode formatted data with exchange data for acquiring base set components
     * @param  keepChangeInVault         Boolean signifying whether excess base SetToken is transfered to the user
     *                                     or left in the vault
     * @param  txOpts                    The options for executing the transaction
     */
    ExchangeIssuanceAPI.prototype.issueRebalancingSetWithERC20Async = function (rebalancingSetAddress, rebalancingSetQuantity, paymentTokenAddress, paymentTokenQuantity, exchangeIssuanceParams, orders, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var orderData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertIssueRebalancingSetWithERC20(rebalancingSetAddress, paymentTokenAddress, paymentTokenQuantity, exchangeIssuanceParams, orders, txOpts)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setProtocolUtils.generateSerializedOrders(orders)];
                    case 2:
                        orderData = _a.sent();
                        return [2 /*return*/, this.rebalancingSetExchangeIssuanceModule.issueRebalancingSetWithERC20(rebalancingSetAddress, rebalancingSetQuantity, paymentTokenAddress, paymentTokenQuantity, exchangeIssuanceParams, orderData, keepChangeInVault, txOpts)];
                }
            });
        });
    };
    /**
     * Redeems a Rebalancing Set into the base Set. Then the base Set is redeemed, and its components
     * are exchanged for Wrapped Ether. The wrapped Ether is then unwrapped and attributed to the caller.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
     * @param  exchangeIssuanceParams   Parameters required to facilitate an exchange issuance
     * @param  orders                   A list of signed 0x orders or kyber trades
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transferred to the user
     *                                     or left in the vault
     * @param  txOpts                   Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                          Transaction hash
     */
    ExchangeIssuanceAPI.prototype.redeemRebalancingSetIntoEtherAsync = function (rebalancingSetAddress, rebalancingSetQuantity, exchangeIssuanceParams, orders, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var orderData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertRedeemRebalancingSetIntoERC20(rebalancingSetAddress, rebalancingSetQuantity, this.wrappedEther, exchangeIssuanceParams, orders, txOpts)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setProtocolUtils.generateSerializedOrders(orders)];
                    case 2:
                        orderData = _a.sent();
                        return [2 /*return*/, this.rebalancingSetExchangeIssuanceModule.redeemRebalancingSetIntoEther(rebalancingSetAddress, rebalancingSetQuantity, exchangeIssuanceParams, orderData, keepChangeInVault, txOpts)];
                }
            });
        });
    };
    /**
     * Redeems a Rebalancing Set into a specified ERC20 token. The Rebalancing Set is redeemed into the Base Set, and
     * Base Set components are traded for the ERC20 and sent to the caller.
     *
     * @param  rebalancingSetAddress     Address of the rebalancing Set
     * @param  rebalancingSetQuantity    Quantity of rebalancing Set to redeem
     * @param  outputTokenAddress        Address of the resulting ERC20 token sent to the user
     * @param  exchangeIssuanceParams    Struct containing data around the base Set issuance
     * @param  orderData                 Bytecode formatted data with exchange data for disposing base set components
     * @param  keepChangeInVault         Boolean signifying whether excess base SetToken is transfered to the user
     *                                     or left in the vault
     * @param  txOpts                    The options for executing the transaction
     */
    ExchangeIssuanceAPI.prototype.redeemRebalancingSetIntoERC20Async = function (rebalancingSetAddress, rebalancingSetQuantity, outputTokenAddress, exchangeIssuanceParams, orders, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var orderData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertRedeemRebalancingSetIntoERC20(rebalancingSetAddress, rebalancingSetQuantity, outputTokenAddress, exchangeIssuanceParams, orders, txOpts)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setProtocolUtils.generateSerializedOrders(orders)];
                    case 2:
                        orderData = _a.sent();
                        return [2 /*return*/, this.rebalancingSetExchangeIssuanceModule.redeemRebalancingSetIntoERC20(rebalancingSetAddress, rebalancingSetQuantity, outputTokenAddress, exchangeIssuanceParams, orderData, keepChangeInVault, txOpts)];
                }
            });
        });
    };
    /**
     * Fetch the conversion rate for a Kyber trading pair
     *
     * @param  sourceTokens        Addresses of the tokens to trade
     * @param  destinationTokens   Addresses of the set components to trade for
     * @param  quantities          Quantities of maker tokens to trade for component tokens
     * @return                     Conversion and slippage rates for the source and destination token pairs
     */
    ExchangeIssuanceAPI.prototype.getKyberConversionRates = function (sourceTokens, destinationTokens, quantities) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.kyberNetworkWrapper.conversionRates(sourceTokens, destinationTokens, quantities)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /* ============ Private Assertions ============ */
    ExchangeIssuanceAPI.prototype.assertExchangeIssue = function (exchangeIssuanceParams, orders) {
        return __awaiter(this, void 0, void 0, function () {
            var setAddress, receiveTokens, components;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setAddress = exchangeIssuanceParams.setAddress, receiveTokens = exchangeIssuanceParams.receiveTokens;
                        // Assert orders are passed in
                        this.assert.common.isNotEmptyArray(orders, errors_1.coreAPIErrors.EMPTY_ARRAY('orders'));
                        return [4 /*yield*/, this.setToken.getComponents(setAddress)];
                    case 1:
                        components = _a.sent();
                        receiveTokens.forEach(function (receiveToken) {
                            _this.assert.common.includes(components, receiveToken, errors_1.exchangeIssuanceErrors.TRADE_TOKENS_NOT_COMPONENT(setAddress, receiveToken));
                        });
                        return [4 /*yield*/, this.assert.exchange.assertExchangeIssuanceParams(exchangeIssuanceParams, orders, this.core.coreAddress, this.cTokenWhiteList)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ExchangeIssuanceAPI.prototype.assertIssueRebalancingSetWithEther = function (rebalancingSetAddress, exchangeIssuanceParams, orders, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.common.isNotUndefined(txOpts.value, errors_1.exchangeIssuanceErrors.PAYMENT_TOKEN_QUANTITY_NOT_UNDEFINED());
                        return [4 /*yield*/, this.assertIssueRebalancingSetWithERC20(rebalancingSetAddress, this.wrappedEther, new util_1.BigNumber(txOpts.value), exchangeIssuanceParams, orders, txOpts)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ExchangeIssuanceAPI.prototype.assertIssueRebalancingSetWithERC20 = function (rebalancingSetAddress, paymentTokenAddress, paymentTokenQuantity, exchangeIssuanceParams, orders, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var setAddress, sendTokens, receiveTokens, baseSetAddress, components;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setAddress = exchangeIssuanceParams.setAddress, sendTokens = exchangeIssuanceParams.sendTokens, receiveTokens = exchangeIssuanceParams.receiveTokens;
                        // Assert valid parameters were passed into issueRebalancingSetWithEther
                        this.assert.common.isNotUndefined(paymentTokenQuantity, errors_1.exchangeIssuanceErrors.PAYMENT_TOKEN_QUANTITY_NOT_UNDEFINED());
                        this.assert.schema.isValidAddress('txOpts.from', txOpts.from);
                        this.assert.schema.isValidAddress('rebalancingSetAddress', rebalancingSetAddress);
                        this.assert.common.isNotEmptyArray(orders, errors_1.coreAPIErrors.EMPTY_ARRAY('orders'));
                        return [4 /*yield*/, this.rebalancingSetToken.currentSet(rebalancingSetAddress)];
                    case 1:
                        baseSetAddress = _a.sent();
                        // Assert the set address is the rebalancing set address's current set
                        this.assert.common.isEqualAddress(setAddress, baseSetAddress, errors_1.exchangeIssuanceErrors.ISSUING_SET_NOT_BASE_SET(setAddress, baseSetAddress));
                        return [4 /*yield*/, this.setToken.getComponents(setAddress)];
                    case 2:
                        components = _a.sent();
                        receiveTokens.forEach(function (receiveToken) {
                            _this.assert.common.includes(components, receiveToken, errors_1.exchangeIssuanceErrors.TRADE_TOKENS_NOT_COMPONENT(setAddress, receiveToken));
                        });
                        // Assert that all payment tokens are wrapped Ether
                        sendTokens.forEach(function (currentSendToken) {
                            // Assert payment token is wrapped ether
                            _this.assert.common.isEqualAddress(currentSendToken, paymentTokenAddress, errors_1.exchangeIssuanceErrors.INVALID_SEND_TOKEN(currentSendToken, paymentTokenAddress));
                        });
                        // Assert valid exchange trade and order parameters
                        return [4 /*yield*/, this.assert.exchange.assertExchangeIssuanceParams(exchangeIssuanceParams, orders, this.core.coreAddress, this.cTokenWhiteList)];
                    case 3:
                        // Assert valid exchange trade and order parameters
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ExchangeIssuanceAPI.prototype.assertRedeemRebalancingSetIntoERC20 = function (rebalancingSetAddress, rebalancingSetQuantity, outputTokenAddress, exchangeIssuanceParams, orders, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var setAddress, quantity, sendTokens, receiveTokens, baseSetAddress, components, rebalancingSetNaturalUnit, rebalancingSetUnitShares, impliedBaseSetQuantity, receiveToken;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setAddress = exchangeIssuanceParams.setAddress, quantity = exchangeIssuanceParams.quantity, sendTokens = exchangeIssuanceParams.sendTokens, receiveTokens = exchangeIssuanceParams.receiveTokens;
                        // Assert valid parameters were passed into redeemRebalancingSetIntoEther
                        this.assert.common.isValidLength(receiveTokens, 1, errors_1.exchangeIssuanceErrors.ONLY_ONE_RECEIVE_TOKEN());
                        this.assert.schema.isValidAddress('txOpts.from', txOpts.from);
                        this.assert.schema.isValidAddress('rebalancingSetAddress', rebalancingSetAddress);
                        this.assert.common.isNotEmptyArray(orders, errors_1.coreAPIErrors.EMPTY_ARRAY('orders'));
                        return [4 /*yield*/, this.rebalancingSetToken.currentSet(rebalancingSetAddress)];
                    case 1:
                        baseSetAddress = _a.sent();
                        // Assert the set address is the rebalancing set address's current set
                        this.assert.common.isEqualAddress(setAddress, baseSetAddress, errors_1.exchangeIssuanceErrors.REDEEMING_SET_NOT_BASE_SET(setAddress, baseSetAddress));
                        return [4 /*yield*/, this.setToken.getComponents(setAddress)];
                    case 2:
                        components = _a.sent();
                        sendTokens.forEach(function (sendToken) {
                            _this.assert.common.includes(components, sendToken, errors_1.exchangeIssuanceErrors.TRADE_TOKENS_NOT_COMPONENT(setAddress, sendToken));
                        });
                        return [4 /*yield*/, this.setToken.naturalUnit(rebalancingSetAddress)];
                    case 3:
                        rebalancingSetNaturalUnit = _a.sent();
                        return [4 /*yield*/, this.setToken.getUnits(rebalancingSetAddress)];
                    case 4:
                        rebalancingSetUnitShares = (_a.sent())[0];
                        impliedBaseSetQuantity = rebalancingSetQuantity.mul(rebalancingSetUnitShares).div(rebalancingSetNaturalUnit);
                        this.assert.common.isGreaterOrEqualThan(impliedBaseSetQuantity, quantity, // Base set quantity to redeem
                        errors_1.exchangeIssuanceErrors.REDEEM_AND_TRADE_QUANTITIES_MISMATCH(impliedBaseSetQuantity.valueOf(), quantity.valueOf()));
                        receiveToken = receiveTokens[0];
                        this.assert.common.isEqualAddress(receiveToken, outputTokenAddress, errors_1.exchangeIssuanceErrors.INVALID_RECEIVE_TOKEN(receiveToken, outputTokenAddress));
                        // Assert valid exchange trade and order parameters
                        return [4 /*yield*/, this.assert.exchange.assertExchangeIssuanceParams(exchangeIssuanceParams, orders, this.core.coreAddress, this.cTokenWhiteList)];
                    case 5:
                        // Assert valid exchange trade and order parameters
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ExchangeIssuanceAPI;
}());
exports.ExchangeIssuanceAPI = ExchangeIssuanceAPI;
//# sourceMappingURL=ExchangeIssuanceAPI.js.map