import Web3 from 'web3';
import { BigNumber } from '.';

const web3 = new Web3();

export function ether(amount: number): BigNumber {
  const weiString = web3.utils.toWei(amount.toString(), 'ether');
  return new BigNumber(weiString);
}
