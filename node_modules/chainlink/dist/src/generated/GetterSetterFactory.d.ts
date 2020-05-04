import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { GetterSetter } from "./GetterSetter";
export declare class GetterSetterFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(): Promise<GetterSetter>;
    getDeployTransaction(): UnsignedTransaction;
    attach(address: string): GetterSetter;
    connect(signer: Signer): GetterSetterFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): GetterSetter;
}
