/*
  Copyright 2019 Set Labs Inc.

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
var wrappers_1 = require("../wrappers");
/**
 * @title PriceFeedAPI
 * @author Set Protocol
 *
 * A library for reading and updating price feeds
 */
var PriceFeedAPI = /** @class */ (function () {
    /**
     * Instantiates a new PriceFeedAPI instance that contains methods for interacting with and updating price oracles
     *
     * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     */
    function PriceFeedAPI(web3) {
        this.historicalPriceFeedWrapper = new wrappers_1.HistoricalPriceFeedWrapper(web3);
        this.timeSeriesFeedWrapper = new wrappers_1.TimeSeriesFeedWrapper(web3);
    }
    /**
     * Returns the Unix timestamp of when the price feed was last updated. Only applies to HistoricalPriceFeed contracts.
     *
     * @param  historicalPriceFeed    Address of the HistoricalPriceFeed contract to poll
     * @return                        Timestamp of when the price feed was last updated
     */
    PriceFeedAPI.prototype.getHistoricalPriceFeedLastUpdatedAsync = function (historicalPriceFeed) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.historicalPriceFeedWrapper.lastUpdatedAt(historicalPriceFeed)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns the Unix timestamp of earliest time the TimeSeriesFeed can be updated. Only applies to
     * TimeSeriesFeed contracts.
     *
     * @param  timeSeriesFeed         Address of the TimeSeriesFeed contract to poll
     * @return                        Timestamp of when the price feed can be updated next
     */
    PriceFeedAPI.prototype.getTimeSeriesFeedNextEarliestUpdateAsync = function (timeSeriesFeed) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.timeSeriesFeedWrapper.nextEarliestUpdate(timeSeriesFeed)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetch TimeSeriesFeed state (nextEarliestUpdate, updateInterval, all logged prices)
     *
     * @param  timeSeriesFeed         Address of the TimeSeriesFeed contract to fetch data from
     * @return                        TimeSeriesFeedState type
     */
    PriceFeedAPI.prototype.getTimeSeriesFeedState = function (timeSeriesFeed) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.timeSeriesFeedWrapper.getTimeSeriesFeedState(timeSeriesFeed)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns the current price feed prices for dayCount number of days. Can be used by either HistoricalPriceFeed or
     * TimeSeriesFeed contracts.
     *
     * @param  historicalPriceFeed    Address of the HistoricalPriceFeed/TimeSeriesFeed contract to update
     * @param  dayCount               Number of days to fetch price data for
     * @return                        List of prices recorded on the feed
     */
    PriceFeedAPI.prototype.getLatestPriceFeedDataAsync = function (historicalPriceFeed, dayCount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.historicalPriceFeedWrapper.read(historicalPriceFeed, dayCount)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Updates the price feed to record the current price from another Medianizer oracle. Can be used by either
     * HistoricalPriceFeed or TimeSeriesFeed contracts.
     *
     * @param  historicalPriceFeed    Address of the HistoricalPriceFeed/TimeSeriesFeed contract to update
     * @param  txOpts                 The options for executing the transaction
     * @return                        Transaction hash
     */
    PriceFeedAPI.prototype.updatePriceFeedDataAsync = function (historicalPriceFeedAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.historicalPriceFeedWrapper.poke(historicalPriceFeedAddress, txOpts)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return PriceFeedAPI;
}());
exports.PriceFeedAPI = PriceFeedAPI;
//# sourceMappingURL=PriceFeedAPI.js.map