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
var set_protocol_contracts_1 = require("set-protocol-contracts");
var ProtocolContractWrapper_1 = require("./ProtocolContractWrapper");
var util_1 = require("../../util");
/**
 * @title  RebalancingSetCTokenBidderWrapper
 * @author Set Protocol
 *
 * The RebalancingSetCTokenBidderWrapper handles all functions on the RebalancingSetCTokenBidder smart contract.
 *
 */
var RebalancingSetCTokenBidderWrapper = /** @class */ (function () {
    function RebalancingSetCTokenBidderWrapper(web3, rebalancingSetCTokenBidderAddress) {
        this.web3 = web3;
        this.rebalancingSetCTokenBidderAddress = rebalancingSetCTokenBidderAddress;
        this.contracts = new ProtocolContractWrapper_1.ProtocolContractWrapper(this.web3);
    }
    /**
     * Asynchronously retrieve BidPlacedCToken events from the RebalancingSetCTokenBidder contract
     * Optionally, you can filter by a specific rebalancing SetToken
     *
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
     * @return                               An array of raw events
     */
    RebalancingSetCTokenBidderWrapper.prototype.bidPlacedCTokenEvent = function (fromBlock, toBlock, rebalancingSetToken) {
        if (toBlock === void 0) { toBlock = 'latest'; }
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetCTokenBidderInstance, filter, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rebalancingSetCTokenBidderInstance = new this.web3.eth.Contract(set_protocol_contracts_1.RebalancingSetCTokenBidder.abi, this.rebalancingSetCTokenBidderAddress);
                        filter = {};
                        if (rebalancingSetToken) {
                            filter['rebalancingSetToken'] = rebalancingSetToken;
                        }
                        return [4 /*yield*/, rebalancingSetCTokenBidderInstance.getPastEvents('BidPlacedCToken', {
                                'fromBlock': fromBlock,
                                'toBlock': toBlock,
                                'filter': filter,
                            })];
                    case 1:
                        events = _a.sent();
                        return [2 /*return*/, events];
                }
            });
        });
    };
    /**
     * Asynchronously submit a bid and withdraw bids while transacting in underlying of cTokens
     * for a rebalancing auction on a rebalancingSetToken
     *
     * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
     * @param  quantity                      Amount of currentSetToken the bidder wants to rebalance
     * @param  allowPartialFill              Boolean that signifies whether to bid if full amount is not possible
     * @param  txOpts                        The options for executing the transaction
     * @return                               A transaction hash
     */
    RebalancingSetCTokenBidderWrapper.prototype.bidAndWithdraw = function (rebalancingSetTokenAddress, quantity, allowPartialFill, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var txSettings, rebalancingSetCTokenBidderInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 1:
                        txSettings = _a.sent();
                        return [4 /*yield*/, this.contracts.loadRebalancingSetCTokenBidderContract(this.rebalancingSetCTokenBidderAddress)];
                    case 2:
                        rebalancingSetCTokenBidderInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetCTokenBidderInstance.bidAndWithdraw.sendTransactionAsync(rebalancingSetTokenAddress, quantity, allowPartialFill, txSettings)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the current cToken underlying component addresses, token inflows and outflows for a given bid quantity
     *
     * @param  rebalancingSetTokenAddress    Addresses of rebalancing set token being rebalanced
     * @param  bidQuantity                   Amount of currentSetToken the bidder wants to rebalance
     * @return                               Object conforming to `TokenFlows` interface
     */
    RebalancingSetCTokenBidderWrapper.prototype.getAddressAndBidPriceArray = function (rebalancingSetTokenAddress, bidQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            var rebalancingSetCTokenBidderInstance, tokenFlows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadRebalancingSetCTokenBidderContract(this.rebalancingSetCTokenBidderAddress)];
                    case 1:
                        rebalancingSetCTokenBidderInstance = _a.sent();
                        return [4 /*yield*/, rebalancingSetCTokenBidderInstance.getAddressAndBidPriceArray.callAsync(rebalancingSetTokenAddress, bidQuantity)];
                    case 2:
                        tokenFlows = _a.sent();
                        return [2 /*return*/, {
                                tokens: tokenFlows[0],
                                inflow: tokenFlows[1],
                                outflow: tokenFlows[2],
                            }];
                }
            });
        });
    };
    return RebalancingSetCTokenBidderWrapper;
}());
exports.RebalancingSetCTokenBidderWrapper = RebalancingSetCTokenBidderWrapper;
//# sourceMappingURL=RebalancingSetCTokenBidderWrapper.js.map