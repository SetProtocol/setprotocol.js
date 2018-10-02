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


export { DEFAULT_ACCOUNT };
export const DEFAULT_GAS_LIMIT: BigNumber = new BigNumber(6712390); // default of 6.7 million gas
export const DEFAULT_GAS_PRICE: BigNumber = new BigNumber(6000000000); // 6 gwei
export const DEPLOYED_TOKEN_QUANTITY: BigNumber = ether(100000000000);
export const NULL_ADDRESS = SetProtocolUtils.CONSTANTS.NULL_ADDRESS;
export const STANDARD_DECIMALS: BigNumber = new BigNumber(18); // ETH natural unit, wei
export const STANDARD_SUPPLY: BigNumber = new BigNumber(100000000000000000000); // 100 Ether
export const STANDARD_TRANSFER_VALUE: BigNumber = new BigNumber(1000000000000000000); // 1 Ether
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS: BigNumber =
  SetProtocolUtils.CONSTANTS.UNLIMITED_ALLOWANCE_IN_BASE_UNITS; // 2 ** 256 - 1
export const ZERO: BigNumber = SetProtocolUtils.CONSTANTS.ZERO;
export const ONE: BigNumber = new BigNumber(1);
export const TWO: BigNumber = new BigNumber(2);
export const TEN: BigNumber = new BigNumber(10);
export const EIGHTEEN: BigNumber = new BigNumber(18);
export const E18: BigNumber = new BigNumber(10).pow(18);

export const TX_DEFAULTS = {
  from: DEFAULT_ACCOUNT,
  gasPrice: DEFAULT_GAS_PRICE,
  gas: DEFAULT_GAS_LIMIT,
};
