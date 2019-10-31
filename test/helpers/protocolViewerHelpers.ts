import * as _ from 'lodash';
import Web3 from 'web3';
import {
  ProtocolViewer,
  ProtocolViewerContract
} from 'set-protocol-contracts';

import { TX_DEFAULTS } from '@src/constants';

import { setDefaultTruffleContract } from './coreHelpers';

export const deployProtocolViewerAsync = async (
  web3: Web3
): Promise<ProtocolViewerContract> => {
  const truffleProtocolWrapperContract = setDefaultTruffleContract(web3, ProtocolViewer);

  const deployedProtocolViewerContract = await truffleProtocolWrapperContract.new(TX_DEFAULTS);
  const protocolViewerContract = await ProtocolViewerContract.at(
    deployedProtocolViewerContract.address,
    web3,
    TX_DEFAULTS,
  );

  return protocolViewerContract;
};
