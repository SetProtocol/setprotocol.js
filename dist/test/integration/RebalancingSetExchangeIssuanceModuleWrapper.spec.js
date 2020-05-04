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
describe('RebalancingSetExchangeIssuanceModuleWrapper', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var rebalancingSetTokenFactory;
    var rebalancingSetExchangeIssuanceModule;
    var wrappedEtherMock;
    var exchangeIssuanceModule;
    var rebalancingSetExchangeIssuanceModuleWrapper;
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
                    _a = _b.sent(), core = _a[0], transferProxy = _a[1], vault = _a[2], setTokenFactory = _a[3], rebalancingSetTokenFactory = _a[4];
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
                    return [4 /*yield*/, helpers_1.deployRebalancingSetExchangeIssuanceModuleAsync(web3, core, transferProxy, exchangeIssuanceModule, wrappedEtherMock, vault)];
                case 9:
                    rebalancingSetExchangeIssuanceModule = _b.sent();
                    return [4 /*yield*/, helpers_1.addModuleAsync(core, rebalancingSetExchangeIssuanceModule.address)];
                case 10:
                    _b.sent();
                    rebalancingSetExchangeIssuanceModuleWrapper = new wrappers_1.RebalancingSetExchangeIssuanceModuleWrapper(web3, rebalancingSetExchangeIssuanceModule.address);
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
    describe('#issueRebalancingSetWithEther', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetExchangeIssuanceModuleWrapper.issueRebalancingSetWithEther(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceData, subjectExchangeOrdersData, { from: subjectCaller, value: subjectEther.toString() })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceData, subjectExchangeOrdersData, subjectCaller, subjectEther, customSalt, customExpirationTimeSeconds, zeroExOrderMaker, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, exchangeIssuanceSetAddress, exchangeIssuanceQuantity, exchangeIssuancePaymentToken, exchangeIssuancePaymentTokenAmount, exchangeIssuanceRequiredComponents, exchangeIssuanceRequiredComponentAmounts, zeroExOrder;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var baseSetComponent, componentAddresses, componentUnits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
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
                            // Create the Rebalancing Set
                            rebalancingUnitShares = constants_1.DEFAULT_UNIT_SHARES;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, accounts_1.DEFAULT_ACCOUNT, baseSetToken.address, constants_1.ONE_DAY_IN_SECONDS)];
                        case 3:
                            rebalancingSetToken = _a.sent();
                            subjectEther = new util_1.BigNumber(Math.pow(10, 10));
                            // Generate exchange issue data
                            exchangeIssuanceSetAddress = baseSetToken.address;
                            exchangeIssuanceQuantity = new util_1.BigNumber(Math.pow(10, 10));
                            exchangeIssuancePaymentToken = wrappedEtherMock.address;
                            exchangeIssuancePaymentTokenAmount = subjectEther;
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
                        case 4:
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
                                customSalt || SetUtils.generateSalt(), // salt
                                SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
                                constants_1.NULL_ADDRESS, // feeRecipientAddress
                                customExpirationTimeSeconds || SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
                                exchangeIssuancePaymentTokenAmount)];
                        case 5:
                            // Create 0x order for the component, using weth(4) paymentToken as default
                            zeroExOrder = _a.sent();
                            subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder]);
                            subjectRebalancingSetAddress = rebalancingSetToken.address;
                            subjectRebalancingSetQuantity = exchangeIssuanceQuantity.mul(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                .div(rebalancingUnitShares);
                            subjectCaller = accounts_1.ACCOUNTS[1].address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('issues the rebalancing Set to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousRBSetTokenBalance, expectedRBSetTokenBalance, currentRBSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousRBSetTokenBalance = _a.sent();
                            expectedRBSetTokenBalance = previousRBSetTokenBalance.add(subjectRebalancingSetQuantity);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            currentRBSetTokenBalance = _a.sent();
                            expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('#issueRebalancingSetWithEtherTransactionData', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingSetExchangeIssuanceModuleWrapper.issueRebalancingSetWithEtherTransactionData(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceData, subjectExchangeOrdersData, { from: subjectCaller, value: subjectEther.toString() })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customSalt = new util_1.BigNumber(1000);
                            customExpirationTimeSeconds = new util_1.BigNumber(1902951096);
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customSalt = undefined;
                            customExpirationTimeSeconds = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('issues the rebalancing Set to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                        var data;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    data = _a.sent();
                                    expect(data).to.equal('0xb7fd4d0700000000000000000000000020a052db6ea52533804b768d7b43fe732a83e67d0000000000' +
                                        '0000000000000000000000000000000000000000000002540be400000000000000000000000000000000' +
                                        '000000000000000000000000000000008000000000000000000000000000000000000000000000000000' +
                                        '000000000002a0000000000000000000000000746d084aed3a220a120162008ed3912c29dbef71000000' +
                                        '00000000000000000000000000000000000000000000000002540be40000000000000000000000000000' +
                                        '000000000000000000000000000000000000e00000000000000000000000000000000000000000000000' +
                                        '000000000000000120000000000000000000000000000000000000000000000000000000000000016000' +
                                        '000000000000000000000000000000000000000000000000000000000001a00000000000000000000000' +
                                        '0000000000000000000000000000000000000001e0000000000000000000000000000000000000000000' +
                                        '000000000000000000000100000000000000000000000000000000000000000000000000000000000000' +
                                        '010000000000000000000000000000000000000000000000000000000000000001000000000000000000' +
                                        '000000a9a65d631f8c8577f543b64b35909030c84676a200000000000000000000000000000000000000' +
                                        '000000000000000000000000010000000000000000000000000000000000000000000000000000000254' +
                                        '0be400000000000000000000000000000000000000000000000000000000000000000100000000000000' +
                                        '000000000058787e5441be9548440086495ea8583394e3427f0000000000000000000000000000000000' +
                                        '000000000000000000000000000001000000000000000000000000000000000000000000000000000000' +
                                        '174876e80000000000000000000000000000000000000000000000000000000000000002620000000000' +
                                        '000000000000000000000000000000000000000000000000000001000000000000000000000000000000' +
                                        '000000000000000000000000000000000100000000000000000000000000000000000000000000000000' +
                                        '000000000002020000000000000000000000000000000000000000000000000000000000000042000000' +
                                        '00000000000000000000000000000000000000000000000002540be4001cdaf75a34923557b37b4b29fb' +
                                        'a81f372d7b3f56137fe8edc039222ef48f94ab803e22dd1350f5645a4dc819bb65710f04eb6f264ad032' +
                                        '1b724e95f5e920142d5803000000000000000000000000e36ea790bc9d7ab70c55260c66d52b1eca985f' +
                                        '840000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                                        '000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                                        '000000000000000000000000000000000000000000000000000000000000000000000000000000001748' +
                                        '76e80000000000000000000000000000000000000000000000000000000002540be40000000000000000' +
                                        '000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                                        '000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                                        '00716cbab800000000000000000000000000000000000000000000000000000000000003e80000000000' +
                                        '0000000000000058787e5441be9548440086495ea8583394e3427f000000000000000000000000a9a65d' +
                                        '631f8c8577f543b64b35909030c84676a200000000000000000000000000000000000000000000000000' +
                                        '0000000000');
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('#issueRebalancingSetWithEtherGasEstimate', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingSetExchangeIssuanceModuleWrapper.issueRebalancingSetWithEtherGasEstimate(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceData, subjectExchangeOrdersData, { from: subjectCaller, value: subjectEther.toString() })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customSalt = new util_1.BigNumber(1000);
                            customExpirationTimeSeconds = new util_1.BigNumber(1902951096);
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customSalt = undefined;
                            customExpirationTimeSeconds = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('issues the rebalancing Set to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                        var data;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    data = _a.sent();
                                    expect(data).to.equal(829650);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#redeemRebalancingSetIntoEther', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetExchangeIssuanceModuleWrapper.redeemRebalancingSetIntoEther(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceData, subjectExchangeOrdersData, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceData, subjectExchangeOrdersData, subjectCaller, subjectEther, customSalt, customExpirationTimeSeconds, zeroExOrderMaker, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, exchangeIssuanceSetAddress, exchangeIssuanceQuantity, exchangeIssuanceSendTokenExchangeIds, exchangeIssuanceSendTokens, exchangeIssuanceSendTokenAmounts, exchangeIssuanceReceiveTokens, exchangeIssuanceReceiveTokenAmounts, zeroExOrder;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var baseSetComponent, componentAddresses, componentUnits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectCaller = accounts_1.ACCOUNTS[1].address;
                            zeroExOrderMaker = accounts_1.ACCOUNTS[2].address;
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(1, [18], web3, subjectCaller)];
                        case 1:
                            baseSetComponent = (_a.sent())[0];
                            componentAddresses = [baseSetComponent.address];
                            componentUnits = [new util_1.BigNumber(Math.pow(10, 10))];
                            baseSetNaturalUnit = new util_1.BigNumber(Math.pow(10, 9));
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 2:
                            baseSetToken = _a.sent();
                            // Create the Rebalancing Set
                            rebalancingUnitShares = constants_1.DEFAULT_UNIT_SHARES;
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, accounts_1.DEFAULT_ACCOUNT, baseSetToken.address, constants_1.ONE_DAY_IN_SECONDS)];
                        case 3:
                            rebalancingSetToken = _a.sent();
                            subjectEther = new util_1.BigNumber(Math.pow(10, 10));
                            // Generate exchange issue data
                            exchangeIssuanceSetAddress = baseSetToken.address;
                            exchangeIssuanceQuantity = new util_1.BigNumber(Math.pow(10, 10));
                            exchangeIssuanceSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX];
                            exchangeIssuanceSendTokens = componentAddresses;
                            exchangeIssuanceSendTokenAmounts = componentUnits.map(function (unit) { return unit.mul(exchangeIssuanceQuantity).div(baseSetNaturalUnit); });
                            exchangeIssuanceReceiveTokens = [wrappedEtherMock.address];
                            exchangeIssuanceReceiveTokenAmounts = [subjectEther];
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
                                exchangeIssuanceReceiveTokenAmounts[0], // makerAssetAmount
                                exchangeIssuanceSendTokenAmounts[0], // takerAssetAmount
                                exchangeIssuanceReceiveTokens[0], // makerAssetAddress
                                exchangeIssuanceSendTokens[0], // takerAssetAddress
                                customSalt || SetUtils.generateSalt(), // salt
                                SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
                                constants_1.NULL_ADDRESS, // feeRecipientAddress
                                customExpirationTimeSeconds || SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
                                exchangeIssuanceSendTokenAmounts[0])];
                        case 4:
                            // Create 0x order for the component, using weth(4) paymentToken as default
                            zeroExOrder = _a.sent();
                            subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder]);
                            subjectRebalancingSetAddress = rebalancingSetToken.address;
                            subjectRebalancingSetQuantity = exchangeIssuanceQuantity.mul(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                .div(rebalancingUnitShares);
                            // 0x maker needs to wrap ether
                            return [4 /*yield*/, wrappedEtherMock.deposit.sendTransactionAsync({ from: zeroExOrderMaker, value: exchangeIssuanceReceiveTokenAmounts[0].toString() })];
                        case 5:
                            // 0x maker needs to wrap ether
                            _a.sent();
                            // 0x maker needs to approve to the 0x proxy
                            return [4 /*yield*/, wrappedEtherMock.approve.sendTransactionAsync(SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS, exchangeIssuanceReceiveTokenAmounts[0], { from: zeroExOrderMaker })];
                        case 6:
                            // 0x maker needs to approve to the 0x proxy
                            _a.sent();
                            // Caller approves set to the transfer proxy
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent, baseSetToken], transferProxy.address, subjectCaller)];
                        case 7:
                            // Caller approves set to the transfer proxy
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(baseSetToken.address, exchangeIssuanceQuantity, { from: subjectCaller })];
                        case 8:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, subjectRebalancingSetQuantity, { from: subjectCaller })];
                        case 9:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('redeems the rebalancing Set to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousRBSetTokenBalance, expectedRBSetTokenBalance, currentRBSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousRBSetTokenBalance = _a.sent();
                            expectedRBSetTokenBalance = previousRBSetTokenBalance.sub(subjectRebalancingSetQuantity);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            currentRBSetTokenBalance = _a.sent();
                            expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('increments the callers ether balance appropriately', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousEthBalance, _a, txHash, txReceipt, txn, gasPrice, gasUsed, totalGasInEth, expectedEthBalance, currentEthBalance;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = util_1.BigNumber.bind;
                            return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                        case 1:
                            previousEthBalance = new (_a.apply(util_1.BigNumber, [void 0, _b.sent()]))();
                            return [4 /*yield*/, subject()];
                        case 2:
                            txHash = _b.sent();
                            return [4 /*yield*/, web3.eth.getTransactionReceipt(txHash)];
                        case 3:
                            txReceipt = _b.sent();
                            return [4 /*yield*/, web3.eth.getTransaction(txHash)];
                        case 4:
                            txn = _b.sent();
                            gasPrice = txn.gasPrice;
                            gasUsed = txReceipt.gasUsed;
                            totalGasInEth = new util_1.BigNumber(gasPrice).mul(gasUsed);
                            expectedEthBalance = previousEthBalance.add(subjectEther).sub(totalGasInEth);
                            return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                        case 5:
                            currentEthBalance = _b.sent();
                            expect(currentEthBalance).to.bignumber.equal(expectedEthBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('#redeemRebalancingSetIntoEtherTransactionData', function () { return __awaiter(_this, void 0, void 0, function () {
                function subject() {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, rebalancingSetExchangeIssuanceModuleWrapper.redeemRebalancingSetIntoEtherTransactionData(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceData, subjectExchangeOrdersData, { from: subjectCaller })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                }
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customSalt = new util_1.BigNumber(1000);
                            customExpirationTimeSeconds = new util_1.BigNumber(1902951096);
                            return [2 /*return*/];
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customSalt = undefined;
                            customExpirationTimeSeconds = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('issues the rebalancing Set to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                        var data;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    data = _a.sent();
                                    expect(data).to.equal('0xe8bf981d00000000000000000000000020a052db6ea52533804b768d7b43fe732a83e67d00000000000' +
                                        '000000000000000000000000000000000000000000002540be40000000000000000000000000000000000' +
                                        '0000000000000000000000000000008000000000000000000000000000000000000000000000000000000' +
                                        '000000002a0000000000000000000000000746d084aed3a220a120162008ed3912c29dbef710000000000' +
                                        '0000000000000000000000000000000000000000000002540be4000000000000000000000000000000000' +
                                        '0000000000000000000000000000000e00000000000000000000000000000000000000000000000000000' +
                                        '0000000001200000000000000000000000000000000000000000000000000000000000000160000000000' +
                                        '00000000000000000000000000000000000000000000000000001a0000000000000000000000000000000' +
                                        '00000000000000000000000000000001e0000000000000000000000000000000000000000000000000000' +
                                        '0000000000001000000000000000000000000000000000000000000000000000000000000000100000000' +
                                        '0000000000000000000000000000000000000000000000000000000100000000000000000000000058787' +
                                        'e5441be9548440086495ea8583394e3427f00000000000000000000000000000000000000000000000000' +
                                        '00000000000001000000000000000000000000000000000000000000000000000000174876e8000000000' +
                                        '000000000000000000000000000000000000000000000000000000001000000000000000000000000a9a6' +
                                        '5d631f8c8577f543b64b35909030c84676a20000000000000000000000000000000000000000000000000' +
                                        '00000000000000100000000000000000000000000000000000000000000000000000002540be400000000' +
                                        '0000000000000000000000000000000000000000000000000000000262000000000000000000000000000' +
                                        '0000000000000000000000000000000000001000000000000000000000000000000000000000000000000' +
                                        '0000000000000001000000000000000000000000000000000000000000000000000000000000020200000' +
                                        '0000000000000000000000000000000000000000000000000000000004200000000000000000000000000' +
                                        '0000000000000000000000000000174876e8001cd300a45883c8e13b91fbab35c07fff0cbe0e3ba57559f' +
                                        '9b114c4e6f44f2dad253e51efcdac6e82bbf4b3b130b9b1b4e759301a1b0019f97d90a2da016f03118e03' +
                                        '000000000000000000000000e36ea790bc9d7ab70c55260c66d52b1eca985f84000000000000000000000' +
                                        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                                        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                                        '000000000000000000000000000000000000000000000000000000002540be40000000000000000000000' +
                                        '0000000000000000000000000000000000174876e80000000000000000000000000000000000000000000' +
                                        '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000' +
                                        '0000000000000000000000000000000000000000000000000000000000716cbab80000000000000000000' +
                                        '0000000000000000000000000000000000000000003e8000000000000000000000000a9a65d631f8c8577' +
                                        'f543b64b35909030c84676a200000000000000000000000058787e5441be9548440086495ea8583394e34' +
                                        '27f000000000000000000000000000000000000000000000000000000000000');
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('#redeemRebalancingSetIntoEtherGasEstimate', function () { return __awaiter(_this, void 0, void 0, function () {
                        function subject() {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, rebalancingSetExchangeIssuanceModuleWrapper.redeemRebalancingSetIntoEtherGasEstimate(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceData, subjectExchangeOrdersData, { from: subjectCaller })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            });
                        }
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    customSalt = new util_1.BigNumber(1000);
                                    customExpirationTimeSeconds = new util_1.BigNumber(1902951096);
                                    return [2 /*return*/];
                                });
                            }); });
                            afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    customSalt = undefined;
                                    customExpirationTimeSeconds = undefined;
                                    return [2 /*return*/];
                                });
                            }); });
                            test('issues the rebalancing Set to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                                var data;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, subject()];
                                        case 1:
                                            data = _a.sent();
                                            expect(data).to.equal(834924);
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=RebalancingSetExchangeIssuanceModuleWrapper.spec.js.map