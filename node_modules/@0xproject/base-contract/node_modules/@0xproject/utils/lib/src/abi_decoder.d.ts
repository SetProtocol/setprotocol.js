import { AbiDefinition, DecodedLogArgs, LogEntry, LogWithDecodedArgs, RawLog } from 'ethereum-types';
/**
 * AbiDecoder allows you to decode event logs given a set of supplied contract ABI's. It takes the contract's event
 * signature from the ABI and attempts to decode the logs using it.
 */
export declare class AbiDecoder {
    private readonly _methodIds;
    /**
     * Instantiate an AbiDecoder
     * @param abiArrays An array of contract ABI's
     * @return AbiDecoder instance
     */
    constructor(abiArrays: AbiDefinition[][]);
    /**
     * Attempt to decode a log given the ABI's the AbiDecoder knows about.
     * @param log The log to attempt to decode
     * @return The decoded log if the requisite ABI was available. Otherwise the log unaltered.
     */
    tryToDecodeLogOrNoop<ArgsType extends DecodedLogArgs>(log: LogEntry): LogWithDecodedArgs<ArgsType> | RawLog;
    /**
     * Add additional ABI definitions to the AbiDecoder
     * @param abiArray An array of ABI definitions to add to the AbiDecoder
     */
    addABI(abiArray: AbiDefinition[]): void;
}
//# sourceMappingURL=abi_decoder.d.ts.map