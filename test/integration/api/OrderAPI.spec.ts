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
import * as Web3 from 'web3';
import compact = require('lodash.compact');
import {
  Address,
  Bytes,
  ECSig,
  IssuanceOrder,
  SetProtocolUtils,
  SetProtocolTestUtils,
  SignedIssuanceOrder,
  TakerWalletOrder,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';
import {
  CoreContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TakerWalletWrapperContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';

import { BigNumber, SignatureUtils } from '@src/util';
import ChaiSetup from '@test/helpers/chaiSetup';
import { CoreWrapper, ERC20Wrapper, SetTokenWrapper, VaultWrapper } from '@src/wrappers';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { OrderAPI } from '@src/api';
import { RequiredComponents } from '@src/types/common';
import { ZERO } from '@src/constants';
import { Assertions } from '@src/assertions';
import { ether, Web3Utils, generateFutureTimestamp, calculatePartialAmount } from '@src/util';
import {
  addAuthorizationAsync,
  approveForTransferAsync,
  deployCoreContract,
  deploySetTokenAsync,
  deployTokenAsync,
  deployTokensAsync,
  deploySetTokenFactoryContract,
  deployTransferProxyContract,
  deployVaultContract,
} from '@test/helpers/coreHelpers';
import { deployTakerWalletWrapperContract, deployZeroExExchangeWrapperContract } from '@test/helpers/exchangeHelpers';

ChaiSetup.configure();
const { expect } = chai;
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const setProtocolUtils = new SetProtocolUtils(web3);
const { NULL_ADDRESS } = SetProtocolUtils.CONSTANTS;

let currentSnapshotId: number;


describe('OrderAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let coreWrapper: CoreWrapper;
  let erc20Wrapper: ERC20Wrapper;
  let setTokenWrapper: SetTokenWrapper;
  let vaultWrapper: VaultWrapper;
  let ordersAPI: OrderAPI;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    transferProxy = await deployTransferProxyContract(provider);
    vault = await deployVaultContract(provider);
    core = await deployCoreContract(provider, transferProxy.address, vault.address);
    setTokenFactory = await deploySetTokenFactoryContract(provider, core);

    await addAuthorizationAsync(vault, core.address);
    await addAuthorizationAsync(transferProxy, core.address);

    coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);
    erc20Wrapper = new ERC20Wrapper(web3);
    setTokenWrapper = new SetTokenWrapper(web3);
    vaultWrapper = new VaultWrapper(web3, vault.address);
    const assertions = new Assertions(web3, coreWrapper);
    ordersAPI = new OrderAPI(web3, coreWrapper, assertions);
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

  describe('isValidSignatureOrThrowAsync', async () => {
    let orderHash: string;
    let subjectIssuanceOrder: IssuanceOrder;
    let subjectSignature: ECSig;

    beforeEach(async () => {
      const setAddress = '0x8d98a5d27fe34cf7ca410e771a897ed0f14af34c';
      const makerToken = '0x45af2bc687e136460eff84771c4303b90ee0035d';
      const makerTokenAmount = new BigNumber(100000000);
      const relayerAddress = '0x41fbe55863218606f4c6bff768fa70fdbff6e05b';
      const relayerToken = '0x06b7b2996b1bd54805487b20cd97fda90cbffb3d';
      const quantity = new BigNumber(100000);
      const requiredComponents = ['0x48fbf47994d88099913272f91db13fc250a', '0x8421da994a050d01e5f6a09968c2a936a89cd'];
      const requiredComponentAmounts = [new BigNumber(1000), new BigNumber(1000)];
      subjectIssuanceOrder = {
        setAddress,
        makerAddress: DEFAULT_ACCOUNT,
        makerToken,
        makerTokenAmount,
        relayerAddress,
        relayerToken,
        quantity,
        expiration: ordersAPI.generateExpirationTimestamp(86400),
        makerRelayerFee: ZERO,
        takerRelayerFee: ZERO,
        requiredComponents,
        requiredComponentAmounts,
        salt: ordersAPI.generateSalt(),
      };
      orderHash = SetProtocolUtils.hashOrderHex(subjectIssuanceOrder);
      subjectSignature = await setProtocolUtils.signMessage(orderHash, DEFAULT_ACCOUNT);
    });

    async function subject(): Promise<boolean> {
      return await ordersAPI.isValidSignatureOrThrowAsync(
        subjectIssuanceOrder,
        subjectSignature,
      );
    }

    test('should return true with a valid signature', async () => {
      const isValid = await subject();

      expect(isValid).to.equal(true);
    });
  });

  describe('signOrderAsync', async () => {
    let subjectIssuanceOrder: IssuanceOrder;
    let subjectSigner: Address;
    let orderHash: string;

    beforeEach(async () => {
      const setAddress = '0x8d98a5d27fe34cf7ca410e771a897ed0f14af34c';
      const makerToken = '0x45af2bc687e136460eff84771c4303b90ee0035d';
      const makerTokenAmount = new BigNumber(100000000);
      const relayerAddress = '0x41fbe55863218606f4c6bff768fa70fdbff6e05b';
      const relayerToken = '0x06b7b2996b1bd54805487b20cd97fda90cbffb3d';
      const quantity = new BigNumber(100000);
      const requiredComponents = ['0x48fbf47994d88099913272f91db13fc250a', '0x8421da994a050d01e5f6a09968c2a936a89cd'];
      const requiredComponentAmounts = [new BigNumber(1000), new BigNumber(1000)];
      subjectIssuanceOrder = {
        setAddress,
        makerAddress: DEFAULT_ACCOUNT,
        makerToken,
        makerTokenAmount,
        relayerAddress,
        relayerToken,
        quantity,
        expiration: ordersAPI.generateExpirationTimestamp(86400),
        makerRelayerFee: ZERO,
        takerRelayerFee: ZERO,
        requiredComponents,
        requiredComponentAmounts,
        salt: ordersAPI.generateSalt(),
      };

      subjectSigner = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<ECSig> {
      return await ordersAPI.signOrderAsync(
        subjectIssuanceOrder,
        { from: subjectSigner }
      );
    }

    test('produces a valid signature', async () => {
      const signature = await subject();

      orderHash = SetProtocolUtils.hashOrderHex(subjectIssuanceOrder);
      const isValid = SignatureUtils.isValidSignature(orderHash, signature, DEFAULT_ACCOUNT);
      expect(isValid);
    });
  });

  describe('validateOrderFillableOrThrowAsync', async () => {
    let issuanceOrderMaker: Address;
    let issuanceOrderQuantity: BigNumber;

    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectFillQuantity: BigNumber;

    let makerToken: StandardTokenMockContract;

    beforeEach(async () => {
      const issuanceOrderTaker = ACCOUNTS[0].address;
      issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;
      const zeroExOrderMaker = ACCOUNTS[3].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(provider, zeroExOrderMaker);
      makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

      const componentTokens = [firstComponent, secondComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      const setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address, secondComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );
      subjectFillQuantity = issuanceOrderQuantity;

      await approveForTransferAsync([makerToken], transferProxy.address, issuanceOrderMaker);
    });

    async function subject(): Promise<void> {
      return await ordersAPI.validateOrderFillableOrThrowAsync(
        subjectSignedIssuanceOrder,
        subjectFillQuantity
      );
    }

    it('should not throw', async () => {
      return expect(subject()).to.not.be.rejected;
    });

    describe('when the order is expired', async () => {
      beforeEach(async () => {
        const expiredTime = generateFutureTimestamp(0);
        const { signature, ...issuanceOrder } = subjectSignedIssuanceOrder;
        issuanceOrder.expiration = expiredTime;

        const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);
        const newSignature = await setProtocolUtils.signMessage(orderHash, issuanceOrderMaker);

        subjectSignedIssuanceOrder.expiration = expiredTime;
        subjectSignedIssuanceOrder.signature = newSignature;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('Expiration date has already passed.');
      });
    });

    describe('when the fill amount is greater than the fillable amount', async () => {
      beforeEach(async () => {
        subjectFillQuantity = issuanceOrderQuantity.add(100000);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('The fill quantity supplied exceeds the amount available to fill.');
      });
    });

    describe(
      'when the issuance order maker has not set sufficient maker token allowance to the transfer proxy',
      async () => {
      let makerTokenContract: StandardTokenMockContract = makerToken;

      beforeEach(async () => {
        makerTokenContract = makerToken;
        await makerToken.approve.sendTransactionAsync(
          transferProxy.address,
          new BigNumber(0),
          { from: subjectSignedIssuanceOrder.makerAddress },
        );
      });

      test('throws', async () => {
        const { makerAddress, makerToken, makerTokenAmount } = subjectSignedIssuanceOrder;
        const makerTokenBalance = await makerTokenContract.allowance.callAsync(
          makerAddress,
          transferProxy.address
        );

        return expect(subject()).to.be.rejectedWith(
      `
        User: ${makerAddress} has allowance of ${makerTokenBalance}

        when required allowance is ${makerTokenAmount} at token

        address: ${makerToken} for spender: ${transferProxy.address}.
      `
        );
      });
    });

    describe('when the issuance order maker does not have sufficient maker token balance', async () => {
      let makerTokenContract: StandardTokenMockContract;

      beforeEach(async () => {
        makerTokenContract = makerToken;
        const { makerAddress } = subjectSignedIssuanceOrder;
        const burnAddress = ACCOUNTS[5].address;

        const makerTokenBalance = await makerToken.balanceOf.callAsync(makerAddress);
        await makerToken.transfer.sendTransactionAsync(burnAddress, makerTokenBalance, { from: makerAddress });
        const makerTokenBalanceAfter = await makerToken.balanceOf.callAsync(makerAddress);
      });

      test('throws', async () => {
        const { makerAddress, makerToken, makerTokenAmount } = subjectSignedIssuanceOrder;
        const currentBalance = await makerTokenContract.balanceOf.callAsync(makerAddress);

        return expect(subject()).to.be.rejectedWith(
      `
        User: ${makerAddress} has balance of ${currentBalance}

        when required balance is ${makerTokenAmount} at token address ${makerToken}.
      `
        );
      });
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
      setComponents = await deployTokensAsync(2, provider, componentRecipient);

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

    async function subject(): Promise<RequiredComponents> {
      return ordersAPI.calculateRequiredComponentsAndUnitsAsync(
        subjectSetAddress,
        subjectMakerAddress,
        subjectQuantity,
      );
    }

    describe('when the inputs are standard and the maker has no token balances', async () => {
      beforeAll(async () => {
        componentRecipient = DEFAULT_ACCOUNT;
      });

      afterAll(async () => {
        componentRecipient = makerAccount;
      });

      test('should return the correct required components', async () => {
        const expectedComponents = setComponents.map(setComponent => setComponent.address);

        const { components } = await subject();

        const sortedExpectedComponents = expectedComponents.sort();
        const sortedActualComponents = components.sort();

        expect(JSON.stringify(sortedActualComponents)).to.equal(JSON.stringify(sortedExpectedComponents));
      });

      test('should return the correct required units', async () => {
        const expectedUnits = componentUnits.map(componentUnit => componentUnit.mul(subjectQuantity).div(naturalUnit));

        const { units } = await subject();

        const sortedExpectedUnits = expectedUnits.sort();
        const sortedActualUnits = units.sort();

        expect(JSON.stringify(sortedActualUnits)).to.equal(JSON.stringify(sortedExpectedUnits));
      });
    });

    describe('when a user has sufficient balance in the wallet', async () => {
      test('should return an empty array of required components', async () => {
        const expectedComponents: Address[] = [];

        const { components } = await subject();

        expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
      });

      test('should return an empty array of required units', async () => {
        const expectedUnits: BigNumber[] = [];

        const { units } = await subject();

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

        const { components } = await subject();

        expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
      });

      test('should return an empty array of required units', async () => {
        const expectedUnits: BigNumber[] = [];

        const { units } = await subject();

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

      test('should return an empty array of required components', async () => {
        const expectedComponents: Address[] = setComponents.map(setComponent => setComponent.address);

        const { components } = await subject();

        expect(JSON.stringify(components)).to.equal(JSON.stringify(expectedComponents));
      });

      test('should return an empty array of required units', async () => {
        const expectedUnits: BigNumber[] = requiredBalances;

        const { units } = await subject();

        expect(JSON.stringify(units)).to.equal(JSON.stringify(expectedUnits));
      });
    });
  });

  describe('createSignedOrderAsync', async () => {
    let componentTokens: StandardTokenMockContract[];

    let subjectSetAddress: Address;
    let subjectQuantity: BigNumber;
    let subjectRequiredComponents: Address[];
    let subjectRequredComponentAmounts: BigNumber[];
    let subjectMakerAddress: Address;
    let subjectMakerToken: Address;
    let subjectMakerTokenAmount: BigNumber;
    let subjectExpiration: BigNumber;
    let subjectRelayerAddress: Address;
    let subjectRelayerToken: Address;
    let subjectMakerRelayerFee: BigNumber;
    let subjectTakerRelayerFee: BigNumber;
    let subjectSalt: BigNumber;

    beforeEach(async () => {
      componentTokens = await deployTokensAsync(4, provider);
      const firstComponentAddress = componentTokens[0].address;
      const secondComponentAddress = componentTokens[1].address;
      const makerTokenAddress = componentTokens[2].address;
      const relayerTokenAddress = componentTokens[3].address;

      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      const setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      subjectSetAddress = setToken.address;
      subjectQuantity = ether(4);
      subjectMakerToken = makerTokenAddress;
      subjectMakerAddress = DEFAULT_ACCOUNT;
      subjectMakerTokenAmount = ether(2);
      subjectExpiration = generateFutureTimestamp(10000);
      subjectRelayerAddress = '0x41fbe55863218606f4c6bff768fa70fdbff6e05b';
      subjectRelayerToken = relayerTokenAddress;
      subjectRequiredComponents = [firstComponentAddress, secondComponentAddress];
      subjectRequredComponentAmounts = [ether(4), ether(4)];
      subjectMakerRelayerFee = ZERO;
      subjectTakerRelayerFee = ZERO;
      subjectSalt = ordersAPI.generateSalt();
    });

    async function subject(): Promise<SignedIssuanceOrder> {
      return await ordersAPI.createSignedOrderAsync(
        subjectSetAddress,
        subjectQuantity,
        subjectRequiredComponents,
        subjectRequredComponentAmounts,
        subjectMakerAddress,
        subjectMakerToken,
        subjectMakerTokenAmount,
        subjectExpiration,
        subjectRelayerAddress,
        subjectRelayerToken,
        subjectMakerRelayerFee,
        subjectTakerRelayerFee,
        subjectSalt,
      );
    }

    test('produces a signed issuance order containing a valid signature', async () => {
      const signedIssuanceOrder = await subject();

      const order: IssuanceOrder = {
        setAddress: subjectSetAddress,
        makerAddress: subjectMakerAddress,
        makerToken: subjectMakerToken,
        relayerAddress: subjectRelayerAddress,
        relayerToken: subjectRelayerToken,
        quantity: subjectQuantity,
        makerTokenAmount: subjectMakerTokenAmount,
        expiration: subjectExpiration,
        makerRelayerFee: subjectMakerRelayerFee,
        takerRelayerFee: subjectTakerRelayerFee,
        requiredComponents: subjectRequiredComponents,
        requiredComponentAmounts: subjectRequredComponentAmounts,
        salt: subjectSalt,
      };
      const orderHashBuffer = SignatureUtils.addPersonalMessagePrefix(SetProtocolUtils.hashOrderHex(order));
      const signature = signedIssuanceOrder.signature;
      const signerPublicKey = ethUtil.ecrecover(
        ethUtil.toBuffer(orderHashBuffer),
        Number(signature.v.toString()),
        ethUtil.toBuffer(signature.r),
        ethUtil.toBuffer(signature.s),
      );

      const signerWalletAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(signerPublicKey));
      expect(signerWalletAddress).to.equal(DEFAULT_ACCOUNT);
    });

    describe('when the set address is invalid', async () => {
      beforeEach(async () => {
        subjectSetAddress = 'invalidSetAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected setAddress to conform to schema /Address.

        Encountered: "invalidSetAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the maker address is invalid', async () => {
      beforeEach(async () => {
        subjectMakerAddress = 'invalidMakerAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected makerAddress to conform to schema /Address.

        Encountered: "invalidMakerAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the relayer address is invalid', async () => {
      beforeEach(async () => {
        subjectRelayerAddress = 'invalidRelayerAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected relayerAddress to conform to schema /Address.

        Encountered: "invalidRelayerAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the relayer address is invalid', async () => {
      beforeEach(async () => {
        subjectRelayerToken = 'invalidRelayerTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected relayerToken to conform to schema /Address.

        Encountered: "invalidRelayerTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the relayer token address is invalid', async () => {
      beforeEach(async () => {
        subjectRelayerToken = 'invalidRelayerTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected relayerToken to conform to schema /Address.

        Encountered: "invalidRelayerTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the quantity is negative', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = new BigNumber(-1);

        subjectQuantity = invalidQuantity;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidQuantity} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the token addresses and quantities are not the same length', async () => {
      beforeEach(async () => {
        subjectRequiredComponents = [componentTokens[0].address];
        subjectRequredComponentAmounts = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          'The requiredComponents and requiredComponentAmounts arrays need to be equal lengths.'
        );
      });
    });

    describe('when the token addresses contains an empty address', async () => {
      beforeEach(async () => {
        const placeholderRequiredAmountForArrayLength = ether(1);

        subjectRequiredComponents = [''];
        subjectRequredComponentAmounts = [placeholderRequiredAmountForArrayLength];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('The string tokenAddress cannot be empty.');
      });
    });

    describe('when required components contains an invalid address', async () => {
      let invalidComponentAddress: Address;

      beforeEach(async () => {
        const placeholderRequiredAmountForArrayLength = ether(1);
        invalidComponentAddress = 'someNonAddressString';

        subjectRequiredComponents = [invalidComponentAddress];
        subjectRequredComponentAmounts = [placeholderRequiredAmountForArrayLength];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected tokenAddress to conform to schema /Address.

        Encountered: "someNonAddressString"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when a required component is not a part of the Set', async () => {
      let invalidComponentAddress: Address;

      beforeEach(async () => {
        const [invalidComponent] = await deployTokensAsync(1, provider);

        invalidComponentAddress = invalidComponent.address;
        subjectRequiredComponents[0] = invalidComponentAddress;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Token address at ${invalidComponentAddress} is not a component of the Set Token at ${subjectSetAddress}.`
        );
      });
    });

    describe('when the token addresses contains an address for a contract that is not ERC20', async () => {
      let nonERC20ContractAddress: Address;

      beforeEach(async () => {
        const placeholderRequiredAmountForArrayLength = ether(1);
        nonERC20ContractAddress = coreWrapper.vaultAddress;

        subjectRequiredComponents = [nonERC20ContractAddress];
        subjectRequredComponentAmounts = [placeholderRequiredAmountForArrayLength];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Contract at ${nonERC20ContractAddress} does not implement ERC20 interface.`
        );
      });
    });

    describe('when the expiration is expired', async () => {
      beforeEach(async () => {
        const invalidUnixExpirationTime = new BigNumber(1);
        subjectExpiration = invalidUnixExpirationTime;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('Expiration date has already passed.');
      });
    });
  });

  describe('fillOrderAsync', async () => {
    let issuanceOrderMaker: Address;
    let issuanceOrderQuantity: BigNumber;
    let setToken: SetTokenContract;
    let firstComponent: StandardTokenMockContract;
    let secondComponent: StandardTokenMockContract;

    let takerWalletOrder: TakerWalletOrder;

    let zeroExOrder: ZeroExSignedFillOrder;
    let zeroExOrderMaker: Address;

    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectQuantityToFill: BigNumber;
    let subjectOrders: (TakerWalletOrder | ZeroExSignedFillOrder)[];
    let subjectCaller: Address;

    beforeEach(async () => {
      await deployTakerWalletWrapperContract(transferProxy, core, provider);
      await deployZeroExExchangeWrapperContract(
        SetProtocolTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
        SetProtocolTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        transferProxy,
        core,
        provider,
      );

      const issuanceOrderTaker = ACCOUNTS[0].address;
      issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;
      zeroExOrderMaker = ACCOUNTS[3].address;

      firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      secondComponent = await deployTokenAsync(provider, zeroExOrderMaker);
      const makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

      const componentTokens = [firstComponent, secondComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      await approveForTransferAsync([makerToken, relayerToken], transferProxy.address, issuanceOrderMaker);
      await approveForTransferAsync([firstComponent, relayerToken], transferProxy.address, issuanceOrderTaker);
      await approveForTransferAsync(
        [secondComponent],
        SetProtocolTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExOrderMaker
      );

      issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address, secondComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );

      takerWalletOrder = {
        takerTokenAddress: firstComponent.address,
        takerTokenAmount: requredComponentAmounts[0],
      } as TakerWalletOrder;

      zeroExOrder = await setProtocolUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                  // senderAddress
        zeroExOrderMaker,                              // makerAddress
        NULL_ADDRESS,                                  // takerAddress
        ZERO,                                          // makerFee
        ZERO,                                          // takerFee
        requredComponentAmounts[1],                    // makerAssetAmount
        ether(10).div(2),                              // takerAssetAmount
        secondComponent.address,                       // makerAssetAddress
        makerToken.address,                            // takerAssetAddress
        SetProtocolUtils.generateSalt(),               // salt
        SetProtocolTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
        NULL_ADDRESS,                                  // feeRecipientAddress
        generateFutureTimestamp(10000),                // expirationTimeSeconds
        ether(10).div(2),                              // amount of zeroExOrder to fill
      );

      subjectOrders = [takerWalletOrder, zeroExOrder];
      subjectQuantityToFill = issuanceOrderQuantity;
      subjectCaller = issuanceOrderTaker;
    });

    async function subject(): Promise<string> {
      return await ordersAPI.fillOrderAsync(
        subjectSignedIssuanceOrder,
        subjectQuantityToFill,
        subjectOrders,
        { from: subjectCaller }
      );
    }

    test('issues the set to the order maker', async () => {
      const existingUserSetTokenBalance = await setToken.balanceOf.callAsync(issuanceOrderMaker);

      await subject();

      const expectedUserSetTokenBalance = existingUserSetTokenBalance.add(issuanceOrderQuantity);
      const newUserSetTokenBalance = await setToken.balanceOf.callAsync(issuanceOrderMaker);
      expect(newUserSetTokenBalance).to.eql(expectedUserSetTokenBalance);
    });

    describe('when the quantities contains a negative number', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = new BigNumber(-1);

        subjectQuantityToFill = invalidQuantity;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidQuantity} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the orders array is empty', async () => {
      beforeEach(async () => {
        subjectOrders = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The array orders cannot be empty.`
        );
      });
    });

    describe('when the fill amount is not valid multiple of natural unit', async () => {
      beforeEach(async () => {
        subjectQuantityToFill = ether(3); // naturalUnit = ether(2)
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Fill quantity of issuance order needs to be multiple of natural unit.`
        );
      });
    });

    describe('when the 0x order maker asset is not a component of the Set', async () => {
      let nonComponentToken: StandardTokenMockContract;

      beforeEach(async () => {
        nonComponentToken = await deployTokenAsync(provider, issuanceOrderMaker);
        zeroExOrder.makerAssetData = SetProtocolUtils.encodeAddressAsAssetData(nonComponentToken.address);
        subjectOrders[1] = zeroExOrder;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Token address at ${nonComponentToken.address} is not a component ` +
          `of the Set Token at ${subjectSignedIssuanceOrder.setAddress}.`
        );
      });
    });

    describe('when the 0x order maker  does not have sufficient maker token balance', async () => {
      beforeEach(async () => {
        const subjectZeroExMakerBalance = await secondComponent.balanceOf.callAsync(zeroExOrderMaker);
        await secondComponent.transfer.sendTransactionAsync(
          transferProxy.address, // Faulty address
          subjectZeroExMakerBalance,
          { from: zeroExOrderMaker }
        );
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        User: ${zeroExOrderMaker} has balance of ${ZERO}

        when required balance is ${takerWalletOrder.takerTokenAmount} at token address ${secondComponent.address}.
      `
        );
      });
    });

    describe('when the taker wallet order taker asset is not a component of the Set', async () => {
      let nonComponentToken: StandardTokenMockContract;

      beforeEach(async () => {
        nonComponentToken = await deployTokenAsync(provider, issuanceOrderMaker);
        takerWalletOrder.takerTokenAddress = nonComponentToken.address;
        subjectOrders[0] = takerWalletOrder;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Token address at ${nonComponentToken.address} is not a component ` +
          `of the Set Token at ${subjectSignedIssuanceOrder.setAddress}.`
        );
      });
    });

    describe('when the taker wallet order submitter has not set sufficient taker token allowance', async () => {
      beforeEach(async () => {
        await firstComponent.approve.sendTransactionAsync(
          transferProxy.address,
          ZERO,
          { from: subjectCaller }
        );
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has allowance of ${ZERO}

        when required allowance is ${takerWalletOrder.takerTokenAmount} at token

        address: ${firstComponent.address} for spender: ${transferProxy.address}.
      `
        );
      });
    });

    describe('when the taker wallet order submitter does not have sufficient taker token balance', async () => {
      beforeEach(async () => {
        const subjectCallerBalance = await firstComponent.balanceOf.callAsync(subjectCaller);
        await firstComponent.transfer.sendTransactionAsync(
          transferProxy.address, // Faulty address
          subjectCallerBalance,
          { from: subjectCaller }
        );
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has balance of ${ZERO}

        when required balance is ${takerWalletOrder.takerTokenAmount} at token address ${firstComponent.address}.
      `
        );
      });
    });

    describe('when liquidity amounts don’t match amount of components of issuance order', async () => {
      beforeEach(async () => {
        const takerWalletOrder = subjectOrders[0] as TakerWalletOrder;
        takerWalletOrder.takerTokenAmount = takerWalletOrder.takerTokenAmount.sub(1);
        subjectOrders[0] = takerWalletOrder;
      });

      test('throws', async () => {
        const {
          takerTokenAddress,
          takerTokenAmount,
        } = subjectOrders[0] as TakerWalletOrder;

        const {
          requiredComponentAmounts,
          requiredComponents,
          quantity,
        } = subjectSignedIssuanceOrder;

        let takerIndex = 0;
        _.each(requiredComponents, (component, i) => {
          if (component === takerTokenAddress) {
            takerIndex = i;
          }
        });

        const desiredComponentFillAmount =
          calculatePartialAmount(
            requiredComponentAmounts[takerIndex],
            subjectQuantityToFill,
            quantity,
          );

        return expect(subject()).to.be.rejectedWith(
          `Token amount of ${takerTokenAddress} from liquidity sources, ${takerTokenAmount.toString()}, ` +
          `do not match up to the desired component fill amount of issuance order ` +
          `${desiredComponentFillAmount.toString()}.`,
        );
      });
    });
  });

  describe('cancelOrderAsync', async () => {
    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectCancelQuantity: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const issuanceOrderTaker = ACCOUNTS[0].address;
      const issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;
      const zeroExOrderMaker = ACCOUNTS[3].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(provider, zeroExOrderMaker);
      const makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

      const componentTokens = [firstComponent, secondComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      const setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      const issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address, secondComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );
      subjectCancelQuantity = issuanceOrderQuantity;
      subjectCaller = issuanceOrderMaker;
    });

    async function subject(): Promise<string> {
      return await ordersAPI.cancelOrderAsync(
        subjectSignedIssuanceOrder,
        subjectCancelQuantity,
        { from: subjectCaller }
      );
    }

    test('updates the cancel amount for the order', async () => {
      const { signature, ...issuanceOrder } = subjectSignedIssuanceOrder;
      const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);
      const existingCancelAmount = await core.orderCancels.callAsync(orderHash);

      await subject();

      const expectedCancelAmounts = existingCancelAmount.add(subjectCancelQuantity);
      const newCancelAmount = await core.orderCancels.callAsync(orderHash);
      expect(newCancelAmount).to.bignumber.equal(expectedCancelAmounts);
    });

    describe('when the quantity is negative', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = new BigNumber(-1);

        subjectCancelQuantity = invalidQuantity;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidQuantity} inputted needs to be greater than zero.`
        );
      });
    });
  });

  describe('getOrderFillsAsync', async () => {
    let issuanceOrderMaker: Address;
    let issuanceOrderQuantity: BigNumber;
    let setToken: SetTokenContract;

    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectQuantityToFill: BigNumber;

    beforeEach(async () => {
      let orders: (TakerWalletOrder | ZeroExSignedFillOrder)[];
      let caller: Address;

      await deployTakerWalletWrapperContract(transferProxy, core, provider);
      await deployZeroExExchangeWrapperContract(
        SetProtocolTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
        SetProtocolTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        transferProxy,
        core,
        provider,
      );

      const issuanceOrderTaker = ACCOUNTS[0].address;
      issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

      const componentTokens = [firstComponent, secondComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      await approveForTransferAsync([makerToken, relayerToken], transferProxy.address, issuanceOrderMaker);
      await approveForTransferAsync(
        [firstComponent, secondComponent, relayerToken],
        transferProxy.address,
        issuanceOrderTaker
      );

      issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address, secondComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );

      const takerWalletOrder1 = {
        takerTokenAddress: firstComponent.address,
        takerTokenAmount: requredComponentAmounts[0],
      } as TakerWalletOrder;

      const takerWalletOrder2 = {
        takerTokenAddress: secondComponent.address,
        takerTokenAmount: requredComponentAmounts[1],
      } as TakerWalletOrder;

      orders = [takerWalletOrder1, takerWalletOrder2];
      subjectQuantityToFill = issuanceOrderQuantity;
      caller = issuanceOrderTaker;

      await ordersAPI.fillOrderAsync(
        subjectSignedIssuanceOrder,
        subjectQuantityToFill,
        orders,
        { from: caller }
      );
    });

    async function subject(): Promise<BigNumber> {
      return await ordersAPI.getOrderFillsAsync(
        subjectSignedIssuanceOrder,
      );
    }

    test('should return with the correct filled quantity', async () => {
      const orderFilledQuantity = await subject();

      expect(orderFilledQuantity).to.bignumber.equal(subjectQuantityToFill);
    });
  });

  describe('getOrderCancelledAsync', async () => {
    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectCancelQuantity: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const issuanceOrderTaker = ACCOUNTS[0].address;
      const issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

      const componentTokens = [firstComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      const setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      const issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );
      subjectCancelQuantity = issuanceOrderQuantity;
      subjectCaller = issuanceOrderMaker;

      await ordersAPI.cancelOrderAsync(
        subjectSignedIssuanceOrder,
        subjectCancelQuantity,
        { from: subjectCaller }
      );
    });

    async function subject(): Promise<BigNumber> {
      return ordersAPI.getOrderCancelledAsync(
        subjectSignedIssuanceOrder,
      );
    }
    test('should return with the correct cancel quantity', async () => {
      const orderFilledQuantity = await subject();

      expect(orderFilledQuantity).to.bignumber.equal(subjectCancelQuantity);
    });
  });
});
