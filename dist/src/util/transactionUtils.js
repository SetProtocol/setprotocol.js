"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var set_protocol_utils_1 = require("set-protocol-utils");
var constants_1 = require("../constants");
var _1 = require(".");
function generateTxOpts(web3, txOpts) {
    return __awaiter(this, void 0, void 0, function () {
        var web3Utils, accounts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    web3Utils = new set_protocol_utils_1.Web3Utils(web3);
                    return [4 /*yield*/, web3Utils.getAvailableAddressesAsync()];
                case 1:
                    accounts = _a.sent();
                    return [2 /*return*/, __assign({ from: accounts[0], gas: constants_1.DEFAULT_GAS_LIMIT, gasPrice: constants_1.DEFAULT_GAS_PRICE }, txOpts)];
            }
        });
    });
}
exports.generateTxOpts = generateTxOpts;
function awaitTx(web3, txHash, options) {
    return __awaiter(this, void 0, void 0, function () {
        var web3Utils, interval, transactionReceiptAsync, promises_1;
        return __generator(this, function (_a) {
            web3Utils = new set_protocol_utils_1.Web3Utils(web3);
            interval = options && options.interval ? options.interval : 500;
            transactionReceiptAsync = function (txHash, resolve, reject) {
                return __awaiter(this, void 0, void 0, function () {
                    var receipt, resolvedReceipt, block, current, txn, e_1, e_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 13, , 14]);
                                return [4 /*yield*/, web3Utils.getTransactionReceiptAsync(txHash)];
                            case 1:
                                receipt = _a.sent();
                                if (!!receipt) return [3 /*break*/, 2];
                                setTimeout(function () {
                                    transactionReceiptAsync(txHash, resolve, reject);
                                }, interval);
                                return [3 /*break*/, 12];
                            case 2:
                                if (!(options && options.ensureNotUncle)) return [3 /*break*/, 11];
                                resolvedReceipt = receipt;
                                if (!(!resolvedReceipt || !resolvedReceipt.blockNumber)) return [3 /*break*/, 3];
                                setTimeout(function () {
                                    transactionReceiptAsync(txHash, resolve, reject);
                                }, interval);
                                return [3 /*break*/, 10];
                            case 3:
                                _a.trys.push([3, 9, , 10]);
                                return [4 /*yield*/, web3.eth.getBlock(resolvedReceipt.blockNumber)];
                            case 4:
                                block = _a.sent();
                                return [4 /*yield*/, web3.eth.getBlock('latest')];
                            case 5:
                                current = _a.sent();
                                if (!(current.number && block.number && current.number - block.number >= 12)) return [3 /*break*/, 7];
                                return [4 /*yield*/, web3.eth.getTransaction(txHash)];
                            case 6:
                                txn = _a.sent();
                                if (txn.blockNumber) {
                                    resolve(resolvedReceipt);
                                }
                                else {
                                    reject(new Error('Transaction with hash: ' + txHash + ' ended up in an uncle block.'));
                                }
                                return [3 /*break*/, 8];
                            case 7:
                                setTimeout(function () {
                                    transactionReceiptAsync(txHash, resolve, reject);
                                }, interval);
                                _a.label = 8;
                            case 8: return [3 /*break*/, 10];
                            case 9:
                                e_1 = _a.sent();
                                setTimeout(function () {
                                    transactionReceiptAsync(txHash, resolve, reject);
                                }, interval);
                                return [3 /*break*/, 10];
                            case 10: return [3 /*break*/, 12];
                            case 11:
                                resolve(receipt);
                                _a.label = 12;
                            case 12: return [3 /*break*/, 14];
                            case 13:
                                e_2 = _a.sent();
                                reject(e_2);
                                return [3 /*break*/, 14];
                            case 14: return [2 /*return*/];
                        }
                    });
                });
            };
            if (Array.isArray(txHash)) {
                promises_1 = [];
                txHash.forEach(function (oneTxHash) {
                    promises_1.push(awaitTx(web3, oneTxHash, options));
                });
                return [2 /*return*/, Promise.all(promises_1)];
            }
            else {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        transactionReceiptAsync(txHash, resolve, reject);
                    })];
            }
            return [2 /*return*/];
        });
    });
}
exports.awaitTx = awaitTx;
exports.getGasUsageInEth = function (web3, txHash) { return __awaiter(_this, void 0, void 0, function () {
    var txReceipt, txn, gasPrice, gasUsed;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, web3.eth.getTransactionReceipt(txHash)];
            case 1:
                txReceipt = _a.sent();
                return [4 /*yield*/, web3.eth.getTransaction(txHash)];
            case 2:
                txn = _a.sent();
                gasPrice = txn.gasPrice;
                gasUsed = txReceipt.gasUsed;
                return [2 /*return*/, new _1.BigNumber(gasPrice).mul(gasUsed)];
        }
    });
}); };
//# sourceMappingURL=transactionUtils.js.map