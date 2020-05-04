"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_1 = __importDefault(require("web3"));
// This function has basically been copied vertabim from the amazing Dharma repo
exports.instantiateWeb3 = function (provider) {
    /**
     * There are two ways we can access a web3 provider:
     * 1. We pass in the address of an Eth node, e.g. https://localhost:8545
     * 2. Web3 has been injected into the browser window (e.g. via Metamask.)
     */
    if (provider) {
        return new web3_1.default(provider);
    }
    else if (typeof window !== 'undefined' &&
        typeof window.web3 !== 'undefined') {
        // If web3 is available via the browser window, instantiate web3 via the current provider.
        return new web3_1.default(window.web3.currentProvider);
    }
    else {
        // Otherwise throw...
        throw new Error('Please make sure to pass in a provider.');
    }
};
//# sourceMappingURL=provider.js.map