import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { EmptyOracle } from "./EmptyOracle";
export declare class EmptyOracleFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(): Promise<EmptyOracle>;
    getDeployTransaction(): UnsignedTransaction;
    attach(address: string): EmptyOracle;
    connect(signer: Signer): EmptyOracleFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): EmptyOracle;
}
