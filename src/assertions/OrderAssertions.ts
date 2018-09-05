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
import { Address, IssuanceOrder, SetProtocolUtils, SignedIssuanceOrder } from 'set-protocol-utils';
import { erc20AssertionErrors, coreAPIErrors, orderErrors, setTokenAssertionsErrors } from '../errors';
import { CoreContract } from 'set-protocol-contracts';
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
  private erc20Assertions: ERC20Assertions;
  private schemaAssertions: SchemaAssertions;
  private coreAssertions: CoreAssertions;
  private commonAssertions: CommonAssertions;

  constructor(web3: Web3) {
    this.web3 = web3;
    this.erc20Assertions = new ERC20Assertions(web3);
    this.schemaAssertions = new SchemaAssertions();
    this.coreAssertions = new CoreAssertions(web3);
    this.commonAssertions = new CommonAssertions();
    this.setTokenAssertions = new SetTokenAssertions(web3);
  }

  public async isValidFill(
    transactionCaller: Address,
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (ZeroExSignedFillOrder | TakerWalletOrder)[],
  ) {
    // Get required components
    // Calculate required components needed to fill the quantity
    // Sum tokens retrieved from orders

    // If Zero Ex Order
      // Ensure the maker token amount is sufficient

    // If Taker Wallet Order
      // Ensure that allowances are set by the caller
      // Ensure that the caller has the balances to contribute
  }

  public async isIssuanceOrderFillable(
    coreAddress: Address,
    signedIssuanceOrder: SignedIssuanceOrder,
    fillQuantity: BigNumber,
  ): Promise<void> {
    const coreContract = await CoreContract.at(coreAddress, this.web3, {});

    const issuanceOrder: IssuanceOrder = _.omit(signedIssuanceOrder, 'signature');
    const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);

    await this.coreAssertions.isValidSignature(
      orderHash,
      issuanceOrder.makerAddress,
      signedIssuanceOrder.signature,
      coreAPIErrors.SIGNATURE_MISMATCH(),
    );

    // Checks the order has not expired
    this.commonAssertions.isValidExpiration(issuanceOrder.expiration, coreAPIErrors.EXPIRATION_PASSED());

    // Checks that it has not been fully filled already
    const filledAmount = await coreContract.orderFills.callAsync(orderHash);
    const cancelledAmount = await coreContract.orderCancels.callAsync(orderHash);
    const fillableQuantity = issuanceOrder.quantity.sub(filledAmount).sub(cancelledAmount);
    this.commonAssertions.isGreaterOrEqualThan(fillableQuantity, fillQuantity, orderErrors.FILL_EXCEEDS_AVAILABLE());
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
        await this.setTokenAssertions.isComponent(
          setAddress,
          tokenAddress,
          setTokenAssertionsErrors.IS_NOT_COMPONENT(setAddress, tokenAddress)
        );

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
}
