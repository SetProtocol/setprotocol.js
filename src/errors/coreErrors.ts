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

import { BigNumber } from '../util';

export const coreAPIErrors = {
  PROPORTIONS_DONT_ADD_UP_TO_1: () => `The component percentages inputted do not add up to 1`,
  ARRAYS_EQUAL_LENGTHS: (firstArray: string, secondArray: string) =>
    `The ${firstArray} and ${secondArray} arrays need to be equal lengths.`,
  EMPTY_ARRAY: (variable: string) => `The array ${variable} cannot be empty.`,
  EXPIRATION_PASSED: () => 'Expiration date has already passed.',
  FILL_EXCEEDS_AVAILABLE: () => 'The fill quantity supplied exceeds the amount available to fill.',
  INVALID_NATURAL_UNIT: (minNaturalUnit: BigNumber) =>
    `Natural unit must be larger than minimum unit, ${minNaturalUnit.toString()}, allowed by components.`,
  INVALID_ORDER_HASH_SCHEMA: () => `The order hash passed in is not in Bytes32 schema.`,
  QUANTITY_NEEDS_TO_BE_MULTIPLE_OF_NATURAL_UNIT: (quantityType: string) =>
    `${quantityType} needs to be multiple of natural unit.`,
  QUANTITY_NEEDS_TO_BE_POSITIVE: (quantity: BigNumber) =>
    `The quantity ${quantity.toString()} inputted needs to be greater than zero.`,
  SIGNATURE_MISMATCH: () => 'Signature does not match issuance order attributes.',
  STRING_CANNOT_BE_EMPTY: (variable: string) => `The string ${variable} cannot be empty.`,
  MAKER_TOKEN_INSUFFICIENT: (makerTokenAmount: BigNumber, ordersTakerTokenAmount: BigNumber) =>
    `The maker token amount, ${makerTokenAmount.toString()} of issuance order is not enough ` +
    `to fill the passed in order taker amount, ${ordersTakerTokenAmount.toString()}.`,
  ISSUANCE_ORDER_MAKER_ZERO_EX_TAKER_MISMATCH: () =>
    'Issuance order maker token needs to equal the taker asset of the 0x orders.',
  LIQUIDITY_REQUIRED_COMPONENT_MISMATCH: (
    component: string,
    liquidityAmount: BigNumber,
    componentAmount: BigNumber,
  ) =>
    `Token amount of ${component} from liquidity sources, ${liquidityAmount.toString()}, do ` +
    `not match up to the desired component fill amount of issuance order ${componentAmount.toString()}.`,
};

export const coreAssertionErrors = {
  MISSING_CORE_METHOD: (address: string) =>
    `Contract at ${address} does not implement Core interface.`,
};
