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
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
exports.BlockchainAPIErrors = {
    AWAIT_MINE_TX_TIMED_OUT: function (txHash) {
        return "Timeout has been exceeded in awaiting mining of transaction with hash " + txHash + ".";
    },
};
/**
 * The following default timeout is provided to the IntervalManager when awaiting mined
 * transactions. The value is represented in milliseconds.
 *
 * @type {number}
 */
exports.DEFAULT_TIMEOUT_FOR_TX_MINED = 30000;
/**
 * @title BlockchainAPI
 * @author Set Protocol
 *
 * A utility library for managing blockchain operations
 */
var BlockchainAPI = /** @class */ (function () {
    /**
     * Instantiates a new BlockchainAPI instance that contains methods for miscellaneous blockchain functionality
     *
     * @param web3        Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
     *                      the Ethereum network
     * @param assertions  An instance of the Assertion library
     */
    function BlockchainAPI(web3, assertions) {
        this.web3 = web3;
        this.assert = assertions;
        this.intervalManager = new util_1.IntervalManager();
    }
    /**
     * Polls the Ethereum blockchain until the specified transaction has been mined or the timeout limit is reached,
     * whichever occurs first
     *
     * @param  txHash               Transaction hash to poll
     * @param  pollingIntervalMs    Interval at which the blockchain should be polled. Defaults to 1000
     * @param  timeoutMs            Number of milliseconds until this process times out. Defaults to 60000
     * @return                      Transaction receipt resulting from the mining process
     */
    BlockchainAPI.prototype.awaitTransactionMinedAsync = function (txHash, pollingIntervalMs, timeoutMs) {
        if (pollingIntervalMs === void 0) { pollingIntervalMs = 1000; }
        if (timeoutMs === void 0) { timeoutMs = exports.DEFAULT_TIMEOUT_FOR_TX_MINED; }
        return __awaiter(this, void 0, void 0, function () {
            var intervalManager;
            var _this = this;
            return __generator(this, function (_a) {
                this.assert.schema.isValidBytes32('txHash', txHash);
                intervalManager = this.intervalManager;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        intervalManager.setInterval(txHash, function () { return __awaiter(_this, void 0, void 0, function () {
                            var receipt, e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.web3.eth.getTransactionReceipt(txHash)];
                                    case 1:
                                        receipt = _a.sent();
                                        if (receipt) {
                                            resolve(receipt);
                                            // Stop the interval.
                                            return [2 /*return*/, false];
                                        }
                                        else {
                                            // Continue the interval.
                                            return [2 /*return*/, true];
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_1 = _a.sent();
                                        reject(e_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/, false];
                                }
                            });
                        }); }, function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                reject(new Error(exports.BlockchainAPIErrors.AWAIT_MINE_TX_TIMED_OUT(txHash)));
                                return [2 /*return*/];
                            });
                        }); }, pollingIntervalMs, timeoutMs);
                    })];
            });
        });
    };
    return BlockchainAPI;
}());
exports.BlockchainAPI = BlockchainAPI;
//# sourceMappingURL=BlockchainAPI.js.map