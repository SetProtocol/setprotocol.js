import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { ChainlinkClient } from "./ChainlinkClient";
export declare class ChainlinkClientFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(): Promise<ChainlinkClient>;
    getDeployTransaction(): UnsignedTransaction;
    attach(address: string): ChainlinkClient;
    connect(signer: Signer): ChainlinkClientFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): ChainlinkClient;
}
