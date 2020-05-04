import { Assertions } from '../assertions';
import { CoreWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { Address, Tx } from '../types/common';
/**
 * @title AccountingAPI
 * @author Set Protocol
 *
 * A library for managing ERC20 token and Set balances for users throughout the SetProtocol system
 */
export declare class AccountingAPI {
    private assert;
    private core;
    /**
     * Instantiates a new AccountingAPI instance that contains methods for transferring balances in the vault
     *
     * @param core        An instance of CoreWrapper to interact with the deployed Core contract
     * @param assertions  An instance of the Assertion library
     */
    constructor(core: CoreWrapper, assertions: Assertions);
    /**
     * Deposits tokens into the vault under the signer's address that can be used to issue a Set. Uses a different
     * transaction method depending on number of tokens to deposit in order to save gas
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens to deposit into the vault
     * @param  quantities        Amount of each token to deposit into the vault in index order with `tokenAddresses`
     * @param  txOpts            Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                   Transaction hash
     */
    depositAsync(tokenAddresses: Address[], quantities: BigNumber[], txOpts: Tx): Promise<string>;
    /**
     * Withdraws tokens from the vault belonging to the signer. Uses a different transaction method depending on
     * number of tokens to withdraw in order to save gas
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens to withdraw from the vault
     * @param  quantities        Amount of each token token to withdraw from vault in index order with `tokenAddresses`
     * @param  txOpts            Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                   Transaction hash
     */
    withdrawAsync(tokenAddresses: Address[], quantities: BigNumber[], txOpts: Tx): Promise<string>;
    private assertDeposit;
    private assertWithdraw;
}
