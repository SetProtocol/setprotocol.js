import * as _ from 'lodash';
import Web3 from 'web3';
import { Address, SetProtocolUtils } from 'set-protocol-utils';
import {
  Core,
  CommonValidationsLibrary,
  ERC20Wrapper,
  ExchangeIssuanceModule,
  CoreIssuanceLibrary,
  NoDecimalTokenMock,
  RebalancingSetExchangeIssuanceModule,
  RebalancingSetIssuanceModule,
  RebalanceAuctionModule,
  RebalancingSetTokenFactory,
  SetTokenFactory,
  FailAuctionLibrary,
  PlaceBidLibrary,
  ProposeLibrary,
  SettleRebalanceLibrary,
  SetTokenLibrary,
  StartRebalanceLibrary,
  StandardTokenMock,
  TransferProxy,
  Vault,
  WethMock,
  WhiteList,
} from 'set-protocol-contracts';
import {
  AuthorizableContract,
  CoreContract,
  ExchangeIssuanceModuleContract,
  NoDecimalTokenMockContract,
  RebalancingSetExchangeIssuanceModuleContract,
  RebalancingSetIssuanceModuleContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  DEFAULT_ACCOUNT,
  DEFAULT_REBALANCING_MAXIMUM_NATURAL_UNIT,
  DEFAULT_REBALANCING_MINIMUM_NATURAL_UNIT,
  DEPLOYED_TOKEN_QUANTITY,
  ONE_DAY_IN_SECONDS,
  TX_DEFAULTS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
} from '@src/constants';
import { BigNumber, getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '@src/util';

const contract = require('truffle-contract');

export const deployTransferProxyContract = async (
web3: Web3,
): Promise<TransferProxyContract> => {
  const truffleTransferProxyContract = setDefaultTruffleContract(web3, TransferProxy);

  // Deploy ERC20Wrapper dependency
  const truffleERC20WrapperContract = setDefaultTruffleContract(web3, ERC20Wrapper);

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
  const truffleVaultContract = setDefaultTruffleContract(web3, Vault);

  // Deploy ERC20Wrapper dependency
  const truffleErc20WrapperContract = setDefaultTruffleContract(web3, ERC20Wrapper);

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
  const truffleCoreContract = setDefaultTruffleContract(web3, Core);

  const truffleCoreIssuanceLibraryContract = setDefaultTruffleContract(web3, CoreIssuanceLibrary);
  const deployedCoreIssuanceLibraryContract = await truffleCoreIssuanceLibraryContract.new();
  await truffleCoreContract.link('CoreIssuanceLibrary', deployedCoreIssuanceLibraryContract.address);

  const truffleCommonValidationsLibraryContract = setDefaultTruffleContract(web3, CommonValidationsLibrary);
  const deployedCommonValidationsLibraryContract = await truffleCommonValidationsLibraryContract.new();
  await truffleCoreContract.link('CommonValidationsLibrary', deployedCommonValidationsLibraryContract.address);

  const truffleSetTokenLibraryContract = setDefaultTruffleContract(web3, SetTokenLibrary);
  const deployedSetTokenLibraryContract = await truffleSetTokenLibraryContract.new();
  await truffleCoreContract.link('SetTokenLibrary', deployedSetTokenLibraryContract.address);

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
  const truffleSetTokenFactoryContract = setDefaultTruffleContract(web3, SetTokenFactory);

  const truffleCommonValidationsLibraryContract = setDefaultTruffleContract(web3, CommonValidationsLibrary);
  const deployedCommonValidationsLibraryContract = await truffleCommonValidationsLibraryContract.new();
  await truffleSetTokenFactoryContract.link(
    'CommonValidationsLibrary',
    deployedCommonValidationsLibraryContract.address
  );

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
  const truffleRebalancingSetTokenFactoryContract = setDefaultTruffleContract(web3, RebalancingSetTokenFactory);
  await linkRebalancingLibrariesAsync(truffleRebalancingSetTokenFactoryContract, web3);

  const deployedRebalancingSetTokenFactory = await truffleRebalancingSetTokenFactoryContract.new(
    core.address,
    whitelist.address,
    ONE_DAY_IN_SECONDS,
    ONE_DAY_IN_SECONDS,
    ONE_DAY_IN_SECONDS.div(4),
    ONE_DAY_IN_SECONDS.mul(3),
    DEFAULT_REBALANCING_MINIMUM_NATURAL_UNIT,
    DEFAULT_REBALANCING_MAXIMUM_NATURAL_UNIT,
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

const linkRebalancingLibrariesAsync = async (
    contractToLink: any,
    web3: Web3,
  ): Promise<void> => {
  const truffleProposeLibraryContract = setDefaultTruffleContract(web3, ProposeLibrary);
  const truffleProposeLibrary = await truffleProposeLibraryContract.new();

  const truffleStartRebalanceLibraryContract = setDefaultTruffleContract(web3, StartRebalanceLibrary);
  const truffleStartRebalanceLibrary = await truffleStartRebalanceLibraryContract.new();

  const trufflePlaceBidLibraryContract = setDefaultTruffleContract(web3, PlaceBidLibrary);
  const trufflePlaceBidLibrary = await trufflePlaceBidLibraryContract.new();

  const truffleSettleRebalanceLibraryContract = setDefaultTruffleContract(web3, SettleRebalanceLibrary);
  const truffleSettleRebalanceLibrary = await truffleSettleRebalanceLibraryContract.new();

  const truffleFailAuctionLibraryContract = setDefaultTruffleContract(web3, FailAuctionLibrary);
  const truffleFailAuctionLibrary = await truffleFailAuctionLibraryContract.new();

  await contractToLink.link(
    'ProposeLibrary',
    truffleProposeLibrary.address
  );
  await contractToLink.link(
    'StartRebalanceLibrary',
    truffleStartRebalanceLibrary.address
  );
  await contractToLink.link(
    'PlaceBidLibrary',
    trufflePlaceBidLibrary.address
  );
  await contractToLink.link(
    'SettleRebalanceLibrary',
    truffleSettleRebalanceLibrary.address
  );
  await contractToLink.link(
    'FailAuctionLibrary',
    truffleFailAuctionLibrary.address
  );
};

export const deployRebalanceAuctionModuleContract = async (
  web3: Web3,
  core: CoreContract,
  vault: VaultContract,
): Promise<RebalanceAuctionModuleContract> => {
  const truffleRebalanceAuctionModuleContract = setDefaultTruffleContract(web3, RebalanceAuctionModule);

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

export const deployBaseContracts = async (
  web3: Web3
): Promise<[
  CoreContract,
  TransferProxyContract,
  VaultContract,
  SetTokenFactoryContract,
  RebalancingSetTokenFactoryContract,
  RebalanceAuctionModuleContract,
  WhiteListContract
]> => {
  const [transferProxy, vault] = await Promise.all([
    deployTransferProxyContract(web3),
    deployVaultContract(web3),
  ]);

  const core = await deployCoreContract(web3, transferProxy.address, vault.address);

  const whitelist = await deployWhitelistContract([], web3);

  const [setTokenFactory, rebalancingSetTokenFactory] = await Promise.all([
    deploySetTokenFactoryContract(web3, core),
    deployRebalancingSetTokenFactoryContract(web3, core, whitelist),
    addAuthorizationAsync(vault, core.address),
    addAuthorizationAsync(transferProxy, core.address),
  ]);

  const rebalanceAuctionModule = await deployRebalanceAuctionModuleContract(web3, core, vault);

  return [
    core,
    transferProxy,
    vault,
    setTokenFactory,
    rebalancingSetTokenFactory,
    rebalanceAuctionModule,
    whitelist,
  ];
};

export const deployWhitelistContract = async (
  initialAddresses: Address[],
  web3: Web3,
): Promise<WhiteListContract> => {
  // Deploy WhitelistContract contract
  const truffleWhitelistContract = setDefaultTruffleContract(web3, WhiteList);
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

export const deployExchangeIssuanceModuleAsync = async (
  web3: Web3,
  core: CoreContract,
  vault: VaultContract,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<ExchangeIssuanceModuleContract> => {
  const truffleExchangeIssuanceModuleContract = setDefaultTruffleContract(web3, ExchangeIssuanceModule);

  const truffleSetTokenLibraryContract = setDefaultTruffleContract(web3, SetTokenLibrary);

  const deployedSetTokenLibraryContract = await truffleSetTokenLibraryContract.new();
  await truffleExchangeIssuanceModuleContract.link('SetTokenLibrary', deployedSetTokenLibraryContract.address);

  const deployedExchangeIssuanceModuleContract = await truffleExchangeIssuanceModuleContract.new(
    core.address,
    vault.address,
  );

  // Initialize typed contract class
  const exchangeIssuanceModule = await ExchangeIssuanceModuleContract.at(
    deployedExchangeIssuanceModuleContract.address,
    web3,
    TX_DEFAULTS,
  );

  return exchangeIssuanceModule;
};

export const deployRebalancingSetExchangeIssuanceModuleAsync = async (
  web3: Web3,
  core: CoreContract,
  transferProxy: TransferProxyContract,
  exchangeIssuanceModule: ExchangeIssuanceModuleContract,
  wrappedEther: WethMockContract,
  vault: VaultContract,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<RebalancingSetExchangeIssuanceModuleContract> => {
  const truffleRebalancingSetExchangeIssuanceModuleContract = setDefaultTruffleContract(
    web3,
    RebalancingSetExchangeIssuanceModule
  );
  const truffleERC20WrapperContract = setDefaultTruffleContract(web3, ERC20Wrapper);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleRebalancingSetExchangeIssuanceModuleContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedRebalancingSetExchangeIssuanceModuleContract =
    await truffleRebalancingSetExchangeIssuanceModuleContract.new(
      core.address,
      transferProxy.address,
      exchangeIssuanceModule.address,
      wrappedEther.address,
      vault.address,
    );

  // Initialize typed contract class
  const rebalancingSetExchangeIssuanceModule = await RebalancingSetExchangeIssuanceModuleContract.at(
    deployedRebalancingSetExchangeIssuanceModuleContract.address,
    web3,
    TX_DEFAULTS,
  );

  return rebalancingSetExchangeIssuanceModule;
};

export const deployRebalancingSetIssuanceModuleAsync = async (
  web3: Web3,
  core: CoreContract,
  vault: VaultContract,
  transferProxy: TransferProxyContract,
  wrappedEther: WethMockContract,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<RebalancingSetIssuanceModuleContract> => {
  const truffleRebalancingSetIssuanceModuleContract = setDefaultTruffleContract(
    web3,
    RebalancingSetIssuanceModule
  );
  const truffleERC20WrapperContract = setDefaultTruffleContract(web3, ERC20Wrapper);

  const deployedERC20Wrapper = await truffleERC20WrapperContract.new();
  await truffleRebalancingSetIssuanceModuleContract.link('ERC20Wrapper', deployedERC20Wrapper.address);

  const deployedRebalancingSetIssuanceModuleContract =
    await truffleRebalancingSetIssuanceModuleContract.new(
      core.address,
      vault.address,
      transferProxy.address,
      wrappedEther.address,
    );

  // Initialize typed contract class
  const rebalancingSetIssuanceModule = await RebalancingSetIssuanceModuleContract.at(
    deployedRebalancingSetIssuanceModuleContract.address,
    web3,
    TX_DEFAULTS,
  );

  return rebalancingSetIssuanceModule;
};

export const deployWethMockAsync = async (
  web3: Web3,
  initialAccount: Address,
  initialBalance: BigNumber,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<WethMockContract> => {
  const truffleWethMockContract = setDefaultTruffleContract(web3, WethMock);

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

export const deployTokenSpecifyingDecimalAsync = async (
  decimalCount: number,
  web3: Web3,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<StandardTokenMockContract> => {
  const tokens = await deployTokensSpecifyingDecimals(1, [decimalCount], web3, owner);

  return tokens[0];
};

export const deployTokensSpecifyingDecimals = async (
  tokenCount: number,
  decimalsList: number[],
  web3: Web3,
  owner: Address = DEFAULT_ACCOUNT,
): Promise<StandardTokenMockContract[]> => {
  if (tokenCount != decimalsList.length) {
    throw new Error('Amount of tokens must match passed decimal list length');
  }
  const standardTokenMockContract = setDefaultTruffleContract(web3, StandardTokenMock);
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
  const noDecimalTokenMockContract = setDefaultTruffleContract(web3, NoDecimalTokenMock);

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

  const createSetTokenTransactionHash = await core.createSet.sendTransactionAsync(
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
  tokens: (StandardTokenMockContract | WethMockContract)[],
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

export const transferTokenAsync = async (
  token: StandardTokenMockContract,
  spender: Address,
  quantity: BigNumber,
  from: Address = DEFAULT_ACCOUNT,
) => {
  await token.transfer.sendTransactionAsync(
    spender,
    quantity,
    { from },
  );
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

export const setDefaultTruffleContract = (web3: Web3, contractInstance: any): any => {
  const truffleContract = contract(contractInstance);
  truffleContract.setProvider(web3.currentProvider);
  truffleContract.setNetwork(50);
  truffleContract.defaults(TX_DEFAULTS);

  return truffleContract;
};
