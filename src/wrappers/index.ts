/*
  Copyright 2018 Set Labs Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

export { AuthorizableWrapper } from './set_protocol/AuthorizableWrapper';
export { CoreWrapper } from './set_protocol/CoreWrapper';
export { ERC20Wrapper } from './set_protocol/ERC20Wrapper';
export { ExchangeIssuanceModuleWrapper } from './set_protocol/ExchangeIssuanceModuleWrapper';
export { KyberNetworkWrapper } from './set_protocol/KyberNetworkWrapper';
export {
 RebalancingSetExchangeIssuanceModuleWrapper
} from './set_protocol/RebalancingSetExchangeIssuanceModuleWrapper';
export { RebalancingSetIssuanceModuleWrapper } from './set_protocol/RebalancingSetIssuanceModuleWrapper';
export { MedianizerWrapper } from './set_protocol/MedianizerWrapper';
export { ProtocolContractWrapper } from './set_protocol/ProtocolContractWrapper';
export { ProtocolViewerWrapper } from './set_protocol/ProtocolViewerWrapper';
export { RebalancingAuctionModuleWrapper } from './set_protocol/RebalancingAuctionModuleWrapper';
export { RebalancingSetTokenWrapper } from './set_protocol/RebalancingSetTokenWrapper';
export { SetTokenWrapper } from './set_protocol/SetTokenWrapper';
export { TimeLockUpgradeWrapper } from './set_protocol/TimeLockUpgradeWrapper';
export { WhitelistWrapper } from './set_protocol/WhitelistWrapper';
export { VaultWrapper } from './set_protocol/VaultWrapper';

export { BTCDAIRebalancingManagerWrapper } from './strategies/BTCDAIRebalancingManagerWrapper';
export { BTCETHRebalancingManagerWrapper } from './strategies/BTCETHRebalancingManagerWrapper';
export { ETHDAIRebalancingManagerWrapper } from './strategies/ETHDAIRebalancingManagerWrapper';
export { HistoricalPriceFeedWrapper } from './strategies/HistoricalPriceFeedWrapper';
export { MovingAverageOracleWrapper } from './strategies/MovingAverageOracleWrapper';
export { MACOStrategyManagerWrapper } from './strategies/MACOStrategyManagerWrapper';
export { MACOStrategyManagerV2Wrapper } from './strategies/MACOStrategyManagerV2Wrapper';
export { OracleProxyWrapper } from './strategies/OracleProxyWrapper';
export { StrategyContractWrapper } from './strategies/StrategyContractWrapper';
export { TimeSeriesFeedWrapper } from './strategies/TimeSeriesFeedWrapper';
