import { BigNumber } from '../util';
export declare const erc20AssertionErrors: {
    MISSING_ERC20_METHOD: (address: string) => string;
    INSUFFICIENT_BALANCE: (tokenAddress: string, userAddress: string, currentBalance: BigNumber, requiredBalance: BigNumber) => string;
    INSUFFICIENT_ALLOWANCE: (tokenAddress: string, userAddress: string, spenderAddress: string, currentAllowance: BigNumber, requiredBalance: BigNumber) => string;
};
