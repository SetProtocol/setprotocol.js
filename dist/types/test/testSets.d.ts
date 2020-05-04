import { BigNumber } from '@src/util';
export interface Token {
    name: string;
    symbol: string;
    decimals: number;
    price: number;
    supply: number;
}
export interface TestSet {
    setName: string;
    setSymbol: string;
    targetPriceInUSD: number;
    components: Token[];
    units: BigNumber[];
    naturalUnit: BigNumber;
}
export declare const testSets: TestSet[];
