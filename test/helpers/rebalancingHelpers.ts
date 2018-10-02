import * as Web3 from 'web3';
import * as promisify from 'tiny-promisify';
import * as _ from 'lodash';
import { Provider } from 'ethereum-types';
import { Address, SetProtocolUtils, SetProtocolTestUtils } from 'set-protocol-utils';
import {
  RebalancingSetToken
} from 'set-protocol-contracts';
import {
  AuthorizableContract,
  BaseContract,
  CoreContract,
  NoDecimalTokenMockContract,
  RebalancingSetTokenContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
} from 'set-protocol-contracts';

import {
  DEFAULT_ACCOUNT,
  DEPLOYED_TOKEN_QUANTITY,
  TX_DEFAULTS,
  DEFAULT_GAS_LIMIT,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  ONE_DAY_IN_SECONDS,
  DEFAULT_UNIT_SHARES,
  DEFAULT_REBALANCING_NATURAL_UNIT
} from '@src/constants';

import {
  deployTokensAsync,
  deploySetTokenAsync,
  approveForTransferAsync
} from './coreHelpers';
import { BigNumber, getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '@src/util';
import { CoreWrapper } from '@src/wrappers';

const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const setTestUtils = new SetProtocolTestUtils(web3);

const contract = require('truffle-contract');

export const deploySetTokensAsync = async(
  core: CoreContract,
  factory: Address,
  transferProxy: Address,
  tokenCount: number,
  naturalUnits: BigNumber[] = [],
): Promise<SetTokenContract[]> => {
  let naturalUnit: BigNumber;
  const setTokenArray: SetTokenContract[] = [];

  const components = await deployTokensAsync(tokenCount + 1, provider);
  await approveForTransferAsync(components, transferProxy);

  const indexArray = _.times(tokenCount, Number);
  for (const index in indexArray) {
    let minimumDecimal: number;
    const idx = Number(index);
    const componentOneDecimal = await components[idx].decimals.callAsync();
    const componentTwoDecimal = await components[idx + 1].decimals.callAsync();

    // Determine minimum natural unit if not passed in
    if (naturalUnits.length > 0) {
      naturalUnit = naturalUnits[idx];
      minimumDecimal = 18 - naturalUnit.e;
    } else {
      minimumDecimal = Math.min(componentOneDecimal.toNumber(), componentTwoDecimal.toNumber());
      naturalUnit = new BigNumber(10 ** (18 - minimumDecimal));
    }

    // Get Set component and component units
    const setComponents = components.slice(idx, idx + 2);
    const setComponentAddresses = _.map(setComponents, token => token.address);
    const setComponentUnits: BigNumber[] = [
      new BigNumber(10 ** (componentOneDecimal.toNumber() - minimumDecimal)).mul(new BigNumber(idx + 1)),
      new BigNumber(10 ** (componentTwoDecimal.toNumber() - minimumDecimal)).mul(new BigNumber(idx + 1)),
    ];

    // Create Set token
    const setToken = await deploySetTokenAsync(
      web3,
      core,
      factory,
      setComponentAddresses,
      setComponentUnits,
      naturalUnit,
    );

    setTokenArray.push(setToken);
  }

  return setTokenArray;
};

export const createRebalancingSetTokenAsync = async(
  core: CoreContract,
  factory: Address,
  componentAddresses: Address[],
  units: BigNumber[],
  naturalUnit: BigNumber,
  callData: string = '',
  name: string = 'Rebalancing Set Token',
  symbol: string = 'RBSET',
): Promise<RebalancingSetTokenContract> => {
  const encodedName = SetProtocolUtils.stringToBytes(name);
  const encodedSymbol = SetProtocolUtils.stringToBytes(symbol);

  const txHash = await core.create.sendTransactionAsync(
    factory,
    componentAddresses,
    units,
    naturalUnit,
    encodedName,
    encodedSymbol,
    callData,
    TX_DEFAULTS,
  );

  const logs = await setTestUtils.getLogsFromTxHash(txHash);
  const setAddress = extractNewSetTokenAddressFromLogs(logs);

  return await RebalancingSetTokenContract.at(
    setAddress,
    web3,
    TX_DEFAULTS
  );
};

export const createDefaultRebalancingSetTokenAsync = async(
  core: CoreContract,
  factory: Address,
  manager: Address,
  initialSet: Address,
  proposalPeriod: BigNumber,
): Promise<RebalancingSetTokenContract> => {
  // Generate defualt rebalancingSetToken params
  const initialUnitShares = DEFAULT_UNIT_SHARES;
  const rebalanceInterval = ONE_DAY_IN_SECONDS;
  const callData = SetProtocolTestUtils.bufferArrayToHex([
    SetProtocolUtils.paddedBufferForPrimitive(manager),
    SetProtocolUtils.paddedBufferForBigNumber(proposalPeriod),
    SetProtocolUtils.paddedBufferForBigNumber(rebalanceInterval),
  ]);

  // Create rebalancingSetToken
  return await createRebalancingSetTokenAsync(
    core,
    factory,
    [initialSet],
    [initialUnitShares],
    DEFAULT_REBALANCING_NATURAL_UNIT,
    callData,
  );
};

export const transitionToProposeAsync = async(
  rebalancingSetToken: RebalancingSetTokenContract,
  manager: Address,
  nextSetToken: Address,
  auctionPriceCurve: Address,
  curveCoefficient: BigNumber,
  auctionStartPrice: BigNumber,
  auctionPriceDivisor: BigNumber,
): Promise<void> => {
  // Transition to propose
  await increaseChainTimeAsync(ONE_DAY_IN_SECONDS.add(1));
  await rebalancingSetToken.propose.sendTransactionAsync(
    nextSetToken,
    auctionPriceCurve,
    curveCoefficient,
    auctionStartPrice,
    auctionPriceDivisor,
    { from: manager, gas: DEFAULT_GAS_LIMIT}
  );
};

export const transitionToRebalanceAsync = async(
  rebalancingSetToken: RebalancingSetTokenContract,
  manager: Address,
  nextSetToken: Address,
  auctionPriceCurve: Address,
  curveCoefficient: BigNumber,
  auctionStartPrice: BigNumber,
  auctionPriceDivisor: BigNumber,
): Promise<void> => {
  // Transition to propose
  await transitionToProposeAsync(
    rebalancingSetToken,
    manager,
    nextSetToken,
    auctionPriceCurve,
    curveCoefficient,
    auctionStartPrice,
    auctionPriceDivisor
  );

  // Transition to rebalance
  await increaseChainTimeAsync(ONE_DAY_IN_SECONDS.add(1));
  await rebalancingSetToken.rebalance.sendTransactionAsync(
    TX_DEFAULTS
  );
};

const increaseChainTimeAsync = async(
  duration: BigNumber
): Promise<void> => {
  await sendJSONRpcRequestAsync('evm_increaseTime', [duration.toNumber()]);
};

const sendJSONRpcRequestAsync = async(
  method: string,
  params: any[],
): Promise<any> => {
  return promisify(web3.currentProvider.sendAsync, {
    context: web3.currentProvider,
  })({
    jsonrpc: '2.0',
    method,
    params,
    id: new Date().getTime(),
  });
};

export const constructCombinedUnitArrayAsync = async(
  rebalancingSetToken: RebalancingSetTokenContract,
  targetSetToken: SetTokenContract,
  otherSetToken: SetTokenContract,
  combinedTokenArray: Address[],
): Promise<BigNumber[]> => {
  // Get target set tokens units and natural units of both set tokens
  const setTokenComponents = await targetSetToken.getComponents.callAsync();
  const setTokenUnits = await targetSetToken.getUnits.callAsync();
  const targetSetNaturalUnit = await targetSetToken.naturalUnit.callAsync();
  const otherSetNaturalUnit = await otherSetToken.naturalUnit.callAsync();

  // Calculate minimumBidAmount
  const maxNaturalUnit = Math.max(targetSetNaturalUnit.toNumber(), otherSetNaturalUnit.toNumber());

  // Create combined unit array for target Set
  const combinedSetTokenUnits: BigNumber[] = [];
  combinedTokenArray.forEach(address => {
    const index = setTokenComponents.indexOf(address);
    if (index != -1) {
      const totalTokenAmount = setTokenUnits[index].mul(maxNaturalUnit).div(targetSetNaturalUnit);
      combinedSetTokenUnits.push(totalTokenAmount);
    } else {
      combinedSetTokenUnits.push(new BigNumber(0));
    }
  });
  return combinedSetTokenUnits;
};

export const getAuctionSetUpOutputs = async(
  rebalancingSetToken: RebalancingSetTokenContract,
  currentSetToken: SetTokenContract,
  nextSetToken: SetTokenContract,
  auctionPriceDivisor: BigNumber,
): Promise<any> => {
  const currentSetTokenComponents = await currentSetToken.getComponents.callAsync();
  const nextSetTokenComponents = await nextSetToken.getComponents.callAsync();

  const currentSetTokenNaturalUnit = await currentSetToken.naturalUnit.callAsync();
  const nextSetTokenNaturalUnit = await nextSetToken.naturalUnit.callAsync();

  // Create combinedTokenArray
  const expectedCombinedTokenArray = _.union(currentSetTokenComponents, nextSetTokenComponents);

  // Create combinedUnitArrays
  const expectedCombinedCurrentUnits = await constructCombinedUnitArrayAsync(
    rebalancingSetToken,
    currentSetToken,
    nextSetToken,
    expectedCombinedTokenArray
  );
  const expectedCombinedNextUnits = await constructCombinedUnitArrayAsync(
    rebalancingSetToken,
    nextSetToken,
    currentSetToken,
    expectedCombinedTokenArray
  );

  const maxNaturalUnit = Math.max(currentSetTokenNaturalUnit.toNumber(), nextSetTokenNaturalUnit.toNumber());
  const expectedMinimumBid = new BigNumber(maxNaturalUnit).mul(auctionPriceDivisor);
  return { expectedCombinedTokenArray, expectedCombinedCurrentUnits, expectedCombinedNextUnits, expectedMinimumBid };
};
