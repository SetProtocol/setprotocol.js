import Web3 from 'web3';
import { CoreWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { Address, Bytes, SetProtocolConfig, SystemAuthorizableState, SystemOwnableState, SystemTimeLockPeriodState } from '../types/common';
/**
 * @title SystemAPI
 * @author Set Protocol
 *
 * A library for interacting with admin portions of Set Protocol system
 */
export declare class SystemAPI {
    private web3;
    private contract;
    private config;
    private core;
    private authorizable;
    private timeLockUpgrade;
    private whitelist;
    private addressToAddressWhiteList;
    /**
     * Instantiates a new SystemAPI instance that contains methods for viewing the system-related state of
     * the protocol
     *
     * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param core        An instance of CoreWrapper to interact with the deployed Core contract
     */
    constructor(web3: Web3, core: CoreWrapper, config: SetProtocolConfig);
    /**
     * Fetches the operational state of Set Protocol. 0 is operational. 1 is shut down.
     *
     * @return               Operational State represented as a number
     */
    getOperationStateAsync(): Promise<BigNumber>;
    /**
     * Fetches the authorizable addresses of the transfer proxy and vault.
     *
     * @return               System Authorizable state object
     */
    getSystemAuthorizableStateAsync(): Promise<SystemAuthorizableState>;
    /**
     * Fetches the time lock periods of the contracts that have time lock upgrade functions.
     * These contracts include core, vault, transfer proxy, and issuance order module.
     *
     * @return               Object containing the current time lock periods.
     */
    getSystemTimeLockPeriodsAsync(): Promise<SystemTimeLockPeriodState>;
    /**
     * Fetches time lock upgrade hash given a transaction hash. The timelock upgrade hash
     * is composed of the msg.data of a transaction. It is the first four bytes of the function
     * appended with the call data.
     *
     * @param transactionHash    The hash of the upgrade proposal transaction
     * @return               The hash of the time lock upgrade hash
     */
    getTimeLockUpgradeHashAsync(transactionHash: string): Promise<Bytes>;
    /**
     * Fetches time lock upgrade initialization timestamp based on contract address and timelock upgrade hash.
     *
     * @param contractAddress        The hash of the upgrade proposal transaction
     * @param timeLockUpgradeHash    The hash of the time lock upgrade hash
     * @return               Timestamp that the upgrade was initiated
     */
    getTimeLockedUpgradeInitializationAsync(contractAddress: Address, timeLockUpgradeHash: Bytes): Promise<BigNumber>;
    /**
     * Fetches the owners of the system.
     * These contracts include core, vault, transfer proxy, and issuance order module.
     *
     * @return               Object containing the contract owners.
     */
    getSystemOwnersAsync(): Promise<SystemOwnableState>;
    /**
     * Fetches a list of whitelisted addresses on the whitelist contract.
     *
     * @param whitelistAddress    The address of the whitelist contract
     * @return               An array of whitelisted addresses
     */
    getWhitelistedAddressesAsync(whitelistAddress: Address): Promise<Address[]>;
    /**
     * Fetches value type addresses from keys on an AddressToAddressWhiteList contract.
     *
     * @param whitelistAddress    The address of the whitelist contract
     * @param keys                The array of key type addresses
     * @return                    An array of value type addresses
     */
    getWhitelistedValuesAsync(whitelistAddress: Address, keys: Address[]): Promise<Address[]>;
    /**
     * Fetch the addresses of Modules enabled in the system.
     *
     * @return            A list of the enabled modules
     */
    getModulesAsync(): Promise<Address[]>;
    /**
     * Fetch the addresses of Factories enabled in the system.
     *
     * @return            A list of the enabled Factories
     */
    getFactoriesAsync(): Promise<Address[]>;
    getExchangesAsync(): Promise<Address[]>;
    /**
     * Fetch the addresses of PriceLibraries enabled in the system.
     *
     * @return            A list of the enabled PriceLibraries
     */
    getPriceLibrariesAsync(): Promise<Address[]>;
}
