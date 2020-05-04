import Contract from '../artifacts/Contract';
import { TxParams } from '../artifacts/ZWeb3';
export default function copyContract(contract: Contract, address: string, txParams?: TxParams): Promise<Contract>;
