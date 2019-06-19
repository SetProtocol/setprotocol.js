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

import { SetProtocolUtils } from 'set-protocol-utils';

import { BigNumber } from '../util';
import { ether } from '../util/units';
import { DEFAULT_ACCOUNT } from './accounts';
import { Tx } from '../types/common';

export { DEFAULT_ACCOUNT };
export const DEFAULT_AUCTION_PRICE_DENOMINATOR = new BigNumber(1000);
export const DEFAULT_AUCTION_PRICE_NUMERATOR = new BigNumber(2000);
export const DEFAULT_GAS_LIMIT: number = 6712390; // default of 6.7 million gas
export const DEFAULT_GAS_PRICE: number = 6000000000; // 6 gwei
export const DEFAULT_REBALANCING_MINIMUM_NATURAL_UNIT = new BigNumber(10 ** 4);
export const DEFAULT_REBALANCING_MAXIMUM_NATURAL_UNIT = new BigNumber(10 ** 12);
export const DEFAULT_REBALANCING_NATURAL_UNIT = new BigNumber(10 ** 10);
export const DEFAULT_UNIT_SHARES = new BigNumber(10 ** 10);
export const DEPLOYED_TOKEN_QUANTITY: BigNumber = ether(100000000000);
export const E18: BigNumber = new BigNumber(10).pow(18);
export const NULL_ADDRESS = SetProtocolUtils.CONSTANTS.NULL_ADDRESS;
export const ONE_DAY_IN_SECONDS = new BigNumber(86400);
export const ONE_HOUR_IN_SECONDS = new BigNumber(3600);
export const ONE_WEEK_IN_SECONDS = new BigNumber(604800);
export const STANDARD_DECIMALS: BigNumber = new BigNumber(18); // ETH natural unit, wei
export const STANDARD_SUPPLY: BigNumber = new BigNumber(100000000000000000000); // 100 Ether
export const STANDARD_TRANSFER_VALUE: BigNumber = new BigNumber(1000000000000000000); // 1 Ether
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS: BigNumber =
  SetProtocolUtils.CONSTANTS.UNLIMITED_ALLOWANCE_IN_BASE_UNITS; // 2 ** 256 - 1
export const ZERO: BigNumber = SetProtocolUtils.CONSTANTS.ZERO;

// Returns a big number that can be passed in as a smart contract parameter
export function UINT256(value: number): BigNumber {
  return new BigNumber(value);
}

export const TX_DEFAULTS: Tx = {
  from: DEFAULT_ACCOUNT,
  gasPrice: DEFAULT_GAS_PRICE,
  gas: DEFAULT_GAS_LIMIT,
};
