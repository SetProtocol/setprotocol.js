/*
  Copyright 2019 Set Labs Inc.

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
var util_1 = require("../util");
var wrappers_1 = require("../wrappers");
var errors_1 = require("../errors");
/**
 * @title RebalancingSetIssuanceAPI
 * @author Set Protocol
 *
 * A library for issuance and redemption of RebalancingSets.
 */
var RebalancingSetIssuanceAPI = /** @class */ (function () {
    /**
     * Instantiates a new RebalancingSetIssuanceAPI instance that contains methods for issuing and redeeming Sets
     *
     * @param web3                         The Web3.js Provider instance you would like the SetProtocol.js library
     *                                      to use for interacting with the Ethereum network
     * @param assertions                   An instance of the Assertion library
     * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    function RebalancingSetIssuanceAPI(web3, assertions, config) {
        this.web3 = web3;
        this.assert = assertions;
        this.cTokenWhiteList = config.cTokenWhiteListAddress;
        this.transferProxy = config.transferProxyAddress;
        this.rebalancingSetIssuanceModule = new wrappers_1.RebalancingSetIssuanceModuleWrapper(web3, config.rebalancingSetIssuanceModule);
        this.rebalancingSetToken = new wrappers_1.RebalancingSetTokenWrapper(this.web3);
        this.wrappedEther = config.wrappedEtherAddress;
    }
    /**
     * Issue a rebalancing SetToken using the base components of the base SetToken.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                    The options for executing the transaction.
     */
    RebalancingSetIssuanceAPI.prototype.issueRebalancingSet = function (rebalancingSetAddress, rebalancingSetQuantity, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assert.issuance.assertRebalancingSetTokenIssue(rebalancingSetAddress, rebalancingSetQuantity, txOpts.from, this.transferProxy, this.cTokenWhiteList)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.rebalancingSetIssuanceModule.issueRebalancingSet(rebalancingSetAddress, rebalancingSetQuantity, keepChangeInVault, txOpts)];
                }
            });
        });
    };
    /**
     * Issue a rebalancing SetToken using the base components of the base SetToken.
     * Wrapped Ether must be a component of the base SetToken - which is wrapped using the
     * ether sent along with the transaction. Excess ether is returned to the user.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                   The options for executing the transaction. Value must be filled in.
     */
    RebalancingSetIssuanceAPI.prototype.issueRebalancingSetWrappingEther = function (rebalancingSetAddress, rebalancingSetQuantity, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertIssueRebalancingSetWrappingEther(rebalancingSetAddress, rebalancingSetQuantity, txOpts)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.rebalancingSetIssuanceModule.issueRebalancingSetWrappingEther(rebalancingSetAddress, rebalancingSetQuantity, keepChangeInVault, txOpts)];
                }
            });
        });
    };
    /**
     * Redeems a Rebalancing Set into the base SetToken. Then the base SetToken is redeemed, and its components
     * are sent to the caller or transferred to the caller in the Vault depending on the keepChangeInVault argument.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                   The options for executing the transaction
     */
    RebalancingSetIssuanceAPI.prototype.redeemRebalancingSet = function (rebalancingSetAddress, rebalancingSetQuantity, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assert.issuance.assertRedeem(rebalancingSetAddress, rebalancingSetQuantity, txOpts.from)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.rebalancingSetIssuanceModule.redeemRebalancingSet(rebalancingSetAddress, rebalancingSetQuantity, keepChangeInVault, txOpts)];
                }
            });
        });
    };
    /**
     * Redeems a Rebalancing Set into the base SetToken. Then the base Set is redeemed, and its components
     * are sent to the caller. Any wrapped Ether is unwrapped and transferred to the caller.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                    The options for executing the transaction
     */
    RebalancingSetIssuanceAPI.prototype.redeemRebalancingSetUnwrappingEther = function (rebalancingSetAddress, rebalancingSetQuantity, keepChangeInVault, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertRedeemRebalancingSetUnwrappingEther(rebalancingSetAddress, rebalancingSetQuantity, txOpts)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.rebalancingSetIssuanceModule.redeemRebalancingSetUnwrappingEther(rebalancingSetAddress, rebalancingSetQuantity, keepChangeInVault, txOpts)];
                }
            });
        });
    };
    /* ============ Private Assertions ============ */
    RebalancingSetIssuanceAPI.prototype.assertIssueRebalancingSetWrappingEther = function (rebalancingSetAddress, rebalancingSetQuantity, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.common.isNotUndefined(txOpts.value, errors_1.exchangeIssuanceErrors.PAYMENT_TOKEN_QUANTITY_NOT_UNDEFINED());
                        return [4 /*yield*/, this.assert.issuance.assertRebalancingSetTokenIssueWrappingEther(rebalancingSetAddress, rebalancingSetQuantity, txOpts.from, this.transferProxy, this.wrappedEther, new util_1.BigNumber(txOpts.value), this.cTokenWhiteList)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingSetIssuanceAPI.prototype.assertRedeemRebalancingSetUnwrappingEther = function (rebalancingSetAddress, rebalancingSetQuantity, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var baseSetAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assert.issuance.assertRedeem(rebalancingSetAddress, rebalancingSetQuantity, txOpts.from)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.currentSet(rebalancingSetAddress)];
                    case 2:
                        baseSetAddress = _a.sent();
                        return [4 /*yield*/, this.assert.setToken.isComponent(baseSetAddress, this.wrappedEther)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RebalancingSetIssuanceAPI;
}());
exports.RebalancingSetIssuanceAPI = RebalancingSetIssuanceAPI;
//# sourceMappingURL=RebalancingSetIssuanceAPI.js.map