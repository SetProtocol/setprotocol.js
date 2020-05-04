import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { Ownable } from "./Ownable";
export declare class OwnableFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(): Promise<Ownable>;
    getDeployTransaction(): UnsignedTransaction;
    attach(address: string): Ownable;
    connect(signer: Signer): OwnableFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): Ownable;
}
