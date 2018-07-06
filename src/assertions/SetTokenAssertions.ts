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

"use strict";

import { SetTokenAssertionErrors } from "../errors";
import { BigNumber } from "../util";
import { SetTokenWrapper } from "../wrappers/SetTokenWrapper";

export class SetTokenAssertions {
  /**
   * Throws if the given candidateContract does not respond to some methods from the Set Token interface.
   *
   * @param  setTokenInstance An instance of the Set Token contract
   * @return                  Void Promise
   */
  public async implementsSetToken(setTokenInstance: SetTokenWrapper): Promise<void> {
    const { address } = setTokenInstance;

    try {
      await setTokenInstance.name.callAsync();
      await setTokenInstance.totalSupply.callAsync();
      await setTokenInstance.decimals.callAsync();
      await setTokenInstance.naturalUnit.callAsync();
      await setTokenInstance.symbol.callAsync();
    } catch (error) {
      throw new Error(SetTokenAssertionErrors.IS_NOT_A_VALID_SET(address));
    }
  }
}
