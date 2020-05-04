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
var set_protocol_utils_1 = require("set-protocol-utils");
var util_1 = require("../util");
var units_1 = require("../util/units");
var accounts_1 = require("./accounts");
exports.DEFAULT_ACCOUNT = accounts_1.DEFAULT_ACCOUNT;
exports.DAI_FULL_TOKEN_UNITS = new util_1.BigNumber(Math.pow(10, 18));
exports.DAI_PRICE = new util_1.BigNumber(Math.pow(10, 18));
exports.DEFAULT_AUCTION_PRICE_DENOMINATOR = new util_1.BigNumber(1000);
exports.DEFAULT_AUCTION_PRICE_NUMERATOR = new util_1.BigNumber(2000);
exports.DEFAULT_GAS_LIMIT = 6712390; // default of 6.7 million gas
exports.DEFAULT_GAS_PRICE = 6000000000; // 6 gwei
exports.DEFAULT_AUCTION_TIME_TO_PIVOT = new util_1.BigNumber(100000);
exports.DEFAULT_AUCTION_START_PRICE = new util_1.BigNumber(500);
exports.DEFAULT_AUCTION_PIVOT_PRICE = new util_1.BigNumber(1000);
exports.DEFAULT_REBALANCING_MINIMUM_NATURAL_UNIT = new util_1.BigNumber(Math.pow(10, 4));
exports.DEFAULT_REBALANCING_MAXIMUM_NATURAL_UNIT = new util_1.BigNumber(Math.pow(10, 12));
exports.DEFAULT_REBALANCING_NATURAL_UNIT = new util_1.BigNumber(Math.pow(10, 10));
exports.DEFAULT_UNIT_SHARES = new util_1.BigNumber(Math.pow(10, 10));
exports.DEPLOYED_TOKEN_QUANTITY = units_1.ether(100000000000);
exports.E18 = new util_1.BigNumber(10).pow(18);
exports.NULL_ADDRESS = set_protocol_utils_1.SetProtocolUtils.CONSTANTS.NULL_ADDRESS;
exports.ONE_DAY_IN_SECONDS = new util_1.BigNumber(86400);
exports.ONE_HOUR_IN_SECONDS = new util_1.BigNumber(3600);
exports.ONE_WEEK_IN_SECONDS = new util_1.BigNumber(604800);
exports.ONE_YEAR_IN_SECONDS = new util_1.BigNumber(86400 * 365.25);
exports.SET_FULL_TOKEN_UNITS = new util_1.BigNumber(Math.pow(10, 18));
exports.STANDARD_DECIMALS = new util_1.BigNumber(18); // ETH natural unit, wei
exports.STANDARD_SUPPLY = new util_1.BigNumber(100000000000000000000); // 100 Ether
exports.STANDARD_TRANSFER_VALUE = new util_1.BigNumber(1000000000000000000); // 1 Ether
exports.UNLIMITED_ALLOWANCE_IN_BASE_UNITS = set_protocol_utils_1.SetProtocolUtils.CONSTANTS.UNLIMITED_ALLOWANCE_IN_BASE_UNITS; // 2 ** 256 - 1
exports.VALUE_TO_CENTS_CONVERSION = new util_1.BigNumber(Math.pow(10, 16));
exports.WBTC_FULL_TOKEN_UNITS = new util_1.BigNumber(Math.pow(10, 8));
exports.WETH_FULL_TOKEN_UNITS = new util_1.BigNumber(Math.pow(10, 18));
exports.ZERO = set_protocol_utils_1.SetProtocolUtils.CONSTANTS.ZERO;
exports.ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000';
// Returns a big number that can be passed in as a smart contract parameter
function UINT256(value) {
    return new util_1.BigNumber(value);
}
exports.UINT256 = UINT256;
exports.TX_DEFAULTS = {
    from: accounts_1.DEFAULT_ACCOUNT,
    gasPrice: exports.DEFAULT_GAS_PRICE,
    gas: exports.DEFAULT_GAS_LIMIT,
};
//# sourceMappingURL=index.js.map