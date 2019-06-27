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

import { coreAPIErrors } from '../errors';
import { CommonAssertions } from './CommonAssertions';
import { ERC20Assertions } from './ERC20Assertions';
import { SchemaAssertions } from './SchemaAssertions';
import { SetTokenAssertions } from './SetTokenAssertions';
import { BigNumber } from '../util';
import { Address } from '../types/common';
import { ZERO } from '../constants';

export class IssuanceAssertions {
  private erc20Assertions: ERC20Assertions;
  private commonAssertions: CommonAssertions;
  private schemaAssertions: SchemaAssertions;
  private setTokenAssertions: SetTokenAssertions;

  constructor(web3: Web3) {
    this.erc20Assertions = new ERC20Assertions(web3);
    this.commonAssertions = new CommonAssertions();
    this.schemaAssertions = new SchemaAssertions();
    this.setTokenAssertions = new SetTokenAssertions(web3);
  }

  public async assertIssue(
    setTokenAddress: Address,
    setTokenQuantity: BigNumber,
    transactionCaller: Address,
    transferProxyAddress: Address,
  ): Promise<void> {
    this.schemaAssertions.isValidAddress('transactionCaller', transactionCaller);
    this.schemaAssertions.isValidAddress('setAddress', setTokenAddress);
    this.commonAssertions.greaterThanZero(
      setTokenQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(setTokenQuantity),
    );

    await this.setTokenAssertions.isMultipleOfNaturalUnit(
      setTokenAddress,
      setTokenQuantity,
      'Issuance quantity',
    );

    await this.setTokenAssertions.hasSufficientBalances(
      setTokenAddress,
      transactionCaller,
      setTokenQuantity,
    );
    
    await this.setTokenAssertions.hasSufficientAllowances(
      setTokenAddress,
      transactionCaller,
      transferProxyAddress,
      setTokenQuantity,
    );
  }

  public async assertRedeem(
    setTokenAddress: Address,
    setTokenQuantity: BigNumber,
    transactionCaller: Address,
  ): Promise<void> {
    this.schemaAssertions.isValidAddress('transactionCaller', transactionCaller);
    this.schemaAssertions.isValidAddress('setAddress', setTokenAddress);
    this.commonAssertions.greaterThanZero(
      setTokenQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(setTokenQuantity),
    );

    await this.setTokenAssertions.isMultipleOfNaturalUnit(
      setTokenAddress,
      setTokenQuantity,
      'Issuance quantity',
    );

    await this.erc20Assertions.hasSufficientBalanceAsync(
      setTokenAddress,
      transactionCaller,
      setTokenQuantity,
    );
  }

}
