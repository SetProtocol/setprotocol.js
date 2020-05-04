import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { MaliciousRequester } from "./MaliciousRequester";
export declare class MaliciousRequesterFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_link: string, _oracle: string): Promise<MaliciousRequester>;
    getDeployTransaction(_link: string, _oracle: string): UnsignedTransaction;
    attach(address: string): MaliciousRequester;
    connect(signer: Signer): MaliciousRequesterFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): MaliciousRequester;
}
