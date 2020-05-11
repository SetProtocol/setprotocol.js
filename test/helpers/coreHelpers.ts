import * as _ from 'lodash';
import Web3 from 'web3';
import { Address, SetProtocolUtils } from 'set-protocol-utils';
import {
  AuthorizableContract,
  CoreContract,
  ExchangeIssuanceModuleContract,
  FixedFeeCalculatorContract,
  LinearAuctionLiquidatorContract,
  NoDecimalTokenMockContract,
  OracleWhiteListContract,
  RebalancingSetExchangeIssuanceModuleContract,
  RebalancingSetIssuanceModuleContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenFactoryContract,
  RebalancingSetTokenV2FactoryContract,
  RebalancingSetTokenV3FactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  TWAPLiquidator,
  TWAPLiquidatorContract,
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
  ONE_HOUR_IN_SECONDS,
  TX_DEFAULTS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
} from '@src/constants';
import { BigNumber, getFormattedLogsFromTxHash, extractNewSetTokenAddressFromLogs } from '@src/util';

const Bytes32Library =
  require('set-protocol-contracts/dist/artifacts/ts/Bytes32Library').Bytes32Library;
const CommonValidationsLibrary =
  require(
    'set-protocol-contracts/dist/artifacts/ts/CommonValidationsLibrary'
  ).CommonValidationsLibrary;
const Core = require('set-protocol-contracts/dist/artifacts/ts/Core').Core;
const CoreIssuanceLibrary =
  require('set-protocol-contracts/dist/artifacts/ts/CoreIssuanceLibrary').CoreIssuanceLibrary;
const ERC20Wrapper =
  require('set-protocol-contracts/dist/artifacts/ts/ERC20Wrapper').ERC20Wrapper;
const FactoryUtilsLibrary =
  require('set-protocol-contracts/dist/artifacts/ts/FactoryUtilsLibrary').FactoryUtilsLibrary;
const FixedFeeCalculator =
  require('set-protocol-contracts/dist/artifacts/ts/FixedFeeCalculator').FixedFeeCalculator;
const ExchangeIssuanceModule =
  require('set-protocol-contracts/dist/artifacts/ts/ExchangeIssuanceModule').ExchangeIssuanceModule;
const LinearAuctionLiquidator =
  require(
    'set-protocol-contracts/dist/artifacts/ts/LinearAuctionLiquidator'
  ).LinearAuctionLiquidator;
const NoDecimalTokenMock =
  require('set-protocol-contracts/dist/artifacts/ts/NoDecimalTokenMock').NoDecimalTokenMock;
const OracleWhiteList =
  require('set-protocol-contracts/dist/artifacts/ts/OracleWhiteList').OracleWhiteList;
const RebalancingSetExchangeIssuanceModule =
  require(
    'set-protocol-contracts/dist/artifacts/ts/RebalancingSetExchangeIssuanceModule'
  ).RebalancingSetExchangeIssuanceModule;
const RebalancingSetIssuanceModule =
  require(
    'set-protocol-contracts/dist/artifacts/ts/RebalancingSetIssuanceModule'
  ).RebalancingSetIssuanceModule;
const RebalanceAuctionModule =
  require('set-protocol-contracts/dist/artifacts/ts/RebalanceAuctionModule').RebalanceAuctionModule;
const RebalancingSetTokenFactory =
  require(
    'set-protocol-contracts/dist/artifacts/ts/RebalancingSetTokenFactory'
  ).RebalancingSetTokenFactory;
const RebalancingSetTokenV2Factory =
  require(
    'set-protocol-contracts/dist/artifacts/ts/RebalancingSetTokenV2Factory'
  ).RebalancingSetTokenV2Factory;
const RebalancingSetTokenV3Factory =
  require(
    'set-protocol-contracts/dist/artifacts/ts/RebalancingSetTokenV3Factory'
  ).RebalancingSetTokenV3Factory;
const SetTokenFactory =
  require('set-protocol-contracts/dist/artifacts/ts/SetTokenFactory').SetTokenFactory;
const FailAuctionLibrary =
  require('set-protocol-contracts/dist/artifacts/ts/FailAuctionLibrary').FailAuctionLibrary;
const PlaceBidLibrary =
  require('set-protocol-contracts/dist/artifacts/ts/PlaceBidLibrary').PlaceBidLibrary;
const ProposeLibrary =
  require('set-protocol-contracts/dist/artifacts/ts/ProposeLibrary').ProposeLibrary;
const SettleRebalanceLibrary =
  require('set-protocol-contracts/dist/artifacts/ts/SettleRebalanceLibrary').SettleRebalanceLibrary;
const SetTokenLibrary =
  require('set-protocol-contracts/dist/artifacts/ts/SetTokenLibrary').SetTokenLibrary;
const StartRebalanceLibrary =
  require('set-protocol-contracts/dist/artifacts/ts/StartRebalanceLibrary').StartRebalanceLibrary;
const StandardTokenMock =
  require('set-protocol-contracts/dist/artifacts/ts/StandardTokenMock').StandardTokenMock;
const TransferProxy =
  require('set-protocol-contracts/dist/artifacts/ts/TransferProxy').TransferProxy;
const Vault = require('set-protocol-contracts/dist/artifacts/ts/Vault').Vault;
const WethMock = require('set-protocol-contracts/dist/artifacts/ts/WethMock').WethMock;
const WhiteList = require('set-protocol-contracts/dist/artifacts/ts/WhiteList').WhiteList;


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

  const truffleBytes32LibraryContract = setDefaultTruffleContract(web3, Bytes32Library);
  const deployedBytes32LibraryContract = await truffleBytes32LibraryContract.new();
  await truffleSetTokenFactoryContract.link(
    'Bytes32Library',
    deployedBytes32LibraryContract.address
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
  minimumRebalanceInterval: BigNumber = ONE_DAY_IN_SECONDS,
  minimumProposalPeriod: BigNumber = ONE_DAY_IN_SECONDS,
  minimumTimeToPivot: BigNumber = ONE_DAY_IN_SECONDS.div(4),
  maximumTimeToPivot: BigNumber = ONE_DAY_IN_SECONDS.mul(3),
  minimumNaturalUnit: BigNumber = DEFAULT_REBALANCING_MINIMUM_NATURAL_UNIT,
  maximumNaturalUnit: BigNumber = DEFAULT_REBALANCING_MAXIMUM_NATURAL_UNIT,
): Promise<RebalancingSetTokenFactoryContract> => {
  // Deploy SetTokenFactory contract
  const truffleRebalancingSetTokenFactoryContract = setDefaultTruffleContract(web3, RebalancingSetTokenFactory);
  await linkRebalancingLibrariesAsync(truffleRebalancingSetTokenFactoryContract, web3);

  const truffleBytes32LibraryContract = setDefaultTruffleContract(web3, Bytes32Library);
  const deployedBytes32LibraryContract = await truffleBytes32LibraryContract.new();
  await truffleRebalancingSetTokenFactoryContract.link(
    'Bytes32Library',
    deployedBytes32LibraryContract.address
  );

  const deployedRebalancingSetTokenFactory = await truffleRebalancingSetTokenFactoryContract.new(
    core.address,
    whitelist.address,
    minimumRebalanceInterval,
    minimumProposalPeriod,
    minimumTimeToPivot,
    maximumTimeToPivot,
    minimumNaturalUnit,
    maximumNaturalUnit
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

export const deployRebalancingSetTokenV2FactoryContractAsync = async (
  web3: Web3,
  core: CoreContract,
  componentWhitelist: WhiteListContract,
  liquidatorWhitelist: WhiteListContract,
  feeCalculatorWhitelist: WhiteListContract,
  minimumRebalanceInterval: BigNumber = ONE_DAY_IN_SECONDS,
  minimumFailRebalancePeriod: BigNumber = ONE_DAY_IN_SECONDS.div(2),
  maximumFailRebalancePeriod: BigNumber = ONE_DAY_IN_SECONDS.mul(4),
  minimumNaturalUnit: BigNumber = DEFAULT_REBALANCING_MINIMUM_NATURAL_UNIT,
  maximumNaturalUnit: BigNumber = DEFAULT_REBALANCING_MAXIMUM_NATURAL_UNIT,
): Promise<RebalancingSetTokenV2FactoryContract> => {
  // Deploy SetTokenFactory contract
  const truffleRebalancingSetTokenV2FactoryContract = setDefaultTruffleContract(web3, RebalancingSetTokenV2Factory);

  const truffleBytes32LibraryContract = setDefaultTruffleContract(web3, Bytes32Library);
  const deployedBytes32LibraryContract = await truffleBytes32LibraryContract.new();
  await truffleRebalancingSetTokenV2FactoryContract.link(
    'Bytes32Library',
    deployedBytes32LibraryContract.address
  );

  const deployedRebalancingSetTokenV2Factory = await truffleRebalancingSetTokenV2FactoryContract.new(
    core.address,
    componentWhitelist.address,
    liquidatorWhitelist.address,
    feeCalculatorWhitelist.address,
    minimumRebalanceInterval,
    minimumFailRebalancePeriod,
    maximumFailRebalancePeriod,
    minimumNaturalUnit,
    maximumNaturalUnit,
  );

  // Initialize typed contract class
  const rebalancingSetTokenV2FactoryContract = await RebalancingSetTokenV2FactoryContract.at(
    deployedRebalancingSetTokenV2Factory.address,
    web3,
    TX_DEFAULTS,
  );

  // Enable factory for provided core
  await core.addFactory.sendTransactionAsync(
    rebalancingSetTokenV2FactoryContract.address,
    TX_DEFAULTS
  );

  return rebalancingSetTokenV2FactoryContract;
};

export const deployRebalancingSetTokenV3FactoryContractAsync = async (
  web3: Web3,
  core: CoreContract,
  componentWhitelist: WhiteListContract,
  liquidatorWhitelist: WhiteListContract,
  feeCalculatorWhitelist: WhiteListContract,
  minimumRebalanceInterval: BigNumber = ONE_DAY_IN_SECONDS,
  minimumFailRebalancePeriod: BigNumber = ONE_DAY_IN_SECONDS.div(2),
  maximumFailRebalancePeriod: BigNumber = ONE_DAY_IN_SECONDS.mul(4),
  minimumNaturalUnit: BigNumber = DEFAULT_REBALANCING_MINIMUM_NATURAL_UNIT,
  maximumNaturalUnit: BigNumber = DEFAULT_REBALANCING_MAXIMUM_NATURAL_UNIT,
): Promise<RebalancingSetTokenV3FactoryContract> => {
  // Deploy SetTokenFactory contract
  const truffleRebalancingSetTokenV3FactoryContract = setDefaultTruffleContract(web3, RebalancingSetTokenV3Factory);

  const truffleBytes32LibraryContract = setDefaultTruffleContract(web3, Bytes32Library);
  const deployedBytes32LibraryContract = await truffleBytes32LibraryContract.new();
  await truffleRebalancingSetTokenV3FactoryContract.link(
    'Bytes32Library',
    deployedBytes32LibraryContract.address
  );

  const truffleFactoryUtilsLibraryContract = setDefaultTruffleContract(web3, FactoryUtilsLibrary);
  const deployedFactoryUtilsLibraryContract = await truffleFactoryUtilsLibraryContract.new();
  await truffleRebalancingSetTokenV3FactoryContract.link(
    'FactoryUtilsLibrary',
    deployedFactoryUtilsLibraryContract.address
  );

  const deployedRebalancingSetTokenV3Factory = await truffleRebalancingSetTokenV3FactoryContract.new(
    core.address,
    componentWhitelist.address,
    liquidatorWhitelist.address,
    feeCalculatorWhitelist.address,
    minimumRebalanceInterval,
    minimumFailRebalancePeriod,
    maximumFailRebalancePeriod,
    minimumNaturalUnit,
    maximumNaturalUnit,
  );

  // Initialize typed contract class
  const rebalancingSetTokenV3FactoryContract = await RebalancingSetTokenV3FactoryContract.at(
    deployedRebalancingSetTokenV3Factory.address,
    web3,
    TX_DEFAULTS,
  );

  // Enable factory for provided core
  await core.addFactory.sendTransactionAsync(
    rebalancingSetTokenV3FactoryContract.address,
    TX_DEFAULTS
  );

  return rebalancingSetTokenV3FactoryContract;
};

export const deployLinearAuctionLiquidatorContractAsync = async (
  web3: Web3,
  core: CoreContract,
  oracleWhiteList: OracleWhiteListContract,
  auctionPeriod: BigNumber = ONE_HOUR_IN_SECONDS.mul(2),
  rangeStart: BigNumber = new BigNumber(3),
  rangeEnd: BigNumber = new BigNumber(21),
  name: string = 'Liquidator',
): Promise<LinearAuctionLiquidatorContract> => {
  const truffleLinearAuctionLiquidatorContract = setDefaultTruffleContract(web3, LinearAuctionLiquidator);

  const deployedLinearAuctionLiquidator = await truffleLinearAuctionLiquidatorContract.new(
    core.address,
    oracleWhiteList.address,
    auctionPeriod,
    rangeStart,
    rangeEnd,
    name
  );

  // Initialize typed contract class
  const linearAuctionLiquidatorContract = await LinearAuctionLiquidatorContract.at(
    deployedLinearAuctionLiquidator.address,
    web3,
    TX_DEFAULTS,
  );

  return linearAuctionLiquidatorContract;
};

export const deployTWAPLiquidatorAsync = async (
  web3: Web3,
  core: Address,
  oracleWhiteList: Address,
  auctionPeriod: BigNumber,
  rangeStart: BigNumber,
  rangeEnd: BigNumber,
  assetPairHashes: string[],
  assetPairBounds: {}[],
  name: string
): Promise<TWAPLiquidatorContract> => {
  const assetPairBoundsStr = [];
  for (let i = 0; i < assetPairBounds.length; i++) {
    assetPairBoundsStr.push(assetPairBounds[i]);
  }

  const truffleLiquidator = setDefaultTruffleContract(web3, TWAPLiquidator);
  const deployedTWAPLiquidator = await truffleLiquidator.new(
    core,
    oracleWhiteList,
    auctionPeriod,
    rangeStart,
    rangeEnd,
    assetPairHashes,
    assetPairBoundsStr,
    name,
  );

  return await TWAPLiquidatorContract.at(
    deployedTWAPLiquidator.address,
    web3,
    TX_DEFAULTS,
  );
};

export const deployFixedFeeCalculatorAsync = async (
  web3: Web3,
): Promise<FixedFeeCalculatorContract> => {
  const truffleFeeCalculator = setDefaultTruffleContract(web3, FixedFeeCalculator);

  const deployedFeeCalculator = await truffleFeeCalculator.new();

  const feeCalculatorContract = await FixedFeeCalculatorContract.at(
    deployedFeeCalculator.address,
    web3,
    TX_DEFAULTS
  );

  return feeCalculatorContract;
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
  web3: Web3,
  whiteListedTokens: Address[] = []
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

  const whitelist = await deployWhiteListContract(web3, whiteListedTokens);
  const setTokenFactory = await deploySetTokenFactoryContract(web3, core);
  const rebalancingSetTokenFactory = await deployRebalancingSetTokenFactoryContract(web3, core, whitelist);

  await Promise.all([
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

export const deployWhiteListContract = async (
  web3: Web3,
  initialAddresses: Address[],
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

export const deployOracleWhiteListAsync = async (
  web3: Web3,
  tokenAddresses: Address[],
  oracleAddresses: Address[],
): Promise<OracleWhiteListContract> => {
  // Deploy WhitelistContract contract
  const truffleOracleWhiteListContract = setDefaultTruffleContract(web3, OracleWhiteList);
  const deployedOracleWhiteListContract = await truffleOracleWhiteListContract.new(
    tokenAddresses,
    oracleAddresses
  );

  // Initialize typed contract class
  const whiteListContract = await OracleWhiteListContract.at(
    deployedOracleWhiteListContract.address,
    web3,
    TX_DEFAULTS,
  );

  return whiteListContract;
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

export const getTokenInstances = async (
  web3: Web3,
  tokenAddresses: Address[],
): Promise<StandardTokenMockContract[]> => {
  const tokenInstances = await Promise.all(
    tokenAddresses.map(tokenAddress => {
      return StandardTokenMockContract.at(
        tokenAddress,
        web3,
        TX_DEFAULTS,
      );
    })
  );
  return tokenInstances;
};

export const getTokenSupplies = async (
  tokens: StandardTokenMockContract[],
): Promise<BigNumber[]> => {
  const supplyPromises = _.map(tokens, token => {
    return token.totalSupply.callAsync();
  });

  let supplies: BigNumber[] = new Array(tokens.length).fill(SetProtocolUtils.CONSTANTS.ZERO);
  await Promise.all(supplyPromises).then(fetchedSupplyBalances => {
    supplies = fetchedSupplyBalances;
  });

  return supplies;
};

export const setDefaultTruffleContract = (web3: Web3, contractInstance: any): any => {
  const truffleContract = contract(contractInstance);
  truffleContract.setProvider(web3.currentProvider);
  truffleContract.setNetwork(50);
  truffleContract.defaults(TX_DEFAULTS);

  return truffleContract;
};
