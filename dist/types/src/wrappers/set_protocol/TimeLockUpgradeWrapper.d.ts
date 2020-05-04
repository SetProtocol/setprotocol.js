import Web3 from 'web3';
import { BigNumber } from '../../util';
import { Address, Bytes } from '../../types/common';
/**
 * @title  TimeLockUpgradeWrapper
 * @author Set Protocol
 *
 * The TimeLockUpgradeWrapper handles all functions and states related to authorizable contracts
 *
 */
export declare class TimeLockUpgradeWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Fetches the current timeLock period
     *
     * @param  timeLockUpgradeContract Address of the contract
     * @return                      A list of authorized addresses
     */
    timeLockPeriod(timeLockUpgradeContract: Address): Promise<BigNumber>;
    /**
     * Fetches the timestamp in which a pending timelock upgrade has been initiated
     *
     * @param  timeLockUpgradeContract     Address of the contract
     * @param  timeLockUpgradeHash         Hash of the call data
     * @return                             Timestamp of the intiation of the upgrade
     */
    timeLockedUpgrades(timeLockUpgradeContract: Address, timeLockUpgradeHash: Bytes): Promise<BigNumber>;
}
