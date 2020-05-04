import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { ConcreteChainlinked } from "./ConcreteChainlinked";
export declare class ConcreteChainlinkedFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_link: string, _oracle: string): Promise<ConcreteChainlinked>;
    getDeployTransaction(_link: string, _oracle: string): UnsignedTransaction;
    attach(address: string): ConcreteChainlinked;
    connect(signer: Signer): ConcreteChainlinkedFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): ConcreteChainlinked;
}
