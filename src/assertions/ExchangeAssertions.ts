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
import Web3 from 'web3';
import { ExchangeIssuanceParams, SetProtocolUtils } from 'set-protocol-utils';

import { CoreContract } from 'set-protocol-contracts';

import { coreAPIErrors, exchangeErrors } from '../errors';
import { CommonAssertions } from './CommonAssertions';
import { SchemaAssertions } from './SchemaAssertions';
import { ERC20Assertions } from './ERC20Assertions';
import { SetTokenAssertions } from './SetTokenAssertions';
import { BigNumber, calculatePartialAmount } from '../util';
import { Address, KyberTrade, ZeroExSignedFillOrder } from '../types/common';
import { NULL_ADDRESS, ZERO } from '@src/constants';

export class ExchangeAssertions {
  private web3: Web3;
  private erc20Assertions: ERC20Assertions;
  private schemaAssertions: SchemaAssertions;
  private commonAssertions: CommonAssertions;
  private setTokenAssertions: SetTokenAssertions;

  constructor(web3: Web3) {
    this.web3 = web3;
    this.erc20Assertions = new ERC20Assertions(web3);
    this.schemaAssertions = new SchemaAssertions();
    this.commonAssertions = new CommonAssertions();
    this.setTokenAssertions = new SetTokenAssertions(web3);
  }

  public async assertSendTokenInputs(
    sendTokens: Address[],
    sendTokenExchangeIds: BigNumber[],
    sendTokenAmounts: BigNumber[],
    coreAddress: Address,
  ) {
    await Promise.all(
      sendTokens.map(async (sendToken, i) => {
        this.commonAssertions.isValidString(sendToken, coreAPIErrors.STRING_CANNOT_BE_EMPTY('sendToken'));
        this.schemaAssertions.isValidAddress('sendToken', sendToken);
        await this.erc20Assertions.implementsERC20(sendToken);

        this.commonAssertions.isNotEmptyArray(sendTokens, coreAPIErrors.EMPTY_ARRAY('sendTokens'));
        this.commonAssertions.isEqualLength(
          sendTokens,
          sendTokenAmounts,
          coreAPIErrors.ARRAYS_EQUAL_LENGTHS('sendTokens', 'sendTokenAmounts'),
        );
        this.commonAssertions.isEqualLength(
          sendTokens,
          sendTokenExchangeIds,
          coreAPIErrors.ARRAYS_EQUAL_LENGTHS('sendTokens', 'sendTokenExchangeIds'),
        );

        this.commonAssertions.greaterThanZero(
          sendTokenAmounts[i],
          coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(sendTokenAmounts[i]),
        );

        await this.isValidExchangeId(coreAddress, sendTokenExchangeIds[i]);
      }),
    );
  }

  public async isValidExchangeId(
    coreAddress: Address,
    exchangeId: BigNumber,
  ): Promise<void> {
    const coreInstance = await CoreContract.at(coreAddress, this.web3, {});

    const exchangeAddress = await coreInstance.exchangeIds.callAsync(exchangeId);
    if (exchangeAddress === NULL_ADDRESS) {
      throw new Error(exchangeErrors.INVALID_EXCHANGE_ID(exchangeId));
    }
  }

  public async assertReceiveTokenInputs(
    receiveTokens: Address[],
    receiveTokenAmounts: BigNumber[],
    setAddress: Address,
  ) {
    await Promise.all(
      receiveTokens.map(async (tokenAddress, i) => {
        this.commonAssertions.isValidString(tokenAddress, coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'));
        this.schemaAssertions.isValidAddress('tokenAddress', tokenAddress);
        await this.erc20Assertions.implementsERC20(tokenAddress);
        await this.setTokenAssertions.isComponent(setAddress, tokenAddress);

        this.commonAssertions.greaterThanZero(
          receiveTokenAmounts[i],
          coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(receiveTokenAmounts[i]),
        );
      }),
    );
  }

  public async assertExchangeIssuanceOrdersValidity(
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
  ) {
    const {
      setAddress,
      quantity,
      receiveTokens,
      receiveTokenAmounts,
    } = exchangeIssuanceParams;

    await Promise.all(
      _.map(orders, async (order: any) => {
        if (SetProtocolUtils.isZeroExOrder(order)) {
          await this.isValidZeroExOrderFill(setAddress, quantity, order);
        } else if (SetProtocolUtils.isKyberTrade(order)) {
          await this.isValidKyberTradeFill(setAddress, order);
        }
      })
    );

    this.isValidLiquidityAmounts(
      quantity,
      receiveTokens,
      receiveTokenAmounts,
      quantity,
      orders,
    );
  }

  /* ============ Private Helpers =============== */

  private isValidLiquidityAmounts(
    quantity: BigNumber,
    receiveTokens: Address[],
    receiveTokenAmounts: BigNumber[],
    quantityToFill: BigNumber,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
  ) {
    const componentAmountsFromLiquidity = this.calculateLiquidityFills(orders);

    _.each(receiveTokens, (component, i) => {
      const receiveTokenAmountForFillQuantity = calculatePartialAmount(
        receiveTokenAmounts[i],
        quantityToFill,
        quantity
      );

      const normalizedTokenAddress = component.toLowerCase();

      this.commonAssertions.isNotUndefined(
        componentAmountsFromLiquidity[normalizedTokenAddress],
        exchangeErrors.INSUFFIENT_LIQUIDITY_FOR_REQUIRED_COMPONENT(normalizedTokenAddress),
      );

      this.commonAssertions.isEqualBigNumber(
        componentAmountsFromLiquidity[normalizedTokenAddress],
        receiveTokenAmountForFillQuantity,
        exchangeErrors.INSUFFICIENT_COMPONENT_AMOUNT_FROM_LIQUIDITY(
          normalizedTokenAddress,
          componentAmountsFromLiquidity[normalizedTokenAddress],
          receiveTokenAmountForFillQuantity,
        ),
      );
    });
  }

  private calculateLiquidityFills(
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
  ): { [addr: string]: BigNumber } {
    let requiredComponentFills: { [addr: string]: BigNumber } = {};

    _.each(orders, (order: any) => {
      // Count up components of issuance order that have been filled from this liquidity order
      requiredComponentFills = this.addLiquidityOrderContribution(order, requiredComponentFills);
    });

    return requiredComponentFills;
  }

  /*
   * This takes in an order from a liquidity source and adds up the amount of token being filled
   * for a given component.
   */
  private addLiquidityOrderContribution(
    order: any,
    requiredComponentFills: { [addr: string]: BigNumber },
  ): { [addr: string]: BigNumber } {
    let existingAmount: BigNumber;
    let currentOrderAmount: BigNumber;
    if (SetProtocolUtils.isZeroExOrder(order)) {
      const {
        fillAmount,
        makerAssetAmount,
        makerAssetData,
        takerAssetAmount,
      } = order;
      const tokenAddress = SetProtocolUtils.extractAddressFromAssetData(makerAssetData).toLowerCase();

      // Accumulate fraction of 0x order that was filled
      existingAmount = requiredComponentFills[tokenAddress] || ZERO;
      currentOrderAmount = calculatePartialAmount(makerAssetAmount, fillAmount, takerAssetAmount);

      return Object.assign(requiredComponentFills, { [tokenAddress]: existingAmount.plus(currentOrderAmount) });
    } else if (SetProtocolUtils.isKyberTrade(order)) {
      const {
        destinationToken,
        maxDestinationQuantity,
      } = order;
      const tokenAddress = destinationToken.toLowerCase();

      existingAmount = requiredComponentFills[tokenAddress] || ZERO;
      currentOrderAmount = maxDestinationQuantity;

      return Object.assign(requiredComponentFills, { [tokenAddress]: existingAmount.plus(currentOrderAmount) });
    }

    return requiredComponentFills;
  }

  private async isValidKyberTradeFill(
    setAddress: Address,
    trade: KyberTrade
  ) {
    this.commonAssertions.greaterThanZero(
      trade.sourceTokenQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(trade.sourceTokenQuantity),
    );

    // Kyber trade parameters will yield enough component token
    const amountComponentTokenFromTrade = trade.minimumConversionRate.mul(trade.sourceTokenQuantity);
    this.commonAssertions.isGreaterOrEqualThan(
      amountComponentTokenFromTrade,
      trade.maxDestinationQuantity,
      exchangeErrors.INSUFFICIENT_KYBER_SOURCE_TOKEN_FOR_RATE(
        trade.sourceTokenQuantity,
        amountComponentTokenFromTrade,
        trade.destinationToken
      )
    );
  }

  private async isValidZeroExOrderFill(
    setAddress: Address,
    quantityToFill: BigNumber,
    zeroExOrder: ZeroExSignedFillOrder,
  ) {
    this.commonAssertions.greaterThanZero(
      zeroExOrder.fillAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(zeroExOrder.fillAmount),
    );

    // 0x order maker has sufficient balance of the maker token
    await this.erc20Assertions.hasSufficientBalanceAsync(
      SetProtocolUtils.extractAddressFromAssetData(zeroExOrder.makerAssetData),
      zeroExOrder.makerAddress,
      zeroExOrder.makerAssetAmount,
    );
  }
}
