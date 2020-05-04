import Web3 from 'web3';
import { Assertions } from '../assertions';
import { BigNumber } from '../util';
import { Address, SetProtocolConfig, Tx } from '../types/common';
/**
 * @title RebalancingSetIssuanceAPI
 * @author Set Protocol
 *
 * A library for issuance and redemption of RebalancingSets.
 */
export declare class RebalancingSetIssuanceAPI {
    private web3;
    private assert;
    private cTokenWhiteList;
    private rebalancingSetIssuanceModule;
    private rebalancingSetToken;
    private wrappedEther;
    private transferProxy;
    /**
     * Instantiates a new RebalancingSetIssuanceAPI instance that contains methods for issuing and redeeming Sets
     *
     * @param web3                         The Web3.js Provider instance you would like the SetProtocol.js library
     *                                      to use for interacting with the Ethereum network
     * @param assertions                   An instance of the Assertion library
     * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    constructor(web3: Web3, assertions: Assertions, config: SetProtocolConfig);
    /**
     * Issue a rebalancing SetToken using the base components of the base SetToken.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                    The options for executing the transaction.
     */
    issueRebalancingSet(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, keepChangeInVault: boolean, txOpts: Tx): Promise<string>;
    /**
     * Issue a rebalancing SetToken using the base components of the base SetToken.
     * Wrapped Ether must be a component of the base SetToken - which is wrapped using the
     * ether sent along with the transaction. Excess ether is returned to the user.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to issue
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                   The options for executing the transaction. Value must be filled in.
     */
    issueRebalancingSetWrappingEther(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, keepChangeInVault: boolean, txOpts: Tx): Promise<string>;
    /**
     * Redeems a Rebalancing Set into the base SetToken. Then the base SetToken is redeemed, and its components
     * are sent to the caller or transferred to the caller in the Vault depending on the keepChangeInVault argument.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                   The options for executing the transaction
     */
    redeemRebalancingSet(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, keepChangeInVault: boolean, txOpts: Tx): Promise<string>;
    /**
     * Redeems a Rebalancing Set into the base SetToken. Then the base Set is redeemed, and its components
     * are sent to the caller. Any wrapped Ether is unwrapped and transferred to the caller.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transfered to the user
     *                                    or is left in the vault
     * @param  txOpts                    The options for executing the transaction
     */
    redeemRebalancingSetUnwrappingEther(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, keepChangeInVault: boolean, txOpts: Tx): Promise<string>;
    private assertIssueRebalancingSetWrappingEther;
    private assertRedeemRebalancingSetUnwrappingEther;
}
