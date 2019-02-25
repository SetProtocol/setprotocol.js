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
import { SetProtocolUtils } from 'set-protocol-utils';

import {
  ERC20Wrapper,
  KyberNetworkWrapper,
  SetTokenWrapper,
  VaultWrapper,
} from '../wrappers';
import { ZERO } from '../constants';
import { BigNumber, generateFutureTimestamp,  } from '../util';
import {
  Address,
  Component,
} from '../types/common';


/**
 * @title OrderAPI
 * @author Set Protocol
 *
 * A library for handling issuance orders for Sets
 */
export class OrderAPI {
  private web3: Web3;
  private setToken: SetTokenWrapper;
  private erc20: ERC20Wrapper;
  private vault: VaultWrapper;
  private kyberNetworkWrapper: KyberNetworkWrapper;

  /**
   * Instantiates a new OrderAPI instance that contains methods for creating, filling, and cancelling issuance orders
   *
   * @param web3                        Web3.js Provider instance you would like the SetProtocol.js library to use for
   *                                      interacting with the Ethereum network
   * @param assertions                  An instance of the Assertion library
   * @param kyberNetworkWrapperAddress  Address for kyber network wrapper
   * @param vaultAddress                Address for the vault
   */
  constructor(
    web3: Web3,
    kyberNetworkWrapperAddress: Address,
    vaultAddress: Address,
  ) {
    this.web3 = web3;
    this.erc20 = new ERC20Wrapper(this.web3);
    this.kyberNetworkWrapper = new KyberNetworkWrapper(this.web3, kyberNetworkWrapperAddress);
    this.setToken = new SetTokenWrapper(this.web3);
    this.vault = new VaultWrapper(this.web3, vaultAddress);
  }

  /**
   * Generates a 256-bit salt that can be included in an order, to ensure that the order generates
   * a unique orderHash and will not collide with other outstanding orders that are identical
   *
   * @return    256-bit number that can be used as a salt
   */
  public generateSalt(): BigNumber {
    return SetProtocolUtils.generateSalt();
  }

  /**
   * Generates a timestamp represented as seconds since unix epoch. The timestamp is intended to be
   * used to generate the expiration of an issuance order
   *
   * @param  seconds    Seconds from the present time
   * @return            Unix timestamp (in seconds since unix epoch)
   */
  public generateExpirationTimestamp(seconds: number): BigNumber {
    return generateFutureTimestamp(seconds);
  }

  /**
   * Calculates additional amounts of each component token in a Set needed in order to issue a specific quantity of
   * the Set. This includes token balances a user may have in both the account wallet and the Vault contract. Can be
   * used as `requiredComponents` and `requiredComponentAmounts` inputs for an issuance order
   *
   * @param  setAddress       Address of the Set token for issuance order
   * @param  makerAddress     Address of user making the issuance order
   * @param  quantity         Amount of the Set token to create as part of issuance order
   * @return                  List of objects conforming to the `Component` interface with address and units of each
   *                            component required for issuance
   */
  public async calculateRequiredComponentsAndUnitsAsync(
    setAddress: Address,
    makerAddress: Address,
    quantity: BigNumber,
  ): Promise<Component[]> {
    const components = await this.setToken.getComponents(setAddress);
    const componentUnits = await this.setToken.getUnits(setAddress);
    const naturalUnit = await this.setToken.naturalUnit(setAddress);
    const totalUnitsNeeded = _.map(componentUnits, componentUnit => componentUnit.mul(quantity).div(naturalUnit));

    const requiredComponents: Component[] = [];

    // Gather how many components are owned by the user in balance/vault
    await Promise.all(
      components.map(async (componentAddress, index) => {
        const walletBalance = await this.erc20.balanceOf(componentAddress, makerAddress);
        const vaultBalance = await this.vault.getBalanceInVault(componentAddress, makerAddress);
        const userTokenbalance = walletBalance.add(vaultBalance);

        const missingUnits = totalUnitsNeeded[index].sub(userTokenbalance);
        if (missingUnits.gt(ZERO)) {
          const requiredComponent: Component = {
            address: componentAddress,
            unit: missingUnits,
          };

          requiredComponents.push(requiredComponent);
        }
      }),
    );

    return requiredComponents;
  }

  /**
   * Fetch the conversion rate for a Kyber trading pair
   *
   * @param  makerTokenAddress       Address of the token to trade
   * @param  componentTokenAddress   Address of the set component to trade for
   * @param  quantity                Quantity of maker token to trade for component token
   * @return                         The conversion rate and slip rate for the trade
   */
  public async getKyberConversionRate(
    makerTokenAddress: Address,
    componentTokenAddress: Address,
    quantity: BigNumber
  ): Promise<[BigNumber, BigNumber]> {
    return await this.kyberNetworkWrapper.conversionRate(makerTokenAddress, componentTokenAddress, quantity);
  }
}
