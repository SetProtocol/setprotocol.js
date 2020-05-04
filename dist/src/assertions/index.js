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
Object.defineProperty(exports, "__esModule", { value: true });
// Assertions
var AccountAssertions_1 = require("./AccountAssertions");
var CommonAssertions_1 = require("./CommonAssertions");
var CoreAssertions_1 = require("./CoreAssertions");
var ERC20Assertions_1 = require("./ERC20Assertions");
var ExchangeAssertions_1 = require("./ExchangeAssertions");
var IssuanceAssertions_1 = require("./IssuanceAssertions");
var RebalancingAssertions_1 = require("./RebalancingAssertions");
var SchemaAssertions_1 = require("./SchemaAssertions");
var SetTokenAssertions_1 = require("./SetTokenAssertions");
var SocialTradingAssertions_1 = require("./SocialTradingAssertions");
var VaultAssertions_1 = require("./VaultAssertions");
var Assertions = /** @class */ (function () {
    function Assertions(web3) {
        this.account = new AccountAssertions_1.AccountAssertions();
        this.common = new CommonAssertions_1.CommonAssertions();
        this.core = new CoreAssertions_1.CoreAssertions(web3);
        this.erc20 = new ERC20Assertions_1.ERC20Assertions(web3);
        this.exchange = new ExchangeAssertions_1.ExchangeAssertions(web3);
        this.issuance = new IssuanceAssertions_1.IssuanceAssertions(web3);
        this.rebalancing = new RebalancingAssertions_1.RebalancingAssertions(web3);
        this.schema = new SchemaAssertions_1.SchemaAssertions();
        this.setToken = new SetTokenAssertions_1.SetTokenAssertions(web3);
        this.socialTrading = new SocialTradingAssertions_1.SocialTradingAssertions(web3);
        this.vault = new VaultAssertions_1.VaultAssertions(web3);
    }
    return Assertions;
}());
exports.Assertions = Assertions;
//# sourceMappingURL=index.js.map