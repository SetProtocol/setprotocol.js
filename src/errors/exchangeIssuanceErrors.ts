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

export const exchangeIssuanceErrors = {
  ONLY_ONE_SEND_TOKEN: () => `Only one send token is allowed in Payable Exchange Issuance`,
  ONLY_ONE_RECEIVE_TOKEN: () => `Only one send token is allowed in Payable Exchange Redemption`,
  ISSUANCE_PARAM_QUANTITY_MUST_BE_EQUIVALENT: (
    rebalancingSetQuantity: BigNumber,
    impliedBaseSetQuantity: BigNumber,
  ) => `Rebalancing Set Quantity ${rebalancingSetQuantity.toString()} and the implied Base Set Quantity` +
       `${impliedBaseSetQuantity.toString()} must be equivalent.`,
  PAYMENT_TOKEN_NOT_WETH: (paymentToken: string, wethAddress: string) => `Payment token at ${paymentToken} is ` +
    `not the expected wrapped ether token at ${wethAddress}`,
  ISSUING_SET_NOT_BASE_SET: (setAddress: string, currentSet: string) => `Set token at ${setAddress} is ` +
    `not the expected rebalancing set token current Set at ${currentSet}`,
  REDEEMING_SET_NOT_BASE_SET: (setAddress: string, currentSet: string) => `Set token at ${setAddress} is ` +
    `not the expected rebalancing set token current Set at ${currentSet}`,
  ETHER_VALUE_NOT_UNDEFINED: () =>
    `Ether value should not be undefined`,
};