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
var web3_1 = __importDefault(require("web3"));
var set_protocol_utils_1 = require("set-protocol-utils");
var api_1 = require("@src/api");
var constants_1 = require("@src/constants");
var util_1 = require("@src/util");
var assertions_1 = require("@src/assertions");
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
var helpers_1 = require("@test/helpers");
chaiSetup_1.default.configure();
var expect = chai.expect;
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var currentSnapshotId;
describe('SetTokenAPI', function () {
    var core;
    var setTokenFactory;
    var setTokenAPI;
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
                    _a = _b.sent(), core = _a[0], setTokenFactory = _a[3];
                    assertions = new assertions_1.Assertions(web3);
                    setTokenAPI = new api_1.SetTokenAPI(web3, assertions);
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
    describe('getFactoryAsync, getComponentsAsync, getNaturalUnitAsync, getUnitsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                var factoryAddress, components, naturalUnit, units;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setTokenAPI.getFactoryAsync(subjectSetTokenAddress)];
                        case 1:
                            factoryAddress = _a.sent();
                            return [4 /*yield*/, setTokenAPI.getComponentsAsync(subjectSetTokenAddress)];
                        case 2:
                            components = _a.sent();
                            return [4 /*yield*/, setTokenAPI.getNaturalUnitAsync(subjectSetTokenAddress)];
                        case 3:
                            naturalUnit = _a.sent();
                            return [4 /*yield*/, setTokenAPI.getUnitsAsync(subjectSetTokenAddress)];
                        case 4:
                            units = _a.sent();
                            return [2 /*return*/, { factoryAddress: factoryAddress, components: components, naturalUnit: naturalUnit, units: units }];
                    }
                });
            });
        }
        var componentTokens, componentTokenAddresses, componentTokenUnits, setToken, naturalUnit, subjectSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            componentTokenAddresses = componentTokens.map(function (token) { return token.address; });
                            componentTokenUnits = componentTokens.map(function (token) { return util_1.ether(4); });
                            naturalUnit = util_1.ether(2);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokenAddresses, componentTokenUnits, naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            subjectSetTokenAddress = setToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it fetchs the set token properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, factoryAddress, components, naturalUnit, units;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a = _b.sent(), factoryAddress = _a.factoryAddress, components = _a.components, naturalUnit = _a.naturalUnit, units = _a.units;
                            expect(factoryAddress).to.eql(setTokenFactory.address);
                            expect(components).to.eql(componentTokenAddresses);
                            expect(naturalUnit).to.bignumber.equal(naturalUnit);
                            expect(JSON.stringify(units)).to.eql(JSON.stringify(componentTokenUnits));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('getDetailsAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setTokenAPI.getDetailsAsync(subjectSetTokenAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var componentTokens, componentTokenAddresses, componentTokenUnits, setToken, naturalUnit, name, symbol, subjectSetTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            componentTokenAddresses = componentTokens.map(function (token) { return token.address; });
                            componentTokenUnits = componentTokens.map(function (token) { return util_1.ether(4); });
                            naturalUnit = util_1.ether(2);
                            name = 'Default Set';
                            symbol = 'SET';
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokenAddresses, componentTokenUnits, naturalUnit, name, symbol)];
                        case 2:
                            setToken = _a.sent();
                            subjectSetTokenAddress = setToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('it fetchs the set token properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var details, detailComponentAddresses, detailComponentUnits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            details = _a.sent();
                            expect(details.address).to.eql(setToken.address);
                            expect(details.factoryAddress).to.eql(setTokenFactory.address);
                            expect(details.name).to.eql(name);
                            expect(details.symbol).to.eql(symbol);
                            expect(details.naturalUnit).to.bignumber.equal(naturalUnit);
                            detailComponentAddresses = details.components.map(function (component) { return component.address; });
                            expect(JSON.stringify(detailComponentAddresses)).to.eql(JSON.stringify(componentTokenAddresses));
                            detailComponentUnits = details.components.map(function (component) { return component.unit; });
                            expect(JSON.stringify(detailComponentUnits)).to.eql(JSON.stringify(componentTokenUnits));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('isMultipleOfNaturalUnitAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setTokenAPI.isMultipleOfNaturalUnitAsync(subjectSetTokenAddress, subjectQuantity)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectSetTokenAddress, subjectQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var componentTokens, componentTokenAddresses, componentTokenUnits, naturalUnit, setToken;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokensAsync(3, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            componentTokenAddresses = componentTokens.map(function (token) { return token.address; });
                            componentTokenUnits = componentTokens.map(function (token) { return util_1.ether(4); });
                            naturalUnit = util_1.ether(2);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokenAddresses, componentTokenUnits, naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            subjectSetTokenAddress = setToken.address;
                            subjectQuantity = util_1.ether(4);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('correctly assesses the validity of the quantity against the set token', function () { return __awaiter(_this, void 0, void 0, function () {
                var isQuantityMultiple;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            isQuantityMultiple = _a.sent();
                            expect(isQuantityMultiple).to.be.true;
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the quantity is not a multiple of the natural unit', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectQuantity = util_1.ether(3);
                            return [2 /*return*/];
                        });
                    }); });
                    test('correctly assesses the validity of the quantity against the set token', function () { return __awaiter(_this, void 0, void 0, function () {
                        var isQuantityMultiple;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    isQuantityMultiple = _a.sent();
                                    expect(isQuantityMultiple).to.be.false;
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
    describe('calculateComponentAmountForIssuanceAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setTokenAPI.calculateComponentAmountForIssuanceAsync(subjectSetTokenAddress, subjectComponentAddress, subjectQuantity)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var componentTokens, componentTokenAddresses, componentTokenUnits, naturalUnit, setToken, subjectSetTokenAddress, subjectComponentAddress, subjectQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var tokenCount, decimalsList, tokenUnits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tokenCount = 2;
                            decimalsList = [18, 8];
                            tokenUnits = [util_1.ether(2), util_1.ether(4)];
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            componentTokenAddresses = componentTokens.map(function (token) { return token.address; });
                            componentTokenUnits = tokenUnits;
                            naturalUnit = util_1.ether(2);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokenAddresses, componentTokenUnits, naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            subjectSetTokenAddress = setToken.address;
                            subjectComponentAddress = componentTokenAddresses[0];
                            subjectQuantity = util_1.ether(4);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('correctly calculates the first component unit transferred', function () { return __awaiter(_this, void 0, void 0, function () {
                var result, expectedResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            result = _a.sent();
                            expectedResult = componentTokenUnits[0].mul(subjectQuantity).div(naturalUnit);
                            expect(result).to.bignumber.equal(expectedResult);
                            return [2 /*return*/];
                    }
                });
            }); });
            describe('when the subjectComponentAddress is the second component', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectComponentAddress = componentTokenAddresses[1];
                            return [2 /*return*/];
                        });
                    }); });
                    test('correctly calculates the second component unit transferred', function () { return __awaiter(_this, void 0, void 0, function () {
                        var result, expectedResult;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, subject()];
                                case 1:
                                    result = _a.sent();
                                    expectedResult = componentTokenUnits[1].mul(subjectQuantity).div(naturalUnit);
                                    expect(result).to.bignumber.equal(expectedResult);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            describe('when the component is not part of the Set', function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            subjectComponentAddress = constants_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                        });
                    }); });
                    test('throws', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, expect(subject()).to.be.rejectedWith("Token address at " + subjectComponentAddress + " is not a " +
                                    ("component of the Set Token at " + subjectSetTokenAddress + "."))];
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('calculateComponentAmountsForIssuanceAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, setTokenAPI.calculateComponentAmountsForIssuanceAsync(subjectSetTokenAddress, subjectQuantity)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var componentTokens, componentTokenAddresses, componentTokenUnits, naturalUnit, setToken, subjectSetTokenAddress, subjectQuantity;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var tokenCount, decimalsList, tokenUnits;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tokenCount = 2;
                            decimalsList = [18, 8];
                            tokenUnits = [util_1.ether(2), util_1.ether(4)];
                            return [4 /*yield*/, helpers_1.deployTokensSpecifyingDecimals(tokenCount, decimalsList, web3)];
                        case 1:
                            componentTokens = _a.sent();
                            componentTokenAddresses = componentTokens.map(function (token) { return token.address; });
                            componentTokenUnits = tokenUnits;
                            naturalUnit = util_1.ether(2);
                            return [4 /*yield*/, helpers_1.deploySetTokenAsync(web3, core, setTokenFactory.address, componentTokenAddresses, componentTokenUnits, naturalUnit)];
                        case 2:
                            setToken = _a.sent();
                            subjectSetTokenAddress = setToken.address;
                            subjectQuantity = util_1.ether(4);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('correctly calculates the component units transferred', function () { return __awaiter(_this, void 0, void 0, function () {
                var expectedResult, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expectedResult = componentTokenUnits.map(function (componentTokenUnit, index) {
                                return {
                                    address: componentTokenAddresses[index],
                                    unit: componentTokenUnit.mul(subjectQuantity).div(naturalUnit),
                                };
                            });
                            return [4 /*yield*/, subject()];
                        case 1:
                            result = _a.sent();
                            expect(JSON.stringify(result)).to.equal(JSON.stringify(expectedResult));
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=SetTokenAPI.spec.js.map