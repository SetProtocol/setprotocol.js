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
var chai = __importStar(require("chai"));
var setProtocolUtils = __importStar(require("set-protocol-utils"));
var web3_1 = __importDefault(require("web3"));
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
var accounts_1 = require("@src/constants/accounts");
var api_1 = require("@src/api");
var constants_1 = require("@src/constants");
var assertions_1 = require("@src/assertions");
var helpers_1 = require("@test/helpers");
var util_1 = require("@src/util");
var kyberNetworkHelper_1 = require("@test/helpers/kyberNetworkHelper");
var chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(util_1.BigNumber));
chaiSetup_1.default.configure();
var SetTestUtils = setProtocolUtils.SetProtocolTestUtils, SetUtils = setProtocolUtils.SetProtocolUtils, Web3Utils = setProtocolUtils.Web3Utils;
var expect = chai.expect;
var web3 = new web3_1.default('http://localhost:8545');
var setUtils = new SetUtils(web3);
var web3Utils = new Web3Utils(web3);
var currentSnapshotId;
var ownerAccount = accounts_1.DEFAULT_ACCOUNT;
var kyberReserveOperator = accounts_1.ACCOUNTS[1].address;
var functionCaller = accounts_1.ACCOUNTS[2].address;
var zeroExOrderMaker = accounts_1.ACCOUNTS[3].address;
var kyberNetworkHelper = new kyberNetworkHelper_1.KyberNetworkHelper();
describe('ExchangeIssuanceAPI', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var weth;
    var rebalancingSetTokenFactory;
    var exchangeIssuanceModule;
    var kyberNetworkWrapper;
    var rebalancingSetExchangeIssuanceModule;
    var config;
    var exchangeIssuanceAPI;
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var assertions;
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
                    return [4 /*yield*/, helpers_1.deployZeroExExchangeWrapperContract(web3, SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS, SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS, SetTestUtils.ZERO_EX_TOKEN_ADDRESS, transferProxy, core)];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, helpers_1.deployWethMockAsync(web3, constants_1.NULL_ADDRESS, constants_1.ZERO)];
                case 6:
                    weth = _b.sent();
                    return [4 /*yield*/, helpers_1.deployRebalancingSetExchangeIssuanceModuleAsync(web3, core, transferProxy, exchangeIssuanceModule, weth, vault)];
                case 7:
                    rebalancingSetExchangeIssuanceModule = _b.sent();
                    return [4 /*yield*/, helpers_1.addModuleAsync(core, rebalancingSetExchangeIssuanceModule.address)];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, kyberNetworkHelper.setup()];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, kyberNetworkHelper.fundReserveWithEth(kyberReserveOperator, util_1.ether(90))];
                case 10:
                    _b.sent();
                    return [4 /*yield*/, helpers_1.deployKyberNetworkWrapperContract(web3, kyberNetworkHelper.kyberNetworkProxy, transferProxy, core)];
                case 11:
                    kyberNetworkWrapper = _b.sent();
                    config = {
                        coreAddress: core.address,
                        transferProxyAddress: transferProxy.address,
                        vaultAddress: vault.address,
                        setTokenFactoryAddress: setTokenFactory.address,
                        exchangeIssuanceModuleAddress: exchangeIssuanceModule.address,
                        kyberNetworkWrapperAddress: kyberNetworkWrapper.address,
                        rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
                        rebalanceAuctionModuleAddress: constants_1.NULL_ADDRESS,
                        rebalancingTokenIssuanceModule: constants_1.NULL_ADDRESS,
                        rebalancingSetIssuanceModule: constants_1.NULL_ADDRESS,
                        rebalancingSetExchangeIssuanceModule: rebalancingSetExchangeIssuanceModule.address,
                        wrappedEtherAddress: weth.address,
                        protocolViewerAddress: constants_1.NULL_ADDRESS,
                    };
                    assertions = new assertions_1.Assertions(web3);
                    exchangeIssuanceAPI = new api_1.ExchangeIssuanceAPI(web3, assertions, config);
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
    describe('exchangeIssuance', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, exchangeIssuanceAPI.exchangeIssueAsync(subjectExchangeIssuanceData, subjectExchangeOrders, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectExchangeIssuanceData, subjectExchangeOrders, subjectCaller, zeroExOrderMaker, componentAddresses, baseSetToken, baseSetNaturalUnit, exchangeIssuanceSetAddress, exchangeIssuanceQuantity, exchangeIssuancePaymentToken, exchangeIssuancePaymentTokenAmount, exchangeIssuanceRequiredComponents, exchangeIssuanceRequiredComponentAmounts, zeroExOrder;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var baseSetComponent, alreadyOwnedComponent, componentUnits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectCaller = accounts_1.ACCOUNTS[1].address;
                            // Create component token (owned by 0x order maker)
                            zeroExOrderMaker = accounts_1.ACCOUNTS[2].address;
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(1, [18], web3, zeroExOrderMaker)];
                        case 1:
                            baseSetComponent = (_a.sent())[0];
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(1, [18], web3, subjectCaller)];
                        case 2:
                            alreadyOwnedComponent = (_a.sent())[0];
                            // Create the Set (1 component)
                            componentAddresses = [baseSetComponent.address, alreadyOwnedComponent.address];
                            componentUnits = [new util_1.BigNumber(Math.pow(10, 10)), new util_1.BigNumber(1)];
                            baseSetNaturalUnit = new util_1.BigNumber(Math.pow(10, 9));
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 3:
                            baseSetToken = _a.sent();
                            // Generate exchange issue data
                            exchangeIssuanceSetAddress = baseSetToken.address;
                            exchangeIssuanceQuantity = new util_1.BigNumber(Math.pow(10, 10));
                            exchangeIssuancePaymentToken = weth.address;
                            exchangeIssuancePaymentTokenAmount = new util_1.BigNumber(Math.pow(10, 10));
                            exchangeIssuanceRequiredComponents = [componentAddresses[0]];
                            exchangeIssuanceRequiredComponentAmounts = [componentUnits[0]].map(function (unit) { return unit.mul(exchangeIssuanceQuantity).div(baseSetNaturalUnit); });
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
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([alreadyOwnedComponent], transferProxy.address, subjectCaller)];
                        case 5:
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
                        case 6:
                            // Create 0x order for the component, using weth(4) paymentToken as default
                            zeroExOrder = _a.sent();
                            subjectExchangeOrders = [zeroExOrder];
                            // Subject caller needs to wrap ether
                            return [4 /*yield*/, weth.deposit.sendTransactionAsync({ from: subjectCaller, value: exchangeIssuancePaymentTokenAmount.toString() })];
                        case 7:
                            // Subject caller needs to wrap ether
                            _a.sent();
                            return [4 /*yield*/, weth.approve.sendTransactionAsync(transferProxy.address, exchangeIssuancePaymentTokenAmount, { from: subjectCaller })];
                        case 8:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('issues the Set to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousSetTokenBalance, expectedSetTokenBalance, currentSetTokenBalance;
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
                            currentSetTokenBalance = _a.sent();
                            expect(expectedSetTokenBalance).to.bignumber.equal(currentSetTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the receive tokens are not included in the set\'s components', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceData.receiveTokens[0] = 'NotAComponentAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Component at NotAComponentAddress is not part of the collateralizing set at " + baseSetToken.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the orders array is empty', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeOrders = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The array orders cannot be empty.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantity of set to acquire is zero', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceData.quantity = new util_1.BigNumber(0);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity 0 inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the base set is invalid because it is disabled', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, core.disableSet.sendTransactionAsync(baseSetToken.address)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + baseSetToken.address + " is not a valid Set token address.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the receive token and receive token array lengths are different', function () { return __awaiter(_this, void 0, void 0, function () {
                var arbitraryTokenUnits;
                var _this = this;
                return __generator(this, function (_a) {
                    arbitraryTokenUnits = new util_1.BigNumber(Math.pow(10, 10));
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceData.receiveTokenAmounts.push(arbitraryTokenUnits);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The receiveTokens and receiveTokenAmounts arrays need to be equal lengths.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the quantity to issue is not a multiple of the sets natural unit', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceData.quantity = baseSetNaturalUnit.add(1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Quantity of Exchange issue Params needs to be multiple of natural unit.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the send token amounts array is longer than the send tokens list', function () { return __awaiter(_this, void 0, void 0, function () {
                var arbitraryTokenUnits;
                var _this = this;
                return __generator(this, function (_a) {
                    arbitraryTokenUnits = new util_1.BigNumber(Math.pow(10, 10));
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceData.sendTokenAmounts.push(arbitraryTokenUnits);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The sendTokens and sendTokenAmounts arrays need to be equal lengths.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the send token exchange ids array is longer than the send tokens list', function () { return __awaiter(_this, void 0, void 0, function () {
                var arbitraryTokenUnits;
                var _this = this;
                return __generator(this, function (_a) {
                    arbitraryTokenUnits = new util_1.BigNumber(Math.pow(10, 10));
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceData.sendTokenAmounts.push(arbitraryTokenUnits);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The sendTokens and sendTokenAmounts arrays need to be equal lengths.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when a send token amount is 0', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceData.sendTokenAmounts[0] = new util_1.BigNumber(0);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity 0 inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when a send token exchange id does not map to a known exchange enum', function () { return __awaiter(_this, void 0, void 0, function () {
                var invalidExchangeIdEnum;
                var _this = this;
                return __generator(this, function (_a) {
                    invalidExchangeIdEnum = new util_1.BigNumber(3);
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceData.sendTokenExchangeIds[0] = invalidExchangeIdEnum;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("ExchangeId 3 is invalid.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the receive tokens array is empty', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceData.receiveTokens = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The receiveTokens and receiveTokenAmounts arrays need to be equal lengths.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when a receive token amount is 0', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceData.receiveTokenAmounts[0] = new util_1.BigNumber(0);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity 0 inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('issueRebalancingSetWithEther', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, exchangeIssuanceAPI.issueRebalancingSetWithEtherAsync(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceParams, subjectExchangeOrders, subjectKeepChangeInVault, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT, value: subjectEtherValue })];
                });
            });
        }
        var subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceParams, subjectExchangeOrders, subjectKeepChangeInVault, subjectEtherValue, subjectCaller, baseSetComponent, baseSetComponent2, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, customBaseSetComponentUnits, rebalancingSetIssueQuantity, baseSetIssueQuantity, wethRequiredToIssueBaseSet, totalEther, zeroExSendTokenQuantity, kyberSendTokenQuantity, exchangeIssuanceSendTokenQuantity, exchangeIssueSetAddress, exchangeIssueQuantity, exchangeIssueSendTokenExchangeIds, exchangeIssueSendTokens, exchangeIssueSendTokenAmounts, exchangeIssueReceiveTokens, exchangeIssueReceiveTokenAmounts, zeroExOrder, zeroExMakerAssetAmount, zeroExTakerAssetAmount, zeroExFillAmount, customZeroExMakerAssetAmount, customZeroExTakerAssetAmount, customZeroExFillAmount, kyberTrade, kyberConversionRatePower;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentAddresses, baseSetComponentUnits, componentUnits, impliedRebalancingSetQuantityFromBaseSet, zeroExReceiveTokenAmount, kyberReceiveTokenAmount, exchangeIssuanceParams, makerAsset, takerAsset, maxDestinationQuantity, componentTokenDecimals, sourceTokenDecimals, minimumConversionRate;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount)];
                        case 1:
                            // ----------------------------------------------------------------------
                            // Component and Rebalancing Set Deployment
                            // ----------------------------------------------------------------------
                            // Create non-wrapped Ether component tokens
                            baseSetComponent = _a.sent();
                            return [4 /*yield*/, helpers_1.deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount)];
                        case 2:
                            baseSetComponent2 = _a.sent();
                            componentAddresses = [
                                baseSetComponent.address, baseSetComponent2.address, weth.address,
                            ];
                            baseSetComponentUnits = customBaseSetComponentUnits || new util_1.BigNumber(Math.pow(10, 18));
                            componentUnits = [
                                baseSetComponentUnits, new util_1.BigNumber(Math.pow(10, 18)), new util_1.BigNumber(Math.pow(10, 18)),
                            ];
                            baseSetNaturalUnit = new util_1.BigNumber(Math.pow(10, 17));
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 3:
                            baseSetToken = _a.sent();
                            // Create the Rebalancing Set
                            rebalancingUnitShares = new util_1.BigNumber(Math.pow(10, 18));
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, ownerAccount, baseSetToken.address, constants_1.ONE_DAY_IN_SECONDS, rebalancingUnitShares)];
                        case 4:
                            rebalancingSetToken = _a.sent();
                            // ----------------------------------------------------------------------
                            // Issuance Details
                            // ----------------------------------------------------------------------
                            baseSetIssueQuantity = new util_1.BigNumber(Math.pow(10, 18));
                            impliedRebalancingSetQuantityFromBaseSet = baseSetIssueQuantity
                                .mul(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                .div(rebalancingUnitShares);
                            rebalancingSetIssueQuantity = impliedRebalancingSetQuantityFromBaseSet;
                            wethRequiredToIssueBaseSet =
                                baseSetIssueQuantity.mul(componentUnits[2]).div(baseSetNaturalUnit);
                            // ----------------------------------------------------------------------
                            // Payment / Send Token Details
                            // ----------------------------------------------------------------------
                            kyberSendTokenQuantity = new util_1.BigNumber(Math.pow(10, 18));
                            zeroExSendTokenQuantity = customZeroExFillAmount || new util_1.BigNumber(Math.pow(10, 18));
                            exchangeIssuanceSendTokenQuantity =
                                kyberSendTokenQuantity.plus(zeroExSendTokenQuantity);
                            totalEther = exchangeIssuanceSendTokenQuantity.plus(wethRequiredToIssueBaseSet);
                            // ----------------------------------------------------------------------
                            // Exchange Issuance Set up
                            // ----------------------------------------------------------------------
                            // Generate exchange issue data
                            exchangeIssueSetAddress = baseSetToken.address;
                            exchangeIssueQuantity = baseSetIssueQuantity;
                            exchangeIssueSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX, SetUtils.EXCHANGES.KYBER];
                            exchangeIssueSendTokens = [weth.address, weth.address];
                            exchangeIssueSendTokenAmounts = [zeroExSendTokenQuantity, kyberSendTokenQuantity];
                            zeroExReceiveTokenAmount = componentUnits[0].mul(exchangeIssueQuantity).div(baseSetNaturalUnit);
                            kyberReceiveTokenAmount = componentUnits[1].mul(exchangeIssueQuantity).div(baseSetNaturalUnit);
                            exchangeIssueReceiveTokens = [componentAddresses[0], componentAddresses[1]];
                            exchangeIssueReceiveTokenAmounts = [
                                zeroExReceiveTokenAmount,
                                kyberReceiveTokenAmount,
                            ];
                            exchangeIssuanceParams = {
                                setAddress: exchangeIssueSetAddress,
                                sendTokenExchangeIds: exchangeIssueSendTokenExchangeIds,
                                sendTokens: exchangeIssueSendTokens,
                                sendTokenAmounts: exchangeIssueSendTokenAmounts,
                                quantity: exchangeIssueQuantity,
                                receiveTokens: exchangeIssueReceiveTokens,
                                receiveTokenAmounts: exchangeIssueReceiveTokenAmounts,
                            };
                            makerAsset = exchangeIssueReceiveTokens[0];
                            takerAsset = exchangeIssueSendTokens[0];
                            zeroExMakerAssetAmount = customZeroExMakerAssetAmount || exchangeIssueReceiveTokenAmounts[0];
                            zeroExTakerAssetAmount = customZeroExTakerAssetAmount || exchangeIssueSendTokenAmounts[0];
                            zeroExFillAmount = exchangeIssueSendTokenAmounts[0];
                            return [4 /*yield*/, setUtils.generateZeroExSignedFillOrder(constants_1.NULL_ADDRESS, // senderAddress
                                zeroExOrderMaker, // makerAddress
                                constants_1.NULL_ADDRESS, // takerAddress
                                constants_1.ZERO, // makerFee
                                constants_1.ZERO, // takerFee
                                zeroExMakerAssetAmount, // makerAssetAmount
                                zeroExTakerAssetAmount, // takerAssetAmount
                                makerAsset, // makerAssetAddress
                                takerAsset, // takerAssetAddress
                                SetUtils.generateSalt(), // salt
                                SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
                                constants_1.NULL_ADDRESS, // feeRecipientAddress
                                SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
                                zeroExFillAmount)];
                        case 5:
                            zeroExOrder = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent], SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS, zeroExOrderMaker)];
                        case 6:
                            _a.sent();
                            // Fund zero Ex Order Maker
                            return [4 /*yield*/, helpers_1.transferTokenAsync(baseSetComponent, zeroExOrderMaker, zeroExMakerAssetAmount, ownerAccount)];
                        case 7:
                            // Fund zero Ex Order Maker
                            _a.sent();
                            maxDestinationQuantity = exchangeIssueReceiveTokenAmounts[1];
                            return [4 /*yield*/, baseSetComponent2.decimals.callAsync()];
                        case 8:
                            componentTokenDecimals = (_a.sent()).toNumber();
                            return [4 /*yield*/, weth.decimals.callAsync()];
                        case 9:
                            sourceTokenDecimals = (_a.sent()).toNumber();
                            kyberConversionRatePower = new util_1.BigNumber(10).pow(18 + sourceTokenDecimals - componentTokenDecimals);
                            minimumConversionRate = maxDestinationQuantity.div(kyberSendTokenQuantity)
                                .mul(kyberConversionRatePower)
                                .round();
                            kyberTrade = {
                                sourceToken: weth.address,
                                destinationToken: baseSetComponent2.address,
                                sourceTokenQuantity: kyberSendTokenQuantity,
                                minimumConversionRate: minimumConversionRate,
                                maxDestinationQuantity: maxDestinationQuantity,
                            };
                            return [4 /*yield*/, kyberNetworkHelper.approveToReserve(baseSetComponent2, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, kyberReserveOperator)];
                        case 10:
                            _a.sent();
                            return [4 /*yield*/, kyberNetworkHelper.setConversionRates(weth.address, baseSetComponent2.address, kyberSendTokenQuantity, maxDestinationQuantity)];
                        case 11:
                            _a.sent();
                            // Fund Kyber Reserve Operator
                            return [4 /*yield*/, helpers_1.transferTokenAsync(baseSetComponent2, kyberReserveOperator, kyberTrade.maxDestinationQuantity, ownerAccount)];
                        case 12:
                            // Fund Kyber Reserve Operator
                            _a.sent();
                            // ----------------------------------------------------------------------
                            // Subject Parameter Definitions
                            // ----------------------------------------------------------------------
                            subjectRebalancingSetAddress = rebalancingSetToken.address;
                            subjectRebalancingSetQuantity = rebalancingSetIssueQuantity;
                            subjectExchangeIssuanceParams = exchangeIssuanceParams;
                            subjectExchangeOrders = [zeroExOrder, kyberTrade];
                            subjectKeepChangeInVault = false;
                            subjectCaller = functionCaller;
                            subjectEtherValue = totalEther.toString();
                            return [2 /*return*/];
                    }
                });
            }); });
            afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    customBaseSetComponentUnits = undefined;
                    customZeroExMakerAssetAmount = undefined;
                    customZeroExTakerAssetAmount = undefined;
                    customZeroExFillAmount = undefined;
                    return [2 /*return*/];
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
            describe('when the 0x order is partial-filled (with potential rounding issues)', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customBaseSetComponentUnits = new util_1.BigNumber(1803900);
                            customZeroExMakerAssetAmount = new util_1.BigNumber(26886250);
                            customZeroExTakerAssetAmount = new util_1.BigNumber('150795079659399001');
                            customZeroExFillAmount = new util_1.BigNumber('101174111003799287');
                            return [2 /*return*/];
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
                    return [2 /*return*/];
                });
            }); });
            describe('when the receive token quantity is greater than required to mint the base Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            customBaseSetComponentUnits = new util_1.BigNumber('86518799416500000194');
                            customZeroExMakerAssetAmount = new util_1.BigNumber('907388370400000000000');
                            customZeroExTakerAssetAmount = new util_1.BigNumber('4334853164879882320');
                            customZeroExFillAmount = new util_1.BigNumber('4133249925904304290');
                            return [2 /*return*/];
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
                    return [2 /*return*/];
                });
            }); });
            describe('when a from transaction parameter is not passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("No \"from\" address specified in neither the given options, nor the default options.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when an empty Ether transaction value is passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectEtherValue = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Payment Token quantity value should not be undefined (txOpts.value if Wrapped Ether)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the rebalancing set address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetAddress = 'InvalidTokenAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected rebalancingSetAddress to conform to schema /Address.\n\n        Encountered: \"InvalidTokenAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when no orders are passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeOrders = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The array orders cannot be empty.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the set to exchange issue for is not the rebalancing set\'s base set', function () { return __awaiter(_this, void 0, void 0, function () {
                var notBaseSet;
                var _this = this;
                return __generator(this, function (_a) {
                    notBaseSet = accounts_1.ACCOUNTS[3].address;
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.setAddress = notBaseSet;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Set token at " + notBaseSet + " is not the expected rebalancing set token current Set at " + baseSetToken.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the receive tokens are not included in the rebalancing set\'s base set\'s components', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.receiveTokens[0] = 'NotAComponentAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Component at NotAComponentAddress is not part of the collateralizing set at " + baseSetToken.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the send token does not contain Wrapper Ether', function () { return __awaiter(_this, void 0, void 0, function () {
                var notWrappedEther;
                var _this = this;
                return __generator(this, function (_a) {
                    notWrappedEther = accounts_1.ACCOUNTS[3].address;
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.sendTokens[0] = notWrappedEther;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Send token at " + notWrappedEther + " is not the payment token at " + weth.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('issueRebalancingSetWithERC20Async', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, exchangeIssuanceAPI.issueRebalancingSetWithERC20Async(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectPaymentTokenAddress, subjectPaymentTokenQuantity, subjectExchangeIssuanceParams, subjectExchangeOrders, subjectKeepChangeInVault, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                });
            });
        }
        var subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectPaymentTokenAddress, subjectPaymentTokenQuantity, subjectExchangeIssuanceParams, subjectExchangeOrders, subjectKeepChangeInVault, subjectCaller, baseSetComponent, baseSetComponent2, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, rebalancingSetIssueQuantity, baseSetIssueQuantity, wethRequiredToIssueBaseSet, totalWrappedEther, zeroExSendTokenQuantity, kyberSendTokenQuantity, exchangeIssuanceSendTokenQuantity, exchangeIssueSetAddress, exchangeIssueQuantity, exchangeIssueSendTokenExchangeIds, exchangeIssueSendTokens, exchangeIssueSendTokenAmounts, exchangeIssueReceiveTokens, exchangeIssueReceiveTokenAmounts, zeroExOrder, zeroExMakerAssetAmount, zeroExTakerAssetAmount, kyberTrade, kyberConversionRatePower;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentAddresses, componentUnits, impliedRebalancingSetQuantityFromBaseSet, zeroExReceiveTokenAmount, kyberReceiveTokenAmount, exchangeIssuanceParams, makerAsset, takerAsset, maxDestinationQuantity, componentTokenDecimals, sourceTokenDecimals, minimumConversionRate;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount)];
                        case 1:
                            // ----------------------------------------------------------------------
                            // Component and Rebalancing Set Deployment
                            // ----------------------------------------------------------------------
                            // Create non-wrapped Ether component tokens
                            baseSetComponent = _a.sent();
                            return [4 /*yield*/, helpers_1.deployTokenSpecifyingDecimalAsync(18, web3, ownerAccount)];
                        case 2:
                            baseSetComponent2 = _a.sent();
                            componentAddresses = [
                                baseSetComponent.address, baseSetComponent2.address, weth.address,
                            ];
                            componentUnits = [
                                new util_1.BigNumber(Math.pow(10, 18)), new util_1.BigNumber(Math.pow(10, 18)), new util_1.BigNumber(Math.pow(10, 18)),
                            ];
                            baseSetNaturalUnit = new util_1.BigNumber(Math.pow(10, 17));
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 3:
                            baseSetToken = _a.sent();
                            // Create the Rebalancing Set
                            rebalancingUnitShares = new util_1.BigNumber(Math.pow(10, 18));
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, ownerAccount, baseSetToken.address, constants_1.ONE_DAY_IN_SECONDS, rebalancingUnitShares)];
                        case 4:
                            rebalancingSetToken = _a.sent();
                            // ----------------------------------------------------------------------
                            // Issuance Details
                            // ----------------------------------------------------------------------
                            baseSetIssueQuantity = new util_1.BigNumber(Math.pow(10, 18));
                            impliedRebalancingSetQuantityFromBaseSet = baseSetIssueQuantity
                                .mul(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                .div(rebalancingUnitShares);
                            rebalancingSetIssueQuantity = impliedRebalancingSetQuantityFromBaseSet;
                            wethRequiredToIssueBaseSet =
                                baseSetIssueQuantity.mul(componentUnits[2]).div(baseSetNaturalUnit);
                            // ----------------------------------------------------------------------
                            // Payment / Send Token Details
                            // ----------------------------------------------------------------------
                            kyberSendTokenQuantity = new util_1.BigNumber(Math.pow(10, 18));
                            zeroExSendTokenQuantity = new util_1.BigNumber(Math.pow(10, 18));
                            exchangeIssuanceSendTokenQuantity =
                                kyberSendTokenQuantity.plus(zeroExSendTokenQuantity);
                            totalWrappedEther = exchangeIssuanceSendTokenQuantity.plus(wethRequiredToIssueBaseSet);
                            // ----------------------------------------------------------------------
                            // Exchange Issuance Set up
                            // ----------------------------------------------------------------------
                            // Generate exchange issue data
                            exchangeIssueSetAddress = baseSetToken.address;
                            exchangeIssueQuantity = baseSetIssueQuantity;
                            exchangeIssueSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX, SetUtils.EXCHANGES.KYBER];
                            exchangeIssueSendTokens = [weth.address, weth.address];
                            exchangeIssueSendTokenAmounts = [zeroExSendTokenQuantity, kyberSendTokenQuantity];
                            zeroExReceiveTokenAmount = componentUnits[0].mul(exchangeIssueQuantity).div(baseSetNaturalUnit);
                            kyberReceiveTokenAmount = componentUnits[1].mul(exchangeIssueQuantity).div(baseSetNaturalUnit);
                            exchangeIssueReceiveTokens = [componentAddresses[0], componentAddresses[1]];
                            exchangeIssueReceiveTokenAmounts = [
                                zeroExReceiveTokenAmount,
                                kyberReceiveTokenAmount,
                            ];
                            exchangeIssuanceParams = {
                                setAddress: exchangeIssueSetAddress,
                                sendTokenExchangeIds: exchangeIssueSendTokenExchangeIds,
                                sendTokens: exchangeIssueSendTokens,
                                sendTokenAmounts: exchangeIssueSendTokenAmounts,
                                quantity: exchangeIssueQuantity,
                                receiveTokens: exchangeIssueReceiveTokens,
                                receiveTokenAmounts: exchangeIssueReceiveTokenAmounts,
                            };
                            makerAsset = exchangeIssueReceiveTokens[0];
                            takerAsset = exchangeIssueSendTokens[0];
                            zeroExMakerAssetAmount = exchangeIssueReceiveTokenAmounts[0];
                            zeroExTakerAssetAmount = exchangeIssueSendTokenAmounts[0];
                            return [4 /*yield*/, setUtils.generateZeroExSignedFillOrder(constants_1.NULL_ADDRESS, // senderAddress
                                zeroExOrderMaker, // makerAddress
                                constants_1.NULL_ADDRESS, // takerAddress
                                constants_1.ZERO, // makerFee
                                constants_1.ZERO, // takerFee
                                zeroExMakerAssetAmount, // makerAssetAmount
                                zeroExTakerAssetAmount, // takerAssetAmount
                                makerAsset, // makerAssetAddress
                                takerAsset, // takerAssetAddress
                                SetUtils.generateSalt(), // salt
                                SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
                                constants_1.NULL_ADDRESS, // feeRecipientAddress
                                SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
                                zeroExTakerAssetAmount)];
                        case 5:
                            zeroExOrder = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent], SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS, zeroExOrderMaker)];
                        case 6:
                            _a.sent();
                            // Fund zero Ex Order Maker
                            return [4 /*yield*/, helpers_1.transferTokenAsync(baseSetComponent, zeroExOrderMaker, zeroExMakerAssetAmount, ownerAccount)];
                        case 7:
                            // Fund zero Ex Order Maker
                            _a.sent();
                            maxDestinationQuantity = exchangeIssueReceiveTokenAmounts[1];
                            return [4 /*yield*/, baseSetComponent2.decimals.callAsync()];
                        case 8:
                            componentTokenDecimals = (_a.sent()).toNumber();
                            return [4 /*yield*/, weth.decimals.callAsync()];
                        case 9:
                            sourceTokenDecimals = (_a.sent()).toNumber();
                            kyberConversionRatePower = new util_1.BigNumber(10).pow(18 + sourceTokenDecimals - componentTokenDecimals);
                            minimumConversionRate = maxDestinationQuantity.div(kyberSendTokenQuantity)
                                .mul(kyberConversionRatePower)
                                .round();
                            kyberTrade = {
                                sourceToken: weth.address,
                                destinationToken: baseSetComponent2.address,
                                sourceTokenQuantity: kyberSendTokenQuantity,
                                minimumConversionRate: minimumConversionRate,
                                maxDestinationQuantity: maxDestinationQuantity,
                            };
                            return [4 /*yield*/, kyberNetworkHelper.approveToReserve(baseSetComponent2, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, kyberReserveOperator)];
                        case 10:
                            _a.sent();
                            return [4 /*yield*/, kyberNetworkHelper.setConversionRates(weth.address, baseSetComponent2.address, kyberSendTokenQuantity, maxDestinationQuantity)];
                        case 11:
                            _a.sent();
                            // Fund Kyber Reserve Operator
                            return [4 /*yield*/, helpers_1.transferTokenAsync(baseSetComponent2, kyberReserveOperator, kyberTrade.maxDestinationQuantity, ownerAccount)];
                        case 12:
                            // Fund Kyber Reserve Operator
                            _a.sent();
                            // ----------------------------------------------------------------------
                            // Subject Parameter Definitions
                            // ----------------------------------------------------------------------
                            subjectRebalancingSetAddress = rebalancingSetToken.address;
                            subjectRebalancingSetQuantity = rebalancingSetIssueQuantity;
                            subjectPaymentTokenAddress = weth.address;
                            subjectPaymentTokenQuantity = totalWrappedEther;
                            subjectExchangeIssuanceParams = exchangeIssuanceParams;
                            subjectExchangeOrders = [zeroExOrder, kyberTrade];
                            subjectKeepChangeInVault = false;
                            subjectCaller = functionCaller;
                            // ----------------------------------------------------------------------
                            // Wrap eth and deposit
                            // ----------------------------------------------------------------------
                            return [4 /*yield*/, weth.deposit.sendTransactionAsync({
                                    from: functionCaller,
                                    gas: constants_1.DEFAULT_GAS_LIMIT,
                                    value: subjectPaymentTokenQuantity.toString(),
                                })];
                        case 13:
                            // ----------------------------------------------------------------------
                            // Wrap eth and deposit
                            // ----------------------------------------------------------------------
                            _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([weth], transferProxy.address, functionCaller)];
                        case 14:
                            _a.sent();
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
            describe('when a from transaction parameter is not passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("No \"from\" address specified in neither the given options, nor the default options.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when an empty paymentTokenQuantity is passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectPaymentTokenQuantity = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Payment Token quantity value should not be undefined (txOpts.value if Wrapped Ether)")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the rebalancing set address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetAddress = 'InvalidTokenAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected rebalancingSetAddress to conform to schema /Address.\n\n        Encountered: \"InvalidTokenAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when no orders are passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeOrders = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The array orders cannot be empty.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the set to exchange issue for is not the rebalancing set\'s base set', function () { return __awaiter(_this, void 0, void 0, function () {
                var notBaseSet;
                var _this = this;
                return __generator(this, function (_a) {
                    notBaseSet = accounts_1.ACCOUNTS[3].address;
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.setAddress = notBaseSet;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Set token at " + notBaseSet + " is not the expected rebalancing set token current Set at " + baseSetToken.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the receive tokens are not included in the rebalancing set\'s base set\'s components', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.receiveTokens[0] = 'NotAComponentAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Component at NotAComponentAddress is not part of the collateralizing set at " + baseSetToken.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the send token does not contain the paymentToken', function () { return __awaiter(_this, void 0, void 0, function () {
                var notPaymentToken;
                var _this = this;
                return __generator(this, function (_a) {
                    notPaymentToken = accounts_1.ACCOUNTS[3].address;
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.sendTokens[0] = notPaymentToken;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Send token at " + notPaymentToken + " is not the payment " +
                                    ("token at " + subjectPaymentTokenAddress))];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('redeemRebalancingSetIntoEtherAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, exchangeIssuanceAPI.redeemRebalancingSetIntoEtherAsync(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceParams, subjectExchangeOrders, subjectKeepChangeInVault, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceParams, subjectExchangeOrders, subjectKeepChangeInVault, subjectCaller, baseSetComponent, baseSetComponent2, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, rebalancingSetRedeemQuantity, baseSetRedeemQuantity, wethRequiredToIssueBaseSet, zeroExReceiveTokenQuantity, kyberReceiveTokenQuantity, exchangeIssuanceReceiveTokenQuantity, zeroExSendTokenQuantity, kyberSendTokenQuantity, exchangeRedeemSetAddress, exchangeRedeemQuantity, exchangeRedeemSendTokenExchangeIds, exchangeRedeemSendTokens, exchangeRedeemSendTokenAmounts, exchangeRedeemReceiveTokens, exchangeRedeemReceiveTokenAmounts, zeroExOrder, zeroExMakerAssetAmount, zeroExTakerAssetAmount, kyberTrade, kyberConversionRatePower;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentAddresses, componentUnits, exchangeIssuanceParams, makerAsset, takerAsset, maxDestinationQuantity, destinationTokenDecimals, sourceTokenDecimals, minimumConversionRate;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenSpecifyingDecimalAsync(18, web3, functionCaller)];
                        case 1:
                            // ----------------------------------------------------------------------
                            // Component and Rebalancing Set Deployment
                            // ----------------------------------------------------------------------
                            // Create component token
                            baseSetComponent = _a.sent();
                            return [4 /*yield*/, helpers_1.deployTokenSpecifyingDecimalAsync(18, web3, functionCaller)];
                        case 2:
                            baseSetComponent2 = _a.sent();
                            componentAddresses = [baseSetComponent.address, baseSetComponent2.address, weth.address];
                            componentUnits = [new util_1.BigNumber(Math.pow(10, 18)), new util_1.BigNumber(Math.pow(10, 18)), new util_1.BigNumber(Math.pow(10, 18))];
                            baseSetNaturalUnit = new util_1.BigNumber(Math.pow(10, 17));
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 3:
                            baseSetToken = _a.sent();
                            // Create the Rebalancing Set
                            rebalancingUnitShares = new util_1.BigNumber(Math.pow(10, 18));
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, ownerAccount, baseSetToken.address, constants_1.ONE_DAY_IN_SECONDS, rebalancingUnitShares)];
                        case 4:
                            rebalancingSetToken = _a.sent();
                            // ----------------------------------------------------------------------
                            // Issuance Details
                            // ----------------------------------------------------------------------
                            baseSetRedeemQuantity = new util_1.BigNumber(Math.pow(10, 18));
                            rebalancingSetRedeemQuantity = baseSetRedeemQuantity
                                .mul(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                .div(rebalancingUnitShares);
                            wethRequiredToIssueBaseSet =
                                componentUnits[2].mul(baseSetRedeemQuantity).div(baseSetNaturalUnit);
                            // ----------------------------------------------------------------------
                            // Payment / Send and Receive Token Details
                            // ----------------------------------------------------------------------
                            kyberReceiveTokenQuantity = util_1.ether(1);
                            zeroExReceiveTokenQuantity = util_1.ether(1);
                            exchangeIssuanceReceiveTokenQuantity = zeroExReceiveTokenQuantity.plus(kyberReceiveTokenQuantity);
                            // ----------------------------------------------------------------------
                            // Exchange Issuance Set up
                            // ----------------------------------------------------------------------
                            // Generate exchangeRedeem data
                            exchangeRedeemSetAddress = baseSetToken.address;
                            exchangeRedeemQuantity = baseSetRedeemQuantity;
                            exchangeRedeemSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX, SetUtils.EXCHANGES.KYBER];
                            exchangeRedeemSendTokens = [componentAddresses[0], componentAddresses[1]];
                            zeroExSendTokenQuantity =
                                componentUnits[0].mul(exchangeRedeemQuantity).div(baseSetNaturalUnit);
                            kyberSendTokenQuantity = componentUnits[1].mul(exchangeRedeemQuantity).div(baseSetNaturalUnit);
                            exchangeRedeemSendTokenAmounts = [zeroExSendTokenQuantity, kyberSendTokenQuantity];
                            exchangeRedeemReceiveTokens = [weth.address];
                            exchangeRedeemReceiveTokenAmounts = [exchangeIssuanceReceiveTokenQuantity];
                            exchangeIssuanceParams = {
                                setAddress: exchangeRedeemSetAddress,
                                sendTokenExchangeIds: exchangeRedeemSendTokenExchangeIds,
                                sendTokens: exchangeRedeemSendTokens,
                                sendTokenAmounts: exchangeRedeemSendTokenAmounts,
                                quantity: exchangeRedeemQuantity,
                                receiveTokens: exchangeRedeemReceiveTokens,
                                receiveTokenAmounts: exchangeRedeemReceiveTokenAmounts,
                            };
                            makerAsset = exchangeRedeemReceiveTokens[0];
                            takerAsset = exchangeRedeemSendTokens[0];
                            zeroExMakerAssetAmount = zeroExReceiveTokenQuantity;
                            zeroExTakerAssetAmount = exchangeRedeemSendTokenAmounts[0];
                            return [4 /*yield*/, setUtils.generateZeroExSignedFillOrder(constants_1.NULL_ADDRESS, // senderAddress
                                zeroExOrderMaker, // makerAddress
                                constants_1.NULL_ADDRESS, // takerAddress
                                constants_1.ZERO, // makerFee
                                constants_1.ZERO, // takerFee
                                zeroExMakerAssetAmount, // makerAssetAmount
                                zeroExTakerAssetAmount, // takerAssetAmount
                                makerAsset, // makerAssetAddress
                                takerAsset, // takerAssetAddress
                                SetUtils.generateSalt(), // salt
                                SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
                                constants_1.NULL_ADDRESS, // feeRecipientAddress
                                SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
                                zeroExTakerAssetAmount)];
                        case 5:
                            zeroExOrder = _a.sent();
                            // Approve weth to the transfer proxy
                            return [4 /*yield*/, weth.approve.sendTransactionAsync(SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS, zeroExMakerAssetAmount, { from: zeroExOrderMaker, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 6:
                            // Approve weth to the transfer proxy
                            _a.sent();
                            // Deposit weth
                            return [4 /*yield*/, weth.deposit.sendTransactionAsync({ from: zeroExOrderMaker, value: zeroExMakerAssetAmount.toString(), gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 7:
                            // Deposit weth
                            _a.sent();
                            maxDestinationQuantity = kyberReceiveTokenQuantity;
                            return [4 /*yield*/, weth.decimals.callAsync()];
                        case 8:
                            destinationTokenDecimals = (_a.sent()).toNumber();
                            return [4 /*yield*/, baseSetComponent2.decimals.callAsync()];
                        case 9:
                            sourceTokenDecimals = (_a.sent()).toNumber();
                            kyberConversionRatePower = new util_1.BigNumber(10).pow(18 + sourceTokenDecimals - destinationTokenDecimals);
                            minimumConversionRate = maxDestinationQuantity.div(kyberSendTokenQuantity)
                                .mul(kyberConversionRatePower)
                                .round();
                            kyberTrade = {
                                sourceToken: baseSetComponent2.address,
                                destinationToken: weth.address,
                                sourceTokenQuantity: kyberSendTokenQuantity,
                                minimumConversionRate: minimumConversionRate,
                                maxDestinationQuantity: maxDestinationQuantity,
                            };
                            return [4 /*yield*/, weth.approve.sendTransactionAsync(kyberNetworkHelper.kyberReserve, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: kyberReserveOperator, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 10:
                            _a.sent();
                            // Deposit weth
                            return [4 /*yield*/, weth.deposit.sendTransactionAsync({ from: kyberReserveOperator, value: maxDestinationQuantity.toString(), gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 11:
                            // Deposit weth
                            _a.sent();
                            return [4 /*yield*/, kyberNetworkHelper.setConversionRates(baseSetComponent2.address, weth.address, kyberSendTokenQuantity, maxDestinationQuantity)];
                        case 12:
                            _a.sent();
                            // ----------------------------------------------------------------------
                            // Rebalancing Set Issuance
                            // ----------------------------------------------------------------------
                            // Approve base component to transfer proxy
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent, baseSetComponent2], transferProxy.address, functionCaller)];
                        case 13:
                            // ----------------------------------------------------------------------
                            // Rebalancing Set Issuance
                            // ----------------------------------------------------------------------
                            // Approve base component to transfer proxy
                            _a.sent();
                            if (!wethRequiredToIssueBaseSet.gt(0)) return [3 /*break*/, 16];
                            // Approve Weth to the transferProxy
                            return [4 /*yield*/, weth.approve.sendTransactionAsync(transferProxy.address, wethRequiredToIssueBaseSet, { from: functionCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 14:
                            // Approve Weth to the transferProxy
                            _a.sent();
                            // Generate wrapped Ether for the caller
                            return [4 /*yield*/, weth.deposit.sendTransactionAsync({ from: functionCaller, value: wethRequiredToIssueBaseSet.toString(), gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 15:
                            // Generate wrapped Ether for the caller
                            _a.sent();
                            _a.label = 16;
                        case 16: 
                        // Issue the Base Set to the vault
                        return [4 /*yield*/, core.issueInVault.sendTransactionAsync(baseSetToken.address, baseSetRedeemQuantity, { from: functionCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 17:
                            // Issue the Base Set to the vault
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetRedeemQuantity, { from: functionCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 18:
                            _a.sent();
                            // ----------------------------------------------------------------------
                            // Subject Parameter Definitions
                            // ----------------------------------------------------------------------
                            subjectRebalancingSetAddress = rebalancingSetToken.address;
                            subjectRebalancingSetQuantity = rebalancingSetRedeemQuantity;
                            subjectExchangeIssuanceParams = exchangeIssuanceParams;
                            subjectExchangeOrders = [zeroExOrder, kyberTrade];
                            subjectKeepChangeInVault = false;
                            subjectCaller = functionCaller;
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
            describe('when the receive tokens has more than one address', function () { return __awaiter(_this, void 0, void 0, function () {
                var notWrappedEther;
                var _this = this;
                return __generator(this, function (_a) {
                    notWrappedEther = accounts_1.ACCOUNTS[3].address;
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.receiveTokens = [weth.address, notWrappedEther];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Only one receive token is allowed in Payable Exchange Redemption")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when a from transaction parameter is not passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("No \"from\" address specified in neither the given options, nor the default options.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the rebalancing set address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetAddress = 'InvalidTokenAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected rebalancingSetAddress to conform to schema /Address.\n\n        Encountered: \"InvalidTokenAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when no orders are passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeOrders = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The array orders cannot be empty.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the set to exchange redeem for is not the rebalancing set\'s base set', function () { return __awaiter(_this, void 0, void 0, function () {
                var notBaseSet;
                var _this = this;
                return __generator(this, function (_a) {
                    notBaseSet = accounts_1.ACCOUNTS[3].address;
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.setAddress = notBaseSet;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Set token at " + notBaseSet + " is not the expected rebalancing set token current Set at " + baseSetToken.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the send tokens are not included in the rebalancing set\'s base set\'s components', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.sendTokens[0] = 'NotAComponentAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Component at NotAComponentAddress is not part of the collateralizing set at " + baseSetToken.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the amount of base set from the rebalancing set quantity is not enough to trade', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetQuantity = baseSetRedeemQuantity.mul(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                .div(rebalancingUnitShares)
                                .sub(1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var impliedBaseSetQuantity;
                        return __generator(this, function (_a) {
                            impliedBaseSetQuantity = subjectRebalancingSetQuantity
                                .mul(rebalancingUnitShares)
                                .div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity of base set redeemable from the quantity of the rebalancing set: " +
                                    (impliedBaseSetQuantity.toString() + " must be ") +
                                    ("greater or equal to the amount required for the redemption trades: " + baseSetRedeemQuantity.toString()))];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the receive tokens does not contain Wrapper Ether', function () { return __awaiter(_this, void 0, void 0, function () {
                var notWrappedEther;
                var _this = this;
                return __generator(this, function (_a) {
                    notWrappedEther = accounts_1.ACCOUNTS[3].address;
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.receiveTokens[0] = notWrappedEther;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Receive token at " + notWrappedEther + " is not the output token at " + weth.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('redeemRebalancingSetIntoERC20Async', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, exchangeIssuanceAPI.redeemRebalancingSetIntoERC20Async(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectReceiveTokenAddress, subjectExchangeIssuanceParams, subjectExchangeOrders, subjectKeepChangeInVault, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectReceiveTokenAddress, subjectExchangeIssuanceParams, subjectExchangeOrders, subjectKeepChangeInVault, subjectCaller, baseSetComponent, baseSetComponent2, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, rebalancingSetRedeemQuantity, baseSetRedeemQuantity, wethRequiredToIssueBaseSet, zeroExReceiveTokenQuantity, kyberReceiveTokenQuantity, exchangeIssuanceReceiveTokenQuantity, zeroExSendTokenQuantity, kyberSendTokenQuantity, exchangeRedeemSetAddress, exchangeRedeemQuantity, exchangeRedeemSendTokenExchangeIds, exchangeRedeemSendTokens, exchangeRedeemSendTokenAmounts, exchangeRedeemReceiveTokens, exchangeRedeemReceiveTokenAmounts, zeroExOrder, zeroExMakerAssetAmount, zeroExTakerAssetAmount, kyberTrade, kyberConversionRatePower;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentAddresses, componentUnits, exchangeIssuanceParams, makerAsset, takerAsset, maxDestinationQuantity, destinationTokenDecimals, sourceTokenDecimals, minimumConversionRate;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenSpecifyingDecimalAsync(18, web3, functionCaller)];
                        case 1:
                            // ----------------------------------------------------------------------
                            // Component and Rebalancing Set Deployment
                            // ----------------------------------------------------------------------
                            // Create component token
                            baseSetComponent = _a.sent();
                            return [4 /*yield*/, helpers_1.deployTokenSpecifyingDecimalAsync(18, web3, functionCaller)];
                        case 2:
                            baseSetComponent2 = _a.sent();
                            componentAddresses = [baseSetComponent.address, baseSetComponent2.address, weth.address];
                            componentUnits = [new util_1.BigNumber(Math.pow(10, 18)), new util_1.BigNumber(Math.pow(10, 18)), new util_1.BigNumber(Math.pow(10, 18))];
                            baseSetNaturalUnit = new util_1.BigNumber(Math.pow(10, 17));
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentAddresses, componentUnits, baseSetNaturalUnit)];
                        case 3:
                            baseSetToken = _a.sent();
                            // Create the Rebalancing Set
                            rebalancingUnitShares = new util_1.BigNumber(Math.pow(10, 18));
                            return [4 /*yield*/, helpers_1.createDefaultRebalancingSetTokenAsync(web3, core, rebalancingSetTokenFactory.address, ownerAccount, baseSetToken.address, constants_1.ONE_DAY_IN_SECONDS, rebalancingUnitShares)];
                        case 4:
                            rebalancingSetToken = _a.sent();
                            // ----------------------------------------------------------------------
                            // Issuance Details
                            // ----------------------------------------------------------------------
                            baseSetRedeemQuantity = new util_1.BigNumber(Math.pow(10, 18));
                            rebalancingSetRedeemQuantity = baseSetRedeemQuantity
                                .mul(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                .div(rebalancingUnitShares);
                            wethRequiredToIssueBaseSet =
                                componentUnits[2].mul(baseSetRedeemQuantity).div(baseSetNaturalUnit);
                            // ----------------------------------------------------------------------
                            // Payment / Send and Receive Token Details
                            // ----------------------------------------------------------------------
                            kyberReceiveTokenQuantity = util_1.ether(1);
                            zeroExReceiveTokenQuantity = util_1.ether(1);
                            exchangeIssuanceReceiveTokenQuantity = zeroExReceiveTokenQuantity.plus(kyberReceiveTokenQuantity);
                            // ----------------------------------------------------------------------
                            // Exchange Issuance Set up
                            // ----------------------------------------------------------------------
                            // Generate exchangeRedeem data
                            exchangeRedeemSetAddress = baseSetToken.address;
                            exchangeRedeemQuantity = baseSetRedeemQuantity;
                            exchangeRedeemSendTokenExchangeIds = [SetUtils.EXCHANGES.ZERO_EX, SetUtils.EXCHANGES.KYBER];
                            exchangeRedeemSendTokens = [componentAddresses[0], componentAddresses[1]];
                            zeroExSendTokenQuantity =
                                componentUnits[0].mul(exchangeRedeemQuantity).div(baseSetNaturalUnit);
                            kyberSendTokenQuantity = componentUnits[1].mul(exchangeRedeemQuantity).div(baseSetNaturalUnit);
                            exchangeRedeemSendTokenAmounts = [zeroExSendTokenQuantity, kyberSendTokenQuantity];
                            exchangeRedeemReceiveTokens = [weth.address];
                            exchangeRedeemReceiveTokenAmounts = [exchangeIssuanceReceiveTokenQuantity];
                            exchangeIssuanceParams = {
                                setAddress: exchangeRedeemSetAddress,
                                sendTokenExchangeIds: exchangeRedeemSendTokenExchangeIds,
                                sendTokens: exchangeRedeemSendTokens,
                                sendTokenAmounts: exchangeRedeemSendTokenAmounts,
                                quantity: exchangeRedeemQuantity,
                                receiveTokens: exchangeRedeemReceiveTokens,
                                receiveTokenAmounts: exchangeRedeemReceiveTokenAmounts,
                            };
                            makerAsset = exchangeRedeemReceiveTokens[0];
                            takerAsset = exchangeRedeemSendTokens[0];
                            zeroExMakerAssetAmount = zeroExReceiveTokenQuantity;
                            zeroExTakerAssetAmount = exchangeRedeemSendTokenAmounts[0];
                            return [4 /*yield*/, setUtils.generateZeroExSignedFillOrder(constants_1.NULL_ADDRESS, // senderAddress
                                zeroExOrderMaker, // makerAddress
                                constants_1.NULL_ADDRESS, // takerAddress
                                constants_1.ZERO, // makerFee
                                constants_1.ZERO, // takerFee
                                zeroExMakerAssetAmount, // makerAssetAmount
                                zeroExTakerAssetAmount, // takerAssetAmount
                                makerAsset, // makerAssetAddress
                                takerAsset, // takerAssetAddress
                                SetUtils.generateSalt(), // salt
                                SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
                                constants_1.NULL_ADDRESS, // feeRecipientAddress
                                SetTestUtils.generateTimestamp(10000), // expirationTimeSeconds
                                zeroExTakerAssetAmount)];
                        case 5:
                            zeroExOrder = _a.sent();
                            // Approve weth to the transfer proxy
                            return [4 /*yield*/, weth.approve.sendTransactionAsync(SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS, zeroExMakerAssetAmount, { from: zeroExOrderMaker, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 6:
                            // Approve weth to the transfer proxy
                            _a.sent();
                            // Deposit weth
                            return [4 /*yield*/, weth.deposit.sendTransactionAsync({ from: zeroExOrderMaker, value: zeroExMakerAssetAmount.toString(), gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 7:
                            // Deposit weth
                            _a.sent();
                            maxDestinationQuantity = kyberReceiveTokenQuantity;
                            return [4 /*yield*/, weth.decimals.callAsync()];
                        case 8:
                            destinationTokenDecimals = (_a.sent()).toNumber();
                            return [4 /*yield*/, baseSetComponent2.decimals.callAsync()];
                        case 9:
                            sourceTokenDecimals = (_a.sent()).toNumber();
                            kyberConversionRatePower = new util_1.BigNumber(10).pow(18 + sourceTokenDecimals - destinationTokenDecimals);
                            minimumConversionRate = maxDestinationQuantity.div(kyberSendTokenQuantity)
                                .mul(kyberConversionRatePower)
                                .round();
                            kyberTrade = {
                                sourceToken: baseSetComponent2.address,
                                destinationToken: weth.address,
                                sourceTokenQuantity: kyberSendTokenQuantity,
                                minimumConversionRate: minimumConversionRate,
                                maxDestinationQuantity: maxDestinationQuantity,
                            };
                            return [4 /*yield*/, weth.approve.sendTransactionAsync(kyberNetworkHelper.kyberReserve, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, { from: kyberReserveOperator, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 10:
                            _a.sent();
                            // Deposit weth
                            return [4 /*yield*/, weth.deposit.sendTransactionAsync({ from: kyberReserveOperator, value: maxDestinationQuantity.toString(), gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 11:
                            // Deposit weth
                            _a.sent();
                            return [4 /*yield*/, kyberNetworkHelper.setConversionRates(baseSetComponent2.address, weth.address, kyberSendTokenQuantity, maxDestinationQuantity)];
                        case 12:
                            _a.sent();
                            // ----------------------------------------------------------------------
                            // Rebalancing Set Issuance
                            // ----------------------------------------------------------------------
                            // Approve base component to transfer proxy
                            return [4 /*yield*/, helpers_1.approveForTransferAsync([baseSetComponent, baseSetComponent2], transferProxy.address, functionCaller)];
                        case 13:
                            // ----------------------------------------------------------------------
                            // Rebalancing Set Issuance
                            // ----------------------------------------------------------------------
                            // Approve base component to transfer proxy
                            _a.sent();
                            if (!wethRequiredToIssueBaseSet.gt(0)) return [3 /*break*/, 16];
                            // Approve Weth to the transferProxy
                            return [4 /*yield*/, weth.approve.sendTransactionAsync(transferProxy.address, wethRequiredToIssueBaseSet, { from: functionCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 14:
                            // Approve Weth to the transferProxy
                            _a.sent();
                            // Generate wrapped Ether for the caller
                            return [4 /*yield*/, weth.deposit.sendTransactionAsync({ from: functionCaller, value: wethRequiredToIssueBaseSet.toString(), gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 15:
                            // Generate wrapped Ether for the caller
                            _a.sent();
                            _a.label = 16;
                        case 16: 
                        // Issue the Base Set to the vault
                        return [4 /*yield*/, core.issueInVault.sendTransactionAsync(baseSetToken.address, baseSetRedeemQuantity, { from: functionCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 17:
                            // Issue the Base Set to the vault
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetRedeemQuantity, { from: functionCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                        case 18:
                            _a.sent();
                            // ----------------------------------------------------------------------
                            // Subject Parameter Definitions
                            // ----------------------------------------------------------------------
                            subjectRebalancingSetAddress = rebalancingSetToken.address;
                            subjectRebalancingSetQuantity = rebalancingSetRedeemQuantity;
                            subjectReceiveTokenAddress = weth.address;
                            subjectExchangeIssuanceParams = exchangeIssuanceParams;
                            subjectExchangeOrders = [zeroExOrder, kyberTrade];
                            subjectKeepChangeInVault = false;
                            subjectCaller = functionCaller;
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
            describe('when the receive tokens has more than one address', function () { return __awaiter(_this, void 0, void 0, function () {
                var notWrappedEther;
                var _this = this;
                return __generator(this, function (_a) {
                    notWrappedEther = accounts_1.ACCOUNTS[3].address;
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.receiveTokens = [weth.address, notWrappedEther];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Only one receive token is allowed in Payable Exchange Redemption")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when a from transaction parameter is not passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = undefined;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("No \"from\" address specified in neither the given options, nor the default options.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the rebalancing set address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetAddress = 'InvalidTokenAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected rebalancingSetAddress to conform to schema /Address.\n\n        Encountered: \"InvalidTokenAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when no orders are passed in', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeOrders = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The array orders cannot be empty.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the set to exchange redeem for is not the rebalancing set\'s base set', function () { return __awaiter(_this, void 0, void 0, function () {
                var notBaseSet;
                var _this = this;
                return __generator(this, function (_a) {
                    notBaseSet = accounts_1.ACCOUNTS[3].address;
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.setAddress = notBaseSet;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Set token at " + notBaseSet + " is not the expected rebalancing set token current Set at " + baseSetToken.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the send tokens are not included in the rebalancing set\'s base set\'s components', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.sendTokens[0] = 'NotAComponentAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Component at NotAComponentAddress is not part of the collateralizing set at " + baseSetToken.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the amount of base set from the rebalancing set quantity is not enough to trade', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectRebalancingSetQuantity = baseSetRedeemQuantity.mul(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT)
                                .div(rebalancingUnitShares)
                                .sub(1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var impliedBaseSetQuantity;
                        return __generator(this, function (_a) {
                            impliedBaseSetQuantity = subjectRebalancingSetQuantity
                                .mul(rebalancingUnitShares)
                                .div(constants_1.DEFAULT_REBALANCING_NATURAL_UNIT);
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity of base set redeemable from the quantity of the rebalancing set: " +
                                    (impliedBaseSetQuantity.toString() + " must be ") +
                                    ("greater or equal to the amount required for the redemption trades: " + baseSetRedeemQuantity.toString()))];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the receive tokens does not contain Wrapper Ether', function () { return __awaiter(_this, void 0, void 0, function () {
                var notWrappedEther;
                var _this = this;
                return __generator(this, function (_a) {
                    notWrappedEther = accounts_1.ACCOUNTS[3].address;
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectExchangeIssuanceParams.receiveTokens[0] = notWrappedEther;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Receive token at " + notWrappedEther + " is not the output token at " + weth.address)];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getKyberConversionRate', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, exchangeIssuanceAPI.getKyberConversionRates(subjectSourceTokenAddresses, subjectDestinationTokenAddresses, subjectQuantities)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectSourceTokenAddresses, subjectDestinationTokenAddresses, subjectQuantities, token1BuyRate, token2BuyRate, token1SellRate, token2SellRate;
        var _this = this;
        return __generator(this, function (_a) {
            token1BuyRate = util_1.ether(2);
            token2BuyRate = util_1.ether(6);
            token1SellRate = util_1.ether(1);
            token2SellRate = util_1.ether(2);
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, token1, token2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(2, [18, 18], web3, kyberReserveOperator)];
                        case 1:
                            _a = _b.sent(), token1 = _a[0], token2 = _a[1];
                            return [4 /*yield*/, kyberNetworkHelper.enableTokensForReserve(token1.address)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, kyberNetworkHelper.enableTokensForReserve(token2.address)];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, kyberNetworkHelper.setUpConversionRatesRaw([token1.address, token2.address], [token1BuyRate, token2BuyRate], [token1SellRate, token2SellRate])];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, kyberNetworkHelper.approveToReserve(token1, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, kyberReserveOperator)];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, kyberNetworkHelper.approveToReserve(token2, constants_1.UNLIMITED_ALLOWANCE_IN_BASE_UNITS, kyberReserveOperator)];
                        case 6:
                            _b.sent();
                            subjectSourceTokenAddresses = [token1.address, token1.address];
                            subjectDestinationTokenAddresses = [token2.address, token2.address];
                            subjectQuantities = [new util_1.BigNumber(Math.pow(10, 10)), new util_1.BigNumber(Math.pow(10, 10))];
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns a conversion rate and slip rate', function () { return __awaiter(_this, void 0, void 0, function () {
                var firstRate, secondRate, firstSlippage, secondSlippage, results, expectedRate, expectedSecondRate, slippagePercentage, expectedSlippage, expectedSecondSlippage;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            results = _c.sent();
                            _a = results[0], firstRate = _a[0], secondRate = _a[1], _b = results[1], firstSlippage = _b[0], secondSlippage = _b[1];
                            expectedRate = token2BuyRate;
                            expect(firstRate).to.be.bignumber.equal(expectedRate);
                            expectedSecondRate = token2BuyRate;
                            expect(secondRate).to.be.bignumber.equal(expectedSecondRate);
                            slippagePercentage = new util_1.BigNumber(100).sub(kyberNetworkHelper.defaultSlippagePercentage);
                            expectedSlippage = expectedRate.mul(slippagePercentage).div(100);
                            expect(firstSlippage).to.be.bignumber.equal(expectedSlippage);
                            expectedSecondSlippage = expectedSecondRate.mul(slippagePercentage).div(100);
                            expect(secondSlippage).to.be.bignumber.equal(expectedSecondSlippage);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=ExchangeIssuanceAPI.spec.js.map