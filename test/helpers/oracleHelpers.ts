import * as _ from 'lodash';
import Web3 from 'web3';
import { Address, SetProtocolUtils } from 'set-protocol-utils';
import { Median } from 'set-protocol-contracts';
import { MedianContract } from 'set-protocol-contracts';

import { TX_DEFAULTS } from '@src/constants';
import { BigNumber } from '@src/util';

const contract = require('truffle-contract');


export const deployMedianizerAsync = async(
  web3: Web3,
): Promise<MedianContract> => {
  const truffleMedianContract = contract(Median);
  truffleMedianContract.setProvider(web3.currentProvider);
  truffleMedianContract.setNetwork(50);
  truffleMedianContract.defaults(TX_DEFAULTS);

  // Deploy Median
  const deployedMedianInstance = await truffleMedianContract.new();
  return await MedianContract.at(
    deployedMedianInstance.address,
    web3,
    TX_DEFAULTS,
  );
};

export const addPriceFeedOwnerToMedianizer = async(
    medianizer: MedianContract,
    priceFeedSigner: Address,
  ): Promise<string> => {
  return await medianizer.lift.sendTransactionAsync(
    priceFeedSigner,
  );
};

export const updateMedianizerPriceAsync = async(
    web3: Web3,
    medianizer: MedianContract,
    price: BigNumber,
    timestamp: BigNumber,
    from: Address = TX_DEFAULTS.from,
  ): Promise<string> => {
    const setUtils = new SetProtocolUtils(web3);
    const standardSignature = SetProtocolUtils.hashPriceFeedHex(price, timestamp);
    const ecSignature = await setUtils.signMessage(standardSignature, from);

    return await medianizer.poke.sendTransactionAsync(
      [price],
      [timestamp],
      [new BigNumber(ecSignature.v)],
      [ecSignature.r],
      [ecSignature.s],
    );
};
