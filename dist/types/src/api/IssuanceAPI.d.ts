import Web3 from 'web3';
import { Assertions } from '../assertions';
import { CoreWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { Address, Component, Tx } from '../types/common';
/**
 * @title IssuanceAPI
 * @author Set Protocol
 *
 * A library for issuing and redeeming Sets
 */
export declare class IssuanceAPI {
    private web3;
    private assert;
    private core;
    private setToken;
    private erc20;
    private vault;
    /**
     * Instantiates a new IssuanceAPI instance that contains methods for issuing and redeeming Sets
     *
     * @param web3        The Web3.js Provider instance you would like the SetProtocol.js library to use for interacting
     *                      with the Ethereum network
     * @param core        An instance of CoreWrapper to interact with the deployed Core contract
     * @param assertions  An instance of the Assertion library
     */
    constructor(web3: Web3, core: CoreWrapper, assertions: Assertions);
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
     * to `withdraw` to leave redeemed components in vault under the user's address to save gas if rebundling into
     * another Set with similar components
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
     * Calculates additional amounts of each component token in a Set needed in order to issue a specific quantity of
     * the Set. This includes token balances a user may have in both the account wallet and the Vault contract. Can be
     * used as `requiredComponents` and `requiredComponentAmounts` inputs for an issuance order
     *
     * @param  setAddress       Address of the Set token for issuance order
     * @param  userAddress     Address of user making the issuance
     * @param  quantity         Amount of the Set token to create as part of issuance order
     * @return                  List of objects conforming to the `Component` interface with address and units of each
     *                            component required for issuance
     */
    calculateRequiredComponentsAndUnitsAsync(setAddress: Address, userAddress: Address, quantity: BigNumber): Promise<Component[]>;
    private assertIssue;
    private assertRedeem;
}
