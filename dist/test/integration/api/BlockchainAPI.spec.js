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
var web3_1 = __importDefault(require("web3"));
var set_protocol_utils_1 = require("set-protocol-utils");
var set_protocol_contracts_1 = require("set-protocol-contracts");
var chaiSetup_1 = __importDefault(require("@test/helpers/chaiSetup"));
var api_1 = require("@src/api");
var assertions_1 = require("@src/assertions");
var util_1 = require("@src/util");
var accounts_1 = require("@src/constants/accounts");
var constants_1 = require("@src/constants");
var helpers_1 = require("@test/helpers");
chaiSetup_1.default.configure();
var contract = require('truffle-contract');
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var expect = chai.expect;
var standardTokenContract = contract(set_protocol_contracts_1.StandardTokenMock);
standardTokenContract.setProvider(web3);
standardTokenContract.defaults(constants_1.TX_DEFAULTS);
var currentSnapshotId;
describe('BlockchainAPI', function () {
    var blockchainAPI;
    var standardToken;
    beforeAll(function () {
        ABIDecoder.addABI(standardTokenContract.abi);
    });
    afterAll(function () {
        ABIDecoder.removeABI(standardTokenContract.abi);
    });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var assertions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _a.sent();
                    return [4 /*yield*/, helpers_1.deployTokenAsync(web3)];
                case 2:
                    standardToken = _a.sent();
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 3:
                    _a.sent();
                    assertions = new assertions_1.Assertions(web3);
                    blockchainAPI = new api_1.BlockchainAPI(web3, assertions);
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
    describe('awaitTransactionMinedAsync', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, blockchainAPI.awaitTransactionMinedAsync(subjectTxHash)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectCaller, subjectSpender, subjectQuantity, subjectTxHash;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            subjectCaller = accounts_1.DEFAULT_ACCOUNT;
                            subjectSpender = accounts_1.ACCOUNTS[0].address;
                            subjectQuantity = new util_1.BigNumber(1);
                            return [4 /*yield*/, standardToken.approve.sendTransactionAsync(subjectSpender, subjectQuantity, { from: subjectCaller })];
                        case 1:
                            subjectTxHash = _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('returns transaction receipt with the correct logs', function () { return __awaiter(_this, void 0, void 0, function () {
                var receipt, formattedLogs, approvalLog, _a, owner, spender, value;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            receipt = _b.sent();
                            formattedLogs = util_1.getFormattedLogsFromReceipt(receipt);
                            approvalLog = formattedLogs[0];
                            _a = approvalLog.args, owner = _a.owner, spender = _a.spender, value = _a.value;
                            expect(approvalLog.address).to.equal(standardToken.address);
                            expect(owner).to.equal(subjectCaller.toLowerCase());
                            expect(spender).to.equal(subjectSpender.toLowerCase());
                            expect(value).to.bignumber.equal(subjectQuantity);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=BlockchainAPI.spec.js.map