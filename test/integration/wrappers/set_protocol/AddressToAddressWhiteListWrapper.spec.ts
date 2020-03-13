/*
  Copyright 2020 Set Labs Inc.

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

import * as chai from 'chai';
import Web3 from 'web3';
import { AddressToAddressWhiteListContract } from 'set-protocol-contracts';
import { Address, Web3Utils } from 'set-protocol-utils';

import { AddressToAddressWhiteListWrapper } from '@src/wrappers';
import { ACCOUNTS } from '@src/constants/accounts';
import { BigNumber } from '@src/util';
import { deployAddressToAddressWhiteListContract } from '@test/helpers';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('AddressToAddressWhiteListWrapper', () => {
  let whitelistWrapper: AddressToAddressWhiteListWrapper;
  let whitelistInstance: AddressToAddressWhiteListContract;
  let initialKeyAddresses: Address[];
  let initialValueAddresses: Address[];

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();
    initialKeyAddresses = [ACCOUNTS[0].address, ACCOUNTS[1].address];
    initialValueAddresses = [ACCOUNTS[2].address, ACCOUNTS[3].address];

    whitelistInstance = await deployAddressToAddressWhiteListContract(
      web3,
      initialKeyAddresses,
      initialValueAddresses
    );

    whitelistWrapper = new AddressToAddressWhiteListWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('validAddresses', async () => {
    let subjectWhitelistContract: Address;

    beforeEach(async () => {
      subjectWhitelistContract = whitelistInstance.address;
    });

    async function subject(): Promise<Address[]> {
      return await whitelistWrapper.validAddresses(subjectWhitelistContract);
    }

    test('gets the correct valid addresses', async () => {
      const whitelistAddresses = await subject();
      expect(JSON.stringify(whitelistAddresses)).to.equal(JSON.stringify(initialKeyAddresses));
    });
  });

  describe('getValues', async () => {
    let subjectWhitelistContract: Address;
    let subjectKeyValues: Address[];

    beforeEach(async () => {
      subjectWhitelistContract = whitelistInstance.address;
      subjectKeyValues = initialKeyAddresses;
    });

    async function subject(): Promise<Address[]> {
      return await whitelistWrapper.getValues(subjectWhitelistContract, subjectKeyValues);
    }

    test('gets the correct valid addresses', async () => {
      const valueTypeAddresses = await subject();
      expect(JSON.stringify(valueTypeAddresses)).to.equal(JSON.stringify(initialValueAddresses));
    });
  });
});
