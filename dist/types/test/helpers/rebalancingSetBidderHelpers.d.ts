import Web3 from 'web3';
import { RebalancingSetEthBidderContract, RebalancingSetCTokenBidderContract, RebalanceAuctionModuleContract, TransferProxyContract, WethMockContract } from 'set-protocol-contracts';
import { TokenFlowsDetails } from '@src/types/common';
import { BigNumber } from '@src/util';
export declare const deployRebalancingSetEthBidderAsync: (web3: Web3, rebalanceAuctionModule: RebalanceAuctionModuleContract, transferProxy: TransferProxyContract, wrappedEther: WethMockContract, owner?: string) => Promise<RebalancingSetEthBidderContract>;
export declare const deployRebalancingSetCTokenBidderAsync: (web3: Web3, rebalanceAuctionModule: RebalanceAuctionModuleContract, transferProxy: TransferProxyContract, cTokenAddressesArray: string[], underlyingAddressesArray: string[], dataDescription: string, owner?: string) => Promise<RebalancingSetCTokenBidderContract>;
export declare const replaceFlowsWithCTokenUnderlyingAsync: (expectedTokenFlows: any, combinedTokenArray: string[], cTokenAddressesArray: string[], underlyingAddressesArray: string[], cTokenExchangeRateArray: BigNumber[]) => any;
export declare const constructObjectFromArray: (array1: any[], array2: any[]) => any;
export declare const replaceDetailFlowsWithCTokenUnderlyingAsync: (expectedTokenFlowsDetails: any, cTokenAddressesArray: string[], underlyingAddressesArray: string[], cTokenExchangeRateArray: BigNumber[]) => TokenFlowsDetails;
