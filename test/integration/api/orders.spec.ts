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

import {
  Address,
  Bytes,
  ECSig,
  IssuanceOrder,
  SignedIssuanceOrder,
  SetProtocolUtils,
} from 'set-protocol-utils';
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import * as _ from 'lodash';
import * as Web3 from 'web3';
import compact = require('lodash.compact');

import { BigNumber, SignatureUtils } from '../../../src/util';
import ChaiSetup from '../../helpers/chaiSetup';

import { CoreWrapper } from '../../../src/wrappers';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '../../../src/constants/accounts';
import { OrderAPI } from '../../../src/api/orders';
import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  STANDARD_DECIMALS,
  STANDARD_SUPPLY,
  STANDARD_TRANSFER_VALUE,
  ZERO,
} from '../../../src/constants';
import { Web3Utils, generateFutureTimestamp } from '../../../src/util';
import {
  initializeCoreWrapper,
} from '../../helpers/coreHelpers';

const OTHER_ACCOUNT = ACCOUNTS[1].address;

ChaiSetup.configure();
const { expect } = chai;

const contract = require('truffle-contract');

const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const setProtocolUtils = new SetProtocolUtils(web3);


describe('OrderAPI', () => {
  let coreWrapper: CoreWrapper;
  let ordersAPI: OrderAPI;

  beforeEach(async () => {
    coreWrapper = await initializeCoreWrapper(provider);
    ordersAPI = new OrderAPI(web3, coreWrapper);
  });

  test('Orders API can be instantiated', async () => {
    ordersAPI = new OrderAPI(web3, coreWrapper);
    expect(ordersAPI);

    expect(ordersAPI.generateSalt);
    expect(ordersAPI.generateExpirationTimestamp);
    expect(ordersAPI.isValidSignatureOrThrowAsync);
    expect(ordersAPI.signOrderAsync);
    expect(ordersAPI.createSignedOrderAsync);
    expect(ordersAPI.fillOrderAsync);
    expect(ordersAPI.cancelOrderAsync);
  });

  describe('#generateExpirationTimestamp', async () => {
    let secondsInFuture: number;

    function subject(): BigNumber {
      return ordersAPI.generateExpirationTimestamp(
        secondsInFuture,
      );
    }

    test('should generate a timestamp in the future', async () => {
      secondsInFuture = 100000;

      const generatedTimestamp = subject();
      const currentTime = new BigNumber(Math.floor((Date.now()) / 1000));

      expect(generatedTimestamp).to.bignumber.greaterThan(currentTime);
    });
  });

  describe('#isValidOrderHashOrThrow', async () => {
    let subjectData: Bytes;

    function subject(): void {
      return ordersAPI.isValidOrderHashOrThrow(
        subjectData,
      );
    }

    test('should not throw', async () => {
      subjectData = SetProtocolUtils.stringToBytes('hello');
      subject();
    });

    describe('with malformed data', async () => {
      test('should throw', async () => {
        subjectData = '0x0000shouldnotwork';
        expect(() => subject()).to.throw();
      });
    });
  });

  describe('#isValidSignatureOrThrowAsync', async () => {
    let issuanceOrder: IssuanceOrder;
    let signature: ECSig;
    let signer: Address;

    beforeEach(async () => {
      issuanceOrder = {
        setAddress: DEFAULT_ACCOUNT,
        makerAddress: DEFAULT_ACCOUNT,
        makerToken: DEFAULT_ACCOUNT,
        relayerAddress: DEFAULT_ACCOUNT,
        relayerToken: DEFAULT_ACCOUNT,
        quantity: ZERO,
        makerTokenAmount: ZERO,
        expiration: new BigNumber(Date.now()),
        makerRelayerFee: ZERO,
        takerRelayerFee: ZERO,
        requiredComponents: [],
        requiredComponentAmounts: [],
        salt: ZERO,
      };

      const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);
      signature = await setProtocolUtils.signMessage(orderHash, signer);
    });

    async function subject(): Promise<boolean> {
      return await ordersAPI.isValidSignatureOrThrowAsync(
        issuanceOrder,
        signature
      );
    }

    describe('when signer is the issuance order maker', async () => {
      beforeAll(async () => {
        signer = DEFAULT_ACCOUNT;
      });

      test('should return true with a valid signature', async () => {
        const isValid = await subject();
        expect(isValid).to.equal(true);
      });
    });

    describe('when signer is not the issuance order maker', async () => {
      beforeAll(async () => {
        signer = OTHER_ACCOUNT;
      });

      test('should throw', async () => {
        try {
          await subject();

          // The subject should throw, so it will not ruun this line
          expect(false).to.equal(true);
        } catch (error) {
          expect(
            JSON.stringify(error)
          ).to.equal(
            JSON.stringify(new Error('Signature does not match issuance order attributes.'))
          );
        }
      });
    });
  });

  describe('#signOrderAsync', async () => {
    let issuanceOrder: IssuanceOrder;
    let signer: Address;
    let orderHash: string;

    beforeEach(async () => {
      issuanceOrder = {
        setAddress: DEFAULT_ACCOUNT,
        makerAddress: DEFAULT_ACCOUNT,
        makerToken: DEFAULT_ACCOUNT,
        relayerAddress: DEFAULT_ACCOUNT,
        relayerToken: DEFAULT_ACCOUNT,
        quantity: ZERO,
        makerTokenAmount: ZERO,
        expiration: new BigNumber(Date.now()),
        makerRelayerFee: ZERO,
        takerRelayerFee: ZERO,
        requiredComponents: [],
        requiredComponentAmounts: [],
        salt: ZERO,
      };

      orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);
    });

    async function subject(): Promise<ECSig> {
      return await ordersAPI.signOrderAsync(
        issuanceOrder,
        { from: signer }
      );
    }

    describe('when the signer is valid', async () => {
      beforeAll(async () => {
        signer = DEFAULT_ACCOUNT;
      });

      it('should produce a valid signature', async () => {
        const signature = await subject();

        const isValid = SignatureUtils.isValidSignature(
          orderHash,
          signature,
          signer,
        );

        expect(isValid);
      });
    });
  });

  // TODO: Add test to check non-fillable state
  describe('#validateOrderFillableOrThrowAsync', async () => {
    let signedIssuanceOrder: SignedIssuanceOrder;
    let signer: Address;

    beforeEach(async () => {
      signer = DEFAULT_ACCOUNT;

      const order: IssuanceOrder = {
        setAddress: DEFAULT_ACCOUNT,
        makerAddress: DEFAULT_ACCOUNT,
        makerToken: DEFAULT_ACCOUNT,
        relayerAddress: DEFAULT_ACCOUNT,
        relayerToken: DEFAULT_ACCOUNT,
        quantity: new BigNumber(100000),
        makerTokenAmount: ZERO,
        expiration: generateFutureTimestamp(10000),
        makerRelayerFee: ZERO,
        takerRelayerFee: ZERO,
        requiredComponents: [],
        requiredComponentAmounts: [],
        salt: ZERO,
      };

      const orderHash = SetProtocolUtils.hashOrderHex(order);

      const signature = await setProtocolUtils.signMessage(orderHash, signer);
      signedIssuanceOrder = Object.assign({}, order, { signature });
    });

    async function subject(): Promise<void> {
      return await ordersAPI.validateOrderFillableOrThrowAsync(
        signedIssuanceOrder,
      );
    }

    describe('with a valid signature, expiration time, and non-filled quantity', async () => {
      it('should not revert', async () => {
        await subject();
      });
    });
  });
});
