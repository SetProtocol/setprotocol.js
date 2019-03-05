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
import { Bytes, ExchangeIssuanceParams, SetProtocolUtils } from 'set-protocol-utils';

import { Assertions } from '../assertions';
import { ZERO } from '../constants';
import { BigNumber,  } from '../util';
import {
  CoreWrapper,
  ExchangeIssuanceModuleWrapper,
  ERC20Wrapper,
  KyberNetworkWrapper,
  SetTokenWrapper,
  VaultWrapper,
 } from '../wrappers';
import { Address, Component, KyberTrade, SetProtocolConfig, Tx, ZeroExSignedFillOrder } from '../types/common';
import { coreAPIErrors } from '../errors';

/**
 * @title ExchangeIssuanceAPI
 * @author Set Protocol
 *
 * A library for issuing RebalancingSets using Ether.
 */
export class ExchangeIssuanceAPI {
  private web3: Web3;
  private assert: Assertions;
  private exchangeIssuance: ExchangeIssuanceModuleWrapper;
  private setProtocolUtils: SetProtocolUtils;

  private core: CoreWrapper;
  private setToken: SetTokenWrapper;
  private erc20: ERC20Wrapper;
  private vault: VaultWrapper;
  private kyberNetworkWrapper: KyberNetworkWrapper;

  /**
   * Instantiates a new ExchangeIssuanceAPI instance that contains methods for issuing and redeeming Sets
   *
   * @param web3                         The Web3.js Provider instance you would like the SetProtocol.js library
   *                                      to use for interacting with the Ethereum network
   * @param assertions                   An instance of the Assertion library
   * @param config      Configuration object conforming to SetProtocolConfig with Set Protocol's contract addresses
   */
  constructor(
    web3: Web3,
    assertions: Assertions,
    config: SetProtocolConfig,
  ) {
    this.web3 = web3;
    this.setProtocolUtils = new SetProtocolUtils(this.web3);
    this.assert = assertions;
    this.core = new CoreWrapper(this.web3, config.coreAddress, config.transferProxyAddress, config.vaultAddress);
    this.exchangeIssuance = new ExchangeIssuanceModuleWrapper(web3, config.exchangeIssuanceModuleAddress);
    this.erc20 = new ERC20Wrapper(this.web3);
    this.kyberNetworkWrapper = new KyberNetworkWrapper(this.web3, config.kyberNetworkWrapperAddress);
    this.setToken = new SetTokenWrapper(this.web3);
    this.vault = new VaultWrapper(this.web3, config.vaultAddress);
  }

  /**
   * Issues a Set to the transaction signer. Must have payment tokens in the correct quantites
   * Payment tokens must be approved to the TransferProxy contract via setTransferProxyAllowanceAsync
   *
   * @param  exchangeIssuanceParams      Parameters required to facilitate an exchange issue
   * @param  orders                   A list of signed 0x orders or kyber trades
   * @param  txOpts        Transaction options object conforming to `Tx` with signer, gas, and gasPrice data
   * @return               Transaction hash
   */
  public async exchangeIssueAsync(
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
    txOpts: Tx
  ): Promise<string> {
    await this.assertExchangeIssuanceParams(exchangeIssuanceParams, orders);

    // Assert receive tokens are components of the Set
    await this.assertExchangeIssueReceiveInputs(exchangeIssuanceParams);

    const orderData: Bytes = await this.setProtocolUtils.generateSerializedOrders(orders);
    return this.exchangeIssuance.exchangeIssue(
      exchangeIssuanceParams,
      orderData,
      txOpts,
    );
  }

  /**
   * Calculates additional amounts of each component token in a Set needed in order to issue a specific quantity of
   * the Set. This includes token balances a user may have in both the account wallet and the Vault contract. Can be
   * used as `requiredComponents` and `requiredComponentAmounts` inputs for an issuance order
   *
   * @param  setAddress       Address of the Set token for issuance order
   * @param  userAddress     Address of user making the issuance
   * @param  quantity         Amount of the Set token to create as part of issuance order
   * @return                  List of objects conforming to the `Component` interface with address and units of each
   *                            component required for issuance
   */
  public async calculateRequiredComponentsAndUnitsAsync(
    setAddress: Address,
    userAddress: Address,
    quantity: BigNumber,
  ): Promise<Component[]> {
    const components = await this.setToken.getComponents(setAddress);
    const componentUnits = await this.setToken.getUnits(setAddress);
    const naturalUnit = await this.setToken.naturalUnit(setAddress);
    const totalUnitsNeeded = _.map(componentUnits, componentUnit => componentUnit.mul(quantity).div(naturalUnit));

    const requiredComponents: Component[] = [];

    // Gather how many components are owned by the user in balance/vault
    await Promise.all(
      components.map(async (componentAddress, index) => {
        const walletBalance = await this.erc20.balanceOf(componentAddress, userAddress);
        const vaultBalance = await this.vault.getBalanceInVault(componentAddress, userAddress);
        const userTokenbalance = walletBalance.add(vaultBalance);

        const missingUnits = totalUnitsNeeded[index].sub(userTokenbalance);
        if (missingUnits.gt(ZERO)) {
          const requiredComponent: Component = {
            address: componentAddress,
            unit: missingUnits,
          };

          requiredComponents.push(requiredComponent);
        }
      }),
    );

    return requiredComponents;
  }

  /**
   * Fetch the conversion rate for a Kyber trading pair
   *
   * @param  makerTokenAddress       Address of the token to trade
   * @param  componentTokenAddress   Address of the set component to trade for
   * @param  quantity                Quantity of maker token to trade for component token
   * @return                         The conversion rate and slip rate for the trade
   */
  public async getKyberConversionRate(
    makerTokenAddress: Address,
    componentTokenAddress: Address,
    quantity: BigNumber
  ): Promise<[BigNumber, BigNumber]> {
    return await this.kyberNetworkWrapper.conversionRate(makerTokenAddress, componentTokenAddress, quantity);
  }


  /* ============ Private Assertions ============ */

  private async assertExchangeIssueReceiveInputs(
    exchangeIssuanceParams: ExchangeIssuanceParams,
  ) {
    const {
      setAddress,
      receiveTokens,
    } = exchangeIssuanceParams;

    await Promise.all(
      receiveTokens.map(async (receiveToken, i) => {
        await this.assert.setToken.isComponent(setAddress, receiveToken);
      }),
    );

  }

  private async assertExchangeIssuanceParams(
    exchangeIssuanceParams: ExchangeIssuanceParams,
    orders: (KyberTrade | ZeroExSignedFillOrder)[],
  ) {
    const {
      setAddress,
      sendTokens,
      sendTokenAmounts,
      sendTokenExchangeIds,
      quantity,
      receiveTokens,
      receiveTokenAmounts,
    } = exchangeIssuanceParams;

    this.assert.schema.isValidAddress('setAddress', setAddress);
    this.assert.common.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));

    await this.assert.setToken.isValidSetToken(this.core.coreAddress, setAddress);

    await this.assert.exchange.assertSendTokenInputs(
      sendTokens,
      sendTokenExchangeIds,
      sendTokenAmounts,
      this.core.coreAddress,
    );

    this.assert.common.isEqualLength(
      receiveTokens,
      receiveTokenAmounts,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('receiveTokens', 'receiveTokenAmounts'),
    );
    this.assert.common.isNotEmptyArray(orders, coreAPIErrors.EMPTY_ARRAY('orders'));

    await this.assert.exchange.assertRequiredComponentsAndAmounts(
      receiveTokens,
      receiveTokenAmounts,
      setAddress,
    );

    await this.assert.setToken.isMultipleOfNaturalUnit(
      setAddress,
      quantity,
      `Quantity of Exchange issue Params`,
    );

     await this.assert.exchange.assertExchangeIssuanceOrdersValidity(
      exchangeIssuanceParams,
      orders,
    );
  }
}
