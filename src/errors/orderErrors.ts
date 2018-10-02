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

import { Address } from '../types/common';
import { BigNumber } from '../util';

export const orderErrors = {
  FILL_EXCEEDS_AVAILABLE: (availableFillAmount: BigNumber) =>
    `The fill quantity supplied exceeds the amount available to fill. Remaining fillable quantity: ` +
    `${availableFillAmount.toString()}.`,
  INSUFFICIENT_COMPONENT_AMOUNT_FROM_LIQUIDITY: (
    component: string,
    componentAmount: BigNumber,
    liquidityAmount: BigNumber
  ) => `Token amount of ${component} from liquidity sources, ${liquidityAmount.toString()}, do not match up ` +
       `to the desired component fill amount of issuance order ${componentAmount.toString()}.`,
  INSUFFICIENT_MAKER_TOKEN: (makerTokenAmount: BigNumber, ordersTakerTokenAmount: BigNumber) =>
    `The maker token amount, ${makerTokenAmount.toString()} is insufficient to fill the liquidity source` +
     `exchanges. Requires: ${ordersTakerTokenAmount.toString()}.`,
  INSUFFICIENT_KYBER_SOURCE_TOKEN_FOR_RATE: (
    sourceTokenQuantity: BigNumber,
    amountYield: BigNumber,
    destinationToken: Address,
  ) =>
    `Kyber trade conversion rate for souce token amount ${sourceTokenQuantity.toString()} will only ` +
    `yield ${amountYield.toString()} of ${destinationToken}. Try providing additional source token quantity.`,
  MAKER_TOKEN_AND_ZERO_EX_TAKER_TOKEN_MISMATCH: () =>
    '0x taker asset needs to be the same as the issuance order maker token.',
  MAKER_TOKEN_AND_KYBER_DESTINATION_TOKEN_MISMATCH: () =>
    'Kyber trade destination token cannot be the same as the issuance order maker token.',
  MAKER_TOKEN_AND_KYBER_SOURCE_TOKEN_MISMATCH: () =>
    'Kyber trade source token needs to be the same as the issuance order maker token.',
};
