export declare const exchangeIssuanceErrors: {
    ONLY_ONE_RECEIVE_TOKEN: () => string;
    REDEEM_AND_TRADE_QUANTITIES_MISMATCH: (quantityFromRebalancingSetQuantity: string, quantityToTrade: string) => string;
    INVALID_SEND_TOKEN: (sendToken: string, paymentToken: string) => string;
    INVALID_RECEIVE_TOKEN: (receiveToken: string, outputToken: string) => string;
    ISSUING_SET_NOT_BASE_SET: (setAddress: string, currentSet: string) => string;
    REDEEMING_SET_NOT_BASE_SET: (setAddress: string, currentSet: string) => string;
    PAYMENT_TOKEN_QUANTITY_NOT_UNDEFINED: () => string;
    TRADE_TOKENS_NOT_COMPONENT: (setAddress: string, componentAddress: string) => string;
};
