"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ABIDecoder = __importStar(require("abi-decoder"));
var _ = __importStar(require("lodash"));
var bignumber_js_1 = require("bignumber.js");
var transactionUtils_1 = require("./transactionUtils");
var set_protocol_contracts_1 = require("set-protocol-contracts");
function getFormattedLogsFromTxHash(web3, txHash) {
    return __awaiter(this, void 0, void 0, function () {
        var receipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ABIDecoder.addABI(set_protocol_contracts_1.Core.abi);
                    return [4 /*yield*/, transactionUtils_1.awaitTx(web3, txHash)];
                case 1:
                    receipt = _a.sent();
                    return [2 /*return*/, getFormattedLogsFromReceipt(receipt)];
            }
        });
    });
}
exports.getFormattedLogsFromTxHash = getFormattedLogsFromTxHash;
function getFormattedLogsFromReceipt(receipt) {
    var logs = _.compact(ABIDecoder.decodeLogs(receipt.logs));
    return _.map(logs, function (log) { return formatLogEntry(log); });
}
exports.getFormattedLogsFromReceipt = getFormattedLogsFromReceipt;
/**
 * Converts a ABI Decoded Log into a Log
 * Input Example
 * {
 *   name: 'Transfer',
 *   events: [
 *    { name: 'from',
 *      type: 'address',
 *      value: '0xc604980c49f5c3be6e7e42526ec00f211e333385' },
 *    { name: 'to',
 *      type: 'address',
 *      value: '0xf8600afbf76236454a53e8dcc4d1feaa26fe1a77' },
 *    { name: 'value', type: 'uint256', value: '10000000000000000000' },
 *   ],
 *   address: '0xea76972f7587c27887aa403d84671717f6826f62'
 * }
 *
 * Output Example
 * {
 *   event: "Transfer",
 *   address: tokenAddress,
 *   args: {
 *     from,
 *     to,
 *     value,
 *   },
 * };
 */
function formatLogEntry(logs) {
    var name = logs.name, events = logs.events, address = logs.address;
    var args = {};
    // Loop through each event and add to args
    _.each(events, function (event) {
        var name = event.name, type = event.type, value = event.value;
        var argValue = value;
        switch (true) {
            case /^(uint)\d*\[\]/.test(type): {
                break;
            }
            case /^(uint)\d*/.test(type): {
                argValue = new bignumber_js_1.BigNumber(value.toString());
                break;
            }
        }
        args[name] = argValue;
    });
    return {
        event: name,
        address: address,
        args: args,
    };
}
exports.formatLogEntry = formatLogEntry;
function extractNewSetTokenAddressFromLogs(logs, logIndex) {
    if (logIndex === void 0) { logIndex = 1; }
    var createLog = logs[logs.length - logIndex];
    var args = createLog.args;
    return args._setTokenAddress;
}
exports.extractNewSetTokenAddressFromLogs = extractNewSetTokenAddressFromLogs;
//# sourceMappingURL=logs.js.map