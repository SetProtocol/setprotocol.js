"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BN = require("bn.js");
var ABI = require("ethereumjs-abi");
var ethUtil = require("ethereumjs-util");
var _ = require("lodash");
exports.crypto = {
    /**
     * We convert types from JS to Solidity as follows:
     * BigNumber -> uint256
     * number -> uint8
     * string -> string
     * boolean -> bool
     * valid Ethereum address -> address
     */
    solSHA3: function (args) {
        return exports.crypto._solHash(args, ABI.soliditySHA3);
    },
    solSHA256: function (args) {
        return exports.crypto._solHash(args, ABI.soliditySHA256);
    },
    _solHash: function (args, hashFunction) {
        var argTypes = [];
        _.each(args, function (arg, i) {
            var isNumber = _.isFinite(arg);
            if (isNumber) {
                argTypes.push('uint8');
            }
            else if (arg.isBigNumber) {
                argTypes.push('uint256');
                var base = 10;
                args[i] = new BN(arg.toString(base), base);
            }
            else if (ethUtil.isValidAddress(arg)) {
                argTypes.push('address');
            }
            else if (_.isString(arg)) {
                argTypes.push('string');
            }
            else if (_.isBuffer(arg) || _.isTypedArray(arg)) {
                argTypes.push('bytes');
            }
            else if (_.isBoolean(arg)) {
                argTypes.push('bool');
            }
            else {
                throw new Error("Unable to guess arg type: " + arg);
            }
        });
        var hash = hashFunction(argTypes, args);
        return hash;
    },
};
//# sourceMappingURL=crypto.js.map