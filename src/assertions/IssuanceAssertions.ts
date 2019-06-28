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
import { RebalancingSetTokenWrapper, SetTokenWrapper } from '../wrappers';
import { BigNumber } from '../util';
import { Address } from '../types/common';

export class IssuanceAssertions {
  private erc20Assertions: ERC20Assertions;
  private commonAssertions: CommonAssertions;
  private schemaAssertions: SchemaAssertions;
  private setTokenAssertions: SetTokenAssertions;
  private rebalancingSetToken: RebalancingSetTokenWrapper;
  private setToken: SetTokenWrapper;

  constructor(web3: Web3) {
    this.erc20Assertions = new ERC20Assertions(web3);
    this.commonAssertions = new CommonAssertions();
    this.schemaAssertions = new SchemaAssertions();
    this.setTokenAssertions = new SetTokenAssertions(web3);
    this.rebalancingSetToken = new RebalancingSetTokenWrapper(web3);
    this.setToken = new SetTokenWrapper(web3);
  }

  public async assertSetTokenIssue(
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

  public async assertRebalancingSetTokenIssue(
    rebalancingSetTokenAddress: Address,
    rebalancingSetTokenQuantity: BigNumber,
    transactionCaller: Address,
    transferProxyAddress: Address,
  ): Promise<void> {
    // Do all the normal asserts
    this.schemaAssertions.isValidAddress('transactionCaller', transactionCaller);
    this.schemaAssertions.isValidAddress('setAddress', rebalancingSetTokenAddress);
    this.commonAssertions.greaterThanZero(
      rebalancingSetTokenQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(rebalancingSetTokenQuantity),
    );

    await this.setTokenAssertions.isMultipleOfNaturalUnit(
      rebalancingSetTokenAddress,
      rebalancingSetTokenQuantity,
      'Issuance quantity',
    );

    const baseSetTokenAddress = await this.rebalancingSetToken.currentSet(rebalancingSetTokenAddress);

    // Calculate the implied base Set quantity required
    const baseSetTokenQuantity = await this.getBaseSetIssuanceRequiredQuantity(
      rebalancingSetTokenAddress,
      rebalancingSetTokenQuantity,
    );

    await this.setTokenAssertions.hasSufficientBalances(
      baseSetTokenAddress,
      transactionCaller,
      baseSetTokenQuantity,
    );

    await this.setTokenAssertions.hasSufficientAllowances(
      baseSetTokenAddress,
      transactionCaller,
      transferProxyAddress,
      baseSetTokenQuantity,
    );
  }

  public async assertRebalancingSetTokenIssueWrappingEther(
    rebalancingSetTokenAddress: Address,
    rebalancingSetTokenQuantity: BigNumber,
    transactionCaller: Address,
    transferProxyAddress: Address,
    wrappedEtherAddress: Address,
    etherValue: BigNumber,
  ): Promise<void> {
    // Do all the normal asserts
    this.schemaAssertions.isValidAddress('transactionCaller', transactionCaller);
    this.schemaAssertions.isValidAddress('setAddress', rebalancingSetTokenAddress);
    this.commonAssertions.greaterThanZero(
      rebalancingSetTokenQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(rebalancingSetTokenQuantity),
    );

    await this.setTokenAssertions.isMultipleOfNaturalUnit(
      rebalancingSetTokenAddress,
      rebalancingSetTokenQuantity,
      'Issuance quantity',
    );

    const baseSetTokenAddress = await this.rebalancingSetToken.currentSet(rebalancingSetTokenAddress);

    // Calculate the implied base Set quantity required
    const baseSetTokenQuantity = await this.getBaseSetIssuanceRequiredQuantity(
      rebalancingSetTokenAddress,
      rebalancingSetTokenQuantity,
    );

    await this.setTokenAssertions.hasSufficientBalances(
      baseSetTokenAddress,
      transactionCaller,
      baseSetTokenQuantity,
      [wrappedEtherAddress],
    );

    await this.setTokenAssertions.hasSufficientAllowances(
      baseSetTokenAddress,
      transactionCaller,
      transferProxyAddress,
      baseSetTokenQuantity,
      [wrappedEtherAddress],
    );

    // Check that a base SetToken component is ether
    await this.setTokenAssertions.isComponent(
      baseSetTokenAddress,
      wrappedEtherAddress,
    );

    // Check that there is enough ether
    const requiredWrappedEtherQuantity = await this.getWrappedEtherRequiredQuantity(
      baseSetTokenAddress,
      baseSetTokenQuantity,
      wrappedEtherAddress,
    );

    this.commonAssertions.isGreaterOrEqualThan(
      etherValue,
      requiredWrappedEtherQuantity,
      'Ether value must be greater than required wrapped ether quantity',
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


  /* ============ Private Functions ============ */

  private async getBaseSetIssuanceRequiredQuantity(
    rebalancingSetTokenAddress: Address,
    rebalancingSetTokenQuantity: BigNumber,
  ): Promise<BigNumber> {
    const [unitShares, naturalUnit, baseSetTokenAddress] = await Promise.all([
      this.rebalancingSetToken.unitShares(rebalancingSetTokenAddress),
      this.rebalancingSetToken.naturalUnit(rebalancingSetTokenAddress),
      this.rebalancingSetToken.currentSet(rebalancingSetTokenAddress),
    ]);

    let requiredBaseSetQuantity = rebalancingSetTokenQuantity.mul(unitShares).div(naturalUnit);

    const baseSetNaturalUnit = await this.setToken.naturalUnit(baseSetTokenAddress);

    if (requiredBaseSetQuantity.mod(baseSetNaturalUnit).gt(new BigNumber(0))) {
      const roundDownQuantity = requiredBaseSetQuantity.mod(baseSetNaturalUnit);
      requiredBaseSetQuantity = requiredBaseSetQuantity.sub(roundDownQuantity).add(baseSetNaturalUnit);
    }

    return requiredBaseSetQuantity;
  }

  private async getWrappedEtherRequiredQuantity(
    baseSetAddress: Address,
    baseSetQuantity: BigNumber,
    wrappedEther: Address,
  ): Promise<BigNumber> {
    const [baseSetComponents, baseSetUnits, baseSetNaturalUnit] = await Promise.all([
      this.setToken.getComponents(baseSetAddress),
      this.setToken.getUnits(baseSetAddress),
      this.setToken.naturalUnit(baseSetAddress),
    ]);
    const indexOfWrappedEther = baseSetComponents.indexOf(wrappedEther);

    const wrappedEtherUnits = baseSetUnits[indexOfWrappedEther];

    return baseSetQuantity.mul(wrappedEtherUnits).div(baseSetNaturalUnit);
  }

}
