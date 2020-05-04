import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { Arrayish } from "ethers/utils";
import { BasicConsumer } from "./BasicConsumer";
export declare class BasicConsumerFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(_link: string, _oracle: string, _specId: Arrayish): Promise<BasicConsumer>;
    getDeployTransaction(_link: string, _oracle: string, _specId: Arrayish): UnsignedTransaction;
    attach(address: string): BasicConsumer;
    connect(signer: Signer): BasicConsumerFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): BasicConsumer;
}
