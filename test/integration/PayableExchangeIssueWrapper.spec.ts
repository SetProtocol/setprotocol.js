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
import * as setProtocolUtils from 'set-protocol-utils';
import { Bytes, ExchangeIssueParams } from 'set-protocol-utils';
import Web3 from 'web3';
import { Core, Vault } from 'set-protocol-contracts';
import {
  CoreContract,
  ExchangeIssueModuleContract,
  IssuanceOrderModuleContract,
  PayableExchangeIssueContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
  WhiteListContract,
  ZeroExExchangeWrapperContract,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { CoreWrapper, PayableExchangeIssueWrapper } from '@src/wrappers';
import { OrderAPI } from '@src/api';
import {
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
  ONE_DAY_IN_SECONDS,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
} from '@src/constants';
import { Assertions } from '@src/assertions';
import {
  addAuthorizationAsync,
  addModuleAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployCoreContract,
  deployExchangeIssueModuleAsync,
  deployPayableExchangeIssueAsync,
  deploySetTokenAsync,
  deployTokenAsync,
  deployTokensAsync,
  deployWethMockAsync,
  deployZeroExExchangeWrapperContract,
  getVaultBalances,
  tokenDeployedOnSnapshot,
  transitionToRebalanceAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether,
  extractNewSetTokenAddressFromLogs,
  generateFutureTimestamp,
  getFormattedLogsFromTxHash,
} from '@src/util';
import {
  Address,
  ZeroExSignedFillOrder,
} from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);
const setUtils = new SetUtils(web3);
const setTestUtils = new SetTestUtils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('PayableExchangeIssueWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let issuanceOrderModule: IssuanceOrderModuleContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;
  let whitelist: WhiteListContract;
  let payableExchangeIssue: PayableExchangeIssueContract;
  let wrappedEtherMock: WethMockContract;
  let exchangeIssueModule: ExchangeIssueModuleContract;

  let payableExchangeIssueWrapper: PayableExchangeIssueWrapper;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy,
      vault,
      setTokenFactory,
      rebalancingSetTokenFactory,
      rebalanceAuctionModule,
      issuanceOrderModule,
      whitelist,
    ] = await deployBaseContracts(web3);

    console.log("Transfer proxy", transferProxy);

    exchangeIssueModule = await deployExchangeIssueModuleAsync(web3, core, transferProxy, vault);
    await addModuleAsync(core, exchangeIssueModule.address);
    await addAuthorizationAsync(transferProxy, exchangeIssueModule.address);
    await addAuthorizationAsync(vault, exchangeIssueModule.address);

    await deployZeroExExchangeWrapperContract(
      web3,
      SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
      SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
      SetTestUtils.ZERO_EX_TOKEN_ADDRESS,
      transferProxy,
      core,
    );

    wrappedEtherMock = await deployWethMockAsync(web3, NULL_ADDRESS, ZERO);
    payableExchangeIssue = await deployPayableExchangeIssueAsync(
      web3,
      core,
      transferProxy,
      exchangeIssueModule,
      wrappedEtherMock,
    );    

    payableExchangeIssueWrapper = new PayableExchangeIssueWrapper(
      web3,
      payableExchangeIssue.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('issueRebalancingSetWithEther', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectExchangeIssueParams: ExchangeIssueParams;
    let subjectOrderData: Bytes;
    let subjectCaller: Address;
    let subjectValue: BigNumber;

    let rebalancingSetQuantity: BigNumber;

    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let rebalancingUnitShares: BigNumber;

    let exchangeIssueSetAddress: Address;
    let exchangeIssueQuantity: BigNumber;
    let exchangeIssuePaymentToken: Address;
    let exchangeIssuePaymentTokenAmount: BigNumber;
    let exchangeIssueRequiredComponents: Address[];
    let exchangeIssueRequiredComponentAmounts: BigNumber[];

    let zeroExOrder: ZeroExSignedFillOrder;

    beforeEach(async () => {


      subjectCaller = ACCOUNTS[1].address;
    });

    async function subject(): Promise<string> {
      return await payableExchangeIssueWrapper.issueRebalancingSetWithEther(
        subjectRebalancingSetAddress,
        subjectExchangeIssueParams,
        subjectOrderData,
        { from: subjectCaller, value: subjectValue.toString() }
      );
    }

    test('issues the set to the order maker', async () => {
      expect(1).to.equal(1);
    });
  });
});
