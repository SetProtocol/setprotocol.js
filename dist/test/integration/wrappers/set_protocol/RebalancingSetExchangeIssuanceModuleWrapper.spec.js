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
var kyberNetworkHelper_1 = require("@test/helpers/kyberNetworkHelper");
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
var kyberNetworkHelper = new kyberNetworkHelper_1.KyberNetworkHelper();
var ownerAccount = accounts_1.DEFAULT_ACCOUNT;
var kyberReserveOperator = accounts_1.ACCOUNTS[1].address;
var functionCaller = accounts_1.ACCOUNTS[2].address;
var zeroExOrderMaker = accounts_1.ACCOUNTS[3].address;
describe('RebalancingSetExchangeIssuanceModuleWrapper', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var rebalancingSetTokenFactory;
    var rebalancingSetExchangeIssuanceModule;
    var weth;
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
                    return [4 /*yield*/, helpers_1.deployKyberNetworkWrapperContract(web3, kyberNetworkHelper.kyberNetworkProxy, transferProxy, core)];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, kyberNetworkHelper.setup()];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, kyberNetworkHelper.fundReserveWithEth(kyberReserveOperator, util_1.ether(90))];
                case 10:
                    _b.sent();
                    return [4 /*yield*/, helpers_1.deployWethMockAsync(web3, constants_1.NULL_ADDRESS, constants_1.ZERO)];
                case 11:
                    weth = _b.sent();
                    return [4 /*yield*/, helpers_1.deployRebalancingSetExchangeIssuanceModuleAsync(web3, core, transferProxy, exchangeIssuanceModule, weth, vault)];
                case 12:
                    rebalancingSetExchangeIssuanceModule = _b.sent();
                    return [4 /*yield*/, helpers_1.addModuleAsync(core, rebalancingSetExchangeIssuanceModule.address)];
                case 13:
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
                    return [2 /*return*/, rebalancingSetExchangeIssuanceModuleWrapper.issueRebalancingSetWithEther(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceParams, subjectExchangeOrdersData, subjectKeepChangeInVault, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT, value: subjectEtherValue })];
                });
            });
        }
        var subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceParams, subjectExchangeOrdersData, subjectKeepChangeInVault, subjectEtherValue, subjectCaller, baseSetComponent, baseSetComponent2, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, rebalancingSetIssueQuantity, baseSetIssueQuantity, wethRequiredToIssueBaseSet, totalEther, zeroExSendTokenQuantity, kyberSendTokenQuantity, exchangeIssuanceSendTokenQuantity, exchangeIssueSetAddress, exchangeIssueQuantity, exchangeIssueSendTokenExchangeIds, exchangeIssueSendTokens, exchangeIssueSendTokenAmounts, exchangeIssueReceiveTokens, exchangeIssueReceiveTokenAmounts, zeroExOrder, zeroExMakerAssetAmount, zeroExTakerAssetAmount, kyberTrade, kyberConversionRatePower;
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
                            subjectExchangeIssuanceParams = exchangeIssuanceParams;
                            subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder, kyberTrade]);
                            subjectKeepChangeInVault = false;
                            subjectCaller = functionCaller;
                            subjectEtherValue = totalEther.toString();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('issues the rebalancing Set to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousRBSetTokenBalance, expectedRBSetTokenBalance, currentRBSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousRBSetTokenBalance = _a.sent();
                            expectedRBSetTokenBalance = previousRBSetTokenBalance.add(rebalancingSetIssueQuantity);
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
            it('reduces the callers Ether balance by the expected amount', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousEthBalance, _a, txHash, totalGasInEth, expectedEthBalance, currentEthBalance;
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
                            return [4 /*yield*/, helpers_1.getGasUsageInEth(web3, txHash)];
                        case 3:
                            totalGasInEth = _b.sent();
                            expectedEthBalance = previousEthBalance
                                .sub(exchangeIssuanceSendTokenQuantity)
                                .sub(wethRequiredToIssueBaseSet)
                                .sub(totalGasInEth);
                            return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                        case 4:
                            currentEthBalance = _b.sent();
                            expect(expectedEthBalance).to.bignumber.equal(currentEthBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#issueRebalancingSetWithERC20', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, rebalancingSetExchangeIssuanceModuleWrapper.issueRebalancingSetWithERC20(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectPaymentTokenAddress, subjectPaymentTokenQuantity, subjectExchangeIssuanceParams, subjectExchangeOrdersData, subjectKeepChangeInVault, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                });
            });
        }
        var subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectPaymentTokenAddress, subjectPaymentTokenQuantity, subjectExchangeIssuanceParams, subjectExchangeOrdersData, subjectKeepChangeInVault, subjectCaller, baseSetComponent, baseSetComponent2, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, rebalancingSetIssueQuantity, baseSetIssueQuantity, wethRequiredToIssueBaseSet, totalWrappedEther, zeroExSendTokenQuantity, kyberSendTokenQuantity, exchangeIssuanceSendTokenQuantity, exchangeIssueSetAddress, exchangeIssueQuantity, exchangeIssueSendTokenExchangeIds, exchangeIssueSendTokens, exchangeIssueSendTokenAmounts, exchangeIssueReceiveTokens, exchangeIssueReceiveTokenAmounts, zeroExOrder, zeroExMakerAssetAmount, zeroExTakerAssetAmount, kyberTrade, kyberConversionRatePower;
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
                            subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder, kyberTrade]);
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
            it('issues the rebalancing Set to the caller', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousRBSetTokenBalance, expectedRBSetTokenBalance, currentRBSetTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, rebalancingSetToken.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousRBSetTokenBalance = _a.sent();
                            expectedRBSetTokenBalance = previousRBSetTokenBalance.add(rebalancingSetIssueQuantity);
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
            it('uses an expected amount of wrapped Eth', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousWethBalance, expectedWethBalance, currentWethBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, weth.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousWethBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedWethBalance = previousWethBalance.sub(subjectPaymentTokenQuantity);
                            return [4 /*yield*/, weth.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            currentWethBalance = _a.sent();
                            expect(expectedWethBalance).to.bignumber.equal(currentWethBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#redeemRebalancingSetIntoEther', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, rebalancingSetExchangeIssuanceModuleWrapper.redeemRebalancingSetIntoEther(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceParams, subjectExchangeOrdersData, subjectKeepChangeInVault, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                });
            });
        }
        var subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectExchangeIssuanceParams, subjectExchangeOrdersData, subjectKeepChangeInVault, subjectCaller, baseSetComponent, baseSetComponent2, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, rebalancingSetRedeemQuantity, baseSetRedeemQuantity, wethRequiredToIssueBaseSet, zeroExReceiveTokenQuantity, kyberReceiveTokenQuantity, exchangeIssuanceReceiveTokenQuantity, zeroExSendTokenQuantity, kyberSendTokenQuantity, totalEtherToReceive, exchangeRedeemSetAddress, exchangeRedeemQuantity, exchangeRedeemSendTokenExchangeIds, exchangeRedeemSendTokens, exchangeRedeemSendTokenAmounts, exchangeRedeemReceiveTokens, exchangeRedeemReceiveTokenAmounts, zeroExOrder, zeroExMakerAssetAmount, zeroExTakerAssetAmount, kyberTrade, kyberConversionRatePower;
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
                            totalEtherToReceive = exchangeIssuanceReceiveTokenQuantity.plus(wethRequiredToIssueBaseSet);
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
                            subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder, kyberTrade]);
                            subjectKeepChangeInVault = false;
                            subjectCaller = functionCaller;
                            return [2 /*return*/];
                    }
                });
            }); });
            it('redeems the rebalancing Set', function () { return __awaiter(_this, void 0, void 0, function () {
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
            it('should increment the users eth balance by the correct quantity', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousEthBalance, _a, txHash, totalGasInEth, expectedEthBalance, currentEthBalance;
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
                            return [4 /*yield*/, helpers_1.getGasUsageInEth(web3, txHash)];
                        case 3:
                            totalGasInEth = _b.sent();
                            expectedEthBalance = previousEthBalance
                                .add(totalEtherToReceive)
                                .sub(totalGasInEth);
                            return [4 /*yield*/, web3.eth.getBalance(subjectCaller)];
                        case 4:
                            currentEthBalance = _b.sent();
                            expect(currentEthBalance).to.bignumber.equal(expectedEthBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('increases the 0x makers send token quantity properly', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousTakerTokenBalance, expectedTakerTokenBalance, currentTakerTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(zeroExOrderMaker)];
                        case 1:
                            previousTakerTokenBalance = _a.sent();
                            expectedTakerTokenBalance = previousTakerTokenBalance.add(exchangeRedeemSendTokenAmounts[0]);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(zeroExOrderMaker)];
                        case 3:
                            currentTakerTokenBalance = _a.sent();
                            expect(expectedTakerTokenBalance).to.bignumber.equal(currentTakerTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('#redeemRebalancingSetIntoERC20', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, rebalancingSetExchangeIssuanceModuleWrapper.redeemRebalancingSetIntoERC20(subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectReceiveTokenAddress, subjectExchangeIssuanceParams, subjectExchangeOrdersData, subjectKeepChangeInVault, { from: subjectCaller, gas: constants_1.DEFAULT_GAS_LIMIT })];
                });
            });
        }
        var subjectRebalancingSetAddress, subjectRebalancingSetQuantity, subjectReceiveTokenAddress, subjectExchangeIssuanceParams, subjectExchangeOrdersData, subjectKeepChangeInVault, subjectCaller, baseSetComponent, baseSetComponent2, baseSetToken, baseSetNaturalUnit, rebalancingSetToken, rebalancingUnitShares, rebalancingSetRedeemQuantity, baseSetRedeemQuantity, wethRequiredToIssueBaseSet, zeroExReceiveTokenQuantity, kyberReceiveTokenQuantity, exchangeIssuanceReceiveTokenQuantity, zeroExSendTokenQuantity, kyberSendTokenQuantity, totalWrappedEtherToReceive, exchangeRedeemSetAddress, exchangeRedeemQuantity, exchangeRedeemSendTokenExchangeIds, exchangeRedeemSendTokens, exchangeRedeemSendTokenAmounts, exchangeRedeemReceiveTokens, exchangeRedeemReceiveTokenAmounts, zeroExOrder, zeroExMakerAssetAmount, zeroExTakerAssetAmount, kyberTrade, kyberConversionRatePower;
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
                            totalWrappedEtherToReceive = exchangeIssuanceReceiveTokenQuantity.plus(wethRequiredToIssueBaseSet);
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
                            subjectExchangeOrdersData = setUtils.generateSerializedOrders([zeroExOrder, kyberTrade]);
                            subjectKeepChangeInVault = false;
                            subjectCaller = functionCaller;
                            return [2 /*return*/];
                    }
                });
            }); });
            it('redeems the rebalancing Set', function () { return __awaiter(_this, void 0, void 0, function () {
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
            it('should increment the users weth balance by the correct quantity', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousWethBalance, expectedWethBalance, currentWethBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, weth.balanceOf.callAsync(subjectCaller)];
                        case 1:
                            previousWethBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedWethBalance = previousWethBalance.add(totalWrappedEtherToReceive);
                            return [4 /*yield*/, weth.balanceOf.callAsync(subjectCaller)];
                        case 3:
                            currentWethBalance = _a.sent();
                            expect(currentWethBalance).to.bignumber.equal(expectedWethBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('increases the 0x makers send token quantity properly', function () { return __awaiter(_this, void 0, void 0, function () {
                var previousTakerTokenBalance, expectedTakerTokenBalance, currentTakerTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(zeroExOrderMaker)];
                        case 1:
                            previousTakerTokenBalance = _a.sent();
                            expectedTakerTokenBalance = previousTakerTokenBalance.add(exchangeRedeemSendTokenAmounts[0]);
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, baseSetComponent.balanceOf.callAsync(zeroExOrderMaker)];
                        case 3:
                            currentTakerTokenBalance = _a.sent();
                            expect(expectedTakerTokenBalance).to.bignumber.equal(currentTakerTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=RebalancingSetExchangeIssuanceModuleWrapper.spec.js.map