import Web3 from 'web3';
import { Assertions } from '../assertions';
import { CoreWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { Address, SetProtocolConfig, SetUnits, Tx } from '../types/common';
/**
 * @title FactoryAPI
 * @author Set Protocol
 *
 * A library for deploying new Set contracts
 */
export declare class FactoryAPI {
    private web3;
    private assert;
    private core;
    private erc20;
    private rebalancingSetTokenFactoryAddress;
    private setTokenFactoryAddress;
    /**
     * Instantiates a new FactoryAPI instance that contains methods for creating new Sets
     *
     * @param web3                      Web3.js Provider instance you would like the SetProtocol.js library to use
     *                                    for interacting with the Ethereum network
     * @param core                      An instance of CoreWrapper to interact with the deployed Core contract
     * @param assertions                An instance of the Assertion library
     * @param config                    Object conforming to SetProtocolConfig interface with contract addresses
     */
    constructor(web3: Web3, core: CoreWrapper, assertions: Assertions, config: SetProtocolConfig);
    /**
     * Calculates the minimum allowable natural unit for a list of ERC20 component addresses
     *
     * @param components        List of ERC20 token addresses to use for Set creation
     * @return                  Minimum natural unit allowed
     */
    calculateMinimumNaturalUnitAsync(components: Address[]): Promise<BigNumber>;
    /**
     * Helper for `calculateSetUnits` when a list of decimals is not available and needs to be fetched. Calculates unit
     * and naturalUnit inputs for `createSetAsync` for a given list of ERC20 token addreses, proportions of each, current
     * token prices, and target Set price
     *
     * @param components      List of ERC20 token addresses to use for Set creation
     * @param prices          List of current prices for the components in index order
     * @param proportions     Decimal-formatted allocations in index order. Must add up to 1
     * @param targetPrice     Target fiat-denominated price of a single natural unit of the Set
     * @param percentError    Allowable price error percentage of resulting Set price from the target price
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
     * @param percentError    Allowable price error percentage of resulting Set price from the target price
     * @return                Object conforming to `SetUnits` containing a list of component units in index order and a
     *                          valid natural unit. These properties can be passed directly into `createSetAsync`
     */
    calculateSetUnits(components: Address[], decimals: number[], prices: BigNumber[], proportions: BigNumber[], targetPrice: BigNumber, percentError?: number): SetUnits;
    /**
     * Create a new Set by passing in parameters denoting component token addresses, quantities, natural
     * unit, and ERC20 properties
     *
     * Note: the return value is the transaction hash of the createSetAsync call, not the deployed SetToken
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
     * contract address. Use `getSetAddressFromCreateTxHashAsync` to retrieve the SetToken address
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
     * Fetch a Set Token address from a createSetAsync transaction hash
     *
     * @param  txHash    Transaction hash of the createSetAsync transaction
     * @return           Address of the newly created Set
     */
    getSetAddressFromCreateTxHash(txHash: string): Promise<Address>;
    /**
     * Fetch the component decimals from the chain
     *
     * @param componentAddresses    List of ERC20 token addresses
     * @return                      List of component decimals
     */
    private getComponentsDecimalsAsync;
    /**
     * Fetch the decimals for one ERC20 token
     *
     * @param componentAddress    ERC20 token addresses
     * @return                    Token decimals
     */
    private getComponentDecimals;
    /**
     * Calculates the target amount of tokens required for a Set with a target price
     *
     * @param components     List of ERC20 token addresses to use for Set creation
     * @param decimals       List of decimals for the components in index order
     * @param prices         List of current prices for the components in index order
     * @param proportions    Decimal-formatted allocations in index order. Must add up to 1
     * @param targetPrice    Target fiat-denominated price of a single natural unit of the Set
     * @return               Returns array of BigNumbers representing the minimum required units
     */
    private calculateRequiredComponentUnits;
    /**
     * Calculate a Set price for given component and Set properties. This is used to verify the total Set price
     * when assigning a natural unit to a list of components
     *
     * @param componentUnits    List of ERC20 token addresses to use for Set creation in index order
     * @param naturalUnit       Proposed natural unit for the component units
     * @param prices            Current price of the component tokens in index order
     * @param targetPrice       Target fiat-denominated price of a single natural unit of the Set
     * @return                  Returns the calculcated price from all of the component and Set data
     */
    private calculateSetPrice;
    /**
     * Calculates the natural unit from the smallest decimal in a list of token component decimals
     *
     * @param decimal           Smallest decimal for a list of component token decimals
     * @return                  Natural unit
     */
    calculateNaturalUnit(decimal: BigNumber): BigNumber;
    private assertCalculateCreateUnitInputs;
    private assertCreateSet;
    private assertCreateRebalancingSet;
}
