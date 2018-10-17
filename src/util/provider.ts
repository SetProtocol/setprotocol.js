import Web3 from 'web3';
import { Provider } from 'web3/providers';

// This function has basically been copied vertabim from the amazing Dharma repo
export const instantiateWeb3 = (provider: Provider): Web3 => {
  /**
   * There are two ways we can access a web3 provider:
   * 1. We pass in the address of an Eth node, e.g. https://localhost:8545
   * 2. Web3 has been injected into the browser window (e.g. via Metamask.)
   */
  if (provider) {
    return new Web3(provider);
  } else if (
    typeof (window as any) !== 'undefined' &&
    typeof (window as any).web3 !== 'undefined'
  ) {
    // If web3 is available via the browser window, instantiate web3 via the current provider.
    return new Web3((window as any).web3.currentProvider);
  } else {
    // Otherwise throw...
    throw new Error('Please make sure to pass in a provider.');
  }
};
