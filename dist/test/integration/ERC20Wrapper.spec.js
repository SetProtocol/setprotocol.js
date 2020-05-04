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
var set_protocol_contracts_1 = require("set-protocol-contracts");
var set_protocol_utils_1 = require("set-protocol-utils");
var wrappers_1 = require("@src/wrappers");
var constants_1 = require("@src/constants");
var accounts_1 = require("@src/constants/accounts");
var util_1 = require("@src/util");
var helpers_1 = require("@test/helpers");
var chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(util_1.BigNumber));
var expect = chai.expect;
var contract = require('truffle-contract');
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var currentSnapshotId;
describe('ERC20Wrapper', function () {
    var erc20Wrapper;
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _a.sent();
                    erc20Wrapper = new wrappers_1.ERC20Wrapper(web3);
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
    describe('name, symbol, totalSupply, decimals', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                var name, symbol, supply, decimals;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, erc20Wrapper.name(subjectTokenAddress)];
                        case 1:
                            name = _a.sent();
                            return [4 /*yield*/, erc20Wrapper.symbol(subjectTokenAddress)];
                        case 2:
                            symbol = _a.sent();
                            return [4 /*yield*/, erc20Wrapper.totalSupply(subjectTokenAddress)];
                        case 3:
                            supply = _a.sent();
                            return [4 /*yield*/, erc20Wrapper.decimals(subjectTokenAddress)];
                        case 4:
                            decimals = _a.sent();
                            return [2 /*return*/, { name: name, symbol: symbol, supply: supply, decimals: decimals }];
                    }
                });
            });
        }
        var tokenSupply, tokenName, tokenSymbol, tokenDecimals, subjectTokenAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var truffleStandardTokenMockContract, deployedToken;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            truffleStandardTokenMockContract = contract(set_protocol_contracts_1.StandardTokenMock);
                            truffleStandardTokenMockContract.setProvider(web3.currentProvider);
                            truffleStandardTokenMockContract.defaults(constants_1.TX_DEFAULTS);
                            tokenSupply = new util_1.BigNumber(100);
                            tokenName = 'My Token';
                            tokenSymbol = 'MYTOKEN';
                            tokenDecimals = new util_1.BigNumber(18);
                            return [4 /*yield*/, truffleStandardTokenMockContract.new(constants_1.DEFAULT_ACCOUNT, tokenSupply, tokenName, tokenSymbol, tokenDecimals)];
                        case 1:
                            deployedToken = _a.sent();
                            subjectTokenAddress = deployedToken.address;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('fetches the erc20 token properties correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, name, symbol, supply, decimals;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a = _b.sent(), name = _a.name, symbol = _a.symbol, supply = _a.supply, decimals = _a.decimals;
                            expect(name).to.eql(tokenName);
                            expect(symbol).to.eql(tokenSymbol);
                            expect(supply).to.bignumber.equal(tokenSupply);
                            expect(decimals).to.bignumber.equal(tokenDecimals);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('balanceOf', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, erc20Wrapper.balanceOf(subjectTokenAddress, subjectTokenOwner)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var token, subjectTokenAddress, subjectTokenOwner;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            token = _a.sent();
                            subjectTokenAddress = token.address;
                            subjectTokenOwner = constants_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('fetches the balance correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var userTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            userTokenBalance = _a.sent();
                            expect(userTokenBalance).to.bignumber.equal(constants_1.DEPLOYED_TOKEN_QUANTITY);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('allowance', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, erc20Wrapper.allowance(subjectTokenAddress, subjectTokenOwner, subjectSpenderAddress)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var token, approveAllowance, subjectTokenOwner, subjectTokenAddress, subjectSpenderAddress;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            approveAllowance = new util_1.BigNumber(1000);
                            return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            token = _a.sent();
                            subjectTokenOwner = constants_1.DEFAULT_ACCOUNT;
                            subjectTokenAddress = token.address;
                            subjectSpenderAddress = accounts_1.ACCOUNTS[1].address;
                            return [4 /*yield*/, erc20Wrapper.approve(subjectTokenAddress, subjectSpenderAddress, approveAllowance, { from: constants_1.DEFAULT_ACCOUNT })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('fetches the spender balance correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var spenderAllowance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            spenderAllowance = _a.sent();
                            expect(spenderAllowance).to.bignumber.equal(approveAllowance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('approve', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, erc20Wrapper.approve(subjectTokenAddress, subjectSpenderAddress, subjectApproveAllowance, { from: subjectCaller })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var token, subjectTokenAddress, subjectSpenderAddress, subjectApproveAllowance, subjectCaller;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            token = _a.sent();
                            subjectTokenAddress = token.address;
                            subjectSpenderAddress = accounts_1.ACCOUNTS[1].address;
                            subjectApproveAllowance = new util_1.BigNumber(100);
                            subjectCaller = constants_1.DEFAULT_ACCOUNT;
                            return [2 /*return*/];
                    }
                });
            }); });
            test('updates the allowance correctly for the spender', function () { return __awaiter(_this, void 0, void 0, function () {
                var newSpenderAllowance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, token.allowance.callAsync(subjectCaller, subjectSpenderAddress)];
                        case 2:
                            newSpenderAllowance = _a.sent();
                            expect(newSpenderAllowance).to.bignumber.equal(subjectApproveAllowance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('transferFrom', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, erc20Wrapper.transferFrom(subjectTokenAddress, subjectTokenOwner, subjectSpenderAddress, subjectTransferAmount, { from: subjectSpenderAddress })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var token, approveAllowance, subjectTokenOwner, subjectTokenAddress, subjectSpenderAddress, subjectTransferAmount;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            approveAllowance = new util_1.BigNumber(1000);
                            return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            token = _a.sent();
                            subjectTokenOwner = constants_1.DEFAULT_ACCOUNT;
                            subjectTokenAddress = token.address;
                            subjectSpenderAddress = accounts_1.ACCOUNTS[1].address;
                            subjectTransferAmount = approveAllowance;
                            return [4 /*yield*/, erc20Wrapper.approve(subjectTokenAddress, subjectSpenderAddress, approveAllowance, { from: constants_1.DEFAULT_ACCOUNT })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('transfers the token from the owner', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingTokenBalance, expectedTokenBalance, newTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, token.balanceOf.callAsync(subjectTokenOwner)];
                        case 1:
                            existingTokenBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedTokenBalance = existingTokenBalance.sub(subjectTransferAmount);
                            return [4 /*yield*/, token.balanceOf.callAsync(subjectTokenOwner)];
                        case 3:
                            newTokenBalance = _a.sent();
                            expect(newTokenBalance).to.bignumber.equal(expectedTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    describe('transfer', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, erc20Wrapper.transfer(subjectTokenAddress, subjectTokenReceiver, subjectTransferAmount, { from: subjectTokenOwner })];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var token, subjectTokenOwner, subjectTokenReceiver, subjectTokenAddress, subjectTransferAmount;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                        case 1:
                            token = _a.sent();
                            subjectTokenOwner = constants_1.DEFAULT_ACCOUNT;
                            subjectTokenReceiver = accounts_1.ACCOUNTS[1].address;
                            subjectTokenAddress = token.address;
                            subjectTransferAmount = new util_1.BigNumber(1000);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('transfers the token to the receiver', function () { return __awaiter(_this, void 0, void 0, function () {
                var existingTokenBalance, expectedTokenBalance, newTokenBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, token.balanceOf.callAsync(subjectTokenReceiver)];
                        case 1:
                            existingTokenBalance = _a.sent();
                            return [4 /*yield*/, subject()];
                        case 2:
                            _a.sent();
                            expectedTokenBalance = existingTokenBalance.add(subjectTransferAmount);
                            return [4 /*yield*/, token.balanceOf.callAsync(subjectTokenReceiver)];
                        case 3:
                            newTokenBalance = _a.sent();
                            expect(newTokenBalance).to.bignumber.equal(expectedTokenBalance);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=ERC20Wrapper.spec.js.map