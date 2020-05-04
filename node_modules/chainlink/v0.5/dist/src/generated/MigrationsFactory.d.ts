import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { Migrations } from "./Migrations";
export declare class MigrationsFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(): Promise<Migrations>;
    getDeployTransaction(): UnsignedTransaction;
    attach(address: string): Migrations;
    connect(signer: Signer): MigrationsFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): Migrations;
}
