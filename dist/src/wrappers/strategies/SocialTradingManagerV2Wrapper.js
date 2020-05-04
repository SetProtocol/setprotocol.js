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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var SocialTradingManagerWrapper_1 = require("./SocialTradingManagerWrapper");
var util_1 = require("../../util");
/**
 * @title  SocialTradingManagerWrapper
 * @author Set Protocol
 *
 * The SocialTradingManagerV2Wrapper extends SocialTradingManagerWrapper and adds fee setting functions.
 *
 */
var SocialTradingManagerV2Wrapper = /** @class */ (function (_super) {
    __extends(SocialTradingManagerV2Wrapper, _super);
    function SocialTradingManagerV2Wrapper(web3) {
        return _super.call(this, web3) || this;
    }
    /**
     * Calls SocialTradingManager's adjustFee function. Allows trader to change performance fees.
     *
     * @param  manager                        Address of the social trading manager contract
     * @param  tradingPool                    Address of tradingPool being updated
     * @param  newFeeCallData                 New fee call data
     * @return                                The hash of the resulting transaction.
     */
    SocialTradingManagerV2Wrapper.prototype.adjustFee = function (manager, tradingPool, newFeeCallData, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var socialTradingManagerInstance, txOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadSocialTradingManagerV2ContractAsync(manager)];
                    case 1:
                        socialTradingManagerInstance = _a.sent();
                        return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 2:
                        txOptions = _a.sent();
                        return [4 /*yield*/, socialTradingManagerInstance.adjustFee.sendTransactionAsync(tradingPool, newFeeCallData, txOptions)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Calls SocialTradingManager's adjustFee function. Allows trader to change performance fees.
     *
     * @param  manager                        Address of the social trading manager contract
     * @param  tradingPool                    Address of tradingPool being updated
     * @param  upgradeHash                    Hash of upgrade to be removed
     * @return                                The hash of the resulting transaction.
     */
    SocialTradingManagerV2Wrapper.prototype.removeRegisteredUpgrade = function (manager, tradingPool, upgradeHash, txOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var socialTradingManagerInstance, txOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contracts.loadSocialTradingManagerV2ContractAsync(manager)];
                    case 1:
                        socialTradingManagerInstance = _a.sent();
                        return [4 /*yield*/, util_1.generateTxOpts(this.web3, txOpts)];
                    case 2:
                        txOptions = _a.sent();
                        return [4 /*yield*/, socialTradingManagerInstance.removeRegisteredUpgrade.sendTransactionAsync(tradingPool, upgradeHash, txOptions)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return SocialTradingManagerV2Wrapper;
}(SocialTradingManagerWrapper_1.SocialTradingManagerWrapper));
exports.SocialTradingManagerV2Wrapper = SocialTradingManagerV2Wrapper;
//# sourceMappingURL=SocialTradingManagerV2Wrapper.js.map