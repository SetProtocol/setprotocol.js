declare module 'truffle-contract';
declare module 'web3.js';
declare module '*.json' {
    const json: any;
    /* tslint:disable */
    export default json;
    /* tslint:enable */
}

interface SetComponent {
  address: string;
  quantity: string;
  name: string;
  symbol: string;
}

interface SetObject {
  address: string;
  component: SetComponent;
  name: string;
  symbol: string;
  supply: number;
}

interface Token {
  address: string;
  name: string;
  symbol: string;
  balance: number;
  decimals: number;
}

interface LogEntry {
  logIndex: number | null;
  transactionIndex: number | null;
  transactionHash: string;
  blockHash: string | null;
  blockNumber: number | null;
  address: string;
  data: string;
  topics: string[];
}

interface AllEventsResult {
  get(callback: (err: Error, result: LogEntry[]) => void): void;
}
