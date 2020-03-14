/*
  Copyright 2019 Set Labs Inc.

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
import { Address } from 'set-protocol-utils';

import {
  SocialTradingManagerContract
} from 'set-protocol-strategies';

import { CommonAssertions } from './CommonAssertions';
import { coreAPIErrors, socialTradingErrors } from '../errors';
import { BigNumber, ether } from '../util';
import { ZERO } from '../constants';

const moment = require('moment');

export class SocialTradingAssertions {
  private web3: Web3;
  private commonAssertions: CommonAssertions;

  constructor(web3: Web3) {
    this.web3 = web3;
    this.commonAssertions = new CommonAssertions();
  }

  /**
   * Throws if the passed allocation is less than 0
   *
   * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
   */
  public allocationGreaterOrEqualToZero(newAllocation: BigNumber): void {
    this.commonAssertions.isGreaterOrEqualThan(
      newAllocation,
      ZERO,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(newAllocation)
    );
  }

  /**
   * Throws if the passed allocation is greater than 100%
   *
   * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
   */
  public allocationLessThanOneHundred(newAllocation: BigNumber): void {
    const ONE_HUNDRED_PERCENT = ether(1);
    this.commonAssertions.isLessOrEqualThan(
      newAllocation,
      ONE_HUNDRED_PERCENT,
      socialTradingErrors.ALLOCATION_EXCEEDS_ONE_HUNDERED_PERCENT(newAllocation)
    );
  }

  /**
   * Throws if the passed allocation is not multiple of 1%
   *
   * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
   */
  public allocationMultipleOfOnePercent(newAllocation: BigNumber): void {
    const ONE_PERCENT = ether(.01);

    this.commonAssertions.isMultipleOf(
      newAllocation,
      ONE_PERCENT,
      socialTradingErrors.ALLOCATION_NOT_MULTIPLE_OF_ONE_PERCENT(newAllocation)
    );
  }

  /**
   * Throws if the passed fee is not multiple of 1 basis point
   *
   * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
   */
  public feeMultipleOfOneBasisPoint(fee: BigNumber): void {
    const ONE_BASIS_POINT = ether(.0001);

    this.commonAssertions.isMultipleOf(
      fee,
      ONE_BASIS_POINT,
      socialTradingErrors.FEE_NOT_MULTIPLE_OF_ONE_BASIS_POINT(fee)
    );
  }

  /**
   * Throws if the passed fee is not multiple of 1 basis point
   *
   * @param  newAllocation   New allocation percentage to 18 decimals precision 10 ** 18 = 100%
   */
  public async feeDoesNotExceedMax(manager: Address, fee: BigNumber): Promise<void> {
    const socialTradingInstance = await SocialTradingManagerContract.at(manager, this.web3, {});

    const maxFee = await socialTradingInstance.maxEntryFee.callAsync();

    this.commonAssertions.isLessOrEqualThan(
      fee,
      maxFee,
      socialTradingErrors.FEE_EXCEEDS_MAX_FEE(fee, maxFee)
    );
  }

  /**
   * Throws if caller is not the trader of tradingPool
   *
   * @param  trader         Trader of trading pool
   * @param  caller         Caller of transaction
   */
  public isTrader(trader: Address, caller: Address): void {
    this.commonAssertions.isEqualAddress(
      trader,
      caller,
      socialTradingErrors.NOT_TRADER(caller)
    );
  }

  /**
   * Throws if caller is not the trader of tradingPool
   *
   * @param  trader         Trader of trading pool
   * @param  caller         Caller of transaction
   */
  public feeChangeInitiated(feeChangeTimestamp: BigNumber): void {
    this.commonAssertions.greaterThanZero(
      feeChangeTimestamp,
      socialTradingErrors.FEE_UPDATE_NOT_INITIATED()
    );
  }

  /**
   * Throws if caller is not the trader of tradingPool
   *
   * @param  trader         Trader of trading pool
   * @param  caller         Caller of transaction
   */
  public feeChangeTimelockElapsed(feeChangeTimestamp: BigNumber): void {
    const validUpdateTime = feeChangeTimestamp.mul(1000);
    const currentTimeStamp = new BigNumber(Date.now());

    if (validUpdateTime.greaterThan(currentTimeStamp)) {
      const validUpdateFormattedDate = moment(validUpdateTime.toNumber())
        .format('dddd, MMMM Do YYYY, h:mm:ss a');
      throw new Error(socialTradingErrors.INSUFFICIENT_TIME_PASSED(validUpdateFormattedDate));
    }
  }

  public feeDoesNotExceedMaximumOnCalculator(
    feePercentage: BigNumber,
    feeMaxPercentage: BigNumber
  ): void {
    this.commonAssertions.isGreaterOrEqualThan(
      feeMaxPercentage,
      feePercentage,
      'Passed fee exceeds allowed maximum.'
    );
  }
}