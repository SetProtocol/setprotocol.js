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
import * as Web3 from 'web3';

import { BigNumber } from '.';
import { Address, Bytes32, TakerWalletOrder } from '../types/common';

// Replace with paddedBufferForData from set-protocol-utils package

function paddedBufferForData(
  data: any
): Buffer {
  return ethUtil.setLengthLeft(ethUtil.toBuffer(data), 32);
}

/**
 * Takes a taker wallet order object and turns it into a buffer.
 *
 * @param  takerTokenAddress Address of the token the taker will fill in the taker wallet order
 * @param  takerTokenAmount  Amount of tokens the taker will fill in the order
 * @param  web3              web3 instance
 * @return                   Taker wallet order as a buffer
 */

export function takerWalletOrderToBuffer(
  takerTokenAddress: Address,
  takerTokenAmount: BigNumber,
  web3: Web3,
): Buffer {
  const takerWalletOrder: Buffer[] = [];
  takerWalletOrder.push(paddedBufferForData(takerTokenAddress));
  takerWalletOrder.push(paddedBufferForData(web3.toHex(takerTokenAmount)));
  return Buffer.concat(takerWalletOrder);
}

/**
 * Takes taker wallet orders and generates a taker wallet data buffer.
 *
 * @param  makerTokenAddress Address of the token used to pay for the order
 * @param  orders            Array of TakerWalletOrders
 * @param  web3              web3 instance
 * @return                   Entire taker wallet exchange data as a buffer
 */

export function generateTakerWalletOrderBuffer(
  makerTokenAddress: Address,
  orders: TakerWalletOrder[],
  web3: Web3,
): Buffer {
  // Generate header for direct fill order
  const takerOrderHeader: Buffer[] = [
    paddedBufferForData(3),
    paddedBufferForData(orders.length), // Include the number of orders as part of header
    paddedBufferForData(makerTokenAddress),
    paddedBufferForData(0), // Taker wallet orders do not take any maker token to execute
  ];
  // Turn all direct fill orders to buffers
  const takerOrderBody: Buffer = _.map(orders, ({takerTokenAddress, takerTokenAmount}) =>
    takerWalletOrderToBuffer(takerTokenAddress, takerTokenAmount, web3));
  return Buffer.concat([
    Buffer.concat(takerOrderHeader),
    Buffer.concat(takerOrderBody),
  ]);
}

/**
 * Generates an entire serialized exchange order
 *
 * @param  makerTokenAddress Address of the token used to pay for the order
 * @param  orders            Array of TakerWalletOrders
 * @param  web3              web3 instance
 * @return                   Entire taker wallet exchange data as a buffer
 */

export function generateSerializedOrders(
  makerTokenAddress: Address,
  orders: object[],
  web3: Web3,
): Bytes32 {
  const orderBuffer: Buffer = [];
  // Sort exchange orders by exchange
  const exchanges: object = {};
  _.forEach(orders, order => {
    const { exchange } = order;
    if (exchanges[exchange]) {
      exchanges[exchange].push(order);
    } else {
      exchanges[exchange] = [order];
    }
  });
  // Loop through all exchange orders and create buffers
  _.forEach(exchanges, (exchangeOrders, key) => {
    if (key === '1') { // Todo: Replace with set-protocol-contracts constants
      // Handle Zero Ex
    } else if (key === '2') {
      // Handle Kyber Network
    } else if (key === '3') {
      orderBuffer.push(generateTakerWalletOrderBuffer(makerTokenAddress, exchangeOrders, web3));
    }
  });
  return ethUtil.bufferToHex(Buffer.concat(orderBuffer));
}
