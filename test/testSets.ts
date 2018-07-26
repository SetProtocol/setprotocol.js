import { BigNumber } from '../src/util';

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

export const testSets: TestSet[] = [
  {
    setName: 'StableSet',
    setSymbol: 'STBL',
    targetPriceInUSD: 1.0,
    components: [
      {
        name: 'TrueUSD',
        symbol: 'TUSD',
        decimals: 18,
        price: 1.0,
        supply: 12013114 * 10 ** 18,
      },
      {
        name: 'Dai',
        symbol: 'Dai',
        decimals: 18,
        price: 1.0,
        supply: 29028274 * 10 ** 18,
      },
    ],
    units: [new BigNumber(5), new BigNumber(5)],
    naturalUnit: new BigNumber(10),
  },
  {
    setName: 'Decentralized Exchange',
    setSymbol: 'DEX',
    targetPriceInUSD: 100.0,
    components: [
      {
        name: '0x Protocol',
        symbol: 'ZRX',
        decimals: 18,
        price: 1.16,
        supply: 1000000000 * 10 ** 18,
      },
      {
        name: 'Kyber Network',
        symbol: 'KNC',
        decimals: 18,
        price: 2.58,
        supply: 215617232938864872334407431,
      },
      {
        name: 'Airswap',
        symbol: 'AST',
        decimals: 4,
        price: 0.54,
        supply: 500000000 * 10 ** 4,
      },
    ],
    units: [new BigNumber(505823196193389), new BigNumber(129066795398825), new BigNumber(1)],
    naturalUnit: new BigNumber(10 ** 13),
  },
  {
    setName: 'EthereumX',
    setSymbol: 'ETHX',
    targetPriceInUSD: 100.0,
    components: [
      {
        name: 'VeChain',
        symbol: 'VEN',
        decimals: 18,
        price: 4.6,
        supply: 873378637 * 10 ** 18,
      },
      {
        name: 'OmiseGO',
        symbol: 'OMG',
        decimals: 18,
        price: 16.99,
        supply: 140245398 * 10 ** 18,
      },
      {
        name: 'ICON',
        symbol: 'ICX',
        decimals: 18,
        price: 4.4,
        supply: 400228740 * 10 ** 18,
      },
      {
        name: 'BinanceCoin',
        symbol: 'BNB',
        decimals: 18,
        price: 14.16,
        supply: 194972068 * 10 ** 18,
      },
      {
        name: 'Aeternity',
        symbol: 'AE',
        decimals: 18,
        price: 4.63,
        supply: 273685830 * 10 ** 18,
      },
      {
        name: 'Bytom',
        symbol: 'BTM',
        decimals: 8,
        price: 1.0,
        supply: 1407000000 * 10 ** 8,
      },
      {
        name: 'Populous',
        symbol: 'PPT',
        decimals: 8,
        price: 23.43,
        supply: 53252246 * 10 ** 8,
      },
      {
        name: 'Zilliqa',
        symbol: 'ZIL',
        decimals: 12,
        price: 0.103,
        supply: 12600000000 * 10 ** 12,
      },
      {
        name: 'Maker',
        symbol: 'MKR',
        decimals: 18,
        price: 1040.96,
        supply: 1000000 * 10 ** 18,
      },
      {
        name: 'RChain',
        symbol: 'RHOC',
        decimals: 8,
        price: 1.75,
        supply: 870663574 * 10 ** 8,
      },
    ],
    units: [
      new BigNumber(431108388524),
      new BigNumber(83668972206),
      new BigNumber(317507239500),
      new BigNumber(93507241499),
      new BigNumber(191063267901),
      new BigNumber(81),
      new BigNumber(3),
      new BigNumber(5972702),
      new BigNumber(506910904),
      new BigNumber(30),
    ],
    naturalUnit: new BigNumber(10 ** 11),
  },
];
