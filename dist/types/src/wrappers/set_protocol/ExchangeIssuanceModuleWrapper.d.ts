import Web3 from 'web3';
import { Address, Tx } from '../../types/common';
import { Bytes, ExchangeIssuanceParams } from 'set-protocol-utils';
/**
 * @title  ExchangeIssuanceModuleWrapper
 * @author Set Protocol
 *
 * The ExchangeIssuanceModuleWrapper handles all functions on the Exchange Issue Module smart contract.
 *
 */
export declare class ExchangeIssuanceModuleWrapper {
    private web3;
    private contracts;
    private exchangeIssuanceModule;
    constructor(web3: Web3, exchangeIssuanceModuleAddress: Address);
    /**
     * Issue a Set by acquiring the base components of the Set.
     *
     * @param  exchangeIssuanceData        Struct containing data around the base Set issuance
     * @param  orderData                Bytecode formatted data with exchange data for acquiring base set components
     * @param  txOpts                    The options for executing the transaction
     */
    exchangeIssue(exchangeIssuanceParams: ExchangeIssuanceParams, orderData: Bytes, txOpts?: Tx): Promise<string>;
    /**
     * Redeems a Set and exchanges the components for a specific ERC20 token.
     *
     * @param  exchangeIssuanceData      Struct containing data around the base Set issuance
     * @param  orderData                Bytecode formatted data with exchange data for disposing of base set components
     * @param  txOpts                    The options for executing the transaction
     */
    exchangeRedeem(exchangeIssuanceParams: ExchangeIssuanceParams, orderData: Bytes, txOpts?: Tx): Promise<string>;
}
