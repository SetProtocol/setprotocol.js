import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { AggregatorProxy } from "./AggregatorProxy";
export declare class AggregatorProxyFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_aggregator: string): Promise<AggregatorProxy>;
    getDeployTransaction(_aggregator: string): UnsignedTransaction;
    attach(address: string): AggregatorProxy;
    connect(signer: Signer): AggregatorProxyFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): AggregatorProxy;
}
