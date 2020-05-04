import Web3 from 'web3';
import { BigNumber } from '../../util';
import { Address, Tx } from '../../types/common';
/**
 * @title  RebalancingSetIssuanceModuleWrapper
 * @author Set Protocol
 *
 * The RebalancingSetIssuanceModuleWrapper handles all functions for the Issuance and Redemption of Rebalancing Sets on
 * the RebalancingSetIssuanceModule smart contract
 *
 */
export declare class RebalancingSetIssuanceModuleWrapper {
    private web3;
    private contracts;
    private rebalancingSetIssuanceModule;
    constructor(web3: Web3, rebalancingSetIssuanceModuleAddress: Address);
    /**
     * Issue a rebalancing SetToken using the base components of the base SetToken.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                    The options for executing the transaction
     */
    issueRebalancingSet(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, keepChangeInVault: boolean, txOpts?: Tx): Promise<string>;
    /**
     * Issue a rebalancing SetToken using the base components of the base SetToken.
     * Wrapped Ether must be a component of the base SetToken - which is wrapped using the
     * ether sent along with the transaction.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                   The options for executing the transaction.
     */
    issueRebalancingSetWrappingEther(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, keepChangeInVault: boolean, txOpts?: Tx): Promise<string>;
    /**
     * Redeems a Rebalancing Set into the base SetToken. Then the base SetToken is redeemed, and its components
     * are sent to the caller.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                    The options for executing the transaction
     */
    redeemRebalancingSet(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, keepChangeInVault: boolean, txOpts?: Tx): Promise<string>;
    /**
     * Redeems a Rebalancing Set into the base SetToken. Then the base Set is redeemed, and its components
     * are sent to the caller. Any wrapped Ether is unwrapped and attributed to the caller.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                    The options for executing the transaction
     */
    redeemRebalancingSetUnwrappingEther(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, keepChangeInVault: boolean, txOpts?: Tx): Promise<string>;
}
