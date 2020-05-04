import { BigNumber } from '../util';
export declare class CommonAssertions {
    greaterThanZero(quantity: BigNumber, errorMessage: string): void;
    includes(arr1: any[], val: any, errorMessage: string): void;
    isEqualLength(arr1: any[], arr2: any[], errorMessage: string): void;
    isGreaterThan(quantity1: BigNumber, quantity2: BigNumber, errorMessage: string): void;
    isGreaterOrEqualThan(quantity1: BigNumber, quantity2: BigNumber, errorMessage: string): void;
    isLessOrEqualThan(quantity1: BigNumber, quantity2: BigNumber, errorMessage: string): void;
    isMultipleOf(quantity: BigNumber, baseQuantity: BigNumber, errorMessage: string): void;
    isValidString(value: string, errorMessage: string): void;
    isNotUndefined(value: any, errorMessage: string): void;
    isNotEmptyArray(array: any[], errorMessage: string): void;
    isValidExpiration(expiration: BigNumber, errorMessage: string): void;
    isValidLength(arr: any[], len: number, errorMessage: string): void;
    isEqualBigNumber(bigNumber1: BigNumber, bigNumber2: BigNumber, errorMessage: string): void;
    isEqualAddress(address1: string, address2: string, errorMessage: string): void;
    isDifferentAddress(address1: string, address2: string, errorMessage: string): void;
    verifyProportionsSumToOne(percentages: BigNumber[], errorMesage: string): void;
}
