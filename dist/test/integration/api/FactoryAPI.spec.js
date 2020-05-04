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
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
var api_1 = require("@src/api");
var util_1 = require("@src/util");
var assertions_1 = require("@src/assertions");
var wrappers_1 = require("@src/wrappers");
var accounts_1 = require("@src/constants/accounts");
var constants_1 = require("@src/constants");
var helpers_1 = require("@test/helpers");
var logs_1 = require("@src/util/logs");
var units_1 = require("@src/util/units");
chaiSetup_1.default.configure();
var contract = require('truffle-contract');
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var expect = chai.expect;
var coreContract = contract(set_protocol_contracts_1.Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('FactoryAPI', function () {
    var transferProxy;
    var vault;
    var core;
    var setTokenFactory;
    var rebalancingSetTokenFactory;
    var rebalanceAuctionModule;
    var config;
    var coreWrapper;
    var factoryAPI;
    var assertions;
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
                    _a = _b.sent(), core = _a[0], transferProxy = _a[1], vault = _a[2], setTokenFactory = _a[3], rebalancingSetTokenFactory = _a[4], rebalanceAuctionModule = _a[5];
                    config = {
                        coreAddress: core.address,
                        transferProxyAddress: transferProxy.address,
                        vaultAddress: vault.address,
                        setTokenFactoryAddress: setTokenFactory.address,
                        rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
                        rebalanceAuctionModuleAddress: rebalanceAuctionModule.address,
                    };
                    coreWrapper = new wrappers_1.CoreWrapper(web3, config.coreAddress, config.transferProxyAddress, config.vaultAddress);
                    assertions = new assertions_1.Assertions(web3);
                    factoryAPI = new api_1.FactoryAPI(web3, coreWrapper, assertions, config);
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
    describe('createSetAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, factoryAPI.createSetAsync(subjectComponents, subjectUnits, subjectNaturalUnit, subjectName, subjectSymbol, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectComponents, subjectUnits, subjectNaturalUnit, subjectName, subjectSymbol, subjectCaller, componentTokens;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            subjectComponents = componentTokens.map(function (component) { return component.address; });
                            subjectUnits = subjectComponents.map(function (component) { return units_1.ether(4); });
                            subjectNaturalUnit = units_1.ether(2);
                            subjectName = 'My Set';
                            subjectSymbol = 'SET';
                            subjectCaller = constants_1.DEFAULT_ACCOUNT;
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
            describe('when the transaction caller address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectCaller = 'invalidCallerAddress';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected txOpts.from to conform to schema /Address.\n\n        Encountered: \"invalidCallerAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the set factory address is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var invalidSetFactoryAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            invalidSetFactoryAddress = 'invalidSetFactoryAddress';
                            config.setTokenFactoryAddress = invalidSetFactoryAddress;
                            factoryAPI = new api_1.FactoryAPI(web3, coreWrapper, assertions, config);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected factoryAddress to conform to schema /Address.\n\n        Encountered: \"invalidSetFactoryAddress\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the component addresses and units are not the same length', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectComponents = [subjectComponents[0]];
                            subjectUnits = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('The components and units arrays need to be equal lengths.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the natural unit is a negative number', function () { return __awaiter(_this, void 0, void 0, function () {
                var invalidNaturalUnit;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            invalidNaturalUnit = new util_1.BigNumber(-1);
                            subjectNaturalUnit = invalidNaturalUnit;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + invalidNaturalUnit + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the name is empty', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectName = '';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('The string name cannot be empty.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the symbol is empty', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectSymbol = '';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('The string symbol cannot be empty.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the component units contains a negative number', function () { return __awaiter(_this, void 0, void 0, function () {
                var invalidComponentUnit;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            invalidComponentUnit = new util_1.BigNumber(-1);
                            subjectComponents = [componentTokens[0].address];
                            subjectUnits = [invalidComponentUnit];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("The quantity " + invalidComponentUnit + " inputted needs to be greater than zero.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the component addresses contains an empty element', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var placeholderUnitForArrayLength, emptyComponentAddress;
                        return __generator(this, function (_a) {
                            placeholderUnitForArrayLength = units_1.ether(1);
                            emptyComponentAddress = '';
                            subjectComponents = [emptyComponentAddress];
                            subjectUnits = [placeholderUnitForArrayLength];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith('The string component cannot be empty.')];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the component addresses contains an invalid address', function () { return __awaiter(_this, void 0, void 0, function () {
                var invalidComponentAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var placeholderUnitForArrayLength;
                        return __generator(this, function (_a) {
                            placeholderUnitForArrayLength = units_1.ether(1);
                            invalidComponentAddress = 'someNonAddressString';
                            subjectComponents = [invalidComponentAddress];
                            subjectUnits = [placeholderUnitForArrayLength];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected componentAddress to conform to schema /Address.\n\n        Encountered: \"someNonAddressString\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{40}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the component addresses contains an address for a non ERC20 contract', function () { return __awaiter(_this, void 0, void 0, function () {
                var nonERC20ContractAddress;
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var placeholderUnitForArrayLength;
                        return __generator(this, function (_a) {
                            placeholderUnitForArrayLength = units_1.ether(1);
                            nonERC20ContractAddress = vault.address;
                            subjectComponents = [nonERC20ContractAddress];
                            subjectUnits = [placeholderUnitForArrayLength];
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + nonERC20ContractAddress + " does not implement ERC20 interface.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the natural unit is not valid for the units', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectNaturalUnit = new util_1.BigNumber(1);
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        var minNaturalUnit;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, factoryAPI.calculateMinimumNaturalUnitAsync(subjectComponents)];
                                case 1:
                                    minNaturalUnit = _a.sent();
                                    return [2 /*return*/, expect(subject()).to.be.rejectedWith("Natural unit must be larger than minimum unit, " + minNaturalUnit.toString() + ", allowed by components.")];
                            }
                        });
                    }); });
                    return [2 /*return*/];
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
                        case 0: return [4 /*yield*/, factoryAPI.createRebalancingSetTokenAsync(subjectManager, subjectInitialSet, subjectInitialUnitShares, subjectProposalPeriod, subjectRebalanceInterval, subjectName, subjectSymbol, { from: subjectCaller })];
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
                            subjectCaller = constants_1.DEFAULT_ACCOUNT;
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
            describe('when the initialSet is not an address of a Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var token;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                                case 1:
                                    token = _a.sent();
                                    subjectInitialSet = token.address;
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Contract at " + subjectInitialSet + " is not a valid Set token address.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the init shares ratio is zero', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectInitialUnitShares = constants_1.ZERO;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Parameter initialUnitShares: " + subjectInitialUnitShares + " must be greater than 0.")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getSetAddressFromCreateTxHash', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, factoryAPI.getSetAddressFromCreateTxHash(subjectTxHash)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectTxHash;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentTokens, setComponentUnit, naturalUnit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            setComponentUnit = units_1.ether(4);
                            naturalUnit = units_1.ether(2);
                            return [4 /*yield*/, core.createSet.sendTransactionAsync(setTokenFactory.address, componentTokens.map(function (token) { return token.address; }), componentTokens.map(function (token) { return setComponentUnit; }), naturalUnit, set_protocol_utils_1.SetProtocolUtils.stringToBytes('set'), set_protocol_utils_1.SetProtocolUtils.stringToBytes('SET'), '0x0', constants_1.TX_DEFAULTS)];
                        case 2:
                            subjectTxHash = _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('retrieves the correct set address', function () { return __awaiter(_this, void 0, void 0, function () {
                var setAddress, formattedLogs, expectedSetAddress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            setAddress = _a.sent();
                            return [4 /*yield*/, logs_1.getFormattedLogsFromTxHash(web3, subjectTxHash)];
                        case 2:
                            formattedLogs = _a.sent();
                            expectedSetAddress = logs_1.extractNewSetTokenAddressFromLogs(formattedLogs);
                            expect(setAddress).to.equal(expectedSetAddress);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the transaction hash is invalid', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectTxHash = 'invalidTransactionHash';
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("\n        Expected txHash to conform to schema /Bytes32.\n\n        Encountered: \"invalidTransactionHash\"\n\n        Validation errors: instance does not match pattern \"^0x[0-9a-fA-F]{64}$\"\n      ")];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('calculateMinimumNaturalUnitAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, factoryAPI.calculateMinimumNaturalUnitAsync(subjectComponents)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var componentInstances, subjectComponents;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    subjectComponents = componentInstances.map(function (component) { return component.address; });
                    return [2 /*return*/];
                });
            }); });
            describe('when the decimals and token count are standard', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        var tokenCount, decimalsList;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    tokenCount = 2;
                                    decimalsList = [18, 18];
                                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3)];
                                case 1:
                                    componentInstances = _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            componentInstances = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('it calculates the minimum natural unit correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedResult, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedResult = new util_1.BigNumber(1);
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    result = _a.sent();
                                    expect(result).to.bignumber.equal(expectedResult);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when a component does not implement decimals', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        var standardToken, nonDecimalComponent;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(1, [18], web3)];
                                case 1:
                                    standardToken = (_a.sent())[0];
                                    return [4 /*yield*/, helpers_1.deployNoDecimalTokenAsync(web3)];
                                case 2:
                                    nonDecimalComponent = _a.sent();
                                    componentInstances = [standardToken, nonDecimalComponent];
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            componentInstances = [];
                            return [2 /*return*/];
                        });
                    }); });
                    it('it calculates the minimum natural unit correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedResult, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedResult = new util_1.BigNumber(10).pow(18);
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    result = _a.sent();
                                    expect(result).to.bignumber.equal(expectedResult);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the decimals of the components are all different', function () { return __awaiter(_this, void 0, void 0, function () {
                var smallerDecimal, largerDecimal, decimalsList;
                var _this = this;
                return __generator(this, function (_a) {
                    smallerDecimal = 8;
                    largerDecimal = 10;
                    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        var tokenCount;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    tokenCount = 2;
                                    decimalsList = [largerDecimal, smallerDecimal];
                                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3)];
                                case 1:
                                    componentInstances = _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    afterAll(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            componentInstances = [];
                            return [2 /*return*/];
                        });
                    }); });
                    test('it calculates the min minimum natural unit correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedResult, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedResult = new util_1.BigNumber(10).pow(largerDecimal);
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    result = _a.sent();
                                    expect(result).to.bignumber.equal(expectedResult);
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
    describe('calculateSetUnitsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, factoryAPI.calculateSetUnitsAsync(subjectComponentAddresses, subjectComponentPrices, subjectComponentAllocations, subjectTargetSetPrice, percentError)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectComponentAddresses, subjectComponentPrices, subjectComponentAllocations, subjectTargetSetPrice, percentError;
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
                            percentError = 10;
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
            describe('when the max percent error is set to 1%', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            percentError = 1;
                            return [2 /*return*/];
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
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('calculateSetUnits', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return factoryAPI.calculateSetUnits(subjectComponentAddresses, subjectDecimals, subjectComponentPrices, subjectComponentAllocations, subjectTargetSetPrice, percentError);
        }
        var subjectComponentAddresses, subjectDecimals, subjectComponentPrices, subjectComponentAllocations, subjectTargetSetPrice, percentError;
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
                            percentError = 10;
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
            describe('when the max percent error is set to 1%', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            percentError = 1;
                            return [2 /*return*/];
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
                    return [2 /*return*/];
                });
            }); });
            describe('when the allocation inputs do not sum up to 1', function () {
                beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        subjectComponentAllocations = [new util_1.BigNumber(0.5), new util_1.BigNumber(0.49)];
                        return [2 /*return*/];
                    });
                }); });
                test('it should throw', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        expect(function () { return subject(); }).to.throw("The component percentages inputted do not add up to 1");
                        return [2 /*return*/];
                    });
                }); });
            });
            describe('when the set is $100 with 10 components of varying prices and decimals weighted by market-cap', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var tokenCount, decimalsList, decimalSpecificComponents;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    tokenCount = 10;
                                    decimalsList = [18, 18, 18, 18, 12, 18, 18, 8, 18, 18];
                                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3)];
                                case 1:
                                    decimalSpecificComponents = _a.sent();
                                    subjectComponentAddresses = _.map(decimalSpecificComponents, function (component) { return component.address; });
                                    subjectDecimals = decimalsList;
                                    subjectComponentPrices = [
                                        new util_1.BigNumber(3.5300),
                                        new util_1.BigNumber(2.6600),
                                        new util_1.BigNumber(0.0939),
                                        new util_1.BigNumber(0.4000),
                                        new util_1.BigNumber(0.1205),
                                        new util_1.BigNumber(3.1600),
                                        new util_1.BigNumber(1.3000),
                                        new util_1.BigNumber(13.4800),
                                        new util_1.BigNumber(39.8200),
                                        new util_1.BigNumber(0.2905),
                                    ];
                                    subjectComponentAllocations = [
                                        new util_1.BigNumber(0.2658791),
                                        new util_1.BigNumber(0.1474813),
                                        new util_1.BigNumber(0.0466377),
                                        new util_1.BigNumber(0.0344147),
                                        new util_1.BigNumber(0.1257449),
                                        new util_1.BigNumber(0.1054304),
                                        new util_1.BigNumber(0.0986757),
                                        new util_1.BigNumber(0.0714206),
                                        new util_1.BigNumber(0.0627161),
                                        new util_1.BigNumber(0.0415995),
                                    ];
                                    subjectTargetSetPrice = new util_1.BigNumber(100);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    test('should calculate the correct required component units', function () { return __awaiter(_this, void 0, void 0, function () {
                        var expectedResult, units;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    expectedResult = [
                                        new util_1.BigNumber('753198583570'),
                                        new util_1.BigNumber('554440977444'),
                                        new util_1.BigNumber('4966741214058'),
                                        new util_1.BigNumber('860367500000'),
                                        new util_1.BigNumber('10435262'),
                                        new util_1.BigNumber('333640506330'),
                                        new util_1.BigNumber('759043846154'),
                                        new util_1.BigNumber('6'),
                                        new util_1.BigNumber('15749899548'),
                                        new util_1.BigNumber('1431996557660'),
                                    ];
                                    return [4 /*yield*/, subject()];
                                case 1:
                                    units = (_a.sent()).units;
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
                                    expectedResult = new util_1.BigNumber(100000000000);
                                    expect(naturalUnit).to.bignumber.equal(expectedResult);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    describe('when the maximum percent error is artificially low', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    percentError = 0.0001;
                                    return [2 /*return*/];
                                });
                            }); });
                            test('should calculate the correct required component units', function () { return __awaiter(_this, void 0, void 0, function () {
                                var expectedResult, units;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            expectedResult = [
                                                new util_1.BigNumber('7531985835694051'),
                                                new util_1.BigNumber('5544409774436091'),
                                                new util_1.BigNumber('49667412140575080'),
                                                new util_1.BigNumber('8603675000000000'),
                                                new util_1.BigNumber('104352614108'),
                                                new util_1.BigNumber('3336405063291140'),
                                                new util_1.BigNumber('7590438461538462'),
                                                new util_1.BigNumber('52983'),
                                                new util_1.BigNumber('157498995479659'),
                                                new util_1.BigNumber('14319965576592083'),
                                            ];
                                            return [4 /*yield*/, subject()];
                                        case 1:
                                            units = (_a.sent()).units;
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
                                            expectedResult = new util_1.BigNumber(1000000000000000);
                                            expect(naturalUnit).to.bignumber.equal(expectedResult);
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
            describe('when $100 Set is composed of ZRX and ZIL with 50/50 split', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var tokenCount, decimalsList, decimalSpecificComponents;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    tokenCount = 2;
                                    decimalsList = [18, 12];
                                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3)];
                                case 1:
                                    decimalSpecificComponents = _a.sent();
                                    subjectComponentAddresses = _.map(decimalSpecificComponents, function (component) { return component.address; });
                                    subjectDecimals = decimalsList;
                                    subjectComponentPrices = [new util_1.BigNumber(0.627), new util_1.BigNumber(0.0342)];
                                    subjectComponentAllocations = [new util_1.BigNumber(0.5), new util_1.BigNumber(0.5)];
                                    subjectTargetSetPrice = new util_1.BigNumber(100);
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
                                    expectedResult = [new util_1.BigNumber('79744817'), new util_1.BigNumber('1462')];
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
                                    expectedResult = new util_1.BigNumber(1000000);
                                    expect(naturalUnit).to.bignumber.equal(expectedResult);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when $1 StableSet composed of Stably, TUSD, DAI with 40/30/30 split', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        var tokenCount, decimalsList, decimalSpecificComponents;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    tokenCount = 3;
                                    decimalsList = [6, 18, 18];
                                    return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3)];
                                case 1:
                                    decimalSpecificComponents = _a.sent();
                                    subjectComponentAddresses = _.map(decimalSpecificComponents, function (component) { return component.address; });
                                    subjectDecimals = decimalsList;
                                    subjectComponentPrices = [new util_1.BigNumber(1), new util_1.BigNumber(1), new util_1.BigNumber(1)];
                                    subjectComponentAllocations = [new util_1.BigNumber(0.4), new util_1.BigNumber(0.3), new util_1.BigNumber(0.3)];
                                    subjectTargetSetPrice = new util_1.BigNumber(1);
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
                                    expectedResult = [new util_1.BigNumber('4'), new util_1.BigNumber('3000000000000'), new util_1.BigNumber('3000000000000')];
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
                                    expectedResult = new util_1.BigNumber(Math.pow(10, 13));
                                    expect(naturalUnit).to.bignumber.equal(expectedResult);
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
});
//# sourceMappingURL=FactoryAPI.spec.js.map