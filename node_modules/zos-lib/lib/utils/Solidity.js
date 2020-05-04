"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const truffle_flattener_1 = __importDefault(require("truffle-flattener"));
function flattenSourceCode(contractPaths, root = process.cwd()) {
    return truffle_flattener_1.default(contractPaths, root);
}
exports.flattenSourceCode = flattenSourceCode;
//# sourceMappingURL=Solidity.js.map