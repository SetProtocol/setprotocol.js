import Web3 from 'web3';
import { Address, Tx } from '../../types/common';
import { BigNumber } from '../../util';
/**
 * @title CoreWrapper
 * @author Set Protocol
 *
 * The Core API handles all functions on the Core SetProtocol smart contract.
 *
 */
export declare class CoreWrapper {
    private web3;
    private contracts;
    coreAddress: Address;
    transferProxyAddress: Address;
    vaultAddress: Address;
    constructor(web3: Web3, coreAddress: Address, transferProxyAddress: Address, vaultAddress: Address);
    /**
     * Create a new Set, specifying the components, units, name, symbol to use.
     *
     * @param  factoryAddress Set Token factory address of the token being created
     * @param  components     Component token addresses
     * @param  units          Units of corresponding token components
     * @param  naturalUnit    Supplied as the lowest common denominator for the Set
     * @param  name           User-supplied name for Set (i.e. "DEX Set")
     * @param  symbol         User-supplied symbol for Set (i.e. "DEX")
     * @param  callData       Additional call data used to create different Sets
     * @param  txOpts         The options for executing the transaction
     * @return                A transaction hash to then later look up for the Set address
     */
    create(factoryAddress: Address, components: Address[], units: BigNumber[], naturalUnit: BigNumber, name: string, symbol: string, callData: string, txOpts?: Tx): Promise<string>;
    /**
     * Asynchronously issues a particular quantity of tokens from a particular Sets
     *
     * @param  setAddress     Set token address of Set being issued
     * @param  quantity       Number of Sets a user wants to issue in base units
     * @param  txOpts         The options for executing the transaction
     * @return                A transaction hash to then later look up
     */
    issue(setAddress: Address, quantity: BigNumber, txOpts?: Tx): Promise<string>;
    /**
     * Asynchronously redeems a particular quantity of tokens from a particular Sets
     *
     * @param  setAddress     Set token address of Set being issued
     * @param  quantity       Number of Sets a user wants to redeem in base units
     * @param  txOpts         The options for executing the transaction
     * @return                A transaction hash to then later look up
     */
    redeem(setAddress: Address, quantity: BigNumber, txOpts?: Tx): Promise<string>;
    /**
     * Redeem and withdraw with a single transaction
     *
     * Normally, you should expect to be able to withdraw all of the tokens.
     * However, some have central abilities to freeze transfers (e.g. EOS). The parameter toExclude
     * allows you to optionally specify which component tokens to remain under the user's
     * address in the vault. The rest will be transferred to the user.
     *
     * @param  setAddress        The address of the Set token
     * @param  quantity          Number of Sets a user wants to redeem in base units
     * @param  toExclude         Bitmask of component indexes to exclude from withdrawal
     * @param  txOpts            The options for executing the transaction
     * @return                   A transaction hash to then later look up
     */
    redeemAndWithdrawTo(setAddress: Address, quantity: BigNumber, toExclude: BigNumber, txOpts?: Tx): Promise<string>;
    /**
     * Asynchronously deposits tokens to the vault
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @param  quantity      Number of tokens a user wants to deposit into the vault in base units
     * @param  txOpts        The options for executing the transaction
     * @return               A transaction hash
     */
    deposit(tokenAddress: Address, quantity: BigNumber, txOpts?: Tx): Promise<string>;
    /**
     * Asynchronously withdraw tokens from the vault
     *
     * @param  tokenAddress  Address of the ERC20 token
     * @param  quantity      Number of tokens a user wants to withdraw from the vault in base units
     * @param  txOpts        The options for executing the transaction
     * @return               A transaction hash
     */
    withdraw(tokenAddress: Address, quantity: BigNumber, txOpts?: Tx): Promise<string>;
    /**
     * Asynchronously batch deposits tokens to the vault
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens user wants to deposit into the vault
     * @param  quantities        Numbers of tokens a user wants to deposit into the vault in base units
     * @param  txOpts            The options for executing the transaction
     * @return                   A transaction hash
     */
    batchDeposit(tokenAddresses: Address[], quantities: BigNumber[], txOpts?: Tx): Promise<string>;
    /**
     * Asynchronously batch withdraws tokens from the vault
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens user wants to withdraw from the vault
     * @param  quantities        Numbers of tokens a user wants to withdraw from the vault
     * @param  txOpts            The options for executing the transaction
     * @return                   A transaction hash
     */
    batchWithdraw(tokenAddresses: Address[], quantities: BigNumber[], txOpts?: Tx): Promise<string>;
    /**
     * Asynchronously gets the exchange address for a given exhange id
     *
     * @param  exchangeId Enum id of the exchange
     * @return            An exchange address
     */
    exchangeIds(exchangeId: number): Promise<Address>;
    /**
     * Asynchronously gets the transfer proxy address
     *
     * @return Transfer proxy address
     */
    transferProxy(): Promise<Address>;
    /**
     * Asynchronously gets the vault address
     *
     * @return Vault address
     */
    vault(): Promise<Address>;
    /**
     * Fetch the addresses of SetTokens and RebalancingSetTokens created by the system
     * of contracts specified in SetProtcolConfig
     *
     * @return Array of SetToken and RebalancingSetToken addresses
     */
    setTokens(): Promise<Address[]>;
    /**
     * Fetch the current Operation State of the protocol
     *
     * @return Operation state of the protocol
     */
    operationState(): Promise<BigNumber>;
    /**
     * Verifies that the provided Module is enabled
     *
     * @param  moduleAddress  Address of the module contract
     * @return                Whether the module contract is enabled
     */
    validModules(moduleAddress: Address): Promise<boolean>;
    /**
     * Verifies that the provided price library is enabled
     *
     * @param  priceLibraryAddress  Address of the price library contract
     * @return                Whether the price library contract is enabled
     */
    validPriceLibrary(priceLibraryAddress: Address): Promise<boolean>;
    /**
     * Verifies that the provided SetToken factory is enabled for creating a new SetToken
     *
     * @param  factoryAddress Address of the factory contract
     * @return                Whether the factory contract is enabled
     */
    validFactories(factoryAddress: Address): Promise<boolean>;
    /**
     * Verifies that the provided SetToken or RebalancingSetToken address is enabled
     * for issuance and redemption
     *
     * @param  setAddress Address of the SetToken or RebalancingSetToken contract
     * @return            Whether the contract is enabled
     */
    validSets(setAddress: Address): Promise<boolean>;
    /**
     * Fetch the addresses of Modules enabled in the system.
     *
     * @return            A list of the enabled modules
     */
    modules(): Promise<Address[]>;
    /**
     * Fetch the addresses of Factories enabled in the system.
     *
     * @return            A list of the enabled Factories
     */
    factories(): Promise<Address[]>;
    /**
     * Fetch the addresses of Exchanges enabled in the system.
     *
     * @return            A list of the enabled Exchanges
     */
    exchanges(): Promise<Address[]>;
    /**
     * Fetch the addresses of PriceLibraries enabled in the system.
     *
     * @return            A list of the enabled PriceLibraries
     */
    priceLibraries(): Promise<Address[]>;
}
