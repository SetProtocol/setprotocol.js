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

import * as _ from 'lodash';
import * as ethUtil from 'ethereumjs-util';
import { BigNumber } from './bignumber';

import { constants } from './constants';
import { paddedBufferForPrimitive } from './encoding';
import { generateKyberTradesBuffer } from './kyber';
import { generateZeroExOrdersBuffer } from './zeroEx';
import {
  Bytes,
  Exchanges,
  ExchangeOrder,
} from './types';
import { isZeroExOrder, isKyberTrade } from './typeGuards';


export function generateTimestamp(minutes: number): BigNumber {
  const timeToExpiration = minutes * 60 * 1000;

  return new BigNumber(Math.floor((Date.now() + timeToExpiration) / 1000));
}

export function generateSalt(): BigNumber {
  const randomNumber = BigNumber.random(constants.MAX_DIGITS_IN_UNSIGNED_256_INT);
  const factor = new BigNumber(10).pow(constants.MAX_DIGITS_IN_UNSIGNED_256_INT - 1);

  return randomNumber.times(factor).round();
}

/* ============ Order Data Serialization ============ */

/**
 * Generates a byte string representing serialized exchange orders across different exchanges.
 *
 * @param  fillAmount          Amount of Set being filled
 * @param  orders              Array of order objects from various exchanges
 * @param  web3                web3 instance instantiated with `new Web3(provider);`
 * @return                     Buffer with all exchange orders formatted and concatenated
 */

export function generateSerializedOrders(orders: ExchangeOrder[]): Bytes {
  const orderBuffer: Buffer[] = [];
  const exchanges: Exchanges = {
    'ZERO_EX': [],
    'KYBER': [],
    'TAKER_WALLET': [],
  };

  // Sort exchange orders by exchange
  _.forEach(orders, (order: ExchangeOrder) => {
    let exchangeOrders: any;
    if (isZeroExOrder(order)) {
      exchangeOrders = exchanges.ZERO_EX;
    } else if (isKyberTrade(order)) {
       exchangeOrders = exchanges.KYBER;
     }

    if (exchangeOrders) exchangeOrders.push(order);
  });

  // Loop through all exchange orders and create buffers
  _.forEach(exchanges, (exchangeOrders: any[], key: string) => {
    if (exchangeOrders.length === 0) return;

    if (key === 'ZERO_EX') {
      orderBuffer.push(generateZeroExOrdersBuffer(exchangeOrders));
    } else if (key === 'KYBER') {
      orderBuffer.push(generateKyberTradesBuffer(exchangeOrders));
    }
  });
  return ethUtil.bufferToHex(Buffer.concat(orderBuffer));
}

/**
 * Generates an exchange order header represented as a buffer array.
 *
 * @param  exchangeId            Enum corresponding to exchange id, see constants.EXCHANGES
 * @param  orderCount            Number of exchange orders
 * @param  totalOrderBodyLength  Length of order data buffer
 * @return                       Array containing all inputs as buffers
 */
export function generateExchangeOrderHeader(
  exchangeId: string,
  orderCount: number,
  totalOrderBodyLength: number,
): Buffer[] {
  return [
    paddedBufferForPrimitive(exchangeId),
    paddedBufferForPrimitive(orderCount),
    paddedBufferForPrimitive(totalOrderBodyLength),
  ];
}
