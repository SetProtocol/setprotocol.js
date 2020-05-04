import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { Chainlinked } from "./Chainlinked";
export declare class ChainlinkedFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(): Promise<Chainlinked>;
    getDeployTransaction(): UnsignedTransaction;
    attach(address: string): Chainlinked;
    connect(signer: Signer): ChainlinkedFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): Chainlinked;
}
