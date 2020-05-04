import { Address } from 'set-protocol-utils';
import { BigNumber } from '../util';
export { TransactionReceipt } from 'ethereum-types';
export { Tx } from 'web3/eth/types';
export { Address, Bytes, Constants, ECSig, KyberTrade, Log, SolidityTypes, UInt, ZeroExSignedFillOrder, } from 'set-protocol-utils';
export declare enum FeeType {
    StreamingFee = 0,
    ProfitFee = 1
}
export interface BidPlacedEvent {
    transactionHash: string;
    rebalancingSetToken: Address;
    bidder: Address;
    executionQuantity: BigNumber;
    combinedTokenAddresses: Address[];
    inflowTokenUnits: BigNumber[];
    outflowTokenUnits: BigNumber[];
    blockNumber: number;
    timestamp: number;
}
export interface BidPlacedHelperEvent {
    transactionHash: string;
    rebalancingSetToken: Address;
    bidder: Address;
    quantity: BigNumber;
    timestamp: number;
}
export declare const BidderHelperType: {
    ETH: BigNumber;
    CTOKEN: BigNumber;
};
export interface EntryFeePaid {
    transactionHash: string;
    feeRecipient: Address;
    feeQuantity: BigNumber;
    timestamp: number;
}
export interface RebalanceFeePaid {
    transactionHash: string;
    rebalanceIndex: number;
    feeRecipient: Address;
    feeQuantity: BigNumber;
    timestamp: number;
}
export interface Component {
    address: Address;
    unit: BigNumber;
}
export declare const RebalancingState: {
    DEFAULT: BigNumber;
    PROPOSAL: BigNumber;
    REBALANCE: BigNumber;
    DRAWDOWN: BigNumber;
};
export declare const ManagerType: {
    BTCETH: BigNumber;
    BTCDAI: BigNumber;
    ETHDAI: BigNumber;
    MACO: BigNumber;
    MACOV2: BigNumber;
    PAIR: BigNumber;
};
export interface SetUnits {
    units: BigNumber[];
    naturalUnit: BigNumber;
}
export interface SetDetails {
    address: Address;
    factoryAddress: Address;
    name: string;
    symbol: string;
    naturalUnit: BigNumber;
    components: Component[];
}
export interface RebalancingProposalDetails {
    state: string;
    nextSetAddress: Address;
    pricingLibraryAddress: Address;
    proposalStartTime: BigNumber;
    timeToPivot: BigNumber;
    startingPrice: BigNumber;
    auctionPivotPrice: BigNumber;
}
export interface RebalancingProgressDetails {
    state: string;
    startingCurrentSetAmount: BigNumber;
    rebalancingStartedAt: BigNumber;
    minimumBid: BigNumber;
    remainingCurrentSet: BigNumber;
}
export interface RebalancingSetDetails {
    address: Address;
    factoryAddress: Address;
    managerAddress: Address;
    currentSetAddress: Address;
    unitShares: BigNumber;
    naturalUnit: BigNumber;
    state: string;
    proposalPeriod: BigNumber;
    rebalanceInterval: BigNumber;
    lastRebalancedAt: BigNumber;
    supply: BigNumber;
    name: string;
    symbol: string;
}
export interface SetProtocolConfig {
    coreAddress: Address;
    cTokenWhiteListAddress?: Address;
    exchangeIssuanceModuleAddress: Address;
    kyberNetworkWrapperAddress: Address;
    protocolViewerAddress: Address;
    rebalanceAuctionModuleAddress: Address;
    rebalancingSetCTokenBidderAddress?: Address;
    rebalancingSetEthBidderAddress?: Address;
    rebalancingSetExchangeIssuanceModule: Address;
    rebalancingSetIssuanceModule: Address;
    rebalancingSetTokenFactoryAddress: Address;
    setTokenFactoryAddress: Address;
    transferProxyAddress: Address;
    vaultAddress: Address;
    wrappedEtherAddress: Address;
}
export interface SystemAuthorizableState {
    transferProxy: Address[];
    vault: Address[];
}
export interface SystemOwnableState {
    core: Address;
    vault: Address;
    transferProxy: Address;
}
export interface SystemTimeLockPeriodState {
    core: BigNumber;
    vault: BigNumber;
    transferProxy: BigNumber;
}
export interface TokenFlows {
    tokens?: Address[];
    inflow: BigNumber[];
    outflow: BigNumber[];
}
export interface TokenFlowsDetails {
    inflow: Component[];
    outflow: Component[];
}
export interface CreateLogArgs {
    _setTokenAddress: Address;
    _factoryAddress: Address;
    _components: Address[];
    _units: BigNumber[];
    _naturalUnit: BigNumber;
    _name: string;
    _symbol: string;
}
export interface JSONRPCRequestPayload {
    params: any[];
    method: string;
    id: number;
    jsonrpc: string;
}
export interface JSONRPCResponsePayload {
    result: any;
    id: number;
    jsonrpc: string;
}
export declare type JSONRPCErrorCallback = (err: Error | null, result?: JSONRPCResponsePayload) => void;
