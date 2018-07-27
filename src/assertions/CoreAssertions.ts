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
import { SetProtocolUtils } from 'set-protocol-utils';
import { coreAssertionErrors } from '../errors';
import { BigNumber } from '../util';
import { CoreContract } from '../contracts';
import { ECSig, IssuanceOrder } from '../types/common';

const setProtocolUtils = new Utils();

export class CoreAssertions {
  /**
   * Throws if the given candidateContract does not respond to some methods from the Core interface.
   *
   * @param  coreInstance An instance of the core contract
   * @return              Void Promise
   */
  public async implementsCore(coreInstance: CoreContract): Promise<void> {
    const { address } = coreInstance;

    try {
      await coreInstance.vaultAddress.callAsync();
      await coreInstance.transferProxyAddress.callAsync();
      await coreInstance.owner.callAsync();
    } catch (error) {
      throw new Error(coreAssertionErrors.MISSING_CORE_METHOD(address));
    }
  }

  public validateNaturalUnit(naturalUnit: BigNumber, minDecimal: BigNumber, errorMessage: string) {
    if (naturalUnit.lt(10 ** (18 - minDecimal.toNumber()))) {
      throw new Error(errorMessage);
    }
  }

  public async isValidSignature(issuanceOrder: IssuanceOrder, signature: ECSig, errorMessage: string) {
    const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);
    const orderSignature = await setProtocolUtils.signMessage(orderHash, issuanceOrder.makerAddress);

    if (!_.isEqual(signature, orderSignature)) {
      throw new Error(errorMessage);
    }
  }
}
