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
exports.erc20AssertionErrors = {
    MISSING_ERC20_METHOD: function (address) {
        return "Contract at " + address + " does not implement ERC20 interface.";
    },
    INSUFFICIENT_BALANCE: function (tokenAddress, userAddress, currentBalance, requiredBalance) { return "\n        User: " + userAddress + " has balance of " + currentBalance + "\n\n        when required balance is " + requiredBalance + " at token address " + tokenAddress + ".\n      "; },
    INSUFFICIENT_ALLOWANCE: function (tokenAddress, userAddress, spenderAddress, currentAllowance, requiredBalance) { return "\n        User: " + userAddress + " has allowance of " + currentAllowance + "\n\n        when required allowance is " + requiredBalance + " at token\n\n        address: " + tokenAddress + " for spender: " + spenderAddress + ".\n      "; },
};
//# sourceMappingURL=erc20Errors.js.map