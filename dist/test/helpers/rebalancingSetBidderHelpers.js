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
var set_protocol_contracts_1 = require("set-protocol-contracts");
var set_protocol_contracts_2 = require("set-protocol-contracts");
var constants_1 = require("@src/constants");
var util_1 = require("@src/util");
var coreHelpers_1 = require("./coreHelpers");
exports.deployRebalancingSetEthBidderAsync = function (web3, rebalanceAuctionModule, transferProxy, wrappedEther, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleRebalancingSetEthBidderContract, truffleERC20WrapperContract, deployedERC20Wrapper, deployedRebalancingSetEthBidderContract, rebalancingSetEthBidder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleRebalancingSetEthBidderContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_contracts_1.RebalancingSetEthBidder);
                    truffleERC20WrapperContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_contracts_2.ERC20Wrapper);
                    return [4 /*yield*/, truffleERC20WrapperContract.new()];
                case 1:
                    deployedERC20Wrapper = _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetEthBidderContract.link('ERC20Wrapper', deployedERC20Wrapper.address)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetEthBidderContract.new(rebalanceAuctionModule.address, transferProxy.address, wrappedEther.address)];
                case 3:
                    deployedRebalancingSetEthBidderContract = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetEthBidderContract.at(deployedRebalancingSetEthBidderContract.address, web3, constants_1.TX_DEFAULTS)];
                case 4:
                    rebalancingSetEthBidder = _a.sent();
                    return [2 /*return*/, rebalancingSetEthBidder];
            }
        });
    });
};
exports.deployRebalancingSetCTokenBidderAsync = function (web3, rebalanceAuctionModule, transferProxy, cTokenAddressesArray, underlyingAddressesArray, dataDescription, owner) {
    if (owner === void 0) { owner = constants_1.DEFAULT_ACCOUNT; }
    return __awaiter(_this, void 0, void 0, function () {
        var truffleRebalancingSetCTokenBidderContract, truffleERC20WrapperContract, deployedERC20Wrapper, deployedRebalancingSetCTokenBidderContract, rebalancingSetCTokenBidder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    truffleRebalancingSetCTokenBidderContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_contracts_1.RebalancingSetCTokenBidder);
                    truffleERC20WrapperContract = coreHelpers_1.setDefaultTruffleContract(web3, set_protocol_contracts_2.ERC20Wrapper);
                    return [4 /*yield*/, truffleERC20WrapperContract.new()];
                case 1:
                    deployedERC20Wrapper = _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetCTokenBidderContract.link('ERC20Wrapper', deployedERC20Wrapper.address)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, truffleRebalancingSetCTokenBidderContract.new(rebalanceAuctionModule.address, transferProxy.address, cTokenAddressesArray, underlyingAddressesArray, dataDescription)];
                case 3:
                    deployedRebalancingSetCTokenBidderContract = _a.sent();
                    return [4 /*yield*/, set_protocol_contracts_2.RebalancingSetCTokenBidderContract.at(deployedRebalancingSetCTokenBidderContract.address, web3, constants_1.TX_DEFAULTS)];
                case 4:
                    rebalancingSetCTokenBidder = _a.sent();
                    return [2 /*return*/, rebalancingSetCTokenBidder];
            }
        });
    });
};
exports.replaceFlowsWithCTokenUnderlyingAsync = function (expectedTokenFlows, combinedTokenArray, cTokenAddressesArray, underlyingAddressesArray, cTokenExchangeRateArray) {
    var inflow = [];
    var outflow = [];
    var cTokenToUnderlyingObject = exports.constructObjectFromArray(cTokenAddressesArray, underlyingAddressesArray);
    var cTokenToExchangeRateObject = exports.constructObjectFromArray(cTokenAddressesArray, cTokenExchangeRateArray);
    for (var i = 0; i < combinedTokenArray.length; i++) {
        // Check if address is cToken
        if (cTokenToUnderlyingObject[combinedTokenArray[i]]) {
            var cTokenConversion = cTokenToExchangeRateObject[combinedTokenArray[i]].div(Math.pow(10, 18));
            var newInflow = expectedTokenFlows['inflow'][i]
                .mul(cTokenConversion)
                .round(0, util_1.BigNumber.ROUND_DOWN);
            newInflow = newInflow.div(cTokenConversion).gte(expectedTokenFlows['inflow'][i])
                ? newInflow
                : newInflow.add(1);
            var newOutflow = expectedTokenFlows['outflow'][i]
                .mul(cTokenConversion)
                .round(0, util_1.BigNumber.ROUND_DOWN);
            newOutflow = newOutflow.div(cTokenConversion).gte(expectedTokenFlows['outflow'][i])
                ? newOutflow
                : newOutflow.add(1);
            inflow.push(newInflow);
            outflow.push(newOutflow);
        }
        else {
            inflow.push(expectedTokenFlows['inflow'][i]);
            outflow.push(expectedTokenFlows['outflow'][i]);
        }
    }
    return { inflow: inflow, outflow: outflow };
};
exports.constructObjectFromArray = function (array1, array2) {
    return array1.reduce(function (accumulator, currentValue, index) {
        var _a;
        return __assign({}, accumulator, (_a = {}, _a[currentValue] = array2[index], _a));
    }, {});
};
exports.replaceDetailFlowsWithCTokenUnderlyingAsync = function (expectedTokenFlowsDetails, cTokenAddressesArray, underlyingAddressesArray, cTokenExchangeRateArray) {
    var cTokenToUnderlyingObject = exports.constructObjectFromArray(cTokenAddressesArray, underlyingAddressesArray);
    var cTokenToExchangeRateObject = exports.constructObjectFromArray(cTokenAddressesArray, cTokenExchangeRateArray);
    var newInflow = expectedTokenFlowsDetails['inflow'].map(function (component) {
        if (cTokenToUnderlyingObject[component.address]) {
            var cTokenConversion = cTokenToExchangeRateObject[component.address].div(Math.pow(10, 18));
            var newAddress = cTokenToUnderlyingObject[component.address];
            var newUnit = component.unit.mul(cTokenConversion).round(0, util_1.BigNumber.ROUND_DOWN);
            return { address: newAddress, unit: newUnit };
        }
        else {
            return component;
        }
    });
    var newOutflow = expectedTokenFlowsDetails['outflow'].map(function (component) {
        if (cTokenToUnderlyingObject[component.address]) {
            var cTokenConversion = cTokenToExchangeRateObject[component.address].div(Math.pow(10, 18));
            var newAddress = cTokenToUnderlyingObject[component.address];
            var newUnit = component.unit.mul(cTokenConversion).round(0, util_1.BigNumber.ROUND_DOWN);
            return { address: newAddress, unit: newUnit };
        }
        else {
            return component;
        }
    });
    return { inflow: newInflow, outflow: newOutflow };
};
//# sourceMappingURL=rebalancingSetBidderHelpers.js.map