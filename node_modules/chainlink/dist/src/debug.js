"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
/**
 * This creates a debug logger instance to be used within our internal code.
 * @see https://www.npmjs.com/package/debug to see how to use the logger at runtime
 * @see wallet.ts makes extensive use of this function.
 * @param name The root namespace to assign to the log messages
 */
function makeDebug(name) {
    return debug_1.default(name);
}
exports.makeDebug = makeDebug;
//# sourceMappingURL=debug.js.map