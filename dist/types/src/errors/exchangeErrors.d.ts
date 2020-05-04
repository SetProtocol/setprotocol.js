import { BigNumber } from '../util';
export declare const exchangeErrors: {
    INVALID_EXCHANGE_ID: (exchangeId: string) => string;
    INSUFFIENT_LIQUIDITY_FOR_REQUIRED_COMPONENT: (component: string) => string;
    INSUFFICIENT_COMPONENT_AMOUNT_FROM_LIQUIDITY: (component: string, componentAmount: BigNumber, liquidityAmount: BigNumber) => string;
    INSUFFICIENT_MAKER_TOKEN: (makerTokenAmount: BigNumber, ordersTakerTokenAmount: BigNumber) => string;
    INSUFFICIENT_KYBER_SOURCE_TOKEN_FOR_RATE: (sourceTokenQuantity: BigNumber, amountYield: BigNumber, destinationToken: string) => string;
    MAKER_TOKEN_AND_ZERO_EX_TAKER_TOKEN_MISMATCH: () => string;
    MAKER_TOKEN_AND_KYBER_DESTINATION_TOKEN_MISMATCH: () => string;
    MAKER_TOKEN_AND_KYBER_SOURCE_TOKEN_MISMATCH: () => string;
};
