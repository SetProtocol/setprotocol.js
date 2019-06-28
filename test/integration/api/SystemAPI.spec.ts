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
import Web3 from 'web3';
import { Address, Web3Utils } from 'set-protocol-utils';
import * as setProtocolUtils from 'set-protocol-utils';
import {
  CoreContract,
  MedianContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenFactoryContract,
  SetTokenFactoryContract,
  WhiteListContract,
} from 'set-protocol-contracts';
import { Core } from 'set-protocol-contracts';

import ChaiSetup from '@test/helpers/chaiSetup';
import { SystemAPI } from '@src/api';
import { CoreWrapper } from '@src/wrappers';
import { BigNumber } from '@src/util';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { NULL_ADDRESS, TX_DEFAULTS, ZERO } from '@src/constants';
import {
  Bytes,
  SetProtocolConfig,
  SystemAuthorizableState,
  SystemOwnableState,
  SystemTimeLockPeriodState,
} from '@src/types/common';
import {
  addPriceFeedOwnerToMedianizer,
  addPriceLibraryAsync,
  deployBaseContracts,
  deployMedianizerAsync,
  deployWhitelistContract,
  registerExchange,
  updateMedianizerPriceAsync,
} from '@test/helpers';

ChaiSetup.configure();
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const web3Utils = new Web3Utils(web3);
const { expect } = chai;

let currentSnapshotId: number;

const { SetProtocolTestUtils: SetTestUtils } = setProtocolUtils;

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);


describe('SystemAPI', () => {
  let systemAPI: SystemAPI;
  let coreInstance: CoreContract;
  let setTokenFactoryInstance: SetTokenFactoryContract;
  let rebalanceAuctionModuleInstance: RebalanceAuctionModuleContract;
  let rebalancingSetTokenFactoryInstance: RebalancingSetTokenFactoryContract;

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
    ] = await deployBaseContracts(web3);

    coreInstance = core;
    setTokenFactoryInstance = setTokenFactory;
    rebalanceAuctionModuleInstance = rebalanceAuctionModule;
    rebalancingSetTokenFactoryInstance = rebalancingSetTokenFactory;

    const coreWrapper = new CoreWrapper(
      web3,
      core.address,
      transferProxy.address,
      vault.address,
    );

    const setProtocolConfig: SetProtocolConfig = {
      coreAddress: core.address,
      transferProxyAddress: transferProxy.address,
      vaultAddress: vault.address,
      rebalanceAuctionModuleAddress: rebalanceAuctionModule.address,
      kyberNetworkWrapperAddress: SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS,
      setTokenFactoryAddress: setTokenFactory.address,
      rebalancingSetTokenFactoryAddress: rebalancingSetTokenFactory.address,
      exchangeIssuanceModuleAddress: NULL_ADDRESS,
      rebalancingSetIssuanceModule: NULL_ADDRESS,
      rebalancingSetExchangeIssuanceModule: NULL_ADDRESS,
      wrappedEtherAddress: NULL_ADDRESS,
    };

    systemAPI = new SystemAPI(web3, coreWrapper, setProtocolConfig);
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
        transferProxy: [coreInstance.address],
        vault: [coreInstance.address, rebalanceAuctionModuleInstance.address],
      };
    });

    async function subject(): Promise<SystemAuthorizableState> {
      return await systemAPI.getSystemAuthorizableStateAsync();
    }

    test('returns the correct transferProxy authorized addresses', async () => {
      const { transferProxy } = await subject();

      const expectedTransferProxyAuthorizable = JSON.stringify(systemAuthorizableAddresses.transferProxy);
      expect(JSON.stringify(transferProxy)).to.equal(expectedTransferProxyAuthorizable);
    });

    test('returns the correct vault authorized addresses', async () => {
      const { vault } = await subject();

      const expectedVaultAuthorizable = JSON.stringify(systemAuthorizableAddresses.vault);
      expect(JSON.stringify(vault)).to.equal(expectedVaultAuthorizable);
    });
  });

  describe('getSystemTimeLockPeriodsAsync', async () => {
    let alternativeTimeLockPeriod: BigNumber;

    beforeEach(async () => {
      alternativeTimeLockPeriod = new BigNumber(100);

      await coreInstance.setTimeLockPeriod.sendTransactionAsync(
        alternativeTimeLockPeriod,
        { from: DEFAULT_ACCOUNT}
      );
    });

    async function subject(): Promise<SystemTimeLockPeriodState> {
      return await systemAPI.getSystemTimeLockPeriodsAsync();
    }

    test('returns the correct timeLockPeriods', async () => {
      const { core, vault, transferProxy} = await subject();
      expect(core).to.bignumber.equal(alternativeTimeLockPeriod);
      expect(vault).to.bignumber.equal(ZERO);
      expect(transferProxy).to.bignumber.equal(ZERO);
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

  describe('getSystemOwnersAsync', async () => {
    let alternativeOwner: Address;

    beforeEach(async () => {
      alternativeOwner = ACCOUNTS[2].address;

      await coreInstance.transferOwnership.sendTransactionAsync(
        alternativeOwner,
        { from: DEFAULT_ACCOUNT}
      );
    });

    async function subject(): Promise<SystemOwnableState> {
      return await systemAPI.getSystemOwnersAsync();
    }

    test('returns the correct owners', async () => {
      const { core, vault, transferProxy} = await subject();
      expect(core).to.equal(alternativeOwner);
      expect(vault).to.equal(DEFAULT_ACCOUNT);
      expect(transferProxy).to.equal(DEFAULT_ACCOUNT);
    });
  });

  describe('getWhitelistedAddressesAsync', async () => {
    let whitelistInstance: WhiteListContract;
    let initializedWhitelistAddresses: Address[];

    let subjectWhitelistContract: Address;

    beforeEach(async () => {
      initializedWhitelistAddresses = [DEFAULT_ACCOUNT];

      whitelistInstance = await deployWhitelistContract(initializedWhitelistAddresses, web3);

      subjectWhitelistContract = whitelistInstance.address;
    });

    async function subject(): Promise<Address[]> {
      return await systemAPI.getWhitelistedAddressesAsync(subjectWhitelistContract);
    }

    test('gets the correct valid addresses', async () => {
      const whitelistAddresses = await subject();

      // whitelistAddresses = whitelistAddresses.map(address => address.toLowerCase());

      expect(JSON.stringify(whitelistAddresses)).to.equal(JSON.stringify(initializedWhitelistAddresses));
    });
  });

  describe('getModulesAsync', async () => {
    async function subject(): Promise<Address[]> {
      return await systemAPI.getModulesAsync();
    }

     test('gets modules', async () => {
      const modules = await subject();

      const expectedModules = [
        rebalanceAuctionModuleInstance.address,
      ];
      expect(JSON.stringify(modules)).to.equal(JSON.stringify(expectedModules));
    });
  });

  describe('getFactoriesAsync', async () => {
    async function subject(): Promise<Address[]> {
      return await systemAPI.getFactoriesAsync();
    }

    test('gets factories', async () => {
      const factories = await subject();

      const expectedFactories = [
        setTokenFactoryInstance.address,
        rebalancingSetTokenFactoryInstance.address,
      ];
      expect(JSON.stringify(factories)).to.equal(JSON.stringify(expectedFactories));
    });
  });

  describe('getExchangesAsync', async () => {
    beforeEach(async () => {
      await registerExchange(web3, coreInstance.address, 1, DEFAULT_ACCOUNT);
    });

    async function subject(): Promise<Address[]> {
      return await systemAPI.getExchangesAsync();
    }

    test('gets exchanges', async () => {
      const exchanges = await subject();

      const expectedExchanges = [
        DEFAULT_ACCOUNT,
      ];
      expect(JSON.stringify(exchanges)).to.equal(JSON.stringify(expectedExchanges));
    });
  });

  describe('getPriceLibrariesAsync', async () => {
    beforeEach(async () => {
      await addPriceLibraryAsync(coreInstance, DEFAULT_ACCOUNT);
    });

    async function subject(): Promise<Address[]> {
      return await systemAPI.getPriceLibrariesAsync();
    }

    test('gets price libraries', async () => {
      const priceLibraries = await subject();

      const expectedPriceLibraries = [
        DEFAULT_ACCOUNT,
      ];
      expect(JSON.stringify(priceLibraries)).to.equal(JSON.stringify(expectedPriceLibraries));
    });
  });

  describe('getFeedPriceAsync', async () => {
    let subjectMedianizerAddress: Address;

    let btcMedianizer: MedianContract;
    let btcPrice: BigNumber;

    beforeEach(async () => {
      btcMedianizer = await deployMedianizerAsync(web3);
      await addPriceFeedOwnerToMedianizer(btcMedianizer, DEFAULT_ACCOUNT);

      btcPrice = new BigNumber(4082 * 10 ** 18);
      await updateMedianizerPriceAsync(
        web3,
        btcMedianizer,
        btcPrice,
        SetTestUtils.generateTimestamp(1000),
      );

      subjectMedianizerAddress = btcMedianizer.address;
    });

    async function subject(): Promise<BigNumber> {
      return await systemAPI.getFeedPriceAsync(
        subjectMedianizerAddress
      );
    }

    test('gets the correct price', async () => {
      const price = await subject();

      expect(price).to.bignumber.equal(btcPrice);
    });
  });
});
