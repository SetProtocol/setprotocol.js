/*
  Copyright 2019 Set Labs Inc.

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
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import { CoreContract, TransferProxyContract } from 'set-protocol-contracts';
import { Address, Web3Utils } from 'set-protocol-utils';

import { KyberNetworkWrapper } from '@src/wrappers';
import { BigNumber } from '@src/util';
import { deployBaseContracts, deployKyberNetworkWrapperContract } from '@test/helpers';

const { SetProtocolTestUtils: SetTestUtils } = setProtocolUtils;
const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('KyberNetworkWrapper', () => {
  let kyberNetworkWrapper: KyberNetworkWrapper;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    let core: CoreContract;
    let transferProxy: TransferProxyContract;
    [core, transferProxy] = await deployBaseContracts(web3);

    const kyberNetworkWrapperContract = await deployKyberNetworkWrapperContract(
      web3,
      SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
      transferProxy,
      core,
    );

    kyberNetworkWrapper = new KyberNetworkWrapper(web3, kyberNetworkWrapperContract.address);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('conversionRates', async () => {
    let subjectSourceTokenAddresses: Address[];
    let subjectDestinationTokenAddresses: Address[];
    let subjectQuantities: BigNumber[];

    beforeEach(async () => {
      const makerTokenAddress = SetTestUtils.KYBER_RESERVE_SOURCE_TOKEN_ADDRESS;
      const componentTokenAddress = SetTestUtils.KYBER_RESERVE_DESTINATION_TOKEN_ADDRESS;

      subjectSourceTokenAddresses = [makerTokenAddress, makerTokenAddress];
      subjectDestinationTokenAddresses = [componentTokenAddress, componentTokenAddress];
      subjectQuantities = [new BigNumber(10 ** 10), new BigNumber(10 ** 10)];
    });

    async function subject(): Promise<[BigNumber[], BigNumber[]]> {
      return await kyberNetworkWrapper.conversionRates(
        subjectSourceTokenAddresses,
        subjectDestinationTokenAddresses,
        subjectQuantities
      );
    }

    test('gets the correct rates', async () => {
      let firstRate: BigNumber;
      let secondRate: BigNumber;
      let firstSlippage: BigNumber;
      let secondSlippage: BigNumber;

      const conversionRates = await subject();
      [[firstRate, secondRate], [firstSlippage, secondSlippage]] = conversionRates;

      const expectedRate = new BigNumber('321556325900000000');
      expect(firstRate).to.be.bignumber.equal(expectedRate);

      const expectedSecondRate = new BigNumber('321556325900000000');
      expect(secondRate).to.be.bignumber.equal(expectedSecondRate);

      const expectedSlippage = new BigNumber('319948544270500000');
      expect(firstSlippage).to.be.bignumber.equal(expectedSlippage);

      const expectedSecondSlippage = new BigNumber ('319948544270500000');
      expect(secondSlippage).to.be.bignumber.equal(expectedSecondSlippage);
    });
  });
});
