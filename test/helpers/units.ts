import * as Web3 from 'web3';
import { BigNumber } from 'bignumber.js';

const web3 = new Web3();

export function ether(amount: number): BigNumber {
  const weiString = web3.toWei(amount, 'ether');
  return new BigNumber(weiString);
}