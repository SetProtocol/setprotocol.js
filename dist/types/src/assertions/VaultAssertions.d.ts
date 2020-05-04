import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import { BigNumber } from '../util';
export declare class VaultAssertions {
    private web3;
    constructor(web3: Web3);
    /**
     * Throws if the Vault doesn't have enough of token
     *
     * @param  vaultAddress     The address of the Vault contract
     * @param  tokenAddress     The address of the Set token contract
     * @param  ownerAddress     Address of owner withdrawing from vault
     * @param  quantity         Amount of a Set in base units
     * @return                  Void Promise
     */
    hasSufficientTokenBalance(vaultAddress: Address, tokenAddress: Address, ownerAddress: Address, quantity: BigNumber): Promise<void>;
    /**
     * Throws if the Set doesn't have a sufficient balance for its tokens in the Vault
     *
     * @param  vaultAddress     The address of the Vault contract
     * @param  setAddress       The address of the Set token contract
     * @param  quantity         Amount of a Set in base units
     * @return                  Void Promise
     */
    hasSufficientSetTokensBalances(vaultAddress: Address, setTokenAddress: Address, quantity: BigNumber): Promise<void>;
}
