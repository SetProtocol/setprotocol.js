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
import Web3 from 'web3';
import { CoreContract, TransferProxyContract } from 'set-protocol-contracts';
import { Address, Web3Utils } from 'set-protocol-utils';

import { KyberNetworkWrapper } from '@src/wrappers';
import { BigNumber, ether } from '@src/util';
import { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from '@src/constants';
import {
  deployBaseContracts,
  deployKyberNetworkWrapperContract,
  deployTokensSpecifyingDecimals,
} from '@test/helpers';
import { KyberNetworkHelper } from '@test/helpers/kyberNetworkHelper';
import { KYBER_CONTRACTS } from '@test/external/kyberSnapshotAddresses';
import { ACCOUNTS } from '@src/constants/accounts';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('KyberNetworkWrapper', () => {
  let kyberNetworkWrapper: KyberNetworkWrapper;

  const kyberReserveOperator = ACCOUNTS[1].address;

  const kyberNetworkHelper = new KyberNetworkHelper();

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    let core: CoreContract;
    let transferProxy: TransferProxyContract;
    [core, transferProxy] = await deployBaseContracts(web3);

    const kyberNetworkWrapperContract = await deployKyberNetworkWrapperContract(
      web3,
      KYBER_CONTRACTS.KyberNetworkProxy,
      transferProxy,
      core,
    );

    await kyberNetworkHelper.setup();
    await kyberNetworkHelper.fundReserveWithEth(
      kyberReserveOperator,
      ether(90),
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

    const token1BuyRate = ether(2);
    const token2BuyRate = ether(6);
    const token1SellRate = ether(1);
    const token2SellRate = ether(2);

    beforeEach(async () => {
      const [token1, token2] = await deployTokensSpecifyingDecimals(
        2,
        [18, 18],
        web3,
        kyberReserveOperator,
      );

      await kyberNetworkHelper.enableTokensForReserve(token1.address);
      await kyberNetworkHelper.enableTokensForReserve(token2.address);

      await kyberNetworkHelper.setUpConversionRatesRaw(
        [token1.address, token2.address],
        [token1BuyRate, token2BuyRate],
        [token1SellRate, token2SellRate],
      );

      await kyberNetworkHelper.approveToReserve(
        token1,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        kyberReserveOperator,
      );

      await kyberNetworkHelper.approveToReserve(
        token2,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        kyberReserveOperator,
      );

      subjectSourceTokenAddresses = [token1.address, token1.address];
      subjectDestinationTokenAddresses = [token2.address, token2.address];
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
      const results = await subject();
      [[firstRate, secondRate], [firstSlippage, secondSlippage]] = results;

      const expectedRate = token2BuyRate;
      expect(firstRate).to.be.bignumber.equal(expectedRate);

      const expectedSecondRate = token2BuyRate;
      expect(secondRate).to.be.bignumber.equal(expectedSecondRate);

      const slippagePercentage = new BigNumber(100).sub(kyberNetworkHelper.defaultSlippagePercentage);
      const expectedSlippage = expectedRate.mul(slippagePercentage).div(100);
      expect(firstSlippage).to.be.bignumber.equal(expectedSlippage);

      const expectedSecondSlippage = expectedSecondRate.mul(slippagePercentage).div(100);
      expect(secondSlippage).to.be.bignumber.equal(expectedSecondSlippage);
    });
  });
});
