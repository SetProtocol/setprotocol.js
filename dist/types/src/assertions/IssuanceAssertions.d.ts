import Web3 from 'web3';
import { BigNumber } from '../util';
import { Address } from '../types/common';
export declare class IssuanceAssertions {
    private erc20Assertions;
    private commonAssertions;
    private schemaAssertions;
    private setTokenAssertions;
    private rebalancingSetToken;
    private setToken;
    private addressToAddressWhiteList;
    constructor(web3: Web3);
    /**
     * Makes the following assertions on a Set Token:
     * 1) Set quantity is a multiple of the natural unit
     * 2) The caller has sufficient component balance and allowance
     *
     */
    assertSetTokenIssue(setTokenAddress: Address, setTokenQuantity: BigNumber, transactionCaller: Address, transferProxyAddress: Address): Promise<void>;
    /**
     * Makes the following assertions on a Rebalancing Set Token Issuance:
     * 1) Rebalancing Set quantity is a multiple of the natural unit
     * 2) The caller has sufficient component balance and allowance based on the implied
     *    base SetToken issue quantity
     */
    assertRebalancingSetTokenIssue(rebalancingSetTokenAddress: Address, rebalancingSetTokenQuantity: BigNumber, transactionCaller: Address, transferProxyAddress: Address, cTokenWhiteListAddress?: Address): Promise<void>;
    /**
     * Makes the following assertions on a Rebalancing Set Token Issuance:
     * 1) Rebalancing Set quantity is a multiple of the natural unit
     * 2) The caller has sufficient component balance and allowance based on the implied
     *    base SetToken issue quantity
     * 3) Validate wrapped ether is a component
     * 4) Validate there is enough ether for issuance
     */
    assertRebalancingSetTokenIssueWrappingEther(rebalancingSetTokenAddress: Address, rebalancingSetTokenQuantity: BigNumber, transactionCaller: Address, transferProxyAddress: Address, wrappedEtherAddress: Address, etherValue: BigNumber, cTokenWhiteListAddress: Address): Promise<void>;
    assertRedeem(setTokenAddress: Address, setTokenQuantity: BigNumber, transactionCaller: Address): Promise<void>;
    /**
     * Given a rebalancing SetToken and a desired issue quantity, calculates the
     * minimum issuable quantity of the base SetToken. If the calculated quantity is initially
     * not a multiple of the base SetToken's natural unit, the quantity is rounded up
     * to the next base set natural unit.
     */
    private getBaseSetIssuanceRequiredQuantity;
    /**
     * Given a base SetToken and a desired issue quantity, calculates the
     * required wrapped Ether quantity.
     */
    private getWrappedEtherRequiredQuantity;
}
