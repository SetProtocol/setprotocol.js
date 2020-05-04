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
var set_protocol_contracts_1 = require("set-protocol-contracts");
var constants_1 = require("../constants");
var wrappers_1 = require("../wrappers");
var util_1 = require("../util");
/**
 * @title IssuanceAPI
 * @author Set Protocol
 *
 * A library for issuing and redeeming Sets
 */
var IssuanceAPI = /** @class */ (function () {
    /**
     * Instantiates a new IssuanceAPI instance that contains methods for issuing and redeeming Sets
     *
     * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param core        An instance of CoreWrapper to interact with the deployed Core contract
     * @param assertions  An instance of the Assertion library
     */
    function IssuanceAPI(web3, core, assertions) {
        this.web3 = web3;
        this.core = core;
        this.assert = assertions;
        this.setToken = new wrappers_1.SetTokenWrapper(this.web3);
        this.erc20 = new wrappers_1.ERC20Wrapper(this.web3);
        this.vault = new wrappers_1.VaultWrapper(this.web3, core.vaultAddress);
    }
    /**
     * Issues a Set to the transaction signer. Must have component tokens in the correct quantites in either
     * the vault or in the signer's wallet. Component tokens must be approved to the Transfer
     * Proxy contract via setTransferProxyAllowanceAsync
     *
     * @param  setAddress    Address Set to issue
     * @param  quantity      Amount of Set to issue. Must be multiple of the natural unit of the Set
     * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return               Transaction hash
     */
    IssuanceAPI.prototype.issueAsync = function (setAddress, quantity, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertIssue(txOpts.from, setAddress, quantity)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.core.issue(setAddress, quantity, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Redeems a Set to the transaction signer, returning the component tokens to the signer's wallet. Use `false` for
     * to `withdraw` to leave redeemed components in vault under the user's address to save gas if rebundling into
     * another Set with similar components
     *
     * @param  setAddress         Address of Set to issue
     * @param  quantity           Amount of Set to redeem. Must be multiple of the natural unit of the Set
     * @param  withdraw           Boolean to withdraw back to signer's wallet or leave in vault. Defaults to true
     * @param  tokensToExclude    Token addresses to exclude from withdrawal
     * @param  txOpts             Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                    Transaction hash
     */
    IssuanceAPI.prototype.redeemAsync = function (setAddress, quantity, withdraw, tokensToExclude, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var setTokenContract, componentAddresses, toExclude_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertRedeem(txOpts.from, setAddress, quantity, withdraw, tokensToExclude)];
                    case 1:
                        _a.sent();
                        if (!withdraw) return [3 /*break*/, 5];
                        return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(setAddress, this.web3, {})];
                    case 2:
                        setTokenContract = _a.sent();
                        return [4 /*yield*/, setTokenContract.getComponents.callAsync()];
                    case 3:
                        componentAddresses = _a.sent();
                        toExclude_1 = constants_1.ZERO;
                        _.each(componentAddresses, function (component, idx) {
                            if (_.includes(tokensToExclude, component)) {
                                toExclude_1 = toExclude_1.plus(new util_1.BigNumber(2).pow(idx));
                            }
                        });
                        return [4 /*yield*/, this.core.redeemAndWithdrawTo(setAddress, quantity, toExclude_1, txOpts)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [4 /*yield*/, this.core.redeem(setAddress, quantity, txOpts)];
                    case 6: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Calculates additional amounts of each component token in a Set needed in order to issue a specific quantity of
     * the Set. This includes token balances a user may have in both the account wallet and the Vault contract. Can be
     * used as `requiredComponents` and `requiredComponentAmounts` inputs for an issuance order
     *
     * @param  setAddress       Address of the Set token for issuance order
     * @param  userAddress     Address of user making the issuance
     * @param  quantity         Amount of the Set token to create as part of issuance order
     * @return                  List of objects conforming to the `Component` interface with address and units of each
     *                            component required for issuance
     */
    IssuanceAPI.prototype.calculateRequiredComponentsAndUnitsAsync = function (setAddress, userAddress, quantity) {
        return __awaiter(this, void 0, void 0, function () {
            var components, componentUnits, naturalUnit, totalUnitsNeeded, requiredComponents;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setToken.getComponents(setAddress)];
                    case 1:
                        components = _a.sent();
                        return [4 /*yield*/, this.setToken.getUnits(setAddress)];
                    case 2:
                        componentUnits = _a.sent();
                        return [4 /*yield*/, this.setToken.naturalUnit(setAddress)];
                    case 3:
                        naturalUnit = _a.sent();
                        totalUnitsNeeded = _.map(componentUnits, function (componentUnit) { return componentUnit.mul(quantity).div(naturalUnit); });
                        requiredComponents = [];
                        // Gather how many components are owned by the user in balance/vault
                        return [4 /*yield*/, Promise.all(components.map(function (componentAddress, index) { return __awaiter(_this, void 0, void 0, function () {
                                var walletBalance, vaultBalance, userTokenbalance, missingUnits, requiredComponent;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.erc20.balanceOf(componentAddress, userAddress)];
                                        case 1:
                                            walletBalance = _a.sent();
                                            return [4 /*yield*/, this.vault.getBalanceInVault(componentAddress, userAddress)];
                                        case 2:
                                            vaultBalance = _a.sent();
                                            userTokenbalance = walletBalance.add(vaultBalance);
                                            missingUnits = totalUnitsNeeded[index].sub(userTokenbalance);
                                            if (missingUnits.gt(constants_1.ZERO)) {
                                                requiredComponent = {
                                                    address: componentAddress,
                                                    unit: missingUnits,
                                                };
                                                requiredComponents.push(requiredComponent);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 4:
                        // Gather how many components are owned by the user in balance/vault
                        _a.sent();
                        return [2 /*return*/, requiredComponents];
                }
            });
        });
    };
    /* ============ Private Assertions ============ */
    IssuanceAPI.prototype.assertIssue = function (transactionCaller, setAddress, quantity) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assert.issuance.assertSetTokenIssue(setAddress, quantity, transactionCaller, this.core.transferProxyAddress)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    IssuanceAPI.prototype.assertRedeem = function (transactionCaller, setAddress, quantity, withdraw, tokensToExclude) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assert.issuance.assertRedeem(setAddress, quantity, transactionCaller)];
                    case 1:
                        _a.sent();
                        _.each(tokensToExclude, function (tokenAddress) {
                            _this.assert.schema.isValidAddress('tokenAddress', tokenAddress);
                        });
                        return [4 /*yield*/, this.assert.vault.hasSufficientSetTokensBalances(this.core.vaultAddress, setAddress, quantity)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return IssuanceAPI;
}());
exports.IssuanceAPI = IssuanceAPI;
//# sourceMappingURL=IssuanceAPI.js.map