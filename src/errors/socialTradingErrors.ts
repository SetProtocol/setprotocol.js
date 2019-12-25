/*
  Copyright 2019 Set Labs Inc.

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
import { Address } from 'set-protocol-utils';
import { BigNumber } from '@src/util';

export const socialTradingErrors = {
  ALLOCATION_EXCEEDS_ONE_HUNDERED_PERCENT: (allocation: BigNumber) => `Provided allocation ` +
  `${allocation.toString()} is greater than 100%.`,
  ALLOCATION_NOT_MULTIPLE_OF_ONE_PERCENT: (allocation: BigNumber) => `Provided allocation ` +
  `${allocation.toString()} is not multiple of 1% (10 ** 16)`,
  FEE_NOT_MULTIPLE_OF_ONE_BASIS_POINT: (fee: BigNumber) => `Provided fee ${fee.toString()} is not` +
  ` multiple of one basis point (10 ** 14)`,
  NOT_TRADER: (caller: Address) => `Caller ${caller} is not trader of tradingPool.`,
};