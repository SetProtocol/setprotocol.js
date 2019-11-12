import * as chai from 'chai';
import Web3 from 'web3';
import { BigNumber } from '@src/util';

import ChaiSetup from './chaiSetup';
ChaiSetup.configure();
const { expect } = chai;

export const getGasUsageInEth = async (web3: Web3, txHash: string) => {
  const txReceipt = await web3.eth.getTransactionReceipt(txHash);
    const txn = await web3.eth.getTransaction(txHash);
    const { gasPrice } = txn;
    const { gasUsed } = txReceipt;

    return new BigNumber(gasPrice).mul(gasUsed);
};

// For solidity function calls that violate require()
export async function expectRevertError(asyncTxn: any) {
  try {
    await asyncTxn;
    throw new Error('Did not throw');
  } catch (e) {
    assertCertainError(e, 'revert');
  }
}

// Helper function
function assertCertainError(error: Error, expected_error_msg: string) {
  // This complication is so that the actual error will appear in truffle test output
  const message = error.message;
  const matchedIndex = message.search(expected_error_msg);
  let matchedString = message;
  if (matchedIndex >= 0) {
    matchedString = message.substring(matchedIndex, matchedIndex + expected_error_msg.length);
  }
  expect(matchedString).to.equal(expected_error_msg);
}