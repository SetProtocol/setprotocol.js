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

import Web3 from 'web3';

import { ContractWrapper } from '.';
import { BigNumber } from '../util';
import { Address } from '../types/common';

/**
 * @title  KyberNetworkWrapper
 * @author Set Protocol
 *
 * The KyberNetwork wrapper handles interactions with the KyberNetworkWrapperContract
 *
 */
export class KyberNetworkWrapper {
  private web3: Web3;
  private contracts: ContractWrapper;
  private kyberNetworkWrapperAddress: Address;

  public constructor(web3: Web3, kyberNetworkWrapperAddress: Address) {
    this.web3 = web3;
    this.kyberNetworkWrapperAddress = kyberNetworkWrapperAddress;
    this.contracts = new ContractWrapper(this.web3);
  }

  /**
   * Fetch the conversion rate for a Kyber trading pair
   *
   * @param  makerTokenAddress       Address of the token to trade
   * @param  componentTokenAddress   Address of the set component to trade for
   * @param  quantity                Quantity of maker token to trade for component token
   * @return                         The conversion rate and slip rate for the trade
   */
  public async conversionRate(
    makerTokenAddress: Address,
    componentTokenAddress: Address,
    quantity: BigNumber
  ): Promise<[BigNumber, BigNumber]> {
    const kyberNetworkWrapper = await this.contracts.loadKyberNetworkWrapperAsync(this.kyberNetworkWrapperAddress);

    return await kyberNetworkWrapper.conversionRate.callAsync(makerTokenAddress, componentTokenAddress, quantity);
  }
}
