import Web3 from 'web3';
import { Assertions } from '../assertions';
import { CoreWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { Address, BidPlacedEvent, BidPlacedHelperEvent, RebalancingProgressDetails, RebalancingProposalDetails, RebalancingSetDetails, SetProtocolConfig, Tx, TokenFlowsDetails } from '../types/common';
/**
 * @title RebalancingAPI
 * @author Set Protocol
 *
 * A library for interacting with RebalancingSetToken contracts
 */
export declare class RebalancingAPI {
    private web3;
    private assert;
    private core;
    private erc20;
    private protocolViewer;
    private rebalancingSetToken;
    private rebalancingAuctionModule;
    private rebalancingSetEthBidder;
    private rebalancingSetCTokenBidder;
    private setToken;
    private config;
    /**
     * Instantiates a new RebalancingAPI instance that contains methods
     * for interacting with RebalancingSetToken contracts
     *
     * @param web3        Web3.js Provider instance you would like the SetProtocol.js library to use for interacting with
     *                      the Ethereum network
     * @param assertions  An instance of the Assertion library
     * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
     */
    constructor(web3: Web3, assertions: Assertions, core: CoreWrapper, config: SetProtocolConfig);
    /**
     * Proposes rebalance a new Set to rebalance to. Can only be called by the manager. Users will have the
     * RebalancingSetToken's designated proposal period to withdraw their Sets if they want to
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  nextSetAddress                 Address of new Set to rebalance into after proposal period
     * @param  auctionLibrary                 Address of auction price curve to use. See deployed contracts for addresses
     *                                          of existing libraries
     * @param  auctionTimeToPivot             Amount of time until curve pivots and protocol takes over price curve
     * @param  auctionStartPrice              Starting price of the rebalancing auction, depending on library may not be
     *                                          used
     * @param  auctionPivotPrice              Price to pivot from user-defined to protocol-defined curve
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    proposeAsync(rebalancingSetTokenAddress: Address, nextSetAddress: Address, auctionLibrary: Address, auctionTimeToPivot: BigNumber, auctionStartPrice: BigNumber, auctionPivotPrice: BigNumber, txOpts: Tx): Promise<string>;
    /**
     * Initiates rebalance after proposal period has passed
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    startRebalanceAsync(rebalancingSetTokenAddress: Address, txOpts: Tx): Promise<string>;
    /**
     * Settles rebalance after auction has been completed
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    settleRebalanceAsync(rebalancingSetTokenAddress: Address, txOpts: Tx): Promise<string>;
    /**
     * Ends failed auction and either returns to Default if no bids or sets to Drawdown if there are bids
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    endFailedAuctionAsync(rebalancingSetTokenAddress: Address, txOpts: Tx): Promise<string>;
    /**
     * Allows user to bid on a rebalance auction occuring on a Rebalancing Set Token
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
     * @param  shouldWithdraw                 Boolean to withdraw back to signer's wallet or leave in vault.
     *                                        Defaults to true
     * @param  allowPartialFill               Boolean to complete fill if quantity is less than available
     *                                        Defaults to true
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                        gasPrice data
     * @return                                Transaction hash
     */
    bidAsync(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber, shouldWithdraw: boolean, allowPartialFill: boolean, txOpts: Tx): Promise<string>;
    /**
     * Allows user to bid on a rebalance auction while sending and receiving Ether instead of Wrapped Ether. This
     * encompasses all functionality in bidAsync.
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
     * @param  allowPartialFill               Boolean to complete fill if quantity is less than available
     *                                        Defaults to true
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                        gasPrice data
     * @return                                Transaction hash
     */
    bidWithEtherAsync(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber, allowPartialFill: boolean, txOpts: Tx): Promise<string>;
    /**
     * Allows user to bid on a rebalance auction containing Compound cTokens while sending and
     * receiving the underlying. This encompasses all functionality in bidAsync.
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
     * @param  allowPartialFill               Boolean to complete fill if quantity is less than available
     *                                        Defaults to true
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                        gasPrice data
     * @return                                Transaction hash
     */
    bidWithCTokenUnderlyingAsync(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber, allowPartialFill: boolean, txOpts: Tx): Promise<string>;
    /**
     * Allows current manager to change manager address to a new address
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  newManager                     Address of the new manager
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    updateManagerAsync(rebalancingSetTokenAddress: Address, newManager: Address, txOpts: Tx): Promise<string>;
    /**
     * Burn rebalancing Set token and transfer ownership of collateral in Vault to owner in Drawdown state
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  txOpts                         Transaction options object conforming to `Tx` with signer, gas, and
     *                                          gasPrice data
     * @return                                Transaction hash
     */
    redeemFromFailedRebalanceAsync(rebalancingSetTokenAddress: Address, txOpts: Tx): Promise<string>;
    /**
     * Fetches the current cToken underlying component addresses, token inflows and outflows for a given bid quantity,
     * returns `Component` objects reflecting token inflows and outflows. Tokens flows of 0 are omitted
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
     * @return                                Object conforming to `TokenFlowsDetails` interface
     */
    getBidPriceCTokenUnderlyingAsync(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber): Promise<TokenFlowsDetails>;
    /**
     * Fetches the current token inflows and outflows for a given bid quantity, returns `Component`
     * objects reflecting token inflows and outflows. Tokens flows of 0 are omitted
     *
     * @param  rebalancingSetTokenAddress     Address of the Rebalancing Set
     * @param  bidQuantity                    Amount of currentSet the bidder wants to rebalance
     * @return                                Object conforming to `TokenFlowsDetails` interface
     */
    getBidPriceAsync(rebalancingSetTokenAddress: Address, bidQuantity: BigNumber): Promise<TokenFlowsDetails>;
    /**
     * Fetches BidPlaced event logs including information about the transactionHash, rebalancingSetToken,
     * bidder, executionQuantity, combinedTokenAddresses, etc.
     *
     * This fetch can be filtered by block and by rebalancingSetToken.
     *
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
     * @return                               An array of objects conforming to the BidPlacedEvent interface
     */
    getBidPlacedEventsAsync(fromBlock: number, toBlock?: any, rebalancingSetToken?: Address, getTimestamp?: boolean): Promise<BidPlacedEvent[]>;
    /**
     * Fetches bid event logs from ETH bidder or cToken bidder contracts including information about the
     * transactionHash, rebalancingSetToken, bidder and etc.
     *
     * This fetch can be filtered by block and by rebalancingSetToken.
     *
     * @param  bidderHelperType              BigNumber indicating which kind of bidder helper contract to call
     * @param  fromBlock                     The beginning block to retrieve events from
     * @param  toBlock                       The ending block to retrieve events (default is latest)
     * @param  rebalancingSetToken           Addresses of rebalancing set token to filter events for
     * @param  getTimestamp                  Boolean for returning the timestamp of the event
     * @return                               An array of objects conforming to the BidPlacedHelperEvent interface
     */
    getBidPlacedHelperEventsAsync(bidderHelperType: BigNumber, fromBlock: number, toBlock?: any, rebalancingSetToken?: Address, getTimestamp?: boolean): Promise<BidPlacedHelperEvent[]>;
    /**
     * Fetches details of a RebalancingSetToken comprised of factory address, manager, current set, unit shares,
     * natural unit, state, date the last rebalance ended, supply, name, and symbol
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Object conforming to `RebalancingSetDetails` interface
     */
    getDetailsAsync(rebalancingSetTokenAddress: Address): Promise<RebalancingSetDetails>;
    /**
     * Fetches details of the proposal. This includes the proposal time, next set, starting rebalance price, the pricing
     * library being used, the curve coefficient of the price, and the price divisor
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Object conforming to `RebalancingProposalDetails` interface
     */
    getProposalDetailsAsync(rebalancingSetTokenAddress: Address): Promise<RebalancingProposalDetails>;
    /**
     * Fetches details of the current rebalancing event. This information can be used to confirm the elapsed time
     * of the rebalance, the next set, and the remaining quantity of the old set to rebalance
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Object conforming to `RebalancingProgressDetails` interface
     */
    getRebalanceDetailsAsync(rebalancingSetTokenAddress: Address): Promise<RebalancingProgressDetails>;
    /**
     * Fetches the current state of the RebalancingSetToken
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Current state belonging to {'Default', 'Propose', 'Rebalance', 'Drawdown'}
     */
    getRebalanceStateAsync(rebalancingSetTokenAddress: Address): Promise<string>;
    /**
     * Fetches the current states for multiple RebalancingSetToken contracts
     *
     * @param  rebalancingSetTokenAddresses    Addressses of the RebalancingSetToken contracts
     * @return                                 Current state belonging to {'Default', 'Propose', 'Rebalance', 'Drawdown'}
     */
    getRebalanceStatesAsync(rebalancingSetTokenAddresses: Address[]): Promise<string[]>;
    /**
     * Fetches the current unitShares for multiple RebalancingSetToken contracts
     *
     * @param  rebalancingSetTokenAddresses    Addressses of the RebalancingSetToken contracts
     * @return                                 Array of current unitShares
     */
    getUnitSharesAsync(rebalancingSetTokenAddresses: Address[]): Promise<BigNumber[]>;
    /**
     * Fetches the current collateral set token address of a rebalancing set
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Address of the rebalancing set's current Set Token
     */
    getRebalancingSetCurrentSetAsync(rebalancingSetTokenAddress: Address): Promise<Address>;
    /**
     * Fetches the remaining current sets of a rebalancing set that is currently undergoing a rebalance
     *
     * @param  rebalancingSetTokenAddress    Address of the RebalancingSetToken
     * @return                               Number of remaining shares available
     */
    getRebalancingSetAuctionRemainingCurrentSets(rebalancingSetTokenAddress: Address): Promise<BigNumber>;
    private assertPropose;
    private assertStartRebalance;
    private assertSettleRebalance;
    private assertEndFailedAuction;
    private assertRedeemFromFailedRebalance;
    private assertBid;
    private assertBidWithEther;
    private assertBidCToken;
    private assertGetRebalanceStatesAsync;
    private assertGetUnitSharesAsync;
    private assertUpdateManager;
    private assertGetBidPrice;
    private assertGetRebalanceDetails;
    private assertGetProposalDetails;
}
