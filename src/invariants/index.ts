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

// External
import * as Web3 from "web3";

// Assertions
import { AccountAssertions } from "./accountInvariants";
import { CommonAssertions } from "./commonInvariants";
import { CoreAssertions } from "./coreInvariants";
import { ERC20Assertions } from "./erc20Invariants";
import { SchemaAssertions } from "./schemaInvariants";

export class Assertions {
  public account: AccountAssertions;
  public common: CommonAssertions;
  public core: CoreAssertions;
  public erc20: ERC20Assertions;
  public schema: SchemaAssertions;

  public constructor(web3: Web3) {
    this.account = new AccountAssertions();
    this.common = new CommonAssertions();
    this.core = new CoreAssertions();
    this.erc20 = new ERC20Assertions();
    this.schema = new SchemaAssertions();
  }
}
