import { Address } from 'set-protocol-utils';
import { BigNumber } from '../util';

export { TransactionReceipt } from 'ethereum-types';
export { Tx } from 'web3/eth/types';
export {
  Address,
  Bytes,
  Constants,
  ECSig,
  KyberTrade,
  Log,
  SolidityTypes,
  UInt,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';


export interface MovingAverageManagerDetails {
  auctionLibrary: Address;
  auctionTimeToPivot: BigNumber;
  core: Address;
  lastProposalTimestamp: BigNumber;
  movingAverageDays: BigNumber;
  movingAveragePriceFeed: Address;
  rebalancingSetToken: Address;
  riskAsset: Address;
  riskCollateral: Address;
  setTokenFactory: Address;
  stableAsset: Address;
  stableCollateral: Address;
}