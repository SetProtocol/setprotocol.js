/// <reference types="node" />
export declare const crypto: {
    /**
     * We convert types from JS to Solidity as follows:
     * BigNumber -> uint256
     * number -> uint8
     * string -> string
     * boolean -> bool
     * valid Ethereum address -> address
     */
    solSHA3(args: any[]): Buffer;
    solSHA256(args: any[]): Buffer;
    _solHash(args: any[], hashFunction: (types: string[], values: any[]) => Buffer): Buffer;
};
//# sourceMappingURL=crypto.d.ts.map