import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { ConcreteSignedSafeMath } from "./ConcreteSignedSafeMath";
export declare class ConcreteSignedSafeMathFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(): Promise<ConcreteSignedSafeMath>;
    getDeployTransaction(): UnsignedTransaction;
    attach(address: string): ConcreteSignedSafeMath;
    connect(signer: Signer): ConcreteSignedSafeMathFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): ConcreteSignedSafeMath;
}
