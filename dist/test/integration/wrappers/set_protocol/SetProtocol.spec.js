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
var _ = __importStar(require("lodash"));
var ABIDecoder = __importStar(require("abi-decoder"));
var chai = __importStar(require("chai"));
var web3_1 = __importDefault(require("web3"));
var set_protocol_contracts_1 = require("set-protocol-contracts");
var set_protocol_contracts_2 = require("set-protocol-contracts");
var set_protocol_utils_1 = require("set-protocol-utils");
var chaiSetup_1 = __importDefault(require("../../../helpers/chaiSetup"));
var accounts_1 = require("@src/constants/accounts");
var SetProtocol_1 = __importDefault(require("@src/SetProtocol"));
var constants_1 = require("@src/constants");
var logs_1 = require("@src/util/logs");
var util_1 = require("@src/util");
var wrappers_1 = require("@src/wrappers");
var helpers_1 = require("@test/helpers");
var util_2 = require("@src/util");
chaiSetup_1.default.configure();
var expect = chai.expect;
var UNLIMITED_ALLOWANCE_IN_BASE_UNITS = set_protocol_utils_1.SetProtocolUtils.CONSTANTS.UNLIMITED_ALLOWANCE_IN_BASE_UNITS;
var contract = require('truffle-contract');
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var erc20Wrapper = new wrappers_1.ERC20Wrapper(web3);
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('SetProtocol', function () { return __awaiter(_this, void 0, void 0, function () {
    var transferProxy, vault, core, setTokenFactory, rebalancingSetTokenFactory, setProtocol;
    var _this = this;
    return __generator(this, function (_a) {
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
                        setProtocol = new SetProtocol_1.default(web3.currentProvider, {
                            coreAddress: core.address,
                            transferProxyAddress: transferProxy.address,
                            vaultAddress: vault.address,
                            setTokenFactoryAddress: setTokenFactory.address,
                            rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
                        });
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
        describe('calculateMinimumNaturalUnitAsync', function () { return __awaiter(_this, void 0, void 0, function () {
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.calculateMinimumNaturalUnitAsync(subjectComponents)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            var mockNoDecimalToken, mockTokens, subjectComponents;
            var _this = this;
            return __generator(this, function (_a) {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, helpers_1.deployNoDecimalTokenAsync(web3)];
                            case 1:
                                mockNoDecimalToken = _a.sent();
                                return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                            case 2:
                                mockTokens = _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('returns the correct minimum natural unit', function () { return __awaiter(_this, void 0, void 0, function () {
                    var decimalPromises, decimals, minDecimal, minimumNaturalUnit;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                decimalPromises = _.map(mockTokens, function (mockToken) {
                                    return erc20Wrapper.decimals(mockToken.address);
                                });
                                return [4 /*yield*/, Promise.all(decimalPromises)];
                            case 1:
                                decimals = _a.sent();
                                minDecimal = util_1.BigNumber.min(decimals);
                                subjectComponents = _.map(mockTokens, function (mockToken) { return mockToken.address; });
                                return [4 /*yield*/, subject()];
                            case 2:
                                minimumNaturalUnit = _a.sent();
                                expect(minimumNaturalUnit).to.bignumber.equal(new util_1.BigNumber(10).pow(18 - minDecimal.toNumber()));
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('returns max natural unit if one token does not have decimals', function () { return __awaiter(_this, void 0, void 0, function () {
                    var minimumNaturalUnit;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                subjectComponents = _.map(mockTokens, function (mockToken) { return mockToken.address; });
                                subjectComponents.push(mockNoDecimalToken.address);
                                return [4 /*yield*/, subject()];
                            case 1:
                                minimumNaturalUnit = _a.sent();
                                expect(minimumNaturalUnit).to.bignumber.equal(new util_1.BigNumber(10).pow(18));
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        }); });
        describe('calculateSetUnitsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.calculateSetUnitsAsync(subjectComponentAddresses, subjectComponentPrices, subjectComponentAllocations, subjectTargetSetPrice, subjectPercentError)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            var subjectComponentAddresses, subjectComponentPrices, subjectComponentAllocations, subjectTargetSetPrice, subjectPercentError;
            var _this = this;
            return __generator(this, function (_a) {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    var tokenCount, decimalsList, components;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                tokenCount = 2;
                                decimalsList = [18, 18];
                                return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3)];
                            case 1:
                                components = _a.sent();
                                subjectComponentAddresses = _.map(components, function (component) { return component.address; });
                                subjectComponentPrices = [new util_1.BigNumber(2), new util_1.BigNumber(2)];
                                subjectComponentAllocations = [new util_1.BigNumber(0.5), new util_1.BigNumber(0.5)];
                                subjectTargetSetPrice = new util_1.BigNumber(10);
                                subjectPercentError = 10;
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('should calculate the correct required component units', function () { return __awaiter(_this, void 0, void 0, function () {
                    var units, expectedResult;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, subject()];
                            case 1:
                                units = (_a.sent()).units;
                                expectedResult = [new util_1.BigNumber(25), new util_1.BigNumber(25)];
                                expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedResult));
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('should calculate the correct natural units', function () { return __awaiter(_this, void 0, void 0, function () {
                    var naturalUnit, expectedResult;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, subject()];
                            case 1:
                                naturalUnit = (_a.sent()).naturalUnit;
                                expectedResult = new util_1.BigNumber(10);
                                expect(naturalUnit).to.bignumber.equal(expectedResult);
                                return [2 /*return*/];
                        }
                    });
                }); });
                describe('when the percent error is not pass in', function () { return __awaiter(_this, void 0, void 0, function () {
                    function subject() {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, setProtocol.calculateSetUnitsAsync(subjectComponentAddresses, subjectComponentPrices, subjectComponentAllocations, subjectTargetSetPrice)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        });
                    }
                    var _this = this;
                    return __generator(this, function (_a) {
                        test('it defaults to 10%', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, units, naturalUnit, expectedComponentUnit, expectedNaturalUnit;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, subject()];
                                    case 1:
                                        _a = _b.sent(), units = _a.units, naturalUnit = _a.naturalUnit;
                                        expectedComponentUnit = [new util_1.BigNumber(25), new util_1.BigNumber(25)];
                                        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedComponentUnit));
                                        expectedNaturalUnit = new util_1.BigNumber(10);
                                        expect(naturalUnit).to.bignumber.equal(expectedNaturalUnit);
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
        describe('calculateSetUnits', function () { return __awaiter(_this, void 0, void 0, function () {
            function subject() {
                return setProtocol.calculateSetUnits(subjectComponentAddresses, subjectDecimals, subjectComponentPrices, subjectComponentAllocations, subjectTargetSetPrice, subjectPercentError);
            }
            var subjectComponentAddresses, subjectDecimals, subjectComponentPrices, subjectComponentAllocations, subjectTargetSetPrice, subjectPercentError;
            var _this = this;
            return __generator(this, function (_a) {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    var tokenCount, decimalsList, components;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                tokenCount = 2;
                                decimalsList = [18, 18];
                                return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3)];
                            case 1:
                                components = _a.sent();
                                subjectComponentAddresses = _.map(components, function (component) { return component.address; });
                                subjectDecimals = decimalsList;
                                subjectComponentPrices = [new util_1.BigNumber(2), new util_1.BigNumber(2)];
                                subjectComponentAllocations = [new util_1.BigNumber(0.5), new util_1.BigNumber(0.5)];
                                subjectTargetSetPrice = new util_1.BigNumber(10);
                                subjectPercentError = 10;
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('should calculate the correct required component units', function () { return __awaiter(_this, void 0, void 0, function () {
                    var units, expectedResult;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, subject()];
                            case 1:
                                units = (_a.sent()).units;
                                expectedResult = [new util_1.BigNumber(25), new util_1.BigNumber(25)];
                                expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedResult));
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('should calculate the correct natural units', function () { return __awaiter(_this, void 0, void 0, function () {
                    var naturalUnit, expectedResult;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, subject()];
                            case 1:
                                naturalUnit = (_a.sent()).naturalUnit;
                                expectedResult = new util_1.BigNumber(10);
                                expect(naturalUnit).to.bignumber.equal(expectedResult);
                                return [2 /*return*/];
                        }
                    });
                }); });
                describe('when the percent error is not pass in', function () { return __awaiter(_this, void 0, void 0, function () {
                    function subject() {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, setProtocol.calculateSetUnitsAsync(subjectComponentAddresses, subjectComponentPrices, subjectComponentAllocations, subjectTargetSetPrice)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        });
                    }
                    var _this = this;
                    return __generator(this, function (_a) {
                        test('it defaults to 10%', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, units, naturalUnit, expectedComponentUnit, expectedNaturalUnit;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, subject()];
                                    case 1:
                                        _a = _b.sent(), units = _a.units, naturalUnit = _a.naturalUnit;
                                        expectedComponentUnit = [new util_1.BigNumber(25), new util_1.BigNumber(25)];
                                        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedComponentUnit));
                                        expectedNaturalUnit = new util_1.BigNumber(10);
                                        expect(naturalUnit).to.bignumber.equal(expectedNaturalUnit);
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
        describe('createSetAsync', function () { return __awaiter(_this, void 0, void 0, function () {
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.createSetAsync(subjectComponents, subjectUnits, subjectNaturalUnit, subjectName, subjectSymbol, { from: subjectCaller })];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            var componentTokens, subjectComponents, subjectUnits, subjectNaturalUnit, subjectName, subjectSymbol, subjectCaller;
            var _this = this;
            return __generator(this, function (_a) {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                            case 1:
                                componentTokens = _a.sent();
                                subjectComponents = componentTokens.map(function (component) { return component.address; });
                                subjectUnits = subjectComponents.map(function (component) { return util_2.ether(4); });
                                subjectNaturalUnit = util_2.ether(2);
                                subjectName = 'My Set';
                                subjectSymbol = 'SET';
                                subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('deploys a new SetToken contract', function () { return __awaiter(_this, void 0, void 0, function () {
                    var createSetTransactionHash, logs, deployedSetTokenAddress, setTokenContract, componentAddresses, componentUnits, naturalUnit, name, symbol;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, subject()];
                            case 1:
                                createSetTransactionHash = _a.sent();
                                return [4 /*yield*/, logs_1.getFormattedLogsFromTxHash(web3, createSetTransactionHash)];
                            case 2:
                                logs = _a.sent();
                                deployedSetTokenAddress = logs_1.extractNewSetTokenAddressFromLogs(logs);
                                return [4 /*yield*/, set_protocol_contracts_2.SetTokenContract.at(deployedSetTokenAddress, web3, constants_1.TX_DEFAULTS)];
                            case 3:
                                setTokenContract = _a.sent();
                                return [4 /*yield*/, setTokenContract.getComponents.callAsync()];
                            case 4:
                                componentAddresses = _a.sent();
                                expect(componentAddresses).to.eql(subjectComponents);
                                return [4 /*yield*/, setTokenContract.getUnits.callAsync()];
                            case 5:
                                componentUnits = _a.sent();
                                expect(JSON.stringify(componentUnits)).to.eql(JSON.stringify(subjectUnits));
                                return [4 /*yield*/, setTokenContract.naturalUnit.callAsync()];
                            case 6:
                                naturalUnit = _a.sent();
                                expect(naturalUnit).to.bignumber.equal(subjectNaturalUnit);
                                return [4 /*yield*/, setTokenContract.name.callAsync()];
                            case 7:
                                name = _a.sent();
                                expect(name).to.eql(subjectName);
                                return [4 /*yield*/, setTokenContract.symbol.callAsync()];
                            case 8:
                                symbol = _a.sent();
                                expect(symbol).to.eql(subjectSymbol);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        }); });
        describe('createRebalancingSetTokenAsync', function () { return __awaiter(_this, void 0, void 0, function () {
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.createRebalancingSetTokenAsync(subjectManager, subjectInitialSet, subjectInitialUnitShares, subjectProposalPeriod, subjectRebalanceInterval, subjectName, subjectSymbol, { from: subjectCaller })];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            var subjectManager, subjectInitialSet, subjectInitialUnitShares, subjectProposalPeriod, subjectRebalanceInterval, subjectName, subjectSymbol, subjectCaller;
            var _this = this;
            return __generator(this, function (_a) {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    var setTokensToDeploy, setToken;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                setTokensToDeploy = 1;
                                return [4 /*yield*/, helpers_1.deploySetTokensAsync(web3, core, setTokenFactory.address, transferProxy.address, setTokensToDeploy)];
                            case 1:
                                setToken = (_a.sent())[0];
                                subjectManager = accounts_1.ACCOUNTS[1].address;
                                subjectInitialSet = setToken.address;
                                subjectInitialUnitShares = constants_1.DEFAULT_UNIT_SHARES;
                                subjectProposalPeriod = constants_1.ONE_DAY_IN_SECONDS;
                                subjectRebalanceInterval = constants_1.ONE_DAY_IN_SECONDS;
                                subjectName = 'My Set';
                                subjectSymbol = 'SET';
                                subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('deploys a new SetToken contract', function () { return __awaiter(_this, void 0, void 0, function () {
                    var createRebalancingSetTransactionHash, logs, deployedRebalancingSetTokenAddress, rebalancingSetTokenContract, currentSetAddress, manager, proposalPeriod, rebalanceInterval, name, symbol;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, subject()];
                            case 1:
                                createRebalancingSetTransactionHash = _a.sent();
                                return [4 /*yield*/, logs_1.getFormattedLogsFromTxHash(web3, createRebalancingSetTransactionHash)];
                            case 2:
                                logs = _a.sent();
                                deployedRebalancingSetTokenAddress = logs_1.extractNewSetTokenAddressFromLogs(logs);
                                return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetTokenContract.at(deployedRebalancingSetTokenAddress, web3, constants_1.TX_DEFAULTS)];
                            case 3:
                                rebalancingSetTokenContract = _a.sent();
                                return [4 /*yield*/, rebalancingSetTokenContract.currentSet.callAsync()];
                            case 4:
                                currentSetAddress = _a.sent();
                                expect(currentSetAddress).to.eql(subjectInitialSet);
                                return [4 /*yield*/, rebalancingSetTokenContract.manager.callAsync()];
                            case 5:
                                manager = _a.sent();
                                expect(manager).to.eql(subjectManager);
                                return [4 /*yield*/, rebalancingSetTokenContract.proposalPeriod.callAsync()];
                            case 6:
                                proposalPeriod = _a.sent();
                                expect(proposalPeriod).to.bignumber.equal(subjectProposalPeriod);
                                return [4 /*yield*/, rebalancingSetTokenContract.rebalanceInterval.callAsync()];
                            case 7:
                                rebalanceInterval = _a.sent();
                                expect(rebalanceInterval).to.bignumber.equal(subjectRebalanceInterval);
                                return [4 /*yield*/, rebalancingSetTokenContract.name.callAsync()];
                            case 8:
                                name = _a.sent();
                                expect(name).to.eql(subjectName);
                                return [4 /*yield*/, rebalancingSetTokenContract.symbol.callAsync()];
                            case 9:
                                symbol = _a.sent();
                                expect(symbol).to.eql(subjectSymbol);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        }); });
        describe('issueAsync', function () {
            var subjectSetToIssue;
            var subjectQuantitytoIssue;
            var subjectCaller;
            var setToken;
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentTokens, setComponentUnit, componentUnits, naturalUnit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            setComponentUnit = util_2.ether(4);
                            componentUnits = componentTokens.map(function () { return setComponentUnit; });
                            naturalUnit = util_2.ether(2);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokens.map(function (token) { return token.address; }), componentUnits, naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync(componentTokens, transferProxy.address)];
                        case 3:
                            _a.sent();
                            subjectSetToIssue = setToken.address;
                            subjectQuantitytoIssue = util_2.ether(2);
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.issueAsync(subjectSetToIssue, subjectQuantitytoIssue, { from: subjectCaller })];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            test('updates the set balance of the user by the issue quantity', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingSetUserBalance, expectedSetUserBalance, newSetUserBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setToken.balanceOf.callAsync(accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            existingSetUserBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedSetUserBalance = existingSetUserBalance.add(subjectQuantitytoIssue);
                            return [4 /*yield*/, setToken.balanceOf.callAsync(accounts_1.DEFAULT_ACCOUNT)];
                        case 3:
                            newSetUserBalance = _a.sent();
                            expect(newSetUserBalance).to.eql(expectedSetUserBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('redeemAsync', function () {
            var subjectSetToRedeem;
            var subjectQuantityToRedeem;
            var subjectShouldWithdraw;
            var subjectTokensToExclude;
            var subjectCaller;
            var setToken;
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentTokens, setComponentUnit, componentUnits, naturalUnit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            setComponentUnit = util_2.ether(4);
                            componentUnits = componentTokens.map(function () { return setComponentUnit; });
                            naturalUnit = util_2.ether(2);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokens.map(function (token) { return token.address; }), componentUnits, naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync(componentTokens, transferProxy.address)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, core.issue.sendTransactionAsync(setToken.address, util_2.ether(2), constants_1.TX_DEFAULTS)];
                        case 4:
                            _a.sent();
                            subjectSetToRedeem = setToken.address;
                            subjectQuantityToRedeem = util_2.ether(2);
                            subjectShouldWithdraw = false;
                            subjectTokensToExclude = [];
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.redeemAsync(subjectSetToRedeem, subjectQuantityToRedeem, subjectShouldWithdraw, subjectTokensToExclude, { from: subjectCaller })];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            test('updates the set balance of the user by the redeem quantity', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingSetUserBalance, expectedSetUserBalance, newSetUserBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setToken.balanceOf.callAsync(accounts_1.DEFAULT_ACCOUNT)];
                        case 1:
                            existingSetUserBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedSetUserBalance = existingSetUserBalance.sub(subjectQuantityToRedeem);
                            return [4 /*yield*/, setToken.balanceOf.callAsync(accounts_1.DEFAULT_ACCOUNT)];
                        case 3:
                            newSetUserBalance = _a.sent();
                            expect(newSetUserBalance).to.eql(expectedSetUserBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('depositAsync', function () {
            var subjectTokenAddressesToDeposit;
            var subjectQuantitiesToDeposit;
            var subjectCaller;
            var tokens;
            var depositQuantity;
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            tokens = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync(tokens, transferProxy.address)];
                        case 2:
                            _a.sent();
                            depositQuantity = new util_1.BigNumber(100);
                            subjectTokenAddressesToDeposit = tokens.map(function (token) { return token.address; });
                            subjectQuantitiesToDeposit = tokens.map(function () { return depositQuantity; });
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.depositAsync(subjectTokenAddressesToDeposit, subjectQuantitiesToDeposit, { from: subjectCaller })];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            test('correctly updates the vault balances', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingVaultOwnerBalances, expectedVaultOwnerBalances, newOwnerVaultBalances;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.getVaultBalances(vault, subjectTokenAddressesToDeposit, subjectCaller)];
                        case 1:
                            existingVaultOwnerBalances = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedVaultOwnerBalances = _.map(existingVaultOwnerBalances, function (balance) { return balance.add(depositQuantity); });
                            return [4 /*yield*/, helpers_1.getVaultBalances(vault, subjectTokenAddressesToDeposit, subjectCaller)];
                        case 3:
                            newOwnerVaultBalances = _a.sent();
                            expect(newOwnerVaultBalances).to.eql(expectedVaultOwnerBalances);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('withdrawAsync', function () {
            var subjectTokenAddressesToWithdraw;
            var subjectQuantitiesToWithdraw;
            var subjectCaller;
            var tokens;
            var withdrawQuantity;
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var quantitiesToDeposit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            tokens = _a.sent();
                            return [4 /*yield*/, helpers_1.approveForTransferAsync(tokens, transferProxy.address)];
                        case 2:
                            _a.sent();
                            withdrawQuantity = new util_1.BigNumber(100);
                            subjectTokenAddressesToWithdraw = tokens.map(function (token) { return token.address; });
                            quantitiesToDeposit = subjectTokenAddressesToWithdraw.map(function () { return withdrawQuantity; });
                            return [4 /*yield*/, setProtocol.depositAsync(subjectTokenAddressesToWithdraw, quantitiesToDeposit, { from: accounts_1.DEFAULT_ACCOUNT })];
                        case 3:
                            _a.sent();
                            subjectQuantitiesToWithdraw = quantitiesToDeposit;
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.withdrawAsync(subjectTokenAddressesToWithdraw, subjectQuantitiesToWithdraw, { from: subjectCaller })];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            test('correctly updates the vault balances', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingVaultOwnerBalances, expectedVaultOwnerBalances, newOwnerVaultBalances;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.getVaultBalances(vault, subjectTokenAddressesToWithdraw, subjectCaller)];
                        case 1:
                            existingVaultOwnerBalances = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedVaultOwnerBalances = _.map(existingVaultOwnerBalances, function (balance) { return balance.sub(withdrawQuantity); });
                            return [4 /*yield*/, helpers_1.getVaultBalances(vault, subjectTokenAddressesToWithdraw, subjectCaller)];
                        case 3:
                            newOwnerVaultBalances = _a.sent();
                            expect(newOwnerVaultBalances).to.eql(expectedVaultOwnerBalances);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('setTransferProxyAllowanceAsync', function () { return __awaiter(_this, void 0, void 0, function () {
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.setTransferProxyAllowanceAsync(token.address, subjectQuantity, { from: subjectCaller })];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            var token, subjectCaller, subjectQuantity;
            var _this = this;
            return __generator(this, function (_a) {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    var tokenContracts;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(1, web3)];
                            case 1:
                                tokenContracts = _a.sent();
                                token = tokenContracts[0];
                                subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                                subjectQuantity = new util_1.BigNumber(1000);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('sets the allowance properly', function () { return __awaiter(_this, void 0, void 0, function () {
                    var existingAllowance, expectedNewAllowance, newAllowance;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, token.allowance.callAsync(subjectCaller, transferProxy.address)];
                            case 1:
                                existingAllowance = _a.sent();
                                return [4 /*yield*/, subject()];
                            case 2:
                                _a.sent();
                                expectedNewAllowance = existingAllowance.add(subjectQuantity);
                                return [4 /*yield*/, token.allowance.callAsync(subjectCaller, transferProxy.address)];
                            case 3:
                                newAllowance = _a.sent();
                                expect(newAllowance).to.bignumber.equal(expectedNewAllowance);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        }); });
        describe('setUnlimitedTransferProxyAllowanceAsync', function () { return __awaiter(_this, void 0, void 0, function () {
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.setUnlimitedTransferProxyAllowanceAsync(token.address, { from: subjectCaller })];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            var token, subjectCaller;
            var _this = this;
            return __generator(this, function (_a) {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    var tokenContracts;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(1, web3)];
                            case 1:
                                tokenContracts = _a.sent();
                                token = tokenContracts[0];
                                subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('sets the allowance properly', function () { return __awaiter(_this, void 0, void 0, function () {
                    var newAllowance;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, subject()];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, token.allowance.callAsync(subjectCaller, transferProxy.address)];
                            case 2:
                                newAllowance = _a.sent();
                                expect(newAllowance).to.bignumber.equal(UNLIMITED_ALLOWANCE_IN_BASE_UNITS);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        }); });
        describe('awaitTransactionMinedAsync', function () { return __awaiter(_this, void 0, void 0, function () {
            function subject() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.awaitTransactionMinedAsync(subjectTxHash)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            var subjectTxHash, standardTokenContract, transactionToken, transactionCaller, transactionSpender, transactionQuantity;
            var _this = this;
            return __generator(this, function (_a) {
                standardTokenContract = contract(set_protocol_contracts_1.StandardTokenMock);
                beforeAll(function () {
                    ABIDecoder.addABI(standardTokenContract.abi);
                });
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                            case 1:
                                transactionToken = _a.sent();
                                transactionCaller = accounts_1.DEFAULT_ACCOUNT;
                                transactionSpender = accounts_1.ACCOUNTS[0].address;
                                transactionQuantity = new util_1.BigNumber(1);
                                return [4 /*yield*/, transactionToken.approve.sendTransactionAsync(transactionSpender, transactionQuantity, { from: transactionCaller })];
                            case 2:
                                subjectTxHash = _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                afterAll(function () {
                    ABIDecoder.removeABI(standardTokenContract.abi);
                });
                test('returns transaction receipt with the correct logs', function () { return __awaiter(_this, void 0, void 0, function () {
                    var receipt, formattedLogs, approvalLog, _a, owner, spender, value;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, subject()];
                            case 1:
                                receipt = _b.sent();
                                formattedLogs = util_2.getFormattedLogsFromReceipt(receipt);
                                approvalLog = formattedLogs[0];
                                _a = approvalLog.args, owner = _a.owner, spender = _a.spender, value = _a.value;
                                expect(approvalLog.address).to.equal(transactionToken.address);
                                expect(owner).to.equal(transactionCaller.toLowerCase());
                                expect(spender).to.equal(transactionSpender.toLowerCase());
                                expect(value).to.bignumber.equal(transactionQuantity);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        }); });
        /* ============ Core State Getters ============ */
        describe('Core State Getters', function () { return __awaiter(_this, void 0, void 0, function () {
            var setToken;
            var _this = this;
            return __generator(this, function (_a) {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    var componentTokens, setComponentUnit, naturalUnit;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                            case 1:
                                componentTokens = _a.sent();
                                setComponentUnit = util_2.ether(4);
                                naturalUnit = util_2.ether(2);
                                return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokens.map(function (token) { return token.address; }), componentTokens.map(function (token) { return setComponentUnit; }), naturalUnit)];
                            case 2:
                                setToken = _a.sent();
                                return [4 /*yield*/, helpers_1.approveForTransferAsync(componentTokens, transferProxy.address)];
                            case 3:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('gets Set addresses', function () { return __awaiter(_this, void 0, void 0, function () {
                    var setAddresses;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.getSetAddressesAsync()];
                            case 1:
                                setAddresses = _a.sent();
                                expect(setAddresses.length).to.equal(1);
                                expect(setAddresses[0]).to.equal(setToken.address);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('gets is valid factory address', function () { return __awaiter(_this, void 0, void 0, function () {
                    var isValidVaultAddress;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, setProtocol.isValidFactoryAsync(setTokenFactory.address)];
                            case 1:
                                isValidVaultAddress = _a.sent();
                                expect(isValidVaultAddress).to.equal(true);
                                return [4 /*yield*/, setProtocol.isValidSetAsync(constants_1.NULL_ADDRESS)];
                            case 2:
                                isValidVaultAddress = _a.sent();
                                expect(isValidVaultAddress).to.equal(false);
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
//# sourceMappingURL=SetProtocol.spec.js.map