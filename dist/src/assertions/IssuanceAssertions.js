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
var errors_1 = require("../errors");
var CommonAssertions_1 = require("./CommonAssertions");
var ERC20Assertions_1 = require("./ERC20Assertions");
var SchemaAssertions_1 = require("./SchemaAssertions");
var SetTokenAssertions_1 = require("./SetTokenAssertions");
var wrappers_1 = require("../wrappers");
var util_1 = require("../util");
var IssuanceAssertions = /** @class */ (function () {
    function IssuanceAssertions(web3) {
        this.erc20Assertions = new ERC20Assertions_1.ERC20Assertions(web3);
        this.commonAssertions = new CommonAssertions_1.CommonAssertions();
        this.schemaAssertions = new SchemaAssertions_1.SchemaAssertions();
        this.setTokenAssertions = new SetTokenAssertions_1.SetTokenAssertions(web3);
        this.rebalancingSetToken = new wrappers_1.RebalancingSetTokenWrapper(web3);
        this.setToken = new wrappers_1.SetTokenWrapper(web3);
        this.addressToAddressWhiteList = new wrappers_1.AddressToAddressWhiteListWrapper(web3);
    }
    /**
     * Makes the following assertions on a Set Token:
     * 1) Set quantity is a multiple of the natural unit
     * 2) The caller has sufficient component balance and allowance
     *
     */
    IssuanceAssertions.prototype.assertSetTokenIssue = function (setTokenAddress, setTokenQuantity, transactionCaller, transferProxyAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.schemaAssertions.isValidAddress('transactionCaller', transactionCaller);
                        this.schemaAssertions.isValidAddress('setAddress', setTokenAddress);
                        this.commonAssertions.greaterThanZero(setTokenQuantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(setTokenQuantity));
                        return [4 /*yield*/, this.setTokenAssertions.isMultipleOfNaturalUnit(setTokenAddress, setTokenQuantity, 'Issuance quantity')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setTokenAssertions.hasSufficientBalances(setTokenAddress, transactionCaller, setTokenQuantity)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.setTokenAssertions.hasSufficientAllowances(setTokenAddress, transactionCaller, transferProxyAddress, setTokenQuantity)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Makes the following assertions on a Rebalancing Set Token Issuance:
     * 1) Rebalancing Set quantity is a multiple of the natural unit
     * 2) The caller has sufficient component balance and allowance based on the implied
     *    base SetToken issue quantity
     */
    IssuanceAssertions.prototype.assertRebalancingSetTokenIssue = function (rebalancingSetTokenAddress, rebalancingSetTokenQuantity, transactionCaller, transferProxyAddress, cTokenWhiteListAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var baseSetTokenAddress, baseSetTokenQuantity, cTokenAddresses;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.schemaAssertions.isValidAddress('transactionCaller', transactionCaller);
                        this.schemaAssertions.isValidAddress('setAddress', rebalancingSetTokenAddress);
                        this.commonAssertions.greaterThanZero(rebalancingSetTokenQuantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(rebalancingSetTokenQuantity));
                        return [4 /*yield*/, this.setTokenAssertions.isMultipleOfNaturalUnit(rebalancingSetTokenAddress, rebalancingSetTokenQuantity, 'Issuance quantity')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.currentSet(rebalancingSetTokenAddress)];
                    case 2:
                        baseSetTokenAddress = _a.sent();
                        return [4 /*yield*/, this.getBaseSetIssuanceRequiredQuantity(rebalancingSetTokenAddress, rebalancingSetTokenQuantity)];
                    case 3:
                        baseSetTokenQuantity = _a.sent();
                        if (!cTokenWhiteListAddress) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.addressToAddressWhiteList.validAddresses(cTokenWhiteListAddress)];
                    case 4:
                        cTokenAddresses = _a.sent();
                        return [4 /*yield*/, this.setTokenAssertions.hasSufficientBalances(baseSetTokenAddress, transactionCaller, baseSetTokenQuantity, cTokenAddresses)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.setTokenAssertions.hasSufficientAllowances(baseSetTokenAddress, transactionCaller, transferProxyAddress, baseSetTokenQuantity, cTokenAddresses)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.setTokenAssertions.hasSufficientBalances(baseSetTokenAddress, transactionCaller, baseSetTokenQuantity)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.setTokenAssertions.hasSufficientAllowances(baseSetTokenAddress, transactionCaller, transferProxyAddress, baseSetTokenQuantity)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Makes the following assertions on a Rebalancing Set Token Issuance:
     * 1) Rebalancing Set quantity is a multiple of the natural unit
     * 2) The caller has sufficient component balance and allowance based on the implied
     *    base SetToken issue quantity
     * 3) Validate wrapped ether is a component
     * 4) Validate there is enough ether for issuance
     */
    IssuanceAssertions.prototype.assertRebalancingSetTokenIssueWrappingEther = function (rebalancingSetTokenAddress, rebalancingSetTokenQuantity, transactionCaller, transferProxyAddress, wrappedEtherAddress, etherValue, cTokenWhiteListAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var baseSetTokenAddress, baseSetTokenQuantity, cTokenAddresses, requiredWrappedEtherQuantity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Do all the normal asserts
                        this.schemaAssertions.isValidAddress('transactionCaller', transactionCaller);
                        this.schemaAssertions.isValidAddress('setAddress', rebalancingSetTokenAddress);
                        this.commonAssertions.greaterThanZero(rebalancingSetTokenQuantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(rebalancingSetTokenQuantity));
                        return [4 /*yield*/, this.setTokenAssertions.isMultipleOfNaturalUnit(rebalancingSetTokenAddress, rebalancingSetTokenQuantity, 'Issuance quantity')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.currentSet(rebalancingSetTokenAddress)];
                    case 2:
                        baseSetTokenAddress = _a.sent();
                        return [4 /*yield*/, this.getBaseSetIssuanceRequiredQuantity(rebalancingSetTokenAddress, rebalancingSetTokenQuantity)];
                    case 3:
                        baseSetTokenQuantity = _a.sent();
                        if (!cTokenWhiteListAddress) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.addressToAddressWhiteList.validAddresses(cTokenWhiteListAddress)];
                    case 4:
                        cTokenAddresses = _a.sent();
                        // Check sufficient base Set components, excluding Ether and cTokens from whitelist
                        return [4 /*yield*/, this.setTokenAssertions.hasSufficientBalances(baseSetTokenAddress, transactionCaller, baseSetTokenQuantity, cTokenAddresses.concat([wrappedEtherAddress]))];
                    case 5:
                        // Check sufficient base Set components, excluding Ether and cTokens from whitelist
                        _a.sent();
                        // Check sufficient base Set components, excluding Ether and cTokens
                        return [4 /*yield*/, this.setTokenAssertions.hasSufficientAllowances(baseSetTokenAddress, transactionCaller, transferProxyAddress, baseSetTokenQuantity, cTokenAddresses.concat([wrappedEtherAddress]))];
                    case 6:
                        // Check sufficient base Set components, excluding Ether and cTokens
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 7: 
                    // Check sufficient base Set components, excluding Ether
                    return [4 /*yield*/, this.setTokenAssertions.hasSufficientBalances(baseSetTokenAddress, transactionCaller, baseSetTokenQuantity, [wrappedEtherAddress])];
                    case 8:
                        // Check sufficient base Set components, excluding Ether
                        _a.sent();
                        // Check sufficient base Set components, excluding Ether
                        return [4 /*yield*/, this.setTokenAssertions.hasSufficientAllowances(baseSetTokenAddress, transactionCaller, transferProxyAddress, baseSetTokenQuantity, [wrappedEtherAddress])];
                    case 9:
                        // Check sufficient base Set components, excluding Ether
                        _a.sent();
                        _a.label = 10;
                    case 10: 
                    // Check that a base SetToken component is ether
                    return [4 /*yield*/, this.setTokenAssertions.isComponent(baseSetTokenAddress, wrappedEtherAddress)];
                    case 11:
                        // Check that a base SetToken component is ether
                        _a.sent();
                        return [4 /*yield*/, this.getWrappedEtherRequiredQuantity(baseSetTokenAddress, baseSetTokenQuantity, wrappedEtherAddress)];
                    case 12:
                        requiredWrappedEtherQuantity = _a.sent();
                        this.commonAssertions.isGreaterOrEqualThan(etherValue, requiredWrappedEtherQuantity, 'Ether value must be greater than required wrapped ether quantity');
                        return [2 /*return*/];
                }
            });
        });
    };
    IssuanceAssertions.prototype.assertRedeem = function (setTokenAddress, setTokenQuantity, transactionCaller) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.schemaAssertions.isValidAddress('transactionCaller', transactionCaller);
                        this.schemaAssertions.isValidAddress('setAddress', setTokenAddress);
                        this.commonAssertions.greaterThanZero(setTokenQuantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(setTokenQuantity));
                        return [4 /*yield*/, this.setTokenAssertions.isMultipleOfNaturalUnit(setTokenAddress, setTokenQuantity, 'Issuance quantity')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.erc20Assertions.hasSufficientBalanceAsync(setTokenAddress, transactionCaller, setTokenQuantity)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /* ============ Private Functions ============ */
    /**
     * Given a rebalancing SetToken and a desired issue quantity, calculates the
     * minimum issuable quantity of the base SetToken. If the calculated quantity is initially
     * not a multiple of the base SetToken's natural unit, the quantity is rounded up
     * to the next base set natural unit.
     */
    IssuanceAssertions.prototype.getBaseSetIssuanceRequiredQuantity = function (rebalancingSetTokenAddress, rebalancingSetTokenQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, unitShares, naturalUnit, baseSetTokenAddress, requiredBaseSetQuantity, baseSetNaturalUnit, roundDownQuantity;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.rebalancingSetToken.unitShares(rebalancingSetTokenAddress),
                            this.rebalancingSetToken.naturalUnit(rebalancingSetTokenAddress),
                            this.rebalancingSetToken.currentSet(rebalancingSetTokenAddress),
                        ])];
                    case 1:
                        _a = _b.sent(), unitShares = _a[0], naturalUnit = _a[1], baseSetTokenAddress = _a[2];
                        requiredBaseSetQuantity = rebalancingSetTokenQuantity.mul(unitShares).div(naturalUnit);
                        return [4 /*yield*/, this.setToken.naturalUnit(baseSetTokenAddress)];
                    case 2:
                        baseSetNaturalUnit = _b.sent();
                        if (requiredBaseSetQuantity.mod(baseSetNaturalUnit).gt(new util_1.BigNumber(0))) {
                            roundDownQuantity = requiredBaseSetQuantity.mod(baseSetNaturalUnit);
                            requiredBaseSetQuantity = requiredBaseSetQuantity.sub(roundDownQuantity).add(baseSetNaturalUnit);
                        }
                        return [2 /*return*/, requiredBaseSetQuantity];
                }
            });
        });
    };
    /**
     * Given a base SetToken and a desired issue quantity, calculates the
     * required wrapped Ether quantity.
     */
    IssuanceAssertions.prototype.getWrappedEtherRequiredQuantity = function (baseSetAddress, baseSetQuantity, wrappedEther) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, baseSetComponents, baseSetUnits, baseSetNaturalUnit, indexOfWrappedEther, wrappedEtherUnits;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.setToken.getComponents(baseSetAddress),
                            this.setToken.getUnits(baseSetAddress),
                            this.setToken.naturalUnit(baseSetAddress),
                        ])];
                    case 1:
                        _a = _b.sent(), baseSetComponents = _a[0], baseSetUnits = _a[1], baseSetNaturalUnit = _a[2];
                        indexOfWrappedEther = baseSetComponents.indexOf(wrappedEther);
                        wrappedEtherUnits = baseSetUnits[indexOfWrappedEther];
                        return [2 /*return*/, baseSetQuantity.mul(wrappedEtherUnits).div(baseSetNaturalUnit)];
                }
            });
        });
    };
    return IssuanceAssertions;
}());
exports.IssuanceAssertions = IssuanceAssertions;
//# sourceMappingURL=IssuanceAssertions.js.map