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
import { Bytes, ExchangeIssueParams, SetProtocolUtils } from 'set-protocol-utils';

import { coreAPIErrors, exchangeIssueErrors } from '../errors';
import { Assertions } from '../assertions';
import { PayableExchangeIssueWrapper, RebalancingSetTokenWrapper, SetTokenWrapper } from '../wrappers';
import { Address, KyberTrade, Tx, ZeroExSignedFillOrder } from '../types/common';
import { BigNumber } from '@src/util';

/**
 * @title PayableExchangeIssueAPI
 * @author Set Protocol
 *
 * A library for issuing RebalancingSets using Ether.
 */
export class PayableExchangeIssueAPI {
  private web3: Web3;
  private assert: Assertions;
  private payableExchangeIssue: PayableExchangeIssueWrapper;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private setToken: SetTokenWrapper;
  private setProtocolUtils: SetProtocolUtils;
  private wrappedEther: Address;

  /**
   * Instantiates a new PayableExchangeIssueAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3                  The Web3.js Provider instance you would like the SetProtocol.js library
   *                                to use for interacting with the Ethereum network
   * @param assertions            An instance of the Assertion library
   * @param payableExchangeIssue  An unstance if the PayableExchangeIssueWrapper Library
   * @param wrappedEtherAddress   Address of the deployed canonical wrapped ether contract
   */
  constructor(
    web3: Web3,
    assertions: Assertions,
    payableExchangeIssue: PayableExchangeIssueWrapper,
    wrappedEtherAddress: Address,
  ) {
    this.web3 = web3;
    this.setProtocolUtils = new SetProtocolUtils(this.web3);
    this.assert = assertions;
    this.payableExchangeIssue = payableExchangeIssue;
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(this.web3);
    this.setToken = new SetTokenWrapper(this.web3);
    this.wrappedEther = wrappedEtherAddress;
  }

  /**
   * Generates the Kyber Trade struct used for issuance of BTC ETH Rebalancing Sets.
   *
   * @param  wrappedBitcoinAddress            Address of wrapped Bitcoin
   * @param  requiredWrappedBitcoin           Quantity of wrapped Bitcoin required
   * @param  ethAllocatedToWBtc               Value of Ether allocated to acquisition of Bitcoin
   * @return                                  Kyber Trade object
   */
  public generateBtcEthKyberTrade(
    wrappedBitcoinAddress: Address,
    requiredWrappedBitcoin: BigNumber,
    wethAllocatedToWBtc: BigNumber,
  ): KyberTrade {
    return {
      destinationToken: wrappedBitcoinAddress,
      sourceTokenQuantity: wethAllocatedToWBtc,
      minimumConversionRate: wethAllocatedToWBtc.div(requiredWrappedBitcoin),
      maxDestinationQuantity: requiredWrappedBitcoin,
    };
  }

  /**
   * Generates the payableExchangeParams struct required for issueRebalancingSetWithEtherAsync specifically
   * for the issuance of Rebalancing Sets with Bitcoin and Ether
   *
   * @param  rebalancingSetAddress            Address of the Rebalancing Set to issue
   * @param  rebalancingSetIssueQuantity      Quantity of rebalancing Set to issue
   * @param  wBtcAddress                      Address of wrapped Bitcoin
   * @param  ethAllocatedToWBtc               Value of Ether allocated to acquisition of Bitcoin
   * @param  etherValue                       Value of Ether to send in the issueRebalancingSetWithEther transaction
   * @return                                  ExchangeIssueParams object
   */
  public async generateBtcEthExchangeIssueParamsAsync(
    rebalancingSetAddress: Address,
    rebalancingSetIssueQuantity: BigNumber,
    wrappedBitcoinAddress: Address,
    ethAllocatedToWBtc: BigNumber,
    etherValue: BigNumber,
  ): Promise<ExchangeIssueParams> {
      this.assert.schema.isValidAddress('rebalancingSetAddress', rebalancingSetAddress);
      this.assert.common.greaterThanZero(
        rebalancingSetIssueQuantity,
        coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(rebalancingSetIssueQuantity)
      );
      this.assert.schema.isValidAddress('wrappedBitcoinAddress', wrappedBitcoinAddress);
      this.assert.common.greaterThanZero(
        ethAllocatedToWBtc,
        coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(ethAllocatedToWBtc)
      );

      const [
        baseBtcEthSet,
        rebalancingSetUnitShares,
        rebalancingSetNaturalUnit,
      ] = await Promise.all([
        this.rebalancingSetToken.currentSet(rebalancingSetAddress),
        this.rebalancingSetToken.unitShares(rebalancingSetAddress),
        this.setToken.naturalUnit(rebalancingSetAddress),
      ]);

      const [
        [wrappedBtcAddress, wrappedEtherAddress],
        [wrappedBtcUnits, wrappedEthUnits],
        baseSetNaturalUnit,
      ] = await Promise.all([
        this.setToken.getComponents(baseBtcEthSet),
        this.setToken.getUnits(baseBtcEthSet),
        this.setToken.naturalUnit(baseBtcEthSet),
      ]);

      const baseSetRequired = rebalancingSetIssueQuantity.mul(rebalancingSetUnitShares).div(rebalancingSetNaturalUnit);
      const requiredBtc = baseSetRequired.mul(wrappedBtcUnits).div(baseSetNaturalUnit);
      const requiredWeth = baseSetRequired.mul(wrappedEthUnits).div(baseSetNaturalUnit);

      const totalWethRequired = ethAllocatedToWBtc.plus(requiredWeth);

      await this.assertGenerateExchangeIssueParamsAsync(
        rebalancingSetAddress,
        rebalancingSetIssueQuantity,
        wrappedBitcoinAddress,
        wrappedBtcAddress,
        wrappedEtherAddress,
        baseBtcEthSet,
        baseSetRequired,
        ethAllocatedToWBtc,
        totalWethRequired,
        etherValue,
      );

      const exchangeIssueData: ExchangeIssueParams = {
        setAddress: baseBtcEthSet,
        paymentToken: this.wrappedEther,
        paymentTokenAmount: ethAllocatedToWBtc,
        quantity: baseSetRequired,
        requiredComponents: [wrappedBitcoinAddress],
        requiredComponentAmounts: [requiredBtc],
      };

      return exchangeIssueData;
  }

  /**
   * Issues a Set to the transaction signer. Must have component tokens in the correct quantites in either
   * the vault or in the signer's wallet. Component tokens must be approved to the Transfer
   * Proxy contract via setTransferProxyAllowanceAsync
   *
   * @param  rebalancingSetAddress    Address of the Rebalancing Set to issue
   * @param  exchangeIssueParams      Parameters required to facilitate an exchange issue
   * @param  orders                   A list of signed 0x orders or kyber trades
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async issueRebalancingSetWithEtherAsync(
    rebalancingSetAddress: Address,
    exchangeIssueParams: ExchangeIssueParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx
  ): Promise<string> {
    await this.assertIssueRebalancingSetWithEtherAsync(
      rebalancingSetAddress,
      exchangeIssueParams,
      orders,
      txOpts.from,
    );
    await this.assertExchangeIssueParams(rebalancingSetAddress, exchangeIssueParams);

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.payableExchangeIssue.issueRebalancingSetWithEther(
      rebalancingSetAddress,
      exchangeIssueParams,
      orderData,
      txOpts,
    );
  }


  /* ============ Private Assertions ============ */

  private async assertGenerateExchangeIssueParamsAsync(
    rebalancingSetAddress: Address,
    rebalancingSetIssueQuantity: BigNumber,
    inputWrappedBitcoinAddress: Address,
    retrievedWrappedBtcAddress: Address,
    retrievedWrappedEthAddress: Address,
    baseSetAddress: Address,
    baseSetRequired: BigNumber,
    ethAllocatedToWBtc: BigNumber,
    totalWethRequired: BigNumber,
    etherValue: BigNumber,
  ) {
    // Rebalancing Set Issue quantity is multiple of natural unit
    await this.assert.setToken.isMultipleOfNaturalUnit(
      rebalancingSetAddress,
      rebalancingSetIssueQuantity,
      'Rebalancing Set Issue quantity',
    );

    // Assert wBtc == bitcoin address passed in
    this.assert.common.isEqualAddress(
      inputWrappedBitcoinAddress,
      retrievedWrappedBtcAddress,
      exchangeIssueErrors.COMPONENT_ADDRESS_MISMATCH(inputWrappedBitcoinAddress, retrievedWrappedBtcAddress)
    );

    // Require wrappedEther == wrapped Ether from the units
    this.assert.common.isEqualAddress(
      this.wrappedEther,
      retrievedWrappedEthAddress,
      exchangeIssueErrors.COMPONENT_ADDRESS_MISMATCH(this.wrappedEther, retrievedWrappedEthAddress)
    );

    this.assert.common.isGreaterOrEqualThan(
      etherValue,
      totalWethRequired,
      `PayableExchangeIssueAPI: Total inputted ether must exceed required quantities`,
    );
  }

  private async assertIssueRebalancingSetWithEtherAsync(
    rebalancingSetAddress: Address,
    exchangeIssueParams: ExchangeIssueParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    transactionCaller: Address,
  ) {
    const { setAddress, paymentToken } = exchangeIssueParams;


    this.assert.schema.isValidAddress('txOpts.from', transactionCaller);
    this.assert.schema.isValidAddress('rebalancingSetAddress', rebalancingSetAddress);
    this.assert.common.isNotEmptyArray(orders, coreAPIErrors.EMPTY_ARRAY('orders'));

    const baseSetAddress = await this.rebalancingSetToken.currentSet(rebalancingSetAddress);

    // Assert the set address is the rebalancing set address's current set
    this.assert.common.isEqualAddress(
      setAddress,
      baseSetAddress,
      exchangeIssueErrors.ISSUING_SET_NOT_BASE_SET(setAddress, baseSetAddress)
    );

    // Assert payment token is wrapped ether
    this.assert.common.isEqualAddress(
      paymentToken,
      this.wrappedEther,
      exchangeIssueErrors.PAYMENT_TOKEN_NOT_WETH(paymentToken, this.wrappedEther)
    );

    await this.assert.order.assertExchangeIssueOrdersValidity(
      exchangeIssueParams,
      orders,
    );
  }

  private async assertExchangeIssueParams(
    rebalancingSetAddress: Address,
    exchangeIssueParams: ExchangeIssueParams,
  ) {
    const {
      setAddress,
      paymentToken,
      paymentTokenAmount,
      quantity,
      requiredComponents,
      requiredComponentAmounts,
    } = exchangeIssueParams;

    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.schema.isValidAddress('paymentToken', paymentToken);
    this.assert.common.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
    this.assert.common.greaterThanZero(
      paymentTokenAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(paymentTokenAmount)
    );
    this.assert.common.isEqualLength(
      requiredComponents,
      requiredComponentAmounts,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('requiredComponents', 'requiredComponentAmounts'),
    );
    await this.assert.order.assertRequiredComponentsAndAmounts(
      requiredComponents,
      requiredComponentAmounts,
      setAddress,
    );

    await this.assert.setToken.isMultipleOfNaturalUnit(
      setAddress,
      quantity,
      `Quantity of Exchange issue Params`,
    );
  }

}
