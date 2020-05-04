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
 * @title  RebalancingSetExchangeIssuanceModuleWrapper
 * @author Set Protocol
 *
 * The RebalancingSetExchangeIssuanceModuleWrapper handles all functions on the Payable Exchange Issue smart contract.
 *
 */
var RebalancingSetExchangeIssuanceModuleWrapper = /** @class */ (function () {
    function RebalancingSetExchangeIssuanceModuleWrapper(web3, rebalancingSetExchangeIssuanceModuleAddress) {
        this.web3 = web3;
        this.rebalancingSetExchangeIssuanceModule = rebalancingSetExchangeIssuanceModuleAddress;
        this.contracts = new ProtocolContractWrapper_1.ProtocolContractWrapper(this.web3);
    }
    /**
     * Issue a Rebalancing Set using Wrapped Ether to acquire the base components of the Base Set.
     * The Base Set is then issued using Exchange Issue and reissued into the Rebalancing Set.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
     * @param  exchangeIssuanceData     Struct containing data around the base Set issuance
     * @param  orderData                Bytecode formatted data with exchange data for acquiring base set components
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transferred to the user
     *                                     or left in the vault
     * @param  txOpts                   The options for executing the transaction
     */
    RebalancingSetExchangeIssuanceModuleWrapper.prototype.issueRebalancingSetWithEther = function (rebalancingSetAddress, rebalancingSetQuantity, exchangeIssuanceParams, orderData, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, rebalancingSetExchangeIssuanceModuleInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadRebalancingSetExchangeIssuanceModuleAsync(this.rebalancingSetExchangeIssuanceModule)];
                    case 2:
                        rebalancingSetExchangeIssuanceModuleInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetExchangeIssuanceModuleInstance.issueRebalancingSetWithEther.sendTransactionAsync(rebalancingSetAddress, rebalancingSetQuantity, exchangeIssuanceParams, orderData, keepChangeInVault, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
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
    RebalancingSetExchangeIssuanceModuleWrapper.prototype.issueRebalancingSetWithERC20 = function (rebalancingSetAddress, rebalancingSetQuantity, paymentTokenAddress, paymentTokenQuantity, exchangeIssuanceParams, orderData, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, rebalancingSetExchangeIssuanceModuleInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadRebalancingSetExchangeIssuanceModuleAsync(this.rebalancingSetExchangeIssuanceModule)];
                    case 2:
                        rebalancingSetExchangeIssuanceModuleInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetExchangeIssuanceModuleInstance.issueRebalancingSetWithERC20.sendTransactionAsync(rebalancingSetAddress, rebalancingSetQuantity, paymentTokenAddress, paymentTokenQuantity, exchangeIssuanceParams, orderData, keepChangeInVault, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
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
     * @param  exchangeIssuanceData     Struct containing data around the base Set issuance
     * @param  orderData                Bytecode formatted data with exchange data for acquiring base set components
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transferred to the user
     *                                     or left in the vault
     * @param  txOpts                    The options for executing the transaction
     */
    RebalancingSetExchangeIssuanceModuleWrapper.prototype.redeemRebalancingSetIntoEther = function (rebalancingSetAddress, rebalancingSetQuantity, exchangeIssuanceParams, orderData, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, rebalancingSetExchangeIssuanceModuleInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadRebalancingSetExchangeIssuanceModuleAsync(this.rebalancingSetExchangeIssuanceModule)];
                    case 2:
                        rebalancingSetExchangeIssuanceModuleInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetExchangeIssuanceModuleInstance.redeemRebalancingSetIntoEther.sendTransactionAsync(rebalancingSetAddress, rebalancingSetQuantity, exchangeIssuanceParams, orderData, keepChangeInVault, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
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
    RebalancingSetExchangeIssuanceModuleWrapper.prototype.redeemRebalancingSetIntoERC20 = function (rebalancingSetAddress, rebalancingSetQuantity, paymentTokenAddress, exchangeIssuanceParams, orderData, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, rebalancingSetExchangeIssuanceModuleInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadRebalancingSetExchangeIssuanceModuleAsync(this.rebalancingSetExchangeIssuanceModule)];
                    case 2:
                        rebalancingSetExchangeIssuanceModuleInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetExchangeIssuanceModuleInstance.redeemRebalancingSetIntoERC20.sendTransactionAsync(rebalancingSetAddress, rebalancingSetQuantity, paymentTokenAddress, exchangeIssuanceParams, orderData, keepChangeInVault, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return RebalancingSetExchangeIssuanceModuleWrapper;
}());
exports.RebalancingSetExchangeIssuanceModuleWrapper = RebalancingSetExchangeIssuanceModuleWrapper;
//# sourceMappingURL=RebalancingSetExchangeIssuanceModuleWrapper.js.map