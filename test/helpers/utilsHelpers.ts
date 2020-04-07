import * as _ from 'lodash';
import Web3 from 'web3';
import { Address } from 'set-protocol-utils';
import {
  AddressToAddressWhiteListContract,
} from 'set-protocol-contracts';

import { TX_DEFAULTS } from '@src/constants';

import { setDefaultTruffleContract } from './coreHelpers';

const AddressToAddressWhiteList =
  require(
    'set-protocol-contracts/dist/artifacts/ts/AddressToAddressWhiteList'
  ).AddressToAddressWhiteList;

export const deployAddressToAddressWhiteListContract = async(
  web3: Web3,
  initialKeyAddresses: Address[],
  initialValueAddresses: Address[],
): Promise<AddressToAddressWhiteListContract> => {
  const truffleWhiteListContract = setDefaultTruffleContract(web3, AddressToAddressWhiteList);

  // Deploy AddressToAddressWhiteList
  const deployedAddressToAddressWhiteListInstance = await truffleWhiteListContract.new(
    initialKeyAddresses,
    initialValueAddresses,
  );
  return await AddressToAddressWhiteListContract.at(
    deployedAddressToAddressWhiteListInstance.address,
    web3,
    TX_DEFAULTS,
  );
};
