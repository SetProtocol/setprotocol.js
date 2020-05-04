import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { Pointer } from "./Pointer";
export declare class PointerFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_addr: string): Promise<Pointer>;
    getDeployTransaction(_addr: string): UnsignedTransaction;
    attach(address: string): Pointer;
    connect(signer: Signer): PointerFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): Pointer;
}
