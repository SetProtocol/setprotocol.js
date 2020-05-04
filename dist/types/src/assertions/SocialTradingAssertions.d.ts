import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import { BigNumber } from '../util';
export declare class SocialTradingAssertions {
    private web3;
    private commonAssertions;
    constructor(web3: Web3);
    /**
     * Throws if the passed allocation is less than 0
     *
     * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
     */
    allocationGreaterOrEqualToZero(newAllocation: BigNumber): void;
    /**
     * Throws if the passed allocation is greater than 100%
     *
     * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
     */
    allocationLessThanOneHundred(newAllocation: BigNumber): void;
    /**
     * Throws if the passed allocation is not multiple of 1%
     *
     * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
     */
    allocationMultipleOfOnePercent(newAllocation: BigNumber): void;
    /**
     * Throws if the passed fee is not multiple of 1 basis point
     *
     * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
     */
    feeMultipleOfOneBasisPoint(fee: BigNumber): void;
    /**
     * Throws if the passed fee is not multiple of 1 basis point
     *
     * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
     */
    feeDoesNotExceedMax(manager: Address, fee: BigNumber): Promise<void>;
    /**
     * Throws if caller is not the trader of tradingPool
     *
     * @param  trader         Trader of trading pool
     * @param  caller         Caller of transaction
     */
    isTrader(trader: Address, caller: Address): void;
    /**
     * Throws if caller is not the trader of tradingPool
     *
     * @param  trader         Trader of trading pool
     * @param  caller         Caller of transaction
     */
    feeChangeInitiated(feeChangeTimestamp: BigNumber): void;
    /**
     * Throws if caller is not the trader of tradingPool
     *
     * @param  trader         Trader of trading pool
     * @param  caller         Caller of transaction
     */
    feeChangeTimelockElapsed(feeChangeTimestamp: BigNumber): void;
}
