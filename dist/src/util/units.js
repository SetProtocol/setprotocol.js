"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_1 = __importDefault(require("web3"));
var _1 = require(".");
var web3 = new web3_1.default();
function ether(amount) {
    var weiString = web3.utils.toWei(amount.toString(), 'ether');
    return new _1.BigNumber(weiString);
}
exports.ether = ether;
//# sourceMappingURL=units.js.map