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

import * as Web3 from "web3";

/**
 * @title CoreAPI
 * @author Set Protocol
 *
 * The Core handles all functions on the Core SetProtocol smart contract.
 *
 */

export class CoreAPI {
  private provider: Web3;

  public constructor(provider: Web3) {
    this.provider = provider;
  }
}
