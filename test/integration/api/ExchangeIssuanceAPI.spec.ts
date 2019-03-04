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
import { ExchangeIssuanceParams } from 'set-protocol-utils';
import Web3 from 'web3';
import {
  CoreContract,
  ExchangeIssuanceModuleContract,
  KyberNetworkWrapperContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
} from 'set-protocol-contracts';

import ChaiSetup from '@test/helpers/chaiSetup';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { ExchangeIssuanceAPI } from '@src/api';
import { CoreWrapper } from '@src/wrappers';
import { ether } from '@src/util';
import {
  NULL_ADDRESS,
  ZERO,
} from '@src/constants';
import { Assertions } from '@src/assertions';
import {
  addModuleAsync,
  approveForTransferAsync,
  deployExchangeIssuanceModuleAsync,
  deployTokensSpecifyingDecimals,
  deployWethMockAsync,
  deployZeroExExchangeWrapperContract,
  deployBaseContracts,
  deployKyberNetworkWrapperContract,
  deploySetTokenAsync,
  deployTokensAsync,
} from '@test/helpers';
import {
  BigNumber,
} from '@src/util';
import {
  Address,
  Component,
  KyberTrade,
  SetProtocolConfig,
  ZeroExSignedFillOrder,
} from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
ChaiSetup.configure();
const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const setUtils = new SetUtils(web3);
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('ExchangeIssuanceAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let wrappedEtherMock: WethMockContract;
  let exchangeIssuanceModule: ExchangeIssuanceModuleContract;
  let kyberNetworkWrapper: KyberNetworkWrapperContract;

  let config: SetProtocolConfig;
  let coreWrapper: CoreWrapper;
  let exchangeIssuanceAPI: ExchangeIssuanceAPI;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy,
      vault,
      setTokenFactory,
    ] = await deployBaseContracts(web3);

    exchangeIssuanceModule = await deployExchangeIssuanceModuleAsync(web3, core, vault);
    await addModuleAsync(core, exchangeIssuanceModule.address);

    await deployZeroExExchangeWrapperContract(
      web3,
      SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
      SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
      SetTestUtils.ZERO_EX_TOKEN_ADDRESS,
      transferProxy,
      core,
    );

    wrappedEtherMock = await deployWethMockAsync(web3, NULL_ADDRESS, ZERO);

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

    config = {
      coreAddress: core.address,
      transferProxyAddress: transferProxy.address,
      vaultAddress: vault.address,
      setTokenFactoryAddress: setTokenFactory.address,
      exchangeIssuanceModuleAddress: exchangeIssuanceModule.address,
      kyberNetworkWrapperAddress: kyberNetworkWrapper.address,
      rebalancingSetTokenFactoryAddress: NULL_ADDRESS,
      rebalanceAuctionModuleAddress: NULL_ADDRESS,
      rebalancingTokenIssuanceModule: NULL_ADDRESS,
    } as SetProtocolConfig;

    const assertions = new Assertions(web3);
    exchangeIssuanceAPI = new ExchangeIssuanceAPI(
      web3,
      assertions,
      config,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('exchangeIssuance', async () => {
    let subjectExchangeIssuanceData: ExchangeIssuanceParams;
    let subjectExchangeOrder: (KyberTrade | ZeroExSignedFillOrder)[];
    let subjectCaller: Address;

    let zeroExOrderMaker: Address;

    let componentAddresses: Address[];
    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;

    let exchangeIssuanceSetAddress: Address;
    let exchangeIssuanceQuantity: BigNumber;
    let exchangeIssuancePaymentToken: Address;
    let exchangeIssuancePaymentTokenAmount: BigNumber;
    let exchangeIssuanceRequiredComponents: Address[];
    let exchangeIssuanceRequiredComponentAmounts: BigNumber[];

    let zeroExOrder: ZeroExSignedFillOrder;

    beforeEach(async () => {
      subjectCaller = ACCOUNTS[1].address;

      // Create component token (owned by 0x order maker)
      zeroExOrderMaker = ACCOUNTS[2].address;
      const [baseSetComponent] = await deployTokensSpecifyingDecimals(1, [18], web3, zeroExOrderMaker);
      const [alreadyOwnedComponent] = await deployTokensSpecifyingDecimals(1, [18], web3, subjectCaller);

      // Create the Set (1 component)
      componentAddresses = [baseSetComponent.address, alreadyOwnedComponent.address];
      const componentUnits = [new BigNumber(10 ** 10), new BigNumber(1)];
      baseSetNaturalUnit = new BigNumber(10 ** 9);
      baseSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        baseSetNaturalUnit,
      );

      // Generate exchange issue data
      exchangeIssuanceSetAddress = baseSetToken.address;
      exchangeIssuanceQuantity = new BigNumber(10 ** 10);
      exchangeIssuancePaymentToken = wrappedEtherMock.address;
      exchangeIssuancePaymentTokenAmount = new BigNumber(10 ** 10);
      exchangeIssuanceRequiredComponents = [componentAddresses[0]];
      exchangeIssuanceRequiredComponentAmounts = [componentUnits[0]].map(
        unit => unit.mul(exchangeIssuanceQuantity).div(baseSetNaturalUnit)
      );

      subjectExchangeIssuanceData = {
        setAddress: exchangeIssuanceSetAddress,
        sendTokenExchangeIds: [SetUtils.EXCHANGES.ZERO_EX],
        sendTokens: [exchangeIssuancePaymentToken],
        sendTokenAmounts: [exchangeIssuancePaymentTokenAmount],
        quantity: exchangeIssuanceQuantity,
        receiveTokens: exchangeIssuanceRequiredComponents,
        receiveTokenAmounts: exchangeIssuanceRequiredComponentAmounts,
      };

      await approveForTransferAsync(
        [baseSetComponent],
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExOrderMaker
      );

      await approveForTransferAsync(
        [alreadyOwnedComponent],
        transferProxy.address,
        subjectCaller,
      );

      // Create 0x order for the component, using weth(4) paymentToken as default
      zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                     // senderAddress
        zeroExOrderMaker,                                 // makerAddress
        NULL_ADDRESS,                                     // takerAddress
        ZERO,                                             // makerFee
        ZERO,                                             // takerFee
        subjectExchangeIssuanceData.receiveTokenAmounts[0],  // makerAssetAmount
        exchangeIssuancePaymentTokenAmount,                  // takerAssetAmount
        exchangeIssuanceRequiredComponents[0],               // makerAssetAddress
        exchangeIssuancePaymentToken,                        // takerAssetAddress
        SetUtils.generateSalt(),                          // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,            // exchangeAddress
        NULL_ADDRESS,                                     // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),            // expirationTimeSeconds
        exchangeIssuancePaymentTokenAmount,                  // amount of zeroExOrder to fill
      );

      subjectExchangeOrder = [zeroExOrder];

       // Subject caller needs to wrap ether
      await wrappedEtherMock.deposit.sendTransactionAsync(
        { from: subjectCaller, value: exchangeIssuancePaymentTokenAmount.toString() }
      );

      await wrappedEtherMock.approve.sendTransactionAsync(
        transferProxy.address,
        exchangeIssuancePaymentTokenAmount,
        { from: subjectCaller }
      );
    });

    async function subject(): Promise<string> {
      return await exchangeIssuanceAPI.exchangeIssueAsync(
        subjectExchangeIssuanceData,
        subjectExchangeOrder,
        { from: subjectCaller }
      );
    }

    test('issues the Set to the caller', async () => {
      const previousSetTokenBalance = await baseSetToken.balanceOf.callAsync(subjectCaller);
      const expectedSetTokenBalance = previousSetTokenBalance.add(exchangeIssuanceQuantity);

      await subject();

      const currentSetTokenBalance = await baseSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedSetTokenBalance).to.bignumber.equal(currentSetTokenBalance);
    });

    // describe('when a required component is not represented in the orders', async () => {
    //   let underRepresentedComponent: Address;

    //   beforeEach(async () => {
    //      underRepresentedComponent = componentAddresses[1].toLowerCase();

    //      subjectExchangeIssuanceData.receiveTokens.push(underRepresentedComponent);
    //      subjectExchangeIssuanceData.receiveTokenAmounts.push(new BigNumber(1));
    //   });

    //   test('throws', async () => {
    //     return expect(subject()).to.be.rejectedWith(
    //       `Token ${underRepresentedComponent} is unrepresented in the liquidity orders.`
    //     );
    //   });
    // });
  });

describe('generateSalt', async () => {
    function subject(): BigNumber {
      return exchangeIssuanceAPI.generateSalt();
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
      return exchangeIssuanceAPI.generateExpirationTimestamp(
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
      return exchangeIssuanceAPI.getKyberConversionRate(
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
      return exchangeIssuanceAPI.calculateRequiredComponentsAndUnitsAsync(
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
