import Web3 from 'web3';
import { AddressToAddressWhiteListContract } from 'set-protocol-contracts';
export declare const deployAddressToAddressWhiteListContract: (web3: Web3, initialKeyAddresses: string[], initialValueAddresses: string[]) => Promise<AddressToAddressWhiteListContract>;
