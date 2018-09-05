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
import { erc20AssertionErrors, coreAPIErrors } from '../errors';
import { CoreAssertions } from './CoreAssertions';
import { CommonAssertions } from './CommonAssertions';
import { CoreWrapper } from '../wrappers';
import { BigNumber } from '../util';
import * as Web3 from 'web3';

const coreAssertions = new CoreAssertions();
const commonAssertions = new CommonAssertions();

export class OrderAssertions {
  public async isIssuanceOrderFillable(
    core: CoreWrapper,
    signedIssuanceOrder: SignedIssuanceOrder,
    fillQuantity: BigNumber,
  ): Promise<void> {
    const issuanceOrder: IssuanceOrder = _.omit(signedIssuanceOrder, 'signature');
    const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);

    await coreAssertions.isValidSignature(
      orderHash,
      issuanceOrder.makerAddress,
      signedIssuanceOrder.signature,
      coreAPIErrors.SIGNATURE_MISMATCH(),
    );

    // Checks the order has not expired
    commonAssertions.isValidExpiration(issuanceOrder.expiration, coreAPIErrors.EXPIRATION_PASSED());

    // Checks that it has not been fully filled already
    const filledAmount = await core.orderFills(orderHash);
    const cancelledAmount = await core.orderCancels(orderHash);
    const fillableQuantity = issuanceOrder.quantity.sub(filledAmount).sub(cancelledAmount);
    commonAssertions.isGreaterOrEqualThan(fillableQuantity, fillQuantity, coreAPIErrors.FULLY_FILLED());
  }
}
