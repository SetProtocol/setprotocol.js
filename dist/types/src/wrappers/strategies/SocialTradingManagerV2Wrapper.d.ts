import Web3 from 'web3';
import { SocialTradingManagerWrapper } from './SocialTradingManagerWrapper';
import { Address, Tx } from '../../types/common';
/**
 * @title  SocialTradingManagerWrapper
 * @author Set Protocol
 *
 * The SocialTradingManagerV2Wrapper extends SocialTradingManagerWrapper and adds fee setting functions.
 *
 */
export declare class SocialTradingManagerV2Wrapper extends SocialTradingManagerWrapper {
    constructor(web3: Web3);
    /**
     * Calls SocialTradingManager's adjustFee function. Allows trader to change performance fees.
     *
     * @param  manager                        Address of the social trading manager contract
     * @param  tradingPool                    Address of tradingPool being updated
     * @param  newFeeCallData                 New fee call data
     * @return                                The hash of the resulting transaction.
     */
    adjustFee(manager: Address, tradingPool: Address, newFeeCallData: string, txOpts?: Tx): Promise<string>;
    /**
     * Calls SocialTradingManager's adjustFee function. Allows trader to change performance fees.
     *
     * @param  manager                        Address of the social trading manager contract
     * @param  tradingPool                    Address of tradingPool being updated
     * @param  upgradeHash                    Hash of upgrade to be removed
     * @return                                The hash of the resulting transaction.
     */
    removeRegisteredUpgrade(manager: Address, tradingPool: Address, upgradeHash: string, txOpts?: Tx): Promise<string>;
}
