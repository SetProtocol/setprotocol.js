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

interface EventLog {
  address: string;
  args: Object;
  blockHash: string | null;
  blockNumber: number | null;
  event: string;
  logIndex: number | null;
  removed: boolean;
  transactionIndex: number | null;
  transactionHash: string;
}

interface AllEventsResult {
  get(callback: (err: Error, result: EventLog[]) => void): void;
}
