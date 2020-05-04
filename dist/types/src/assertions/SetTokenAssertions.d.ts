import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import { BigNumber } from '../util';
export declare class SetTokenAssertions {
    private web3;
    private erc20Assertions;
    constructor(web3: Web3);
    /**
     * Throws if the given candidateContract does not respond to some methods from the Set Token interface.
     *
     * @param  setTokenAddress  A Set Token contract address to check
     */
    implementsSetToken(setTokenAddress: Address): Promise<void>;
    /**
     * Throws if the given user doesn't have a sufficient balance for a component token in a Set
     *
     * @param  setTokenAddress  The address of the Set Token contract
     * @param  ownerAddress     The address of the owner
     * @param  quantity         Amount of a Set in base units
     * @param  exclusions       The addresses to exclude from checking
     */
    hasSufficientBalances(setTokenAddress: Address, ownerAddress: Address, quantity: BigNumber, exclusions?: Address[]): Promise<void>;
    /**
     * Throws if the given user doesn't have a sufficient allowance for a component token in a Set
     *
     * @param  setTokenAddress  The address of the Set Token contract
     * @param  ownerAddress     The address of the owner
     * @param  quantity         Amount of a Set in base units
     */
    hasSufficientAllowances(setTokenAddress: Address, ownerAddress: Address, spenderAddress: Address, quantity: BigNumber, exclusions?: Address[]): Promise<void>;
    isMultipleOfNaturalUnit(setTokenAddress: Address, quantity: BigNumber, quantityType: string): Promise<void>;
    isComponent(setTokenAddress: Address, componentAddress: Address): Promise<void>;
    isValidSetToken(coreAddress: Address, setTokenAddress: Address): Promise<void>;
}
