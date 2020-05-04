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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock('set-protocol-contracts');
jest.setTimeout(30000);
var ABIDecoder = __importStar(require("abi-decoder"));
var chai = __importStar(require("chai"));
var setProtocolUtils = __importStar(require("set-protocol-utils"));
var web3_1 = __importDefault(require("web3"));
var set_protocol_contracts_1 = require("set-protocol-contracts");
var accounts_1 = require("@src/constants/accounts");
var wrappers_1 = require("@src/wrappers");
var constants_1 = require("@src/constants");
var helpers_1 = require("@test/helpers");
var util_1 = require("@src/util");
var chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(util_1.BigNumber));
var expect = chai.expect;
var contract = require('truffle-contract');
var web3 = new web3_1.default('http://localhost:8545');
var SetTestUtils = setProtocolUtils.SetProtocolTestUtils, SetUtils = setProtocolUtils.SetProtocolUtils, Web3Utils = setProtocolUtils.Web3Utils;
var web3Utils = new Web3Utils(web3);
var setUtils = new SetUtils(web3);
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('ExchangeIssuanceModuleWrapper', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var wrappedEtherMock;
    var exchangeIssuanceModule;
    var exchangeIssuanceWrapper;
    beforeAll(function () {
        ABIDecoder.addABI(coreContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(coreContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _b.sent();
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 2:
                    _a = _b.sent(), core = _a[0], transferProxy = _a[1], vault = _a[2], setTokenFactory = _a[3];
                    return [4 /*yield*/, helpers_1.deployExchangeIssuanceModuleAsync(web3, core, vault)];
                case 3:
                    exchangeIssuanceModule = _b.sent();
                    return [4 /*yield*/, helpers_1.addModuleAsync(core, exchangeIssuanceModule.address)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, helpers_1.addAuthorizationAsync(transferProxy, exchangeIssuanceModule.address)];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, helpers_1.addAuthorizationAsync(vault, exchangeIssuanceModule.address)];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, helpers_1.deployZeroExExchangeWrapperContract(web3, SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS, SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS, SetTestUtils.ZERO_EX_TOKEN_ADDRESS, transferProxy, core)];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, helpers_1.deployWethMockAsync(web3, constants_1.NULL_ADDRESS, constants_1.ZERO)];
                case 8:
                    wrappedEtherMock = _b.sent();
                    exchangeIssuanceWrapper = new wrappers_1.ExchangeIssuanceModuleWrapper(web3, exchangeIssuanceModule.address);
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3Utils.revertToSnapshot(currentSnapshotId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('exchangeIssue', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, exchangeIssuanceWrapper.exchangeIssue(subjectExchangeIssuanceData, subjectExchangeOrdersData, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectExchangeIssuanceData, subjectExchangeOrdersData, subjectCaller, zeroExOrderMaker, baseSetToken, baseSetNaturalUnit, exchangeIssuanceSetAddress, exchangeIssuanceQuantity, exchangeIssuancePaymentToken, exchangeIssuancePaymentTokenAmount, exchangeIssuanceRequiredComponents, exchangeIssuanceRequiredComponentAmounts, zeroExOrder;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var baseSetComponent, componentAddresses, componentUnits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectCaller = accounts_1.ACCOUNTS[1].address;
                            // Create component token (owned by 0x order maker)
                            zeroExOrderMaker = accounts_1.ACCOUNTS[2].address;
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(1, [18], web3, zeroExOrderMaker)];
                        case 1:
                            baseSetComponent = (_a.sent())[0];
                            componentAddresses = [baseSetComponent.address];
                            componentUnits = [new util_1.BigNumber(Math.pow(10, 10))];
                            baseSetNaturalUnit = new util_1.BigNumber(Math.pow(10, 9));
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 2:
                            baseSetToken = _a.sent();
                            // Generate exchange issue data
                            exchangeIssuanceSetAddress = baseSetToken.address;
                            exchangeIssuanceQuantity = new util_1.BigNumber(Math.pow(10, 10));
                            exchangeIssuancePaymentToken = wrappedEtherMock.address;
                            exchangeIssuancePaymentTokenAmount = new util_1.BigNumber(Math.pow(10, 10));
                            exchangeIssuanceRequiredComponents = componentAddresses;
                            exchangeIssuanceRequiredComponentAmounts = componentUnits.map(function (unit) { return unit.mul(exchangeIssuanceQuantity).div(baseSetNaturalUnit); });
                            subjectExchangeIssuanceData = {
                                setAddress: exchangeIssuanceSetAddress,
                                sendTokenExchangeIds: [SetUtils.EXCHANGES.ZERO_EX],
                                sendTokens: [exchangeIssuancePaymentToken],
                                sendTokenAmounts: [exchangeIssuancePaymentTokenAmount],
                                quantity: exchangeIssuanceQuantity,
                                receiveTokens: exchangeIssuanceRequiredComponents,
                                receiveTokenAmounts: exchangeIssuanceRequiredComponentAmounts,
                            };
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent], SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS, zeroExOrderMaker)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, setUtils.generateZeroExSignedFillOrder(constants_1.NULL_ADDRESS, // senderAddress
                                zeroExOrderMaker, // makerAddress
                                constants_1.NULL_ADDRESS, // takerAddress
                                constants_1.ZERO, // makerFee
                                constants_1.ZERO, // takerFee
                                subjectExchangeIssuanceData.receiveTokenAmounts[0], // makerAssetAmount
                                exchangeIssuancePaymentTokenAmount, // takerAssetAmount
                                exchangeIssuanceRequiredComponents[0], // makerAssetAddress
                                exchangeIssuancePaymentToken, // takerAssetAddress
                                SetUtils.generateSalt(), // salt
                                SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
                                constants_1.NULL_ADDRESS, // feeRecipientAddress
                                SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
                                exchangeIssuancePaymentTokenAmount)];
                        case 4:
                            // Create 0x order for the component, using weth(4) paymentToken as default
                            zeroExOrder = _a.sent();
                            subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder]);
                            // Subject caller needs to wrap ether
                            return [4 /*yield*/, wrappedEtherMock.deposit.sendTransactionAsync({ from: subjectCaller, value: exchangeIssuancePaymentTokenAmount.toString() })];
                        case 5:
                            // Subject caller needs to wrap ether
                            _a.sent();
                            return [4 /*yield*/, wrappedEtherMock.approve.sendTransactionAsync(transferProxy.address, exchangeIssuancePaymentTokenAmount, { from: subjectCaller })];
                        case 6:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('issues the Set to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousSetTokenBalance, expectedSetTokenBalance, currentRBSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, baseSetToken.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousSetTokenBalance = _a.sent();
                            expectedSetTokenBalance = previousSetTokenBalance.add(exchangeIssuanceQuantity);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, baseSetToken.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            currentRBSetTokenBalance = _a.sent();
                            expect(expectedSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('exchangeRedeem', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, exchangeIssuanceWrapper.exchangeRedeem(subjectExchangeIssuanceData, subjectExchangeOrdersData, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectExchangeIssuanceData, subjectExchangeOrdersData, subjectCaller, zeroExOrderMaker, baseSetToken, baseSetNaturalUnit, exchangeIssuanceSetAddress, exchangeIssuanceQuantity, exchangeIssuanceSendTokenExchangeIds, exchangeIssuanceSendTokens, exchangeIssuanceSendTokenAmounts, exchangeIssuanceReceiveTokens, exchangeIssuanceReceiveTokenAmounts, zeroExOrder;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var baseSetComponent, componentAddresses, componentUnits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectCaller = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(1, [18], web3, subjectCaller)];
                        case 1:
                            baseSetComponent = (_a.sent())[0];
                            zeroExOrderMaker = accounts_1.ACCOUNTS[2].address;
                            componentAddresses = [baseSetComponent.address];
                            componentUnits = [new util_1.BigNumber(Math.pow(10, 10))];
                            baseSetNaturalUnit = new util_1.BigNumber(Math.pow(10, 9));
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 2:
                            baseSetToken = _a.sent();
                            // Generate exchange issuance data
                            exchangeIssuanceSetAddress = baseSetToken.address;
                            exchangeIssuanceQuantity = new util_1.BigNumber(Math.pow(10, 10));
                            exchangeIssuanceSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX];
                            exchangeIssuanceSendTokens = [baseSetComponent.address];
                            exchangeIssuanceSendTokenAmounts = componentUnits.map(function (unit) { return unit.mul(exchangeIssuanceQuantity).div(baseSetNaturalUnit); });
                            exchangeIssuanceReceiveTokens = [wrappedEtherMock.address];
                            exchangeIssuanceReceiveTokenAmounts = [new util_1.BigNumber(Math.pow(10, 10))];
                            subjectExchangeIssuanceData = {
                                setAddress: exchangeIssuanceSetAddress,
                                sendTokenExchangeIds: exchangeIssuanceSendTokenExchangeIds,
                                sendTokens: exchangeIssuanceSendTokens,
                                sendTokenAmounts: exchangeIssuanceSendTokenAmounts,
                                quantity: exchangeIssuanceQuantity,
                                receiveTokens: exchangeIssuanceReceiveTokens,
                                receiveTokenAmounts: exchangeIssuanceReceiveTokenAmounts,
                            };
                            return [4 /*yield*/, setUtils.generateZeroExSignedFillOrder(constants_1.NULL_ADDRESS, // senderAddress
                                zeroExOrderMaker, // makerAddress
                                constants_1.NULL_ADDRESS, // takerAddress
                                constants_1.ZERO, // makerFee
                                constants_1.ZERO, // takerFee
                                subjectExchangeIssuanceData.receiveTokenAmounts[0], // makerAssetAmount
                                exchangeIssuanceSendTokenAmounts[0], // takerAssetAmount
                                exchangeIssuanceReceiveTokens[0], // makerAssetAddress
                                exchangeIssuanceSendTokens[0], // takerAssetAddress
                                SetUtils.generateSalt(), // salt
                                SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
                                constants_1.NULL_ADDRESS, // feeRecipientAddress
                                SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
                                exchangeIssuanceSendTokenAmounts[0])];
                        case 3:
                            // Create 0x order for the component, using weth(4) paymentToken as default
                            zeroExOrder = _a.sent();
                            subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder]);
                            // 0x maker needs to wrap ether
                            return [4 /*yield*/, wrappedEtherMock.deposit.sendTransactionAsync({ from: zeroExOrderMaker, value: exchangeIssuanceReceiveTokenAmounts[0].toString() })];
                        case 4:
                            // 0x maker needs to wrap ether
                            _a.sent();
                            // 0x maker needs to approve to the 0x proxy
                            return [4 /*yield*/, wrappedEtherMock.approve.sendTransactionAsync(SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS, exchangeIssuanceReceiveTokenAmounts[0], { from: zeroExOrderMaker })];
                        case 5:
                            // 0x maker needs to approve to the 0x proxy
                            _a.sent();
                            // Caller approves set to the transfer proxy
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent], transferProxy.address, subjectCaller)];
                        case 6:
                            // Caller approves set to the transfer proxy
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(baseSetToken.address, exchangeIssuanceQuantity, { from: subjectCaller })];
                        case 7:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('redeems the Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousSetTokenBalance, expectedSetTokenBalance, currentRBSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, baseSetToken.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousSetTokenBalance = _a.sent();
                            expectedSetTokenBalance = previousSetTokenBalance.sub(exchangeIssuanceQuantity);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, baseSetToken.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            currentRBSetTokenBalance = _a.sent();
                            expect(expectedSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('increments the correct amount of Sent token', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingBalance, expectedNewBalance, newBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, wrappedEtherMock.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            existingBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedNewBalance = existingBalance.add(exchangeIssuanceReceiveTokenAmounts[0]);
                            return [4 /*yield*/, wrappedEtherMock.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            newBalance = _a.sent();
                            return [4 /*yield*/, expect(newBalance).to.be.bignumber.equal(expectedNewBalance)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=ExchangeIssuanceModuleWrapper.spec.js.map