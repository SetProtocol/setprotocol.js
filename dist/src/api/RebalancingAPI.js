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
var errors_1 = require("../errors");
var wrappers_1 = require("../wrappers");
var util_1 = require("../util");
var common_1 = require("../types/common");
/**
 * @title RebalancingAPI
 * @author Set Protocol
 *
 * A library for interacting with RebalancingSetToken contracts
 */
var RebalancingAPI = /** @class */ (function () {
    /**
     * Instantiates a new RebalancingAPI instance that contains methods
     * for interacting with RebalancingSetToken contracts
     *
     * @param web3        Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
     *                      the Ethereum network
     * @param assertions  An instance of the Assertion library
     * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    function RebalancingAPI(web3, assertions, core, config) {
        this.web3 = web3;
        this.assert = assertions;
        this.core = core;
        this.rebalancingAuctionModule = new wrappers_1.RebalancingAuctionModuleWrapper(this.web3, config.rebalanceAuctionModuleAddress);
        this.erc20 = new wrappers_1.ERC20Wrapper(this.web3);
        this.rebalancingSetToken = new wrappers_1.RebalancingSetTokenWrapper(this.web3);
        this.setToken = new wrappers_1.SetTokenWrapper(this.web3);
        this.rebalancingSetCTokenBidder =
            new wrappers_1.RebalancingSetCTokenBidderWrapper(this.web3, config.rebalancingSetCTokenBidderAddress);
        this.rebalancingSetEthBidder = new wrappers_1.RebalancingSetEthBidderWrapper(this.web3, config.rebalancingSetEthBidderAddress);
        this.protocolViewer = new wrappers_1.ProtocolViewerWrapper(this.web3, config.protocolViewerAddress);
        this.config = config;
    }
    /**
     * Proposes rebalance a new Set to rebalance to. Can only be called by the manager. Users will have the
     * RebalancingSetToken's designated proposal period to withdraw their Sets if they want to
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  nextSetAddress                 Address of new Set to rebalance into after proposal period
     * @param  auctionLibrary                 Address of auction price curve to use. See deployed contracts for addresses
     *                                          of existing libraries
     * @param  auctionTimeToPivot             Amount of time until curve pivots and protocol takes over price curve
     * @param  auctionStartPrice              Starting price of the rebalancing auction, depending on library may not be
     *                                          used
     * @param  auctionPivotPrice              Price to pivot from user-defined to protocol-defined curve
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    RebalancingAPI.prototype.proposeAsync = function (rebalancingSetTokenAddress, nextSetAddress, auctionLibrary, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertPropose(rebalancingSetTokenAddress, nextSetAddress, auctionLibrary, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice, txOpts)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.propose(rebalancingSetTokenAddress, nextSetAddress, auctionLibrary, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Initiates rebalance after proposal period has passed
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    RebalancingAPI.prototype.startRebalanceAsync = function (rebalancingSetTokenAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertStartRebalance(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.startRebalance(rebalancingSetTokenAddress, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Settles rebalance after auction has been completed
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    RebalancingAPI.prototype.settleRebalanceAsync = function (rebalancingSetTokenAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertSettleRebalance(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.settleRebalance(rebalancingSetTokenAddress, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Ends failed auction and either returns to Default if no bids or sets to Drawdown if there are bids
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    RebalancingAPI.prototype.endFailedAuctionAsync = function (rebalancingSetTokenAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertEndFailedAuction(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.endFailedAuction(rebalancingSetTokenAddress, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Allows user to bid on a rebalance auction occuring on a Rebalancing Set Token
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
     * @param  shouldWithdraw                 Boolean to withdraw back to signer's wallet or leave in vault.
     *                                        Defaults to true
     * @param  allowPartialFill               Boolean to complete fill if quantity is less than available
     *                                        Defaults to true
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                        gasPrice data
     * @return                                Transaction hash
     */
    RebalancingAPI.prototype.bidAsync = function (rebalancingSetTokenAddress, bidQuantity, shouldWithdraw, allowPartialFill, txOpts) {
        if (shouldWithdraw === void 0) { shouldWithdraw = true; }
        if (allowPartialFill === void 0) { allowPartialFill = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertBid(rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts)];
                    case 1:
                        _a.sent();
                        if (!shouldWithdraw) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.rebalancingAuctionModule.bidAndWithdraw(rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [4 /*yield*/, this.rebalancingAuctionModule.bid(rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Allows user to bid on a rebalance auction while sending and receiving Ether instead of Wrapped Ether. This
     * encompasses all functionality in bidAsync.
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
     * @param  allowPartialFill               Boolean to complete fill if quantity is less than available
     *                                        Defaults to true
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                        gasPrice data
     * @return                                Transaction hash
     */
    RebalancingAPI.prototype.bidWithEtherAsync = function (rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts) {
        if (allowPartialFill === void 0) { allowPartialFill = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertBidWithEther(rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetEthBidder.bidAndWithdrawWithEther(rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Allows user to bid on a rebalance auction containing Compound cTokens while sending and
     * receiving the underlying. This encompasses all functionality in bidAsync.
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
     * @param  allowPartialFill               Boolean to complete fill if quantity is less than available
     *                                        Defaults to true
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                        gasPrice data
     * @return                                Transaction hash
     */
    RebalancingAPI.prototype.bidWithCTokenUnderlyingAsync = function (rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts) {
        if (allowPartialFill === void 0) { allowPartialFill = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertBidCToken(rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetCTokenBidder.bidAndWithdraw(rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Allows current manager to change manager address to a new address
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  newManager                     Address of the new manager
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    RebalancingAPI.prototype.updateManagerAsync = function (rebalancingSetTokenAddress, newManager, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertUpdateManager(rebalancingSetTokenAddress, newManager, txOpts)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.setManager(rebalancingSetTokenAddress, newManager, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Burn rebalancing Set token and transfer ownership of collateral in Vault to owner in Drawdown state
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    RebalancingAPI.prototype.redeemFromFailedRebalanceAsync = function (rebalancingSetTokenAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertRedeemFromFailedRebalance(rebalancingSetTokenAddress, txOpts)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingAuctionModule.redeemFromFailedRebalance(rebalancingSetTokenAddress, txOpts)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the current cToken underlying component addresses, token inflows and outflows for a given bid quantity,
     * returns `Component` objects reflecting token inflows and outflows. Tokens flows of 0 are omitted
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
     * @return                                Object conforming to `TokenFlowsDetails` interface
     */
    RebalancingAPI.prototype.getBidPriceCTokenUnderlyingAsync = function (rebalancingSetTokenAddress, bidQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenFlows, inflow, outflow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertGetBidPrice(rebalancingSetTokenAddress, bidQuantity)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetCTokenBidder.getAddressAndBidPriceArray(rebalancingSetTokenAddress, bidQuantity)];
                    case 2:
                        tokenFlows = _a.sent();
                        inflow = tokenFlows.inflow.reduce(function (accumulator, unit, index) {
                            var bigNumberUnit = new util_1.BigNumber(unit);
                            if (bigNumberUnit.gt(0)) {
                                accumulator.push({
                                    address: tokenFlows.tokens[index],
                                    unit: unit,
                                });
                            }
                            return accumulator;
                        }, []);
                        outflow = tokenFlows.outflow.reduce(function (accumulator, unit, index) {
                            var bigNumberUnit = new util_1.BigNumber(unit);
                            if (bigNumberUnit.gt(0)) {
                                accumulator.push({
                                    address: tokenFlows.tokens[index],
                                    unit: unit,
                                });
                            }
                            return accumulator;
                        }, []);
                        return [2 /*return*/, {
                                inflow: inflow,
                                outflow: outflow,
                            }];
                }
            });
        });
    };
    /**
     * Fetches the current token inflows and outflows for a given bid quantity, returns `Component`
     * objects reflecting token inflows and outflows. Tokens flows of 0 are omitted
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
     * @return                                Object conforming to `TokenFlowsDetails` interface
     */
    RebalancingAPI.prototype.getBidPriceAsync = function (rebalancingSetTokenAddress, bidQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenFlowComponents, tokenAddresses, inflow, outflow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertGetBidPrice(rebalancingSetTokenAddress, bidQuantity)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.getBidPrice(rebalancingSetTokenAddress, bidQuantity)];
                    case 2:
                        tokenFlowComponents = _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.getCombinedTokenArray(rebalancingSetTokenAddress)];
                    case 3:
                        tokenAddresses = _a.sent();
                        inflow = tokenFlowComponents.inflow.reduce(function (accumulator, unit, index) {
                            var bigNumberUnit = new util_1.BigNumber(unit);
                            if (bigNumberUnit.gt(0)) {
                                accumulator.push({
                                    address: tokenAddresses[index],
                                    unit: unit,
                                });
                            }
                            return accumulator;
                        }, []);
                        outflow = tokenFlowComponents.outflow.reduce(function (accumulator, unit, index) {
                            var bigNumberUnit = new util_1.BigNumber(unit);
                            if (bigNumberUnit.gt(0)) {
                                accumulator.push({
                                    address: tokenAddresses[index],
                                    unit: unit,
                                });
                            }
                            return accumulator;
                        }, []);
                        return [2 /*return*/, {
                                inflow: inflow,
                                outflow: outflow,
                            }];
                }
            });
        });
    };
    /**
     * Fetches BidPlaced event logs including information about the transactionHash, rebalancingSetToken,
     * bidder, executionQuantity, combinedTokenAddresses, etc.
     *
     * This fetch can be filtered by block and by rebalancingSetToken.
     *
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
     * @return                               An array of objects conforming to the BidPlacedEvent interface
     */
    RebalancingAPI.prototype.getBidPlacedEventsAsync = function (fromBlock, toBlock, rebalancingSetToken, getTimestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var events, formattedEventPromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rebalancingAuctionModule.bidPlacedEvent(fromBlock, toBlock, rebalancingSetToken)];
                    case 1:
                        events = _a.sent();
                        formattedEventPromises = events.map(function (event) { return __awaiter(_this, void 0, void 0, function () {
                            var returnValues, rebalancingSetToken, bidder, executionQuantity, combinedTokenAddresses, inflowTokenUnits, outflowTokenUnits, timestamp, block;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        returnValues = event.returnValues;
                                        rebalancingSetToken = returnValues['rebalancingSetToken'];
                                        bidder = returnValues['bidder'];
                                        executionQuantity = returnValues['executionQuantity'];
                                        combinedTokenAddresses = returnValues['combinedTokenAddresses'];
                                        inflowTokenUnits = returnValues['inflowTokenUnits'];
                                        outflowTokenUnits = returnValues['outflowTokenUnits'];
                                        timestamp = undefined;
                                        if (!getTimestamp) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.web3.eth.getBlock(event.blockNumber)];
                                    case 1:
                                        block = _a.sent();
                                        timestamp = block.timestamp;
                                        _a.label = 2;
                                    case 2: return [2 /*return*/, {
                                            transactionHash: event.transactionHash,
                                            rebalancingSetToken: rebalancingSetToken,
                                            bidder: bidder,
                                            executionQuantity: new util_1.BigNumber(executionQuantity),
                                            combinedTokenAddresses: combinedTokenAddresses,
                                            inflowTokenUnits: inflowTokenUnits.map(function (unit) { return new util_1.BigNumber(unit); }),
                                            outflowTokenUnits: outflowTokenUnits.map(function (unit) { return new util_1.BigNumber(unit); }),
                                            blockNumber: event.blockNumber,
                                            timestamp: timestamp,
                                        }];
                                }
                            });
                        }); });
                        return [2 /*return*/, Promise.all(formattedEventPromises)];
                }
            });
        });
    };
    /**
     * Fetches bid event logs from ETH bidder or cToken bidder contracts including information about the
     * transactionHash, rebalancingSetToken, bidder and etc.
     *
     * This fetch can be filtered by block and by rebalancingSetToken.
     *
     * @param  bidderHelperType              BigNumber indicating which kind of bidder helper contract to call
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
     * @param  getTimestamp                  Boolean for returning the timestamp of the event
     * @return                               An array of objects conforming to the BidPlacedHelperEvent interface
     */
    RebalancingAPI.prototype.getBidPlacedHelperEventsAsync = function (bidderHelperType, fromBlock, toBlock, rebalancingSetToken, getTimestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var events, formattedEventPromises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!bidderHelperType.eq(common_1.BidderHelperType.ETH)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.rebalancingSetEthBidder.bidPlacedWithEthEvent(fromBlock, toBlock, rebalancingSetToken)];
                    case 1:
                        events = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!bidderHelperType.eq(common_1.BidderHelperType.CTOKEN)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.rebalancingSetCTokenBidder.bidPlacedCTokenEvent(fromBlock, toBlock, rebalancingSetToken)];
                    case 3:
                        events = _a.sent();
                        _a.label = 4;
                    case 4:
                        formattedEventPromises = events.map(function (event) { return __awaiter(_this, void 0, void 0, function () {
                            var returnValues, rebalancingSetToken, bidder, quantity, timestamp, block;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        returnValues = event.returnValues;
                                        rebalancingSetToken = returnValues['rebalancingSetToken'];
                                        bidder = returnValues['bidder'];
                                        quantity = returnValues['quantity'];
                                        timestamp = undefined;
                                        if (!getTimestamp) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.web3.eth.getBlock(event.blockNumber)];
                                    case 1:
                                        block = _a.sent();
                                        timestamp = block.timestamp;
                                        _a.label = 2;
                                    case 2: return [2 /*return*/, {
                                            transactionHash: event.transactionHash,
                                            rebalancingSetToken: rebalancingSetToken,
                                            bidder: bidder,
                                            quantity: quantity,
                                            timestamp: timestamp,
                                        }];
                                }
                            });
                        }); });
                        return [2 /*return*/, Promise.all(formattedEventPromises)];
                }
            });
        });
    };
    /**
     * Fetches details of a RebalancingSetToken comprised of factory address, manager, current set, unit shares,
     * natural unit, state, date the last rebalance ended, supply, name, and symbol
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Object conforming to `RebalancingSetDetails` interface
     */
    RebalancingAPI.prototype.getDetailsAsync = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, factoryAddress, managerAddress, currentSetAddress, unitShares, naturalUnit, state, lastRebalancedAt, supply, name, symbol, _b, proposalPeriod, rebalanceInterval;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        return [4 /*yield*/, Promise.all([
                                this.setToken.factory(rebalancingSetTokenAddress),
                                this.rebalancingSetToken.manager(rebalancingSetTokenAddress),
                                this.rebalancingSetToken.currentSet(rebalancingSetTokenAddress),
                                this.rebalancingSetToken.unitShares(rebalancingSetTokenAddress),
                                this.setToken.naturalUnit(rebalancingSetTokenAddress),
                                this.rebalancingSetToken.rebalanceState(rebalancingSetTokenAddress),
                                this.rebalancingSetToken.lastRebalanceTimestamp(rebalancingSetTokenAddress),
                                this.erc20.totalSupply(rebalancingSetTokenAddress),
                                this.erc20.name(rebalancingSetTokenAddress),
                                this.erc20.symbol(rebalancingSetTokenAddress),
                            ])];
                    case 1:
                        _a = _c.sent(), factoryAddress = _a[0], managerAddress = _a[1], currentSetAddress = _a[2], unitShares = _a[3], naturalUnit = _a[4], state = _a[5], lastRebalancedAt = _a[6], supply = _a[7], name = _a[8], symbol = _a[9];
                        return [4 /*yield*/, Promise.all([
                                this.rebalancingSetToken.proposalPeriod(rebalancingSetTokenAddress),
                                this.rebalancingSetToken.rebalanceInterval(rebalancingSetTokenAddress),
                            ])];
                    case 2:
                        _b = _c.sent(), proposalPeriod = _b[0], rebalanceInterval = _b[1];
                        return [2 /*return*/, {
                                address: rebalancingSetTokenAddress,
                                factoryAddress: factoryAddress,
                                managerAddress: managerAddress,
                                currentSetAddress: currentSetAddress,
                                unitShares: unitShares,
                                naturalUnit: naturalUnit,
                                state: state,
                                lastRebalancedAt: lastRebalancedAt,
                                supply: supply,
                                name: name,
                                symbol: symbol,
                                proposalPeriod: proposalPeriod,
                                rebalanceInterval: rebalanceInterval,
                            }];
                }
            });
        });
    };
    /**
     * Fetches details of the proposal. This includes the proposal time, next set, starting rebalance price, the pricing
     * library being used, the curve coefficient of the price, and the price divisor
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Object conforming to `RebalancingProposalDetails` interface
     */
    RebalancingAPI.prototype.getProposalDetailsAsync = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, rebalanceState, _b, nextSetAddress, pricingLibraryAddress, _c, proposalStartTime, timeToPivot, startingPrice, auctionPivotPrice;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.assertGetProposalDetails(rebalancingSetTokenAddress)];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, this.protocolViewer.fetchRebalanceProposalStateAsync(rebalancingSetTokenAddress)];
                    case 2:
                        _a = _d.sent(), rebalanceState = _a[0], _b = _a[1], nextSetAddress = _b[0], pricingLibraryAddress = _b[1], _c = _a[2], proposalStartTime = _c[0], timeToPivot = _c[1], startingPrice = _c[2], auctionPivotPrice = _c[3];
                        return [2 /*return*/, {
                                state: util_1.parseRebalanceState(rebalanceState),
                                nextSetAddress: nextSetAddress,
                                pricingLibraryAddress: pricingLibraryAddress,
                                proposalStartTime: proposalStartTime,
                                timeToPivot: timeToPivot,
                                startingPrice: startingPrice,
                                auctionPivotPrice: auctionPivotPrice,
                            }];
                }
            });
        });
    };
    /**
     * Fetches details of the current rebalancing event. This information can be used to confirm the elapsed time
     * of the rebalance, the next set, and the remaining quantity of the old set to rebalance
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Object conforming to `RebalancingProgressDetails` interface
     */
    RebalancingAPI.prototype.getRebalanceDetailsAsync = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, rebalanceState, _b, startingCurrentSetAmount, rebalancingStartedAt, minimumBid, remainingCurrentSet;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.assertGetRebalanceDetails(rebalancingSetTokenAddress)];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.protocolViewer.fetchRebalanceAuctionStateAsync(rebalancingSetTokenAddress)];
                    case 2:
                        _a = _c.sent(), rebalanceState = _a[0], _b = _a[1], startingCurrentSetAmount = _b[0], rebalancingStartedAt = _b[1], minimumBid = _b[2], remainingCurrentSet = _b[3];
                        return [2 /*return*/, {
                                state: util_1.parseRebalanceState(rebalanceState),
                                startingCurrentSetAmount: startingCurrentSetAmount,
                                rebalancingStartedAt: rebalancingStartedAt,
                                minimumBid: minimumBid,
                                remainingCurrentSet: remainingCurrentSet,
                            }];
                }
            });
        });
    };
    /**
     * Fetches the current state of the RebalancingSetToken
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Current state belonging to {'Default', 'Propose', 'Rebalance', 'Drawdown'}
     */
    RebalancingAPI.prototype.getRebalanceStateAsync = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        return [4 /*yield*/, this.rebalancingSetToken.rebalanceState(rebalancingSetTokenAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the current states for multiple RebalancingSetToken contracts
     *
     * @param  rebalancingSetTokenAddresses    Addressses of the RebalancingSetToken contracts
     * @return                                 Current state belonging to {'Default', 'Propose', 'Rebalance', 'Drawdown'}
     */
    RebalancingAPI.prototype.getRebalanceStatesAsync = function (rebalancingSetTokenAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            var statusEnums;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertGetRebalanceStatesAsync(rebalancingSetTokenAddresses);
                        return [4 /*yield*/, this.protocolViewer.batchFetchRebalanceStateAsync(rebalancingSetTokenAddresses)];
                    case 1:
                        statusEnums = _a.sent();
                        return [2 /*return*/, statusEnums.map(function (statusEnum) { return util_1.parseRebalanceState(statusEnum); })];
                }
            });
        });
    };
    /**
     * Fetches the current unitShares for multiple RebalancingSetToken contracts
     *
     * @param  rebalancingSetTokenAddresses    Addressses of the RebalancingSetToken contracts
     * @return                                 Array of current unitShares
     */
    RebalancingAPI.prototype.getUnitSharesAsync = function (rebalancingSetTokenAddresses) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assertGetUnitSharesAsync(rebalancingSetTokenAddresses);
                        return [4 /*yield*/, this.protocolViewer.batchFetchUnitSharesAsync(rebalancingSetTokenAddresses)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the current collateral set token address of a rebalancing set
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Address of the rebalancing set's current Set Token
     */
    RebalancingAPI.prototype.getRebalancingSetCurrentSetAsync = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rebalancingSetToken.currentSet(rebalancingSetTokenAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Fetches the remaining current sets of a rebalancing set that is currently undergoing a rebalance
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Number of remaining shares available
     */
    RebalancingAPI.prototype.getRebalancingSetAuctionRemainingCurrentSets = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertGetRebalanceDetails(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetToken.remainingCurrentSets(rebalancingSetTokenAddress)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /* ============ Private Assertions ============ */
    RebalancingAPI.prototype.assertPropose = function (rebalancingSetTokenAddress, nextSetAddress, auctionLibrary, auctionTimeToPivot, auctionStartPrice, auctionPivotPrice, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        this.assert.schema.isValidAddress('nextSetAddress', nextSetAddress);
                        this.assert.schema.isValidAddress('auctionLibrary', auctionLibrary);
                        this.assert.common.greaterThanZero(auctionTimeToPivot, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(auctionTimeToPivot));
                        this.assert.common.greaterThanZero(auctionPivotPrice, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(auctionPivotPrice));
                        this.assert.common.greaterThanZero(auctionStartPrice, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(auctionStartPrice));
                        return [4 /*yield*/, this.assert.rebalancing.isNotInRebalanceState(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.isManager(rebalancingSetTokenAddress, txOpts.from)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.assert.setToken.isValidSetToken(this.core.coreAddress, nextSetAddress)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.nextSetIsMultiple(rebalancingSetTokenAddress, nextSetAddress)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.isValidPriceCurve(auctionLibrary, this.core.coreAddress)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.sufficientTimeBetweenRebalance(rebalancingSetTokenAddress)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertStartRebalance = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        return [4 /*yield*/, this.assert.rebalancing.isInProposalState(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.sufficientTimeInProposalState(rebalancingSetTokenAddress)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertSettleRebalance = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        return [4 /*yield*/, this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.enoughSetsRebalanced(rebalancingSetTokenAddress)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertEndFailedAuction = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        return [4 /*yield*/, this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.passedPivotTime(rebalancingSetTokenAddress)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.enoughRemainingBids(rebalancingSetTokenAddress)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertRedeemFromFailedRebalance = function (rebalancingSetTokenAddress, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        return [4 /*yield*/, this.assert.setToken.hasSufficientBalances(rebalancingSetTokenAddress, txOpts.from, new util_1.BigNumber(0))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.isInDrawdownState(rebalancingSetTokenAddress)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertBid = function (rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        this.assert.common.greaterThanZero(bidQuantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(bidQuantity));
                        return [4 /*yield*/, this.assert.setToken.isValidSetToken(this.core.coreAddress, rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress)];
                    case 2:
                        _a.sent();
                        if (!!allowPartialFill) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.assert.rebalancing.bidAmountLessThanRemainingSets(rebalancingSetTokenAddress, bidQuantity)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.assert.rebalancing.bidIsMultipleOfMinimumBid(rebalancingSetTokenAddress, bidQuantity)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.hasSufficientAllowances(rebalancingSetTokenAddress, txOpts.from, this.core.transferProxyAddress, bidQuantity)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.hasSufficientBalances(rebalancingSetTokenAddress, txOpts.from, bidQuantity)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertBidWithEther = function (rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        this.assert.common.greaterThanZero(bidQuantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(bidQuantity));
                        return [4 /*yield*/, this.assert.setToken.isValidSetToken(this.core.coreAddress, rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress)];
                    case 2:
                        _a.sent();
                        if (!!allowPartialFill) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.assert.rebalancing.bidAmountLessThanRemainingSets(rebalancingSetTokenAddress, bidQuantity)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.assert.rebalancing.bidIsMultipleOfMinimumBid(rebalancingSetTokenAddress, bidQuantity)];
                    case 5:
                        _a.sent();
                        // Assert non-WETH components have sufficient allowances
                        return [4 /*yield*/, this.assert.rebalancing.hasSufficientAllowances(rebalancingSetTokenAddress, txOpts.from, this.config.rebalancingSetEthBidderAddress, bidQuantity, [this.config.wrappedEtherAddress])];
                    case 6:
                        // Assert non-WETH components have sufficient allowances
                        _a.sent();
                        // Assert non-WETH components have sufficient balances
                        return [4 /*yield*/, this.assert.rebalancing.hasSufficientBalances(rebalancingSetTokenAddress, txOpts.from, bidQuantity, [this.config.wrappedEtherAddress])];
                    case 7:
                        // Assert non-WETH components have sufficient balances
                        _a.sent();
                        // Assert Ether value sent is greater than WETH component units
                        return [4 /*yield*/, this.assert.rebalancing.hasRequiredEtherValue(rebalancingSetTokenAddress, bidQuantity, this.config.wrappedEtherAddress, new util_1.BigNumber(txOpts.value))];
                    case 8:
                        // Assert Ether value sent is greater than WETH component units
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertBidCToken = function (rebalancingSetTokenAddress, bidQuantity, allowPartialFill, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenFlows;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        this.assert.common.greaterThanZero(bidQuantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(bidQuantity));
                        return [4 /*yield*/, this.assert.setToken.isValidSetToken(this.core.coreAddress, rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress)];
                    case 2:
                        _a.sent();
                        if (!!allowPartialFill) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.assert.rebalancing.bidAmountLessThanRemainingSets(rebalancingSetTokenAddress, bidQuantity)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.assert.rebalancing.bidIsMultipleOfMinimumBid(rebalancingSetTokenAddress, bidQuantity)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancingSetCTokenBidder.getAddressAndBidPriceArray(rebalancingSetTokenAddress, bidQuantity)];
                    case 6:
                        tokenFlows = _a.sent();
                        return [4 /*yield*/, Promise.all(tokenFlows.tokens.map(function (tokenAddress, index) {
                                return _this.assert.erc20.hasSufficientAllowanceAsync(tokenAddress, txOpts.from, _this.config.rebalancingSetCTokenBidderAddress, tokenFlows.inflow[index]);
                            }))];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, Promise.all(tokenFlows.tokens.map(function (tokenAddress, index) {
                                return _this.assert.erc20.hasSufficientBalanceAsync(tokenAddress, txOpts.from, tokenFlows.inflow[index]);
                            }))];
                    case 8:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertGetRebalanceStatesAsync = function (tokenAddresses) {
        var _this = this;
        tokenAddresses.forEach(function (tokenAddress) {
            _this.assert.schema.isValidAddress('rebalancingSetTokenAddress', tokenAddress);
        });
    };
    RebalancingAPI.prototype.assertGetUnitSharesAsync = function (tokenAddresses) {
        var _this = this;
        tokenAddresses.forEach(function (tokenAddress) {
            _this.assert.schema.isValidAddress('rebalancingSetTokenAddress', tokenAddress);
        });
    };
    RebalancingAPI.prototype.assertUpdateManager = function (rebalancingSetTokenAddress, newManager, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        this.assert.schema.isValidAddress('newManager', newManager);
                        return [4 /*yield*/, this.assert.rebalancing.isManager(rebalancingSetTokenAddress, txOpts.from)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertGetBidPrice = function (rebalancingSetTokenAddress, bidQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        this.assert.common.greaterThanZero(bidQuantity, errors_1.coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(bidQuantity));
                        return [4 /*yield*/, this.assert.rebalancing.isInRebalanceState(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.bidAmountLessThanRemainingSets(rebalancingSetTokenAddress, bidQuantity)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.assert.rebalancing.bidIsMultipleOfMinimumBid(rebalancingSetTokenAddress, bidQuantity)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertGetRebalanceDetails = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        return [4 /*yield*/, this.assert.rebalancing.canFetchRebalanceState(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RebalancingAPI.prototype.assertGetProposalDetails = function (rebalancingSetTokenAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.assert.schema.isValidAddress('rebalancingSetTokenAddress', rebalancingSetTokenAddress);
                        return [4 /*yield*/, this.assert.rebalancing.canFetchProposalDetails(rebalancingSetTokenAddress)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RebalancingAPI;
}());
exports.RebalancingAPI = RebalancingAPI;
//# sourceMappingURL=RebalancingAPI.js.map