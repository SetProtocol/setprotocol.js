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
var set_protocol_strategies_1 = require("set-protocol-strategies");
/**
 * @title ContractWrapper
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
var ContractWrapper = /** @class */ (function () {
    function ContractWrapper(web3) {
        this.web3 = web3;
        this.cache = {};
    }
    /**
     * Load a HistoricalPriceFeed contract
     *
     * @param  historicalPriceFeed          Address of the HistoricalPriceFeed contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The HistoricalPriceFeed Contract
     */
    ContractWrapper.prototype.loadHistoricalPriceFeedContract = function (historicalPriceFeed, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, historicalPriceFeedContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "HistoricalPriceFeed_" + historicalPriceFeed;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_strategies_1.HistoricalPriceFeedContract.at(historicalPriceFeed, this.web3, transactionOptions)];
                    case 2:
                        historicalPriceFeedContract = _a.sent();
                        this.cache[cacheKey] = historicalPriceFeedContract;
                        return [2 /*return*/, historicalPriceFeedContract];
                }
            });
        });
    };
    /**
     * Load a MovingAverageOracle contract
     *
     * @param  movingAveragesOracle         Address of the MovingAveragesOracle contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The MovingAveragesOracle Contract
     */
    ContractWrapper.prototype.loadMovingAverageOracleContract = function (movingAveragesOracle, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, movingAverageOracleContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "MovingAverageOracle_" + movingAveragesOracle;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_strategies_1.MovingAverageOracleContract.at(movingAveragesOracle, this.web3, transactionOptions)];
                    case 2:
                        movingAverageOracleContract = _a.sent();
                        this.cache[cacheKey] = movingAverageOracleContract;
                        return [2 /*return*/, movingAverageOracleContract];
                }
            });
        });
    };
    /**
     * Load a MACOStrategyManager contract
     *
     * @param  macoStrategyManager          Address of the MACOStrategyManager contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The MACOStrategyManager Contract
     */
    ContractWrapper.prototype.loadMACOStrategyManagerContractAsync = function (macoStrategyManager, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, macoStrategyManagerContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "macoStrategyManager_" + macoStrategyManager;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_strategies_1.MACOStrategyManagerContract.at(macoStrategyManager, this.web3, transactionOptions)];
                    case 2:
                        macoStrategyManagerContract = _a.sent();
                        this.cache[cacheKey] = macoStrategyManagerContract;
                        return [2 /*return*/, macoStrategyManagerContract];
                }
            });
        });
    };
    return ContractWrapper;
}());
exports.ContractWrapper = ContractWrapper;
//# sourceMappingURL=ContractWrapper.js.map