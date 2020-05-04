import { Address } from 'set-protocol-utils';
import Web3 from 'web3';
import { BigNumber } from '../util';
export declare class ERC20Assertions {
    private web3;
    constructor(web3: Web3);
    /**
     * Throws if the given contract address does not respond to some methods from the ERC20 interface
     */
    implementsERC20(tokenAddress: Address): Promise<void>;
    hasSufficientBalanceAsync(tokenAddress: Address, userAddress: Address, requiredBalance: BigNumber): Promise<void>;
    hasSufficientAllowanceAsync(tokenAddress: Address, ownerAddress: Address, spenderAddress: Address, requiredAllowance: BigNumber): Promise<void>;
}
