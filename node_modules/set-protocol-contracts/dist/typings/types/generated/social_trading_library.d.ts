import Web3 from 'web3';
import Contract from "web3/eth/contract";
import { Tx } from "web3/eth/types";
import { BaseContract } from '../base_contract';
export declare class SocialTradingLibraryContract extends BaseContract {
    deploy(data: string, args: any[]): Promise<any>;
    static deployed(web3: Web3, defaults: Tx): Promise<SocialTradingLibraryContract>;
    static at(address: string, web3: Web3, defaults: Tx): Promise<SocialTradingLibraryContract>;
    constructor(web3ContractInstance: Contract, defaults: Tx);
}
