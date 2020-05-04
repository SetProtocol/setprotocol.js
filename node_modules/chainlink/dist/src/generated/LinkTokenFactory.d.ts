import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { LinkToken } from "./LinkToken";
export declare class LinkTokenFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(): Promise<LinkToken>;
    getDeployTransaction(): UnsignedTransaction;
    attach(address: string): LinkToken;
    connect(signer: Signer): LinkTokenFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): LinkToken;
}
