import * as _ from 'lodash';
import Web3 from 'web3';
import {
  ProtocolViewer,
  ProtocolViewerContract
} from 'set-protocol-contracts';

import { TX_DEFAULTS } from '@src/constants';

const contract = require('truffle-contract');

export const deployProtocolViewerContract = async (
  web3: Web3
): Promise<ProtocolViewerContract> => {
  const truffleProtocolWrapperContract = contract(ProtocolViewer);
  truffleProtocolWrapperContract.setProvider(web3.currentProvider);
  truffleProtocolWrapperContract.setNetwork(50);
  truffleProtocolWrapperContract.defaults(TX_DEFAULTS);

  const deployedProtocolViewerContract = await truffleProtocolWrapperContract.new(TX_DEFAULTS);
  const protocolViewerContract = await ProtocolViewerContract.at(
    deployedProtocolViewerContract.address,
    web3,
    TX_DEFAULTS,
  );

  return protocolViewerContract;
};
