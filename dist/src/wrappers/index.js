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
Object.defineProperty(exports, "__esModule", { value: true });
var AddressToAddressWhiteListWrapper_1 = require("./set_protocol/AddressToAddressWhiteListWrapper");
exports.AddressToAddressWhiteListWrapper = AddressToAddressWhiteListWrapper_1.AddressToAddressWhiteListWrapper;
var AuthorizableWrapper_1 = require("./set_protocol/AuthorizableWrapper");
exports.AuthorizableWrapper = AuthorizableWrapper_1.AuthorizableWrapper;
var CoreWrapper_1 = require("./set_protocol/CoreWrapper");
exports.CoreWrapper = CoreWrapper_1.CoreWrapper;
var ERC20Wrapper_1 = require("./set_protocol/ERC20Wrapper");
exports.ERC20Wrapper = ERC20Wrapper_1.ERC20Wrapper;
var ExchangeIssuanceModuleWrapper_1 = require("./set_protocol/ExchangeIssuanceModuleWrapper");
exports.ExchangeIssuanceModuleWrapper = ExchangeIssuanceModuleWrapper_1.ExchangeIssuanceModuleWrapper;
var KyberNetworkWrapper_1 = require("./set_protocol/KyberNetworkWrapper");
exports.KyberNetworkWrapper = KyberNetworkWrapper_1.KyberNetworkWrapper;
var RebalancingSetCTokenBidderWrapper_1 = require("./set_protocol/RebalancingSetCTokenBidderWrapper");
exports.RebalancingSetCTokenBidderWrapper = RebalancingSetCTokenBidderWrapper_1.RebalancingSetCTokenBidderWrapper;
var RebalancingSetEthBidderWrapper_1 = require("./set_protocol/RebalancingSetEthBidderWrapper");
exports.RebalancingSetEthBidderWrapper = RebalancingSetEthBidderWrapper_1.RebalancingSetEthBidderWrapper;
var RebalancingSetTokenV2Wrapper_1 = require("./set_protocol/RebalancingSetTokenV2Wrapper");
exports.RebalancingSetTokenV2Wrapper = RebalancingSetTokenV2Wrapper_1.RebalancingSetTokenV2Wrapper;
var RebalancingSetTokenV3Wrapper_1 = require("./set_protocol/RebalancingSetTokenV3Wrapper");
exports.RebalancingSetTokenV3Wrapper = RebalancingSetTokenV3Wrapper_1.RebalancingSetTokenV3Wrapper;
var RebalancingSetExchangeIssuanceModuleWrapper_1 = require("./set_protocol/RebalancingSetExchangeIssuanceModuleWrapper");
exports.RebalancingSetExchangeIssuanceModuleWrapper = RebalancingSetExchangeIssuanceModuleWrapper_1.RebalancingSetExchangeIssuanceModuleWrapper;
var RebalancingSetIssuanceModuleWrapper_1 = require("./set_protocol/RebalancingSetIssuanceModuleWrapper");
exports.RebalancingSetIssuanceModuleWrapper = RebalancingSetIssuanceModuleWrapper_1.RebalancingSetIssuanceModuleWrapper;
var MedianizerWrapper_1 = require("./set_protocol/MedianizerWrapper");
exports.MedianizerWrapper = MedianizerWrapper_1.MedianizerWrapper;
var PerformanceFeeCalculatorWrapper_1 = require("./set_protocol/PerformanceFeeCalculatorWrapper");
exports.PerformanceFeeCalculatorWrapper = PerformanceFeeCalculatorWrapper_1.PerformanceFeeCalculatorWrapper;
var ProtocolContractWrapper_1 = require("./set_protocol/ProtocolContractWrapper");
exports.ProtocolContractWrapper = ProtocolContractWrapper_1.ProtocolContractWrapper;
var ProtocolViewerWrapper_1 = require("./set_protocol/ProtocolViewerWrapper");
exports.ProtocolViewerWrapper = ProtocolViewerWrapper_1.ProtocolViewerWrapper;
var RebalancingAuctionModuleWrapper_1 = require("./set_protocol/RebalancingAuctionModuleWrapper");
exports.RebalancingAuctionModuleWrapper = RebalancingAuctionModuleWrapper_1.RebalancingAuctionModuleWrapper;
var RebalancingSetTokenWrapper_1 = require("./set_protocol/RebalancingSetTokenWrapper");
exports.RebalancingSetTokenWrapper = RebalancingSetTokenWrapper_1.RebalancingSetTokenWrapper;
var SetTokenWrapper_1 = require("./set_protocol/SetTokenWrapper");
exports.SetTokenWrapper = SetTokenWrapper_1.SetTokenWrapper;
var TimeLockUpgradeWrapper_1 = require("./set_protocol/TimeLockUpgradeWrapper");
exports.TimeLockUpgradeWrapper = TimeLockUpgradeWrapper_1.TimeLockUpgradeWrapper;
var WhitelistWrapper_1 = require("./set_protocol/WhitelistWrapper");
exports.WhitelistWrapper = WhitelistWrapper_1.WhitelistWrapper;
var VaultWrapper_1 = require("./set_protocol/VaultWrapper");
exports.VaultWrapper = VaultWrapper_1.VaultWrapper;
var AssetPairManagerWrapper_1 = require("./strategies/AssetPairManagerWrapper");
exports.AssetPairManagerWrapper = AssetPairManagerWrapper_1.AssetPairManagerWrapper;
var BTCDAIRebalancingManagerWrapper_1 = require("./strategies/BTCDAIRebalancingManagerWrapper");
exports.BTCDAIRebalancingManagerWrapper = BTCDAIRebalancingManagerWrapper_1.BTCDAIRebalancingManagerWrapper;
var BTCETHRebalancingManagerWrapper_1 = require("./strategies/BTCETHRebalancingManagerWrapper");
exports.BTCETHRebalancingManagerWrapper = BTCETHRebalancingManagerWrapper_1.BTCETHRebalancingManagerWrapper;
var ETHDAIRebalancingManagerWrapper_1 = require("./strategies/ETHDAIRebalancingManagerWrapper");
exports.ETHDAIRebalancingManagerWrapper = ETHDAIRebalancingManagerWrapper_1.ETHDAIRebalancingManagerWrapper;
var HistoricalPriceFeedWrapper_1 = require("./strategies/HistoricalPriceFeedWrapper");
exports.HistoricalPriceFeedWrapper = HistoricalPriceFeedWrapper_1.HistoricalPriceFeedWrapper;
var MovingAverageOracleWrapper_1 = require("./strategies/MovingAverageOracleWrapper");
exports.MovingAverageOracleWrapper = MovingAverageOracleWrapper_1.MovingAverageOracleWrapper;
var MACOStrategyManagerWrapper_1 = require("./strategies/MACOStrategyManagerWrapper");
exports.MACOStrategyManagerWrapper = MACOStrategyManagerWrapper_1.MACOStrategyManagerWrapper;
var MACOStrategyManagerV2Wrapper_1 = require("./strategies/MACOStrategyManagerV2Wrapper");
exports.MACOStrategyManagerV2Wrapper = MACOStrategyManagerV2Wrapper_1.MACOStrategyManagerV2Wrapper;
var OracleProxyWrapper_1 = require("./strategies/OracleProxyWrapper");
exports.OracleProxyWrapper = OracleProxyWrapper_1.OracleProxyWrapper;
var SocialTradingManagerWrapper_1 = require("./strategies/SocialTradingManagerWrapper");
exports.SocialTradingManagerWrapper = SocialTradingManagerWrapper_1.SocialTradingManagerWrapper;
var SocialTradingManagerV2Wrapper_1 = require("./strategies/SocialTradingManagerV2Wrapper");
exports.SocialTradingManagerV2Wrapper = SocialTradingManagerV2Wrapper_1.SocialTradingManagerV2Wrapper;
var StrategyContractWrapper_1 = require("./strategies/StrategyContractWrapper");
exports.StrategyContractWrapper = StrategyContractWrapper_1.StrategyContractWrapper;
var TimeSeriesFeedWrapper_1 = require("./strategies/TimeSeriesFeedWrapper");
exports.TimeSeriesFeedWrapper = TimeSeriesFeedWrapper_1.TimeSeriesFeedWrapper;
//# sourceMappingURL=index.js.map