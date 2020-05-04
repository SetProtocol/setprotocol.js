import Web3 from 'web3';
import { BigNumber } from '../../util';
import { Address } from '../../types/common';
/**
 * @title  VaultWrapper
 * @author Set Protocol
 *
 * The Vault API handles all functions on the Vault smart contract.
 *
 */
export declare class VaultWrapper {
    private web3;
    private contracts;
    private vaultAddress;
    constructor(web3: Web3, vaultAddress: Address);
    /**
     * Fetch the balance of the provided contract address inside the vault specified
     * in SetProtocolConfig
     *
     * @param  tokenAddress Address of the contract (typically SetToken or ERC20)
     * @param  ownerAddress Address of the user
     * @return              The balance of the user's Set
     */
    getBalanceInVault(tokenAddress: Address, ownerAddress: Address): Promise<BigNumber>;
}
