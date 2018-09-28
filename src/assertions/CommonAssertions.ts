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
import { BigNumber } from '../util';
import { ZERO } from '../constants';

export class CommonAssertions {
  public greaterThanZero(quantity: BigNumber, errorMessage: string) {
    if (quantity.lte(ZERO)) {
      throw new Error(errorMessage);
    }
  }
  public isEqualLength(arr1: any[], arr2: any[], errorMessage: string) {
    if (arr1.length !== arr2.length) {
      throw new Error(errorMessage);
    }
  }

  public isGreaterOrEqualThan(quantity1: BigNumber, quantity2: BigNumber, errorMessage: string) {
    if (quantity1.lt(quantity2)) {
      throw new Error(errorMessage);
    }
  }

  public isValidString(value: string, errorMessage: string) {
    if (!value) {
      throw new Error(errorMessage);
    }
  }

  public isNotEmptyArray(array: any[], errorMessage: string) {
    if (array.length == 0) {
      throw new Error(errorMessage);
    }
  }

  public isValidExpiration(expiration: BigNumber, errorMessage: string) {
    if (Date.now() > expiration.times(1000).toNumber()) {
      throw new Error(errorMessage);
    }
  }

  public isEqualBigNumber(bigNumber1: BigNumber, bigNumber2: BigNumber, errorMessage: string) {
    if (!bigNumber1.eq(bigNumber2)) {
      throw new Error(errorMessage);
    }
  }

  public isEqualString(string1: string, string2: string, errorMessage: string) {
    if (string1 !== string2) {
      throw new Error(errorMessage);
    }
  }

  public proportionsSumToOne(percentages: BigNumber[], errorMesage: string) {
    let total: BigNumber = ZERO;
    _.each(percentages, percentage => {
      total = total.add(percentage);
    });

    if (!total.eq(new BigNumber(1))) {
      throw new Error(errorMesage);
    }
  }
}
