import { Address } from 'set-protocol-utils';
import { BigNumber } from '@src/util';
export declare class CompoundHelper {
    priceOracle: Address;
    interestRateModel: Address;
    comptroller: Address;
    admin: Address;
    senderAccountAddress: Address;
    constructor();
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
    deployMockCUSDC(underlying: Address, admin: Address): Promise<string>;
    deployMockCDAI(underlying: Address, admin: Address): Promise<string>;
    enableCToken(cToken: Address): Promise<void>;
    setBorrowRate(cToken: Address, borrowRate: BigNumber): Promise<void>;
    deployCToken(underlying: Address, comptroller: Address, interestRateModel: Address, initialExchangeRate: BigNumber, symbol: string, name: string, decimals: BigNumber, admin: Address): Promise<string>;
    getExchangeRate(cToken: Address): Promise<BigNumber>;
    getExchangeRateCurrent(cToken: Address): Promise<BigNumber>;
    mintCToken(cToken: Address, underlyingQuantity: BigNumber, from?: Address): Promise<any>;
    cTokenToUnderlying(cToken: Address, cTokenQuantity: BigNumber): Promise<BigNumber>;
    underlyingToCToken(cToken: Address, underlyingQuantity: BigNumber): Promise<BigNumber>;
    balanceOf(cToken: Address, account: Address): Promise<BigNumber>;
    balanceOfUnderlying(cToken: Address, account: Address): Promise<BigNumber>;
    accrueInterest(cToken: Address, from?: Address): Promise<any>;
    cTokenInstance(cToken: Address): any;
}
