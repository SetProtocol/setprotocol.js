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

import * as _ from 'lodash';
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import {
  Blockchain,
  CompoundHelper,
  CoreHelper,
  ERC20Helper,
  RebalancingHelper,
  RebalancingSetTokenContract,
  RebalancingSetCTokenBidderContract,
  StandardTokenMockContract,
} from 'set-protocol-contracts';

import {
  BidderContract,
  ZeroExBidExchangeWrapperContract,
  KyberBidExchangeWrapperContract,
} from 'set-rebalancing-bot-contracts';


import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { BidderAPI } from '@src/api';
import { Assertions } from '@src/assertions';
import {
  ONE_DAY_IN_SECONDS,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_REBALANCING_NATURAL_UNIT,
  NULL_ADDRESS,
  TX_DEFAULTS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  ZERO,
} from '@src/constants';
import {
  addPriceCurveToCoreAsync,
  addWhiteListedTokenAsync,
  deployBaseContracts,
  deployConstantAuctionPriceCurveAsync,
  deployRebalancingBidderBotAsync,
  deployRebalancingSetCTokenBidderAsync,
  deployTokensSpecifyingDecimals,
  deployKyberBidExchangeWrapperAsync,
  deployZeroExBidExchangeWrapperAsync,
  transitionToRebalanceAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether,
} from '@src/util';
import {
  Address,
  BidderConfig,
  KyberTrade,
  ZeroExSignedFillOrder
} from '@src/types/common';
import { KyberNetworkHelper } from '@test/helpers/kyberNetworkHelper';

import ChaiSetup from '@test/helpers/chaiSetup';
ChaiSetup.configure();

const Core = require('set-protocol-contracts/dist/artifacts/ts/Core').Core;

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const {
  SetProtocolTestUtils: SetTestUtils,
  SetProtocolUtils: SetUtils,
  Web3Utils,
} = setProtocolUtils;
const setUtils = new SetUtils(web3);
const web3Utils = new Web3Utils(web3);
const blockchain = new Blockchain(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;

const kyberReserveOperator = ACCOUNTS[1].address;
const zeroExOrderMakerAccount = ACCOUNTS[2].address;
const managerAddress = ACCOUNTS[3].address;

describe('BidderAPI', () => {
  let bidder: BidderContract;
  let zeroExBidExchangeWrapper: ZeroExBidExchangeWrapperContract;
  let kyberBidExchangeWrapper: KyberBidExchangeWrapperContract;
  let rebalancingSetCTokenBidder: RebalancingSetCTokenBidderContract;

  let config: BidderConfig;
  let bidderAPI: BidderAPI;

  let daiInstance: StandardTokenMockContract;
  let cDAIInstance: StandardTokenMockContract;
  let wethInstance: StandardTokenMockContract;
  let rebalancingSetToken: RebalancingSetTokenContract;
  let minBid: BigNumber;

  const compoundHelper = new CompoundHelper(DEFAULT_ACCOUNT);
  const coreHelper = new CoreHelper(DEFAULT_ACCOUNT, DEFAULT_ACCOUNT);
  const erc20Helper = new ERC20Helper(DEFAULT_ACCOUNT);
  const rebalancingHelper = new RebalancingHelper(
    DEFAULT_ACCOUNT,
    coreHelper,
    erc20Helper,
    blockchain
  );
  const kyberNetworkHelper = new KyberNetworkHelper();

  beforeAll(async () => {
    ABIDecoder.addABI(coreContract.abi);

    const wethDecimals = 18;
    const daiDecimals = 18;
    const underlyingInstances = await deployTokensSpecifyingDecimals(
      2,
      [wethDecimals, daiDecimals],
      web3,
    );

    wethInstance = underlyingInstances[0];
    daiInstance = underlyingInstances[1];
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    await kyberNetworkHelper.setup();
    await kyberNetworkHelper.fundReserveWithEth(
      kyberReserveOperator,
      ether(90),
    );

    const  [
      core,
      transferProxy,
      ,
      setTokenFactory,
      rebalancingSetTokenFactory,
      rebalanceAuctionModule,
      rebalancingComponentWhiteList,
    ] = await deployBaseContracts(web3);

    const cDAIAddress = await compoundHelper.deployMockCDAI(daiInstance.address, DEFAULT_ACCOUNT);
    await compoundHelper.enableCToken(cDAIAddress);
    // Set the Borrow Rate
    await compoundHelper.setBorrowRate(cDAIAddress, new BigNumber('29313252165'));

    await erc20Helper.approveTransferAsync(
      daiInstance,
      cDAIAddress,
      DEFAULT_ACCOUNT
    );
    cDAIInstance = await erc20Helper.getTokenInstanceAsync(cDAIAddress);

    const dataDescription = 'cDAI Bidder Contract';

    rebalancingSetCTokenBidder = await deployRebalancingSetCTokenBidderAsync(
      web3,
      rebalanceAuctionModule,
      transferProxy,
      [cDAIAddress],
      [daiInstance.address],
      dataDescription
    );

    kyberBidExchangeWrapper = await deployKyberBidExchangeWrapperAsync(web3);
    zeroExBidExchangeWrapper = await deployZeroExBidExchangeWrapperAsync(web3);

    bidder = await deployRebalancingBidderBotAsync(
      web3,
      rebalancingSetCTokenBidder,
      [kyberBidExchangeWrapper.address, zeroExBidExchangeWrapper.address],
      // Proxy Addresses: 0x ERC20 proxy and Kyber Network Proxy
      [kyberNetworkHelper.kyberNetworkProxy, SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS],
      // Secondary Proxy Addresses: 0x Exchange, Kyber is NULL
      [NULL_ADDRESS, SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS],
    );

    await bidder.addAuthorizedAddress.sendTransactionAsync(
      DEFAULT_ACCOUNT,
      { from: DEFAULT_ACCOUNT }
    );

    // Set token approvals to contract
    await erc20Helper.approveTransfersAsync(
      [daiInstance, wethInstance],
      bidder.address,
      DEFAULT_ACCOUNT
    );

    // Create Sets
    const defaultSetToken = await coreHelper.createSetTokenAsync(
      core,
      setTokenFactory.address,
      [wethInstance.address],
      [ether(1)],
      ether(0.1),
    );

    const cTokenSetToken = await coreHelper.createSetTokenAsync(
      core,
      setTokenFactory.address,
      [cDAIInstance.address],
      [ether(0.01)],
      ether(0.001),
    );

    rebalancingSetToken = await rebalancingHelper.createDefaultRebalancingSetTokenAsync(
      core,
      rebalancingSetTokenFactory.address,
      managerAddress,
      defaultSetToken.address,
      ONE_DAY_IN_SECONDS,
      ether(1)
    );
    // Approve tokens and issue defaultSetToken
    const baseSetIssueQuantity = ether(100);

    await erc20Helper.approveTransfersAsync([
      wethInstance,
    ], transferProxy.address);

    await core.issue.sendTransactionAsync(
      defaultSetToken.address,
      baseSetIssueQuantity,
      {from: DEFAULT_ACCOUNT}
    );

    // Use issued defaultSetToken to issue rebalancingSetToken
    await erc20Helper.approveTransfersAsync([defaultSetToken], transferProxy.address);
    const rebalancingSetTokenQuantityToIssue = baseSetIssueQuantity
      .mul(DEFAULT_REBALANCING_NATURAL_UNIT)
      .div(ether(1));

    await core.issue.sendTransactionAsync(
      rebalancingSetToken.address,
      rebalancingSetTokenQuantityToIssue,
      {from: DEFAULT_ACCOUNT}
    );
    // Determine minimum bid
    const decOne = await defaultSetToken.naturalUnit.callAsync();
    const decTwo = await cTokenSetToken.naturalUnit.callAsync();
    minBid = new BigNumber(Math.max(decOne.toNumber(), decTwo.toNumber()) * 1000);

    // Approve proposed Set's components to the rebalancingComponentWhiteList;
    const [proposalComponentOne] = await cTokenSetToken.getComponents.callAsync();
    await addWhiteListedTokenAsync(rebalancingComponentWhiteList, proposalComponentOne);

    // Deploy price curve used in auction
    const priceCurve = await deployConstantAuctionPriceCurveAsync(
      web3,
      DEFAULT_AUCTION_PRICE_NUMERATOR,
      DEFAULT_AUCTION_PRICE_DENOMINATOR
    );

    addPriceCurveToCoreAsync(
      core,
      priceCurve.address
    );

    // Transition to rebalance state
    const auctionPriceCurveAddress = priceCurve.address;
    const setAuctionTimeToPivot = new BigNumber(100000);
    const setAuctionStartPrice = new BigNumber(500);
    const setAuctionPivotPrice = new BigNumber(1000);
    await transitionToRebalanceAsync(
      web3,
      rebalancingSetToken,
      managerAddress,
      cTokenSetToken.address,
      auctionPriceCurveAddress,
      setAuctionTimeToPivot,
      setAuctionStartPrice,
      setAuctionPivotPrice,
    );

    const assertions = new Assertions(web3);

    config = {
      bidderAddress: bidder.address,
      kyberBidExchangeWrapperAddress: kyberBidExchangeWrapper.address,
      zeroExBidExchangeWrapperAddress: zeroExBidExchangeWrapper.address,
    } as BidderConfig;

    bidderAPI = new BidderAPI(
      web3,
      assertions,
      config
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('#getTokenFlows', async () => {
    let subjectRebalancingSetToken: Address;
    let subjectBidQuantity: BigNumber;

    beforeEach(async () => {
      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectBidQuantity = minBid;

    });

    async function subject(): Promise<any> {
      return await bidderAPI.getTokenFlowsAsync(
        subjectRebalancingSetToken,
        subjectBidQuantity
      );
    }

    test('gets the correct token flows', async () => {
      const tokenFlows = await subject();

      const [
        expectedAddressArray,
        expectedInflowArray,
        expectedOutflowArray,
      ] = await rebalancingSetCTokenBidder.getAddressAndBidPriceArray.callAsync(
        rebalancingSetToken.address,
        minBid,
      );

      expect(
        JSON.stringify(tokenFlows.inflow)
      ).to.equal(
        JSON.stringify(expectedInflowArray)
      );
      expect(
        JSON.stringify(tokenFlows.outflow)
      ).to.equal(
        JSON.stringify(expectedOutflowArray)
      );
      expect(
        JSON.stringify(tokenFlows.tokens)
      ).to.equal(
        JSON.stringify(expectedAddressArray)
      );
    });
  });

  describe('#getSpread', async () => {
    let subjectRebalancingSetToken: Address;
    let subjectQuantity: BigNumber;
    let subjectBenchmarkToken: Address;
    let subjectReceiveTokenAmount: BigNumber;

    let sendTokenQuantity: BigNumber;
    let destinationTokenQuantity: BigNumber;

    let customSendToken: any;
    let isInflow: boolean;

    beforeEach(async () => {
      // Benchmark token is DAI, meaning bid first then exchange
      const sendToken = customSendToken || daiInstance;

      const [
        addressArray,
        inflowUnitArray,
        outflowUnitArray,
      ] = await rebalancingSetCTokenBidder.getAddressAndBidPriceArray.callAsync(
        rebalancingSetToken.address,
        minBid,
      );

      // Find quantity of sendToken either in inflow or outflow array
      const sendTokenIndex = addressArray.indexOf(sendToken.address);
      if (new BigNumber(inflowUnitArray[sendTokenIndex]).gt(0)) {
        sendTokenQuantity = inflowUnitArray[sendTokenIndex];
      } else {
        sendTokenQuantity = outflowUnitArray[sendTokenIndex];
      }

      destinationTokenQuantity =
        isInflow ? new BigNumber(sendTokenQuantity).add(1) : new BigNumber(sendTokenQuantity);

      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectQuantity = minBid;
      subjectBenchmarkToken = sendToken.address;
      subjectReceiveTokenAmount = destinationTokenQuantity;
    });

    async function subject(): Promise<any> {
      return bidderAPI.getSpreadAsync(
        subjectRebalancingSetToken,
        subjectQuantity,
        subjectBenchmarkToken,
        subjectReceiveTokenAmount,
      );
    }

    test('should return the correct spread when benchmark token is inflow', async () => {
      const actualSpread = await subject();

      const expectedSpread = destinationTokenQuantity.sub(sendTokenQuantity);
      expect(actualSpread).to.bignumber.equal(expectedSpread);
    });

    describe('when benchmark token is outflow', async () => {
      beforeAll(async () => {
        // Benchmark token is now WETH, meaning WETH is exchanged first
        customSendToken = wethInstance;
        isInflow = false;
      });

      afterAll(async () => {
        customSendToken = undefined;
        isInflow = true;
      });

      test('should return the correct spread when benchmark token is inflow', async () => {
        const actualSpread = await subject();

        const expectedSpread = new BigNumber(sendTokenQuantity).sub(destinationTokenQuantity);
        expect(actualSpread).to.bignumber.equal(expectedSpread);
      });
    });

    describe('when spread is not profitable', async () => {
      beforeAll(async () => {
        isInflow = false;
      });

      afterAll(async () => {
        isInflow = true;
      });

      test('should return 0 when spread is negative', async () => {
        const actualSpread = await subject();
        expect(actualSpread).to.bignumber.equal(ZERO);
      });
    });
  });

  describe('#bidAndExchangeWithWalletAsync', async () => {
    let subjectRebalancingSetToken: Address;
    let subjectQuantity: BigNumber;
    let subjectBenchmarkToken: Address;
    let subjectExchangeWrapperAddress: Address;
    let subjectOrder: KyberTrade | ZeroExSignedFillOrder;
    let subjectCaller: Address;

    let benchMarkTokenQuantity: BigNumber;
    let benchMarkToken: StandardTokenMockContract;
    let nonBenchMarkTokenQuantity: BigNumber;
    let nonBenchMarkToken: StandardTokenMockContract;

    let customBenchmarkToken: StandardTokenMockContract;
    let customNonBenchmarkToken: StandardTokenMockContract;

    beforeEach(async () => {
      benchMarkToken = customBenchmarkToken || daiInstance;
      nonBenchMarkToken = customNonBenchmarkToken || wethInstance;

      const [
        addressArray,
        inflowUnitArray,
        outflowUnitArray,
      ] = await rebalancingSetCTokenBidder.getAddressAndBidPriceArray.callAsync(
        rebalancingSetToken.address,
        minBid,
      );

      // Find quantity of benchMarkToken either in inflow or outflow array
      const benchMarkTokenIndex = addressArray.indexOf(benchMarkToken.address);
      if (new BigNumber(inflowUnitArray[benchMarkTokenIndex]).gt(0)) {
        benchMarkTokenQuantity = new BigNumber(inflowUnitArray[benchMarkTokenIndex]);
      } else {
        benchMarkTokenQuantity = new BigNumber(outflowUnitArray[benchMarkTokenIndex]);
      }

      // Find quantity of nonBenchMarkToken either in inflow or outflow array
      const nonBenchMarkTokenIndex = addressArray.indexOf(nonBenchMarkToken.address);
      if (new BigNumber(inflowUnitArray[nonBenchMarkTokenIndex]).gt(0)) {
        nonBenchMarkTokenQuantity = new BigNumber(inflowUnitArray[nonBenchMarkTokenIndex]);
      } else {
        nonBenchMarkTokenQuantity = new BigNumber(outflowUnitArray[nonBenchMarkTokenIndex]);
      }

      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectQuantity = minBid;
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<any> {
      return bidderAPI.bidAndExchangeWithWalletAsync(
        subjectRebalancingSetToken,
        subjectQuantity,
        subjectBenchmarkToken,
        subjectExchangeWrapperAddress,
        subjectOrder,
        { from: subjectCaller },
      );
    }

    describe('when Kyber is used for exchange', async () => {
      let isInflow: boolean = true;

      let kyberDestinationTokenQuantity: BigNumber;
      let sourceTokenQuantity: BigNumber;
      let maxDestinationQuantity: BigNumber;

      let customSourceTokenQuantity: BigNumber;

      beforeEach(async () => {
        const receiveToken: any = isInflow ? benchMarkToken : nonBenchMarkToken;
        const sourceToken: any = isInflow ? nonBenchMarkToken : benchMarkToken;

        // Create Kyber trade. Conversion rate pre set on snapshot
        kyberDestinationTokenQuantity = isInflow ? benchMarkTokenQuantity : nonBenchMarkTokenQuantity;
        sourceTokenQuantity = isInflow ? nonBenchMarkTokenQuantity : benchMarkTokenQuantity;

        // Factor in spread for the auction
        const spread = new BigNumber(10);
        maxDestinationQuantity = isInflow ? kyberDestinationTokenQuantity.add(spread) : kyberDestinationTokenQuantity;
        const destinationTokenDecimals = (await receiveToken.decimals.callAsync()).toNumber();
        const sourceTokenDecimals = (await sourceToken.decimals.callAsync()).toNumber();
        const kyberConversionRatePower = new BigNumber(10).pow(18 + sourceTokenDecimals - destinationTokenDecimals);

        const minimumConversionRate = maxDestinationQuantity.div(sourceTokenQuantity)
                                                            .mul(kyberConversionRatePower)
                                                            .round();

        const kyberTrade = {
          sourceToken: sourceToken.address,
          destinationToken: receiveToken.address,
          sourceTokenQuantity: sourceTokenQuantity,
          minimumConversionRate: minimumConversionRate,
          maxDestinationQuantity: maxDestinationQuantity,
        } as KyberTrade;

        await kyberNetworkHelper.approveToReserve(
          receiveToken,
          UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
          kyberReserveOperator,
        );

        // Fund the kyber reserve maker with the receive token
        await erc20Helper.transferTokenAsync(
          receiveToken,
          kyberReserveOperator,
          ether(1000000),
          DEFAULT_ACCOUNT,
        );

        const sourceTokenRateQuantity = customSourceTokenQuantity || sourceTokenQuantity;
        await kyberNetworkHelper.setConversionRates(
          sourceToken.address,
          receiveToken.address,
          sourceTokenRateQuantity,
          maxDestinationQuantity,
        );

        subjectBenchmarkToken = benchMarkToken.address;
        subjectExchangeWrapperAddress = kyberBidExchangeWrapper.address;
        subjectOrder = kyberTrade;
      });

      it('should return the correct tokens from the arb', async () => {
        const previousBenchmarkBalance = await benchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
        const previousNonBenchmarkBalance = await nonBenchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

        await subject();

        const currentBenchmarkBalance = await benchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
        const currentNonBenchmarkBalance = await nonBenchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
        const expectedBenchmarkBalance = previousBenchmarkBalance
                                           .add(maxDestinationQuantity)
                                           .sub(kyberDestinationTokenQuantity);
        expect(currentBenchmarkBalance).to.bignumber.equal(expectedBenchmarkBalance);
        expect(currentNonBenchmarkBalance).to.bignumber.equal(previousNonBenchmarkBalance);
      });

      describe('when benchMarkToken is an outflow', async () => {
        beforeAll(async () => {
          isInflow = false;
          customBenchmarkToken = wethInstance;
          customNonBenchmarkToken = daiInstance;
          customSourceTokenQuantity = ether(800);
        });

        afterAll(async () => {
          isInflow = true;
          customBenchmarkToken = undefined;
          customNonBenchmarkToken = undefined;
          customSourceTokenQuantity = undefined;
        });

        it('should return the correct tokens from the arb', async () => {
          const previousBenchmarkBalance = await benchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
          const previousNonBenchmarkBalance = await nonBenchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

          await subject();

          const currentBenchmarkBalance = await benchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
          const currentNonBenchmarkBalance = await nonBenchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

          const expectedBenchmarkBalance =
            previousBenchmarkBalance.sub(customSourceTokenQuantity).add(sourceTokenQuantity);
          expect(currentBenchmarkBalance).to.bignumber.equal(expectedBenchmarkBalance);
          expect(currentNonBenchmarkBalance).to.bignumber.equal(previousNonBenchmarkBalance);
        });
      });

      describe('and the caller has not approved benchmark token for transfer', async () => {
        beforeEach(async () => {
          subjectCaller = ACCOUNTS[3].address;
        });

        test('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has allowance of 0

        when required allowance is ${benchMarkTokenQuantity} at token

        address: ${benchMarkToken.address} for spender: ${bidder.address}.
      `
          );
        });
      });

      describe('and the caller does not have the balance to transfer', async () => {
        beforeEach(async () => {
          subjectCaller = ACCOUNTS[3].address;
          await benchMarkToken.approve.sendTransactionAsync(
            bidder.address,
            UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
            { from: subjectCaller }
          );
        });

        test('throw', async () => {
          return expect(subject()).to.be.rejectedWith(
      `
        User: ${subjectCaller} has balance of 0

        when required balance is ${benchMarkTokenQuantity} at token address ${benchMarkToken.address}.
      `
          );
        });
      });
    });

    describe('when 0x is used for exchange', async () => {
      let isInflow: boolean = true;
      let spread: BigNumber;

      let customSpread: BigNumber;

      beforeEach(async () => {

        const zeroExOrderTakerToken = isInflow ? nonBenchMarkToken : benchMarkToken;
        const zeroExOrderMakerToken = isInflow ? benchMarkToken : nonBenchMarkToken;

        // Create 0x trade
        await erc20Helper.approveTransferAsync(
          zeroExOrderMakerToken,
          SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
          zeroExOrderMakerAccount
        );

        // Fund the 0x maker with the taker token
        await erc20Helper.transferTokensAsync(
          [zeroExOrderMakerToken],
          zeroExOrderMakerAccount,
          ether(1000000),
          DEFAULT_ACCOUNT,
        );

        spread = customSpread || new BigNumber(10);

        const senderAddress = NULL_ADDRESS;
        const makerAddress = zeroExOrderMakerAccount;
        const takerAddress = NULL_ADDRESS;
        const makerFee = ZERO;
        const takerFee = ZERO;
        const takerAssetAmount = isInflow ? nonBenchMarkTokenQuantity : benchMarkTokenQuantity.sub(spread);
        const makerAssetAmount = isInflow ? benchMarkTokenQuantity.add(spread) : nonBenchMarkTokenQuantity;
        const salt = SetUtils.generateSalt();
        const feeRecipientAddress = NULL_ADDRESS;
        const expirationTimeSeconds = SetTestUtils.generateTimestamp(100000000000000); // Set high expiry time

        const zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
          senderAddress,                             // senderAddress
          makerAddress,                              // makerAddress
          takerAddress,                              // takerAddress
          makerFee,                                  // makerFee
          takerFee,                                  // takerFee
          makerAssetAmount,                          // makerAssetAmount
          takerAssetAmount,                          // takerAssetAmount
          zeroExOrderMakerToken.address,             // makerAssetAddress
          zeroExOrderTakerToken.address,             // takerAssetAddress
          salt,                                      // salt
          SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,     // exchangeAddress
          feeRecipientAddress,                       // feeRecipientAddress
          expirationTimeSeconds,                     // expirationTimeSeconds
          takerAssetAmount,                          // amount of zeroExOrder to fill
        );

        subjectBenchmarkToken = benchMarkToken.address;
        subjectExchangeWrapperAddress = zeroExBidExchangeWrapper.address;
        subjectOrder = zeroExOrder;
      });

      it('should return the correct tokens from the arb', async () => {
        const previousBenchmarkBalance = await benchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
        const previousNonBenchmarkBalance = await nonBenchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

        await subject();

        const currentBenchmarkBalance = await benchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
        const currentNonBenchmarkBalance = await nonBenchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
        const expectedBenchmarkBalance = previousBenchmarkBalance.add(spread);
        expect(currentBenchmarkBalance).to.bignumber.equal(expectedBenchmarkBalance);
        expect(currentNonBenchmarkBalance).to.bignumber.equal(previousNonBenchmarkBalance);
      });

      describe('when benchMarkToken is an outflow', async () => {
        beforeAll(async () => {
          isInflow = false;
          customBenchmarkToken = wethInstance;
          customNonBenchmarkToken = daiInstance;
        });

        afterAll(async () => {
          isInflow = true;
          customBenchmarkToken = undefined;
          customNonBenchmarkToken = undefined;
        });

        it('should return the correct tokens from the arb', async () => {
          const previousBenchmarkBalance = await benchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
          const previousNonBenchmarkBalance = await nonBenchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

          await subject();

          const currentBenchmarkBalance = await benchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);
          const currentNonBenchmarkBalance = await nonBenchMarkToken.balanceOf.callAsync(DEFAULT_ACCOUNT);

          const expectedBenchmarkBalance =
            previousBenchmarkBalance.add(spread);
          expect(currentBenchmarkBalance).to.bignumber.equal(expectedBenchmarkBalance);
          expect(currentNonBenchmarkBalance).to.bignumber.equal(previousNonBenchmarkBalance);
        });
      });

      describe('and the arb is not profitable', async () => {
        beforeAll(async () => {
          isInflow = false;
          customSpread = ZERO;
        });

        afterAll(async () => {
          isInflow = true;
          customSpread =  ZERO;
        });

        test('throws', async () => {
          return expect(subject()).to.be.rejectedWith(
            `The quantity 0 inputted needs to be greater than zero.`
          );
        });
      });
    });
  });
});
