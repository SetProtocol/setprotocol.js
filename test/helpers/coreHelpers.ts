import * as Web3 from 'web3';
import * as _ from 'lodash';
import { Provider } from 'ethereum-types';
import { Address, SetProtocolTestUtils } from 'set-protocol-utils';
import {
  Core,
  ERC20Wrapper,
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
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
} from 'set-protocol-contracts';

import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  DEPLOYED_TOKEN_QUANTITY,
  TX_DEFAULTS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS
} from '../../src/constants';
import { DEFAULT_ACCOUNT } from '../../src/constants/accounts';
import { getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '../../src/util/logs';
import { TestSet } from '../testSets';
import { CoreWrapper } from '../../src/wrappers';
import { BigNumber } from '../../src/util';

const contract = require('truffle-contract');

/* ============ Transfer Proxy ============ */

export const deployTransferProxy = async (
  erc20WrapperAddress: Address,
  provider: Provider,
): Promise<Address> => {
  const web3 = new Web3(provider);

  const truffleTransferProxyContract = contract(TransferProxy);
  truffleTransferProxyContract.setProvider(provider);
  truffleTransferProxyContract.setNetwork(50);
  truffleTransferProxyContract.defaults(TX_DEFAULTS);

  await truffleTransferProxyContract.link('ERC20Wrapper', erc20WrapperAddress);

  // Deploy TransferProxy
  const transferProxyInstance = await truffleTransferProxyContract.new();
  return transferProxyInstance.address;
};

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

/* ============ Vault ============ */

export const deployVault = async (
  erc20WrapperAddress: Address,
  provider: Provider,
): Promise<Address> => {
  const web3 = new Web3(provider);

  const truffleVaultContract = contract(Vault);
  truffleVaultContract.setProvider(provider);
  truffleVaultContract.setNetwork(50);
  truffleVaultContract.defaults(TX_DEFAULTS);

  await truffleVaultContract.link('ERC20Wrapper', erc20WrapperAddress);

  // Deploy Vault
  const vaultInstance = await truffleVaultContract.new();
  return vaultInstance.address;
};

// TODO: COMBINE WITH THE ABOVE METHOD
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

/* ============ Core ============ */

export const deployCore = async (
  provider: Provider,
  transferProxyAddress: Address,
  vaultAddress: Address,
): Promise<Address> => {
  const truffleCoreContract = contract(Core);
  truffleCoreContract.setProvider(provider);
  truffleCoreContract.setNetwork(50);
  truffleCoreContract.defaults(TX_DEFAULTS);

  const orderLibraryContract = contract(OrderLibrary);
  orderLibraryContract.setProvider(provider);
  orderLibraryContract.setNetwork(50);
  orderLibraryContract.defaults(TX_DEFAULTS);

  const orderLibrary = await orderLibraryContract.new(transferProxyAddress, vaultAddress);
  await truffleCoreContract.link('OrderLibrary', orderLibrary.address);

  // Deploy Core
  const coreInstance = await truffleCoreContract.new(transferProxyAddress, vaultAddress);

  return coreInstance.address;
};

// TODO: COMBINE WITH THE ABOVE METHOD
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

/* ============ Set Token Factory ============ */

export const deploySetTokenFactory = async (
  coreAddress: Address,
  provider: Provider
): Promise<Address> => {
  const web3 = new Web3(provider);

  const setTokenFactoryContract = contract(SetTokenFactory);
  setTokenFactoryContract.setProvider(provider);
  setTokenFactoryContract.defaults(TX_DEFAULTS);

  // Deploy SetTokenFactory
  const setTokenFactoryInstance = await setTokenFactoryContract.new(coreAddress);
  const setTokenFactoryWrapper = await SetTokenFactoryContract.at(
    setTokenFactoryInstance.address,
    web3,
    TX_DEFAULTS,
  );

  // Enable Factory
  const coreWrapper = await CoreContract.at(coreAddress, web3, TX_DEFAULTS);
  await coreWrapper.enableFactory.sendTransactionAsync(setTokenFactoryInstance.address, TX_DEFAULTS);

  return setTokenFactoryInstance.address;
};

// TODO: COMBINE WITH THE ABOVE METHOD
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

/* ============ StandardTokenMock ============ */

export const deployTokensForSetWithApproval = async (
  setToDeploy: TestSet,
  transferProxyAddress: Address,
  provider: Provider,
): Promise<Address[]> => {
  const web3 = new Web3(provider);

  const standardTokenMockContract = contract(StandardTokenMock);
  standardTokenMockContract.setProvider(provider);
  standardTokenMockContract.defaults(TX_DEFAULTS);

  // Deploy StandardTokenMocks to add to Set
  const componentAddresses: Address[] = [];
  await Promise.all(
    setToDeploy.components.map(async component => {
      const standardTokenMockInstance = await standardTokenMockContract.new(
        DEFAULT_ACCOUNT,
        component.supply,
        component.name,
        component.symbol,
        component.decimals,
      );
      componentAddresses.push(standardTokenMockInstance.address);

      const tokenWrapper = await StandardTokenMockContract.at(
        standardTokenMockInstance.address,
        web3,
        TX_DEFAULTS,
      );
      await tokenWrapper.approve.sendTransactionAsync(
        transferProxyAddress,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        TX_DEFAULTS,
      );
    }),
  );
  return componentAddresses;
};

export const deployTokensAsync = async (
  tokenCount: number,
  provider: Provider,
): Promise<StandardTokenMockContract[]> => {
  const web3 = new Web3(provider);

  const standardTokenMockContract = contract(StandardTokenMock);
  standardTokenMockContract.setProvider(provider);
  standardTokenMockContract.defaults(TX_DEFAULTS);
  const mockTokens: StandardTokenMockContract[] = [];

  const mockTokenPromises = _.times(tokenCount, async index => (
    await standardTokenMockContract.new(
      DEFAULT_ACCOUNT,
      DEPLOYED_TOKEN_QUANTITY,
      `Component ${index}`,
      index,
      _.random(4, 18),
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
) => {
  const approvePromises = _.map(tokens, token =>
    token.approve.sendTransactionAsync(
      spender,
      UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
      TX_DEFAULTS,
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

export const approveForZeroEx = async (
  web3: Web3,
  componentTokens: Address[],
  zeroExMakerAddress: Address,
  takerAddress: Address,
) => {
  const tokenWrapperPromises = _.map(componentTokens, async token =>
    await StandardTokenMockContract.at(
      token,
      web3,
      TX_DEFAULTS,
    )
  );
  const tokenWrappers = await Promise.all(tokenWrapperPromises);

  // Give some tokens to zeroExMakerAddress
  const zeroExMakerTransferPromises = _.map(tokenWrappers, async token =>
    await token.transfer.sendTransactionAsync(
      zeroExMakerAddress,
      new BigNumber(1000),
      TX_DEFAULTS,
    ),
  );
  await Promise.all(zeroExMakerTransferPromises);

  const zeroExMakerApprovePromises = _.map(tokenWrappers, async tokenWrapper =>
    await tokenWrapper.approve.sendTransactionAsync(
      SetProtocolTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
      UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
      { from: zeroExMakerAddress },
    ),
  );
  await Promise.all(zeroExMakerApprovePromises);

  // Give some tokens to takerAddress
  const takerTransferPromises = _.map(tokenWrappers, async token =>
    await token.transfer.sendTransactionAsync(
      zeroExMakerAddress,
      new BigNumber(1000),
      TX_DEFAULTS,
    ),
  );
  await Promise.all(takerTransferPromises);

  const takerApprovePromises = _.map(tokenWrappers, async tokenWrapper =>
    await tokenWrapper.approve.sendTransactionAsync(
      SetProtocolTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
      UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
      { from: takerAddress },
    ),
  );
  await Promise.all(takerApprovePromises);
};

export const approveForFill = async (
  web3: Web3,
  componentTokens: Address[],
  makerAddress: Address,
  relayerAddress: Address,
  takerAddress: Address,
  transferProxyAddress: Address,
) => {
  const tokenWrapperPromises = _.map(componentTokens, async token =>
    await StandardTokenMockContract.at(
      token,
      web3,
      TX_DEFAULTS,
    )
  );
  const tokenWrappers = await Promise.all(tokenWrapperPromises);

  // Approve all tokens for TransferProxy
  const makerApprovePromises = _.map(tokenWrappers, async tokenWrapper =>
    await tokenWrapper.approve.sendTransactionAsync(
      transferProxyAddress,
      UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
      { from: makerAddress },
    ),
  );
  await Promise.all(makerApprovePromises);

  const takerApprovePromises = _.map(tokenWrappers, async tokenWrapper =>
    await tokenWrapper.approve.sendTransactionAsync(
      transferProxyAddress,
      UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
      { from: takerAddress },
    ),
  );
  await Promise.all(takerApprovePromises);

  const relayerApprovePromises = _.map(tokenWrappers, async tokenWrapper =>
    await tokenWrapper.approve.sendTransactionAsync(
      transferProxyAddress,
      UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
      { from: relayerAddress },
    ),
  );
  await Promise.all(relayerApprovePromises);

  // Give some tokens to takerAddress
  const takerTransferPromises = _.map(tokenWrappers, async token =>
    await token.transfer.sendTransactionAsync(
      takerAddress,
      new BigNumber(1000),
      TX_DEFAULTS,
    ),
  );
  await Promise.all(takerTransferPromises);

  // Give some tokens to makerAddress
  const makerTransferPromises = _.map(tokenWrappers, async token =>
    await token.transfer.sendTransactionAsync(
      makerAddress,
      new BigNumber(1000),
      TX_DEFAULTS,
    ),
  );
  await Promise.all(makerTransferPromises);

  // Give some tokens to relayerAddress
  const relayerTransferPromises = _.map(tokenWrappers, async token =>
    await token.transfer.sendTransactionAsync(
      relayerAddress,
      new BigNumber(1000),
      TX_DEFAULTS,
    ),
  );
  await Promise.all(relayerTransferPromises);
};

export const getTokenBalances = async (
  tokens: StandardTokenMockContract[],
  owner: Address
): Promise<BigNumber[]> => {
  const balancePromises = _.map(tokens, token => {
    return token.balanceOf.callAsync(owner);
  });

  let ownerBalances: BigNumber[];
  await Promise.all(balancePromises).then(fetchedTokenBalances => {
    ownerBalances = fetchedTokenBalances;
  });

  return ownerBalances;
};

export const initializeCoreWrapper = async (provider: Provider): Promise<CoreWrapper> => {
  const web3 = new Web3(provider);

  const erc20WrapperContract = contract(ERC20Wrapper);
  erc20WrapperContract.setProvider(provider);
  erc20WrapperContract.defaults(TX_DEFAULTS);

  const erc20Wrapper = await erc20WrapperContract.new();

  const transferProxyAddress = await deployTransferProxy(erc20Wrapper.address, provider);
  const vaultAddress = await deployVault(erc20Wrapper.address, provider);

  const coreAddress = await deployCore(provider, transferProxyAddress, vaultAddress);

  const transferProxyWrapper = await TransferProxyContract.at(
    transferProxyAddress,
    web3,
    TX_DEFAULTS,
  );
  await transferProxyWrapper.addAuthorizedAddress.sendTransactionAsync(coreAddress, TX_DEFAULTS);

  const vaultWrapper = await VaultContract.at(vaultAddress, web3, TX_DEFAULTS);
  await vaultWrapper.addAuthorizedAddress.sendTransactionAsync(coreAddress, TX_DEFAULTS);

  return new CoreWrapper(web3, coreAddress, transferProxyAddress, vaultAddress);
};
