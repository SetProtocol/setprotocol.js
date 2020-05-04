import Contract from "web3/eth/contract";
import { ABIDefinition } from "web3/eth/abi";
import { Tx } from "web3/eth/types";
export declare const CONTRACT_WRAPPER_ERRORS: {
    CONTRACT_NOT_FOUND_ON_NETWORK: (contractName: string, networkId: number) => string;
};
export declare class BaseContract {
    address: string;
    abi: ABIDefinition[];
    web3ContractInstance: Contract;
    protected defaults: Tx;
    constructor(web3ContractInstance: Contract, defaults: Tx);
    protected formatABIDataItem(type: string, components: any, value: any): any;
    protected applyDefaultsToTxDataAsync<T extends Tx>(txData: T, estimateGasAsync?: (txData: T) => Promise<number>): Promise<Tx>;
}
