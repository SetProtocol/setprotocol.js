import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { Oracle } from "./Oracle";
export declare class OracleFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_link: string): Promise<Oracle>;
    getDeployTransaction(_link: string): UnsignedTransaction;
    attach(address: string): Oracle;
    connect(signer: Signer): OracleFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): Oracle;
}
