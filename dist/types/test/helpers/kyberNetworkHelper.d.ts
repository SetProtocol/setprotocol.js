import { Address } from 'set-protocol-utils';
import { BigNumber } from 'bignumber.js';
import { StandardTokenMockContract } from 'set-protocol-contracts';
export declare class KyberNetworkHelper {
    kyberNetworkProxy: Address;
    kyberReserve: Address;
    defaultSlippagePercentage: BigNumber;
    constructor();
    setup(): Promise<void>;
    fundReserveWithEth(_from: Address, _quantity: BigNumber): Promise<void>;
    /**
     *  In this function, we are enabling an ERC20 token onto a normal Kyber Reserve (not automated or orderbook).
     *  We do three things:
     *  1. List the asset on a specific reserve by calling the KyberNetwork's listPairforReserveContract
     *     This can only be called by the operator of that reserve. Our standard reserve is operated by address 1
     *  2. Add the token to the ConversionRatesContract.
     *     This can only be called by the admin of the Kyber Network system. Our admin is account 0
     *  3. Set the Token Control Info
     *  4. Enable token for trading on Kyber
     *  See more about how to add tokens onto a kyber reserve here.
     *  https://developer.kyber.network/docs/FedPriceReservesGuide/#adding-tokens
     */
    enableTokensForReserve(_tokenAddress: Address, _minimalRecordResolution?: BigNumber, _maxPerBlockImbalance?: BigNumber, _maxTotalImbalance?: BigNumber): Promise<void>;
    setConversionRates(_sourceToken: Address, _destinationToken: Address, _sourceTokenQuantity: BigNumber, _destinationTokenQuantity: BigNumber): Promise<void>;
    setUpConversionRatesRaw(_tokenAddresses: Address[], _baseBuy: BigNumber[], _baseSell: BigNumber[]): Promise<void>;
    approveToReserve(_token: StandardTokenMockContract, _quantity: BigNumber, _from: Address): Promise<void>;
    getKyberRate(_sourceToken: Address, _destinationToken: Address, _sourceQuantity: BigNumber): Promise<BigNumber>;
}
