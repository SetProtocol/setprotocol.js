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

// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock('set-protocol-contracts');
jest.setTimeout(30000);

import * as _ from 'lodash';
import * as chai from 'chai';
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import {
  CoreContract,
  KyberNetworkWrapperContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';

import { BigNumber } from '@src/util';
import ChaiSetup from '@test/helpers/chaiSetup';
import { CoreWrapper } from '@src/wrappers';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { OrderAPI } from '@src/api';
import {
  Address,
  Component,
} from '@src/types/common';
import { ether } from '@src/util';
import {
  deployBaseContracts,
  deployKyberNetworkWrapperContract,
  deploySetTokenAsync,
  deployTokensAsync,
} from '@test/helpers';

ChaiSetup.configure();
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const { SetProtocolTestUtils: SetTestUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('OrderAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let kyberNetworkWrapper: KyberNetworkWrapperContract;

  let coreWrapper: CoreWrapper;
  let ordersAPI: OrderAPI;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy,
      vault,
      setTokenFactory,
    ] = await deployBaseContracts(web3);

    kyberNetworkWrapper = await deployKyberNetworkWrapperContract(
      web3,
      SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
      transferProxy,
      core,
    );

    coreWrapper = new CoreWrapper(
      web3,
      core.address,
      transferProxy.address,
      vault.address,
    );

    ordersAPI = new OrderAPI(
      web3,
      kyberNetworkWrapper.address,
      vault.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('generateSalt', async () => {
    function subject(): BigNumber {
      return ordersAPI.generateSalt();
    }

    test('should generate a timestamp in the future', async () => {
      const salt = subject();

      expect(salt).to.be.an('object');
    });
  });

  describe('generateExpirationTimestamp', async () => {
    let secondsInFuture: number;

    beforeEach(async () => {
      secondsInFuture = 100000;
    });

    function subject(): BigNumber {
      return ordersAPI.generateExpirationTimestamp(
        secondsInFuture,
      );
    }

    test('should generate a timestamp in the future', async () => {
      const timestamp = subject();

      const currentTime = new BigNumber(Math.floor((Date.now()) / 1000));
      const expectedTimestamp = currentTime.add(secondsInFuture);
      expect(timestamp).to.bignumber.equal(expectedTimestamp);
    });
  });

  describe('getKyberConversionRate', async () => {
    let subjectMakerTokenAddress: Address;
    let subjectComponentTokenAddress: Address;
    let subjectQuantity: BigNumber;

    async function subject(): Promise<[BigNumber, BigNumber]> {
      return ordersAPI.getKyberConversionRate(
        subjectMakerTokenAddress,
        subjectComponentTokenAddress,
        subjectQuantity
      );
    }

    beforeEach(async () => {
      subjectMakerTokenAddress = SetTestUtils.KYBER_RESERVE_SOURCE_TOKEN_ADDRESS;
      subjectComponentTokenAddress = SetTestUtils.KYBER_RESERVE_DESTINATION_TOKEN_ADDRESS;
      subjectQuantity = new BigNumber(100000);
    });

    it('returns a conversion rate and slip rate', async () => {
      const [conversionRate, slipRate] = await subject();

      expect(conversionRate).to.bignumber.equal(321550000000000000);
      expect(slipRate).to.bignumber.equal(319942250000000000);
    });
  });

  describe('calculateRequiredComponentsAndUnitsAsync', async () => {
    let setComponents: StandardTokenMockContract[];
    let componentUnits: BigNumber[];
    let setToken: SetTokenContract;
    let naturalUnit: BigNumber;

    let subjectSetAddress: Address;
    let subjectMakerAddress: Address;
    let subjectQuantity: BigNumber;

    const makerAccount = ACCOUNTS[3].address;
    let componentRecipient = makerAccount;

    beforeEach(async () => {
      setComponents = await deployTokensAsync(2, web3, componentRecipient);

      // Deploy Set with those tokens
      const setComponentUnit = ether(4);
      const componentAddresses = setComponents.map(token => token.address);
      componentUnits = setComponents.map(token => setComponentUnit);
      naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      subjectSetAddress = setToken.address;
      subjectMakerAddress = makerAccount;
      subjectQuantity = naturalUnit;
    });

    async function subject(): Promise<Component[]> {
      return ordersAPI.calculateRequiredComponentsAndUnitsAsync(
        subjectSetAddress,
        subjectMakerAddress,
        subjectQuantity,
      );
    }

    describe('when the maker has no token balances', async () => {
      beforeAll(async () => {
        componentRecipient = DEFAULT_ACCOUNT;
      });

      afterAll(async () => {
        componentRecipient = makerAccount;
      });

      test('should return the correct required components', async () => {
        const expectedComponents = setComponents.map(setComponent => setComponent.address);

        const requiredComponents = await subject();
        const componentAddresses = requiredComponents.map(requiredComponent => requiredComponent.address);

        expectedComponents.sort();
        componentAddresses.sort();

        expect(JSON.stringify(expectedComponents)).to.equal(JSON.stringify(componentAddresses));
      });

      test('should return the correct required units', async () => {
        const expectedUnits = componentUnits.map(componentUnit => componentUnit.mul(subjectQuantity).div(naturalUnit));

        const requiredComponents = await subject();
        const units = requiredComponents.map(requiredComponent => requiredComponent.unit);

        expectedUnits.sort();
        units.sort();
        expect(JSON.stringify(expectedUnits)).to.equal(JSON.stringify(units));
      });
    });

    describe('when a user has sufficient balance in the wallet', async () => {
      test('should return an empty array of required components', async () => {
        const expectedComponents: Address[] = [];

        const requiredComponents = await subject();
        const components = requiredComponents.map(requiredComponent => requiredComponent.address);

        expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
      });

      test('should return an empty array of required units', async () => {
        const expectedUnits: BigNumber[] = [];

        const requiredComponents = await subject();
        const units = requiredComponents.map(requiredComponent => requiredComponent.unit);

        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedUnits));
      });
    });

    describe('when a user has sufficient balance in the vault', async () => {
      beforeEach(async () => {
        // Approve and deposit tokens to the vault
        for (let i = 0; i < setComponents.length; i++) {
          const currentComponent = setComponents[i];
          const makerComponentBalance = await currentComponent.balanceOf.callAsync(makerAccount);
          await currentComponent.approve.sendTransactionAsync(
            transferProxy.address,
            makerComponentBalance,
            { from: makerAccount }
          );

          await coreWrapper.deposit(currentComponent.address, makerComponentBalance, { from: makerAccount });
        }
      });

      test('should return an empty array of required components', async () => {
        const expectedComponents: Address[] = [];

        const requiredComponents = await subject();
        const components = requiredComponents.map(requiredComponent => requiredComponent.address);

        expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
      });

      test('should return an empty array of required units', async () => {
        const expectedUnits: BigNumber[] = [];

        const requiredComponents = await subject();

        const units = requiredComponents.map(requiredComponent => requiredComponent.unit);
        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedUnits));
      });
    });

    describe('when a user has half of the required balance', async () => {
      let requiredBalances: BigNumber[];

      beforeEach(async () => {
        subjectMakerAddress = DEFAULT_ACCOUNT;

        requiredBalances = [];
        // Transfer half of each required amount to the maker
        for (let i = 0; i < setComponents.length; i++) {
          const currentComponent = setComponents[i];
          const currentUnit = componentUnits[i];
          const halfRequiredAmount = subjectQuantity.mul(currentUnit).div(naturalUnit).div(2);
          await currentComponent.transfer.sendTransactionAsync(
            subjectMakerAddress,
            halfRequiredAmount,
            { from: componentRecipient }
          );

          requiredBalances.push(halfRequiredAmount);
        }
      });

      test('should return the correct array of required components', async () => {
        const expectedComponents: Address[] = setComponents.map(setComponent => setComponent.address);

        const requiredComponents = await subject();
        const components = requiredComponents.map(requiredComponent => requiredComponent.address);

        expectedComponents.sort();
        components.sort();

        expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
      });

      test('should return the correct array of required units', async () => {
        const expectedUnits: BigNumber[] = requiredBalances;

        const requiredComponents = await subject();
        const units = requiredComponents.map(requiredComponent => requiredComponent.unit);

        expectedUnits.sort();
        units.sort();

        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedUnits));
      });
    });
  });
});
