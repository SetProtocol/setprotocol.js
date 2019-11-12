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

import {
  RSITriggerWrapper
} from '../wrappers';
import { Address } from '../types/common';

import {
  RSITriggerDetails
} from '../types/strategies';

/**
 * @title TriggerAPI
 * @author Set Protocol
 *
 * A library for interacting with Triggers
 */
export class TriggerAPI {
  private rsiTrigger: RSITriggerWrapper;

  constructor(web3: Web3) {
    this.rsiTrigger = new RSITriggerWrapper(web3);
  }

  public async getRSITriggerDetailsAsync(
    triggerAddress: Address
  ): Promise<RSITriggerDetails> {
    const [
      dataOracle,
      lowerBound,
      upperBound,
      timePeriod,
    ] = await Promise.all([
      this.rsiTrigger.rsiOracle(triggerAddress),
      this.rsiTrigger.lowerBound(triggerAddress),
      this.rsiTrigger.upperBound(triggerAddress),
      this.rsiTrigger.rsiTimePeriod(triggerAddress),
    ]);

    return {
      dataOracle,
      lowerBound,
      upperBound,
      timePeriod,
    } as RSITriggerDetails;
  }
}