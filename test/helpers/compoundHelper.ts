import * as _ from 'lodash';
import Web3 from 'web3';
import { Address } from 'set-protocol-utils';


import {
  DEFAULT_ACCOUNT,
  DEFAULT_GAS_LIMIT,
} from '@src/constants';
import {
  BigNumber,
  ether
} from '@src/util';

import { ComptrollerABI } from '../external/abis/compound/ComptrollerABI';
import { CErc20ABI } from '../external/abis/compound/CErc20ABI';
import { InterestRateModelABI } from '../external/abis/compound/InterestRateModelABI';

import { CONTRACTS, PERMISSIONED_ACCOUNTS, BYTECODE } from '../external/compoundSnapshotAddresses';

const web3 = new Web3('http://localhost:8545');

export class CompoundHelper {
  public priceOracle: Address = CONTRACTS.PriceOracle;
  public interestRateModel: Address = CONTRACTS.InterestRateModel;
  public comptroller: Address = CONTRACTS.Comptroller;
  public admin: Address = PERMISSIONED_ACCOUNTS.admin;
  public senderAccountAddress: Address = DEFAULT_ACCOUNT;

  constructor() {}

    /**
     * Example Usage: USDC
     *
     * const usdc: StandardTokenMockContract = await this._erc20Helper.deployTokenAsync(
     *   this.senderAccountAddress,
     *   6,
     * );
     *
     * const cUSDC = await this.deployMockCUSDC(usdc.address, this.admin);
     * await this.enableCToken(cUSDC);
     *
     *  Set the Borrow Rate
     *  await this.setBorrowRate(cUSDC, new BigNumber('1000000000000'));
     *
     * await this._erc20Helper.approveTransferAsync(
     *   usdc,
     *   cUSDC,
     *   this.senderAccountAddress
     * );
     *
     * await this.accrueInterest(cUSDC);
     *
     * const ONE_USDC = new BigNumber(10 ** 6);
     * await this.mintCToken(cUSDC, ONE_USDC);
     */

  /* ============ Compound Methods ============ */

  public async deployMockCUSDC(
    underlying: Address,
    admin: Address,
  ): Promise<string> {
    const config = {
      'name': 'Compound USD Coin',
      'symbol': 'cUSDC',
      'decimals': new BigNumber(8),
      'underlying': underlying,
      'contract': 'CErc20',
      'initial_exchange_rate_mantissa': new BigNumber('200000000000000'),
    };

    return await this.deployCToken(
      config.underlying,
      this.comptroller,
      this.interestRateModel,
      config.initial_exchange_rate_mantissa,
      config.symbol,
      config.name,
      config.decimals,
      this.admin,
    );
  }

  public async deployMockCDAI(
    underlying: Address,
    admin: Address,
  ): Promise<string> {
    const config = {
      'name': 'C_DAI',
      'symbol': 'cDAI',
      'decimals': new BigNumber(8),
      'underlying': underlying,
      'contract': 'CErc20',
      'initial_exchange_rate_mantissa': new BigNumber('20000000000000000'),
    };

    return await this.deployCToken(
      config.underlying,
      this.comptroller,
      this.interestRateModel,
      config.initial_exchange_rate_mantissa,
      config.symbol,
      config.name,
      config.decimals,
      this.admin,
    );
  }

  // cToken must be enabled before minting or accruing interest is allowed
  public async enableCToken(cToken: Address): Promise<void> {
    const ComptrollerContract = new web3.eth.Contract(ComptrollerABI, this.comptroller);

    const supportMarketData = ComptrollerContract.methods._supportMarket(
      cToken
    ).encodeABI();
    await web3.eth.sendTransaction({
      from: this.senderAccountAddress,
      to: this.comptroller,
      data: supportMarketData,
      gas: DEFAULT_GAS_LIMIT,
    });
  }

  // Sets borrow rate on the interestRateModel
  public async setBorrowRate(cToken: Address, borrowRate: BigNumber): Promise<void> {
    const InterestRateModelContract = new web3.eth.Contract(InterestRateModelABI, this.interestRateModel);
    const setBorrowData = InterestRateModelContract.methods.setBorrowRate(
      borrowRate.toString()
    ).encodeABI();
    await web3.eth.sendTransaction({
      from: this.senderAccountAddress,
      to: this.interestRateModel,
      data: setBorrowData,
      gas: DEFAULT_GAS_LIMIT,
    });
  }

  public async deployCToken(
    underlying: Address,
    comptroller: Address,
    interestRateModel: Address,
    initialExchangeRate: BigNumber,
    symbol: string,
    name: string,
    decimals: BigNumber,
    admin: Address,
  ): Promise<string> {
    const instance = await new web3.eth.Contract(CErc20ABI).deploy({
      data: BYTECODE.CErc20,
      arguments: [
        underlying,
        comptroller,
        interestRateModel,
        initialExchangeRate.toString(),
        name,
        symbol,
        decimals.toString(),
        admin,
      ],
    }).send({ from: admin, gas: DEFAULT_GAS_LIMIT });
    return instance.options.address;
  }

  public async getExchangeRate(
    cToken: Address,
  ): Promise<BigNumber> {
    const exchangeRate: number = await this.cTokenInstance(cToken).methods.exchangeRateStored().call();
    return new BigNumber(exchangeRate);
  }

  public async getExchangeRateCurrent(
    cToken: Address,
  ): Promise<BigNumber> {
    const exchangeRate: number = await this.cTokenInstance(cToken).methods.exchangeRateCurrent().call();
    return new BigNumber(exchangeRate);
  }

  public async mintCToken(
    cToken: Address,
    underlyingQuantity: BigNumber,
    from: Address = this.senderAccountAddress,
  ): Promise<any> {
    const txnData = this.cTokenInstance(cToken).methods.mint(
      underlyingQuantity.toString()
    ).encodeABI();

    return await web3.eth.sendTransaction({ from, to: cToken, data: txnData, gas: DEFAULT_GAS_LIMIT });
  }

  // The redeem function transfers the underlying asset from the money market to
  // the user in exchange for previously minted cTokens. The amount of underlying
  // redeemed is the number of cTokens multiplied by the current Exchange Rate.
  public async cTokenToUnderlying(
    cToken: Address,
    cTokenQuantity: BigNumber
  ): Promise<BigNumber> {
    const exchangeRate: number = await this.cTokenInstance(cToken).methods.exchangeRateStored().call();
    return cTokenQuantity.mul(exchangeRate).div(ether(1));
  }

  // Retrieve # of cTokens expected from Underlying Quantity
  public async underlyingToCToken(
    cToken: Address,
    underlyingQuantity: BigNumber
  ): Promise<BigNumber> {
    const exchangeRate: number = await this.cTokenInstance(cToken).methods.exchangeRateStored().call();
    return underlyingQuantity.div(exchangeRate).mul(ether(1));
  }

  public async balanceOf(
    cToken: Address,
    account: Address
  ): Promise<BigNumber> {
    const balance = await this.cTokenInstance(cToken).methods.balanceOf(account).call();
    return new BigNumber(balance);
  }

  // Retrieves balance of underlying owned
  public async balanceOfUnderlying(
    cToken: Address,
    account: Address
  ): Promise<BigNumber> {
    const balance = await this.cTokenInstance(cToken).methods.balanceOfUnderlying(account).call();
    return new BigNumber(balance);
  }

  public async accrueInterest(
    cToken: Address,
    from: Address = this.senderAccountAddress,
  ): Promise<any> {
    const txnData = this.cTokenInstance(cToken).methods.accrueInterest().encodeABI();
    return await web3.eth.sendTransaction({ from, to: cToken, data: txnData, gas: DEFAULT_GAS_LIMIT });
  }

  public cTokenInstance(
    cToken: Address,
  ): any {
    return new web3.eth.Contract(CErc20ABI, cToken);
  }
}