import { BigNumber } from '../util';
export declare const coreAPIErrors: {
    ARRAYS_EQUAL_LENGTHS: (firstArray: string, secondArray: string) => string;
    EMPTY_ARRAY: (variable: string) => string;
    EXPIRATION_PASSED: () => string;
    INVALID_NATURAL_UNIT: (minNaturalUnit: BigNumber) => string;
    PROPORTIONS_DONT_ADD_UP_TO_1: () => string;
    QUANTITY_NEEDS_TO_BE_MULTIPLE_OF_NATURAL_UNIT: (quantityType: string) => string;
    QUANTITY_NEEDS_TO_BE_POSITIVE: (quantity: BigNumber) => string;
    SIGNATURE_MISMATCH: () => string;
    STRING_CANNOT_BE_EMPTY: (variable: string) => string;
};
export declare const coreAssertionErrors: {
    MISSING_CORE_METHOD: (address: string) => string;
};
