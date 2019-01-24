import * as _ from 'lodash';
import Web3 from 'web3';
import { Address, SetProtocolUtils, SetProtocolTestUtils } from 'set-protocol-utils';
import {
  Core,
  ERC20Wrapper,
  ExchangeIssueModule,
  NoDecimalTokenMock,
  OrderLibrary,
  PayableExchangeIssue,
  RebalanceAuctionModule,
  RebalancingSetTokenFactory,
  SetToken,
  SetTokenFactory,
  SignatureValidatorContract,
  StandardTokenMock,
  TransferProxy,
  Vault,
  WethMock,
  WhiteList,
} from 'set-protocol-contracts';
import {
  AuthorizableContract,
  BaseContract,
  CoreContract,
  ExchangeIssueModuleContract,
  IssuanceOrderModule,
  IssuanceOrderModuleContract,
  NoDecimalTokenMockContract,
  PayableExchangeIssueContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  SignatureValidator,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  DEFAULT_ACCOUNT,
  DEPLOYED_TOKEN_QUANTITY,
  TX_DEFAULTS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  ONE_DAY_IN_SECONDS,
  ONE_WEEK_IN_SECONDS,
} from '@src/constants';
import { BigNumber, getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '@src/util';
import { CoreWrapper } from '@src/wrappers';

const contract = require('truffle-contract');

export const deployTransferProxyContract = async (
web3: Web3,
): Promise<TransferProxyContract> => {
  const truffleTransferProxyContract = contract(TransferProxy);
  truffleTransferProxyContract.setProvider(web3.currentProvider);
  truffleTransferProxyContract.setNetwork(50);
  truffleTransferProxyContract.defaults(TX_DEFAULTS);

  // Deploy ERC20Wrapper dependency
  const truffleERC20WrapperContract = contract(ERC20Wrapper);
  truffleERC20WrapperContract.setProvider(web3.currentProvider);
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
  web3: Web3
): Promise<VaultContract> => {
  const truffleVaultContract = contract(Vault);
  truffleVaultContract.setProvider(web3.currentProvider);
  truffleVaultContract.setNetwork(50);
  truffleVaultContract.defaults(TX_DEFAULTS);

  // Deploy ERC20Wrapper dependency
  const truffleErc20WrapperContract = contract(ERC20Wrapper);
  truffleErc20WrapperContract.setProvider(web3.currentProvider);
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
  web3: Web3,
  transferProxyAddress: Address,
  vaultAddress: Address,
): Promise<CoreContract> => {
  const truffleCoreContract = contract(Core);
  truffleCoreContract.setProvider(web3.currentProvider);
  truffleCoreContract.setNetwork(50);
  truffleCoreContract.defaults(TX_DEFAULTS);

  // Deploy Core
  const deployedCoreInstance = await truffleCoreContract.new(
    transferProxyAddress,
    vaultAddress,
  );

  // Initialize typed contract class
  return await CoreContract.at(
    deployedCoreInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deploySetTokenFactoryContract = async (
  web3: Web3,
  core: CoreContract
): Promise<SetTokenFactoryContract> => {
  // Deploy SetTokenFactory contract
  const truffleSetTokenFactoryContract = contract(SetTokenFactory);
  truffleSetTokenFactoryContract.setProvider(web3.currentProvider);
  truffleSetTokenFactoryContract.defaults(TX_DEFAULTS);
  const deployedSetTokenFactory = await truffleSetTokenFactoryContract.new(core.address);

  // Initialize typed contract class
  const setTokenFactoryContract = await SetTokenFactoryContract.at(
    deployedSetTokenFactory.address,
    web3,
    TX_DEFAULTS,
  );

  // Enable factory for provided core
  await core.addFactory.sendTransactionAsync(
    setTokenFactoryContract.address,
    TX_DEFAULTS
  );

  return setTokenFactoryContract;
};

export const deployRebalancingSetTokenFactoryContract = async (
  web3: Web3,
  core: CoreContract,
  whitelist: WhiteListContract,
): Promise<RebalancingSetTokenFactoryContract> => {
  // Deploy SetTokenFactory contract
  const truffleRebalancingSetTokenFactoryContract = contract(RebalancingSetTokenFactory);
  truffleRebalancingSetTokenFactoryContract.setProvider(web3.currentProvider);
  truffleRebalancingSetTokenFactoryContract.defaults(TX_DEFAULTS);
  const deployedRebalancingSetTokenFactory = await truffleRebalancingSetTokenFactoryContract.new(
    core.address,
    whitelist.address,
    ONE_DAY_IN_SECONDS,
    ONE_DAY_IN_SECONDS,
  );

  // Initialize typed contract class
  const rebalancingSetTokenFactoryContract = await RebalancingSetTokenFactoryContract.at(
    deployedRebalancingSetTokenFactory.address,
    web3,
    TX_DEFAULTS,
  );

  // Enable factory for provided core
  await core.addFactory.sendTransactionAsync(
    rebalancingSetTokenFactoryContract.address,
    TX_DEFAULTS
  );

  return rebalancingSetTokenFactoryContract;
};

export const deployIssuanceOrderModuleContract = async (
  signatureValidator: SignatureValidatorContract,
  web3: Web3,
  core: CoreContract,
  transferProxy: TransferProxyContract,
  vault: VaultContract,
): Promise<IssuanceOrderModuleContract> => {
  const truffleIssuanceOrderModuleContract = contract(IssuanceOrderModule);
  truffleIssuanceOrderModuleContract.setProvider(web3.currentProvider);
  truffleIssuanceOrderModuleContract.setNetwork(50);
  truffleIssuanceOrderModuleContract.defaults(TX_DEFAULTS);

  const truffleOrderLibraryContract = contract(OrderLibrary);
  truffleOrderLibraryContract.setProvider(web3.currentProvider);
  truffleOrderLibraryContract.setNetwork(50);
  truffleOrderLibraryContract.defaults(TX_DEFAULTS);

  const orderLibrary = await truffleOrderLibraryContract.new(transferProxy.address, vault.address);
  await truffleIssuanceOrderModuleContract.link('OrderLibrary', orderLibrary.address);

  const deployedIssuanceOrderModule = await truffleIssuanceOrderModuleContract.new(
    core.address,
    transferProxy.address,
    vault.address,
    signatureValidator.address,
    TX_DEFAULTS
  );
  const issuanceOrderModuleContract = await IssuanceOrderModuleContract.at(
    deployedIssuanceOrderModule.address,
    web3,
    TX_DEFAULTS,
  );

  await core.addModule.sendTransactionAsync(deployedIssuanceOrderModule.address, TX_DEFAULTS);
  await transferProxy.addAuthorizedAddress.sendTransactionAsync(deployedIssuanceOrderModule.address, TX_DEFAULTS);
  await vault.addAuthorizedAddress.sendTransactionAsync(deployedIssuanceOrderModule.address, TX_DEFAULTS);

  return issuanceOrderModuleContract;
};

export const deployRebalanceAuctionModuleContract = async (
  web3: Web3,
  core: CoreContract,
  vault: VaultContract,
): Promise<RebalanceAuctionModuleContract> => {
  const truffleRebalanceAuctionModuleContract = contract(RebalanceAuctionModule);
  truffleRebalanceAuctionModuleContract.setProvider(web3.currentProvider);
  truffleRebalanceAuctionModuleContract.setNetwork(50);
  truffleRebalanceAuctionModuleContract.defaults(TX_DEFAULTS);

  const deployedRebalanceAuctionModule = await truffleRebalanceAuctionModuleContract.new(
    core.address,
    vault.address,
    TX_DEFAULTS
  );
  const rebalanceAuctionModuleContract = await RebalanceAuctionModuleContract.at(
    deployedRebalanceAuctionModule.address,
    web3,
    TX_DEFAULTS,
  );

  await core.addModule.sendTransactionAsync(deployedRebalanceAuctionModule.address, TX_DEFAULTS);
  await vault.addAuthorizedAddress.sendTransactionAsync(deployedRebalanceAuctionModule.address, TX_DEFAULTS);

  return rebalanceAuctionModuleContract;
};

export const deploySignatureValidatorContract = async (
  web3: Web3,
): Promise<SignatureValidatorContract> => {
  const truffleSignatureValidatorContract = contract(SignatureValidator);
  truffleSignatureValidatorContract.setProvider(web3.currentProvider);
  truffleSignatureValidatorContract.setNetwork(50);
  truffleSignatureValidatorContract.defaults(TX_DEFAULTS);

  const deployedSignatureValidator = await truffleSignatureValidatorContract.new(
    TX_DEFAULTS
  );
  const signatureValidatorContract = await SignatureValidatorContract.at(
    deployedSignatureValidator.address,
    web3,
    TX_DEFAULTS,
  );

  return signatureValidatorContract;
};

export const deployBaseContracts = async (
  web3: Web3
): Promise<[
  CoreContract,
  TransferProxyContract,
  VaultContract,
  SetTokenFactoryContract,
  RebalancingSetTokenFactoryContract,
  RebalanceAuctionModuleContract,
  IssuanceOrderModuleContract,
  WhiteListContract
]> => {
  const [transferProxy, vault] = await Promise.all([
    deployTransferProxyContract(web3),
    deployVaultContract(web3),
  ]);

  const core = await deployCoreContract(web3, transferProxy.address, vault.address);

  const whitelist = await deployWhitelistContract([], web3, core);

  const [setTokenFactory, rebalancingSetTokenFactory] = await Promise.all([
    deploySetTokenFactoryContract(web3, core),
    deployRebalancingSetTokenFactoryContract(web3, core, whitelist),
    addAuthorizationAsync(vault, core.address),
    addAuthorizationAsync(transferProxy, core.address),
  ]);

  const signatureValidator = await deploySignatureValidatorContract(web3);

  const [rebalanceAuctionModule, issuanceOrderModule] = await Promise.all([
    deployRebalanceAuctionModuleContract(web3, core, vault),
    deployIssuanceOrderModuleContract(signatureValidator, web3, core, transferProxy, vault),
  ]);

  return [
    core,
    transferProxy,
    vault,
    setTokenFactory,
    rebalancingSetTokenFactory,
    rebalanceAuctionModule,
    issuanceOrderModule,
    whitelist,
  ];
};

export const deployWhitelistContract = async (
  initialAddresses: Address[],
  web3: Web3,
  core: CoreContract,
): Promise<WhiteListContract> => {
  // Deploy WhitelistContract contract
  const truffleWhitelistContract = contract(WhiteList);
  truffleWhitelistContract.setProvider(web3.currentProvider);
  truffleWhitelistContract.defaults(TX_DEFAULTS);
  const deployedWhitelistContract = await truffleWhitelistContract.new(
    initialAddresses,
  );

  // Initialize typed contract class
  const whitelistContract = await WhiteListContract.at(
    deployedWhitelistContract.address,
    web3,
    TX_DEFAULTS,
  );

  return whitelistContract;
};

export const deployExchangeIssueModuleAsync = async (
  web3: Web3,
  core: CoreContract,
  transferProxy: TransferProxyContract,
  vault: VaultContract,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<ExchangeIssueModuleContract> => {
  const truffleExchangeIssueModuleContract = contract(ExchangeIssueModule);
  truffleExchangeIssueModuleContract.setProvider(web3.currentProvider);
  truffleExchangeIssueModuleContract.defaults(TX_DEFAULTS);
  const deployedExchangeIssueModuleContract = await truffleExchangeIssueModuleContract.new(
    core.address,
    transferProxy.address,
    vault.address,
  );

  // Initialize typed contract class
  const exchangeIssueModule = await ExchangeIssueModuleContract.at(
    deployedExchangeIssueModuleContract.address,
    web3,
    TX_DEFAULTS,
  );

  return exchangeIssueModule;
};

export const deployPayableExchangeIssueAsync = async (
  web3: Web3,
  core: CoreContract,
  transferProxy: TransferProxyContract,
  exchangeIssueModule: ExchangeIssueModuleContract,
  wrappedEther: WethMockContract,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<PayableExchangeIssueContract> => {


  const trufflePayableExchangeIssueContract = contract(PayableExchangeIssue);
  trufflePayableExchangeIssueContract.setProvider(web3.currentProvider);
  trufflePayableExchangeIssueContract.setNetwork(50);
  trufflePayableExchangeIssueContract.defaults(TX_DEFAULTS);

  const truffleERC20WrapperContract = contract(ERC20Wrapper);
  truffleERC20WrapperContract.setProvider(web3.currentProvider);
  truffleERC20WrapperContract.setNetwork(50);
  truffleERC20WrapperContract.defaults(TX_DEFAULTS);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await trufflePayableExchangeIssueContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedPayableExchangeIssueContract = await trufflePayableExchangeIssueContract.new(
    core.address,
    transferProxy.address,
    exchangeIssueModule.address,
    wrappedEther.address,
  );

  // Initialize typed contract class
  const payableExchangeIssue = await PayableExchangeIssueContract.at(
    deployedPayableExchangeIssueContract.address,
    web3,
    TX_DEFAULTS,
  );

  return payableExchangeIssue;
};

export const deployWethMockAsync = async (
  web3: Web3,
  initialAccount: Address,
  initialBalance: BigNumber,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<WethMockContract> => {
  const truffleWethMockContract = contract(WethMock);
  truffleWethMockContract.setProvider(web3.currentProvider);
  truffleWethMockContract.defaults(TX_DEFAULTS);
  const deployedWethMockContract = await truffleWethMockContract.new(
    initialAccount,
    initialBalance,
  );

  // Initialize typed contract class
  const wethMock = await WethMockContract.at(
    deployedWethMockContract.address,
    web3,
    TX_DEFAULTS,
  );

  return wethMock;
};

export const deployTokenAsync = async (
  web3: Web3,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<StandardTokenMockContract> => {
  const tokens = await deployTokensAsync(1, web3, owner);

  return tokens[0];
};

export const deployTokensAsync = async (
  tokenCount: number,
  web3: Web3,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<StandardTokenMockContract[]> => {
  const decimals: number[] = [];
  _.times(tokenCount, () => decimals.push(_.random(4, 18)));

  return deployTokensSpecifyingDecimals(tokenCount, decimals, web3, owner);
};

export const deployTokensSpecifyingDecimals = async (
  tokenCount: number,
  decimalsList: number[],
  web3: Web3,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<StandardTokenMockContract[]> => {
  const standardTokenMockContract = contract(StandardTokenMock);
  standardTokenMockContract.setProvider(web3.currentProvider);
  standardTokenMockContract.defaults(TX_DEFAULTS);
  const mockTokens: StandardTokenMockContract[] = [];

  const mockTokenPromises = _.times(tokenCount, async index => (
    await standardTokenMockContract.new(
      owner,
      DEPLOYED_TOKEN_QUANTITY,
      `Component ${index}`,
      index.toString(),
      decimalsList[index],
      TX_DEFAULTS,
    )
  ));

  await Promise.all(mockTokenPromises).then(tokenMock => {
    _.each(tokenMock, standardToken => {
      mockTokens.push(new StandardTokenMockContract(
        new web3.eth.Contract(standardToken.abi, standardToken.address),
        TX_DEFAULTS,
      ));
    });
  });

  return mockTokens;
};

export const deployNoDecimalTokenAsync = async (
  web3: Web3,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<NoDecimalTokenMockContract> => {
  const noDecimalTokenMockContract = contract(NoDecimalTokenMock);
  noDecimalTokenMockContract.setProvider(web3.currentProvider);
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
  name: string = 'Set Token',
  symbol: string = 'SET',
): Promise<SetTokenContract> => {
  const encodedName = SetProtocolUtils.stringToBytes(name);
  const encodedSymbol = SetProtocolUtils.stringToBytes(symbol);

  const createSetTokenTransactionHash = await core.create.sendTransactionAsync(
    setTokenFactoryAddress,
    componentAddresses,
    componentUnits,
    naturalUnit,
    encodedName,
    encodedSymbol,
    '0x0',
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

  await coreWrapper.addExchange.sendTransactionAsync(
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
  toAuthorize: Address,
) => {
  await contract.addAuthorizedAddress.sendTransactionAsync(
    toAuthorize,
    TX_DEFAULTS,
  );
};

export const addModuleAsync = async (
  core: CoreContract,
  moduleAddress: Address,
) => {
  await core.addModule.sendTransactionAsync(
    moduleAddress,
    TX_DEFAULTS,
  );
};

export const addPriceLibraryAsync = async (
  core: CoreContract,
  priceLibrary: Address,
) => {
  await core.addPriceLibrary.sendTransactionAsync(
    priceLibrary,
    TX_DEFAULTS,
  );
};

export const addWhiteListedTokenAsync = async (
  whitelist: WhiteListContract,
  toAdd: Address,
) => {
  await whitelist.addAddress.sendTransactionAsync(
    toAdd,
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
