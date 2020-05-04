import Web3 from 'web3';
import { BigNumber } from '../../util';
import { Address } from '../../types/common';
/**
 * @title  KyberNetworkWrapper
 * @author Set Protocol
 *
 * The KyberNetwork wrapper handles interactions with the KyberNetworkWrapperContract
 *
 */
export declare class KyberNetworkWrapper {
    private web3;
    private contracts;
    private kyberNetworkWrapperAddress;
    constructor(web3: Web3, kyberNetworkWrapperAddress: Address);
    /**
     * Fetch the conversion rate for a Kyber trading pair
     *
     * @param  sourceTokens        Addresses of the tokens to trade
     * @param  destinationTokens   Addresses of the set components to trade for
     * @param  quantities          Quantities of maker tokens to trade for component tokens
     * @return                     Conversion and slippage rates for the source and destination token pairs
     */
    conversionRates(sourceTokens: Address[], destinationTokens: Address[], quantities: BigNumber[]): Promise<[BigNumber[], BigNumber[]]>;
}
