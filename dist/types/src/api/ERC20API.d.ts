import Web3 from 'web3';
import { Assertions } from '../assertions';
import { BigNumber } from '../util';
import { Address, SetProtocolConfig, Tx } from '../types/common';
/**
 * @title ERC20API
 * @author Set Protocol
 *
 * A library for interacting with ERC20 compliant token contracts
 */
export declare class ERC20API {
    private assert;
    private erc20Wrapper;
    private protocolViewerWrapper;
    /**
     * Instantiates a new IssuanceAPI instance that contains methods for transferring balances in the vault
     *
     * @param web3          Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                        with the Ethereum network
     * @param assertions    An instance of the Assertion library
     * @param config        Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    constructor(web3: Web3, assertions: Assertions, config: SetProtocolConfig);
    /**
     * Fetches the user's ERC20 token balance
     *
     * @param  tokenAddress    Address of the ERC20 token
     * @param  userAddress     Wallet address of the user
     * @return                 Balance of the ERC20 token
     */
    getBalanceOfAsync(tokenAddress: Address, userAddress: Address): Promise<BigNumber>;
    /**
     * Fetches an addresses balance of multiple ERC20 tokens
     *
     * @param  tokenAddresses    Address of the ERC20 token
     * @param  userAddress       Wallet address of the user
     * @return                   Balance of the ERC20 token
     */
    getBalancesOfAsync(tokenAddresses: Address[], userAddress: Address): Promise<BigNumber[]>;
    /**
     * Fetches exchange rate stored for a given array of cToken addresses
     *
     * @param  cTokenAddresses    Addresses of the cToken to fetch exchange rates for
     * @return                    Exchange rate of cTokens
     */
    getCTokenExchangeRatesAsync(cTokenAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches token balances for each tokenAddress, userAddress pair
     *
     * @param  tokenAddresses    Addresses of the ERC20 tokens to fetch balances for
     * @param  userAddresses     Addresses of users sequential to tokenAddressesto fetch balances for
     * @return                   Balance of the ERC20 token
     */
    getUsersBalancesOfAsync(tokenAddresses: Address[], userAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches the name of the ERC20 token
     *
     * @param  tokenAddress    Address of the ERC20 token
     * @return                 Name of the ERC20 token
     */
    getNameAsync(tokenAddress: Address): Promise<string>;
    /**
     * Fetches the symbol of the ERC20 token
     *
     * @param  tokenAddress    Address of the ERC20 token
     * @return                 Symbol of the ERC20 token
     */
    getSymbolAsync(tokenAddress: Address): Promise<string>;
    /**
     * Fetches the total supply of the ERC20 token
     *
     * @param  tokenAddress    Address of the ERC20 token
     * @return                 Total supply of the ERC20 token
     */
    getTotalSupplyAsync(tokenAddress: Address): Promise<BigNumber>;
    /**
     * Fetches the total supply of multiple ERC20 token contracts, returned in the
     * order the addresses were submitted to the request
     *
     * @param  tokenAddresses    Addresses of the ERC20 tokens
     * @return                   Total supply property of multiple ERC20 contracts
     */
    getTotalSuppliesAsync(tokenAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches the decimals of the ERC20 token
     *
     * @param  tokenAddress    Address of the ERC20 token
     * @return                 Decimals of the ERC20 token
     */
    getDecimalsAsync(tokenAddress: Address): Promise<BigNumber>;
    /**
     * Fetches the allowance of the spender for the token by the owner
     *
     * @param  tokenAddress      Address of the token
     * @param  ownerAddress      Address of the owner
     * @param  spenderAddress    Address of the spender
     * @return                   Allowance of the spender
     */
    getAllowanceAsync(tokenAddress: Address, ownerAddress: Address, spenderAddress: Address): Promise<BigNumber>;
    /**
     * Transfer balance denominated in the specified ERC20 token to another address
     *
     * @param  tokenAddress    Address of the token to transfer
     * @param  to              Address of the receiver
     * @param  value           Amount being transferred
     * @param  txOpts          Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                 Transaction hash
     */
    transferAsync(tokenAddress: Address, to: Address, value: BigNumber, txOpts: Tx): Promise<string>;
    /**
     * Transfer balance denominated in the specified ERC20 token on behalf of the owner. Caller
     * must have sufficient allowance from owner in order to complete transfer. Use `approveAsync`
     * to grant allowance
     *
     * @param  tokenAddress    Address of the token to transfer
     * @param  from            Token owner
     * @param  to              Address of the receiver
     * @param  value           Amount to be transferred
     * @param  txOpts          Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                 Transaction hash
     */
    transferFromAsync(tokenAddress: Address, from: Address, to: Address, value: BigNumber, txOpts: Tx): Promise<string>;
    /**
     * Approves the specified amount of allowance to the spender on behalf of the signer
     *
     * @param  tokenAddress      Address of the token being used
     * @param  spenderAddress    Address to approve allowance to
     * @param  value             Amount of allowance to grant
     * @param  txOpts            Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                   Transaction hash
     */
    approveAsync(tokenAddress: Address, spenderAddress: Address, value: BigNumber, txOpts: Tx): Promise<string>;
    private assertGetBalanceOf;
    private assertGetBalancesOf;
    private assertGetUsersBalancesOf;
    private assertGetCTokenExchangeRates;
    private assertGetAllowance;
    private assertTransfer;
    private assertTransferFrom;
    private assertApprove;
    private assertGetTotalSuppliesAsync;
}
