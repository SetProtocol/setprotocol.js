"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var set_protocol_utils_1 = require("set-protocol-utils");
exports.SolidityTypes = set_protocol_utils_1.SolidityTypes;
var FeeType;
(function (FeeType) {
    FeeType[FeeType["StreamingFee"] = 0] = "StreamingFee";
    FeeType[FeeType["ProfitFee"] = 1] = "ProfitFee";
})(FeeType = exports.FeeType || (exports.FeeType = {}));
exports.BidderHelperType = {
    ETH: new util_1.BigNumber(0),
    CTOKEN: new util_1.BigNumber(1),
};
exports.RebalancingState = {
    DEFAULT: new util_1.BigNumber(0),
    PROPOSAL: new util_1.BigNumber(1),
    REBALANCE: new util_1.BigNumber(2),
    DRAWDOWN: new util_1.BigNumber(3),
};
exports.ManagerType = {
    BTCETH: new util_1.BigNumber(0),
    BTCDAI: new util_1.BigNumber(1),
    ETHDAI: new util_1.BigNumber(2),
    MACO: new util_1.BigNumber(3),
    MACOV2: new util_1.BigNumber(4),
    PAIR: new util_1.BigNumber(5),
};
//# sourceMappingURL=common.js.map