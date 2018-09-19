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
import {
  Address,
  IssuanceOrder,
  SetProtocolUtils,
  SignedIssuanceOrder,
  TakerWalletOrder,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';
import { erc20AssertionErrors, coreAPIErrors, setTokenAssertionsErrors } from '../errors';
import { SetTokenContract, CoreContract } from 'set-protocol-contracts';
import { CoreAssertions } from './CoreAssertions';
import { CommonAssertions } from './CommonAssertions';
import { SchemaAssertions } from './SchemaAssertions';
import { ERC20Assertions } from './ERC20Assertions';
import { SetTokenAssertions } from './SetTokenAssertions';
import { CoreWrapper } from '../wrappers';
import { NULL_ADDRESS } from '../constants';
import { BigNumber } from '../util';
import * as Web3 from 'web3';



export class OrderAssertions {
  private web3: Web3;
  private coreAddress: Address;
  private coreContract: CoreContract;
  private erc20Assertions: ERC20Assertions;
  private schemaAssertions: SchemaAssertions;
  private coreAssertions: CoreAssertions;
  private commonAssertions: CommonAssertions;
  private setTokenAssertions: SetTokenAssertions;

  constructor(web3: Web3) {
    this.web3 = web3;
    this.erc20Assertions = new ERC20Assertions(web3);
    this.schemaAssertions = new SchemaAssertions();
    this.coreAssertions = new CoreAssertions(web3);
    this.commonAssertions = new CommonAssertions();
    this.setTokenAssertions = new SetTokenAssertions(web3);
  }

  public setCoreAddress(coreAddress: Address) {
    this.coreAddress = coreAddress;
  }

  public async ensureCoreContract() {
    if (!this.coreContract) {
      this.coreContract = await CoreContract.at(this.coreAddress, this.web3, {});
    }
  }

  public async isIssuanceOrderFillable(
    signedIssuanceOrder: SignedIssuanceOrder,
    fillQuantity: BigNumber,
  ): Promise<void> {
    await this.ensureCoreContract();

    const {
      expiration,
      quantity,
      makerToken,
      makerAddress,
      makerTokenAmount,
    } = signedIssuanceOrder;

    this.commonAssertions.isValidExpiration(expiration, coreAPIErrors.EXPIRATION_PASSED());

    await this.isValidFillQuantity(signedIssuanceOrder, fillQuantity);

    const transferProxyAddress = await this.coreContract.transferProxy.callAsync();
    await this.erc20Assertions.hasSufficientAllowanceAsync(
      makerToken,
      makerAddress,
      transferProxyAddress,
      makerTokenAmount,
    );

    const requiredMakerTokenAmount = this.calculateReqMakerToken(
      fillQuantity,
      quantity,
      makerTokenAmount,
    );

    await this.erc20Assertions.hasSufficientBalanceAsync(
      makerToken,
      makerAddress,
      requiredMakerTokenAmount,
    );
  }

  /**
   * Checks the issuance order to ensure inputs adhere to the schema
   * and are valid inputs
   */
  public async isValidIssuanceOrder(issuanceOrder: IssuanceOrder) {
    const {
      setAddress,
      makerAddress,
      makerToken,
      relayerAddress,
      relayerToken,
      quantity,
      makerTokenAmount,
      expiration,
      makerRelayerFee,
      takerRelayerFee,
      requiredComponents,
      requiredComponentAmounts,
      salt,
    } = issuanceOrder;

    this.schemaAssertions.isValidAddress('setAddress', setAddress);
    this.schemaAssertions.isValidAddress('makerAddress', makerAddress);
    this.schemaAssertions.isValidAddress('relayerAddress', relayerAddress);
    this.schemaAssertions.isValidAddress('relayerToken', relayerToken);
    this.commonAssertions.isValidExpiration(issuanceOrder.expiration, coreAPIErrors.EXPIRATION_PASSED());
    this.commonAssertions.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
    this.commonAssertions.greaterThanZero(
      makerTokenAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(makerTokenAmount)
    );
    this.commonAssertions.isEqualLength(
      requiredComponents,
      requiredComponentAmounts,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('requiredComponents', 'requiredComponentAmounts'),
    );
    await this.erc20Assertions.implementsERC20(makerToken);

    await Promise.all(
      requiredComponents.map(async (tokenAddress, i) => {
        this.commonAssertions.isValidString(tokenAddress, coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'));
        this.schemaAssertions.isValidAddress('tokenAddress', tokenAddress);
        await this.erc20Assertions.implementsERC20(tokenAddress);
        await this.setTokenAssertions.isComponent(setAddress, tokenAddress);

        this.commonAssertions.greaterThanZero(
          requiredComponentAmounts[i],
          coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(requiredComponentAmounts[i]),
        );
      }),
    );

    if (relayerToken !== NULL_ADDRESS) {
      await this.erc20Assertions.implementsERC20(relayerToken);
    }
  }

  public async assertLiquidityOrders(
    transactionCaller: Address,
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (TakerWalletOrder | ZeroExSignedFillOrder)[],
  ) {
    let makerTokensUsed = SetProtocolUtils.CONSTANTS.ZERO;

    await Promise.all(
      _.map(orders, async (order: any) => {
        if (SetProtocolUtils.isZeroExOrder(order)) {
          await this.isValidZeroExOrderFills(signedIssuanceOrder, quantityToFill, order);
          makerTokensUsed = makerTokensUsed.plus(order.fillAmount);
        } else if (SetProtocolUtils.isTakerWalletOrder(order)) {
          await this.isValidTakerWalletOrderFills(
            transactionCaller,
            signedIssuanceOrder,
            quantityToFill,
            order
          );
        }
      })
    );

    // All 0x signed fill order fillAmounts are filled using the makerTokenAmount of the
    // signedIssuanceOrder so we need to make sure that signedIssuanceOrder.makerTokenAmount
    // has enough for the 0x orders (scaled by fraction of order quantity being filled).
    const {
      makerTokenAmount,
      quantity,
    } = signedIssuanceOrder;

    const requiredMakerTokenAmount = this.calculateReqMakerToken(
      quantityToFill,
      quantity,
      makerTokenAmount,
    );

    this.commonAssertions.isGreaterOrEqualThan(
      requiredMakerTokenAmount,
      makerTokensUsed,
      coreAPIErrors.MAKER_TOKEN_INSUFFICIENT(signedIssuanceOrder.makerTokenAmount, makerTokensUsed),
    );
  }

  private async isValidZeroExOrderFills (
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    order: ZeroExSignedFillOrder,
  ) {
    this.commonAssertions.greaterThanZero(
      order.fillAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(order.fillAmount),
    );

    // The 0x taker token is equivalent to the issuance order maker token
    this.commonAssertions.isEqualString(
      signedIssuanceOrder.makerToken,
      SetProtocolUtils.extractAddressFromAssetData(order.takerAssetData),
      coreAPIErrors.ISSUANCE_ORDER_MAKER_ZERO_EX_TAKER_MISMATCH(),
    );

    // The 0x maker token is a component of the set
    await this.setTokenAssertions.isComponent(
      signedIssuanceOrder.setAddress,
      SetProtocolUtils.extractAddressFromAssetData(order.makerAssetData),
    );
  }

  private async isValidTakerWalletOrderFills (
    transactionCaller: Address,
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    order: TakerWalletOrder,
  ) {
    await this.ensureCoreContract();

    const { takerTokenAddress, takerTokenAmount } = order;

    this.commonAssertions.greaterThanZero(
      takerTokenAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(takerTokenAmount),
    );

    await this.setTokenAssertions.isComponent(
      signedIssuanceOrder.setAddress,
      takerTokenAddress,
    );

    const transferProxyAddress = await this.coreContract.transferProxy.callAsync();
    await this.erc20Assertions.hasSufficientAllowanceAsync(
      takerTokenAddress,
      transactionCaller,
      transferProxyAddress,
      takerTokenAmount,
    );

    await this.erc20Assertions.hasSufficientBalanceAsync(
      takerTokenAddress,
      transactionCaller,
      takerTokenAmount,
    );
  }

  private async isValidFillQuantity(
    signedIssuanceOrder: SignedIssuanceOrder,
    fillQuantity: BigNumber,
  ) {
    await this.ensureCoreContract();

    const fillableQuantity = await this.calculateFillableQuantity(signedIssuanceOrder);
    this.commonAssertions.isGreaterOrEqualThan(fillableQuantity, fillQuantity, coreAPIErrors.FILL_EXCEEDS_AVAILABLE());

    await this.setTokenAssertions.isMultipleOfNaturalUnit(
      signedIssuanceOrder.setAddress,
      fillQuantity,
      `Fill quantity of issuance order`,
    );
  }

  private async calculateFillableQuantity(signedIssuanceOrder: SignedIssuanceOrder): Promise<BigNumber> {
    const issuanceOrder: IssuanceOrder = _.omit(signedIssuanceOrder, 'signature');

    const {
      quantity,
      setAddress,
    } = issuanceOrder;

    const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);
    const filledAmount = await this.coreContract.orderFills.callAsync(orderHash);
    const cancelledAmount = await this.coreContract.orderCancels.callAsync(orderHash);
    return quantity.sub(filledAmount).sub(cancelledAmount);
  }

  private calculateReqMakerToken(
    fillQuantity: BigNumber,
    quantity: BigNumber,
    makerTokenAmount: BigNumber
  ): BigNumber {
    return fillQuantity.div(quantity).mul(makerTokenAmount);
  }
}
