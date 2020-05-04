import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { PublicResolver } from "./PublicResolver";
export declare class PublicResolverFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(ensAddr: string): Promise<PublicResolver>;
    getDeployTransaction(ensAddr: string): UnsignedTransaction;
    attach(address: string): PublicResolver;
    connect(signer: Signer): PublicResolverFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): PublicResolver;
}
