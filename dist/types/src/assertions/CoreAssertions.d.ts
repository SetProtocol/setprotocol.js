import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
export declare class CoreAssertions {
    private web3;
    constructor(web3: Web3);
    /**
     * Throws if the given candidateContract does not respond to some methods from the Core interface.
     *
     * @param  coreAddress The address of the core contract
     * @return              Void Promise
     */
    implementsCore(coreAddress: Address): Promise<void>;
}
