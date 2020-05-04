import Web3 from 'web3';
import { Address, Tx } from '../../types/common';
import { BigNumber } from '../../util';
/**
 * @title  VaultAPI
 * @author Set Protocol
 *
 * The Vault API handles all functions on the Vault smart contract.
 *
 */
export declare class ERC20Wrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Gets balance of the ERC20 token
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @param  userAddress   Address of the user
     * @return               The balance of the ERC20 token
     */
    balanceOf(tokenAddress: Address, userAddress: Address): Promise<BigNumber>;
    /**
     * Gets name of the ERC20 token
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @return               The name of the ERC20 token
     */
    name(tokenAddress: Address): Promise<string>;
    /**
     * Gets balance of the ERC20 token
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @return               The symbol of the ERC20 token
     */
    symbol(tokenAddress: Address): Promise<string>;
    /**
     * Gets the total supply of the ERC20 token
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @return               The symbol of the ERC20 token
     */
    totalSupply(tokenAddress: Address): Promise<BigNumber>;
    /**
     * Gets decimals of the ERC20 token
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @param  userAddress   Address of the user
     * @return               The decimals of the ERC20 token
     */
    decimals(tokenAddress: Address): Promise<BigNumber>;
    /**
     * Gets the allowance of the spender by the owner account
     *
     * @param  tokenAddress      Address of the token
     * @param  ownerAddress      Address of the owner
     * @param  spenderAddress    Address of the spender
     * @return                   The allowance of the spender
     */
    allowance(tokenAddress: Address, ownerAddress: Address, spenderAddress: Address): Promise<BigNumber>;
    /**
     * Asynchronously transfer value denominated in the specified ERC20 token to
     * the address specified.
     *
     * @param  tokenAddress   The address of the token being used.
     * @param  to             To whom the transfer is being made.
     * @param  value          The amount being transferred.
     * @param  txOpts         Any parameters necessary to modify the transaction.
     * @return                The hash of the resulting transaction.
     */
    transfer(tokenAddress: Address, to: Address, value: BigNumber, txOpts?: Tx): Promise<string>;
    /**
     * Asynchronously transfer the value amount in the token specified so long
     * as the sender of the message has received sufficient allowance on behalf
     * of `from` to do so.
     *
     * @param  tokenAddress   The address of the token being used.
     * @param  from           From whom are the funds being transferred.
     * @param  to             To whom are the funds being transferred.
     * @param  value          The amount to be transferred.
     * @param  txOpts         Any parameters necessary to modify the transaction.
     * @return                The hash of the resulting transaction.
     */
    transferFrom(tokenAddress: Address, from: Address, to: Address, value: BigNumber, txOpts?: Tx): Promise<string>;
    /**
     * Asynchronously approves the value amount of the spender from the owner
     *
     * @param  tokenAddress         the address of the token being used.
     * @param  spenderAddress       the spender.
     * @param  value                the amount to be approved.
     * @param  txOpts               any parameters necessary to modify the transaction.
     * @return                      the hash of the resulting transaction.
     */
    approve(tokenAddress: Address, spenderAddress: Address, value: BigNumber, txOpts?: Tx): Promise<string>;
}
