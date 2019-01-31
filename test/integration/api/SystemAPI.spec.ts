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
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import * as ethUtil from 'ethereumjs-util';
import Web3 from 'web3';
import { Address, Log, Web3Utils } from 'set-protocol-utils';
import * as setProtocolUtils from 'set-protocol-utils';
import {
  CoreContract,
  IssuanceOrderModuleContract,
  RebalanceAuctionModuleContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  VaultContract,
} from 'set-protocol-contracts';
import { Core, StandardTokenMock } from 'set-protocol-contracts';
import { TransactionReceipt } from 'ethereum-types';

import ChaiSetup from '@test/helpers/chaiSetup';
import { Assertions } from '@src/assertions';
import { SystemAPI } from '@src/api';
import { CoreWrapper } from '@src/wrappers';
import { BigNumber, ether, getFormattedLogsFromReceipt } from '@src/util';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { TX_DEFAULTS, ZERO } from '@src/constants';
import {
  Bytes,
  SetProtocolConfig,
  SystemAuthorizableState,
  SystemOwnableState,
  SystemTimeLockPeriodState,
} from '@src/types/common';
import { deployBaseContracts, deploySetTokenAsync, deployTokensAsync } from '@test/helpers';
import { getVaultBalances } from '@test/helpers/vaultHelpers';
import { testSets, TestSet } from '../../testSets';

ChaiSetup.configure();
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);
const { expect } = chai;

let currentSnapshotId: number;

const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils } = setProtocolUtils;

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);


describe('SystemAPI', () => {
  let systemAPI: SystemAPI;
  let coreInstance: CoreContract;
  let setTokenFactoryInstance: SetTokenFactoryContract;
  let rebalanceAuctionModuleInstance: RebalanceAuctionModuleContract;
  let issuanceOrderModuleInstance: IssuanceOrderModuleContract;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    const [
      core,
      transferProxy,
      vault,
      setTokenFactory,
      rebalancingSetTokenFactory,
      rebalanceAuctionModule,
      issuanceOrderModule,
    ] = await deployBaseContracts(web3);

    coreInstance = core;
    setTokenFactoryInstance = setTokenFactory;
    issuanceOrderModuleInstance = issuanceOrderModule;
    rebalanceAuctionModuleInstance = rebalanceAuctionModule;

    const coreWrapper = new CoreWrapper(
      web3,
      core.address,
      transferProxy.address,
      vault.address,
      rebalanceAuctionModule.address,
    );

    const setProtocolConfig: SetProtocolConfig = {
      coreAddress: core.address,
      transferProxyAddress: transferProxy.address,
      vaultAddress: vault.address,
      rebalanceAuctionModuleAddress: rebalanceAuctionModule.address,
      issuanceOrderModuleAddress: issuanceOrderModule.address,
      kyberNetworkWrapperAddress: SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
      setTokenFactoryAddress: setTokenFactory.address,
      rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
    };

    const assertions = new Assertions(web3);

    systemAPI = new SystemAPI(web3, coreWrapper, assertions, setProtocolConfig);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('getOperationStateAsync', async () => {
    let expectedOperationState: BigNumber;

    beforeEach(async () => {
      expectedOperationState = ZERO;
    });

    async function subject(): Promise<BigNumber> {
      return await systemAPI.getOperationStateAsync();
    }

    test('returns the correct operation state', async () => {
      const operationState = await subject();
      expect(operationState).to.bignumber.equal(expectedOperationState);
    });

    describe('when the operation state is shutdown', async () => {
      let expectedOperationState: BigNumber;

      beforeEach(async () => {
        expectedOperationState = new BigNumber(1);
        coreInstance.setOperationState.sendTransactionAsync(expectedOperationState, { from: DEFAULT_ACCOUNT });
      });

      test('returns the correct operation state', async () => {
        const operationState = await subject();
        expect(operationState).to.bignumber.equal(expectedOperationState);
      });
    });
  });

  describe('getSystemAuthorizableStateAsync', async () => {
    let systemAuthorizableAddresses: SystemAuthorizableState;

    beforeEach(async () => {
      systemAuthorizableAddresses = {
        transferProxy: [coreInstance.address, issuanceOrderModuleInstance.address],
        vault: [coreInstance.address, rebalanceAuctionModuleInstance.address, issuanceOrderModuleInstance.address],
      };
    });

    async function subject(): Promise<SystemAuthorizableState> {
      return await systemAPI.getSystemAuthorizableStateAsync();
    }

    test('returns the correct transferProxy authorized addresses', async () => {
      const { transferProxy, vault } = await subject();

      const expectedTransferProxyAuthorizable = JSON.stringify(systemAuthorizableAddresses.transferProxy);
      expect(JSON.stringify(transferProxy)).to.equal(expectedTransferProxyAuthorizable);
    });

    test('returns the correct vault authorized addresses', async () => {
      const { vault } = await subject();

      const expectedVaultAuthorizable = JSON.stringify(systemAuthorizableAddresses.vault);
      expect(JSON.stringify(vault)).to.equal(expectedVaultAuthorizable);
    });
  });

  describe('getSystemTimeLockPeriods', async () => {
    let alternativeTimeLockPeriod: BigNumber;

    beforeEach(async () => {
      alternativeTimeLockPeriod = new BigNumber(100);

      await issuanceOrderModuleInstance.setTimeLockPeriod.sendTransactionAsync(
        alternativeTimeLockPeriod,
        { from: DEFAULT_ACCOUNT}
      );
    });

    async function subject(): Promise<SystemTimeLockPeriodState> {
      return await systemAPI.getSystemTimeLockPeriods();
    }

    test('returns the correct timeLockPeriods', async () => {
      const { core, vault, transferProxy, issuanceOrderModule} = await subject();
      expect(core).to.bignumber.equal(ZERO);
      expect(vault).to.bignumber.equal(ZERO);
      expect(transferProxy).to.bignumber.equal(ZERO);
      expect(issuanceOrderModule).to.bignumber.equal(alternativeTimeLockPeriod);
    });
  });

  describe('getTimeLockUpgradeHashAsync', async () => {
    let subjectTransactionHash: string;

    beforeEach(async () => {
      // Set a positive timeLockUpgradePeriod
      coreInstance.setTimeLockPeriod.sendTransactionAsync(
        new BigNumber(100),
        { from: DEFAULT_ACCOUNT }
      );

      subjectTransactionHash = await coreInstance.addFactory.sendTransactionAsync(
        SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
        { from: DEFAULT_ACCOUNT }
      );
    });

    async function subject(): Promise<Bytes> {
      return await systemAPI.getTimeLockUpgradeHashAsync(subjectTransactionHash);
    }

    test('returns the correct upgrade hash', async () => {
      const timeLockUpgradeHash = await subject();

      const { input } = await web3.eth.getTransaction(subjectTransactionHash);
      const expectedTimeLockUpgradeHash = web3.utils.soliditySha3(input);
      expect(timeLockUpgradeHash).to.equal(expectedTimeLockUpgradeHash);
    });
  });

  describe('getTimeLockedUpgradeInitializationAsync', async () => {
    let subjectContractAddress: Address;
    let subjectTimeLockUpgradeHash: Bytes;
    let txnTransactionHash: string;

    beforeEach(async () => {
      // Set a positive timeLockUpgradePeriod
      coreInstance.setTimeLockPeriod.sendTransactionAsync(
        new BigNumber(100),
        { from: DEFAULT_ACCOUNT }
      );

      subjectContractAddress = coreInstance.address;

      txnTransactionHash = await coreInstance.addFactory.sendTransactionAsync(
        SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
        { from: DEFAULT_ACCOUNT }
      );

      const { input } = await web3.eth.getTransaction(txnTransactionHash);
      subjectTimeLockUpgradeHash = web3.utils.soliditySha3(input);
    });

    async function subject(): Promise<BigNumber> {
      return await systemAPI.getTimeLockedUpgradeInitializationAsync(
        subjectContractAddress,
        subjectTimeLockUpgradeHash,
      );
    }

    test('returns the correct timestamp', async () => {
      const timeLockUpgradeTimestamp = await subject();

      const { blockNumber } = await web3.eth.getTransactionReceipt(txnTransactionHash);
      const { timestamp } = await web3.eth.getBlock(blockNumber);

      expect(timeLockUpgradeTimestamp).to.bignumber.equal(timestamp);
    });
  });

  describe('getSystemOwners', async () => {
    let alternativeOwner: Address;

    beforeEach(async () => {
      alternativeOwner = SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS;

      await issuanceOrderModuleInstance.transferOwnership.sendTransactionAsync(
        alternativeOwner,
        { from: DEFAULT_ACCOUNT}
      );
    });

    async function subject(): Promise<SystemOwnableState> {
      return await systemAPI.getSystemOwners();
    }

    test('returns the correct owners', async () => {
      const { core, vault, transferProxy, issuanceOrderModule} = await subject();
      expect(core.toLowerCase()).to.equal(DEFAULT_ACCOUNT);
      expect(vault.toLowerCase()).to.equal(DEFAULT_ACCOUNT);
      expect(transferProxy.toLowerCase()).to.equal(DEFAULT_ACCOUNT);
      expect(issuanceOrderModule.toLowerCase()).to.equal(alternativeOwner);
    });
  });
});
