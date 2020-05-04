import { Provider } from 'web3/providers';
import { ERC20API, ExchangeIssuanceAPI, OracleAPI, PriceFeedAPI, RebalancingAPI, RebalancingManagerAPI, RebalancingSetIssuanceAPI, SetTokenAPI, SocialTradingAPI, SystemAPI } from './api';
import { BigNumber } from './util';
import { Address, SetProtocolConfig, SetUnits, TransactionReceipt, Tx } from './types/common';
/**
 * @title SetProtocol
 * @author Set Protocol
 *
 * The SetProtocol class that exposes all functionality for interacting with the SetProtocol smart contracts.
 * Methods that require interaction with the Ethereum blockchain are exposed after instantiating a new instance
 * of SetProtocol with the web3 provider argument
 */
declare class SetProtocol {
    private web3;
    private core;
    private vault;
    private accounting;
    private factory;
    private issuance;
    private blockchain;
    /**
     * When creating an issuance order without a relayer token for a fee, you must use Solidity
     * address null type (as opposed to Javascript's `null`, `undefined` or empty string).
     */
    static NULL_ADDRESS: any;
    /**
     * An instance of the ERC20API class containing methods for interacting with ERC20 compliant token contracts
     */
    erc20: ERC20API;
    /**
     * An instance of the ExchangeIssuanceAPI class containing methods for interacting
     * with ExchangeIssuance contracts
     */
    exchangeIssuance: ExchangeIssuanceAPI;
    /**
     * An instance of the PriceFeedAPI class containing methods for interacting
     * with various Price Feed contracts and their data sources
     */
    priceFeed: PriceFeedAPI;
    /**
     * An instance of the RebalancingAPI class containing methods for rebalancing Sets
     */
    rebalancing: RebalancingAPI;
    /**
     * An instance of the RebalancingSetIssuanceAPI class containing methods for rebalancing Set issuances.
     */
    rebalancingSetIssuance: RebalancingSetIssuanceAPI;
    /**
     * An instance of the RebalancingManagerAPI class containing methods for interacting with Rebalancing Manager
     */
    rebalancingManager: RebalancingManagerAPI;
    /**
     * An instance of the SetTokenAPI class containing methods for interacting with SetToken contracts
     */
    setToken: SetTokenAPI;
    /**
     * An instance of the SocialTradingAPI class containing methods for interacting with RebalancingSet Trading Pools
     */
    socialTrading: SocialTradingAPI;
    /**
     * An instance of the SystemAPI class containing methods for interacting with system state
     */
    system: SystemAPI;
    /**
     * An instance of the OracleAPI class containing methods for interacting with Medianzer and Moving Average Oracles
     */
    oracle: OracleAPI;
    /**
     * Instantiates a new SetProtocol instance that provides the public interface to the SetProtocol.js library
     *
     * @param provider    Provider instance you would like the SetProtocol.js library to use for interacting with the
     *                      Ethereum network
     * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    constructor(provider: Provider, config: SetProtocolConfig);
    /**
     * Calculates the minimum allowable natural unit for a list of ERC20 token addresses
     * where the minimum natural unit allowed is equal to `10 ** (18 - minimumDecimal)`. `minimumDecimal`
     * is the smallest decimal amongst the tokens passed in
     *
     * @param components            List of ERC20 token addresses to use for Set creation
     * @return                      Minimum natural unit allowed for the component tokens
     */
    calculateMinimumNaturalUnitAsync(components: Address[]): Promise<BigNumber>;
    /**
     * Helper for `calculateSetUnits` when a list of decimals is not available and needs to be fetched. Calculates unit
     * and naturalUnit inputs for `createSetAsync` for a given list of ERC20 token addreses, proportions of each, current
     * token prices, and target Set price
     *
     * Note: the target price may not be achievable with the lowest viable natural unit. Precision is achieved by
     * increasing the magnitude of natural unit up to `10 ** 18` and recalculating the component units. Defaults to
     * 10 percent
     *
     * @param components      List of ERC20 token addresses to use for Set creation
     * @param prices          List of current prices for the components in index order
     * @param proportions     Decimal-formatted allocations in index order. Must add up to 1
     * @param targetPrice     Target fiat-denominated price of a single natural unit of the Set
     * @param percentError    Allowable price error percentage of resulting Set price from the target price input
     * @return                Object conforming to `SetUnits` containing a list of component units in index order and a
     *                          valid natural unit. These properties can be passed directly into `createSetAsync`
     */
    calculateSetUnitsAsync(components: Address[], prices: BigNumber[], proportions: BigNumber[], targetPrice: BigNumber, percentError?: number): Promise<SetUnits>;
    /**
     * Calculates unit and naturalUnit inputs for `createSetAsync` for a given list of ERC20 token addreses, their
     * decimals, proportions of each, current token prices, and target Set price
     *
     * @param components      List of ERC20 token addresses to use for Set creation
     * @param decimals        List of decimals for the components in index order
     * @param prices          List of current prices for the components in index order
     * @param proportions     Decimal-formatted allocations in index order. Must add up to 1
     * @param targetPrice     Target fiat-denominated price of a single natural unit of the Set
     * @param percentError    Allowable price error percentage of resulting Set price from the target price input
     * @return                Object conforming to `SetUnits` containing a list of component units in index order and a
     *                          valid natural unit. These properties can be passed directly into `createSetAsync`
     */
    calculateSetUnits(components: Address[], decimals: number[], prices: BigNumber[], proportions: BigNumber[], targetPrice: BigNumber, percentError?: number): SetUnits;
    /**
     * Create a new Set by passing in parameters denoting component token addresses, quantities, natural
     * unit, and ERC20 properties
     *
     * Note: the return value is the transaction hash of the `createSetAsync` call, not the deployed SetToken
     * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the SetToken address
     *
     * @param  components     Component ERC20 token addresses
     * @param  units          Units of each component in Set paired in index order
     * @param  naturalUnit    Lowest common denominator for the Set
     * @param  name           Name for Set, i.e. "DEX Set"
     * @param  symbol         Symbol for Set, i.e. "DEX"
     * @param  txOpts         Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                Transaction hash
     */
    createSetAsync(components: Address[], units: BigNumber[], naturalUnit: BigNumber, name: string, symbol: string, txOpts: Tx): Promise<string>;
    /**
     * Create a new Rebalancing token by passing in parameters denoting a Set to track, the manager, and various
     * rebalancing properties to facilitate rebalancing events
     *
     * Note: the return value is the transaction hash of the createRebalancingSetTokenAsync call, not the deployed Token
     * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the RebalancingSetToken address
     *
     * @param  manager              Address of account to propose, rebalance, and settle the Rebalancing token
     * @param  initialSet           Address of the Set the Rebalancing token is initially tracking
     * @param  initialUnitShares    Ratio between balance of this Rebalancing token and the currently tracked Set
     * @param  proposalPeriod       Duration after a manager proposes a new Set to rebalance into when users who wish to
     *                                pull out may redeem their balance of the RebalancingSetToken for balance of the Set
     *                                denominated in seconds
     * @param  rebalanceInterval    Duration after a rebalance is completed when the manager cannot initiate a new
     *                                Rebalance event
     * @param  name                 Name for RebalancingSet, i.e. "Top 10"
     * @param  symbol               Symbol for Set, i.e. "TOP10"
     * @param  txOpts               Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                      Transaction hash
     */
    createRebalancingSetTokenAsync(manager: Address, initialSet: Address, initialUnitShares: BigNumber, proposalPeriod: BigNumber, rebalanceInterval: BigNumber, name: string, symbol: string, txOpts: Tx): Promise<string>;
    /**
     * Issues a Set to the transaction signer. Must have component tokens in the correct quantites in either
     * the vault or in the signer's wallet. Component tokens must be approved to the Transfer
     * Proxy contract via setTransferProxyAllowanceAsync
     *
     * @param  setAddress    Address Set to issue
     * @param  quantity      Amount of Set to issue. Must be multiple of the natural unit of the Set
     * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return               Transaction hash
     */
    issueAsync(setAddress: Address, quantity: BigNumber, txOpts: Tx): Promise<string>;
    /**
     * Redeems a Set to the transaction signer, returning the component tokens to the signer's wallet. Use `false` for
     * `withdraw` to leave redeemed components in vault under the user's address to save gas if rebundling into another
     * Set with similar components
     *
     * @param  setAddress         Address of Set to issue
     * @param  quantity           Amount of Set to redeem. Must be multiple of the natural unit of the Set
     * @param  withdraw           Boolean to withdraw back to signer's wallet or leave in vault. Defaults to true
     * @param  tokensToExclude    Token addresses to exclude from withdrawal
     * @param  txOpts             Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                    Transaction hash
     */
    redeemAsync(setAddress: Address, quantity: BigNumber, withdraw: boolean, tokensToExclude: Address[], txOpts: Tx): Promise<string>;
    /**
     * Deposits tokens into the vault under the signer's address that can be used to issue a Set
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens to deposit into the vault
     * @param  quantities        Amount of each token to deposit into the vault in index order with `tokenAddresses`
     * @param  txOpts            Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                   Transaction hash
     */
    depositAsync(tokenAddresses: Address[], quantities: BigNumber[], txOpts: Tx): Promise<string>;
    /**
     * Withdraws tokens from the vault belonging to the signer
     *
     * @param  tokenAddresses    Addresses of ERC20 tokens to withdraw from the vault
     * @param  quantities        Amount of each token token to withdraw from vault in index order with `tokenAddresses`
     * @param  txOpts            Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                   Transaction hash
     */
    withdrawAsync(tokenAddresses: Address[], quantities: BigNumber[], txOpts: Tx): Promise<string>;
    /**
     * Sets the TransferProxy contract's allowance to a specified quantity on behalf of the signer. Allowance is
     * required for issuing, redeeming, and filling issuance orders
     *
     * @param   tokenAddress    Address of token contract to approve (typically SetToken or ERC20)
     * @param   quantity        Allowance quantity
     * @param   txOpts          Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                  Transaction hash
     */
    setTransferProxyAllowanceAsync(tokenAddress: string, quantity: BigNumber, txOpts: Tx): Promise<string>;
    /**
     * Sets the TransferProxy contract's allowance to the maximum amount on behalf of the signer. Allowance is
     * required for issuing, redeeming, and filling issuance orders
     *
     * @param  tokenAddress    Address of contract to approve (typically SetToken or ERC20)
     * @param  txOpts          Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                 Transaction hash
     */
    setUnlimitedTransferProxyAllowanceAsync(tokenAddress: string, txOpts: Tx): Promise<string>;
    /**
     * Fetch the balance of the provided token contract address inside the Vault
     *
     * @param  tokenAddress    Address of the token contract (typically SetToken or ERC20)
     * @param  ownerAddress    Address of the token owner
     * @return                 Balance of the contract in the vault
     */
    getBalanceInVaultAsync(tokenAddress: Address, ownerAddress: Address): Promise<BigNumber>;
    /**
     * Fetch a Set Token address from a createSetAsync transaction hash
     *
     * @param  txHash    Transaction hash of the `createSetAsync` transaction
     * @return           Address of the newly created Set
     */
    getSetAddressFromCreateTxHashAsync(txHash: string): Promise<Address>;
    /**
     * Fetch the addresses of all SetTokens and RebalancingSetTokens
     *
     * @return    Array of SetToken and RebalancingSetToken addresses
     */
    getSetAddressesAsync(): Promise<Address[]>;
    /**
     * Verifies that the provided factory address is enabled for creating new Sets
     *
     * @param  factoryAddress    Address of the factory contract
     * @return                   Whether the factory contract is enabled
     */
    isValidFactoryAsync(factoryAddress: Address): Promise<boolean>;
    /**
     * Verifies that the provided SetToken or RebalancingSetToken address is enabled
     * for issuance and redemption
     *
     * @param  setAddress    Address of the SetToken or RebalancingSetToken contract
     * @return               Whether the contract is enabled for transacting
     */
    isValidSetAsync(setAddress: Address): Promise<boolean>;
    /**
     * Polls the Ethereum blockchain until the specified transaction has been mined or
     * the timeout limit is reached, whichever occurs first
     *
     * @param  txHash               Transaction hash to poll
     * @param  pollingIntervalMs    Interval at which the blockchain should be polled
     * @param  timeoutMs            Number of milliseconds until this process times out. If no value is provided, a
     *                                default value is used
     * @return                      Transaction receipt resulting from the mining process
     */
    awaitTransactionMinedAsync(txHash: string, pollingIntervalMs?: number, timeoutMs?: number): Promise<TransactionReceipt>;
}
export default SetProtocol;
