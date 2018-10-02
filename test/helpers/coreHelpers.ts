import * as Web3 from 'web3';
import * as _ from 'lodash';
import { Provider } from 'ethereum-types';
import { Address, SetProtocolUtils, SetProtocolTestUtils } from 'set-protocol-utils';
import {
  Core,
  ERC20Wrapper,
  NoDecimalTokenMock,
  OrderLibrary,
  SetTokenFactory,
  SetToken,
  StandardTokenMock,
  TransferProxy,
  Vault,
} from 'set-protocol-contracts';
import {
  AuthorizableContract,
  BaseContract,
  CoreContract,
  NoDecimalTokenMockContract,
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
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS
} from '@src/constants';
import { BigNumber, getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '@src/util';
import { CoreWrapper } from '@src/wrappers';

const contract = require('truffle-contract');

export const deployTransferProxyContract = async (
  provider: Provider
): Promise<TransferProxyContract> => {
  const web3 = new Web3(provider);

  const truffleTransferProxyContract = contract(TransferProxy);
  truffleTransferProxyContract.setProvider(provider);
  truffleTransferProxyContract.setNetwork(50);
  truffleTransferProxyContract.defaults(TX_DEFAULTS);

  // Deploy ERC20Wrapper dependency
  const truffleERC20WrapperContract = contract(ERC20Wrapper);
  truffleERC20WrapperContract.setProvider(provider);
  truffleERC20WrapperContract.setNetwork(50);
  truffleERC20WrapperContract.defaults(TX_DEFAULTS);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleTransferProxyContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  // Deploy TransferProxy
  const deployedTransferProxyInstance = await truffleTransferProxyContract.new();
  return await TransferProxyContract.at(
    deployedTransferProxyInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deployVaultContract = async (
  provider: Provider,
): Promise<VaultContract> => {
  const web3 = new Web3(provider);

  const truffleVaultContract = contract(Vault);
  truffleVaultContract.setProvider(provider);
  truffleVaultContract.setNetwork(50);
  truffleVaultContract.defaults(TX_DEFAULTS);

  // Deploy ERC20Wrapper dependency
  const truffleErc20WrapperContract = contract(ERC20Wrapper);
  truffleErc20WrapperContract.setProvider(provider);
  truffleErc20WrapperContract.setNetwork(50);
  truffleErc20WrapperContract.defaults(TX_DEFAULTS);

  const deployedERC20Wrapper = await truffleErc20WrapperContract.new();
  await truffleVaultContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  // Deploy Vault
  const deployedVaultInstance = await truffleVaultContract.new();
  return await VaultContract.at(
    deployedVaultInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deployCoreContract = async (
  provider: Provider,
  transferProxyAddress: Address,
  vaultAddress: Address,
): Promise<CoreContract> => {
  const web3 = new Web3(provider);

  const truffleCoreContract = contract(Core);
  truffleCoreContract.setProvider(provider);
  truffleCoreContract.setNetwork(50);
  truffleCoreContract.defaults(TX_DEFAULTS);

  const truffleOrderLibraryContract = contract(OrderLibrary);
  truffleOrderLibraryContract.setProvider(provider);
  truffleOrderLibraryContract.setNetwork(50);
  truffleOrderLibraryContract.defaults(TX_DEFAULTS);

  const orderLibrary = await truffleOrderLibraryContract.new(transferProxyAddress, vaultAddress);
  await truffleCoreContract.link('OrderLibrary', orderLibrary.address);

  // Deploy Core
  const deployedCoreInstance = await truffleCoreContract.new(transferProxyAddress, vaultAddress);

  // Initialize typed contract class
  return await CoreContract.at(
    deployedCoreInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deploySetTokenFactoryContract = async (
  provider: Provider,
  core: CoreContract
): Promise<SetTokenFactoryContract> => {
  const web3 = new Web3(provider);

  // Deploy SetTokenFactory contract
  const truffleSetTokenFactoryContract = contract(SetTokenFactory);
  truffleSetTokenFactoryContract.setProvider(provider);
  truffleSetTokenFactoryContract.defaults(TX_DEFAULTS);
  const deployedSetTokenFactory = await truffleSetTokenFactoryContract.new(core.address);

  // Initialize typed contract class
  const setTokenFactoryContract = await SetTokenFactoryContract.at(
    deployedSetTokenFactory.address,
    web3,
    TX_DEFAULTS,
  );

  // Enable factory for provided core
  await core.enableFactory.sendTransactionAsync(
    setTokenFactoryContract.address,
    TX_DEFAULTS
  );

  return setTokenFactoryContract;
};

export const deployTokenAsync = async (
  provider: Provider,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<StandardTokenMockContract> => {
  const tokens = await deployTokensAsync(1, provider, owner);

  return tokens[0];
};

export const deployTokensAsync = async (
  tokenCount: number,
  provider: Provider,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<StandardTokenMockContract[]> => {
  const decimals: number[] = [];
  _.times(tokenCount, () => decimals.push(_.random(4, 18)));

  return deployTokensSpecifyingDecimals(tokenCount, decimals, provider, owner);
};

export const deployTokensSpecifyingDecimals = async (
  tokenCount: number,
  decimalsList: number[],
  provider: Provider,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<StandardTokenMockContract[]> => {
  const web3 = new Web3(provider);

  const standardTokenMockContract = contract(StandardTokenMock);
  standardTokenMockContract.setProvider(provider);
  standardTokenMockContract.defaults(TX_DEFAULTS);
  const mockTokens: StandardTokenMockContract[] = [];

  const mockTokenPromises = _.times(tokenCount, async index => (
    await standardTokenMockContract.new(
      owner,
      DEPLOYED_TOKEN_QUANTITY,
      `Component ${index}`,
      index,
      decimalsList[index],
      TX_DEFAULTS,
    )
  ));

  await Promise.all(mockTokenPromises).then(tokenMock => {
    _.each(tokenMock, standardToken => {
      mockTokens.push(new StandardTokenMockContract(
        web3.eth.contract(standardToken.abi).at(standardToken.address),
        TX_DEFAULTS,
      ));
    });
  });

  return mockTokens;
};

export const deployNoDecimalTokenAsync = async (
  provider: Provider,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<NoDecimalTokenMockContract> => {
  const noDecimalTokenMockContract = contract(NoDecimalTokenMock);
  noDecimalTokenMockContract.setProvider(provider);
  noDecimalTokenMockContract.defaults(TX_DEFAULTS);

  const mockToken = await noDecimalTokenMockContract.new(
    owner,
    DEPLOYED_TOKEN_QUANTITY,
    'Test',
    'TST',
  );

  return mockToken;
};

export const deploySetTokenAsync = async(
  web3: Web3,
  core: CoreContract,
  setTokenFactoryAddress: Address,
  componentAddresses: Address[],
  componentUnits: BigNumber[],
  naturalUnit: BigNumber,
  name: string = 'Default Set',
  symbol: string = 'SET',
): Promise<SetTokenContract> => {
  const createSetTokenTransactionHash = await core.create.sendTransactionAsync(
    setTokenFactoryAddress,
    componentAddresses,
    componentUnits,
    naturalUnit,
    name,
    symbol,
    '',
    TX_DEFAULTS
  );

  const logs = await getFormattedLogsFromTxHash(web3, createSetTokenTransactionHash);
  const deployedSetTokenAddress = extractNewSetTokenAddressFromLogs(logs);

  return await SetTokenContract.at(
    deployedSetTokenAddress,
    web3,
    TX_DEFAULTS,
  );
};

export const tokenDeployedOnSnapshot = async (
  web3: Web3,
  tokenAddress: Address,
): Promise<StandardTokenMockContract> => {
  return await StandardTokenMockContract.at(
    tokenAddress,
    web3,
    TX_DEFAULTS,
  );
};

export const registerExchange = async (
  web3: Web3,
  coreAddress: Address,
  exchangeId: number,
  exchangeAddress: Address,
) => {
  const coreWrapper = await CoreContract.at(
    coreAddress,
    web3,
    TX_DEFAULTS,
  );

  await coreWrapper.registerExchange.sendTransactionAsync(
    exchangeId,
    exchangeAddress,
    TX_DEFAULTS,
  );
};

export const approveForTransferAsync = async (
  tokens: StandardTokenMockContract[],
  spender: Address,
  from: Address = DEFAULT_ACCOUNT,
) => {
  const approvePromises = _.map(tokens, token =>
    token.approve.sendTransactionAsync(
      spender,
      UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
      { from },
    ),
  );

  await Promise.all(approvePromises);
};

export const addAuthorizationAsync = async (
  contract: AuthorizableContract,
  toAuthorize: Address
) => {
  await contract.addAuthorizedAddress.sendTransactionAsync(
    toAuthorize,
    TX_DEFAULTS,
  );
};

export const getTokenBalances = async (
  tokens: StandardTokenMockContract[],
  owner: Address
): Promise<BigNumber[]> => {
  const balancePromises = _.map(tokens, token => {
    return token.balanceOf.callAsync(owner);
  });

  let ownerBalances: BigNumber[] = new Array(tokens.length).fill(SetProtocolUtils.CONSTANTS.ZERO);
  await Promise.all(balancePromises).then(fetchedTokenBalances => {
    ownerBalances = fetchedTokenBalances;
  });

  return ownerBalances;
};
