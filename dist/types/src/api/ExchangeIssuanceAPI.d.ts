import Web3 from 'web3';
import { ExchangeIssuanceParams } from 'set-protocol-utils';
import { Assertions } from '../assertions';
import { BigNumber } from '../util';
import { Address, KyberTrade, SetProtocolConfig, Tx, ZeroExSignedFillOrder } from '../types/common';
/**
 * @title ExchangeIssuanceAPI
 * @author Set Protocol
 *
 * A library for issuing RebalancingSets using Ether.
 */
export declare class ExchangeIssuanceAPI {
    private web3;
    private assert;
    private cTokenWhiteList;
    private exchangeIssuance;
    private setProtocolUtils;
    private rebalancingSetExchangeIssuanceModule;
    private setToken;
    private rebalancingSetToken;
    private wrappedEther;
    private core;
    private kyberNetworkWrapper;
    /**
     * Instantiates a new ExchangeIssuanceAPI instance that contains methods for issuing and redeeming Sets
     *
     * @param web3            The Web3.js Provider instance you would like the SetProtocol.js library
     *                        to use for interacting with the Ethereum network
     * @param assertions      An instance of the Assertion library
     * @param config          Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    constructor(web3: Web3, assertions: Assertions, config: SetProtocolConfig);
    /**
     * Issues a Set to the transaction signer. Must have payment tokens in the correct quantites
     * Payment tokens must be approved to the TransferProxy contract via setTransferProxyAllowanceAsync
     *
     * @param  exchangeIssuanceParams      Parameters required to facilitate an exchange issue
     * @param  orders                   A list of signed 0x orders or kyber trades
     * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return               Transaction hash
     */
    exchangeIssueAsync(exchangeIssuanceParams: ExchangeIssuanceParams, orders: (KyberTrade | ZeroExSignedFillOrder)[], txOpts: Tx): Promise<string>;
    /**
     * Issues a Rebalancing Set to the transaction signer using Ether as payment.
     *
     * @param  rebalancingSetAddress    Address of the Rebalancing Set to issue
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to issue
     * @param  exchangeIssuanceParams   Parameters required to facilitate an exchange issuance
     * @param  orders                   A list of signed 0x orders or kyber trades
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transferred to the user
     *                                     or left in the vault
     * @param  txOpts                   Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                          Transaction hash
     */
    issueRebalancingSetWithEtherAsync(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, exchangeIssuanceParams: ExchangeIssuanceParams, orders: (KyberTrade | ZeroExSignedFillOrder)[], keepChangeInVault: boolean, txOpts: Tx): Promise<string>;
    /**
     * Issue a Rebalancing Set using a specified ERC20 payment token. The payment token is used in ExchangeIssue
     * to acquire the base SetToken components and issue the base SetToken. The base SetToken is then used to
     * issue the Rebalancing SetToken. The payment token can be utilized as a component of the base SetToken.
     * All remaining tokens / change are flushed and returned to the user.
     * Ahead of calling this function, the user must approve their paymentToken to the transferProxy.
     *
     * @param  rebalancingSetAddress     Address of the rebalancing Set to issue
     * @param  rebalancingSetQuantity    Quantity of the rebalancing Set
     * @param  paymentTokenAddress       Address of the ERC20 token to pay with
     * @param  paymentTokenQuantity      Quantity of the payment token
     * @param  exchangeIssuanceParams    Struct containing data around the base Set issuance
     * @param  orderData                 Bytecode formatted data with exchange data for acquiring base set components
     * @param  keepChangeInVault         Boolean signifying whether excess base SetToken is transfered to the user
     *                                     or left in the vault
     * @param  txOpts                    The options for executing the transaction
     */
    issueRebalancingSetWithERC20Async(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, paymentTokenAddress: Address, paymentTokenQuantity: BigNumber, exchangeIssuanceParams: ExchangeIssuanceParams, orders: (KyberTrade | ZeroExSignedFillOrder)[], keepChangeInVault: boolean, txOpts: Tx): Promise<string>;
    /**
     * Redeems a Rebalancing Set into the base Set. Then the base Set is redeemed, and its components
     * are exchanged for Wrapped Ether. The wrapped Ether is then unwrapped and attributed to the caller.
     *
     * @param  rebalancingSetAddress    Address of the rebalancing Set to redeem
     * @param  rebalancingSetQuantity   Quantity of the rebalancing Set to redeem
     * @param  exchangeIssuanceParams   Parameters required to facilitate an exchange issuance
     * @param  orders                   A list of signed 0x orders or kyber trades
     * @param  keepChangeInVault        Boolean signifying whether excess base SetToken is transferred to the user
     *                                     or left in the vault
     * @param  txOpts                   Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
     * @return                          Transaction hash
     */
    redeemRebalancingSetIntoEtherAsync(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, exchangeIssuanceParams: ExchangeIssuanceParams, orders: (KyberTrade | ZeroExSignedFillOrder)[], keepChangeInVault: boolean, txOpts: Tx): Promise<string>;
    /**
     * Redeems a Rebalancing Set into a specified ERC20 token. The Rebalancing Set is redeemed into the Base Set, and
     * Base Set components are traded for the ERC20 and sent to the caller.
     *
     * @param  rebalancingSetAddress     Address of the rebalancing Set
     * @param  rebalancingSetQuantity    Quantity of rebalancing Set to redeem
     * @param  outputTokenAddress        Address of the resulting ERC20 token sent to the user
     * @param  exchangeIssuanceParams    Struct containing data around the base Set issuance
     * @param  orderData                 Bytecode formatted data with exchange data for disposing base set components
     * @param  keepChangeInVault         Boolean signifying whether excess base SetToken is transfered to the user
     *                                     or left in the vault
     * @param  txOpts                    The options for executing the transaction
     */
    redeemRebalancingSetIntoERC20Async(rebalancingSetAddress: Address, rebalancingSetQuantity: BigNumber, outputTokenAddress: Address, exchangeIssuanceParams: ExchangeIssuanceParams, orders: (KyberTrade | ZeroExSignedFillOrder)[], keepChangeInVault: boolean, txOpts: Tx): Promise<string>;
    /**
     * Fetch the conversion rate for a Kyber trading pair
     *
     * @param  sourceTokens        Addresses of the tokens to trade
     * @param  destinationTokens   Addresses of the set components to trade for
     * @param  quantities          Quantities of maker tokens to trade for component tokens
     * @return                     Conversion and slippage rates for the source and destination token pairs
     */
    getKyberConversionRates(sourceTokens: Address[], destinationTokens: Address[], quantities: BigNumber[]): Promise<[BigNumber[], BigNumber[]]>;
    private assertExchangeIssue;
    private assertIssueRebalancingSetWithEther;
    private assertIssueRebalancingSetWithERC20;
    private assertRedeemRebalancingSetIntoERC20;
}
