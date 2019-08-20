import Web3 from 'web3';
import { BigNumber } from '@src/util';

export const getGasUsageInEth = async (web3: Web3, txHash: string) => {
  const txReceipt = await web3.eth.getTransactionReceipt(txHash);
    const txn = await web3.eth.getTransaction(txHash);
    const { gasPrice } = txn;
    const { gasUsed } = txReceipt;

    return new BigNumber(gasPrice).mul(gasUsed);
};