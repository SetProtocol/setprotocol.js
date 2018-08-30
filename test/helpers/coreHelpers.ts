import * as Web3 from 'web3';
import * as _ from 'lodash';
import { Provider } from 'ethereum-types';
import { Address, SetProtocolTestUtils } from 'set-protocol-utils';
import {
  Core,
  ERC20Wrapper,
  OrderLibrary,
  SetTokenFactory,
  StandardTokenMock,
  TransferProxy,
  Vault,
  CoreContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
} from 'set-protocol-contracts';
import {
  DEFAULT_GAS_PRICE,
  DEFAULT_GAS_LIMIT,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
} from '../../src/constants';
import { DEFAULT_ACCOUNT } from '../../src/constants/accounts';
import { TestSet } from '../testSets';
import { CoreWrapper } from '../../src/wrappers';
import { BigNumber } from '../../src/util';

const contract = require('truffle-contract');

const txDefaults = {
  from: DEFAULT_ACCOUNT,
  gasPrice: DEFAULT_GAS_PRICE,
  gas: DEFAULT_GAS_LIMIT,
};

export const deployCore = async (
  provider: Provider,
  transferProxyAddress: Address,
  vaultAddress: Address,
): Promise<Address> => {
  const coreContract = contract(Core);
  coreContract.setProvider(provider);
  coreContract.setNetwork(12345);
  coreContract.defaults(txDefaults);
  const orderLibraryContract = contract(OrderLibrary);
  orderLibraryContract.setProvider(provider);
  orderLibraryContract.defaults(txDefaults);

  const orderLibrary = await orderLibraryContract.new(transferProxyAddress, vaultAddress);
  await coreContract.link('OrderLibrary', orderLibrary.address);

  // Deploy Core
  const coreInstance = await coreContract.new(transferProxyAddress, vaultAddress);

  return coreInstance.address;
};

export const deploySetTokenFactory = async (
  coreAddress: Address,
  provider: Provider
): Promise<Address> => {
  const web3 = new Web3(provider);

  const setTokenFactoryContract = contract(SetTokenFactory);
  setTokenFactoryContract.setProvider(provider);
  setTokenFactoryContract.defaults(txDefaults);

  // Deploy SetTokenFactory
  const setTokenFactoryInstance = await setTokenFactoryContract.new(coreAddress);
  const setTokenFactoryWrapper = await SetTokenFactoryContract.at(
    setTokenFactoryInstance.address,
    web3,
    txDefaults,
  );

  // Enable Factory
  const coreWrapper = await CoreContract.at(coreAddress, web3, txDefaults);
  await coreWrapper.enableFactory.sendTransactionAsync(setTokenFactoryInstance.address, txDefaults);

  return setTokenFactoryInstance.address;
};

export const deployTokensForSetWithApproval = async (
  setToDeploy: TestSet,
  transferProxyAddress: Address,
  provider: Provider,
): Promise<Address[]> => {
  const web3 = new Web3(provider);

  const standardTokenMockContract = contract(StandardTokenMock);
  standardTokenMockContract.setProvider(provider);
  standardTokenMockContract.defaults(txDefaults);

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
        txDefaults,
      );
      await tokenWrapper.approve.sendTransactionAsync(
        transferProxyAddress,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        txDefaults,
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
  standardTokenMockContract.defaults(txDefaults);
  const mockTokens: StandardTokenMockContract[] = [];

  const mockTokenPromises = _.times(tokenCount, async index => (
    await standardTokenMockContract.new(
      DEFAULT_ACCOUNT,
      100000000,
      `Component ${index}`,
      index,
      _.random(4, 18),
      txDefaults,
    )
  ));

  await Promise.all(mockTokenPromises).then(tokenMock => {
    _.each(tokenMock, standardToken => {
      mockTokens.push(new StandardTokenMockContract(
        web3.eth.contract(standardToken.abi).at(standardToken.address),
        txDefaults,
      ));
    });
  });

  return mockTokens;
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
    txDefaults,
  );

  await coreWrapper.registerExchange.sendTransactionAsync(
    exchangeId,
    exchangeAddress,
    txDefaults,
  );
};

export const approveForZeroEx = async (
  web3: Web3,
  componentTokens: Address[],
  zeroExMakerAddress: Address,
  takerAddress: Address,
) => {
  const txOpts = {
    from: DEFAULT_ACCOUNT,
    gasPrice: DEFAULT_GAS_PRICE,
    gas: DEFAULT_GAS_LIMIT,
  };

  const tokenWrapperPromises = _.map(componentTokens, async token =>
    await StandardTokenMockContract.at(
      token,
      web3,
      txOpts,
    )
  );
  const tokenWrappers = await Promise.all(tokenWrapperPromises);

  // Give some tokens to zeroExMakerAddress
  const zeroExMakerTransferPromises = _.map(tokenWrappers, async token =>
    await token.transfer.sendTransactionAsync(
      zeroExMakerAddress,
      new BigNumber(1000),
      txOpts,
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
      txOpts,
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
  const txOpts = {
    from: DEFAULT_ACCOUNT,
    gasPrice: DEFAULT_GAS_PRICE,
    gas: DEFAULT_GAS_LIMIT,
  };

  const tokenWrapperPromises = _.map(componentTokens, async token =>
    await StandardTokenMockContract.at(
      token,
      web3,
      txOpts,
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
      txOpts,
    ),
  );
  await Promise.all(takerTransferPromises);

  // Give some tokens to makerAddress
  const makerTransferPromises = _.map(tokenWrappers, async token =>
    await token.transfer.sendTransactionAsync(
      makerAddress,
      new BigNumber(1000),
      txOpts,
    ),
  );
  await Promise.all(makerTransferPromises);

  // Give some tokens to relayerAddress
  const relayerTransferPromises = _.map(tokenWrappers, async token =>
    await token.transfer.sendTransactionAsync(
      relayerAddress,
      new BigNumber(1000),
      txOpts,
    ),
  );
  await Promise.all(relayerTransferPromises);
};

export const deployTransferProxy = async (
  erc20WrapperAddress: Address,
  provider: Provider,
): Promise<Address> => {
  const web3 = new Web3(provider);

  const transferProxyContract = contract(TransferProxy);
  transferProxyContract.setProvider(provider);
  transferProxyContract.setNetwork(12345);
  transferProxyContract.defaults(txDefaults);

  await transferProxyContract.link('ERC20Wrapper', erc20WrapperAddress);

  // Deploy TransferProxy
  const transferProxyInstance = await transferProxyContract.new();
  return transferProxyInstance.address;
};

export const deployVault = async (
  erc20WrapperAddress: Address,
  provider: Provider,
): Promise<Address> => {
  const web3 = new Web3(provider);

  const vaultContract = contract(Vault);
  vaultContract.setProvider(provider);
  vaultContract.setNetwork(12345);
  vaultContract.defaults(txDefaults);

  await vaultContract.link('ERC20Wrapper', erc20WrapperAddress);

  // Deploy Vault
  const vaultInstance = await vaultContract.new();
  return vaultInstance.address;
};

export const initializeCoreWrapper = async (provider: Provider): Promise<CoreWrapper> => {
  const web3 = new Web3(provider);

  const erc20WrapperContract = contract(ERC20Wrapper);
  erc20WrapperContract.setProvider(provider);
  erc20WrapperContract.defaults(txDefaults);

  const erc20Wrapper = await erc20WrapperContract.new();

  const transferProxyAddress = await deployTransferProxy(erc20Wrapper.address, provider);
  const vaultAddress = await deployVault(erc20Wrapper.address, provider);

  const coreAddress = await deployCore(provider, transferProxyAddress, vaultAddress);

  const transferProxyWrapper = await TransferProxyContract.at(
    transferProxyAddress,
    web3,
    txDefaults,
  );
  await transferProxyWrapper.addAuthorizedAddress.sendTransactionAsync(coreAddress, txDefaults);

  const vaultWrapper = await VaultContract.at(vaultAddress, web3, txDefaults);
  await vaultWrapper.addAuthorizedAddress.sendTransactionAsync(coreAddress, txDefaults);

  return new CoreWrapper(web3, coreAddress, transferProxyAddress, vaultAddress);
};
