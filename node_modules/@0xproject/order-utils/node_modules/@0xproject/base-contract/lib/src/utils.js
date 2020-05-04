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
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
// tslint:disable-next-line:completed-docs
function formatABIDataItem(abi, value, formatter) {
    var trailingArrayRegex = /\[\d*\]$/;
    if (abi.type.match(trailingArrayRegex)) {
        var arrayItemType_1 = abi.type.replace(trailingArrayRegex, '');
        return _.map(value, function (val) {
            var arrayItemAbi = __assign({}, abi, { type: arrayItemType_1 });
            return formatABIDataItem(arrayItemAbi, val, formatter);
        });
    }
    else if (abi.type === 'tuple') {
        var formattedTuple_1 = {};
        _.forEach(abi.components, function (componentABI) {
            formattedTuple_1[componentABI.name] = formatABIDataItem(componentABI, value[componentABI.name], formatter);
        });
        return formattedTuple_1;
    }
    else {
        return formatter(abi.type, value);
    }
}
exports.formatABIDataItem = formatABIDataItem;
//# sourceMappingURL=utils.js.map