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

import { BigNumber } from '../util';

export class CommonAssertions {
  public greaterThanZero(quantity: BigNumber, errorMessage: string) {
    if (quantity.lte(new BigNumber(0))) {
      throw new Error(errorMessage);
    }
  }
  public isEqualLength(arr1: any[], arr2: any[], errorMessage: string) {
    if (arr1.length !== arr2.length) {
      throw new Error(errorMessage);
    }
  }

  public isValidString(value: string, errorMessage: string) {
    if (!value) {
      throw new Error(errorMessage);
    }
  }

  public isValidExpiration(expiration: BigNumber) {
    if (Date.now() > Number(expiration.mul(1000))) {
      throw new Error(errorMessage);
    }
  }
}
