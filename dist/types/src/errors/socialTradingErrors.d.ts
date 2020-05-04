import { BigNumber } from '../util';
export declare const socialTradingErrors: {
    ALLOCATION_EXCEEDS_ONE_HUNDERED_PERCENT: (allocation: BigNumber) => string;
    ALLOCATION_NOT_MULTIPLE_OF_ONE_PERCENT: (allocation: BigNumber) => string;
    FEE_NOT_MULTIPLE_OF_ONE_BASIS_POINT: (fee: BigNumber) => string;
    FEE_EXCEEDS_MAX_FEE: (fee: BigNumber, maxFee: BigNumber) => string;
    NOT_TRADER: (caller: string) => string;
    FEE_UPDATE_NOT_INITIATED: () => string;
    INSUFFICIENT_TIME_PASSED: (validUpdateTimestamp: string) => string;
};
