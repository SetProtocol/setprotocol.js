"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dev_utils_1 = require("@0xproject/dev-utils");
var web3_wrapper_1 = require("@0xproject/web3-wrapper");
var provider = dev_utils_1.web3Factory.getRpcProvider({ shouldUseInProcessGanache: true });
exports.provider = provider;
var web3Wrapper = new web3_wrapper_1.Web3Wrapper(provider);
exports.web3Wrapper = web3Wrapper;
//# sourceMappingURL=web3_wrapper.js.map