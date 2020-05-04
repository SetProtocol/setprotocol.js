import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { MaliciousChainlinked } from "./MaliciousChainlinked";
export declare class MaliciousChainlinkedFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(): Promise<MaliciousChainlinked>;
    getDeployTransaction(): UnsignedTransaction;
    attach(address: string): MaliciousChainlinked;
    connect(signer: Signer): MaliciousChainlinkedFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): MaliciousChainlinked;
}
